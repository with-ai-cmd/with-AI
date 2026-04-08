---
description: 夜の全自動ルーティン。「おやすみ」「oyasumi」「good night」で起動。今日の振り返り・明日の準備・未返信メール確認・日報生成を一括実行する。
---

# おやすみスキル — 夜の全自動ルーティン

「おやすみ」の一言で、以下の5つを順番に実行する。
各ステップは並列実行可能なものはAgentツールで並列化し、高速に処理する。

## 環境変数の読み込み
以下のファイルから環境変数を読み込んでください:
- `~/Desktop/with-AI/skills/documents/クロードコード/.env`

---

## 実行順序

### Phase 1: 情報収集（並列実行）

以下の3つをAgentツールで同時に実行する:

#### 1. 今日の振り返り
Notion タスクDB（$NOTION_TASK_DB）から今日の作業状況を取得する。

```bash
# 今日完了したタスクを取得
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_TASK_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "ステータス", "select": {"equals": "完了"}},
        {"property": "期日", "date": {"equals": "【今日の日付 YYYY-MM-DD】"}}
      ]
    },
    "sorts": [{"property": "期日", "direction": "ascending"}]
  }'
```

```bash
# 今日が期日だが未完了のタスクを取得
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_TASK_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "期日", "date": {"equals": "【今日の日付 YYYY-MM-DD】"}},
        {"property": "ステータス", "select": {"does_not_equal": "完了"}}
      ]
    }
  }'
```

- 完了タスクの一覧を取得
- 未完了タスク（残タスク）の一覧を取得
- 完了率を算出

#### 2. 明日のタスク確認
明日の予定とタスクを確認し、準備が必要なものをフラグする。

```bash
# 明日が期日のタスクを取得
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_TASK_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "期日", "date": {"equals": "【明日の日付 YYYY-MM-DD】"}},
        {"property": "ステータス", "select": {"does_not_equal": "完了"}}
      ]
    },
    "sorts": [{"property": "期日", "direction": "ascending"}]
  }'
```

Google Calendar MCP が利用可能な場合はそちらも併用する:
- 明日のカレンダーイベントを取得
- 会議・面談がある場合は資料準備の要否を確認
- 早朝の予定がある場合はアラートを表示

#### 3. 未返信メールチェック
今日受信した未返信の重要メールを確認する。

**方法A: Gmail MCP（Claude Code経由の場合）**
Gmail MCPが利用可能なら `gmail_search_messages` で `is:unread after:【今日の日付 YYYY/MM/DD】` を検索。

**方法B: Google Apps Script（自動取得）**
Gmail APIをGASで叩いて未読メールをJSON取得するスクリプトを使用。

いずれの方法でも:
- 各メールの件名・送信者・受信日時を表示
- クライアントからのメール、期限付きの依頼は「要対応」としてフラグ
- 広告・通知系メールは除外
- 明日朝イチで返信が必要なものを明示

---

### Phase 2: レポート生成

Phase 1完了後、以下を順に実行する:

#### 4. 日報生成
Phase 1の結果をまとめて日報を生成する。

日報に含める項目:
- **完了タスク**: 今日完了したタスクの一覧
- **参加した会議**: 今日のカレンダーイベントから会議・面談を抽出（取得可能な場合）
- **未完了・持ち越し**: 今日中に終わらなかったタスク
- **明日の優先事項**: 明日のタスク・予定から優先度の高いものを抽出
- **メモ**: 特筆事項があれば記載

Notion に日報DBがある場合はNotionに保存する。ない場合は画面に表示する。

#### 5. おやすみメッセージ
一日の締めくくりとして、簡潔なサマリーとメッセージを表示する。

---

## 出力フォーマット

全Phase完了後、以下のフォーマットでサマリーを表示する:

```
========================================
 おつかれさまでした！ YYYY-MM-DD（曜日）
========================================

✅ 今日の成果（完了: N件 / 未完了: M件）
  完了:
  - タスク名
  - タスク名
  持ち越し:
  - タスク名（理由・状況）

📋 明日の予定（N件）
  - HH:MM ○○株式会社（Zoom: リンク）
  - HH:MM 社内MTG
  ⚠️ 準備が必要:
  - ○○の資料を用意

📧 未返信メール（N件）
  - 【要対応】送信者: 件名（明朝返信推奨）
  - 送信者: 件名
  - または「未返信メールなし」

📝 日報
  完了タスク: N件
  会議参加: N件
  持ち越し: M件
  明日の最優先: ○○○

========================================
 今日の完了率: XX%
 明日のタスク: N件 | 会議: M件
========================================

🌙 おつかれさまでした。ゆっくり休んでください！
```

## ルール
1. **全て自動実行** — ユーザーへの確認は不要
2. **エラーがあってもスキップして続行** — 1つのPhaseが失敗しても他を止めない
3. **簡潔に** — 各セクションは必要最低限の情報のみ。詳細はNotionで確認できる
4. **並列化を最大限活用** — Phase 1のタスクはAgentツールで同時実行
