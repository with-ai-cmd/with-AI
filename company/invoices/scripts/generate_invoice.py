#!/usr/bin/env python3
"""
請求書PDF生成スクリプト
with-AI株式会社 向け

使い方:
  python3 generate_invoice.py \
    --company "株式会社サンプル" \
    --contact "山田太郎" \
    --item "AIKOMONプラン（2026年4月分）" \
    --amount 250000 \
    --tax 25000 \
    --invoice-number "INV-202604-001" \
    --invoice-date "2026-04-30" \
    --due-date "2026-05-31" \
    --output "./output.pdf"

  # 複数品目の場合（JSON形式）
  python3 generate_invoice.py \
    --company "株式会社サンプル" \
    --contact "山田太郎" \
    --items '[{"name":"AIKOMONプラン","amount":250000},{"name":"追加開発","amount":100000}]' \
    --invoice-number "INV-202604-001" \
    --invoice-date "2026-04-30" \
    --due-date "2026-05-31" \
    --output "./output.pdf"
"""

import argparse
import json
import os
import sys
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

# 日本語フォント登録（Arial Unicode MS - macOS標準搭載）
_FONT_PATH = "/Library/Fonts/Arial Unicode.ttf"
_FONT_ALT = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"

_font_file = _FONT_PATH if os.path.exists(_FONT_PATH) else _FONT_ALT
pdfmetrics.registerFont(TTFont("ArialUnicode", _font_file))

FONT_GOTHIC = "ArialUnicode"
FONT_BOLD = "ArialUnicode"  # Arial Unicode は単一ウェイトのため同じフォントを使用

# 設定ファイル読み込み
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config.json")


def load_config():
    with open(os.path.expanduser(CONFIG_PATH), "r", encoding="utf-8") as f:
        return json.load(f)


def format_yen(amount):
    """金額をカンマ区切りの円表記にする"""
    return f"¥{amount:,}"


def draw_invoice(c, config, params):
    width, height = A4
    company = config["company"]
    bank = config["bank"]

    # --- ヘッダー ---
    # タイトル
    c.setFont(FONT_BOLD, 24)
    c.drawCentredString(width / 2, height - 40 * mm, "請 求 書")

    # 請求書番号・日付（右上）
    c.setFont(FONT_GOTHIC, 9)
    c.drawRightString(width - 20 * mm, height - 55 * mm, f"請求書番号: {params['invoice_number']}")
    c.drawRightString(width - 20 * mm, height - 61 * mm, f"請求日: {params['invoice_date']}")

    # --- 請求先（左側）---
    y = height - 60 * mm
    c.setFont(FONT_BOLD, 14)
    c.drawString(20 * mm, y, f"{params['company']} 御中")

    # 下線
    c.setStrokeColor(colors.black)
    c.setLineWidth(0.5)
    c.line(20 * mm, y - 2 * mm, 110 * mm, y - 2 * mm)

    y -= 10 * mm
    c.setFont(FONT_GOTHIC, 9)
    if params.get("contact"):
        c.drawString(20 * mm, y, f"{params['contact']} 様")
        y -= 6 * mm

    # --- 発行元（右側）---
    rx = 125 * mm
    ry = height - 75 * mm
    c.setFont(FONT_BOLD, 11)
    c.drawString(rx, ry, company["name"])
    ry -= 6 * mm
    c.setFont(FONT_GOTHIC, 8)
    if company.get("registration_number"):
        c.drawString(rx, ry, f"登録番号: {company['registration_number']}")
        ry -= 5 * mm
    c.drawString(rx, ry, company["address"])
    ry -= 5 * mm
    c.drawString(rx, ry, f"TEL: {company['phone']}")
    ry -= 5 * mm
    c.drawString(rx, ry, f"Email: {company['email']}")
    ry -= 5 * mm
    c.drawString(rx, ry, company["representative"])

    # --- 合計金額 ---
    total = params["total"]
    y = height - 100 * mm
    c.setFont(FONT_GOTHIC, 10)
    c.drawString(20 * mm, y, "ご請求金額（税込）")
    y -= 2 * mm

    # 合計金額ボックス
    c.setFillColor(colors.HexColor("#f0f0f0"))
    c.rect(20 * mm, y - 12 * mm, 90 * mm, 12 * mm, fill=True, stroke=True)
    c.setFillColor(colors.black)
    c.setFont(FONT_BOLD, 18)
    c.drawCentredString(65 * mm, y - 10 * mm, format_yen(total))

    # --- 支払期限 ---
    y -= 20 * mm
    c.setFont(FONT_GOTHIC, 10)
    c.drawString(20 * mm, y, f"お支払期限: {params['due_date']}")

    # --- 明細テーブル ---
    y -= 15 * mm
    table_x = 20 * mm
    table_width = width - 40 * mm
    col_widths = [table_width * 0.55, table_width * 0.15, table_width * 0.15, table_width * 0.15]

    # ヘッダー行
    c.setFillColor(colors.HexColor("#333333"))
    c.rect(table_x, y - 8 * mm, table_width, 8 * mm, fill=True, stroke=False)
    c.setFillColor(colors.white)
    c.setFont(FONT_GOTHIC, 9)
    headers = ["品目", "数量", "単価", "金額"]
    x = table_x
    for i, header in enumerate(headers):
        c.drawCentredString(x + col_widths[i] / 2, y - 6 * mm, header)
        x += col_widths[i]

    # 明細行
    c.setFillColor(colors.black)
    c.setFont(FONT_GOTHIC, 9)
    y -= 8 * mm

    items = params["items"]
    for idx, item in enumerate(items):
        row_y = y - (idx + 1) * 10 * mm
        # 背景色（偶数行）
        if idx % 2 == 1:
            c.setFillColor(colors.HexColor("#f9f9f9"))
            c.rect(table_x, row_y - 2 * mm, table_width, 10 * mm, fill=True, stroke=False)
            c.setFillColor(colors.black)

        x = table_x
        # 品目名
        c.drawString(x + 3 * mm, row_y + 2 * mm, item["name"])
        x += col_widths[0]
        # 数量
        qty = item.get("quantity", 1)
        c.drawCentredString(x + col_widths[1] / 2, row_y + 2 * mm, str(qty))
        x += col_widths[1]
        # 単価
        c.drawRightString(x + col_widths[2] - 3 * mm, row_y + 2 * mm, format_yen(item["amount"]))
        x += col_widths[2]
        # 金額
        line_total = item["amount"] * qty
        c.drawRightString(x + col_widths[3] - 3 * mm, row_y + 2 * mm, format_yen(line_total))

        # 行区切り線
        c.setStrokeColor(colors.HexColor("#dddddd"))
        c.setLineWidth(0.3)
        c.line(table_x, row_y - 2 * mm, table_x + table_width, row_y - 2 * mm)

    # テーブル下線
    last_row_y = y - (len(items) + 1) * 10 * mm
    c.setStrokeColor(colors.black)
    c.setLineWidth(0.5)
    c.line(table_x, last_row_y + 8 * mm, table_x + table_width, last_row_y + 8 * mm)

    # --- 小計・消費税・合計 ---
    summary_x = table_x + col_widths[0] + col_widths[1]
    summary_y = last_row_y + 2 * mm
    c.setFont(FONT_GOTHIC, 9)

    subtotal = params["subtotal"]
    tax = params["tax"]

    rows = [
        ("小計", format_yen(subtotal)),
        ("消費税（10%）", format_yen(tax)),
    ]
    for label, value in rows:
        c.drawString(summary_x, summary_y, label)
        c.drawRightString(table_x + table_width - 3 * mm, summary_y, value)
        summary_y -= 7 * mm

    # 合計（太字）
    c.setFont(FONT_BOLD, 11)
    c.drawString(summary_x, summary_y, "合計（税込）")
    c.drawRightString(table_x + table_width - 3 * mm, summary_y, format_yen(total))

    # --- 振込先 ---
    bank_y = summary_y - 25 * mm
    c.setFont(FONT_GOTHIC, 10)
    c.drawString(20 * mm, bank_y, "お振込先")
    bank_y -= 3 * mm
    c.setStrokeColor(colors.black)
    c.setLineWidth(0.5)
    c.line(20 * mm, bank_y, 110 * mm, bank_y)

    bank_y -= 7 * mm
    c.setFont(FONT_GOTHIC, 9)
    bank_info = [
        f"銀行名: {bank['bank_name']}",
        f"支店名: {bank['branch_name']}",
        f"口座種別: {bank['account_type']}",
        f"口座番号: {bank['account_number']}",
        f"口座名義: {bank['account_holder']}",
    ]
    for line in bank_info:
        c.drawString(25 * mm, bank_y, line)
        bank_y -= 6 * mm

    bank_y -= 3 * mm
    c.setFont(FONT_GOTHIC, 8)
    c.drawString(25 * mm, bank_y, "※ 振込手数料はお客様のご負担でお願いいたします。")

    # --- 備考 ---
    if params.get("note"):
        note_y = bank_y - 15 * mm
        c.setFont(FONT_GOTHIC, 9)
        c.drawString(20 * mm, note_y, "備考:")
        note_y -= 6 * mm
        c.setFont(FONT_GOTHIC, 8)
        c.drawString(25 * mm, note_y, params["note"])


def main():
    parser = argparse.ArgumentParser(description="請求書PDF生成")
    parser.add_argument("--company", required=True, help="請求先会社名")
    parser.add_argument("--contact", default="", help="担当者名")
    parser.add_argument("--item", help="品目名（単一品目の場合）")
    parser.add_argument("--items", help="品目リスト（JSON配列）")
    parser.add_argument("--amount", type=int, help="金額（税抜・単一品目の場合）")
    parser.add_argument("--tax", type=int, help="消費税額（指定なしの場合は自動計算）")
    parser.add_argument("--invoice-number", required=True, help="請求書番号")
    parser.add_argument("--invoice-date", required=True, help="請求日（YYYY-MM-DD）")
    parser.add_argument("--due-date", required=True, help="支払期限（YYYY-MM-DD）")
    parser.add_argument("--note", default="", help="備考")
    parser.add_argument("--output", required=True, help="出力先パス")
    args = parser.parse_args()

    config = load_config()

    # 品目リスト構築
    if args.items:
        items = json.loads(args.items)
    elif args.item and args.amount is not None:
        items = [{"name": args.item, "amount": args.amount, "quantity": 1}]
    else:
        print("Error: --item と --amount、または --items を指定してください", file=sys.stderr)
        sys.exit(1)

    # 金額計算
    subtotal = sum(item["amount"] * item.get("quantity", 1) for item in items)
    tax = args.tax if args.tax is not None else int(subtotal * config["invoice_settings"]["tax_rate"])
    total = subtotal + tax

    # 日付フォーマット
    def format_date(d):
        dt = datetime.strptime(d, "%Y-%m-%d")
        return f"{dt.year}年{dt.month}月{dt.day}日"

    params = {
        "company": args.company,
        "contact": args.contact,
        "items": items,
        "subtotal": subtotal,
        "tax": tax,
        "total": total,
        "invoice_number": args.invoice_number,
        "invoice_date": format_date(args.invoice_date),
        "due_date": format_date(args.due_date),
        "note": args.note,
    }

    # 出力先ディレクトリ作成
    output_path = os.path.expanduser(args.output)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # PDF生成
    c = canvas.Canvas(output_path, pagesize=A4)
    draw_invoice(c, config, params)
    c.save()

    print(f"請求書を生成しました: {output_path}")
    print(f"  請求先: {args.company}")
    print(f"  合計: {format_yen(total)}（税込）")


if __name__ == "__main__":
    main()
