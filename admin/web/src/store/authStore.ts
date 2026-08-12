import { useCallback, useEffect, useState } from 'react'
import type { User } from '../types'

const STORAGE_KEY = 'mana-viewer-admin-auth'

interface AuthState {
  token: string
  user: User
}

function loadAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthState
  } catch {
    return null
  }
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState | null>(() => loadAuth())

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [auth])

  const login = useCallback((token: string, user: User) => {
    setAuth({ token, user })
  }, [])

  const logout = useCallback(() => {
    setAuth(null)
  }, [])

  const isAdmin = auth?.user.role === 'org_admin' || auth?.user.role === 'content_admin'

  return { auth, login, logout, isAdmin }
}
