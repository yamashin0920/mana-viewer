import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Loader2 } from 'lucide-react'
import { loginWithCredentials } from '../api/client'
import { Button } from '../components/Button'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../store/authStore'
import type { UserRole } from '../types'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!userId.trim() || !password.trim()) {
      setFormError('ID とパスワードを入力してください')
      return
    }

    setSubmitting(true)
    try {
      const res = await loginWithCredentials(userId, password)
      if (res.user.role !== 'org_admin' && res.user.role !== 'content_admin') {
        setFormError('管理者権限のあるアカウントでログインしてください')
        setSubmitting(false)
        return
      }
      login(res.accessToken, {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role as UserRole,
      })
      navigate('/accounts', { replace: true })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'ログインに失敗しました')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 dark:bg-slate-950">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg">
              <LayoutDashboard className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">manabu-kun 管理画面</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">アカウント・ライセンス・コンテンツの管理</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="admin-user-id" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  ユーザー ID
                </label>
                <input
                  id="admin-user-id"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  autoComplete="username"
                  placeholder="admin"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  パスワード
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="パスワード"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

              <Button type="submit" variant="primary" disabled={submitting} className="w-full justify-center py-2.5">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    ログイン中...
                  </>
                ) : (
                  '管理画面にログイン'
                )}
              </Button>
            </div>

            <p className="mt-4 text-center text-xs text-slate-400">開発用: admin / admin</p>
          </form>
        </div>
      </div>
    </div>
  )
}
