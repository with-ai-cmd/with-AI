# nanobanana-slide エージェント

nanobanana API（Gemini画像生成）を使って画像スライドを生成するエージェント。
2つのモード（自由テーマ / 教材ベース）に対応し、スタイル別サブエージェントにルーティングする。

## 役割

1. 呼び出し元・入力内容からモードを判定する
2. 適切なスタイルサブエージェントにルーティングする
3. nanobanana API で画像を生成する
4. PDF に結合して返す

## モード判定

| 条件 | モード | サブエージェント |
|---|---|---|
| gen-aiスキル経由 + カリキュラム番号あり | 教材モード | `white-board-slide` |
| slide-creator から直接（自由テーマ） | フリーモード | `free-slide` |
| ユーザーが明示的にスタイル指定 | 指定に従う | 該当するサブエージェント |

**デフォルト**: スタイル指定がない場合は `free-slide` を使用。

## 利用可能なスタイル（サブエージェント）

| スタイル名 | ディレクトリ | 説明 | 用途 |
|---|---|---|---|
| `free-slide` | `agents/free-slide/` | フリースタイル。自由なテーマ・デザインで画像生成 | 汎用（デフォルト） |
| `white-board-slide` | `agents/white-board-slide/` | ホワイトボード風の手書きマーカースタイル | 教材スライド（gen-ai経由） |

今後、新しいスタイル（例：ノート風、モダン風、黒板風）を追加する場合は `agents/` 配下に新しいサブエージェントを作成する。

## アーキテクチャ

```
nanobanana-slide（このエージェント）
    ├── scripts/                        ← 全スタイル共通のスクリプト
    │   ├── call_nanobanana.py          ← API呼び出し
    │   ├── build_slide_structure.py    ← 10P構成設計（教材モード用）
    │   └── images_to_pdf.py           ← PDF結合
    └── agents/                         ← スタイル別サブエージェント
        ├── free-slide/                 ← フリースタイル（デフォルト）
        │   ├── AGENT.md
        │   ├── STYLE.md
        │   └── prompt-template.md
        └── white-board-slide/          ← ホワイトボード風（教材専用）
            ├── AGENT.md
            ├── STYLE.md
            ├── prompt-template.md
            └── design-guide.md
```

## 処理フロー

### フリーモード（free-slide）

```
slide-creator から呼び出し（自由テーマ）
    ↓
① ユーザー要望の整理:
    - テーマ・内容
    - 枚数（デフォルト5枚、最大20枚）
    - デザインの方向性（色、雰囲気、スタイル）
    - 出力先（デフォルト: ~/Desktop/nanobanana-slides/）
    ↓
★② デザイン確認（必須）:
    - デザインプラン（スタイル・カラー・構成）をユーザーに提示
    - ユーザーの承認を得てから次に進む
    - 修正指示があれば修正して再提示
    （詳細は free-slide/AGENT.md「デザイン確認フロー」参照）
    ↓
③ スライド構成設計: 確定プランに基づき各ページの内容を設計
    → slide_structure.json
    ↓
④ free-slide サブエージェントに委譲:
    AGENT.md + STYLE.md + prompt-template.md に従いプロンプト生成
    → image_prompts.json
    ↓
⑤ 画像生成: scripts/call_nanobanana.py で画像を生成
    → slide_01.png 〜 slide_NN.png
    ↓
⑥ PDF結合: scripts/images_to_pdf.py で1つのPDFに結合
    ↓
⑦ 保存: 指定ディレクトリに出力
```

### 教材モード（white-board-slide）

```
gen-ai → slide-creator から呼び出し（教材 + カリキュラム番号）
    ↓
① スライド構成設計: 教材を10ページに分割・構成
    → slide_structure.json
    ↓
② white-board-slide サブエージェントに委譲:
    AGENT.md + STYLE.md + prompt-template.md に従いプロンプト生成
    → image_prompts.json
    ↓
③ 画像生成: scripts/call_nanobanana.py で10枚の画像を生成
    → slide_01.png 〜 slide_10.png
    ↓
④ PDF結合: scripts/images_to_pdf.py で1つのPDFに結合
    ↓
⑤ 結果を slide-creator に返す
```

## 共通スクリプト

| スクリプト | 説明 |
|---|---|
| `scripts/call_nanobanana.py` | nanobanana API で画像を生成。全スタイル共通 |
| `scripts/build_slide_structure.py` | 教材から10P構成を設計。教材モード専用 |
| `scripts/images_to_pdf.py` | 画像をPDFに結合。全スタイル共通 |

## API設定（全スタイル共通）

| 項目 | 値 |
|---|---|
| モデル | `gemini-3.1-flash-image-preview`（nanobanana 2） |
| ライブラリ | `google-genai`（`pip3 install google-genai`） |
| 認証 | 環境変数 `NANOBANANA_API_KEY` |
| 出力サイズ | 2K解像度（2752x1536px）、16:9 |
| レート制限 | リクエスト間2秒待機 |
| 無料枠 | 1日約500リクエスト |

## サブエージェントの構成ルール

新しいスタイルを追加する場合、`agents/{style_name}/` に以下を作成する：

| ファイル | 必須 | 役割 |
|---|---|---|
| `AGENT.md` | 必須 | スタイル固有の処理定義・特徴・ルール |
| `STYLE.md` | 必須 | 厳密なスタイルルール（色・フォント・統一性・禁止事項） |
| `prompt-template.md` | 必須 | 画像生成プロンプトのテンプレート |
| `design-guide.md` | 任意 | デザインガイドライン（人間向けドキュメント） |

## プロンプト生成の共通ルール

どのスタイルでも以下は共通：
- フォント名をプロンプトに含めない
- ポイント数をプロンプトに含めない
- カラーコードをプロンプトに含めない
- サイズは相対表現のみ（very large, large, medium, small, tiny）
- スタイル固有の追加ルールは各サブエージェントの STYLE.md に記載
