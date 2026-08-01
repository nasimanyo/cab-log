import { Link } from 'react-router-dom'
import Card from '@/components/Card'

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-bold text-lg">プライバシーポリシー</h1>
        <Link to="/help" className="text-sm text-brand-600 dark:text-brand-400 font-medium">
          ヘルプへ戻る
        </Link>
      </div>

      <Card id="privacy-overview" title="基本方針" icon="privacy_tip">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          本アプリは、ユーザーのカブ価格予測や履歴管理を快適に利用していただくために、必要最小限の情報を取り扱います。
          取得した情報は、サービスの提供・改善・不具合対応・安全管理に利用します。
        </p>
      </Card>

      <Card id="privacy-collected-info" title="取得する情報" icon="storage">
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-disc list-inside leading-relaxed">
          <li>Googleログイン時に取得するメールアドレス・表示名・プロフィール画像</li>
          <li>入力したカブ価格・購入価格・株数・履歴データ</li>
          <li>設定内容（ダークモード、言語設定など）</li>
          <li>端末上で利用する一時的なデータ（ブラウザ保存データ）</li>
        </ul>
      </Card>

      <Card id="privacy-purpose" title="利用目的" icon="settings">
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-disc list-inside leading-relaxed">
          <li>予測・履歴表示・同期機能の提供</li>
          <li>不具合の確認・改善のための分析</li>
          <li>ユーザー認証およびサービスの安全な運用</li>
          <li>必要に応じたお問い合わせ対応</li>
        </ul>
      </Card>

      <Card id="privacy-storage" title="保存方法と第三者提供" icon="security">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          端末上のデータはブラウザのローカル保存機能に保存されます。Googleログインを利用する場合は、SupabaseおよびGoogle認証サービスを通じて必要な情報を取り扱います。取得した情報は、法令で認められる場合を除き、第三者へ提供しません。
        </p>
      </Card>

      <Card id="privacy-user-rights" title="ユーザーの権利" icon="manage_accounts">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          設定画面のエクスポート・インポート・全データ削除機能により、自身のデータの保存・復元・削除を行えます。ログイン中の場合は、Googleアカウント連携の解除によりサービス利用を停止できます。
        </p>
      </Card>

      <Card id="privacy-contact" title="お問い合わせ" icon="mail">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          本ポリシーに関するお問い合わせは、ヘルプ画面の「お問い合わせ」またはGitHub Issueよりお願いいたします。
        </p>
      </Card>
    </div>
  )
}
