import { useEffect, useRef } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'

const THUMBNAIL_WIDTH = 112

interface PdfThumbnailProps {
  pdfDoc: PDFDocumentProxy
  pageNumber: number
  isActive: boolean
  onClick: () => void
}

export function PdfThumbnail({ pdfDoc, pageNumber, isActive, onClick }: PdfThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let cancelled = false

    pdfDoc.getPage(pageNumber).then((pdfPage) => {
      if (cancelled || !canvasRef.current) return

      const baseViewport = pdfPage.getViewport({ scale: 1 })
      const scale = THUMBNAIL_WIDTH / baseViewport.width
      const viewport = pdfPage.getViewport({ scale })
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (!ctx) return

      canvas.width = viewport.width
      canvas.height = viewport.height

      pdfPage.render({ canvasContext: ctx, viewport, canvas }).promise.catch(() => undefined)
    })

    return () => {
      cancelled = true
    }
  }, [pdfDoc, pageNumber])

  return (
    <button
      type="button"
      data-testid={`thumbnail-page-${pageNumber}`}
      onClick={onClick}
      className={`group flex w-full flex-col items-stretch rounded-xl border-2 p-1.5 transition ${
        isActive
          ? 'border-brand-500 bg-brand-50 shadow-sm dark:border-brand-400 dark:bg-brand-950/40'
          : 'border-transparent bg-slate-50 hover:border-slate-200 hover:bg-white dark:bg-slate-800/60 dark:hover:border-slate-600 dark:hover:bg-slate-800'
      }`}
    >
      <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-slate-700/80">
        <canvas ref={canvasRef} className="block w-full" />
      </div>
      <span
        className={`mt-1.5 text-center text-xs font-medium ${
          isActive ? 'text-brand-700 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        {pageNumber}
      </span>
    </button>
  )
}
