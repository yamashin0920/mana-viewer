import { useEffect, useRef, useState, useCallback } from 'react'
import { getDocument, GlobalWorkerOptions, TextLayer } from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { Loader2 } from 'lucide-react'
import type { Annotation, ContentPolicyResponse } from '../../types'
import { Skeleton } from '../ui/Skeleton'

GlobalWorkerOptions.workerSrc = pdfjsWorker

export interface TextSelection {
  text: string
  rects: Array<{ x: number; y: number; width: number; height: number }>
  position: { x: number; y: number }
}

interface PdfViewerProps {
  pdfUrl: string
  page: number
  zoom: number
  annotations: Annotation[]
  watermark?: string | null
  policy?: ContentPolicyResponse | null
  onPageCount: (count: number) => void
  onSelection?: (selection: TextSelection) => void
  onClearSelection?: () => void
}

export function PdfViewer({
  pdfUrl,
  page,
  zoom,
  annotations,
  watermark,
  policy,
  onPageCount,
  onSelection,
  onClearSelection,
}: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
  const [renderSize, setRenderSize] = useState({ width: 0, height: 0 })
  const [loading, setLoading] = useState(true)
  const [pageRendering, setPageRendering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getDocument({ url: pdfUrl })
      .promise.then((doc) => {
        if (cancelled) return
        setPdfDoc(doc)
        onPageCount(doc.numPages)
        setLoading(false)
      })
      .catch((err: Error) => {
        if (cancelled) return
        setError(err.message)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [pdfUrl, onPageCount])

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return

    let cancelled = false
    setPageRendering(true)

    pdfDoc.getPage(page).then((pdfPage) => {
      if (cancelled) return

      const viewport = pdfPage.getViewport({ scale: zoom })
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      canvas.width = viewport.width
      canvas.height = viewport.height
      setRenderSize({ width: viewport.width, height: viewport.height })

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
        .catch(() => {
          if (!cancelled) setError('ページの描画に失敗しました')
        })
        .finally(() => {
          if (!cancelled) setPageRendering(false)
        })
    })

    return () => {
      cancelled = true
    }
  }, [pdfDoc, page, zoom])

  const handleMouseUp = useCallback(() => {
    void policy
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
    })
    selection.removeAllRanges()
  }, [onSelection, policy])

  useEffect(() => {
    onClearSelection?.()
  }, [page, onClearSelection])

  const pageAnnotations = annotations.filter((a) => a.page === page && a.type !== 'bookmark')

  if (loading) {
    return (
      <div className="w-full max-w-2xl space-y-4 p-8">
        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          PDF を読み込み中...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-96 w-full max-w-lg flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
        <p className="font-medium text-red-700">{error}</p>
        <p className="mt-2 text-sm text-red-500">PDF ファイルを確認してください</p>
      </div>
    )
  }

  return (
    <div className="relative inline-block animate-fade-in">
      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)] ring-1 ring-slate-200/80 transition-opacity ${
          pageRendering ? 'opacity-60' : 'opacity-100'
        }`}
        style={{ width: renderSize.width || undefined, height: renderSize.height || undefined }}
        onMouseUp={handleMouseUp}
      >
        <canvas ref={canvasRef} className="block bg-white" />
        <div
          ref={textLayerRef}
          className="pdf-text-layer absolute inset-0 select-text"
          style={{ pointerEvents: 'auto' }}
        />
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
                  className="absolute flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-sm text-white shadow-md ring-2 ring-white"
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
              className="whitespace-nowrap text-[1.25rem] font-semibold text-slate-400/15"
              style={{ transform: 'rotate(-30deg)' }}
            >
              {watermark}
            </span>
          </div>
        )}
        {pageRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/30">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          </div>
        )}
      </div>
    </div>
  )
}
