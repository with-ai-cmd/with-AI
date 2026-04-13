---
name: update-apply
description: /update-checkで検出された変更を、content.jsonに反映し、HTMLスライドを再生成してサーバーにデプロイする。
trigger: /update-apply、教材更新実行
---

# Update Apply — 教材更新実行スキル

## 概要

/update-check で検出された変更を実際に content.json に反映し、
HTMLスライドを再生成してサーバーにデプロイする。

## 使い方

```
/update-apply 5-1-1          → 特定レッスンのcontent.jsonを更新&再ビルド
/update-apply 5              → 5章の全レッスンを更新&再ビルド
/update-apply all             → 全レッスンを更新&再ビルド
```

## 処理フロー

1. 対象の content.json を読み込む
2. 公式ヘルプページから最新情報を取得（WebFetch）
3. `updateable` セクションの該当箇所を更新
4. content.json を保存
5. build_slide.py を実行してHTMLスライドを再生成
6. サーバーにデプロイ（SCP）
7. 更新ログをNotionに記録

## ビルドコマンド

```bash
python3 /Users/kaitomain/Desktop/with-AI/skills/content/gen-ai-master/scripts/build_slide.py \
  --content contents/{section}/{lesson}.json \
  --deploy
```

## サーバー情報

- SSH鍵: ~/Downloads/withai.key
- ホスト: withai@sv16719.xserver.jp
- ポート: 10022
- パス: ~/with-ai.jp/public_html/gen-ai/{lesson_id}/index.html

## 注意事項

- 更新前に必ず現在のcontent.jsonをバックアップとして読み込む
- 変更内容を表示してユーザーの承認を得てから反映する
- `static` セクションは変更しない
- `_meta.last_checked` を今日の日付に更新する
- 更新後、サーバーのURLにアクセスして200が返ることを確認する
