/**
 * フォーム送信時に自動でサンクスメールを送信する
 */
function onFormSubmit(e) {
  var responses = e.response.getItemResponses();

  var name = '';
  var email = '';
  var company = '';

  // 回答からメールと名前を取得
  responses.forEach(function(item) {
    var title = item.getItem().getTitle();
    var answer = item.getResponse();
    if (title === 'お名前') name = answer;
    if (title === 'メールアドレス') email = answer;
    if (title === '会社名') company = answer;
  });

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

/**
 * フォームにトリガーを設定する（初回のみ実行）
 */
function setupTrigger() {
  var form = FormApp.openById('1aVIuwMhxrFZ1Z4ciigkqYs9C7sJGsuujU6KvPejQk_c');
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
  Logger.log('トリガー設定完了');
}
