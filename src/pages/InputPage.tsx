import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/Card'
import Toast from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import { weekService } from '@/services/weekService'
import { priceService } from '@/services/priceService'
import { parsePriceInput, parseBuyCountInput } from '@/utils/validation'
import { AppError, WEEKDAYS, WEEKDAY_LABEL } from '@/types'
import type { WeekData, Weekday, Period } from '@/types'

export default function InputPage() {
  const navigate = useNavigate()
  const { toast, showToast, clearToast } = useToast()
  const [week, setWeek] = useState<WeekData>(() => weekService.getCurrentWeek())
  const [buyPriceText, setBuyPriceText] = useState(week.buyPrice?.toString() ?? '')
  const [buyCountText, setBuyCountText] = useState(week.buyCount?.toString() ?? '')
  const [priceTexts, setPriceTexts] = useState<Record<Weekday, { morning: string; afternoon: string }>>(() => {
    const init = {} as Record<Weekday, { morning: string; afternoon: string }>
    for (const d of WEEKDAYS) {
      init[d] = {
        morning: week.prices[d].morning?.toString() ?? '',
        afternoon: week.prices[d].afternoon?.toString() ?? ''
      }
    }
    return init
  })

  useEffect(() => {
    document.title = 'カブログ | 価格入力'
  }, [])

  const persistBuyPrice = useDebouncedCallback((text: string) => {
    try {
      const value = parsePriceInput(text)
      setWeek((prev) => priceService.updateBuyPrice(prev, value))
    } catch (e) {
      if (e instanceof AppError) showToast(e.message, 'error')
    }
  }, 500)

  const persistBuyCount = useDebouncedCallback((text: string) => {
    try {
      const value = parseBuyCountInput(text)
      setWeek((prev) => priceService.updateBuyCount(prev, value))
    } catch (e) {
      if (e instanceof AppError) showToast(e.message, 'error')
    }
  }, 500)

  const persistPrice = useDebouncedCallback((day: Weekday, period: Period, text: string) => {
    try {
      const value = parsePriceInput(text)
      setWeek((prev) => priceService.updatePrice(prev, day, period, value))
    } catch (e) {
      if (e instanceof AppError) showToast(e.message, 'error')
    }
  }, 500)

  const handleBuyPriceChange = (text: string) => {
    setBuyPriceText(text)
    persistBuyPrice(text)
  }
  const handleBuyCountChange = (text: string) => {
    setBuyCountText(text)
    persistBuyCount(text)
  }
  const handlePriceChange = (day: Weekday, period: Period, text: string) => {
    setPriceTexts((prev) => ({ ...prev, [day]: { ...prev[day], [period]: text } }))
    persistPrice(day, period, text)
  }

  const handleSave = () => {
    showToast('保存しました。', 'success')
  }

  const yearWeekLabel = useMemo(() => `${week.year}年 第${week.week}週`, [week.year, week.week])

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{yearWeekLabel} の価格を入力してください（0〜999、空欄可）</p>

      <Card id="card-sunday-input" title="日曜日" icon="storefront">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="購入価格" value={buyPriceText} onChange={handleBuyPriceChange} placeholder="例: 100" testId="input-buy-price" />
          <NumberField label="購入株数" value={buyCountText} onChange={handleBuyCountChange} placeholder="例: 40" testId="input-buy-count" />
        </div>
      </Card>

      {WEEKDAYS.map((day) => (
        <Card key={day} id={`card-input-${day}`} title={WEEKDAY_LABEL[day]} icon="calendar_today">
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="午前"
              value={priceTexts[day].morning}
              onChange={(v) => handlePriceChange(day, 'morning', v)}
              placeholder="---"
              testId={`input-${day}-morning`}
            />
            <NumberField
              label="午後"
              value={priceTexts[day].afternoon}
              onChange={(v) => handlePriceChange(day, 'afternoon', v)}
              placeholder="---"
              testId={`input-${day}-afternoon`}
            />
          </div>
        </Card>
      ))}

      <div className="flex gap-3 pt-2">
        <button id="save-btn" onClick={handleSave} className="btn-primary flex-1">
          <span className="material-symbols-outlined">save</span>
          保存
        </button>
        <button id="back-home-btn" onClick={() => navigate('/')} className="btn-secondary flex-1">
          <span className="material-symbols-outlined">home</span>
          ホームへ戻る
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
  testId
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  testId?: string
}) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{label}</span>
      <input
        id={testId}
        type="number"
        inputMode="numeric"
        min={0}
        max={999}
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}
