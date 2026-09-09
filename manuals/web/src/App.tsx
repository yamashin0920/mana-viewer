import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ManualsLayout } from './components/ManualsLayout'
import { ManualPage } from './pages/ManualPage'
import { MANUAL_PAGES } from './catalog'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ManualsLayout />}>
          {MANUAL_PAGES.map((page) => (
            <Route key={page.slug} path={page.path === '/' ? '/' : page.path} element={<ManualPage />} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
