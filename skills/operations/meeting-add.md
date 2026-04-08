---
description: ミーティング記録をNotionに登録する（音声ファイルからの文字起こし対応）
---

# ミーティング記録登録スキル

## 概要
ミーティングの記録をNotionに登録する。音声・動画ファイルが提供された場合は文字起こし・要約を自動生成する。
ネクストアクションがある場合は、タスクDBにも自動登録する。

## 環境変数の読み込み
以下のファイルから環境変数を読み込んでください:
- `~/Desktop/クロードコード/.env`

## 入力の判定

### パターン1: 音声/動画ファイルが提供された場合
1. ファイルを文字起こし（Whisper API等が利用可能な場合）
2. 文字起こし結果から以下を自動抽出:
   - 要約（3-5行）
   - ネクストアクション（箇条書き）
   - 参加者（話者から推定）
3. 結果をユーザーに確認

### パターン2: テキストメモが提供された場合
1. テキストから要約・ネクストアクションを構造化
2. 結果をユーザーに確認

### パターン3: 情報なし（手動入力）
以下を順番に確認する:
- どの会社/人との打ち合わせか
- 日時
- 形式（オンライン/対面/電話）
- 話した内容・メモ
- ネクストアクション

## 紐付け先の検索
会社名・氏名でコンタクトDBとクライアントDBを検索し、リレーションで紐付ける。

### コンタクトDBを検索
```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_CONTACT_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "or": [
        {"property": "氏名", "title": {"contains": "【キーワード】"}},
        {"property": "会社名", "rich_text": {"contains": "【キーワード】"}}
      ]
    }
  }'
```

### クライアントDBを検索
```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_CLIENT_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "property": "会社名",
      "title": {"contains": "【キーワード】"}
    }
  }'
```

## Notion登録
```bash
curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"database_id": "$NOTION_MEETING_DB"},
    "properties": {
      "タイトル": {"title": [{"text": {"content": "【タイトル】"}}]},
      "クライアント": {"relation": [{"id": "【クライアントページID】"}]},
      "コンタクト": {"relation": [{"id": "【コンタクトページID】"}]},
      "日時": {"date": {"start": "【日時 YYYY-MM-DDTHH:MM:SS】"}},
      "参加者": {"rich_text": [{"text": {"content": "【参加者】"}}]},
      "形式": {"select": {"name": "【形式】"}},
      "ステータス": {"select": {"name": "完了"}},
      "要約": {"rich_text": [{"text": {"content": "【要約】"}}]},
      "ネクストアクション": {"rich_text": [{"text": {"content": "【ネクストアクション】"}}]},
      "録画リンク": {"url": "【録画URL（あれば）】"},
      "メモ": {"rich_text": [{"text": {"content": "【メモ】"}}]}
    }
  }'
```

リレーション先が見つからない場合は、該当のrelationプロパティを省略する。

## ネクストアクションのタスクDB自動登録
ミーティング登録後、ネクストアクションがある場合は**タスクDBにも自動で登録**する。

### タスク分割ルール
- ネクストアクションの各項目を個別のタスクとして登録する
- 期日の決め方:
  - ユーザーが明示した場合はそれに従う
  - 明示がない場合は、タスクの性質から適切な期日を判断する:
    - 軽いタスク（メール送信、資料共有など）→ 翌営業日
    - 中程度のタスク（資料作成、調査など）→ 2〜3営業日後
    - 重いタスク（提案書作成、開発作業など）→ 1週間後
  - 重いタスクは2日以上に分割してよい（例: 「提案書作成 - 構成検討」「提案書作成 - 本文執筆」）
- ミーティングとコンタクトへのリレーションを張る

### タスク登録API
```bash
curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"database_id": "$NOTION_TASK_DB"},
    "properties": {
      "タスク名": {"title": [{"text": {"content": "【タスク名】"}}]},
      "期日": {"date": {"start": "【期日 YYYY-MM-DD】"}},
      "ステータス": {"select": {"name": "未着手"}},
      "優先度": {"select": {"name": "【高/中/低】"}},
      "ミーティング": {"relation": [{"id": "【ミーティングページID】"}]},
      "コンタクト": {"relation": [{"id": "【コンタクトページID】"}]},
      "メモ": {"rich_text": [{"text": {"content": "【メモ】"}}]}
    }
  }'
```

### タスク登録後
- 登録したタスク一覧を表形式で表示する（タスク名・期日・優先度）
- ユーザーに期日の調整が必要か確認する

## 登録完了後
- 登録結果を簡潔に表示
- コンタクトDBの「最終連絡日」を今日の日付に更新する
- クライアントDBの「最終連絡日」も同様に更新する
