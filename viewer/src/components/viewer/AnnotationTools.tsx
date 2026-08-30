import { Highlighter, MousePointer2, PenLine, StickyNote } from 'lucide-react'
import { Button, ToolbarCluster } from '@mana/ui'
import { HIGHLIGHT_COLORS } from '../../constants/highlightColors'
import { PEN_COLORS } from '../../constants/penColors'
import type { AnnotationTool } from '../../types/annotationTools'

/** タッチでも押せるよう、狭い画面では大きめに出す */
const swatchClass = 'h-8 w-8 shrink-0 rounded-full border-2 transition sm:h-6 sm:w-6'

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
      <ToolbarCluster>
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
      </ToolbarCluster>

      {tool === 'marker' && (
        <div className="flex items-center gap-1" data-testid="marker-color-picker">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.label}
              aria-label={`マーカーの色: ${c.label}`}
              aria-pressed={markerColor === c.value}
              data-testid={`marker-color-${c.id}`}
              onClick={() => onMarkerColorChange(c.value)}
              className={`${swatchClass} ${
                markerColor === c.value ? 'border-brand-600 scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      )}

      {tool === 'pen' && (
        <div className="flex items-center gap-1" data-testid="pen-color-picker">
          {PEN_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.label}
              aria-label={`ペンの色: ${c.label}`}
              aria-pressed={penColor === c.value}
              data-testid={`pen-color-${c.id}`}
              onClick={() => onPenColorChange(c.value)}
              className={`${swatchClass} ${
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
