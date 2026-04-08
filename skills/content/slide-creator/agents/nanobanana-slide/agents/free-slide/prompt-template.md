# free-slide プロンプトテンプレート

フリースタイル画像スライドの nanobanana API 向けプロンプトテンプレート。
ホワイトボードスライドと異なり、デザインの自由度が高い汎用テンプレート。

## 絶対禁止（プロンプトに含めてはならない）

- フォント名（Arial, Helvetica, Noto Sans, Permanent Marker 等）
- ポイント数（14pt, 48pt 等）
- カラーコード（#000000, #FF0000, rgb() 等）
- ピクセル指定（200px, 1920x1080px 等）
- 技術的比較（"size equivalent to", "similar to [font]" 等）

**代わりに使用**: 色名（deep navy, bright coral 等）、相対サイズ（very large, small 等）、方向（top-left, center 等）

## 共通ベーススタイル

すべてのスライドプロンプトの冒頭に以下を含める。
`{design_style}` はユーザー指定 or テーマから自動選択されたスタイル記述に置き換える。

```
Generate a single presentation slide image. This is slide {page_number} of {total_pages} in a consistent series.

DESIGN STYLE: {design_style}

All slides in this series must maintain a consistent visual identity:
- Same color palette across all slides
- Same text styling (title sizes, body text sizes, annotation sizes)
- Same illustration style and level of detail
- Same background treatment
- Same margin and spacing conventions

COLOR PALETTE (used consistently across ALL slides):
- Background: {bg_color}
- Primary text: {text_color}
- Accent color 1: {accent_1}
- Accent color 2: {accent_2}

TEXT STYLING:
- All text must be perfectly horizontal. No tilted, angled, or curved text.
- Title text is the largest and most prominent
- Body text is clearly readable at medium size
- Annotations and labels are small and subtle
- Size hierarchy must be consistent across all slides

DO NOT include any technical instructions, font names, size numbers, or color codes as visible text in the image. The image should contain ONLY the actual slide content.
```

## ページタイプ別テンプレート

### 1. タイトル / ヒーロースライド

```
LAYOUT: Title hero slide

CONTENT:
- Center of slide: "{title_text}" in {text_color}, very large, dominant, perfectly horizontal
- Below title (if provided): "{subtitle_text}" in {accent_1}, medium-large, perfectly horizontal
- Background: {bg_description}
- Decorative elements: {visual_elements}

The title should be the clear focal point of the slide. Keep the design clean and impactful.
No other text besides title and subtitle.
```

### 2. テキスト + ビジュアル分割スライド

```
LAYOUT: Split layout — left side text, right side visual

LEFT SIDE (55% of width):
- Top: "{page_title}" in {text_color}, large, perfectly horizontal
  {title_decoration}
- Below title: {num_points} key points
{points_formatted}
  Each point: {text_color} text, medium size, perfectly horizontal
  Bullet icons: small {accent_1} markers (dots, arrows, or custom icons)

RIGHT SIDE (40% of width):
- {visual_description}
- Style: {illustration_style}
- Colors: {visual_colors}

Bottom-right corner: "{page_number}/{total_pages}" in {text_color}, tiny
```

### 3. グリッドレイアウト

```
LAYOUT: Grid layout — {grid_size} grid

"{page_title}" at top, {text_color}, large, perfectly horizontal
{title_decoration}

Grid items (evenly spaced, consistent card size):
{grid_items_formatted}

Each grid item contains:
- Icon or small illustration at top ({accent_1} or {accent_2})
- Label below icon ({text_color}, medium, perfectly horizontal)
- Brief description ({text_color}, small, perfectly horizontal)

Background: {bg_color}
Bottom-right corner: "{page_number}/{total_pages}" in {text_color}, tiny
```

### 4. フルビジュアルスライド

```
LAYOUT: Full visual with overlay text

BACKGROUND: Full-bleed illustration or visual
- {full_visual_description}
- Style: {illustration_style}

OVERLAY TEXT (readable against the visual):
- {overlay_position}: "{overlay_text}" in {overlay_text_color}, {overlay_size}, perfectly horizontal
- Semi-transparent overlay behind text for readability (if needed)

Bottom-right corner: "{page_number}/{total_pages}" in {overlay_text_color}, tiny

The visual should be the primary focus. Text is secondary and minimal.
```

### 5. データ・チャートスライド

```
LAYOUT: Data visualization slide

Top: "{page_title}" in {text_color}, large, perfectly horizontal
{title_decoration}

CENTER (70% of content area):
- {chart_type} showing {chart_description}
- Chart colors: {chart_colors}
- Labels: {text_color}, small, perfectly horizontal
- Data values clearly readable

{additional_annotations}

Bottom-right corner: "{page_number}/{total_pages}" in {text_color}, tiny

Keep the chart clean and easy to read. Prioritize clarity over decoration.
```

### 6. タイムライン / プロセスフロー

```
LAYOUT: Timeline / process flow — {flow_direction} direction

Top: "{page_title}" in {text_color}, large, perfectly horizontal
{title_decoration}

FLOW ({num_steps} steps, connected by {connector_style} in {accent_1}):
{steps_formatted}

Each step:
- {step_shape} in {step_bg_color} with {step_border_color} border
- Step label inside: {text_color}, medium, perfectly horizontal
- Brief description nearby: {text_color}, small, perfectly horizontal
- Connector: {connector_style} arrow/line in {accent_1}

{flow_decorations}

Bottom-right corner: "{page_number}/{total_pages}" in {text_color}, tiny
```

### 7. 引用 / キーメッセージスライド

```
LAYOUT: Quote / key message slide

CENTER:
- Large quotation marks or decorative element in {accent_1} (subtle)
- "{quote_text}" in {text_color}, large to very large, perfectly horizontal, centered
- Below quote: "— {attribution}" in {accent_2}, small, perfectly horizontal (if applicable)

Background: {bg_color}, clean and minimal
{decorative_elements}

Bottom-right corner: "{page_number}/{total_pages}" in {text_color}, tiny

This slide emphasizes a single powerful message. Keep everything else minimal.
```

### 8. アイコングリッド

```
LAYOUT: Icon grid — {num_items} items in organized rows

Top: "{page_title}" in {text_color}, large, perfectly horizontal
{title_decoration}

ITEMS (evenly distributed, consistent spacing):
{icon_items_formatted}

Each item:
- Illustrated icon or symbol ({icon_style}, {accent_1} and {accent_2})
- Label below: {text_color}, medium, perfectly horizontal
- Optional one-line description: {text_color}, small

Background: {bg_color}
Bottom-right corner: "{page_number}/{total_pages}" in {text_color}, tiny
```

### 9. 比較スライド

```
LAYOUT: Comparison — side by side

Top: "{page_title}" in {text_color}, large, perfectly horizontal
{title_decoration}

LEFT SIDE:
- Header: "{left_label}" in {accent_1}, medium-large, perfectly horizontal
- {left_visual_or_icon}
- {num_left_points} points:
{left_points_formatted}
  Each: {text_color}, medium, perfectly horizontal

DIVIDER: Vertical line or visual separator in {accent_2}

RIGHT SIDE:
- Header: "{right_label}" in {accent_2}, medium-large, perfectly horizontal
- {right_visual_or_icon}
- {num_right_points} points:
{right_points_formatted}
  Each: {text_color}, medium, perfectly horizontal

Bottom: "{conclusion}" in {text_color}, medium, centered, perfectly horizontal (if applicable)
Bottom-right corner: "{page_number}/{total_pages}" in {text_color}, tiny
```

### 10. 図解スライド

```
LAYOUT: Diagram slide

Top: "{page_title}" in {text_color}, large, perfectly horizontal
{title_decoration}

CENTER (65% of content area):
- {diagram_type}: {diagram_description}
- Structure: {diagram_structure}
- Colors: {diagram_colors}
- Labels: {text_color}, small to medium, perfectly horizontal
- Style: {illustration_style}

Below diagram: {num_captions} caption lines
{captions_formatted}
Each caption: {text_color}, small, perfectly horizontal

Bottom-right corner: "{page_number}/{total_pages}" in {text_color}, tiny
```

## まとめ / 締めスライド

```
LAYOUT: Closing / summary slide

"{closing_title}" in {text_color}, very large, centered, perfectly horizontal

{closing_content}

{closing_visual}

Background: {bg_color}
{decorative_elements}

Bottom-right corner: "{page_number}/{total_pages}" in {text_color}, tiny

End on a strong visual note. This is the last impression.
```

## プレースホルダー一覧

### 共通（全スライド）
| プレースホルダー | 説明 |
|---|---|
| `{page_number}` | ページ番号 |
| `{total_pages}` | 総ページ数 |
| `{design_style}` | デザインスタイルの説明文 |
| `{bg_color}` | 背景色（色名） |
| `{text_color}` | メインテキスト色（色名） |
| `{accent_1}` | アクセントカラー1（色名） |
| `{accent_2}` | アクセントカラー2（色名） |
| `{illustration_style}` | イラストスタイル（flat, 3D, hand-drawn 等） |

### ページ固有
| プレースホルダー | 説明 |
|---|---|
| `{title_text}` | メインタイトルテキスト |
| `{subtitle_text}` | サブタイトルテキスト |
| `{page_title}` | ページタイトル |
| `{title_decoration}` | タイトル下の装飾（アンダーライン等） |
| `{num_points}` | ポイント数 |
| `{points_formatted}` | 箇条書きポイント（整形済み） |
| `{visual_description}` | ビジュアル要素の説明 |
| `{visual_colors}` | ビジュアルに使用する色 |
| `{bg_description}` | 背景の詳細説明 |
| `{visual_elements}` | 装飾ビジュアル要素 |
| `{grid_size}` | グリッドサイズ（2x2, 3x3 等） |
| `{grid_items_formatted}` | グリッドアイテム（整形済み） |
| `{full_visual_description}` | フルビジュアルの説明 |
| `{overlay_text}` | オーバーレイテキスト |
| `{overlay_position}` | オーバーレイ位置 |
| `{overlay_text_color}` | オーバーレイテキスト色 |
| `{overlay_size}` | オーバーレイテキストサイズ |
| `{chart_type}` | チャートタイプ（bar, pie, line 等） |
| `{chart_description}` | チャート内容の説明 |
| `{chart_colors}` | チャートの色 |
| `{flow_direction}` | フロー方向（left-to-right, top-to-bottom） |
| `{num_steps}` | ステップ数 |
| `{steps_formatted}` | ステップ（整形済み） |
| `{connector_style}` | コネクターのスタイル |
| `{step_shape}` | ステップの形状 |
| `{quote_text}` | 引用テキスト |
| `{attribution}` | 引用元 |
| `{left_label}` | 左側ラベル |
| `{right_label}` | 右側ラベル |
| `{diagram_type}` | 図解タイプ |
| `{diagram_description}` | 図解の説明 |
| `{closing_title}` | 締めタイトル |
| `{closing_content}` | 締めコンテンツ |

## 重要な注意事項

1. プレースホルダーは必ず実際のコンテンツに置き換えてからAPIに渡す
2. 日本語テキストは読みやすさ最優先。丁寧でクリアな表記
3. 1スライドあたり最大5ポイント。詰め込みすぎない
4. 同一セット内の一貫性が最も重要: 同じカラーパレット、同じテキストスタイル、同じイラストタッチ
5. **絶対に** pt数、フォント名、カラーコードをプロンプトに書かない
6. 連続するスライドで同じレイアウトを使わない
