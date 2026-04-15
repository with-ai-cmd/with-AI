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
- article-writer: 重要ニュースの個別記事HTML生成
- portal-publisher: ポータルサイトNEWSページへの公開

## 環境変数（~/.zshrc または ~/.bashrc に設定すること）
- GROK_API_KEY: Grok API キー（オプション）

## 完了レポートフォーマット

```
========================================
 morning-news 完了レポート
========================================
RSS収集:      XX件
人物追跡:     XX件（Xユーザー）
重複排除後:   XX件
記事生成:     XX件（重要度「高」のXX件中）
ポータル公開: XX件（新規） / XX件（総数）
実行時間:     約X分
========================================
```

エラーがあった場合は以下を追記：
⚠️ スキップ: [エラー内容を1行で]
