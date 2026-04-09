---
description: 週次レビューを自動生成する。毎週金曜または任意のタイミングで起動。「週次レビュー」「今週のまとめ」「weekly review」で起動。
---

# 週次レビュースキル -- with-AI株式会社

毎週金曜日または任意のタイミングで、今週の活動を自動集計しレポートを生成する。

## 環境変数の読み込み

必ず最初に実行:
```bash
source {{WITHAI_ROOT}}/skills/documents/クロードコード/.env
```

## 日付の計算

今日の日付から今週の月曜日（週の開始）と日曜日（週の終了）を算出する。
金曜日に実行する場合、月曜〜金曜を対象とする。

```bash
# 今週の月曜日と日曜日を算出
TODAY=$(date +%Y-%m-%d)
DOW=$(date +%u)  # 1=月曜, 7=日曜
MONDAY=$(date -v-$((DOW - 1))d +%Y-%m-%d)
SUNDAY=$(date -v+$((7 - DOW))d +%Y-%m-%d)
# 表示用
MONDAY_DISP=$(date -j -f %Y-%m-%d "$MONDAY" +%m/%d)
SUNDAY_DISP=$(date -j -f %Y-%m-%d "$SUNDAY" +%m/%d)
```

---

## Phase 1: 情報収集（並列実行）

以下の5つをAgentツールで同時に実行する:

### 1. タスク集計

Notion タスクDB（$NOTION_TASK_DB）から今週完了したタスクと残タスクを取得する。

**今週完了したタスク:**
```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_TASK_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "ステータス", "select": {"equals": "完了"}},
        {"property": "期日", "date": {"on_or_after": "'"$MONDAY"'"}},
        {"property": "期日", "date": {"on_or_before": "'"$SUNDAY"'"}}
      ]
    },
    "sorts": [{"property": "期日", "direction": "ascending"}]
  }'
```

**未完了の残タスク:**
```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_TASK_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "ステータス", "select": {"does_not_equal": "完了"}},
        {"property": "期日", "date": {"on_or_before": "'"$SUNDAY"'"}}
      ]
    },
    "sorts": [{"property": "優先度", "direction": "ascending"}]
  }'
```

### 2. ミーティング集計

Notion ミーティングDB（$NOTION_MEETING_DB）から今週のミーティングを取得する。

```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_MEETING_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "日時", "date": {"on_or_after": "'"$MONDAY"'"}},
        {"property": "日時", "date": {"on_or_before": "'"$SUNDAY"'"}}
      ]
    },
    "sorts": [{"property": "日時", "direction": "ascending"}]
  }'
```

ミーティングから新規コンタクト数も抽出する（コンタクトDBで初回接触日が今週のレコードを数える）:

```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_CONTACT_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "初回接触日", "date": {"on_or_after": "'"$MONDAY"'"}},
        {"property": "初回接触日", "date": {"on_or_before": "'"$SUNDAY"'"}}
      ]
    }
  }'
```

### 3. 商談状況

Notion 商談DB（$NOTION_DEAL_DB）から今週動きのあった商談を取得する。

```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_DEAL_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "日付", "date": {"on_or_after": "'"$MONDAY"'"}},
        {"property": "日付", "date": {"on_or_before": "'"$SUNDAY"'"}}
      ]
    },
    "sorts": [{"property": "日付", "direction": "descending"}]
  }'
```

各商談について件名、結果（ステータス変化）、コンタクト情報を整理する。

### 4. マーケティングサマリー

マーケティングレポートDB（$NOTION_MARKETING_REPORT_DB）から今週のGA4/Search Consoleサマリーを取得する。

```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_MARKETING_REPORT_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "日付", "date": {"on_or_after": "'"$MONDAY"'"}},
        {"property": "日付", "date": {"on_or_before": "'"$SUNDAY"'"}}
      ]
    },
    "sorts": [{"property": "日付", "direction": "ascending"}]
  }'
```

今週分のレコードを集計し、週間PV合計・前週比・新規記事数・検索順位変動を算出する。
前週比の算出には前週（先週月曜〜日曜）のデータも取得して比較する。

### 5. ニュース件数

ニュース収集DB（$NOTION_RAW_DB_ID）から今週収集されたニュース件数をカウントする。

```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_RAW_DB_ID/query" \
  -H "Authorization: Bearer $NOTION_NEWS_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "property": "Created time",
      "created_time": {
        "on_or_after": "'"$MONDAY"'"
      }
    }
  }'
```

レスポンスの `results` 配列の長さをカウントする。`has_more` が `true` の場合はページネーションで全件カウントする。

---

## Phase 2: レポート生成

Phase 1の全データを集約し、以下のフォーマットでレポートを生成する。

### 来週の予定の取得

レポート生成前に、来週の重要タスクとミーティング予定を取得する:

```bash
# 来週のタスク
NEXT_MONDAY=$(date -v+$((8 - DOW))d +%Y-%m-%d)
NEXT_SUNDAY=$(date -v+$((14 - DOW))d +%Y-%m-%d)

curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_TASK_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "期日", "date": {"on_or_after": "'"$NEXT_MONDAY"'"}},
        {"property": "期日", "date": {"on_or_before": "'"$NEXT_SUNDAY"'"}},
        {"property": "ステータス", "select": {"does_not_equal": "完了"}}
      ]
    },
    "sorts": [{"property": "優先度", "direction": "ascending"}]
  }'
```

```bash
# 来週のミーティング
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_MEETING_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "日時", "date": {"on_or_after": "'"$NEXT_MONDAY"'"}},
        {"property": "日時", "date": {"on_or_before": "'"$NEXT_SUNDAY"'"}},
        {"property": "ステータス", "select": {"does_not_equal": "キャンセル"}}
      ]
    },
    "sorts": [{"property": "日時", "direction": "ascending"}]
  }'
```

### KPIの算出

- **MRR**: クライアントDB（$NOTION_CLIENT_DB）から契約状況が「契約中」のレコードの月額合計を算出
- **パイプライン**: 商談DB（$NOTION_DEAL_DB）から結果が「次回商談へ」「提案予定」のレコードを集計し、見込み金額を推定
- **コンタクト総数**: コンタクトDB（$NOTION_CONTACT_DB）の総レコード数

```bash
# MRR算出: 契約中クライアントの月額合計
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_CLIENT_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "property": "契約状況",
      "select": {"equals": "契約中"}
    }
  }'
```

```bash
# パイプライン: アクティブな商談
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_DEAL_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "or": [
        {"property": "結果", "select": {"equals": "次回商談へ"}},
        {"property": "結果", "select": {"equals": "提案予定"}}
      ]
    }
  }'
```

```bash
# コンタクト総数
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_CONTACT_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"page_size": 1}'
```
total_countが直接取れないため、page_size=100でページネーションして全件カウントする。

---

## 出力フォーマット

全データ集約後、以下のフォーマットで表示する:

```
========================================
 週次レビュー（MM/DD〜MM/DD）
========================================

【成果】
- 完了タスク: N件
- ミーティング: N件
- 新規コンタクト: N件

【商談状況】
| 会社名 | 変化 | 現ステータス |
|--------|------|-------------|
| ○○株式会社 | 初回面談 → 提案予定 | 提案予定 |
| △△株式会社 | 提案済み → 成約 | 成約 |

【マーケティング】
- 週間PV: XXX（前週比 +X%）
- 新規記事: N本
- 検索順位変動: キーワード +N位 / キーワード -N位

【ニュース収集】
- 今週の収集記事数: N件

【来週の予定】
- 重要タスク:
  - タスク名（期日 / 優先度）
  - タスク名（期日 / 優先度）
- ミーティング:
  - MM/DD HH:MM ○○株式会社
  - MM/DD HH:MM △△様

【KPI】
- MRR: ¥XXX,XXX
- パイプライン: ¥XXX,XXX（N件）
- コンタクト総数: XXX名

========================================
```

---

## ルール

1. **全て自動実行** -- ユーザーへの確認は不要。データ取得からレポート生成まで一気通貫で行う
2. **エラーがあってもスキップして続行** -- 1つのデータソースが失敗しても他を止めない。失敗したセクションは「取得失敗」と表示する
3. **簡潔に** -- 各セクションは必要最低限の情報のみ。詳細はNotionで確認できる
4. **並列化を最大限活用** -- Phase 1のデータ取得はAgentツールで同時実行する
5. **数値は正確に** -- APIレスポンスから正確にカウント・集計する。推定値を使う場合はその旨明記する
6. **前週比は必ず表示** -- マーケティング数値は前週との比較を含める
