import type { AnnotationType } from '../types'

export const ANNOTATION_TYPE_LABELS: Record<AnnotationType, string> = {
  highlight: 'マーカー',
  bookmark: 'ブックマーク',
  note: 'メモ',
  underline: '下線',
  drawing: '描画',
  sticky: '付箋',
}

export function annotationTypeLabel(type: AnnotationType) {
  return ANNOTATION_TYPE_LABELS[type] ?? type
}
