import { useState, type ReactNode } from 'react'
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
import {
  Button,
  ChromeBar,
  ExpandablePanel,
  ThemeToggle,
  ToolbarCluster,
  renderChromeParts,
} from '@mana/ui'
import { SearchBar } from './SearchBar'
import { AnnotationTools } from './AnnotationTools'
import { AnnotationVisibilityMenu } from './AnnotationVisibilityMenu'
import type { ViewMode } from './PdfViewer'
import type { AnnotationTool } from '../../types/annotationTools'
import type { AnnotationVisibility } from '../../types/annotationVisibility'
import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from '../../constants/zoom'
import {
  viewerToolbarPlacement,
  type ViewerToolbarPartId,
} from '../../chrome/viewerToolbarPlacement'

interface ViewerToolbarProps {
  title: string
  page: number
  pageCount: number
  zoom: number
  viewMode: ViewMode
  saving?: boolean
  searchOpen: boolean
  searchQuery: string
  searchMatchCount: number
  activeSearchIndex: number
  searchSearching?: boolean
  onSearchOpenChange: (open: boolean) => void
  onSearchQueryChange: (query: string) => void
  onSearchPrev: () => void
  onSearchNext: () => void
  annotationTool: AnnotationTool
  penColor: string
  markerColor: string
  onAnnotationToolChange: (tool: AnnotationTool) => void
  onPenColorChange: (color: string) => void
  onMarkerColorChange: (color: string) => void
  showAnnotations: boolean
  annotationVisibility: AnnotationVisibility
  onShowAnnotationsChange: (show: boolean) => void
  onAnnotationVisibilityChange: (visibility: AnnotationVisibility) => void
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
  searchOpen,
  searchQuery,
  searchMatchCount,
  activeSearchIndex,
  searchSearching,
  onSearchOpenChange,
  onSearchQueryChange,
  onSearchPrev,
  onSearchNext,
  annotationTool,
  penColor,
  markerColor,
  onAnnotationToolChange,
  onPenColorChange,
  onMarkerColorChange,
  showAnnotations,
  annotationVisibility,
  onShowAnnotationsChange,
  onAnnotationVisibilityChange,
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
  const [toolsOpen, setToolsOpen] = useState(false)

  const parts: Record<ViewerToolbarPartId, ReactNode> = {
    back: (
      <Button variant="ghost" size="icon" onClick={onBack} aria-label="本棚に戻る" className="shrink-0">
        <ChevronLeft className="h-5 w-5" />
      </Button>
    ),
    sidebar: (
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="shrink-0 lg:hidden"
        aria-label="サイドバー"
      >
        <PanelLeft className="h-5 w-5" />
      </Button>
    ),
    title: searchOpen ? null : (
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 sm:text-base">{title}</h1>
        {saving && <p className="text-xs text-slate-400">保存中...</p>}
      </div>
    ),
    search: (
      <SearchBar
        open={searchOpen}
        query={searchQuery}
        matchCount={searchMatchCount}
        activeMatchIndex={activeSearchIndex}
        searching={searchSearching}
        onOpenChange={onSearchOpenChange}
        onQueryChange={onSearchQueryChange}
        onPrev={onSearchPrev}
        onNext={onSearchNext}
      />
    ),
    pager: (
      <ToolbarCluster>
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
            className="w-12 rounded-lg border-0 bg-white py-1 text-center text-sm outline-none focus:ring-2 focus:ring-brand-200 dark:bg-slate-700 dark:text-slate-100 dark:focus:ring-brand-800"
            aria-label="ページ番号"
          />
          <span className="text-slate-400">–</span>
          <span className="pr-1 text-slate-500 dark:text-slate-400">
            {displayPageEnd}/{pageCount}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onNext} disabled={page >= pageCount} aria-label="次のページ">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </ToolbarCluster>
    ),
    theme: <ThemeToggle />,
    note: (
      <Button variant="ghost" size="icon" onClick={onAddNote} aria-label="メモ追加" title="メモ追加">
        <StickyNote className="h-4 w-4" />
      </Button>
    ),
    bookmark: (
      <>
        <Button variant="primary" size="sm" onClick={onAddBookmark} className="hidden gap-1.5 sm:inline-flex">
          <Bookmark className="h-3.5 w-3.5" />
          ブックマーク
        </Button>
        <Button variant="primary" size="icon" onClick={onAddBookmark} className="sm:hidden" aria-label="ブックマーク">
          <Bookmark className="h-4 w-4" />
        </Button>
      </>
    ),
    annotations: (
      <AnnotationTools
        tool={annotationTool}
        penColor={penColor}
        markerColor={markerColor}
        onToolChange={onAnnotationToolChange}
        onPenColorChange={onPenColorChange}
        onMarkerColorChange={onMarkerColorChange}
      />
    ),
    visibility: (
      <AnnotationVisibilityMenu
        showAnnotations={showAnnotations}
        annotationVisibility={annotationVisibility}
        onShowAnnotationsChange={onShowAnnotationsChange}
        onAnnotationVisibilityChange={onAnnotationVisibilityChange}
      />
    ),
    viewMode: (
      <ToolbarCluster>
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
      </ToolbarCluster>
    ),
    zoom: (
      <ToolbarCluster>
        <Button
          variant="ghost"
          size="icon"
          data-testid="zoom-out"
          onClick={() => onZoomChange(Math.max(ZOOM_MIN, zoom - ZOOM_STEP))}
          aria-label="縮小"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center text-xs text-slate-600 dark:text-slate-400" data-testid="zoom-level">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          data-testid="zoom-in"
          onClick={() => onZoomChange(Math.min(ZOOM_MAX, zoom + ZOOM_STEP))}
          aria-label="拡大"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </ToolbarCluster>
    ),
  }

  return (
    <header
      className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/95"
      data-testid="viewer-toolbar"
    >
      <ChromeBar
        parts={parts}
        leading={viewerToolbarPlacement.leading}
        trailing={viewerToolbarPlacement.trailing}
      >
        <ExpandablePanel
          label="ツール"
          open={toolsOpen}
          onOpenChange={setToolsOpen}
          testId="viewer-secondary-controls"
        >
          {renderChromeParts(parts, viewerToolbarPlacement.expandable)}
        </ExpandablePanel>
      </ChromeBar>
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
      aria-label="目次・注釈サイドバーを開く"
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
