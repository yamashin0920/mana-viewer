import { useEffect, useRef, useCallback, useState } from 'react'
import { TextLayer } from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import type { Annotation, AnnotationRect } from '../../types'
import type { AnnotationTool } from '../../types/annotationTools'
import {
  DEFAULT_ANNOTATION_VISIBILITY,
  isAnnotationVisible,
  type AnnotationVisibility,
} from '../../types/annotationVisibility'
import type { TextSelection } from './PdfViewer'
import { PdfLinkLayer } from './PdfLinkLayer'
import { DrawingLayer } from './DrawingLayer'
import { parseDrawingPath, pointsToSvgPath, type DrawingPoint } from '../../utils/drawingPath'
import {
  annotationPageNumber,
  toDisplayDrawingPoints,
  toDisplayRects,
  type PageCoordContext,
} from '../../utils/annotationCoords'

export interface SearchHighlight {
  rect: AnnotationRect
  active: boolean
}

interface PdfPageProps {
  pdfDoc: PDFDocumentProxy
  pageNumber: number
  zoom: number
  annotations: Annotation[]
  searchHighlights?: SearchHighlight[]
  annotationTool?: AnnotationTool
  penColor?: string
  watermark?: string | null
  onSelection?: (selection: TextSelection) => void
  onInternalLink?: (page: number) => void
  onDrawingComplete?: (points: DrawingPoint[], context: PageCoordContext) => void
  onStickyPlace?: (position: { x: number; y: number }, context: PageCoordContext) => void
  onRender?: (width: number, height: number) => void
  showAnnotations?: boolean
  annotationVisibility?: AnnotationVisibility
  hiddenAnnotationIds?: Set<string>
  focusedAnnotationId?: string | null
  className?: string
}

export function PdfPage({
  pdfDoc,
  pageNumber,
  zoom,
  annotations,
  searchHighlights = [],
  annotationTool = 'select',
  penColor = '#E53935',
  watermark,
  onSelection,
  onInternalLink,
  onDrawingComplete,
  onStickyPlace,
  onRender,
  showAnnotations = true,
  annotationVisibility = DEFAULT_ANNOTATION_VISIBILITY,
  hiddenAnnotationIds = new Set<string>(),
  focusedAnnotationId = null,
  className = '',
}: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })

  const handleRender = useCallback((width: number, height: number) => {
    setViewportSize({ width, height })
    onRender?.(width, height)
  }, [onRender])

  useEffect(() => {
    let cancelled = false

    pdfDoc.getPage(pageNumber).then((pdfPage: PDFPageProxy) => {
      if (cancelled || !canvasRef.current) return

      const viewport = pdfPage.getViewport({ scale: zoom })
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')!
      canvas.width = viewport.width
      canvas.height = viewport.height
      handleRender(viewport.width, viewport.height)

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
  }, [pdfDoc, pageNumber, zoom, handleRender])

  const textSelectable = annotationTool === 'select' || annotationTool === 'marker'

  const handleMouseUp = useCallback(() => {
    if (!textSelectable) return

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

    const viewportWidth = canvasRef.current?.width ?? containerRef.current.clientWidth
    const viewportHeight = canvasRef.current?.height ?? containerRef.current.clientHeight
    const lastRect = range.getBoundingClientRect()
    onSelection?.({
      text,
      rects,
      position: { x: lastRect.left + lastRect.width / 2, y: lastRect.top },
      page: pageNumber,
      viewportWidth,
      viewportHeight,
    })
    selection.removeAllRanges()
  }, [textSelectable, onSelection, pageNumber])

  const handleStickyClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (annotationTool !== 'sticky' || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const context: PageCoordContext = {
        page: pageNumber,
        viewportWidth: viewportSize.width || rect.width,
        viewportHeight: viewportSize.height || rect.height,
      }
      onStickyPlace?.(
        {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
        context
      )
    },
    [annotationTool, onStickyPlace, pageNumber, viewportSize.height, viewportSize.width]
  )

  const handleDrawingComplete = useCallback(
    (points: DrawingPoint[]) => {
      if (!onDrawingComplete) return
      onDrawingComplete(points, {
        page: pageNumber,
        viewportWidth: viewportSize.width,
        viewportHeight: viewportSize.height,
      })
    },
    [onDrawingComplete, pageNumber, viewportSize.height, viewportSize.width]
  )

  useEffect(() => {
    if (!focusedAnnotationId || viewportSize.width <= 0) return
    const target = containerRef.current?.querySelector(
      `[data-annotation-id="${focusedAnnotationId}"]`
    )
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focusedAnnotationId, pageNumber, viewportSize.width, viewportSize.height])

  const isVisible = (annotation: (typeof annotations)[number]) =>
    isAnnotationVisible(annotation, showAnnotations, annotationVisibility, hiddenAnnotationIds)

  const pageAnnotations = annotations.filter(
    (a) => annotationPageNumber(a.page) === pageNumber && a.type !== 'bookmark'
  )
  const drawingAnnotations = pageAnnotations.filter((a) => a.type === 'drawing' && isVisible(a))
  const stickyAnnotations = pageAnnotations.filter((a) => a.type === 'sticky' && isVisible(a))
  const markupAnnotations = pageAnnotations.filter(
    (a) => a.type !== 'drawing' && a.type !== 'sticky' && a.type !== 'note' && isVisible(a)
  )
  const noteAnnotations = pageAnnotations.filter((a) => a.type === 'note' && isVisible(a))
  const showDrawingLayer =
    (showAnnotations && annotationVisibility.drawing) || annotationTool === 'pen'

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-white dark:bg-slate-900 ${className} ${
        annotationTool === 'sticky'
          ? 'cursor-cell'
          : annotationTool === 'marker'
            ? 'cursor-text'
            : ''
      }`}
      onMouseUp={handleMouseUp}
      onClick={handleStickyClick}
    >
      <canvas ref={canvasRef} className="block bg-white dark:bg-slate-900" data-testid="pdf-canvas" />
      <div
        ref={textLayerRef}
        className={`pdf-text-layer absolute inset-0 ${textSelectable ? 'select-text' : 'pointer-events-none select-none'}`}
      />
      {onInternalLink && (
        <PdfLinkLayer
          pdfDoc={pdfDoc}
          pageNumber={pageNumber}
          zoom={zoom}
          onInternalLink={onInternalLink}
        />
      )}
      <div className="pointer-events-none absolute inset-0">
        {searchHighlights.map((highlight, idx) => (
          <div
            key={`search-${idx}`}
            data-testid={highlight.active ? 'search-highlight-active' : 'search-highlight'}
            className={`absolute rounded-sm ${
              highlight.active ? 'bg-amber-400/70 ring-1 ring-amber-500' : 'bg-amber-300/45'
            }`}
            style={{
              left: highlight.rect.x,
              top: highlight.rect.y,
              width: highlight.rect.width,
              height: highlight.rect.height,
            }}
          />
        ))}
        {drawingAnnotations.map((ann) => {
          const pathData = parseDrawingPath(ann.note)
          if (!pathData) return null
          const displayPoints = toDisplayDrawingPoints(
            pathData.points,
            viewportSize.width,
            viewportSize.height,
            zoom
          )
          return (
            <svg
              key={ann.id}
              data-testid="drawing-annotation"
              data-annotation-id={ann.id}
              className="absolute inset-0 overflow-visible"
              aria-hidden
            >
              <path
                d={pointsToSvgPath(displayPoints)}
                stroke={ann.color ?? '#E53935'}
                fill="none"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )
        })}
        {markupAnnotations.map((ann) => {
          const displayRects = toDisplayRects(
            ann.rects ?? [],
            viewportSize.width,
            viewportSize.height,
            zoom
          )
          return displayRects.map((rect, idx) => (
            <div
              key={`${ann.id}-${idx}`}
              data-testid="markup-annotation"
              data-annotation-id={ann.id}
              className={`absolute rounded-sm ${
                focusedAnnotationId === ann.id ? 'ring-2 ring-brand-500' : ''
              }`}
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
        })}
        {noteAnnotations
          .filter((a) => a.rects?.[0])
          .map((ann) => {
            const displayRects = toDisplayRects(
              ann.rects ?? [],
              viewportSize.width,
              viewportSize.height,
              zoom
            )
            const rect = displayRects[0]
            if (!rect) return null
            return (
              <div
                key={ann.id}
                data-testid="note-annotation"
                data-annotation-id={ann.id}
                className={`absolute flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-sm text-white shadow-md ring-2 ring-white dark:ring-slate-800 ${
                  focusedAnnotationId === ann.id ? 'ring-brand-500 ring-offset-2' : ''
                }`}
                style={{ left: rect.x, top: rect.y }}
                title={ann.note ?? ''}
              >
                📝
              </div>
            )
          })}
        {stickyAnnotations
          .filter((a) => a.rects?.[0])
          .map((ann) => {
            const displayRects = toDisplayRects(
              ann.rects ?? [],
              viewportSize.width,
              viewportSize.height,
              zoom
            )
            const rect = displayRects[0]
            if (!rect) return null
            return (
              <div
                key={ann.id}
                data-testid="sticky-note"
                data-annotation-id={ann.id}
                className={`absolute w-28 rounded-md border border-yellow-300 bg-yellow-100 p-2 text-xs text-slate-800 shadow-md dark:border-yellow-700 dark:bg-yellow-200/90 ${
                  focusedAnnotationId === ann.id ? 'ring-2 ring-brand-500' : ''
                }`}
                style={{ left: rect.x, top: rect.y }}
                title={ann.note ?? ''}
              >
                <p className="line-clamp-4 whitespace-pre-wrap">{ann.note}</p>
              </div>
            )
          })}
      </div>
      {onDrawingComplete && showDrawingLayer && (
        <DrawingLayer
          active={annotationTool === 'pen'}
          color={penColor}
          onComplete={handleDrawingComplete}
        />
      )}
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
