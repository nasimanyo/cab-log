import { Fragment, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '@/components/Card'
import PriceChart from '@/components/PriceChart'
import { weekService } from '@/services/weekService'
import { getProfitSimulation } from '@/services/prediction/adapter'
import { WEEKDAYS, WEEKDAY_LABEL, PATTERN_LABEL } from '@/types'
import { formatDateTime } from '@/utils/date'

export default function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const week = useMemo(() => (id ? weekService.getWeekById(id) : undefined), [id])

  if (!week) {
    return (
      <Card id="card-not-found">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">データが見つかりませんでした。</p>
        <button className="btn-secondary w-full mt-2" onClick={() => navigate('/history')}>
          履歴一覧へ戻る
        </button>
      </Card>
    )
  }

  const observed = [week.buyPrice, ...Object.values(week.prices).flatMap((p) => [p.morning, p.afternoon])].filter(
    (v): v is number => v !== null
  )
  const maxObserved = observed.length > 0 ? Math.max(...observed) : null
  const maxForecast = week.prediction?.bestPrice ?? null
  const maxPrice = maxObserved !== null ? Math.max(maxObserved, maxForecast ?? 0) : maxForecast
  const lastKnown = observed.length > 0 ? observed[observed.length - 1] : null
  const profit = getProfitSimulation(lastKnown, week.buyPrice, week.buyCount)

  const handleDelete = () => {
    weekService.deleteWeek(week.id)
    navigate('/history')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-lg">
          {week.year}年 第{week.week}週 の詳細
        </h1>
        <button id="delete-week-btn" onClick={() => setConfirmDelete(true)} className="text-red-500 p-2">
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>

      <Card id="card-detail-summary" title="購入情報" icon="storefront">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <InfoItem label="購入価格" value={week.buyPrice !== null ? `${week.buyPrice} ベル` : '未入力'} />
          <InfoItem label="購入株数" value={week.buyCount !== null ? `${week.buyCount} 株` : '未入力'} />
          <InfoItem label="最高価格" value={maxPrice !== null ? `${maxPrice} ベル` : '---'} />
          <InfoItem label="更新日時" value={formatDateTime(week.updatedAt)} />
        </div>
      </Card>

      <Card id="card-detail-chart" title="価格推移グラフ" icon="show_chart">
        <PriceChart week={week} />
      </Card>

      <Card id="card-detail-prices" title="価格一覧" icon="table_chart">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="font-bold text-gray-500 dark:text-gray-400">曜日</div>
          <div className="font-bold text-gray-500 dark:text-gray-400 text-center">午前</div>
          <div className="font-bold text-gray-500 dark:text-gray-400 text-center">午後</div>
          {WEEKDAYS.map((day) => (
            <Fragment key={day}>
              <div className="py-1 border-t border-gray-100 dark:border-gray-700">{WEEKDAY_LABEL[day]}</div>
              <div className="py-1 border-t border-gray-100 dark:border-gray-700 text-center">{week.prices[day].morning ?? '---'}</div>
              <div className="py-1 border-t border-gray-100 dark:border-gray-700 text-center">{week.prices[day].afternoon ?? '---'}</div>
            </Fragment>
          ))}
        </div>
      </Card>

      <Card id="card-detail-result" title="予測結果" icon="query_stats">
        {week.prediction?.insufficientData ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">予測に必要なデータが不足していました。</p>
        ) : (
          <div className="space-y-2 text-sm">
            <InfoItem
              label="予測パターン"
              value={week.prediction?.mostLikelyPattern ? PATTERN_LABEL[week.prediction.mostLikelyPattern] : '---'}
            />
            <InfoItem label="売却価格(最終)" value={lastKnown !== null ? `${lastKnown} ベル` : '---'} />
            <InfoItem
              label="利益"
              value={profit ? `${profit.currentProfit >= 0 ? '+' : ''}${profit.currentProfit.toLocaleString()} ベル (${profit.profitRate}%)` : '---'}
            />
          </div>
        )}
      </Card>

      <button id="back-history-btn" onClick={() => navigate('/history')} className="btn-secondary w-full">
        <span className="material-symbols-outlined">arrow_back</span>
        履歴一覧へ戻る
      </button>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" role="dialog">
          <div className="bg-white dark:bg-gray-800 rounded-card p-5 max-w-sm w-full space-y-4">
            <p className="font-bold">このデータを削除しますか？</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button id="confirm-delete-btn" className="btn-danger flex-1" onClick={handleDelete}>
                削除する
              </button>
              <button id="cancel-delete-btn" className="btn-secondary flex-1" onClick={() => setConfirmDelete(false)}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
