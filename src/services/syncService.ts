// Supabase設計書 v1.0: データ保存フロー（ゲスト利用→LocalStorage→Googleログイン→同期確認→Supabaseへ保存）
import type { WeekData } from '@/types'
import { AppError } from '@/types'
import { supabase, isSupabaseConfigured } from './supabase'
import { useAppStore } from '@/store/useAppStore'

interface WeekRow {
  id: string
  user_id: string
  year: number
  week: number
  buy_price: number | null
  buy_count: number | null
  prices_json: string
  created_at: string
  updated_at: string
}

function toRow(week: WeekData, userId: string): WeekRow {
  return {
    id: week.id,
    user_id: userId,
    year: week.year,
    week: week.week,
    buy_price: week.buyPrice,
    buy_count: week.buyCount,
    prices_json: JSON.stringify(week.prices),
    created_at: week.createdAt,
    updated_at: week.updatedAt
  }
}

function fromRow(row: WeekRow): WeekData {
  return {
    id: row.id,
    userId: row.user_id,
    year: row.year,
    week: row.week,
    buyPrice: row.buy_price,
    buyCount: row.buy_count,
    prices: JSON.parse(row.prices_json),
    prediction: null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export const syncService = {
  isAvailable(): boolean {
    return isSupabaseConfigured
  },

  /** ログイン後、ローカルデータとSupabaseのデータをマージ同期する */
  async syncAll(userId: string): Promise<void> {
    if (!supabase) return
    const store = useAppStore.getState()
    store.setSyncing(true)
    try {
      const { data, error } = await supabase.from('weeks').select('*').eq('user_id', userId)
      if (error) throw new AppError('DATA001', error.message)

      const remoteWeeks = (data as WeekRow[] | null)?.map(fromRow) ?? []
      const localWeeks = store.weeks

      const merged = new Map<string, WeekData>()
      for (const w of remoteWeeks) merged.set(w.id, w)
      for (const w of localWeeks) {
        const existing = merged.get(w.id)
        if (!existing || new Date(w.updatedAt) > new Date(existing.updatedAt)) {
          merged.set(w.id, { ...w, userId })
        }
      }

      const mergedWeeks = Array.from(merged.values())
      store.replaceAllWeeks(mergedWeeks)

      const rows = mergedWeeks.map((w) => toRow(w, userId))
      if (rows.length > 0) {
        const { error: upsertError } = await supabase.from('weeks').upsert(rows)
        if (upsertError) throw new AppError('DATA002', upsertError.message)
      }

      store.setLastSyncedAt(new Date().toISOString())
    } finally {
      store.setSyncing(false)
    }
  },

  async pushWeek(week: WeekData, userId: string): Promise<void> {
    if (!supabase) return
    const { error } = await supabase.from('weeks').upsert(toRow(week, userId))
    if (error) throw new AppError('DATA002', error.message)
  }
}
