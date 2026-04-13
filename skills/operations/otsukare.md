---
description: 一日の締めレポート。「お疲れ」「おつかれ」「otsukare」で起動。今日のエージェント作業実績をNotionに日報ページとして保存し、未完了タスクを翌日に引き継ぐ。おはようスキルと連動。
---

# お疲れスキル — デイリーレポート & タスク引き継ぎ

「お疲れ」の一言で、今日の作業実績をまとめてNotionに日報を保存し、
未完了タスクを翌日に引き継ぐ。翌朝の「おはよう」スキルがこの日報を読み取って引き継ぎを行う。

## 環境変数の読み込み
以下のファイルから環境変数を読み込んでください:
- `{{WITHAI_ROOT}}/skills/documents/クロードコード/.env`

日報DB ID: `$NOTION_DAILY_REPORT_DB`

---

## 実行順序

### Phase 1: 情報収集（並列実行）

以下の4つをAgentツールで同時に実行する:

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
    },
    "sorts": [{"property": "期日", "direction": "ascending"}]
  }'
```

※ 「完了日」プロパティがない場合は「期日」が今日で「ステータス」が「完了」のものを取得。

#### 2. 今日の未完了タスク取得
今日が期日だが完了していないタスク、または進行中のタスクを取得。

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
    },
    "sorts": [{"property": "期日", "direction": "ascending"}]
  }'
```

#### 3. 今日のカレンダーイベント取得
Google Calendar MCPが利用可能な場合:
- 今日参加した会議・面談を取得
- 各イベントのタイトル・参加者を記録

#### 4. 今日のメール対応状況
Gmail MCPが利用可能な場合:
- 今日送信したメールの件数・主要な宛先
- まだ未返信のメール（要対応フラグ付き）

---

### Phase 2: 未完了タスクの引き継ぎ処理

Phase 1完了後、未完了タスクについて以下を実行:

#### 5. 未完了タスクのリスケ
未完了タスクの期日を**翌営業日**に自動更新する。
- 土日を避ける
- ステータスを「引き継ぎ」に変更（セレクトにない場合は「進行中」のまま）
- 各タスクに「YYYY-MM-DD お疲れレポートより引き継ぎ」のコメントを追加

```bash
# 各未完了タスクの期日を翌営業日に更新
curl -s -X PATCH "https://api.notion.com/v1/pages/【ページID】" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "期日": {"date": {"start": "【翌営業日 YYYY-MM-DD】"}}
    }
  }'
```

---

### Phase 3: 日報ページ生成

#### 6. Notion日報ページ作成
日報DB（$NOTION_DAILY_REPORT_DB）に今日のレポートページを作成する。

日報DBが存在しない場合、または環境変数 $NOTION_DAILY_REPORT_DB が未設定の場合:
- ユーザーに日報DBのIDを確認する
- .envファイルに `NOTION_DAILY_REPORT_DB=` を追加する

日報ページのプロパティ:
- **タイトル**: `YYYY-MM-DD（曜日）デイリーレポート`
- **日付**: 今日の日付
- **完了数**: 完了タスクの件数
- **未完了数**: 未完了タスクの件数
- **完了率**: 完了数 / (完了数 + 未完了数) × 100

日報ページの本文（ブロック）:

```
## 完了タスク
- タスク名（カテゴリ/プロジェクト）
- タスク名（カテゴリ/プロジェクト）

## 未完了 → 明日引き継ぎ
- タスク名 — 状況メモ（例: 70%完了、○○待ち）
- タスク名 — 状況メモ

## 参加した会議
- HH:MM ○○株式会社（参加者: ○○、△△）
- HH:MM 社内MTG

## メール対応
- 送信: N件
- 未返信（要対応）: N件
  - 送信者: 件名

## 明日の優先事項
1. 引き継ぎタスクの最優先項目
2. 明日の会議準備
3. 未返信メールへの対応
```

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
      "完了率": {"number": 【XX】}
    },
    "children": [
      {
        "object": "block",
        "type": "heading_2",
        "heading_2": {"rich_text": [{"text": {"content": "完了タスク"}}]}
      },
      {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {"rich_text": [{"text": {"content": "【タスク名】"}}]}
      },
      {
        "object": "block",
        "type": "heading_2",
        "heading_2": {"rich_text": [{"text": {"content": "未完了 → 明日引き継ぎ"}}]}
      },
      {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {"rich_text": [{"text": {"content": "【タスク名 — 状況メモ】"}}]}
      },
      {
        "object": "block",
        "type": "heading_2",
        "heading_2": {"rich_text": [{"text": {"content": "明日の優先事項"}}]}
      },
      {
        "object": "block",
        "type": "numbered_list_item",
        "numbered_list_item": {"rich_text": [{"text": {"content": "【優先事項】"}}]}
      }
    ]
  }'
```

---

## 出力フォーマット

全Phase完了後、以下のフォーマットでサマリーを表示する:

```
========================================
 お疲れさまでした！ YYYY-MM-DD（曜日）
========================================

✅ 完了タスク（N件）
  - タスク名
  - タスク名

🔄 未完了 → 明日引き継ぎ（M件）
  - タスク名 — 状況メモ
  - タスク名 — 状況メモ

🤝 会議（N件参加）
  - HH:MM ○○株式会社
  - HH:MM 社内MTG

📧 メール（送信N件 / 未返信M件）
  - 【要対応】送信者: 件名

📌 明日の優先事項
  1. ○○○
  2. △△△
  3. □□□

📊 完了率: XX%
📝 日報: Notionに保存済み → [リンク]

========================================
 明日も頑張りましょう！
========================================
```

## おはようスキルとの連動

このスキルが生成した日報ページは、翌朝の「おはよう」スキルが以下のように活用する:
- **昨日の引き継ぎ事項**を「今日のタスク」に含めて表示
- 未完了タスクは既にリスケ済みなので、おはようスキルのタスク確認で自動的に拾われる
- 日報DBから昨日の完了率・引き継ぎ事項を表示し、朝のブリーフィングに含める

---

## ルール
1. **全て自動実行** — ユーザーへの確認は不要
2. **エラーがあってもスキップして続行** — 1つのPhaseが失敗しても他を止めない
3. **簡潔に** — 各セクションは必要最低限の情報のみ。詳細はNotionで確認できる
4. **並列化を最大限活用** — Phase 1のタスクはAgentツールで同時実行
5. **日報DBが未設定の場合** — 初回のみユーザーにDB IDを確認し、.envに保存。2回目以降は自動
