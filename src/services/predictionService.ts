// カブ価予測アルゴリズム設計書 v1.0: 予測結果の取得をアプリ側から利用しやすい形で提供する
import type { WeekData } from '@/types'
import { predict } from './prediction/prediction'

export const predictionService = {
  /** WeekDataに対して予測を実行し、prediction フィールドを付与した新しいオブジェクトを返す */
  attachPrediction(week: WeekData): WeekData {
    const prediction = predict({ buyPrice: week.buyPrice, prices: week.prices })
    return { ...week, prediction }
  }
}
