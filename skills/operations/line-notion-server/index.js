require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const line = require('@line/bot-sdk');
const { Client: NotionClient } = require('@notionhq/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── 設定 ──
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const lineClient = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});

const notion = new NotionClient({ auth: process.env.NOTION_API_KEY });
const EMPLOYEE_DB = process.env.NOTION_EMPLOYEE_DB_ID;
const REPORT_DB = process.env.NOTION_DAILY_REPORT_DB_ID;

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── 従業員キャッシュ（10分TTL） ──
const employeeCache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

async function resolveEmployee(lineUserId) {
  const cached = employeeCache.get(lineUserId);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const res = await notion.databases.query({
    database_id: EMPLOYEE_DB,
    filter: { property: 'LINE_USER_ID', rich_text: { equals: lineUserId } },
  });

  if (res.results.length === 0) {
    employeeCache.set(lineUserId, { data: null, ts: Date.now() });
    return null;
  }

  const page = res.results[0];
  const name = page.properties['名前']?.title?.[0]?.plain_text || '不明';
  const data = { pageId: page.id, name };
  employeeCache.set(lineUserId, { data, ts: Date.now() });
  return data;
}

// ── Gemini構造化抽出 ──
async function extractReportFields(rawText) {
  const today = new Date().toISOString().split('T')[0];
  const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const response = await model.generateContent(`あなたはドライバーの日報アシスタントです。以下のテキストから情報を抽出してJSONだけ返してください。余計な説明やマークダウンは不要です。

{
  "mileage": 走行距離（km、数値のみ。不明ならnull）,
  "destinations": "配送先（複数あればカンマ区切り。不明なら空文字）",
  "work_details": "業務内容（不明なら空文字）",
  "notes": "メモ・備考（上記に分類できない情報。不明なら空文字）",
  "date": "日付（YYYY-MM-DD形式。言及がなければ今日: ${today}）"
}

テキスト:
${rawText}`);

  const text = response.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch[0]);
}

// ── Notion書き込み ──
async function createDailyReport(employee, fields, rawText) {
  const reportDate = fields.date || new Date().toISOString().split('T')[0];
  await notion.pages.create({
    parent: { database_id: REPORT_DB },
    properties: {
      'タイトル': { title: [{ text: { content: `${employee.name} - ${reportDate}` } }] },
      '従業員': { relation: [{ id: employee.pageId }] },
      '日付': { date: { start: reportDate } },
      '走行距離': { number: fields.mileage },
      '配送先': { rich_text: [{ text: { content: (fields.destinations || '').substring(0, 2000) } }] },
      '業務内容': { rich_text: [{ text: { content: (fields.work_details || '').substring(0, 2000) } }] },
      'メモ': { rich_text: [{ text: { content: (fields.notes || '').substring(0, 2000) } }] },
      '受付時刻': { date: { start: new Date().toISOString() } },
      '元テキスト': { rich_text: [{ text: { content: rawText.substring(0, 2000) } }] },
      '入力方法': { select: { name: 'テキスト' } },
    },
  });
}

// ── 確認メッセージ ──
function formatConfirmation(employee, fields) {
  const reportDate = fields.date || new Date().toISOString().split('T')[0];
  const lines = ['✅ 日報を登録しました', ''];
  lines.push(`👤 ${employee.name}`);
  lines.push(`📅 ${reportDate}`);
  if (fields.mileage != null) lines.push(`🚗 走行距離: ${fields.mileage} km`);
  if (fields.destinations) lines.push(`📍 配送先: ${fields.destinations}`);
  if (fields.work_details) lines.push(`📋 業務内容: ${fields.work_details}`);
  if (fields.notes) lines.push(`📝 メモ: ${fields.notes}`);
  return lines.join('\n');
}

// ── テキストメッセージ処理 ──
async function handleTextMessage(event) {
  const userId = event.source.userId;
  const employee = await resolveEmployee(userId);
  if (!employee) {
    return lineClient.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: '⚠️ 未登録のユーザーです。管理者に従業員マスタへの登録を依頼してください。' }],
    });
  }

  const rawText = event.message.text;
  try {
    const fields = await extractReportFields(rawText);
    console.log(`[AI抽出] ${employee.name}:`, fields);

    await createDailyReport(employee, fields, rawText);
    console.log(`[Notion書込完了] ${employee.name}`);

    await lineClient.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: formatConfirmation(employee, fields) }],
    });
  } catch (err) {
    console.error('処理エラー:', err);
    await lineClient.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: '❌ 処理に失敗しました。もう一度お試しください。' }],
    });
  }
}

// ── Express ──
const app = express();

app.use('/webhook', express.json({
  verify: (req, _res, buf) => { req.rawBody = buf; },
}));

function validateSignature(req, res, next) {
  const signature = req.headers['x-line-signature'];
  console.log('[Webhook受信] signature:', signature ? 'あり' : 'なし');
  if (!signature) return res.status(401).json({ error: 'Missing signature' });
  const hash = crypto
    .createHmac('SHA256', config.channelSecret)
    .update(req.rawBody)
    .digest('base64');
  if (signature !== hash) {
    console.warn('[署名不一致] expected:', hash, 'got:', signature);
    return res.status(401).json({ error: 'Invalid signature' });
  }
  console.log('[署名OK]');
  next();
}

app.post('/webhook', validateSignature, async (req, res) => {
  console.log('[イベント数]', (req.body.events || []).length, JSON.stringify(req.body).substring(0, 300));
  res.status(200).json({ status: 'ok' });

  for (const event of req.body.events || []) {
    console.log(`[イベント] type=${event.type} userId=${event.source?.userId}`);
    if (event.type === 'message' && event.message.type === 'text') {
      try {
        await handleTextMessage(event);
      } catch (err) {
        console.error('イベント処理エラー:', err);
      }
    }
  }
});

app.get('/', (req, res) => {
  res.json({
    status: 'running',
    databases: { employee: EMPLOYEE_DB, dailyReport: REPORT_DB },
    ai: process.env.GEMINI_API_KEY ? 'Gemini (enabled)' : 'disabled',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 日報サーバー起動: http://localhost:${PORT}`);
  console.log(`   従業員DB: ${EMPLOYEE_DB}`);
  console.log(`   日報DB:   ${REPORT_DB}`);
  console.log(`   AI:       ${process.env.GEMINI_API_KEY ? 'Gemini ✅' : '⚠️ GEMINI_API_KEY 未設定'}`);
});
