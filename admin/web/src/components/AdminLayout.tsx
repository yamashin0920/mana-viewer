import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BookOpen, KeyRound, LayoutDashboard, LogOut, Shield } from 'lucide-react'
import { Button } from './Button'
import { ThemeToggle } from './ThemeToggle'
import type { User } from '../types'

const navItems = [
  { to: '/accounts', label: 'アカウント', icon: KeyRound },
  { to: '/licenses', label: 'ライセンス', icon: Shield },
  { to: '/contents', label: 'コンテンツ', icon: BookOpen },
]

interface AdminLayoutProps {
  user: User
  onLogout: () => void
}

export function AdminLayout({ user, onLogout }: AdminLayoutProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">manabu-kun</p>
            <p className="text-xs text-slate-500">管理画面</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-100'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <p className="truncate px-3 text-xs font-medium text-slate-700 dark:text-slate-300">{user.name}</p>
          <p className="truncate px-3 text-xs text-slate-400">{user.email}</p>
          <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-3.5 w-3.5" />
            ログアウト
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">管理コンソール</h1>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
