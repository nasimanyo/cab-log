import { Outlet } from 'react-router-dom'
import Header from '@/components/Header'
import FooterNav from '@/components/FooterNav'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4 pb-24">
        <Outlet />
      </main>
      <FooterNav />
    </div>
  )
}
