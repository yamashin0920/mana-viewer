import { useEffect, useState } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = pdfjsWorker

export function usePdfDocument(pdfUrl: string | null) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!pdfUrl) {
      setPdfDoc(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    getDocument({ url: pdfUrl })
      .promise.then((doc) => {
        if (cancelled) return
        setPdfDoc(doc)
        setLoading(false)
      })
      .catch((err: Error) => {
        if (cancelled) return
        setError(err.message)
        setPdfDoc(null)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [pdfUrl])

  return {
    pdfDoc,
    loading,
    error,
    numPages: pdfDoc?.numPages ?? 0,
  }
}
