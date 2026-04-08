---
description: Notionの汎用AIエージェント。DB作成・ページ追加・検索・更新・削除など、あらゆるNotion操作を自然言語で実行する。「NotionにDB作って」「Notionで検索して」「Notionのページ更新して」等で起動。
---

# Notion 汎用AIエージェント

## 概要
ユーザーの自然言語指示を解釈し、Notion APIを使ってあらゆる操作を実行する汎用エージェント。
新しいDBの作成、ページのCRUD、検索、一括更新など何でも対応する。

## 環境変数の読み込み
必ず最初に実行:
```bash
source ~/Desktop/クロードコード/.env
```

## 既存データベース一覧

| DB名 | 環境変数 | ID | Title Property |
|------|---------|-----|----------------|
| コンタクト（人脈DB） | NOTION_CONTACT_DB | 326d725a-9f17-81cd-82a9-d0c9fd8873eb | 氏名 |
| クライアント | NOTION_CLIENT_DB | 326d725a-9f17-8110-a412-eb9ae25a91c7 | 会社名 |
| ミーティング記録 | NOTION_MEETING_DB | 326d725a-9f17-81a0-9792-e2fab4587f07 | タイトル |
| 商談履歴 | NOTION_DEAL_DB | 326d725a-9f17-81f3-b9a1-eba1b8640980 | 件名 |
| タスク | NOTION_TASK_DB | 326d725a-9f17-81d4-a809-ca590e224507 | タスク名 |

## 既存DBスキーマ

### コンタクト（人脈DB）
- 氏名: title
- 会社名: rich_text
- 役職: rich_text
- メール: email
- 電話: phone_number
- ステータス: select → [初回接触, 商談中, 提案済み, 成約, 失注, 紹介者]
- 温度感: select → [🔥 高, 😊 中, 🧊 低]
- サービス関心: multi_select → [AIKOMON, AI相談, システム開発, AI研修, 採用支援]
- 業界: select → [IT・テクノロジー, 不動産, 士業・法律, 飲食, 美容, 医療・福祉, 教育, 金融・保険, 製造, 小売・EC, 広告・メディア, 建設, 人材, その他]
- 初回接触日: date
- 最終連絡日: date
- 出会った場所: rich_text
- メモ: rich_text

### クライアント
- 会社名: title
- 代表者: rich_text
- 担当者: rich_text
- メール: email
- 電話: phone_number
- 住所: rich_text
- 契約プラン: select → [AI相談プラン, AIKOMONプラン, プレミアムプラン, システム開発, AI研修]
- 契約状況: select → [契約中, 解約予定, 解約済み]
- 契約開始日: date
- 月額: number
- 請求書発行先: rich_text
- 契約書控え: url
- 最終連絡日: date
- メモ: rich_text

### ミーティング記録
- タイトル: title
- クライアント: relation → CLIENT_DB
- コンタクト: relation → CONTACT_DB
- 日時: date
- 参加者: rich_text
- 形式: select → [オンライン, 対面, 電話]
- ステータス: select → [予定, 完了, キャンセル]
- 要約: rich_text
- ネクストアクション: rich_text
- メモ: rich_text
- 録画リンク: url

### 商談履歴
- 件名: title
- コンタクト: relation → CONTACT_DB
- 日付: date
- 内容: rich_text
- 結果: select → [次回商談へ, 提案予定, 成約, 保留, 失注]
- ネクストアクション: rich_text
- メモ: rich_text

### タスク
- タスク名: title
- 期日: date
- ステータス: select → [未着手, 進行中, 完了, リスケ]
- 優先度: select → [高, 中, 低]
- ミーティング: relation → MEETING_DB
- コンタクト: relation → CONTACT_DB
- メモ: rich_text

## 操作ガイド

### 1. データベース作成
新しいDBが必要な場合、Notion APIでDB作成し、.envにIDを追記する。

**親ページの取得（DBはページの子として作成する必要あり）:**
```bash
# 既存DBの親ページを取得してそこに作る
curl -s "https://api.notion.com/v1/databases/$NOTION_CONTACT_DB" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" | python3 -c "
import json, sys
data = json.load(sys.stdin)
parent = data.get('parent', {})
print(json.dumps(parent, indent=2))
"
```

**DB作成:**
```bash
curl -s -X POST "https://api.notion.com/v1/databases" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"page_id": "【親ページID】"},
    "title": [{"text": {"content": "【DB名】"}}],
    "properties": {
      "【プロパティ名】": {"title": {}},
      ... 必要なプロパティを定義
    }
  }'
```

**作成後、.envに追記:**
```bash
echo 'NOTION_【DB名】_DB=【作成されたDB ID】' >> ~/Desktop/クロードコード/.env
```

**このスキルファイル（notion.md）にも新DBのスキーマ情報を追記すること。**

### 2. ページ作成（レコード追加）
```bash
curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"database_id": "【DB ID】"},
    "properties": { ... }
  }'
```

### 3. 検索・クエリ
```bash
curl -s -X POST "https://api.notion.com/v1/databases/【DB ID】/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": { ... },
    "sorts": [{ ... }],
    "page_size": 100
  }'
```

### 4. ページ更新
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/【ページID】" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": { ... }
  }'
```

### 5. ページ削除（アーカイブ）
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/【ページID】" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"archived": true}'
```

### 6. ページ内コンテンツ（ブロック）の追加
```bash
curl -s -X PATCH "https://api.notion.com/v1/blocks/【ページID】/children" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "children": [
      {
        "object": "block",
        "type": "paragraph",
        "paragraph": {
          "rich_text": [{"text": {"content": "テキスト"}}]
        }
      }
    ]
  }'
```

### 7. 横断検索
```bash
curl -s -X POST "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "【検索キーワード】",
    "filter": {"property": "object", "value": "page"}
  }'
```

## Notion APIプロパティ型リファレンス

各プロパティ型のJSON構造:

```
title:        {"title": [{"text": {"content": "値"}}]}
rich_text:    {"rich_text": [{"text": {"content": "値"}}]}
number:       {"number": 数値}
select:       {"select": {"name": "選択肢名"}}
multi_select: {"multi_select": [{"name": "値1"}, {"name": "値2"}]}
date:         {"date": {"start": "YYYY-MM-DD"}}
checkbox:     {"checkbox": true/false}
url:          {"url": "https://..."}
email:        {"email": "email@example.com"}
phone_number: {"phone_number": "090-xxxx-xxxx"}
relation:     {"relation": [{"id": "ページID"}]}
files:        {"files": [{"name": "ファイル名", "external": {"url": "URL"}}]}
```

## 実行ルール

1. **操作前に必ず確認**: 作成・更新・削除の前にユーザーに内容を確認する
2. **エラーハンドリング**: API エラー時はエラー内容を表示し、修正案を提示する
3. **結果表示**: 操作完了後、結果を人間が読みやすい形式で表示する
4. **新DB作成時**: .envへのID追記とこのスキルファイルへのスキーマ追記を忘れない
5. **ページネーション**: 100件以上ある場合は `has_more` と `next_cursor` で追加取得する
6. **リレーション**: 関連レコードを紐付ける際は、先に対象を検索してIDを取得する

## ユーザー指示の解釈例

| 指示 | 操作 |
|------|------|
| 「領収書のDB作って」 | DB作成 → .env追記 → スキーマ追記 |
| 「田中さんのステータスを商談中にして」 | コンタクトDB検索 → ページ更新 |
| 「今月のタスク一覧見せて」 | タスクDB期日フィルタクエリ |
| 「新しいクライアント追加して」 | 情報ヒアリング → ページ作成 |
| 「商談履歴を全部CSVにして」 | 全件クエリ → CSV出力 |
| 「コンタクトDBに"紹介元"プロパティ追加して」 | DB更新API |
