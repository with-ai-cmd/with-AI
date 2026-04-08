#!/usr/bin/env python3
"""全スキルをNotionスキル管理DBに一括登録する（Mermaid構造図付き）"""

import json
import os
import time
import urllib.request
import urllib.error

# .env読み込み
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
DB_ID = env["NOTION_SKILL_DB"]

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
}

def notion_post(url, data):
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers=HEADERS, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  ERROR {e.code}: {e.read().decode()[:200]}")
        return None

def create_page(name, category, sub_count, apis, deps, skill_dir, description, mermaid):
    api_select = [{"name": a} for a in apis]

    data = {
        "parent": {"database_id": DB_ID},
        "properties": {
            "スキル名": {"title": [{"text": {"content": name}}]},
            "ステータス": {"select": {"name": "未チェック"}},
            "カテゴリ": {"select": {"name": category}},
            "サブエージェント数": {"number": sub_count},
            "API依存": {"multi_select": api_select},
            "依存スキル": {"rich_text": [{"text": {"content": deps}}]},
            "スキルディレクトリ": {"rich_text": [{"text": {"content": skill_dir}}]}
        },
        "children": [
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {"rich_text": [{"text": {"content": "概要"}}]}
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {"rich_text": [{"text": {"content": description}}]}
            },
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {"rich_text": [{"text": {"content": "ディレクトリ構造"}}]}
            },
            {
                "object": "block",
                "type": "code",
                "code": {
                    "rich_text": [{"text": {"content": mermaid}}],
                    "language": "mermaid"
                }
            }
        ]
    }

    result = notion_post("https://api.notion.com/v1/pages", data)
    if result and "id" in result:
        print(f"  OK: {name}")
    else:
        print(f"  FAIL: {name}")
    time.sleep(0.35)

# ============================================================
# 全21スキル定義
# ============================================================

skills = [
    # --- CRM ---
    {
        "name": "contact-add",
        "category": "CRM",
        "sub_count": 0,
        "apis": ["Notion"],
        "deps": "",
        "skill_dir": "単体コマンド",
        "description": "名刺写真・音声メモ・テキストから人脈DBにコンタクトを登録する。Google Drive名刺フォルダとの連携あり。",
        "mermaid": """graph TD
    A[/contact-add] --> B{入力判定}
    B -->|引数なし| C[名刺フォルダスキャン]
    B -->|画像パス| D[OCR解析]
    B -->|音声| E[文字起こし]
    B -->|テキスト| F[情報抽出]
    C --> G[ユーザー確認]
    D --> G
    E --> G
    F --> G
    G --> H[Notion登録]
    H --> I[処理済みフォルダへ移動]"""
    },
    {
        "name": "contact-show",
        "category": "CRM",
        "sub_count": 0,
        "apis": ["Notion"],
        "deps": "",
        "skill_dir": "単体コマンド",
        "description": "会社名や氏名でNotion人脈DBを検索し、コンタクト情報と関連する商談履歴・ミーティング記録を表示する。",
        "mermaid": """graph TD
    A[/contact-show キーワード] --> B[氏名で検索]
    B -->|見つからない| C[会社名で検索]
    B -->|見つかった| D[コンタクト情報表示]
    C --> D
    D --> E[商談履歴を取得]
    D --> F[ミーティング記録を取得]
    E --> G[時系列で統合表示]
    F --> G"""
    },
    {
        "name": "contact-list",
        "category": "CRM",
        "sub_count": 0,
        "apis": ["Notion"],
        "deps": "",
        "skill_dir": "単体コマンド",
        "description": "Notion人脈DBのコンタクトをステータス・温度感・サービス関心でフィルタして一覧表示する。",
        "mermaid": """graph TD
    A[/contact-list フィルタ] --> B{引数解析}
    B -->|ステータス指定| C[ステータスフィルタ]
    B -->|温度感指定| D[温度感フィルタ]
    B -->|引数なし| E[全件取得]
    C --> F[テーブル形式で表示]
    D --> F
    E --> F"""
    },
    {
        "name": "contact-convert",
        "category": "CRM",
        "sub_count": 0,
        "apis": ["Notion"],
        "deps": "contract-generate",
        "skill_dir": "単体コマンド",
        "description": "成約したコンタクトの情報をクライアントDBに登録し、コンタクトDBのステータスを成約に更新する。",
        "mermaid": """graph TD
    A[/contact-convert 会社名] --> B[コンタクトDB検索]
    B --> C[情報表示・確認]
    C --> D[契約情報ヒアリング]
    D --> E[クライアントDB登録]
    E --> F[コンタクトDB更新]
    F --> G{契約書生成?}
    G -->|Yes| H[/contract-generate へ]"""
    },
    # --- 経理 ---
    {
        "name": "receipt-add",
        "category": "経理",
        "sub_count": 0,
        "apis": ["Notion", "Gmail"],
        "deps": "",
        "skill_dir": "単体コマンド",
        "description": "Gmail検索・画像/PDF読み取り・手入力から領収書情報を解析し、Notion領収書DBに登録する。",
        "mermaid": """graph TD
    A[/receipt-add] --> B{入力判定}
    B -->|引数なし| C[Gmail検索]
    B -->|画像/PDF| D[AI解析]
    B -->|テキスト| E[テキスト解析]
    C --> F[メール一覧表示]
    F --> G[メール本文読み取り]
    G --> H[情報抽出]
    D --> H
    E --> H
    H --> I[カテゴリ自動分類]
    I --> J[ユーザー確認]
    J --> K[Notion登録]"""
    },
    {
        "name": "receipt-list",
        "category": "経理",
        "sub_count": 0,
        "apis": ["Notion"],
        "deps": "",
        "skill_dir": "単体コマンド",
        "description": "Notion領収書DBから領収書を月別・支払先・カテゴリ・ステータスでフィルタして一覧表示する。",
        "mermaid": """graph TD
    A[/receipt-list フィルタ] --> B{引数解析}
    B -->|月指定| C[月別フィルタ]
    B -->|カテゴリ| D[カテゴリフィルタ]
    B -->|引数なし| E[今月分取得]
    C --> F[テーブル表示 + 合計]
    D --> F
    E --> F"""
    },
    {
        "name": "receipt-summary",
        "category": "経理",
        "sub_count": 0,
        "apis": ["Notion"],
        "deps": "",
        "skill_dir": "単体コマンド",
        "description": "領収書データをカテゴリ別・月別に集計し、支出サマリーレポートを生成する。確定申告対応。",
        "mermaid": """graph TD
    A[/receipt-summary 期間] --> B{引数解析}
    B -->|月指定| C[月別カテゴリ集計]
    B -->|年間| D[月別×カテゴリ クロス集計]
    B -->|確定申告| E[年間集計 + 警告チェック]
    C --> F[レポート表示]
    D --> F
    E --> F"""
    },
    # --- マーケティング ---
    {
        "name": "marketing-engine",
        "category": "マーケティング",
        "sub_count": 7,
        "apis": ["Notion", "Google", "Gmail"],
        "deps": "",
        "skill_dir": "~/Desktop/claude code/marketing-engine/",
        "description": "GA4・Search Console・競合分析・SEO・記事生成・デプロイ・レポート配信を完全自動化する最強マーケティングエンジン。",
        "mermaid": """graph TD
    A[/marketing-engine] --> B{モード判定}
    B -->|daily| C[デイリーチェック]
    B -->|weekly| D[ウィークリーレポート]
    B -->|blog テーマ| E[記事生成]
    B -->|case 会社名| F[事例生成]
    B -->|seo| G[SEO分析]
    B -->|competitor| H[競合分析]

    subgraph サブエージェント
        SA1[analytics]
        SA2[seo-optimizer]
        SA3[content-writer]
        SA4[case-study]
        SA5[competitor-intel]
        SA6[site-deployer]
        SA7[report-publisher]
    end

    C --> SA1
    D --> SA1 --> SA7
    E --> SA3 --> SA6
    F --> SA4 --> SA6
    G --> SA2
    H --> SA5"""
    },
    # --- コンテンツ ---
    {
        "name": "gen-ai",
        "category": "コンテンツ",
        "sub_count": 0,
        "apis": ["Google", "nanobanana"],
        "deps": "slide-creator",
        "skill_dir": "~/Desktop/claude code/gen-ai-master/",
        "description": "カリキュラム番号を入力すると、リサーチ→教材文章作成→PDF化→画像スライド生成→Googleドライブ保存まで一気通貫で行う。",
        "mermaid": """graph TD
    A[/gen-ai カリキュラム番号] --> B[Phase 0: スプレッドシートからカリキュラム取得]
    B --> C[Phase 1: Webリサーチ]
    C --> D[Phase 2: 教材文章作成]
    D --> E[Phase 3: 並列処理]
    E --> F[PDF生成]
    E --> G[用語集生成]
    E --> H[/slide-creator で画像スライド生成]
    F --> I[Googleドライブ保存]
    G --> I
    H --> I"""
    },
    {
        "name": "slide-creator",
        "category": "コンテンツ",
        "sub_count": 4,
        "apis": ["nanobanana"],
        "deps": "",
        "skill_dir": "~/Desktop/claude code/slide-creator/",
        "description": "画像スライド（nanobanana API）またはHTMLスライドを自動生成する。複数スタイル対応。",
        "mermaid": """graph TD
    A[/slide-creator] --> B{入力判定}
    B -->|カリキュラム番号| C[nanobanana-slide]
    B -->|html/HTML| D[html-slide]
    B -->|セミナー| E[ai-seminar]

    subgraph nanobanana-slide
        C --> C1[white-board-slide]
        C1 --> C2[STYLE.md読込]
        C2 --> C3[プロンプト生成]
        C3 --> C4[nanobanana API]
        C4 --> C5[画像保存]
    end

    subgraph html-slide
        D --> D1[HTMLテンプレート生成]
        D1 --> D2[Cyberpunk Dark テーマ]
    end

    subgraph ai-seminar
        E --> E1[内容解析]
        E1 --> E2[スライド構成設計]
        E2 --> E3[近未来的HTMLスライド生成]
    end"""
    },
    {
        "name": "pptx",
        "category": "コンテンツ",
        "sub_count": 0,
        "apis": ["なし"],
        "deps": "",
        "skill_dir": "単体コマンド",
        "description": "with-AI株式会社のブランドガイドライン（青グラデーション、Noto Sans JP）に沿ったPowerPointを自動生成する。",
        "mermaid": """graph TD
    A[/pptx 指示内容] --> B[会社情報読込]
    B --> C[brand.md / profile.md / services.md]
    C --> D[スライド構成設計]
    D --> E[python-pptx スクリプト生成]
    E --> F[ブランドルール適用]
    F --> G[ロゴ配置]
    G --> H[PPTX出力]"""
    },
    # --- データ ---
    {
        "name": "notion",
        "category": "データ",
        "sub_count": 0,
        "apis": ["Notion"],
        "deps": "",
        "skill_dir": "単体コマンド",
        "description": "自然言語でNotion API操作。DB作成・ページCRUD・検索・一括更新など何でも対応する汎用エージェント。",
        "mermaid": """graph TD
    A[/notion 自然言語指示] --> B{操作判定}
    B -->|DB作成| C[DB作成 → .env追記 → スキーマ追記]
    B -->|検索| D[DBクエリ → 結果表示]
    B -->|ページ作成| E[情報ヒアリング → ページ作成]
    B -->|更新| F[対象検索 → プロパティ更新]
    B -->|削除| G[対象確認 → アーカイブ]
    B -->|横断検索| H[全DB横断検索]"""
    },
    # --- 業務 ---
    {
        "name": "確認",
        "category": "業務",
        "sub_count": 0,
        "apis": ["Notion"],
        "deps": "",
        "skill_dir": "単体コマンド",
        "description": "今日が期日のタスクを一覧表示し、完了/未完了を確認。未完了タスクは空いている営業日に自動リスケジュールする。",
        "mermaid": """graph TD
    A[/確認] --> B[今日までのタスク取得]
    B --> C[タスク一覧表示]
    C --> D[完了タスクの番号入力]
    D --> E[完了処理]
    E --> F[未完了タスクのリスケ]
    F --> G[今後1週間の負荷確認]
    G --> H[リスケ案提示]
    H --> I[確認後 期日更新]
    I --> J[サマリー表示]"""
    },
    {
        "name": "morning-news",
        "category": "業務",
        "sub_count": 5,
        "apis": ["Notion"],
        "deps": "",
        "skill_dir": "~/morning-news/",
        "description": "AIニュースを自動収集し、スコアリング・分析してNotionに整理・公開する朝のニュースエージェント。",
        "mermaid": """graph TD
    A[/morning-news] --> B[orchestrator]
    B --> C[rss-collector]
    C --> D[person-tracker]
    D --> E[analyser]
    E --> F[notion-writer]
    F --> G[publisher]

    subgraph スキル定義
        S1[rss-sources.md]
        S2[watch-list.md]
        S3[scoring-rules.md]
        S4[notion-schema.md]
        S5[page-template.md]
    end

    C -.-> S1
    D -.-> S2
    E -.-> S3
    F -.-> S4
    G -.-> S5"""
    },
    {
        "name": "meeting-add",
        "category": "業務",
        "sub_count": 0,
        "apis": ["Notion"],
        "deps": "",
        "skill_dir": "単体コマンド",
        "description": "ミーティング記録をNotionに登録する。音声文字起こし対応。ネクストアクションはタスクDBに自動登録。",
        "mermaid": """graph TD
    A[/meeting-add] --> B{入力判定}
    B -->|音声ファイル| C[文字起こし → 要約]
    B -->|テキスト| D[構造化]
    B -->|手動入力| E[ヒアリング]
    C --> F[紐付け先検索]
    D --> F
    E --> F
    F --> G[Notion ミーティングDB登録]
    G --> H{ネクストアクションあり?}
    H -->|Yes| I[タスクDB自動登録]
    I --> J[コンタクト最終連絡日更新]
    H -->|No| J"""
    },
    # --- 文書 ---
    {
        "name": "proposal-generate",
        "category": "文書",
        "sub_count": 0,
        "apis": ["Notion"],
        "deps": "pptx, meeting-add",
        "skill_dir": "単体コマンド",
        "description": "クライアントの課題に基づき、AIKOMONサービスの提案書をMarkdownで自動生成する。PPTX変換対応。",
        "mermaid": """graph TD
    A[/proposal-generate 会社名] --> B[クライアント/コンタクトDB検索]
    B --> C[ミーティング履歴取得]
    C --> D[情報整理・確認]
    D --> E[services.md読込]
    E --> F[提案書Markdown生成]
    F --> G[ファイル保存]
    G --> H{PPTX化する?}
    H -->|Yes| I[/pptx へ]
    H --> J{MTG記録する?}
    J -->|Yes| K[/meeting-add へ]"""
    },
    {
        "name": "contract-generate",
        "category": "文書",
        "sub_count": 0,
        "apis": ["Notion"],
        "deps": "",
        "skill_dir": "単体コマンド",
        "description": "会社名を指定するとNotionから情報を取得し、契約書テンプレートの空欄を埋めてdocxを生成する。",
        "mermaid": """graph TD
    A[/contract-generate 会社名] --> B[クライアントDB検索]
    B --> C[情報表示・確認]
    C --> D{契約書の種類}
    D -->|AIKOMON| E1[AIKOMON業務委託契約書.md]
    D -->|システム開発| E2[システム開発契約書.md]
    D -->|NDA| E3[秘密保持契約書.md]
    D -->|営業代行| E4[営業代行業務委託契約書.md]
    E1 --> F[空欄自動埋め]
    E2 --> F
    E3 --> F
    E4 --> F
    F --> G[docx生成]"""
    },
    {
        "name": "intro-generate",
        "category": "文書",
        "sub_count": 0,
        "apis": ["Notion"],
        "deps": "",
        "skill_dir": "単体コマンド",
        "description": "Notionから情報を取得し、with-AI株式会社としての紹介文を自動生成する。自社紹介・相手紹介・マッチング対応。",
        "mermaid": """graph TD
    A[/intro-generate 会社名] --> B[コンタクト/クライアントDB検索]
    B --> C[会社情報読込]
    C --> D{紹介の種類}
    D -->|自社紹介| E[相手の業界に合わせた紹介文]
    D -->|相手紹介| F[第三者向け紹介文]
    D -->|マッチング| G[2者の相互紹介文]
    E --> H[テキスト出力]
    F --> H
    G --> H"""
    },
    # --- クライアント案件 ---
    {
        "name": "polepole",
        "category": "クライアント案件",
        "sub_count": 0,
        "apis": ["GAS"],
        "deps": "",
        "skill_dir": "~/Projects/polepole-enrollment-system/",
        "description": "児童発達支援センターPOLEPOLEの入園手続き自動化GASシステムの修正・編集・管理。",
        "mermaid": """graph TD
    A[/polepole 修正指示] --> B{修正対象判定}
    B -->|フォーム質問| C[02_formBuilder.gs]
    B -->|シート構成| D[04_sheetManager.gs]
    B -->|ドライブ| E[05_driveManager.gs]
    B -->|契約書| F[06_contractManager.gs]
    B -->|メール| G[07_emailManager.gs]

    C --> H[03_triggerHandler.gs も連動更新]
    D --> H

    subgraph GASファイル構成
        G1[00_config.gs]
        G2[01_setup.gs]
        C
        H2[03_triggerHandler.gs]
        D
        E
        F
        G
    end"""
    },
    # --- メタ ---
    {
        "name": "skill-creator",
        "category": "メタ",
        "sub_count": 3,
        "apis": ["なし"],
        "deps": "",
        "skill_dir": "~/Desktop/claude code/skill-creator/",
        "description": "新しいスキル（スラッシュコマンド）を作成・改善・テストする。評価・比較・分析のサブエージェント付き。",
        "mermaid": """graph TD
    A[/skill-creator] --> B[SKILL.md読込]
    B --> C[スキル定義作成]
    C --> D[テスト実行]
    D --> E{評価}

    subgraph サブエージェント
        SA1[grader - 評価]
        SA2[comparator - 比較]
        SA3[analyzer - 分析]
    end

    E --> SA1
    SA1 --> SA2
    SA2 --> SA3
    SA3 --> F[最適化・改善]
    F --> G[パッケージ化]"""
    },
    {
        "name": "skill-manager",
        "category": "メタ",
        "sub_count": 6,
        "apis": ["Notion"],
        "deps": "",
        "skill_dir": "~/Desktop/claude code/skill-manager/",
        "description": "全スキルを一元管理するメタエージェント。6つのサブエージェントでヘルスチェック・APIキー管理・最適化・修復・レポートを統括。",
        "mermaid": """graph TD
    A[/skill-manager] --> B{モード判定}
    B -->|daily| C[デイリーチェック]
    B -->|weekly| D[ウィークリーチェック]
    B -->|monthly| E[マンスリーレビュー]

    subgraph サブエージェント
        SA1[Auditor - 監査]
        SA2[Optimizer - 最適化]
        SA3[Registrar - 登録]
        SA4[Doctor - 修復]
        SA5[Reporter - レポート]
        SA6[Keykeeper - 鍵番]
    end

    C --> SA6
    C --> SA1
    C --> SA5

    D --> SA6
    D --> SA3
    D --> SA1
    D --> SA2
    D --> SA5

    E --> SA6
    E --> SA3
    E --> SA1
    E --> SA2
    E --> SA4
    E --> SA5"""
    },
]

print(f"全 {len(skills)} スキルをNotionに登録します...\n")

for i, s in enumerate(skills, 1):
    print(f"[{i}/{len(skills)}] {s['name']}")
    create_page(**s)

print(f"\n完了! {len(skills)}件のスキルを登録しました。")
print(f"Notion DB: https://www.notion.so/{DB_ID.replace('-', '')}")
