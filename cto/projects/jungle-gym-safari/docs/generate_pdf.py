#!/usr/bin/env python3
"""Jungle Gym Safari 簡易要件定義書 PDF生成スクリプト"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont

pdfmetrics.registerFont(UnicodeCIDFont('HeiseiKakuGo-W5'))
pdfmetrics.registerFont(UnicodeCIDFont('HeiseiMin-W3'))

# Colors
OCEAN_BLUE = HexColor('#4A90A4')
DEEP_NAVY = HexColor('#2C3E50')
SAND = HexColor('#F5F0E8')
LIGHT_SAND = HexColor('#FAF8F4')
CORAL = HexColor('#E8735A')
WARM_GRAY = HexColor('#9B9B9B')
CHARCOAL = HexColor('#333333')
WHITE = HexColor('#FFFFFF')
DRIFTWOOD = HexColor('#C4A882')

JP = 'HeiseiKakuGo-W5'

OUTPUT = '/Users/kaitomain/Desktop/with-AI/cto/projects/jungle-gym-safari/docs/requirements-brief.pdf'


def create_styles():
    s = {}
    s['cover_title'] = ParagraphStyle('CoverTitle', fontName=JP, fontSize=28, leading=36, textColor=DEEP_NAVY, alignment=TA_CENTER, spaceAfter=8*mm)
    s['cover_subtitle'] = ParagraphStyle('CoverSubtitle', fontName=JP, fontSize=14, leading=20, textColor=OCEAN_BLUE, alignment=TA_CENTER, spaceAfter=4*mm)
    s['h1'] = ParagraphStyle('H1', fontName=JP, fontSize=16, leading=22, textColor=DEEP_NAVY, spaceBefore=10*mm, spaceAfter=5*mm)
    s['h2'] = ParagraphStyle('H2', fontName=JP, fontSize=13, leading=18, textColor=OCEAN_BLUE, spaceBefore=6*mm, spaceAfter=3*mm)
    s['h3'] = ParagraphStyle('H3', fontName=JP, fontSize=11, leading=16, textColor=DEEP_NAVY, spaceBefore=4*mm, spaceAfter=2*mm)
    s['body'] = ParagraphStyle('Body', fontName=JP, fontSize=9, leading=15, textColor=CHARCOAL, spaceAfter=2*mm)
    s['body_indent'] = ParagraphStyle('BodyIndent', fontName=JP, fontSize=9, leading=15, textColor=CHARCOAL, spaceAfter=1.5*mm, leftIndent=5*mm)
    s['detail_item'] = ParagraphStyle('DetailItem', fontName=JP, fontSize=9, leading=14, textColor=CHARCOAL, spaceAfter=1*mm, leftIndent=8*mm)
    s['note'] = ParagraphStyle('Note', fontName=JP, fontSize=8, leading=12, textColor=WARM_GRAY, spaceAfter=2*mm, leftIndent=5*mm)
    s['table_header'] = ParagraphStyle('TableHeader', fontName=JP, fontSize=8.5, leading=12, textColor=WHITE)
    s['table_cell'] = ParagraphStyle('TableCell', fontName=JP, fontSize=8.5, leading=13, textColor=CHARCOAL)
    return s


def make_table(headers, rows, col_widths, s):
    header_cells = [Paragraph(h, s['table_header']) for h in headers]
    data = [header_cells]
    for row in rows:
        data.append([Paragraph(str(cell), s['table_cell']) for cell in row])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), OCEAN_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, -1), JP),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#D0D0D0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_SAND]),
    ]))
    return t


def divider():
    return HRFlowable(width="100%", thickness=0.5, color=DRIFTWOOD, spaceBefore=3*mm, spaceAfter=3*mm)


def header_footer(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(OCEAN_BLUE)
    canvas.setLineWidth(2)
    canvas.line(15*mm, h - 12*mm, w - 15*mm, h - 12*mm)
    canvas.setFont(JP, 7)
    canvas.setFillColor(WARM_GRAY)
    canvas.drawString(15*mm, h - 11*mm, 'Jungle Gym Safari | 簡易要件定義書 v1.0')
    canvas.drawRightString(w - 15*mm, h - 11*mm, '機密')
    canvas.setStrokeColor(DRIFTWOOD)
    canvas.setLineWidth(0.5)
    canvas.line(15*mm, 15*mm, w - 15*mm, 15*mm)
    canvas.setFont(JP, 7)
    canvas.setFillColor(WARM_GRAY)
    canvas.drawString(15*mm, 10*mm, 'with-AI株式会社')
    canvas.drawCentredString(w / 2, 10*mm, f'{doc.page}')
    canvas.drawRightString(w - 15*mm, 10*mm, '2026年4月14日')
    canvas.restoreState()


def header_footer_cover(canvas, doc):
    pass


def build_pdf():
    s = create_styles()
    w, h = A4
    cw = w - 30*mm  # content width

    doc = SimpleDocTemplate(OUTPUT, pagesize=A4, leftMargin=15*mm, rightMargin=15*mm, topMargin=18*mm, bottomMargin=20*mm)
    story = []

    # ==================== 表紙 ====================
    story.append(Spacer(1, 40*mm))
    story.append(HRFlowable(width="60%", thickness=2, color=OCEAN_BLUE, spaceAfter=8*mm))
    story.append(Paragraph('Jungle Gym Safari', s['cover_title']))
    story.append(Paragraph('簡易要件定義書 v1.0', s['cover_subtitle']))
    story.append(HRFlowable(width="60%", thickness=2, color=OCEAN_BLUE, spaceBefore=8*mm, spaceAfter=15*mm))
    story.append(Paragraph('オンラインコミュニティプラットフォーム', s['cover_subtitle']))
    story.append(Spacer(1, 20*mm))

    info_data = [
        ['プロジェクト名', 'Jungle Gym Safari'],
        ['クライアント', '株式会社JungleGYM'],
        ['作成者', 'with-AI株式会社（CTO）'],
        ['作成日', '2026年4月14日'],
        ['ステータス', '初版 v1.0'],
    ]
    info_table = Table(info_data, colWidths=[40*mm, 70*mm])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), JP),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (0, -1), OCEAN_BLUE),
        ('TEXTCOLOR', (1, 0), (1, -1), CHARCOAL),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (0, -1), 10),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 30*mm))
    story.append(Paragraph('機密文書', ParagraphStyle('Conf', fontName=JP, fontSize=9, textColor=CORAL, alignment=TA_CENTER)))
    story.append(PageBreak())

    # ==================== 1. プロジェクト概要 ====================
    story.append(Paragraph('1. プロジェクト概要', s['h1']))
    story.append(divider())
    story.append(make_table(
        ['項目', '内容'],
        [
            ['プロジェクト名', 'Jungle Gym Safari'],
            ['サービス種別', 'サブスクリプション型オンラインコミュニティプラットフォーム'],
            ['プラットフォーム', 'Web（レスポンシブ） + モバイルアプリ（iOS / Android）'],
            ['デザインコンセプト', 'ロンハーマン / 西海岸 / California Lifestyle'],
            ['ターゲット', 'ライフスタイル向上に関心のある個人（美容・健康・金融・ビジネス）'],
            ['ローンチ', '2026年8月完成 → 9月1日サービス開始'],
        ],
        [40*mm, cw - 40*mm], s
    ))

    # ==================== 2. 機能一覧と開発フェーズ ====================
    story.append(Paragraph('2. 機能一覧と開発フェーズ', s['h1']))
    story.append(divider())

    story.append(Paragraph('Phase 0: プレローンチ（2026年6月〜8月）', s['h2']))
    story.append(make_table(
        ['#', '機能', '概要', '優先度'],
        [['F-00', 'ウェイティングリスト', 'LP + メール登録フォーム + 自動返信。リード獲得用', '必須（先行）']],
        [12*mm, 35*mm, cw - 77*mm, 30*mm], s
    ))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph('Phase 1: ローンチ必須（2026年9月1日まで）', s['h2']))
    story.append(make_table(
        ['#', '機能', '概要', '優先度'],
        [
            ['F-01', 'アカウント管理', '新規登録（名前・生年月日等）、ログイン、プロフィール管理', '必須'],
            ['F-02', 'サブスクリプション（3プラン）', 'Bronze / Silver / Gold の3段階。プラン別コンテンツアクセス制御', '必須'],
            ['F-03', '決済（サブスク）', 'Stripe Billingによる月額サブスク決済・コンテンツ課金', '必須'],
            ['F-04', '決済（EC）', 'Shopify Payments（クレカ・PayPay対応）による物販・チケット決済', '必須'],
            ['F-05', 'コンテンツ配信', '動画・スライドの掲載。5カテゴリ（美容/トレーニング/金融/健康/スタートアップ）', '必須'],
            ['F-06', 'コンテンツ課金', 'プラン外コンテンツの個別購入機能', '必須'],
            ['F-07', 'ライブ配信', 'YouTube Live活用。アプリ内埋め込み + アーカイブON/OFF + プラン別制限', '必須'],
            ['F-08', 'ECサイト', 'Shopify活用。アプリ内に商品表示、Shopify Checkoutで決済', '必須'],
            ['F-09', 'タイムライン', 'SNS風の投稿フィード（Instagram連携 or 類似UI）', '必須'],
            ['F-10', '会員特典', 'グルメ等の特典掲載 + デジタル会員証による店頭利用', '必須'],
            ['F-11', 'プッシュ通知', 'ユーザー自身がカテゴリ別にON/OFF設定可能', '必須'],
            ['F-12', '管理画面', '会員管理、コンテンツ管理、EC管理、配信管理、売上レポート', '必須'],
            ['F-13', 'LP', 'サービス紹介ページ', '必須'],
        ],
        [12*mm, 35*mm, cw - 77*mm, 30*mm], s
    ))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph('Phase 2: ローンチ後（時期未定）', s['h2']))
    story.append(make_table(
        ['#', '機能', '概要', '優先度'],
        [
            ['F-14', '決済（口座引き落とし）', '銀行口座からの自動引き落とし', '要確認'],
            ['F-15', '不動産仲介連携', '不動産系の会員特典・仲介機能', '要確認'],
            ['F-16', '投げ銭', 'ライブ配信中のスーパーチャット的機能', '要確認'],
            ['F-17', 'オフラインDL', '動画のオフラインダウンロード対応', '要確認'],
        ],
        [12*mm, 35*mm, cw - 77*mm, 30*mm], s
    ))
    story.append(PageBreak())

    # ==================== 3. 機能詳細 ====================
    story.append(Paragraph('3. 機能詳細', s['h1']))
    story.append(divider())

    # F-01
    story.append(Paragraph('F-01: アカウント管理', s['h2']))
    story.append(Paragraph('登録情報（想定）:', s['h3']))
    for item in ['名前（氏名）', '生年月日', 'メールアドレス', 'パスワード', '※ その他取得項目はヒアリングシートで確認']:
        story.append(Paragraph(f'・ {item}', s['detail_item']))
    story.append(Paragraph('ログイン方法:', s['h3']))
    for item in ['メール + パスワード', 'ソーシャルログイン（Apple / Google — 要確認）']:
        story.append(Paragraph(f'・ {item}', s['detail_item']))
    story.append(Paragraph('機能:', s['h3']))
    for item in ['プロフィール編集（アイコン、自己紹介）', 'プラン情報表示', 'デジタル会員証表示']:
        story.append(Paragraph(f'・ {item}', s['detail_item']))

    # F-02
    story.append(Paragraph('F-02: サブスクリプション（3プラン）', s['h2']))
    story.append(make_table(
        ['プラン', 'コンテンツアクセス', '追加課金', '会員特典'],
        [
            ['プラン1（低価格帯）', '5カテゴリから1つ無料で選択', '個別コンテンツ課金', '基本特典のみ'],
            ['プラン2（中価格帯）', '5カテゴリから3つ無料で選択', '個別コンテンツ課金', '中位の会員特典'],
            ['プラン3（高価格帯）', '全5カテゴリ見放題', '追加課金なし', '全特典利用可能'],
        ],
        [30*mm, 42*mm, 42*mm, 42*mm], s
    ))
    story.append(Paragraph('※ プラン名称・価格はクライアント確認待ち', s['note']))

    # F-03
    story.append(Paragraph('F-03: 決済（サブスク・コンテンツ課金 → Stripe）', s['h2']))
    story.append(Paragraph('Stripe Billing:', s['h3']))
    for item in [
        '3プラン（Bronze / Silver / Gold）を月額自動課金',
        'Customer Portalでプラン変更・解約をユーザー自身で操作',
        'Webhookでプラン変更を検知 → アプリ側の権限を即時更新'
    ]:
        story.append(Paragraph(f'・ {item}', s['detail_item']))
    story.append(Paragraph('Stripe Checkout:', s['h3']))
    story.append(Paragraph('・ Bronze/Silverユーザーの追加カテゴリ購入（都度課金）', s['detail_item']))

    # F-04
    story.append(Paragraph('F-04: 決済（EC・チケット → Shopify Payments）', s['h2']))
    for item in [
        'クレジットカード（Visa / Master / AMEX / JCB）',
        'PayPay対応済み',
        '物販・グッズ・イベントチケットの決済はShopify内で完結',
        '自前で決済連携を実装する必要なし'
    ]:
        story.append(Paragraph(f'・ {item}', s['detail_item']))
    story.append(Paragraph('Phase 2:', s['h3']))
    story.append(Paragraph('・ 口座引き落とし（要確認）', s['detail_item']))

    # F-05/06
    story.append(Paragraph('F-05/06: コンテンツ配信・課金', s['h2']))
    story.append(Paragraph('5つのコンテンツカテゴリ:', s['h3']))
    for cat in ['美容 — スキンケア、メイク、ヘアケア', '自宅トレーニング — ワークアウト、食事管理',
                '金融 — 投資、資産運用、マネーリテラシー', '健康 — メンタルヘルス、栄養学、ウェルネス',
                'スタートアップ — 起業、ビジネス戦略']:
        story.append(Paragraph(f'・ {cat}', s['detail_item']))
    story.append(Paragraph('形式:', s['h3']))
    for item in ['動画（メインコンテンツ）', 'スライド / PDF（補助教材）']:
        story.append(Paragraph(f'・ {item}', s['detail_item']))
    story.append(Paragraph('プラン別アクセス:', s['h3']))
    for item in ['各プランで無料アクセスできるカテゴリ数が異なる', '無料枠外のカテゴリは個別課金で解放', 'Goldプランは全カテゴリ無制限']:
        story.append(Paragraph(f'・ {item}', s['detail_item']))

    story.append(PageBreak())

    # F-07
    story.append(Paragraph('F-07: ライブ配信（YouTube Live 活用）', s['h2']))
    story.append(Paragraph('配信フロー:', s['h3']))
    for item in [
        '運営がYouTube Studioでライブ配信を作成（限定公開）',
        '管理画面で配信情報を登録（YouTube動画ID + プラン制限 + アーカイブフラグ）',
        '配信開始 → アプリにプッシュ通知',
        'ユーザーがアプリ内でYouTube Playerを通じて視聴'
    ]:
        story.append(Paragraph(f'・ {item}', s['detail_item']))
    story.append(Paragraph('チャット:', s['h3']))
    story.append(Paragraph('・ YouTube Liveのチャット機能をそのまま利用', s['detail_item']))
    story.append(Paragraph('アーカイブ制御:', s['h3']))
    for item in ['「残す」→ YouTube側でアーカイブ公開 → アプリに表示', '「残さない」→ YouTube側で非公開/削除 → アプリから非表示']:
        story.append(Paragraph(f'・ {item}', s['detail_item']))
    story.append(Paragraph('プラン別制限:', s['h3']))
    story.append(Paragraph('・ 全配信をYouTube「限定公開」で作成。アプリ側でプランチェック → 権限があれば表示', s['detail_item']))
    story.append(Paragraph('有料イベント配信:', s['h3']))
    story.append(Paragraph('・ Shopifyでチケット販売 → 購入者にYouTube限定公開URLを配信', s['detail_item']))

    # F-08
    story.append(Paragraph('F-08: ECサイト（Shopify 活用）', s['h2']))
    story.append(Paragraph('Shopify側（管理画面で操作）:', s['h3']))
    for item in ['商品登録（アパレル、グッズ等）', 'イベントチケット（デジタル商品として登録）', '在庫・注文・配送の管理']:
        story.append(Paragraph(f'・ {item}', s['detail_item']))
    story.append(Paragraph('アプリ側（Storefront API経由）:', s['h3']))
    for item in ['商品一覧をアプリ内に表示', '購入 → Shopify Checkoutに遷移して決済', '注文履歴の表示', 'プラン別割引（ディスカウントコード or 会員限定コレクション）']:
        story.append(Paragraph(f'・ {item}', s['detail_item']))

    # F-09
    story.append(Paragraph('F-09: タイムライン', s['h2']))
    story.append(Paragraph('形式: Instagram風のフィードUI', s['body']))
    story.append(Paragraph('機能:', s['h3']))
    for item in ['テキスト + 画像 + 動画の投稿', 'いいね・コメント', 'タブ分け（運営投稿 / コミュニティ等）']:
        story.append(Paragraph(f'・ {item}', s['detail_item']))
    story.append(Paragraph('Instagram連携（要確認）:', s['h3']))
    for item in ['案A: Instagram投稿を自動取り込み（Graph API）', '案B: Instagram投稿の埋め込み表示', '案C: 独立したタイムライン（連携なし）']:
        story.append(Paragraph(f'・ {item}', s['detail_item']))

    # F-10
    story.append(Paragraph('F-10: 会員特典', s['h2']))
    story.append(Paragraph('想定特典:', s['h3']))
    for item in ['グルメ系: 飲食店でドリンクサービス等', '不動産系: 仲介サービス連携（要確認）']:
        story.append(Paragraph(f'・ {item}', s['detail_item']))
    story.append(Paragraph('利用方法:', s['h3']))
    for item in ['アプリ内のデジタル会員証を店頭で提示', 'QRコード or 画面表示', '利用回数の管理']:
        story.append(Paragraph(f'・ {item}', s['detail_item']))

    # F-11
    story.append(Paragraph('F-11: プッシュ通知', s['h2']))
    story.append(Paragraph('通知カテゴリ（ユーザーが個別にON/OFF設定）:', s['h3']))
    for item in ['ライブ配信の開始', '新コンテンツ追加', 'EC新商品・イベント', '会員特典情報', '運営からのお知らせ']:
        story.append(Paragraph(f'・ {item}', s['detail_item']))
    story.append(Paragraph('運営側:', s['h3']))
    for item in ['セグメント配信（プラン別等）', 'スケジュール配信']:
        story.append(Paragraph(f'・ {item}', s['detail_item']))

    # F-12
    story.append(Paragraph('F-12: 管理画面', s['h2']))
    story.append(make_table(
        ['モジュール', '機能'],
        [
            ['ダッシュボード', '会員数（プラン別内訳）、月次売上（サブスク + EC + 追加課金）、アクティブ率'],
            ['会員管理', '会員一覧・検索・プラン変更'],
            ['コンテンツ管理', 'アップロード・公開管理'],
            ['ライブ配信管理', '配信作成・アーカイブ管理'],
            ['EC管理', '商品登録・在庫・注文管理'],
            ['特典管理', '特典の追加・編集'],
            ['通知管理', 'プッシュ通知の作成・配信'],
            ['レポート', '売上レポート・CSV出力'],
        ],
        [30*mm, cw - 30*mm], s
    ))
    story.append(PageBreak())

    # ==================== 4. 開発スケジュール ====================
    story.append(Paragraph('4. 開発スケジュール（概算）', s['h1']))
    story.append(divider())
    story.append(make_table(
        ['時期', 'フェーズ', '内容'],
        [
            ['2026年4月', '要件定義・ヒアリング・設計', '要件定義書作成、ヒアリングシート、システム設計'],
            ['2026年5月', 'ウェイティングリストLP + システム設計', 'LP開発、バックエンドアーキテクチャ確定'],
            ['2026年6月', 'LP公開 + バックエンド開発', 'LP公開・リード獲得開始、バックエンド開発'],
            ['2026年7月', 'フロントエンド + API連携 + 決済', 'フロントエンド開発、API連携、決済実装'],
            ['2026年8月', '結合テスト・QA', 'テスト、QA、バグ修正 → 完成'],
            ['2026年9月1日', 'サービス開始', '正式サービスローンチ'],
        ],
        [28*mm, 50*mm, cw - 78*mm], s
    ))

    # ==================== 5. 未確定事項 ====================
    story.append(Paragraph('5. 未確定事項（ヒアリングシートで確認）', s['h1']))
    story.append(divider())
    story.append(make_table(
        ['#', '項目', '状態'],
        [
            ['1', '各プランの名称と価格', '未定'],
            ['2', '口座引き落としの必要性・時期', '要確認'],
            ['3', 'Instagram連携の形式', '要確認'],
            ['4', 'タイムラインの投稿権限（運営のみ or 全会員）', '要確認'],
            ['5', '不動産仲介の具体的なスコープ', '要確認'],
            ['6', '会員特典のプラン別差異', '要確認'],
            ['7', '各カテゴリのローンチ時コンテンツ数', '要確認'],
            ['8', 'ソーシャルログインの対応範囲', '要確認'],
            ['9', 'ドメイン・アプリ名の最終確定', '要確認'],
            ['10', '想定ユーザー数（初期・1年後）', '要確認'],
            ['11', '返金ポリシー', '要確認'],
            ['12', 'ロゴ・ブランドアセットの有無', '要確認'],
        ],
        [10*mm, cw - 30*mm, 20*mm], s
    ))

    # ==================== 6. 次のステップ ====================
    story.append(Paragraph('6. 次のステップ', s['h1']))
    story.append(divider())
    steps = [
        ('1', 'ヒアリングシート', 'クライアントにヒアリングシートをご記入いただく'),
        ('2', '正式要件定義書', '回答をもとに正式な要件定義書を作成'),
        ('3', '技術アーキテクチャ・お見積もり', '技術構成を確定し、お見積もりを提示'),
        ('4', 'ウェイティングリストLP', '先行開発（5月中）'),
        ('5', '本体開発着手', 'プラットフォーム本体の開発開始（6月〜）'),
    ]
    for num, title, desc in steps:
        story.append(Paragraph(f'<b>ステップ {num}: {title}</b>', s['body']))
        story.append(Paragraph(desc, s['body_indent']))

    story.append(Spacer(1, 10*mm))
    story.append(HRFlowable(width="100%", thickness=1, color=OCEAN_BLUE, spaceAfter=4*mm))
    story.append(Paragraph('本書は初版（v1.0）です。ヒアリングシートの回答をもとに更新いたします。', s['note']))

    doc.build(story, onFirstPage=header_footer_cover, onLaterPages=header_footer)
    print(f'PDF generated: {OUTPUT}')


if __name__ == '__main__':
    build_pdf()
