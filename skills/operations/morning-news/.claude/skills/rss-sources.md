# RSSフィードソース定義

## 優先度: 高（英語・主要メディア）
- https://techcrunch.com/category/artificial-intelligence/feed/
- https://www.technologyreview.com/feed/
- https://venturebeat.com/category/ai/feed/
- https://openai.com/blog/rss.xml
- https://blog.google/technology/ai/rss/
- https://ai.meta.com/blog/rss/

## 優先度: 高（日本語）
- https://zenn.dev/topics/llm/feed
- https://zenn.dev/topics/generativeai/feed
- https://note.com/hashtag/生成AI?rss=1

## 優先度: 中（ツール・プロダクト情報）
- https://huggingface.co/blog/feed.xml
- https://www.producthunt.com/topics/artificial-intelligence.atom

## 収集ルール
- 対象: 過去48時間以内の記事のみ
- 除外キーワード: sponsored, PR, advertisement, アフィリエイト
- 同一ドメインの上限: 1ソースにつき最大5件
- 最低収集目標: 合計15件以上
- 15件未満の場合: 優先度「中」のソースを追加収集する

## フォールバック
RSSが取得できないソースはスキップして次のソースへ。
全ソース失敗の場合は空配列を返してオーケストレーターに報告する。
