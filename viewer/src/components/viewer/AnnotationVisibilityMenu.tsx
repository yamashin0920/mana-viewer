import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'
import { Button } from '../ui/Button'
import {
  ANNOTATION_VISIBILITY_LABELS,
  ANNOTATION_VISIBILITY_TYPES,
  type AnnotationVisibility,
  type AnnotationVisibilityType,
} from '../../types/annotationVisibility'

interface AnnotationVisibilityMenuProps {
  showAnnotations: boolean
  annotationVisibility: AnnotationVisibility
  onShowAnnotationsChange: (show: boolean) => void
  onAnnotationVisibilityChange: (visibility: AnnotationVisibility) => void
}

export function AnnotationVisibilityMenu({
  showAnnotations,
  annotationVisibility,
  onShowAnnotationsChange,
  onAnnotationVisibilityChange,
}: AnnotationVisibilityMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  const handleTypeToggle = (type: AnnotationVisibilityType) => {
    onAnnotationVisibilityChange({
      ...annotationVisibility,
      [type]: !annotationVisibility[type],
    })
  }

  return (
    <div ref={containerRef} className="relative flex items-center">
      <Button
        variant="ghost"
        size="icon"
        data-testid="annotation-visibility-toggle"
        onClick={() => onShowAnnotationsChange(!showAnnotations)}
        aria-label={showAnnotations ? '注釈を非表示' : '注釈を表示'}
        title={showAnnotations ? '注釈を非表示' : '注釈を表示'}
        className={`rounded-r-none ${showAnnotations ? '' : 'text-slate-400'}`}
      >
        {showAnnotations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        data-testid="annotation-visibility-menu-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="注釈の種類ごとに表示切替"
        title="注釈の種類ごとに表示切替"
        aria-expanded={open}
        className={`w-7 rounded-l-none border-l border-slate-200 dark:border-slate-600 ${
          showAnnotations ? '' : 'text-slate-400'
        }`}
      >
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <div
          data-testid="annotation-visibility-menu"
          className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-600 dark:bg-slate-800"
        >
          <p className="px-2 pb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            表示する注釈
          </p>
          {ANNOTATION_VISIBILITY_TYPES.map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/60"
            >
              <input
                type="checkbox"
                data-testid={`annotation-visibility-${type}`}
                checked={showAnnotations && annotationVisibility[type]}
                disabled={!showAnnotations}
                onChange={() => handleTypeToggle(type)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 disabled:opacity-40"
              />
              <span className={!showAnnotations ? 'text-slate-400' : ''}>
                {ANNOTATION_VISIBILITY_LABELS[type]}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
