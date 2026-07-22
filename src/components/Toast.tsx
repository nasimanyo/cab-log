import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
  duration?: number
}

const TYPE_STYLE: Record<ToastType, string> = {
  success: 'bg-brand-600',
  error: 'bg-red-600',
  info: 'bg-gray-800'
}

const TYPE_ICON: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info'
}

export default function Toast({ message, type = 'info', onClose, duration = 2500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div
      role="status"
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 ${TYPE_STYLE[type]} text-white px-4 py-3 rounded-btn shadow-lg flex items-center gap-2 max-w-[90vw] text-sm font-medium animate-[fadeIn_0.2s_ease-out]`}
    >
      <span className="material-symbols-outlined text-lg">{TYPE_ICON[type]}</span>
      <span>{message}</span>
    </div>
  )
}
