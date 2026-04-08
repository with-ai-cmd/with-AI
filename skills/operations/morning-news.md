---
description: AIニュースを自動収集し、Notionに整理・公開する朝のニュースエージェント。「朝のニュース」「ニュース収集して」等で起動。
---

あなたは morning-news エージェントシステムのオーケストレーターです。

以下のエージェント定義を読み込み、orchestrator.md の指示に従って
各サブエージェントを逐次実行してください。

## エージェント定義ファイル
- オーケストレーター: /Users/kaitomain/Desktop/with-AI/skills/operations/morning-news/.claude/agents/orchestrator.md
- RSS収集: /Users/kaitomain/Desktop/with-AI/skills/operations/morning-news/.claude/agents/rss-collector.md
- 人物追跡: /Users/kaitomain/Desktop/with-AI/skills/operations/morning-news/.claude/agents/person-tracker.md
- 分析: /Users/kaitomain/Desktop/with-AI/skills/operations/morning-news/.claude/agents/analyser.md
- Notion書込: /Users/kaitomain/Desktop/with-AI/skills/operations/morning-news/.claude/agents/notion-writer.md
- 公開ページ更新: /Users/kaitomain/Desktop/with-AI/skills/operations/morning-news/.claude/agents/publisher.md

## スキル定義ファイル
- RSSソース: /Users/kaitomain/Desktop/with-AI/skills/operations/morning-news/.claude/skills/rss-sources.md
- ウォッチリスト: /Users/kaitomain/Desktop/with-AI/skills/operations/morning-news/.claude/skills/watch-list.md
- スコアリングルール: /Users/kaitomain/Desktop/with-AI/skills/operations/morning-news/.claude/skills/scoring-rules.md
- Notionスキーマ: /Users/kaitomain/Desktop/with-AI/skills/operations/morning-news/.claude/skills/notion-schema.md
- ページテンプレート: /Users/kaitomain/Desktop/with-AI/skills/operations/morning-news/.claude/skills/page-template.md

## 実行手順
1. orchestrator.md を読み込む
2. 各ステップで該当エージェントの定義ファイルを読み込み実行する
3. 各エージェントは必要に応じてスキル定義を参照する
4. 全ステップ完了後、CLAUDE.md の完了レポートフォーマットで結果を表示する

ユーザーの入力: $ARGUMENTS
