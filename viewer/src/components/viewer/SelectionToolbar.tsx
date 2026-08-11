import { Highlighter, StickyNote, X } from 'lucide-react'
import { HIGHLIGHT_COLORS } from '../../constants/highlightColors'
import { Button } from '../ui/Button'

interface SelectionToolbarProps {
  position: { x: number; y: number }
  selectedText: string
  activeColor: string
  onColorChange: (color: string) => void
  onHighlight: () => void
  onAddNote: () => void
  onDismiss: () => void
}

export function SelectionToolbar({
  position,
  selectedText,
  activeColor,
  onColorChange,
  onHighlight,
  onAddNote,
  onDismiss,
}: SelectionToolbarProps) {
  return (
    <div
      className="animate-fade-in fixed z-50 -translate-x-1/2 -translate-y-full"
      data-testid="selection-toolbar"
      style={{ left: position.x, top: position.y - 8 }}
    >
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[var(--shadow-float)] dark:border-slate-600 dark:bg-slate-800">
        <div className="flex items-center gap-1">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.label}
              onClick={() => onColorChange(c.value)}
              className={`h-7 w-7 rounded-full border-2 transition ${
                activeColor === c.value ? 'border-brand-600 scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onHighlight} className="gap-1.5" data-testid="highlight-button">
            <Highlighter className="h-3.5 w-3.5" />
            ハイライト
          </Button>
          <Button variant="ghost" size="sm" onClick={onAddNote} className="gap-1.5">
            <StickyNote className="h-3.5 w-3.5" />
            メモ
          </Button>
          <Button variant="ghost" size="icon" onClick={onDismiss} aria-label="閉じる">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="max-w-[240px] truncate px-1 text-xs text-slate-400">「{selectedText}」</p>
      </div>
    </div>
  )
}
