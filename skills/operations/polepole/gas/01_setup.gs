/**
 * ============================================
 * 初期セットアップ
 * ============================================
 *
 * 【使い方】
 * 1. Google Apps Scriptエディタでこのプロジェクトを開く
 * 2. 関数選択で「initialSetup」を選ぶ
 * 3. 「実行」ボタンを押す
 * 4. 権限の承認を行う
 *
 * これだけで、フォーム・スプレッドシート・ドライブフォルダが自動作成されます。
 */

function initialSetup() {
  const ui = SpreadsheetApp.getUi();

  // 確認ダイアログ
  const result = ui.alert(
    'POLEPOLE 初期セットアップ',
    '以下を自動作成します：\n' +
    '・Googleフォーム（入園手続き用）\n' +
    '・スプレッドシート（データ管理用・7シート）\n' +
    '・Googleドライブフォルダ（児童管理用）\n' +
    '・契約書テンプレート\n\n' +
    '実行しますか？',
    ui.ButtonSet.YES_NO
  );

  if (result !== ui.Button.YES) {
    ui.alert('セットアップをキャンセルしました。');
    return;
  }

  try {
    Logger.log('===== セットアップ開始 =====');

    // 1. スプレッドシートのシート構成を作成
    Logger.log('1. スプレッドシートを設定中...');
    setupSpreadsheet();

    // 2. Googleフォームを作成
    Logger.log('2. Googleフォームを作成中...');
    const formId = createEnrollmentForm();
    PropertiesService.getScriptProperties().setProperty(PROP_KEYS.FORM_ID, formId);

    // 3. ドライブのルートフォルダを作成
    Logger.log('3. ドライブフォルダを作成中...');
    const rootFolderId = createRootFolder();
    PropertiesService.getScriptProperties().setProperty(PROP_KEYS.ROOT_FOLDER_ID, rootFolderId);

    // 4. 契約書テンプレートを作成
    Logger.log('4. 契約書テンプレートを作成中...');
    const templateId = createContractTemplate();
    PropertiesService.getScriptProperties().setProperty(PROP_KEYS.CONTRACT_TEMPLATE_ID, templateId);

    // 5. フォーム送信トリガーを設定
    Logger.log('5. トリガーを設定中...');
    setupTrigger(formId);

    // 6. カスタムメニューを追加
    createCustomMenu();

    Logger.log('===== セットアップ完了 =====');

    ui.alert(
      'セットアップ完了',
      'すべての設定が完了しました！\n\n' +
      '【作成されたもの】\n' +
      '・Googleフォーム: ' + FormApp.openById(formId).getEditUrl() + '\n' +
      '・ドライブフォルダ: POLEPOLE_児童管理\n' +
      '・契約書テンプレート\n\n' +
      '※フォームのURLを保護者に共有してください。',
      ui.ButtonSet.OK
    );

  } catch (e) {
    Logger.log('エラー: ' + e.message);
    Logger.log(e.stack);
    ui.alert('エラーが発生しました: ' + e.message);
  }
}

/**
 * フォーム送信時のトリガーを設定
 */
function setupTrigger(formId) {
  // 既存のトリガーを削除
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // 新しいトリガーを設定
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(FormApp.openById(formId))
    .onFormSubmit()
    .create();

  Logger.log('トリガー設定完了');
}

/**
 * スプレッドシートを開いた時にカスタムメニューを表示
 */
function onOpen() {
  createCustomMenu();
}

/**
 * カスタムメニューを作成
 */
function createCustomMenu() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('POLEPOLE管理')
    .addItem('初期セットアップ', 'initialSetup')
    .addSeparator()
    .addItem('契約書を作成', 'showContractDialog')
    .addItem('メール下書きを作成', 'showEmailDraftDialog')
    .addSeparator()
    .addItem('フォームURLを表示', 'showFormUrl')
    .addItem('ドライブフォルダを開く', 'openRootFolder')
    .addToUi();
}

/**
 * フォームURLを表示
 */
function showFormUrl() {
  const formId = PropertiesService.getScriptProperties().getProperty(PROP_KEYS.FORM_ID);
  if (!formId) {
    SpreadsheetApp.getUi().alert('フォームがまだ作成されていません。初期セットアップを実行してください。');
    return;
  }
  const form = FormApp.openById(formId);
  SpreadsheetApp.getUi().alert(
    'フォームURL',
    '編集URL:\n' + form.getEditUrl() + '\n\n' +
    '回答URL（保護者に共有）:\n' + form.getPublishedUrl(),
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * ルートフォルダを開く
 */
function openRootFolder() {
  const folderId = PropertiesService.getScriptProperties().getProperty(PROP_KEYS.ROOT_FOLDER_ID);
  if (!folderId) {
    SpreadsheetApp.getUi().alert('フォルダがまだ作成されていません。');
    return;
  }
  const url = 'https://drive.google.com/drive/folders/' + folderId;
  const html = HtmlService.createHtmlOutput(
    '<script>window.open("' + url + '");google.script.host.close();</script>'
  ).setWidth(1).setHeight(1);
  SpreadsheetApp.getUi().showModalDialog(html, 'フォルダを開いています...');
}
