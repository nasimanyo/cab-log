import { useCallback, useEffect, useRef } from 'react'

/**
 * 入力の度に即時保存すると重くなるため、軽いdebounceを掛けて保存するためのフック。
 * SCR-002「入力時は自動保存」要件に対応。
 */
export function useDebouncedCallback<Args extends unknown[]>(fn: (...args: Args) => void, delay: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return useCallback(
    (...args: Args) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => fnRef.current(...args), delay)
    },
    [delay]
  )
}
