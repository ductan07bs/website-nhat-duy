/* =========================================================
   /api/lead — Nhận Tên + SĐT từ chatbox (Vercel Serverless Function)
   ---------------------------------------------------------
   Nhận:  POST { name, phone, note, page_url }
   Trả:   { ok: true }  CHỈ KHI ghi được Google Sheet
          { ok: false, error: '...' } nếu không

   CẤU HÌNH (Vercel → Project → Settings → Environment Variables):
     SHEET_ENDPOINT       URL Web App của Google Apps Script (xem google-apps-script.gs)
     TELEGRAM_BOT_TOKEN   token bot từ @BotFather
     TELEGRAM_CHAT_ID     chat id nhận thông báo (lấy bằng @userinfobot)

   Các kênh chạy tuần tự và độc lập — một kênh lỗi không làm hỏng kênh khác:
     (a) Google Sheet   (b) Telegram   (c) Email — do Apps Script gửi   (d) Zalo OA — để sẵn
   ========================================================= */

const RATE_LIMIT = 5;                     // tối đa 5 lần gửi số / 10 phút / mỗi IP
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > RATE_LIMIT;
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch (_) { return false; }
}

/* 0909 001 336 / +84909001336 / 84909001336 → 0909001336 */
function normalizePhone(raw) {
  let p = String(raw || '').replace(/[\s.\-()]/g, '');
  if (p.startsWith('+84')) p = '0' + p.slice(3);
  else if (p.startsWith('84') && p.length === 11) p = '0' + p.slice(2);
  return p;
}

const clean = (v, max) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max);

/* (a) Ghi Google Sheet — Apps Script đồng thời gửi email (c) */
async function saveToSheet(lead) {
  const url = process.env.SHEET_ENDPOINT;
  if (!url) throw new Error('Chưa cấu hình SHEET_ENDPOINT');
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    /* skip_telegram: hàm này tự báo Telegram ở bước (b), tránh báo trùng 2 lần */
    body: JSON.stringify({ ...lead, skip_telegram: '1' }),
    redirect: 'follow',
    signal: AbortSignal.timeout(15_000)
  });
  if (!r.ok) throw new Error('Apps Script HTTP ' + r.status);
  const data = await r.json().catch(() => null);
  if (!data || data.ok !== true) throw new Error('Apps Script không xác nhận đã ghi: ' + ((data && data.error) || 'phản hồi không phải JSON'));
}

/* (b) Báo Telegram */
async function notifyTelegram(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error('Chưa cấu hình TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID');
  const text = [
    '🔔 LEAD MỚI — ' + lead.source,
    'Tên: ' + lead.name,
    'SĐT: ' + lead.phone,
    'Nhu cầu: ' + (lead.note || '(chưa rõ)'),
    'Thời gian: ' + lead.submitted_at,
    'Trang nguồn: ' + (lead.page_url || '(không rõ)')
  ].join('\n');
  const r = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10_000)
  });
  if (!r.ok) throw new Error('Telegram HTTP ' + r.status);
}

/* (d) Zalo OA — GIAI ĐOẠN 2, hiện để trống an toàn (không gọi mạng, không lỗi).
   ---------------------------------------------------------------------------
   Khi shop đã có Zalo Official Account được xác thực, cắm vào như sau:
   1. Tạo ứng dụng tại https://developers.zalo.me → liên kết với OA của shop.
   2. Xin quyền gửi tin + lấy access_token và refresh_token của OA
      (access_token hết hạn sau ~25 giờ → phải làm mới bằng refresh_token;
       cần lưu token mới vào nơi bền vững, ví dụ Vercel KV, không lưu trong code).
   3. Thêm biến môi trường: ZALO_OA_ACCESS_TOKEN, ZALO_OA_ADMIN_USER_ID
      (user_id Zalo của người nhận thông báo — người đó phải đã quan tâm OA).
   4. Thay thân hàm bằng lời gọi gửi tin văn bản của Zalo OA OpenAPI:
        POST https://openapi.zalo.me/v3.0/oa/message/cs
        header: access_token: <ZALO_OA_ACCESS_TOKEN>
        body:   { "recipient": { "user_id": "<ZALO_OA_ADMIN_USER_ID>" },
                  "message":   { "text": "LEAD MỚI: <tên> - <sđt> - <nhu cầu>" } }
      (Đối chiếu lại tài liệu Zalo tại thời điểm làm — endpoint có thể đã đổi phiên bản.)
   Lưu ý: OA chỉ nhắn được cho người đã tương tác với OA trong khung thời gian Zalo cho phép. */
async function notifyZaloOA(lead) { // eslint-disable-line no-unused-vars
  return { skipped: true };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Chỉ nhận POST' });
  }
  if (!sameOrigin(req)) return res.status(403).json({ ok: false, error: 'Nguồn gọi không hợp lệ' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return res.status(429).json({ ok: false, error: 'Gửi quá nhiều lần, vui lòng thử lại sau ít phút' });

  const body = req.body || {};
  const name = clean(body.name, 80);
  const phone = normalizePhone(body.phone);
  if (!name) return res.status(400).json({ ok: false, error: 'Vui lòng nhập họ tên' });
  if (!/^0\d{9}$/.test(phone)) return res.status(400).json({ ok: false, error: 'Số điện thoại chưa đúng — cần 10 số, bắt đầu bằng 0' });

  const lead = {
    submitted_at: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
    name,
    phone,
    note: clean(body.note, 500),
    source: 'Chatbox AI',
    page_url: clean(body.page_url || req.headers.referer, 300)
  };

  /* Chạy tuần tự; ghi lại kết quả từng kênh để tra log trên Vercel */
  const channels = {};
  for (const [key, fn] of [['sheet', saveToSheet], ['telegram', notifyTelegram], ['zalo', notifyZaloOA]]) {
    try {
      await fn(lead);
      channels[key] = 'ok';
    } catch (err) {
      channels[key] = 'lỗi';
      console.error('Kênh ' + key + ' lỗi:', err && err.message);
    }
  }
  /* Sheet và Telegram cùng hỏng → in lead ra log để chủ shop còn vớt lại được */
  if (channels.sheet !== 'ok' && channels.telegram !== 'ok') console.error('LEAD CHƯA LƯU ĐƯỢC:', JSON.stringify(lead));

  if (channels.sheet === 'ok') return res.status(200).json({ ok: true });
  return res.status(502).json({ ok: false, error: 'Chưa ghi được thông tin, vui lòng gọi 0909 001 336' });
};
