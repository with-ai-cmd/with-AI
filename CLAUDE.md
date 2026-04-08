# with-AI プロジェクト

## 秘書AI（Executive Assistant）
CEOの全指示を受け取り、意図を解釈して最適な役職・スキルにルーティングする。
- 定義: `{{WITHAI_ROOT}}/secretary/SECRETARY.md`
- エントリポイント: `skills/meta/secretary.md`

## CAIO（最高AI責任者）
with-AI エコシステム全体の司令塔。戦略・品質・リソース・ロードマップを統括する。
- 定義: `{{WITHAI_ROOT}}/caio/CAIO.md`
- エントリポイント: `skills/meta/caio.md`
- 状態: `{{WITHAI_ROOT}}/caio/state/`（maturity.json, roadmap.json）

## CFO（最高財務責任者AI）
財務オペレーション全体を統括。請求・経費・売上・契約金銭の管理を行う。
- 定義: `{{WITHAI_ROOT}}/cfo/CFO.md`
- エントリポイント: `skills/meta/cfo.md`

## CCO（最高顧客責任者AI）
顧客ライフサイクル全体を統括。リード獲得→成約→サクセス→チャーン防止。
- 定義: `{{WITHAI_ROOT}}/cco/CCO.md`
- エントリポイント: `skills/meta/cco.md`
- サブエージェント: `{{WITHAI_ROOT}}/cco/agents/`（7体）
- 状態: `{{WITHAI_ROOT}}/cco/state/`（health-scores.json, pipeline.json）

## 環境変数
全スキル共通の環境変数ファイル:
- `{{WITHAI_ROOT}}/skills/documents/クロードコード/.env`

## スキルの場所
全スキルは `{{WITHAI_ROOT}}/skills/` 配下にカテゴリ別で格納されている。
- `skills/anthropic/` — Anthropic公式スキル（全ロール共通で利用可能）。各スキルは `SKILL.md` がエントリポイント。
  - ドキュメント系タスク（PDF/Excel/Word/PowerPoint）は社内スキルより高機能な公式版を優先利用すること。
  - 既存の `documents/pptx.md` はwith-AIブランド仕様のため、ブランド適用が必要な場合はそちらを使う。

## トリガーワード

### 「CAIO」「AI責任者」「戦略」
→ `skills/meta/caio.md` を読み込み、CAIO エグゼクティブモードを起動する。

### 「CFO」「財務」「売上」「請求状況」
→ `skills/meta/cfo.md` を読み込み、CFO 財務モードを起動する。

### 「CCO」「顧客管理」「パイプライン」「ヘルススコア」「360」
→ `skills/meta/cco.md` を読み込み、CCO 顧客管理モードを起動する。

### 「秘書」「secretary」
→ `skills/meta/secretary.md` を読み込み、秘書AIモードを起動する。
※ 秘書を明示的に呼ばなくても、曖昧な指示の場合は自動的に秘書が判断してルーティングする。

### 「おはよう」「おは」「ohayou」「good morning」
→ `skills/operations/ohayou.md` を読み込み、朝の全自動ルーティンを実行する。
ユーザーへの確認は不要。全て自動で処理し、最後にサマリーを表示する。

### 「週次レビュー」「今週のまとめ」「weekly review」
→ `skills/operations/weekly-review.md` を読み込み、今週の活動を自動集計してレポートを生成する。
ユーザーへの確認は不要。全て自動で処理し、最後にサマリーを表示する。

## スキル一覧

| カテゴリ | スキル | トリガー例 |
|---|---|---|
| operations | ohayou.md | おはよう、おは |
| operations | morning-news.md | ニュース、朝のニュース |
| operations | 確認.md | タスク確認、今日のタスク |
| operations | meeting-add.md | ミーティング記録、会議メモ |
| operations | meeting-memo.md | 会議メモ作成 |
| operations | notion.md | Notion検索、DB操作 |
| operations | weekly-review.md | 週次レビュー、今週のまとめ |
| operations | learning-note.md | 学習ノート作成、今日の学習まとめ |
| operations | oyasumi.md | おやすみ |
| operations | polepole.md | ポレポレ |
| crm | contact-add.md | 名刺登録、コンタクト追加 |
| crm | contact-show.md | コンタクト検索、名刺検索 |
| crm | contact-list.md | コンタクト一覧 |
| crm | contact-convert.md | 成約、クライアント昇格 |
| crm | client-follow.md | クライアントフォロー |
| crm | contract-manage.md | 契約管理、契約確認、契約一覧 |
| finance | invoice-generate.md | 請求書作成、請求書生成 |
| finance | invoice-batch.md | 請求書一斉発行、月次請求 |
| finance | receipt-add.md | 領収書登録 |
| finance | receipt-list.md | 領収書一覧 |
| finance | receipt-summary.md | 経費まとめ |
| finance | sales-summary.md | 売上まとめ |
| documents | proposal-generate.md | 提案書作成 |
| documents | contract-generate.md | 契約書作成 |
| documents | intro-generate.md | 紹介文作成 |
| documents | estimate-generate.md | 見積もり作成、estimate |
| documents | pptx.md | パワポ作成 |
| marketing | marketing-engine/ | マーケレポート、SEO分析、ブログ作成 |
| marketing | sns-draft.md | SNS投稿下書き |
| content | gen-ai-master/ | 教材作成、カリキュラム |
| content | slide-creator/ | スライド作成 |
| meta | skill-creator/ | スキル作成 |
| meta | skill-manager/ | スキル管理、ヘルスチェック |
| meta | caio.md | CAIO、AI責任者、戦略 |
| meta | cfo.md | CFO、財務、売上、請求状況 |
| meta | cco.md | CCO、顧客管理、パイプライン、ヘルススコア |
| meta | secretary.md | 秘書、何でも指示を受けてルーティング |
| **anthropic** | **Anthropic公式スキル（全ロール共通）** | |
| anthropic | pdf/ | PDF作成・編集・結合・分割・OCR・フォーム入力 |
| anthropic | docx/ | Word文書作成・編集 |
| anthropic | xlsx/ | Excelスプレッドシート作成・編集 |
| anthropic | pptx/ | PowerPoint作成・編集（汎用） |
| anthropic | frontend-design/ | フロントエンドUI/UXデザイン |
| anthropic | canvas-design/ | キャンバスデザイン・ビジュアル生成 |
| anthropic | brand-guidelines/ | ブランドガイドライン策定 |
| anthropic | theme-factory/ | テーマ・スタイリング生成 |
| anthropic | algorithmic-art/ | アルゴリズムアート生成 |
| anthropic | doc-coauthoring/ | ドキュメント共同執筆 |
| anthropic | internal-comms/ | 社内コミュニケーション文書作成 |
| anthropic | slack-gif-creator/ | Slack用GIF作成 |
| anthropic | mcp-builder/ | MCPサーバー構築 |
| anthropic | webapp-testing/ | Webアプリテスト |
| anthropic | web-artifacts-builder/ | Webアーティファクト構築 |
| anthropic | skill-creator/ | スキル作成支援（公式版） |
| anthropic | claude-api/ | Claude API/SDKリファレンス |
