/**
 * ============================================
 * 契約書テンプレート管理
 * ============================================
 *
 * 1. 契約書テンプレート（Googleドキュメント）を自動作成
 * 2. 児童情報を差し込んで契約書を生成
 * 3. PDFに変換して児童フォルダに保存
 */

/**
 * 契約書テンプレートを作成
 */
function createContractTemplate() {
  const doc = DocumentApp.create(CONFIG.CONTRACT_TEMPLATE_NAME);
  const body = doc.getBody();

  // ----- テンプレートの内容 -----
  // ※ {{変数名}} はフォーム回答から自動差し込みされます

  body.appendParagraph('児童発達支援・放課後等デイサービス')
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER)
    .setFontSize(12);

  body.appendParagraph('POLEPOLE 利用契約書')
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER)
    .setFontSize(18)
    .setBold(true);

  body.appendParagraph('');

  body.appendParagraph('契約日：　　　　年　　　月　　　日')
    .setFontSize(11);

  body.appendParagraph('');

  // 甲（利用者）
  body.appendParagraph('【甲（利用者・保護者）】')
    .setBold(true).setFontSize(12);

  const userTable = body.appendTable([
    ['利用児童氏名', '{{児童氏名}}'],
    ['ふりがな', '{{ふりがな}}'],
    ['生年月日', '{{生年月日}}'],
    ['住所', '〒{{郵便番号}}\n{{市町村名}}{{町名番地}}'],
    ['保護者氏名', ''],
    ['電話番号', '{{携帯電話}}'],
    ['メールアドレス', '{{メールアドレス}}'],
  ]);
  formatTable(userTable);

  body.appendParagraph('');

  // 乙（事業者）
  body.appendParagraph('【乙（事業者）】')
    .setBold(true).setFontSize(12);

  const providerTable = body.appendTable([
    ['事業所名', 'POLEPOLE'],
    ['所在地', ''],
    ['代表者', ''],
    ['電話番号', ''],
  ]);
  formatTable(providerTable);

  body.appendParagraph('');

  // 契約内容
  body.appendParagraph('【契約内容】')
    .setBold(true).setFontSize(12);

  body.appendParagraph(
    '甲は、乙が提供する児童発達支援・放課後等デイサービスを利用するにあたり、' +
    '以下の事項について同意し、本契約を締結します。'
  ).setFontSize(11);

  body.appendParagraph('');

  // 条項
  const articles = [
    '第1条（目的）\n本契約は、甲の児童が乙の提供するサービスを利用するにあたり、必要な事項を定めることを目的とする。',
    '第2条（サービスの内容）\n乙は、甲の児童に対し、個別支援計画に基づいた児童発達支援・放課後等デイサービスを提供する。',
    '第3条（利用日及び利用時間）\n利用日及び利用時間は、甲乙協議の上、別途定める。',
    '第4条（利用料）\n利用料は、児童福祉法に基づく公費負担及び甲の自己負担額とする。',
    '第5条（送迎）\n送迎の有無及び内容については、甲乙協議の上、別途定める。',
    '第6条（個人情報の取扱い）\n乙は、甲の個人情報を適切に管理し、サービス提供の目的以外には使用しない。',
    '第7条（写真等の取扱い）\n活動記録等における写真掲載については、別途同意書による。',
    '第8条（契約の解除）\n甲又は乙は、30日前までに書面により通知することで、本契約を解除することができる。',
    '第9条（その他）\n本契約に定めのない事項については、甲乙誠意をもって協議し、解決する。',
  ];

  articles.forEach(function(article) {
    body.appendParagraph(article).setFontSize(11);
    body.appendParagraph('');
  });

  // 署名欄
  body.appendParagraph('上記の内容に同意し、本契約を締結します。')
    .setFontSize(11);

  body.appendParagraph('');
  body.appendParagraph('');

  const signTable = body.appendTable([
    ['甲（保護者）署名', '', '日付', '　　年　　月　　日'],
    ['乙（事業者）署名', '', '日付', '　　年　　月　　日'],
  ]);
  formatTable(signTable);

  doc.saveAndClose();

  // テンプレートフォルダに移動
  const rootFolderId = PropertiesService.getScriptProperties().getProperty(PROP_KEYS.ROOT_FOLDER_ID);
  if (rootFolderId) {
    const rootFolder = DriveApp.getFolderById(rootFolderId);
    const templateFolders = rootFolder.getFoldersByName('_テンプレート');
    if (templateFolders.hasNext()) {
      templateFolders.next().addFile(DriveApp.getFileById(doc.getId()));
      DriveApp.getRootFolder().removeFile(DriveApp.getFileById(doc.getId()));
    }
  }

  Logger.log('契約書テンプレート作成完了: ' + doc.getUrl());
  return doc.getId();
}

/**
 * テーブルの書式設定
 */
function formatTable(table) {
  for (var i = 0; i < table.getNumRows(); i++) {
    for (var j = 0; j < table.getRow(i).getNumCells(); j++) {
      table.getRow(i).getCell(j).setFontSize(11);
      if (j === 0) {
        table.getRow(i).getCell(j).setBackgroundColor('#F5F5F5');
        table.getRow(i).getCell(j).setBold(true);
      }
    }
  }
}

/**
 * 契約書を生成するダイアログ
 */
function showContractDialog() {
  // 基本情報シートから児童一覧を取得
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const basicSheet = ss.getSheetByName(SHEET_NAMES.BASIC_INFO);

  if (!basicSheet || basicSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('基本情報が登録されていません。');
    return;
  }

  const data = basicSheet.getDataRange().getValues();
  const children = [];
  for (var i = 1; i < data.length; i++) {
    children.push({
      name: data[i][2],  // 氏名
      furigana: data[i][3], // ふりがな
      row: i + 1,
    });
  }

  const childOptions = children.map(function(c) {
    return '<option value="' + c.row + '">' + c.name + '（' + c.furigana + '）</option>';
  }).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 16px; }
      label { display: block; margin-top: 12px; font-weight: bold; }
      select { width: 100%; padding: 8px; margin-top: 4px; }
      button { margin-top: 16px; padding: 10px 24px; background: #1976D2; color: white; border: none; cursor: pointer; border-radius: 4px; }
      button:hover { background: #1565C0; }
      .info { color: #666; font-size: 12px; margin-top: 8px; }
    </style>
    <h3>契約書作成</h3>
    <label>児童を選択</label>
    <select id="childRow">${childOptions}</select>
    <p class="info">※ テンプレートをコピーして児童情報を差し込みます。<br>
    作成後、署名部分を調整してください。</p>
    <button onclick="generate()">契約書を作成</button>
    <script>
      function generate() {
        const row = document.getElementById('childRow').value;
        google.script.run
          .withSuccessHandler(function(url) {
            alert('契約書を作成しました。\\nGoogleドキュメントで開きます。');
            window.open(url);
            google.script.host.close();
          })
          .withFailureHandler(function(e) { alert('エラー: ' + e.message); })
          .generateContract(parseInt(row));
      }
    </script>
  `).setWidth(400).setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, '契約書作成');
}

/**
 * 契約書を生成（テンプレートから児童情報を差し込み）
 */
function generateContract(basicInfoRow) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const basicSheet = ss.getSheetByName(SHEET_NAMES.BASIC_INFO);
  const contactSheet = ss.getSheetByName(SHEET_NAMES.CONTACT);
  const transportSheet = ss.getSheetByName(SHEET_NAMES.TRANSPORT);

  // 基本情報を取得
  const basicData = basicSheet.getRange(basicInfoRow, 1, 1, basicSheet.getLastColumn()).getValues()[0];
  const childName = basicData[2];
  const furigana = basicData[3];
  const birthDate = basicData[5];

  // 連絡先情報を取得（氏名で検索）
  const contactData = findRowByChildName(contactSheet, childName);
  const email = contactData ? contactData[2] : '';
  const phone = contactData ? contactData[4] : '';

  // 住所情報を取得
  const transportData = findRowByChildName(transportSheet, childName);
  const postalCode = transportData ? transportData[3] : '';
  const city = transportData ? transportData[4] : '';
  const address = transportData ? transportData[5] : '';

  // テンプレートをコピー
  const templateId = PropertiesService.getScriptProperties().getProperty(PROP_KEYS.CONTRACT_TEMPLATE_ID);
  const templateFile = DriveApp.getFileById(templateId);
  const newFile = templateFile.makeCopy(childName + '_利用契約書');

  // 差し込み
  const doc = DocumentApp.openById(newFile.getId());
  const body = doc.getBody();

  body.replaceText('\\{\\{児童氏名\\}\\}', childName);
  body.replaceText('\\{\\{ふりがな\\}\\}', furigana);
  body.replaceText('\\{\\{生年月日\\}\\}', birthDate ? Utilities.formatDate(new Date(birthDate), 'Asia/Tokyo', 'yyyy年MM月dd日') : '');
  body.replaceText('\\{\\{郵便番号\\}\\}', postalCode);
  body.replaceText('\\{\\{市町村名\\}\\}', city);
  body.replaceText('\\{\\{町名番地\\}\\}', address);
  body.replaceText('\\{\\{携帯電話\\}\\}', phone);
  body.replaceText('\\{\\{メールアドレス\\}\\}', email);

  doc.saveAndClose();

  // 児童フォルダの「契約書控え」に移動
  moveToChildContractFolder(childName, newFile);

  return doc.getUrl();
}

/**
 * 児童名でシート内を検索
 */
function findRowByChildName(sheet, childName) {
  if (!sheet || sheet.getLastRow() < 2) return null;

  const data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === childName) { // 氏名列（B列）
      return data[i];
    }
  }
  return null;
}

/**
 * 契約書ファイルを児童フォルダの「契約書控え」に移動
 */
function moveToChildContractFolder(childName, file) {
  const rootFolderId = PropertiesService.getScriptProperties().getProperty(PROP_KEYS.ROOT_FOLDER_ID);
  if (!rootFolderId) return;

  const rootFolder = DriveApp.getFolderById(rootFolderId);
  const childFolders = rootFolder.getFoldersByName(childName);

  if (childFolders.hasNext()) {
    const childFolder = childFolders.next();
    const contractFolders = childFolder.getFoldersByName('契約書控え');

    if (contractFolders.hasNext()) {
      contractFolders.next().addFile(file);
      DriveApp.getRootFolder().removeFile(file);
      Logger.log('契約書を「契約書控え」フォルダに移動: ' + childName);
    }
  }
}
