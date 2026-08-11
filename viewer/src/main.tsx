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

  useEffect(() => {
    initTheme()
    initAuth()
  }, [initTheme, initAuth])

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
