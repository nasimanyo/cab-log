import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { useAppStore } from '@/store/useAppStore'
import { authService } from '@/services/authService'
import { syncService } from '@/services/syncService'

// ダークモード初期反映
const applyDarkMode = () => {
  const darkMode = useAppStore.getState().settings.darkMode
  document.documentElement.classList.toggle('dark', darkMode)
}
applyDarkMode()
useAppStore.subscribe(applyDarkMode)

// 認証状態の初期化
// (OAuthリダイレクト直後のURL上のトークンをSupabaseクライアントが検出・セッション化し、
//  ログイン済みならデータ同期まで行う。SettingsPageの遅延読み込みを待たず、起動時に必ず実行する)
if (authService.isAvailable()) {
  authService.getCurrentUser()
  authService.onAuthStateChange((user) => {
    useAppStore.getState().setUser(user)
    if (user) {
      syncService.syncAll(user.id).catch((e) => console.error('自動同期に失敗しました', e))
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
