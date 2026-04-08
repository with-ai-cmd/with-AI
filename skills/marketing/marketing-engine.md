---
description: 最強マーケティングエンジン。GA4・Search Console・競合分析・SEO・記事生成・デプロイ・レポート配信を完全自動化。「マーケ」「SEO」「ブログ書いて」「事例作って」「競合分析」等で起動。
---

以下のエージェント定義ファイルを読み込み、指示に従ってマーケティング施策を実行してください。

## メインエージェント（司令塔）
/Users/kaitomain/Desktop/claude code/marketing-engine/SKILL.md

## 設定ファイル
/Users/kaitomain/Desktop/claude code/marketing-engine/config/settings.json

## サブエージェント

### データ収集・分析
/Users/kaitomain/Desktop/claude code/marketing-engine/agents/analytics/AGENT.md

### SEO戦略・最適化
/Users/kaitomain/Desktop/claude code/marketing-engine/agents/seo-optimizer/AGENT.md

### コンテンツ（ブログ・コラム）生成
/Users/kaitomain/Desktop/claude code/marketing-engine/agents/content-writer/AGENT.md

### 導入事例ページ生成
/Users/kaitomain/Desktop/claude code/marketing-engine/agents/case-study/AGENT.md

### 競合分析・市場リサーチ
/Users/kaitomain/Desktop/claude code/marketing-engine/agents/competitor-intel/AGENT.md

### サーバーデプロイ・公開
/Users/kaitomain/Desktop/claude code/marketing-engine/agents/site-deployer/AGENT.md

### レポート生成・配信
/Users/kaitomain/Desktop/claude code/marketing-engine/agents/report-publisher/AGENT.md

## 実行モード判定

ユーザーの入力を解析し、適切なモードで実行する：

| 入力パターン | 実行モード |
|---|---|
| `daily` / `デイリー` | デイリーチェック |
| `weekly` / `週次` / 引数なし | ウィークリーレポート |
| `monthly` / `月次` | マンスリーレポート |
| `blog [テーマ]` / `記事 [テーマ]` / `ブログ [テーマ]` | 記事生成→デプロイ |
| `case [会社名]` / `事例 [会社名]` | 事例生成→デプロイ |
| `seo` / `SEO分析` | SEO集中分析 |
| `competitor` / `競合` / `競合分析` | 競合分析 |

ユーザーの入力: $ARGUMENTS
