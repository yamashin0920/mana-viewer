import { useState } from 'react'
import { Bookmark, Highlighter, StickyNote, Trash2, Underline } from 'lucide-react'
import type { Annotation } from '../../types'
import { Button } from '../ui/Button'

interface AnnotationSidebarProps {
  annotations: Annotation[]
  onJump: (page: number) => void
  onDelete: (id: string) => void
}

const typeConfig: Record<
  Annotation['type'],
  { label: string; icon: React.ReactNode; accent: string }
> = {
  highlight: { label: 'ハイライト', icon: <Highlighter className="h-3.5 w-3.5" />, accent: 'border-l-yellow-400' },
  bookmark: { label: 'ブックマーク', icon: <Bookmark className="h-3.5 w-3.5" />, accent: 'border-l-brand-400' },
  note: { label: 'メモ', icon: <StickyNote className="h-3.5 w-3.5" />, accent: 'border-l-orange-400' },
  underline: { label: '下線', icon: <Underline className="h-3.5 w-3.5" />, accent: 'border-l-amber-400' },
}

type Filter = 'all' | Annotation['type']

export function AnnotationSidebar({ annotations, onJump, onDelete }: AnnotationSidebarProps) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered =
    filter === 'all' ? annotations : annotations.filter((a) => a.type === filter)

  const sorted = [...filtered].sort(
    (a, b) => a.page - b.page || a.createdAt.localeCompare(b.createdAt)
  )

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'すべて' },
    { id: 'highlight', label: 'ハイライト' },
    { id: 'bookmark', label: 'ブックマーク' },
    { id: 'note', label: 'メモ' },
  ]

  if (annotations.length === 0) {
    return (
      <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">
        <Highlighter className="mx-auto mb-3 h-8 w-8 text-slate-300" />
        <p className="text-sm font-medium text-slate-600">注釈はまだありません</p>
        <p className="mt-1 text-xs text-slate-400">テキストを選択してハイライトやメモを追加できます</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
              filter === f.id ? 'bg-brand-100 text-brand-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {sorted.map((ann) => {
          const cfg = typeConfig[ann.type]
          return (
            <li
              key={ann.id}
              className={`rounded-xl border border-slate-100 bg-slate-50/50 border-l-4 ${cfg.accent} p-3 text-sm transition hover:bg-white hover:shadow-sm`}
            >
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onJump(ann.page)}
                  className="flex items-center gap-1.5 font-medium text-brand-700 hover:underline"
                >
                  {ann.color && ann.type === 'highlight' && (
                    <span
                      className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                      style={{ backgroundColor: ann.color }}
                    />
                  )}
                  {cfg.icon}
                  p.{ann.page} · {cfg.label}
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(ann.id)}
                  className="h-7 w-7 shrink-0 text-slate-400 hover:text-red-500"
                  aria-label="削除"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              {ann.selectedText && (
                <p className="line-clamp-2 text-slate-600">「{ann.selectedText}」</p>
              )}
              {ann.note && (
                <p className="mt-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs text-slate-500">{ann.note}</p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
