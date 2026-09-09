import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthGuard } from './components/auth/AuthGuard'
import { LmsLayout } from './components/LmsLayout'
import { ActivityPage } from './pages/ActivityPage'
import { CoursePage } from './pages/CoursePage'
import { CoursesPage } from './pages/CoursesPage'
import { useAuthStore } from './store/authStore'

function LmsShell() {
  const user = useAuthStore((s) => s.user)!
  const signOut = useAuthStore((s) => s.signOut)
  return <LmsLayout user={user} onLogout={signOut} />
}

function AppRoutes() {
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <AuthGuard>
      <Routes>
        <Route element={<LmsShell />}>
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CoursePage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/" element={<Navigate to="/courses" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/courses" replace />} />
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
