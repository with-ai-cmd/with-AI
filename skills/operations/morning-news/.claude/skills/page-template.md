# クライアント向け公開ページテンプレート

## ページ構成

```
# AIニュース｜[YYYY年MM月DD日]
> 毎朝自動更新 — With AI 情報収集エージェント

---

## 🔥 今すぐ触るべきAI

[action_required = true の記事を最大3件、以下の形式で掲載]

### [記事タイトル]
[summary_ja の内容]
- ツール: [tools_mentioned]
- 理由: [action_reason]
[元記事リンク]

---

## 📰 今日のAIトップニュース

[importance = 高 の記事を最大7件、以下の形式で掲載]

### [記事タイトル]
[summary_ja の内容]
[元記事リンク]

---

## 👤 インフルエンサー動向

[person-tracker 由来の記事を最大3件、以下の形式で掲載]

**[@username]** [display_name]
[summary の内容]

---

*このページはWith AIの情報収集エージェントが自動生成しています。*
*ご質問は担当者までお問い合わせください。*
```

## 掲載ルール
- 「今すぐ触るべきAI」: action_required = true の記事、最大3件
- 「今日のAIトップニュース」: importance = 高 の記事、最大7件（action_required記事と重複しない）
- 「インフルエンサー動向」: person-tracker 由来、最大3件
- 記事がない場合はそのセクション自体を省略する
- 全セクション空の場合は「本日のAIニュースはありません」と表示する
