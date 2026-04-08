# Morning News Agent System

このプロジェクトは /morning-news コマンドで起動する
AIニュース収集・Notion公開エージェントシステムです。

## 起動方法
/morning-news

## エージェント構成
- orchestrator: 全体の逐次制御
- rss-collector: RSSとスクレイピングによるニュース収集
- person-tracker: 特定人物の投稿追跡
- analyser: 重複排除・重要度スコアリング
- notion-writer: Notion作業DBへの書き込み
- publisher: クライアント向け公開ページの更新

## 環境変数（~/.zshrc または ~/.bashrc に設定すること）
- NOTION_API_KEY: Notion インテグレーションキー
- NOTION_RAW_DB_ID: 作業用DB（NEWS_RAW）のID
- NOTION_WATCH_DB_ID: ウォッチリストDBのID
- NOTION_PUBLIC_PAGE_ID: クライアント向け公開ページのID
- GROK_API_KEY: Grok API キー（オプション）

## 完了レポートフォーマット

```
========================================
 morning-news 完了レポート
========================================
RSS収集:      XX件
人物追跡:     XX件（Xユーザー）
重複排除後:   XX件
Notion書込:   XX件
公開ページ:   https://notion.so/XXXXXXX
実行時間:     約X分
========================================
```

エラーがあった場合は以下を追記：
⚠️ スキップ: [エラー内容を1行で]
