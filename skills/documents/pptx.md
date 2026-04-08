---
description: with-AI株式会社のブランディング済みPowerPoint（PPTX）を自動生成するスキル
---

# PPTX自動生成スキル

## 概要
ユーザーの指示に基づいて、with-AI株式会社のブランドガイドラインに沿ったPowerPointプレゼンテーションを自動生成します。

## 手順

### 1. 会社情報の読み込み
以下のファイルをすべて読み込んで、会社情報を把握してください:
- `~/Desktop/クロードコード/company/profile.md` — 会社概要
- `~/Desktop/クロードコード/company/mission.md` — 理念体系
- `~/Desktop/クロードコード/company/services.md` — 事業・サービス詳細
- `~/Desktop/クロードコード/company/strengths.md` — 強み・差別化
- `~/Desktop/クロードコード/company/brand.md` — ブランドガイドライン

### 2. ユーザーへの確認
ユーザーの指示内容（引数: $ARGUMENTS）を確認し、どのようなプレゼン資料を作るか把握してください。
- 指示が「会社紹介」であれば、会社紹介に最適な構成でスライドを作成する
- 特定のスライド構成が指示されていればそれに従う
- 不明点があれば確認する

### 3. Pythonスクリプトの生成と実行
以下のブランドルールを厳守して、python-pptxを使ったPythonスクリプトを生成・実行してください。

#### ブランドルール（必須）

**カラー:**
- メインカラー（グラデーション）: #0A3B8E（濃い青） → #48A8E1（明るい青）
- テキストカラー: #333333（グレーがかった黒）
- サブテキストカラー: #666666
- 背景色: #FFFFFF（白）
- サブカラー（アクセント）: #E8F4FD（薄い青）、#F5F5F5（薄いグレー）

**フォント:**
- メインフォント: Noto Sans JP
- 見出し: Noto Sans JP Bold
- 本文: Noto Sans JP Regular
- フォントサイズ目安: タイトル 28-36pt、見出し 20-24pt、本文 14-16pt、注釈 10-12pt

**ロゴ:**
- ロゴフル（with AI）: ~/Desktop/クロードコード/img/logo-full.png
  → 表紙スライドで大きく使用
- ロゴA（Aiアイコン）: ~/Desktop/クロードコード/img/logo-A.png
  → 各スライドの右下に小さく配置（フッターロゴ）

**デザインルール:**
- スライドサイズ: ワイドスクリーン（16:9）
- 上部または下部にブルーグラデーション（#0A3B8E → #48A8E1）のラインを入れる
- 表紙スライドは特にグラデーションを効果的に使う
- 余白を十分に取り、情報を詰め込みすぎない
- テキストは真っ黒（#000000）を使わず、必ず #333333 を使用する
- 清潔感・先進性・信頼感のあるデザインにする

**出力先:**
- ファイル出力先: ~/Desktop/クロードコード/
- ファイル名は内容に応じて適切な日本語名をつける（例: with-AI_会社紹介.pptx）

### 4. スクリプトの技術要件

```python
# 必須インポート
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os

# スライドサイズ（16:9）
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# カラー定数
MAIN_DARK = RGBColor(0x0A, 0x3B, 0x8E)   # #0A3B8E
MAIN_LIGHT = RGBColor(0x48, 0xA8, 0xE1)   # #48A8E1
TEXT_COLOR = RGBColor(0x33, 0x33, 0x33)     # #333333
SUB_TEXT = RGBColor(0x66, 0x66, 0x66)       # #666666
ACCENT_BG = RGBColor(0xE8, 0xF4, 0xFD)     # #E8F4FD
WHITE = RGBColor(0xFF, 0xFF, 0xFF)          # #FFFFFF

# フォント設定用ヘルパー
def set_font(run, size=14, bold=False, color=TEXT_COLOR, name='Noto Sans JP'):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = name

# グラデーションライン追加用（上部または下部）
def add_gradient_line(slide, position='top', height=Inches(0.08)):
    """スライドの上部または下部にグラデーション風のラインを追加"""
    slide_width = Inches(13.333)
    if position == 'top':
        top = Inches(0)
    else:
        top = Inches(7.5) - height

    # 左半分（濃い青）
    shape_left = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(0), top, slide_width // 2, height
    )
    shape_left.fill.solid()
    shape_left.fill.fore_color.rgb = MAIN_DARK
    shape_left.line.fill.background()

    # 右半分（明るい青）
    shape_right = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, slide_width // 2, top, slide_width // 2, height
    )
    shape_right.fill.solid()
    shape_right.fill.fore_color.rgb = MAIN_LIGHT
    shape_right.line.fill.background()

# フッターロゴ追加用
def add_footer_logo(slide, logo_path):
    """右下にロゴAを小さく配置"""
    if os.path.exists(logo_path):
        slide.shapes.add_picture(
            logo_path, Inches(11.8), Inches(6.8), height=Inches(0.5)
        )
```

### 5. 完了後
- 生成したファイルのパスをユーザーに伝える
- スライド構成の概要を簡潔に報告する

## 注意事項
- python-pptx でグラデーション塗りつぶしが難しい場合は、左右に色の異なる矩形を並べるか、段階的に色を変えた細い矩形を重ねてグラデーション風に表現する
- ロゴファイルが見つからない場合はユーザーに確認する
- テキスト量が多い場合はフォントサイズを調整するか、スライドを分割する
