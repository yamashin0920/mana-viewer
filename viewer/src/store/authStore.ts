import { create } from 'zustand'
import { setAccessToken } from '../api/client'
import { fetchMe } from '../api/auth'
import { consumeAccessTokenFromUrl, redirectToLogin } from '../utils/authRedirect'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  init: () => Promise<void>
  signInWithToken: (token: string) => Promise<void>
  signOut: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('accessToken'),
  loading: true,
  error: null,

  init: async () => {
    const urlToken = consumeAccessTokenFromUrl()
    if (urlToken) {
      setAccessToken(urlToken)
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      set({ user: null, token: null, loading: false, error: null })
      return
    }

    setAccessToken(token)
    try {
      const user = await fetchMe()
      set({ user, token, loading: false, error: null })
    } catch {
      localStorage.removeItem('accessToken')
      set({ user: null, token: null, loading: false, error: null })
    }
  },

  signInWithToken: async (token: string) => {
    setAccessToken(token)
    set({ loading: true, error: null })
    try {
      const user = await fetchMe()
      set({ user, token, loading: false, error: null })
    } catch (err) {
      localStorage.removeItem('accessToken')
      set({
        user: null,
        token: null,
        loading: false,
        error: err instanceof Error ? err.message : '認証に失敗しました',
      })
      throw err
    }
  },

  signOut: () => {
    localStorage.removeItem('accessToken')
    set({ user: null, token: null, error: null })
    redirectToLogin(`${window.location.origin}/`)
  },
}))
