import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

let current: Theme = 'light'
const listeners = new Set<() => void>()

function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

function emit() {
  for (const listener of listeners) listener()
}

function resolveInitial(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** アプリ起動時に一度だけ呼ぶ。保存済みの設定、無ければ OS 設定を反映する */
export function initTheme() {
  current = resolveInitial()
  apply(current)
  emit()
}

export function setTheme(theme: Theme) {
  current = theme
  localStorage.setItem(STORAGE_KEY, theme)
  apply(theme)
  emit()
}

export function toggleTheme() {
  setTheme(current === 'light' ? 'dark' : 'light')
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => 'light' as Theme
  )
}
