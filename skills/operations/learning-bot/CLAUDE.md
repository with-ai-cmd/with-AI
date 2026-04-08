# Learning Bot - 学習ノート自動生成システム

Telegram Bot + Notion + Claude API による学習ナレッジ管理システム。

## 概要
1. 日中: Telegram BotにX(Twitter)等のURLを送信
2. 即時: Notion「学習インボックス」DBに自動登録
3. 毎晩: 未処理URLを取得 → Claude APIで要約 → 「学習ノート」DBに記事生成

## ファイル構成
- `telegram_bot.py` — Telegram Bot（常駐プロセス）
- `nightly_summarize.py` — 夜間要約スクリプト（cron/schedule実行）
- `requirements.txt` — Python依存パッケージ

## 環境変数（.env に設定済み）
- `NOTION_API_KEY` — Notion APIトークン
- `NOTION_LEARNING_INBOX_DB` — 学習インボックスDB ID
- `NOTION_LEARNING_NOTE_DB` — 学習ノートDB ID
- `TELEGRAM_BOT_TOKEN` — Telegram Bot トークン
- `TELEGRAM_CHAT_ID` — 通知先チャットID（Bot起動後に設定）

## セットアップ
```bash
cd ~/Desktop/with-AI/skills/operations/learning-bot
pip install -r requirements.txt
```

## 起動
```bash
# Telegram Bot（常駐）
python telegram_bot.py

# 夜間要約（手動実行 or cron）
python nightly_summarize.py
```

## Notion DB
- 学習インボックス: URL受付・ステータス管理
- 学習ノート: 日次の要約記事（社内ナレッジ）
