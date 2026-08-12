import { useCallback, useEffect, useState } from 'react'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { createContent, deleteContent, fetchContents, updateContent } from '../api/client'
import { Button } from '../components/Button'
import type { Content } from '../types'
import { STATUS_LABELS } from '../types'

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'

const defaultForm = {
  title: '',
  author: '',
  category: '',
  pageCount: 1,
  status: 'draft',
  description: '',
  allowPrint: false,
  allowOffline: true,
  offlineDays: 30,
  maxDevices: 2,
}

export function ContentsPage() {
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Content | null>(null)
  const [form, setForm] = useState(defaultForm)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchContents()
      setContents(res.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    await createContent({
      title: form.title,
      author: form.author,
      category: form.category,
      pageCount: form.pageCount,
      status: form.status,
      description: form.description,
      policy: {
        allowPrint: form.allowPrint,
        allowOffline: form.allowOffline,
        offlineDays: form.offlineDays,
        maxDevices: form.maxDevices,
      },
    })
    setShowForm(false)
    setForm(defaultForm)
    await load()
  }

  const handleUpdate = async () => {
    if (!editing) return
    await updateContent(editing.id, {
      title: form.title,
      author: form.author,
      category: form.category,
      pageCount: form.pageCount,
      status: form.status,
      description: form.description,
      policy: {
        allowPrint: form.allowPrint,
        allowOffline: form.allowOffline,
        offlineDays: form.offlineDays,
        maxDevices: form.maxDevices,
      },
    })
    setEditing(null)
    await load()
  }

  const handleDelete = async (content: Content) => {
    if (!confirm(`「${content.title}」を削除しますか？関連ライセンスも削除されます。`)) return
    await deleteContent(content.id)
    await load()
  }

  const startEdit = (content: Content) => {
    setEditing(content)
    setForm({
      title: content.title,
      author: content.author,
      category: content.category ?? '',
      pageCount: content.pageCount,
      status: content.status ?? 'draft',
      description: content.description ?? '',
      allowPrint: content.policy.allowPrint,
      allowOffline: content.policy.allowOffline,
      offlineDays: content.policy.offlineDays,
      maxDevices: content.policy.maxDevices,
    })
    setShowForm(false)
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
    <div className="space-y-6" data-testid="contents-page">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">コンテンツ管理</h2>
          <p className="text-sm text-slate-500">教材のメタデータと公開設定を管理します</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => { setShowForm(true); setEditing(null); setForm(defaultForm) }}>
          <Plus className="h-3.5 w-3.5" />
          コンテンツ追加
        </Button>
      </div>

      {(showForm || editing) && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-medium">{editing ? 'コンテンツ編集' : '新規コンテンツ'}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-slate-500">タイトル *</label>
              <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">著者</label>
              <input className={inputClass} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">カテゴリ</label>
              <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">ページ数</label>
              <input className={inputClass} type="number" min={1} value={form.pageCount} onChange={(e) => setForm({ ...form, pageCount: Number(e.target.value) })} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">ステータス</label>
              <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.entries(STATUS_LABELS).filter(([k]) => ['published', 'draft', 'archived'].includes(k)).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-xs text-slate-500">説明</label>
              <textarea className={inputClass} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.allowPrint} onChange={(e) => setForm({ ...form, allowPrint: e.target.checked })} />
              印刷許可
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.allowOffline} onChange={(e) => setForm({ ...form, allowOffline: e.target.checked })} />
              オフライン許可
            </label>
            <label className="flex items-center gap-2 text-sm">
              オフライン日数
              <input className="w-16 rounded border border-slate-200 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800" type="number" min={1} value={form.offlineDays} onChange={(e) => setForm({ ...form, offlineDays: Number(e.target.value) })} />
            </label>
            <label className="flex items-center gap-2 text-sm">
              最大端末数
              <input className="w-16 rounded border border-slate-200 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800" type="number" min={1} value={form.maxDevices} onChange={(e) => setForm({ ...form, maxDevices: Number(e.target.value) })} />
            </label>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="primary" size="sm" onClick={editing ? handleUpdate : handleCreate}>
              {editing ? '更新' : '作成'}
            </Button>
            <Button size="sm" onClick={() => { setShowForm(false); setEditing(null) }}>キャンセル</Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="contents-grid">
        {contents.map((content) => (
          <div
            key={content.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex gap-3 p-4">
              {content.coverUrl && (
                <img src={content.coverUrl} alt="" className="h-20 w-14 shrink-0 rounded object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-slate-900 dark:text-slate-100">{content.title}</h3>
                <p className="text-xs text-slate-500">{content.author}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {content.category && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">{content.category}</span>
                  )}
                  <span className={`rounded px-1.5 py-0.5 text-xs ${
                    content.status === 'published'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {STATUS_LABELS[content.status ?? 'draft'] ?? content.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{content.pageCount} ページ</p>
              </div>
            </div>
            <div className="flex border-t border-slate-100 dark:border-slate-800">
              <Button size="sm" variant="ghost" className="flex-1 rounded-none py-2" onClick={() => startEdit(content)}>
                <Pencil className="h-3.5 w-3.5" />
                編集
              </Button>
              <Button size="sm" variant="ghost" className="flex-1 rounded-none border-l border-slate-100 py-2 dark:border-slate-800" onClick={() => handleDelete(content)}>
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                削除
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
