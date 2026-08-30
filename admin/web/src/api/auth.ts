import { clearAccessToken, createApiFetch, setAccessToken } from '@mana/auth-client'
import type { User } from '../types'

const MOCK_BASE = import.meta.env.VITE_MOCK_API_BASE || '/api/mock'
const mockFetch = createApiFetch(MOCK_BASE)

export async function fetchMe(): Promise<User> {
  const data = await mockFetch<{
    id: string
    name: string
    email: string
    role: User['role']
    orgId: string
  }>('/users/me')
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    orgId: data.orgId,
  }
}

export function persistAccessToken(token: string) {
  setAccessToken(token)
}

export { clearAccessToken }
