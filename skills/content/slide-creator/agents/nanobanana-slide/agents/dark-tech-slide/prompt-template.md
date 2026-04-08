# 画像生成プロンプトテンプレート（Dark-Tech スタイル）

nanobanana 2 API に渡す画像生成プロンプトの構成ガイド。
ブラックベースに各AIサービスのブランドカラーをアクセントとして使用するモダンテックスタイル。

## 重要：プロンプト作成の絶対ルール

プロンプトに以下を**絶対に含めてはならない**：
- フォント名（Arial, Helvetica, Noto Sans 等）
- ポイント数やピクセル数（14pt, 48pt, 1920x1080px 等）
- カラーコード（#000000, #10A37F 等）
- "size equivalent to", "similar to [font名]" 等の技術的比較表現
- "px from left", "px from top" 等のピクセル位置指定

**代わりに使う表現：**
- サイズ → 「very large」「large」「medium」「small」「tiny」
- 色 → 色名のみ（「black」「white」「emerald green」「coral orange」等）
- 位置 → 「top-left corner」「center」「bottom-right」（方向のみ）
- スタイル → 「clean modern sans-serif」「bold」「light」「thin」

---

## AIサービスのブランドカラー定義

各AIサービスのブランドカラーは色名で指定する：

| サービス | ブランドカラー（色名で指定） | ロゴの視覚的特徴 |
|---|---|---|
| ChatGPT (OpenAI) | emerald green（エメラルドグリーン） | 螺旋/渦巻き模様のシンプルなアイコン |
| Gemini (Google) | blue and cyan gradient（青〜シアン） | 4つの光る点/星が回転する形 |
| Claude (Anthropic) | coral orange（コーラルオレンジ） | シンプルな丸いアイコン |
| Copilot (Microsoft) | four colors: blue, green, yellow, red（4色） | 4色の四角形アイコン |
| Perplexity | teal（ティール/青緑） | 幾何学的なPの形 |
| Grok (xAI) | white on black（白黒） | Xロゴに近いシンプルな形 |
| Genspark | orange and blue（オレンジ＆ブルー） | 稲妻/スパークのアイコン |
| Felo | blue（ブルー） | シンプルなFの文字 |
| Manus | purple（パープル） | 手のアイコン |

---

## 共通ベーススタイル（全ページ共通）

すべてのプロンプトの **先頭** に以下を必ず含める：

```
Generate a single presentation slide image. This is slide {page_number} of {total_pages} in a consistent series.

STYLE: A sleek, modern, dark-themed tech presentation slide. All slides in this series share the EXACT SAME visual identity — same background, same text styling, same spacing, same design language.

TYPOGRAPHY:
- Japanese text: clean, modern sans-serif style. Perfectly horizontal, evenly spaced, highly readable against dark background.
- English text and numbers: clean modern sans-serif, bold for titles, regular for body text.
- ALL text must be perfectly horizontal. No tilted, angled, or curved text.
- Text must be sharp, crisp, and high-contrast against the dark background.

TEXT SIZE HIERARCHY (consistent across all slides):
- Title text: very large, bold, white
- Subtitle text: large, regular weight, slightly dimmed white or accent color
- Body text: medium, regular, white
- Caption/annotation text: small, light weight, gray
- This hierarchy must be identical on every slide

BACKGROUND: Deep black background with very subtle dark gray geometric patterns — faint grid lines, circuit-board-like traces, or subtle hexagonal mesh. The pattern should be barely visible, adding texture without distracting from content. The same background treatment on every slide. No gradients. Matte black.

ACCENT ELEMENTS:
- Thin glowing accent lines (color varies by topic) used sparingly for separators, underlines, or border highlights
- Subtle glow effects behind key elements (not overdone)
- Frosted dark glass cards (dark gray, semi-transparent, rounded corners) for grouping content
- No bright backgrounds. Content floats on the dark surface.

OVERALL FEEL: Premium, high-tech, editorial quality. Think Bloomberg Terminal meets Apple Keynote dark mode. Clean, minimal, information-dense but not cluttered.

DO NOT include any technical instructions, font names, size numbers, or color codes as visible text in the image. The image should contain ONLY the actual slide content.

LAYOUT ZONES (consistent across all slides):
- Header zone: top-left corner, small text
- Title zone: top 15% of the slide
- Content zone: middle 70% of the slide
- Page number zone: bottom-right corner
- Margins are generous and consistent on all sides
```

## 固定レイアウト要素

### 全スライド共通：左上ヘッダー

```
TOP-LEFT CORNER: "{chapter_label}" in small, light gray text.
```

`{chapter_label}` の形式: `{章番号}章 {章タイトル短縮}`
例: `4章 生成AIツール`

### 全スライド共通：ページ番号

```
BOTTOM-RIGHT CORNER: "{page_number}/{total_pages}" in small gray text.
```

### 全スライド共通：アクセントライン

```
A thin horizontal accent line below the title, glowing in {accent_color}. The line fades from bright to transparent at both ends.
```

---

## ページタイプ別テンプレート

### 表紙ページ（ページ1）

```
{共通ベーススタイル}

This is a TITLE/COVER slide.

TOP-LEFT CORNER: "{chapter_label}" in small gray text.

CENTER OF SLIDE:
Main title "{section_title}" in very large, bold white text. Centered horizontally and vertically.
Below the title: "{section_subtitle}" in large text, colored in {accent_color}.
The title should be the dominant element — clean, bold, impactful.

IMPORTANT: Do NOT add any extra subtitle, tagline, or decorative text beyond what is specified. Keep it minimal.

Around the title, place subtle visual elements related to {topic_description}:
- Small, minimal tech icons or abstract shapes in {accent_color} with low opacity
- Thin geometric lines connecting outward from the title area
- These elements should be subtle and not compete with the title text

A thin horizontal glowing line in {accent_color} sits below the subtitle, fading at both ends.

BOTTOM-RIGHT CORNER: "1/{total_pages}" in small gray text.
```

### 導入ページ（ページ2）

```
{共通ベーススタイル}

This is a LEARNING OBJECTIVES slide.

TOP-LEFT CORNER: "{chapter_label}" in small gray text.

TITLE AREA (top 15%):
"{intro_title}" in large bold white text.
Thin glowing accent line below in {accent_color}.

CONTENT AREA (middle 70%):

LEFT SIDE (55%):
{num_objectives} learning objective items listed vertically.
Each item has:
- A small glowing circle bullet in {accent_color}
- Text in white: "{objective_text}"
- Items are well-spaced, not cramped

{objectives_formatted}

RIGHT SIDE (40%):
{intro_visual_description}
The visual should use {accent_color} as the primary color, rendered in a minimal, icon-based style against the dark background.

BOTTOM AREA:
One-line summary: "{one_line_summary}" in small gray italic text.

BOTTOM-RIGHT CORNER: "2/{total_pages}" in small gray text.
```

### 本編ページ（ページ3〜N-2）— レイアウトタイプ

本編ページは**すべて異なるレイアウトタイプを使う**こと。同じレイアウトの連続は禁止。

**全レイアウト共通の冒頭:**
```
{共通ベーススタイル}

This is a CONTENT slide.

TOP-LEFT CORNER: "{chapter_label}" in small gray text.

TITLE AREA (top 15%):
"{page_title}" in large bold white text.
Thin glowing accent line below in {accent_color}.

BOTTOM-RIGHT CORNER: "{page_number}/{total_pages}" in small gray text.
```

---

#### タイプA: ブランドカード型（brand-cards）

各AIサービスを個別カードで紹介。サービスごとにブランドカラーを使い分ける。

```
CONTENT AREA (middle 70%):

{num_cards} dark glass cards arranged horizontally with equal spacing:

{cards_formatted}

Each card:
- Dark semi-transparent rounded rectangle with a thin border glowing in that service's brand color
- Service name at top in that brand color, bold
- Service logo icon (simple, recognizable) at top-right of card in brand color
- 3-4 bullet points in white text, medium size
- Key differentiator at bottom in brand color, small bold text
- Cards should all be the same size

The brand colors make each card visually distinct while maintaining the dark theme unity.
```

---

#### タイプB: 箇条書き + サイドビジュアル（bullet-visual）

左に情報密度の高い箇条書き、右にビジュアル。

```
CONTENT AREA (middle 70%):

LEFT SIDE (55%):
{num_points} key points, each on its own line:
{key_points_formatted}

For each point:
- Small glowing bullet icon in {accent_color}
- Main text in white, medium size
- One key term per point highlighted in {accent_color} (bold)
- Keep each point to one concise line

RIGHT SIDE (40%):
{visual_description}
Rendered as a clean, minimal illustration using {accent_color} against the dark background.
Thin line art style, slightly glowing edges.
```

---

#### タイプC: 比較テーブル（comparison-table）

テーブル形式で複数サービスを比較。

```
CONTENT AREA (middle 70%):

A comparison table with dark glass background:

HEADER ROW:
Column headers in bold white text, each service name in its own brand color:
{table_headers}

DATA ROWS (each row is a comparison category):
{table_rows_formatted}

Table styling:
- Thin horizontal lines separating rows in dark gray
- Header row has a thin bottom border in {accent_color}
- Cells with "◎" rendered in bright {accent_color} (stands out)
- Cells with "○" in white
- Cells with "△" in gray
- Cells with "×" in dim red
- Text is clean, well-aligned, highly readable
```

---

#### タイプD: フロー・タイムライン（flow-timeline）

ステップや歴史的流れを矢印でつなぐ。

```
CONTENT AREA (middle 70%):

A horizontal or vertical flow of {num_steps} steps:

{flow_steps_formatted}

Each step:
- Dark glass rounded rectangle with thin {accent_color} border
- Step label in white bold text
- Brief description below in small white text
- Connected to next step by a glowing arrow in {accent_color}
- Key numbers or dates highlighted in {accent_color}

The flow should read naturally. Steps are evenly spaced.
Add small iconic illustrations next to relevant steps in thin {accent_color} line art.
```

---

#### タイプE: 機能ショーケース（feature-grid）

2x2 または 2x3 のグリッドで機能を紹介。

```
CONTENT AREA (middle 70%):

{num_features} feature cards in a {grid_layout} grid:

{features_formatted}

Each card:
- Dark glass rectangle with rounded corners
- Small icon at top-left in {accent_color} (relevant to the feature)
- Feature name in {accent_color}, bold, medium text
- 1-2 line description in white, small text
- Cards have thin borders that subtly glow in {accent_color}
- Equal spacing between all cards
```

---

#### タイプF: ステートメント + データ（statement-data）

大きなステートメント（主張）と補足データの組み合わせ。

```
CONTENT AREA (middle 70%):

UPPER 40%:
A large statement or key insight:
"{main_statement}" in large white text, with one key phrase in {accent_color}.
This should be the visual focus of the slide.

LOWER 55%:
{num_data_points} supporting data points arranged horizontally:
{data_points_formatted}

Each data point:
- A large number or metric in {accent_color}, very large bold text
- A label below in white, small text
- Separated by thin vertical lines in dark gray
```

---

#### タイプG: 誤解 vs 正解（myth-vs-fact）

よくある誤解とその正解を対比。

```
CONTENT AREA (middle 70%):

{num_myths} myth-busting items arranged vertically:

{myths_formatted}

Each item:
- LEFT: "✕" icon in dim red, followed by the myth text in gray (slightly struck through or dimmed)
- RIGHT: "→" arrow in {accent_color}, followed by the correct fact in white bold text
- A thin dark separator line between items
- The contrast between gray myth and white fact makes the correction visually clear
```

---

### レイアウト選択ガイドライン

| コンテンツの性質 | 推奨レイアウト |
|---|---|
| 複数AIサービスの個別紹介 | A: ブランドカード型 |
| 複数ポイントの説明 | B: 箇条書き + ビジュアル |
| サービス間の機能比較 | C: 比較テーブル |
| 歴史・進化・手順の説明 | D: フロー・タイムライン |
| 機能一覧・特徴紹介 | E: 機能ショーケース |
| 重要な結論・数値データ | F: ステートメント + データ |
| よくある誤解の訂正 | G: 誤解 vs 正解 |

---

### まとめページ（ページN-1）

```
{共通ベーススタイル}

This is a SUMMARY slide.

TOP-LEFT CORNER: "{chapter_label}" in small gray text.

TITLE AREA (top 15%):
"まとめ" in large bold white text.
Thin glowing double line below in {accent_color}.

CONTENT AREA (middle 70%):
{num_points} summary points:
{summary_points_formatted}

Each point:
- Glowing checkmark icon in {accent_color}
- Text in white, medium-large size
- Key terms highlighted in {accent_color}
- Well-spaced, not cramped

BOTTOM AREA:
A final takeaway message: "{takeaway_message}" in {accent_color}, medium bold text.
Small decorative element (abstract star, forward arrow, or achievement icon) next to the message.

BOTTOM-RIGHT CORNER: "{page_number}/{total_pages}" in small gray text.
```

### 用語集ページ（ページN）

```
{共通ベーススタイル}

This is a GLOSSARY slide.

TOP-LEFT CORNER: "{chapter_label}" in small gray text.

TITLE AREA (top 15%):
"用語集" in large bold white text.
Small book icon next to the title in {accent_color}.

CONTENT AREA (middle 70%, arranged in 2 columns):
{num_terms} glossary terms in dark glass cards:

{glossary_terms_formatted}

Each card:
- Dark glass rectangle with thin {accent_color} border
- Keyword in {accent_color}, bold text
- Definition in white, small text
- Cards arranged in a neat 2-column grid with consistent spacing

BOTTOM-RIGHT CORNER: "{page_number}/{total_pages}" in small gray text.
```

---

## プレースホルダー一覧

| プレースホルダー | 説明 |
|---|---|
| `{chapter_label}` | 左上ヘッダー |
| `{section_title}` | 表紙タイトル |
| `{section_subtitle}` | 表紙サブタイトル |
| `{accent_color}` | そのページの主要アクセントカラー |
| `{page_title}` | ページタイトル |
| `{page_number}` / `{total_pages}` | ページ番号 |
| `{key_points_formatted}` | 箇条書きの要点 |
| `{visual_description}` | ビジュアル要素の説明 |
| `{table_headers}` / `{table_rows_formatted}` | テーブルの内容 |
| `{flow_steps_formatted}` | フローのステップ |
| `{features_formatted}` | 機能グリッドの内容 |
| `{myths_formatted}` | 誤解 vs 正解の内容 |
| `{summary_points_formatted}` | まとめの要点 |
| `{glossary_terms_formatted}` | 用語集の内容 |

## 注意事項

- プレースホルダーは実際の内容に置換してからAPIに渡す
- **テキスト内容は教材から具体的なフレーズを抜き出して埋め込む**（曖昧にしない）
- 各ページでAIサービスのブランドカラーを使い分ける
- テキスト量は1ページあたり最大5〜6ポイントまで（詰め込みすぎない）
- **全スライドで同じダークテーマの一貫性を最優先にする**
- ロゴは「概念的なアイコン描写」で指定する（実際のロゴファイルは使えない）
