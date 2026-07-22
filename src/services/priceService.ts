// API設計書 v1.0: updatePrice に対応
// 処理: 価格保存 → 予測再計算 → 利益再計算 → 画面更新（呼び出し元のReact状態が自動更新される）
import type { Period, Weekday, WeekData } from '@/types'
import { weekService } from './weekService'

export const priceService = {
  updatePrice(week: WeekData, day: Weekday, period: Period, price: number | null): WeekData {
    const updatedPrices = {
      ...week.prices,
      [day]: { ...week.prices[day], [period]: price }
    }
    const updated: WeekData = { ...week, prices: updatedPrices }
    return weekService.saveWeek(updated)
  },

  updateBuyPrice(week: WeekData, buyPrice: number | null): WeekData {
    const updated: WeekData = { ...week, buyPrice }
    return weekService.saveWeek(updated)
  },

  updateBuyCount(week: WeekData, buyCount: number | null): WeekData {
    const updated: WeekData = { ...week, buyCount }
    return weekService.saveWeek(updated)
  }
}
