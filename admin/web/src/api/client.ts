import { ApiError, createApiFetch, setAccessToken as setToken } from '@mana/auth-client'
import type {
  AdminUser,
  Content,
  CredentialAccount,
  License,
  User,
} from '../types'

const AUTH_BASE = import.meta.env.VITE_AUTH_API_BASE || '/api/auth'
const MOCK_BASE = import.meta.env.VITE_MOCK_API_BASE || '/api/mock'

const authFetch = createApiFetch(AUTH_BASE)
const mockFetch = createApiFetch(MOCK_BASE)

export { ApiError }

export function setAccessToken(token: string | null) {
  setToken(token)
}

async function apiFetch<T>(base: string, path: string, options: RequestInit = {}): Promise<T> {
  const fetchForBase = base === AUTH_BASE ? authFetch : mockFetch
  return fetchForBase<T>(path, options)
}

export async function fetchCredentials() {
  return apiFetch<{ data: CredentialAccount[]; users: User[] }>(AUTH_BASE, '/admin/credentials')
}

export async function createCredential(data: { loginId: string; password: string; linkedUserId: string }) {
  return apiFetch<CredentialAccount>(AUTH_BASE, '/admin/credentials', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCredential(
  loginId: string,
  data: { password?: string; linkedUserId?: string; newLoginId?: string },
) {
  return apiFetch<CredentialAccount>(AUTH_BASE, `/admin/credentials/${encodeURIComponent(loginId)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteCredential(loginId: string) {
  return apiFetch<void>(AUTH_BASE, `/admin/credentials/${encodeURIComponent(loginId)}`, {
    method: 'DELETE',
  })
}

export async function fetchAdminUsers() {
  return apiFetch<{ data: AdminUser[] }>(MOCK_BASE, '/admin/users')
}

export async function createUser(data: { name: string; email: string; role: string }) {
  return apiFetch<User>(MOCK_BASE, '/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateUser(userId: string, data: Partial<{ name: string; email: string; role: string }>) {
  return apiFetch<User>(MOCK_BASE, `/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function updateUserLicenses(userId: string, licenseIds: string[]) {
  return apiFetch<{ data: AdminUser['licenses'] }>(MOCK_BASE, `/admin/users/${userId}/licenses`, {
    method: 'PUT',
    body: JSON.stringify({ licenseIds }),
  })
}

export async function deleteUser(userId: string) {
  return apiFetch<void>(MOCK_BASE, `/admin/users/${userId}`, { method: 'DELETE' })
}

export async function fetchLicenses() {
  return apiFetch<{ data: License[] }>(MOCK_BASE, '/admin/licenses')
}

export async function createLicense(data: {
  contentId: string
  seatCount: number
  startsAt?: string
  expiresAt?: string
  allowOffline?: boolean
  status?: string
  assignedUserIds?: string[]
}) {
  return apiFetch<License>(MOCK_BASE, '/admin/licenses', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateLicense(
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
    body: JSON.stringify(data),
  })
}

export async function deleteLicense(licenseId: string) {
  return apiFetch<void>(MOCK_BASE, `/admin/licenses/${licenseId}`, { method: 'DELETE' })
}

export async function fetchContents() {
  return apiFetch<{ data: Content[] }>(MOCK_BASE, '/admin/contents')
}

export async function createContent(data: Partial<Content> & { title: string }) {
  return apiFetch<Content>(MOCK_BASE, '/admin/contents', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateContent(contentId: string, data: Partial<Content>) {
  return apiFetch<Content>(MOCK_BASE, `/admin/contents/${contentId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteContent(contentId: string) {
  return apiFetch<void>(MOCK_BASE, `/admin/contents/${contentId}`, { method: 'DELETE' })
}
