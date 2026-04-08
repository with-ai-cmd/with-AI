#!/usr/bin/env python3
"""親スキルのページ内にサブエージェントの詳細ブロックを追加する"""

import json
import os
import time
import urllib.request
import urllib.error

def load_env(path):
    env = {}
    with open(os.path.expanduser(path)) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                env[k] = v
    return env

env = load_env("~/Desktop/claude code/クロードコード/.env")
TOKEN = env["NOTION_API_TOKEN"]
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
}

def notion_request(url, data=None, method="PATCH"):
    req = urllib.request.Request(url, data=json.dumps(data).encode() if data else None, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  ERROR {e.code}: {e.read().decode()[:300]}")
        return None

def add_blocks(page_id, blocks):
    url = f"https://api.notion.com/v1/blocks/{page_id}/children"
    result = notion_request(url, {"children": blocks}, method="PATCH")
    return result is not None

def heading3(text):
    return {
        "object": "block",
        "type": "heading_3",
        "heading_3": {"rich_text": [{"text": {"content": text}}]}
    }

def paragraph(text):
    return {
        "object": "block",
        "type": "paragraph",
        "paragraph": {"rich_text": [{"text": {"content": text}}]}
    }

def divider():
    return {"object": "block", "type": "divider", "divider": {}}

def code_block(content, language="mermaid"):
    return {
        "object": "block",
        "type": "code",
        "code": {
            "rich_text": [{"text": {"content": content}}],
            "language": language
        }
    }

def toggle_block(title, children):
    return {
        "object": "block",
        "type": "toggle",
        "toggle": {
            "rich_text": [{"text": {"content": title}}],
            "children": children
        }
    }

# ============================================================
# 各親スキルのサブエージェント定義
# ============================================================

subagents = {
    # marketing-engine
    "32dd725a-9f17-810e-9089-d1112d4a38e9": {
        "name": "marketing-engine",
        "agents": [
            {
                "name": "analytics（データ収集・分析）",
                "desc": "GA4とSearch Consoleからデータを収集し、異常検知・トレンド分析を行う。",
                "path": "agents/analytics/AGENT.md",
                "mermaid": """graph LR
    A[GA4 API] --> B[PV・ユーザー数取得]
    C[Search Console API] --> D[検索クエリ・CTR取得]
    B --> E[異常検知]
    D --> E
    E --> F[レポート用データ出力]"""
            },
            {
                "name": "seo-optimizer（SEO戦略）",
                "desc": "キーワード分析、テクニカルSEO監査、メタデータ最適化を行う。",
                "path": "agents/seo-optimizer/AGENT.md",
                "mermaid": """graph LR
    A[キーワード分析] --> B[検索意図分類]
    B --> C[コンテンツギャップ特定]
    C --> D[最適化提案]
    E[テクニカルSEO] --> D"""
            },
            {
                "name": "content-writer（コンテンツ生成）",
                "desc": "SEO最適化されたブログ・コラム記事をHTMLで生成する。",
                "path": "agents/content-writer/AGENT.md",
                "mermaid": """graph LR
    A[テーマ受取] --> B[キーワード選定]
    B --> C[記事構成設計]
    C --> D[本文執筆]
    D --> E[SEOメタデータ付与]
    E --> F[HTML出力]"""
            },
            {
                "name": "case-study（導入事例）",
                "desc": "NotionクライアントDBから情報を取得し、導入事例ページを生成する。",
                "path": "agents/case-study/AGENT.md",
                "mermaid": """graph LR
    A[クライアントDB] --> B[情報取得]
    B --> C[事例構成設計]
    C --> D[HTML生成]
    D --> E[site-deployerへ]"""
            },
            {
                "name": "competitor-intel（競合分析）",
                "desc": "競合サイトの分析、市場リサーチ、差別化ポイントの特定を行う。",
                "path": "agents/competitor-intel/AGENT.md",
                "mermaid": """graph LR
    A[競合URL取得] --> B[サイト分析]
    B --> C[コンテンツ比較]
    C --> D[差別化提案]"""
            },
            {
                "name": "site-deployer（デプロイ）",
                "desc": "生成されたHTMLをサーバーにデプロイし、サイトマップ更新・Search Console通知を行う。",
                "path": "agents/site-deployer/AGENT.md",
                "mermaid": """graph LR
    A[HTML受取] --> B[SCP転送]
    B --> C[サイトマップ更新]
    C --> D[Search Console ping]
    D --> E[デプロイ確認]"""
            },
            {
                "name": "report-publisher（レポート配信）",
                "desc": "分析結果を統合してレポートを生成し、NotionとGmailで配信する。",
                "path": "agents/report-publisher/AGENT.md",
                "mermaid": """graph LR
    A[データ統合] --> B[レポート生成]
    B --> C[Notion保存]
    B --> D[Gmail配信]"""
            }
        ]
    },
    # slide-creator
    "32dd725a-9f17-8152-8348-fa7a8a462b94": {
        "name": "slide-creator",
        "agents": [
            {
                "name": "nanobanana-slide（画像スライド）",
                "desc": "nanobanana APIを使ってスタイル別の画像スライドを生成する。ルーターとして各スタイルサブエージェントに振り分ける。",
                "path": "agents/nanobanana-slide/AGENT.md",
                "mermaid": """graph TD
    A[nanobanana-slide] --> B{スタイル判定}
    B -->|white-board| C[white-board-slide]
    C --> D[STYLE.md 読込]
    D --> E[prompt-template.md でプロンプト生成]
    E --> F[nanobanana API呼出]
    F --> G[画像保存]"""
            },
            {
                "name": "white-board-slide（ホワイトボード風）",
                "desc": "手書きマーカー風のホワイトボードスタイルでスライド画像を生成するサブエージェント。",
                "path": "agents/nanobanana-slide/agents/white-board-slide/AGENT.md",
                "mermaid": """graph LR
    A[教材内容] --> B[STYLE.md ルール適用]
    B --> C[禁止事項チェック]
    C --> D[プロンプト生成]
    D --> E[API実行]"""
            },
            {
                "name": "html-slide（HTMLスライド）",
                "desc": "Cyberpunk Darkテーマのインタラクティブなブラウザベースのスライドを生成する。",
                "path": "agents/html-slide/AGENT.md",
                "mermaid": """graph LR
    A[コンテンツ] --> B[スライド構成設計]
    B --> C[Cyberpunk Dark テーマ適用]
    C --> D[HTML/CSS/JS生成]
    D --> E[ファイル出力]"""
            },
            {
                "name": "ai-seminar（AIセミナースライド）",
                "desc": "セミナー内容テキストからAIセミナー向けの近未来的HTMLスライドを自動生成する。",
                "path": "agents/html-slide/agents/ai-seminar/AGENT.md",
                "mermaid": """graph LR
    A[セミナー内容] --> B[構成設計]
    B --> C[スライド分割]
    C --> D[近未来的デザイン適用]
    D --> E[HTML出力]"""
            }
        ]
    },
    # morning-news
    "32dd725a-9f17-81e7-bd22-f912e85e2c08": {
        "name": "morning-news",
        "agents": [
            {
                "name": "rss-collector（RSS収集）",
                "desc": "定義されたRSSソースからAIニュースを収集する。",
                "path": ".claude/agents/rss-collector.md",
                "mermaid": """graph LR
    A[rss-sources.md] --> B[RSS取得]
    B --> C[記事抽出・整形]
    C --> D[次エージェントへ]"""
            },
            {
                "name": "person-tracker（人物追跡）",
                "desc": "ウォッチリストの人物に関する言及を追跡する。",
                "path": ".claude/agents/person-tracker.md",
                "mermaid": """graph LR
    A[watch-list.md] --> B[記事スキャン]
    B --> C[人物言及抽出]
    C --> D[次エージェントへ]"""
            },
            {
                "name": "analyser（分析）",
                "desc": "収集した記事をスコアリングルールに基づいて分析・評価する。",
                "path": ".claude/agents/analyser.md",
                "mermaid": """graph LR
    A[scoring-rules.md] --> B[記事スコアリング]
    B --> C[重要度判定]
    C --> D[要約生成]
    D --> E[次エージェントへ]"""
            },
            {
                "name": "notion-writer（Notion書込）",
                "desc": "分析結果をNotionデータベースに書き込む。",
                "path": ".claude/agents/notion-writer.md",
                "mermaid": """graph LR
    A[notion-schema.md] --> B[ページ構成]
    B --> C[Notion API書込]"""
            },
            {
                "name": "publisher（公開）",
                "desc": "Notionの公開ページを更新してニュースを公開する。",
                "path": ".claude/agents/publisher.md",
                "mermaid": """graph LR
    A[page-template.md] --> B[公開ページ更新]
    B --> C[完了レポート]"""
            }
        ]
    },
    # skill-creator
    "32dd725a-9f17-8104-82b2-dae3448329a3": {
        "name": "skill-creator",
        "agents": [
            {
                "name": "grader（評価）",
                "desc": "期待値に対する実行結果を評価し、スコアリングする。",
                "path": "agents/grader.md",
                "mermaid": """graph LR
    A[実行トランスクリプト] --> B[期待値照合]
    B --> C[スコア算出]
    C --> D[評価レポート]"""
            },
            {
                "name": "comparator（比較）",
                "desc": "2つの出力をブラインド比較し、バイアスなく優劣を判定する。",
                "path": "agents/comparator.md",
                "mermaid": """graph LR
    A[出力A] --> C[ブラインド比較]
    B[出力B] --> C
    C --> D[優劣判定]
    D --> E[比較レポート]"""
            },
            {
                "name": "analyzer（分析）",
                "desc": "比較結果とベンチマークデータのパターンを事後分析する。",
                "path": "agents/analyzer.md",
                "mermaid": """graph LR
    A[比較結果] --> B[パターン分析]
    C[ベンチマーク] --> B
    B --> D[改善提案]"""
            }
        ]
    },
    # skill-manager
    "32dd725a-9f17-8107-a968-dbf49c7864d5": {
        "name": "skill-manager",
        "agents": [
            {
                "name": "Auditor（監査）",
                "desc": "全スキルの健全性をLevel 1（ファイル・env）とLevel 2（API疎通・スモークテスト）の2段階で検証する。",
                "path": "agents/auditor/AGENT.md",
                "mermaid": """graph TD
    A[Auditor] --> B{レベル判定}
    B -->|Level 1| C[ファイル存在チェック]
    B -->|Level 1| D[環境変数チェック]
    B -->|Level 1| E[frontmatterチェック]
    B -->|Level 2| F[API疎通テスト]
    B -->|Level 2| G[スモークテスト]
    C --> H[結果集約]
    D --> H
    E --> H
    F --> H
    G --> H"""
            },
            {
                "name": "Optimizer（最適化）",
                "desc": "スキル間の依存関係グラフを構築し、並列実行の安全性判定と最適化提案を行う。",
                "path": "agents/optimizer/AGENT.md",
                "mermaid": """graph LR
    A[依存関係分析] --> B[共有リソース特定]
    B --> C[並列安全マトリクス]
    C --> D[最適化提案]
    E[重複機能検出] --> D"""
            },
            {
                "name": "Registrar（登録）",
                "desc": "未登録スキルを自動検出し、メタデータ解析・カテゴリ分類してregistry.jsonに登録する。",
                "path": "agents/registrar/AGENT.md",
                "mermaid": """graph LR
    A[commands/スキャン] --> B[未登録検出]
    B --> C[メタデータ解析]
    C --> D[カテゴリ分類]
    D --> E[registry.json登録]"""
            },
            {
                "name": "Doctor（修復）",
                "desc": "Auditorが検出した問題を5タイプに分類し、診断・修復する。修復履歴をログに記録。",
                "path": "agents/doctor/AGENT.md",
                "mermaid": """graph TD
    A[問題受取] --> B{タイプ判定}
    B -->|ファイル不在| C[類似ファイル検索 → パス修正]
    B -->|env未定義| D[変数補完提案]
    B -->|frontmatter不正| E[自動修正]
    B -->|API疎通失敗| F[Keykeeperと連携]
    B -->|構造不整合| G[参照パス修正]
    C --> H[修復ログ記録]
    D --> H
    E --> H
    F --> H
    G --> H"""
            },
            {
                "name": "Reporter（レポート）",
                "desc": "各エージェントの実行結果を統合し、daily/weekly/monthlyレポートを生成する。",
                "path": "agents/reporter/AGENT.md",
                "mermaid": """graph LR
    A[各エージェント結果] --> B[結果統合]
    B -->|daily| C[ターミナル表示]
    B -->|weekly| D[Markdown保存]
    B -->|monthly| E[月次レポート + トレンド分析]"""
            },
            {
                "name": "Keykeeper（鍵番）",
                "desc": "全APIキーの有効性テスト、期限監視、影響分析、セキュリティ監査を行う。",
                "path": "agents/keykeeper/AGENT.md",
                "mermaid": """graph TD
    A[Keykeeper] --> B[.env読込]
    B --> C[存在チェック]
    C --> D[API有効性テスト]
    D --> E{結果}
    E -->|有効| F[ステータス更新]
    E -->|無効| G[影響スキル一覧表示]
    G --> H[修復アクション提案]"""
            }
        ]
    }
}

# ============================================================
# 各親ページにサブエージェントのトグルブロックを追加
# ============================================================

print("サブエージェント詳細を親ページに追加します...\n")

for page_id, data in subagents.items():
    print(f"[{data['name']}] ({len(data['agents'])}個のサブエージェント)")

    blocks = [
        divider(),
        {
            "object": "block",
            "type": "heading_2",
            "heading_2": {"rich_text": [{"text": {"content": f"サブエージェント（{len(data['agents'])}個）"}}]}
        }
    ]

    for agent in data["agents"]:
        # トグルブロック（開閉可能）にサブエージェント詳細を格納
        toggle = toggle_block(
            f">> {agent['name']}",
            [
                paragraph(f"説明: {agent['desc']}"),
                paragraph(f"定義ファイル: {agent['path']}"),
                code_block(agent["mermaid"], "mermaid")
            ]
        )
        blocks.append(toggle)

    success = add_blocks(page_id, blocks)
    if success:
        print(f"  OK: {len(data['agents'])}個追加")
    else:
        print(f"  FAIL")

    time.sleep(0.5)

print("\n完了!")
