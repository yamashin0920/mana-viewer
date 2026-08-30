import { AuthGuard as SharedAuthGuard } from '@mana/auth-client'
import { useAuthStore } from '../../store/authStore'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  return (
    <SharedAuthGuard user={user} loading={loading}>
      {children}
    </SharedAuthGuard>
  )
}
