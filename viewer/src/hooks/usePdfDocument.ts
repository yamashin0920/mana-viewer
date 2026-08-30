import { useEffect, useState } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = pdfjsWorker

export type PdfSource =
  | { kind: 'url'; url: string }
  | { kind: 'data'; data: ArrayBuffer }
  | null

function normalizeSource(source: PdfSource | string | null): PdfSource {
  if (!source) return null
  if (typeof source === 'string') return { kind: 'url', url: source }
  return source
}

function sourceKey(source: PdfSource): string {
  if (!source) return ''
  if (source.kind === 'url') return `url:${source.url}`
  return `data:${source.data.byteLength}`
}

export function usePdfDocument(source: PdfSource | string | null) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const normalized = normalizeSource(source)
  const key = sourceKey(normalized)

  useEffect(() => {
    if (!normalized) {
      setPdfDoc(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const params =
      normalized.kind === 'url'
        ? { url: normalized.url }
        : { data: new Uint8Array(normalized.data.slice(0)) }

    getDocument(params)
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
  }, [key])

  return {
    pdfDoc,
    loading,
    error,
    numPages: pdfDoc?.numPages ?? 0,
  }
}
