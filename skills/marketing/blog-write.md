# ブログ記事執筆スキル（CMO / Webマーケチーム管轄）

## トリガー
「ブログ書いて」「記事作成」「blog」「SEO記事」

## 概要
with-AI HPのブログ記事を企画・執筆する。
完成した原稿はCTO（blog-publish.md）に渡してHTML化・デプロイしてもらう。

## 担当
CMO配下 Webマーケチーム（content-writer）

## 運用フロー
```
1. テーマ選定（CMOのSEO戦略に基づく or ユーザー指定）
2. キーワードリサーチ
3. 構成案作成（見出し・ターゲット・CTA）
4. 本文執筆（2000〜5000文字）
5. SEOチェック（タイトル60文字以内、description120文字以内、h2にキーワード）
6. CTO に原稿を渡す → blog-publish.md で公開
```

## 記事フォーマット

### メタ情報（CTOに渡す）
```
タイトル: 〇〇
スラッグ: example-article
カテゴリ: AI Trends / AI Tools / AI x 補助金 / Business / Tutorial
公開日: YYYY-MM-DD
description: 120文字以内の概要
キーワード: comma, separated, keywords
```

### 本文構成
- リード文（問題提起 → 解決の提示 → 記事で得られること）
- h2 × 3〜6セクション
- 各セクションにh3サブセクション
- 具体例・数字を多用
- CTA（記事末尾に「お問い合わせ」への誘導）

## SEOガイドライン
- タイトル: キーワードを前方に、60文字以内
- description: 120文字以内、行動を促す文言
- h2にメインキーワード含む
- 本文中にキーワード自然に5〜10回
- 内部リンク: service.html, aikomon.html, aishine.html, contact.html へ自然に誘導
- 画像alt属性にキーワード

## カテゴリ一覧
| カテゴリ | 内容 | 頻度目標 |
|---|---|---|
| AI Trends | AI業界の最新動向・ニュース | 月2本 |
| AI Tools | ツールレビュー・使い方解説 | 月2本 |
| AI x 補助金 | 助成金・補助金情報 | 四半期1本 |
| Business | 経営×AI活用事例 | 月2本 |
| Tutorial | ハウツー・実践ガイド | 月2本 |

## 記事完成後
以下のコマンドでCTOにデプロイを依頼:
「この記事をブログ公開して」→ CTO の blog-publish.md が起動
