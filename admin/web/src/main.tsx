import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { configureAuthClient } from '@mana/auth-client'
import { initTheme } from '@mana/ui'
import { App } from './App'
import { queryClient } from './lib/queryClient'
import './index.css'

configureAuthClient({
  authAppUrl: import.meta.env.VITE_AUTH_APP_URL || 'http://localhost:5180',
})
initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
