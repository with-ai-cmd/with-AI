const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const { FaShieldAlt, FaTerminal, FaRocket, FaLightbulb, FaCheck, FaCog, FaExclamationTriangle, FaApple, FaWindows, FaKeyboard, FaBook, FaDownload, FaUserShield } = require("react-icons/fa");

const C = {
  bg: "FFFFFF", card: "F5F5F7", accent: "D97706", accentBg: "FEF3C7",
  text: "1F2937", sub: "6B7280", green: "059669", greenBg: "D1FAE5",
  red: "DC2626", redBg: "FEE2E2", blue: "2563EB", blueBg: "DBEAFE",
  purple: "7C3AED", purpleBg: "EDE9FE",
  dark: "1A1A2E", mono: "Consolas",
};
const mkSh = () => ({ type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.08 });

async function icon64(Ic, color, sz = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Ic, { color, size: String(sz) }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
}

async function termImg(lines, w = 700, title = "Terminal") {
  const lh = 22, pad = 16, tbh = 36;
  const h = tbh + pad * 2 + lines.length * lh + pad;
  const ls = lines.map((l, i) => {
    const y = tbh + pad + (i + 1) * lh;
    const t = l.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<text x="${pad}" y="${y}" fill="${l.color || '#C9D1D9'}" font-family="Consolas, monospace" font-size="13">${t}</text>`;
  }).join("\n");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" rx="10" fill="#0D1117"/>
    <rect width="${w}" height="${tbh}" rx="10" fill="#161B22"/>
    <rect y="${tbh-4}" width="${w}" height="4" fill="#161B22"/>
    <circle cx="20" cy="18" r="6" fill="#FF5F56"/><circle cx="40" cy="18" r="6" fill="#FFBD2E"/><circle cx="60" cy="18" r="6" fill="#27C93F"/>
    <text x="${w/2}" y="22" fill="#8B949E" font-family="Arial" font-size="12" text-anchor="middle">${title}</text>
    ${ls}</svg>`;
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
}

// ── slide helpers ──
function hdr(s, title, sub, ac) {
  s.background = { color: C.bg };
  s.addShape("rect", { x: 0, y: 0, w: 0.07, h: 5.625, fill: { color: ac || C.accent } });
  s.addText(title, { x: 0.5, y: 0.25, w: 9, h: 0.65, fontSize: 27, fontFace: "Arial Black", color: C.text, margin: 0 });
  if (sub) s.addText(sub, { x: 0.5, y: 0.82, w: 9, h: 0.32, fontSize: 13, fontFace: "Arial", color: C.sub, margin: 0 });
}
function stp(s, n, t, d, y, o={}) {
  const x=o.x||0.5, w=o.w||9, h=o.h||0.8, nc=o.nc||C.accent, nb=o.nb||C.accentBg;
  s.addShape("rect",{x,y,w,h,fill:{color:C.card},shadow:mkSh()});
  s.addShape("oval",{x:x+0.15,y:y+(h-0.42)/2,w:0.42,h:0.42,fill:{color:nb}});
  s.addText(String(n),{x:x+0.15,y:y+(h-0.42)/2,w:0.42,h:0.42,fontSize:15,fontFace:"Arial Black",color:nc,align:"center",valign:"middle"});
  s.addText(t,{x:x+0.75,y:y+0.05,w:w-0.95,h:0.3,fontSize:14,fontFace:"Arial",color:C.text,bold:true,margin:0});
  if(d) s.addText(d,{x:x+0.75,y:y+0.37,w:w-0.95,h:h-0.45,fontSize:11.5,fontFace:"Arial",color:C.sub,margin:0});
}
function nfo(s,txt,y,type) {
  const m={tip:{bg:C.accentBg,c:C.accent,p:"💡"},warn:{bg:C.redBg,c:C.red,p:"⚠️"},ok:{bg:C.greenBg,c:C.green,p:"✅"},note:{bg:C.blueBg,c:C.blue,p:"ℹ️"}};
  const v=m[type]||m.tip;
  s.addShape("rect",{x:0.5,y,w:9,h:0.48,fill:{color:v.bg}});
  s.addText(`${v.p} ${txt}`,{x:0.7,y,w:8.6,h:0.48,fontSize:12,fontFace:"Arial",color:v.c,valign:"middle",margin:0});
}
function cmdBox(s,text,y,w) {
  w=w||9;
  s.addShape("rect",{x:0.5,y,w,h:0.42,fill:{color:"1F2937"}});
  s.addText(text,{x:0.7,y,w:w-0.4,h:0.42,fontSize:13,fontFace:C.mono,color:"4ADE80",valign:"middle",margin:0});
}
function sect(s,title,sub) {
  s.background={color:C.dark};
  s.addShape("rect",{x:0,y:0,w:10,h:0.05,fill:{color:C.accent}});
  s.addText(title,{x:1,y:1.8,w:8,h:1.2,fontSize:36,fontFace:"Arial Black",color:"FFFFFF",align:"center",valign:"middle"});
  if(sub) s.addText(sub,{x:1,y:3.0,w:8,h:0.6,fontSize:15,fontFace:"Arial",color:C.accent,align:"center"});
}
function rightBox(s,title,body,y,h,tc,bc) {
  s.addShape("rect",{x:5.8,y,w:3.7,h,fill:{color:bc||C.card},shadow:mkSh()});
  s.addText(title,{x:6.0,y:y+0.08,w:3.3,h:0.3,fontSize:13,fontFace:"Arial",color:tc||C.accent,bold:true,margin:0});
  s.addText(body,{x:6.0,y:y+0.42,w:3.3,h:h-0.55,fontSize:11.5,fontFace:"Arial",color:C.text,margin:0});
}

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "with-AI Inc.";
  pres.title = "Claude Code 導入研修";

  const [icShield,icTerm,icRocket,icBulb,icCheck,icCog,icWarn,icApple,icWin,icKey,icBook,icDl,icPerm] = await Promise.all([
    icon64(FaShieldAlt,"#D97706"),icon64(FaTerminal,"#D97706"),icon64(FaRocket,"#D97706"),
    icon64(FaLightbulb,"#D97706"),icon64(FaCheck,"#059669"),icon64(FaCog,"#D97706"),
    icon64(FaExclamationTriangle,"#DC2626"),icon64(FaApple,"#1F2937"),icon64(FaWindows,"#2563EB"),
    icon64(FaKeyboard,"#7C3AED"),icon64(FaBook,"#D97706"),icon64(FaDownload,"#D97706"),
    icon64(FaUserShield,"#059669"),
  ]);

  // ── All terminal images ──
  const T = {};
  T.macCheck = await termImg([
    {text:"$ sw_vers",color:"#58A6FF"},
    {text:"ProductName:    macOS",color:"#C9D1D9"},
    {text:"ProductVersion: 14.2",color:"#27C93F"},
    {text:"",color:"#8B949E"},{text:"↑ 13.0以上ならOK！",color:"#27C93F"},
  ],600,"Terminal — macOSバージョン確認");

  T.macNet = await termImg([
    {text:"$ curl -sI https://claude.ai | head -1",color:"#58A6FF"},
    {text:"HTTP/2 200",color:"#27C93F"},
    {text:"",color:"#8B949E"},{text:'↑「200」が出ればネット接続OK！',color:"#27C93F"},
  ],600,"Terminal — ネット接続確認");

  T.macInstall = await termImg([
    {text:"$ curl -fsSL https://claude.ai/install.sh | bash",color:"#58A6FF"},
    {text:"",color:"#8B949E"},
    {text:"  Downloading Claude Code...",color:"#8B949E"},
    {text:"  Installing to ~/.local/bin/claude...",color:"#8B949E"},
    {text:"  ✓ Claude Code installed successfully!",color:"#27C93F"},
    {text:"",color:"#8B949E"},{text:"  Run 'claude' to get started.",color:"#C9D1D9"},
  ],600,"Terminal — インストール実行");

  T.macVer = await termImg([
    {text:"$ claude --version",color:"#58A6FF"},
    {text:"Claude Code v1.0.38",color:"#C9D1D9"},
    {text:"",color:"#8B949E"},{text:"↑ バージョン番号が出れば成功！",color:"#27C93F"},
  ],600,"Terminal — バージョン確認");

  T.macDoctor = await termImg([
    {text:"$ claude doctor",color:"#58A6FF"},{text:"",color:"#8B949E"},
    {text:"  ✓ Installation: native",color:"#27C93F"},
    {text:"  ✓ Version: 1.0.38 (latest)",color:"#27C93F"},
    {text:"  ✓ Auto-updates: enabled",color:"#27C93F"},
    {text:"  ✓ Configuration: valid",color:"#27C93F"},
    {text:"",color:"#8B949E"},{text:"  All checks passed!",color:"#27C93F"},
  ],600,"Terminal — ヘルスチェック");

  T.winGit = await termImg([
    {text:"PS> where.exe git",color:"#58A6FF"},
    {text:"C:\\Program Files\\Git\\cmd\\git.exe",color:"#27C93F"},
    {text:"",color:"#8B949E"},{text:"↑ パスが表示されればGit OK！",color:"#27C93F"},
    {text:"",color:"#8B949E"},
    {text:"何も表示されない場合:",color:"#FF5F56"},
    {text:"→ git-scm.com からインストール",color:"#FFBD2E"},
  ],600,"PowerShell — Git確認");

  T.winPolicy = await termImg([
    {text:"PS> Get-ExecutionPolicy",color:"#58A6FF"},
    {text:"RemoteSigned",color:"#27C93F"},
    {text:"",color:"#8B949E"},
    {text:'↑「RemoteSigned」「Unrestricted」「Bypass」ならOK',color:"#27C93F"},
    {text:"",color:"#8B949E"},
    {text:'「Restricted」の場合 → 次スライドで修正',color:"#FF5F56"},
  ],600,"PowerShell — 実行ポリシー確認");

  T.winPolicyFix = await termImg([
    {text:"PS> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser",color:"#58A6FF"},
    {text:"",color:"#8B949E"},
    {text:"  変更しますか？",color:"#C9D1D9"},
    {text:"  [Y] はい  [N] いいえ: Y ← Yを入力してEnter",color:"#FFBD2E"},
    {text:"",color:"#8B949E"},{text:"  ✓ 変更完了",color:"#27C93F"},
  ],600,"PowerShell — 実行ポリシー変更");

  T.winNet = await termImg([
    {text:"PS> Test-Connection claude.ai -Count 1",color:"#58A6FF"},
    {text:"  Status: Success",color:"#27C93F"},
    {text:"",color:"#8B949E"},{text:'↑「Success」が出ればOK！',color:"#27C93F"},
  ],600,"PowerShell — ネット接続確認");

  T.winInstall = await termImg([
    {text:"PS> irm https://claude.ai/install.ps1 | iex",color:"#58A6FF"},
    {text:"",color:"#8B949E"},
    {text:"  Downloading Claude Code...",color:"#8B949E"},
    {text:"  ✓ Claude Code installed successfully!",color:"#27C93F"},
  ],600,"PowerShell — インストール実行");

  T.winTermSwitch = await termImg([
    {text:"  ターミナルの種類を切り替える方法:",color:"#FFBD2E"},
    {text:"",color:"#8B949E"},
    {text:"  1. ターミナル右上の「＋」ボタンの隣にある",color:"#C9D1D9"},
    {text:"     「▼」（下矢印）をクリック",color:"#C9D1D9"},
    {text:"",color:"#8B949E"},
    {text:"  2. 表示されたリストから",color:"#C9D1D9"},
    {text:'     「PowerShell」を選択',color:"#27C93F"},
    {text:"",color:"#8B949E"},
    {text:"  ※ cmdではなくPowerShellを使ってください",color:"#8B949E"},
  ],600,"Cursor — ターミナル切り替え");

  T.auth1 = await termImg([
    {text:"$ claude",color:"#58A6FF"},{text:"",color:"#8B949E"},
    {text:"  ╔════════════════════════════════════╗",color:"#D4A574"},
    {text:"  ║     Welcome to Claude Code!        ║",color:"#D4A574"},
    {text:"  ╚════════════════════════════════════╝",color:"#D4A574"},
    {text:"",color:"#8B949E"},
    {text:"  ? How would you like to sign in?",color:"#FFBD2E"},
    {text:"  > Use Claude.ai (recommended)    ← これ",color:"#FFFFFF"},
    {text:"    Use an API key",color:"#8B949E"},
  ],600,"Terminal — 初回起動");

  T.auth2 = await termImg([
    {text:"  Opening browser for authentication...",color:"#C9D1D9"},
    {text:"",color:"#8B949E"},
    {text:"  → ブラウザが自動で開きます",color:"#FFBD2E"},
    {text:"  → ログインして「許可」をクリック",color:"#FFBD2E"},
    {text:"",color:"#8B949E"},
    {text:"  ✓ Successfully authenticated!",color:"#27C93F"},
  ],600,"Terminal — 認証フロー");

  T.permission = await termImg([
    {text:"  Claude Code wants to run a command:",color:"#FFBD2E"},
    {text:"",color:"#8B949E"},
    {text:'  mkdir my-agent',color:"#58A6FF"},
    {text:"",color:"#8B949E"},
    {text:"  Allow this action?",color:"#C9D1D9"},
    {text:"  > Yes, allow once      ← 1回だけ許可",color:"#FFFFFF"},
    {text:"    Yes, always allow     ← 今後も常に許可",color:"#8B949E"},
    {text:"    No, deny              ← 拒否する",color:"#8B949E"},
  ],600,"Terminal — 権限の確認画面");

  T.xcodePopup = await termImg([
    {text:"$ git init",color:"#58A6FF"},
    {text:"",color:"#8B949E"},
    {text:'  ポップアップが出ることがあります:',color:"#FFBD2E"},
    {text:'  「コマンドライン・デベロッパ・ツールが必要です。',color:"#C9D1D9"},
    {text:'    インストールしますか？」',color:"#C9D1D9"},
    {text:"",color:"#8B949E"},
    {text:'  → 「インストール」をクリック',color:"#27C93F"},
    {text:'  → 数分間待つ（自動でダウンロード＆インストール）',color:"#27C93F"},
    {text:'  → 完了したらもう一度 git init を実行',color:"#27C93F"},
  ],600,"Mac — Xcode Command Line Tools");

  T.hand1 = await termImg([
    {text:"$ mkdir my-agent",color:"#58A6FF"},
    {text:"$ cd my-agent",color:"#58A6FF"},
    {text:"$ git init",color:"#58A6FF"},
    {text:"Initialized empty Git repository",color:"#8B949E"},
  ],600,"Terminal — フォルダ準備");

  T.hand3 = await termImg([
    {text:"  > CLAUDE.mdを作成してください。",color:"#FFFFFF"},
    {text:'    内容は「あなたは優秀なビジネス',color:"#FFFFFF"},
    {text:'    アシスタントです。丁寧な日本語で',color:"#FFFFFF"},
    {text:'    回答してください。」にして。',color:"#FFFFFF"},
    {text:"",color:"#8B949E"},
    {text:"  ✓ Created file: CLAUDE.md",color:"#27C93F"},
  ],600,"Terminal — CLAUDE.md作成");

  T.hand4 = await termImg([
    {text:"  > 自己紹介して",color:"#FFFFFF"},{text:"",color:"#8B949E"},
    {text:"  はい！私はビジネスアシスタントです。",color:"#C9D1D9"},
    {text:"  以下のようなことでお手伝いできます：",color:"#C9D1D9"},
    {text:"",color:"#8B949E"},
    {text:"  ・メールの下書き作成",color:"#C9D1D9"},
    {text:"  ・議事録のまとめ",color:"#C9D1D9"},
    {text:"  ・資料の構成案作成",color:"#C9D1D9"},
  ],600,"Terminal — 動作確認");

  T.hand5 = await termImg([
    {text:"  > 社内勉強会のアジェンダを作って。",color:"#FFFFFF"},
    {text:"    テーマはAI活用、参加者10名、1時間。",color:"#FFFFFF"},
    {text:"",color:"#8B949E"},
    {text:"  ✓ Created file: 社内勉強会_アジェンダ.md",color:"#27C93F"},
    {text:"",color:"#8B949E"},
    {text:"  📄 ファイルが作成されました！",color:"#58A6FF"},
  ],600,"Terminal — 実用タスク");

  // Error screens
  T.errNotFound = await termImg([
    {text:'  ❌ "claude" は認識されていません',color:"#FF5F56"},
    {text:"",color:"#8B949E"},
    {text:"  対処法:",color:"#FFBD2E"},
    {text:"  1. ターミナルを ×ボタン で閉じる",color:"#C9D1D9"},
    {text:"  2. Terminal → New Terminal で開き直す",color:"#C9D1D9"},
    {text:"  3. claude --version をもう一度試す",color:"#C9D1D9"},
    {text:"",color:"#8B949E"},
    {text:"  ↑ これで90%解決します",color:"#27C93F"},
  ],600,"対処法 — コマンドが見つからない");

  T.errGit = await termImg([
    {text:"  ❌ Git for Windows required",color:"#FF5F56"},
    {text:"",color:"#8B949E"},
    {text:"  対処法:",color:"#FFBD2E"},
    {text:"  1. git-scm.com を開く",color:"#C9D1D9"},
    {text:"  2. Download → インストール（全てデフォルト）",color:"#C9D1D9"},
    {text:"  3. Cursorを再起動",color:"#C9D1D9"},
    {text:"  4. インストールコマンドを再実行",color:"#C9D1D9"},
  ],600,"対処法 — Git未インストール");

  T.errIrm = await termImg([
    {text:'  ❌ "irm" は認識されていません',color:"#FF5F56"},
    {text:"",color:"#8B949E"},
    {text:"  原因: cmdを使っている（PowerShellが必要）",color:"#C9D1D9"},
    {text:"",color:"#8B949E"},
    {text:"  対処法A: cmd用コマンドに切り替え",color:"#FFBD2E"},
    {text:"  curl -fsSL https://claude.ai/install.cmd",color:"#58A6FF"},
    {text:"  -o install.cmd && install.cmd && del install.cmd",color:"#58A6FF"},
    {text:"",color:"#8B949E"},
    {text:"  対処法B: ターミナルをPowerShellに切り替え",color:"#FFBD2E"},
    {text:"  （▼ボタン → PowerShell選択）",color:"#C9D1D9"},
  ],600,"対処法 — irmが使えない");

  T.errBrowser = await termImg([
    {text:"  ❌ ブラウザが自動で開かない",color:"#FF5F56"},
    {text:"",color:"#8B949E"},
    {text:"  対処法:",color:"#FFBD2E"},
    {text:"  1. ターミナルに表示されたURLをコピー",color:"#C9D1D9"},
    {text:"  2. ブラウザを手動で開く",color:"#C9D1D9"},
    {text:"  3. アドレスバーにペースト → Enter",color:"#C9D1D9"},
    {text:"  4. ログインして「許可」をクリック",color:"#C9D1D9"},
  ],600,"対処法 — ブラウザが開かない");

  T.errTls = await termImg([
    {text:"  ❌ TLS/SSL error / 接続タイムアウト",color:"#FF5F56"},
    {text:"",color:"#8B949E"},
    {text:"  対処法:",color:"#FFBD2E"},
    {text:"  1. VPNをOFFにする",color:"#C9D1D9"},
    {text:"  2. Wi-Fiを切り替え（テザリング等）",color:"#C9D1D9"},
    {text:"  3. 講師にご相談ください",color:"#C9D1D9"},
  ],600,"対処法 — ネットワークエラー");

  // Commands reference
  T.cmdRef = await termImg([
    {text:"  > /help         コマンド一覧を表示",color:"#58A6FF"},
    {text:"  > /compact      会話を要約して軽くする",color:"#58A6FF"},
    {text:"  > /status       認証状態を確認",color:"#58A6FF"},
    {text:"  > /login        再ログイン",color:"#58A6FF"},
    {text:"  > /clear        会話をリセット",color:"#58A6FF"},
    {text:"",color:"#8B949E"},
    {text:"  [Esc]           回答を途中で止める",color:"#FFBD2E"},
    {text:"  [Ctrl+C]        Claude Codeを終了",color:"#FFBD2E"},
    {text:"  [↑]             過去の入力を呼び出す",color:"#FFBD2E"},
  ],600,"Terminal — コマンド一覧");

  // ═══════════════════════════════════════════════
  // BUILD SLIDES
  // ═══════════════════════════════════════════════
  let sn = 0;
  let s;

  // ── 1. Title ──
  s = pres.addSlide(); sn++;
  s.background = { color: C.dark };
  s.addShape("rect",{x:0,y:0,w:10,h:0.05,fill:{color:C.accent}});
  s.addShape("rect",{x:0,y:5.575,w:10,h:0.05,fill:{color:C.accent}});
  s.addImage({data:icTerm,x:4.5,y:0.7,w:1,h:1});
  s.addText("Claude Code\n導入研修",{x:1,y:1.7,w:8,h:2,fontSize:44,fontFace:"Arial Black",color:"FFFFFF",align:"center",valign:"middle",lineSpacingMultiple:1.2});
  s.addText("Cursor × ターミナルで始めるAIアシスタント",{x:1,y:3.6,w:8,h:0.6,fontSize:18,fontFace:"Arial",color:C.accent,align:"center"});
  s.addText("with-AI Inc.",{x:1,y:4.6,w:8,h:0.5,fontSize:14,fontFace:"Arial",color:"808090",align:"center"});

  // ── 2. Agenda ──
  s = pres.addSlide(); sn++;
  hdr(s,"本日の流れ","30分で「自分専用AIアシスタント」を作ります");
  const ag=[
    {t:"0-3分",n:"セキュリティ",d:"安心して使える理由",c:C.green},
    {t:"3-5分",n:"Claude Codeとは",d:"デモでお見せします",c:C.accent},
    {t:"5-8分",n:"環境チェック",d:"エラーが出ないか先に確認",c:C.blue},
    {t:"8-15分",n:"インストール＆認証",d:"全員で一緒に進めます",c:C.accent},
    {t:"15-25分",n:"ハンズオン",d:"自分専用AIアシスタントを作る",c:C.accent},
    {t:"25-30分",n:"基本操作＆まとめ",d:"コマンド集・Tips・Q&A",c:C.purple},
  ];
  ag.forEach((a,i)=>{
    const y=1.4+i*0.65;
    s.addShape("rect",{x:0.5,y,w:9,h:0.55,fill:{color:C.card},shadow:mkSh()});
    s.addShape("rect",{x:0.5,y,w:0.06,h:0.55,fill:{color:a.c}});
    s.addText(a.t,{x:0.8,y,w:1.1,h:0.55,fontSize:13,fontFace:C.mono,color:a.c,valign:"middle",bold:true,margin:0});
    s.addText(a.n,{x:2.1,y,w:2.8,h:0.55,fontSize:15,fontFace:"Arial",color:C.text,bold:true,valign:"middle",margin:0});
    s.addText(a.d,{x:5.2,y,w:4,h:0.55,fontSize:12,fontFace:"Arial",color:C.sub,valign:"middle",margin:0});
  });

  // ── 3. Security ──
  s = pres.addSlide(); sn++;
  hdr(s,"セキュリティ","企業で安心して使える3つの理由",C.green);
  [{t:"AIの学習に使用されない",d:"Claude Code（API経由）で送信したデータはAnthropicのAIモデルの\nトレーニングに一切使用されません。利用規約で明記されています。"},
   {t:"コードやデータはサーバーに保存されない",d:"送信した内容は回答生成のためだけに使用され、処理完了後に削除。\n社内の情報がAnthropicに蓄積されることはありません。"},
   {t:"機密ファイルは自動的に除外される",d:".env（環境変数）、credentials（認証情報）、.gitignore対象は\nデフォルトでClaude Codeの読み取り対象外です。"}
  ].forEach((item,i)=>{
    const y=1.4+i*1.3;
    s.addShape("rect",{x:0.5,y,w:9,h:1.15,fill:{color:C.card},shadow:mkSh()});
    s.addShape("rect",{x:0.5,y,w:0.06,h:1.15,fill:{color:C.green}});
    s.addImage({data:icCheck,x:0.75,y:y+0.32,w:0.4,h:0.4});
    s.addText(item.t,{x:1.3,y:y+0.08,w:7.9,h:0.35,fontSize:16,fontFace:"Arial",color:C.text,bold:true,margin:0});
    s.addText(item.d,{x:1.3,y:y+0.48,w:7.9,h:0.6,fontSize:12,fontFace:"Arial",color:C.sub,margin:0});
  });

  // ── 4. What is Claude Code ──
  s = pres.addSlide(); sn++;
  hdr(s,"Claude Code って何？","AIにターミナルから日本語で指示するだけ。コードは書きません。");
  ["「〇〇のファイルを作って」→ 自動作成","「このコードのバグを直して」→ 自動修正","「議事録をまとめて」→ ファイル生成","「プロジェクトの構成を教えて」→ 分析","コードが書けなくても使える！"].forEach((t,i)=>{
    const y=1.4+i*0.48;
    s.addImage({data:icCheck,x:0.6,y:y+0.05,w:0.28,h:0.28});
    s.addText(t,{x:1.05,y,w:3.9,h:0.4,fontSize:13,fontFace:"Arial",color:i===4?C.accent:C.text,bold:i===4,valign:"middle",margin:0});
  });
  s.addImage({data:T.hand4,x:5,y:1.3,w:4.6,h:2.5,shadow:mkSh()});

  // ══════════════ SECTION: Prereq ══════════════
  s = pres.addSlide(); sn++;
  sect(s,"事前準備＆環境チェック","インストール前にエラーの原因を潰しておきます");

  // ── Cursor Install ──
  s = pres.addSlide(); sn++;
  hdr(s,"事前準備① Cursorのインストール","プログラミング用のエディタ（メモ帳の高機能版）です");
  stp(s,1,"ブラウザで cursor.com を開く","アドレスバーに cursor.com と入力 → Enter",1.3);
  stp(s,2,"「Download」ボタンをクリック","お使いのOS（Mac / Windows）が自動判別されます",2.3);
  stp(s,3,"ダウンロードされたファイルを実行","Mac: .dmgファイルを開く → Cursorアイコンをアプリケーションにドラッグ\nWindows: .exeファイルを実行 → 「Next」で進める → 「Install」",3.3,{h:0.95});
  stp(s,4,"Cursorを起動して確認","アプリケーション一覧（Mac）またはスタートメニュー（Win）から起動",4.5,{h:0.65});

  // ── Claude Account ──
  s = pres.addSlide(); sn++;
  hdr(s,"事前準備② Claudeアカウント作成","Claude Codeを使うためのアカウントです");
  stp(s,1,"ブラウザで claude.ai を開く","アドレスバーに claude.ai と入力 → Enter",1.3);
  stp(s,2,"「Sign Up」をクリック","すでにアカウントがある方は「Log In」でOK",2.2,{h:0.65});
  stp(s,3,"アカウントを作成","方法A: Googleアカウントでログイン（おすすめ・簡単）\n方法B: メールアドレスで新規登録",3.05);
  stp(s,4,"プランを確認","Pro / Max / Team のいずれかが必要です。\n設定 → Subscription で現在のプランを確認できます",4.05);
  nfo(s,"会社でまとめてTeamプランを契約している場合は、管理者から招待メールが届きます",5.0,"note");

  // ── Win: Git ──
  s = pres.addSlide(); sn++;
  hdr(s,"事前準備③【Windowsのみ】Git for Windows","Claude Codeの動作に必須のソフトです",C.blue);
  stp(s,1,"ブラウザで git-scm.com を開く","Windowsの方のみ。Macの方はスキップしてください。",1.3,{nc:C.blue,nb:C.blueBg});
  stp(s,2,"「Download for Windows」をクリック",null,2.2,{h:0.5,nc:C.blue,nb:C.blueBg});
  stp(s,3,"インストーラーを実行","設定画面が何度も出ますが、全て「Next」→ 最後に「Install」でOK\n何も変更する必要はありません",2.85,{nc:C.blue,nb:C.blueBg});
  stp(s,4,"Cursorを再起動（重要！）","Gitのインストール後、Cursorを一度閉じて開き直してください\nこれをしないとGitが認識されません",3.85,{nc:C.blue,nb:C.blueBg});
  nfo(s,"Macの方はこのステップは不要です。次に進んでください。",4.85,"tip");

  // ── Terminal location ──
  s = pres.addSlide(); sn++;
  hdr(s,"ターミナルの開き方","Cursorの中にある「黒い画面」がターミナルです");
  stp(s,"A","方法A: メニューから開く","Cursorの上部メニュー → 「Terminal」 → 「New Terminal」をクリック",1.3);
  stp(s,"B","方法B: キーボードショートカット","Mac: Cmd + `（バッククォート）  /  Windows: Ctrl + `",2.3);
  s.addShape("rect",{x:0.5,y:3.3,w:9,h:1.8,fill:{color:C.card},shadow:mkSh()});
  s.addText("「 ` 」キーはどこ？",{x:0.7,y:3.4,w:8.6,h:0.3,fontSize:14,fontFace:"Arial",color:C.accent,bold:true,margin:0});
  s.addText("キーボードの左上、数字の「1」のさらに左隣にあるキーです。\n「半角/全角」キーの右隣（日本語キーボード）、または「1」の左（USキーボード）です。\n\nターミナルが画面下部に表示されれば成功です。黒い背景に文字が表示される部分です。",{x:0.7,y:3.8,w:8.6,h:1.2,fontSize:12,fontFace:"Arial",color:C.sub,margin:0});

  // ── Win: Terminal switch ──
  s = pres.addSlide(); sn++;
  hdr(s,"【Windowsのみ】ターミナルの種類を確認","PowerShellを使います。cmdだとエラーが出ます。",C.blue);
  s.addImage({data:T.winTermSwitch,x:0.5,y:1.3,w:5,h:2.5,shadow:mkSh()});
  rightBox(s,"確認方法",'ターミナル上部に\n表示される文字を確認:\n\n「powershell」→ OK！\n「cmd」→ 切り替え必要\n「bash」→ OK！\n\n切り替え方:\nターミナル右上の\n「＋」横の「▼」クリック\n→「PowerShell」を選択',1.3,2.5,C.blue,C.blueBg);
  nfo(s,"Macの方はこのステップは不要です",4.1,"tip");

  // ── Mac env check 1 ──
  s = pres.addSlide(); sn++;
  hdr(s,"Mac — 環境チェック① macOSバージョン","13.0以上が必要です");
  stp(s,"✓","ターミナルに以下を入力 → Enter",null,1.3,{h:0.5,nc:C.green,nb:C.greenBg});
  cmdBox(s,"sw_vers",1.95);
  s.addImage({data:T.macCheck,x:0.5,y:2.55,w:4.8,h:1.8,shadow:mkSh()});
  rightBox(s,"確認ポイント","ProductVersion の数字が\n13.0 以上 であればOK。\n\nもし13.0未満の場合は\nmacOSのアップデートが\n必要です。\n\n最近のMacなら\nほぼ問題ありません。",2.55,1.8,C.green,C.greenBg);
  nfo(s,"13.0以上ならOK。次の環境チェックに進みましょう",4.6,"ok");

  // ── Mac env check 2 ──
  s = pres.addSlide(); sn++;
  hdr(s,"Mac — 環境チェック② ネット接続","claude.aiにアクセスできるか確認します");
  stp(s,"✓","ターミナルに以下を入力 → Enter",null,1.3,{h:0.5,nc:C.green,nb:C.greenBg});
  cmdBox(s,"curl -sI https://claude.ai | head -1",1.95);
  s.addImage({data:T.macNet,x:0.5,y:2.55,w:4.8,h:1.5,shadow:mkSh()});
  rightBox(s,"確認ポイント",'「HTTP/2 200」or\n「HTTP/1.1 200」→ OK\n\nエラーの場合:\n→ Wi-Fiに接続されてるか\n→ VPNをOFFにしてみる\n→ それでもダメなら講師へ',2.55,1.5,C.green,C.greenBg);
  nfo(s,"「200」が出ればインストールに進めます！",4.3,"ok");

  // ── Win env check 1 ──
  s = pres.addSlide(); sn++;
  hdr(s,"Windows — 環境チェック① Git確認","Claude Codeに必須です",C.blue);
  stp(s,"✓","ターミナルに以下を入力 → Enter",null,1.3,{h:0.5,nc:C.blue,nb:C.blueBg});
  cmdBox(s,"where.exe git",1.95);
  s.addImage({data:T.winGit,x:0.5,y:2.55,w:4.8,h:2.2,shadow:mkSh()});
  rightBox(s,"結果の見方","パスが表示 → OK\n\n何も表示されない場合:\n→ git-scm.com\n  からインストール\n→ Cursorを再起動\n→ もう一度確認",2.55,2.2,C.blue,C.blueBg);

  // ── Win env check 2 ──
  s = pres.addSlide(); sn++;
  hdr(s,"Windows — 環境チェック② 実行ポリシー","スクリプト実行が許可されているか確認",C.blue);
  stp(s,"✓","ターミナルに以下を入力 → Enter",null,1.3,{h:0.5,nc:C.blue,nb:C.blueBg});
  cmdBox(s,"Get-ExecutionPolicy",1.95);
  s.addImage({data:T.winPolicy,x:0.5,y:2.55,w:4.8,h:2.0,shadow:mkSh()});
  rightBox(s,"結果の見方",'「RemoteSigned」\n「Unrestricted」\n「Bypass」→ OK\n\n「Restricted」の場合:\n以下を実行してください:',2.55,2.0,C.blue,C.blueBg);
  nfo(s,'「Restricted」の方: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser → Y → Enter',4.8,"warn");

  // ── Win env check 3 ──
  s = pres.addSlide(); sn++;
  hdr(s,"Windows — 環境チェック③ ネット接続","claude.aiにアクセスできるか確認します",C.blue);
  stp(s,"✓","ターミナルに以下を入力 → Enter",null,1.3,{h:0.5,nc:C.blue,nb:C.blueBg});
  cmdBox(s,"Test-Connection claude.ai -Count 1",1.95);
  s.addImage({data:T.winNet,x:0.5,y:2.55,w:4.8,h:1.3,shadow:mkSh()});
  rightBox(s,"確認ポイント",'「Success」→ OK\n\nエラーの場合:\n→ Wi-Fi接続を確認\n→ VPNを一時OFFに\n→ テザリングを試す',2.55,1.3,C.blue,C.blueBg);
  nfo(s,"全ての環境チェックが通ったらインストールに進みましょう！",4.2,"ok");

  // ══════════════ SECTION: Install ══════════════
  s = pres.addSlide(); sn++;
  sect(s,"インストール＆認証","環境チェックが通った方から進めましょう");

  // ── Mac Install ──
  s = pres.addSlide(); sn++;
  hdr(s,"Mac — インストール","1つのコマンドをコピペするだけ");
  stp(s,1,"以下のコマンドをコピー → ターミナルに貼り付け（Cmd+V）→ Enter","数秒〜1分ほどで完了します。途中で止まっているように見えても待ってください。",1.3);
  cmdBox(s,"curl -fsSL https://claude.ai/install.sh | bash",2.25);
  s.addImage({data:T.macInstall,x:0.5,y:2.85,w:4.8,h:2.2,shadow:mkSh()});
  rightBox(s,"成功の目印",'「✓ Claude Code installed\n  successfully!」\nが表示されれば完了。\n\nNode.jsなどの追加\nインストールは不要。\n全て自動処理されます。',2.85,2.2,C.green,C.greenBg);

  // ── Mac Verify ──
  s = pres.addSlide(); sn++;
  hdr(s,"Mac — インストール確認","正しくインストールされたか確認します");
  stp(s,2,"バージョン確認",null,1.3,{h:0.5});
  cmdBox(s,"claude --version",1.95);
  s.addImage({data:T.macVer,x:0.5,y:2.55,w:4.8,h:1.5,shadow:mkSh()});
  nfo(s,"バージョン番号が表示されれば成功！エラーの場合はターミナルを開き直してください",4.3,"ok");
  stp(s,3,"ヘルスチェック（任意）","claude doctor と入力 → 全てに ✓ が付いていればOK",4.0,{h:0.65});

  // ── Win Install ──
  s = pres.addSlide(); sn++;
  hdr(s,"Windows — インストール","PowerShellにコマンドを貼り付けます",C.blue);
  stp(s,1,"以下のコマンドをコピー → ターミナルに貼り付け（Ctrl+V）→ Enter",null,1.3,{h:0.55,nc:C.blue,nb:C.blueBg});
  cmdBox(s,"irm https://claude.ai/install.ps1 | iex",2.0);
  s.addImage({data:T.winInstall,x:0.5,y:2.6,w:4.8,h:1.5,shadow:mkSh()});
  rightBox(s,"成功の目印",'「✓ Claude Code installed\n  successfully!」\nが表示されれば完了。',2.6,1.5,C.green,C.greenBg);
  nfo(s,"「irm が認識されません」→ トラブルシューティングのスライドを確認",4.4,"warn");
  stp(s,2,"バージョン確認: claude --version と入力 → Enter","バージョン番号が出ればOK",4.0,{h:0.7,nc:C.blue,nb:C.blueBg});

  // ── Auth 1 ──
  s = pres.addSlide(); sn++;
  hdr(s,"認証① — Claude Codeを初回起動","Mac / Windows 共通の手順です");
  stp(s,"A","ターミナルに claude と入力 → Enter","初回起動時はログイン画面が出ます",1.3);
  stp(s,"B","「Use Claude.ai」が選ばれているのを確認 → Enter","矢印キー ↑↓ で選択 → Enterで決定",2.3);
  s.addImage({data:T.auth1,x:1.5,y:3.3,w:5,h:2.2,shadow:mkSh()});

  // ── Auth 2 ──
  s = pres.addSlide(); sn++;
  hdr(s,"認証② — ブラウザでログイン","自動でブラウザが開きます");
  stp(s,"C","ブラウザが開く → Claudeのアカウントでログイン","Googleログインした方はGoogleでOK",1.3);
  stp(s,"D","ブラウザで「許可」をクリック","「認証成功」と表示されたらブラウザは閉じてOK",2.2);
  s.addImage({data:T.auth2,x:0.5,y:3.2,w:4.8,h:2.0,shadow:mkSh()});
  rightBox(s,"認証完了！",'ターミナルに\n「Successfully authenticated」\nと表示されれば成功。\n\nこれでClaude Codeが\n使えるようになりました！',3.2,2.0,C.green,C.greenBg);

  // ── Permission prompt ──
  s = pres.addSlide(); sn++;
  hdr(s,"権限の確認画面について","Claude Codeが「やっていいですか？」と聞いてきます",C.green);
  s.addImage({data:T.permission,x:0.5,y:1.3,w:5,h:2.5,shadow:mkSh()});
  rightBox(s,"どれを選べばいい？",'研修中は\n「Yes, allow once」\n（1回だけ許可）\nを選んでください。\n\n慣れてきたら\n「Yes, always allow」\nでも大丈夫です。\n\n「No, deny」は\nやらせたくない操作のとき。',1.3,2.5,C.green,C.greenBg);
  nfo(s,"これはセキュリティ機能です。Claudeが勝手にファイルを消したりしないよう保護しています",4.1,"note");

  // ══════════════ SECTION: Troubleshoot ══════════════
  s = pres.addSlide(); sn++;
  sect(s,"こんなときは？","エラーが出ても慌てないでください");

  // ── Err: not found ──
  s = pres.addSlide(); sn++;
  hdr(s,'エラー：「claudeが認識されません」',"最も多いエラーです",C.red);
  s.addImage({data:T.errNotFound,x:0.5,y:1.3,w:5,h:2.4,shadow:mkSh()});
  rightBox(s,"これで90%解決","① ターミナルを×で閉じる\n\n② Terminal → New Terminal\n   で新しく開く\n\n③ claude --version を\n   もう一度実行\n\nそれでもダメなら\n→ Cursorを完全終了\n→ Cursorを再起動",1.3,2.4,C.accent,C.accentBg);
  nfo(s,"原因: インストール後にPATHが反映されていないだけ。開き直せば直ります",4.0,"note");

  // ── Err: Git ──
  s = pres.addSlide(); sn++;
  hdr(s,'エラー：「Git for Windows required」',"Windowsのみ",C.red);
  s.addImage({data:T.errGit,x:0.5,y:1.3,w:5,h:2.2,shadow:mkSh()});
  rightBox(s,"解決手順","① git-scm.com を開く\n\n② Download をクリック\n\n③ インストーラーを実行\n   全て「Next」でOK\n\n④ Cursorを再起動（重要）\n\n⑤ インストールコマンドを\n   もう一度実行",1.3,2.2,C.blue,C.blueBg);

  // ── Err: irm ──
  s = pres.addSlide(); sn++;
  hdr(s,'エラー：「irmが認識されません」',"Windowsのみ",C.red);
  s.addImage({data:T.errIrm,x:0.5,y:1.3,w:5,h:2.8,shadow:mkSh()});
  rightBox(s,"2つの解決方法","方法A:\ncmd用コマンドに切り替え\n（左の画面参照）\n\n方法B:\nターミナル右上の\n「＋」横の「▼」\n→「PowerShell」を選択\n→ 最初のコマンドを再実行",1.3,2.8,C.accent,C.accentBg);

  // ── Err: browser ──
  s = pres.addSlide(); sn++;
  hdr(s,"エラー：ブラウザが自動で開かない","認証時のトラブル",C.red);
  s.addImage({data:T.errBrowser,x:0.5,y:1.3,w:5,h:2.2,shadow:mkSh()});
  rightBox(s,"手動でログインする","① ターミナルのURLを確認\n   https://claude.ai/...\n\n② URLを選択してコピー\n   Mac: Cmd+C\n   Win: Ctrl+C\n\n③ ブラウザを手動で開く\n\n④ URLを貼り付けてEnter",1.3,2.2,C.accent,C.accentBg);

  // ── Err: TLS ──
  s = pres.addSlide(); sn++;
  hdr(s,"エラー：ネットワーク/TLSエラー","接続に失敗する場合",C.red);
  s.addImage({data:T.errTls,x:0.5,y:1.3,w:5,h:1.8,shadow:mkSh()});
  rightBox(s,"試すこと","① VPNをOFFにする\n\n② Wi-Fiを切り替え\n   （テザリング等）\n\n③ Windows限定:\n   PowerShellで先に実行:\n   [Net.ServicePoint...\n   TLS 1.2を有効化\n\n④ 講師にご相談ください",1.3,1.8,C.accent,C.accentBg);

  // ── Err: Xcode ──
  s = pres.addSlide(); sn++;
  hdr(s,"Mac：Xcode Tools のポップアップが出たら","git initで初めて出ることがあります");
  s.addImage({data:T.xcodePopup,x:0.5,y:1.3,w:5,y:1.3,h:2.5,shadow:mkSh()});
  rightBox(s,"対処法（簡単です）",'ポップアップの\n「インストール」を\nクリックするだけ。\n\n数分間ダウンロード＆\nインストールが走ります。\n\n完了したら\nもう一度 git init を\n実行してください。\n\n※ 初回のみ表示されます',1.3,2.5,C.accent,C.accentBg);

  // ── Err: summary ──
  s = pres.addSlide(); sn++;
  hdr(s,"トラブルシューティングまとめ","最終手段: claude doctor");
  stp(s,1,"claude doctor を実行","Claude Codeの自動診断コマンド。問題があれば教えてくれます",1.3);
  cmdBox(s,"claude doctor",2.25);
  s.addImage({data:T.macDoctor,x:0.5,y:2.85,w:4.8,h:2.2,shadow:mkSh()});
  rightBox(s,"最終手段","① claude doctor の結果を\n   スクリーンショット\n\n② 講師に見せてください\n\n③ 一緒に解決します！\n\nどんなエラーでも\n対応しますので\n遠慮なくお声がけを。",2.85,2.2,C.red,C.redBg);

  // ══════════════ SECTION: Handson ══════════════
  s = pres.addSlide(); sn++;
  sect(s,"ハンズオン","自分専用AIアシスタントを作ってみよう\nコードは一切書きません。日本語で指示するだけ。");

  // ── H1: folder ──
  s = pres.addSlide(); sn++;
  hdr(s,"ハンズオン① フォルダを準備する","AIアシスタントの「お部屋」を用意します");
  stp(s,1,"フォルダを作る",null,1.3,{h:0.5});
  cmdBox(s,"mkdir my-agent",1.95);
  stp(s,2,"フォルダに移動する",null,2.55,{h:0.5});
  cmdBox(s,"cd my-agent",3.2);
  stp(s,3,"Git初期化（エラー防止）",null,3.8,{h:0.5});
  cmdBox(s,"git init",4.45);
  nfo(s,"Macでポップアップが出たら → 「インストール」をクリック → 完了後にもう一度 git init",5.1,"tip");

  // ── H2: launch ──
  s = pres.addSlide(); sn++;
  hdr(s,"ハンズオン② Claude Codeを起動","準備したフォルダの中で立ち上げます");
  stp(s,4,"claude と入力 → Enter","認証済みなので「>」プロンプトがすぐ出ます",1.3);
  s.addShape("rect",{x:0.5,y:2.4,w:9,h:1.0,fill:{color:C.accentBg}});
  s.addText('「>」マークが表示されて、カーソルが点滅していたら準備OK！\nここに日本語で指示を入力します。普通の文章で話しかけてください。',{x:0.7,y:2.4,w:8.6,h:1.0,fontSize:14,fontFace:"Arial",color:C.accent,valign:"middle",margin:0});
  nfo(s,"権限確認のポップアップが出たら →「Yes, allow once」を選択",3.7,"tip");

  // ── H3: CLAUDE.md ──
  s = pres.addSlide(); sn++;
  hdr(s,"ハンズオン③ AIに人格を与える","CLAUDE.mdファイルで「どんなAIか」を決めます");
  stp(s,5,"以下のように日本語で指示してください",null,1.3,{h:0.5});
  s.addShape("rect",{x:0.5,y:1.95,w:9,h:0.7,fill:{color:C.accentBg}});
  s.addText('CLAUDE.mdを作成してください。内容は「あなたは優秀なビジネスアシスタントです。\n丁寧な日本語で回答してください。」にしてください。',{x:0.7,y:1.95,w:8.6,h:0.7,fontSize:13,fontFace:"Arial",color:C.text,valign:"middle",margin:0});
  s.addImage({data:T.hand3,x:0.5,y:2.85,w:4.8,h:2.0,shadow:mkSh()});
  rightBox(s,"何が起きた？","CLAUDE.mdファイルが\n自動で作成されました。\n\nこれはClaude Codeへの\n「常時指示書」です。\n\nここに書いた内容を\n常に守って動きます。\n\nCursorの左側に\nファイルが出現します。",2.85,2.0,C.green,C.greenBg);

  // ── H4: talk ──
  s = pres.addSlide(); sn++;
  hdr(s,"ハンズオン④ AIアシスタントと会話","実際に話しかけてみましょう");
  stp(s,6,"「自己紹介して」と入力してみましょう",null,1.3,{h:0.5});
  s.addImage({data:T.hand4,x:0.5,y:2.0,w:4.8,h:2.5,shadow:mkSh()});
  rightBox(s,"他にも試してみよう","「メールの書き方のコツを\n  3つ教えて」\n\n「会議の議事録テンプレを\n  作って」\n\n「AI活用のアイデアを\n  5つ提案して」\n\n「新入社員向けの\n  挨拶文を作って」",2.0,2.5,C.accent,C.accentBg);
  nfo(s,"CLAUDE.mdの設定に従って「ビジネスアシスタント」として回答してくれます",4.8,"ok");

  // ── H5: file gen ──
  s = pres.addSlide(); sn++;
  hdr(s,"ハンズオン⑤ ファイルを自動生成","実務で使えるタスクをやらせてみましょう");
  stp(s,7,"業務で使いそうな指示をしてみましょう",'例:「来週月曜の社内勉強会のアジェンダを作って。テーマはAI活用、参加者10名、1時間。」',1.3);
  s.addImage({data:T.hand5,x:0.5,y:2.4,w:4.8,h:2.0,shadow:mkSh()});
  rightBox(s,"ポイント","Claudeは指示に応じて\nファイルを自動で作ります。\n\nCursorの左側の\nファイル一覧に\n新しいファイルが出現。\n\nクリックして中身を\n確認しましょう！\n\n具体的に指示するほど\n良い結果が出ます。",2.4,2.0,C.green,C.greenBg);

  // ── H6: customize ──
  s = pres.addSlide(); sn++;
  hdr(s,"ハンズオン⑥ AIの役割を変えてみる","CLAUDE.mdを書き換えるだけで何にでもなれます");
  s.addText("「CLAUDE.mdの内容を〇〇に変えて」とClaudeに指示すれば書き換えてくれます:",{x:0.5,y:1.3,w:9,h:0.3,fontSize:13,fontFace:"Arial",color:C.sub,margin:0});
  [{r:"議事録アシスタント",m:"あなたは会議の議事録を整理する専門家です。\n要点を箇条書きで、決定事項とTODOを明確に。"},
   {r:"メール校正アシスタント",m:"あなたはビジネスメールの校正者です。\n敬語の間違い、分かりにくい表現を指摘してください。"},
   {r:"企画書アシスタント",m:"あなたは企画書作成のプロです。\n目的・背景・施策・スケジュールの構成で作成してください。"},
   {r:"リサーチアシスタント",m:"あなたはリサーチの専門家です。\n情報を調べて、出典つきで分かりやすくまとめてください。"}
  ].forEach((item,i)=>{
    const y=1.75+i*0.92;
    s.addShape("rect",{x:0.5,y,w:9,h:0.8,fill:{color:C.card},shadow:mkSh()});
    s.addShape("rect",{x:0.5,y,w:0.06,h:0.8,fill:{color:C.accent}});
    s.addText(item.r,{x:0.8,y:y+0.05,w:3,h:0.25,fontSize:13,fontFace:"Arial",color:C.accent,bold:true,margin:0});
    s.addText(item.m,{x:0.8,y:y+0.33,w:8.4,h:0.42,fontSize:11,fontFace:C.mono,color:C.sub,margin:0});
  });

  // ══════════════ SECTION: Commands ══════════════
  s = pres.addSlide(); sn++;
  sect(s,"基本操作＆コマンド集","覚えておくと便利な操作をまとめました");

  // ── Keyboard ops ──
  s = pres.addSlide(); sn++;
  hdr(s,"キーボード操作","よく使うキー操作です",C.purple);
  const keys = [
    {k:"Enter",d:"入力した指示を送信する",cat:"基本"},
    {k:"Esc",d:"Claudeの回答を途中で止める。間違った指示を出したときに便利",cat:"基本"},
    {k:"↑（上矢印）",d:"過去に入力した指示を呼び出す。もう一度同じことを頼みたいとき",cat:"基本"},
    {k:"Ctrl + C",d:"Claude Codeを終了する。もう一度 claude で再開できます",cat:"終了"},
    {k:"Cmd/Ctrl + `",d:"Cursorのターミナルを開く/閉じる",cat:"Cursor"},
  ];
  keys.forEach((k,i)=>{
    const y=1.25+i*0.8;
    s.addShape("rect",{x:0.5,y,w:9,h:0.68,fill:{color:C.card},shadow:mkSh()});
    s.addShape("rect",{x:0.5,y,w:2.2,h:0.68,fill:{color:C.purpleBg}});
    s.addText(k.k,{x:0.5,y,w:2.2,h:0.68,fontSize:15,fontFace:C.mono,color:C.purple,align:"center",valign:"middle",bold:true});
    s.addText(k.d,{x:2.9,y,w:6.4,h:0.68,fontSize:13,fontFace:"Arial",color:C.text,valign:"middle",margin:0});
  });

  // ── Slash commands ──
  s = pres.addSlide(); sn++;
  hdr(s,"スラッシュコマンド","「/」から始まるClaude Code専用コマンド",C.purple);
  s.addImage({data:T.cmdRef,x:0.5,y:1.2,w:5,h:2.7,shadow:mkSh()});
  const slashes = [
    {c:"/help",d:"使えるコマンドの一覧。困ったらまずこれ。"},
    {c:"/compact",d:"長い会話を要約して軽くする。動作が遅くなったら。"},
    {c:"/status",d:"ログイン状態・プラン確認。認証トラブル時に。"},
    {c:"/login",d:"再ログイン。認証が切れたときに。"},
    {c:"/clear",d:"会話をリセット。最初からやり直したいとき。"},
  ];
  slashes.forEach((item,i)=>{
    const y=1.2+i*0.5;
    s.addShape("rect",{x:5.8,y,w:3.7,h:0.42,fill:{color:C.card}});
    s.addText(item.c,{x:5.9,y,w:1.2,h:0.42,fontSize:13,fontFace:C.mono,color:C.purple,valign:"middle",bold:true,margin:0});
    s.addText(item.d,{x:7.15,y,w:2.25,h:0.42,fontSize:10.5,fontFace:"Arial",color:C.sub,valign:"middle",margin:0});
  });
  nfo(s,"全コマンドを覚える必要はありません。/help だけ覚えておけばOK！",4.2,"tip");

  // ── Restart & recovery ──
  s = pres.addSlide(); sn++;
  hdr(s,"再起動と復旧","動作がおかしくなったときの対処法",C.purple);
  [{t:"Claude Codeを再起動する",d:"Ctrl+C で終了 → claude で再起動。\nほとんどの問題はこれで直ります。",ic:C.green},
   {t:"会話をリセットする",d:"/clear と入力。会話履歴が消えて最初からやり直せます。\n動作が遅い・変な回答が続くときに。",ic:C.accent},
   {t:"ヘルスチェックする",d:"claude doctor と入力。設定やインストールの問題を自動診断。\n何が悪いか分からないときの最終手段。",ic:C.blue},
   {t:"Cursorごと再起動する",d:"Cursorを完全に閉じて → もう一度起動 → ターミナルを開く → claude\n環境変数やPATHの問題はこれで直ります。",ic:C.red},
  ].forEach((item,i)=>{
    const y=1.3+i*1.0;
    s.addShape("rect",{x:0.5,y,w:9,h:0.88,fill:{color:C.card},shadow:mkSh()});
    s.addShape("rect",{x:0.5,y,w:0.06,h:0.88,fill:{color:item.ic}});
    s.addText(item.t,{x:0.8,y:y+0.05,w:8.4,h:0.3,fontSize:14,fontFace:"Arial",color:C.text,bold:true,margin:0});
    s.addText(item.d,{x:0.8,y:y+0.38,w:8.4,h:0.45,fontSize:11.5,fontFace:"Arial",color:C.sub,margin:0});
  });

  // ── CLAUDE.md tips ──
  s = pres.addSlide(); sn++;
  hdr(s,"CLAUDE.md 活用のコツ","AIへの「常時指示書」をうまく使うポイント");
  [{t:"ルールを書く",ex:"「回答は必ず日本語で」「ですます調で」「500文字以内で」"},
   {t:"役割を定義する",ex:"「あなたは〇〇の専門家です」「初心者にも分かるように」"},
   {t:"禁止事項を書く",ex:"「略語は使わない」「技術用語は避ける」「英語は使わない」"},
   {t:"フォーマットを指定する",ex:"「箇条書きで回答して」「見出しをつけて」「表形式で」"},
  ].forEach((item,i)=>{
    const y=1.3+i*1.0;
    s.addShape("rect",{x:0.5,y,w:9,h:0.85,fill:{color:C.card},shadow:mkSh()});
    s.addShape("rect",{x:0.5,y,w:0.06,h:0.85,fill:{color:C.accent}});
    s.addText(item.t,{x:0.8,y:y+0.05,w:8.4,h:0.3,fontSize:14,fontFace:"Arial",color:C.text,bold:true,margin:0});
    s.addText("例: "+item.ex,{x:0.8,y:y+0.4,w:8.4,h:0.35,fontSize:12,fontFace:C.mono,color:C.sub,margin:0});
  });
  nfo(s,"CLAUDE.mdが充実しているほど、毎回説明しなくても意図通りの回答が返ってきます",5.0,"tip");

  // ── End ──
  s = pres.addSlide(); sn++;
  s.background = { color: C.dark };
  s.addShape("rect",{x:0,y:0,w:10,h:0.05,fill:{color:C.accent}});
  s.addShape("rect",{x:0,y:5.575,w:10,h:0.05,fill:{color:C.accent}});
  s.addImage({data:icRocket,x:4.5,y:0.6,w:1,h:1});
  s.addText("お疲れさまでした！",{x:1,y:1.6,w:8,h:1,fontSize:40,fontFace:"Arial Black",color:"FFFFFF",align:"center",valign:"middle"});
  s.addText("今日作ったAIアシスタントは\nCLAUDE.mdを書き換えるだけで何にでもなれます",{x:1,y:2.7,w:8,h:0.9,fontSize:17,fontFace:"Arial",color:C.accent,align:"center"});
  ["議事録アシスタント → 会議メモを整理","メール校正アシスタント → ビジネスメールを添削","企画書アシスタント → 構成案を自動生成","リサーチアシスタント → 情報を調べてまとめる"].forEach((t,i)=>{
    s.addText(t,{x:1.5,y:3.6+i*0.33,w:7,h:0.28,fontSize:13,fontFace:"Arial",color:"A0A0B0",align:"center",margin:0});
  });
  s.addText("ご質問はいつでもお気軽に！  |  with-AI Inc.  |  with-ai.jp",{x:1,y:4.95,w:8,h:0.35,fontSize:12,fontFace:"Arial",color:"808090",align:"center"});

  const out = "/Users/kaitomain/Desktop/Claude_Code_導入研修.pptx";
  await pres.writeFile({ fileName: out });
  console.log(`✅ ${out}`);
  console.log(`Total: ${sn} slides`);
}

main().catch(console.error);
