---
name: slide-creator
description: スライドを自動生成するメインルーター。画像スライド（nanobanana API）とHTMLスライドの両方に対応。画像スライドはホワイトボード風・フリースタイルなど複数デザインに対応し、自由なテーマでの画像生成も可能。カリキュラム番号指定はgen-aiスキル経由のみ。
---

# Slide Creator — スライド自動生成エージェント

**画像スライド**（nanobanana API）と**HTMLスライド**の両方を生成するメインルーター。

## アーキテクチャ

```
slide-creator（メインルーター）
    └── agents/
        ├── nanobanana-slide（画像スライドルーター）
        │   ├── scripts/                    ← 全スタイル共通スクリプト
        │   │   ├── call_nanobanana.py      ← API呼び出し
        │   │   ├── build_slide_structure.py ← 10P構成設計
        │   │   └── images_to_pdf.py        ← PDF結合
        │   └── agents/                     ← スタイル別サブエージェント
        │       ├── white-board-slide/      ← ホワイトボード風（教材専用）
        │       │   ├── AGENT.md
        │       │   ├── STYLE.md
        │       │   ├── prompt-template.md
        │       │   └── design-guide.md
        │       └── free-slide/             ← フリースタイル（自由テーマ）
        │           ├── AGENT.md
        │           ├── STYLE.md
        │           └── prompt-template.md
        └── html-slide（HTMLスライド）
            ├── AGENT.md
            └── agents/
                └── ai-seminar（AIセミナー特化）
                    └── AGENT.md
```

### 役割分担

| レイヤー | 役割 |
|---|---|
| **slide-creator** | メインルーター。入力を解析し適切なエージェントに振り分け |
| **nanobanana-slide** | 画像スライドルーター。モード判定・構成設計・API呼び出し・PDF結合 |
| **white-board-slide** | ホワイトボード風スタイル。教材ベースの10P構成専用 |
| **free-slide** | フリースタイル。自由テーマで任意枚数の画像スライドを生成 |
| **html-slide** | HTMLベースのインタラクティブスライド生成 |
| **ai-seminar** | AIセミナー特化HTMLスライド自動生成 |

## 処理フロー

### フロー A: 画像スライド — 自由テーマ（デフォルト）

ユーザーがテーマやコンテンツを直接指定して画像スライドを生成する。

```
ユーザー入力（テーマ・内容・枚数など自由記述）
    ↓
① nanobanana-slide に委譲（free-slide モード）:
    a. ユーザーの要望をヒアリング（テーマ、枚数、デザインの方向性）
    b. ★ デザインプランを作成しユーザーに確認（必須）
       → スタイル・カラー・枚数・各ページ構成を提示
       → ユーザーの承認 or 修正を経て確定
    c. 確定プランに基づきスライド構成を設計
    d. free-slide サブエージェントでプロンプト生成
    e. nanobanana API で画像生成
    f. PDF結合
    ↓
② 保存：ユーザー指定のディレクトリ or デスクトップに出力
```

### フロー B: 画像スライド — 教材ベース（gen-ai経由のみ）

gen-aiスキルからカリキュラム番号付きで呼び出される場合のみ。

```
gen-ai スキルからカリキュラム番号指定で呼び出し（例：1-1-1）
    ↓
① 教材読み込み：gen-ai-master/outputs から該当の document.md を取得
    ↓
② スライド構成設計：10ページ分の構成を設計（タイトル・要点・デザイン指示）
    → slide_structure.json として保存
    ↓
③ nanobanana-slide サブエージェントに委譲（white-board-slide モード）:
    a. スタイル読み込み：white-board-slide/ のルールを読む
    b. 画像プロンプト生成：テンプレートに従いプロンプト作成
       → image_prompts.json として保存
    c. nanobanana API で画像生成：10枚のスライド画像を生成
       → slide_01.png 〜 slide_10.png
    d. PDF結合：画像を1つのPDFに結合
    ↓
④ 保存：gen-ai-master/outputs の該当フォルダに image-slides.pdf として保存
```

## ディレクトリ構成

```
slide-creator/
├── SKILL.md                                    ← このファイル（メインルーター）
└── agents/
    ├── nanobanana-slide/                        ← 画像スライドルーター
    │   ├── AGENT.md                             ← 共通定義・モード判定・スタイル振り分け
    │   ├── scripts/                             ← 全スタイル共通スクリプト
    │   │   ├── call_nanobanana.py               ← nanobanana API呼び出し
    │   │   ├── build_slide_structure.py         ← 教材→10P構成設計
    │   │   └── images_to_pdf.py                 ← 画像→PDF結合
    │   └── agents/                              ← スタイル別サブエージェント
    │       ├── white-board-slide/               ← ホワイトボード風（教材専用）
    │       │   ├── AGENT.md
    │       │   ├── STYLE.md
    │       │   ├── prompt-template.md
    │       │   └── design-guide.md
    │       └── free-slide/                      ← フリースタイル（自由テーマ）
    │           ├── AGENT.md                     ← フリースタイル処理定義
    │           ├── STYLE.md                     ← フリースタイルルール
    │           └── prompt-template.md           ← フリースタイルテンプレート
    └── html-slide/                              ← HTMLスライド
        ├── AGENT.md
        └── agents/
            └── ai-seminar/                      ← AIセミナー特化
                └── AGENT.md
```

## 出力先

### 自由テーマ（free-slide）の場合
```
~/Desktop/nanobanana-slides/    ← デフォルト（ユーザー指定可）
├── slide_01.png
├── slide_02.png
├── ...
└── slides.pdf
```

### 教材ベース（white-board-slide / gen-ai経由）の場合
```
gen-ai-master/outputs/
└── 第1章_AIの基礎知識/
    └── 1-1_AIの定義/
        └── 1-1-1_AIの定義とは/
            ├── document.md           ← 既存の教材
            ├── presentation.pptx     ← 既存のPPTXスライド
            └── image-slides.pdf      ← ★ このエージェントで生成
```

## ルーティング判定

| ユーザー入力 | ルーティング先 | モード |
|---|---|---|
| カリキュラム番号（`1-1-1`等） | gen-aiスキル経由でのみ受付 | white-board-slide |
| 自由テーマ（テキスト指示） | nanobanana-slide → free-slide | free-slide |
| `html` / `HTML` / `ウェブスライド` | html-slide | HTML |
| `セミナー` / `seminar` / `勉強会` | ai-seminar | HTMLセミナー |

**重要**: カリキュラム番号が直接入力された場合、slide-creator単体ではホワイトボードスライドを生成しない。`/gen-ai` スキル経由でのみ教材ベースのホワイトボードスライドが生成される。slide-creatorを直接呼び出した場合は free-slide モードで自由テーマの画像スライドを生成する。

## 各モードの詳細

### free-slide モード（デフォルト）

nanobanana-slide の `agents/free-slide/AGENT.md` を参照。

- ユーザーが自由にテーマ・内容・枚数・デザイン方向性を指定
- 枚数制限なし（デフォルト5枚、最大20枚）
- カラーパレット・デザインスタイルを毎回指定可能
- ビジネス、教育、クリエイティブなど用途を問わない

### white-board-slide モード（gen-ai経由専用）

nanobanana-slide の `agents/white-board-slide/AGENT.md` を参照。

- gen-aiスキルからカリキュラム番号付きで呼び出される場合のみ
- 教材（document.md）から10ページ固定のホワイトボード風スライドを生成
- 4色マーカー（黒・青・赤・緑）の厳密なスタイルルール

## カリキュラム番号の読み方（gen-ai経由の場合）

`1-1-1` = 第**1**章 → セクション**1** → レッスン**1**

カリキュラム定義は `../gen-ai-master/curriculum/curriculum.json` を参照。

## API設定（全モード共通）

| 項目 | 値 |
|---|---|
| モデル | `gemini-3.1-flash-image-preview`（nanobanana 2） |
| ライブラリ | `google-genai`（`pip3 install google-genai`） |
| 認証 | 環境変数 `NANOBANANA_API_KEY` |
| 出力サイズ | 2K解像度（2752x1536px）、16:9 |
| レート制限 | リクエスト間2秒待機 |
| 無料枠 | 1日約500リクエスト |

## スタイルの拡張

新しいスタイルを追加する場合：

1. `agents/nanobanana-slide/agents/{new_style_name}/` ディレクトリを作成
2. `AGENT.md`, `STYLE.md`, `prompt-template.md` を作成
3. `nanobanana-slide/AGENT.md` のスタイル一覧に追加

## 注意事項

- 画像生成のクオリティが最優先。プロンプトは丁寧に作り込む
- テキスト量は少なめに。ビジュアル重視のスライドを目指す
- API呼び出しのレート制限に注意し、適切な間隔を空ける
- プロンプトにフォント名・pt数・カラーコードを絶対に含めない
- カリキュラム番号の直接入力はgen-ai経由のみ対応
