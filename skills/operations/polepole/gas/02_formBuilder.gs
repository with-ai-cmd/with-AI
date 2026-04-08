/**
 * ============================================
 * Googleフォーム自動作成
 * ============================================
 *
 * 3分岐構成：
 *   1. 未就学児（新規）→ 基本情報 + 未就学児アセスメント
 *   2. 就学児（新規）  → 基本情報 + 就学児アセスメント
 *   3. 継続            → 継続用アセスメントのみ
 */

function createEnrollmentForm() {
  const form = FormApp.create(CONFIG.FORM_TITLE);
  form.setDescription(CONFIG.FORM_DESCRIPTION);
  form.setIsQuiz(false);
  form.setCollectEmail(true);
  form.setAllowResponseEdits(false);
  form.setLimitOneResponsePerUser(false);

  // ===== セクション1: 利用区分の選択 =====
  const enrollmentType = form.addListItem()
    .setTitle('利用区分を選択してください')
    .setRequired(true);

  // 分岐先のページを先に作成
  const pageBasicInfo = form.addPageBreakItem().setTitle('基本情報');
  const pagePreschool = form.addPageBreakItem().setTitle('未就学児アセスメント（お子さんのご様子）');
  const pageSchoolAge = form.addPageBreakItem().setTitle('就学児アセスメント（お子さんのご様子）');
  const pageContinuation = form.addPageBreakItem().setTitle('継続 アセスメント');
  const pageCommon = form.addPageBreakItem().setTitle('写真掲載・送迎・その他');
  const pageEnd = form.addPageBreakItem().setTitle('入力完了');

  // ----- 基本情報セクション -----
  buildBasicInfoSection(form, pageBasicInfo);

  // ----- 未就学児アセスメント -----
  buildPreschoolSection(form, pagePreschool);

  // ----- 就学児アセスメント -----
  buildSchoolAgeSection(form, pageSchoolAge);

  // ----- 継続アセスメント -----
  buildContinuationSection(form, pageContinuation);

  // ----- 共通セクション（写真・送迎等） -----
  buildCommonEndSection(form, pageCommon);

  // ----- 完了ページ -----
  pageEnd.setHelpText('ご入力ありがとうございました。\n内容を確認の上、スタッフよりご連絡いたします。');

  // ===== 分岐ロジックの設定 =====
  // 利用区分の選択による分岐
  enrollmentType.setChoices([
    enrollmentType.createChoice(ENROLLMENT_TYPES.PRESCHOOL, pageBasicInfo),
    enrollmentType.createChoice(ENROLLMENT_TYPES.SCHOOL_AGE, pageBasicInfo),
    enrollmentType.createChoice(ENROLLMENT_TYPES.CONTINUATION, pageContinuation),
  ]);

  // 基本情報 → 未就学児/就学児アセスメントへの分岐はonFormSubmitで処理
  // （Googleフォームの制約上、1つの質問からの分岐のみ可能）
  // 代わりに、基本情報の最後に再度区分を確認する質問を配置
  // → buildBasicInfoSectionの末尾で対応

  // スプレッドシートとリンク
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  Logger.log('フォーム作成完了: ' + form.getEditUrl());
  return form.getId();
}

/**
 * 基本情報セクションを構築
 */
function buildBasicInfoSection(form, pageBreak) {
  pageBreak.setHelpText('お子さんとご家族の基本情報をご入力ください。');

  // ----- お子さんの情報 -----
  form.addSectionHeaderItem().setTitle('お子さんの情報');

  form.addTextItem()
    .setTitle('お子さんのお名前')
    .setRequired(true);

  form.addTextItem()
    .setTitle('お子さんのお名前（ふりがな）')
    .setRequired(true);

  form.addTextItem()
    .setTitle('呼び名（ニックネーム）')
    .setRequired(false);

  form.addDateItem()
    .setTitle('生年月日')
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('性別')
    .setChoiceValues(['男', '女'])
    .setRequired(true);
  // ※「回答しない」の選択肢は要修正確認

  form.addTextItem()
    .setTitle('年齢（例：3歳5ヶ月）')
    .setRequired(true);

  form.addTextItem()
    .setTitle('平熱（例：36.5）')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('血液型')
    .setChoiceValues(['A型', 'B型', 'O型', 'AB型', '不明'])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('RH')
    .setChoiceValues(['+', '−', '不明'])
    .setRequired(false);

  // ----- 所属・通所情報 -----
  form.addSectionHeaderItem().setTitle('所属・通所情報');

  form.addTextItem()
    .setTitle('所属している保育園・幼稚園・学校')
    .setRequired(false);

  form.addTextItem()
    .setTitle('通所している支援事業所')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('通所受給者証')
    .setChoiceValues(['ある', 'なし'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('発達検査を受けた機関')
    .setRequired(false);

  form.addTextItem()
    .setTitle('具体的な診断名（なしの場合は「なし」とご記入ください）')
    .setRequired(false);

  form.addTextItem()
    .setTitle('その他医療機関')
    .setRequired(false);

  form.addTextItem()
    .setTitle('治療中の病気・既往歴（なしの場合は「なし」）')
    .setRequired(false);

  // ----- アレルギー -----
  form.addSectionHeaderItem().setTitle('アレルギー情報');

  const allergyItem = form.addMultipleChoiceItem()
    .setTitle('アレルギーの有無')
    .setChoiceValues(['あり', 'なし'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('アレルギーの詳細（ありの場合、具体的にご記入ください）')
    .setRequired(false);

  // ----- 住所・連絡先 -----
  form.addSectionHeaderItem().setTitle('住所・連絡先');

  form.addTextItem()
    .setTitle('郵便番号（例：000-0000）')
    .setRequired(true);

  form.addTextItem()
    .setTitle('住所（市町村名）')
    .setRequired(true);

  form.addTextItem()
    .setTitle('住所（町名・番地・建物名）')
    .setRequired(true);

  form.addTextItem()
    .setTitle('電話番号（自宅）')
    .setRequired(false);

  form.addTextItem()
    .setTitle('携帯電話番号①（保護者名：　　　）')
    .setRequired(true);

  form.addTextItem()
    .setTitle('携帯電話番号②（保護者名：　　　）')
    .setRequired(false);

  form.addTextItem()
    .setTitle('保護者メールアドレス')
    .setHelpText('契約書類の送付等に使用します。')
    .setRequired(true);

  // ----- 緊急連絡先 -----
  form.addSectionHeaderItem().setTitle('緊急連絡先');

  form.addTextItem()
    .setTitle('緊急連絡先① 氏名')
    .setRequired(true);

  form.addTextItem()
    .setTitle('緊急連絡先① 続柄')
    .setRequired(true);

  form.addTextItem()
    .setTitle('緊急連絡先① 電話番号')
    .setRequired(true);

  form.addTextItem()
    .setTitle('緊急連絡先② 氏名')
    .setRequired(true);

  form.addTextItem()
    .setTitle('緊急連絡先② 続柄')
    .setRequired(true);

  form.addTextItem()
    .setTitle('緊急連絡先② 電話番号')
    .setRequired(true);

  // ----- 家族構成 -----
  form.addSectionHeaderItem().setTitle('家族構成');

  form.addParagraphTextItem()
    .setTitle('ご家族について（名前・ふりがな・続柄・年齢）')
    .setHelpText('例：\n山田太郎（やまだたろう）・父・35歳\n山田花子（やまだはなこ）・母・33歳\n山田次郎（やまだじろう）・兄・5歳')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('祖父母・その他（日常で交流のあるご親戚や別居の祖父母など）')
    .setHelpText('例：\n山田一郎（やまだいちろう）・祖父・同居\n山田良子（やまだよしこ）・祖母・別居')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('その他（知らせておきたい事項があればご記入ください）')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('連絡に関する補足事項')
    .setRequired(false);

  // ----- 基本情報の最後に利用区分を再確認（分岐用） -----
  const branchItem = form.addMultipleChoiceItem()
    .setTitle('お子さんの区分を選択してください');

  // この分岐先は後で設定する必要がある（ページ参照の関係）
  // → setupFormBranching() で対応
}

/**
 * 未就学児アセスメントセクション
 */
function buildPreschoolSection(form, pageBreak) {
  pageBreak.setHelpText('お子さんのご様子についてお聞かせください。\n※補足があれば自由記述欄にご記入ください。');

  // ----- 行動面 -----
  form.addSectionHeaderItem().setTitle('お子さんの行動について');

  form.addMultipleChoiceItem()
    .setTitle('視線は合いますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('視線が合い始めた時期（分かれば）')
    .setHelpText('例：1歳6ヶ月')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('興味を持った時、指をさして伝えますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('指さしをした方向を一緒に見ますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('オウム返しが目立ちますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('だっこされることを嫌がりますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('体を同じパターンで動かし続けますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('予定の変更でパニックになったりしますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('思い通りにならないとかんしゃくを起こしたりしますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('かんしゃく等がある場合、どのように対処していますか？')
    .setRequired(false);

  // ----- 発語・理解面 -----
  form.addSectionHeaderItem().setTitle('発語・理解面');

  form.addMultipleChoiceItem()
    .setTitle('発語状況')
    .setChoiceValues(['言葉が出ている', '言葉が出ていない', '単語のみ', 'その他'])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('発語について詳しく教えてください')
    .setHelpText('出ている場合の具体的な言葉や、その他の状況を自由にご記入ください')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('言葉ではないが、指さしや動作で自分の気持ちを表現しますか？')
    .setChoiceValues(['表現する', '表現しない'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('簡単な言葉（「ちょうだい」「バイバイ」など）が分かりますか？')
    .setChoiceValues(['わかる', 'わからない'])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('理解面について補足があればご記入ください')
    .setRequired(false);

  // ----- 排泄 -----
  form.addSectionHeaderItem().setTitle('排泄について');

  form.addMultipleChoiceItem()
    .setTitle('パンツの種類')
    .setChoiceValues(['紙パンツ', '布パンツ', '併用'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('尿意や便意を教えますか？')
    .setChoiceValues(['教える', '教えない', '時々教える'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('トイレでしますか？')
    .setChoiceValues(['する', 'しない', '時々する'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('※男の子の場合：トイレの仕方')
    .setChoiceValues(['立ってする', '座ってする', '該当なし'])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('トイレトレーニングをしていますか？')
    .setChoiceValues(['している', 'していない'])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('トイレに行くのを嫌がりますか？')
    .setChoiceValues(['嫌がる', '嫌がらない'])
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('排泄について補足があればご記入ください')
    .setHelpText('例：トイレに行くのを嫌がる、特定の場所でしかしない等')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('排泄に関する具体的な配慮があればご記入ください')
    .setRequired(false);

  // ----- 衣服 -----
  form.addSectionHeaderItem().setTitle('着替えについて');

  form.addCheckboxItem()
    .setTitle('お子さんが自分でできることを選んでください')
    .setChoiceValues([
      'ズボンを脱げる', 'ズボンをはける',
      '服を脱げる', '服を着れる',
      '靴下を脱げる', '靴下をはける',
      '靴を脱げる', '靴をはける',
      'ボタンができる', 'チャックができる'
    ])
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('着替えについて、具体的にどこまでできますか？')
    .setHelpText('例：上着は自分で着れるが、ボタンは介助が必要')
    .setRequired(false);

  // ----- 食事 -----
  form.addSectionHeaderItem().setTitle('食事について');

  form.addMultipleChoiceItem()
    .setTitle('食事の好き嫌い')
    .setChoiceValues(['何でも食べる', '好き嫌いがある'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('好きな食べ物・おやつ')
    .setRequired(false);

  form.addTextItem()
    .setTitle('嫌いな食べ物・おやつ')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('食事方法')
    .setChoiceValues(['自分で食べる', '大人が食べさせる', '一部介助が必要'])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('※自分で食べる場合、使用するもの')
    .setChoiceValues(['手づかみ', 'スプーン', 'フォーク', '箸'])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('食事量')
    .setChoiceValues(['多い', '普通', '少ない', 'ムラがある'])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('食事に関する具体的な配慮があればご記入ください')
    .setHelpText('例：刻み食が必要、特定の食感を嫌がる等')
    .setRequired(false);

  // ----- 運動・感覚 -----
  form.addSectionHeaderItem().setTitle('運動・感覚について');

  form.addMultipleChoiceItem()
    .setTitle('身体を動かす遊びは？')
    .setChoiceValues(['好き', '苦手'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('戸外あそびは？')
    .setChoiceValues(['好き', '苦手'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('音に敏感な様子がありますか？')
    .setChoiceValues(['ある', 'ない'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('※音に敏感な場合、どんな音を嫌がりますか？')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('さわったり濡れることを嫌がることがありますか？')
    .setChoiceValues(['ある', 'ない'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('※嫌がる場合、どんな物（事）を嫌がりますか？')
    .setRequired(false);

  // ----- あそび -----
  form.addSectionHeaderItem().setTitle('あそびについて');

  form.addMultipleChoiceItem()
    .setTitle('他の子どもに興味がありますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('大人とあそぶことを好みますか？')
    .setChoiceValues(['はい', '1人あそびが多い'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('どんな遊びが好きですか？')
    .setRequired(false);

  form.addTextItem()
    .setTitle('お気に入りのおもちゃなどは？')
    .setRequired(false);

  form.addTextItem()
    .setTitle('好きな絵本は？')
    .setRequired(false);

  form.addTextItem()
    .setTitle('興味のあるキャラクターは？')
    .setRequired(false);

  // ----- 自由記述 -----
  form.addSectionHeaderItem().setTitle('お子さんについて教えてください');

  form.addParagraphTextItem()
    .setTitle('お子さんはどんな性格だと思いますか？')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('通所園に対しての願い（要望・希望）はありますか？')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('以前は出来なかったけど、出来るようになったことはありますか？')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('現在、子育てをしていて、困っていること・悩んでいること・心配ごとはありますか？')
    .setRequired(false);
}

/**
 * 就学児アセスメントセクション
 */
function buildSchoolAgeSection(form, pageBreak) {
  pageBreak.setHelpText('お子さんのご様子についてお聞かせください。\n※補足があれば自由記述欄にご記入ください。');

  // ----- 行動面（未就学児と同じ） -----
  form.addSectionHeaderItem().setTitle('お子さんの行動について');

  form.addMultipleChoiceItem()
    .setTitle('視線は合いますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('視線が合い始めた時期（分かれば）')
    .setHelpText('例：1歳6ヶ月')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('興味を持った時、指をさして伝えますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('指さしをした方向を一緒に見ますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('オウム返しが目立ちますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('だっこされることを嫌がりますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('体を同じパターンで動かし続けますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('予定の変更でパニックになったりしますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('思い通りにならないとかんしゃくを起こしたりしますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('かんしゃく等がある場合、どのように対処していますか？')
    .setRequired(false);

  // ----- 学校関連 -----
  form.addSectionHeaderItem().setTitle('学校について');

  form.addMultipleChoiceItem()
    .setTitle('在籍している学級')
    .setChoiceValues(['通常学級', '特別支援学級', '特別支援学校', 'その他'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('在籍学級について補足（「その他」の場合など）')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('学校への通学状況')
    .setChoiceValues(['毎日通学', '時々欠席', '不登校気味', 'その他'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('通学状況について補足（「その他」の場合など）')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('学校にお願いしている配慮があれば教えてください')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('宿題支援の方法について教えてください')
    .setHelpText('例：間違いは直してほしい、できる範囲で良い、見守りだけで良い等')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('対人関係で配慮していることがあれば教えてください')
    .setRequired(false);

  // ----- POLEPOLE利用日以外の過ごし方 -----
  form.addSectionHeaderItem().setTitle('POLEPOLE利用日以外の過ごし方');
  form.addSectionHeaderItem().setHelpText('各曜日のPOLEPOLE利用日以外の過ごし方を教えてください');

  form.addTextItem().setTitle('月曜日の過ごし方').setHelpText('例：自宅、学童、放課後デイ等').setRequired(false);
  form.addTextItem().setTitle('火曜日の過ごし方').setRequired(false);
  form.addTextItem().setTitle('水曜日の過ごし方').setRequired(false);
  form.addTextItem().setTitle('木曜日の過ごし方').setRequired(false);
  form.addTextItem().setTitle('金曜日の過ごし方').setRequired(false);
  form.addTextItem().setTitle('土曜日の過ごし方').setRequired(false);

  // ----- 排泄 -----
  form.addSectionHeaderItem().setTitle('排泄について');

  form.addMultipleChoiceItem()
    .setTitle('パンツの種類')
    .setChoiceValues(['紙パンツ', '布パンツ', '併用'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('尿意や便意を教えますか？')
    .setChoiceValues(['教える', '教えない', '時々教える'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('トイレでしますか？')
    .setChoiceValues(['する', 'しない', '時々する'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('トイレに行くのを嫌がりますか？')
    .setChoiceValues(['嫌がる', '嫌がらない'])
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('排泄について補足があればご記入ください')
    .setRequired(false);

  // ----- 衣服 -----
  form.addSectionHeaderItem().setTitle('着替えについて');

  form.addMultipleChoiceItem()
    .setTitle('身辺自立の状況')
    .setChoiceValues(['自立', '一部介助あり'])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('着替え等について、具体的にどこまでできますか？')
    .setHelpText('例：ボタンは自分でできるが、靴紐は介助が必要')
    .setRequired(false);

  // ----- 食事 -----
  form.addSectionHeaderItem().setTitle('食事について');

  form.addMultipleChoiceItem()
    .setTitle('食事の好き嫌い')
    .setChoiceValues(['何でも食べる', '好き嫌いがある'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('好きな食べ物・おやつ')
    .setRequired(false);

  form.addTextItem()
    .setTitle('嫌いな食べ物・おやつ')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('食事方法')
    .setChoiceValues(['自分で食べる', '大人が食べさせる', '一部介助が必要'])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('※自分で食べる場合、使用するもの')
    .setChoiceValues(['手づかみ', 'スプーン', 'フォーク', '箸'])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('食事量')
    .setChoiceValues(['多い', '普通', '少ない', 'ムラがある'])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('食事に関する具体的な配慮があればご記入ください')
    .setRequired(false);

  // ----- 言語 -----
  form.addSectionHeaderItem().setTitle('言語について');

  form.addMultipleChoiceItem()
    .setTitle('発語状況')
    .setChoiceValues(['言葉が出ている', '言葉が出ていない', '単語のみ', 'その他'])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('発語について詳しく教えてください')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('言葉ではないが、指さしや動作で自分の気持ちを表現しますか？')
    .setChoiceValues(['表現する', '表現しない'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('簡単な言葉（「ちょうだい」「バイバイ」など）が分かりますか？')
    .setChoiceValues(['わかる', 'わからない'])
    .setRequired(true);

  // ----- 運動・感覚 -----
  form.addSectionHeaderItem().setTitle('運動・感覚について');

  form.addMultipleChoiceItem()
    .setTitle('身体を動かす遊びは？')
    .setChoiceValues(['好き', '苦手'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('戸外あそびは？')
    .setChoiceValues(['好き', '苦手'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('音に敏感な様子がありますか？')
    .setChoiceValues(['ある', 'ない'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('※音に敏感な場合、どんな音を嫌がりますか？')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('さわったり濡れることを嫌がることがありますか？')
    .setChoiceValues(['ある', 'ない'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('※嫌がる場合、どんな物（事）を嫌がりますか？')
    .setRequired(false);

  // ----- あそび -----
  form.addSectionHeaderItem().setTitle('あそびについて');

  form.addMultipleChoiceItem()
    .setTitle('他のお子さんに興味がありますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('特に仲のいいお子さんはいますか？')
    .setChoiceValues(['はい', 'いいえ'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('大人とあそぶことを好みますか？')
    .setChoiceValues(['はい', '1人あそびが多い'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('どんな遊びが好きですか？')
    .setRequired(false);

  form.addTextItem()
    .setTitle('お気に入りのおもちゃなどは？')
    .setRequired(false);

  form.addTextItem()
    .setTitle('好きな絵本は？')
    .setRequired(false);

  form.addTextItem()
    .setTitle('興味のあるキャラクターは？')
    .setRequired(false);

  // ----- コミュニケーション（就学児固有） -----
  form.addSectionHeaderItem().setTitle('お子さんのコミュニケーションについて');

  form.addMultipleChoiceItem()
    .setTitle('お子さんは、学校での出来事をご家族に話しますか？')
    .setChoiceValues(['話す', '話さない'])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('※話す場合、どんな話をしますか？')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('お子さんは、自分の気持ちをご家族に話しますか？')
    .setChoiceValues(['話す', '話さない'])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('※話す場合、どんな話をしますか？')
    .setRequired(false);

  // ----- 自由記述 -----
  form.addSectionHeaderItem().setTitle('お子さんについて教えてください');

  form.addParagraphTextItem()
    .setTitle('お子さんはどんな性格だと思いますか？')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('以前は出来なかったけど、出来るようになったことはありますか？')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('お子さんにどのように育ってほしい（どのように育てたい）ですか？')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('現在、子育てをしていて、困っていること・悩んでいること・心配ごとはありますか？')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('学校生活やご家庭で困っていることはありますか？')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('支援で特に見てほしいことはありますか？')
    .setRequired(false);
}

/**
 * 継続アセスメントセクション
 */
function buildContinuationSection(form, pageBreak) {
  pageBreak.setHelpText('継続利用のアセスメントです。\n現在のお子さんのご様子についてお聞かせください。');

  form.addTextItem()
    .setTitle('お子さんのお名前')
    .setRequired(true);

  form.addTextItem()
    .setTitle('お子さんのお名前（ふりがな）')
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('お子さんの区分')
    .setChoiceValues(['未就学児', '就学児'])
    .setRequired(true);

  // ----- 就学児用の質問 -----
  form.addSectionHeaderItem().setTitle('学校でのご様子（就学児の方のみご回答ください）');

  form.addMultipleChoiceItem()
    .setTitle('お子さんは、学校での出来事をご家族に話しますか？')
    .setChoiceValues(['話す', '話さない', '該当なし（未就学児）'])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('※話す場合、どんな話をしますか？')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('お子さんは、自分の気持ちをご家族に話しますか？')
    .setChoiceValues(['話す', '話さない'])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('※話す場合、どんな話をしますか？')
    .setRequired(false);

  // ----- 共通 -----
  form.addSectionHeaderItem().setTitle('お子さんについて教えてください');

  form.addParagraphTextItem()
    .setTitle('お子さんはどんな性格だと思いますか？')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('以前は出来なかったけど、出来るようになったことはありますか？')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('お子さんにどのように育ってほしい（どのように育てたい）ですか？')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('現在、子育てをしていて、困っていること・悩んでいること・心配ごとはありますか？')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('通所園・学校に対しての願い（要望・希望）はありますか？')
    .setRequired(false);
}

/**
 * 共通終了セクション（写真・送迎）
 */
function buildCommonEndSection(form, pageBreak) {
  pageBreak.setHelpText('最後に、写真掲載と送迎についてお答えください。');

  // ----- 写真掲載 -----
  form.addSectionHeaderItem().setTitle('写真掲載について');

  form.addMultipleChoiceItem()
    .setTitle('活動中の写真掲載について')
    .setHelpText('POLEPOLEの活動報告やお便り等での写真掲載についてお聞きします。')
    .setChoiceValues([
      PHOTO_CONSENT.AGREE,
      PHOTO_CONSENT.DISAGREE,
      PHOTO_CONSENT.CONDITIONAL
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('※「条件付きで同意する」の場合、条件をご記入ください')
    .setHelpText('例：施設内の掲示のみ可、SNSへの掲載は不可等')
    .setRequired(false);

  // ----- 送迎 -----
  form.addSectionHeaderItem().setTitle('送迎について');

  const transportItem = form.addMultipleChoiceItem()
    .setTitle('送迎を希望しますか？')
    .setChoiceValues([
      TRANSPORT_OPTIONS.YES,
      TRANSPORT_OPTIONS.NO
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('送迎について補足事項があればご記入ください')
    .setRequired(false);

  // 送迎先の住所（送迎ありの場合のみ記入）
  form.addTextItem()
    .setTitle('送迎先の住所（送迎を希望する場合にご記入ください）')
    .setHelpText('基本情報の住所と異なる場合にご記入ください。同じ場合は「同上」とご記入ください。')
    .setRequired(false);
}
