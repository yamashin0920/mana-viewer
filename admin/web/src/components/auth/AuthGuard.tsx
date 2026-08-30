import { AuthGuard as SharedAuthGuard } from '@mana/auth-client'
import { useAuthStore } from '../../store/authStore'

/** 認証チェック: 未ログインなら共通ログイン画面へ */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  return (
    <SharedAuthGuard user={user} loading={loading} redirectingMessage="ログイン画面へ移動中...">
      {children}
    </SharedAuthGuard>
  )
}
