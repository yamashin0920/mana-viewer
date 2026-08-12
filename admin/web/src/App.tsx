import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/AdminLayout'
import { AccountsPage } from './pages/AccountsPage'
import { ContentsPage } from './pages/ContentsPage'
import { LicensesPage } from './pages/LicensesPage'
import { LoginPage } from './pages/LoginPage'
import { useAuth } from './store/authStore'

function AdminShell() {
  const { auth, logout, isAdmin } = useAuth()
  if (!auth || !isAdmin) {
    return <Navigate to="/login" replace />
  }
  return <AdminLayout user={auth.user} onLogout={logout} />
}

function LoginRoute() {
  const { auth, isAdmin } = useAuth()
  if (auth && isAdmin) {
    return <Navigate to="/accounts" replace />
  }
  return <LoginPage />
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route element={<AdminShell />}>
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/licenses" element={<LicensesPage />} />
          <Route path="/contents" element={<ContentsPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/accounts" replace />} />
        <Route path="*" element={<Navigate to="/accounts" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
