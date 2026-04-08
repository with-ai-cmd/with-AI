/**
 * HP/LP制作 ヒアリングシート自動生成スクリプト
 *
 * 使い方:
 * 1. Google Apps Script (script.google.com) で新規プロジェクト作成
 * 2. このコードを貼り付けて実行
 * 3. 自動でGoogle FormとSpreadsheetが作成される
 */

function createHearingSystem() {
  // ============================
  // 1. ヒアリングフォーム作成
  // ============================
  const form = FormApp.create('【with-AI】HP/LP制作 ヒアリングシート');
  form.setDescription(
    'ホームページ・ランディングページ制作のためのヒアリングシートです。\n' +
    '選択式がメインですので、お気軽にご回答ください。\n' +
    '所要時間：約5〜10分'
  );
  form.setConfirmationMessage('ご回答ありがとうございます！\n内容を確認の上、2営業日以内にご連絡いたします。');
  form.setCollectEmail(true);

  // ---------------------
  // セクション1: 基本情報
  // ---------------------
  form.addSectionHeaderItem()
    .setTitle('📋 基本情報')
    .setHelpText('まずはお客様の情報をお聞かせください。');

  form.addTextItem()
    .setTitle('会社名・屋号・お名前')
    .setRequired(true);

  form.addTextItem()
    .setTitle('ご担当者名')
    .setRequired(true);

  form.addTextItem()
    .setTitle('電話番号')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('業種を教えてください')
    .setChoiceValues([
      'IT・Web・テクノロジー',
      'コンサルティング・士業',
      '飲食・フード',
      '美容・健康・フィットネス',
      '不動産・建設',
      '教育・スクール',
      '医療・福祉',
      '製造・メーカー',
      '小売・EC',
      'クリエイティブ・デザイン',
      'その他（自由記述で教えてください）'
    ])
    .setRequired(true)
    .showOtherOption(true);

  // ---------------------
  // セクション2: 制作の目的
  // ---------------------
  form.addSectionHeaderItem()
    .setTitle('🎯 制作の目的・ゴール')
    .setHelpText('どんなサイトを作りたいか、目的をお聞かせください。');

  form.addMultipleChoiceItem()
    .setTitle('何を作りたいですか？')
    .setChoiceValues([
      'ホームページ（HP）― 会社やサービス全体を紹介するサイト',
      'ランディングページ（LP）― 1つの商品やサービスに特化した1ページの広告ページ',
      'まだ決まっていない（相談したい）'
    ])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('サイトの一番の目的は？（複数選択OK）')
    .setChoiceValues([
      '会社の信頼性を高めたい（名刺代わり）',
      '新規のお客様からの問い合わせを増やしたい',
      '商品・サービスを販売したい',
      '採用・求人に活用したい',
      'ブランドイメージを作りたい・高めたい',
      '情報発信・ブログをやりたい',
      '既存のサイトが古いのでリニューアルしたい',
      'SNSやWeb広告の受け皿（LP）が欲しい'
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('サイトの方向性はどちらに近いですか？')
    .setChoiceValues([
      '集客・売上アップ重視（運用型）― SEO対策やブログ更新で継続的に集客',
      'ブランディング重視 ― デザインや世界観を大切にしたい',
      'とにかくシンプルに ― 最低限の情報が載っていればOK',
      'まだわからない（相談したい）'
    ])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('ターゲット（お客様）は誰ですか？（複数選択OK）')
    .setChoiceValues([
      '法人（BtoB）',
      '個人のお客様（BtoC）',
      '求職者・採用候補者',
      '投資家・パートナー企業',
      '特に決まっていない'
    ])
    .setRequired(true);

  // ---------------------
  // セクション3: デザインの好み
  // ---------------------
  form.addSectionHeaderItem()
    .setTitle('🎨 デザインの好み')
    .setHelpText('好きな雰囲気を選んでください。デザインの方向性の参考にします。');

  form.addMultipleChoiceItem()
    .setTitle('好きなデザインの雰囲気は？')
    .setChoiceValues([
      'シンプル・クリーン ― 余白が多く、すっきりしたデザイン',
      'プロフェッショナル・信頼感 ― 企業らしい落ち着いたデザイン',
      'おしゃれ・スタイリッシュ ― トレンド感のあるデザイン',
      'ポップ・カジュアル ― 親しみやすく明るいデザイン',
      'ラグジュアリー・高級感 ― 上質で洗練されたデザイン',
      'ナチュラル・やさしい ― 自然で温かみのあるデザイン',
      'おまかせ ― プロにお任せしたい'
    ])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('使いたい色のイメージは？（複数選択OK）')
    .setChoiceValues([
      '青系（信頼・誠実）',
      '緑系（安心・自然）',
      '赤・オレンジ系（情熱・活力）',
      '黒・グレー系（高級感・モダン）',
      '白系（清潔感・シンプル）',
      'ピンク・パープル系（優雅・女性的）',
      'ゴールド・ブラウン系（上質・温かみ）',
      'おまかせ'
    ])
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('参考にしたいサイトのURLがあれば教えてください（複数OK）')
    .setHelpText('「こんな感じがいいな」と思うサイトがあればURLを貼ってください。なくてもOKです。');

  // ---------------------
  // セクション4: ページ構成
  // ---------------------
  form.addSectionHeaderItem()
    .setTitle('📄 ページ構成')
    .setHelpText('必要なページを選んでください。ページ数が基本料金のベースになります。\n' +
                  '※ どれを選べばいいかわからない場合は「おまかせ」を選んでください。');

  const pageItem = form.addCheckboxItem()
    .setTitle('必要なページを選んでください（複数選択OK）')
    .setChoiceValues([
      'トップページ ― サイトの顔。メインビジュアルと概要',
      '会社概要・About ― 会社情報、代表挨拶、沿革など',
      'サービス・事業内容 ― 提供するサービスや商品の紹介',
      '料金・プラン ― 価格表やプランの説明',
      '実績・事例 ― 過去の制作実績やお客様の声',
      'お知らせ・ニュース ― 最新情報やお知らせの一覧',
      'ブログ・コラム ― 記事を更新できるページ',
      'よくある質問（FAQ） ― お客様からよくある質問と回答',
      'お問い合わせ ― お問い合わせフォーム（※基本機能に含まれます）',
      '採用情報 ― 求人・採用ページ',
      'アクセス ― 地図や交通案内',
      'ギャラリー・写真 ― 写真や作品の一覧',
      'プライバシーポリシー ― 個人情報保護方針',
      'LP（ランディングページ） ― 広告用の1枚完結ページ',
      'おまかせ（最適な構成をご提案します）'
    ])
    .setRequired(true);

  // ---------------------
  // セクション5: 追加機能
  // ---------------------
  form.addSectionHeaderItem()
    .setTitle('⚡ 追加機能（オプション）')
    .setHelpText('基本機能（お問い合わせフォーム）以外で必要な機能を選んでください。\n' +
                  '※ 追加機能は別途料金がかかります。');

  form.addCheckboxItem()
    .setTitle('追加したい機能はありますか？（複数選択OK）')
    .setChoiceValues([
      'ブログ・お知らせ更新機能 ― 自分で記事を投稿・編集できる',
      'SNS連携 ― Instagram/X(Twitter)/Facebook等の埋め込み・リンク',
      'Googleマップ埋め込み ― アクセスページに地図を表示',
      'スライダー・アニメーション ― 動きのあるリッチなデザイン',
      '多言語対応 ― 日本語＋英語など複数言語',
      'SEO対策（基本） ― 検索エンジンに見つかりやすくする設定',
      'Googleアナリティクス設置 ― アクセス解析ができるようにする',
      'LINE公式連携 ― LINEでの問い合わせや友だち追加ボタン',
      '予約フォーム ― 日時を選んで予約できるフォーム',
      'ECカート機能 ― オンラインで商品を販売できる',
      'パスワード保護ページ ― 会員限定コンテンツ',
      'チャットボット ― 自動応答のチャット機能',
      '動画埋め込み ― YouTube等の動画を掲載',
      '特に必要ない・わからない'
    ])
    .setRequired(false);

  // ---------------------
  // セクション6: 素材について
  // ---------------------
  form.addSectionHeaderItem()
    .setTitle('📷 素材について')
    .setHelpText('サイトに使う写真や文章の準備状況を教えてください。');

  form.addMultipleChoiceItem()
    .setTitle('ロゴはお持ちですか？')
    .setChoiceValues([
      'はい、データがあります',
      'ロゴはあるがデータがない（名刺等にある）',
      'ロゴがないので作りたい（別途お見積り）',
      'ロゴは不要'
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('写真素材はお持ちですか？')
    .setChoiceValues([
      'はい、使える写真があります',
      '一部あるが足りない',
      'ほとんどない（フリー素材を使ってほしい）',
      'プロカメラマンの撮影もお願いしたい（別途お見積り）'
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('掲載する文章（テキスト）はどうしますか？')
    .setChoiceValues([
      '自分で用意する',
      'ざっくりした内容は伝えるので、文章はプロに書いてほしい（ライティング代行）',
      '何を書けばいいかわからない（ヒアリングしながら一緒に作りたい）'
    ])
    .setRequired(true);

  // ---------------------
  // セクション7: 運用について
  // ---------------------
  form.addSectionHeaderItem()
    .setTitle('🔧 公開後の運用について')
    .setHelpText('サイト公開後の更新や管理についてお聞かせください。');

  form.addMultipleChoiceItem()
    .setTitle('公開後、自分でサイトを更新したいですか？')
    .setChoiceValues([
      'はい、自分で更新できるようにしたい',
      'たまに更新するかも（簡単な操作だけ）',
      '更新はすべてお任せしたい（保守プランを検討）',
      'まだわからない'
    ])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('公開後に必要そうなサポートは？（複数選択OK）')
    .setChoiceValues([
      '月次のアクセスレポート',
      'コンテンツ更新代行（テキスト・画像の差し替え等）',
      'SEO改善・コンサルティング',
      'Web広告の運用サポート',
      'SNS運用サポート',
      'セキュリティ・バックアップ管理',
      '特に必要ない',
      'まだわからない'
    ])
    .setRequired(false);

  // ---------------------
  // セクション8: ご予算・スケジュール
  // ---------------------
  form.addSectionHeaderItem()
    .setTitle('💰 ご予算・スケジュール')
    .setHelpText('大まかで構いませんので、ご予算と納期のイメージをお聞かせください。');

  form.addMultipleChoiceItem()
    .setTitle('ご予算のイメージは？（税別）')
    .setChoiceValues([
      '〜10万円',
      '10万円〜20万円',
      '20万円〜30万円',
      '30万円〜50万円',
      '50万円以上',
      '予算は決まっていない（相談したい）'
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('希望の納期は？')
    .setChoiceValues([
      'できるだけ早く（2週間以内）',
      '1ヶ月以内',
      '2ヶ月以内',
      '3ヶ月以内',
      '急いでいない（じっくり作りたい）',
      '特に決まっていない'
    ])
    .setRequired(true);

  // ---------------------
  // セクション9: 現在のサイト・ドメイン
  // ---------------------
  form.addSectionHeaderItem()
    .setTitle('🌐 現在のサイト・ドメインについて')
    .setHelpText('既存のサイトやドメインについて教えてください。');

  form.addMultipleChoiceItem()
    .setTitle('現在サイトはお持ちですか？')
    .setChoiceValues([
      'はい（リニューアル希望）',
      'はい（別途新しく作りたい）',
      'いいえ（新規制作）'
    ])
    .setRequired(true);

  form.addTextItem()
    .setTitle('現在のサイトURL（お持ちの場合）')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('ドメイン（○○.com等）はお持ちですか？')
    .setChoiceValues([
      'はい、持っています',
      'いいえ、取得からお願いしたい',
      'ドメインとは何かわからない'
    ])
    .setRequired(true);

  // ---------------------
  // セクション10: 自由記述
  // ---------------------
  form.addSectionHeaderItem()
    .setTitle('💬 その他')
    .setHelpText('最後に、何かあればご自由にお書きください。');

  form.addParagraphTextItem()
    .setTitle('その他ご要望・ご質問があればお聞かせください')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('このヒアリングシートの内容をもとにオンラインで打ち合わせをしたいですか？')
    .setChoiceValues([
      'はい、打ち合わせしたい',
      'メールやチャットでのやり取りでOK',
      'どちらでもよい'
    ])
    .setRequired(true);

  // ============================
  // 2. 回答先スプレッドシート作成・連携
  // ============================
  const ss = SpreadsheetApp.create('【with-AI】HP/LP制作管理シート');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // 少し待ってからシートを取得（フォーム連携が反映されるまで）
  SpreadsheetApp.flush();
  Utilities.sleep(2000);

  // ============================
  // 3. 料金表シート作成
  // ============================
  const priceSheet = ss.insertSheet('料金表');
  priceSheet.getRange('A1:C1').setValues([['カテゴリ', '項目', '単価（税別）']]);
  priceSheet.getRange('A1:C1').setFontWeight('bold').setBackground('#4A90D9').setFontColor('white');

  const priceData = [
    ['基本料金', 'トップページ', 150000],
    ['基本料金', '会社概要・About', 15000],
    ['基本料金', 'サービス・事業内容', 15000],
    ['基本料金', '料金・プラン', 15000],
    ['基本料金', '実績・事例', 15000],
    ['基本料金', 'お知らせ・ニュース', 15000],
    ['基本料金', 'ブログ・コラム', 15000],
    ['基本料金', 'よくある質問（FAQ）', 15000],
    ['基本料金', 'お問い合わせ', 0],
    ['基本料金', '採用情報', 15000],
    ['基本料金', 'アクセス', 15000],
    ['基本料金', 'ギャラリー・写真', 15000],
    ['基本料金', 'プライバシーポリシー', 15000],
    ['基本料金', 'LP（ランディングページ）', 150000],
    ['', '', ''],
    ['追加機能', 'ブログ・お知らせ更新機能', 30000],
    ['追加機能', 'SNS連携', 10000],
    ['追加機能', 'Googleマップ埋め込み', 5000],
    ['追加機能', 'スライダー・アニメーション', 20000],
    ['追加機能', '多言語対応', 50000],
    ['追加機能', 'SEO対策（基本）', 20000],
    ['追加機能', 'Googleアナリティクス設置', 10000],
    ['追加機能', 'LINE公式連携', 15000],
    ['追加機能', '予約フォーム', 30000],
    ['追加機能', 'ECカート機能', 80000],
    ['追加機能', 'パスワード保護ページ', 20000],
    ['追加機能', 'チャットボット', 40000],
    ['追加機能', '動画埋め込み', 5000],
    ['', '', ''],
    ['ライティング', 'ライティング代行（1ページあたり）', 15000],
    ['ライティング', 'コンテンツ企画・構成', 30000],
    ['', '', ''],
    ['その他', 'ロゴ制作', 50000],
    ['その他', 'プロカメラマン撮影', 50000],
    ['その他', 'ドメイン取得代行', 5000],
    ['その他', 'サーバー初期設定', 10000],
    ['', '', ''],
    ['保守・運用（月額）', '保守・運用プラン（更新+レポート+管理）', 10000],
  ];
  priceSheet.getRange(2, 1, priceData.length, 3).setValues(priceData);
  priceSheet.getRange(2, 3, priceData.length, 1).setNumberFormat('#,##0');
  priceSheet.autoResizeColumns(1, 3);

  // ============================
  // 4. 見積書シート作成
  // ============================
  const quoteSheet = ss.insertSheet('見積書');
  setupQuoteInvoiceSheet_(quoteSheet, '御見積書');

  // ============================
  // 5. 請求書シート作成
  // ============================
  const invoiceSheet = ss.insertSheet('請求書');
  setupQuoteInvoiceSheet_(invoiceSheet, '御請求書');

  // ============================
  // 6. コンテンツヒアリングシート作成
  // ============================
  const contentSheet = ss.insertSheet('コンテンツヒアリング');
  contentSheet.getRange('A1:F1').setValues([['ページ名', 'セクション', '見出し案', '掲載したい内容・キーワード', 'お客様メモ', 'ステータス']]);
  contentSheet.getRange('A1:F1').setFontWeight('bold').setBackground('#4A90D9').setFontColor('white');

  const contentData = [
    ['トップページ', 'メインビジュアル', '', 'キャッチコピー、メイン画像のイメージ', '', '未着手'],
    ['トップページ', 'サービス概要', '', '主要サービス3〜4つの簡単な紹介', '', '未着手'],
    ['トップページ', '選ばれる理由・強み', '', '他社との差別化ポイント', '', '未着手'],
    ['トップページ', 'CTA（行動喚起）', '', 'お問い合わせ・資料請求等への誘導文', '', '未着手'],
    ['', '', '', '', '', ''],
    ['会社概要', '会社情報', '', '社名、所在地、設立、代表、資本金、従業員数等', '', '未着手'],
    ['会社概要', '代表挨拶', '', '代表者の想い、ビジョン', '', '未着手'],
    ['会社概要', '沿革', '', '会社の歴史、主要な出来事', '', '未着手'],
    ['会社概要', 'ミッション・ビジョン', '', '企業理念、大切にしている価値観', '', '未着手'],
    ['', '', '', '', '', ''],
    ['サービス・事業内容', 'サービス一覧', '', '提供サービスの名称と概要', '', '未着手'],
    ['サービス・事業内容', 'サービス詳細', '', '各サービスの詳しい説明、特徴', '', '未着手'],
    ['サービス・事業内容', '対象・ターゲット', '', 'こんな方におすすめ', '', '未着手'],
    ['サービス・事業内容', '導入の流れ', '', 'ステップ形式でわかりやすく', '', '未着手'],
    ['', '', '', '', '', ''],
    ['料金・プラン', 'プラン一覧', '', 'プラン名、価格、含まれる内容', '', '未着手'],
    ['料金・プラン', '比較表', '', 'プラン間の機能比較', '', '未着手'],
    ['', '', '', '', '', ''],
    ['実績・事例', '事例1', '', '顧客名、課題、解決策、成果', '', '未着手'],
    ['実績・事例', '事例2', '', '顧客名、課題、解決策、成果', '', '未着手'],
    ['実績・事例', 'お客様の声', '', '推薦コメント、評価', '', '未着手'],
    ['', '', '', '', '', ''],
    ['採用情報', '募集職種', '', '職種名、仕事内容、条件', '', '未着手'],
    ['採用情報', '社員インタビュー', '', '社員の声、1日の流れ', '', '未着手'],
    ['採用情報', '福利厚生', '', '待遇、働き方、社内制度', '', '未着手'],
    ['', '', '', '', '', ''],
    ['FAQ', '質問と回答', '', 'よくある質問を5〜10個', '', '未着手'],
    ['', '', '', '', '', ''],
    ['LP', 'ファーストビュー', '', 'キャッチコピー、メインビジュアル、CTA', '', '未着手'],
    ['LP', '悩み・課題提起', '', 'ターゲットの悩みに共感', '', '未着手'],
    ['LP', '解決策・サービス紹介', '', 'サービスで解決できること', '', '未着手'],
    ['LP', '実績・証拠', '', '数字、事例、メディア掲載等', '', '未着手'],
    ['LP', 'お客様の声', '', '体験談、ビフォーアフター', '', '未着手'],
    ['LP', '料金・オファー', '', '価格、特典、限定感', '', '未着手'],
    ['LP', 'FAQ', '', '購入前の不安を解消', '', '未着手'],
    ['LP', 'CTA（最終）', '', '申し込み・問い合わせフォーム', '', '未着手'],
  ];
  contentSheet.getRange(2, 1, contentData.length, 6).setValues(contentData);

  // ステータス列にドロップダウン
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['未着手', 'ヒアリング中', 'ライティング中', '確認待ち', '確定'])
    .build();
  contentSheet.getRange(2, 6, contentData.length, 1).setDataValidation(statusRule);
  contentSheet.autoResizeColumns(1, 6);
  contentSheet.setColumnWidth(4, 300);

  // ============================
  // 7. 案件管理シート作成
  // ============================
  const mgmtSheet = ss.insertSheet('案件管理');
  mgmtSheet.getRange('A1:J1').setValues([[
    '案件名', 'クライアント', 'ステータス', '種別',
    '基本料金', '追加機能', 'ライティング', 'その他',
    '合計（税別）', '合計（税込）'
  ]]);
  mgmtSheet.getRange('A1:J1').setFontWeight('bold').setBackground('#4A90D9').setFontColor('white');

  // サンプル数式行
  mgmtSheet.getRange('J2').setFormula('=IF(I2="","",I2*1.1)');
  mgmtSheet.getRange('I2').setFormula('=IF(E2="","",SUM(E2:H2))');
  mgmtSheet.autoResizeColumns(1, 10);

  // ============================
  // ログ出力
  // ============================
  Logger.log('✅ ヒアリングフォーム作成完了');
  Logger.log('📝 フォームURL: ' + form.getEditUrl());
  Logger.log('📊 スプレッドシートURL: ' + ss.getUrl());
  Logger.log('📤 フォーム回答URL: ' + form.getPublishedUrl());

  // ポップアップで通知（スプレッドシートから実行した場合のみ）
  try {
    SpreadsheetApp.getUi().alert(
      '✅ HP/LP制作ヒアリングシステム作成完了！\n\n' +
      '📝 フォーム編集URL:\n' + form.getEditUrl() + '\n\n' +
      '📤 フォーム回答URL（お客様に送る）:\n' + form.getPublishedUrl() + '\n\n' +
      '📊 管理スプレッドシート:\n' + ss.getUrl()
    );
  } catch(e) {
    Logger.log('（スタンドアロン実行のためポップアップはスキップ）');
  }

  return {
    formEditUrl: form.getEditUrl(),
    formPublishUrl: form.getPublishedUrl(),
    spreadsheetUrl: ss.getUrl()
  };
}


/**
 * 見積書・請求書のテンプレートを作成するヘルパー
 */
function setupQuoteInvoiceSheet_(sheet, title) {
  // ヘッダー
  sheet.getRange('A1:F1').merge().setValue('with-AI株式会社').setFontSize(10).setHorizontalAlignment('left');
  sheet.getRange('A2:F2').merge().setValue(title).setFontSize(18).setFontWeight('bold').setHorizontalAlignment('center');

  // 発行情報
  sheet.getRange('A4').setValue('発行日：');
  sheet.getRange('B4').setValue('').setNumberFormat('yyyy/mm/dd');
  sheet.getRange('D4').setValue('番号：');
  sheet.getRange('E4').setValue('');

  sheet.getRange('A5').setValue('有効期限：');
  sheet.getRange('B5').setValue('発行日より30日間');

  // 宛先
  sheet.getRange('A7').setValue('【宛先】').setFontWeight('bold');
  sheet.getRange('A8').setValue('会社名：');
  sheet.getRange('B8').setValue('');
  sheet.getRange('A9').setValue('ご担当者：');
  sheet.getRange('B9').setValue('');

  // 合計金額
  sheet.getRange('A11:F11').merge().setBackground('#F0F0F0');
  sheet.getRange('A11').setValue('').setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center');
  // 合計金額セルは後で数式設定

  // 明細ヘッダー
  sheet.getRange('A13:F13').setValues([['No.', '項目', 'カテゴリ', '数量', '単価（税別）', '小計（税別）']]);
  sheet.getRange('A13:F13').setFontWeight('bold').setBackground('#4A90D9').setFontColor('white');

  // 明細行（20行分）
  for (var i = 14; i <= 33; i++) {
    sheet.getRange('A' + i).setValue(i - 13);
    sheet.getRange('F' + i).setFormula('=IF(D' + i + '="","",D' + i + '*E' + i + ')');
  }

  // 小計・税・合計
  sheet.getRange('E35').setValue('小計（税別）').setFontWeight('bold');
  sheet.getRange('F35').setFormula('=SUM(F14:F33)').setNumberFormat('#,##0');

  sheet.getRange('E36').setValue('消費税（10%）').setFontWeight('bold');
  sheet.getRange('F36').setFormula('=F35*0.1').setNumberFormat('#,##0');

  sheet.getRange('E37').setValue('合計（税込）').setFontWeight('bold').setFontSize(12);
  sheet.getRange('F37').setFormula('=F35+F36').setNumberFormat('#,##0').setFontWeight('bold').setFontSize(12);

  // 合計金額をヘッダーにも表示
  sheet.getRange('A11').setFormula('="御見積金額：￥" & TEXT(F37,"#,##0") & "（税込）"');

  // 備考
  sheet.getRange('A39').setValue('【備考】').setFontWeight('bold');
  sheet.getRange('A40').setValue('・お問い合わせフォーム（Googleフォーム連携）は基本料金に含まれます。');
  sheet.getRange('A41').setValue('・制作期間は内容確定後、約2〜4週間を予定しております。');
  sheet.getRange('A42').setValue('・お支払い条件：納品後30日以内にお振込み');

  // 発行者情報
  sheet.getRange('A44').setValue('【発行者】').setFontWeight('bold');
  sheet.getRange('A45').setValue('with-AI株式会社');
  sheet.getRange('A46').setValue('代表取締役 勝又海斗');
  sheet.getRange('A47').setValue('');

  // 列幅調整
  sheet.setColumnWidth(1, 50);
  sheet.setColumnWidth(2, 250);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 60);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 120);

  // 数値フォーマット
  sheet.getRange('E14:F33').setNumberFormat('#,##0');
}


// ============================
// 設定値（createHearingSystem実行後に自動で埋まる。手動設定も可）
// ============================
var CONFIG = {
  SPREADSHEET_ID: '1DOUxqUaFQvm-r0LkxDzUefDCFwIOKRN-f9tDp2XKtMk',
  FORM_ID: '12YYPX4o6zP3pht-hCw5VfA2Lc0IiyDK-87ka6WztR_A'
};


/**
 * フォーム送信トリガーを設定する関数
 * GASエディタで1回だけ実行すればOK
 */
function setupFormTrigger() {
  // 既存のトリガーを削除（重複防止）
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // フォーム送信時トリガーを作成
  var form = FormApp.openById(CONFIG.FORM_ID);
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();

  Logger.log('✅ フォーム送信トリガーを設定しました');
}


/**
 * フォーム回答から自動で見積書を生成する関数
 * setupFormTrigger() で自動実行されるように設定
 */
function onFormSubmit(e) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var quoteSheet = ss.getSheetByName('見積書');
  var priceSheet = ss.getSheetByName('料金表');

  if (!quoteSheet || !priceSheet) return;

  // フォームトリガーの場合は e.response から取得
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();

  // 回答をタイトルをキーにしたMapに変換
  var responses = {};
  for (var r = 0; r < itemResponses.length; r++) {
    var title = itemResponses[r].getItem().getTitle();
    var answer = itemResponses[r].getResponse();
    responses[title] = answer;
  }

  // 料金表を読み込み
  var priceData = priceSheet.getDataRange().getValues();
  var priceMap = {};
  for (var i = 1; i < priceData.length; i++) {
    if (priceData[i][1]) {
      priceMap[priceData[i][1]] = priceData[i][2];
    }
  }

  // 見積書の既存明細をクリア（14〜33行目）
  quoteSheet.getRange('B14:F33').clearContent();

  // 宛先設定
  var companyName = responses['会社名・屋号・お名前'] || '';
  var contactName = responses['ご担当者名'] || '';

  quoteSheet.getRange('B4').setValue(new Date());
  quoteSheet.getRange('E4').setValue('Q-' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd-HHmm'));
  quoteSheet.getRange('B8').setValue(companyName);
  quoteSheet.getRange('B9').setValue(contactName + ' 様');

  // 選択されたページを明細に追加
  var row = 14;
  var pages = responses['必要なページを選んでください（複数選択OK）'] || [];
  if (typeof pages === 'string') pages = [pages];

  for (var p = 0; p < pages.length; p++) {
    var pageName = pages[p].split(' ― ')[0];
    var pagePrice = priceMap[pageName] || 0;
    if (pageName && pageName !== 'おまかせ（最適な構成をご提案します）') {
      quoteSheet.getRange('B' + row).setValue(pageName);
      quoteSheet.getRange('C' + row).setValue('基本料金');
      quoteSheet.getRange('D' + row).setValue(1);
      quoteSheet.getRange('E' + row).setValue(pagePrice);
      row++;
    }
  }

  // 選択された追加機能を明細に追加
  var features = responses['追加したい機能はありますか？（複数選択OK）'] || [];
  if (typeof features === 'string') features = [features];

  for (var f = 0; f < features.length; f++) {
    var featureName = features[f].split(' ― ')[0];
    var featurePrice = priceMap[featureName] || 0;
    if (featureName && featureName !== '特に必要ない・わからない') {
      quoteSheet.getRange('B' + row).setValue(featureName);
      quoteSheet.getRange('C' + row).setValue('追加機能');
      quoteSheet.getRange('D' + row).setValue(1);
      quoteSheet.getRange('E' + row).setValue(featurePrice);
      row++;
    }
  }

  // ライティング代行の判定
  var writingChoice = responses['掲載する文章（テキスト）はどうしますか？'] || '';

  if (writingChoice.indexOf('プロに書いてほしい') >= 0 || writingChoice.indexOf('一緒に作りたい') >= 0) {
    var pageCount = pages.filter(function(pg) {
      return pg.indexOf('おまかせ') < 0 && pg.indexOf('お問い合わせ') < 0 && pg.indexOf('プライバシーポリシー') < 0;
    }).length;
    quoteSheet.getRange('B' + row).setValue('ライティング代行');
    quoteSheet.getRange('C' + row).setValue('ライティング');
    quoteSheet.getRange('D' + row).setValue(pageCount);
    quoteSheet.getRange('E' + row).setValue(15000);
    row++;
  }

  // 小計の数式を再設定（明細行のFはIF数式なので自動計算される）
  for (var j = 14; j <= 33; j++) {
    quoteSheet.getRange('F' + j).setFormula('=IF(D' + j + '="","",D' + j + '*E' + j + ')');
  }

  // スプレッドシートの計算を確定させる
  SpreadsheetApp.flush();

  // PDF生成＆下書き保存
  var email = formResponse.getRespondentEmail() || Session.getActiveUser().getEmail();
  if (email) {
    Utilities.sleep(2000); // 数式反映を待つ
    var pdfBlob = exportSheetAsPdf_(CONFIG.SPREADSHEET_ID, quoteSheet.getSheetId(), companyName);
    sendQuoteEmail_(email, companyName, contactName, pdfBlob);
    Logger.log('✅ 見積書PDF下書き保存完了: ' + email);
  } else {
    Logger.log('⚠️ メールアドレス未取得のためPDF送信スキップ');
  }

  Logger.log('✅ 見積書自動生成完了: ' + companyName);
}


/**
 * 指定シートをPDFとしてエクスポートする
 */
function exportSheetAsPdf_(spreadsheetId, sheetId, clientName) {
  var url = 'https://docs.google.com/spreadsheets/d/' + spreadsheetId + '/export?' +
    'exportFormat=pdf' +
    '&format=pdf' +
    '&size=A4' +
    '&portrait=true' +
    '&fitw=true' +           // 幅に合わせる
    '&gridlines=false' +     // グリッド線なし
    '&printtitle=false' +
    '&sheetnames=false' +
    '&pagenum=UNDEFINED' +
    '&fzr=false' +
    '&gid=' + sheetId;       // 見積書シートのみ

  var token = ScriptApp.getOAuthToken();
  var response = UrlFetchApp.fetch(url, {
    headers: { 'Authorization': 'Bearer ' + token }
  });

  var fileName = '御見積書_' + clientName + '_' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd') + '.pdf';
  return response.getBlob().setName(fileName);
}


/**
 * 見積書PDFをメール送信する
 */
function sendQuoteEmail_(email, companyName, contactName, pdfBlob) {
  var subject = '【with-AI】HP/LP制作 御見積書のご送付';
  var body =
    (contactName || companyName) + ' 様\n\n' +
    'この度はHP/LP制作のヒアリングシートにご回答いただき、\n' +
    '誠にありがとうございます。\n\n' +
    'ヒアリング内容をもとに、御見積書を作成いたしましたので\n' +
    '添付にてお送りいたします。\n\n' +
    '※ こちらは自動生成による概算見積です。\n' +
    '  詳細なお打ち合わせの上、正式な御見積書を\n' +
    '  改めてお送りさせていただきます。\n\n' +
    '━━━━━━━━━━━━━━━━━━━━\n' +
    'with-AI株式会社\n' +
    '代表取締役 勝又海斗\n' +
    '━━━━━━━━━━━━━━━━━━━━\n';

  var draft = GmailApp.createDraft(email, subject, body, {
    attachments: [pdfBlob],
    name: 'with-AI株式会社'
  });
  Logger.log('📧 下書き保存完了: ' + draft.getId());
}


/**
 * テスト用：ダミーデータでフォームを自動送信する
 * GASエディタで submitTestData を実行
 */
function submitTestData() {
  var form = FormApp.openById(CONFIG.FORM_ID);
  var items = form.getItems();
  var response = form.createResponse();

  var testAnswers = {
    '会社名・屋号・お名前': '株式会社テスト商事',
    'ご担当者名': '田中太郎',
    '電話番号': '03-1234-5678',
    '業種を教えてください': 'IT・Web・テクノロジー',
    '何を作りたいですか？': 'ホームページ（HP）― 会社やサービス全体を紹介するサイト',
    'サイトの一番の目的は？（複数選択OK）': [
      '会社の信頼性を高めたい（名刺代わり）',
      '新規のお客様からの問い合わせを増やしたい'
    ],
    'サイトの方向性はどちらに近いですか？': '集客・売上アップ重視（運用型）― SEO対策やブログ更新で継続的に集客',
    'ターゲット（お客様）は誰ですか？（複数選択OK）': ['法人（BtoB）'],
    '好きなデザインの雰囲気は？': 'プロフェッショナル・信頼感 ― 企業らしい落ち着いたデザイン',
    '使いたい色のイメージは？（複数選択OK）': ['青系（信頼・誠実）', '白系（清潔感・シンプル）'],
    '必要なページを選んでください（複数選択OK）': [
      'トップページ ― サイトの顔。メインビジュアルと概要',
      '会社概要・About ― 会社情報、代表挨拶、沿革など',
      'サービス・事業内容 ― 提供するサービスや商品の紹介',
      '実績・事例 ― 過去の制作実績やお客様の声',
      'お問い合わせ ― お問い合わせフォーム（※基本機能に含まれます）',
      'プライバシーポリシー ― 個人情報保護方針'
    ],
    '追加したい機能はありますか？（複数選択OK）': [
      'SNS連携 ― Instagram/X(Twitter)/Facebook等の埋め込み・リンク',
      'SEO対策（基本） ― 検索エンジンに見つかりやすくする設定',
      'Googleアナリティクス設置 ― アクセス解析ができるようにする'
    ],
    'ロゴはお持ちですか？': 'はい、データがあります',
    '写真素材はお持ちですか？': '一部あるが足りない',
    '掲載する文章（テキスト）はどうしますか？': 'ざっくりした内容は伝えるので、文章はプロに書いてほしい（ライティング代行）',
    '公開後、自分でサイトを更新したいですか？': 'たまに更新するかも（簡単な操作だけ）',
    'ご予算のイメージは？（税別）': '20万円〜30万円',
    '希望の納期は？': '1ヶ月以内',
    '現在サイトはお持ちですか？': 'いいえ（新規制作）',
    'ドメイン（○○.com等）はお持ちですか？': 'いいえ、取得からお願いしたい',
    'このヒアリングシートの内容をもとにオンラインで打ち合わせをしたいですか？': 'はい、打ち合わせしたい'
  };

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var title = item.getTitle();
    var answer = testAnswers[title];

    if (answer === undefined) continue;

    var type = item.getType();
    if (type === FormApp.ItemType.TEXT) {
      response.withItemResponse(item.asTextItem().createResponse(answer));
    } else if (type === FormApp.ItemType.PARAGRAPH_TEXT) {
      response.withItemResponse(item.asParagraphTextItem().createResponse(answer));
    } else if (type === FormApp.ItemType.MULTIPLE_CHOICE) {
      response.withItemResponse(item.asMultipleChoiceItem().createResponse(answer));
    } else if (type === FormApp.ItemType.CHECKBOX) {
      response.withItemResponse(item.asCheckboxItem().createResponse(answer));
    }
  }

  // メール収集を一時的にオフにして送信
  form.setCollectEmail(false);
  var submitted = response.submit();
  form.setCollectEmail(true);
  Logger.log('✅ テストデータ送信完了: 株式会社テスト商事');

  // トリガーを待たず直接onFormSubmitを呼ぶ
  onFormSubmit({ response: submitted });
  Logger.log('✅ 見積書生成＆下書き保存処理完了');
}


/**
 * デバッグ用：フォームの全項目とタイプを出力
 */
function debugFormItems() {
  var form = FormApp.openById(CONFIG.FORM_ID);
  var items = form.getItems();
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    Logger.log('[' + i + '] ' + item.getType() + ' | ' + item.getTitle());
    if (item.getType() === FormApp.ItemType.MULTIPLE_CHOICE) {
      var choices = item.asMultipleChoiceItem().getChoices();
      for (var c = 0; c < choices.length; c++) {
        Logger.log('    → ' + choices[c].getValue());
      }
    } else if (item.getType() === FormApp.ItemType.CHECKBOX) {
      var choices = item.asCheckboxItem().getChoices();
      for (var c = 0; c < choices.length; c++) {
        Logger.log('    → ' + choices[c].getValue());
      }
    }
  }
}
