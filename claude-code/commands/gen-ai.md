---
description: AI e-learning教材を自動生成する。カリキュラム番号（例：1-1-1）を入力すると、リサーチ→教材文章作成→PDF化→画像スライド生成→Googleドライブ保存まで一気通貫で行う。
---

以下のエージェント定義ファイルを読み込み、その指示に従って教材を生成してください。

エージェント定義: /Users/kaitomain/Desktop/skils/content/gen-ai-master/SKILL.md

**重要: Phase 0 を必ず最初に実行すること。**
以下のコマンドでスプレッドシートから最新カリキュラムを取得し、全体像を把握してから作業を開始する：
```
curl -sL "https://docs.google.com/spreadsheets/d/1rb-ghugUxbHebzRUazMUZDY3TLw3z1eHaUSRcBJb4F8/export?format=csv&gid=716497948"
```

画像スライド生成には /slide-creator スキルを使用する：
- slide-creator定義: /Users/kaitomain/Desktop/skils/content/slide-creator/SKILL.md
- スタイルルール: /Users/kaitomain/Desktop/skils/content/slide-creator/agents/nanobanana-slide/agents/white-board-slide/STYLE.md
- プロンプトテンプレート: /Users/kaitomain/Desktop/skils/content/slide-creator/agents/nanobanana-slide/agents/white-board-slide/prompt-template.md

教材の書き方ガイド: /Users/kaitomain/Desktop/skils/content/gen-ai-master/references/writing-guide.md
教材サンプル: /Users/kaitomain/Desktop/skils/content/gen-ai-master/references/document-sample.md

ユーザーの入力: $ARGUMENTS
