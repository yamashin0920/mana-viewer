import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthGuard } from './components/auth/AuthGuard'
import { BookshelfPage } from './pages/BookshelfPage'
import { ViewerPage } from './pages/ViewerPage'
import { useAuthStore } from './store/authStore'

function BookshelfRoute() {
  const token = useAuthStore((s) => s.token)
  return (
    <AuthGuard>
      <BookshelfPage key={token ?? 'anonymous'} />
    </AuthGuard>
  )
}

export function App() {
  return (
    <BrowserRouter>
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
