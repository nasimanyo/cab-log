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
const SIMULATIONS_PER_PATTERN = 5000

/** 観測値との許容誤差(丸め誤差対策) */
const TOLERANCE = 0

interface SimulationCandidate {
  simulation: number[]
  weight: number
}

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

function scoreSimulation(simulated: number[], observations: SlotObservation[], buyPrice: number): number {
  let score = 1
  const priceScale = Math.max(80, buyPrice * 0.25)

  const knownObservations = observations.filter((obs) => obs.price !== null)
  for (const obs of knownObservations) {
    const simPrice = simulated[obs.index]
    const observedPrice = obs.price as number
    const diff = Math.abs(simPrice - observedPrice)
    if (diff <= TOLERANCE) {
      score *= 1.35
      continue
    }

    const normalizedDiff = diff / priceScale
    score *= Math.exp(-(normalizedDiff * normalizedDiff) * 2.5)
  }

  if (knownObservations.length >= 2) {
    for (let i = 1; i < knownObservations.length; i++) {
      const prev = knownObservations[i - 1]
      const curr = knownObservations[i]
      const prevSim = simulated[prev.index]
      const currSim = simulated[curr.index]
      const observedDelta = (curr.price as number) - (prev.price as number)
      const simulatedDelta = currSim - prevSim

      if ((observedDelta > 0 && simulatedDelta > 0) || (observedDelta < 0 && simulatedDelta < 0)) {
        score *= 1.08
      } else if (observedDelta !== 0 && simulatedDelta !== 0) {
        score *= 0.92
      }
    }
  }

  return Math.max(1e-6, score)
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

  // 観測価格にどれだけ近いかをスコアリングし、重み付きでパターン確率を算出する
  const matchedByPattern: Record<RawPattern, SimulationCandidate[]> = { 0: [], 1: [], 2: [], 3: [] }
  const weightByPattern: Record<RawPattern, number> = { 0: 0, 1: 0, 2: 0, 3: 0 }

  for (const pattern of ALL_PATTERNS) {
    for (let i = 0; i < SIMULATIONS_PER_PATTERN; i++) {
      const simulated = generatePricesForPattern(pattern, buyPrice)
      const weight = hasAnyObservation ? scoreSimulation(simulated, observations, buyPrice) : 1
      matchedByPattern[pattern].push({ simulation: simulated, weight })
      weightByPattern[pattern] += weight
    }
  }

  const totalMatched: number = ALL_PATTERNS.reduce((sum: number, p) => sum + weightByPattern[p], 0)

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
    probabilities[appPattern] = Math.round((weightByPattern[pattern] / totalMatched) * 1000) / 10
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
    let weightedSum = 0
    let totalWeight = 0
    for (const pattern of ALL_PATTERNS) {
      for (const candidate of matchedByPattern[pattern]) {
        const v = candidate.simulation[slotIdx]
        if (v < min) min = v
        if (v > max) max = v
        weightedSum += v * candidate.weight
        totalWeight += candidate.weight
      }
    }
    if (totalWeight === 0) continue
    const avg = Math.round(weightedSum / totalWeight)
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
