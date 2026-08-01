import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '@/components/Card'

interface FaqItem {
  q: string
  a: string
}

const FAQS: FaqItem[] = [
  { q: 'カブとは何ですか？', a: '「あつまれ どうぶつの森」に登場する野菜で、日曜日にウリに購入し、月〜土曜日にたぬき商店で売却して差益を得られる「カブ株市場」の対象商品です。' },
  { q: '価格はいつ変わりますか？', a: '月曜〜土曜の午前・午後の2回、価格が更新されます。日曜日は購入のみ可能です。' },
  { q: '予測はどのように行われますか？', a: '入力された価格から、過去の価格変動パターン（大型跳ね型・小型跳ね型・波型・減少型）の中で条件に合致するものをシミュレーションし、確率と今後の予想価格を算出しています。' },
  { q: '予測は必ず当たりますか？', a: 'いいえ。予測はあくまで統計的な参考値であり、ゲーム内の実際の抽選結果と完全に一致するとは限りません。' },
  { q: 'ログインしないと使えませんか？', a: 'ログインなしでも全ての基本機能をご利用いただけます。データはお使いの端末内に保存されます。Googleログインすると複数端末でデータを同期できます。' },
  { q: 'データが消えてしまいました', a: '設定画面の「JSONエクスポート」で定期的にバックアップを取ることをおすすめします。バックアップがあれば「JSONインポート」で復元できます。' }
]

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-bold text-lg">ヘルプ</h1>
        <Link to="/privacy-policy" className="text-sm text-brand-600 dark:text-brand-400 font-medium">
          プライバシー
        </Link>
      </div>

      <Card id="card-about-turnip" title="カブについて" icon="eco">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          カブは日曜日の午前中にウリからのみ購入できます。購入後、月曜日から土曜日にかけて午前・午後で価格が変動するため、
          高い時に売却することで利益を得られます。1週間放置すると腐ってしまうため注意が必要です。
        </p>
      </Card>

      <Card id="card-how-to-use" title="使い方" icon="menu_book">
        <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside">
          <li>日曜日に「価格入力」画面で購入価格・購入株数を入力します。</li>
          <li>月曜日以降、午前・午後の価格が判明するたびに入力します。</li>
          <li>ホーム画面で予測パターンと売り時アドバイスを確認します。</li>
          <li>最適なタイミングでたぬき商店にてカブを売却します。</li>
        </ol>
      </Card>

      <Card id="card-about-prediction" title="予測について" icon="query_stats">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          入力された価格から4つの価格変動パターン（大型跳ね型・小型跳ね型・波型・減少型）それぞれの発生確率をシミュレーションし、
          今後の予想価格レンジと最高予想価格を算出します。データが少ないほど予測の精度は下がります。
        </p>
      </Card>

      <Card id="card-faq" title="よくある質問" icon="help">
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {FAQS.map((item, idx) => (
            <div key={idx} className="py-2">
              <button
                className="w-full flex items-center justify-between text-left text-sm font-medium"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span>{item.q}</span>
                <span className="material-symbols-outlined text-gray-400 transition-transform" style={{ transform: openIndex === idx ? 'rotate(180deg)' : 'none' }}>
                  expand_more
                </span>
              </button>
              {openIndex === idx && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{item.a}</p>}
            </div>
          ))}
        </div>
      </Card>

      <Card id="card-contact" title="お問い合わせ" icon="mail">
        <div className="space-y-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            不具合報告・ご意見は下のフォームからお問い合わせいただけます。
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/contact" className="btn-secondary px-3 py-2 text-sm">
              <span className="material-symbols-outlined text-base">mail</span>
              お問い合わせフォーム
            </Link>
            <Link to="/privacy-policy" className="btn-secondary px-3 py-2 text-sm">
              <span className="material-symbols-outlined text-base">privacy_tip</span>
              プライバシーポリシー
            </Link>
            <Link to="/terms" className="btn-secondary px-3 py-2 text-sm">
              <span className="material-symbols-outlined text-base">gavel</span>
              利用規約
            </Link>
          </div>
        </div>
      </Card>

      <Card id="card-changelog" title="更新履歴" icon="update">
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>v1.1.2 - アプリ名を「cab-nabi」から「cab-log」に変更しました。それに従いurlも変更しました。</li>
          <li>v1.0.2 - 一部のユーザーでGoogleでのログインができない問題を修正しました。</li>
          <li>v1.0.1 - Googleでのログインができない問題を修正しました</li>
          <li>v1.0.0 - 初回リリース（ホーム・価格入力・履歴・設定・ヘルプ画面を実装）</li>
        </ul>
      </Card>
    </div>
  )
}
