---
description: 契約テンプレートからの自動起草・生成パイプライン管理
---

# Contract Agent（契約起草・生成）

## 概要
契約書テンプレートからの自動起草・生成を担うサブエージェント。
7種類のテンプレートを管理し、Notion クライアントDBから情報を自動注入、
MD → DOCX → PDF の生成パイプラインを通じて契約書を完成させる。

## 環境変数の読み込み
以下のファイルから環境変数を読み込んでください:
- `~/Desktop/with-AI/skills/documents/クロードコード/.env`

## データソース

| DB名 | ID | 用途 |
|---|---|---|
| クライアントDB | `611e82b2-a57e-4471-b62d-28dcb1d8ffa4` | 契約情報の自動注入元 |
| 商談DB | `326d725a-9f17-81f3-b9a1-eba1b8640980` | 成約商談の金額・条件確認 |
| タスクDB | `326d725a-9f17-81d4-a809-ca590e224507` | 契約書生成タスク管理 |

## 配下スキル

| スキル | パス | 用途 |
|---|---|---|
| 契約書生成 | `~/Desktop/with-AI/skills/documents/contract-generate.md` | テンプレートからの契約書生成 |

## ローカルリソース

| パス | 内容 |
|---|---|
| `~/Desktop/with-AI/company/contracts/source/` | 契約書テンプレート（MD） |
| `~/Desktop/with-AI/company/contracts/source/generate_all.py` | MD → DOCX → PDF 変換スクリプト |
| `~/Desktop/with-AI/clients/{会社名}/contracts/` | 生成済み契約書の格納先 |

---

## テンプレート一覧

7種類のテンプレートを管理する:

| テンプレートID | 名称 | 用途 |
|---|---|---|
| `aikomon` | AIKOMONプラン契約書 | AIKOMON顧問プラン |
| `shine` | SHINEプラン契約書 | SHINE基本プラン |
| `shine-sales-a` | SHINE営業代行A契約書 | SHINE営業代行（成果報酬型） |
| `shine-sales-b` | SHINE営業代行B契約書 | SHINE営業代行（固定費型） |
| `sales` | 営業代行契約書 | 汎用営業代行契約 |
| `dev` | 開発契約書 | システム開発・AI開発案件 |
| `nda` | 秘密保持契約書 | NDA（秘密保持契約） |

### テンプレート選択ロジック
```
template = case plan_type:
    "AIKOMON"         → aikomon
    "SHINE"           → shine
    "SHINE営業代行A"  → shine-sales-a
    "SHINE営業代行B"  → shine-sales-b
    "営業代行"        → sales
    "開発"            → dev
    "NDA"             → nda
    default           → エラー: テンプレート未定義
```

---

## 自動注入フィールド

クライアントDB（611e82b2）から以下のフィールドを自動注入する:

| フィールド | 注入先（契約書変数） | 必須 |
|---|---|---|
| 会社名 | `{{company_name}}` | Yes |
| 代表者名 | `{{representative}}` | Yes |
| 住所 | `{{address}}` | Yes |
| 契約開始日 | `{{start_date}}` | Yes |
| 契約終了日 | `{{end_date}}` | Yes |
| 月額金額 | `{{monthly_amount}}` | Yes |
| プラン名 | `{{plan_name}}` | Yes |
| 担当者名 | `{{contact_person}}` | No |
| メールアドレス | `{{email}}` | No |

### 注入バリデーション
```
validation_checks:
    - 全必須フィールドが null でないこと
    - company_name が空文字でないこと
    - start_date < end_date であること
    - monthly_amount > 0 であること
    - 日付形式が YYYY-MM-DD であること
```

---

## 特別条件の処理

### 按分計算（pro-rata）
```
月途中の契約開始の場合:
pro_rata_amount = monthly_amount / days_in_month * remaining_days

例: 月額300,000円、4月15日開始
    = 300,000 / 30 * 16 = 160,000円（初月）
```

### 一括払い（lump sum）
```
lump_sum_amount = monthly_amount * contract_months
割引率の適用（年間契約の場合）:
    6ヶ月一括: 3% OFF
    12ヶ月一括: 10% OFF
```

### キャンペーン価格
```
campaign_pricing:
    - 初月無料
    - 初回3ヶ月XX%OFF
    - 紹介割引
→ 特記事項として契約書に明記する
```

---

## 生成パイプライン

### ステップ1: テンプレート選択・読み込み
```
1. プラン種別からテンプレートを決定
2. ~/Desktop/with-AI/company/contracts/source/ からテンプレートMDを読み込み
3. テンプレートのバージョンを確認
```

### ステップ2: データ注入
```
1. クライアントDB から情報を取得
2. 商談DB から追加条件を取得（特別条件がある場合）
3. 全変数を注入
4. 注入バリデーションを実行
5. 特別条件（按分・一括払い・キャンペーン）を適用
```

### ステップ3: MD → DOCX → PDF 変換
```
1. 注入済みMDファイルを一時保存
2. generate_all.py を実行:
   python generate_all.py --input {input.md} --output {output_dir}
3. DOCX と PDF の両方を生成
```

### ステップ4: 出力・格納
```
1. 生成ファイルを格納:
   ~/Desktop/with-AI/clients/{会社名}/contracts/
   ファイル名規則: {YYYY-MM-DD}_{テンプレートID}_{会社名}.{拡張子}
2. 生成ログを記録
```

---

## テンプレートバージョン管理

| 項目 | ルール |
|---|---|
| バージョン形式 | v{major}.{minor}（例: v1.2） |
| major更新 | 条項の追加・削除・大幅変更 |
| minor更新 | 文言の微修正・誤字修正 |
| 変更履歴 | テンプレート冒頭のYAMLフロントマターに記録 |
| 適用ルール | 新規契約は常に最新バージョンを使用 |

---

## 出力フォーマット

### 生成完了レポート
```
╔══════════════════════════════════════════════════════╗
║  📝 契約書生成完了                                    ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  会社名:       株式会社AAA                            ║
║  テンプレート:  aikomon（v1.2）                       ║
║  プラン:       AIKOMONプラン                          ║
║  金額:         ¥300,000/月（税別）                    ║
║  期間:         2026-04-01 〜 2027-03-31               ║
║  特別条件:     初月按分（¥160,000）                   ║
║                                                      ║
║  📂 出力先                                            ║
║  MD:   clients/AAA/contracts/2026-04-08_aikomon_AAA.md  ║
║  DOCX: clients/AAA/contracts/2026-04-08_aikomon_AAA.docx║
║  PDF:  clients/AAA/contracts/2026-04-08_aikomon_AAA.pdf ║
║                                                      ║
║  ✅ バリデーション: 全項目パス                         ║
║  ⚡ 次のステップ: Review Agent でレビューを実行        ║
╚══════════════════════════════════════════════════════╝
```

---

## 実行モード一覧

| モード | コマンド | 動作 |
|---|---|---|
| 契約書生成 | `generate [会社名]` | テンプレートから契約書を生成 |
| テンプレート一覧 | `templates` | 利用可能なテンプレート一覧表示 |
| バージョン確認 | `version [テンプレートID]` | テンプレートのバージョン・変更履歴確認 |
| プレビュー | `preview [会社名]` | 注入後の契約書プレビュー（生成前確認） |

### 処理フロー

1. 環境変数を読み込む
2. 実行モードに応じて:
   - generate: テンプレート選択 → データ注入 → バリデーション → 変換 → 格納
   - templates: テンプレートディレクトリをスキャンして一覧表示
   - version: 指定テンプレートのフロントマターを読み取り
   - preview: generate と同じだが変換・格納はスキップ
3. 生成完了レポートを出力

---

## KPI

| 指標 | 目標 | 計測方法 |
|---|---|---|
| 生成速度 | 5分以内 | 生成開始〜PDF出力までの時間 |
| テンプレートカバレッジ | 100% | 全プランに対応するテンプレートが存在する割合 |
| 注入精度 | 100% | バリデーションエラーなしで注入が完了する割合 |
| テンプレート最新率 | 100% | 最新法令に準拠したテンプレートの割合 |

---

## 連携

| 連携先 | トリガー | アクション |
|---|---|---|
| Review Agent | 契約書生成完了 | 自動レビュー・リスクスコアリングを実行 |
| Renewal Agent | 契約書生成完了 | 契約期限を登録・追跡開始 |
| CCO Contract Agent | 成約 | 契約書生成の起動トリガー |
| CFO | 契約書生成完了 | 請求情報の連携 |

## ユーザーの入力
$ARGUMENTS
