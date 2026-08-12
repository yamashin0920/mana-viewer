export const AUTH_APP_URL = import.meta.env.VITE_AUTH_APP_URL || 'http://localhost:5180'

/** 認証アプリのログイン画面へリダイレクト（認証） */
export function redirectToLogin(returnUrl?: string) {
  const redirect = encodeURIComponent(returnUrl ?? window.location.href)
  window.location.href = `${AUTH_APP_URL}/login?redirect=${redirect}`
}

/** 共通ログアウト: 認証セッションを破棄してからログイン画面へ */
export function redirectToLogout(returnUrl?: string) {
  const redirect = encodeURIComponent(returnUrl ?? window.location.href)
  window.location.href = `${AUTH_APP_URL}/logout?redirect=${redirect}`
}

/** 認証アプリから渡された accessToken を URL から取り込む */
export function consumeAccessTokenFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('accessToken')
  if (!token) return null

  params.delete('accessToken')
  const qs = params.toString()
  window.history.replaceState(
    {},
    '',
    `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`,
  )
  return token
}
