import type { AnnotationType } from '../types'

export type AnnotationVisibilityType = 'marker' | 'drawing' | 'sticky' | 'note'

export interface AnnotationVisibility {
  marker: boolean
  drawing: boolean
  sticky: boolean
  note: boolean
}

export const ANNOTATION_VISIBILITY_TYPES: AnnotationVisibilityType[] = [
  'marker',
  'drawing',
  'sticky',
  'note',
]

export const ANNOTATION_VISIBILITY_LABELS: Record<AnnotationVisibilityType, string> = {
  marker: 'マーカー',
  drawing: '描画',
  sticky: '付箋',
  note: 'メモ',
}

export const DEFAULT_ANNOTATION_VISIBILITY: AnnotationVisibility = {
  marker: true,
  drawing: true,
  sticky: true,
  note: true,
}

const ANNOTATION_VISIBILITY_KEY = 'viewer-annotation-visibility'

export function loadAnnotationVisibility(): AnnotationVisibility {
  try {
    const raw = localStorage.getItem(ANNOTATION_VISIBILITY_KEY)
    if (!raw) return { ...DEFAULT_ANNOTATION_VISIBILITY }
    const parsed = JSON.parse(raw) as Partial<AnnotationVisibility>
    return {
      marker: parsed.marker !== false,
      drawing: parsed.drawing !== false,
      sticky: parsed.sticky !== false,
      note: parsed.note !== false,
    }
  } catch {
    return { ...DEFAULT_ANNOTATION_VISIBILITY }
  }
}

export function saveAnnotationVisibility(visibility: AnnotationVisibility) {
  try {
    localStorage.setItem(ANNOTATION_VISIBILITY_KEY, JSON.stringify(visibility))
  } catch {
    /* ignore */
  }
}

export function isAnnotationTypeVisible(
  type: AnnotationType,
  showAll: boolean,
  visibility: AnnotationVisibility
): boolean {
  if (!showAll) return false
  switch (type) {
    case 'drawing':
      return visibility.drawing
    case 'sticky':
      return visibility.sticky
    case 'note':
      return visibility.note
    case 'highlight':
    case 'underline':
      return visibility.marker
    default:
      return true
  }
}
