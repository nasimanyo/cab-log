import { Link } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { getCurrentWeekNumber } from '@/utils/date'

export default function Header() {
  const user = useAppStore((s) => s.user)
  const { year, week } = getCurrentWeekNumber()

  return (
    <header
      id="app-header"
      className="sticky top-0 z-20 bg-brand-600 text-white shadow-md"
    >
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl">eco</span>
          <span className="font-black text-lg tracking-tight">カブログ</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Link
            to="/help"
            className="inline-flex items-center justify-center rounded-full bg-white/15 px-2.5 py-1.5 font-medium transition hover:bg-white/25"
            title="ヘルプ"
          >
            <span className="material-symbols-outlined text-base">help</span>
          </Link>
          <span className="bg-white/15 rounded-full px-2.5 py-1 font-medium">
            {year}年 第{week}週
          </span>
          {user ? (
            <div className="flex items-center gap-1.5" title={user.displayName ?? user.email ?? ''}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="w-6 h-6 rounded-full border border-white/40" />
              ) : (
                <span className="material-symbols-outlined text-xl">account_circle</span>
              )}
            </div>
          ) : (
            <span className="material-symbols-outlined text-xl opacity-70" title="未ログイン">
              person_outline
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
