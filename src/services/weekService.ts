// API設計書 v1.0: getCurrentWeek / saveWeek / getHistory / deleteWeek に対応
import type { WeekData } from '@/types'
import { AppError } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { predictionService } from './predictionService'

export const weekService = {
  /** 7. getCurrentWeek: 現在週のデータ取得（存在しなければ新規作成） */
  getCurrentWeek(): WeekData {
    const week = useAppStore.getState().getCurrentWeek()
    return predictionService.attachPrediction(week)
  },

  /** 8. saveWeek: 週データ保存 */
  saveWeek(week: WeekData): WeekData {
    try {
      const updated: WeekData = { ...week, updatedAt: new Date().toISOString() }
      useAppStore.getState().upsertWeek(updated)
      return updated
    } catch {
      throw new AppError('DATA002')
    }
  },

  /** 10. getHistory: 履歴取得（新しい順） */
  getHistory(limit = 20, offset = 0): WeekData[] {
    const all = [...useAppStore.getState().weeks].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.week - a.week
    })
    return all.slice(offset, offset + limit)
  },

  getHistoryTotalCount(): number {
    return useAppStore.getState().weeks.length
  },

  getWeekById(id: string): WeekData | undefined {
    const week = useAppStore.getState().getWeekById(id)
    return week ? predictionService.attachPrediction(week) : undefined
  },

  /** 11. deleteWeek: 週データ削除（物理削除） */
  deleteWeek(id: string): void {
    try {
      useAppStore.getState().deleteWeek(id)
    } catch {
      throw new AppError('DATA003')
    }
  }
}
