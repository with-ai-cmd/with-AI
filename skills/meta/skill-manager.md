---
description: 全スキルを一元管理するメタエージェント。ヘルスチェック・APIキー管理・最適化・修復・レポートを統括する。「/skill-manager daily」「スキル管理」「ヘルスチェック」等で起動。
---

以下のエージェント定義ファイルを読み込み、指示に従ってスキル管理を実行してください。

## メインエージェント（司令塔）
~/Desktop/with-AI/skills/meta/skill-manager/SKILL.md

## 設定ファイル
~/Desktop/with-AI/skills/meta/skill-manager/config/registry.json
~/Desktop/with-AI/skills/meta/skill-manager/config/settings.json

## サブエージェント

### 監査（ヘルスチェック）
~/Desktop/with-AI/skills/meta/skill-manager/agents/auditor/AGENT.md

### 最適化（並列実行・パフォーマンス）
~/Desktop/with-AI/skills/meta/skill-manager/agents/optimizer/AGENT.md

### 登録（新スキル自動登録）
~/Desktop/with-AI/skills/meta/skill-manager/agents/registrar/AGENT.md

### 修復（壊れたスキルの修理）
~/Desktop/with-AI/skills/meta/skill-manager/agents/doctor/AGENT.md

### レポート（定期報告）
~/Desktop/with-AI/skills/meta/skill-manager/agents/reporter/AGENT.md

### 鍵番（APIキー管理）
~/Desktop/with-AI/skills/meta/skill-manager/agents/keykeeper/AGENT.md

### 構造最適化（ディレクトリ整理）
~/Desktop/with-AI/skills/meta/skill-manager/agents/architect/AGENT.md

## 実行モード判定

ユーザーの入力を解析し、適切なモードで実行する：

| 入力パターン | 実行モード |
|---|---|
| `daily` / `デイリー` / 引数なし | デイリーチェック |
| `weekly` / `ウィークリー` / `週次` | ウィークリーチェック |
| `monthly` / `マンスリー` / `月次` | マンスリーレビュー |
| `check` / `チェック` | Auditor による全スキルヘルスチェック |
| `register` / `登録` | Registrar による未登録スキルスキャン |
| `fix [名前]` / `修復 [名前]` | Doctor による指定スキルの修復 |
| `optimize` / `最適化` | Optimizer による並列実行最適化提案 |
| `keys` / `キー` | Keykeeper によるAPIキー全数チェック |
| `report [期間]` | Reporter によるレポート生成 |
| `list` / `一覧` | 全スキルダッシュボード表示 |
| `deps [名前]` / `依存` | 指定スキルの依存関係ツリー表示 |
| `status` / `ステータス` | サブエージェント一覧と最終実行日時を表示 |
| `structure` / `構造` / `整理` | Architect による構造分析・最適化 |

ユーザーの入力: $ARGUMENTS
