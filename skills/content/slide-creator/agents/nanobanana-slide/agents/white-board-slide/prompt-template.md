# 画像生成プロンプトテンプレート（White-Board スタイル）

nanobanana 2 API に渡す画像生成プロンプトの構成ガイド。

## 重要：プロンプト作成の絶対ルール

プロンプトに以下を**絶対に含めてはならない**：
- フォント名（Permanent Marker, Caveat, Kalam, Arial, Times 等）
- ポイント数やピクセル数（14pt, 48pt, 1920x1080px 等）
- カラーコード（#000000, #FF0000 等）
- "size equivalent to", "similar to [font名]" 等の技術的比較表現
- "px from left", "px from top" 等のピクセル位置指定

これらを含めると、画像生成AIがそれらの指示文をテキストとして画像内に描画してしまう。

**代わりに使う表現：**
- サイズ → 「very large」「large」「medium」「small」「tiny」
- 色 → 「black」「blue」「red」「green」（色名のみ）
- 位置 → 「top-left corner」「center」「bottom-right」（方向のみ）
- スタイル → 「hand-written marker style」「bold marker」「thick marker」「fine tip marker」

---

## 共通ベーススタイル（全ページ共通）

すべてのプロンプトの **先頭** に以下を必ず含める：

```
Generate a single presentation slide image. This is slide {page_number} of {total_pages} in a consistent series.

STYLE: A physical whiteboard with hand-written dry-erase marker text and drawings. All slides in this series are written by the SAME PERSON using the SAME set of markers on the SAME whiteboard. The handwriting style, marker thickness, text sizes, and spacing must be perfectly consistent across all slides.

HANDWRITING STYLE:
- Japanese text: neat, rounded, friendly handwriting — like a teacher carefully writing on a classroom whiteboard. Characters should be rounded (not angular gothic), evenly spaced, and always perfectly horizontal.
- English text and numbers: neat rounded block letters, easy to read.
- ALL text must be perfectly horizontal. No tilted, angled, or curved text lines.
- Text spacing is even and generous — never cramped or overlapping.

MARKER THICKNESS (consistent across all slides):
- Titles: thick chisel-tip marker with broad bold strokes
- Body text and bullet points: standard medium marker
- Annotations, page numbers, header: fine-tip marker

TEXT SIZE RATIO (consistent across all slides):
- Title text is 3x the size of annotation text
- Body text is 2x the size of annotation text
- This ratio must be identical on every slide

BACKGROUND: Clean white surface filling the entire image, edge to edge. No frame, no border, no edge decoration. Uniform white background with very subtle whiteboard texture. The same whiteboard surface appearance on every slide.

DO NOT draw any frame, border, or edge around the image. The white background should extend all the way to the edges. The frame will be added separately in post-processing.

ALL TEXT must look like it was written by hand with dry-erase markers on a whiteboard. No printed or digital-looking text anywhere.

COLORS ALLOWED (strictly only these, no exceptions):
- Black marker for main text, outlines, and drawings
- Blue marker for accents, headers, and highlights
- Red marker for emphasis, important marks, and underlines
- Green marker for supplementary info, checkmarks, and secondary accents
- White background only
No other colors. No gradients. No pastel. No shading. Solid marker ink only. Marker ink intensity must be consistent — not faded, not overly dark.

DO NOT include any technical instructions, font names, size numbers, or color codes as visible text in the image. The image should contain ONLY the actual slide content.

LAYOUT ZONES (consistent across all slides):
- Header zone: top-left corner, small text
- Title zone: top 15% of the slide
- Content zone: middle 70% of the slide
- Page number zone: bottom-right corner
- Margins are consistent on all sides
```

## 固定レイアウト要素

### 全スライド共通：左上ヘッダー

すべてのスライド（表紙含む）に以下を含める：

```
TOP-LEFT CORNER: "{chapter_label}" written in blue fine-tip marker, small text.
```

`{chapter_label}` の形式: `{章番号}章 {章タイトル短縮}`
例: `1章 AI基礎知識`, `2章 AIの歴史`

### 全スライド共通：ページ番号

```
BOTTOM-RIGHT CORNER: "{page_number}/{total_pages}" written in black fine-tip marker, tiny text.
```

---

## ページタイプ別テンプレート

### 表紙ページ（ページ1）

```
{共通ベーススタイル}

This is a TITLE/COVER slide. It must contain ONLY the title text centered on the slide, with small decorative doodles around it.

IMPORTANT: Do NOT add any subtitle, tagline, description, or secondary line of text below or above the title. The title is the ONLY large text on this slide. No "〜...〜" style subtitles. No explanatory text. ONLY the title.

TOP-LEFT CORNER: "{chapter_label}" in blue fine-tip marker, small text.

CENTER OF SLIDE: The title "{section_title}" written in black thick chisel-tip marker, very large bold text. This is the ONLY text content on the slide besides the header and page number. Centered both horizontally and vertically. The text must be perfectly horizontal.

Around the title, draw small whiteboard doodles related to "{topic_description}" in blue and green standard marker:
- Simple sketches (robot face, computer, brain, gears, etc.)
- Small stars, arrows, exclamation marks as decoration
- Doodles should frame the title without overwhelming it
- Keep doodles simple and consistent in line thickness

BOTTOM-RIGHT CORNER: "1/{total_pages}" in black fine-tip marker, tiny text.

The slide should look like someone wrote a clean, bold topic title on a whiteboard with small decorative sketches. Remember: NO subtitle or secondary text line.
```

### 導入ページ（ページ2）

```
{共通ベーススタイル}

This is a GOAL/INTRODUCTION slide.

TOP-LEFT CORNER: "{chapter_label}" in blue fine-tip marker, small text.

UPPER AREA (title zone, top 15%):
Title "このチャプターのゴール" in black thick chisel-tip marker, large bold text, perfectly horizontal.
Draw a hand-drawn underline in red standard marker beneath the title.

MIDDLE-LEFT AREA (content zone, left 60%):
{num_objectives} goal items, each formatted as "{goal_item}がわかるようになる。"
Each item with a hand-drawn bullet icon (arrow or star) in blue standard marker:
{objectives_formatted}
Each item in black standard marker, standard readable size, perfectly horizontal.

RIGHT AREA (right 35%):
Draw a hand-drawn illustration of a mountain with a flag planted on the summit in blue and green marker. The flag should have "Goal" written on it in red marker. The mountain should be simple whiteboard-sketch style with a winding path going up to the top. This represents achieving the learning goal.

Below the mountain illustration, write "{goal_keyword}" in black thick marker, and below it a short explanation: "{goal_description}" in black standard marker. Circle this text area with a hand-drawn red marker circle (slightly imperfect, organic shape).

BOTTOM AREA (bottom 15%):
A one-line summary sentence: "{one_line_summary}" in black fine-tip marker, small text, perfectly horizontal.
This acts as a brief overview of what this chapter covers.

BOTTOM-RIGHT CORNER: "2/{total_pages}" in black fine-tip marker, tiny text.

The slide should feel like a teacher wrote the learning goals on a whiteboard at the start of a class.
```

### 本編ページ（ページ3〜8）— 6種類のレイアウトから選択

本編6ページは**すべて異なるレイアウトタイプを使う**こと。同じレイアウトの連続は禁止。
スライド構成設計時に、各ページに最適なレイアウトタイプを `{layout_type}` として指定する。

**全レイアウト共通の冒頭:**
```
{共通ベーススタイル}

This is a CONTENT slide.

TOP-LEFT CORNER: "{chapter_label}" in blue fine-tip marker, small text.

TITLE AREA (title zone, top 15%):
"{page_title}" in black thick chisel-tip marker, large bold text, perfectly horizontal.
Draw a messy hand-drawn underline in red standard marker beneath the title.

BOTTOM-RIGHT CORNER: "{page_number}/{total_pages}" in black fine-tip marker, tiny text.
```

以下、レイアウトタイプごとのコンテンツエリア指示を追加する：

---

#### タイプA: イラスト中心（illustration）

テキスト少なめ、大きな手描きイラストがメイン。概念の視覚的説明に最適。

```
MAIN CONTENT AREA (content zone, middle 70%):

CENTER: A large hand-drawn whiteboard illustration occupying roughly 60% of the content area:
{visual_concept_description}
Draw in whiteboard sketch style using black outlines, blue and green fills/accents, red for emphasis.
The illustration should be the main focus of this slide — detailed enough to be informative but still in simple whiteboard doodle style.

Around the illustration, add {num_points} short hand-written annotations in black fine-tip marker:
{key_points_formatted}
Each annotation connected to the relevant part of the illustration with a hand-drawn arrow.
Annotations should be small and concise (one short phrase each). Do not use bullet lists.

Layout should feel like a teacher drew an explanatory diagram on the whiteboard.
```

---

#### タイプB: 箇条書き + 小イラスト（bullet-with-sketch）

左側にコンパクトな箇条書き、右側に補足イラスト。標準的な説明に使用。

```
MAIN CONTENT AREA (content zone, middle 70%):

LEFT SIDE (60%):
{num_points} key points, each compact (one line per point):
{key_points_formatted}

For each point:
- Small hand-drawn icon (star, arrow, or dot) in blue or green fine-tip marker
- Text in black standard marker, medium readable size, perfectly horizontal
- Circle one important keyword per point with red fine-tip marker
- Keep text concise — each point should be a short phrase, not a long sentence

RIGHT SIDE (35%):
Hand-drawn sketch illustration: {visual_concept_description}
Draw in whiteboard doodle style, medium size. Simple but recognizable.

Layout should feel like organized whiteboard notes with a helpful side illustration.
```

---

#### タイプC: 比較・対比（comparison）

2つの概念を左右で比較。違いや対比の説明に最適。

```
MAIN CONTENT AREA (content zone, middle 70%):

Draw a hand-drawn vertical dividing line down the center in black standard marker (slightly wavy, not perfectly straight).

LEFT HALF:
Header: "{compare_left_label}" in blue thick marker, medium bold text.
Below, {num_left_points} points in black standard marker, small-medium size:
{compare_left_points}
Add a simple hand-drawn icon representing this concept in blue marker at the top.

RIGHT HALF:
Header: "{compare_right_label}" in red thick marker, medium bold text.
Below, {num_right_points} points in black standard marker, small-medium size:
{compare_right_points}
Add a simple hand-drawn icon representing this concept in red marker at the top.

BOTTOM: A hand-drawn arrow or bracket connecting both sides with a one-line conclusion: "{comparison_conclusion}" in green standard marker.

Layout should feel like a classic whiteboard T-chart comparison.
```

---

#### タイプD: フローチャート・プロセス（flow）

ステップや流れを矢印でつなぐ。プロセスや手順の説明に最適。

```
MAIN CONTENT AREA (content zone, middle 70%):

Draw a horizontal or vertical flow of {num_steps} steps connected by thick hand-drawn arrows in blue marker:

{flow_steps_formatted}

Each step:
- Hand-drawn rounded rectangle or circle in black marker (slightly imperfect shape)
- Step label inside in black standard marker, medium size
- Brief description below or beside in black fine-tip marker, small text
- Arrow to next step in blue thick marker (bold, energetic strokes)

Add small hand-drawn doodles near relevant steps to illustrate the concept (icons, symbols, small sketches in green marker).

The flow should read naturally left-to-right or top-to-bottom. Keep it spacious — don't cram steps together.

Layout should feel like a teacher drew a process diagram on the whiteboard.
```

---

#### タイプE: 中心概念 + 放射（radial）

中央にキーワード、周囲に関連要素が放射状に広がる。概念の全体像や構成要素の説明に最適。

```
MAIN CONTENT AREA (content zone, middle 70%):

CENTER: Draw a large hand-drawn circle in blue thick marker. Inside, write "{central_concept}" in black thick marker, large text.

Around the central circle, draw {num_branches} branches radiating outward, each ending in a smaller hand-drawn bubble or box:
{branches_formatted}

Each branch:
- A hand-drawn line or arrow from center circle to the outer bubble in black standard marker
- Keyword in the bubble in blue standard marker, medium text
- A tiny one-line description below in black fine-tip marker
- Small hand-drawn icon or doodle next to each bubble (relevant to the topic) in green marker

Important keywords circled in red fine-tip marker.

Layout should feel like a mind-map or brainstorming session on a whiteboard.
```

---

#### タイプF: 大きな手描き図解 + キャプション（diagram）

図解（ベン図、ピラミッド、表、タイムライン等）を画面の大部分に描き、下にキャプション。

```
MAIN CONTENT AREA (content zone, middle 70%):

UPPER 65%: A large hand-drawn diagram occupying most of the slide:
{diagram_description}
Draw in whiteboard sketch style:
- Main structure in black thick marker
- Labels in black standard marker, medium size
- Color coding with blue and green markers for different sections
- Red marker for emphasis or highlights
- Keep it clean and readable despite being hand-drawn

LOWER 20%:
{num_captions} caption lines explaining the diagram:
{captions_formatted}
Each in black fine-tip marker, small text, with a hand-drawn bullet (dot or dash) in green.

Layout should feel like a detailed but clear whiteboard diagram with explanatory notes underneath.
```

---

### レイアウト選択ガイドライン

| コンテンツの性質 | 推奨レイアウト |
|---|---|
| 概念の視覚的説明、仕組み | A: イラスト中心 |
| 複数ポイントの列挙 | B: 箇条書き + 小イラスト |
| 2つの概念の違い | C: 比較・対比 |
| 手順・プロセス・歴史の流れ | D: フローチャート |
| 構成要素・全体像 | E: 中心概念 + 放射 |
| ベン図・ピラミッド・表などの図解 | F: 大きな図解 |

**重要**: 6ページ（P3〜P8）で最低3種類以上のレイアウトを使うこと。

### まとめページ（ページ9）

```
{共通ベーススタイル}

This is a SUMMARY slide.

TOP-LEFT CORNER: "{chapter_label}" in blue fine-tip marker, small text.

TITLE AREA (title zone, top 15%):
"まとめ" in black thick chisel-tip marker, large bold text, perfectly horizontal.
Draw a hand-drawn double underline in blue standard marker.

CONTENT AREA (content zone, middle 70%):
{num_points} summary points, each with a hand-drawn green checkmark:
{summary_points_formatted}

Each point:
- Large green checkmark drawn by hand with standard marker
- Text in black standard marker, medium-large readable size, perfectly horizontal
- Circle key terms with red standard marker

BOTTOM AREA:
Hand-drawn arrow pointing right with "次へ →" in blue standard marker.
A small hand-drawn star or trophy doodle to represent achievement.

BOTTOM-RIGHT CORNER: "9/{total_pages}" in black fine-tip marker, tiny text.

The slide should feel like a satisfying wrap-up on the whiteboard.
```

### 用語集ページ（ページ10）

```
{共通ベーススタイル}

This is a GLOSSARY slide.

TOP-LEFT CORNER: "{chapter_label}" in blue fine-tip marker, small text.

TITLE AREA (title zone, top 15%):
"用語集" in black thick chisel-tip marker, large bold text, perfectly horizontal.
Draw a small hand-drawn book icon next to the title in blue standard marker.

CONTENT AREA (content zone, arranged in 2 columns):
{num_terms} terms in hand-drawn rectangular cards:

Each card:
- Hand-drawn slightly imperfect rectangle border in black standard marker
- Keyword in blue thick marker, bold, perfectly horizontal
- One-line definition below in black standard marker, standard size, perfectly horizontal
- Small gap between cards

Scatter small hand-drawn decorative elements between cards: arrows, dots, stars.

BOTTOM-RIGHT CORNER: "10/{total_pages}" in black fine-tip marker, tiny text.

The layout should feel like organized vocabulary notes on a whiteboard.
```

---

## プレースホルダー一覧

| プレースホルダー | 説明 | 例 |
|---|---|---|
| `{chapter_label}` | 左上に表示する章ラベル | `1章 AI基礎知識` |
| `{section_title}` | 表紙中央のタイトル | `1-1.AIとは` |
| `{topic_description}` | トピックの短い説明 | `AIの定義と基本概念` |
| `{one_line_summary}` | 導入の一文要約 | `AIとは人間の知的作業を...` |
| `{page_title}` | 本編ページのタイトル | `AIの6つの機能` |
| `{layout_type}` | レイアウトタイプ（A〜F） | `illustration` / `bullet-with-sketch` / `comparison` / `flow` / `radial` / `diagram` |
| `{key_points_formatted}` | 箇条書きの要点（タイプA,B用） | `- 推論 - 学習 - 認識...` |
| `{visual_concept_description}` | イラスト・スケッチの内容指示（タイプA,B用） | `AIの3分類を表すベン図` |
| `{compare_left_label}` | 比較の左側ラベル（タイプC用） | `普通のプログラム` |
| `{compare_right_label}` | 比較の右側ラベル（タイプC用） | `AI` |
| `{compare_left_points}` | 左側の要点（タイプC用） | `- ルール通り - 学習しない` |
| `{compare_right_points}` | 右側の要点（タイプC用） | `- データから学ぶ - 適応する` |
| `{comparison_conclusion}` | 比較のまとめ一文（タイプC用） | `最大の違いは「学習できるか」` |
| `{flow_steps_formatted}` | フローのステップ（タイプD用） | `データ入力 → 学習 → 予測` |
| `{num_steps}` | ステップ数（タイプD用） | `4` |
| `{central_concept}` | 中心キーワード（タイプE用） | `AI` |
| `{branches_formatted}` | 放射する要素（タイプE用） | `- 知覚 - 推論 - 学習...` |
| `{num_branches}` | 放射数（タイプE用） | `6` |
| `{diagram_description}` | 図解の詳細説明（タイプF用） | `3層の同心円：AI > ML > DL` |
| `{captions_formatted}` | 図解のキャプション（タイプF用） | `- AIが最も大きい概念` |
| `{num_captions}` | キャプション数（タイプF用） | `3` |
| `{page_number}` | ページ番号 | `3` |
| `{total_pages}` | 総ページ数 | `10` |
| `{num_points}` | 要点の数 | `4` |
| `{num_terms}` | 用語数 | `5` |
| `{objectives_formatted}` | 学習目標リスト（「〜がわかるようになる。」形式） | `- AIの定義がわかるようになる。` |
| `{goal_keyword}` | Goalのキーワード | `AIの定義` |
| `{goal_description}` | Goalキーワードの短い説明 | `人間の知的作業を再現する技術` |
| `{summary_points_formatted}` | まとめリスト | `- AIは6つの機能を持つ` |

## 注意事項

- プレースホルダーは実際の内容に置換してからAPIに渡す
- 日本語テキストは丸みのある丁寧な手書き風で、読みやすさを最優先にする
- テキスト量は1ページあたり最大5ポイントまで。詰め込みすぎない
- 各ページで統一感を保つ：同じマーカースタイル、同じ4色パレット、同じフレーム
- プロンプトにpt数・フォント名・カラーコードを絶対に書かない
- **全スライドで同じ人が書いた一貫性を最優先にする**
