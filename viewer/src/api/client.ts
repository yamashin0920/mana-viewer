import { ApiError, createApiFetch, setAccessToken } from '@mana/auth-client'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiFetch = createApiFetch(API_BASE)

export { API_BASE, ApiError, setAccessToken }
