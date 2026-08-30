import { ApiError } from './ApiError'
import { getAccessToken } from './token'

type BaseUrl = string | (() => string)

function resolveBase(base: BaseUrl): string {
  return typeof base === 'function' ? base() : base
}

function errorMessage(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body && 'message' in body) {
    return String((body as { message: string }).message)
  }
  return fallback
}

/**
 * Bearer トークン付きの JSON fetch を生成する。
 * viewer は単一 base、admin は auth / mock の 2 系統でそれぞれ作る。
 */
export function createApiFetch(base: BaseUrl) {
  return async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers)
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json')
    }

    if (!headers.has('Authorization')) {
      const token = getAccessToken()
      if (token) headers.set('Authorization', `Bearer ${token}`)
    }

    const res = await fetch(`${resolveBase(base)}${path}`, { ...options, headers })
    if (!res.ok) {
      let body: unknown = null
      try {
        body = await res.json()
      } catch {
        body = null
      }
      throw new ApiError(res.status, errorMessage(body, res.statusText), body)
    }
    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
  }
}
