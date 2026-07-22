// 日付・週番号関連ユーティリティ
import type { Weekday } from '@/types'

/** ISO週番号ではなく「日曜始まり」の週番号を年内で計算する（ゲーム内の週の考え方に合わせる） */
export function getWeekNumber(date: Date): { year: number; week: number } {
  const year = date.getFullYear()
  const jan1 = new Date(year, 0, 1)
  const jan1Weekday = jan1.getDay() // 0=日曜
  const daysSinceJan1 = Math.floor((date.getTime() - jan1.getTime()) / 86400000)
  const week = Math.floor((daysSinceJan1 + jan1Weekday) / 7) + 1
  return { year, week }
}

export function getCurrentWeekNumber(): { year: number; week: number } {
  return getWeekNumber(new Date())
}

/** JSのgetDay() (0=日,1=月...6=土) からWeekday型 or 'sunday' へ */
export function getTodayKey(): Weekday | 'sunday' {
  const day = new Date().getDay()
  const map: Record<number, Weekday | 'sunday'> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
  }
  return map[day]
}

/** 現在時刻が正午より前なら午前、以降は午後 */
export function getCurrentPeriod(): 'morning' | 'afternoon' {
  return new Date().getHours() < 12 ? 'morning' : 'afternoon'
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '---'
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '---'
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
