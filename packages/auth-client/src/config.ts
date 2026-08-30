let authAppUrl = 'http://localhost:5180'

/** 各アプリの main で一度だけ呼ぶ */
export function configureAuthClient(options: { authAppUrl?: string }) {
  if (options.authAppUrl) authAppUrl = options.authAppUrl
}

export function getAuthAppUrl(): string {
  return authAppUrl
}
