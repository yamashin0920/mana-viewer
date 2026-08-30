import { getAccessToken } from '@mana/auth-client'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export interface ChunkMeta {
  contentId: string
  page: number
  mock: boolean
}

/**
 * 暗号化チャンクを取得する。
 * JSON 用の apiFetch ではなく生の ArrayBuffer を返す。
 */
export async function fetchContentChunk(
  contentId: string,
  page: number,
  sessionToken: string,
): Promise<{ buffer: ArrayBuffer; mock: boolean }> {
  const headers = new Headers({
    'X-Session-Token': sessionToken,
  })
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}/contents/${contentId}/chunks/${page}`, { headers })
  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      if (body?.message) message = String(body.message)
    } catch {
      // ignore
    }
    throw new Error(message || `チャンク取得に失敗しました (${res.status})`)
  }

  const mock = res.headers.get('X-Mock') === 'true' || res.headers.get('X-Encrypted') === 'true'
  const buffer = await res.arrayBuffer()
  return { buffer, mock }
}

/** モックチャンクのヘッダを剥がしてメタデータを読む（本物の PDF バイトではない） */
export function parseMockChunk(buffer: ArrayBuffer): ChunkMeta | null {
  const text = new TextDecoder().decode(buffer)
  const match = text.match(/^--encrypted-chunk-(.+?)-page-(\d+)--/)
  if (!match) return null
  try {
    const payload = JSON.parse(atob(text.slice(match[0].length)))
    return {
      contentId: String(payload.contentId ?? match[1]),
      page: Number(payload.page ?? match[2]),
      mock: payload.mock === true,
    }
  } catch {
    return {
      contentId: match[1],
      page: Number(match[2]),
      mock: true,
    }
  }
}

/**
 * セッション付きで PDF バイト列を解決する。
 * 現行モックチャンクは PDF 本体を含まないため、モック時は sample.pdf にフォールバックする。
 * 本番ではここで AES-GCM 復号して PDF バイトを返す想定。
 */
export async function resolveContentPdfBytes(
  contentId: string,
  sessionToken: string,
): Promise<ArrayBuffer> {
  const { buffer, mock } = await fetchContentChunk(contentId, 1, sessionToken)
  const meta = parseMockChunk(buffer)
  if (mock || meta?.mock) {
    const sample = await fetch('/sample.pdf')
    if (!sample.ok) throw new Error('デモ PDF の読み込みに失敗しました')
    return sample.arrayBuffer()
  }
  return buffer
}
