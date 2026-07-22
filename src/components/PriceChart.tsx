import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import type { WeekData } from '@/types'
import { WEEKDAYS, WEEKDAY_LABEL } from '@/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

interface PriceChartProps {
  week: WeekData
}

/** 実際の価格と予測レンジ(平均)を折れ線グラフで表示する（画面設計書 SCR-001 グラフ） */
export default function PriceChart({ week }: PriceChartProps) {
  const labels = ['日曜', ...WEEKDAYS.flatMap((d) => [`${WEEKDAY_LABEL[d].slice(0, 2)}前`, `${WEEKDAY_LABEL[d].slice(0, 2)}後`])]

  const actualData: (number | null)[] = [week.buyPrice]
  WEEKDAYS.forEach((d) => {
    actualData.push(week.prices[d].morning)
    actualData.push(week.prices[d].afternoon)
  })

  const forecastData: (number | null)[] = [null]
  let slotIdx = 0
  for (const d of WEEKDAYS) {
    for (const period of ['morning', 'afternoon'] as const) {
      const known = week.prices[d][period]
      if (known !== null) {
        forecastData.push(null)
      } else {
        const slot = week.prediction?.forecast.find((f) => f.day === d && f.period === period)
        forecastData.push(slot ? slot.avgPrice : null)
      }
      slotIdx++
    }
  }
  void slotIdx

  const data = {
    labels,
    datasets: [
      {
        label: '実際の価格',
        data: actualData,
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22,163,74,0.15)',
        spanGaps: true,
        tension: 0.25,
        pointRadius: 4,
        fill: false
      },
      {
        label: '予測価格(平均)',
        data: forecastData,
        borderColor: '#eab308',
        backgroundColor: 'rgba(234,179,8,0.15)',
        borderDash: [6, 4],
        spanGaps: true,
        tension: 0.25,
        pointRadius: 3,
        fill: false
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'top' as const, labels: { boxWidth: 12, font: { size: 11 } } }
    },
    scales: {
      x: { ticks: { font: { size: 10 } } },
      y: { beginAtZero: true, ticks: { font: { size: 10 } } }
    }
  }

  return (
    <div className="h-56">
      <Line data={data} options={options} />
    </div>
  )
}
