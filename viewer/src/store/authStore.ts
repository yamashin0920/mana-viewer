import { create } from 'zustand'
import { setAccessToken } from '../api/client'
import { fetchMe, login } from '../api/auth'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  init: () => Promise<void>
  signInWithToken: (token: string) => Promise<void>
  signInWithEmail: (email: string) => Promise<void>
  signOut: () => void
}

const DEFAULT_TOKEN = 'mock-token-learner'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('accessToken'),
  loading: true,
  error: null,

  init: async () => {
    let token = localStorage.getItem('accessToken')
    if (!token) {
      token = DEFAULT_TOKEN
      setAccessToken(token)
    }
    try {
      const user = await fetchMe()
      set({ user, token, loading: false, error: null })
    } catch {
      setAccessToken(DEFAULT_TOKEN)
      try {
        const user = await fetchMe()
        set({ user, token: DEFAULT_TOKEN, loading: false, error: null })
      } catch (err) {
        set({
          loading: false,
          error: err instanceof Error ? err.message : '認証に失敗しました',
        })
      }
    }
  },

  signInWithToken: async (token: string) => {
    setAccessToken(token)
    set({ loading: true, error: null })
    try {
      const user = await fetchMe()
      set({ user, token, loading: false })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : '認証に失敗しました',
      })
      throw err
    }
  },

  signInWithEmail: async (email: string) => {
    set({ loading: true, error: null })
    try {
      const res = await login(email)
      setAccessToken(res.accessToken)
      set({ user: res.user, token: res.accessToken, loading: false })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'ログインに失敗しました',
      })
      throw err
    }
  },

  signOut: () => {
    localStorage.removeItem('accessToken')
    set({ user: null, token: null })
  },
}))
