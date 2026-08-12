import { BookOpen, GraduationCap, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ThemeToggle } from '../ui/ThemeToggle'

const DEV_TOKENS = [
  { token: 'mock-token-learner', label: '学習者', role: 'learner' as const },
  { token: 'mock-token-instructor', label: '教員', role: 'instructor' as const },
  { token: 'mock-token-admin', label: '管理者', role: 'org_admin' as const },
]

const roleBadge: Record<string, 'indigo' | 'green' | 'amber'> = {
  learner: 'indigo',
  instructor: 'green',
  org_admin: 'amber',
}

const roleLabel: Record<string, string> = {
  learner: '学習者',
  instructor: '教員',
  org_admin: '管理者',
}

export function AppHeader() {
  const { user, signInWithToken, signOut } = useAuthStore()
  const currentToken = localStorage.getItem('accessToken') ?? 'mock-token-learner'

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
                <Badge color={roleBadge[user.role] ?? 'slate'}>{roleLabel[user.role] ?? user.role}</Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-600 dark:bg-slate-800">
            <GraduationCap className="hidden h-4 w-4 text-slate-400 sm:block" />
            <select
              className="bg-transparent text-sm text-slate-700 outline-none dark:text-slate-300"
              value={currentToken}
              onChange={(e) => signInWithToken(e.target.value)}
              aria-label="開発用ユーザー切替"
            >
              {DEV_TOKENS.map((t) => (
                <option key={t.token} value={t.token}>
                  {t.label}
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
