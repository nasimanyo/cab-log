import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '@/components/Card'
import Toast from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import { useAppStore } from '@/store/useAppStore'
import { authService } from '@/services/authService'
import { syncService } from '@/services/syncService'
import { exportService } from '@/services/exportService'
import { AppError } from '@/types'

const APP_VERSION = '1.0.0'

export default function SettingsPage() {
  const { toast, showToast, clearToast } = useToast()
  const user = useAppStore((s) => s.user)
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const clearAllData = useAppStore((s) => s.clearAllData)
  const syncing = useAppStore((s) => s.syncing)
  const lastSyncedAt = useAppStore((s) => s.lastSyncedAt)

  const [confirmClear, setConfirmClear] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabaseAvailable = authService.isAvailable()

  const handleLogin = async () => {
    try {
      await authService.login()
    } catch (e) {
      if (e instanceof AppError) showToast(e.message, 'error')
    }
  }

  const handleLogout = async () => {
    await authService.logout()
    showToast('ログアウトしました。', 'success')
  }

  const handleSync = async () => {
    if (!user) return
    try {
      await syncService.syncAll(user.id)
      showToast('データ同期に成功しました。', 'success')
    } catch (e) {
      if (e instanceof AppError) showToast(e.message, 'error')
      else showToast('データ同期に失敗しました。', 'error')
    }
  }

  const handleExport = () => {
    exportService.exportData()
    showToast('JSONファイルを書き出しました。', 'success')
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const result = await exportService.importData(file)
      showToast(`読み込み完了: ${result.imported}件追加、${result.skipped}件スキップ`, 'success')
    } catch (err) {
      if (err instanceof AppError) showToast(err.message, 'error')
      else showToast('JSON形式エラー', 'error')
    }
  }

  const handleClearAll = () => {
    clearAllData()
    setConfirmClear(false)
    showToast('全データを削除しました。', 'success')
  }

  return (
    <div className="space-y-4">
      <h1 className="font-bold text-lg">設定</h1>

      {/* アカウント */}
      <Card id="card-account" title="アカウント" icon="account_circle">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {user.avatarUrl && <img src={user.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full" />}
              <div>
                <p className="font-bold text-sm">{user.displayName ?? 'ユーザー'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
            <button id="sync-btn" onClick={handleSync} disabled={syncing} className="btn-secondary w-full">
              <span className="material-symbols-outlined">{syncing ? 'sync' : 'cloud_sync'}</span>
              {syncing ? '同期中...' : 'データ同期'}
            </button>
            {lastSyncedAt && <p className="text-xs text-gray-400 text-center">前回同期: {new Date(lastSyncedAt).toLocaleString('ja-JP')}</p>}
            <button id="logout-btn" onClick={handleLogout} className="btn-secondary w-full">
              <span className="material-symbols-outlined">logout</span>
              ログアウト
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button id="login-btn" onClick={handleLogin} disabled={!supabaseAvailable} className="btn-primary w-full">
              <span className="material-symbols-outlined">login</span>
              Googleでログイン
            </button>
            {!supabaseAvailable && (
              <p className="text-xs text-gray-400 text-center">
                Supabase未設定のため現在ログインは利用できません。ゲストとしてローカルにデータが保存されます。
              </p>
            )}
          </div>
        )}
      </Card>

      {/* データ */}
      <Card id="card-data" title="データ" icon="database">
        <div className="space-y-2">
          <button id="export-btn" onClick={handleExport} className="btn-secondary w-full">
            <span className="material-symbols-outlined">download</span>
            JSONエクスポート
          </button>
          <button id="import-btn" onClick={handleImportClick} className="btn-secondary w-full">
            <span className="material-symbols-outlined">upload</span>
            JSONインポート
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
          <button id="clear-all-btn" onClick={() => setConfirmClear(true)} className="btn-danger w-full">
            <span className="material-symbols-outlined">delete_forever</span>
            全データ削除
          </button>
        </div>
      </Card>

      {/* 表示 */}
      <Card id="card-display" title="表示" icon="palette">
        <div className="flex items-center justify-between py-1">
          <span className="text-sm font-medium">ダークモード</span>
          <ToggleSwitch checked={settings.darkMode} onChange={(v) => updateSettings({ darkMode: v })} testId="dark-mode-toggle" />
        </div>
        <div className="flex items-center justify-between py-1 mt-2">
          <span className="text-sm font-medium">言語</span>
          <select
            id="language-select"
            value={settings.language}
            onChange={(e) => updateSettings({ language: e.target.value as 'ja' | 'en' })}
            className="input-field w-32 py-1.5"
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </div>
      </Card>

      {/* その他 */}
      <Card id="card-other" title="その他" icon="info">
        <ul className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
          <li className="py-2 flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">バージョン</span>
            <span className="font-medium">{APP_VERSION}</span>
          </li>
          <li className="py-2 flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">ライセンス</span>
            <span className="font-medium text-right text-xs text-gray-400 max-w-[60%]">
              カブ価予測ロジックは Turnip-Calculator (MIT License) を参考にしています
            </span>
          </li>
          <li className="py-2 flex justify-between items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">ヘルプ・法務</span>
            <div className="flex flex-wrap justify-end gap-2">
              <Link to="/help" className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                ヘルプ
              </Link>
              <Link to="/privacy-policy" className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                プライバシー
              </Link>
              <Link to="/terms" className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                利用規約
              </Link>
            </div>
          </li>
        </ul>
      </Card>

      {confirmClear && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" role="dialog">
          <div className="bg-white dark:bg-gray-800 rounded-card p-5 max-w-sm w-full space-y-4">
            <p className="font-bold">全データを削除しますか？</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">この操作は取り消せません。すべての履歴・設定が削除されます。</p>
            <div className="flex gap-3">
              <button id="confirm-clear-btn" className="btn-danger flex-1" onClick={handleClearAll}>
                削除する
              </button>
              <button id="cancel-clear-btn" className="btn-secondary flex-1" onClick={() => setConfirmClear(false)}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  )
}

function ToggleSwitch({ checked, onChange, testId }: { checked: boolean; onChange: (v: boolean) => void; testId?: string }) {
  return (
    <button
      id={testId}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}
