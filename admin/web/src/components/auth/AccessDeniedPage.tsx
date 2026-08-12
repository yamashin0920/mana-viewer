import { ShieldX } from 'lucide-react'
import { Button } from '../Button'
import { useAuthStore } from '../../store/authStore'
import { ROLE_LABELS } from '../../types'

const VIEWER_URL = import.meta.env.VITE_VIEWER_URL || 'http://localhost:5173'

/** 認可エラー: ログイン済みだが管理画面へのアクセス権がない */
export function AccessDeniedPage() {
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 dark:bg-slate-950"
      data-testid="access-denied-page"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
          <ShieldX className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">アクセス権がありません</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          管理画面は組織管理者またはコンテンツ管理者のみ利用できます。
        </p>
        {user && (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            ログイン中: {user.name}（{ROLE_LABELS[user.role]}）
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="primary" onClick={() => { window.location.href = VIEWER_URL }}>
            ビューアへ
          </Button>
          <Button variant="secondary" onClick={signOut}>
            別のアカウントでログイン
          </Button>
        </div>
      </div>
    </div>
  )
}
