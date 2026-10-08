# Chatbox AI "Trợ lý Nhật Duy" — Hướng dẫn cài đặt

Chatbox nằm ở góc phải-dưới website. Khách hỏi về nệm, giá, phong thủy → AI trả lời dựa trên nội dung trang → xin **Tên + Số điện thoại** → thông tin về **Google Sheet + Telegram + Email**.

Code đã viết xong. Bạn chỉ cần làm 5 bước bấm nút dưới đây (khoảng 30 phút), không phải viết dòng code nào.

---

## Các file liên quan

| File | Việc nó làm |
|---|---|
| `assets/js/chatbox.js`, `assets/css/chatbox.css` | Giao diện chatbox trên website |
| `api/chat.js` | Gọi AI (khóa API nằm ở đây, phía máy chủ) |
| `api/lead.js` | Nhận Tên + SĐT → Google Sheet → Telegram |
| `data/knowledge.js` | Kiến thức viết tay cho AI: liên hệ, chính sách, Lỗ Ban, mục TODO |
| `data/knowledge-generated.js` | Bảng giá, sản phẩm — **tự sinh** từ `index.html`, đừng sửa tay |
| `scripts/build-knowledge.js` | Lệnh sinh lại file trên |
| `google-apps-script.gs` | Code dán vào Google Apps Script (ghi Sheet + gửi email) |
| `.env.example` | Danh sách biến cần điền |

---

## Bước 1 — Lấy khóa API của AI

Mặc định dùng **Anthropic (Claude)**.

1. Vào <https://console.anthropic.com> → đăng ký / đăng nhập.
2. **Billing** → nạp tiền (thẻ quốc tế). Nên đặt hạn mức chi tiêu hàng tháng ở mục **Limits**.
3. **API Keys** → **Create Key** → copy khóa (bắt đầu bằng `sk-ant-...`). Khóa chỉ hiện một lần — lưu lại ngay.

> **Về chi phí:** mặc định chatbox dùng model `claude-opus-5-5` (thông minh nhất trong dòng Opus). Muốn rẻ hơn nhiều lần, đặt biến `MODEL=claude-haiku-5-5` ở Bước 4 — với việc tư vấn nệm thường vẫn đủ tốt. Bạn có thể đổi qua lại bất cứ lúc nào.

Muốn dùng hãng khác:

- **Google Gemini:** lấy khóa tại <https://aistudio.google.com/apikey> → đặt `PROVIDER=gemini`, `GEMINI_API_KEY=...`
- **OpenAI:** lấy khóa tại <https://platform.openai.com/api-keys> → đặt `PROVIDER=openai`, `OPENAI_API_KEY=...`

Với Gemini/OpenAI, nên điền luôn biến `MODEL` bằng tên model mới nhất của hãng (tên mặc định trong code có thể đã cũ).

## Bước 2 — Tạo Telegram Bot để nhận thông báo

1. Mở Telegram, tìm **@BotFather** → bấm **Start** → gõ `/newbot`.
2. Đặt tên bot (ví dụ `Lead Nhật Duy`) và username kết thúc bằng `bot` (ví dụ `nhatduy_lead_bot`).
3. BotFather trả về **token** dạng `1234567890:AAH...` → đây là `TELEGRAM_BOT_TOKEN`.
4. **Quan trọng:** mở chat với bot vừa tạo và bấm **Start** (bot chỉ nhắn được cho người đã Start nó).
5. Tìm **@userinfobot** → bấm **Start** → nó trả về `Id: 123456789` → đây là `TELEGRAM_CHAT_ID`.

> Muốn cả nhóm nhân viên cùng nhận: tạo nhóm Telegram, thêm bot vào nhóm, thêm **@userinfobot** vào nhóm để lấy Id của nhóm (số âm, ví dụ `-1001234567890`) rồi dùng số đó làm `TELEGRAM_CHAT_ID`.

## Bước 3 — Tạo Google Sheet + Apps Script

Làm theo 7 bước ghi ở đầu file **`google-apps-script.gs`**. Tóm tắt:

1. <https://sheets.new> → tạo Sheet.
2. **Extensions → Apps Script** → xoá code mẫu → dán toàn bộ nội dung `google-apps-script.gs` → Save.
3. Chọn hàm `testLead` → **Run** → cấp quyền. Kiểm tra Sheet có dòng "Khách thử" và có email về `ductan07bs@gmail.com`.
4. **Deploy → New deployment → Web app** → *Execute as:* **Me** → *Who has access:* **Anyone** → **Deploy**.
5. Copy **Web app URL** (`https://script.google.com/macros/s/.../exec`) → đây là `SHEET_ENDPOINT`.

Dán thêm URL này vào dòng `const SHEET_ENDPOINT = '';` ở đầu `assets/js/main.js` để form đặt lịch và Phiếu phong thủy cũng về cùng Sheet.

## Bước 4 — Thêm biến vào Vercel

Vào <https://vercel.com> → chọn project website → **Settings → Environment Variables**. Thêm từng biến (chọn cả 3 môi trường Production / Preview / Development):

| Tên biến | Giá trị | Bắt buộc |
|---|---|---|
| `PROVIDER` | `anthropic` | Không (mặc định `anthropic`) |
| `MODEL` | để trống, hoặc `claude-haiku-5-5` cho rẻ | Không |
| `ANTHROPIC_API_KEY` | khóa ở Bước 1 | **Có** |
| `SHEET_ENDPOINT` | URL ở Bước 3 | **Có** |
| `TELEGRAM_BOT_TOKEN` | token ở Bước 2 | **Có** |
| `TELEGRAM_CHAT_ID` | Id ở Bước 2 | **Có** |
| `CHAT_MAX_TOKENS` | để trống (mặc định 2000) | Không |

Sau khi thêm/sửa biến phải **Redeploy** thì mới có hiệu lực: tab **Deployments** → dấu `…` ở bản mới nhất → **Redeploy**.

## Bước 5 — Chạy thử và deploy

**Deploy** (cách bạn vẫn làm): đẩy code lên GitHub, Vercel tự deploy.

```bash
git push
```

**Chạy thử trên máy trước khi deploy** (tùy chọn, cần cài Node.js):

```bash
npm install            # cài thư viện (một lần)
npm install -g vercel  # cài công cụ Vercel (một lần)
vercel link            # nối thư mục này với project trên Vercel (một lần)
vercel env pull .env   # kéo các biến ở Bước 4 về máy
vercel dev             # mở http://localhost:3000
```

> Mở thẳng `index.html` bằng trình duyệt thì chatbox **không** trả lời được, vì `/api/chat` chỉ chạy trên Vercel hoặc `vercel dev`.

### Kiểm tra sau khi deploy

1. Mở website, bấm bong bóng **Trợ lý** góc phải-dưới.
2. Hỏi thử: *"Giá nệm Kymdan 1m6?"*, *"Nệm nào cho người đau lưng?"*, *"Nệm 1m6 có hợp phong thủy không?"*, *"Bảo hành thế nào?"* → AI trả lời đúng giá trên trang và mời để lại số.
3. Điền Tên + SĐT thử → phải thấy đủ 3 thứ: **dòng mới trong Google Sheet**, **tin Telegram**, **email** về `ductan07bs@gmail.com`.

---

## Khi đổi giá hoặc thêm sản phẩm

AI trả lời theo `data/knowledge-generated.js`, file này được sinh từ `index.html`. Sau khi sửa giá trong `index.html`, chạy:

```bash
node scripts/build-knowledge.js
```

rồi commit + push. Nếu quên, AI sẽ báo **giá cũ**.

Thông tin không có trên trang (khuyến mãi tháng này, phí giao xa, giá foam từng size…) → điền vào `data/knowledge.js`, có sẵn mục `TODO` hướng dẫn. Chưa điền thì AI sẽ nói thật là chưa có số và xin số điện thoại để chuyên viên báo — nó không tự đoán giá.

## Gặp lỗi thì xem ở đâu

| Hiện tượng | Nguyên nhân thường gặp |
|---|---|
| Bot luôn báo "đang bị gián đoạn" | Chưa có `ANTHROPIC_API_KEY`, khóa sai, hết tiền, hoặc chưa Redeploy sau khi thêm biến |
| Gửi số báo lỗi | `SHEET_ENDPOINT` sai, hoặc Apps Script chưa chọn *Who has access: Anyone* |
| Có Sheet nhưng không có Telegram | Chưa bấm **Start** với bot, hoặc sai `TELEGRAM_CHAT_ID` |
| Có Sheet nhưng không có email | Chưa cấp quyền khi chạy `testLead`; kiểm tra cả hộp Spam |
| Sửa Apps Script mà không thấy đổi | Phải **Deploy → Manage deployments → sửa → New version** |

Xem log chi tiết: Vercel → project → **Logs** (lọc theo `/api/chat` hoặc `/api/lead`). Nếu cả Sheet và Telegram cùng hỏng, thông tin khách vẫn được in trong log với dòng `LEAD CHƯA LƯU ĐƯỢC` để bạn vớt lại.

## Bảo mật & chi phí

- Khóa API chỉ nằm trong biến môi trường Vercel; không có trong code hay trên trình duyệt. File `.env` đã bị chặn commit bằng `.gitignore`.
- Chống lạm dụng: mỗi địa chỉ IP tối đa 20 câu hỏi / 10 phút và 5 lần gửi số / 10 phút; mỗi lượt chỉ gửi 12 tin gần nhất cho AI; mỗi câu trả lời bị giới hạn token. Đây là mức chặn cơ bản — hãy đặt thêm **hạn mức chi tiêu hàng tháng** ở trang quản lý của hãng AI.
- Zalo OA (giai đoạn 2): hàm `notifyZaloOA()` trong `api/lead.js` đã để sẵn kèm hướng dẫn, hiện chưa gửi gì.
