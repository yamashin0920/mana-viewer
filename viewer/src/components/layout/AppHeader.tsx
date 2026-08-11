import { useAuthStore } from '../../store/authStore'

const DEV_TOKENS = [
  { token: 'mock-token-learner', label: '学習者' },
  { token: 'mock-token-instructor', label: '教員' },
  { token: 'mock-token-admin', label: '管理者' },
]

export function AppHeader() {
  const { user, signInWithToken } = useAuthStore()

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div>
          <p className="text-lg font-bold text-slate-900">manabu-kun</p>
          <p className="text-xs text-slate-500">
            {user?.organization?.name ?? '東京学習高等学校'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 sm:inline">{user?.name}</span>
          <select
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
            value={localStorage.getItem('accessToken') ?? 'mock-token-learner'}
            onChange={(e) => signInWithToken(e.target.value)}
          >
            {DEV_TOKENS.map((t) => (
              <option key={t.token} value={t.token}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}
