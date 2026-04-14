// フォーム送信時のトリガー（Google Forms UIからの送信用）
function sendNotification(e) {
  var responses = e.response.getItemResponses();
  var body = buildEmailBody(responses);
  MailApp.sendEmail({
    to: 'katsumata.k@with-ai.jp',
    subject: '【with-AI】新しいお問い合わせ: ' + responses[0].getResponse(),
    body: body
  });
}

function buildEmailBody(responses) {
  var body = '【with-AI HP】新しいお問い合わせが届きました\n\n';
  body += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
  for (var i = 0; i < responses.length; i++) {
    body += '■ ' + responses[i].getItem().getTitle() + '\n';
    body += responses[i].getResponse() + '\n\n';
  }
  body += '━━━━━━━━━━━━━━━━━━━━━━\n';
  body += '送信日時: ' + new Date().toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'});
  return body;
}

// Webアプリ（HP contact.htmlからの送信用）— GET/POST両対応
function doPost(e) { return handleWebSubmit(e.parameter); }
function doGet(e) { return handleWebSubmit(e.parameter); }

function handleWebSubmit(params) {
  var name = params.name || '';
  var company = params.company || '';
  var email = params.email || '';
  var service = params.service || '';
  var message = params.message || '';

  // 空なら無視
  if (!name && !email) {
    return ContentService.createTextOutput('<html><body>No data</body></html>')
      .setMimeType(ContentService.MimeType.HTML);
  }

  // Google Formにも記録
  try {
    var form = FormApp.getActiveForm();
    var formResponse = form.createResponse();
    var items = form.getItems();
    for (var i = 0; i < items.length; i++) {
      var title = items[i].getTitle();
      var val = '';
      if (title === 'お名前') val = name;
      else if (title === '会社名') val = company;
      else if (title === 'メールアドレス') val = email;
      else if (title === 'ご相談サービス') val = service;
      else if (title === 'お問い合わせ内容') val = message;
      if (val) {
        try {
          if (items[i].getType() == FormApp.ItemType.TEXT) {
            formResponse.withItemResponse(items[i].asTextItem().createResponse(val));
          } else if (items[i].getType() == FormApp.ItemType.PARAGRAPH_TEXT) {
            formResponse.withItemResponse(items[i].asParagraphTextItem().createResponse(val));
          } else if (items[i].getType() == FormApp.ItemType.LIST) {
            formResponse.withItemResponse(items[i].asListItem().createResponse(val));
          }
        } catch(err) {}
      }
    }
    formResponse.submit();
  } catch(err) {}

  // メール送信
  var body = '【with-AI HP】新しいお問い合わせが届きました\n\n';
  body += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
  body += '■ お名前\n' + name + '\n\n';
  body += '■ 会社名\n' + company + '\n\n';
  body += '■ メールアドレス\n' + email + '\n\n';
  body += '■ ご相談サービス\n' + service + '\n\n';
  body += '■ お問い合わせ内容\n' + message + '\n\n';
  body += '━━━━━━━━━━━━━━━━━━━━━━\n';
  body += '送信日時: ' + new Date().toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'}) + '\n';
  body += '送信元: with-AI HP contact form';

  MailApp.sendEmail({
    to: 'katsumata.k@with-ai.jp',
    subject: '【with-AI】新しいお問い合わせ: ' + name,
    body: body,
    replyTo: email || undefined
  });

  // 成功HTMLを返す（iframe内に表示される）
  return ContentService.createTextOutput('<html><body>OK</body></html>')
    .setMimeType(ContentService.MimeType.HTML);
}

function setupTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  ScriptApp.newTrigger('sendNotification')
    .forForm(FormApp.getActiveForm())
    .onFormSubmit()
    .create();
  Logger.log('Trigger set up successfully!');
}
