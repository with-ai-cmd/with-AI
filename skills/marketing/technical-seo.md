# 技術SEOチーム（CMO × CTO 合同）

## トリガー
「技術SEO」「テクニカルSEO」「サイト速度」「Core Web Vitals」「構造化データ」

## 概要
CMO配下Webマーケチームが検出したSEO技術課題を、CTOが実装・デプロイする合同チーム。
**課題発見 = CMO管轄、技術実装 = CTO管轄。**

## 組織図

```
CMO（課題発見・優先順位付け）          CTO（技術実装・デプロイ）
  │                                    │
  ├── analytics        ──検出──→       ├── HTML/CSS修正
  ├── seo-optimizer    ──指示──→       ├── 構造化データ実装
  └── report-publisher ──検証──→       └── Xserverデプロイ
```

## 連携フロー

```
Step 1: CMO側 — 課題検出
  analytics / seo-optimizer が以下をチェック:
  - Core Web Vitals（LCP / FID / CLS）
  - 構造化データ（JSON-LD）の欠落・エラー
  - meta title / description の不備
  - canonical URL / hreflang の設定
  - robots.txt / sitemap.xml の整合性
  - モバイルフレンドリー
  - HTTPS / リダイレクト問題
  - 画像最適化（WebP化、alt属性、遅延読み込み）
  - 内部リンク切れ / 404エラー

Step 2: CMO側 — 優先順位付け
  検出した課題を以下の基準でランク付け:
  | 優先度 | 基準 | 例 |
  |---|---|---|
  | P0（即対応） | CVに直結 or インデックス阻害 | robots.txtブロック、404、HTTPS混在 |
  | P1（今週） | 検索順位に影響大 | Core Web Vitals赤、構造化データエラー |
  | P2（今月） | SEO改善効果あり | meta最適化、画像圧縮、内部リンク強化 |
  | P3（バックログ） | あると良い | マイナーなスキーマ追加 |

Step 3: CTO側 — 技術実装
  CMOから受け取った課題リストを実装:
  - HTML/CSS/JSの修正
  - 構造化データ（JSON-LD）の追加・修正
  - .htaccess / リダイレクト設定
  - 画像最適化・WebP変換
  - サイトマップ再生成

Step 4: CTO側 — デプロイ
  rsync -avz -e "ssh" ~/Desktop/hp/with-AI\ HP/ xserver:~/with-ai.jp/public_html/

Step 5: CMO側 — 検証
  デプロイ後にリッチリザルトテスト / PageSpeed Insights で検証
  → 問題なければ完了、問題あればStep 3に戻す
```

## 定期実行スケジュール

| 頻度 | 担当 | アクション |
|---|---|---|
| 週次（月曜） | CMO | Search Console エラーチェック → P0/P1を抽出 |
| 月次（1日） | CMO | 全ページ技術SEO監査 → 課題リスト作成 |
| 月次（1日） | CTO | CMOの課題リストを受け取り実装 |
| 四半期 | CMO+CTO | Core Web Vitals 総合レビュー + 大規模改善 |

## 対象ページ

| ページ | URL | 主要チェック項目 |
|---|---|---|
| TOP | / | LCP、構造化データ（Organization）、OG |
| AIKOMON | /aikomon.html | 構造化データ（Service）、FAQ schema |
| AI SHINE | /aishine.html | 構造化データ（Service）、FAQ schema |
| Service | /service.html | 構造化データ（Service）|
| Blog一覧 | /blog/ | BreadcrumbList、ページネーション |
| Blog記事 | /blog/*.html | Article schema、パンくず |
| Contact | /contact.html | ページ速度、フォーム最適化 |

## 実行コマンド

```
「技術SEOチェック」  → CMO側: 全ページ監査 → 課題リスト生成
「技術SEO対応して」  → CTO側: 最新の課題リストを実装・デプロイ
「PageSpeed確認」    → CMO側: PageSpeed Insights で全ページ計測
```
