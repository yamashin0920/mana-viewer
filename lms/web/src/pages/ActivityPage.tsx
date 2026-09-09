import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { fetchXapiStatements } from '../api/client'
import type { XapiRecord } from '../types'

function verbLabel(verb?: string) {
  if (!verb) return '記録'
  if (verb.includes('experienced')) return '閲覧'
  return verb.split('/').pop() || verb
}

export function ActivityPage() {
  const [items, setItems] = useState<XapiRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchXapiStatements()
      setItems(res.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        読み込み中...
      </div>
    )
  }

  return (
    <div className="space-y-6" data-testid="lms-activity-page">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">学習記録 (xAPI)</h2>
        <p className="text-sm text-slate-500">LMS からビューアを開いたときの記録です</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500" data-testid="lms-activity-empty">
          まだ学習記録はありません。コースから教材を開くとここに表示されます。
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
          {items.map((item) => (
            <li key={item.id} className="px-4 py-3 text-sm" data-testid="lms-activity-item">
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {item.statement.actor?.name ?? 'ユーザー'} · {verbLabel(item.statement.verb)}
              </p>
              <p className="text-xs text-slate-500">
                {item.statement.object?.definition?.name?.['ja-JP'] ?? item.statement.object?.id}
              </p>
              <p className="text-xs text-slate-400">{new Date(item.receivedAt).toLocaleString('ja-JP')}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
