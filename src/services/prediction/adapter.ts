/**
 * adapter.ts
 *
 * 予測結果(PredictionResult)を基に、アプリ側の責務である
 * 「売り時アドバイス」「買い時アドバイス」「利益シミュレーション」を生成する。
 *
 * カブ価予測アルゴリズム設計書 v1.0 - 6章「アプリ側の責務」に対応。
 * 将来的に予測アルゴリズム実装を差し替える場合も、本アダプター層のインターフェースは
 * 変更せずに済むよう分離している。
 */
import type { BuyAdvice, PredictionResult, ProfitSimulation, SellAdvice, Weekday, WeekPrices } from '@/types'
import { WEEKDAY_LABEL, PERIOD_LABEL } from '@/types'

/** 現在の曜日・時間帯における「今日の価格」を取得する */
export function getTodayPrice(prices: WeekPrices, today: Weekday | 'sunday', period: 'morning' | 'afternoon', buyPrice: number | null): number | null {
  if (today === 'sunday') return buyPrice
  return prices[today][period]
}

/** 売り時アドバイスを生成する */
export function getSellAdvice(currentPrice: number | null, buyPrice: number | null, prediction: PredictionResult | null): SellAdvice {
  if (currentPrice === null || buyPrice === null || !prediction || prediction.insufficientData) {
    return {
      judgement: 'wait',
      reason: '予測に必要なデータが不足しています。価格を入力すると判定できます。',
      recommendedTiming: '---'
    }
  }

  const { bestPrice, bestDay, bestPeriod, mostLikelyPattern } = prediction

  // 現在価格が既に最高予想価格に近い、または今が最高値の場合
  if (bestPrice !== null && currentPrice >= bestPrice * 0.95) {
    return {
      judgement: 'sell',
      reason: '現在の価格はこの先の予想最高値に近い水準です。今売るのがおすすめです。',
      recommendedTiming: '今すぐ'
    }
  }

  if (mostLikelyPattern === 'decreasing') {
    return {
      judgement: currentPrice >= buyPrice ? 'sell' : 'caution',
      reason: '減少型の可能性が高く、価格が下がる可能性があります。',
      recommendedTiming: currentPrice >= buyPrice ? '今すぐ' : '購入価格を下回る前に検討'
    }
  }

  if (bestPrice !== null && bestDay && bestPeriod) {
    const timing = `${WEEKDAY_LABEL[bestDay]} ${PERIOD_LABEL[bestPeriod]}`
    if (currentPrice < buyPrice) {
      return {
        judgement: 'wait',
        reason: `まだ購入価格を下回っています。${timing}頃に高値が期待できます。`,
        recommendedTiming: timing
      }
    }
    return {
      judgement: 'wait',
      reason: `今後さらに価格が上昇する可能性があります。${timing}頃が狙い目です。`,
      recommendedTiming: timing
    }
  }

  return {
    judgement: 'caution',
    reason: '価格の動向が不明瞭です。こまめに価格を確認しましょう。',
    recommendedTiming: '様子を見る'
  }
}

/** 買い時アドバイス（日曜日のみ表示） 過去傾向のかわりに簡易ヒューリスティックで評価 */
export function getBuyAdvice(buyPrice: number | null): BuyAdvice {
  if (buyPrice === null) {
    return { stars: 3, comment: '購入価格を入力すると評価が表示されます。' }
  }
  // 基本価格は90〜110の範囲。低いほど「買い」の期待値が高い傾向。
  if (buyPrice <= 95) {
    return { stars: 5, comment: 'かなり良い購入価格です！高騰が期待できます。' }
  }
  if (buyPrice <= 100) {
    return { stars: 4, comment: '良い購入価格です。' }
  }
  if (buyPrice <= 105) {
    return { stars: 3, comment: '平均的な購入価格です。' }
  }
  if (buyPrice <= 108) {
    return { stars: 2, comment: 'やや高めの購入価格です。' }
  }
  return { stars: 1, comment: '購入価格が高めです。無理して買う必要はありません。' }
}

/** 利益シミュレーション */
export function getProfitSimulation(currentPrice: number | null, buyPrice: number | null, buyCount: number | null): ProfitSimulation | null {
  if (currentPrice === null || buyPrice === null || buyCount === null) return null
  const sellAmount = currentPrice * buyCount
  const cost = buyPrice * buyCount
  const currentProfit = sellAmount - cost
  const profitRate = cost > 0 ? Math.round((currentProfit / cost) * 1000) / 10 : 0
  return { currentProfit, profitRate, sellAmount }
}
