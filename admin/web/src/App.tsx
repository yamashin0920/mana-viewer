import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AccessDeniedPage } from './components/auth/AccessDeniedPage'
import { AuthGuard } from './components/auth/AuthGuard'
import { AdminLayout } from './components/AdminLayout'
import { AccountsPage } from './pages/AccountsPage'
import { ContentsPage } from './pages/ContentsPage'
import { LicensesPage } from './pages/LicensesPage'
import { useAuthStore } from './store/authStore'
import { canAccessAdmin } from './utils/authorization'

function AdminShell() {
  const user = useAuthStore((s) => s.user)!
  const signOut = useAuthStore((s) => s.signOut)

  if (!canAccessAdmin(user)) {
    return <AccessDeniedPage />
  }

  return <AdminLayout user={user} onLogout={signOut} />
}

function AppRoutes() {
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <AuthGuard>
      <Routes>
        <Route element={<AdminShell />}>
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/licenses" element={<LicensesPage />} />
          <Route path="/contents" element={<ContentsPage />} />
          <Route path="/" element={<Navigate to="/accounts" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/accounts" replace />} />
      </Routes>
    </AuthGuard>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
