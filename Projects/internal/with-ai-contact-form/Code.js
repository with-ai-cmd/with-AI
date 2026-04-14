function createContactForm() {
  var form = FormApp.create('with-AI お問い合わせ');
  form.setDescription('with-AI株式会社へのお問い合わせフォームです。2営業日以内にご連絡いたします。');
  form.setConfirmationMessage('お問い合わせありがとうございます。2営業日以内にご連絡いたします。');
  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);

  var q1 = form.addTextItem();
  q1.setTitle('お名前');
  q1.setRequired(true);

  var q2 = form.addTextItem();
  q2.setTitle('会社名');
  q2.setRequired(false);

  var q3 = form.addTextItem();
  q3.setTitle('メールアドレス');
  q3.setRequired(true);

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

  var q5 = form.addParagraphTextItem();
  q5.setTitle('お問い合わせ内容');
  q5.setRequired(true);

  ScriptApp.newTrigger('sendNotification')
    .forForm(form)
    .onFormSubmit()
    .create();

  var items = form.getItems();
  var formId = form.getId();

  Logger.log('===RESULT_START===');
  Logger.log('FORM_ID:' + formId);
  for (var i = 0; i < items.length; i++) {
    Logger.log('ENTRY_' + i + ':' + items[i].getId() + ':' + items[i].getTitle());
  }
  Logger.log('===RESULT_END===');

  return formId;
}

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

  MailApp.sendEmail({
    to: 'katsumata.k@with-ai.jp',
    subject: '【with-AI】新しいお問い合わせ: ' + responses[0].getResponse(),
    body: body
  });
}
