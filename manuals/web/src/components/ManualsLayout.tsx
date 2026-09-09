import { NavLink, Outlet } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { MANUAL_PAGES } from '../catalog'
import { ThemeToggle } from './ThemeToggle'

export function ManualsLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row dark:bg-slate-950" data-testid="manuals-layout">
      <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white md:w-56 md:border-b-0 md:border-r dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">マナマニュアル</p>
            <p className="text-xs text-slate-500">操作手順（ログイン不要）</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-1 p-3 md:flex-1 md:flex-col md:flex-nowrap md:space-y-1 md:p-3" data-testid="manuals-nav">
          {MANUAL_PAGES.map((page) => (
            <NavLink
              key={page.slug}
              to={page.path}
              end={page.path === '/'}
              data-testid={`manuals-nav-${page.slug}`}
              className={({ isActive }) =>
                `flex items-center rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-100'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`
              }
            >
              {page.label}
            </NavLink>
          ))}
        </nav>
        <p className="hidden border-t border-slate-200 px-4 py-3 text-xs text-slate-400 md:block dark:border-slate-800">
          正本は <code>docs/manuals/</code>
        </p>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">操作マニュアル</h1>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-6" data-testid="manuals-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
