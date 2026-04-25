# 【速報】OpenAIが「ChatGPT Workspace Agents」を発表 ─ Custom GPTs時代は終わり、"常時稼働のAI社員"が企業に入り込む

**2026年4月22日（現地時間）、OpenAIは ChatGPT の新機能「Workspace Agents（ワークスペース・エージェント）」を正式発表した。**

これまでの「話しかけないと動かないChatGPT」は過去のものになる。Workspace Agentsは**クラウド上で24時間365日稼働し、チームで共有し、自律的に多段階のタスクを遂行する "デジタル同僚"** だ。OpenAIが2023年から展開してきた Custom GPTs の事実上の後継となる、AI活用の潮目を変える発表である。

本記事では、いち早く公式発表・海外メディア報道・導入企業の事例を徹底リサーチし、日本企業が今知るべきポイントを整理した。

---

## 📢 ニュースサマリー（30秒で理解）

- **いつ**: 2026年4月22日に発表
- **誰に**: ChatGPT **Business / Enterprise / Edu / Teachers** プラン契約者
- **いくら**: **2026年5月6日まで無料**（リサーチプレビュー）。以降はクレジット従量課金制
- **何ができる**: Slack、Salesforce、Google Drive、Notion、Microsoft 365 等と連携し、自動でレポート作成・顧客対応・データ集計などを常時実行
- **どう変わる**: Custom GPTs は組織向けに段階的に廃止予定。既存GPTsはWorkspace Agentsへの変換が推奨される

---

## 🚀 Workspace Agents とは何か

一言で言えば、**「指示されたら動く」から「放っておいても働き続ける」への進化**だ。

従来の ChatGPT や Custom GPTs は、ユーザーがプロンプトを入力するたびに1回ずつ応答するリアクティブな存在だった。Workspace Agents は違う。

- クラウド上で**常時稼働**
- **スケジュール実行**や**イベントトリガー**で自動起動
- **複数ステップのワークフロー**を自律的に完遂
- **チーム全体で共有**し、みんなで育てる
- **記憶を保持**し、長期プロジェクトをまたいで文脈を維持

OpenAI は発表文でこう表現している。

> "They run in the cloud, so they can keep working even when you're not. They're also designed to be shared within an organization, so teams can build an agent once, use it together in ChatGPT or Slack, and improve it over time."
> （クラウドで動き続けるので、あなたがいなくても働き続けます。組織内で共有できるように設計されており、一度作れば ChatGPT や Slack でチーム全員が使い、継続的に改善できます。）

技術基盤は OpenAI のコード生成特化モデル **Codex**。単なる会話ではなく、**コード実行・ファイル操作・API呼び出し・データ変換**といった実アクションを担うために、あえてコード特化モデルを選んだのがポイントだ。

---

## 🛠 Workspace Agents の主要機能

### 1. 自律的なタスク実行
レポート作成、コード記述、メール返信、データ集計、顧客リサーチ、スプレッドシート更新、チケット起票まで ─ 人間が日常的にやっている業務を多段階で処理する。

### 2. スケジュール＆トリガー起動
- **定時実行**: 毎週月曜9時に週次レポート自動生成
- **メッセージトリガー**: Slackで特定の質問が来たら自動応答
- **システムイベント**: Salesforceに新規商談が入ったら自動でリサーチ開始

### 3. 2種類の認証モード
- **per-user認証**: 実行ユーザーの権限で動作
- **shared agent-owned account**: エージェント専用のサービスアカウントで動作（24/7稼働向き）

### 4. 追加機能
- **Custom MCP**（Model Context Protocol）対応でカスタムツール接続
- **画像生成**、**Web検索**
- **承認フロー**: 機密アクション（送信・編集・削除）は人間承認必須に設定可能

---

## 🔌 連携できるサービス（主要サードパーティ）

発表時点で対応が明言されているのは以下：

| カテゴリ | サービス |
|---|---|
| コミュニケーション | **Slack** |
| ストレージ | **Google Drive**、**SharePoint** |
| カレンダー | **Google Calendar** |
| CRM | **Salesforce** |
| ドキュメント | **Notion** |
| オフィススイート | **Microsoft 365** |
| ナレッジ | **Atlassian Rovo** |

そして今後、MCPを経由して対応ツールはさらに拡大予定。

---

## 📋 業種別テンプレートが標準装備

イチから作る必要はない。ビルトインの業種別テンプレートが用意されていて、スキルと接続先ツールがプリセットされた状態で即利用できる。

- **Finance（財務）**
- **Sales（営業）**
- **Marketing（マーケティング）**
- その他各種

---

## 💼 具体的ユースケース ── "こんな業務"が自動化される

ここからが本題。実際にどんな業務が丸ごと代替されるのか、海外メディアで報告されている具体例をまとめる。

### ① 営業: 商談先リサーチ → ブリーフ自動投稿（Rippling社の事例）
HRテック大手 **Rippling** では、営業担当者が自分でエージェントを構築。**エンジニアの手は一切借りていない。**

エージェントの動き:
1. 朝、担当アカウントのリストを取得
2. 各社の最新ニュース・財務状況・キーパーソン動向をWebリサーチ
3. Gongに録音された直近の通話記録を要約
4. 「商談ブリーフ」としてSlackの担当者DMに投稿

**結果: 営業担当1人あたり週5〜6時間の工数削減。**

### ② 週次レポート自動生成
毎週月曜朝9時に起動し、Google Sheetsから数値を取得、前週比・前月比・KPI達成度を計算、グラフ付きレポートを生成してNotionに投稿、Slackに要約を流す。
**人間の作業: ゼロ。**

### ③ ベンダーリスクレビュー（法務・調達）
新規取引先の申請がフォームに入ったら自動起動。社名を受け取り、企業情報・訴訟履歴・財務健全性・セキュリティ認証をリサーチ。リスクスコア付きのレポートを作成し、レビュー担当者にSlackで共有。**最終承認は人間に委ねる**（機密アクションには承認フロー設定）。

### ④ ソフトウェア申請トリアージ（情シス）
社員が「このツール使いたい」と申請。エージェントが用途・既存ツールとの重複・セキュリティリスク・コストを自動分析し、承認 or 代替提案 or 要審議の3段階に振り分け。

### ⑤ プロダクトフィードバックのルーティング
サポートチャット、レビューサイト、Slackのフィードバックチャンネルを常時監視。優先度付け → 適切なプロダクトマネージャーに自動でアサイン → Notionのバックログに起票。

### ⑥ リードアウトリーチ
Salesforceに新規リードが入ると自動起動。リード情報から最適なテンプレートを選定、パーソナライズされた初回メールをドラフト → **担当者の承認後に送信**。

### ⑦ 経理ワークフロー
領収書画像の受信をトリガーに、OCR → 勘定科目の自動判定 → 会計システムへの仕訳登録 → 承認待ちリストに追加。

---

## 🏢 すでに導入している企業

アーリーアダプターとして名前が挙がっているのは:

- **Rippling**（HRテック）
- **Hibob**（HRテック）
- **Better Mortgage**（金融）
- **BBVA**（スペインの大手銀行）

HR・金融・バンキングというデータセンシティブな業界が先行しているのは、Workspace Agentsのセキュリティ・ガバナンス機能が企業要件を満たしていることの証左と言える。

---

## 🛡 セキュリティ・ガバナンス ── "エンタープライズ仕様"

企業IT部門が気にするポイントは全て押さえられている。

| 機能 | 内容 |
|---|---|
| **アクセス制御** | 管理者がエージェントごとに利用可能ツール・データを制限 |
| **Human-in-the-loop** | メール送信、ファイル編集、カレンダー作成などの機密操作は人間承認必須に設定可能 |
| **Compliance API** | エージェントの設定変更・実行履歴を全て監査可能 |
| **RBAC** | Enterprise / Eduプランでロールベースアクセス制御 |
| **プロンプトインジェクション対策** | 悪意あるプロンプトへの防御策を実装 |
| **データ境界** | 組織ごとにアクセス可能なデータソースを限定 |

---

## 💰 料金モデル

- **〜2026年5月6日**: **完全無料**（リサーチプレビュー期間）
- **2026年5月6日〜**: **クレジット従量課金制**
  - 具体的なクレジット単価は未発表
  - 最初のCodexユーザー追加時にクレジット購入フローが起動
  - 自動リチャージで業務中断を防止

つまり**今から2週間は完全無料で試し放題**。PoC（概念実証）を今走らせない手はない。

---

## 🔮 Custom GPTsはどうなる？

**組織向けCustom GPTsは段階的に廃止される**とOpenAIは明言している。時期は未定だが、ChatGPT Business / Enterprise / Edu / Teachers ユーザーは**既存のGPTsをWorkspace Agentsに変換することが求められる**。

変換ツールは今後提供予定。既にCustom GPTsを業務に組み込んでいる企業は、移行計画を早めに立てておくのが得策だ。

---

## 🔭 今後のロードマップ

OpenAIが予告している強化:
- 自動起動用の**新トリガー**追加
- エージェント管理**ダッシュボード**の拡充
- ビジネスツール上で取れるアクションの拡張
- **Codex（AIコード生成アプリ）**側でのWorkspace Agents対応
- Custom GPTsからの**ワンクリック変換機能**

---

## 💡 日本企業が今すべきこと

1. **まず無料期間中（〜5/6）に1つエージェントを作ってみる** ─ 週次レポートなど、定型業務を1本自動化するだけでインパクトが見える
2. **Custom GPTsを使っている場合は移行計画を立てる** ─ 将来の廃止を見越して早期検証を
3. **業務棚卸し** ─ "週に何時間もかかっている、ルーティンだが判断を伴う業務"を洗い出す。それがWorkspace Agentsの適用候補
4. **ガバナンス設計** ─ どのアクションを人間承認にするか、どのデータにアクセスさせるかを事前に決めておく

Ripplingの事例が示すように、**エンジニアの手を借りずに営業担当者自身がエージェントを作って週5時間削減する**時代が、もう始まっている。

AIを「使いこなす」から「働かせる」へ ─ この発表はその大きな転換点だ。

---

## 📚 参考ソース

- [Introducing workspace agents in ChatGPT | OpenAI 公式発表](https://openai.com/index/introducing-workspace-agents-in-chatgpt/)
- [OpenAI unveils Workspace Agents | VentureBeat](https://venturebeat.com/orchestration/openai-unveils-workspace-agents-a-successor-to-custom-gpts-for-enterprises-that-can-plug-directly-into-slack-salesforce-and-more)
- [Codex-powered 'workspace agents' for teams | 9to5Mac](https://9to5mac.com/2026/04/22/openai-updates-chatgpt-with-codex-powered-workspace-agents-for-teams/)
- [Workspace Agents Feature in ChatGPT | Decrypt](https://decrypt.co/365220/openai-workspace-agents-feature-chatgpt)
- [24/7 always-on Workspace Agents | TestingCatalog](https://www.testingcatalog.com/openai-launched-24-7-always-on-workspace-agents-in-chatgpt/)
- [Enterprise Workflows | UC Today](https://www.uctoday.com/productivity-automation/openai-workspace-agents-chatgpt-enterprise-workflows/)
- [Automate complex tasks across teams | SiliconANGLE](https://siliconangle.com/2026/04/22/openai-subscribers-get-new-workspace-agents-automate-complex-tasks-across-teams/)

---

*この記事は2026年4月24日時点の情報に基づいています。Workspace Agentsはリサーチプレビュー段階のため、機能・料金は今後変更される可能性があります。*
