#!/usr/bin/env python3
"""
GVA法人登記 役員変更（就任）書類一式ジェネレーター

使い方:
  python3 generate_officer_change.py --config config.json
  python3 generate_officer_change.py  # インタラクティブモード（未実装）

config.json の例は config_example.json を参照。
"""

import json
import os
import sys
import math
from datetime import date

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont

# ── フォント登録 ──
pdfmetrics.registerFont(UnicodeCIDFont('HeiseiMin-W3'))
pdfmetrics.registerFont(UnicodeCIDFont('HeiseiKakuGo-W5'))

W, H = A4
MARGIN_LEFT = 60
MARGIN_RIGHT = W - 60
CONTENT_LEFT = 80


# ── ユーティリティ ──

def to_wareki(iso_date: str) -> str:
    """ISO日付 → 令和表記。例: 2026-01-15 → 令和８年１月１５日"""
    y, m, d = map(int, iso_date.split('-'))
    reiwa_year = y - 2018
    return f'令和{_zen(reiwa_year)}年{_zen(m)}月{_zen(d)}日'


def _zen(n: int) -> str:
    """半角数字 → 全角数字"""
    return str(n).translate(str.maketrans('0123456789', '０１２３４５６７８９'))


def _zen_comma(n: int) -> str:
    """半角数字 → カンマ付き全角数字"""
    s = f'{n:,}'
    return s.translate(str.maketrans('0123456789,', '０１２３４５６７８９，'))


def draw_seal_circle(c, x, y, r=25):
    c.setDash(3, 3)
    c.setLineWidth(0.5)
    c.circle(x, y, r)
    c.setDash()
    c.setLineWidth(1)


def draw_seal_with_label(c, x, y, label, r=25):
    draw_seal_circle(c, x, y, r)
    c.setFont('HeiseiMin-W3', 8)
    c.drawCentredString(x, y - r - 12, label)


# ── 設定読み込み ──

def load_config(path: str) -> dict:
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


# ── 各書類の生成 ──

def gen_01_torishimariyaku_ketteisho(cfg, out_dir):
    """01. 取締役決定書（招集決定等）"""
    fp = os.path.join(out_dir, '01.取締役決定書（招集決定等）.pdf')
    c = canvas.Canvas(fp, pagesize=A4)

    decision_date = to_wareki(cfg['decision_date'])
    rep = cfg['current_representative']

    y = H - 60
    c.setFont('HeiseiKakuGo-W5', 20)
    c.drawCentredString(W / 2, y, '取締役決定書')

    y -= 50
    c.setFont('HeiseiMin-W3', 10)
    ld = 18
    c.drawString(MARGIN_LEFT, y, f'{decision_date}、当会社の取締役は、下記の議案について決定した。')
    y -= ld * 2

    c.setFont('HeiseiKakuGo-W5', 10)
    c.drawString(MARGIN_LEFT, y, '第１号議案　　会社法第３１９条に基づく株主総会決議の省略の件')
    y -= ld * 2
    c.setFont('HeiseiMin-W3', 10)
    c.drawCentredString(W / 2, y, '記')
    y -= ld * 2

    c.drawString(MARGIN_LEFT, y, '株主総会の決議を省略するため、株主総会の目的たる事項について、下記のとおり提案すること。')
    y -= ld * 2

    # 議案リスト
    proposals = cfg.get('proposals', ['取締役選任の件', '代表取締役選定の件'])
    for i, p in enumerate(proposals, 1):
        c.drawCentredString(W / 2, y, f'第{_zen(i)}号議案　{p}')
        y -= ld

    y -= ld
    c.drawRightString(MARGIN_RIGHT, y, '以上')
    y -= ld * 2

    c.drawString(MARGIN_LEFT, y, '上記の決定を明確にするため、この決定書を作成し、取締役は次に記名押印する。')
    y -= ld * 2

    c.drawString(MARGIN_LEFT, y, decision_date)
    y -= ld * 2

    company_full = cfg['company_name_full']
    c.drawString(MARGIN_LEFT, y, f'{company_full}　取締役決定書')
    y -= ld * 3

    draw_seal_with_label(c, 350, y + 15, '認印')
    draw_seal_with_label(c, 440, y + 15, '認印')

    c.drawString(CONTENT_LEFT, y, f'代表取締役　{rep["name"]}')

    c.showPage()
    c.save()
    print(f'  Created: {fp}')


def gen_02_teian(cfg, out_dir):
    """02. 提案書"""
    fp = os.path.join(out_dir, '02.提案書.pdf')
    c = canvas.Canvas(fp, pagesize=A4)
    ld = 18

    decision_date = to_wareki(cfg['decision_date'])
    deadline = to_wareki(cfg['consent_deadline'])
    rep = cfg['current_representative']
    company = cfg['company_name_full']
    address = cfg['company_address']

    # --- Page 1: 案内文 ---
    y = H - 60
    c.setFont('HeiseiMin-W3', 10)
    c.drawRightString(MARGIN_RIGHT, y, decision_date)
    y -= 30
    c.drawString(MARGIN_LEFT, y, '株　主　各　位')
    y -= 40
    c.drawRightString(MARGIN_RIGHT, y, address)
    y -= ld
    c.drawRightString(MARGIN_RIGHT, y, company)
    y -= ld
    c.drawRightString(MARGIN_RIGHT, y, f'代表取締役　{rep["name"]}')

    y -= 60
    c.setFont('HeiseiKakuGo-W5', 18)
    c.drawCentredString(W / 2, y, '株主総会決議の省略について')

    y -= 50
    c.setFont('HeiseiMin-W3', 10)
    lines = [
        '拝啓　ますますご清栄のこととお喜び申し上げます。',
        '',
        '　さて、この度、当会社は、会社法に規定する事項及び組織、運営、管理その他の事項に',
        '関して、株主総会へ議案を上程する必要がございます。',
        '',
        '　そのため臨時株主総会を開催する必要がありますが、当該株主総会につきましては、',
        '会社法第３１９条の規定に基づき、株主総会を開催することなく、書面による提案事項の',
        '決議をいたしたいと存じます。つきましては、「ご提案の内容」をご高覧いただき、提案',
        '内容にご異議のない株主の方は『同意書』に住所・氏名をご記入して頂き、ご捺印のうえ、',
        f'{deadline}までにご提出くださいますようお願い申し上げます。',
        '',
        '　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　敬具',
    ]
    for line in lines:
        c.drawString(MARGIN_LEFT, y, line)
        y -= ld

    c.showPage()

    # --- Page 2: ご提案の内容 ---
    y = H - 80
    c.setFont('HeiseiKakuGo-W5', 14)
    c.drawCentredString(W / 2, y, '「ご提案の内容」')

    y -= 50
    # 第1号議案: 取締役選任
    c.setFont('HeiseiKakuGo-W5', 11)
    c.drawString(MARGIN_LEFT, y, '第１号議案　取締役選任の件')
    y -= 25
    c.setFont('HeiseiMin-W3', 10)
    c.drawString(MARGIN_LEFT, y, '当会社は新たに取締役を選任する必要があるため、以下の候補者の選任をお願いする')
    y -= ld
    c.drawString(MARGIN_LEFT, y, 'ものであります。')
    y -= 25

    for officer in cfg['new_officers']:
        if officer['role'] == '取締役' or officer['role'] == '取締役及び代表取締役':
            appointment_date = to_wareki(officer['appointment_date'])
            c.drawString(CONTENT_LEFT, y, f'取締役候補者：{officer["name"]}（就任日：{appointment_date}）')
            y -= ld

    # 第2号議案: 代表取締役選定（代表取締役がいる場合のみ）
    new_reps = [o for o in cfg['new_officers'] if '代表取締役' in o['role']]
    if new_reps or cfg.get('reappoint_representative'):
        y -= 20
        c.setFont('HeiseiKakuGo-W5', 11)
        c.drawString(MARGIN_LEFT, y, '第２号議案　代表取締役選定の件')
        y -= 25
        c.setFont('HeiseiMin-W3', 10)
        c.drawString(MARGIN_LEFT, y, '当会社は代表取締役を選定する必要があるため、以下の候補者の選定をお願いする')
        y -= ld
        c.drawString(MARGIN_LEFT, y, 'ものであります。')
        y -= 25

        if cfg.get('reappoint_representative'):
            c.drawString(CONTENT_LEFT, y, f'代表取締役：{rep["name"]}')
            y -= ld

        for officer in new_reps:
            appointment_date = to_wareki(officer['appointment_date'])
            c.drawString(CONTENT_LEFT, y, f'代表取締役候補者：{officer["name"]}（就任日：{appointment_date}）')
            y -= ld

    c.showPage()
    c.save()
    print(f'  Created: {fp}')


def gen_03_doui(cfg, out_dir):
    """03. 同意書（株主ごとに1枚）"""
    deadline = to_wareki(cfg['consent_deadline'])
    decision_date = to_wareki(cfg['decision_date'])
    company = cfg['company_name_full']
    proposals = cfg.get('proposals', ['取締役選任の件', '代表取締役選定の件'])

    for i, sh in enumerate(cfg['shareholders'], 1):
        fp = os.path.join(out_dir, f'03.同意書({i}).pdf')
        c = canvas.Canvas(fp, pagesize=A4)
        ld = 18

        y = H - 60
        c.setFont('HeiseiKakuGo-W5', 20)
        c.drawCentredString(W / 2, y, '同意書')

        y -= 50
        c.setFont('HeiseiMin-W3', 10)
        c.drawString(MARGIN_LEFT, y, f'私は、{decision_date}付「株主総会決議の省略について」に記載されている株主総会の目的事')
        y -= ld
        c.drawString(MARGIN_LEFT, y, '項である下記議案について、ここに同意の意思を表示いたします。')
        y -= ld * 2

        for j, p in enumerate(proposals, 1):
            c.drawString(MARGIN_LEFT, y, f'第{_zen(j)}号議案　{p}')
            y -= ld

        y -= ld
        c.drawString(MARGIN_LEFT, y, deadline)
        y -= ld * 2

        c.drawString(CONTENT_LEFT, y, f'住所　　{sh["address"]}')
        y -= ld * 2
        c.drawString(CONTENT_LEFT, y, f'氏名　　{sh["name"]}')

        draw_seal_with_label(c, MARGIN_RIGHT - 30, y + 10, '認印')

        y -= ld * 2
        c.drawString(MARGIN_LEFT, y, f'{company}　御中')

        c.showPage()
        c.save()
        print(f'  Created: {fp}')


def gen_04_gijiroku(cfg, out_dir):
    """04. 株主総会議事録（みなし決議）"""
    fp = os.path.join(out_dir, '04.★株主総会議事録（みなし）.pdf')
    c = canvas.Canvas(fp, pagesize=A4)
    ld = 18

    decision_date = to_wareki(cfg['decision_date'])
    resolution_date = to_wareki(cfg['consent_deadline'])
    rep = cfg['current_representative']
    company = cfg['company_name_full']

    total_shareholders = len(cfg['shareholders'])
    total_votes = sum(s['shares'] for s in cfg['shareholders'])

    y = H - 60
    c.setFont('HeiseiKakuGo-W5', 20)
    c.drawCentredString(W / 2, y, '臨時株主総会議事録')

    y -= 50
    c.setFont('HeiseiMin-W3', 10)
    lines = [
        f'　取締役　{rep["name"]}は{decision_date}、会社法第３１９条の規定に基づき、別添「株主',
        '総会決議の省略について」のとおり株主に対し提案を行った。',
        '',
        f'　{resolution_date}までに全株主から、当該提案につき同意した旨の同意書が当会社に',
        '到達したため、当該議案は下記のとおり決議あったものとしてみなされた。',
    ]
    for line in lines:
        c.drawString(MARGIN_LEFT, y, line)
        y -= ld

    y -= 10
    items = [
        (f'１．株主総会の決議があったものとみなされた日', f'　　{resolution_date}'),
        (f'２．株主総会の決議があったものとみなされた事項の提案者', f'　　取締役　{rep["name"]}'),
        (f'３．議決権を行使することができる株主の総数　　　　　　　　　　　　　　{_zen(total_shareholders)}名',
         f'　　議決権を行使することができる株主の議決権の数　　　　　　　　　{_zen(total_votes)}株'),
        (f'４．本議事録の作成に係る職務を行った取締役の氏名', f'　　取締役　{rep["name"]}'),
    ]
    for header, detail in items:
        c.drawString(MARGIN_LEFT, y, header)
        y -= ld
        c.drawString(MARGIN_LEFT, y, detail)
        y -= ld + 8

    c.drawString(MARGIN_LEFT, y, '５．株主総会の決議があったものとみなされた事項の内容')
    y -= ld + 10

    # 第1号議案
    c.setFont('HeiseiKakuGo-W5', 10)
    c.drawString(MARGIN_LEFT, y, '第１号議案　取締役選任の件')
    y -= ld
    c.setFont('HeiseiMin-W3', 10)
    c.drawString(MARGIN_LEFT, y, '新たに取締役を選任する必要があるため、以下の候補者を選任すること。')
    y -= ld

    for officer in cfg['new_officers']:
        if officer['role'] == '取締役' or officer['role'] == '取締役及び代表取締役':
            ad = to_wareki(officer['appointment_date'])
            c.drawString(CONTENT_LEFT, y, f'取締役候補者：{officer["name"]}（就任日：{ad}）')
            y -= ld

    y -= 10

    # 第2号議案
    new_reps = [o for o in cfg['new_officers'] if '代表取締役' in o['role']]
    if new_reps or cfg.get('reappoint_representative'):
        c.setFont('HeiseiKakuGo-W5', 10)
        c.drawString(MARGIN_LEFT, y, '第２号議案　代表取締役選定の件')
        y -= ld
        c.setFont('HeiseiMin-W3', 10)
        c.drawString(MARGIN_LEFT, y, '代表取締役を選定する必要があるため、以下の候補者を選定すること。')
        y -= ld

        if cfg.get('reappoint_representative'):
            c.drawString(CONTENT_LEFT, y, f'代表取締役：{rep["name"]}')
            y -= ld

        for officer in new_reps:
            ad = to_wareki(officer['appointment_date'])
            c.drawString(CONTENT_LEFT, y, f'代表取締役候補者：{officer["name"]}（就任日：{ad}）')
            y -= ld

    y -= 20
    c.drawString(MARGIN_LEFT, y, '　以上のとおり、株主総会の決議の省略を行ったので、当該事項を明確にするため、')
    y -= ld
    c.drawString(MARGIN_LEFT, y, 'この議事録を作成する。')
    y -= 30
    c.drawString(MARGIN_LEFT, y, resolution_date)
    y -= 25
    c.drawString(MARGIN_LEFT, y, f'{company}　臨時株主総会')
    y -= 50
    c.drawString(CONTENT_LEFT, y, '議事録作成者')
    y -= ld
    c.drawString(CONTENT_LEFT, y, f'取締役　{rep["name"]}')

    draw_seal_with_label(c, 380, y + 10, '会社実印')
    draw_seal_with_label(c, 470, y + 10, '会社実印')

    c.showPage()
    c.save()
    print(f'  Created: {fp}')


def gen_05_kabunushi_list(cfg, out_dir):
    """05. 株主リスト"""
    fp = os.path.join(out_dir, '05.★株主リスト.pdf')
    c = canvas.Canvas(fp, pagesize=A4)

    resolution_date = to_wareki(cfg['consent_deadline'])
    cert_date = to_wareki(cfg['certification_date'])
    rep = cfg['current_representative']
    company = cfg['company_name_full']
    shareholders = cfg['shareholders']
    total_shares = sum(s['shares'] for s in shareholders)

    y = H - 60
    c.setFont('HeiseiKakuGo-W5', 20)
    c.drawCentredString(W / 2, y, '証　　明　　書（株主リスト）')

    y -= 40
    c.setFont('HeiseiMin-W3', 10)
    c.drawString(MARGIN_LEFT, y, '次の対象に関する商業登記規則６１条２項又は３項の株主は次のとおりであることを証明する。')

    # 対象テーブル
    y -= 40
    tl = MARGIN_LEFT + 10
    tr = MARGIN_RIGHT - 10
    tw = tr - tl
    label_w = 30
    fl_w = 140
    fv_w = tw - label_w - fl_w
    rh = 25

    c.setLineWidth(0.5)
    c.setFont('HeiseiMin-W3', 9)

    # row: 対象 | 株主総会等又は... | 株主総会
    c.rect(tl, y - rh, label_w, rh)
    c.rect(tl + label_w, y - rh, fl_w, rh)
    c.rect(tl + label_w + fl_w, y - rh, fv_w, rh)
    c.drawString(tl + 5, y - 8, '対')
    c.drawString(tl + 5, y - 20, '象')
    c.drawString(tl + label_w + 5, y - 16, '株主総会等又は')
    c.drawCentredString(tl + label_w + fl_w + fv_w / 2, y - 16, '株主総会')
    y -= rh

    c.rect(tl + label_w, y - rh, fl_w, rh)
    c.rect(tl + label_w + fl_w, y - rh, fv_w, rh)
    c.drawString(tl + label_w + 5, y - 16, '株主総会の同意等の別')
    y -= rh

    c.rect(tl + label_w, y - rh, fl_w, rh)
    c.rect(tl + label_w + fl_w, y - rh, fv_w, rh)
    c.drawString(tl + label_w + 5, y - 16, '上記の年月日')
    c.drawCentredString(tl + label_w + fl_w + fv_w / 2, y - 16, resolution_date)
    y -= rh

    c.rect(tl + label_w, y - rh, fl_w, rh)
    c.rect(tl + label_w + fl_w, y - rh, fv_w, rh)
    c.drawString(tl + label_w + 5, y - 16, '上記のうちの議案')
    c.drawCentredString(tl + label_w + fl_w + fv_w / 2, y - 16, '全議案')
    y -= rh

    # 株主テーブル
    y -= 15
    cols = [30, 100, 150, 60, 60, 70]
    headers = ['', '氏名又は名称', '住所', '株式数（株）', '議決権数', '議決権数の割合']
    hh = 25

    x = tl
    c.setFont('HeiseiMin-W3', 8)
    for w, ht in zip(cols, headers):
        c.rect(x, y - hh, w, hh)
        c.drawCentredString(x + w / 2, y - 16, ht)
        x += w
    y -= hh

    # 株主行
    for idx, sh in enumerate(shareholders, 1):
        drh = 45
        x = tl
        for w in cols:
            c.rect(x, y - drh, w, drh)
            x += w

        c.setFont('HeiseiMin-W3', 9)
        c.drawCentredString(tl + cols[0] / 2, y - 28, _zen(idx))
        c.drawCentredString(tl + cols[0] + cols[1] / 2, y - 28, sh['name'])

        # 住所（長い場合は折り返し）
        addr = sh['address']
        addr_x = tl + cols[0] + cols[1] + 5
        if len(addr) > 20:
            c.drawString(addr_x, y - 20, addr[:20])
            c.drawString(addr_x, y - 34, addr[20:])
        else:
            c.drawString(addr_x, y - 28, addr)

        shares_x = tl + cols[0] + cols[1] + cols[2]
        pct = sh['shares'] / total_shares * 100
        pct_str = f'{pct:.1f}％' if pct != int(pct) else f'{int(pct)}％'

        c.drawCentredString(shares_x + cols[3] / 2, y - 28, _zen(sh['shares']))
        c.drawCentredString(shares_x + cols[3] + cols[4] / 2, y - 28, _zen(sh['shares']))
        c.drawCentredString(shares_x + cols[3] + cols[4] + cols[5] / 2, y - 28, pct_str)

        y -= drh

    # 合計行
    trh = 25
    total_lw = cols[0] + cols[1] + cols[2]
    x = tl
    c.rect(x, y - trh, total_lw, trh)
    c.rect(x + total_lw, y - trh, cols[3], trh)
    c.rect(x + total_lw + cols[3], y - trh, cols[4], trh)
    c.rect(x + total_lw + cols[3] + cols[4], y - trh, cols[5], trh)

    c.drawRightString(x + total_lw - 10, y - 16, '合計')
    c.drawCentredString(x + total_lw + cols[3] / 2, y - 16, _zen(total_shares))
    c.drawCentredString(x + total_lw + cols[3] + cols[4] + cols[5] / 2, y - 16, '１００％')
    y -= trh

    c.rect(x, y - trh, total_lw, trh)
    c.rect(x + total_lw, y - trh, cols[3], trh)
    c.rect(x + total_lw + cols[3], y - trh, cols[4] + cols[5], trh)
    c.drawRightString(x + total_lw - 10, y - 16, '総議決権数')
    c.drawCentredString(x + total_lw + cols[3] / 2, y - 16, _zen(total_shares))
    y -= trh

    # 証明書情報
    y -= 30
    il = MARGIN_LEFT + 60
    iv = MARGIN_LEFT + 200
    c.setFont('HeiseiMin-W3', 10)
    c.drawString(il, y, '証明書作成年月日')
    c.drawString(iv, y, cert_date)
    y -= 25
    c.drawString(il, y, '商号')
    c.drawString(iv, y, company)
    y -= 25
    c.drawString(il, y, '証明書作成者')
    c.drawString(iv, y, f'代表取締役　{rep["name"]}')

    c.showPage()
    c.save()
    print(f'  Created: {fp}')


def gen_06_shunin_shodaku(cfg, out_dir):
    """06. 就任承諾書（新任役員ごとに1枚）"""
    resolution_date = to_wareki(cfg['consent_deadline'])
    company = cfg['company_name_full']

    for i, officer in enumerate(cfg['new_officers'], 1):
        fp = os.path.join(out_dir, f'06.★就任承諾書({i}).pdf')
        c = canvas.Canvas(fp, pagesize=A4)
        ld = 18

        y = H - 60
        c.setFont('HeiseiKakuGo-W5', 20)
        c.drawCentredString(W / 2, y, '就　任　承　諾　書')

        y -= 50
        c.setFont('HeiseiMin-W3', 10)

        if '代表取締役' in officer['role']:
            c.drawString(MARGIN_LEFT, y, f'私は、{resolution_date}付け株主総会において、取締役及び代表取締役に選任・選定されました')
        else:
            c.drawString(MARGIN_LEFT, y, f'私は、{resolution_date}付け株主総会において、取締役に選任されましたので、その就任を承諾')
        y -= ld
        if '代表取締役' in officer['role']:
            c.drawString(MARGIN_LEFT, y, 'ので、その就任を承諾致します。')
        else:
            c.drawString(MARGIN_LEFT, y, '致します。')

        y -= ld * 2
        ad = to_wareki(officer['appointment_date'])
        c.drawString(MARGIN_LEFT, y, ad)

        y -= ld * 2
        c.drawString(MARGIN_LEFT, y, f'{company}　御中')

        draw_seal_with_label(c, 350, y + 30, '個人実印')
        draw_seal_with_label(c, 440, y + 30, '個人実印')

        y -= ld * 2
        c.drawString(MARGIN_LEFT, y, f'住所　　{officer["address"]}')
        y -= ld * 2
        c.drawString(MARGIN_LEFT, y, f'氏名　　{officer["name"]}')

        c.showPage()
        c.save()
        print(f'  Created: {fp}')


def gen_07_shinseisho(cfg, out_dir):
    """07. 登記申請書"""
    fp = os.path.join(out_dir, '07.★登記申請書.pdf')
    c = canvas.Canvas(fp, pagesize=A4)
    ld = 18

    rep = cfg['current_representative']
    company = cfg['company_name_full']
    furigana = cfg.get('company_furigana', '')
    address = cfg['company_address']
    corp_number = cfg['corporate_number']
    tax = cfg.get('registration_tax', 10000)
    jurisdiction = cfg['jurisdiction']
    officer_count = len(cfg['new_officers'])

    # --- Page 1: 申請書本体 ---
    y = H - 60
    c.setFont('HeiseiKakuGo-W5', 20)
    c.drawCentredString(W / 2, y, '株式会社変更登記申請書')

    y -= 50
    c.setFont('HeiseiMin-W3', 10)

    c.drawString(MARGIN_LEFT, y, '１．会社法人等番号')
    y -= ld
    c.drawString(MARGIN_LEFT, y, f'　　{corp_number}')
    y -= ld

    if furigana:
        c.setFont('HeiseiMin-W3', 7)
        c.drawString(MARGIN_LEFT + 85, y + 12, f'フリガナ　{furigana}')
    c.setFont('HeiseiMin-W3', 10)
    c.drawString(MARGIN_LEFT, y, f'１．商号　{company}')
    y -= ld
    c.drawString(MARGIN_LEFT, y, f'１．本店　{address}')
    y -= ld
    c.drawString(MARGIN_LEFT, y, '１．登記の事由')
    y -= ld
    c.drawString(CONTENT_LEFT, y, '取締役及び代表取締役の変更')
    y -= ld + 5
    c.drawString(MARGIN_LEFT, y, '１．登記すべき事項')
    y -= ld
    c.drawString(CONTENT_LEFT, y, '別紙のとおり')
    y -= ld + 5
    c.drawString(MARGIN_LEFT, y, f'１．登録免許税　　　　　金　{_zen_comma(tax)}円')
    y -= ld + 5
    c.drawString(MARGIN_LEFT, y, '１．添付書類')
    y -= ld + 5

    attachments = [
        ('株主総会議事録', '１通'),
        ('株主リスト', '１通'),
        ('就任承諾を証する書面', f'{_zen(officer_count)}通'),
        ('印鑑証明書', f'{_zen(officer_count)}通'),
    ]
    for name, count in attachments:
        c.drawString(CONTENT_LEFT + 20, y, name)
        c.drawString(CONTENT_LEFT + 200, y, count)
        y -= ld

    y -= 10
    c.drawString(MARGIN_LEFT, y, '上記のとおり，登記の申請をします。')
    y -= 30
    c.drawString(CONTENT_LEFT, y, '年　　月　　日')

    y -= 30
    c.drawString(MARGIN_LEFT, y, '申請人')
    draw_seal_with_label(c, 380, y, '会社実印')
    draw_seal_with_label(c, 470, y, '会社実印')

    y -= 30
    # 住所を折り返し
    if len(address) > 25:
        c.drawString(MARGIN_LEFT, y, address[:25])
        y -= ld
        c.drawString(MARGIN_LEFT, y, address[25:])
    else:
        c.drawString(MARGIN_LEFT, y, address)
    y -= 20
    c.drawString(MARGIN_LEFT, y, company)
    y -= 25
    c.drawString(MARGIN_LEFT, y, '代表取締役')
    y -= 20
    c.drawString(MARGIN_LEFT, y, rep['address'])
    y -= ld
    c.drawString(MARGIN_LEFT, y, rep['name'])
    y -= 25
    c.drawString(MARGIN_LEFT, y, '連絡先の電話番号')
    y -= ld
    c.drawString(MARGIN_LEFT, y, cfg.get('contact_phone', ''))
    y -= 30
    c.drawString(MARGIN_LEFT, y, f'法務局　　　{jurisdiction}　御中')

    c.showPage()

    # --- Page 2: 収入印紙貼付台紙 ---
    y = H - 60
    c.setFont('HeiseiKakuGo-W5', 14)
    c.drawString(MARGIN_LEFT, y, '収入印紙貼付台紙')
    y -= 25
    c.setFont('HeiseiMin-W3', 9)
    c.drawString(MARGIN_LEFT, y, '※ページの綴り目には会社実印の契印（押印）をお願いします。')
    draw_seal_circle(c, 30, H - 120, 25)

    box_x = W / 2 - 40
    box_y = H / 2 + 20
    c.setDash(3, 3)
    c.rect(box_x, box_y, 80, 50)
    c.setDash()
    c.setFont('HeiseiMin-W3', 11)
    c.drawCentredString(W / 2, box_y + 32, '収　入')
    c.drawCentredString(W / 2, box_y + 14, '印　紙')

    yy = box_y - 40
    c.setFont('HeiseiMin-W3', 10)
    c.drawCentredString(W / 2, yy, f'金{_zen_comma(tax)}円分の収入印紙を貼付してください。')
    yy -= ld
    c.drawCentredString(W / 2, yy, 'このとき、印紙に消印（押印）をしないでください。')
    yy -= ld
    c.drawCentredString(W / 2, yy, '印紙に消印（押印）をしていますと納付したことになりません。')

    c.showPage()

    # --- Page 3: 別紙「登記すべき事項」 ---
    y = H - 60
    c.setFont('HeiseiMin-W3', 9)
    c.drawString(MARGIN_LEFT, y, '※この別紙「登記すべき事項」が複数ページになる場合は、')
    y -= 15
    c.drawString(MARGIN_LEFT, y, '各ページの綴り目にも会社実印の契印（押印）が必要になります。')
    draw_seal_circle(c, 30, H - 90, 25)

    y -= 50
    c.setFont('HeiseiKakuGo-W5', 18)
    c.drawCentredString(W / 2, y, '別紙「登記すべき事項」')

    y -= 50
    c.setFont('HeiseiMin-W3', 11)

    for officer in cfg['new_officers']:
        # 取締役として
        c.drawString(MARGIN_LEFT, y, '「役員に関する事項」')
        y -= 20
        c.drawString(MARGIN_LEFT, y, '「資格」　取締役')
        y -= 22
        c.drawString(MARGIN_LEFT, y, f'「氏名」　{officer["name"]}')
        y -= 20
        ad = to_wareki(officer['appointment_date'])
        c.drawString(MARGIN_LEFT, y, f'「原因年月日」　{ad}就任')
        y -= 35

        # 代表取締役の場合は追加
        if '代表取締役' in officer['role']:
            c.drawString(MARGIN_LEFT, y, '「役員に関する事項」')
            y -= 20
            c.drawString(MARGIN_LEFT, y, '「資格」　代表取締役')
            y -= 22
            c.drawString(MARGIN_LEFT, y, f'「住所」　{officer["address"]}')
            y -= 20
            c.drawString(MARGIN_LEFT, y, f'「氏名」　{officer["name"]}')
            y -= 20
            c.drawString(MARGIN_LEFT, y, f'「原因年月日」　{ad}就任')
            y -= 35

    c.showPage()
    c.save()
    print(f'  Created: {fp}')


def gen_08_hitsuyou(cfg, out_dir):
    """08. 必要書類のご案内"""
    fp = os.path.join(out_dir, '08.必要書類のご案内.pdf')
    c = canvas.Canvas(fp, pagesize=A4)
    ld = 18

    y = H - 70
    c.setFont('HeiseiKakuGo-W5', 20)
    c.drawCentredString(W / 2, y, '必要書類のご案内')

    y -= 50
    c.setFont('HeiseiMin-W3', 10)
    c.drawString(MARGIN_LEFT, y, '今回の登記手続きには、以下の書類が必要となります。登記申請の前に必ず取得の上、')
    y -= ld
    c.drawString(MARGIN_LEFT, y, '登記申請書と一緒に法務局へ提出してください。')
    y -= 40

    for i, officer in enumerate(cfg['new_officers'], 1):
        c.drawString(MARGIN_LEFT, y, f'必要書類{_zen(i)}　｜　{officer["name"]}様の印鑑証明書')
        y -= ld * 2

    # 注意事項
    y -= 20
    box_top = y + 15
    box_bottom = y - 120
    c.setLineWidth(0.5)
    c.rect(MARGIN_LEFT + 20, box_bottom, MARGIN_RIGHT - MARGIN_LEFT - 40, box_top - box_bottom)

    c.setFont('HeiseiMin-W3', 10)
    c.drawString(MARGIN_LEFT + 30, y, '※印鑑証明書に関する注意点')
    y -= 20
    c.drawString(MARGIN_LEFT + 40, y, '住民登録している市区町村役場で発行される印鑑証明書になります。')
    y -= ld
    c.drawString(MARGIN_LEFT + 40, y, '発行日から３ヶ月以内のものをご準備ください。')
    y -= 25
    c.drawString(MARGIN_LEFT + 30, y, '※日本に住所がない海外居住者の場合')
    y -= 20
    c.drawString(MARGIN_LEFT + 40, y, '日本大使館・領事館で発行される署名証明書・在留証明書をご準備ください。')
    y -= 25
    c.drawString(MARGIN_LEFT + 30, y, '※日本に住所がない外国人役員の場合')
    y -= 20
    c.drawString(MARGIN_LEFT + 40, y, '本人の国籍のある国や居住する国の役所や行政機関、公証人が発行する')
    y -= ld
    c.drawString(MARGIN_LEFT + 40, y, 'サイン証明書や宣誓供述書を準備する必要があります。')

    c.showPage()
    c.save()
    print(f'  Created: {fp}')


# ── メイン ──

def generate_all(config_path: str):
    cfg = load_config(config_path)

    out_dir = cfg.get('output_dir', os.path.join(os.path.dirname(config_path), 'output'))
    os.makedirs(out_dir, exist_ok=True)

    print(f'\n=== 役員変更（就任）登記書類一式を生成 ===')
    print(f'会社名: {cfg["company_name_full"]}')
    print(f'出力先: {out_dir}\n')

    gen_01_torishimariyaku_ketteisho(cfg, out_dir)
    gen_02_teian(cfg, out_dir)
    gen_03_doui(cfg, out_dir)
    gen_04_gijiroku(cfg, out_dir)
    gen_05_kabunushi_list(cfg, out_dir)
    gen_06_shunin_shodaku(cfg, out_dir)
    gen_07_shinseisho(cfg, out_dir)
    gen_08_hitsuyou(cfg, out_dir)

    print(f'\n=== 全{8}書類の生成完了 ===')
    print(f'就任承諾書: {len(cfg["new_officers"])}通')
    print(f'同意書: {len(cfg["shareholders"])}通')


if __name__ == '__main__':
    if len(sys.argv) < 3 or sys.argv[1] != '--config':
        print('Usage: python3 generate_officer_change.py --config config.json')
        sys.exit(1)
    generate_all(sys.argv[2])
