import { useEffect, useState, useCallback } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { Loader2 } from 'lucide-react'
import type { Annotation, ContentPolicyResponse } from '../../types'
import { Skeleton } from '../ui/Skeleton'
import { PdfPage } from './PdfPage'

GlobalWorkerOptions.workerSrc = pdfjsWorker

export type ViewMode = 'single' | 'spread'

export interface TextSelection {
  text: string
  rects: Array<{ x: number; y: number; width: number; height: number }>
  position: { x: number; y: number }
  page: number
}

interface PdfViewerProps {
  pdfUrl: string
  page: number
  zoom: number
  viewMode: ViewMode
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
  viewMode,
  annotations,
  watermark,
  policy,
  onPageCount,
  onSelection,
  onClearSelection,
}: PdfViewerProps) {
  void policy
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const rightPage = viewMode === 'spread' && page < (pdfDoc?.numPages ?? 0) ? page + 1 : null

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
    onClearSelection?.()
  }, [page, viewMode, onClearSelection])

  const handleSelection = useCallback(
    (selection: TextSelection) => {
      onSelection?.(selection)
    },
    [onSelection]
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
            watermark={watermark}
            onSelection={handleSelection}
            className="rounded-l-2xl"
          />
          {rightPage && (
            <PdfPage
              pdfDoc={pdfDoc}
              pageNumber={rightPage}
              zoom={zoom}
              annotations={annotations}
              watermark={watermark}
              onSelection={handleSelection}
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
          watermark={watermark}
          onSelection={handleSelection}
        />
      </div>
    </div>
  )
}
