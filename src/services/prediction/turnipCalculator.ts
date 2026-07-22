/**
 * turnipCalculator.ts
 *
 * 「あつまれ どうぶつの森」のカブ価変動パターン生成ロジック。
 *
 * 参考実装:
 *  - elxris/Turnip-Calculator (MIT License, Copyright (c) 2020 Christian Ceciliano)
 *    https://github.com/elxris/Turnip-Calculator
 *  - mikebryant/ac-nh-turnip-prices (Turnip Prophet) のリバースエンジニアリング結果
 *    (Treeki氏によるゲーム内RNGの解析: https://gist.github.com/Treeki/85be14d297c80c8b3c0a76375743325b)
 *
 * カブ価予測アルゴリズム設計書 v1.0 に基づき、予測ロジックは本ファイルに分離し、
 * 既存のオープンソース実装のアルゴリズム（4パターンの価格変動モデル）を参考に、
 * ブラウザ上で完結するTypeScript実装として書き直したもの。
 * ゲーム内部の擬似乱数(RNG)そのものではなくMath.random()による近似乱数を用いるため、
 * 実際のゲーム内抽選結果と完全に一致するものではないが、統計的な傾向は再現している。
 */

/** ゲーム内部で管理される4つの価格変動パターン（コード内部識別子） */
export type RawPattern = 0 | 1 | 2 | 3

/**
 * コード内部パターン番号とアプリの表示名(PricePattern)の対応
 *  0: 波型 (fluctuating)    - 高値・下降を繰り返す
 *  1: 大型跳ね型 (large_spike) - 下降後に非常に大きな一撃(最大6倍)の高騰
 *  2: 減少型 (decreasing)    - 一貫して下降し続ける
 *  3: 小型跳ね型 (small_spike) - 下降後に中規模(最大2倍)の高騰
 */
export const RAW_PATTERN_TO_APP: Record<RawPattern, 'fluctuating' | 'large_spike' | 'decreasing' | 'small_spike'> = {
  0: 'fluctuating',
  1: 'large_spike',
  2: 'decreasing',
  3: 'small_spike'
}

const randFloat = (a: number, b: number): number => a + Math.random() * (b - a)
const randInt = (min: number, max: number): number => Math.floor(randFloat(min, max + 1))
const randBool = (): boolean => Math.random() < 0.5
const ceil = (v: number): number => Math.ceil(v - 1e-9)

/** 12スロット = 月曜午前 〜 土曜午後 */
export const SLOT_COUNT = 12

/**
 * パターン0: 波型 (Fluctuating)
 * 「高値→下降→高値→下降→高値」を繰り返す
 */
function generatePattern0(basePrice: number): number[] {
  const prices: number[] = []
  const decPhaseLen1 = randBool() ? 3 : 2
  const decPhaseLen2 = 5 - decPhaseLen1
  const hiPhaseLen1 = randInt(0, 6)
  const hiPhaseLen2and3 = 7 - hiPhaseLen1
  const hiPhaseLen3 = randInt(0, hiPhaseLen2and3 - 1)

  for (let i = 0; i < hiPhaseLen1; i++) prices.push(ceil(randFloat(0.9, 1.4) * basePrice))

  let rate = randFloat(0.6, 0.8)
  for (let i = 0; i < decPhaseLen1; i++) {
    prices.push(ceil(rate * basePrice))
    rate -= 0.04 + randFloat(0, 0.06)
  }

  for (let i = 0; i < hiPhaseLen2and3 - hiPhaseLen3; i++) prices.push(ceil(randFloat(0.9, 1.4) * basePrice))

  rate = randFloat(0.6, 0.8)
  for (let i = 0; i < decPhaseLen2; i++) {
    prices.push(ceil(rate * basePrice))
    rate -= 0.04 + randFloat(0, 0.06)
  }

  for (let i = 0; i < hiPhaseLen3; i++) prices.push(ceil(randFloat(0.9, 1.4) * basePrice))

  return prices
}

/**
 * パターン1: 大型跳ね型 (Large Spike)
 * 下降後に最大6倍まで跳ね上がる
 */
function generatePattern1(basePrice: number): number[] {
  const prices: number[] = []
  const peakStart = randInt(3, 9)
  const decLen = peakStart - 2

  let rate = randFloat(0.85, 0.9)
  for (let i = 0; i < decLen; i++) {
    prices.push(ceil(rate * basePrice))
    rate -= 0.03 + randFloat(0, 0.02)
  }

  prices.push(ceil(randFloat(0.9, 1.4) * basePrice))
  prices.push(ceil(randFloat(1.4, 2.0) * basePrice))
  prices.push(ceil(randFloat(2.0, 6.0) * basePrice))
  prices.push(ceil(randFloat(1.4, 2.0) * basePrice))
  prices.push(ceil(randFloat(0.9, 1.4) * basePrice))

  while (prices.length < SLOT_COUNT) prices.push(ceil(randFloat(0.4, 0.9) * basePrice))

  return prices
}

/**
 * パターン2: 減少型 (Decreasing)
 * 一貫して下降し続ける
 */
function generatePattern2(basePrice: number): number[] {
  const prices: number[] = []
  let rate = 0.9 - randFloat(0, 0.05)
  for (let i = 0; i < SLOT_COUNT; i++) {
    prices.push(ceil(rate * basePrice))
    rate -= 0.03 + randFloat(0, 0.02)
  }
  return prices
}

/**
 * パターン3: 小型跳ね型 (Small Spike)
 * 下降後に最大2倍程度の中規模な高騰
 */
function generatePattern3(basePrice: number): number[] {
  const prices: number[] = []
  const peakStart = randInt(2, 9)
  const decLen = peakStart - 2

  let rate = randFloat(0.4, 0.9)
  for (let i = 0; i < decLen; i++) {
    prices.push(ceil(rate * basePrice))
    rate -= 0.03 + randFloat(0, 0.02)
  }

  prices.push(ceil(randFloat(0.9, 1.4) * basePrice))
  prices.push(ceil(randFloat(0.9, 1.4) * basePrice))
  const peakRate = randFloat(1.4, 2.0)
  prices.push(ceil(randFloat(1.4, peakRate) * basePrice) - 1)
  prices.push(ceil(peakRate * basePrice))
  prices.push(ceil(randFloat(1.4, peakRate) * basePrice) - 1)

  if (prices.length < SLOT_COUNT) {
    rate = randFloat(0.4, 0.9)
    while (prices.length < SLOT_COUNT) {
      prices.push(ceil(rate * basePrice))
      rate -= 0.03 + randFloat(0, 0.02)
    }
  }

  return prices
}

const GENERATORS: Record<RawPattern, (basePrice: number) => number[]> = {
  0: generatePattern0,
  1: generatePattern1,
  2: generatePattern2,
  3: generatePattern3
}

/**
 * 指定パターン・購入価格(basePrice)から12スロット分の価格をランダム生成する。
 */
export function generatePricesForPattern(pattern: RawPattern, basePrice: number): number[] {
  return GENERATORS[pattern](basePrice)
}

/** すべてのパターン(0〜3) */
export const ALL_PATTERNS: RawPattern[] = [0, 1, 2, 3]
