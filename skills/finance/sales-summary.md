---
description: 売上・収益サマリーを表示する。月次定期収入、新規商談パイプライン、経費、概算利益を一覧で確認。「売上確認」「売上サマリー」「今月の売上」「sales summary」で起動。
---

# 売上サマリースキル

## 概要
Notion の クライアントDB・商談DB・領収書DB から情報を取得し、月次の売上・利益サマリーを生成する。

## 環境変数の読み込み
```bash
source ~/Desktop/with-AI/skills/documents/クロードコード/.env
```

必要な環境変数:
- `NOTION_API_TOKEN` - Notion API トークン
- `NOTION_CLIENT_DB` - クライアントDB ID
- `NOTION_DEAL_DB` - 商談DB ID
- `NOTION_RECEIPT_DB` - 領収書DB ID（未設定の場合は経費セクションをスキップ）

## 対象期間の決定
- 引数なし: 今月（YYYY-MM-01 ~ YYYY-MM-末日）
- `3月` or `2026-03`: 指定月
- 現在の年月から自動計算する

以下、対象月を `YYYY-MM` として `MONTH_START`（月初）と `MONTH_END`（月末）を算出する。

## データ取得

### 1. クライアントDB: 契約中クライアントの月額収入

契約状況が「契約中」のクライアントを全件取得する。

```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_CLIENT_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "property": "契約状況",
      "select": {"equals": "契約中"}
    },
    "page_size": 100
  }'
```

各クライアントから以下を抽出:
- `会社名` (title)
- `契約プラン` (select)
- `月額` (number)

### 2. 商談DB: 今月の商談

対象月に日付がある商談を取得する。

```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_DEAL_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "日付", "date": {"on_or_after": "【MONTH_START】"}},
        {"property": "日付", "date": {"on_or_before": "【MONTH_END】"}}
      ]
    },
    "sorts": [{"property": "日付", "direction": "descending"}],
    "page_size": 100
  }'
```

各商談から以下を抽出:
- `件名` (title) - 商談名・会社名として表示
- `結果` (select) - ステータス（次回商談へ / 提案予定 / 成約 / 保留 / 失注）
- `内容` (rich_text) - 見込金額が記載されている場合はそこから抽出

**見込金額の抽出ロジック:**
- `内容` または `メモ` フィールドに金額（例: `月額49,800円`, `300,000円`, `50万`）が含まれていれば抽出
- 見つからない場合は「-」と表示

### 3. 領収書DB: 今月の経費（receipt-list.md パターン）

`NOTION_RECEIPT_DB` が .env に設定されている場合のみ実行。

```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_RECEIPT_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "日付", "date": {"on_or_after": "【MONTH_START】"}},
        {"property": "日付", "date": {"on_or_before": "【MONTH_END】"}}
      ]
    },
    "sorts": [{"property": "日付", "direction": "ascending"}],
    "page_size": 100
  }'
```

100件以上ある場合は `has_more` / `next_cursor` で追加取得する。
各領収書の `金額` (number) を合計する。

## 集計

- **月次定期収入（MRR）**: 契約中クライアントの `月額` の合計
- **新規商談パイプライン**: 今月の商談のうち `失注` 以外の見込金額合計
- **今月の経費**: 領収書DBの金額合計
- **概算利益**: MRR - 経費（商談パイプラインは確定前のため含めない）

## 表示フォーマット

```
💰 売上サマリー（YYYY年MM月）

【月次定期収入】
| クライアント | プラン | 月額 |
|------------|--------|------|
| ○○株式会社 | AIKOMONプラン | ¥250,000 |
| △△株式会社 | AI相談プラン | ¥49,800 |
合計: ¥XXX,XXX

【今月の新規商談】
| 会社名 | ステータス | 見込金額 |
|--------|----------|---------|
| □□株式会社 | 提案予定 | ¥300,000 |
| ◇◇株式会社 | 次回商談へ | ¥49,800 |
パイプライン合計: ¥XXX,XXX

【今月の経費】¥XXX,XXX
【概算利益】¥XXX,XXX
```

## 補足ルール
- 金額は3桁カンマ区切り、頭に `¥` を付与
- 商談が0件の場合は「今月の新規商談はありません」と表示
- `NOTION_RECEIPT_DB` が未設定の場合、経費セクションは「領収書DBが未設定です。`/notion 領収書DBを作成して` で作成してください。」と表示し、概算利益は「経費データなし」と注記する
- 概算利益がマイナスの場合は赤字である旨を注記する
