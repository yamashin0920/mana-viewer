import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { clearStoredAccessToken } from '../session'

/** 共通ログアウト: 認証セッションを破棄してログイン画面へ */
export function LogoutPage() {
  const [searchParams] = useSearchParams()
  clearStoredAccessToken()

  useEffect(() => {
    const redirect = searchParams.get('redirect')
    const loginUrl = redirect
      ? `/login?redirect=${encodeURIComponent(redirect)}&loggedOut=1`
      : '/login?loggedOut=1'
    window.location.replace(loginUrl)
  }, [searchParams])

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-950"
      data-testid="logout-page"
    >
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
    </div>
  )
}
