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

## CTO（最高技術責任者AI）
技術プロジェクトの推進、API連携、システム構築、インフラ管理を統括。
- 定義: `{{WITHAI_ROOT}}/cto/CTO.md`
- エントリポイント: `skills/meta/cto.md`
- 状態: `{{WITHAI_ROOT}}/cto/state/`

## CLO（最高法務責任者AI）
契約書の自動生成・レビュー・台帳管理、法令リサーチ、リスク分析を統括。
- 定義: `~/Desktop/with-AI/clo/CLO.md`
- エントリポイント: `skills/meta/clo.md`

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

### 「CTO」「技術」「API連携」「自動化システム」「インフラ」「デプロイ」「設計」「実装」「開発」
→ `skills/meta/cto.md` を読み込み、CTO 技術モードを起動する。

### 「CLO」「法務」「契約書作成」「NDA」「リスク分析」「コンプライアンス」「登記」「役員変更」
→ `skills/meta/clo.md` を読み込み、CLO 法務モードを起動する。

### 「秘書」「secretary」
→ `skills/meta/secretary.md` を読み込み、秘書AIモードを起動する。
※ 秘書を明示的に呼ばなくても、曖昧な指示の場合は自動的に秘書が判断してルーティングする。

### 「イーネ」「イーネオランジェ」
→ 秘書AIが `clients/イーネオランジェ/CLAUDE.md` を読み込み、適切なイーネ専用エージェント（台本/投稿/分析/広告/請求/タスク/マニュアル）にルーティングする。

### 「Web集客」「集客どう」「集客KPI」「集客レビュー」
→ 秘書AI管轄。`secretary/projects/web-acquisition.md` を読み込み、秘書がCMO/CTOに指示を出してKPIを追跡する。

### 「SEO」「SEO対策」「検索順位」「webマーケ」
→ `skills/marketing/webmarketing-team.md` を読み込み、Webマーケ部門のSEO対策チームを起動する。
キーワード分析・技術SEO監査・競合チェック・コンテンツ計画を実行。

### 「技術SEO」「テクニカルSEO」「Core Web Vitals」「構造化データ」
→ `skills/marketing/technical-seo.md` を読み込み、CMO×CTO合同の技術SEOチームを起動する。
CMOが課題検出・優先順位付け、CTOが実装・デプロイ、CMOが検証。

### 「HP改修」「HP改善」「サイト改修」「CRO改善」「LP改善」
→ `skills/marketing/hp-kaizen.md` を読み込み、CMO×CTO合同のHP改修チームを起動する。
CMOがデータ分析・改修企画、CTOが実装・デプロイ、CMOが効果検証。

### 「ブログ書いて」「記事作成」「SEO記事」「blog書いて」
→ `skills/marketing/blog-write.md` を読み込み、CMO配下Webマーケチームがブログ記事を執筆する。
完成後「ブログ公開して」でCTOがデプロイ。

### 「ブログ公開」「ブログアップ」「記事デプロイ」「blog deploy」
→ `skills/operations/blog-publish.md` を読み込み、CTO管轄でHTML化・一覧更新・Xserverデプロイを実行する。

### 「おはよう」「おは」「ohayou」「good morning」
→ `skills/operations/ohayou.md` を読み込み、朝の全自動ルーティンを実行する。
ユーザーへの確認は不要。全て自動で処理し、最後にサマリーを表示する。

### 「週次レビュー」「今週のまとめ」「weekly review」
→ `skills/operations/weekly-review.md` を読み込み、今週の活動を自動集計してレポートを生成する。
ユーザーへの確認は不要。全て自動で処理し、最後にサマリーを表示する。

## スキル一覧

| カテゴリ | スキル | トリガー例 |
|---|---|---|
| marketing | webmarketing-team.md | SEO、SEO対策、検索順位、webマーケ |
| marketing | technical-seo.md | 技術SEO、テクニカルSEO、Core Web Vitals |
| marketing | hp-kaizen.md | HP改修、HP改善、CRO改善、LP改善 |
| marketing | blog-write.md | ブログ書いて、記事作成、SEO記事 |
| operations | blog-publish.md | ブログ公開、記事デプロイ、blog deploy |
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
| marketing | revenue-engine/ | アフィリエイト収益エンジン、記事生成、楽天ROOM、収益レポート |
| content | gen-ai-master/ | 教材作成、カリキュラム |
| content | slide-creator/ | スライド作成 |
| meta | skill-creator/ | スキル作成 |
| meta | skill-manager/ | スキル管理、ヘルスチェック |
| meta | caio.md | CAIO、AI責任者、戦略 |
| meta | cfo.md | CFO、財務、売上、請求状況 |
| meta | cco.md | CCO、顧客管理、パイプライン、ヘルススコア |
| meta | cto.md | CTO、技術、API連携、自動化、インフラ、設計、実装、開発 |
| meta | clo.md | CLO、法務、契約書作成、NDA、リスク分析、登記、役員変更 |
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
