/**
 * with-AI お問い合わせフォーム自動作成スクリプト
 *
 * 使い方:
 * 1. https://script.google.com にアクセス（katsumata.k@with-ai.jp のGoogleアカウントでログイン）
 * 2. 「新しいプロジェクト」をクリック
 * 3. このファイルの中身を全て貼り付け
 * 4. 上部の「実行」ボタンを押す（初回は権限の許可が必要）
 * 5. 「実行ログ」に表示されるURLとentry IDをコピーしてClaudeに渡す
 */

function createContactForm() {
  // フォーム作成
  var form = FormApp.create('with-AI お問い合わせ');
  form.setDescription('with-AI株式会社へのお問い合わせフォームです。2営業日以内にご連絡いたします。');
  form.setConfirmationMessage('お問い合わせありがとうございます。2営業日以内にご連絡いたします。');
  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);

  // 質問1: お名前（必須）
  var q1 = form.addTextItem();
  q1.setTitle('お名前');
  q1.setRequired(true);

  // 質問2: 会社名（任意）
  var q2 = form.addTextItem();
  q2.setTitle('会社名');
  q2.setRequired(false);

  // 質問3: メールアドレス（必須）
  var q3 = form.addTextItem();
  q3.setTitle('メールアドレス');
  q3.setRequired(true);
  q3.setValidation(FormApp.createTextValidation()
    .requireTextMatchesPattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')
    .setHelpText('有効なメールアドレスを入力してください')
    .build());

  // 質問4: ご相談サービス（ドロップダウン）
  var q4 = form.addListItem();
  q4.setTitle('ご相談サービス');
  q4.setRequired(false);
  q4.setChoices([
    q4.createChoice('AIKOMON（伴走支援）'),
    q4.createChoice('AI SHINE（エージェント構築）'),
    q4.createChoice('with-AI Plus（教育）'),
    q4.createChoice('System Design（開発）'),
    q4.createChoice('Inspire Recruit（採用）'),
    q4.createChoice('その他')
  ]);

  // 質問5: お問い合わせ内容（必須）
  var q5 = form.addParagraphTextItem();
  q5.setTitle('お問い合わせ内容');
  q5.setRequired(true);

  // === 結果を出力 ===
  var formUrl = form.getPublishedUrl();
  var editUrl = form.getEditUrl();

  // entry IDを取得
  var items = form.getItems();
  var entryIds = [];
  for (var i = 0; i < items.length; i++) {
    entryIds.push({
      title: items[i].getTitle(),
      id: items[i].getId()
    });
  }

  // フォームIDを抽出（formResponseのURL用）
  var formId = form.getId();
  var responseUrl = 'https://docs.google.com/forms/d/e/' + formId + '/formResponse';

  Logger.log('========================================');
  Logger.log('フォーム作成完了！');
  Logger.log('========================================');
  Logger.log('');
  Logger.log('フォーム編集URL: ' + editUrl);
  Logger.log('フォーム回答URL: ' + formUrl);
  Logger.log('');
  Logger.log('=== 以下をClaudeに渡してください ===');
  Logger.log('');
  Logger.log('RESPONSE_URL: ' + responseUrl);
  for (var j = 0; j < entryIds.length; j++) {
    Logger.log('ENTRY [' + entryIds[j].title + ']: entry.' + entryIds[j].id);
  }
  Logger.log('');
  Logger.log('========================================');
  Logger.log('');
  Logger.log('メール通知トリガーを設定中...');

  // onFormSubmit トリガーを自動設定
  ScriptApp.newTrigger('sendNotification')
    .forForm(form)
    .onFormSubmit()
    .create();

  Logger.log('トリガー設定完了！回答が届くと katsumata.k@with-ai.jp にメール通知されます');
}

/**
 * フォーム送信時に katsumata.k@with-ai.jp へメール通知
 */
function sendNotification(e) {
  var responses = e.response.getItemResponses();
  var body = '【with-AI HP】新しいお問い合わせが届きました\n\n';
  body += '━━━━━━━━━━━━━━━━━━━━━━\n\n';

  for (var i = 0; i < responses.length; i++) {
    body += '■ ' + responses[i].getItem().getTitle() + '\n';
    body += responses[i].getResponse() + '\n\n';
  }

  body += '━━━━━━━━━━━━━━━━━━━━━━\n';
  body += '送信日時: ' + new Date().toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'}) + '\n';
  body += 'Google Forms 回答一覧: https://docs.google.com/forms/d/' + e.source.getId() + '/edit#responses';

  MailApp.sendEmail({
    to: 'katsumata.k@with-ai.jp',
    subject: '【with-AI】新しいお問い合わせ: ' + responses[0].getResponse(),
    body: body
  });
}
