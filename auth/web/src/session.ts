const ACCESS_TOKEN_KEY = 'accessToken'

/** 認証セッションは auth/web のみが保持する（SSO の唯一のソース） */
export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function persistAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearStoredAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}
