/**
 * Google Apps Script で「社長のためのAI勉強会」申し込みフォームを作成する
 *
 * 使い方:
 * 1. https://script.google.com/ にアクセス
 * 2. 「新しいプロジェクト」を作成
 * 3. このコードを貼り付けて「実行」ボタンをクリック
 * 4. 初回は権限の承認が必要です（「許可」を選択）
 * 5. ログに表示されるフォームURLをコピー
 * 6. index.html の YOUR_GOOGLE_FORM_URL_HERE を置換
 */

function createAIStudyForm() {
  // フォーム作成
  var form = FormApp.create('社長のためのAI勉強会 参加申し込み');

  // フォーム設定
  form.setDescription(
    '社長のためのAI勉強会へのお申し込みありがとうございます。\n' +
    '以下の項目をご入力の上、送信してください。\n\n' +
    '【初回開催】2026年4月21日(月) 21:00〜22:00\n' +
    '【テーマ】話題の「Claude Code」で何ができるのか？\n' +
    '【参加費】無料'
  );
  form.setConfirmationMessage(
    'お申し込みありがとうございます！\n' +
    '開催日が近づきましたら、ご登録のメールアドレスへ詳細をお送りします。\n' +
    '当日お会いできることを楽しみにしております。'
  );
  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(false);

  // === 質問を追加 ===

  // 氏名
  form.addTextItem()
    .setTitle('お名前')
    .setHelpText('フルネームをご記入ください')
    .setRequired(true);

  // 会社名
  form.addTextItem()
    .setTitle('会社名')
    .setRequired(true);

  // 役職
  form.addTextItem()
    .setTitle('役職')
    .setHelpText('例: 代表取締役、CEO、取締役 など')
    .setRequired(true);

  // 電話番号
  form.addTextItem()
    .setTitle('電話番号')
    .setHelpText('ハイフンなしで入力してください')
    .setRequired(false);

  // 参加希望回
  form.addCheckboxItem()
    .setTitle('参加希望日')
    .setChoiceValues([
      '2026年4月21日(月) 21:00〜22:00「Claude Codeで何ができるのか？」'
    ])
    .setRequired(true);

  // AIへの関心度
  form.addMultipleChoiceItem()
    .setTitle('現在のAI活用状況を教えてください')
    .setChoiceValues([
      'まだAIを使ったことがない',
      'ChatGPTなどを少し試したことがある',
      '業務で日常的にAIを活用している',
      '自社でAI導入を検討中'
    ])
    .setRequired(true);

  // 聞きたいこと
  form.addParagraphTextItem()
    .setTitle('AIについて聞きたいこと・知りたいこと')
    .setHelpText('勉強会で取り上げてほしいテーマや質問があればご自由にご記入ください')
    .setRequired(false);

  // 勉強会を知ったきっかけ
  form.addMultipleChoiceItem()
    .setTitle('この勉強会を何で知りましたか？')
    .setChoiceValues([
      'SNS（X / Instagram / Facebook）',
      '知人からの紹介',
      'Web検索',
      'その他'
    ])
    .setRequired(false);

  // ログ出力
  var formUrl = form.getPublishedUrl();
  var editUrl = form.getEditUrl();

  Logger.log('=== フォーム作成完了 ===');
  Logger.log('');
  Logger.log('【公開URL（回答者用）】');
  Logger.log(formUrl);
  Logger.log('');
  Logger.log('【編集URL（管理用）】');
  Logger.log(editUrl);
  Logger.log('');
  Logger.log('【LP埋め込み用URL】');
  Logger.log(formUrl.replace('/viewform', '/viewform?embedded=true'));
  Logger.log('');
  Logger.log('上記の「LP埋め込み用URL」をindex.htmlの YOUR_GOOGLE_FORM_URL_HERE と差し替えてください');
}
