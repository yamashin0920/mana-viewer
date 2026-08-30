import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import { queryClient } from './lib/queryClient'
import { configureAuthClient } from '@mana/auth-client'
import { initTheme } from '@mana/ui'
import { useAuthStore } from './store/authStore'
import { ToastContainer } from './components/ui/Toast'
import './index.css'
import './styles/pdf.css'

configureAuthClient({
  authAppUrl: import.meta.env.VITE_AUTH_APP_URL || 'http://localhost:5180',
})

function Bootstrap() {
  const initAuth = useAuthStore((s) => s.init)
  const loading = useAuthStore((s) => s.loading)

  useEffect(() => {
    initTheme()
    initAuth()
  }, [initAuth])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
        読み込み中...
      </div>
    )
  }

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Bootstrap />
      <ToastContainer />
    </QueryClientProvider>
  </StrictMode>
)
