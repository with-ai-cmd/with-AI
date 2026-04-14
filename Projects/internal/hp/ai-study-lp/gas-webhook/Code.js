/**
 * Webアプリとしてデプロイし、カスタムフォームからPOSTを受ける
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // スプレッドシートに書き込み
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName('回答') || ss.getSheets()[0];

    sheet.appendRow([
      new Date(),
      data.name,
      data.email,
      data.company,
      data.position,
      data.phone,
      data.date,
      data.ai_usage,
      data.question,
      data.source
    ]);

    // サンクスメール送信
    sendThankYouEmail(data.name, data.email);

    return ContentService.createTextOutput(JSON.stringify({result: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({result: 'error', message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({status: 'ok'}))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * サンクスメール送信
 */
function sendThankYouEmail(name, email) {
  if (!email) return;

  var subject = '【with-AI】社長のためのAI勉強会 お申し込みありがとうございます';

  var body = name + ' 様\n\n'
    + 'この度は「社長のためのAI勉強会」にお申し込みいただき、\n'
    + '誠にありがとうございます。\n\n'
    + '━━━━━━━━━━━━━━━━━━━━\n'
    + '■ 開催概要\n'
    + '━━━━━━━━━━━━━━━━━━━━\n'
    + '日時：2026年4月21日（月）21:00〜22:00\n'
    + 'テーマ：話題の「Claude」で何ができるのか？\n'
    + '形式：オンライン（Zoom）\n'
    + '参加費：無料\n\n'
    + '━━━━━━━━━━━━━━━━━━━━\n'
    + '■ Zoom参加情報\n'
    + '━━━━━━━━━━━━━━━━━━━━\n'
    + '参加URL：https://us06web.zoom.us/j/82191424758?pwd=32ajU8VgBqPmv42MfpYbGfKounlQLI.1\n'
    + 'ミーティングID：821 9142 4758\n'
    + 'パスコード：291945\n\n'
    + '※ 当日のお時間になりましたら上記URLをクリックしてご参加ください。\n\n'
    + 'ご不明な点がございましたら、\n'
    + 'お気軽にこのメールにご返信ください。\n\n'
    + name + '様にお会いできることを楽しみにしております。\n\n'
    + '──────────────────\n'
    + 'with-AI株式会社\n'
    + '代表取締役 勝又 海斗\n'
    + 'https://with-ai.jp/\n'
    + '──────────────────\n';

  GmailApp.sendEmail(email, subject, body, {
    name: 'with-AI株式会社',
    replyTo: 'info@with-ai.jp'
  });
}

// スプレッドシートを初期化
function setupSheet() {
  var ss = SpreadsheetApp.create('AI勉強会 申し込み一覧');
  var sheet = ss.getSheets()[0];
  sheet.setName('回答');
  sheet.appendRow(['タイムスタンプ', 'お名前', 'メールアドレス', '会社名', '役職', '電話番号', '参加希望日', 'AI活用状況', '聞きたいこと', '知ったきっかけ']);
  sheet.setFrozenRows(1);

  Logger.log('Sheet ID: ' + ss.getId());
  Logger.log('Sheet URL: ' + ss.getUrl());
  Logger.log('⚠️ このIDをCode.gsのSHEET_IDに設定してください');
}

var SHEET_ID = '1SQ1cEkoYcnliUdLzz_9mYQaYWJeeUMAK_AM5RmIoviM';
