# ブログ記事公開スキル（CTO管轄）

## トリガー
「ブログ公開」「ブログアップ」「記事デプロイ」「blog deploy」

## 概要
CMO配下のWebマーケチーム（content-writer）が作成した記事原稿を受け取り、
HTML化 → blog/index.html更新 → index.html更新 → Xserverデプロイする。

## 運用フロー
```
CMO配下 Webマーケチーム（content-writer）
  │ 記事テーマ選定 → 執筆 → SEO最適化 → 原稿完成
  │
  ▼ 原稿を渡す（Markdown or テキスト）
CTO（このスキル）
  │ HTML化 → デザインシステム適用 → 一覧更新 → デプロイ
  ▼
本番公開 (with-ai.jp/blog/)
```

**記事の「書く」はCMO管轄、「公開する」はCTO管轄。**

## ファイル構成
- ローカル: `~/Desktop/hp/with-AI HP/blog/`
- サーバー: `xserver:~/with-ai.jp/public_html/blog/`
- SSH設定: `~/.ssh/config` の `Host xserver`

## 実行手順

### Step 1: 記事テーマの確認
ユーザーにテーマを確認。指定がなければ提案する。

### Step 2: 記事HTML生成
以下のテンプレートに従って `~/Desktop/hp/with-AI HP/blog/{slug}.html` を生成する。

**テンプレート要件:**
- デザインシステム: Albert Sans / Zen Kaku Gothic New / JetBrains Mono
- 背景: #EDEDF0 + グリッドパターン
- 記事本文: ガラスカード内 (rgba(255,255,255,.45) + backdrop-filter)
- 3D SVGオブジェクト + Orbs (他ブログ記事と同じ)
- 右サイドナビ (Blog active)
- モバイルハンバーガー
- ダークフッター
- GSAP + ScrollTrigger
- SEO: title, meta description, OG/Twitter cards, structured data (Article + BreadcrumbList)
- Google Analytics: G-JJ4T5HCY4Y
- リンクは全て ../ プレフィックス
- 本文フォント: 16px以上, line-height 2, color rgba(59,59,59,.75)
- 見出し h2: color var(--blue), font-weight 900

**既存記事を参考にする:** `~/Desktop/hp/with-AI HP/blog/ai-agent-evolution-2026.html`

### Step 3: blog/index.html 更新
`~/Desktop/hp/with-AI HP/blog/index.html` のカードグリッドに新しい記事カードを追加する。
- 最新記事を一番上に配置
- ガラスカード + 日付 + カテゴリタグ + タイトル + 概要

### Step 4: index.html のブログセクション更新
`~/Desktop/hp/with-AI HP/index.html` のPANEL 3 (BLOG) セクションの記事リンクを更新。
- 最新3件を表示

### Step 5: デプロイ
```bash
rsync -avz -e "ssh" \
  ~/Desktop/hp/with-AI\ HP/blog/ \
  xserver:~/with-ai.jp/public_html/blog/

rsync -avz -e "ssh" \
  ~/Desktop/hp/with-AI\ HP/index.html \
  xserver:~/with-ai.jp/public_html/
```

### Step 6: 確認
デプロイ後のURLを提示:
- 記事: https://with-ai.jp/blog/{slug}.html
- 一覧: https://with-ai.jp/blog/

## カテゴリ一覧
- AI Trends (色: cyan)
- AI Tools (色: yellow)
- AI x 補助金 (色: teal)
- Business (色: blue)
- Tutorial (色: purple)
