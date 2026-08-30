import { useCallback, useEffect, useState } from 'react'
import { Loader2, Pencil, Plus, Shield, Trash2 } from 'lucide-react'
import {
  createLicense,
  deleteLicense,
  fetchAdminUsers,
  fetchContents,
  fetchLicenses,
  updateLicense,
} from '../api/client'
import { Alert } from '../components/Alert'
import { Button, EmptyState, Field } from '@mana/ui'
import { useAdminAction } from '../hooks/useAdminAction'
import { useConfirm } from '../hooks/useConfirm'
import { usePermissions } from '../hooks/usePermissions'
import type { AdminUser, Content, License } from '../types'
import { STATUS_LABELS } from '../types'
import { permissionHint } from '../utils/authorization'

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ja-JP')
}

export function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [contents, setContents] = useState<Content[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const allows = usePermissions()
  const canWrite = allows('licenses:write')
  const { submitting, feedback, setFeedback, run } = useAdminAction()
  const { confirm, dialog: confirmDialog } = useConfirm()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<License | null>(null)
  const [form, setForm] = useState({
    contentId: '',
    seatCount: 10,
    startsAt: new Date().toISOString().slice(0, 10),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    allowOffline: true,
    status: 'active',
    assignedUserIds: [] as string[],
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [licRes, contRes, userRes] = await Promise.all([
        fetchLicenses(),
        fetchContents(),
        fetchAdminUsers(),
      ])
      setLicenses(licRes.data)
      setContents(contRes.data)
      setUsers(userRes.data)
    } catch (err) {
      setFeedback({
        tone: 'error',
        message: err instanceof Error ? err.message : '読み込みに失敗しました',
      })
    } finally {
      setLoading(false)
    }
  }, [setFeedback])

  useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setForm({
      contentId: contents[0]?.id ?? '',
      seatCount: 10,
      startsAt: new Date().toISOString().slice(0, 10),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      allowOffline: true,
      status: 'active',
      assignedUserIds: [],
    })
  }

  const validate = () => {
    if (!form.contentId) {
      setFeedback({ tone: 'error', message: 'コンテンツを選択してください' })
      return false
    }
    if (form.seatCount < 1) {
      setFeedback({ tone: 'error', message: '席数は 1 以上を指定してください' })
      return false
    }
    if (new Date(form.startsAt) > new Date(form.expiresAt)) {
      setFeedback({ tone: 'error', message: '終了日は開始日より後にしてください' })
      return false
    }
    return true
  }

  const contentTitle = (contentId: string) =>
    contents.find((c) => c.id === contentId)?.title ?? contentId

  const handleCreate = async () => {
    if (!validate()) return
    const ok = await run(async () => {
      await createLicense({
        contentId: form.contentId,
        seatCount: form.seatCount,
        startsAt: new Date(form.startsAt).toISOString(),
        expiresAt: new Date(form.expiresAt + 'T23:59:59').toISOString(),
        allowOffline: form.allowOffline,
        status: form.status,
        assignedUserIds: form.assignedUserIds,
      })
    }, `「${contentTitle(form.contentId)}」のライセンスを作成しました`)
    if (!ok) return
    setShowForm(false)
    resetForm()
    await load()
  }

  const handleUpdate = async () => {
    if (!editing || !validate()) return
    const ok = await run(async () => {
      await updateLicense(editing.id, {
        seatCount: form.seatCount,
        startsAt: new Date(form.startsAt).toISOString(),
        expiresAt: new Date(form.expiresAt + 'T23:59:59').toISOString(),
        allowOffline: form.allowOffline,
        status: form.status,
        assignedUserIds: form.assignedUserIds,
      })
    }, `「${contentTitle(form.contentId)}」のライセンスを更新しました`)
    if (!ok) return
    setEditing(null)
    await load()
  }

  const handleDelete = (license: License) => {
    const title = license.content?.title ?? license.contentId
    confirm({
      title: 'ライセンスを削除',
      message: `「${title}」のライセンスを削除します。よろしいですか？`,
      detail: '割り当て済みのユーザーはこの教材を閲覧できなくなります。',
      onConfirm: async () => {
        const ok = await run(async () => {
          await deleteLicense(license.id)
        }, `「${title}」のライセンスを削除しました`)
        if (ok) await load()
      },
    })
  }

  const startEdit = (license: License) => {
    setEditing(license)
    setForm({
      contentId: license.contentId,
      seatCount: license.seatCount,
      startsAt: license.startsAt.slice(0, 10),
      expiresAt: license.expiresAt.slice(0, 10),
      allowOffline: license.allowOffline,
      status: license.status,
      assignedUserIds: [...license.assignedUserIds],
    })
    setShowForm(false)
  }

  const toggleUser = (userId: string) => {
    setForm((prev) => ({
      ...prev,
      assignedUserIds: prev.assignedUserIds.includes(userId)
        ? prev.assignedUserIds.filter((id) => id !== userId)
        : prev.assignedUserIds.length < prev.seatCount
          ? [...prev.assignedUserIds, userId]
          : prev.assignedUserIds,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        読み込み中...
      </div>
    )
  }

  return (
    <div className="space-y-6" data-testid="licenses-page">
      {feedback && (
        <Alert tone={feedback.tone} message={feedback.message} onDismiss={() => setFeedback(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">ライセンス管理</h2>
          <p className="text-sm text-slate-500">
            コンテンツへの閲覧権限と席数を管理します。割当変更はビューアの本棚に即時反映されます。
          </p>
        </div>
        {canWrite && (
          <Button
            variant="primary"
            size="sm"
            data-testid="license-add-button"
            onClick={() => {
              setShowForm(true)
              setEditing(null)
              resetForm()
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            ライセンス追加
          </Button>
        )}
      </div>

      {!canWrite && (
        <Alert tone="info" message={`ライセンスは閲覧のみ可能です。${permissionHint('licenses:write')}`} />
      )}

      {(showForm || editing) && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-medium">{editing ? 'ライセンス編集' : '新規ライセンス'}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="コンテンツ" required>
              {(id) => (
                <select
                  id={id}
                  className={inputClass}
                  data-testid="license-content"
                  value={form.contentId}
                  disabled={!!editing}
                  onChange={(e) => setForm({ ...form, contentId: e.target.value })}
                >
                  {contents.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="席数" required>
              {(id) => (
                <input
                  id={id}
                  className={inputClass}
                  type="number"
                  min={1}
                  data-testid="license-seat-count"
                  value={form.seatCount}
                  onChange={(e) => setForm({ ...form, seatCount: Number(e.target.value) })}
                />
              )}
            </Field>
            <Field label="ステータス">
              {(id) => (
                <select
                  id={id}
                  className={inputClass}
                  data-testid="license-status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {Object.entries(STATUS_LABELS).filter(([k]) => ['active', 'expired', 'revoked'].includes(k)).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="開始日">
              {(id) => (
                <input id={id} className={inputClass} type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
              )}
            </Field>
            <Field label="終了日">
              {(id) => (
                <input id={id} className={inputClass} type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              )}
            </Field>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.allowOffline} onChange={(e) => setForm({ ...form, allowOffline: e.target.checked })} />
                オフライン許可
              </label>
            </div>
          </div>

          <fieldset className="mt-4">
            <legend className="mb-2 block text-xs text-slate-500 dark:text-slate-400">
              割当ユーザー ({form.assignedUserIds.length}/{form.seatCount})
            </legend>
            <div className="flex flex-wrap gap-2">
              {users.map((u) => (
                <label
                  key={u.id}
                  className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs transition ${
                    form.assignedUserIds.includes(u.id)
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-100'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.assignedUserIds.includes(u.id)}
                    onChange={() => toggleUser(u.id)}
                  />
                  {u.name}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-4 flex gap-2">
            <Button
              variant="primary"
              size="sm"
              disabled={submitting}
              data-testid="license-submit"
              onClick={editing ? handleUpdate : handleCreate}
            >
              {submitting ? '保存中...' : editing ? '更新' : '作成'}
            </Button>
            <Button size="sm" disabled={submitting} onClick={() => { setShowForm(false); setEditing(null) }}>
              キャンセル
            </Button>
          </div>
        </div>
      )}

      {licenses.length === 0 ? (
        <EmptyState
          icon={<Shield className="h-8 w-8" />}
          title="ライセンスがありません"
          description={
            canWrite
              ? '「ライセンス追加」から教材の閲覧権限を発行してください'
              : '発行済みのライセンスがまだありません'
          }
        />
      ) : (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full text-sm" data-testid="licenses-table">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 font-medium">コンテンツ</th>
              <th className="px-4 py-3 font-medium">席数</th>
              <th className="px-4 py-3 font-medium">割当</th>
              <th className="px-4 py-3 font-medium">期間</th>
              <th className="px-4 py-3 font-medium">ステータス</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((license) => (
              <tr key={license.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">{license.content?.title ?? license.contentId}</td>
                <td className="px-4 py-3">{license.seatCount}</td>
                <td className="px-4 py-3">
                  <span className="text-xs">
                    {license.seatsUsed ?? license.assignedUserIds.length} / {license.seatCount}
                  </span>
                  {license.assignedUsers && license.assignedUsers.length > 0 && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      {license.assignedUsers.map((u) => u.name).join(', ')}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {formatDate(license.startsAt)} 〜 {formatDate(license.expiresAt)}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    license.status === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {STATUS_LABELS[license.status] ?? license.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {canWrite ? (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" aria-label={`${license.content?.title ?? license.contentId} のライセンスを編集`} onClick={() => startEdit(license)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" aria-label={`${license.content?.title ?? license.contentId} のライセンスを削除`} disabled={submitting} onClick={() => handleDelete(license)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {confirmDialog}
    </div>
  )
}
