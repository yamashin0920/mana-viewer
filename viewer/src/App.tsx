import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BookshelfPage } from './pages/BookshelfPage'
import { ViewerPage } from './pages/ViewerPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BookshelfPage />} />
        <Route path="/viewer/:contentId" element={<ViewerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
