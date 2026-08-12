import type { PDFDocumentProxy } from 'pdfjs-dist'

export async function resolvePdfDestToPage(
  pdfDoc: PDFDocumentProxy,
  dest: string | unknown[] | null | undefined
): Promise<number | null> {
  if (!dest) return null

  try {
    let explicitDest: unknown = dest
    if (typeof dest === 'string') {
      explicitDest = await pdfDoc.getDestination(dest)
    }
    if (!Array.isArray(explicitDest) || !explicitDest[0]) return null

    const pageIndex = await pdfDoc.getPageIndex(explicitDest[0] as Parameters<PDFDocumentProxy['getPageIndex']>[0])
    return pageIndex + 1
  } catch {
    return null
  }
}
