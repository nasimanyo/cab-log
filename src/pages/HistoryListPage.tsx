import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '@/components/Card'
import { weekService } from '@/services/weekService'
import { getProfitSimulation } from '@/services/prediction/adapter'
import { predictionService } from '@/services/predictionService'

const PAGE_SIZE = 20

export default function HistoryListPage() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const totalCount = weekService.getHistoryTotalCount()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const weeks = useMemo(() => weekService.getHistory(visibleCount, 0), [visibleCount, totalCount])

  return (
    <div className="space-y-4">
      <h1 className="font-bold text-lg">履歴一覧</h1>

      {weeks.length === 0 ? (
        <Card id="card-history-empty">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">まだ履歴がありません。価格を入力すると記録されます。</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {weeks.map((week) => {
            const withPrediction = predictionService.attachPrediction(week)
            // 「最高価格」= 実測値の最大値、無ければ予測の最大値
            const observed = [
              week.buyPrice,
              ...Object.values(week.prices).flatMap((p) => [p.morning, p.afternoon])
            ].filter((v): v is number => v !== null)
            const maxObserved = observed.length > 0 ? Math.max(...observed) : null
            const maxForecast = withPrediction.prediction?.bestPrice ?? null
            const maxPrice = maxObserved !== null ? Math.max(maxObserved, maxForecast ?? 0) : maxForecast

            const lastKnown = observed.length > 0 ? observed[observed.length - 1] : null
            const profit = getProfitSimulation(lastKnown, week.buyPrice, week.buyCount)

            return (
              <Link
                key={week.id}
                to={`/history/${week.id}`}
                className="card flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div>
                  <p className="font-bold text-sm">
                    {week.year}年 第{week.week}週
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    購入: {week.buyPrice !== null ? `${week.buyPrice}ベル` : '未入力'} / 最高: {maxPrice !== null ? `${maxPrice}ベル` : '---'}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${profit && profit.currentProfit >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
                    {profit ? `${profit.currentProfit >= 0 ? '+' : ''}${profit.currentProfit.toLocaleString()}` : '---'}
                  </p>
                  <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">chevron_right</span>
                </div>
              </Link>
            )
          })}

          {visibleCount < totalCount && (
            <button id="load-more-btn" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)} className="btn-secondary w-full">
              さらに読み込む
            </button>
          )}
        </div>
      )}
    </div>
  )
}
