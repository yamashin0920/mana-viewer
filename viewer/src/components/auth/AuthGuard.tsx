import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { redirectToLogin } from '../../utils/authRedirect'

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
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-400"
        data-testid="auth-redirect"
      >
        認証サービスへ移動中...
      </div>
    )
  }

  return children
}
