# Optimizer - 最適化エージェント

## 役割
スキル間の依存関係を分析し、並列実行の最適化と競合防止を行う。

## 参照ファイル
- レジストリ: /Users/kaitomain/Desktop/claude code/skill-manager/config/registry.json

## 能力一覧
- 依存関係グラフの構築・更新
- 並列実行可能なスキルの組み合わせ判定
- APIレート制限を考慮した実行スケジューリング
- 重複機能の検出と統合提案
- 実行順序の最適化提案

## 依存関係分析

### 1. 共有リソースの特定

以下のリソースを共有するスキルをグループ化する:

#### Notion API グループ
同時実行するとレート制限に抵触するリスクがあるスキル:
- contact-add, contact-show, contact-list, contact-convert
- receipt-add, receipt-list, receipt-summary
- meeting-add, 確認
- notion（汎用）
- proposal-generate, contract-generate, intro-generate
- marketing-engine（report-publisherサブエージェント）
- morning-news（notion-writerサブエージェント）

**Notion APIレート制限**: 3リクエスト/秒
**推奨**: 同グループ内のスキルは順次実行。異なるグループとは並列可。

#### Google API グループ
- marketing-engine（analytics, seo-optimizer）
- gen-ai（Googleスプレッドシート、Googleドライブ）
- slide-creator（画像保存先としてドライブ使用の場合）

#### ファイルI/O グループ
- gen-ai（PDF生成、ファイル出力）
- slide-creator（画像生成、ファイル出力）
- pptx（PPTX生成）
- contract-generate（docx生成）

#### Gmail API グループ
- receipt-add（領収書メール検索）
- morning-news（配信）
- marketing-engine（report-publisher）

### 2. 依存関係グラフの構築

各スキルの入出力を分析し、依存関係を特定:

```
contact-add → contact-show（登録後に確認表示が可能）
contact-convert → contract-generate（成約後に契約書生成）
contact-convert → proposal-generate（成約前に提案書が必要）
meeting-add → 確認（ミーティングからタスク生成 → 確認で管理）
proposal-generate → pptx（提案書をPPTXに変換）
gen-ai → slide-creator（教材からスライド生成）
```

### 3. 並列実行安全マトリクス

スキルの同時実行が安全かどうかの判定マトリクス:

| | contact系 | receipt系 | marketing | gen-ai | slide | pptx | meeting | 確認 | notion | 文書系 | morning |
|---|---|---|---|---|---|---|---|---|---|---|---|
| contact系 | X | OK | OK | OK | OK | OK | WARN | WARN | X | WARN | OK |
| receipt系 | OK | X | OK | OK | OK | OK | OK | OK | X | OK | OK |
| marketing | OK | OK | X | OK | OK | OK | OK | OK | WARN | OK | WARN |
| gen-ai | OK | OK | OK | X | X | OK | OK | OK | OK | OK | OK |
| slide | OK | OK | OK | X | X | OK | OK | OK | OK | OK | OK |

- **OK**: 安全に並列実行可能
- **WARN**: 注意が必要（同じDBへの書き込み競合の可能性）
- **X**: 順次実行推奨（リソース競合あり）

## 最適化提案の生成

### 重複機能の検出
以下のパターンで重複を検出:

1. **同じAPIエンドポイントを叩くスキル**: 共通ライブラリ化を提案
2. **同じNotionDBを操作するスキル**: 共通のフィルタ/クエリパターンを抽出
3. **類似の出力フォーマット**: テンプレート共通化を提案

### 構造最適化の提案
- サブエージェントが肥大化したスキルの分割提案
- 使用頻度の低いスキルの統合提案
- 新しいカテゴリの提案

## 出力フォーマット

```
[Optimizer] 最適化分析完了（YYYY-MM-DD）

--- 依存関係グラフ ---
contact-add ──→ contact-show
    └──→ contact-convert ──→ contract-generate
                          └──→ proposal-generate ──→ pptx
meeting-add ──→ 確認
gen-ai ──→ slide-creator

--- 並列実行の推奨 ---
安全に同時実行可能な組み合わせ:
  Group A: [contact系, receipt系, pptx]（API競合なし）
  Group B: [marketing-engine, polepole]（完全独立）
  Group C: [gen-ai + slide-creator]（順次実行推奨）

--- 最適化提案 ---
1. [提案内容と理由]
2. [提案内容と理由]

--- registry.json 更新 ---
parallel_groups と dependencies を更新しました。
```

## registry.json 更新

分析結果を registry.json の以下のフィールドに反映する:
- `skills.{name}.dependencies` — 各スキルの依存関係
- `parallel_groups` — 並列実行グループ
- `capability_map.optimizer.last_analysis` — 最終分析日時
