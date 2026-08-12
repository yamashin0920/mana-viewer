import { create } from 'zustand'
import { clearAccessToken, fetchMe, persistAccessToken } from '../api/auth'
import { consumeAccessTokenFromUrl, redirectToLogin } from '../utils/authRedirect'
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
      persistAccessToken(urlToken)
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      set({ user: null, token: null, loading: false })
      return
    }

    persistAccessToken(token)
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
    set({ user: null, token: null })
    redirectToLogin(`${window.location.origin}/accounts`)
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
    isAdmin: user?.role === 'org_admin' || user?.role === 'content_admin',
  }
}
