/**
 * ============================================
 * フォーム送信時の自動処理（トリガーハンドラ）
 * ============================================
 *
 * フォームが送信されると自動的に実行されます。
 * 1. 各シートへのデータ振り分け
 * 2. ドライブフォルダの作成
 */

function onFormSubmit(e) {
  try {
    const response = e.response;
    const itemResponses = response.getItemResponses();

    // 回答をオブジェクトに変換
    const answers = {};
    itemResponses.forEach(function(itemResponse) {
      answers[itemResponse.getItem().getTitle()] = itemResponse.getResponse();
    });

    Logger.log('フォーム回答受信: ' + JSON.stringify(answers));

    // 利用区分を判定
    const enrollmentType = answers['利用区分を選択してください'] || '';
    const childName = answers['お子さんのお名前'] || '';
    const timestamp = new Date();

    // 1. 各シートにデータを振り分け
    distributeToSheets(answers, enrollmentType, timestamp);

    // 2. 新規の場合のみドライブフォルダを作成
    if (enrollmentType !== ENROLLMENT_TYPES.CONTINUATION) {
      const photoConsent = answers['活動中の写真掲載について'] || '';
      createChildFolder(childName, photoConsent, enrollmentType);
    } else {
      // 継続の場合は経年変化シートに追加
      addYearlyChangeData(answers, timestamp);
    }

    Logger.log('処理完了: ' + childName);

  } catch (error) {
    Logger.log('onFormSubmitエラー: ' + error.message);
    Logger.log(error.stack);
    // エラー通知メールを送信
    MailApp.sendEmail(
      Session.getActiveUser().getEmail(),
      '[POLEPOLE] フォーム処理エラー',
      'フォーム送信の自動処理でエラーが発生しました。\n\n' +
      'エラー内容: ' + error.message + '\n\n' +
      'スタックトレース:\n' + error.stack
    );
  }
}

/**
 * 各シートにデータを振り分け
 */
function distributeToSheets(answers, enrollmentType, timestamp) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ----- 基本情報一覧 -----
  if (enrollmentType !== ENROLLMENT_TYPES.CONTINUATION) {
    const basicSheet = ss.getSheetByName(SHEET_NAMES.BASIC_INFO);
    if (basicSheet) {
      basicSheet.appendRow([
        timestamp,
        enrollmentType,
        answers['お子さんのお名前'] || '',
        answers['お子さんのお名前（ふりがな）'] || '',
        answers['呼び名（ニックネーム）'] || '',
        answers['生年月日'] || '',
        answers['年齢（例：3歳5ヶ月）'] || '',
        answers['性別'] || '',
        answers['平熱（例：36.5）'] || '',
        answers['血液型'] || '',
        answers['RH'] || '',
        answers['所属している保育園・幼稚園・学校'] || '',
        answers['通所している支援事業所'] || '',
        answers['通所受給者証'] || '',
        answers['発達検査を受けた機関'] || '',
        answers['具体的な診断名（なしの場合は「なし」とご記入ください）'] || '',
        answers['その他医療機関'] || '',
        answers['治療中の病気・既往歴（なしの場合は「なし」）'] || '',
      ]);
    }
  }

  // ----- アレルギー情報 -----
  if (enrollmentType !== ENROLLMENT_TYPES.CONTINUATION) {
    const allergySheet = ss.getSheetByName(SHEET_NAMES.ALLERGY);
    if (allergySheet) {
      const hasAllergy = answers['アレルギーの有無'] || '';
      allergySheet.appendRow([
        timestamp,
        answers['お子さんのお名前'] || '',
        answers['お子さんのお名前（ふりがな）'] || '',
        hasAllergy,
        answers['アレルギーの詳細（ありの場合、具体的にご記入ください）'] || '',
        answers['食事に関する具体的な配慮があればご記入ください'] || '',
      ]);

      // アレルギーありの場合、行を赤色でハイライト
      if (hasAllergy === 'あり') {
        const lastRow = allergySheet.getLastRow();
        allergySheet.getRange(lastRow, 1, 1, allergySheet.getLastColumn())
          .setBackground('#FFCDD2');
      }
    }
  }

  // ----- 送迎一覧 -----
  if (enrollmentType !== ENROLLMENT_TYPES.CONTINUATION) {
    const transportSheet = ss.getSheetByName(SHEET_NAMES.TRANSPORT);
    if (transportSheet) {
      transportSheet.appendRow([
        timestamp,
        answers['お子さんのお名前'] || '',
        answers['お子さんのお名前（ふりがな）'] || '',
        answers['郵便番号（例：000-0000）'] || '',
        answers['住所（市町村名）'] || '',
        answers['住所（町名・番地・建物名）'] || '',
        answers['送迎を希望しますか？'] || '',
        answers['送迎先の住所（送迎を希望する場合にご記入ください）'] || '',
        answers['送迎について補足事項があればご記入ください'] || '',
      ]);

      // 送迎ありの場合、行を青色でハイライト
      if (answers['送迎を希望しますか？'] === TRANSPORT_OPTIONS.YES) {
        const lastRow = transportSheet.getLastRow();
        transportSheet.getRange(lastRow, 1, 1, transportSheet.getLastColumn())
          .setBackground('#BBDEFB');
      }
    }
  }

  // ----- 保護者連絡先 -----
  if (enrollmentType !== ENROLLMENT_TYPES.CONTINUATION) {
    const contactSheet = ss.getSheetByName(SHEET_NAMES.CONTACT);
    if (contactSheet) {
      contactSheet.appendRow([
        timestamp,
        answers['お子さんのお名前'] || '',
        answers['保護者メールアドレス'] || '',
        answers['電話番号（自宅）'] || '',
        answers['携帯電話番号①（保護者名：　　　）'] || '',
        answers['携帯電話番号②（保護者名：　　　）'] || '',
        answers['緊急連絡先① 氏名'] || '',
        answers['緊急連絡先① 続柄'] || '',
        answers['緊急連絡先① 電話番号'] || '',
        answers['緊急連絡先② 氏名'] || '',
        answers['緊急連絡先② 続柄'] || '',
        answers['緊急連絡先② 電話番号'] || '',
        answers['連絡に関する補足事項'] || '',
      ]);
    }
  }

  // ----- アセスメント回答一覧 -----
  const assessmentSheet = ss.getSheetByName(SHEET_NAMES.ASSESSMENT);
  if (assessmentSheet) {
    // アセスメント関連の全回答を記録
    const assessmentData = [
      timestamp,
      enrollmentType,
      answers['お子さんのお名前'] || '',
    ];

    // 行動面
    const behaviorKeys = [
      '視線は合いますか？',
      '興味を持った時、指をさして伝えますか？',
      '指さしをした方向を一緒に見ますか？',
      'オウム返しが目立ちますか？',
      'だっこされることを嫌がりますか？',
      '体を同じパターンで動かし続けますか？',
      '予定の変更でパニックになったりしますか？',
      '思い通りにならないとかんしゃくを起こしたりしますか？',
      'かんしゃく等がある場合、どのように対処していますか？',
    ];

    behaviorKeys.forEach(function(key) {
      assessmentData.push(answers[key] || '');
    });

    // 発語・排泄・衣服・食事・運動・あそび
    const dailyKeys = [
      '発語状況',
      '発語について詳しく教えてください',
      'パンツの種類',
      '尿意や便意を教えますか？',
      'トイレでしますか？',
      '排泄について補足があればご記入ください',
      '食事の好き嫌い',
      '好きな食べ物・おやつ',
      '嫌いな食べ物・おやつ',
      '食事方法',
      '食事量',
      '身体を動かす遊びは？',
      '戸外あそびは？',
      '音に敏感な様子がありますか？',
      'さわったり濡れることを嫌がることがありますか？',
      '他の子どもに興味がありますか？',
      'どんな遊びが好きですか？',
    ];

    dailyKeys.forEach(function(key) {
      assessmentData.push(answers[key] || '');
    });

    // 自由記述
    const freeTextKeys = [
      'お子さんはどんな性格だと思いますか？',
      '以前は出来なかったけど、出来るようになったことはありますか？',
      '現在、子育てをしていて、困っていること・悩んでいること・心配ごとはありますか？',
    ];

    freeTextKeys.forEach(function(key) {
      assessmentData.push(answers[key] || '');
    });

    assessmentSheet.appendRow(assessmentData);
  }
}

/**
 * 経年変化シートにデータを追加
 */
function addYearlyChangeData(answers, timestamp) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const yearlySheet = ss.getSheetByName(SHEET_NAMES.YEARLY_CHANGE);

  if (!yearlySheet) return;

  const childName = answers['お子さんのお名前'] || '';
  const year = timestamp.getFullYear();
  const month = timestamp.getMonth() + 1;

  yearlySheet.appendRow([
    timestamp,
    year + '年度',
    childName,
    answers['お子さんのお名前（ふりがな）'] || '',
    answers['お子さんの区分'] || '',
    answers['お子さんは、学校での出来事をご家族に話しますか？'] || '',
    answers['※話す場合、どんな話をしますか？'] || '',
    answers['お子さんは、自分の気持ちをご家族に話しますか？'] || '',
    answers['お子さんはどんな性格だと思いますか？'] || '',
    answers['以前は出来なかったけど、出来るようになったことはありますか？'] || '',
    answers['お子さんにどのように育ってほしい（どのように育てたい）ですか？'] || '',
    answers['現在、子育てをしていて、困っていること・悩んでいること・心配ごとはありますか？'] || '',
    answers['通所園・学校に対しての願い（要望・希望）はありますか？'] || '',
  ]);
}
