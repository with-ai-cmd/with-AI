---
description: スライドを自動生成する。画像スライド（カリキュラム番号指定）またはHTMLスライド（html-slide / ai-seminar）に対応。
---

以下のエージェント定義ファイルを読み込み、その指示に従ってスライドを生成してください。

メインエージェント定義: /Users/kaitomain/Desktop/claude code/slide-creator/SKILL.md

## エージェント判定

ユーザーの入力を解析し、適切なサブエージェントにルーティングする：

### パターン1: 画像スライド（nanobanana-slide）
- 入力がカリキュラム番号（例：1-1-1）の場合
- サブエージェント定義: /Users/kaitomain/Desktop/claude code/slide-creator/agents/nanobanana-slide/AGENT.md
- スタイル定義（white-board）:
  - ルール: /Users/kaitomain/Desktop/claude code/slide-creator/agents/nanobanana-slide/styles/white-board/STYLE.md
  - テンプレート: /Users/kaitomain/Desktop/claude code/slide-creator/agents/nanobanana-slide/styles/white-board/prompt-template.md
- **重要**: プロンプト生成時にSTYLE.mdの禁止事項を必ず遵守すること。

### パターン2: HTMLスライド（html-slide）
- 入力に「html」「HTML」「ウェブスライド」が含まれる場合
- サブエージェント定義: /Users/kaitomain/Desktop/claude code/slide-creator/agents/html-slide/AGENT.md

### パターン3: AIセミナースライド（ai-seminar）
- 入力に「セミナー」「seminar」「勉強会」が含まれる、またはセミナー内容テキストが貼り付けられた場合
- サブエージェント定義: /Users/kaitomain/Desktop/claude code/slide-creator/agents/html-slide/agents/ai-seminar/AGENT.md
- 内容テキストから自動でスライド構成を設計し、近未来的HTMLスライドを生成

ユーザーの入力: $ARGUMENTS