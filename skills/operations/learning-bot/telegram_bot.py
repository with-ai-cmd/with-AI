#!/usr/bin/env python3
"""
学習インボックス Telegram Bot
URLを受信してNotionの学習インボックスDBに自動登録する
"""

import os
import re
import logging
from pathlib import Path

from dotenv import load_dotenv
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# .env 読み込み
env_path = Path.home() / "Desktop" / "with-AI" / "skills" / "documents" / "クロードコード" / ".env"
load_dotenv(env_path)

TELEGRAM_BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
NOTION_API_KEY = os.environ["NOTION_API_KEY"]
NOTION_LEARNING_INBOX_DB = os.environ["NOTION_LEARNING_INBOX_DB"]

NOTION_API_URL = "https://api.notion.com/v1/pages"
NOTION_VERSION = "2022-06-28"

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# URL抽出パターン
URL_PATTERN = re.compile(r'https?://[^\s<>"{}|\\^`\[\]]+')


def create_notion_page(url: str, memo: str, sender: str) -> dict:
    """NotionのインボックスDBにURLを登録"""
    import requests

    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
    }

    payload = {
        "parent": {"database_id": NOTION_LEARNING_INBOX_DB},
        "properties": {
            "タイトル": {"title": [{"text": {"content": url[:50]}}]},
            "URL": {"url": url},
            "メモ": {"rich_text": [{"text": {"content": memo}}] if memo else []},
            "ステータス": {"select": {"name": "未処理"}},
            "投稿者": {"rich_text": [{"text": {"content": sender}}]},
        },
    }

    resp = requests.post(NOTION_API_URL, headers=headers, json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "学習Bot へようこそ!\n\n"
        "X(Twitter)のURLを送ってください。\n"
        "Notionの学習インボックスに自動登録します。\n\n"
        "URLと一緒にメモも添えられます:\n"
        "https://x.com/... これ面白い"
    )


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    text = update.message.text or ""
    urls = URL_PATTERN.findall(text)

    if not urls:
        await update.message.reply_text("URLが見つかりませんでした。リンクを送ってください。")
        return

    sender = update.message.from_user.full_name or update.message.from_user.username or "unknown"

    # URL以外のテキストをメモとして扱う
    memo = URL_PATTERN.sub("", text).strip()

    registered = 0
    for url in urls:
        try:
            create_notion_page(url, memo, sender)
            registered += 1
            logger.info("Registered: %s (by %s)", url, sender)
        except Exception as e:
            logger.error("Failed to register %s: %s", url, e)
            await update.message.reply_text(f"登録エラー: {url}\n{e}")

    if registered:
        await update.message.reply_text(f"Notionに {registered} 件登録しました!")


def main() -> None:
    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    logger.info("Learning Bot started")
    app.run_polling()


if __name__ == "__main__":
    main()
