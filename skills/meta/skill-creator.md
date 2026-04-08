---
description: 新しいスキル（スラッシュコマンド）を作成・改善・テストする。「スキルを作って」「スキル作りたい」「新しいコマンド作って」等で起動。
---

以下のスキル定義ファイルを読み込み、その指示に従ってスキルの作成・改善を行ってください。

スキル定義: /Users/kaitomain/Desktop/claude code/skill-creator/SKILL.md

参照ファイル:
- グレーダー: /Users/kaitomain/Desktop/claude code/skill-creator/agents/grader.md
- 比較エージェント: /Users/kaitomain/Desktop/claude code/skill-creator/agents/comparator.md
- 分析エージェント: /Users/kaitomain/Desktop/claude code/skill-creator/agents/analyzer.md
- スキーマ定義: /Users/kaitomain/Desktop/claude code/skill-creator/references/schemas.md
- 評価ビューワー: /Users/kaitomain/Desktop/claude code/skill-creator/eval-viewer/generate_review.py
- 評価レビューHTML: /Users/kaitomain/Desktop/claude code/skill-creator/assets/eval_review.html

スクリプト:
- ベンチマーク集計: python -m scripts.aggregate_benchmark（skill-creatorディレクトリから実行）
- 説明文最適化: python -m scripts.run_loop（skill-creatorディレクトリから実行）
- パッケージ化: python -m scripts.package_skill

ユーザーの入力: $ARGUMENTS