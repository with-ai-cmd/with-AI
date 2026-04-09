---
name: 請求自動化プロジェクト
description: CTO管轄の請求自動化システム構築プロジェクト。Notion連携・GMO銀行API・Gmail送信の一気通貫自動化。
type: project
---

## 請求自動化システム（business-automation/）

CTOプロジェクトの一つとして進行中。秘書AI配下のCTO役割で推進。

### 概要
月末請求業務を自動化するシステム。Notion クライアントDB → 請求書PDF生成 → Gmail送信 → GMO銀行API入金照合 → Slack通知。

### 現在のステータス（2026-04-03時点）
- **コード実装**: 完了（dry_run動作確認済み、テスト26件パス）
- **Notion連携**: 完了（請求管理DB作成済み、クライアントDBとリレーション接続済み）
- **GMO銀行API申請**: ヒアリングシート記入済み・返送メール下書き作成済み（審査待ち）
- **Gmail API**: サービスアカウント未設定（credentials/google_service_account.json が必要）
- **config.yaml**: 会社情報・口座情報は反映済み。インボイス登録番号・Slack Webhook URLは未設定。

### GMO銀行API進捗
- 担当: 小林祐輝（y-kobayashi@gmo-aozora.com）
- アクセス種別: プライベート参照系
- バーチャル口座（振込入金口座）の利用も検討中と伝達済み
- **Why:** バーチャル口座は初期費用・月額すべて0円。振込名義の揺れに関係なく自動照合できる。
- **How to apply:** 審査通過後 → API契約 → 開発環境接続 → OAuth2対応改修 → 接続試験 → 本番。参考スケジュール: 事務1ヶ月 + 開発1ヶ月 + 試験1ヶ月。

### 技術構成
- Python 3.14 / venv（business-automation/.venv/）
- WeasyPrint（PDF生成）、Jinja2、PyYAML、google-api-python-client
- 3エージェント構成: invoice-agent / sender-agent / payment-agent

### Notion DB構成
- コンタクト（人脈DB）: 326d725a-9f17-81cd-82a9-d0c9fd8873eb
- クライアントDB: 326d725a-9f17-8110-a412-eb9ae25a91c7
- 請求管理DB（新規作成）: 6c2edd7a-dd3b-40a1-920e-7e0f738acdac（経理ページ配下）

### 残対応
1. GMO銀行API審査通過 → OAuth2対応改修
2. Gmail サービスアカウント設定
3. インボイス登録番号の設定
4. Slack Webhook URL設定
5. クライアントDBへの実データ登録
6. 月末自動実行のスケジュール化
