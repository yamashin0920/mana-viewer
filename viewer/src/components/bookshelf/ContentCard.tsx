import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight } from 'lucide-react'
import type { Content } from '../../types'
import { Badge } from '../ui/Badge'

interface ContentCardProps {
  content: Content
}

function calcProgress(content: Content) {
  const prog = content.progress
  if (!prog || prog.currentPage <= 1) return null
  const percent = content.pageCount
    ? Math.min(100, Math.round((prog.currentPage / content.pageCount) * 100))
    : Math.min(100, Math.round(prog.progressPercent))
  return { page: prog.currentPage, percent }
}

export function ContentCard({ content }: ContentCardProps) {
  const progress = calcProgress(content)

  return (
    <Link
      to={`/viewer/${content.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg"
    >
      <div className="relative aspect-[5/7] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {content.coverUrl ? (
          <img
            src={content.coverUrl}
            alt={content.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
            <BookOpen className="h-10 w-10" />
            <span className="text-xs">No Cover</span>
          </div>
        )}
        {content.category && (
          <div className="absolute left-3 top-3">
            <Badge color="indigo">{content.category}</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 font-semibold leading-snug text-slate-900 group-hover:text-brand-700">
            {content.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{content.author}</p>
        </div>

        {progress ? (
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-slate-500">
              <span>p.{progress.page} まで読了</span>
              <span className="font-medium text-brand-600">{progress.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-sm font-medium text-brand-600">
            読み始める
            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </div>
        )}
      </div>
    </Link>
  )
}
