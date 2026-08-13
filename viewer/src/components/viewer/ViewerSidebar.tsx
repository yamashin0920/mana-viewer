import { Bookmark, Highlighter, LayoutGrid, List, X } from 'lucide-react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { Annotation, TocEntry } from '../../types'
import { TocSidebar } from './TocSidebar'
import { ThumbnailSidebar } from './ThumbnailSidebar'
import { AnnotationSidebar } from './AnnotationSidebar'
import { Button } from '../ui/Button'

type SidebarTab = 'thumbnails' | 'toc' | 'annotations'

interface ViewerSidebarProps {
  tab: SidebarTab
  onTabChange: (tab: SidebarTab) => void
  pdfDoc: PDFDocumentProxy | null
  pdfLoading?: boolean
  pageCount: number
  toc: TocEntry[]
  annotations: Annotation[]
  sharedAnnotationIds?: Set<string>
  hiddenAnnotationIds?: Set<string>
  currentPage: number
  onJump: (page: number) => void
  onEditAnnotation: (annotation: Annotation) => void
  onDeleteAnnotation: (id: string) => void
  onToggleAnnotationVisibility: (id: string) => void
  onExportAnnotations: (format: 'json' | 'markdown') => void
  onShareAnnotations: () => void
  sharingAnnotations?: boolean
  onClose?: () => void
  isMobile?: boolean
}

export function ViewerSidebar({
  tab,
  onTabChange,
  pdfDoc,
  pdfLoading,
  pageCount,
  toc,
  annotations,
  sharedAnnotationIds,
  hiddenAnnotationIds,
  currentPage,
  onJump,
  onEditAnnotation,
  onDeleteAnnotation,
  onToggleAnnotationVisibility,
  onExportAnnotations,
  onShareAnnotations,
  sharingAnnotations,
  onClose,
  isMobile,
}: ViewerSidebarProps) {
  const tabs: { id: SidebarTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'thumbnails', label: 'サムネイル', icon: <LayoutGrid className="h-4 w-4" /> },
    { id: 'toc', label: '目次', icon: <List className="h-4 w-4" /> },
    { id: 'annotations', label: '注釈', icon: <Highlighter className="h-4 w-4" />, count: annotations.length },
  ]

  return (
    <div className={`flex h-full flex-col bg-white dark:bg-slate-900 ${isMobile ? '' : 'border-r border-slate-200 dark:border-slate-700'}`} data-testid="viewer-sidebar">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              data-testid={`sidebar-tab-${t.id}`}
              onClick={() => onTabChange(t.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                tab === t.id
                  ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-700 dark:text-brand-300'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {t.icon}
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="rounded-full bg-brand-100 px-1.5 text-xs text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
        {isMobile && onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="閉じる">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
        {tab === 'thumbnails' ? (
          <ThumbnailSidebar
            pdfDoc={pdfDoc}
            loading={pdfLoading}
            pageCount={pageCount}
            currentPage={currentPage}
            onJump={onJump}
          />
        ) : tab === 'toc' ? (
          <TocSidebar toc={toc} currentPage={currentPage} onJump={onJump} />
        ) : (
          <AnnotationSidebar
            annotations={annotations}
            sharedAnnotationIds={sharedAnnotationIds}
            hiddenAnnotationIds={hiddenAnnotationIds}
            onJump={onJump}
            onEdit={onEditAnnotation}
            onDelete={onDeleteAnnotation}
            onToggleVisibility={onToggleAnnotationVisibility}
            onExport={onExportAnnotations}
            onShare={onShareAnnotations}
            sharing={sharingAnnotations}
          />
        )}
      </div>

      <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-700">
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <Bookmark className="h-3 w-3" />
          テキストを選択してマーカー · ← → でページ移動
        </p>
      </div>
    </div>
  )
}

export function MobileSidebarDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="閉じる"
      />
      <div className="animate-slide-up absolute bottom-0 left-0 right-0 top-16 rounded-t-2xl bg-white shadow-[var(--shadow-float)] dark:bg-slate-900" data-testid="mobile-sidebar-drawer">
        {children}
      </div>
    </div>
  )
}
