import type { Course, LaunchResult, User, XapiRecord } from '../types'

const MOCK_BASE = import.meta.env.VITE_MOCK_API_BASE || '/api/mock'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function getToken(): string | null {
  return localStorage.getItem('accessToken')
}

export function setAccessToken(token: string | null) {
  if (token) localStorage.setItem('accessToken', token)
  else localStorage.removeItem('accessToken')
}

export async function apiFetch<T>(base: string, path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${base}${path}`, { ...options, headers })
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
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function fetchMe(): Promise<User> {
  const data = await apiFetch<User>(MOCK_BASE, '/users/me')
  return data
}

export function persistAccessToken(token: string) {
  setAccessToken(token)
}

export function clearAccessToken() {
  setAccessToken(null)
}

export async function fetchCourses() {
  return apiFetch<{ data: Course[] }>(MOCK_BASE, '/lms/courses')
}

export async function fetchCourse(courseId: string) {
  return apiFetch<Course>(MOCK_BASE, `/lms/courses/${encodeURIComponent(courseId)}`)
}

export async function launchContent(data: { contentId: string; page?: number; courseId?: string }) {
  return apiFetch<LaunchResult>(MOCK_BASE, '/lms/launch', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function syncRoster(courseId: string) {
  return apiFetch<{ syncedAt: string; membersAdded: number; message: string }>(MOCK_BASE, '/lms/roster/sync', {
    method: 'POST',
    body: JSON.stringify({ courseId }),
  })
}

export async function fetchXapiStatements() {
  return apiFetch<{ data: XapiRecord[] }>(MOCK_BASE, '/lms/xapi/statements')
}
