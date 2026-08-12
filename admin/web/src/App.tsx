import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/AdminLayout'
import { AccountsPage } from './pages/AccountsPage'
import { ContentsPage } from './pages/ContentsPage'
import { LicensesPage } from './pages/LicensesPage'
import { LoginPage } from './pages/LoginPage'
import { useAuth } from './store/authStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { auth, isAdmin } = useAuth()
  if (!auth || !isAdmin) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export function App() {
  const { auth, logout, isAdmin } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={auth && isAdmin ? <Navigate to="/accounts" replace /> : <LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout user={auth?.user!} onLogout={logout} />
            </ProtectedRoute>
          }
        >
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="licenses" element={<LicensesPage />} />
          <Route path="contents" element={<ContentsPage />} />
          <Route index element={<Navigate to="/accounts" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/accounts" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
