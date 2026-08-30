import { useEffect, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { redirectToLogin } from './authRedirect'

interface AuthGuardProps {
  user: unknown
  loading: boolean
  children: ReactNode
  redirectingMessage?: string
}

/** 未ログインなら共通ログイン画面へ送るガード */
export function AuthGuard({
  user,
  loading,
  children,
  redirectingMessage = '認証サービスへ移動中...',
}: AuthGuardProps) {
  useEffect(() => {
    if (!loading && !user) {
      redirectToLogin()
    }
  }, [loading, user])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
        {redirectingMessage}
      </div>
    )
  }

  return children
}
