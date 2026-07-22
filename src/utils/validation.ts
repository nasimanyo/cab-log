// バリデーションルール（画面設計書 SCR-002: 0〜999の数字、空欄可）
import { z } from 'zod'
import { AppError } from '@/types'

/** 価格入力: 0〜999の整数、または空欄(null) */
export const priceInputSchema = z
  .union([z.coerce.number().int().min(0).max(999), z.null(), z.nan()])
  .transform((v) => (v === null || Number.isNaN(v) ? null : v))

/** 購入株数: 1〜999程度の整数、空欄可 */
export const buyCountSchema = z
  .union([z.coerce.number().int().min(1).max(9999), z.null(), z.nan()])
  .transform((v) => (v === null || Number.isNaN(v) ? null : v))

export function parsePriceInput(raw: string): number | null {
  if (raw.trim() === '') return null
  const num = Number(raw)
  if (!Number.isFinite(num) || !Number.isInteger(num) || num < 0 || num > 999) {
    throw new AppError('DATA002', '0〜999の数字を入力してください。')
  }
  return num
}

export function parseBuyCountInput(raw: string): number | null {
  if (raw.trim() === '') return null
  const num = Number(raw)
  if (!Number.isFinite(num) || !Number.isInteger(num) || num < 1) {
    throw new AppError('DATA002', '1以上の数字を入力してください。')
  }
  return num
}

/** JSONエクスポート形式の検証スキーマ */
export const exportPayloadSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  settings: z.object({
    darkMode: z.boolean(),
    language: z.enum(['ja', 'en'])
  }),
  weeks: z.array(
    z.object({
      id: z.string(),
      userId: z.string().nullable(),
      year: z.number().int(),
      week: z.number().int(),
      buyPrice: z.number().int().nullable(),
      buyCount: z.number().int().nullable(),
      prices: z.record(
        z.string(),
        z.object({
          morning: z.number().nullable(),
          afternoon: z.number().nullable()
        })
      ),
      prediction: z.any().nullable(),
      createdAt: z.string(),
      updatedAt: z.string()
    })
  )
})
