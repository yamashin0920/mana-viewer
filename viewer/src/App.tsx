import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthGuard } from './components/auth/AuthGuard'
import { BookshelfPage } from './pages/BookshelfPage'
import { ViewerPage } from './pages/ViewerPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AuthGuard>
              <BookshelfPage />
            </AuthGuard>
          }
        />
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
