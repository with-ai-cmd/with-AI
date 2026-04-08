#!/usr/bin/env python3
"""
夜間学習ノート生成スクリプト
学習インボックスの未処理URLを取得し、要約して学習ノートを生成する
"""

import os
import json
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests
import anthropic
from dotenv import load_dotenv

# .env 読み込み
env_path = Path.home() / "Desktop" / "with-AI" / "skills" / "documents" / "クロードコード" / ".env"
load_dotenv(env_path)

NOTION_API_KEY = os.environ["NOTION_API_KEY"]
NOTION_LEARNING_INBOX_DB = os.environ["NOTION_LEARNING_INBOX_DB"]
NOTION_LEARNING_NOTE_DB = os.environ["NOTION_LEARNING_NOTE_DB"]
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")

NOTION_VERSION = "2022-06-28"
NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION,
}

JST = timezone(timedelta(hours=9))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def get_unprocessed_urls() -> list[dict]:
    """インボックスから未処理のURLを取得"""
    payload = {
        "filter": {
            "property": "ステータス",
            "select": {"equals": "未処理"},
        },
        "sorts": [{"property": "登録日", "direction": "ascending"}],
    }
    resp = requests.post(
        f"https://api.notion.com/v1/databases/{NOTION_LEARNING_INBOX_DB}/query",
        headers=NOTION_HEADERS,
        json=payload,
        timeout=30,
    )
    resp.raise_for_status()
    results = resp.json().get("results", [])

    items = []
    for page in results:
        props = page["properties"]
        url_val = props.get("URL", {}).get("url", "")
        memo_parts = props.get("メモ", {}).get("rich_text", [])
        memo = memo_parts[0]["plain_text"] if memo_parts else ""
        sender_parts = props.get("投稿者", {}).get("rich_text", [])
        sender = sender_parts[0]["plain_text"] if sender_parts else ""

        if url_val:
            items.append({
                "page_id": page["id"],
                "url": url_val,
                "memo": memo,
                "sender": sender,
            })
    return items


def fetch_content(url: str) -> str:
    """URLからコンテンツを取得（ベストエフォート）"""
    try:
        resp = requests.get(
            url,
            timeout=15,
            headers={"User-Agent": "Mozilla/5.0 (compatible; LearningBot/1.0)"},
        )
        resp.raise_for_status()
        # HTMLからテキスト抽出（簡易）
        import re
        text = re.sub(r"<script[^>]*>.*?</script>", "", resp.text, flags=re.DOTALL)
        text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL)
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text[:5000]  # 最大5000文字
    except Exception as e:
        logger.warning("Could not fetch %s: %s", url, e)
        return f"(コンテンツ取得失敗: {url})"


def summarize_with_claude(items: list[dict]) -> str:
    """Claude APIで記事を要約して学習ノートを生成"""
    client = anthropic.Anthropic()

    articles_text = ""
    for i, item in enumerate(items, 1):
        content = fetch_content(item["url"])
        articles_text += f"""
---
記事 {i}:
URL: {item['url']}
メモ: {item['memo'] or 'なし'}
投稿者: {item['sender']}
コンテンツ:
{content}
---
"""

    today = datetime.now(JST).strftime("%Y-%m-%d")

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": f"""あなたは with-AI株式会社の社内ナレッジ担当です。
以下の記事を読み、チームが「これだけ読めばOK」と思える実践的な学習レポートを作成してください。

日付: {today}

{articles_text}

以下のフォーマットで出力してください（Markdown）:

## 今日のポイント
今日の記事群から得られる最も重要な示唆を3行以内で。「で、結局何が大事なの？」に答える。

---

（以下、記事ごとに繰り返し）

## [記事タイトル（内容から推測）]
**元URL**: [URL]
**カテゴリ**: AI / ビジネス / 技術 / その他

### 3行でわかる要約
箇条書きで、専門用語は避けて端的に。

### ここを押さえろ
この記事で一番重要なポイント。「へぇ」で終わらせず、「つまりこういうことだ」まで踏み込む。

### うちへの影響
with-AI（AI×業務効率化の会社）にとって、この情報がどう関係するか。ビジネスチャンスやリスクがあれば具体的に。

### Next Action
この記事を読んだ上で、チームが明日からできる具体的なアクションを1-2個。

---

## 今日の学び総括
全記事を俯瞰して:
- **トレンド**: 今日の記事群に共通するトレンドや流れ
- **チームへの提案**: 来週のミーティングで話すべきトピック
- **注目ワード**: 今後ウォッチすべきキーワード（3つまで）

必ず日本語で出力してください。読み手は忙しいビジネスパーソンです。だらだら書かず、鋭く、実用的に。""",
            }
        ],
    )
    return message.content[0].text


def extract_categories(summary: str) -> list[str]:
    """要約テキストからカテゴリを抽出"""
    categories = []
    for cat in ["AI", "ビジネス", "技術", "その他"]:
        if cat in summary:
            categories.append(cat)
    return categories if categories else ["その他"]


def create_learning_note(summary: str, article_count: int, categories: list[str]) -> str:
    """学習ノートDBにページを作成"""
    today = datetime.now(JST)
    title = f"{today.strftime('%Y-%m-%d')} の学習ノート"

    payload = {
        "parent": {"database_id": NOTION_LEARNING_NOTE_DB},
        "properties": {
            "タイトル": {"title": [{"text": {"content": title}}]},
            "日付": {"date": {"start": today.strftime("%Y-%m-%d")}},
            "カテゴリ": {"multi_select": [{"name": c} for c in categories]},
            "記事数": {"number": article_count},
        },
        "children": markdown_to_notion_blocks(summary),
    }

    resp = requests.post(
        "https://api.notion.com/v1/pages",
        headers=NOTION_HEADERS,
        json=payload,
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["url"]


def markdown_to_notion_blocks(text: str) -> list[dict]:
    """Markdownテキストを簡易的にNotionブロックに変換"""
    blocks = []
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue
        if line.startswith("### "):
            blocks.append({
                "object": "block",
                "type": "heading_3",
                "heading_3": {"rich_text": [{"text": {"content": line[4:]}}]},
            })
        elif line.startswith("## "):
            blocks.append({
                "object": "block",
                "type": "heading_2",
                "heading_2": {"rich_text": [{"text": {"content": line[3:]}}]},
            })
        elif line.startswith("- "):
            blocks.append({
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {"rich_text": [{"text": {"content": line[2:]}}]},
            })
        else:
            blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {"rich_text": [{"text": {"content": line}}]},
            })
    return blocks[:100]  # Notion APIの上限


def mark_as_processed(page_ids: list[str]) -> None:
    """インボックスのステータスを処理済みに更新"""
    for page_id in page_ids:
        payload = {
            "properties": {
                "ステータス": {"select": {"name": "処理済み"}},
            }
        }
        try:
            resp = requests.patch(
                f"https://api.notion.com/v1/pages/{page_id}",
                headers=NOTION_HEADERS,
                json=payload,
                timeout=30,
            )
            resp.raise_for_status()
        except Exception as e:
            logger.error("Failed to update %s: %s", page_id, e)


def send_telegram_notification(message: str) -> None:
    """Telegramに完了通知を送信"""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.info("Telegram notification skipped (no CHAT_ID configured)")
        return
    try:
        requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
            json={"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "Markdown"},
            timeout=10,
        )
    except Exception as e:
        logger.warning("Telegram notification failed: %s", e)


def main() -> None:
    logger.info("=== 夜間学習ノート生成 開始 ===")

    # 1. 未処理URLを取得
    items = get_unprocessed_urls()
    if not items:
        logger.info("未処理の記事がありません。終了します。")
        send_telegram_notification("今日は新しい記事がありませんでした。おやすみなさい!")
        return

    logger.info("未処理記事: %d 件", len(items))

    # 2. Claude で要約
    logger.info("Claude APIで要約中...")
    summary = summarize_with_claude(items)

    # 3. カテゴリ抽出
    categories = extract_categories(summary)

    # 4. 学習ノート作成
    logger.info("Notionに学習ノートを作成中...")
    note_url = create_learning_note(summary, len(items), categories)
    logger.info("学習ノート作成完了: %s", note_url)

    # 5. インボックスを処理済みに更新
    page_ids = [item["page_id"] for item in items]
    mark_as_processed(page_ids)
    logger.info("インボックス %d 件を処理済みに更新", len(page_ids))

    # 6. Telegram通知
    today = datetime.now(JST).strftime("%Y-%m-%d")
    send_telegram_notification(
        f"おやすみなさい!\n\n"
        f"{today} の学習ノートができました\n"
        f"記事数: {len(items)} 件\n"
        f"カテゴリ: {', '.join(categories)}\n\n"
        f"{note_url}"
    )

    logger.info("=== 夜間学習ノート生成 完了 ===")


if __name__ == "__main__":
    main()
