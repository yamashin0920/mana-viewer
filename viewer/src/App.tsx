import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { BookshelfPage } from './pages/BookshelfPage'
import { LoginPage } from './pages/LoginPage'
import { ViewerPage } from './pages/ViewerPage'
import { useAuthStore } from './store/authStore'

function RootRedirect() {
  const user = useAuthStore((s) => s.user)
  return <Navigate to={user ? '/' : '/login'} replace />
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <BookshelfPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewer/:contentId"
          element={
            <ProtectedRoute>
              <ViewerPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
