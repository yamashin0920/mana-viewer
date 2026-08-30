import { useEffect, useState } from 'react'
import { resolveContentPdfBytes } from '../api/chunks'
import { getDemoPdfUrl } from '../api/contents'
import type { PdfSource } from './usePdfDocument'

const USE_DEMO_PDF = import.meta.env.VITE_USE_DEMO_PDF !== 'false'

/**
 * 閲覧セッション付きで PDF ソースを解決する。
 * `VITE_USE_DEMO_PDF=false` のときはチャンク API を呼び、モック応答なら sample.pdf にフォールバックする。
 */
export function useContentPdf(
  contentId: string | null,
  sessionToken: string | null,
  sessionReady: boolean,
) {
  const [source, setSource] = useState<PdfSource | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!contentId) {
      setSource(null)
      setError(null)
      setLoading(false)
      return
    }

    if (USE_DEMO_PDF) {
      setSource({ kind: 'url', url: getDemoPdfUrl(contentId) })
      setError(null)
      setLoading(false)
      return
    }

    if (!sessionReady) {
      setSource(null)
      setLoading(true)
      return
    }

    if (!sessionToken) {
      setSource({ kind: 'url', url: getDemoPdfUrl(contentId) })
      setError('閲覧セッションを取得できなかったため、デモ PDF を表示しています')
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    void resolveContentPdfBytes(contentId, sessionToken)
      .then((bytes) => {
        if (cancelled) return
        setSource({ kind: 'data', data: bytes })
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : String(err))
        setSource({ kind: 'url', url: getDemoPdfUrl(contentId) })
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [contentId, sessionToken, sessionReady])

  return { source, error, loading }
}
