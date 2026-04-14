function createAIStudyForm() {
  var form = FormApp.create('社長のためのAI勉強会 参加申し込み');

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

  form.addTextItem()
    .setTitle('お名前')
    .setHelpText('フルネームをご記入ください')
    .setRequired(true);

  form.addTextItem()
    .setTitle('会社名')
    .setRequired(true);

  form.addTextItem()
    .setTitle('役職')
    .setHelpText('例: 代表取締役、CEO、取締役 など')
    .setRequired(true);

  form.addTextItem()
    .setTitle('電話番号')
    .setHelpText('ハイフンなしで入力してください')
    .setRequired(false);

  form.addCheckboxItem()
    .setTitle('参加希望日')
    .setChoiceValues([
      '2026年4月21日(月) 21:00〜22:00「Claude Codeで何ができるのか？」'
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('現在のAI活用状況を教えてください')
    .setChoiceValues([
      'まだAIを使ったことがない',
      'ChatGPTなどを少し試したことがある',
      '業務で日常的にAIを活用している',
      '自社でAI導入を検討中'
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('AIについて聞きたいこと・知りたいこと')
    .setHelpText('勉強会で取り上げてほしいテーマや質問があればご自由にご記入ください')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('この勉強会を何で知りましたか？')
    .setChoiceValues([
      'SNS（X / Instagram / Facebook）',
      '知人からの紹介',
      'Web検索',
      'その他'
    ])
    .setRequired(false);

  var formUrl = form.getPublishedUrl();
  var editUrl = form.getEditUrl();
  var embedUrl = formUrl.replace('/viewform', '/viewform?embedded=true');

  Logger.log('PUBLIC_URL:' + formUrl);
  Logger.log('EDIT_URL:' + editUrl);
  Logger.log('EMBED_URL:' + embedUrl);

  return {
    publicUrl: formUrl,
    editUrl: editUrl,
    embedUrl: embedUrl
  };
}
