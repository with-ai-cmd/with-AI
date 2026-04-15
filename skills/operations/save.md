---
description: 作業途中のチェックポイント保存。「保存」「セーブ」「save」で起動。現時点の進捗をNotionデイリーレポートDBにスナップショットとして記録する。お疲れスキルのライト版。
---

# セーブスキル — 途中経過チェックポイント

「保存」の一言で、現時点の作業進捗をNotionのデイリーレポートDBに保存する。
お疲れスキルのライト版で、タスクのリスケや締めの処理は行わない。

## 環境変数の読み込み
以下のファイルから環境変数を読み込んでください:
- `{{WITHAI_ROOT}}/skills/documents/クロードコード/.env`

---

## 実行順序

### Phase 1: 情報収集（並列実行）

以下の2つをAgentツールで同時に実行する:

#### 1. 今日の完了タスク取得
Notion タスクDB（$NOTION_TASK_DB）から今日完了したタスクを取得。

```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_TASK_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "ステータス", "select": {"equals": "完了"}},
        {"property": "完了日", "date": {"equals": "【今日の日付 YYYY-MM-DD】"}}
      ]
    }
  }'
```

※ 「完了日」プロパティがない場合は「期日」が今日で「ステータス」が「完了」のものを取得。

#### 2. 今日の進行中タスク取得
今日が期日で未完了、または進行中のタスクを取得。

```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_TASK_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "期日", "date": {"on_or_before": "【今日の日付 YYYY-MM-DD】"}},
        {"property": "ステータス", "select": {"does_not_equal": "完了"}}
      ]
    }
  }'
```

---

### Phase 2: デイリーレポート更新

#### 3. 今日のレポートページを確認・作成/更新

まず日報DB（$NOTION_DAILY_REPORT_DB）に今日のページが既にあるか確認:

```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_DAILY_REPORT_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "property": "日付",
      "date": {"equals": "【今日の日付 YYYY-MM-DD】"}
    }
  }'
```

**今日のページが既にある場合** → ページを更新（本文ブロックを追加）
**今日のページがない場合** → 新規ページを作成

セーブ時の本文には保存時刻付きのチェックポイントを記録:

```
--- チェックポイント HH:MM ---

完了タスク（ここまで）:
- タスク名
- タスク名

進行中:
- タスク名（状況メモ）
- タスク名（状況メモ）
```

新規作成の場合:
```bash
curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"database_id": "$NOTION_DAILY_REPORT_DB"},
    "properties": {
      "名前": {"title": [{"text": {"content": "【YYYY-MM-DD（曜日）】デイリーレポート"}}]},
      "日付": {"date": {"start": "【YYYY-MM-DD】"}},
      "完了数": {"number": 【N】},
      "未完了数": {"number": 【M】},
      "完了率": {"number": 【XX】},
      "ステータス": {"select": {"name": "引き継ぎあり"}}
    },
    "children": [【チェックポイントブロック】]
  }'
```

既存ページへの追記の場合:
```bash
curl -s -X PATCH "https://api.notion.com/v1/blocks/【ページID】/children" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "children": [
      {
        "object": "block",
        "type": "divider",
        "divider": {}
      },
      {
        "object": "block",
        "type": "heading_3",
        "heading_3": {"rich_text": [{"text": {"content": "チェックポイント HH:MM"}}]}
      },
      【タスクリストブロック】
    ]
  }'
```

プロパティ（完了数・未完了数・完了率）も最新値に更新する。

---

## 出力フォーマット

```
========================================
 💾 セーブ完了  HH:MM
========================================

✅ 完了（N件）
  - タスク名
  - タスク名

🔄 進行中（M件）
  - タスク名
  - タスク名

📊 完了率: XX%
📝 Notionに保存済み

========================================
```

---

## お疲れスキルとの関係

- セーブは**途中経過の記録**。タスクのリスケや締めの処理は行わない。
- 1日に何回でもセーブ可能。同じ日報ページにチェックポイントが追記される。
- 最後に「お疲れ」を実行すると、セーブ済みの日報ページに最終レポートが追記され、未完了タスクのリスケも実行される。

## ルール
1. **全て自動実行** — ユーザーへの確認は不要
2. **エラーがあってもスキップして続行**
3. **簡潔に** — セーブは素早く完了させる。詳細はNotionで確認
4. **既存ページは上書きしない** — 常に追記（チェックポイントの履歴が残る）
