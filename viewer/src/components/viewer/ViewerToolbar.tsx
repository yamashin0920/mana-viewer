interface ViewerToolbarProps {
  title: string
  page: number
  pageCount: number
  zoom: number
  onPageChange: (page: number) => void
  onZoomChange: (zoom: number) => void
  onAddBookmark: () => void
  onBack: () => void
}

export function ViewerToolbar({
  title,
  page,
  pageCount,
  zoom,
  onPageChange,
  onZoomChange,
  onAddBookmark,
  onBack,
}: ViewerToolbarProps) {
  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
      <button
        type="button"
        onClick={onBack}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
      >
        ← 本棚
      </button>
      <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-slate-800">{title}</h1>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded border border-slate-200 px-2 py-1 text-sm hover:bg-slate-50"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          前
        </button>
        <div className="flex items-center gap-1 text-sm">
          <input
            type="number"
            min={1}
            max={pageCount}
            value={page}
            onChange={(e) => {
              const next = Number(e.target.value)
              if (next >= 1 && next <= pageCount) onPageChange(next)
            }}
            className="w-14 rounded border border-slate-200 px-2 py-1 text-center"
          />
          <span className="text-slate-500">/ {pageCount}</span>
        </div>
        <button
          type="button"
          className="rounded border border-slate-200 px-2 py-1 text-sm hover:bg-slate-50"
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          disabled={page >= pageCount}
        >
          次
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded border border-slate-200 px-2 py-1 text-sm hover:bg-slate-50"
          onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
        >
          −
        </button>
        <span className="w-12 text-center text-sm text-slate-600">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          className="rounded border border-slate-200 px-2 py-1 text-sm hover:bg-slate-50"
          onClick={() => onZoomChange(Math.min(2.5, zoom + 0.1))}
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={onAddBookmark}
        className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
      >
        ブックマーク
      </button>
    </header>
  )
}
