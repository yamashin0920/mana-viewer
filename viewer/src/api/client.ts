const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

function getToken(): string | null {
  return localStorage.getItem('accessToken')
}

export function setAccessToken(token: string) {
  localStorage.setItem('accessToken', token)
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
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
    throw new ApiError(res.status, message, body)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export { API_BASE }
