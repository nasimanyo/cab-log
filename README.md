# カブナビ（仮）

## プロジェクト概要
- **名前**: カブナビ（仮）
- **ジャンル**: Webアプリケーション（PWA的な使い方も想定）
- **対応ゲーム**: あつまれ どうぶつの森
- **目的**: 「あつまれ どうぶつの森」のカブ価を記録し、入力された価格から今後の価格を予測して、ユーザーへ最適な売却タイミング・購入判断を提供する。

開発者向け仕様書 v1.0（プロジェクト概要／画面設計書／API設計書／カブ価予測アルゴリズム設計書／Supabase設計書）に基づいて実装しています。

## URLs
- **開発中プレビュー**: サンドボックス起動時に付与されるURL（`GetServiceUrl`で取得）
- **本番(未デプロイ)**: デプロイ実行後にここへ追記します
- **GitHub**: 未接続（`setup_github_environment` 実行後にリポジトリを接続してください）

## 現在完了している機能

### 画面（画面設計書 v1.0 準拠）
| 画面ID | 画面名 | 状態 |
|---|---|---|
| SCR-001 | ホーム（今週の情報／予測／グラフ／売り時アドバイス／買い時アドバイス／利益シミュレーション） | ✅ 実装済み |
| SCR-002 | 価格入力（日曜:購入価格・購入株数／月〜土:午前午後価格、自動保存） | ✅ 実装済み |
| SCR-003 | 履歴一覧（新しい順、20件ずつ追加読み込み） | ✅ 実装済み |
| SCR-004 | 履歴詳細（価格一覧・グラフ・予測結果・削除） | ✅ 実装済み |
| SCR-005 | 設定（ログイン/ログアウト・データ同期・JSONエクスポート/インポート・全データ削除・ダークモード・言語） | ✅ 実装済み |
| SCR-006 | ヘルプ（カブについて・使い方・予測について・FAQ・お問い合わせ・更新履歴） | ✅ 実装済み |

### 主要機能
- ✅ カブ価予測アルゴリズム（モンテカルロ・シミュレーションによる4パターン分類: 大型跳ね型・小型跳ね型・波型・減少型）
- ✅ 入力値検証（0〜999、空欄可、自動保存、debounce付き）
- ✅ 売り時アドバイス（売る／待つ／注意の3段階判定 + 理由 + 推奨タイミング）
- ✅ 買い時アドバイス（日曜のみ表示、★評価）
- ✅ 利益シミュレーション（現在売った場合の利益・利益率・売却金額）
- ✅ 折れ線グラフ（実際の価格 + 予測価格、Chart.js）
- ✅ ログインなしでも全機能利用可能（LocalStorage永続化、Zustand persist）
- ✅ Googleログイン + Supabaseデータ同期（環境変数未設定時は自動でゲストモードにフォールバック）
- ✅ JSONエクスポート / インポート（形式チェック・重複確認付き）
- ✅ ダークモード / 言語設定
- ✅ レスポンシブ対応（360px〜1440px、モバイルファースト）
- ✅ コード分割による初期ロード最適化（ページ単位のlazy import）

### 品質
- ✅ TypeScript型定義必須・`any`型禁止（ESLintルールで強制）
- ✅ ESLintエラー・警告 0件
- ✅ TypeScriptエラー 0件（`tsc --noEmit`）
- ✅ ブラウザコンソール Error / Warning 0件（Playwrightで確認済み）

## 実装していない機能（今後の拡張予定）
仕様書「今後追加予定」「将来対応」「将来追加予定」に記載の項目：
- 通知画面 / ランキング画面 / フレンド共有画面 / AI分析画面 / 統計画面
- 匿名ログイン / Appleログイン
- Realtime同期 / Storage(画像保存) / Push通知 / Edge Functions
- フレンド共有API / ランキングAPI / 通知API / AI分析API / 統計API / イベントAPI

## 推奨される次のステップ（Vercel + Supabase構成）
1. ✅ Supabaseプロジェクト作成済み（`https://lasqowkvavsgrhtcwhum.supabase.co`）、接続確認済み
2. ⬜ **`supabase/migrations/0001_init.sql` をSupabase SQL Editorで実行**（`users`/`weeks`テーブル + RLS設定）— 未実行の場合、ログイン後のデータ同期は失敗します
3. ⬜ Supabase Authentication → Providers で **Google OAuth を有効化**（Client ID/Secretを設定し、Redirect URLにVercel本番URLを追加）
4. ⬜ **Vercelにデプロイ**:
   - GitHubリポジトリをVercelにインポート（`vercel.json`設定済み、Framework Preset: Vite）
   - Vercelの環境変数に以下を設定:
     - `VITE_SUPABASE_URL` = `https://lasqowkvavsgrhtcwhum.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = (Supabaseのanon key)
   - Build Command: `npm run build` / Output Directory: `dist`
5. ⬜ Supabase Authentication → URL Configuration で Site URL / Redirect URLs にVercel本番URLを追加
6. ⬜ 実機（スマートフォン）での動作確認・Lighthouseスコア測定

## データ構造・データモデル

### 保存先
- **既定（ゲストモード）**: ブラウザの LocalStorage（Zustand `persist` ミドルウェアで自動永続化、キー: `kabunavi-storage`）
- **ログイン時（オプション）**: Supabase PostgreSQL（`users` / `weeks` テーブル）へ同期。RLSで本人のみ読み書き可能。

### 主要な型（`src/types/index.ts`）
- `WeekData`: 1週間分のデータ（購入価格・購入株数・12スロットの価格・予測結果）
- `WeekPrices`: 月〜土 × 午前/午後 の価格（null=未入力）
- `PredictionResult`: 予測パターンごとの確率・最高予想価格・今後の予想価格レンジ
- `AppUser` / `AppSettings` / `ExportPayload`

### Supabaseテーブル（`supabase/migrations/0001_init.sql`）
- `users(id, display_name, created_at)` — Supabase Authのユーザーに対応
- `weeks(id, user_id, year, week, buy_price, buy_count, prices_json, created_at, updated_at)` — 価格・予測はJSONBで保持し、テーブル数を抑えた簡易構成

## 予測アルゴリズムについて
`src/services/prediction/` に分離実装（カブ価予測アルゴリズム設計書 v1.0 の方針に準拠）：
- `turnipCalculator.ts`: 4つの価格変動パターンの価格系列生成ロジック
- `prediction.ts`: モンテカルロ・シミュレーションによる確率推定・予想レンジ算出
- `adapter.ts`: 売り時／買い時アドバイス・利益シミュレーションへの変換（アプリ側の責務）

**参考にしたオープンソース実装**:
- [elxris/Turnip-Calculator](https://github.com/elxris/Turnip-Calculator) (MIT License, Copyright (c) 2020 Christian Ceciliano)
- ゲーム内RNGの解析結果（[Treeki氏によるgist](https://gist.github.com/Treeki/85be14d297c80c8b3c0a76375743325b)）

ゲーム内部の擬似乱数(RNG)そのものではなくブラウザの`Math.random()`を用いた近似実装のため、統計的傾向は再現していますが、実際のゲーム内抽選結果と完全一致するものではありません。

## 技術スタック
| カテゴリ | 技術 |
|---|---|
| フロントエンド | React 18 + TypeScript + Vite |
| CSS | Tailwind CSS |
| 状態管理 | Zustand (persist middleware) |
| バリデーション | Zod |
| グラフ | Chart.js (react-chartjs-2) |
| ルーティング | React Router (HashRouter) |
| バックエンド(オプション) | Supabase (PostgreSQL / Authentication / Row Level Security) |
| デプロイ | Cloudflare Pages（Vercelの代替として、静的SPAをそのままホスティング） |
| バージョン管理 | GitHub |

## ディレクトリ構成
```
src/
├── components/    # Header, FooterNav, Card, Toast, PriceChart など共通UI
├── pages/         # HomePage, InputPage, HistoryListPage, HistoryDetailPage, SettingsPage, HelpPage
├── layouts/        # MainLayout（ヘッダー・フッターナビ）
├── hooks/         # useToast, useDebouncedCallback
├── services/
│   ├── prediction/    # turnipCalculator.ts, prediction.ts, adapter.ts
│   ├── supabase.ts    # Supabaseクライアント初期化
│   ├── authService.ts
│   ├── weekService.ts
│   ├── priceService.ts
│   ├── predictionService.ts
│   ├── syncService.ts
│   └── exportService.ts
├── store/         # useAppStore (Zustand)
├── types/         # 型定義
├── utils/         # validation.ts, date.ts, id.ts
├── App.tsx
└── main.tsx
supabase/
└── migrations/0001_init.sql   # DBスキーマ・RLS設定
```

## ユーザーガイド
1. トップページ（ホーム）で今週のカブ価状況を確認できます。
2. フッターの「入力」から日曜日の購入価格・購入株数、月〜土曜の午前・午後価格を入力します（入力すると自動保存されます）。
3. ホーム画面に戻ると、価格予測パターン・売り時アドバイス・利益シミュレーションが自動更新されます。
4. 「履歴」から過去の週のデータを確認できます。
5. 「設定」からGoogleログイン（Supabase設定時のみ）、ダークモード切替、JSONエクスポート/インポート、全データ削除が可能です。
6. ログインしなくても全機能が利用できます。データは端末内に保存されます。

## デプロイ
- **プラットフォーム**: Vercel（ユーザー自身のアカウントでデプロイ）
- **バックエンド**: Supabase（`https://lasqowkvavsgrhtcwhum.supabase.co`、接続確認済み）
- **ステータス**: ⚠️ ローカルプレビュー・Supabase接続確認済み。Vercel本番デプロイ・DBマイグレーション適用・Google OAuth設定は未実行（上記「推奨される次のステップ」参照）
- **デプロイ方法**: GitHubリポジトリをVercelにインポート → 環境変数設定 → 自動デプロイ（`vercel.json`設定済み）
- **最終更新**: 2026-07-22
