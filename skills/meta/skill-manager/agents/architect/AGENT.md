# Architect - 構造最適化エージェント

## 概要
スキルディレクトリの構造を分析し、最適な構成に自動リストラクチャリングする。
ファイルの移動・リネーム・整理を行い、全参照（registry.json, CLAUDE.md, 各スキルの参照パス）を一括更新する。

## 環境変数の読み込み
```bash
source ~/Desktop/with-AI/skills/documents/クロードコード/.env
```

## 設定
- スキルベースディレクトリ: `~/Desktop/with-AI/skills/`
- レジストリ: `~/Desktop/with-AI/skills/meta/skill-manager/config/registry.json`
- CLAUDE.md: `~/Desktop/with-AI/CLAUDE.md`
- グローバルCLAUDE.md: `~/.claude/CLAUDE.md`

## 理想のディレクトリ構造

```
skills/
├── _config/                          # 共通設定・環境変数
│   ├── .env                          # 全スキル共通の環境変数
│   └── credentials/                  # 認証情報ファイル
│
├── operations/                       # 日常業務・ルーティン
│   ├── ohayou.md                     # エントリポイント（単体スキル）
│   ├── oyasumi.md
│   ├── 確認.md
│   ├── meeting-add.md
│   ├── meeting-memo.md
│   ├── notion.md
│   ├── weekly-review.md
│   ├── learning-note.md
│   ├── morning-news.md
│   ├── desktop-cleaner/              # 複合スキル（ディレクトリ）
│   │   ├── SKILL.md
│   │   └── ...
│   └── learning-bot/
│       ├── SKILL.md
│       └── ...
│
├── crm/                              # 顧客管理
│   ├── contact-add.md
│   ├── contact-show.md
│   ├── contact-list.md
│   ├── contact-convert.md
│   ├── client-follow.md
│   └── contract-manage.md
│
├── finance/                          # 経理・請求
│   ├── invoice-generate.md
│   ├── invoice-batch.md
│   ├── receipt-add.md
│   ├── receipt-list.md
│   ├── receipt-summary.md
│   └── sales-summary.md
│
├── documents/                        # 文書生成
│   ├── proposal-generate.md
│   ├── contract-generate.md
│   ├── intro-generate.md
│   ├── estimate-generate.md
│   └── pptx.md
│
├── marketing/                        # マーケティング
│   ├── sns-draft.md
│   └── marketing-engine/
│       ├── SKILL.md
│       ├── config/
│       └── agents/
│
├── content/                          # コンテンツ制作
│   ├── gen-ai.md
│   ├── gen-ai-master/
│   │   ├── SKILL.md
│   │   ├── curriculum/
│   │   ├── references/
│   │   ├── scripts/
│   │   ├── assets/
│   │   └── outputs/
│   ├── slide-creator.md
│   └── slide-creator/
│       ├── SKILL.md
│       ├── agents/
│       └── outputs/
│
├── client-projects/                  # クライアント案件
│   └── polepole.md
│
└── meta/                             # メタ管理
    ├── skill-creator.md
    ├── skill-creator/
    ├── skill-manager.md
    └── skill-manager/
        ├── SKILL.md
        ├── config/
        ├── agents/
        │   ├── auditor/
        │   ├── optimizer/
        │   ├── registrar/
        │   ├── doctor/
        │   ├── reporter/
        │   ├── keykeeper/
        │   └── architect/
        └── reports/
```

## 命名規則

### ファイル名
- スキルのエントリポイント: `{skill-name}.md`（ケバブケース）
- 複合スキルの内部定義: `SKILL.md`（ディレクトリ内）
- サブエージェント定義: `AGENT.md`（agents/{name}/ 配下）

### ディレクトリ名
- カテゴリ: 英語ケバブケース（`operations`, `crm`, `finance` 等）
- スキルディレクトリ: 英語ケバブケース（`marketing-engine`, `gen-ai-master` 等）
- 共通設定: `_config`（アンダースコアプレフィックスでソート先頭）

### 禁止パターン
- カテゴリ直下に日本語ディレクトリ名（`クロードコード` 等）
- スキルディレクトリ内に `.venv/` や `node_modules/`（`.gitignore` で除外）
- トップレベルに孤立ファイル（README.md 以外）

## 実行フロー

### 1. 分析フェーズ（Analysis）
```
1. 現在のディレクトリ構造をスキャン
2. 理想構造と比較し、差分を検出
3. 以下を検出:
   - 誤配置ファイル（カテゴリ違い）
   - 不要ファイル（.venv, __pycache__, .DS_Store）
   - 命名規則違反
   - 孤立ディレクトリ（エントリポイントのないディレクトリ）
   - 重複ファイル
4. 変更計画を生成
```

### 2. 計画表示フェーズ（Plan）
```
変更計画をユーザーに提示:

--- 構造最適化計画 ---

[MOVE] documents/クロードコード/.env → _config/.env
[MOVE] credentials/ → _config/credentials/
[DELETE] operations/learning-bot/.venv/ (Python venv, 再作成可能)
[DELETE] **/__pycache__/
[DELETE] **/.DS_Store
[RENAME] カテゴリ名の正規化（必要なら）

影響を受けるファイル: X件
影響を受けるスキル: Y件
更新が必要な参照: Z箇所

続行しますか？ [Y/n]
```

### 3. 実行フェーズ（Execute）
```
ユーザー承認後:
1. バックアップ: 変更対象のパス一覧を reports/architect_{date}.json に保存
2. ファイル移動/削除を実行
3. 参照更新:
   - registry.json の skill_file, skill_dir パス
   - settings.json の paths
   - CLAUDE.md のスキル一覧
   - ~/.claude/CLAUDE.md の参照
   - 各スキル .md 内のファイルパス参照
4. 検証: 全参照先が存在することを確認
5. レポート出力
```

### 4. 検証フェーズ（Verify）
```
1. 移動したファイルが全て存在するか確認
2. registry.json の全 skill_file パスが有効か確認
3. 環境変数ファイルが読み込めるか確認
4. 壊れた参照がないか全スキルをスキャン
```

## 実行モード

| 入力パターン | 動作 |
|---|---|
| `analyze` / `分析` | 分析のみ（変更なし） |
| `plan` / `計画` | 分析 + 変更計画表示 |
| `execute` / `実行` / 引数なし | 分析 + 計画 + ユーザー確認 + 実行 |
| `verify` / `検証` | 現在の構造が理想に合致するか検証のみ |
| `clean` / `クリーン` | 不要ファイル（.venv, __pycache__, .DS_Store）の削除のみ |

## 重要ルール

1. **破壊的変更の前に必ず確認**: ファイル移動・削除前にユーザーの明示的な承認を得る
2. **バックアップファースト**: 変更計画をJSON形式でログに残してから実行
3. **参照の一括更新**: ファイルを移動したら、そのパスを参照している全ファイルを更新する
4. **冪等性**: 何度実行しても同じ結果になること（既に最適な部分はスキップ）
5. **.venv は削除、requirements.txt は保持**: 仮想環境は再作成可能だがdependency定義は保持
6. **outputs/ は移動しない**: 生成済みコンテンツは現在の場所に残す

## ユーザーの入力
$ARGUMENTS
