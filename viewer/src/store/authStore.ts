import { create } from 'zustand'
import {
  clearAccessToken,
  consumeAccessTokenFromUrl,
  redirectToLogout,
  setAccessToken,
} from '@mana/auth-client'
import { fetchMe } from '../api/auth'
import { resetUserQueries } from '../lib/queryClient'
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
      clearAccessToken()
      set({ user: null, token: null, loading: false, error: null })
    }
  },

  signInWithToken: async (token: string) => {
    setAccessToken(token)
    resetUserQueries()
    set({ user: null, token, loading: true, error: null })
    try {
      const user = await fetchMe()
      set({ user, token, loading: false, error: null })
    } catch (err) {
      clearAccessToken()
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
    clearAccessToken()
    redirectToLogout(`${window.location.origin}/`)
  },
}))
