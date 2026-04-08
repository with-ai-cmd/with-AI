---
description: クライアントを指定して請求書PDFを生成する。初月は日割り計算に対応。「請求書作成」「請求書生成」でトリガー。
---

# 請求書生成スキル

## 概要
NotionクライアントDBから契約情報を取得し、請求書PDFを生成する。
初月は契約開始日からの日割り計算を自動で行う。

## 環境変数の読み込み
以下のファイルから環境変数を読み込んでください:
- `{{WITHAI_ROOT}}/skills/documents/クロードコード/.env`

## 設定ファイルの読み込み
以下のファイルから会社情報・振込先を読み込む:
- `{{WITHAI_ROOT}}/company/invoices/config.json`

---

## 手順

### 1. クライアント情報の取得

$ARGUMENTSで指定された会社名でNotion クライアントDB（ID: `611e82b2-a57e-4471-b62d-28dcb1d8ffa4`）をMCP toolで検索する。

**必須情報の確認:**
- 会社名・顧客名
- 担当者名
- 契約プラン
- 月額
- 契約開始日
- 契約状況（「契約中」であること）
- 請求先メール（またはメールアドレス）
- 住所

不足があればユーザーに確認する。

### 2. 請求対象月の確認

ユーザーに請求対象月を確認する（デフォルト: 今月）。

```
請求対象月: 2026年4月（デフォルト: 今月）
変更しますか？
```

### 3. 金額計算

#### 通常月の場合
```
請求金額 = 月額（税抜）
消費税 = 月額 × 10%
合計 = 月額 + 消費税
```

#### 初月（日割り計算）の場合
契約開始日の月 = 請求対象月 の場合に日割り計算を適用する。

```python
import calendar

contract_start_day = 契約開始日の日
total_days = calendar.monthrange(year, month)[1]  # その月の日数
remaining_days = total_days - contract_start_day + 1  # 開始日を含む

prorated_amount = int(monthly_fee * remaining_days / total_days)
tax = int(prorated_amount * 0.10)
total = prorated_amount + tax
```

**日割り計算の表示例:**
```
━━━ 日割り計算 ━━━
月額:         ¥250,000
契約開始日:   2026-04-15
対象日数:     16日 / 30日
日割り金額:   ¥133,333（税抜）
消費税(10%):  ¥13,333
合計:         ¥146,666
━━━━━━━━━━━━━━━
```

#### スポット案件の場合（AI研修・システム開発）
月額が0またはNullの場合、金額を手入力で確認する。

### 4. 請求書番号の採番

フォーマット: `INV-{YYYYMM}-{連番3桁}`

既存の請求書ファイルから最新の連番を確認:
```bash
ls {{WITHAI_ROOT}}/clients/*/invoices/ 2>/dev/null | grep "$(date +%Y-%m)" | wc -l
```

### 5. 請求内容の確認

```
━━━ 請求書プレビュー ━━━
請求書番号:    INV-202604-001
請求日:        2026-04-30
支払期限:      2026-05-31

請求先:
  会社名: 株式会社サンプル
  担当者: 山田太郎 様

品目:
  AIKOMONプラン（2026年4月分・日割り: 4/15〜4/30）
  ¥133,333

小計:          ¥133,333
消費税(10%):   ¥13,333
合計:          ¥146,666

振込先:        config.jsonの銀行情報
支払期限:      2026年5月31日
━━━━━━━━━━━━━━━━━━━
この内容で請求書を生成しますか？
```

### 6. PDF生成

Pythonスクリプトで請求書PDFを生成する:
```bash
python3 {{WITHAI_ROOT}}/company/invoices/scripts/generate_invoice.py \
  --company "株式会社サンプル" \
  --contact "山田太郎" \
  --item "AIKOMONプラン（2026年4月分）" \
  --amount 133333 \
  --tax 13333 \
  --invoice-number "INV-202604-001" \
  --invoice-date "2026-04-30" \
  --due-date "2026-05-31" \
  --output "{{WITHAI_ROOT}}/clients/サンプル/invoices/2026-04_請求書.pdf"
```

### 7. クライアントディレクトリの自動作成

クライアントのディレクトリが存在しない場合は自動作成:
```bash
mkdir -p {{WITHAI_ROOT}}/clients/{会社名}/{contracts,invoices,notes}
```

### 8. 完了メッセージ

```
請求書を生成しました:
  {{WITHAI_ROOT}}/clients/サンプル/invoices/2026-04_請求書.pdf

次のアクション:
  - Gmail下書きを作成しますか？ → /invoice-batch で一斉送信も可能
  - 請求書を確認するには上記パスを開いてください
```
