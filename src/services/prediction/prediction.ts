/**
 * prediction.ts
 *
 * 入力された観測価格(WeekPrices)から、モンテカルロ・シミュレーションにより
 * 各価格変動パターンの確率・今後の予想価格レンジ・最高予想価格を推定する。
 *
 * カブ価予測アルゴリズム設計書 v1.0:
 *  - 5. 処理タイミング: 価格入力時にリアルタイムで再実行
 *  - 6. アプリ側の責務: 入力データの整形/予測結果取得/エラーハンドリングを本サービス層で担当
 *  - 9. パフォーマンス: ブラウザ上で完結、不要な再計算をしない
 */
import type { ForecastSlot, Period, PredictionResult, PricePattern, Weekday, WeekPrices } from '@/types'
import { WEEKDAYS } from '@/types'
import { ALL_PATTERNS, generatePricesForPattern, SLOT_COUNT, RAW_PATTERN_TO_APP, type RawPattern } from './turnipCalculator'

/** シミュレーション回数(パターンごと)。多いほど精度が上がるが計算コストが増える */
const SIMULATIONS_PER_PATTERN = 2000

/** 観測値との許容誤差(丸め誤差対策) */
const TOLERANCE = 0

interface SlotObservation {
  index: number // 0-11
  day: Weekday
  period: Period
  price: number | null
}

function flattenObservations(prices: WeekPrices): SlotObservation[] {
  const result: SlotObservation[] = []
  let index = 0
  for (const day of WEEKDAYS) {
    for (const period of ['morning', 'afternoon'] as Period[]) {
      const price = prices[day][period]
      result.push({ index, day, period, price })
      index++
    }
  }
  return result
}

function matchesObservations(simulated: number[], observations: SlotObservation[]): boolean {
  for (const obs of observations) {
    if (obs.price === null) continue
    const simPrice = simulated[obs.index]
    if (Math.abs(simPrice - obs.price) > TOLERANCE) return false
  }
  return true
}

export interface PredictionInput {
  buyPrice: number | null
  prices: WeekPrices
}

const EMPTY_PROBS = (): Record<PricePattern, number> => ({
  large_spike: 0,
  small_spike: 0,
  fluctuating: 0,
  decreasing: 0
})

/**
 * カブ価予測を実行する。
 * 購入価格が未入力の場合は予測不能として insufficientData=true を返す。
 */
export function predict(input: PredictionInput): PredictionResult {
  const { buyPrice, prices } = input

  if (buyPrice === null || buyPrice <= 0) {
    return {
      probabilities: EMPTY_PROBS(),
      mostLikelyPattern: null,
      bestPrice: null,
      bestDay: null,
      bestPeriod: null,
      forecast: [],
      insufficientData: true
    }
  }

  const observations = flattenObservations(prices)
  const hasAnyObservation = observations.some((o) => o.price !== null)

  // マッチしたシミュレーション結果を集める
  const matchedByPattern: Record<RawPattern, number[][]> = { 0: [], 1: [], 2: [], 3: [] }
  const countByPattern: Record<RawPattern, number> = { 0: 0, 1: 0, 2: 0, 3: 0 }

  for (const pattern of ALL_PATTERNS) {
    for (let i = 0; i < SIMULATIONS_PER_PATTERN; i++) {
      const simulated = generatePricesForPattern(pattern, buyPrice)
      if (!hasAnyObservation || matchesObservations(simulated, observations)) {
        matchedByPattern[pattern].push(simulated)
        countByPattern[pattern]++
      }
    }
  }

  const totalMatched: number = ALL_PATTERNS.reduce((sum: number, p) => sum + countByPattern[p], 0)

  if (totalMatched === 0) {
    // 入力に矛盾がある、または極端に稀なケース: 不足データとして扱う
    return {
      probabilities: EMPTY_PROBS(),
      mostLikelyPattern: null,
      bestPrice: null,
      bestDay: null,
      bestPeriod: null,
      forecast: [],
      insufficientData: true
    }
  }

  const probabilities = EMPTY_PROBS()
  for (const pattern of ALL_PATTERNS) {
    const appPattern = RAW_PATTERN_TO_APP[pattern]
    probabilities[appPattern] = Math.round((countByPattern[pattern] / totalMatched) * 1000) / 10
  }

  let mostLikelyPattern: PricePattern | null = null
  let maxProb = -1
  for (const pattern of ALL_PATTERNS) {
    const appPattern = RAW_PATTERN_TO_APP[pattern]
    if (probabilities[appPattern] > maxProb) {
      maxProb = probabilities[appPattern]
      mostLikelyPattern = appPattern
    }
  }

  // 未入力のスロットについて、マッチした全シミュレーションから最小/最大/平均を集計
  const forecast: ForecastSlot[] = []
  let bestPrice: number | null = null
  let bestSlotIndex: number | null = null

  for (let slotIdx = 0; slotIdx < SLOT_COUNT; slotIdx++) {
    const obs = observations[slotIdx]
    if (obs.price !== null) continue // 既知の値はグラフ側で実測値として表示

    let min = Infinity
    let max = -Infinity
    let sum = 0
    let n = 0
    for (const pattern of ALL_PATTERNS) {
      for (const sim of matchedByPattern[pattern]) {
        const v = sim[slotIdx]
        if (v < min) min = v
        if (v > max) max = v
        sum += v
        n++
      }
    }
    if (n === 0) continue
    const avg = Math.round(sum / n)
    forecast.push({ day: obs.day, period: obs.period, minPrice: min, maxPrice: max, avgPrice: avg })

    if (bestPrice === null || max > bestPrice) {
      bestPrice = max
      bestSlotIndex = slotIdx
    }
  }

  const bestDay = bestSlotIndex !== null ? observations[bestSlotIndex].day : null
  const bestPeriod = bestSlotIndex !== null ? observations[bestSlotIndex].period : null

  return {
    probabilities,
    mostLikelyPattern,
    bestPrice,
    bestDay,
    bestPeriod,
    forecast,
    insufficientData: false
  }
}
