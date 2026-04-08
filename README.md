# with-AI

Claude Code で動く、AI経営チームのエコシステム。
「秘書」に話しかけるだけで、財務・顧客管理・AI戦略・ドキュメント作成まで全部やってくれる。

## 仕組み

```
┌─────────────────────────┐
│      あなた（CEO）        │
│    「〜して」「〜したい」   │
└────────────┬────────────┘
             │
┌────────────┴────────────┐
│        秘書AI            │
│   意図解釈 → ルーティング   │
└──┬──────┬──────┬──────┬─┘
   │      │      │      │
 CAIO    CFO    CCO   スキル
(AI戦略) (財務) (顧客) (直接実行)
```

## 4つの役職

| 役職 | 担当 | できること |
|---|---|---|
| **秘書AI** | 全体ルーティング | 指示を解釈して最適な役職・スキルに振り分け |
| **CAIO** | AI戦略 | スキル管理、ヘルスチェック、ロードマップ策定 |
| **CFO** | 財務 | 請求書発行、経費管理、売上レポート |
| **CCO** | 顧客管理 | CRM、パイプライン管理、ヘルススコア、契約管理 |

## スキル一覧（34個 + Anthropic公式17個）

<details>
<summary>業務スキル</summary>

| カテゴリ | スキル | 説明 |
|---|---|---|
| **CRM** | contact-add | 名刺・コンタクト登録 |
| | contact-show | コンタクト検索 |
| | contact-list | コンタクト一覧 |
| | contact-convert | 成約・クライアント昇格 |
| | client-follow | クライアントフォロー |
| | contract-manage | 契約管理 |
| **財務** | invoice-generate | 請求書作成 |
| | invoice-batch | 請求書一斉発行 |
| | receipt-add | 領収書登録 |
| | receipt-list | 領収書一覧 |
| | receipt-summary | 経費まとめ |
| | sales-summary | 売上まとめ |
| **ドキュメント** | proposal-generate | 提案書作成 |
| | contract-generate | 契約書作成 |
| | estimate-generate | 見積書作成 |
| | intro-generate | 紹介文作成 |
| | pptx | パワポ作成（ブランド付き） |
| **オペレーション** | ohayou | 朝の全自動ルーティン |
| | oyasumi | おやすみルーティン |
| | weekly-review | 週次レビュー |
| | meeting-add | ミーティング記録 |
| | meeting-memo | 会議メモ作成 |
| | notion | Notion操作 |
| | morning-news | 朝のニュース |
| | learning-note | 学習ノート作成 |
| **マーケティング** | marketing-engine | マーケレポート・SEO分析・ブログ作成 |
| | sns-draft | SNS投稿下書き |
| **コンテンツ** | gen-ai-master | 教材作成 |
| | slide-creator | スライド作成 |

</details>

<details>
<summary>Anthropic 公式スキル（17個）</summary>

| スキル | 説明 |
|---|---|
| pdf | PDF作成・編集・結合・分割・OCR |
| xlsx | Excel作成・編集・データ分析 |
| docx | Word文書作成・編集 |
| pptx | PowerPoint作成・編集（汎用） |
| frontend-design | フロントエンドUI/UXデザイン |
| canvas-design | キャンバスデザイン |
| brand-guidelines | ブランドガイドライン策定 |
| theme-factory | テーマ・スタイリング |
| algorithmic-art | アルゴリズムアート |
| doc-coauthoring | ドキュメント共同執筆 |
| internal-comms | 社内コミュニケーション文書 |
| mcp-builder | MCPサーバー構築 |
| webapp-testing | Webアプリテスト |
| web-artifacts-builder | Webアーティファクト構築 |
| slack-gif-creator | Slack GIF作成 |
| skill-creator | スキル作成支援 |
| claude-api | Claude API/SDKリファレンス |

</details>

## セットアップ

### 1. クローン

```bash
git clone https://github.com/with-ai-cmd/with-AI.git
cd with-AI
```

### 2. セットアップスクリプト実行

```bash
./setup.sh
```

これで以下が自動的に行われる:
- グローバル `CLAUDE.md` の配置（パスを自動書き換え）
- スラッシュコマンドの配置
- Anthropic 公式スキルプラグインのインストール
- Python / Node.js 依存関係のインストール

### 3. 環境変数の設定

セキュリティのため `.env` ファイルはGitに含まれていない。以下を手動で作成する:

```bash
# メインの環境変数
cp skills/documents/クロードコード/.env.example skills/documents/クロードコード/.env
# 自分のAPIキーを記入
```

### 4. MCP接続（任意）

以下のMCPサーバーを Claude Code に接続すると、カレンダー・メール・Notionと連携できる:
- Google Calendar
- Gmail
- Notion

## 使い方

Claude Code を起動して話しかけるだけ。

```
> 秘書
# → 秘書AIが起動。何でも指示を受けてルーティング

> おはよう
# → 朝の全自動ルーティン

> 請求書作ってタイムに送って
# → 秘書 → CFO → 請求書生成 → Gmail下書き

> 今月の売上見せて
# → 秘書 → CFO → 売上サマリー

> スキルの状態チェックして
# → 秘書 → CAIO → ヘルスチェック
```

## 必要なもの

- [Claude Code](https://claude.ai/code)
- Python 3.x
- Node.js（LINE/Notion連携を使う場合）

## ライセンス

MIT
