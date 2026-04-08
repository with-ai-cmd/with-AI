---
description: コンタクト一覧をステータスやサービス関心でフィルタして表示する
---

# コンタクト一覧スキル

## 概要
Notion人脈DBのコンタクトを一覧表示する。ステータスやサービス関心でフィルタ可能。

## 環境変数の読み込み
以下のファイルから環境変数を読み込んでください:
- `~/Desktop/クロードコード/.env`

## 引数の解析
$ARGUMENTSを解析する。引数がない場合は全件表示。

- `商談中` → ステータスが「商談中」のみ
- `提案済み` → ステータスが「提案済み」のみ
- `成約` → ステータスが「成約」のみ
- `AIKOMON` → サービス関心に「AIKOMON」を含む
- 引数なし → 全件（最終連絡日の降順）

## 検索実行
```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_CONTACT_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "sorts": [{"property": "最終連絡日", "direction": "descending"}],
    "page_size": 50
  }'
```

フィルタがある場合はfilterプロパティを追加する。

## 表示フォーマット
テーブル形式で簡潔に表示する:

```
ステータス | 氏名        | 会社名      | 関心        | 最終連絡
---------- | ----------- | ----------- | ----------- | ----------
商談中     | 田中太郎    | 株式会社〇〇 | AIKOMON    | 2026-03-15
初回接触   | 佐藤花子    | △△株式会社  | AI研修     | 2026-03-10
```

最後に合計件数を表示する。
