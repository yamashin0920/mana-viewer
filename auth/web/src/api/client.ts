const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    let body: unknown
    try {
      body = await res.json()
    } catch {
      body = null
    }
    const message =
      typeof body === 'object' && body && 'message' in body
        ? String((body as { message: string }).message)
        : res.statusText
    throw new ApiError(res.status, message)
  }
  return res.json() as Promise<T>
}

export async function loginWithCredentials(userId: string, password: string) {
  return apiFetch<{
    accessToken: string
    user: { id: string; name: string; email: string; role: string }
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ userId, password }),
  })
}

export async function fetchSessionUser(accessToken: string) {
  return apiFetch<{
    id: string
    name: string
    email: string
    role: string
    orgId: string
  }>('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

/** 認証成功後、呼び出し元アプリへトークン付きでリダイレクトする URL を組み立てる */
export function buildRedirectUrl(returnUrl: string, accessToken: string) {
  const url = new URL(returnUrl)
  url.searchParams.set('accessToken', accessToken)
  return url.toString()
}

export const DEFAULT_APP_URL = import.meta.env.VITE_VIEWER_URL || 'http://localhost:5173'

function resolveReturnUrl(redirect: string | null): string {
  if (!redirect) return DEFAULT_APP_URL
  try {
    return decodeURIComponent(redirect)
  } catch {
    return redirect
  }
}

export function loginReturnUrl(redirect: string | null): string {
  return resolveReturnUrl(redirect)
}
