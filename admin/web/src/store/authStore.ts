import { create } from 'zustand'
import {
  clearAccessToken,
  consumeAccessTokenFromUrl,
  redirectToLogout,
  setAccessToken,
} from '@mana/auth-client'
import { isAdminRole } from '@mana/contracts'
import { fetchMe } from '../api/auth'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  init: () => Promise<void>
  signOut: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('accessToken'),
  loading: true,

  init: async () => {
    const urlToken = consumeAccessTokenFromUrl()
    if (urlToken) {
      setAccessToken(urlToken)
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      set({ user: null, token: null, loading: false })
      return
    }

    setAccessToken(token)
    try {
      const user = await fetchMe()
      set({ user, token, loading: false })
    } catch {
      clearAccessToken()
      set({ user: null, token: null, loading: false })
    }
  },

  signOut: () => {
    clearAccessToken()
    // user を null にすると AuthGuard が redirectToLogin を走らせ SSO で即再ログインするため、
    // 先に共通ログアウトへ遷移する（状態更新は不要）
    redirectToLogout(`${window.location.origin}/accounts`)
  },
}))

/** @deprecated useAuthStore を直接使用してください */
export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const signOut = useAuthStore((s) => s.signOut)
  return {
    auth: user && token ? { user, token } : null,
    logout: signOut,
    isAdmin: isAdminRole(user?.role),
  }
}
