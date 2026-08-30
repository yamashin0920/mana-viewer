import { BookOpen, GraduationCap, LogOut } from 'lucide-react'
import { getAuthAppUrl } from '@mana/auth-client'
import { ROLE_LABELS, type UserRole } from '@mana/contracts'
import { useAuthStore } from '../../store/authStore'
import { Badge } from '../ui/Badge'
import { Button, ThemeToggle } from '@mana/ui'

const DEV_TOKENS: { token: string; role: UserRole }[] = [
  { token: 'mock-token-learner', role: 'learner' },
  { token: 'mock-token-instructor', role: 'instructor' },
  { token: 'mock-token-admin', role: 'org_admin' },
  { token: 'mock-token-content-admin', role: 'content_admin' },
]

const roleBadge: Record<string, 'indigo' | 'green' | 'amber' | 'slate'> = {
  learner: 'indigo',
  instructor: 'green',
  org_admin: 'amber',
  content_admin: 'slate',
}

export function AppHeader() {
  const { user, token, signOut } = useAuthStore()
  const currentToken = token ?? localStorage.getItem('accessToken') ?? 'mock-token-learner'

  const handleDevUserSwitch = (newToken: string) => {
    if (newToken === currentToken) return
    const redirect = encodeURIComponent(window.location.href)
    window.location.href = `${getAuthAppUrl()}/dev-sync?token=${encodeURIComponent(newToken)}&redirect=${redirect}`
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">マナビューア</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user?.organization?.name ?? '東京学習高等学校'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {user?.name?.charAt(0) ?? '?'}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.name}</p>
              {user?.role && (
                <Badge color={roleBadge[user.role] ?? 'slate'}>{ROLE_LABELS[user.role] ?? user.role}</Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-600 dark:bg-slate-800">
            <GraduationCap className="hidden h-4 w-4 text-slate-400 sm:block" />
            <select
              className="bg-transparent text-sm text-slate-700 outline-none dark:text-slate-300"
              value={currentToken}
              onChange={(e) => handleDevUserSwitch(e.target.value)}
              aria-label="開発用ユーザー切替"
              title="開発用: ユーザーを切り替え（auth セッションも同期）"
            >
              {DEV_TOKENS.map((t) => (
                <option key={t.token} value={t.token}>
                  {ROLE_LABELS[t.role]}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            data-testid="logout-button"
            onClick={signOut}
            aria-label="ログアウト"
            title="ログアウト"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
