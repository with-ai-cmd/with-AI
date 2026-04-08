---
name: desktop-cleaner
description: デスクトップを自動で整理するスキル。ファイルやフォルダを種類ごとに分類し、適切なフォルダへ移動する。デスクトップの掃除、整理、片付けをしたいときに使う。
---

# Desktop Cleaner — デスクトップ自動整理スキル

デスクトップ上の散らかったファイル・フォルダを自動で分類し、適切な場所へ移動する。

## フォルダ構成（移動先）

```
~/Desktop/
├── Projects/
│   ├── clients/          # クライアント案件
│   ├── internal/         # 自社プロジェクト・エージェント
│   └── personal/         # 個人の学習・実験
│       ├── sandbox/
│       └── tutorials/
├── Assets/
│   ├── images/           # 画像ファイル
│   │   ├── screenshots/  # スクリーンショット
│   │   │   └── 2026-03/  # 年月フォルダで自動整理
│   │   ├── photos/       # 写真
│   │   │   └── 2026-03/
│   │   ├── resources/    # 素材・アイコン・ロゴ等
│   │   └── client/       # クライアント関連の画像
│   │       └── {client名}/
│   ├── design/           # デザインファイル (.fig, .sketch, .psd, .ai, .xd)
│   ├── documents/        # ドキュメント
│   │   ├── proposals/    # 提案書・企画書
│   │   ├── contracts/    # 契約書
│   │   ├── invoices/     # 請求書
│   │   ├── notes/        # メモ・議事録
│   │   └── misc/         # その他
│   └── templates/        # テンプレート類
├── with-AI株式会社/       # 会社フォルダ（固定・移動しない）
└── _archive/             # 分類不明なものの一時退避先
```

## 処理フロー

### Step 1: デスクトップの現状確認

```bash
ls -la ~/Desktop/
```

デスクトップ上の全ファイル・フォルダを一覧取得する。

### Step 2: 分類

各ファイル・フォルダを以下のルールで分類する：

| 分類 | 対象 | 移動先 |
|---|---|---|
| **スクリーンショット** | ファイル名が `スクリーンショット`, `Screenshot`, `Screen Shot`, `CleanShot` で始まるもの | `Assets/images/screenshots/YYYY-MM/` |
| **写真** | .jpg, .jpeg, .heic（スクショ以外） | `Assets/images/photos/YYYY-MM/` |
| **素材画像** | .svg, .ico, .webp, アイコンやロゴと判断できるもの | `Assets/images/resources/` |
| **クライアント画像** | クライアント名を含む画像、またはクライアント案件関連と判断できるもの | `Assets/images/client/{client名}/` |
| **その他画像** | .png, .gif 等（上記に該当しないもの） | `Assets/images/screenshots/YYYY-MM/`（判断に迷ったらスクショ扱い） |
| **デザイン** | .fig, .sketch, .psd, .ai, .xd | `Assets/design/` |
| **提案書・企画書** | ファイル名に「提案」「企画」「proposal」を含む .pdf, .docx, .pptx | `Assets/documents/proposals/` |
| **契約書** | ファイル名に「契約」「contract」「NDA」を含む .pdf, .docx | `Assets/documents/contracts/` |
| **請求書** | ファイル名に「請求」「見積」「invoice」「quote」を含む .pdf, .xlsx | `Assets/documents/invoices/` |
| **その他ドキュメント** | .pdf, .docx, .xlsx, .pptx, .txt, .csv（上記に該当しないもの） | `Assets/documents/misc/` |
| **圧縮ファイル** | .zip, .tar.gz, .rar, .7z | `_archive/` |
| **インストーラー** | .dmg, .pkg, .app (Applicationsにないもの) | 削除を提案 |
| **開発プロジェクト** | package.json, SKILL.md, AGENT.md, .git/ を含むフォルダ | `Projects/` 配下に振り分け |
| **保護対象** | Projects/, Assets/, with-AI株式会社/ | **移動しない** |
| **その他** | 上記に当てはまらないもの | `_archive/` |

### Step 3: ユーザーに確認

分類結果を以下のフォーマットでユーザーに提示する：

```
## デスクトップ整理プラン

### 画像 (5件)
- `スクリーンショット 2026-03-28.png` → Assets/images/screenshots/2026-03/
- `スクリーンショット 2026-03-15.png` → Assets/images/screenshots/2026-03/
- `logo_clientA.svg` → Assets/images/client/clientA/
- `IMG_1234.heic` → Assets/images/photos/2026-03/

### ドキュメント (2件)
- `提案書_AI導入.pdf` → Assets/documents/proposals/
- `議事録0320.txt` → Assets/documents/notes/

### 削除候補
- `Cursor-installer.dmg` (インストーラー)

### そのまま残すもの
- Projects/ (保護対象)
- Assets/ (保護対象)
- with-AI株式会社/ (保護対象)

実行しますか？
```

**重要: ユーザーの確認なしにファイルを移動・削除しない。**

### Step 4: 実行

ユーザーの承認後、必要なサブフォルダを作成してからファイルを移動する。

```bash
# 年月フォルダを自動作成
mkdir -p ~/Desktop/Assets/images/screenshots/2026-03/
mkdir -p ~/Desktop/Assets/images/photos/2026-03/

# 移動
mv ~/Desktop/スクリーンショット\ 2026-03-28.png ~/Desktop/Assets/images/screenshots/2026-03/
mv ~/Desktop/提案書_AI導入.pdf ~/Desktop/Assets/documents/proposals/
```

**年月フォルダのルール**: ファイルの最終更新日（`stat -f %Sm -t %Y-%m`）から `YYYY-MM` を取得してフォルダ名にする。

### Step 5: 結果報告

整理後のデスクトップ状態を表示する。

```bash
ls -1 ~/Desktop/
```

## ルール

1. **保護フォルダは絶対に移動しない**: `Projects/`, `Assets/`, `with-AI株式会社/`
2. **隠しファイルは無視する**: `.DS_Store`, `.localized` 等
3. **確認なしに削除しない**: インストーラー等も必ずユーザーに確認
4. **同名ファイルがある場合**: 上書きせず、ファイル名に日付を付けてリネーム (例: `file_20260329.png`)
5. **_archive/ フォルダ**: 分類不明なものの一時退避先。存在しなければ自動作成
6. **年月フォルダは自動作成**: スクショ・写真はファイルの更新日から `YYYY-MM` フォルダを自動で作って格納
7. **ドキュメントはキーワードで自動振り分け**: ファイル名から「提案」「契約」「請求」等を読み取ってサブフォルダに振り分け
8. **判断に迷ったらユーザーに聞く**: 分類が曖昧な場合は勝手に決めず確認する
9. **クライアント画像はクライアント名でフォルダ分け**: `Assets/images/client/{client名}/` に格納
