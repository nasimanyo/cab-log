// Zustandストア: アプリの状態管理を一元化する（開発ルール 8章）
// ログインなしでも利用可能なため、LocalStorageへの永続化をベースとし、
// Googleログイン時にはSupabaseとの同期を別サービス層(syncService)で行う。
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings, AppUser, WeekData } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'
import { getCurrentWeekNumber } from '@/utils/date'
import { generateId } from '@/utils/id'
import { createEmptyWeekPrices } from '@/types'

interface AppState {
  weeks: WeekData[]
  settings: AppSettings
  user: AppUser | null
  syncing: boolean
  lastSyncedAt: string | null

  // getters
  getCurrentWeek: () => WeekData
  getWeekById: (id: string) => WeekData | undefined

  // actions
  upsertWeek: (week: WeekData) => void
  deleteWeek: (id: string) => void
  setUser: (user: AppUser | null) => void
  updateSettings: (partial: Partial<AppSettings>) => void
  replaceAllWeeks: (weeks: WeekData[]) => void
  clearAllData: () => void
  setSyncing: (v: boolean) => void
  setLastSyncedAt: (v: string | null) => void
}

function createNewWeek(year: number, week: number): WeekData {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    userId: null,
    year,
    week,
    buyPrice: null,
    buyCount: null,
    prices: createEmptyWeekPrices(),
    prediction: null,
    createdAt: now,
    updatedAt: now
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      weeks: [],
      settings: DEFAULT_SETTINGS,
      user: null,
      syncing: false,
      lastSyncedAt: null,

      getCurrentWeek: () => {
        const { year, week } = getCurrentWeekNumber()
        const existing = get().weeks.find((w) => w.year === year && w.week === week)
        if (existing) return existing
        const created = createNewWeek(year, week)
        set((state) => ({ weeks: [...state.weeks, created] }))
        return created
      },

      getWeekById: (id: string) => get().weeks.find((w) => w.id === id),

      upsertWeek: (week: WeekData) => {
        set((state) => {
          const idx = state.weeks.findIndex((w) => w.id === week.id)
          if (idx === -1) {
            return { weeks: [...state.weeks, week] }
          }
          const next = [...state.weeks]
          next[idx] = week
          return { weeks: next }
        })
      },

      deleteWeek: (id: string) => {
        set((state) => ({ weeks: state.weeks.filter((w) => w.id !== id) }))
      },

      setUser: (user: AppUser | null) => set({ user }),

      updateSettings: (partial: Partial<AppSettings>) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),

      replaceAllWeeks: (weeks: WeekData[]) => set({ weeks }),

      clearAllData: () => set({ weeks: [], settings: DEFAULT_SETTINGS, user: null }),

      setSyncing: (v: boolean) => set({ syncing: v }),
      setLastSyncedAt: (v: string | null) => set({ lastSyncedAt: v })
    }),
    {
      name: 'kabunavi-storage',
      version: 1
    }
  )
)
