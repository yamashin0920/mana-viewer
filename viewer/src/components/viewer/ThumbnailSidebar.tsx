import { useEffect } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { Loader2 } from 'lucide-react'
import { PdfThumbnail } from './PdfThumbnail'

interface ThumbnailSidebarProps {
  pdfDoc: PDFDocumentProxy | null
  loading?: boolean
  pageCount: number
  currentPage: number
  onJump: (page: number) => void
}

export function ThumbnailSidebar({
  pdfDoc,
  loading,
  pageCount,
  currentPage,
  onJump,
}: ThumbnailSidebarProps) {
  useEffect(() => {
    const active = document.querySelector(`[data-testid="thumbnail-page-${currentPage}"]`)
    active?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [currentPage])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-slate-500 dark:text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
        サムネイルを生成中...
      </div>
    )
  }

  if (!pdfDoc || pageCount === 0) {
    return (
      <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
        サムネイルを表示できません
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3" data-testid="thumbnail-grid">
      {Array.from({ length: pageCount }, (_, index) => {
        const pageNumber = index + 1
        return (
          <PdfThumbnail
            key={pageNumber}
            pdfDoc={pdfDoc}
            pageNumber={pageNumber}
            isActive={currentPage === pageNumber}
            onClick={() => onJump(pageNumber)}
          />
        )
      })}
    </div>
  )
}
