/**
 * ============================================
 * メール下書き作成・送信管理
 * ============================================
 *
 * 契約書をPDFに変換し、保護者へのメール下書きを作成します。
 * スタッフが署名調整後、ボタンを押すだけで送信できます。
 */

/**
 * メール下書き作成ダイアログを表示
 */
function showEmailDraftDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const contactSheet = ss.getSheetByName(SHEET_NAMES.CONTACT);

  if (!contactSheet || contactSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('連絡先情報が登録されていません。');
    return;
  }

  // 児童一覧を取得
  const data = contactSheet.getDataRange().getValues();
  const children = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] && data[i][2]) { // 氏名とメールアドレスがある行
      children.push({
        name: data[i][1],
        email: data[i][2],
        row: i + 1,
      });
    }
  }

  const childOptions = children.map(function(c) {
    return '<option value="' + c.row + '">' + c.name + '（' + c.email + '）</option>';
  }).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 16px; }
      label { display: block; margin-top: 12px; font-weight: bold; }
      select, input, textarea { width: 100%; padding: 8px; margin-top: 4px; box-sizing: border-box; }
      textarea { height: 120px; }
      .btn-group { margin-top: 16px; display: flex; gap: 8px; }
      button { padding: 10px 20px; color: white; border: none; cursor: pointer; border-radius: 4px; }
      .btn-draft { background: #FF9800; }
      .btn-draft:hover { background: #F57C00; }
      .btn-send { background: #4CAF50; }
      .btn-send:hover { background: #388E3C; }
      .info { color: #666; font-size: 12px; margin-top: 4px; }
    </style>
    <h3>保護者へのメール</h3>

    <label>児童を選択</label>
    <select id="childRow" onchange="updatePreview()">${childOptions}</select>

    <label>メールの種類</label>
    <select id="emailType" onchange="updateTemplate()">
      <option value="contract">契約書送付</option>
      <option value="welcome">入園のご案内</option>
      <option value="custom">カスタム</option>
    </select>

    <label>件名</label>
    <input type="text" id="subject" value="【POLEPOLE】利用契約書のご送付">

    <label>本文</label>
    <textarea id="body"></textarea>

    <label>契約書PDFを添付</label>
    <select id="attachPdf">
      <option value="yes">添付する</option>
      <option value="no">添付しない</option>
    </select>
    <p class="info">※ 児童フォルダ内の「契約書控え」から最新のファイルを添付します</p>

    <div class="btn-group">
      <button class="btn-draft" onclick="createDraft()">下書き保存</button>
      <button class="btn-send" onclick="sendNow()">今すぐ送信</button>
    </div>

    <script>
      function updateTemplate() {
        const type = document.getElementById('emailType').value;
        const subject = document.getElementById('subject');
        const body = document.getElementById('body');

        if (type === 'contract') {
          subject.value = '【POLEPOLE】利用契約書のご送付';
          body.value = '保護者様\\n\\nいつもお世話になっております。\\nPOLEPOLEでございます。\\n\\n利用契約書を送付いたします。\\n内容をご確認いただき、ご署名の上ご返送をお願いいたします。\\n\\nご不明な点がございましたら、お気軽にお問い合わせください。\\n\\nPOLEPOLE 事務局';
        } else if (type === 'welcome') {
          subject.value = '【POLEPOLE】ご入園のご案内';
          body.value = '保護者様\\n\\nこの度はPOLEPOLEへのご入園、誠にありがとうございます。\\n\\nお子様と一緒に活動できることを、スタッフ一同楽しみにしております。\\n\\n今後の流れにつきまして、別途ご連絡させていただきます。\\n\\nPOLEPOLE 事務局';
        } else {
          subject.value = '【POLEPOLE】';
          body.value = '';
        }
      }

      function createDraft() {
        const row = document.getElementById('childRow').value;
        const subject = document.getElementById('subject').value;
        const body = document.getElementById('body').value;
        const attachPdf = document.getElementById('attachPdf').value;

        google.script.run
          .withSuccessHandler(function() {
            alert('下書きを作成しました。\\nGmailの下書きフォルダをご確認ください。');
            google.script.host.close();
          })
          .withFailureHandler(function(e) { alert('エラー: ' + e.message); })
          .createEmailDraft(parseInt(row), subject, body, attachPdf === 'yes');
      }

      function sendNow() {
        if (!confirm('このメールを今すぐ送信しますか？')) return;

        const row = document.getElementById('childRow').value;
        const subject = document.getElementById('subject').value;
        const body = document.getElementById('body').value;
        const attachPdf = document.getElementById('attachPdf').value;

        google.script.run
          .withSuccessHandler(function() {
            alert('メールを送信しました。');
            google.script.host.close();
          })
          .withFailureHandler(function(e) { alert('エラー: ' + e.message); })
          .sendEmailNow(parseInt(row), subject, body, attachPdf === 'yes');
      }

      // 初期表示時にテンプレートを読み込み
      updateTemplate();
    </script>
  `).setWidth(500).setHeight(620);

  SpreadsheetApp.getUi().showModalDialog(html, 'メール作成');
}

/**
 * メール下書きを作成
 */
function createEmailDraft(contactRow, subject, bodyText, attachPdf) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const contactSheet = ss.getSheetByName(SHEET_NAMES.CONTACT);
  const contactData = contactSheet.getRange(contactRow, 1, 1, contactSheet.getLastColumn()).getValues()[0];

  const childName = contactData[1];
  const email = contactData[2];

  if (!email) {
    throw new Error('メールアドレスが登録されていません: ' + childName);
  }

  // 本文内の改行を処理
  const htmlBody = bodyText.replace(/\n/g, '<br>');

  const options = {
    htmlBody: htmlBody,
    name: CONFIG.EMAIL_SENDER_NAME,
  };

  // PDF添付
  if (attachPdf) {
    const pdfBlob = getContractPdf(childName);
    if (pdfBlob) {
      options.attachments = [pdfBlob];
    }
  }

  // 下書き作成
  GmailApp.createDraft(email, subject, bodyText, options);

  Logger.log('メール下書き作成完了: ' + childName + ' (' + email + ')');
}

/**
 * メールを即時送信
 */
function sendEmailNow(contactRow, subject, bodyText, attachPdf) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const contactSheet = ss.getSheetByName(SHEET_NAMES.CONTACT);
  const contactData = contactSheet.getRange(contactRow, 1, 1, contactSheet.getLastColumn()).getValues()[0];

  const childName = contactData[1];
  const email = contactData[2];

  if (!email) {
    throw new Error('メールアドレスが登録されていません: ' + childName);
  }

  const htmlBody = bodyText.replace(/\n/g, '<br>');

  const options = {
    htmlBody: htmlBody,
    name: CONFIG.EMAIL_SENDER_NAME,
  };

  if (attachPdf) {
    const pdfBlob = getContractPdf(childName);
    if (pdfBlob) {
      options.attachments = [pdfBlob];
    }
  }

  MailApp.sendEmail(email, subject, bodyText, options);

  Logger.log('メール送信完了: ' + childName + ' (' + email + ')');
}

/**
 * 契約書をPDFとして取得
 */
function getContractPdf(childName) {
  const rootFolderId = PropertiesService.getScriptProperties().getProperty(PROP_KEYS.ROOT_FOLDER_ID);
  if (!rootFolderId) return null;

  const rootFolder = DriveApp.getFolderById(rootFolderId);
  const childFolders = rootFolder.getFoldersByName(childName);

  if (!childFolders.hasNext()) return null;

  const childFolder = childFolders.next();
  const contractFolders = childFolder.getFoldersByName('契約書控え');

  if (!contractFolders.hasNext()) return null;

  const contractFolder = contractFolders.next();
  const files = contractFolder.getFiles();

  // 最新のファイルを取得
  let latestFile = null;
  let latestDate = new Date(0);

  while (files.hasNext()) {
    const file = files.next();
    if (file.getDateCreated() > latestDate) {
      latestDate = file.getDateCreated();
      latestFile = file;
    }
  }

  if (!latestFile) return null;

  // GoogleドキュメントをPDFに変換
  if (latestFile.getMimeType() === MimeType.GOOGLE_DOCS) {
    const blob = DriveApp.getFileById(latestFile.getId()).getAs('application/pdf');
    blob.setName(childName + '_利用契約書.pdf');
    return blob;
  }

  // すでにPDFの場合はそのまま返す
  if (latestFile.getMimeType() === MimeType.PDF) {
    return latestFile.getBlob();
  }

  return null;
}
