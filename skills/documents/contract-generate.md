---
description: 会社名を指定してNotionから情報を引き、契約書を自動生成する
---

# 契約書自動生成スキル

## 概要
会社名を指定すると、NotionクライアントDBから情報を取得し、契約書の空欄を埋めてdocxを生成する。

## 環境変数の読み込み
以下のファイルから環境変数を読み込んでください:
- `~/Desktop/クロードコード/.env`

## 手順

### 1. クライアント情報の取得
$ARGUMENTSで指定された会社名でクライアントDBを検索する。
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

### 2. 取得情報の表示と確認
以下の情報を表示して契約書生成に使ってよいか確認する:
- 会社名、住所、代表者名
- 担当者名
- 契約プラン、月額
- 契約開始日

### 3. 契約書の種類を確認
生成する契約書を確認する:
- AIKOMON業務委託契約書
- **AI SHINE業務委託契約書**
- システム開発契約書
- 秘密保持契約書（NDA）
- 営業代行業務委託契約書

### 4. 契約書テンプレートの読み込み
対応するmdテンプレートを読み込む:
- `~/Desktop/クロードコード/contracts/source/AIKOMON_業務委託契約書.md`
- `~/Desktop/クロードコード/contracts/source/AI_SHINE_業務委託契約書.md`
- `~/Desktop/クロードコード/contracts/source/システム開発契約書.md`
- `~/Desktop/クロードコード/contracts/source/秘密保持契約書_NDA.md`
- `~/Desktop/クロードコード/contracts/source/営業代行業務委託契約書.md`

### 5. 空欄の自動埋め
テンプレート内の以下の空欄をNotionの情報で置換する:
- `＿＿＿＿＿＿＿＿`（乙の会社名）→ Notionの会社名
- 乙の所在地 → Notionの住所
- 乙の代表者 → Notionの代表者
- 契約締結日 → 今日の日付
- サービス開始日 → Notionの契約開始日

**AI SHINE契約書の場合の追加置換:**
- 初期構築費用 → ユーザーに確認（金額欄は空欄のまま or 指定額）
- 選択プラン → ユーザーに確認（ライト/スタンダード/プレミアム）
- 月額料金 → ユーザーに確認（金額欄は空欄のまま or 指定額）
- 該当プランのチェックボックスに☑を記入

### 6. docx生成
`~/Desktop/クロードコード/contracts/source/generate_all.py` の共通ユーティリティを参考に、
空欄を埋めた契約書をdocxとして生成する。

出力先: `~/Desktop/クロードコード/contracts/templates/【会社名】_【契約書種類】.docx`

### 7. 完了メッセージ
- 生成したファイルのパスを表示
- 「このまま電子署名を送信しますか？」と案内（将来のLegal Sign連携用）
