---
name: update-check
description: 各LLMサービス（ChatGPT/Gemini/Claude）の公式ヘルプページを確認し、教材コンテンツ（content.json）との差分を検出してレポートする。
trigger: /update-check、教材アップデート確認、LLM変更チェック
---

# Update Check — 教材アップデート検知スキル

## 概要

各LLMサービスの公式ヘルプページ・チェンジログを確認し、
教材の content.json に記載されている情報と照合して、
変更が必要な箇所を差分レポートとして出力する。

## 処理フロー

1. content.json ファイルを全て読み込み（contents/ ディレクトリ配下）
2. 各content.jsonの `_meta.sources` に記載されたURLをWebFetchで取得
3. `updateable` セクションの以下を照合：
   - models: モデル名・バージョンが変わっていないか
   - plans: 料金プラン・価格が変わっていないか
   - features: 機能が追加・廃止されていないか
   - registration: URLが変わっていないか
4. 差分がある場合、レポートを生成

## チェック対象の公式ソース

| サービス | ヘルプページ | チェンジログ |
|---|---|---|
| ChatGPT | https://help.openai.com | https://help.openai.com/en/articles/6825453-chatgpt-release-notes |
| Gemini | https://support.google.com/gemini | https://gemini.google/release-notes/ |
| Claude | https://support.anthropic.com | https://docs.anthropic.com/en/docs/about-claude/models |

## 出力フォーマット

差分レポートを以下の形式で出力する：

### 変更なしの場合：
```
✅ アップデートチェック完了（2026/04/10）
全コンテンツが最新です。変更はありません。
```

### 変更ありの場合：
```
⚠️ アップデートチェック結果（2026/04/10）

━━ ChatGPT ━━━━━━━━
⚠️ [models] モデル名変更検出
   現在: GPT-4o
   公式: GPT-5
   影響ファイル: contents/5-1/5-1-1.json, contents/5-2/5-2-1.json
   → /update-apply 5-1-1 で更新できます

✅ [plans] 変更なし
✅ [features] 変更なし

━━ Gemini ━━━━━━━━
✅ 変更なし

━━ Claude ━━━━━━━━
✅ 変更なし
```

## content.json のパス

contents/ ディレクトリ: `/Users/kaitomain/Desktop/with-AI/skills/content/gen-ai-master/contents/`

## 注意事項

- WebFetchで取得できない場合は、その旨をレポートに記載（「取得失敗」）
- 変更の可能性があるが確信がない場合は「要確認」としてフラグを立てる
- `static` セクションはチェック対象外（変わらない情報のため）
- チェック完了後、`_meta.last_checked` を今日の日付に更新する
