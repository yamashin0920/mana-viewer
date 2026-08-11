import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  List,
  Minus,
  PanelLeft,
  Plus,
  StickyNote,
} from 'lucide-react'
import { Button } from '../ui/Button'

interface ViewerToolbarProps {
  title: string
  page: number
  pageCount: number
  zoom: number
  saving?: boolean
  onPageChange: (page: number) => void
  onZoomChange: (zoom: number) => void
  onAddBookmark: () => void
  onAddNote: () => void
  onToggleSidebar: () => void
  onBack: () => void
}

export function ViewerToolbar({
  title,
  page,
  pageCount,
  zoom,
  saving,
  onPageChange,
  onZoomChange,
  onAddBookmark,
  onAddNote,
  onToggleSidebar,
  onBack,
}: ViewerToolbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="本棚に戻る" className="shrink-0">
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="shrink-0 lg:hidden"
          aria-label="サイドバー"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">{title}</h1>
          {saving && <p className="text-xs text-slate-400">保存中...</p>}
        </div>

        {/* Page nav */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            aria-label="前のページ"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-0.5 px-1 text-sm">
            <input
              type="number"
              min={1}
              max={pageCount}
              value={page}
              onChange={(e) => {
                const next = Number(e.target.value)
                if (next >= 1 && next <= pageCount) onPageChange(next)
              }}
              className="w-10 rounded-lg border-0 bg-white py-1 text-center text-sm outline-none focus:ring-2 focus:ring-brand-200"
              aria-label="ページ番号"
            />
            <span className="text-slate-400">/</span>
            <span className="pr-1 text-slate-500">{pageCount}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(Math.min(pageCount, page + 1))}
            disabled={page >= pageCount}
            aria-label="次のページ"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom - hidden on small screens */}
        <div className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-0.5 sm:flex">
          <Button variant="ghost" size="icon" onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))} aria-label="縮小">
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-xs text-slate-600">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={() => onZoomChange(Math.min(2.5, zoom + 0.1))} aria-label="拡大">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onAddNote} aria-label="メモ追加" title="メモ追加">
            <StickyNote className="h-4 w-4" />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onAddBookmark}
            className="hidden gap-1.5 sm:inline-flex"
          >
            <Bookmark className="h-3.5 w-3.5" />
            ブックマーク
          </Button>
          <Button variant="primary" size="icon" onClick={onAddBookmark} className="sm:hidden" aria-label="ブックマーク">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export function ViewerSidebarToggle({
  onClick,
  annotationCount,
}: {
  onClick: () => void
  annotationCount: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-brand-700 lg:hidden"
    >
      <List className="h-4 w-4" />
      目次・注釈
      {annotationCount > 0 && (
        <span className="rounded-full bg-white/20 px-1.5 text-xs">{annotationCount}</span>
      )}
    </button>
  )
}
