import { useEffect, useRef, useCallback } from 'react'
import { TextLayer } from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import type { Annotation } from '../../types'
import type { TextSelection } from './PdfViewer'

interface PdfPageProps {
  pdfDoc: PDFDocumentProxy
  pageNumber: number
  zoom: number
  annotations: Annotation[]
  watermark?: string | null
  onSelection?: (selection: TextSelection) => void
  onRender?: (width: number, height: number) => void
  className?: string
}

export function PdfPage({
  pdfDoc,
  pageNumber,
  zoom,
  annotations,
  watermark,
  onSelection,
  onRender,
  className = '',
}: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    pdfDoc.getPage(pageNumber).then((pdfPage: PDFPageProxy) => {
      if (cancelled || !canvasRef.current) return

      const viewport = pdfPage.getViewport({ scale: zoom })
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')!
      canvas.width = viewport.width
      canvas.height = viewport.height
      onRender?.(viewport.width, viewport.height)

      pdfPage
        .render({ canvasContext: ctx, viewport, canvas })
        .promise.then(() => {
          if (cancelled || !textLayerRef.current) return
          textLayerRef.current.innerHTML = ''
          textLayerRef.current.style.width = `${viewport.width}px`
          textLayerRef.current.style.height = `${viewport.height}px`

          return pdfPage.getTextContent().then(async (textContent) => {
            if (cancelled || !textLayerRef.current) return
            const textLayer = new TextLayer({
              textContentSource: textContent,
              container: textLayerRef.current,
              viewport,
            })
            await textLayer.render()
          })
        })
        .catch(() => undefined)
    })

    return () => {
      cancelled = true
    }
  }, [pdfDoc, pageNumber, zoom, onRender])

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !containerRef.current) return

    const range = selection.getRangeAt(0)
    const text = selection.toString().trim()
    if (!text) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const rects = Array.from(range.getClientRects())
      .filter((r) => r.width > 0 && r.height > 0)
      .map((r) => ({
        x: r.left - containerRect.left,
        y: r.top - containerRect.top,
        width: r.width,
        height: r.height,
      }))

    if (rects.length === 0) return

    const lastRect = range.getBoundingClientRect()
    onSelection?.({
      text,
      rects,
      position: { x: lastRect.left + lastRect.width / 2, y: lastRect.top },
      page: pageNumber,
    })
    selection.removeAllRanges()
  }, [onSelection, pageNumber])

  const pageAnnotations = annotations.filter((a) => a.page === pageNumber && a.type !== 'bookmark')

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-white dark:bg-slate-900 ${className}`}
      onMouseUp={handleMouseUp}
    >
      <canvas ref={canvasRef} className="block bg-white dark:bg-slate-900" data-testid="pdf-canvas" />
      <div ref={textLayerRef} className="pdf-text-layer absolute inset-0 select-text" />
      <div className="pointer-events-none absolute inset-0">
        {pageAnnotations.map((ann) =>
          ann.rects?.map((rect, idx) => (
            <div
              key={`${ann.id}-${idx}`}
              className="absolute rounded-sm"
              style={{
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
                backgroundColor: ann.color ?? '#FFEB3B',
                opacity: ann.type === 'highlight' ? 0.4 : 0.2,
                borderBottom:
                  ann.type === 'underline' ? `2px solid ${ann.color ?? '#FF9800'}` : undefined,
              }}
              title={ann.note ?? ann.selectedText ?? undefined}
            />
          ))
        )}
        {pageAnnotations
          .filter((a) => a.type === 'note' && a.rects?.[0])
          .map((ann) => {
            const rect = ann.rects![0]
            return (
              <div
                key={ann.id}
                className="absolute flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-sm text-white shadow-md ring-2 ring-white dark:ring-slate-800"
                style={{ left: rect.x, top: rect.y }}
                title={ann.note ?? ''}
              >
                📝
              </div>
            )
          })}
      </div>
      {watermark && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <span
            className="whitespace-nowrap text-[1.25rem] font-semibold text-slate-400/15 dark:text-slate-500/10"
            style={{ transform: 'rotate(-30deg)' }}
          >
            {watermark}
          </span>
        </div>
      )}
    </div>
  )
}
