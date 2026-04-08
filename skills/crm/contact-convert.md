---
description: 成約したコンタクトをクライアントDBに昇格させる
---

# コンタクト → クライアント昇格スキル

## 概要
成約が決まったコンタクトの情報をクライアントDBに登録し、コンタクトDBのステータスを「成約」に更新する。

## 環境変数の読み込み
以下のファイルから環境変数を読み込んでください:
- `~/Desktop/クロードコード/.env`

## 手順

### 1. コンタクトの検索
$ARGUMENTSで指定された会社名または氏名でコンタクトDBを検索する。
（/contact-show と同じ検索ロジックを使用）

### 2. コンタクト情報の表示と確認
見つかったコンタクト情報を表示し、クライアントに昇格してよいか確認する。

### 3. 契約情報の追加確認
以下の情報をユーザーに確認する:
- 契約プラン（AI相談プラン / AIKOMONプラン / プレミアムプラン / システム開発 / AI研修）
- 月額（プランに応じたデフォルト値を提示: AI相談=49800, AIKOMON=250000, プレミアム=500000）
- 契約開始日
- 住所（契約書用）
- 代表者名（契約書用）
- 請求書発行先（住所と同じなら省略可）

### 4. クライアントDBに登録
```bash
curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"database_id": "$NOTION_CLIENT_DB"},
    "properties": {
      "会社名": {"title": [{"text": {"content": "【会社名】"}}]},
      "担当者": {"rich_text": [{"text": {"content": "【担当者名】"}}]},
      "契約プラン": {"select": {"name": "【プラン名】"}},
      "月額": {"number": 【月額】},
      "契約開始日": {"date": {"start": "【開始日】"}},
      "契約状況": {"select": {"name": "契約中"}},
      "メール": {"email": "【メール】"},
      "電話": {"phone_number": "【電話】"},
      "住所": {"rich_text": [{"text": {"content": "【住所】"}}]},
      "代表者": {"rich_text": [{"text": {"content": "【代表者名】"}}]},
      "請求書発行先": {"rich_text": [{"text": {"content": "【請求書発行先（未指定なら住所と同じ）】"}}]}
    }
  }'
```

### 5. コンタクトDBのステータスを更新
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/【コンタクトのページID】" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "ステータス": {"select": {"name": "成約"}}
    }
  }'
```

### 6. 完了メッセージ
- クライアント登録が完了した旨を表示
- 「契約書を生成しますか？」と確認し、Yesなら /contract-generate を案内する
