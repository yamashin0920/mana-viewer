import { ChevronRight } from 'lucide-react'
import type { TocEntry } from '../../types'

interface TocSidebarProps {
  toc: TocEntry[]
  currentPage: number
  onJump: (page: number) => void
}

export function TocSidebar({ toc, currentPage, onJump }: TocSidebarProps) {
  if (toc.length === 0) {
    return (
      <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        目次がありません
      </div>
    )
  }

  return (
    <ul className="space-y-0.5">
      {toc.map((entry, idx) => {
        const isActive = currentPage === entry.page
        return (
          <li key={`${entry.page}-${idx}`}>
            <button
              type="button"
              onClick={() => onJump(entry.page)}
              className={`group flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                isActive
                  ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              style={{ paddingLeft: `${(entry.level - 1) * 14 + 12}px` }}
            >
              <span
                className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs ${
                  isActive ? 'bg-brand-200 text-brand-800' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {entry.page}
              </span>
              <span className="min-w-0 flex-1 truncate">{entry.title}</span>
              <ChevronRight
                className={`h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-100 ${
                  isActive ? 'text-brand-500 opacity-100' : 'text-slate-400'
                }`}
              />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
