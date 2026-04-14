---
description: 朝の全自動ルーティン。「おはよう」「おは」「ohayou」で起動。予定確認・タスク整理・名刺登録・ニュース収集・メール確認・マーケレポート・デスクトップ整理を一括実行する。
---

# おはようスキル — 朝の全自動ルーティン

「おはよう」の一言で、以下の7つを順番に実行する。
各ステップは並列実行可能なものはAgentツールで並列化し、高速に処理する。

## 環境変数の読み込み
以下のファイルから環境変数を読み込んでください:
- `{{WITHAI_ROOT}}/skills/documents/クロードコード/.env`

---

## 実行順序

### Phase 1: 情報収集（並列実行）

以下の4つをAgentツールで同時に実行する:

#### 1. 今日の予定 + 天気確認
以下のスクリプトを実行して今日の予定と天気を取得する:

```bash
# カレンダー取得
node ~/.openclaw/workspace/skills/daily-morning-brief/scripts/fetch_calendar.js

# 天気取得
node ~/.openclaw/workspace/skills/daily-morning-brief/scripts/fetch_weather.js
```

Google Calendar MCP が利用可能な場合はそちらも併用する。
- 時間順に一覧表示
- Zoom/Meet等のリンクがあれば表示
- 参加者名を表示

#### 2. タスク確認 + リスケ
Notion タスクDB（$NOTION_TASK_DB）から:
- 今日が期日のタスクを取得
- 期限切れ（今日以前）の未完了タスクを取得
- 期限切れタスクは今後1週間の空き状況を見て**自動リスケ**する（確認不要）
  - 土日を避ける
  - 1日あたりの負荷を分散
  - 優先度「高」は直近の空き日へ
- リスケ結果をサマリー表示

```bash
# 今日以前の未完了タスク取得
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_TASK_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "期日", "date": {"on_or_before": "【今日の日付 YYYY-MM-DD】"}},
        {"property": "ステータス", "select": {"does_not_equal": "完了"}}
      ]
    },
    "sorts": [{"property": "期日", "direction": "ascending"}]
  }'
```

```bash
# 今後1週間のタスク状況（負荷把握用）
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_TASK_DB/query" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "期日", "date": {"after": "【今日の日付】"}},
        {"property": "期日", "date": {"on_or_before": "【1週間後の日付】"}},
        {"property": "ステータス", "select": {"does_not_equal": "完了"}}
      ]
    }
  }'
```

リスケ実行（期限切れタスクごと）:
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/【ページID】" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "期日": {"date": {"start": "【新しい期日 YYYY-MM-DD】"}},
      "ステータス": {"select": {"name": "リスケ"}}
    }
  }'
```

#### 3. 名刺スキャン
名刺フォルダをチェックし、未処理画像があれば自動登録する。
- フォルダ: `~/Library/CloudStorage/GoogleDrive-reis.kaito06112323@gmail.com/マイドライブ/名刺/`
- 処理済みフォルダ: 上記パス内の `処理済み/`
- 各画像をReadツールでOCR → Notion人脈DB（$NOTION_CONTACT_DB）に自動登録
- デフォルト値: ステータス「初回接触」、業界は推定、他は空欄
- 処理後は処理済みフォルダに移動

```bash
curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"database_id": "$NOTION_CONTACT_DB"},
    "properties": {
      "氏名": {"title": [{"text": {"content": "【氏名】"}}]},
      "会社名": {"rich_text": [{"text": {"content": "【会社名】"}}]},
      "役職": {"rich_text": [{"text": {"content": "【役職】"}}]},
      "メール": {"email": "【メール】"},
      "電話": {"phone_number": "【電話】"},
      "ステータス": {"select": {"name": "初回接触"}},
      "業界": {"select": {"name": "【業界（推定）】"}},
      "初回接触日": {"date": {"start": "【今日の日付 YYYY-MM-DD】"}}
    }
  }'
```

#### 4. AIニュース収集
morning-newsスキルを実行する。
- エージェント定義: {{WITHAI_ROOT}}/skills/operations/morning-news/.claude/agents/ 以下を参照
- 実行手順: orchestrator.md の指示に従い、rss-collector → person-tracker → analyser → notion-writer → publisher を順に実行
- 完了後、トップ5件のヘッドラインを取得
- ポータルサイト（aikomon-portal/news/）に自動公開される

---

### Phase 1.5: 秘書ブリーフィング — AIの稼働状況 + CEO判断事項

Phase 1完了後、秘書AIが以下を実行する。

#### 目的
「AIがいま何をしていて、カイトは何を判断すればいいか」を毎朝伝える。
カイトが指示を出す必要があるものだけを明確にする。それ以外は「自走中」と伝える。

#### 実行手順

**Step 1: 各CxOの稼働状況を収集**

以下のファイルを読み込み、進行中のプロジェクト・直近のアクションを把握する:
- `{{WITHAI_ROOT}}/secretary/projects/web-acquisition.md` — Web集客PJ（秘書管轄）
- `{{WITHAI_ROOT}}/cto/CTO.md` — CTO管轄PJ
- `{{WITHAI_ROOT}}/cfo/CFO.md` — CFO管轄
- `{{WITHAI_ROOT}}/cco/CCO.md` — CCO管轄
- `{{WITHAI_ROOT}}/caio/CAIO.md` — CAIO管轄
- `{{WITHAI_ROOT}}/clo/CLO.md` — CLO管轄
- `{{WITHAI_ROOT}}/skills/marketing/CMO.md` — CMO管轄

さらにNotionのタスクDBやカレンダーから、AI関連の進行タスク・ブロッカーを取得する。

**Step 2: 各部門の状態を3分類する**

| 状態 | 意味 | CEOアクション |
|---|---|---|
| 自走中 | 順調に進んでいる。秘書/CxOが自分で回せている | 不要（報告のみ） |
| 判断待ち | CEOの判断・承認がないと進めない | 必要（今日中に判断） |
| ブロック | 外部要因（審査待ち等）で止まっている | 不要（待つだけ） |

**Step 3: 出力**

```
──────────────────────────────
 秘書ブリーフィング — AIの動き
──────────────────────────────

【自走中 — 見てるだけでOK】
  CMO: ブログ記事「○○」を執筆中。今週2本目。
  CTO: 構造化データの実装を進行中。今日中に完了予定。
  CFO: 4月分の請求書を3件処理済み。残り2件は明日。
  CCO: イーネオランジェの月次フォロー実施済み。

【判断待ち — カイトが決めること】
  1. ○○のブログテーマ、AとBどっちで行く？
     → CMOが2案出してる。今日中に決めると今週公開できるよ
  2. 新規LP作る？ AIKOMONの専用LPをCMOが提案してる
     → 作るなら来週CTOがデプロイ。やめるならSEO記事に集中する
  3. Jungle Gym Safariの○○仕様、確認してほしい
     → CTOが設計書出してる。OKなら実装に入る

【ブロック — 待ち状態】
  CTO: GMO銀行API審査待ち（申請済み・先方返答待ち）
  CLO: ○○の契約書レビュー、先方確認待ち

【今週のWeb集客KPI】
  PV: XXX（目標: XXX / 進捗: XX%）
  問い合わせ: X件（目標: X件）
  記事公開: X本（目標: 2本）
  → 順調 or 「記事ペースが遅れてる。CMOに加速指示出す？」

──────────────────────────────
```

**判断待ちが0件の場合:**
```
【判断待ち】
  なし！今日はAIチームが全部自走してるから、カイトはクライアントワークに集中してね
```

**Step 4: 判断待ちのフォローアップ**
- 判断待ちの項目は、カイトが「1番はA」「2番やる」のように番号で即答できる形式にする
- 夕方のおつかれルーティンで未回答の判断待ちがあればリマインドする

---

### Phase 2: メール・マーケティング（並列実行）

Phase 1完了後、以下の2つを並列実行する:

#### 5. 未返信メール確認
以下のいずれかの方法でGmailを確認する（上から優先）:

**方法A: Gmail MCP（Claude Code経由の場合）**
Gmail MCPが利用可能なら `gmail_search_messages` で `is:unread` を検索。

**方法B: OpenClawブラウザ（Telegram経由の場合）**
```bash
openclaw browser navigate "https://mail.google.com/mail/u/0/#inbox"
openclaw browser snapshot
```
スナップショットから未読メールを読み取る。

**方法C: Google Apps Script（自動取得）**
Gmail APIをGASで叩いて未読メールをJSON取得するスクリプトを使用。

いずれの方法でも:
- 各メールの件名・送信者・受信日時・要約（1行）を表示
- 重要度が高いもの（クライアントからのメール、期限付きの依頼）を上部に表示
- 広告・通知系メールは除外

#### 6. マーケティングレポート（昨日の結果 + 今日の動き）
marketing-engineのdailyモードに準じた処理を実行する。

GA4データ取得（昨日分）:
- PV数、ユーザー数、セッション数
- 流入TOP5ページ
- 流入元（organic/direct/referral/social）の内訳
- 前日比・前週同曜日比

Search Consoleデータ取得（昨日分）:
- 表示回数、クリック数、平均CTR、平均掲順位
- 上昇/下降キーワードTOP3
- 新規表示キーワード

今日のアクション提案:
- SEO的にやるべきこと（順位変動への対応等）
- コンテンツの提案（キーワードギャップがあれば）

参考: {{WITHAI_ROOT}}/skills/marketing/marketing-engine/config/settings.json のGA4/SC設定値を使用
認証: {{WITHAI_ROOT}}/skills/credentials/ga4-service-account.json

---

### Phase 3: 整理

#### 7. デスクトップ整理
{{WITHAI_ROOT}}/skills/operations/desktop-cleaner/SKILL.md の定義に従い:
- ~/Desktop/ 上の散らかったファイルをスキャン
- 保護対象（with-AI/）は触らない
- 画像 → with-AI/assets/images/（screenshots/YYYY-MM/ 等に自動分類）
- ドキュメント → with-AI/assets/documents/（キーワードで自動分類）
- インストーラー(.dmg, .app) → 削除候補として報告（自動削除はしない）
- その他 → with-AI/assets/ の適切なサブフォルダへ
- **移動したファイルがあれば報告、なければ「デスクトップは綺麗です」**

---

## 出力フォーマット

全Phase完了後、以下のフォーマットでサマリーを表示する:

```
========================================
 おはようございます！ YYYY-MM-DD（曜日）
========================================

📅 今日の予定（N件）
  - HH:MM ○○株式会社（Zoom: リンク）
  - HH:MM 社内MTG
  - HH:MM △△様 初回面談

✅ タスク（今日: N件 / リスケ: M件）
  今日やること:
  - タスク名（優先度）
  - タスク名（優先度）
  リスケ済み:
  - タスク名: MM/DD → MM/DD に変更

🤝 名刺（N枚登録 / 0枚なら「未処理の名刺なし」）
  - 氏名（会社名）→ Notion登録済み

📰 AIニュース（N件収集）
  1. ヘッドライン...
  2. ヘッドライン...
  3. ヘッドライン...
  → ポータルNEWS更新済み

🤖 AIの動き
  【自走中】CMO: 記事執筆中 / CTO: 技術SEO対応中 / CFO: 請求処理済 / ...
  【判断待ち】
    1. ○○○？ → A or B で回答
    2. ○○○？ → やる or やめる で回答
  【ブロック】GMO審査待ち
  【Web集客】PV: XXX / 問い合わせ: X件 / 記事: X本

📧 未返信メール（N件）
  - 【重要】送信者: 件名（MM/DD）
  - 送信者: 件名（MM/DD）

📊 マーケティング（昨日の結果）
  PV: XXX（前日比 +X%）| ユーザー: XXX
  流入TOP: キーワード（順位X位）
  注目: 【上昇】キーワード +N位 / 【下降】キーワード -N位
  今日のアクション: ○○○

🖥️ デスクトップ整理
  - 移動: N件（screenshot.png → assets/images/screenshots/...）
  - または「デスクトップは綺麗です」

========================================
 所要時間: 約X分
========================================
```

## ルール
1. **全て自動実行** — ユーザーへの確認は不要（デスクトップのインストーラー削除のみ報告）
2. **エラーがあってもスキップして続行** — 1つのPhaseが失敗しても他を止めない
3. **簡潔に** — 各セクションは必要最低限の情報のみ。詳細はNotionで確認できる
4. **並列化を最大限活用** — Phase内のタスクはAgentツールで同時実行
