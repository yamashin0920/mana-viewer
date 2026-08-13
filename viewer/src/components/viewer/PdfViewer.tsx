import { useEffect, useCallback } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { Loader2 } from 'lucide-react'
import type { Annotation, ContentPolicyResponse } from '../../types'
import type { AnnotationTool } from '../../types/annotationTools'
import type { AnnotationVisibility } from '../../types/annotationVisibility'
import type { DrawingPoint } from '../../utils/drawingPath'
import type { PageCoordContext } from '../../utils/annotationCoords'
import { Skeleton } from '../ui/Skeleton'
import { PdfPage, type SearchHighlight } from './PdfPage'
import type { PdfSearchMatch } from '../../hooks/usePdfTextSearch'
import { usePdfDocument } from '../../hooks/usePdfDocument'

export type ViewMode = 'single' | 'spread'

export interface TextSelection {
  text: string
  rects: Array<{ x: number; y: number; width: number; height: number }>
  position: { x: number; y: number }
  page: number
  viewportWidth: number
  viewportHeight: number
}

interface PdfViewerProps {
  pdfUrl: string
  pdfDoc?: PDFDocumentProxy | null
  pdfLoading?: boolean
  pdfError?: string | null
  page: number
  zoom: number
  viewMode: ViewMode
  annotations: Annotation[]
  searchMatches?: PdfSearchMatch[]
  activeSearchIndex?: number
  annotationTool?: AnnotationTool
  penColor?: string
  watermark?: string | null
  showAnnotations?: boolean
  annotationVisibility?: AnnotationVisibility
  hiddenAnnotationIds?: Set<string>
  focusedAnnotationId?: string | null
  policy?: ContentPolicyResponse | null
  onPageCount: (count: number) => void
  onPageJump?: (page: number) => void
  onDrawingComplete?: (points: DrawingPoint[], context: PageCoordContext) => void
  onStickyPlace?: (position: { x: number; y: number }, context: PageCoordContext) => void
  onSelection?: (selection: TextSelection) => void
  onClearSelection?: () => void
}

export function PdfViewer({
  pdfUrl,
  pdfDoc: externalPdfDoc,
  pdfLoading: externalLoading,
  pdfError: externalError,
  page,
  zoom,
  viewMode,
  annotations,
  searchMatches = [],
  activeSearchIndex = -1,
  annotationTool = 'select',
  penColor = '#E53935',
  watermark,
  showAnnotations = true,
  annotationVisibility,
  hiddenAnnotationIds,
  focusedAnnotationId,
  policy,
  onPageCount,
  onPageJump,
  onDrawingComplete,
  onStickyPlace,
  onSelection,
  onClearSelection,
}: PdfViewerProps) {
  void policy
  const usesSharedDoc = externalLoading !== undefined
  const internal = usePdfDocument(usesSharedDoc ? null : pdfUrl)
  const pdfDoc = usesSharedDoc ? (externalPdfDoc ?? null) : internal.pdfDoc
  const loading = usesSharedDoc ? (externalLoading ?? false) : internal.loading
  const error = usesSharedDoc ? externalError : internal.error

  const rightPage = viewMode === 'spread' && page < (pdfDoc?.numPages ?? 0) ? page + 1 : null

  useEffect(() => {
    if (pdfDoc) {
      onPageCount(pdfDoc.numPages)
    }
  }, [pdfDoc, onPageCount])

  useEffect(() => {
    onClearSelection?.()
  }, [page, viewMode, onClearSelection])

  const handleSelection = useCallback(
    (selection: TextSelection) => {
      onSelection?.(selection)
    },
    [onSelection]
  )

  const highlightsForPage = useCallback(
    (pageNumber: number): SearchHighlight[] =>
      searchMatches
        .filter((match) => match.page === pageNumber)
        .flatMap((match) =>
          match.rects.map((rect) => ({
            rect,
            active: match.matchIndex === activeSearchIndex,
          }))
        ),
    [searchMatches, activeSearchIndex]
  )

  if (loading) {
    return (
      <div className="w-full max-w-2xl space-y-4 p-8">
        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          PDF を読み込み中...
        </div>
      </div>
    )
  }

  if (error || !pdfDoc) {
    return (
      <div className="flex h-96 w-full max-w-lg flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30">
        <p className="font-medium text-red-700 dark:text-red-400">{error ?? 'PDF の読み込みに失敗しました'}</p>
        <p className="mt-2 text-sm text-red-500 dark:text-red-400/80">PDF ファイルを確認してください</p>
      </div>
    )
  }

  if (viewMode === 'spread') {
    return (
      <div className="animate-fade-in">
        <div
          className={`flex overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-slate-200/80 dark:ring-slate-700/80 ${
            rightPage ? 'gap-px bg-slate-300 dark:bg-slate-700' : ''
          }`}
        >
          <PdfPage
            pdfDoc={pdfDoc}
            pageNumber={page}
            zoom={zoom}
            annotations={annotations}
            searchHighlights={highlightsForPage(page)}
            annotationTool={annotationTool}
            penColor={penColor}
            watermark={watermark}
            showAnnotations={showAnnotations}
            annotationVisibility={annotationVisibility}
            hiddenAnnotationIds={hiddenAnnotationIds}
            focusedAnnotationId={focusedAnnotationId}
            onSelection={handleSelection}
            onInternalLink={onPageJump}
            onDrawingComplete={onDrawingComplete}
            onStickyPlace={onStickyPlace}
            className="rounded-l-2xl"
          />
          {rightPage && (
            <PdfPage
              pdfDoc={pdfDoc}
              pageNumber={rightPage}
              zoom={zoom}
              annotations={annotations}
              searchHighlights={highlightsForPage(rightPage)}
              annotationTool={annotationTool}
              penColor={penColor}
              watermark={watermark}
              showAnnotations={showAnnotations}
              annotationVisibility={annotationVisibility}
              hiddenAnnotationIds={hiddenAnnotationIds}
              focusedAnnotationId={focusedAnnotationId}
              onSelection={handleSelection}
              onInternalLink={onPageJump}
              onDrawingComplete={onDrawingComplete}
              onStickyPlace={onStickyPlace}
              className="rounded-r-2xl"
            />
          )}
        </div>
        {rightPage && (
          <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
            p.{page} – {rightPage}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-slate-200/80 dark:ring-slate-700/80">
        <PdfPage
          pdfDoc={pdfDoc}
          pageNumber={page}
          zoom={zoom}
          annotations={annotations}
          searchHighlights={highlightsForPage(page)}
          annotationTool={annotationTool}
          penColor={penColor}
          watermark={watermark}
          showAnnotations={showAnnotations}
          annotationVisibility={annotationVisibility}
          hiddenAnnotationIds={hiddenAnnotationIds}
          focusedAnnotationId={focusedAnnotationId}
          onSelection={handleSelection}
          onInternalLink={onPageJump}
          onDrawingComplete={onDrawingComplete}
          onStickyPlace={onStickyPlace}
        />
      </div>
    </div>
  )
}
