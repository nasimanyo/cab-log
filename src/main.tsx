import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { useAppStore } from '@/store/useAppStore'

// ダークモード初期反映
const applyDarkMode = () => {
  const darkMode = useAppStore.getState().settings.darkMode
  document.documentElement.classList.toggle('dark', darkMode)
}
applyDarkMode()
useAppStore.subscribe(applyDarkMode)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
