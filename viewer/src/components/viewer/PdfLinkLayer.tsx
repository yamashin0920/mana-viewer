import { useCallback, useEffect, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { resolvePdfDestToPage } from '../../utils/pdfDest'

export interface PdfPageLink {
  id: string
  rect: { x: number; y: number; width: number; height: number }
  url?: string | null
  dest?: string | unknown[] | null
}

interface PdfLinkLayerProps {
  pdfDoc: PDFDocumentProxy
  pageNumber: number
  zoom: number
  onInternalLink: (page: number) => void
}

function normalizeAnnotationRect(viewport: { convertToViewportPoint(x: number, y: number): number[] }, rect: number[]) {
  const [x1, y1, x2, y2] = rect
  const [vx1, vy1] = viewport.convertToViewportPoint(x1, y1)
  const [vx2, vy2] = viewport.convertToViewportPoint(x2, y2)
  return {
    x: Math.min(vx1, vx2),
    y: Math.min(vy1, vy2),
    width: Math.abs(vx2 - vx1),
    height: Math.abs(vy2 - vy1),
  }
}

export function PdfLinkLayer({ pdfDoc, pageNumber, zoom, onInternalLink }: PdfLinkLayerProps) {
  const [links, setLinks] = useState<PdfPageLink[]>([])

  useEffect(() => {
    let cancelled = false

    pdfDoc.getPage(pageNumber).then(async (page) => {
      if (cancelled) return
      const viewport = page.getViewport({ scale: zoom })
      const annotations = await page.getAnnotations()

      const pageLinks = annotations
        .filter((annotation) => annotation.subtype === 'Link')
        .map((annotation, index) => ({
          id: `${pageNumber}-${index}`,
          rect: normalizeAnnotationRect(viewport, annotation.rect),
          url: annotation.url ?? annotation.unsafeUrl ?? null,
          dest: annotation.dest ?? null,
        }))

      if (!cancelled) setLinks(pageLinks)
    })

    return () => {
      cancelled = true
    }
  }, [pdfDoc, pageNumber, zoom])

  const handleClick = useCallback(
    async (link: PdfPageLink) => {
      if (link.url) {
        window.open(link.url, '_blank', 'noopener,noreferrer')
        return
      }
      const targetPage = await resolvePdfDestToPage(pdfDoc, link.dest)
      if (targetPage) onInternalLink(targetPage)
    },
    [pdfDoc, onInternalLink]
  )

  if (links.length === 0) {
    return <div data-testid="pdf-link-layer" className="pointer-events-none absolute inset-0" />
  }

  return (
    <div data-testid="pdf-link-layer" className="absolute inset-0">
      {links.map((link) => (
        <button
          key={link.id}
          type="button"
          data-testid="pdf-link"
          className="absolute cursor-pointer rounded-sm border border-transparent bg-brand-500/0 transition hover:border-brand-400/60 hover:bg-brand-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          style={{
            left: link.rect.x,
            top: link.rect.y,
            width: link.rect.width,
            height: link.rect.height,
          }}
          onClick={() => handleClick(link)}
          title={link.url ? '外部リンク' : 'ページ内リンク'}
          aria-label={link.url ? '外部リンク' : 'ページ内リンク'}
        />
      ))}
    </div>
  )
}
