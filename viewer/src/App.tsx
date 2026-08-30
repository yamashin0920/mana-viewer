import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthGuard } from './components/auth/AuthGuard'
import { BookshelfPage } from './pages/BookshelfPage'
import { ViewerPage } from './pages/ViewerPage'
import { useAuthStore } from './store/authStore'
import { useOfflineSync } from './hooks/useOfflineSync'

function BookshelfRoute() {
  const token = useAuthStore((s) => s.token)
  return (
    <AuthGuard>
      <BookshelfPage key={token ?? 'anonymous'} />
    </AuthGuard>
  )
}

function OfflineSyncBridge() {
  const token = useAuthStore((s) => s.token)
  useOfflineSync(Boolean(token))
  return null
}

export function App() {
  return (
    <BrowserRouter>
      <OfflineSyncBridge />
      <Routes>
        <Route path="/" element={<BookshelfRoute />} />
        <Route
          path="/viewer/:contentId"
          element={
            <AuthGuard>
              <ViewerPage />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
