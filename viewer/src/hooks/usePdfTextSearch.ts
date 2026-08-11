import { useEffect, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { searchPdfDocument, type PdfSearchMatch } from '../utils/pdfSearch'

export function usePdfTextSearch(
  pdfDoc: PDFDocumentProxy | null,
  query: string,
  scale: number
) {
  const [matches, setMatches] = useState<PdfSearchMatch[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!pdfDoc || !query.trim()) {
      setMatches([])
      setSearching(false)
      return
    }

    let cancelled = false
    setSearching(true)

    searchPdfDocument(pdfDoc, query, scale)
      .then((results) => {
        if (!cancelled) {
          setMatches(results)
          setSearching(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMatches([])
          setSearching(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [pdfDoc, query, scale])

  return { matches, searching }
}

export type { PdfSearchMatch }
