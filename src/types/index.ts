// カブナビ（仮） 型定義
// データベース設計書・API設計書 v1.0 に基づく

/** 曜日（月〜土。日曜は購入価格のみのため別扱い） */
export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

export const WEEKDAYS: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  monday: '月曜日',
  tuesday: '火曜日',
  wednesday: '水曜日',
  thursday: '木曜日',
  friday: '金曜日',
  saturday: '土曜日'
}

/** 時間帯 */
export type Period = 'morning' | 'afternoon'

export const PERIOD_LABEL: Record<Period, string> = {
  morning: '午前',
  afternoon: '午後'
}

/** 価格変動パターン（画面設計書 3-4章） */
export type PricePattern = 'large_spike' | 'small_spike' | 'fluctuating' | 'decreasing'

export const PATTERN_LABEL: Record<PricePattern, string> = {
  large_spike: '大型跳ね型',
  small_spike: '小型跳ね型',
  fluctuating: '波型',
  decreasing: '減少型'
}

export const PATTERN_COLOR: Record<PricePattern, string> = {
  large_spike: '#dc2626',
  small_spike: '#ea580c',
  fluctuating: '#2563eb',
  decreasing: '#6b7280'
}

/** 1週間分の午前・午後価格（月〜土 x 2 = 12スロット、null = 未入力） */
export type WeekPrices = Record<Weekday, { morning: number | null; afternoon: number | null }>

export function createEmptyWeekPrices(): WeekPrices {
  return WEEKDAYS.reduce((acc, day) => {
    acc[day] = { morning: null, afternoon: null }
    return acc
  }, {} as WeekPrices)
}

/** 予測結果 */
export interface PredictionResult {
  /** 各パターンの確率（%） 合計はおおよそ100 */
  probabilities: Record<PricePattern, number>
  /** 最も可能性の高いパターン */
  mostLikelyPattern: PricePattern | null
  /** 最高予想価格 */
  bestPrice: number | null
  /** 最高予想曜日 */
  bestDay: Weekday | null
  /** 最高予想時間帯 */
  bestPeriod: Period | null
  /** 今後(現在時点以降)の予想価格レンジ一覧 */
  forecast: ForecastSlot[]
  /** 予測に必要なデータが不足している場合 true */
  insufficientData: boolean
}

export interface ForecastSlot {
  day: Weekday
  period: Period
  minPrice: number
  maxPrice: number
  avgPrice: number
}

/** 売り時判定 */
export type SellJudgement = 'sell' | 'wait' | 'caution'

export interface SellAdvice {
  judgement: SellJudgement
  reason: string
  recommendedTiming: string
}

/** 買い時アドバイス（日曜のみ表示） */
export interface BuyAdvice {
  stars: number // 1-5
  comment: string
}

/** 利益シミュレーション */
export interface ProfitSimulation {
  currentProfit: number
  profitRate: number
  sellAmount: number
}

/** 1週間分のデータ（weeks + prices + predictions の集約） */
export interface WeekData {
  id: string
  userId: string | null
  year: number
  week: number
  buyPrice: number | null
  buyCount: number | null
  prices: WeekPrices
  prediction: PredictionResult | null
  createdAt: string
  updatedAt: string
}

/** ログインユーザー情報 */
export interface AppUser {
  id: string
  displayName: string | null
  email: string | null
  avatarUrl: string | null
}

/** アプリ設定 */
export interface AppSettings {
  darkMode: boolean
  language: 'ja' | 'en'
}

export const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  language: 'ja'
}

/** エラーコード（API設計書 14章） */
export type ErrorCode =
  | 'AUTH001'
  | 'AUTH002'
  | 'DATA001'
  | 'DATA002'
  | 'DATA003'
  | 'FILE001'
  | 'NETWORK001'

export const ERROR_MESSAGE: Record<ErrorCode, string> = {
  AUTH001: 'ログインに失敗しました。',
  AUTH002: '認証の期限が切れました。再度ログインしてください。',
  DATA001: 'データの取得に失敗しました。',
  DATA002: 'データの保存に失敗しました。',
  DATA003: 'データの削除に失敗しました。',
  FILE001: 'JSONファイルの形式が正しくありません。',
  NETWORK001: '通信に失敗しました。'
}

export class AppError extends Error {
  code: ErrorCode
  constructor(code: ErrorCode, message?: string) {
    super(message ?? ERROR_MESSAGE[code])
    this.code = code
    this.name = 'AppError'
  }
}

/** JSONエクスポート/インポート形式 */
export interface ExportPayload {
  version: 1
  exportedAt: string
  settings: AppSettings
  weeks: WeekData[]
}
