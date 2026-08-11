import type { TocEntry } from '../../types'

interface TocSidebarProps {
  toc: TocEntry[]
  currentPage: number
  onJump: (page: number) => void
}

export function TocSidebar({ toc, currentPage, onJump }: TocSidebarProps) {
  if (toc.length === 0) {
    return <p className="text-sm text-slate-500">目次がありません</p>
  }

  return (
    <ul className="space-y-1">
      {toc.map((entry, idx) => (
        <li key={`${entry.page}-${idx}`}>
          <button
            type="button"
            onClick={() => onJump(entry.page)}
            className={`w-full rounded px-2 py-1.5 text-left text-sm hover:bg-slate-100 ${
              currentPage === entry.page ? 'bg-blue-50 font-medium text-blue-700' : 'text-slate-700'
            }`}
            style={{ paddingLeft: `${(entry.level - 1) * 12 + 8}px` }}
          >
            <span className="mr-2 text-xs text-slate-400">p.{entry.page}</span>
            {entry.title}
          </button>
        </li>
      ))}
    </ul>
  )
}
