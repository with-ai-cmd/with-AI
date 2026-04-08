---
description: カジュアルな報告文から打ち合わせ内容を自動構造化してNotionに登録する。「〇〇と打ち合わせした」「商談メモ」「MTGメモ」「meeting memo」などのキーワードや、打ち合わせ報告っぽいメッセージで発動。
---

# 打ち合わせメモ（クイック登録）

## 概要
ユーザーのカジュアルな一言から打ち合わせ内容を読み取り、Notionに構造化して登録する。
確認は最小限。「言われたことをそのまま整理して保存する」がコンセプト。

## 環境変数の読み込み
以下のファイルから環境変数を読み込む:
- `{{WITHAI_ROOT}}/skills/documents/クロードコード/.env`

## ステップ1: ユーザーの発言をパースする

ユーザーのフリーテキスト（例: 「今日タイムさんと打ち合わせしてAIKOMON導入の話した。来週までに提案書作ることになった」）から以下を抽出する:

| 項目 | 抽出ルール |
|------|-----------|
| 相手（会社名/人名） | 「〇〇さん」「〇〇と」「〇〇との」などから推定 |
| 日時 | 「今日」「昨日」「さっき」→ 実際の日付に変換。明示なければ今日とする |
| 内容 | 何の話をしたか。全体の要約 |
| 決定事項 | 「〜になった」「〜で決まった」「〜することにした」 |
| ネクストアクション | 「〜する」「〜作る」「〜送る」「〜までに」など、未来の行動 |

抽出結果をユーザーに簡潔に見せて確認する:

```
📝 こう整理しました:

相手: 株式会社タイム
日時: 2026-03-28
内容: AIKOMON導入についての打ち合わせ
決定事項: 提案書を来週までに作成
ネクストアクション:
  - 提案書作成（期日: 2026-04-03）

これでNotionに登録しますか？（はい / 修正あれば教えてください）
```

**不足情報の扱い**: 会社名/人名が不明の場合のみ聞き返す。それ以外は推定で埋めて進む。

## ステップ2: コンタクト/クライアントを検索

会社名・人名でコンタクトDBとクライアントDBを検索し、リレーション先を特定する。

### コンタクトDB検索
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

### クライアントDB検索
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

複数ヒットした場合はユーザーに選ばせる。見つからない場合はリレーションなしで登録し、その旨を伝える。

## ステップ3: ミーティングDBに登録

タイトルは「会社名 + 日付」の形式にする（例: 「タイム 2026-03-28」）。

```bash
curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"database_id": "$NOTION_MEETING_DB"},
    "properties": {
      "タイトル": {"title": [{"text": {"content": "【会社名 YYYY-MM-DD】"}}]},
      "クライアント": {"relation": [{"id": "【クライアントページID】"}]},
      "コンタクト": {"relation": [{"id": "【コンタクトページID】"}]},
      "日時": {"date": {"start": "【日時 YYYY-MM-DDTHH:MM:SS】"}},
      "ステータス": {"select": {"name": "完了"}},
      "要約": {"rich_text": [{"text": {"content": "【内容 + 決定事項をまとめた要約】"}}]},
      "ネクストアクション": {"rich_text": [{"text": {"content": "【ネクストアクション箇条書き】"}}]}
    }
  }'
```

リレーション先が見つからなかったプロパティは省略する。

## ステップ4: ネクストアクションをタスクDBに自動登録

ネクストアクションの各項目を個別タスクとして登録する。

### 期日の推定ルール
- ユーザーが「来週までに」「金曜まで」など明示した場合 → その日付
- 明示なしの場合:
  - 軽いタスク（メール送信、資料共有、連絡など）→ 翌営業日
  - 中程度のタスク（資料作成、調査など）→ 2〜3営業日後
  - 重いタスク（提案書作成、開発作業など）→ 1週間後
- 土日は避けて営業日で計算する

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
      "メモ": {"rich_text": [{"text": {"content": "【打ち合わせからのアクション】"}}]}
    }
  }'
```

## ステップ5: コンタクトの最終連絡日を更新

コンタクトが見つかっている場合、「最終連絡日」を今日の日付に更新する。

```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/【コンタクトのページID】" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "最終連絡日": {"date": {"start": "【今日の日付 YYYY-MM-DD】"}}
    }
  }'
```

クライアントDBにもヒットしていた場合は、そちらの「最終連絡日」も同様に更新する。

## ステップ6: 完了レポート

登録結果をまとめて表示する:

```
✅ ミーティングメモを登録しました

📋 タイム 2026-03-28
  内容: AIKOMON導入についての打ち合わせ
  決定: 提案書を来週までに作成

📌 作成したタスク:
| タスク名 | 期日 | 優先度 |
|---------|------|--------|
| 提案書作成 | 2026-04-03 | 高 |

🔄 タイムさんの最終連絡日を更新しました
```
