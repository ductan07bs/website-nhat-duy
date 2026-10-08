/**
 * NỘI THẤT NHẬT DUY — Nhận lead từ website về Google Sheet + gửi email (+ Telegram)
 * ===========================================================================
 * File này KHÔNG chạy trên website. Dán toàn bộ nội dung vào Google Apps Script.
 *
 * Nhận lead từ 2 nguồn:
 *   - Chatbox AI      → website gọi /api/lead → /api/lead POST JSON sang đây
 *   - Form đặt lịch / Phiếu phong thủy → trình duyệt POST thẳng sang đây
 * Mỗi lead: ghi 1 dòng vào Sheet + gửi email về NOTIFY_EMAIL.
 *
 * HƯỚNG DẪN TỪNG BƯỚC (làm một lần, khoảng 5 phút)
 * ---------------------------------------------------------------------------
 *  1. Vào https://sheets.new để tạo một Google Sheet mới.
 *     Đặt tên, ví dụ: "Lead Website Nhật Duy".
 *  2. Trên menu của Sheet: Extensions (Tiện ích mở rộng) → Apps Script.
 *  3. Xoá hết code mẫu trong ô soạn thảo, dán TOÀN BỘ file này vào. Bấm biểu tượng 💾 (Save).
 *  4. Chạy thử: ở thanh công cụ chọn hàm "testLead" → bấm Run (Chạy).
 *     Lần đầu Google hỏi quyền → Review permissions → chọn tài khoản → Advanced →
 *     Go to ... (unsafe) → Allow. (Script của chính bạn nên an toàn.)
 *     Kết quả đúng: Sheet có tab "Leads" với 1 dòng "Khách thử" + có email về hộp thư.
 *  5. Bấm Deploy (Triển khai) → New deployment (Tùy chọn triển khai mới).
 *       - Bấm biểu tượng bánh răng cạnh "Select type" → chọn Web app
 *       - Execute as (Thực thi với tư cách): Me (Tôi)
 *       - Who has access (Người có quyền truy cập): Anyone (Bất kỳ ai)
 *     → Deploy → Copy "Web app URL", dạng:
 *         https://script.google.com/macros/s/XXXXXXXX/exec
 *  6. Dán URL đó vào HAI nơi:
 *       a) Vercel → Project → Settings → Environment Variables → biến SHEET_ENDPOINT
 *          (cho chatbox AI)
 *       b) Dòng  const SHEET_ENDPOINT = '';  ở đầu file assets/js/main.js
 *          (cho form đặt lịch và Phiếu phong thủy)
 *  7. Kiểm tra nhanh: mở URL ở bước 5 trên trình duyệt → thấy {"ok":true,...} là đúng.
 *
 * LƯU Ý: mỗi lần SỬA code ở đây phải Deploy → Manage deployments → biểu tượng bút chì →
 * Version: New version → Deploy. Nếu không, Web App vẫn chạy code cũ.
 *
 * (Tùy chọn) Telegram cho form đặt lịch: chatbox đã tự báo Telegram qua /api/lead.
 * Muốn form đặt lịch cũng báo Telegram thì vào Project Settings (bánh răng) →
 * Script Properties → thêm TELEGRAM_BOT_TOKEN và TELEGRAM_CHAT_ID.
 */

// ── CẤU HÌNH ───────────────────────────────────────────────────────────────
var NOTIFY_EMAIL = 'ductan07bs@gmail.com'; // email nhận thông báo lead mới
var SHEET_NAME = 'Leads';

// Thứ tự cột trong Sheet: [tên trường, tiêu đề cột]
var COLUMNS = [
  ['submitted_at', 'Thời gian'],
  ['name',         'Họ tên'],
  ['phone',        'Số điện thoại'],
  ['note',         'Nhu cầu'],
  ['source',       'Nguồn'],
  ['ward',         'Khu vực'],
  ['service',      'Dịch vụ'],
  ['visit_date',   'Ngày ghé'],
  ['visit_time',   'Khung giờ'],
  ['zalo',         'Nhận xác nhận Zalo/SMS'],
  ['kich_thuoc',   'Kích thước (Lỗ Ban)'],
  ['cung',         'Cung hiện tại'],
  ['de_xuat',      'Kích thước đề xuất'],
  ['page_url',     'Trang nguồn']
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // tránh 2 lead ghi đè nhau khi gửi cùng lúc
    var data = readBody_(e);

    if (!data.name || !data.phone) {
      return json_({ ok: false, error: 'Thiếu họ tên hoặc số điện thoại' });
    }
    if (!data.submitted_at) {
      data.submitted_at = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'HH:mm:ss dd/MM/yyyy');
    }
    // Form đặt lịch không có ô "nhu cầu" → lấy dịch vụ khách chọn
    if (!data.note) data.note = data.service || '';

    saveToSheet_(data);

    // Lead đã nằm trong Sheet — email/Telegram lỗi không được làm khách thấy "gửi thất bại"
    try { sendEmail_(data); } catch (mailErr) { console.error('Email lỗi: ' + mailErr); }
    if (!data.skip_telegram) {
      try { notifyTelegram_(data); } catch (tgErr) { console.error('Telegram lỗi: ' + tgErr); }
    }
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Mở URL web app trên trình duyệt để kiểm tra đã triển khai đúng chưa
function doGet() {
  return json_({ ok: true, message: 'Endpoint nhận lead Nhật Duy đang hoạt động' });
}

// Chatbox gửi JSON; form trên website gửi dạng form thường — nhận cả hai
function readBody_(e) {
  if (e && e.postData && e.postData.contents && String(e.postData.type).indexOf('application/json') === 0) {
    return JSON.parse(e.postData.contents);
  }
  return (e && e.parameter) || {};
}

function saveToSheet_(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(function (c) { return c[1]; }));
    sheet.setFrozenRows(1);
  }
  sheet.appendRow(COLUMNS.map(function (c) {
    var v = String(data[c[0]] || '');
    // Dấu nháy đơn đầu ô: giữ số 0 đầu số điện thoại, chặn công thức lạ
    return /^[0+=\-@]/.test(v) ? "'" + v : v;
  }));
}

function leadLines_(data) {
  var lines = [];
  COLUMNS.forEach(function (c) {
    if (data[c[0]]) lines.push(c[1] + ': ' + data[c[0]]);
  });
  return lines;
}

function sendEmail_(data) {
  if (!NOTIFY_EMAIL) return;
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: '[Nhật Duy] Lead mới: ' + data.name + ' — ' + data.phone,
    body: 'Có khách vừa để lại thông tin trên website.\n\n' + leadLines_(data).join('\n') +
          '\n\nGọi lại khách trong 30 phút nhé.\n\nXem tất cả lead: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  });
}

function notifyTelegram_(data) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('TELEGRAM_BOT_TOKEN');
  var chatId = props.getProperty('TELEGRAM_CHAT_ID');
  if (!token || !chatId) return; // chưa cấu hình Telegram ở đây → bỏ qua

  var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: chatId,
      text: '🔔 LEAD MỚI — ' + (data.source || 'Website') + '\n' + leadLines_(data).join('\n'),
      disable_web_page_preview: true
    }),
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) throw new Error(res.getContentText());
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Chạy tay hàm này trong trình soạn Apps Script để thử (bước 4)
function testLead() {
  var out = doPost({
    postData: {
      type: 'application/json',
      contents: JSON.stringify({
        name: 'Khách thử',
        phone: '0909001336',
        note: 'Hỏi giá nệm Kymdan Deluxe 1m6',
        source: 'Chạy thử từ Apps Script',
        page_url: 'https://noithatnhatduy.vn/'
      })
    }
  });
  console.log(out.getContent());
}
