import { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'

const HomePage = lazy(() => import('@/pages/HomePage'))
const InputPage = lazy(() => import('@/pages/InputPage'))
const HistoryListPage = lazy(() => import('@/pages/HistoryListPage'))
const HistoryDetailPage = lazy(() => import('@/pages/HistoryDetailPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const HelpPage = lazy(() => import('@/pages/HelpPage'))

function PageLoading() {
  return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/input" element={<InputPage />} />
            <Route path="/history" element={<HistoryListPage />} />
            <Route path="/history/:id" element={<HistoryDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
