/**
 * NỘI THẤT NHẬT DUY — Nhận lead từ website về Google Sheet + báo Telegram
 * ---------------------------------------------------------------------------
 * File này KHÔNG chạy trên website. Dán nội dung vào Google Apps Script.
 *
 * CÀI ĐẶT (làm một lần, khoảng 10 phút)
 *
 * A. Tạo Sheet + script
 *   1. Vào https://sheets.new tạo một Google Sheet, đặt tên ví dụ "Lead Website Nhật Duy".
 *   2. Menu Tiện ích mở rộng → Apps Script. Xoá code mẫu, dán toàn bộ file này vào.
 *
 * B. Tạo Telegram Bot (bỏ qua nếu chỉ cần ghi Sheet)
 *   3. Trong Telegram, chat với @BotFather → gõ /newbot → làm theo hướng dẫn → nhận BOT TOKEN.
 *   4. Mở chat với bot vừa tạo, bấm Start và gửi một tin bất kỳ.
 *      (Muốn báo vào nhóm: thêm bot vào nhóm rồi gửi một tin trong nhóm.)
 *   5. Mở https://api.telegram.org/bot<BOT_TOKEN>/getUpdates trên trình duyệt,
 *      tìm "chat":{"id": ...} → đó là CHAT ID (nhóm thì là số âm).
 *   6. Trong Apps Script: biểu tượng bánh răng (Cài đặt dự án) → Thuộc tính tập lệnh →
 *      thêm 2 thuộc tính:
 *         TELEGRAM_BOT_TOKEN = token ở bước 3
 *         TELEGRAM_CHAT_ID   = id ở bước 5
 *      (Để token ở đây, KHÔNG dán vào code, KHÔNG đưa lên website/GitHub.)
 *
 * C. Xuất bản
 *   7. Chọn hàm "testLead" trên thanh công cụ → Chạy → cấp quyền khi được hỏi.
 *      Kiểm tra: Sheet có thêm 1 dòng thử + Telegram nhận tin.
 *   8. Triển khai → Tùy chọn triển khai mới → Loại: Ứng dụng web
 *        - Thực thi với tư cách: Tôi
 *        - Người có quyền truy cập: Bất kỳ ai
 *      → Triển khai → sao chép URL dạng https://script.google.com/macros/s/XXXX/exec
 *   9. Dán URL đó vào biến SHEET_ENDPOINT ở đầu file assets/js/main.js, rồi deploy lại website.
 *
 * Lưu ý: mỗi lần SỬA code ở đây phải Triển khai → Quản lý triển khai → sửa → Phiên bản mới,
 * nếu không Web App vẫn chạy code cũ.
 */

var SHEET_NAME = 'Leads';

// Thứ tự cột trong Sheet: [tên trường website gửi lên, tiêu đề cột]
var COLUMNS = [
  ['submitted_at', 'Thời gian gửi'],
  ['source',       'Nguồn'],
  ['name',         'Họ tên'],
  ['phone',        'Số điện thoại'],
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
    var data = (e && e.parameter) || {};

    if (!data.name || !data.phone) {
      return json_({ ok: false, error: 'Thiếu họ tên hoặc số điện thoại' });
    }

    saveToSheet_(data);
    try {
      notifyTelegram_(data);
    } catch (tgErr) {
      // Lead đã nằm trong Sheet — lỗi Telegram không được làm khách thấy "gửi thất bại"
      console.error('Telegram lỗi: ' + tgErr);
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

function notifyTelegram_(data) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('TELEGRAM_BOT_TOKEN');
  var chatId = props.getProperty('TELEGRAM_CHAT_ID');
  if (!token || !chatId) return; // chưa cấu hình Telegram → chỉ ghi Sheet

  var lines = ['🔔 LEAD MỚI — ' + (data.source || 'Website')];
  COLUMNS.forEach(function (c) {
    if (c[0] === 'source' || !data[c[0]]) return;
    lines.push(c[1] + ': ' + data[c[0]]);
  });

  var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: chatId, text: lines.join('\n'), disable_web_page_preview: true }),
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) throw new Error(res.getContentText());
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Chạy tay hàm này trong trình soạn Apps Script để thử (bước 7)
function testLead() {
  var out = doPost({ parameter: {
    submitted_at: new Date().toLocaleString('vi-VN'),
    source: 'Chạy thử từ Apps Script',
    name: 'Khách thử',
    phone: '0909001336',
    service: 'Trải nghiệm nệm Kymdan tại Showroom',
    page_url: 'https://noithatnhatduy.vn/'
  } });
  console.log(out.getContent());
}
