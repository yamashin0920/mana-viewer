import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import { ToastContainer } from './components/ui/Toast'
import './index.css'
import './styles/pdf.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

function Bootstrap() {
  const initAuth = useAuthStore((s) => s.init)
  const initTheme = useThemeStore((s) => s.init)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)

  useEffect(() => {
    initTheme()
    initAuth()
  }, [initTheme, initAuth])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
        認証中...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-slate-100 text-red-600 dark:bg-slate-950">
        <p>{error}</p>
        <p className="text-sm text-slate-500">mock-api が起動しているか確認してください (port 3001)</p>
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
