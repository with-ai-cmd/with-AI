/**
 * スプレッドシートの登録者全員にリマインドメールを一斉送信
 */
function sendReminder() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('回答') || ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();

  var sent = 0;
  var skipped = 0;

  for (var i = 1; i < data.length; i++) {
    var name = data[i][1];
    var email = data[i][2];

    if (!email) {
      skipped++;
      continue;
    }

    var subject = '【明日開催】社長のためのAI勉強会 リマインド';

    var body = name + ' 様\n\n'
      + 'いよいよ明日、「社長のためのAI勉強会」を開催いたします。\n'
      + 'お忙しいところ恐れ入りますが、改めてご案内をお送りいたします。\n\n'
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
      + name + '様のご参加を心よりお待ちしております。\n\n'
      + '──────────────────\n'
      + 'with-AI株式会社\n'
      + '代表取締役 勝又 海斗\n'
      + 'https://with-ai.jp/\n'
      + '──────────────────\n';

    GmailApp.sendEmail(email, subject, body, {
      name: 'with-AI株式会社',
      replyTo: 'info@with-ai.jp'
    });
    sent++;
  }

  Logger.log('リマインド送信完了: ' + sent + '件 / スキップ: ' + skipped + '件');
}

/**
 * 初回のみ実行：前日(4/20) 10:00にリマインドを自動送信するトリガーを設定
 */
function setupReminderTrigger() {
  // 既存のリマインドトリガーを削除（重複防止）
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'sendReminder') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // 2026-04-20 10:00 JST にリマインド送信
  var reminderDate = new Date('2026-04-20T10:00:00+09:00');
  ScriptApp.newTrigger('sendReminder')
    .timeBased()
    .at(reminderDate)
    .create();

  Logger.log('リマインドトリガー設定完了: 2026-04-20 10:00 に自動送信されます');
}
