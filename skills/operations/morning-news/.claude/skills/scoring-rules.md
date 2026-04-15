# スコアリングルール定義

## スコア計算式

| 条件 | 加算点数 |
|---|---|
| AIモデル名が含まれる（GPT / Claude / Gemini / Llama / Mistral 等） | +3 |
| 「リリース」「公開」「発表」「launch」「release」が含まれる | +2 |
| 「無料」「free」「オープンソース」「open source」が含まれる | +2 |
| 「API」が含まれる | +1 |
| 英語圏の主要メディア（TechCrunch / MIT TR / VentureBeat） | +1 |
| person-tracker 由来の情報 | +1 |
| リリースノート / Changelog 由来 | +2 |

## 重要度判定
- 合計 6点以上 → importance: 高
- 合計 3〜5点 → importance: 中
- 合計 2点以下 → importance: 低

## action_required 判定
以下を**すべて満たす**場合のみ true：
1. importance = 高
2. 「今すぐ使える」示唆がある（APIあり / 無料プランあり / デモあり）
3. With AIのサービス（AIKOMON）または生成AIビジネス活用に関連する

## 重複判定ルール
1. 完全一致URL → 重複（スキップ）
2. タイトルの類似度 > 70% かつ 同日 → 重複（高スコアを残す）
3. 同一ソースかつ同一トピック → 重複（新しい方を残す）
