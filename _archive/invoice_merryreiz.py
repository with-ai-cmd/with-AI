#!/usr/bin/env python3
"""請求書PDF生成 - 勝又海斗 → 株式会社MerryReiz"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# フォント登録（Arial Unicode MS - 日本語対応TTF）
pdfmetrics.registerFont(TTFont('ArialUnicode', '/Library/Fonts/Arial Unicode.ttf'))

FONT_GOTHIC = 'ArialUnicode'
FONT_MINCHO = 'ArialUnicode'

# カラー
COLOR_PRIMARY = HexColor('#2C3E50')
COLOR_ACCENT = HexColor('#3498DB')
COLOR_LIGHT_BG = HexColor('#F8F9FA')
COLOR_BORDER = HexColor('#DEE2E6')
COLOR_TEXT = HexColor('#333333')
COLOR_SUBTLE = HexColor('#6C757D')

WIDTH, HEIGHT = A4
OUTPUT = '/Users/kaitomain/Desktop/請求書_MerryReiz_20260408.pdf'


def draw_invoice(c):
    # ── ヘッダーライン ──
    c.setStrokeColor(COLOR_ACCENT)
    c.setLineWidth(3)
    c.line(25 * mm, HEIGHT - 20 * mm, WIDTH - 25 * mm, HEIGHT - 20 * mm)

    # ── タイトル ──
    c.setFont(FONT_GOTHIC, 28)
    c.setFillColor(COLOR_PRIMARY)
    c.drawCentredString(WIDTH / 2, HEIGHT - 38 * mm, '請 求 書')

    # ── 請求書番号・日付（右上） ──
    c.setFont(FONT_GOTHIC, 9)
    c.setFillColor(COLOR_SUBTLE)
    rx = WIDTH - 28 * mm
    c.drawRightString(rx, HEIGHT - 48 * mm, '請求書番号: INV-20260408-001')
    c.drawRightString(rx, HEIGHT - 54 * mm, '発行日: 2026年4月8日')

    # ── 請求先（左） ──
    y = HEIGHT - 68 * mm
    c.setFont(FONT_GOTHIC, 14)
    c.setFillColor(COLOR_PRIMARY)
    c.drawString(28 * mm, y, '株式会社MerryReiz')
    c.setFont(FONT_GOTHIC, 11)
    c.drawString(28 * mm + c.stringWidth('株式会社MerryReiz', FONT_GOTHIC, 14) + 3 * mm, y + 0.5 * mm, '御中')

    # 請求先の下線
    c.setStrokeColor(COLOR_BORDER)
    c.setLineWidth(0.5)
    c.line(28 * mm, y - 3 * mm, 110 * mm, y - 3 * mm)

    # ── 合計金額ボックス ──
    box_y = HEIGHT - 92 * mm
    box_w = WIDTH - 56 * mm
    c.setFillColor(COLOR_PRIMARY)
    c.roundRect(28 * mm, box_y, box_w, 14 * mm, 2 * mm, fill=1, stroke=0)
    c.setFillColor(HexColor('#FFFFFF'))
    c.setFont(FONT_GOTHIC, 10)
    c.drawString(34 * mm, box_y + 5 * mm, 'ご請求金額（税込）')
    c.setFont(FONT_GOTHIC, 20)
    c.drawRightString(WIDTH - 34 * mm, box_y + 4 * mm, '¥ 55,000')

    # ── 支払期限 ──
    c.setFillColor(COLOR_TEXT)
    c.setFont(FONT_GOTHIC, 9)
    c.drawString(28 * mm, box_y - 8 * mm, 'お支払期限: 2026年4月30日')

    # ── 明細テーブル ──
    table_top = HEIGHT - 118 * mm
    col_x = [28 * mm, 38 * mm, 120 * mm, 148 * mm, WIDTH - 28 * mm]
    row_h = 10 * mm
    header_h = 9 * mm

    # ヘッダー背景
    c.setFillColor(COLOR_PRIMARY)
    c.rect(28 * mm, table_top - header_h, WIDTH - 56 * mm, header_h, fill=1, stroke=0)

    # ヘッダーテキスト
    c.setFillColor(HexColor('#FFFFFF'))
    c.setFont(FONT_GOTHIC, 9)
    headers = ['No.', '品目', '数量', '単価', '金額']
    header_positions = [32 * mm, 55 * mm, 125 * mm, 152 * mm, WIDTH - 34 * mm]
    aligns = ['left', 'left', 'center', 'right', 'right']

    for i, (text, xpos, align) in enumerate(zip(headers, header_positions, aligns)):
        hy = table_top - header_h + 3 * mm
        if align == 'right':
            c.drawRightString(xpos, hy, text)
        elif align == 'center':
            c.drawCentredString(xpos, hy, text)
        else:
            c.drawString(xpos, hy, text)

    # 明細データ
    items = [
        ('1', 'コンサル費用（2月分）', '1', '22,000', '22,000'),
        ('2', 'システム開発', '1', '33,000', '33,000'),
    ]

    c.setFillColor(COLOR_TEXT)
    c.setFont(FONT_GOTHIC, 9)

    for idx, (no, name, qty, price, amount) in enumerate(items):
        ry = table_top - header_h - (idx + 1) * row_h + 3 * mm

        # 偶数行に背景
        if idx % 2 == 0:
            c.setFillColor(COLOR_LIGHT_BG)
            c.rect(28 * mm, ry - 3 * mm, WIDTH - 56 * mm, row_h, fill=1, stroke=0)

        c.setFillColor(COLOR_TEXT)
        c.drawString(34 * mm, ry, no)
        c.drawString(44 * mm, ry, name)
        c.drawCentredString(125 * mm, ry, qty)
        c.drawRightString(164 * mm, ry, '¥ ' + price)
        c.drawRightString(WIDTH - 34 * mm, ry, '¥ ' + amount)

    # テーブル下線
    line_y = table_top - header_h - len(items) * row_h
    c.setStrokeColor(COLOR_BORDER)
    c.setLineWidth(0.5)
    c.line(28 * mm, line_y, WIDTH - 28 * mm, line_y)

    # ── 小計・合計 ──
    summary_y = line_y - 8 * mm
    c.setFont(FONT_GOTHIC, 9)
    c.setFillColor(COLOR_SUBTLE)
    c.drawRightString(152 * mm, summary_y, '小計')
    c.setFillColor(COLOR_TEXT)
    c.drawRightString(WIDTH - 34 * mm, summary_y, '¥ 55,000')

    summary_y -= 7 * mm
    c.setFillColor(COLOR_SUBTLE)
    c.drawRightString(152 * mm, summary_y, '消費税（税込のため）')
    c.setFillColor(COLOR_TEXT)
    c.drawRightString(WIDTH - 34 * mm, summary_y, '-')

    summary_y -= 3 * mm
    c.setStrokeColor(COLOR_PRIMARY)
    c.setLineWidth(1.5)
    c.line(120 * mm, summary_y, WIDTH - 28 * mm, summary_y)

    summary_y -= 7 * mm
    c.setFont(FONT_GOTHIC, 11)
    c.setFillColor(COLOR_PRIMARY)
    c.drawRightString(152 * mm, summary_y, '合計（税込）')
    c.drawRightString(WIDTH - 34 * mm, summary_y, '¥ 55,000')

    # ── 振込先 ──
    bank_y = summary_y - 20 * mm

    # ボックス
    bank_box_h = 32 * mm
    c.setFillColor(COLOR_LIGHT_BG)
    c.setStrokeColor(COLOR_BORDER)
    c.setLineWidth(0.5)
    c.roundRect(28 * mm, bank_y - bank_box_h + 8 * mm, WIDTH - 56 * mm, bank_box_h, 2 * mm, fill=1, stroke=1)

    c.setFont(FONT_GOTHIC, 10)
    c.setFillColor(COLOR_PRIMARY)
    c.drawString(34 * mm, bank_y, 'お振込先')

    c.setFont(FONT_GOTHIC, 9)
    c.setFillColor(COLOR_TEXT)
    bank_info = [
        ('銀行名', '三菱UFJ銀行'),
        ('支店名', '新宿通り支店'),
        ('口座種別', '普通'),
        ('口座番号', '0300027'),
        ('口座名義', 'カツマタ カイト'),
    ]

    by = bank_y - 7 * mm
    for label, value in bank_info:
        c.setFillColor(COLOR_SUBTLE)
        c.drawString(38 * mm, by, label)
        c.setFillColor(COLOR_TEXT)
        c.drawString(65 * mm, by, value)
        by -= 5 * mm

    # ── 発行者情報（右下） ──
    issuer_y = bank_y - bank_box_h - 12 * mm
    c.setFont(FONT_GOTHIC, 10)
    c.setFillColor(COLOR_PRIMARY)
    c.drawRightString(WIDTH - 28 * mm, issuer_y, '勝又 海斗')
    c.setFont(FONT_GOTHIC, 8)
    c.setFillColor(COLOR_SUBTLE)
    c.drawRightString(WIDTH - 28 * mm, issuer_y - 6 * mm, '〒151-0051')
    c.drawRightString(WIDTH - 28 * mm, issuer_y - 12 * mm, '東京都渋谷区千駄ヶ谷5-16-10-1105')

    # ── フッターライン ──
    c.setStrokeColor(COLOR_ACCENT)
    c.setLineWidth(1)
    c.line(25 * mm, 18 * mm, WIDTH - 25 * mm, 18 * mm)

    c.setFont(FONT_GOTHIC, 7)
    c.setFillColor(COLOR_SUBTLE)
    c.drawCentredString(WIDTH / 2, 13 * mm, 'お振込手数料はお客様のご負担にてお願いいたします。')


# PDF生成
c = canvas.Canvas(OUTPUT, pagesize=A4)
c.setTitle('請求書 - 株式会社MerryReiz')
c.setAuthor('勝又海斗')
draw_invoice(c)
c.showPage()
c.save()
print(f'PDF生成完了: {OUTPUT}')
