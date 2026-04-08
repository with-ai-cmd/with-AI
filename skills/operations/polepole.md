---
description: POLEPOLE（児童発達支援センター）の入園手続き自動化システムの修正・編集・管理を行う。GASコード修正、フォーム質問の変更、スプレッドシート構成変更、ドライブ設定、契約書テンプレート編集など。「polepole修正」「フォームの質問変えて」「シート追加して」「GASコード直して」等で起動。
---

# POLEPOLE 入園手続き自動化システム管理

## 概要
児童発達支援センター「POLEPOLE」の入園手続きを自動化するGASベースのシステム。
Googleフォーム・スプレッドシート・ドライブ・契約書・メール送信を一括管理する。

## プロジェクトパス
```
/Users/kaitomain/Projects/polepole-enrollment-system/
```

## ファイル構成と役割

| ファイル | 役割 | 修正タイミング |
|----------|------|----------------|
| `gas/00_config.gs` | 施設名・シート名・定数の設定 | 名称変更時 |
| `gas/01_setup.gs` | 初期セットアップ・カスタムメニュー | メニュー項目追加時 |
| `gas/02_formBuilder.gs` | Googleフォーム自動生成（3分岐） | **質問の追加・修正・削除時** |
| `gas/03_triggerHandler.gs` | フォーム送信→シート振り分け | **フォーム変更に連動して必ず更新** |
| `gas/04_sheetManager.gs` | スプレッドシート7シート管理 | シート追加・ヘッダー変更時 |
| `gas/05_driveManager.gs` | 児童フォルダ自動作成 | フォルダ構成変更時 |
| `gas/06_contractManager.gs` | 契約書テンプレート・情報差し込み | 契約書内容変更時 |
| `gas/07_emailManager.gs` | メール下書き・送信管理 | メールテンプレ変更時 |
| `納品手順書.md` | お客様向けセットアップ手順 | 機能変更時に更新 |

## システム構成

```
保護者がGoogleフォーム入力
  ↓ [03_triggerHandler.gs: onFormSubmit]
3分岐: 未就学児(新規) / 就学児(新規) / 継続
  ↓
スプレッドシート7シートに自動振り分け [04_sheetManager.gs]
  ├── 基本情報一覧
  ├── アレルギー情報（赤色ハイライト）
  ├── 送迎一覧（青色ハイライト）
  ├── 保護者連絡先
  ├── アセスメント回答一覧
  ├── 経年変化シート
  └── システム設定
  ↓
児童フォルダ自動作成 [05_driveManager.gs]
  ├── 契約書控え/
  ├── アセスメント/
  ├── 写真/（掲載不同意なら作成しない）
  └── その他書類/
  ↓ スタッフ操作
契約書作成 [06_contractManager.gs] → メール送信 [07_emailManager.gs]
```

## 修正作業の手順

### フォーム質問の修正
1. `gas/02_formBuilder.gs` で該当セクションの関数を編集
   - `buildBasicInfoSection()` → 基本情報
   - `buildPreschoolSection()` → 未就学児アセスメント
   - `buildSchoolAgeSection()` → 就学児アセスメント
   - `buildContinuationSection()` → 継続アセスメント
   - `buildCommonEndSection()` → 写真・送迎（共通）
2. **必ず** `gas/03_triggerHandler.gs` の `distributeToSheets()` も連動更新
   - フォームの質問タイトルをキーにして回答を取得しているため、タイトル変更時はキーも更新する
3. 必要に応じて `gas/04_sheetManager.gs` のヘッダーも更新

### スプレッドシートの修正
1. `gas/04_sheetManager.gs` の `setupSpreadsheet()` でシート追加・ヘッダー変更
2. `gas/03_triggerHandler.gs` の振り分けロジックも更新

### ドライブフォルダの修正
1. `gas/05_driveManager.gs` の `createChildFolder()` を編集

### 契約書の修正
1. `gas/06_contractManager.gs` の `createContractTemplate()` を編集
2. 差し込み変数: `{{児童氏名}}`, `{{ふりがな}}`, `{{生年月日}}`, `{{郵便番号}}`, `{{市町村名}}`, `{{町名番地}}`, `{{携帯電話}}`, `{{メールアドレス}}`

## 修正時の注意事項

- フォーム質問を変更したら、必ずトリガーハンドラの回答キーも合わせて更新すること
- 新しい質問を追加する場合: フォーム（02）→ トリガー（03）→ シートヘッダー（04）の3ファイルを更新
- 質問を削除する場合: 同上の3ファイルから該当箇所を削除
- 修正後は変更したファイルと変更内容を一覧で報告すること

## 修正時の報告フォーマット

修正完了後は以下の形式で報告する:

```
### 変更内容
| ファイル | 変更箇所 | 内容 |
|----------|----------|------|
| 02_formBuilder.gs | buildPreschoolSection() | 「発語状況」の選択肢を修正 |
| 03_triggerHandler.gs | distributeToSheets() | キー名を連動更新 |
```

## お客様情報
- 施設名表記: POLEPOLE（カタカナではなくアルファベット）
- IT環境: Google Workspace（無料→有料プラン移行予定）
- 納品方式: A案（完成品引き渡し）/ お客様が自走可能な形
- サービス選択: 不要（統合済み）
