---
description: 会社名や氏名でコンタクト情報をNotionから検索・表示する
---

# コンタクト検索・表示スキル

## 概要
会社名や氏名でNotion人脈DBを検索し、コンタクト情報と関連する商談履歴・ミーティング記録を表示する。

## 環境変数の読み込み
以下のファイルから環境変数を読み込んでください:
- `~/Desktop/クロードコード/.env`

## 検索実行
ユーザーが指定した検索キーワード（$ARGUMENTS）で、コンタクトDBを検索する。

### 1. 氏名で検索
```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_CONTACT_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "property": "氏名",
      "title": {"contains": "【検索キーワード】"}
    }
  }'
```

### 2. 会社名で検索（氏名で見つからない場合）
```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_CONTACT_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "property": "会社名",
      "rich_text": {"contains": "【検索キーワード】"}
    }
  }'
```

### 3. クライアントDBも検索
```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_CLIENT_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "property": "会社名",
      "title": {"contains": "【検索キーワード】"}
    }
  }'
```

## 表示フォーマット
検索結果を以下のフォーマットで表示する:

```
━━━ 【氏名】（【会社名】）━━━
役職:       【役職】
連絡先:     【メール】 / 【電話】
ステータス: 【ステータス】
関心:       【サービス関心】
初回接触:   【初回接触日】（【出会った場所】）
最終連絡:   【最終連絡日】
メモ:       【メモ】
━━━━━━━━━━━━━━━━━━━━━
```

### 4. 関連する商談履歴を取得
見つかったコンタクトのIDで商談履歴DBを検索し、時系列で表示する。

### 5. 関連するミーティング記録を取得
見つかったコンタクトまたはクライアントのIDでミーティング記録DBを検索し、時系列で表示する。
