# White-Board HTML スライド — スタイル定義 v3

ホワイトボード風HTMLスライドのデザインシステム。
画像生成版(nanobanana)とは異なり、HTML/CSS/JSで構築するインタラクティブスライド。

## デザインコンセプト

「清潔感のあるホワイトボード教室」
— 白背景に手書き風フォント、マーカーカラー、付箋メモの温かみのあるデザイン。

## 重要: モバイル対応ルール（必須）

以下は全スライド生成時に必ず守ること。

### body の高さ
```css
body {
  height: var(--vh, 100vh);  /* JSで実際の画面高さを設定 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
```
- **`100vh` や `100dvh` を直接使わない** → モバイルブラウザのアドレスバーで見切れる
- **`-webkit-fill-available` を使わない** → Chromeで高さが潰れるバグあり
- 必ずJSの `setVH()` と組み合わせて `var(--vh)` を使う

### スライド内スクロール
```css
.slide {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
```
- スライドのサイズ（縦横）は固定。はみ出すコンテンツはスライド内スクロールで対応
- **レイアウトを可変にしない**（height: auto 禁止）

### ナビゲーション
```css
.nav { flex-shrink: 0; }
```
- ナビは絶対に見切れない。`flex-shrink: 0` 必須。

### JS: ナビゲーション
```javascript
// ✅ 正しい: classList の付け外しのみ。inline display を消す
function go(i){
  S[cur].classList.remove('active');
  cur=i;
  S[cur].style.display='';      // inline display:none を消す
  S[cur].classList.add('active');
  S[cur].scrollTop=0;            // スクロール位置リセット
  upd();
}
```
- **`style.display='none'` を使わない** → 戻る時に `display:flex`(class) を上書きして表示されなくなる
- `cur` は `var`（または `window.cur`）で宣言 → inline `onclick="go(cur-1)"` からアクセス可能にするため
- **`let cur` は禁止** → inline onclick から参照できない

### JS: ビューポート高さ（必須）
```javascript
function setVH(){document.documentElement.style.setProperty('--vh',window.innerHeight+'px')}
setVH();
window.addEventListener('resize',setVH);
```
- 全HTMLファイルの `<script>` 冒頭に必ず含める

### モバイル表紙（cover）
```css
@media(max-width:768px){
  .slide.cover{padding-top:48px}
  .cover .chip{top:12px;left:14px;font-size:.78rem;padding:2px 10px}
  .cover-title{font-size:1.6rem}
  .cover-sub{font-size:.95rem}
  .cover-doodles{opacity:.3}
}
@media(max-width:480px){
  .slide.cover{padding-top:42px}
  .cover-title{font-size:1.4rem}
}
```
- デスクトップの表紙デザインは変更しない
- モバイルではタイトルサイズを縮小して折り返しによる潰れを防ぐ

## カラーパレット（固定）

### メインカラー（4色マーカー + 白背景）

| 用途 | カラー | CSS変数 |
|---|---|---|
| 背景 | `#F7F6F3` | `--board` |
| ボード面 | `#FFFFFF` | `--surface` |
| メインテキスト | `#1A1A1A` | `--ink-black` |
| 青マーカー（見出し・アクセント） | `#1565C0` | `--ink-blue` |
| 赤マーカー（強調・重要） | `#C62828` | `--ink-red` |
| 緑マーカー（補足・チェック） | `#2E7D32` | `--ink-green` |

### サブカラー（UI・付箋・装飾用）

| 用途 | カラー | CSS変数 |
|---|---|---|
| 薄いグレー（枠線・区切り線） | `#E8E6E1` | `--board-edge` |
| 付箋イエロー | `#FFF8DC` | `--sticky-y` |
| 付箋ブルー | `#E8F0FE` | `--sticky-b` |
| 付箋グリーン | `#E6F4EA` | `--sticky-g` |
| 付箋ピンク | `#FCE4EC` | `--sticky-p` |

## フォント

| 用途 | フォント | fallback |
|---|---|---|
| 日本語見出し | Zen Maru Gothic (Bold/900) | sans-serif |
| 日本語本文 | Zen Maru Gothic (Regular) | sans-serif |
| 英語・数字・手書き風 | Caveat (700) | cursive |
| コード・プロンプト | Source Code Pro | monospace |

Google Fonts:
```
Zen+Maru+Gothic:wght@400;500;700;900&family=Caveat:wght@400;700&family=Source+Code+Pro:wght@400;600
```

## フォントサイズ（CSS変数 / +3pt bump済み）

| 用途 | CSS変数 | 値 |
|---|---|---|
| 表紙タイトル | `--fs-hero` | `clamp(2.4rem, 5vw, 3.4rem)` |
| ページタイトル | `--fs-title` | `clamp(1.6rem, 3vw, 2.1rem)` |
| サブタイトル | `--fs-sub` | `clamp(1.2rem, 2.2vw, 1.4rem)` |
| 本文 | `--fs-body` | `clamp(1.08rem, 1.8vw, 1.2rem)` |
| 注釈・補足 | `--fs-sm` | `clamp(0.98rem, 1.5vw, 1.08rem)` |
| 最小テキスト | `--fs-xs` | `clamp(0.88rem, 1.2vw, 0.98rem)` |

### ハードコードフォントサイズ

| 要素 | サイズ |
|---|---|
| ページ番号 (.pg) | `1.25rem` |
| 付箋ラベル (.sticky-label) | `0.85rem` |
| プロンプト (.prompt) | `1.0rem` |
| プロンプトタグ (.prompt-tag) | `0.78rem` |
| コピーボタン (.copy-btn) | `0.8rem` |
| 番号リスト番号 (.bl.num li::before) | `0.85rem` |
| チェックマーク (.bl.check li::before) | `1.2rem` |
| ナビボタン (.nav-btn) | `1.02rem` |
| ナビカウント (.nav-count) | `1.25rem` |
| VS中央 (.vs-mid) | `1.8rem` |
| フロー矢印 (.flow-arr) | `1.6rem` |

## スライドサイズ

- デスクトップ: `width: min(940px, 92vw)`, `height: min(540px, 100%)`
- モバイル: `width: 100%`, `height: 100%`（board-frame内に収まる）
- コンテンツ溢れ時: スライド内スクロール

## ナビゲーション

- **前へ/次へボタン**: スライド下部。丸みのあるボタン。`onclick="go(cur-1)"` / `onclick="go(cur+1)"`
- **ドットインジケーター**: デスクトップのみ表示。モバイルでは非表示。
- **プログレスバー**: スライド下部に細いバー。
- **キーボード**: 左右矢印キー、スペースで次へ。
- **タッチ**: スワイプ対応（50px以上の移動で発火）。

## 付箋デザイン

- padding: `12px 14px`（詰め気味）
- line-height: `1.5`（詰め気味）
- 少し傾いた角度（.t1〜.t4）
- 影つき（box-shadow）
- 上部にマスキングテープ風の装飾
- 4色の付箋カラーをローテーション

## プロンプトブロック

- padding: `22px 14px 10px`（上はタグ分、全体詰め気味）
- line-height: `1.5`
- コピーボタン付き
- 4色の付箋カラー

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

## テンプレートファイル

- CSS: `dist/style.css` — 全スライド共通の確定CSS
- JS: `dist/slide.js` — 全スライド共通の確定JS
- 各HTMLファイルはインラインCSS/JSで自己完結するが、内容は上記と同一にすること
