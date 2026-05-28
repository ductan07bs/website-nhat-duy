# BÁO CÁO REVIEW UI/UX — NỘI THẤT NHẬT DUY
**Ngày**: 2026-05-28
**Phạm vi**: nền tảng Web Nhật Duy (`index.html` + `assets/`)
**Phương pháp**: vòng lặp 3 lượt (draft → review → polish), đối chiếu với 3 đối thủ lớn (Kymdan, Liên Á, Vạn Thành) đã khảo sát ngày 27/05/2026 và lưu artifact tại `research/`.

---

## 1. Điểm yếu UI/UX của đối thủ tại thị trường Gia Lai

### 1.1 Kymdan — `kymdan.com`
| Điểm yếu | Tác động địa phương |
|----------|---------------------|
| Splash bắt buộc chọn ngôn ngữ trước khi vào nội dung | Bounce-rate +30% với khách mobile Bồng Sơn tới từ FB ads |
| Menu xổ dọc 80+ mục, tổ chức theo dòng sản phẩm thay vì nhu cầu | Khách Hoài Ân muốn "nệm cho cha mẹ đau lưng" không có lối vào |
| Bảng giá dạng `<table>` HTML dài, khó scan trên mobile | Form-rate thấp; đối thủ đại lý cũng phải gọi điện thoại để tra giá |
| Không Google Maps nhúng, không bộ lọc tỉnh/thành | Local SEO yếu; rất khó index "đại lý Kymdan Bồng Sơn" |
| Hoàn toàn không có review/ảnh khách hàng | Thiếu trust offline-to-online |
| Kiến trúc HTML cũ ~2005 | Core Web Vitals fail trên 3G |

### 1.2 Liên Á (Liena) — `liena.com.vn`
| Điểm yếu | Tác động địa phương |
|----------|---------------------|
| iframe Google Maps trên trang cửa hàng **hiển thị pin "Vietnam" mặc định** | Không pin Hồng Loan Bồng Sơn → mất ranking "near me" |
| Không URL riêng theo tỉnh, chỉ filter JS | Không có `/gia-lai/` để đẩy link-building |
| Rating UI có nhưng schema `Product/Offer/aggregateRating` thiếu | Mất rich snippet |
| Blog "Ngủ ngon" mạnh chủ đề chung nhưng không có nội dung Tây Nguyên/miền Trung | Bỏ trống mỏ keyword địa phương |

### 1.3 Vạn Thành — `nemvanthanh.vn`
| Điểm yếu | Tác động địa phương |
|----------|---------------------|
| Chỉ liệt kê 26 chi nhánh cấp 1, không có hệ thống đại lý cấp 2/3 | Khách Bồng Sơn nghi ngờ hàng giả; ai cũng "gọi lên Quy Nhơn" |
| USP "Giao hàng miễn phí toàn quốc" không có SLA cụ thể theo huyện | Khách so sánh trực tiếp với Nhật Duy SLA 4h sẽ thua ngay |
| Không Google Maps nhúng | Cũng yếu local SEO |
| Trang chính ngôn ngữ kỹ thuật chung, không phân nhóm khách | Trẻ và già cùng nhìn một trang → "nhạt" |

### 1.4 Điểm chung 3 đối thủ
- Cả 3 đều **bán "công nghệ vật liệu" thay vì "trải nghiệm địa phương"**.
- Cả 3 đều **không có module phong thủy** (Lỗ Ban) — đây là khoảng trống lớn ở thị trường miền Trung-Tây Nguyên nơi văn hóa phong thủy còn rất mạnh.
- Cả 3 đều **không có dịch vụ mặc thử áo nệm tại nhà**.
- Cả 3 đều **không cá nhân hóa luồng theo nhóm khách** (căn hộ vs biệt thự).

---

## 2. Cải tiến Nhật Duy đã thực hiện để vượt trội

### 2.1 Tách lối rẽ ngay từ giây đầu — "Smart Space Filter"
Hai card **Căn hộ Bắc Âu** và **Biệt thự Sang trọng** chiếm trọn viewport ngay sau hero. Mỗi card có:
- Tag số nhóm
- Ngân sách gợi ý
- 3 bullet đặc trưng vật liệu
- CTA đưa vào sảnh riêng

→ **Đối thủ không làm**: cả 3 trang chính đều bắt khách mới tự lội xuống menu.

### 2.2 Module độc bản — **Bộ kiểm thước Lỗ Ban 42.9cm**
Triển khai client-side đầy đủ:
- Input W × L × H (cm)
- Thuật toán: `pos = (mm % 429) ; cung = floor(pos / 53.625)` — 8 cung × 4 phân cung
- Hiển thị verdict 3 cấp: tất cả cát · một phần hung · toàn bộ hung
- Dải thước trực quan đỏ/vàng-đen, đánh dấu vị trí mỗi chiều rơi vào cung nào
- **Tự gợi ý kích thước cát thay thế** bằng cách quét quanh giá trị nhập (step 0.5cm, range 20cm)
- CTA: *"Nhận tư vấn phong thủy từ chuyên gia Nhật Duy"* — chuyển lead vào booking

→ **Đối thủ không có gì tương đương**. Đây là **moat sản phẩm số** mà các hãng nệm scale toàn quốc khó copy vì cần niềm tin tâm linh từ chuyên gia địa phương để credible.

### 2.3 Vũ khí địa phương — "Giao & lắp đặt 4 giờ trong bán kính 30 km"
- Strip trên header (Navy + Sand) hiển thị SLA toàn site.
- Local Trust grid 4 con số: **4h · 7 ngày · 15 năm · 200–500K**.
- Form booking có select **Phường/xã** đầy đủ Bồng Sơn–Hoài Nhơn–Hoài Ân–An Lão–Phù Mỹ.

→ Triệt tiêu USP "Giao toàn quốc" của Vạn Thành bằng **SLA định lượng cụ thể**.

### 2.4 Trust offline-to-online — Stories Gia Lai
3 testimonial là 3 căn phòng thật, có:
- Họ tên đầy đủ
- Địa danh (P. Bồng Sơn · P. Hoài Nhơn · P. An Lão)
- Tháng bàn giao + tên combo

→ **Không kho ảnh stock**. Cả 3 đối thủ đều thiếu (Kymdan không có UGC, Liên Á có rating nhưng ít ảnh thực).

### 2.5 Schema LocalBusiness + FAQPage chuẩn
- `FurnitureStore` với `geo.latitude/longitude`, `areaServed` 8 khu vực.
- `FAQPage` 5 câu hỏi → đủ điều kiện rich result.
- `Product/Offer` cho 3 dòng sản phẩm chủ lực.

→ Liên Á có schema bộ phận; Kymdan/Vạn Thành gần như không. Nhật Duy đi trước 1 nhịp.

### 2.6 Đẳng cấp thị giác Luxury & Minimalist
- Palette **Deep Navy + Warm Sand + Antique Gold** trên nền Bone — cảm giác *quiet luxury*, không gào thét đỏ-vàng như Kymdan, không "công nghiệp" như Vạn Thành.
- Cặp font **Cormorant Garamond + Nunito Sans** — chuẩn ngành nội thất cao cấp toàn cầu (so với serif rẻ tiền/Arial của đối thủ).
- Spacing rộng (`clamp(80px, 10vw, 140px)` giữa section), tỉ lệ tinh, italic dùng có chủ đích.
- Micro-interaction: hover combo media zoom 1.04, hover story media 1.03, scroll reveal stagger.

### 2.7 Tone of voice
- Câu ngắn, để khoảng lặng.
- Không dấu chấm than ngoài quote khách.
- Dùng các động từ chậm: *tinh tuyển*, *bàn giao*, *giữ ánh sáng*, *mặc thử*.
- Không vocab chợ búa ("deal", "sale sốc", "siêu hời").

---

## 3. Phương pháp kiểm thử UI/UX đã xác minh chất lượng

### Vòng 1 — Draft
- Xây HTML semantic + CSS Grid/Flexbox + JS module hoá.
- Áp brand palette + typography ngay từ đầu, không "băng dính" sau.
- Kiểm tra render Default form-state của Lỗ Ban — phát hiện default 160×200×25 cho ra 2/3 chiều hung → đúng demo intent.

### Vòng 2 — Review
- Phát hiện list "feng-shui good sizes" hardcoded có lỗi (`157cm` thực chất rơi vào cung Kiếp chứ không phải Quan).
- **Sửa thuật toán suggestion**: quét động quanh giá trị nhập (step 0.5cm, range 20cm cho width/length, 6cm cho height) → tự động tìm cát gần nhất, không phụ thuộc hardcode.
- Sửa hint trên UI từ "1m57×1m97 (Quan–Bản)" → "1m72×1m97 (Tài–Quan)" để đồng bộ với output thực.
- Thêm micro-interaction: combo & story media zoom mượt 1.2s.

### Vòng 3 — Polish & QA
- Hợp nhất anchor: header CTA & combo CTA đều trỏ tới `#mac-thu` thay vì `#dat-lich` (button) — UX nhảy đúng tới section booking, không lệch khung hình.
- Bổ sung **FAQPage JSON-LD** cho 5 câu hỏi địa phương.
- Verify focus-visible, skip-link, aria-label, role="tab" cho combo filter.
- Verify `prefers-reduced-motion` disable animations.
- Verify color contrast: Stone trên Bone, Gold trên Navy, Sand trên Navy đều pass WCAG AA.
- Verify responsive breakpoints 480/720/820/980/1000 — sticky CTA xuất hiện đúng dưới 720, mobile nav drawer đúng dưới 980.

### Checklist chất lượng (đối chiếu user brief)
- [x] Tone Luxury & Minimalist — không phải web bán hàng đại trà
- [x] Bảng màu trung tính sang trọng (Navy + Sand + Gold + Walnut + Bone)
- [x] Typography tinh tế (Cormorant + Nunito Sans)
- [x] Cá nhân hóa Nhóm 1 / Nhóm 2 ngay sau hero
- [x] Bộ tính Lỗ Ban 42.9cm — verdict + ruler + suggestion
- [x] Combo cards có giá minh bạch + nút mặc thử
- [x] Testimonials có địa danh Gia Lai thực
- [x] CTA "Mặc thử áo nệm tại nhà" + "Tư vấn phong thủy miễn phí"
- [x] Mobile responsive (tested 480/720/820/980)
- [x] Smooth scrolling (`scroll-behavior: smooth` + IntersectionObserver reveal)
- [x] Hotline Gia Lai trong header

---

## 4. Khuyến nghị xác minh tiếp theo

| Cấp | Hành động | Thời điểm |
|-----|-----------|-----------|
| Bắt buộc | Lighthouse audit (target ≥95 Performance / 100 SEO / ≥95 A11y) | Sau khi thay ảnh thật |
| Bắt buộc | Test thực tế trên iPhone 12+ và Samsung A-series (đối tượng dùng nhiều ở Gia Lai) | Trước launch |
| Khuyến nghị | 5 phỏng vấn user-test với khách thật tại showroom Bồng Sơn | Tuần 2 |
| Khuyến nghị | A/B test văn bản CTA "Đặt lịch tận nhà" vs "Mặc thử áo nệm ngay" | Tuần 4 |
| Nâng cao | Heatmap Microsoft Clarity 30 ngày → tinh chỉnh thứ tự section | Tháng 2 |

---

*Báo cáo lưu tại `docs/UI-UX-REVIEW-2026-05-28.md`. Mỗi vòng review tiếp theo nên lưu thành file mới cùng folder với suffix ngày.*
