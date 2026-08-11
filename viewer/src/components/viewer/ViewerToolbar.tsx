import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Columns2,
  List,
  Minus,
  PanelLeft,
  Plus,
  Square,
  StickyNote,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { ThemeToggle } from '../ui/ThemeToggle'
import type { ViewMode } from './PdfViewer'

interface ViewerToolbarProps {
  title: string
  page: number
  pageCount: number
  zoom: number
  viewMode: ViewMode
  saving?: boolean
  onPageChange: (page: number) => void
  onZoomChange: (zoom: number) => void
  onViewModeChange: (mode: ViewMode) => void
  onAddBookmark: () => void
  onAddNote: () => void
  onToggleSidebar: () => void
  onBack: () => void
  onPrev: () => void
  onNext: () => void
}

export function ViewerToolbar({
  title,
  page,
  pageCount,
  zoom,
  viewMode,
  saving,
  onPageChange,
  onZoomChange,
  onViewModeChange,
  onAddBookmark,
  onAddNote,
  onToggleSidebar,
  onBack,
  onPrev,
  onNext,
}: ViewerToolbarProps) {
  const displayPageEnd = viewMode === 'spread' && page + 1 <= pageCount ? page + 1 : page

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/95">
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
          <h1 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 sm:text-base">{title}</h1>
          {saving && <p className="text-xs text-slate-400">保存中...</p>}
        </div>

        {/* View mode toggle */}
        <div className="hidden items-center gap-0.5 rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-600 dark:bg-slate-800 sm:flex">
          <Button
            variant="ghost"
            size="icon"
            data-testid="view-mode-single"
            onClick={() => onViewModeChange('single')}
            className={viewMode === 'single' ? 'bg-white shadow-sm dark:bg-slate-700' : ''}
            aria-label="1ページ表示"
            title="1ページ表示"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            data-testid="view-mode-spread"
            onClick={() => onViewModeChange('spread')}
            className={viewMode === 'spread' ? 'bg-white shadow-sm dark:bg-slate-700' : ''}
            aria-label="見開き表示"
            title="見開き表示"
          >
            <Columns2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Page nav */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-600 dark:bg-slate-800">
          <Button variant="ghost" size="icon" onClick={onPrev} disabled={page <= 1} aria-label="前のページ">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-0.5 px-1 text-sm">
            <input
              type="number"
              data-testid="page-input"
              min={1}
              max={pageCount}
              value={page}
              onChange={(e) => {
                const next = Number(e.target.value)
                if (next >= 1 && next <= pageCount) onPageChange(next)
              }}
              className="w-10 rounded-lg border-0 bg-white py-1 text-center text-sm outline-none focus:ring-2 focus:ring-brand-200 dark:bg-slate-700 dark:text-slate-100 dark:focus:ring-brand-800"
              aria-label="ページ番号"
            />
            <span className="text-slate-400">–</span>
            <span className="pr-1 text-slate-500 dark:text-slate-400">{displayPageEnd}/{pageCount}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onNext} disabled={page >= pageCount} aria-label="次のページ">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom */}
        <div className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-600 dark:bg-slate-800 md:flex">
          <Button variant="ghost" size="icon" onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))} aria-label="縮小">
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-xs text-slate-600 dark:text-slate-400">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={() => onZoomChange(Math.min(2.5, zoom + 0.1))} aria-label="拡大">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={onAddNote} aria-label="メモ追加" title="メモ追加">
            <StickyNote className="h-4 w-4" />
          </Button>
          <Button variant="primary" size="sm" onClick={onAddBookmark} className="hidden gap-1.5 sm:inline-flex">
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
      data-testid="mobile-sidebar-toggle"
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
