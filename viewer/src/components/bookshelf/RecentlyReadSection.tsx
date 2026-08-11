import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import type { Content } from '../../types'
import { ContentCard } from './ContentCard'

interface RecentlyReadSectionProps {
  items: Content[]
}

function formatRelativeTime(iso: string | null | undefined) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}日前`
  return new Date(iso).toLocaleDateString('ja-JP')
}

export function RecentlyReadSection({ items }: RecentlyReadSectionProps) {
  if (items.length === 0) return null

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">最近読んだもの</h3>
        </div>
        <Link
          to="#"
          onClick={(e) => e.preventDefault()}
          className="text-sm text-brand-600 hover:underline dark:text-brand-400"
        >
          {items.length} 件
        </Link>
      </div>

      <div className="custom-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        {items.map((content) => (
          <div key={content.id} className="w-44 shrink-0 sm:w-52">
            <ContentCard content={content} compact />
            {content.progress?.lastReadAt && (
              <p className="mt-1.5 text-center text-xs text-slate-400">
                {formatRelativeTime(content.progress.lastReadAt)}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
