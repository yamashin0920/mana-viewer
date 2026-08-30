const ACCESS_TOKEN_KEY = 'accessToken'

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAccessToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token)
    else localStorage.removeItem(ACCESS_TOKEN_KEY)
  } catch {
    // ignore storage failures (private mode etc.)
  }
}

export function clearAccessToken(): void {
  setAccessToken(null)
}
