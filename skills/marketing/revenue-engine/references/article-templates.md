# 記事テンプレート集

## 共通ルール

1. **薬機法・景品表示法に注意**: 効果効能の断定表現は避ける
2. **PR表記**: 記事冒頭に「※本記事にはアフィリエイトリンクが含まれています」を必ず記載
3. **実体験ベース**: 「実際に使ってみた」系はAI生成であることを踏まえ、スペック・レビュー分析型にする
4. **比較の公平性**: 特定商品だけを過度に推さない。メリット・デメリットを必ず併記
5. **更新日表示**: 記事に最終更新日を表示し、情報の鮮度を担保

## HTML共通ヘッダー

```html
<div class="article-meta">
  <span class="publish-date">公開日: {PUBLISH_DATE}</span>
  <span class="update-date">更新日: {UPDATE_DATE}</span>
  <span class="author">著者: {AUTHOR}</span>
</div>
<div class="affiliate-disclosure">
  ※本記事にはアフィリエイトリンクが含まれています。リンク経由で購入いただくと、サイト運営の支援になります。
</div>
```

## 商品比較テーブルテンプレート

```html
<table class="comparison-table">
  <thead>
    <tr>
      <th>商品名</th>
      <th>価格</th>
      <th>特徴</th>
      <th>おすすめ度</th>
      <th>リンク</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>{PRODUCT_NAME}</td>
      <td>¥{PRICE}</td>
      <td>{FEATURE}</td>
      <td>★★★★★</td>
      <td>
        <a href="{AMAZON_LINK}" rel="nofollow">Amazon</a> |
        <a href="{RAKUTEN_LINK}" rel="nofollow">楽天</a>
      </td>
    </tr>
  </tbody>
</table>
```
