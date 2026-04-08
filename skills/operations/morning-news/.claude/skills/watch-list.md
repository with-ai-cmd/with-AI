# 人物ウォッチリスト定義

## デフォルトウォッチリスト（18アカウント）

Notion の WATCH_LIST DB が取得できない場合はこのリストを使用する。

### Tier 1: AIニュースキュレーター（最重要）
| ユーザー名 | 名前/メディア | 分野 | 優先度 |
|---|---|---|---|
| rowancheung | The Rundown AI | 毎日のAIニュースまとめ。一次ソースリンク必須で信頼度No.1級 | 高 |
| mattshumer_ | Matt Shumer | エージェント・新機能の実験＆速報。HyperWrite創業者 | 高 |
| goodside | Riley Goodside | プロンプトエンジニアの神。新機能の即デモ | 高 |
| kimmonismus | Chubby | AIニュース速報王。リーク含むが一次ソース確認が早い | 高 |
| AndrewCurran_ | Andrew Curran | 公式ブログ・論文をリンク付きでまとめ。ノイズ少なめ | 高 |
| testingcatalog | TestingCatalog | AI速報・テスト結果・モデル比較が早い | 高 |
| WesRoth | Wes Roth | 動画＋解説で新機能説明。視覚的にわかりやすい | 中 |

### Tier 2: AI企業リーダー
| ユーザー名 | 名前 | 分野 | 優先度 |
|---|---|---|---|
| sama | Sam Altman | OpenAI CEO。ほぼ全てのビッグニュースはここから | 高 |
| gdb | Greg Brockman | OpenAIの技術・インフラ一次情報 | 中 |
| karpathy | Andrej Karpathy | 技術スレッドが神。AI教育＋一次解説 | 高 |
| demishassabis | Demis Hassabis | DeepMind CEO。科学寄り突破 | 中 |
| elonmusk | Elon Musk | xAI/Grokの一次情報 | 中 |

### Tier 3: 学術・思想リーダー
| ユーザー名 | 名前 | 分野 | 優先度 |
|---|---|---|---|
| ylecun | Yann LeCun | Meta AI / 学術。根本議論＋ニュース反応 | 中 |
| geoffreyhinton | Geoffrey Hinton | AI安全性の根本議論 | 低 |

### Tier 4: 公式アカウント
| ユーザー名 | 組織 | 分野 | 優先度 |
|---|---|---|---|
| AnthropicAI | Anthropic | Claude関連公式発表 | 高 |
| OpenAI | OpenAI | GPT/ChatGPT公式発表 | 高 |
| GoogleDeepMind | Google DeepMind | Gemini/DeepMind公式発表 | 高 |
| xai | xAI | Grok公式発表 | 中 |

### Tier 5: Anthropic / Claude 内部
| ユーザー名 | 名前 | 分野 | 優先度 |
|---|---|---|---|
| trq212 | Thariq | Anthropic/Claude Codeコアメンバー。内部一次情報 | 高 |

## 追跡方法
1. Grok API x_search（`/v1/responses` エンドポイント + `x_search` ツール）
2. GROK_API_KEY 未設定の場合 → エラーを返す

## 収集対象
- 直近24時間以内の投稿
- リツイート・リプライも含む（重要な情報が含まれる場合あり）
- 各ユーザー最大10件まで
