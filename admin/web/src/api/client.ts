import type {
  AdminUser,
  Content,
  CredentialAccount,
  License,
  User,
} from '../types'

const AUTH_BASE = import.meta.env.VITE_AUTH_API_BASE || '/api/auth'
const MOCK_BASE = import.meta.env.VITE_MOCK_API_BASE || '/api/mock'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function apiFetch<T>(base: string, path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

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

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export async function loginWithCredentials(userId: string, password: string) {
  return apiFetch<{
    accessToken: string
    user: { id: string; name: string; email: string; role: string }
  }>(AUTH_BASE, '/auth/login', {
    method: 'POST',
    body: JSON.stringify({ userId, password }),
  })
}

export async function fetchCredentials(token: string) {
  return apiFetch<{ data: CredentialAccount[]; users: User[] }>(
    AUTH_BASE,
    '/admin/credentials',
    { headers: authHeaders(token) },
  )
}

export async function createCredential(
  token: string,
  data: { loginId: string; password: string; linkedUserId: string },
) {
  return apiFetch<CredentialAccount>(AUTH_BASE, '/admin/credentials', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
}

export async function updateCredential(
  token: string,
  loginId: string,
  data: { password?: string; linkedUserId?: string; newLoginId?: string },
) {
  return apiFetch<CredentialAccount>(AUTH_BASE, `/admin/credentials/${encodeURIComponent(loginId)}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
}

export async function deleteCredential(token: string, loginId: string) {
  return apiFetch<void>(AUTH_BASE, `/admin/credentials/${encodeURIComponent(loginId)}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

export async function fetchAdminUsers(token: string) {
  return apiFetch<{ data: AdminUser[] }>(MOCK_BASE, '/admin/users', {
    headers: authHeaders(token),
  })
}

export async function createUser(
  token: string,
  data: { name: string; email: string; role: string },
) {
  return apiFetch<User>(MOCK_BASE, '/admin/users', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
}

export async function updateUser(
  token: string,
  userId: string,
  data: Partial<{ name: string; email: string; role: string }>,
) {
  return apiFetch<User>(MOCK_BASE, `/admin/users/${userId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
}

export async function deleteUser(token: string, userId: string) {
  return apiFetch<void>(MOCK_BASE, `/admin/users/${userId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

export async function fetchLicenses(token: string) {
  return apiFetch<{ data: License[] }>(MOCK_BASE, '/admin/licenses', {
    headers: authHeaders(token),
  })
}

export async function createLicense(
  token: string,
  data: {
    contentId: string
    seatCount: number
    startsAt?: string
    expiresAt?: string
    allowOffline?: boolean
    assignedUserIds?: string[]
  },
) {
  return apiFetch<License>(MOCK_BASE, '/admin/licenses', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
}

export async function updateLicense(
  token: string,
  licenseId: string,
  data: Partial<{
    seatCount: number
    startsAt: string
    expiresAt: string
    allowOffline: boolean
    status: string
    assignedUserIds: string[]
  }>,
) {
  return apiFetch<License>(MOCK_BASE, `/admin/licenses/${licenseId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
}

export async function deleteLicense(token: string, licenseId: string) {
  return apiFetch<void>(MOCK_BASE, `/admin/licenses/${licenseId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

export async function fetchContents(token: string) {
  return apiFetch<{ data: Content[] }>(MOCK_BASE, '/admin/contents', {
    headers: authHeaders(token),
  })
}

export async function createContent(
  token: string,
  data: Partial<Content> & { title: string },
) {
  return apiFetch<Content>(MOCK_BASE, '/admin/contents', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
}

export async function updateContent(
  token: string,
  contentId: string,
  data: Partial<Content>,
) {
  return apiFetch<Content>(MOCK_BASE, `/admin/contents/${contentId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
}

export async function deleteContent(token: string, contentId: string) {
  return apiFetch<void>(MOCK_BASE, `/admin/contents/${contentId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}
