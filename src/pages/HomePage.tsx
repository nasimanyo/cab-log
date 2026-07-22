import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Card from '@/components/Card'
import PriceChart from '@/components/PriceChart'
import { weekService } from '@/services/weekService'
import { getSellAdvice, getBuyAdvice, getProfitSimulation } from '@/services/prediction/adapter'
import { getTodayKey, getCurrentPeriod, formatDateTime } from '@/utils/date'
import { PATTERN_LABEL, PERIOD_LABEL, WEEKDAY_LABEL } from '@/types'
import type { SellJudgement } from '@/types'

const JUDGEMENT_STYLE: Record<SellJudgement, { label: string; color: string; icon: string }> = {
  sell: { label: '売る', color: 'text-brand-700 bg-brand-100 dark:bg-brand-900/40 dark:text-brand-300', icon: 'sell' },
  wait: { label: '待つ', color: 'text-orange-700 bg-orange-100 dark:bg-orange-900/40 dark:text-orange-300', icon: 'schedule' },
  caution: { label: '注意', color: 'text-red-700 bg-red-100 dark:bg-red-900/40 dark:text-red-300', icon: 'warning' }
}

export default function HomePage() {
  const week = useMemo(() => weekService.getCurrentWeek(), [])
  const todayKey = getTodayKey()
  const period = getCurrentPeriod()

  const todayPrice = todayKey === 'sunday' ? week.buyPrice : week.prices[todayKey][period]

  const sellAdvice = getSellAdvice(todayPrice, week.buyPrice, week.prediction)
  const buyAdvice = getBuyAdvice(week.buyPrice)
  const profit = getProfitSimulation(todayPrice, week.buyPrice, week.buyCount)

  const judgementStyle = JUDGEMENT_STYLE[sellAdvice.judgement]

  return (
    <div className="space-y-4">
      {/* カード① 今週の情報 */}
      <Card id="card-week-info" title="今週の情報" icon="calendar_month">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <InfoItem label="購入価格" value={week.buyPrice !== null ? `${week.buyPrice} ベル` : '未入力'} />
          <InfoItem label="購入株数" value={week.buyCount !== null ? `${week.buyCount} 株` : '未入力'} />
          <InfoItem label="今日の価格" value={todayPrice !== null ? `${todayPrice} ベル` : '未入力'} highlight />
          <InfoItem label="最終更新日時" value={formatDateTime(week.updatedAt)} />
        </div>
      </Card>

      {/* カード② 予測 */}
      <Card id="card-prediction" title="価格予測" icon="query_stats">
        {week.prediction?.insufficientData ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">予測に必要なデータが不足しています。購入価格を入力してください。</p>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">現在の予測パターン</p>
              <p className="font-bold text-lg text-brand-700 dark:text-brand-400">
                {week.prediction?.mostLikelyPattern ? PATTERN_LABEL[week.prediction.mostLikelyPattern] : '---'}
              </p>
            </div>
            <div className="space-y-1.5">
              {week.prediction &&
                (Object.entries(week.prediction.probabilities) as [string, number][]).map(([pattern, prob]) => (
                  <div key={pattern} className="flex items-center gap-2 text-xs">
                    <span className="w-20 shrink-0 text-gray-600 dark:text-gray-400">{PATTERN_LABEL[pattern as keyof typeof PATTERN_LABEL]}</span>
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500" style={{ width: `${prob}%` }} />
                    </div>
                    <span className="w-10 text-right font-mono">{prob}%</span>
                  </div>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <InfoItem label="最高予想価格" value={week.prediction?.bestPrice !== null && week.prediction?.bestPrice !== undefined ? `${week.prediction.bestPrice} ベル` : '---'} />
              <InfoItem
                label="最高予想日時"
                value={
                  week.prediction?.bestDay && week.prediction?.bestPeriod
                    ? `${WEEKDAY_LABEL[week.prediction.bestDay]} ${PERIOD_LABEL[week.prediction.bestPeriod]}`
                    : '---'
                }
              />
            </div>
          </div>
        )}
      </Card>

      {/* グラフ */}
      <Card id="card-chart" title="価格推移グラフ" icon="show_chart">
        <PriceChart week={week} />
      </Card>

      {/* カード③ 売り時アドバイス */}
      <Card id="card-sell-advice" title="売り時アドバイス" icon="lightbulb">
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${judgementStyle.color}`}>
            <span className="material-symbols-outlined text-base">{judgementStyle.icon}</span>
            {judgementStyle.label}
          </span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{sellAdvice.reason}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          推奨タイミング: <span className="font-medium">{sellAdvice.recommendedTiming}</span>
        </p>
      </Card>

      {/* カード④ 買い時アドバイス（日曜日のみ表示） */}
      {todayKey === 'sunday' && (
        <Card id="card-buy-advice" title="買い時アドバイス" icon="storefront">
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`material-symbols-outlined text-2xl ${i < buyAdvice.stars ? 'text-accent-500' : 'text-gray-200 dark:text-gray-700'}`}
              >
                star
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{buyAdvice.comment}</p>
        </Card>
      )}

      {/* カード⑤ 利益シミュレーション */}
      <Card id="card-profit" title="利益シミュレーション" icon="payments">
        {profit ? (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">現在の利益</p>
              <p className={`font-bold text-lg ${profit.currentProfit >= 0 ? 'text-brand-600' : 'text-red-600'}`}>
                {profit.currentProfit.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">利益率</p>
              <p className={`font-bold text-lg ${profit.profitRate >= 0 ? 'text-brand-600' : 'text-red-600'}`}>{profit.profitRate}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">売却金額</p>
              <p className="font-bold text-lg">{profit.sellAmount.toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">購入価格・株数・今日の価格を入力すると表示されます。</p>
        )}
      </Card>

      <Link to="/input" id="go-to-input-btn" className="btn-primary w-full">
        <span className="material-symbols-outlined">edit</span>
        価格を入力する
      </Link>
    </div>
  )
}

function InfoItem({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`font-bold ${highlight ? 'text-brand-700 dark:text-brand-400 text-lg' : 'text-gray-800 dark:text-gray-200'}`}>{value}</p>
    </div>
  )
}
