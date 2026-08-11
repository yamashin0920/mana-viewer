import { useEffect, useRef, useState, useCallback } from 'react'
import { getDocument, GlobalWorkerOptions, TextLayer } from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { Annotation, ContentPolicyResponse } from '../../types'

GlobalWorkerOptions.workerSrc = pdfjsWorker

interface PdfViewerProps {
  pdfUrl: string
  page: number
  zoom: number
  annotations: Annotation[]
  watermark?: string | null
  policy?: ContentPolicyResponse | null
  onPageCount: (count: number) => void
  onTextSelected?: (selection: {
    text: string
    rects: Array<{ x: number; y: number; width: number; height: number }>
  }) => void
}

export function PdfViewer({
  pdfUrl,
  page,
  zoom,
  annotations,
  watermark,
  policy,
  onPageCount,
  onTextSelected,
}: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
  const [renderSize, setRenderSize] = useState({ width: 0, height: 0 })
  const [loading, setLoading] = useState(true)
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
    })

    return () => {
      cancelled = true
    }
  }, [pdfDoc, page, zoom])

  const handleMouseUp = useCallback(() => {
    if (!policy || policy.drm.allowCopy === false) {
      // Selection still works for highlight creation in viewer
    }
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

    if (rects.length > 0) {
      onTextSelected?.({ text, rects })
    }
    selection.removeAllRanges()
  }, [onTextSelected, policy])

  const pageAnnotations = annotations.filter((a) => a.page === page && a.type !== 'bookmark')

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500">
        PDF を読み込み中...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="relative inline-block">
      <div
        ref={containerRef}
        className="relative shadow-lg"
        style={{ width: renderSize.width, height: renderSize.height }}
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
                  opacity: ann.type === 'highlight' ? 0.35 : 0.2,
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
                  className="absolute flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs text-white shadow"
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
              className="whitespace-nowrap text-slate-400/20 text-lg font-semibold"
              style={{ transform: 'rotate(-30deg)' }}
            >
              {watermark}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
