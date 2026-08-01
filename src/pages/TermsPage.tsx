import { Link } from 'react-router-dom'
import Card from '@/components/Card'

export default function TermsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-bold text-lg">利用規約</h1>
        <Link to="/help" className="text-sm text-brand-600 dark:text-brand-400 font-medium">
          ヘルプへ戻る
        </Link>
      </div>

      <Card id="terms-accept" title="規約への同意" icon="gavel">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          本アプリを利用する場合、以下の利用規約に同意したものとみなします。規約は予告なく更新される場合があります。
        </p>
      </Card>

      <Card id="terms-usage" title="利用ルール" icon="rule">
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-disc list-inside leading-relaxed">
          <li>本アプリはゲーム内の価格予測を補助するための参考情報です。</li>
          <li>ユーザーは、自己の責任において入力・閲覧・共有を行うものとします。</li>
          <li>不正アクセス、改ざん、悪用などの行為は禁止します。</li>
          <li>本アプリの内容を無断で複製・再配布することはできません。</li>
        </ul>
      </Card>

      <Card id="terms-liability" title="免責事項" icon="warning">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          予測結果や提供する情報について、利用によって生じた損害について、当方は一切の責任を負いません。あくまで参考情報としてご利用ください。
        </p>
      </Card>

      <Card id="terms-contact" title="お問い合わせ" icon="mail">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          規約に関するお問い合わせは、ヘルプ画面の「お問い合わせ」またはGitHub Issueよりお願いいたします。
        </p>
      </Card>
    </div>
  )
}
