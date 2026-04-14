# Webマーケティング部門（CMO配下）

## 概要
with-AI HPの集客・コンバージョンを最大化するWebマーケチーム。
SEO対策、ブログ運用、競合分析、データ分析を統括する。

## 組織図

```
CMO（最高マーケティング責任者）
  │
  └── Webマーケティング部門（このファイル）
        │
        ├── 1. SEO対策チーム
        │   ├── seo-optimizer     — キーワード戦略・技術SEO監査
        │   ├── analytics         — GA4/Search Console データ分析
        │   └── seo-audit.md      — 定期SEO監査タスク
        │
        ├── 2. コンテンツチーム
        │   ├── blog-write.md     — ブログ記事の企画・執筆
        │   ├── content-writer    — SEO最適化されたHTML記事生成
        │   └── case-study        — 事例ページ生成
        │
        ├── 3. 競合・市場分析チーム
        │   └── competitor-intel  — 競合監視・市場トレンド分析
        │
        ├── 4. レポート・改善チーム
        │   └── report-publisher  — 月次レポート・改善提案
        │
        ├── 5. 技術SEOチーム（CMO × CTO 合同）  ← NEW
        │   └── technical-seo.md  — SEO技術課題の検出→CTO実装→検証
        │
        └── 6. HP改修チーム（CMO × CTO 合同）  ← NEW
            └── hp-kaizen.md      — UI/UX改善・ページ追加・導線最適化

※ デプロイ（公開）はCTO管轄（blog-publish.md）
```

## トリガー
「SEO」「SEO対策」「検索順位」「webマーケ」で起動

## SEO対策チームの定期タスク

### 週次タスク（毎週月曜）
1. **Search Console チェック** — analytics エージェント起動
   - 検索クエリ TOP50 のインプレッション・クリック・CTR・順位変動
   - 急上昇/急降下キーワードの特定
   - 新規表示キーワードの発見

2. **キーワード分類** — seo-optimizer 起動
   - 金脈キーワード（順位4〜10位）→ title/description 最適化
   - 成長キーワード（順位11〜20位）→ コンテンツ強化
   - CTR改善候補（順位高いがCTR低い）→ title改善
   - 新規記事候補 → content-writer に依頼

3. **競合チェック** — competitor-intel 起動
   - 競合の新規ページ・記事の確認
   - 順位逆転されたキーワードの対策

### 月次タスク（毎月1日）
1. **技術SEO監査**
   - 全ページの meta title / description チェック
   - 構造化データ（JSON-LD）の検証
   - Core Web Vitals の確認
   - 内部リンク構造の最適化
   - サイトマップ更新

2. **コンテンツ計画**
   - 来月の記事テーマ8本を決定（週2本ペース）
   - キーワードマッピング
   - 既存記事のリフレッシュ対象選定

3. **月次SEOレポート**
   - PV / ユーザー数 / 検索流入 の推移
   - キーワード順位変動サマリー
   - 問い合わせ数（CVR）
   - 改善施策の成果検証

## SEO監査チェックリスト

### テクニカルSEO
- [ ] 全ページに canonical URL
- [ ] 全ページに meta description（120文字以内）
- [ ] 全ページに OG / Twitter Card
- [ ] 構造化データ（JSON-LD）設置
- [ ] robots.txt / sitemap.xml 最新化
- [ ] モバイルフレンドリー
- [ ] ページ読み込み速度 3秒以内
- [ ] HTTPS 全ページ対応
- [ ] 404エラーページなし
- [ ] 画像 alt 属性設定

### コンテンツSEO
- [ ] h1 はページに1つ
- [ ] h2 にメインキーワード含む
- [ ] 本文 2000文字以上（ブログ記事）
- [ ] 内部リンク 3本以上
- [ ] CTA（問い合わせ導線）設置
- [ ] 最終更新日が6ヶ月以内

### with-AI HP 対象ページ
| ページ | URL | 主要キーワード |
|---|---|---|
| TOP | / | AI導入, DX推進, AI伴走 |
| AIKOMON | /aikomon.html | 社外AI責任者, AI導入コンサル |
| AI SHINE | /aishine.html | AIエージェント構築, AI社員 |
| Service | /service.html | AI導入サービス |
| Stance | /stance.html | AI活用方針 |
| Company | /company.html | with-AI株式会社 |
| Blog | /blog/ | AI最新動向, AI活用 |
| Contact | /contact.html | AI導入相談 |

## 実行コマンド例

```
「SEO対策して」     → このファイルを読み込み、定期タスクを実行
「検索順位チェック」 → analytics → seo-optimizer の順に実行
「競合分析して」     → competitor-intel を実行
「ブログ書いて」     → blog-write.md → content-writer の順に実行
「ブログ公開して」   → CTO の blog-publish.md にハンドオフ
「SEOレポート」      → report-publisher で月次レポート生成
```
