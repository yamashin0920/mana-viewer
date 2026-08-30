import { useCallback, useEffect, useState } from 'react'
import { Loader2, Pencil, Plus, Trash2, UserPlus, KeyRound } from 'lucide-react'
import {
  createCredential,
  createUser,
  deleteCredential,
  deleteUser,
  fetchAdminUsers,
  fetchCredentials,
  fetchLicenses,
  updateCredential,
  updateUser,
  updateUserLicenses,
} from '../api/client'
import { Alert } from '../components/Alert'
import { Button, Field } from '@mana/ui'
import { useAdminAction } from '../hooks/useAdminAction'
import { useConfirm } from '../hooks/useConfirm'
import { usePermissions } from '../hooks/usePermissions'
import type { AdminUser, CredentialAccount, License, UserRole } from '../types'
import { ROLE_LABELS } from '../types'
import { permissionHint } from '../utils/authorization'

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'

export function AccountsPage() {
  const [credentials, setCredentials] = useState<CredentialAccount[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [allLicenses, setAllLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)

  const allows = usePermissions()
  const canWriteCredentials = allows('credentials:write')
  const canWriteUsers = allows('users:write')
  const { submitting, feedback, setFeedback, run } = useAdminAction()
  const { confirm, dialog: confirmDialog } = useConfirm()

  const [showUserForm, setShowUserForm] = useState(false)
  const [showCredForm, setShowCredForm] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [editingLicensesUser, setEditingLicensesUser] = useState<AdminUser | null>(null)
  const [selectedLicenseIds, setSelectedLicenseIds] = useState<string[]>([])
  const [editingCred, setEditingCred] = useState<CredentialAccount | null>(null)

  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'learner' as UserRole })
  const [credForm, setCredForm] = useState({ loginId: '', password: '', linkedUserId: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [credRes, userRes, licenseRes] = await Promise.all([
        fetchCredentials(),
        fetchAdminUsers(),
        fetchLicenses(),
      ])
      setCredentials(credRes.data)
      setUsers(userRes.data)
      setAllLicenses(licenseRes.data)
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

  const usersWithoutCredential = users.filter(
    (u) => !credentials.some((c) => c.linkedUserId === u.id),
  )

  const validateUserForm = () => {
    if (!userForm.name.trim()) {
      setFeedback({ tone: 'error', message: '名前を入力してください' })
      return false
    }
    if (!userForm.email.trim()) {
      setFeedback({ tone: 'error', message: 'メールアドレスを入力してください' })
      return false
    }
    return true
  }

  const handleCreateUser = async () => {
    if (!validateUserForm()) return
    const ok = await run(async () => {
      await createUser(userForm)
    }, `「${userForm.name}」を作成しました`)
    if (!ok) return
    setShowUserForm(false)
    setUserForm({ name: '', email: '', role: 'learner' })
    await load()
  }

  const handleUpdateUser = async () => {
    if (!editingUser || !validateUserForm()) return
    const ok = await run(async () => {
      await updateUser(editingUser.id, userForm)
    }, `「${userForm.name}」を更新しました`)
    if (!ok) return
    setEditingUser(null)
    await load()
  }

  const handleDeleteUser = (user: AdminUser) => {
    confirm({
      title: 'ユーザーを削除',
      message: `「${user.name}」を削除します。よろしいですか？`,
      detail: 'ライセンスの割当も解除されます。',
      onConfirm: async () => {
        const ok = await run(async () => {
          await deleteUser(user.id)
        }, `「${user.name}」を削除しました`)
        if (ok) await load()
      },
    })
  }

  const validateCredForm = (isEdit: boolean) => {
    if (!credForm.loginId.trim()) {
      setFeedback({ tone: 'error', message: 'ログインIDを入力してください' })
      return false
    }
    if (!isEdit && !credForm.password) {
      setFeedback({ tone: 'error', message: 'パスワードを入力してください' })
      return false
    }
    if (!isEdit && !credForm.linkedUserId) {
      setFeedback({ tone: 'error', message: '紐付けるユーザーを選択してください' })
      return false
    }
    return true
  }

  const handleCreateCredential = async () => {
    if (!validateCredForm(false)) return
    const ok = await run(async () => {
      await createCredential(credForm)
    }, `ログインID「${credForm.loginId}」を作成しました`)
    if (!ok) return
    setShowCredForm(false)
    setCredForm({ loginId: '', password: '', linkedUserId: '' })
    await load()
  }

  const handleUpdateCredential = async () => {
    if (!editingCred || !validateCredForm(true)) return
    const ok = await run(async () => {
      await updateCredential(editingCred.loginId, {
        password: credForm.password || undefined,
        linkedUserId: credForm.linkedUserId || undefined,
        newLoginId: credForm.loginId !== editingCred.loginId ? credForm.loginId : undefined,
      })
    }, `ログインID「${credForm.loginId}」を更新しました`)
    if (!ok) return
    setEditingCred(null)
    await load()
  }

  const handleDeleteCredential = (cred: CredentialAccount) => {
    confirm({
      title: 'ログインアカウントを削除',
      message: `ログインID「${cred.loginId}」を削除します。よろしいですか？`,
      detail: 'このIDではログインできなくなります。ユーザー自体は残ります。',
      onConfirm: async () => {
        const ok = await run(async () => {
          await deleteCredential(cred.loginId)
        }, `ログインID「${cred.loginId}」を削除しました`)
        if (ok) await load()
      },
    })
  }

  const startEditLicenses = (user: AdminUser) => {
    setEditingLicensesUser(user)
    setSelectedLicenseIds(user.licenses?.map((l) => l.id) ?? [])
    setEditingUser(null)
    setShowUserForm(false)
  }

  const toggleLicenseForUser = (licenseId: string) => {
    setSelectedLicenseIds((prev) =>
      prev.includes(licenseId) ? prev.filter((id) => id !== licenseId) : [...prev, licenseId],
    )
  }

  const handleSaveLicenses = async () => {
    if (!editingLicensesUser) return
    const ok = await run(
      async () => {
        await updateUserLicenses(editingLicensesUser.id, selectedLicenseIds)
      },
      `「${editingLicensesUser.name}」のライセンス割当を更新しました`,
      'ライセンス更新に失敗しました'
    )
    if (!ok) return
    setEditingLicensesUser(null)
    await load()
  }

  const startEditUser = (user: AdminUser) => {
    setEditingUser(user)
    setUserForm({ name: user.name, email: user.email, role: user.role })
    setShowUserForm(false)
  }

  const startEditCred = (cred: CredentialAccount) => {
    setEditingCred(cred)
    setCredForm({ loginId: cred.loginId, password: '', linkedUserId: cred.linkedUserId })
    setShowCredForm(false)
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
    <div className="space-y-8" data-testid="accounts-page">
      {feedback && (
        <Alert tone={feedback.tone} message={feedback.message} onDismiss={() => setFeedback(null)} />
      )}

      {!canWriteUsers && !canWriteCredentials && (
        <Alert
          tone="info"
          message={`アカウントは閲覧のみ可能です。${permissionHint('users:write')}`}
        />
      )}

      {/* Login accounts */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">ログインアカウント</h2>
            <p className="text-sm text-slate-500">ログインIDとパスワード、紐付けユーザーを管理します</p>
          </div>
          {canWriteCredentials && (
            <Button
              variant="primary"
              size="sm"
              data-testid="credential-add-button"
              onClick={() => { setShowCredForm(true); setEditingCred(null); setCredForm({ loginId: '', password: '', linkedUserId: '' }) }}
            >
              <Plus className="h-3.5 w-3.5" />
              追加
            </Button>
          )}
        </div>

        {(showCredForm || editingCred) && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-3 text-sm font-medium">{editingCred ? 'ログインアカウント編集' : '新規ログインアカウント'}</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="ログインID" required>
                {(id) => (
                  <input
                    id={id}
                    className={inputClass}
                    data-testid="credential-login-id"
                    value={credForm.loginId}
                    onChange={(e) => setCredForm({ ...credForm, loginId: e.target.value })}
                  />
                )}
              </Field>
              <Field
                label="パスワード"
                required={!editingCred}
                hint={editingCred ? '変更する場合のみ入力してください' : undefined}
              >
                {(id) => (
                  <input
                    id={id}
                    className={inputClass}
                    type="password"
                    autoComplete="new-password"
                    data-testid="credential-password"
                    value={credForm.password}
                    onChange={(e) => setCredForm({ ...credForm, password: e.target.value })}
                  />
                )}
              </Field>
              <Field label="紐付けユーザー" required={!editingCred}>
                {(id) => (
                  <select
                    id={id}
                    className={inputClass}
                    data-testid="credential-linked-user"
                    value={credForm.linkedUserId}
                    onChange={(e) => setCredForm({ ...credForm, linkedUserId: e.target.value })}
                  >
                    <option value="">選択してください</option>
                    {(editingCred ? users : usersWithoutCredential).map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({ROLE_LABELS[u.role]})</option>
                    ))}
                  </select>
                )}
              </Field>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="primary"
                size="sm"
                disabled={submitting}
                data-testid="credential-submit"
                onClick={editingCred ? handleUpdateCredential : handleCreateCredential}
              >
                {submitting ? '保存中...' : editingCred ? '更新' : '作成'}
              </Button>
              <Button size="sm" disabled={submitting} onClick={() => { setShowCredForm(false); setEditingCred(null) }}>
                キャンセル
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm" data-testid="credentials-table">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800/50">
                <th className="px-4 py-3 font-medium">ログインID</th>
                <th className="px-4 py-3 font-medium">紐付けユーザー</th>
                <th className="px-4 py-3 font-medium">ロール</th>
                <th className="px-4 py-3 font-medium">ライセンス数</th>
                {canWriteCredentials && <th className="px-4 py-3 font-medium">操作</th>}
              </tr>
            </thead>
            <tbody>
              {credentials.map((cred) => {
                const linkedUser = users.find((u) => u.id === cred.linkedUserId)
                return (
                  <tr key={cred.loginId} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3 font-mono text-xs">{cred.loginId}</td>
                    <td className="px-4 py-3">{linkedUser?.name ?? '—'}</td>
                    <td className="px-4 py-3">{linkedUser ? ROLE_LABELS[linkedUser.role] : '—'}</td>
                    <td className="px-4 py-3">{linkedUser?.licenses?.length ?? 0}</td>
                    {canWriteCredentials && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" aria-label={`${cred.loginId} を編集`} onClick={() => startEditCred(cred)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" variant="ghost" aria-label={`${cred.loginId} を削除`} disabled={submitting} onClick={() => handleDeleteCredential(cred)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Users */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">ユーザー</h2>
            <p className="text-sm text-slate-500">組織内のユーザーとライセンス割当状況（ビューアの閲覧可否に反映されます）</p>
          </div>
          {canWriteUsers && (
            <Button
              variant="primary"
              size="sm"
              data-testid="user-add-button"
              onClick={() => { setShowUserForm(true); setEditingUser(null); setUserForm({ name: '', email: '', role: 'learner' }) }}
            >
              <UserPlus className="h-3.5 w-3.5" />
              ユーザー追加
            </Button>
          )}
        </div>

        {(showUserForm || editingUser) && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-3 text-sm font-medium">{editingUser ? 'ユーザー編集' : '新規ユーザー'}</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="名前" required>
                {(id) => (
                  <input
                    id={id}
                    className={inputClass}
                    data-testid="user-name"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  />
                )}
              </Field>
              <Field label="メールアドレス" required>
                {(id) => (
                  <input
                    id={id}
                    className={inputClass}
                    type="email"
                    data-testid="user-email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  />
                )}
              </Field>
              <Field label="ロール">
                {(id) => (
                  <select
                    id={id}
                    className={inputClass}
                    data-testid="user-role"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                  >
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                )}
              </Field>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="primary"
                size="sm"
                disabled={submitting}
                data-testid="user-submit"
                onClick={editingUser ? handleUpdateUser : handleCreateUser}
              >
                {submitting ? '保存中...' : editingUser ? '更新' : '作成'}
              </Button>
              <Button size="sm" disabled={submitting} onClick={() => { setShowUserForm(false); setEditingUser(null) }}>
                キャンセル
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm" data-testid="users-table">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800/50">
                <th className="px-4 py-3 font-medium">名前</th>
                <th className="px-4 py-3 font-medium">メール</th>
                <th className="px-4 py-3 font-medium">ロール</th>
                <th className="px-4 py-3 font-medium">割当ライセンス</th>
                {canWriteUsers && <th className="px-4 py-3 font-medium">操作</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3 text-slate-500">{user.email}</td>
                  <td className="px-4 py-3">{ROLE_LABELS[user.role]}</td>
                  <td className="px-4 py-3">
                    {user.licenses && user.licenses.length > 0 ? (
                      <ul className="space-y-0.5">
                        {user.licenses.map((l) => (
                          <li key={l.id} className="text-xs text-slate-600 dark:text-slate-400">
                            {l.contentTitle}
                            {!l.valid && (
                              <span className="ml-1 text-amber-600 dark:text-amber-400">（無効）</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-slate-400">なし</span>
                    )}
                  </td>
                  {canWriteUsers && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          data-testid={`user-licenses-${user.id}`}
                          onClick={() => startEditLicenses(user)}
                          aria-label={`${user.name} のライセンス割当`}
                          title="ライセンス割当"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" aria-label={`${user.name} を編集`} onClick={() => startEditUser(user)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" aria-label={`${user.name} を削除`} disabled={submitting} onClick={() => handleDeleteUser(user)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingLicensesUser && (
          <div
            className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            data-testid="user-licenses-form"
          >
            <h3 className="mb-1 text-sm font-medium">
              {editingLicensesUser.name} のライセンス割当
            </h3>
            <p className="mb-3 text-xs text-slate-500">
              チェックした教材のみ、ビューアの本棚に表示されます
            </p>
            <div className="space-y-2">
              {allLicenses.map((license) => {
                const selected = selectedLicenseIds.includes(license.id)
                const seatsFull =
                  !selected &&
                  (license.seatsUsed ?? license.assignedUserIds.length) >= license.seatCount
                return (
                  <label
                    key={license.id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                      selected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-600/20'
                        : seatsFull
                          ? 'cursor-not-allowed border-slate-200 opacity-50 dark:border-slate-700'
                          : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={seatsFull}
                        onChange={() => toggleLicenseForUser(license.id)}
                      />
                      {license.content?.title ?? license.contentId}
                    </span>
                    <span className="text-xs text-slate-400">
                      {license.seatsUsed ?? license.assignedUserIds.length}/{license.seatCount} 席
                    </span>
                  </label>
                )
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="primary" size="sm" disabled={submitting} onClick={handleSaveLicenses}>
                {submitting ? '保存中...' : '保存'}
              </Button>
              <Button size="sm" disabled={submitting} onClick={() => setEditingLicensesUser(null)}>
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </section>

      {confirmDialog}
    </div>
  )
}
