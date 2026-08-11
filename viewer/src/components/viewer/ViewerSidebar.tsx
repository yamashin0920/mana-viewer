import { Bookmark, Highlighter, List, X } from 'lucide-react'
import type { Annotation, TocEntry } from '../../types'
import { TocSidebar } from './TocSidebar'
import { AnnotationSidebar } from './AnnotationSidebar'
import { Button } from '../ui/Button'

type SidebarTab = 'toc' | 'annotations'

interface ViewerSidebarProps {
  tab: SidebarTab
  onTabChange: (tab: SidebarTab) => void
  toc: TocEntry[]
  annotations: Annotation[]
  currentPage: number
  onJump: (page: number) => void
  onDeleteAnnotation: (id: string) => void
  onClose?: () => void
  isMobile?: boolean
}

export function ViewerSidebar({
  tab,
  onTabChange,
  toc,
  annotations,
  currentPage,
  onJump,
  onDeleteAnnotation,
  onClose,
  isMobile,
}: ViewerSidebarProps) {
  const tabs: { id: SidebarTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'toc', label: '目次', icon: <List className="h-4 w-4" /> },
    { id: 'annotations', label: '注釈', icon: <Highlighter className="h-4 w-4" />, count: annotations.length },
  ]

  return (
    <div className={`flex h-full flex-col bg-white ${isMobile ? '' : 'border-r border-slate-200'}`}>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                tab === t.id ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.icon}
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="rounded-full bg-brand-100 px-1.5 text-xs text-brand-700">{t.count}</span>
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
        {tab === 'toc' ? (
          <TocSidebar toc={toc} currentPage={currentPage} onJump={onJump} />
        ) : (
          <AnnotationSidebar
            annotations={annotations}
            onJump={onJump}
            onDelete={onDeleteAnnotation}
          />
        )}
      </div>

      <div className="border-t border-slate-100 px-4 py-3">
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <Bookmark className="h-3 w-3" />
          テキストを選択してハイライト · ← → でページ移動
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
      <div className="animate-slide-up absolute bottom-0 left-0 right-0 top-16 rounded-t-2xl bg-white shadow-[var(--shadow-float)]">
        {children}
      </div>
    </div>
  )
}
