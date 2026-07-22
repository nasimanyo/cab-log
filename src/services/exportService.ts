// API設計書 v1.0: exportData / importData に対応
import type { ExportPayload } from '@/types'
import { AppError } from '@/types'
import { exportPayloadSchema } from '@/utils/validation'
import { useAppStore } from '@/store/useAppStore'

const FILE_NAME = 'kabunavi_backup.json'

export const exportService = {
  /** 12. exportData: JSONとして保存 */
  exportData(): void {
    const state = useAppStore.getState()
    const payload: ExportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: state.settings,
      weeks: state.weeks
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = FILE_NAME
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },

  /** 13. importData: JSON読込 (形式チェック → 重複確認 → データ保存) */
  async importData(file: File): Promise<{ imported: number; skipped: number }> {
    let json: unknown
    try {
      const text = await file.text()
      json = JSON.parse(text)
    } catch {
      throw new AppError('FILE001')
    }

    const parseResult = exportPayloadSchema.safeParse(json)
    if (!parseResult.success) {
      throw new AppError('FILE001')
    }

    const payload = parseResult.data
    const state = useAppStore.getState()
    const existingIds = new Set(state.weeks.map((w) => w.id))

    let imported = 0
    let skipped = 0
    const merged = [...state.weeks]

    for (const week of payload.weeks) {
      if (existingIds.has(week.id)) {
        skipped++
        continue
      }
      merged.push(week as unknown as (typeof state.weeks)[number])
      imported++
    }

    state.replaceAllWeeks(merged)
    state.updateSettings(payload.settings)

    return { imported, skipped }
  }
}
