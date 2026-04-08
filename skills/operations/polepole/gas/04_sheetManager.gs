/**
 * ============================================
 * スプレッドシート管理
 * ============================================
 *
 * 7つのシートを自動作成し、ヘッダーと書式を設定します。
 */

function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ----- 1. 基本情報一覧 -----
  createSheetWithHeaders(ss, SHEET_NAMES.BASIC_INFO, [
    'タイムスタンプ', '利用区分',
    '氏名', 'ふりがな', '呼び名',
    '生年月日', '年齢', '性別', '平熱', '血液型', 'RH',
    '所属園・学校', '通所支援事業所',
    '通所受給者証', '発達検査機関', '診断名',
    'その他医療機関', '治療中の病気・既往歴',
  ], '#E8F5E9'); // 薄緑

  // ----- 2. アレルギー情報 -----
  const allergySheet = createSheetWithHeaders(ss, SHEET_NAMES.ALLERGY, [
    'タイムスタンプ', '氏名', 'ふりがな',
    'アレルギー有無', 'アレルギー詳細',
    '食事の配慮',
  ], '#FFF3E0'); // 薄オレンジ

  // アレルギーシートの条件付き書式を設定
  if (allergySheet) {
    setupAllergyConditionalFormatting(allergySheet);
  }

  // ----- 3. 送迎一覧 -----
  createSheetWithHeaders(ss, SHEET_NAMES.TRANSPORT, [
    'タイムスタンプ', '氏名', 'ふりがな',
    '郵便番号', '市町村名', '町名・番地・建物名',
    '送迎希望', '送迎先住所', '送迎補足',
  ], '#E3F2FD'); // 薄青

  // ----- 4. 保護者連絡先 -----
  createSheetWithHeaders(ss, SHEET_NAMES.CONTACT, [
    'タイムスタンプ', '児童氏名',
    'メールアドレス',
    '自宅電話', '携帯①', '携帯②',
    '緊急連絡先① 氏名', '緊急連絡先① 続柄', '緊急連絡先① 電話',
    '緊急連絡先② 氏名', '緊急連絡先② 続柄', '緊急連絡先② 電話',
    '連絡補足事項',
  ], '#F3E5F5'); // 薄紫

  // ----- 5. アセスメント回答一覧 -----
  createSheetWithHeaders(ss, SHEET_NAMES.ASSESSMENT, [
    'タイムスタンプ', '利用区分', '氏名',
    // 行動面
    '視線', '指さし', '共同注視', 'オウム返し',
    'だっこ嫌がり', '常同行動', 'パニック', 'かんしゃく',
    'かんしゃく対処法',
    // 発語・日常生活
    '発語状況', '発語詳細',
    'パンツ種類', '尿意便意', 'トイレ使用',
    '排泄補足',
    '食事好き嫌い', '好きな食べ物', '嫌いな食べ物',
    '食事方法', '食事量',
    '身体遊び', '戸外遊び',
    '音の過敏', '触覚過敏',
    '子どもへの興味', '好きな遊び',
    // 自由記述
    '性格', 'できるようになったこと', '悩み・心配ごと',
  ], '#FFF9C4'); // 薄黄

  // ----- 6. 経年変化シート -----
  createSheetWithHeaders(ss, SHEET_NAMES.YEARLY_CHANGE, [
    'タイムスタンプ', '年度', '氏名', 'ふりがな', '区分',
    '学校の出来事を話す', '話す内容',
    '気持ちを話す',
    '性格',
    'できるようになったこと',
    '育ってほしい姿',
    '悩み・心配ごと',
    '通所園・学校への願い',
  ], '#E0F7FA'); // 薄シアン

  // ----- 7. システム設定 -----
  const settingsSheet = createSheetWithHeaders(ss, SHEET_NAMES.SETTINGS, [
    '設定名', '設定値', '説明',
  ], '#ECEFF1'); // 薄グレー

  if (settingsSheet) {
    settingsSheet.appendRow(['FACILITY_NAME', CONFIG.FACILITY_NAME, '施設名']);
    settingsSheet.appendRow(['ROOT_FOLDER_NAME', CONFIG.ROOT_FOLDER_NAME, 'ドライブルートフォルダ名']);
    settingsSheet.appendRow(['CONTRACT_TEMPLATE_NAME', CONFIG.CONTRACT_TEMPLATE_NAME, '契約書テンプレート名']);
  }

  // デフォルトのSheet1を削除（あれば）
  const defaultSheet = ss.getSheetByName('シート1') || ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log('スプレッドシート設定完了');
}

/**
 * ヘッダー付きのシートを作成
 */
function createSheetWithHeaders(ss, sheetName, headers, headerColor) {
  // 既存シートがあれば何もしない
  let sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    Logger.log('シート既存（スキップ）: ' + sheetName);
    return sheet;
  }

  // 新規シート作成
  sheet = ss.insertSheet(sheetName);

  // ヘッダーを設定
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground(headerColor);
  headerRange.setHorizontalAlignment('center');
  headerRange.setBorder(true, true, true, true, true, true);

  // 列幅を自動調整
  headers.forEach(function(_, i) {
    sheet.setColumnWidth(i + 1, 120);
  });

  // 1行目を固定
  sheet.setFrozenRows(1);

  // フィルターを設定
  sheet.getRange(1, 1, 1, headers.length).createFilter();

  Logger.log('シート作成完了: ' + sheetName);
  return sheet;
}

/**
 * アレルギーシートに条件付き書式を設定
 * アレルギー「あり」の行が赤く目立つようにする
 */
function setupAllergyConditionalFormatting(sheet) {
  // アレルギー有無の列（D列）が「あり」の場合、行全体を赤背景に
  const rule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('あり')
    .setBackground('#FFCDD2')
    .setFontColor('#B71C1C')
    .setBold(true)
    .setRanges([sheet.getRange('D2:D1000')])
    .build();

  // アレルギー「なし」の場合は緑
  const ruleNo = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('なし')
    .setBackground('#C8E6C9')
    .setRanges([sheet.getRange('D2:D1000')])
    .build();

  sheet.setConditionalFormatRules([rule, ruleNo]);

  Logger.log('アレルギーシートの条件付き書式設定完了');
}
