---
name: revenue-engine
description: AI完全自動アフィリエイト収益エンジン。購買意図キーワード発掘→SEO記事自動生成→Amazon/楽天アフィリエイトリンク挿入→サーバー公開→楽天ROOM商品キュレーション→SNS集客→収益トラッキングまで一気通貫で実行する司令塔エージェント。月5万円の自動収益を目指す。
---

# Revenue Engine — AI自動アフィリエイト収益エンジン

購買意図のあるキーワードを自動発掘し、SEO最適化されたアフィリエイト記事を生成・公開し、
楽天ROOM + SNS で集客を回して月5万円の自動収益を目指す司令塔エージェント。

**CEOは承認・指示のみ。実行は全て自動。**

## アーキテクチャ

```
revenue-engine（司令塔）
├── agents/
│   ├── content-strategist/    ← 🧠 最強マーケター（頭脳）。全エージェントに戦略指示を出す
│   ├── keyword-researcher/    ← 購買系キーワード自動発掘・優先度スコアリング
│   ├── article-generator/     ← アフィリエイト記事自動生成（レビュー・比較・ランキング）
│   ├── affiliate-linker/      ← Amazon/楽天アフィリエイトリンク自動挿入・管理
│   ├── rakuten-room-curator/  ← 楽天ROOMトレンド商品キュレーション・投稿文生成
│   ├── publisher/             ← HTML生成・サーバーデプロイ（marketing-engine連携）
│   ├── sns-promoter/          ← X/Threads自動投稿で記事拡散（x-autopilot連携）
│   └── revenue-tracker/       ← 収益・PV・CVR追跡・月次レポート生成
├── config/
│   └── settings.json          ← 共通設定（アフィリエイトID・ジャンル・公開先）
├── evals/
│   └── evals.json             ← スキルテストケース
└── references/
    └── article-templates.md   ← 記事テンプレート集
```

## 共通設定

`config/settings.json` から読み込む。

### 必須の外部アカウント
- Amazon アソシエイト（tracking ID）
- 楽天アフィリエイト（アフィリエイトID）
- 楽天ROOM アカウント
- with-ai.jp サーバーアクセス（marketing-engineと共有）

## 実行モード

### /revenue-engine daily（デイリー）
1. **revenue-tracker** → 昨日の収益・PV・クリック数を取得
2. **content-strategist** → 収益データ + トレンドを見て今日のアクションを決定
3. **rakuten-room-curator** → 戦略指示に基づき楽天ROOM商品1件生成
4. **sns-promoter** → 戦略指示に基づきSNS投稿1件生成
5. **revenue-tracker** → デイリーサマリーをNotionに記録

### /revenue-engine weekly（ウィークリー）
1. **revenue-tracker** → 週次収益レポート取得
2. **content-strategist** → 🧠 市場トレンド・競合・収益・季節需要を総合分析 → **戦略指示書**を生成
3. **keyword-researcher** → 戦略指示書に基づきKW深掘り（指定テーマ・意図で発掘）
4. **article-generator** → 戦略指示書に基づき記事構成案を生成（新規 + リライト + まとめ）
5. **affiliate-linker** → 既存記事のリンク切れチェック・更新
6. **rakuten-room-curator** → 戦略指示書の注力ジャンルで5件キュレーション
7. **sns-promoter** → 戦略指示書のキャンペーンテーマでSNS投稿カレンダー（5件）生成
8. **revenue-tracker** → 週次レポート + 戦略サマリー → Notion保存 + メール送信

### /revenue-engine monthly（マンスリー）
1. **revenue-tracker** → 月次収益レポート（Amazon + 楽天 + 楽天ROOM）
2. **content-strategist** → 🧠 月次戦略レビュー：ジャンルポートフォリオ分析・来月の戦略策定・まとめページ提案・リライト判定
3. **keyword-researcher** → 戦略に基づく来月のKWリスト作成
4. **article-generator** → 来月のコンテンツカレンダー作成（記事8本 + リライト + まとめ）
5. **affiliate-linker** → 全記事のアフィリエイトリンク監査
6. **rakuten-room-curator** → 来月のROOM戦略 + 商品カテゴリ計画
7. **revenue-tracker** → 月次レポート → Notion + メール + PDF

### /revenue-engine strategy（戦略レポート単独実行）
1. **revenue-tracker** → 直近の収益・PV・記事パフォーマンスデータ取得
2. **content-strategist** → 🧠 フル戦略分析を実行：
   - 市場トレンド分析（Web検索）
   - 競合コンテンツギャップ分析
   - 自サイトの強み・弱み分析
   - ジャンルポートフォリオ健全性チェック
   - まとめページ・ピラーページ作成提案
   - リライト候補リスト
   - 来月のコンテンツ戦略案
3. **revenue-tracker** → 戦略レポートをNotion + メールで配信

### /revenue-engine article [テーマ]（記事生成）
1. **content-strategist** → 🧠 テーマの市場分析：競合状況・最適な記事タイプ・差別化ポイントを判断
2. **keyword-researcher** → 戦略指示に基づきKWリサーチ + 競合分析
3. **article-generator** → 戦略の差別化方針に沿って記事生成（3000-5000字）
4. **affiliate-linker** → Amazon/楽天のアフィリエイトリンクを自動挿入
5. **publisher** → HTMLページ化 → サーバーアップ → sitemap更新
6. **sns-promoter** → 公開通知SNS投稿を生成
7. **revenue-tracker** → 記事メタデータをNotionに記録

### /revenue-engine room [ジャンル]（楽天ROOM投稿）
1. **content-strategist** → 🧠 ジャンルのトレンド把握 + 今ROOMで推すべき商品の方向性を判断
2. **rakuten-room-curator** → 戦略指示に基づきトレンド商品5件選定
3. **affiliate-linker** → 各商品の楽天アフィリエイトリンク生成
4. **rakuten-room-curator** → 商品説明文・おすすめポイントを生成
5. **sns-promoter** → ROOM投稿の拡散用SNS投稿を生成
6. **revenue-tracker** → ROOM投稿データをNotionに記録

### /revenue-engine batch（バッチ記事生成）
1. **content-strategist** → 🧠 現在の戦略・優先度に基づき、今バッチ生成すべき記事5本を選定（新規・リライト・まとめ混在OK）
2. 各記事に対して順次:
   a. **keyword-researcher** → 戦略指示に基づくKW深掘り
   b. **article-generator** → 記事生成
   c. **affiliate-linker** → リンク挿入
   d. **publisher** → 公開
3. **sns-promoter** → 全記事の拡散投稿をまとめて生成
4. **revenue-tracker** → バッチ結果をNotionに記録

## サブエージェント連携ルール

1. 司令塔は**実行モードに応じてサブエージェントを順番に呼び出す**
2. 各サブエージェントは**自分の専門領域のみ**を実行し、結果をJSON形式で返す
3. 司令塔が結果を統合し、次のサブエージェントに渡す
4. エラーが発生した場合は該当ステップをスキップし、レポートにエラーを記載
5. 最終的にrevenue-trackerが全結果をまとめて出力
6. **記事公開前はCEOの承認を必ず得る**（batchモードでは一括承認可）

## 収益目標と KPI

| 指標 | 月間目標 |
|---|---|
| 記事公開数 | 8本/月 |
| 月間PV | 10,000+ |
| アフィリエイトクリック率 | 3%+ |
| Amazon収益 | ¥15,000〜25,000 |
| 楽天収益 | ¥5,000〜15,000 |
| 楽天ROOM収益 | ¥5,000〜10,000 |
| **合計** | **¥25,000〜50,000** |

## 連携する既存スキル

- **marketing-engine** → publisher（site-deployer）を共有
- **x-autopilot** → SNS投稿の実行エンジンとして利用
- **threads-autopilot** → Threads投稿の実行エンジンとして利用

## ユーザー入力

ユーザーの入力: $ARGUMENTS

引数の解析:
- `daily` / `デイリー` → デイリーモード
- `weekly` / `ウィークリー` / `週次` → ウィークリーモード
- `monthly` / `マンスリー` / `月次` → マンスリーモード
- `article [テーマ]` / `記事 [テーマ]` → 記事生成モード
- `room [ジャンル]` / `楽天 [ジャンル]` → 楽天ROOM投稿モード
- `strategy` / `戦略` → 戦略レポート単独モード
- `batch` / `一括` → バッチ記事生成モード
- 引数なし → ウィークリーモード（デフォルト）
