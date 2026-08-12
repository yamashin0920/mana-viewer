import { Util } from 'pdfjs-dist'
import type { PDFDocumentProxy, PageViewport } from 'pdfjs-dist'
import type { AnnotationRect } from '../types'

export interface PdfSearchMatch {
  matchIndex: number
  page: number
  rects: AnnotationRect[]
  excerpt: string
}

interface TextItemLike {
  str: string
  transform: number[]
  width: number
  height: number
}

function textItemSubstringRect(
  item: TextItemLike,
  viewport: PageViewport,
  start: number,
  length: number
): AnnotationRect {
  const combined = Util.transform(viewport.transform, item.transform)

  const fontHeight = Math.hypot(combined[2], combined[3]) || item.height || 12
  const totalWidth = item.width || 0
  const charCount = Math.max(item.str.length, 1)
  const offsetX = (totalWidth / charCount) * start
  const width = (totalWidth / charCount) * length

  return {
    x: combined[4] + offsetX,
    y: combined[5] - fontHeight,
    width: Math.max(width, 4),
    height: fontHeight,
  }
}

async function searchPage(
  pdfDoc: PDFDocumentProxy,
  pageNumber: number,
  query: string,
  scale: number
): Promise<Omit<PdfSearchMatch, 'matchIndex'>[]> {
  const page = await pdfDoc.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  const textContent = await page.getTextContent()
  const normalizedQuery = query.toLowerCase()
  const pageMatches: Omit<PdfSearchMatch, 'matchIndex'>[] = []

  for (const rawItem of textContent.items) {
    const item = rawItem as TextItemLike
    if (!item.str) continue

    const lower = item.str.toLowerCase()
    let startIndex = 0

    while (startIndex < lower.length) {
      const idx = lower.indexOf(normalizedQuery, startIndex)
      if (idx === -1) break

      pageMatches.push({
        page: pageNumber,
        rects: [textItemSubstringRect(item, viewport, idx, query.length)],
        excerpt: item.str.slice(idx, idx + query.length),
      })
      startIndex = idx + 1
    }
  }

  return pageMatches
}

export async function searchPdfDocument(
  pdfDoc: PDFDocumentProxy,
  query: string,
  scale: number
): Promise<PdfSearchMatch[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const results: PdfSearchMatch[] = []
  let matchIndex = 0

  for (let page = 1; page <= pdfDoc.numPages; page += 1) {
    const pageMatches = await searchPage(pdfDoc, page, trimmed, scale)
    for (const match of pageMatches) {
      results.push({ ...match, matchIndex })
      matchIndex += 1
    }
  }

  return results
}
