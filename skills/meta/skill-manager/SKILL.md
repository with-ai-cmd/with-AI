# Skill Manager - メタエージェント司令塔

## 概要
全スキル（エージェント）を一元管理するメタエージェント。
ヘルスチェック、APIキー管理、最適化、修復、レポート生成を統括する。

## 環境変数の読み込み
```bash
source ~/Desktop/with-AI/skills/documents/クロードコード/.env
```

## 設定ファイル
- レジストリ: ~/Desktop/with-AI/skills/meta/skill-manager/config/registry.json
- 設定: ~/Desktop/with-AI/skills/meta/skill-manager/config/settings.json

## サブエージェント一覧

| # | エージェント | 定義ファイル | 役割 |
|---|------------|-------------|------|
| 1 | Auditor | agents/auditor/AGENT.md | 全スキルの健全性チェック（Level 1/2） |
| 2 | Optimizer | agents/optimizer/AGENT.md | 並列実行・パフォーマンス最適化 |
| 3 | Registrar | agents/registrar/AGENT.md | 新スキルの自動登録・カタログ管理 |
| 4 | Doctor | agents/doctor/AGENT.md | 壊れたスキルの診断・修復 |
| 5 | Reporter | agents/reporter/AGENT.md | 定期レポート生成・ダッシュボード表示 |
| 6 | Keykeeper | agents/keykeeper/AGENT.md | APIキー・認証情報の管理 |
| 7 | Architect | agents/architect/AGENT.md | ディレクトリ構造の分析・最適化 |

## 実行モード判定

ユーザーの入力（$ARGUMENTS）を解析し、適切なモードで実行する。

### スケジュール実行モード

| 入力パターン | 実行モード | 起動エージェント |
|---|---|---|
| `daily` / `デイリー` / 引数なし | デイリーチェック | Keykeeper → Auditor(L1) → Reporter |
| `weekly` / `ウィークリー` / `週次` | ウィークリーチェック | Keykeeper → Auditor(L2) → Registrar → Optimizer → Reporter |
| `monthly` / `マンスリー` / `月次` | マンスリーレビュー | Keykeeper → Auditor(L2) → Registrar → Optimizer → Doctor → Reporter |

### 個別実行モード

| 入力パターン | 動作 |
|---|---|
| `check` / `チェック` | Auditor による全スキルヘルスチェック |
| `register` / `登録` | Registrar による未登録スキルスキャン |
| `fix [スキル名]` / `修復 [スキル名]` | Doctor による指定スキルの修復 |
| `optimize` / `最適化` | Optimizer による並列実行最適化提案 |
| `keys` / `キー` | Keykeeper によるAPIキー全数チェック |
| `report [期間]` | Reporter によるレポート生成 |
| `list` / `一覧` | 全スキルダッシュボード表示 |
| `deps [スキル名]` / `依存` | 指定スキルの依存関係ツリー表示 |
| `status` / `ステータス` | サブエージェント一覧と最終実行日時を表示 |
| `structure` / `構造` / `整理` | Architect による構造分析・最適化 |

## 実行フロー

### デイリーチェック（daily）
```
1. registry.json を読み込む
2. 並列実行:
   ├── Keykeeper: APIキー有効性チェック
   └── Auditor: Level 1 軽量ヘルスチェック（全スキル）
3. 結果を統合
4. Reporter: デイリーサマリーを出力
5. 問題があれば → Doctor に自動引き渡し（ユーザー確認後）
6. registry.json の last_audit を更新
```

### ウィークリーチェック（weekly）
```
1. registry.json を読み込む
2. 並列実行（Phase 1）:
   ├── Keykeeper: APIキー全数チェック + 期限警告
   └── Registrar: 未登録スキルスキャン → 検出時は自動登録
3. 並列実行（Phase 2）:
   ├── Auditor: Level 2 スモークテスト（全スキル実行テスト）
   └── Optimizer: 並列実行の競合チェック + 依存関係グラフ更新
4. 結果を統合
5. Reporter: 週次レポート生成（reports/ に保存）
6. 問題があれば → Doctor に引き渡し
7. registry.json を更新
```

### マンスリーレビュー（monthly）
```
1. registry.json を読み込む
2. 並列実行（Phase 1）:
   ├── Keykeeper: キーローテーション推奨 + セキュリティ監査
   └── Registrar: カテゴリ整理 + 重複検出
3. 並列実行（Phase 2）:
   ├── Auditor: 全スキル完全監査（Level 1 + Level 2）
   └── Optimizer: 全体構造の最適化提案
4. Doctor: 過去1ヶ月の問題傾向分析 + 予防修復提案
5. Reporter: 月次レポート生成（reports/ に保存）
6. registry.json を全面更新
```

## ダッシュボード表示（list）

`/skill-manager list` 実行時に以下を表示:

```
 Skill Manager Dashboard（YYYY-MM-DD）

--- サブエージェント ---
| エージェント  | 状態  | 管理対象        | 次回実行    |
|-------------|-------|----------------|------------|
| Auditor     | [状態] | 全スキル        | [次回]      |
| Optimizer   | [状態] | スキル間関係性   | [次回]      |
| Registrar   | [状態] | registry.json  | [次回]      |
| Doctor      | [状態] | 問題発生時      | オンデマンド  |
| Reporter    | [状態] | reports/       | [次回]      |
| Keykeeper   | [状態] | APIキー        | [次回]      |

--- 管理対象スキル（カテゴリ別）---
| カテゴリ   | スキル数 | 状態    |
|-----------|---------|--------|
| CRM       | 4件     | [状態]  |
| 経理      | 3件     | [状態]  |
| マーケ    | 1件     | [状態]  |
| コンテンツ | 3件     | [状態]  |
| データ    | 1件     | [状態]  |
| 業務      | 3件     | [状態]  |
| 文書      | 3件     | [状態]  |
| クライアント | 1件   | [状態]  |
| メタ      | 2件     | [状態]  |

--- APIキー状態 ---
| サービス  | 状態  | 利用スキル数 | 備考 |
|----------|-------|------------|------|
（Keykeeperの結果を表示）

--- アクション必要 ---
（問題があればここに表示）
```

## 重要ルール

1. **registry.json が単一の真実の源**: 全スキルの状態はここで管理する
2. **並列実行を最大化**: 依存関係のないエージェントは必ず並列で実行する
3. **破壊的変更の前に確認**: Doctor がスキルを修正する前に必ずユーザーに確認する
4. **レポートは reports/ に保存**: ファイル名は `{期間}_{日付}.md`（例: `weekly_2026-03-24.md`）
5. **各エージェントの AGENT.md を必ず読み込んでから実行する**
6. **スキルのファイルを修正する場合は、修正前の内容をバックアップとしてログに残す**
