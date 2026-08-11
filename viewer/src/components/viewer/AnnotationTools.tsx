import { Highlighter, MousePointer2, PenLine, StickyNote } from 'lucide-react'
import { Button } from '../ui/Button'
import { HIGHLIGHT_COLORS } from '../../constants/highlightColors'
import { PEN_COLORS } from '../../constants/penColors'
import type { AnnotationTool } from '../../types/annotationTools'

interface AnnotationToolsProps {
  tool: AnnotationTool
  penColor: string
  markerColor: string
  onToolChange: (tool: AnnotationTool) => void
  onPenColorChange: (color: string) => void
  onMarkerColorChange: (color: string) => void
}

export function AnnotationTools({
  tool,
  penColor,
  markerColor,
  onToolChange,
  onPenColorChange,
  onMarkerColorChange,
}: AnnotationToolsProps) {
  return (
    <div className="flex items-center gap-1" data-testid="annotation-tools">
      <div className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-600 dark:bg-slate-800">
        <Button
          variant="ghost"
          size="icon"
          data-testid="annotation-tool-select"
          onClick={() => onToolChange('select')}
          className={tool === 'select' ? 'bg-white shadow-sm dark:bg-slate-700' : ''}
          aria-label="選択モード"
          title="選択モード"
        >
          <MousePointer2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          data-testid="annotation-tool-marker"
          onClick={() => onToolChange('marker')}
          className={tool === 'marker' ? 'bg-white shadow-sm dark:bg-slate-700' : ''}
          aria-label="マーカー"
          title="テキストにマーカー"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          data-testid="annotation-tool-pen"
          onClick={() => onToolChange('pen')}
          className={tool === 'pen' ? 'bg-white shadow-sm dark:bg-slate-700' : ''}
          aria-label="ペン"
          title="ペン描画"
        >
          <PenLine className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          data-testid="annotation-tool-sticky"
          onClick={() => onToolChange('sticky')}
          className={tool === 'sticky' ? 'bg-white shadow-sm dark:bg-slate-700' : ''}
          aria-label="付箋"
          title="付箋"
        >
          <StickyNote className="h-4 w-4" />
        </Button>
      </div>

      {tool === 'marker' && (
        <div className="hidden items-center gap-1 sm:flex" data-testid="marker-color-picker">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.label}
              data-testid={`marker-color-${c.id}`}
              onClick={() => onMarkerColorChange(c.value)}
              className={`h-6 w-6 rounded-full border-2 transition ${
                markerColor === c.value ? 'border-brand-600 scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      )}

      {tool === 'pen' && (
        <div className="hidden items-center gap-1 sm:flex" data-testid="pen-color-picker">
          {PEN_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.label}
              data-testid={`pen-color-${c.id}`}
              onClick={() => onPenColorChange(c.value)}
              className={`h-6 w-6 rounded-full border-2 transition ${
                penColor === c.value ? 'border-brand-600 scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
