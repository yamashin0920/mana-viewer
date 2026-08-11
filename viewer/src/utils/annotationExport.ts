import type { Annotation } from '../types'

export type AnnotationExportFormat = 'json' | 'markdown'

export interface AnnotationExportMeta {
  contentId: string
  contentTitle: string
  exportedAt: string
  annotationCount: number
}

const TYPE_LABELS: Record<Annotation['type'], string> = {
  highlight: 'ハイライト',
  bookmark: 'ブックマーク',
  note: 'メモ',
  underline: '下線',
  drawing: '描画',
  sticky: '付箋',
}

export function buildAnnotationExportPayload(
  annotations: Annotation[],
  meta: Omit<AnnotationExportMeta, 'annotationCount' | 'exportedAt'>
) {
  const exportedAt = new Date().toISOString()
  return {
    version: 1,
    exportedAt,
    contentId: meta.contentId,
    contentTitle: meta.contentTitle,
    annotationCount: annotations.length,
    annotations: [...annotations].sort(
      (a, b) => a.page - b.page || a.createdAt.localeCompare(b.createdAt)
    ),
  }
}

export function annotationsToMarkdown(
  annotations: Annotation[],
  meta: Omit<AnnotationExportMeta, 'annotationCount' | 'exportedAt'>
): string {
  const exportedAt = new Date().toISOString()
  const sorted = [...annotations].sort(
    (a, b) => a.page - b.page || a.createdAt.localeCompare(b.createdAt)
  )

  const lines = [
    `# 注釈エクスポート: ${meta.contentTitle}`,
    '',
    `- 教材 ID: ${meta.contentId}`,
    `- エクスポート日時: ${exportedAt}`,
    `- 注釈数: ${sorted.length}`,
    '',
  ]

  for (const ann of sorted) {
    lines.push(`## p.${ann.page} · ${TYPE_LABELS[ann.type]}`)
    if (ann.selectedText) {
      lines.push(`> ${ann.selectedText}`)
    }
    if (ann.note && ann.type !== 'drawing') {
      lines.push(ann.note)
    }
    if (ann.type === 'drawing') {
      lines.push('（ペン描画）')
    }
    lines.push('')
  }

  return lines.join('\n')
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function exportAnnotations(
  annotations: Annotation[],
  meta: Omit<AnnotationExportMeta, 'annotationCount' | 'exportedAt'>,
  format: AnnotationExportFormat
) {
  const safeTitle = meta.contentTitle.replace(/[^\w\u3000-\u9fff-]+/g, '_').slice(0, 40)
  const date = new Date().toISOString().slice(0, 10)

  if (format === 'json') {
    const payload = buildAnnotationExportPayload(annotations, meta)
    downloadTextFile(
      `annotations-${safeTitle}-${date}.json`,
      JSON.stringify(payload, null, 2),
      'application/json'
    )
    return
  }

  downloadTextFile(
    `annotations-${safeTitle}-${date}.md`,
    annotationsToMarkdown(annotations, meta),
    'text/markdown'
  )
}
