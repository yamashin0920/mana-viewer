import { useState } from 'react'
import {
  Bookmark,
  Download,
  Eye,
  EyeOff,
  Highlighter,
  Pencil,
  PenLine,
  Share2,
  StickyNote,
  Trash2,
  Underline,
} from 'lucide-react'
import type { Annotation } from '../../types'
import { Button } from '../ui/Button'

interface AnnotationSidebarProps {
  annotations: Annotation[]
  sharedAnnotationIds?: Set<string>
  hiddenAnnotationIds?: Set<string>
  onJump: (page: number) => void
  onEdit: (annotation: Annotation) => void
  onDelete: (id: string) => void
  onToggleVisibility: (id: string) => void
  onExport: (format: 'json' | 'markdown') => void
  onShare: () => void
  sharing?: boolean
}

const typeConfig: Record<
  Annotation['type'],
  { label: string; icon: React.ReactNode; accent: string }
> = {
  highlight: {
    label: 'マーカー',
    icon: <Highlighter className="h-3.5 w-3.5" />,
    accent: 'border-l-yellow-400',
  },
  bookmark: {
    label: 'ブックマーク',
    icon: <Bookmark className="h-3.5 w-3.5" />,
    accent: 'border-l-brand-400',
  },
  note: {
    label: 'メモ',
    icon: <StickyNote className="h-3.5 w-3.5" />,
    accent: 'border-l-orange-400',
  },
  underline: {
    label: '下線',
    icon: <Underline className="h-3.5 w-3.5" />,
    accent: 'border-l-amber-400',
  },
  drawing: {
    label: '描画',
    icon: <PenLine className="h-3.5 w-3.5" />,
    accent: 'border-l-red-400',
  },
  sticky: {
    label: '付箋',
    icon: <StickyNote className="h-3.5 w-3.5" />,
    accent: 'border-l-yellow-500',
  },
}

type Filter = 'all' | Annotation['type']

export function AnnotationSidebar({
  annotations,
  sharedAnnotationIds,
  hiddenAnnotationIds,
  onJump,
  onEdit,
  onDelete,
  onToggleVisibility,
  onExport,
  onShare,
  sharing,
}: AnnotationSidebarProps) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter === 'all' ? annotations : annotations.filter((a) => a.type === filter)

  const sorted = [...filtered].sort(
    (a, b) => a.page - b.page || a.createdAt.localeCompare(b.createdAt)
  )

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'すべて' },
    { id: 'highlight', label: 'マーカー' },
    { id: 'drawing', label: '描画' },
    { id: 'sticky', label: '付箋' },
    { id: 'bookmark', label: 'ブックマーク' },
    { id: 'note', label: 'メモ' },
  ]

  if (annotations.length === 0) {
    return (
      <div className="rounded-xl bg-slate-50 px-4 py-8 text-center dark:bg-slate-800/50">
        <Highlighter className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">注釈はまだありません</p>
        <p className="mt-1 text-xs text-slate-400">
          テキスト選択、ペン描画、付箋で注釈を追加できます
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          data-testid="annotation-export-json"
          onClick={() => onExport('json')}
          className="gap-1.5"
        >
          <Download className="h-3.5 w-3.5" />
          JSON
        </Button>
        <Button
          variant="secondary"
          size="sm"
          data-testid="annotation-export-markdown"
          onClick={() => onExport('markdown')}
          className="gap-1.5"
        >
          <Download className="h-3.5 w-3.5" />
          Markdown
        </Button>
        <Button
          variant="primary"
          size="sm"
          data-testid="annotation-share-button"
          onClick={onShare}
          disabled={sharing}
          className="gap-1.5"
        >
          <Share2 className="h-3.5 w-3.5" />
          {sharing ? '作成中...' : '共有'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-1">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            data-testid={`annotation-tab-${f.id}`}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
              filter === f.id
                ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {sorted.map((ann) => {
          const cfg = typeConfig[ann.type]
          const isSharedOnly = sharedAnnotationIds?.has(ann.id) ?? false
          const isHidden = hiddenAnnotationIds?.has(ann.id) ?? false
          return (
            <li
              key={ann.id}
              data-testid={isSharedOnly ? 'shared-annotation-item' : 'annotation-item'}
              data-annotation-hidden={isHidden ? 'true' : 'false'}
              className={`rounded-xl border border-slate-100 border-l-4 bg-slate-50/50 p-3 text-sm transition hover:bg-white hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 ${cfg.accent} ${
                isHidden ? 'opacity-50' : ''
              }`}
            >
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onJump(ann.page)}
                  className={`flex items-center gap-1.5 font-medium hover:underline ${
                    isHidden
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-brand-700 dark:text-brand-400'
                  }`}
                >
                  {(ann.color && (ann.type === 'highlight' || ann.type === 'drawing')) && (
                    <span
                      className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                      style={{ backgroundColor: ann.color }}
                    />
                  )}
                  {cfg.icon}
                  p.{ann.page} · {cfg.label}
                  {isSharedOnly && (
                    <span className="rounded-full bg-sky-100 px-1.5 text-[10px] font-medium text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
                      共有
                    </span>
                  )}
                </button>
                <div className="flex shrink-0 gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="annotation-item-visibility-toggle"
                    onClick={() => onToggleVisibility(ann.id)}
                    className={`h-7 w-7 ${isHidden ? 'text-slate-400' : 'text-slate-500 hover:text-brand-600'}`}
                    aria-label={isHidden ? '注釈を表示' : '注釈を非表示'}
                    title={isHidden ? '注釈を表示' : '注釈を非表示'}
                  >
                    {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  {!isSharedOnly && (
                    <>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-testid="annotation-edit"
                      onClick={() => onEdit(ann)}
                      className="h-7 w-7 text-slate-400 hover:text-brand-600"
                      aria-label="編集"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-testid="annotation-delete"
                      onClick={() => onDelete(ann.id)}
                      className="h-7 w-7 text-slate-400 hover:text-red-500"
                      aria-label="削除"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    </>
                  )}
                </div>
              </div>
              {ann.selectedText && (
                <p className="line-clamp-2 text-slate-600 dark:text-slate-400">「{ann.selectedText}」</p>
              )}
              {ann.note && ann.type !== 'drawing' && (
                <p className="mt-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  {ann.note}
                </p>
              )}
              {ann.type === 'drawing' && (
                <p className="mt-1 text-xs text-slate-400">ペン描画</p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
