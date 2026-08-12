import { apiFetch } from './client'
import type { User } from '../types'

export async function fetchMe(): Promise<User> {
  return apiFetch<User>('/users/me')
}

export async function loginWithCredentials(userId: string, password: string) {
  return apiFetch<{
    accessToken: string
    refreshToken: string
    user: User
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ userId, password }),
  })
}

export async function login(email: string) {
  return loginWithCredentials(email, 'dev')
}

export async function fetchDevTokens() {
  return apiFetch<{
    tokens: Array<{ token: string; role: string; email: string }>
  }>('/auth/tokens')
}
