import { useEffect, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { TocEntry } from '../types'
import { resolvePdfDestToPage } from '../utils/pdfDest'

type OutlineNode = {
  title: string
  dest: string | unknown[] | null
  url: string | null
  unsafeUrl?: string
  items?: OutlineNode[]
}

async function flattenOutline(
  pdfDoc: PDFDocumentProxy,
  items: OutlineNode[] | null | undefined,
  level = 1
): Promise<TocEntry[]> {
  if (!items?.length) return []

  const entries: TocEntry[] = []

  for (const item of items) {
    let page = 1
    if (item.dest) {
      const resolved = await resolvePdfDestToPage(pdfDoc, item.dest)
      if (resolved) page = resolved
    }

    const url = item.url ?? item.unsafeUrl ?? null
    entries.push({
      title: item.title,
      page,
      level,
      url,
    })

    if (item.items?.length) {
      entries.push(...(await flattenOutline(pdfDoc, item.items, level + 1)))
    }
  }

  return entries
}

export function usePdfOutline(pdfDoc: PDFDocumentProxy | null) {
  const [outlineToc, setOutlineToc] = useState<TocEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!pdfDoc) {
      setOutlineToc([])
      return
    }

    let cancelled = false
    setLoading(true)

    pdfDoc
      .getOutline()
      .then(async (outline) => {
        if (cancelled) return
        const entries = await flattenOutline(pdfDoc, outline as OutlineNode[] | null)
        setOutlineToc(entries)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setOutlineToc([])
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [pdfDoc])

  return { outlineToc, loading }
}
