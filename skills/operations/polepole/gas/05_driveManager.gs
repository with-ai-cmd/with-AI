/**
 * ============================================
 * Googleドライブ フォルダ自動作成
 * ============================================
 *
 * 児童ごとのフォルダを自動作成します。
 * - 写真掲載「同意しない」の場合は写真フォルダを作成しない
 * - 契約書控えフォルダは必ず作成
 */

/**
 * ルートフォルダを作成
 */
function createRootFolder() {
  const rootFolder = DriveApp.createFolder(CONFIG.ROOT_FOLDER_NAME);

  // サブフォルダ構造を作成
  rootFolder.createFolder('_テンプレート');

  Logger.log('ルートフォルダ作成完了: ' + rootFolder.getUrl());
  return rootFolder.getId();
}

/**
 * 児童ごとのフォルダを作成
 *
 * フォルダ構成:
 *   POLEPOLE_児童管理/
 *   └── 〇〇〇〇（児童名）/
 *       ├── 契約書控え/
 *       ├── アセスメント/
 *       ├── 写真/          ← 写真掲載に同意した場合のみ
 *       └── その他書類/
 */
function createChildFolder(childName, photoConsent, enrollmentType) {
  if (!childName) {
    Logger.log('児童名が空のためフォルダ作成をスキップ');
    return null;
  }

  // ルートフォルダを取得
  const rootFolderId = PropertiesService.getScriptProperties().getProperty(PROP_KEYS.ROOT_FOLDER_ID);
  if (!rootFolderId) {
    Logger.log('ルートフォルダが見つかりません');
    return null;
  }

  const rootFolder = DriveApp.getFolderById(rootFolderId);

  // 同名フォルダが既にあるかチェック
  const existingFolders = rootFolder.getFoldersByName(childName);
  if (existingFolders.hasNext()) {
    Logger.log('同名フォルダが既に存在します: ' + childName);
    return existingFolders.next().getId();
  }

  // 児童フォルダを作成
  const childFolder = rootFolder.createFolder(childName);

  // サブフォルダを作成
  childFolder.createFolder('契約書控え');
  childFolder.createFolder('アセスメント');
  childFolder.createFolder('その他書類');

  // 写真フォルダ：同意しない場合は作成しない
  if (photoConsent !== PHOTO_CONSENT.DISAGREE) {
    childFolder.createFolder('写真');
    Logger.log('写真フォルダを作成しました: ' + childName);
  } else {
    Logger.log('写真掲載不同意のため写真フォルダは作成しません: ' + childName);
  }

  Logger.log('児童フォルダ作成完了: ' + childName + ' (' + childFolder.getUrl() + ')');
  return childFolder.getId();
}

/**
 * 手動で児童フォルダを作成するダイアログ
 */
function showCreateFolderDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 16px; }
      label { display: block; margin-top: 12px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; margin-top: 4px; box-sizing: border-box; }
      button { margin-top: 16px; padding: 10px 24px; background: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 4px; }
      button:hover { background: #45a049; }
    </style>
    <h3>児童フォルダ作成</h3>
    <label>児童名</label>
    <input type="text" id="childName" placeholder="例：山田太郎">
    <label>写真掲載</label>
    <select id="photoConsent">
      <option value="${PHOTO_CONSENT.AGREE}">同意する</option>
      <option value="${PHOTO_CONSENT.DISAGREE}">同意しない</option>
      <option value="${PHOTO_CONSENT.CONDITIONAL}">条件付きで同意する</option>
    </select>
    <button onclick="createFolder()">フォルダ作成</button>
    <script>
      function createFolder() {
        const name = document.getElementById('childName').value;
        const consent = document.getElementById('photoConsent').value;
        if (!name) { alert('児童名を入力してください'); return; }
        google.script.run
          .withSuccessHandler(function() { alert('フォルダを作成しました: ' + name); google.script.host.close(); })
          .withFailureHandler(function(e) { alert('エラー: ' + e.message); })
          .createChildFolder(name, consent, '手動作成');
      }
    </script>
  `).setWidth(400).setHeight(320);

  SpreadsheetApp.getUi().showModalDialog(html, '児童フォルダ作成');
}
