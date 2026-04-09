# White-Board HTML スライド — スタイル定義

ホワイトボード風HTMLスライドのデザインシステム。
画像生成版(nanobanana)とは異なり、HTML/CSS/JSで構築するインタラクティブスライド。

## デザインコンセプト

「清潔感のあるホワイトボード教室」
— 白背景に手書き風フォント、マーカーカラー、付箋メモの温かみのあるデザイン。

## カラーパレット（固定）

### メインカラー（4色マーカー + 白背景）

| 用途 | カラー | CSS変数 |
|---|---|---|
| 背景 | `#FAFAFA` | `--wb-bg` |
| ボード面 | `#FFFFFF` | `--wb-surface` |
| メインテキスト | `#2D2D2D` | `--wb-text` |
| 青マーカー（見出し・アクセント） | `#2B7DE9` | `--wb-blue` |
| 赤マーカー（強調・重要） | `#E54D42` | `--wb-red` |
| 緑マーカー（補足・チェック） | `#43A047` | `--wb-green` |

### サブカラー（UI・付箋・装飾用）

| 用途 | カラー | CSS変数 |
|---|---|---|
| 薄いグレー（枠線・区切り線） | `#E0E0E0` | `--wb-border` |
| 付箋イエロー | `#FFF9C4` | `--wb-sticky-yellow` |
| 付箋ブルー | `#E3F2FD` | `--wb-sticky-blue` |
| 付箋グリーン | `#E8F5E9` | `--wb-sticky-green` |
| 付箋ピンク | `#FCE4EC` | `--wb-sticky-pink` |
| ナビゲーション背景 | `#F5F5F5` | `--wb-nav-bg` |
| プログレスバー | `#2B7DE9` | `--wb-progress` |

## フォント

| 用途 | フォント | fallback |
|---|---|---|
| 日本語見出し | Zen Maru Gothic (Bold) | sans-serif |
| 日本語本文 | Zen Maru Gothic (Regular) | sans-serif |
| 英語・数字 | Caveat (700) | cursive |
| コード・プロンプト | Source Code Pro | monospace |

Google Fonts から読み込み:
```
Zen+Maru+Gothic:wght@400;700&family=Caveat:wght@700&family=Source+Code+Pro:wght@400;600
```

## フォントサイズ（固定）

| 用途 | サイズ | CSS変数 |
|---|---|---|
| 表紙タイトル | 3rem | `--fs-cover-title` |
| ページタイトル | 1.8rem | `--fs-title` |
| サブタイトル | 1.2rem | `--fs-subtitle` |
| 本文 | 1rem | `--fs-body` |
| 注釈・補足 | 0.85rem | `--fs-note` |
| 付箋テキスト | 0.9rem | `--fs-sticky` |
| ページ番号 | 0.75rem | `--fs-page-num` |
| ヘッダーラベル | 0.8rem | `--fs-header` |

## スライドサイズ

- アスペクト比: 16:9
- 最大幅: 960px
- 最大高さ: 540px
- レスポンシブ: ビューポートに合わせてスケール

## ナビゲーション

- **前へ/次へボタン**: スライド下部に配置。丸みのあるボタン。
- **ドットインジケーター**: 現在のスライド位置を示す。
- **プログレスバー**: スライド上部に細いバー。
- **キーボード**: 左右矢印キー、スペースで次へ。
- **タッチ**: スワイプ対応。

## 付箋デザイン（プロンプトコピー用）

プロンプト例やコード例は「付箋」スタイルで表示:
- 少し傾いた角度（transform: rotate(-1deg〜1deg)）
- 影つき（box-shadow）
- 上部にマスキングテープ風の装飾
- コピーボタン付き
- 4色の付箋カラーをローテーション

## ページタイプ

| タイプ | 用途 |
|---|---|
| cover | 表紙。タイトル + 手描きdoodle風SVGイラスト |
| goal | 導入。学習目標を表示 |
| content | 本編。テキスト + 図解 |
| comparison | 比較。左右で2つの概念を対比 |
| sticky-list | 付箋リスト。重要ポイントを付箋スタイルで表示 |
| prompt-example | プロンプト例。付箋 + コピーボタン |
| summary | まとめ。チェックマーク付き要点リスト |
| glossary | 用語集。カード型レイアウト |
