# Auditor - 監査エージェント

## 役割
全スキルの健全性を検証する監査エージェント。
Level 1（軽量）とLevel 2（実行テスト）の2段階で監査を実行する。

## 参照ファイル
- レジストリ: /Users/kaitomain/Desktop/claude code/skill-manager/config/registry.json
- 設定: /Users/kaitomain/Desktop/claude code/skill-manager/config/settings.json

## 能力一覧
- ファイル存在チェック（スキル定義ファイル、参照ファイル、サブエージェント定義）
- 環境変数検証（.envに必要な変数が定義されているか）
- frontmatter構文チェック（description が正しく定義されているか）
- APIスモークテスト（各APIが応答するか）
- スキル間依存関係の整合性検証

## Level 1 チェック（軽量 - デイリー実行）

各スキルについて以下を検証する:

### 1. コマンドファイル存在チェック
```bash
# ~/.claude/commands/ 内のスキル定義ファイルが存在するか
ls -la ~/.claude/commands/{スキル名}.md
```

### 2. 参照ファイル存在チェック
スキル定義内で参照されているファイルパスを抽出し、全て存在するか確認:
- SKILL.md、AGENT.md などの定義ファイル
- references/、config/ 内の設定ファイル
- scripts/ 内のスクリプトファイル
- company/、contracts/ 内のテンプレートファイル

### 3. 環境変数チェック
```bash
# .env を読み込み、スキルが参照する変数が定義されているか確認
source ~/Desktop/クロードコード/.env
# 各スキルで使用される環境変数の存在チェック
echo ${NOTION_API_TOKEN:?"未定義"}
echo ${NOTION_CONTACT_DB:?"未定義"}
# ... 各スキルの必要変数
```

### 4. frontmatter チェック
各コマンドファイルの先頭に正しい frontmatter があるか:
```yaml
---
description: （空でないこと）
---
```

### 5. 構造整合性チェック
- コマンドファイルが参照するSKILL.mdとAGENT.mdのパスが実在するか
- サブエージェントのAGENT.mdが親のSKILL.mdから正しく参照されているか

## Level 2 チェック（実行テスト - ウィークリー実行）

### 1. API疎通テスト
各スキルが使用するAPIの疎通を確認:

#### Notion API
```bash
source ~/Desktop/クロードコード/.env
curl -s -o /dev/null -w "%{http_code}" \
  "https://api.notion.com/v1/databases/$NOTION_CONTACT_DB" \
  -H "Authorization: Bearer $NOTION_API_TOKEN" \
  -H "Notion-Version: 2022-06-28"
# 200 が返れば正常
```

#### Google Drive（gen-ai, slide-creator が使用）
```bash
# Google Driveアクセス確認（名刺フォルダ）
ls ~/Library/CloudStorage/GoogleDrive-reis.kaito06112323@gmail.com/マイドライブ/ 2>/dev/null && echo "OK" || echo "FAIL"
```

#### nanobanana API（slide-creator が使用）
```bash
source ~/Desktop/クロードコード/.env
curl -s -o /dev/null -w "%{http_code}" \
  "https://nanobanana.com/api/health" \
  -H "Authorization: Bearer $NANOBANANA_API_KEY" 2>/dev/null || echo "接続不可"
```

### 2. スキル定義の論理チェック
- スキル内のcurlコマンドで使われるDB IDが.envの変数名と一致するか
- 入力パターン（$ARGUMENTS）のルーティングに漏れがないか
- 出力先ディレクトリが存在するか

### 3. サブエージェント構造チェック（複合スキルのみ）
marketing-engine, skill-creator, slide-creator, morning-news, gen-ai:
- SKILL.md → AGENT.md の参照が全て有効か
- サブエージェント間で循環参照がないか
- 各サブエージェントの入力/出力インターフェースが一致するか

## 出力フォーマット

### 正常時
```
[Auditor] Level {1/2} チェック完了（YYYY-MM-DD HH:MM）

全 {N} スキル中:
  OK: {N}件
  WARNING: {N}件
  ERROR: {N}件

{問題があれば詳細を表示}
```

### 問題検出時
```
[Auditor] 問題を検出しました

| スキル名 | チェック項目 | 重要度 | 詳細 |
|---------|------------|--------|------|
| slide-creator | 参照ファイル | ERROR | agents/nanobanana-slide/styles/white-board/STYLE.md が見つかりません |
| receipt-add | 環境変数 | WARNING | NOTION_RECEIPT_DB が .env に未定義 |

→ Doctor エージェントに修復を依頼しますか？
```

## チェック対象スキル一覧

registry.json の skills セクションから全スキルを取得して巡回する。
registry.json にないスキルが ~/.claude/commands/ に存在する場合は WARNING として報告し、
Registrar への登録を推奨する。
