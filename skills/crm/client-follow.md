---
description: フォロー漏れのコンタクト・クライアントを検出し、推奨アクションとともに一覧表示する
---

# クライアントフォロー確認スキル

## トリガー
「フォロー確認」「クライアントフォロー」「client follow」

## 環境変数の読み込み
以下のファイルから環境変数を読み込んでください:
- `~/Desktop/with-AI/skills/documents/クロードコード/.env`

## 処理手順

### 1. コンタクトDBからフォロー必要な連絡先を取得

最終連絡日が14日以上前で、ステータスが「成約」「失注」以外のコンタクトを取得する。

```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_CONTACT_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {
          "property": "最終連絡日",
          "date": {
            "on_or_before": "'$(date -v-14d +%Y-%m-%d)'"
          }
        },
        {
          "property": "ステータス",
          "select": {
            "does_not_equal": "成約"
          }
        },
        {
          "property": "ステータス",
          "select": {
            "does_not_equal": "失注"
          }
        }
      ]
    },
    "sorts": [{"property": "最終連絡日", "direction": "ascending"}],
    "page_size": 100
  }'
```

### 2. クライアントDBからフォロー必要なクライアントを取得

最終連絡日が30日以上前のクライアントを取得する。

```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_CLIENT_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "property": "最終連絡日",
      "date": {
        "on_or_before": "'$(date -v-30d +%Y-%m-%d)'"
      }
    },
    "sorts": [{"property": "最終連絡日", "direction": "ascending"}],
    "page_size": 100
  }'
```

### 3. 経過日数の計算と推奨アクションの判定

各レコードの最終連絡日から今日までの経過日数を計算する。

推奨アクションは経過日数に応じて以下のルールで決定する:
- 14〜21日: メール（軽い接触で関係維持）
- 22〜30日: 電話（直接の会話で状況確認）
- 31日以上: 訪問（対面で関係を再構築）

### 4. 結果の表示

全件を経過日数の降順（最も長いものが上）でソートし、以下のフォーマットで表示する。

フォロー対象が0件の場合は「フォロー漏れなし」と表示する。

```
⚠️ フォロー必要（N件）

【コンタクト】（2週間以上）
| 氏名 | 会社名 | 最終連絡 | 経過日数 | 推奨アクション |
| ---- | ------ | -------- | -------- | -------------- |
| 田中太郎 | 株式会社〇〇 | 2026-02-15 | 41日 | 訪問 |
| 佐藤花子 | △△株式会社 | 2026-03-05 | 23日 | 電話 |

【クライアント】（1ヶ月以上）
| 会社名 | 最終連絡 | 経過日数 | 推奨アクション |
| ------ | -------- | -------- | -------------- |
| 株式会社ABC | 2026-01-20 | 67日 | 訪問 |
| DEF株式会社 | 2026-02-10 | 46日 | 訪問 |
```

最後に合計件数（コンタクト: X件、クライアント: Y件）を表示する。
