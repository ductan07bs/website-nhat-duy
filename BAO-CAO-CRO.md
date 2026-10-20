# Báo cáo CRO — Website Nội Thất Nhật Duy (nhánh `cro-overhaul`, 20/10/2026)

Website: https://noithatnhatduy.vercel.app · Công nghệ: HTML tĩnh + JS thuần, build bằng Node (`npm run build`), deploy Vercel.
Nhánh đã đẩy lên GitHub (Vercel tạo bản xem thử). Chưa gộp vào `master` — gộp là lên trang chính thức.

> **Lưu ý về bối cảnh:** một số yêu cầu đã được làm ở các commit trước ngày 20/10 (domain vercel.app, ảnh combo Hoàng Kim, bỏ "5,0 Google").
> Ngày 19/10/2026 Ba đã chốt **bỏ** cam kết "đền 200%", "Đã thông báo Bộ Công Thương" và 3 lời khách tự viết. Các mục này giờ chỉ còn là **cờ tắt sẵn** — không hiện lại trên trang.

---

## 1. File đã sửa theo từng giai đoạn

| Giai đoạn | Commit | File | Tóm tắt |
|---|---|---|---|
| 1 — Domain + pháp lý | `103e3fa` | `index.html`, `assets/js/site-config.js`, `assets/js/main.js`, `assets/js/chatbox.js`, `assets/css/styles.css`, `data/knowledge.js`, `scripts/build-seo.js`, `scripts/build-knowledge.js`, **mới** `scripts/lib-flags.js` | Domain đã đúng vercel.app ở mọi nơi (canonical, og, twitter, JSON-LD, sitemap, robots); `og-image.png` có thật, đúng 1200×630. Bỏ "Hai mươi năm", "20+ năm", "từ 2006", từ tuyệt đối, FAQ Liên Á – Hồng Loan, nguồn "Hàn Việt Hải". Thêm 6 cờ cấu hình. FAQ JSON-LD giờ **tự sinh** từ mục FAQ trên trang và bỏ câu đang tắt cờ. Chatbox cũng không nói tới tuyên bố đang tắt. |
| 2 — Đồng bộ giá & thông số | `6a61608` | `index.html`, `styles.css` | Combo Tinh Giản "Liên hệ báo giá combo"; Deluxe "10 / 15 / 20cm"; ghi chú kích thước đặt riêng ở Lỗ Ban; emoji nằm sấp 🛌. |
| 3 — Bố cục CRO | `b8b4468` | `index.html`, `styles.css`, `chatbox.css`, `main.js`, `scripts/render-price-table.js` | Hero mới, khối "Vì sao chọn Nhật Duy", sắp lại 13 khu vực, bỏ "Sảnh phố", tiêu đề mới, 3 loại nút, thanh cố định Zalo 60% / Gọi 40%, header 1 số + menu 5 mục, form đặt lịch báo thành công + nút Zalo. "Giá từ" ở khối So sánh tự tính từ bảng giá. |
| 4 — Đo lường & hiệu năng | `fe40852` | `main.js`, `chatbox.js`, `index.html` | Hàm `track()` dùng chung + sự kiện; ảnh có width/height, lazy, hero fetchpriority. |
| 5 — Báo cáo | (commit này) | `BAO-CAO-CRO.md`, `assets/img/showroom/README.txt` | |

### Chi tiết các chỗ đã sửa từ tuyệt đối (1.2)
| Trước | Sau |
|---|---|
| FAQ JSON-LD: "nâng đỡ cột sống **tốt nhất**" | "nâng đỡ cột sống tốt" |
| Quiz: "Trên 30 triệu — muốn **tốt nhất**" | "Trên 30 triệu" |
| So sánh: "Lớp **êm ái nhất**" | "Lớp Pillow Top êm" |
| So sánh: "Ai muốn giấc ngủ **hoàn hảo nhất**" | "Ai thích nệm êm, dày" |
| So sánh: "Giá hợp lý **nhất**" | "Giá hợp lý" |
| So sánh: "**Tốt nhất** cho:" (3 chỗ) | "Phù hợp:" |
| FAQ: "Là lựa chọn **tốt nhất** cho phòng ngủ chính" | "Phù hợp phòng ngủ chính" |
| FAQ: Pillow Top Royal "(cao cấp nhất, **êm ái nhất**)" | "(dòng cao cấp nhất của Kymdan)" |
| Bông ép Korea Plus "**Bán chạy nhất**", Korea "Bán chạy" | bỏ (chưa có số liệu) |
| Lỗ Ban: "cách hóa giải **nhanh nhất**, vẫn vừa khung giường phổ thông" | "cách hóa giải đơn giản" (1m72 không vừa khung 1m6) |
| "duy nhất", "độc quyền" | đã bỏ từ commit 19/10; đổi luôn chữ trong ghi chú code |

**Giữ lại** "cao cấp nhất" vì là thứ bậc trong dòng sản phẩm của hãng: Pillow Top Royal (bảng giá), ga Serenity Premium / Lavish Premium.

---

## 2. Bảng CẦN BA XÁC NHẬN

Placeholder `[[CẦN BA …]]` nằm trong **ghi chú HTML** (khách không thấy); trên trang khách thấy bản thay thế an toàn.

| Mục | Vị trí | Ba cần làm |
|---|---|---|
| Ảnh mặt tiền showroom | Hero — `index.html` (dòng ~527) | Chụp, lưu `assets/img/showroom/mat-tien.webp` → trang tự thay ảnh |
| Ảnh giấy chứng nhận đại lý | Khối "Vì sao chọn Nhật Duy" (~603) | Chụp, lưu `assets/img/showroom/giay-chung-nhan.webp` |
| Giá Combo Tinh Giản | Combo (~832) | Gửi giá gốc (tổng giá lẻ) + giá combo theo mẫu giường cụ thể |
| Trả góp 0% + 6 ngân hàng | Combo, FAQ, thanh ngân hàng — cờ `SHOW_INSTALLMENT_0` | Xác nhận có hợp đồng trả góp với ngân hàng nào, kỳ hạn nào → bật cờ |
| Đền 200% hàng giả | Khối "Vì sao" (~576) — cờ `SHOW_REFUND_200` | Ba đã bỏ 19/10. Chỉ bật khi có văn bản cam kết |
| Điểm sao Google | Mục Đánh giá (~2028) — cờ `SHOW_GOOGLE_RATING` | Khi hồ sơ Google có đánh giá: điền `business.rating` (số thật) rồi bật cờ |
| Lời khách có tên | Mục Đánh giá (~2042) — cờ `SHOW_TESTIMONIALS` | Gửi lời khách thật + tên/khu vực + khách đồng ý đăng |
| Thông báo Bộ Công Thương | Chân trang (~2345) — cờ `SHOW_MOIT_NOTICE` | Đăng ký online.gov.vn, điền `moitNoticeUrl`, bật cờ |
| Thu nệm cũ 200K–500K | Mục Giao lắp — cờ `SHOW_TRADE_IN` (đang **bật**) | Xác nhận chính sách vẫn đúng |
| Giá giường bọc vải/da | Sản phẩm khác › Giường | Thẻ ghi "từ 44.530.000₫" nhưng bảng ghi thấp nhất 44.890.000₫ — giá nào đúng? |
| Combo Bông Ép "Tiết kiệm 21%" (12.500.000₫ → 9.900.000₫) | Combo | Xác nhận giá gốc là tổng giá lẻ thật và mức giảm (combo Kymdan Ba chốt tối đa 15%) |
| "Nhật Duy gọi lại trong 30 phút" | Đã bỏ khỏi nút đặt lịch và popup | Nếu cam kết được thì có thể ghi lại |

---

## 3. Ảnh thật cần chụp

1. **Mặt tiền showroom** (ban ngày, thấy rõ biển hiệu + số nhà 2657) → `mat-tien.webp` — **ưu tiên số 1**
2. **Bên trong showroom** (khu nằm thử, giường mẫu)
3. **Giấy chứng nhận đại lý Kymdan** (chụp thẳng, đủ sáng) → `giay-chung-nhan.webp` — **ưu tiên số 2**
4. **Ba tại showroom** (đang tư vấn khách — tăng tin cậy)
5. **Đội giao lắp** (xe giao hàng, đang lắp nệm tại nhà khách — khách đồng ý)

Ảnh 1 và 3 có sẵn chỗ, chỉ cần chép đúng tên vào `assets/img/showroom/` (xem `README.txt` trong thư mục đó). Ảnh 2, 4, 5 cần thêm chỗ hiển thị — gửi ảnh rồi làm tiếp.

---

## 4. Bật/tắt cờ cấu hình

Mở `assets/js/site-config.js`, tìm khối `flags`:

```js
flags: {
  SHOW_INSTALLMENT_0: false, // Trả góp 0% + 6 ngân hàng
  SHOW_REFUND_200: false,    // Đền 200% hàng giả
  SHOW_GOOGLE_RATING: false, // Điểm sao Google (cần business.rating)
  SHOW_MOIT_NOTICE: false,   // Bộ Công Thương (cần moitNoticeUrl)
  SHOW_TESTIMONIALS: false,  // Lời khách có tên
  SHOW_TRADE_IN: true        // Thu nệm cũ 200K–500K
},
```

1. Đổi `false` → `true` (hoặc ngược lại). Không xóa dấu phẩy.
2. Chạy `npm run build` — để FAQ trên Google (JSON-LD) và chatbox cập nhật theo.
3. Commit, deploy.

Cờ `false` → khối bị gỡ hoàn toàn khỏi trang, chatbox và FAQ JSON-LD. Thiếu cờ hoặc file cấu hình không tải được → coi như `false` (an toàn).
Đổi nội dung trả góp/đền 200% thì sửa chữ trong `index.html` (tìm `data-flag="SHOW_…"`) và trong `data/knowledge.js` (chatbox).

### Bật đo lường (chưa có công cụ nào trên trang)
Hàm `track()` trong `assets/js/main.js` đã gắn sẵn và tự gửi tới công cụ nào có mặt:
- **Vercel Web Analytics** (dễ nhất): Vercel → Project → Analytics → Enable, rồi thêm vào cuối `<body>` của `index.html`:
  `<script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script>`
  `<script defer src="/_vercel/insights/script.js"></script>`
  (Sự kiện tùy chỉnh của Vercel cần gói Pro.)
- **Google Analytics 4**: dán đoạn mã `gtag.js` (mã G-XXXX) vào `<head>`.

Sự kiện: `click_zalo`, `click_call`, `click_booking`, `click_review`, `click_directions` (kèm `position` = hero / sticky / product / combo / compare / price / quiz / loban / footer…), `generate_lead` (`form` = booking / quiz / phieu_phong_thuy / chatbox), `quiz_complete`, `use_loban`, `open_price_group`. Mỗi nút có `data-cta` + `data-pos`.

---

## 5. Kết quả kiểm tra (Giai đoạn 5)

Kiểm tra bằng Playwright ở 360×740 trên máy (server tĩnh) và script Node:

- [x] Không còn `noithatnhatduy.vn` trong toàn bộ dự án (sửa thêm 1 chỗ trong `audit-noi-that-nhat-duy-v2.md`)
- [x] Không còn "duy nhất", "độc quyền", "kymdanshop", "Hàn Việt Hải", "Liên Á" trong file của website (`index.html`, `assets`, `data`, `scripts`, `api`). Còn trong tài liệu nội bộ chưa commit (`docs/`, `research/`) — là phân tích đối thủ, không lên web.
- [x] Mọi placeholder `[[CẦN BA …]]` đã liệt kê ở mục 2 (7 chỗ trong HTML + các mục theo cờ)
- [x] 360px: `scrollWidth = clientWidth` (không cuộn ngang); nút "Nhắn Zalo nhận báo giá" thấy ngay màn hình đầu; thanh cố định không che chân trang (footer kết thúc 626px, thanh bắt đầu 666px)
- [x] Quiz → ra kết quả kèm giá; Lỗ Ban → kết quả + phiếu; form đặt lịch → báo lỗi SĐT sai, gửi được, hiện thông báo + nút Zalo; accordion mở được; chatbox mở được (phần trả lời AI cần `/api` trên Vercel — không thử được trên máy)
- [x] JSON-LD: 2 khối, `JSON.parse` không lỗi, URL đều là `noithatnhatduy.vercel.app`
- [x] Mọi anchor `#…` đều có đích (thêm `#lien-he`, `#faq`, `#vi-sao`, `#dich-vu`)

Khi test, lệnh gửi form bị chặn trong trình duyệt nên **không có email thử nào gửi tới Ba**.

---

## 6. Phát hiện thêm nhưng chưa sửa

1. **Không có dải chữ chạy (marquee)** trên trang hiện tại → mục 3.8 không cần làm.
2. **Giá trong prompt đã cũ:** prompt ghi Deluxe 10cm 1m6 = 25.840.000₫; dữ liệu kymdan.com ngày 19/10/2026 là niêm yết 27.629.000₫ / khuyến mại 25.410.000₫ — trang hiện đúng theo dữ liệu mới. Ngoài lệch giá giường bọc vải/da (mục 2), không thấy sản phẩm nào hiện 2 giá khác nhau. "Bông ép Beauty" có 2 dòng giá nhưng là 2 loại khác nhau (gấp 3 5–9cm / gấp 2 12cm).
3. **Ảnh thật chưa có → mỗi lượt xem có 2 yêu cầu ảnh 404** (trang thử tải `mat-tien.webp`, `giay-chung-nhan.webp`). Không ảnh hưởng khách; hết khi Ba chép ảnh vào.
4. **Link ra kymdan.com** ở ghi chú bảng giá (nguồn giá) có thể dẫn khách sang web hãng. Giữ vì là bằng chứng giá; Ba muốn bỏ link thì sửa `scripts/render-price-table.js`.
5. **Tuyên bố chưa có chứng cứ, nên xác nhận:** "Bền 15–20 năm", "Bãi đỗ ô tô 7 chỗ", "30 phút tư vấn 1:1", bông ép "Độ bền 5–8 năm".
6. **Tài liệu cũ đã lệch:** `docs/UI-UX-REVIEW-2026-05-28.md` và các file `.md` chưa commit ở thư mục gốc còn mô tả bố cục cũ.
7. ~~CSS thừa của mục "Sảnh phố"~~ — **đã dọn** (commit dọn dẹp). "Cảm giác như khách sạn 5 sao" đổi thành "Cảm giác êm, sang trọng".
8. ~~Chữ khẩu hiệu chân trang tối trên nền tối~~ — **đã sửa** (màu vàng nhạt).
9. ~~Nút nổi đè dòng bản quyền chân trang trên điện thoại~~ — **đã sửa** (chừa lề phải 72px).
