import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { redirectToLogin } from '../../utils/authRedirect'

/** 認証チェック: 未ログインなら共通ログイン画面へ */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  useEffect(() => {
    if (!loading && !user) {
      redirectToLogin()
    }
  }, [loading, user])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-950">
        ログイン画面へ移動中...
      </div>
    )
  }

  return children
}
