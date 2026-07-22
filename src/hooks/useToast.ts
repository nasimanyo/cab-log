import { useCallback, useState } from 'react'
import type { ToastType } from '@/components/Toast'

interface ToastState {
  message: string
  type: ToastType
  key: number
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, key: Date.now() })
  }, [])

  const clearToast = useCallback(() => setToast(null), [])

  return { toast, showToast, clearToast }
}
