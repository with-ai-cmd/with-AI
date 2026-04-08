# Notion DBスキーマ定義

## NEWS_RAW DB（作業用ニュースDB）

| プロパティ名 | タイプ | 説明 |
|---|---|---|
| title | title | 記事タイトル |
| url | url | 記事URL |
| source | select | TechCrunch / Zenn / nitter 等 |
| importance | select | 高 / 中 / 低 |
| score | number | スコア数値 |
| action_required | checkbox | 今すぐ触るべきか |
| action_reason | rich_text | アクション理由 |
| summary_ja | rich_text | 日本語要約（200字以内） |
| tools_mentioned | multi_select | 言及されたAIツール名 |
| published_at | date | 記事公開日時 |
| collected_at | date | 収集日時 |
| status | select | 未処理 / 記事化済 / 投稿済 |

## WATCH_LIST DB（ウォッチリスト管理）

| プロパティ名 | タイプ | 説明 |
|---|---|---|
| name | title | 表示名 |
| username | rich_text | @から始まるユーザー名 |
| platform | select | X / LinkedIn 等 |
| active | checkbox | 追跡中かどうか |
| priority | select | 高 / 中 / 低 |

## Notion API エンドポイント

- DB作成: POST https://api.notion.com/v1/databases
- ページ作成: POST https://api.notion.com/v1/pages
- ブロック取得: GET https://api.notion.com/v1/blocks/{block_id}/children
- ブロック追加: PATCH https://api.notion.com/v1/blocks/{block_id}/children
- ブロック削除: DELETE https://api.notion.com/v1/blocks/{block_id}
- DB検索: POST https://api.notion.com/v1/databases/{database_id}/query

## API ヘッダー
```
Authorization: Bearer {NOTION_API_KEY}
Notion-Version: 2022-06-28
Content-Type: application/json
```
