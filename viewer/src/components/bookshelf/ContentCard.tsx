import { Link } from 'react-router-dom'
import type { Content } from '../../types'

interface ContentCardProps {
  content: Content
}

export function ContentCard({ content }: ContentCardProps) {
  const progress = content.progress

  return (
    <Link
      to={`/viewer/${content.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[5/7] overflow-hidden bg-slate-100">
        {content.coverUrl ? (
          <img
            src={content.coverUrl}
            alt={content.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">No Cover</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <p className="text-xs text-slate-500">{content.category}</p>
          <h3 className="line-clamp-2 font-semibold text-slate-800">{content.title}</h3>
          <p className="text-sm text-slate-500">{content.author}</p>
        </div>
        {progress && progress.currentPage > 1 ? (
          <div>
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>p.{progress.currentPage} まで読了</span>
              <span>{Math.round(progress.progressPercent)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${Math.min(100, progress.progressPercent)}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-blue-600">読み始める →</p>
        )}
      </div>
    </Link>
  )
}
