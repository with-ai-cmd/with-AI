# SKILLS - スキル一括管理

全21スキルをカテゴリ別に整理。`~/.claude/commands/` へのシンボリックリンクにより `/スキル名` で呼び出し可能。

---

## フォルダ構成

```
SKILLS/
├── crm/                    顧客管理
│   ├── contact-add.md
│   ├── contact-show.md
│   ├── contact-list.md
│   └── contact-convert.md
│
├── finance/                経理
│   ├── receipt-add.md
│   ├── receipt-list.md
│   └── receipt-summary.md
│
├── documents/              書類生成
│   ├── proposal-generate.md
│   ├── contract-generate.md
│   ├── intro-generate.md
│   ├── pptx.md
│   └── クロードコード/      会社情報・テンプレート・画像素材
│       ├── company/         profile, mission, services, strengths, brand
│       ├── contracts/       契約書テンプレート・生成スクリプト
│       ├── proposals/       提案書テンプレート・生成スクリプト
│       └── img/             ロゴ・カバー画像
│
├── content/                コンテンツ制作
│   ├── gen-ai.md
│   ├── gen-ai-master/       e-learning教材生成本体
│   │   ├── scripts/         PDF変換・ドキュメント生成・Gドライブアップロード
│   │   ├── curriculum/      カリキュラム構成JSON
│   │   └── references/      ライティングガイド・サンプル
│   ├── slide-creator.md
│   └── slide-creator/       スライド生成本体
│       └── agents/          nanobanana-slide, html-slide
│
├── marketing/              マーケティング
│   ├── marketing-engine.md
│   └── marketing-engine/    マーケ自動化本体
│       ├── agents/          analytics, seo-optimizer, content-writer,
│       │                    case-study, competitor-intel, site-deployer,
│       │                    report-publisher
│       └── config/          settings.json（サイト・サーバー・SEO設定）
│
├── operations/             業務・運用
│   ├── morning-news.md
│   ├── morning-news/        AIニュースエージェント本体
│   │   └── .claude/agents/  orchestrator, rss-collector, person-tracker,
│   │                        analyser, notion-writer, publisher
│   ├── notion.md
│   ├── meeting-add.md
│   ├── 確認.md
│   ├── polepole.md
│   ├── polepole/            POLEPOLE入園システム（GASコード）
│   └── line-notion-server/  LINE-Notion連携サーバー
│
├── meta/                   管理系
│   ├── skill-manager.md
│   ├── skill-manager/       スキル管理メタエージェント本体
│   │   ├── agents/          auditor, optimizer, registrar,
│   │   │                    doctor, reporter, keykeeper
│   │   ├── config/          registry.json, settings.json
│   │   └── scripts/         Notion同期・サブエージェント管理
│   ├── skill-creator.md
│   └── skill-creator/       スキル作成エージェント本体
│       ├── agents/          grader, comparator, analyzer
│       ├── references/      schemas
│       └── scripts/         評価・レポート・パッケージング
│
└── credentials/            認証情報
    └── ga4-service-account.json
```

---

## APIキー一覧

| キー | サービス | 保管場所 | 使用スキル |
|------|---------|---------|-----------|
| NOTION_API_TOKEN | Notion | documents/クロードコード/.env | CRM, finance, documents, operations, marketing |
| NOTION_*_DB (6種) | Notion DB ID | documents/クロードコード/.env | 各スキル |
| NANOBANANA_API_KEY | nanobanana | ~/.claude/settings.local.json | slide-creator, gen-ai |
| GEMINI_API_KEY | Google Gemini | operations/line-notion-server/.env | line-notion-server |
| LINE_CHANNEL_ACCESS_TOKEN | LINE | operations/line-notion-server/.env | line-notion-server |
| GA4 Service Account | Google Analytics | credentials/ga4-service-account.json | marketing-engine |

---

## シンボリックリンク

```
~/.claude/commands/*.md          → ~/SKILLS/{category}/*.md
~/Desktop/claude code/*          → ~/SKILLS/{category}/*
~/morning-news                   → ~/SKILLS/operations/morning-news
~/Projects/polepole-enrollment-system → ~/SKILLS/operations/polepole
```

---

## 新規スキル追加手順

1. 該当カテゴリフォルダにコマンド定義 `.md` を作成
2. `ln -s ~/SKILLS/{category}/新スキル.md ~/.claude/commands/新スキル.md`
3. サブエージェントがある場合はフォルダも作成
4. `/skill-manager` で登録・ヘルスチェック
