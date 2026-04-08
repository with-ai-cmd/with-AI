/**
 * ============================================
 * POLEPOLE 入園手続き自動化システム - 設定ファイル
 * ============================================
 *
 * このファイルで各種設定を変更できます。
 * フォームの質問文やシート名などを修正する場合はここを編集してください。
 */

// ===== 基本設定 =====
const CONFIG = {
  // 施設名
  FACILITY_NAME: 'POLEPOLE',

  // フォームのタイトル
  FORM_TITLE: 'POLEPOLE 入園手続き・アセスメントフォーム',
  FORM_DESCRIPTION: 'お子さんの入園に必要な情報をご入力ください。\n所要時間：約15〜20分',

  // Googleドライブのルートフォルダ名
  ROOT_FOLDER_NAME: 'POLEPOLE_児童管理',

  // スプレッドシート名
  SPREADSHEET_NAME: 'POLEPOLE_入園データ管理',

  // 契約書テンプレートのドキュメント名
  CONTRACT_TEMPLATE_NAME: 'POLEPOLE_契約書テンプレート',

  // メール送信元の表示名
  EMAIL_SENDER_NAME: 'POLEPOLE 事務局',
};

// ===== シート名 =====
const SHEET_NAMES = {
  MASTER: '全回答データ',
  BASIC_INFO: '基本情報一覧',
  ALLERGY: 'アレルギー情報',
  TRANSPORT: '送迎一覧',
  CONTACT: '保護者連絡先',
  ASSESSMENT: 'アセスメント回答一覧',
  YEARLY_CHANGE: '経年変化シート',
  SETTINGS: 'システム設定',
};

// ===== 利用区分 =====
const ENROLLMENT_TYPES = {
  PRESCHOOL: '未就学児（新規）',
  SCHOOL_AGE: '就学児（新規）',
  CONTINUATION: '継続',
};

// ===== 写真掲載の選択肢 =====
const PHOTO_CONSENT = {
  AGREE: '同意する',
  DISAGREE: '同意しない',
  CONDITIONAL: '条件付きで同意する',
};

// ===== 送迎の選択肢 =====
const TRANSPORT_OPTIONS = {
  YES: '希望する',
  NO: '希望しない',
};

// ===== PropertiesServiceのキー =====
const PROP_KEYS = {
  FORM_ID: 'FORM_ID',
  SPREADSHEET_ID: 'SPREADSHEET_ID',
  ROOT_FOLDER_ID: 'ROOT_FOLDER_ID',
  CONTRACT_TEMPLATE_ID: 'CONTRACT_TEMPLATE_ID',
};
