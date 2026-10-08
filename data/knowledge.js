/* =========================================================
   KHO TRI THỨC CỦA CHATBOX — Nội Thất Nhật Duy
   ---------------------------------------------------------
   AI chỉ được trả lời dựa trên nội dung file này.

   Gồm 2 phần:
   1. Phần VIẾT TAY bên dưới (liên hệ, chính sách, thước Lỗ Ban, TODO)
      → chủ shop sửa trực tiếp tại đây.
   2. Phần TỰ SINH từ index.html (bảng giá, sản phẩm, combo, FAQ)
      → nằm ở data/knowledge-generated.js. Khi đổi giá trong index.html,
        chạy:  node scripts/build-knowledge.js
   ========================================================= */

const GENERATED = require('./knowledge-generated.js');

const MANUAL = `
## THÔNG TIN CỬA HÀNG
- Tên: Nội Thất Nhật Duy — đại lý Kymdan chính hãng tại Bồng Sơn, Gia Lai.
- Showroom / tổng kho: 2657 Quang Trung, Phường Bồng Sơn, Gia Lai. Có bãi đỗ ô tô 7 chỗ ngay trước showroom.
- Hotline: 0909 001 336 và 0905 070 785.
- Zalo: https://zalo.me/0909001336
- Giờ mở cửa: 7:30 – 21:00 mỗi ngày.
- Sản phẩm: nệm cao su thiên nhiên Kymdan, gối, giường, sofa, ga trải giường Kymdan; nệm foam; nệm bông ép Hàn Quốc.
- Khách được nằm thử trực tiếp tại showroom; đặt lịch trước để có chuyên viên tư vấn 1:1 trong 30 phút.

## CHÍNH SÁCH
- Bảo hành: nệm Kymdan chính hãng 15 năm (Nệm Xếp Kymdan 10 năm); nệm foam 2 năm; nệm bông ép Hàn Quốc 3 năm. Bảo trì tận nhà tại Gia Lai.
- Cam kết chính hãng: phát hiện hàng Kymdan giả — Nhật Duy đền 200% giá trị đơn hàng.
- Thu nệm cũ: thu lại tận nơi khi đổi nệm mới, 200.000₫ – 500.000₫ tùy kích thước & chất liệu.
- Trả góp 0% lãi suất qua thẻ tín dụng Vietcombank, Techcombank, VPBank, MB, ACB, Sacombank — kỳ hạn 3 / 6 / 9 / 12 tháng.
- Giao & lắp đặt: trong 4 giờ, miễn phí trong bán kính 30 km (Bồng Sơn, Hoài Nhơn, Hoài Ân, An Lão, Phù Mỹ). Quy Nhơn, An Khê, Pleiku và ngoài bán kính: trong 24 giờ, phí giao lắp báo riêng.
- Giá trên website là giá niêm yết / khuyến mãi tham khảo, có thể thay đổi theo từng thời điểm; ưu đãi đại lý cụ thể do chuyên viên báo khi gọi lại.

## THƯỚC LỖ BAN 42.9CM (phong thủy giường nệm)
- Thước Lỗ Ban 42.9cm dùng cho khối đặc và đồ nội thất (giường, nệm, tủ). Một chu kỳ dài 42.9cm, chia 8 cung, mỗi cung khoảng 5.36cm, lặp lại liên tục.
- Thứ tự 8 cung trong một chu kỳ: Tài (tốt) → Bệnh (xấu) → Ly (xấu) → Nghĩa (tốt) → Quan (tốt) → Kiếp (xấu) → Hại (xấu) → Bản (tốt).
- Cung tốt (cát): Tài, Nghĩa, Quan, Bản. Cung xấu (hung): Bệnh, Ly, Kiếp, Hại.
- Cách tính: lấy kích thước (cm) chia lấy dư cho 42.9, phần dư rơi vào cung nào thì thuộc cung đó (0–5.36 Tài; 5.36–10.73 Bệnh; 10.73–16.09 Ly; 16.09–21.45 Nghĩa; 21.45–26.81 Quan; 26.81–32.18 Kiếp; 32.18–37.54 Hại; 37.54–42.9 Bản).
- Ví dụ: nệm tiêu chuẩn rộng 160cm và dài 200cm đều rơi vào cung Kiếp (xấu). Gợi ý hóa giải: 172 × 197cm (rộng cung Tài, dài cung Quan) hoặc 172 × 217cm (cung Tài – Tài).
- Trang web có công cụ "Bộ kiểm thước Lỗ Ban" (mục Thước Lỗ Ban) để khách tự nhập Rộng × Dài × Cao và nhận Phiếu Phong Thủy Giấc Ngủ.
- Kích thước đặt riêng theo phong thủy cần chuyên viên Nhật Duy xác nhận có đặt được với hãng hay không — không tự khẳng định là có sẵn.

## DỮ LIỆU CÒN THIẾU — khi khách hỏi các mục này, nói rõ là cần chuyên viên báo chính xác và xin số để gọi lại
- Giá nệm foam và bông ép theo TỪNG kích thước (website chỉ có giá niêm yết "từ").
- Giá Pillow Top các size ngoài 1m6 × 2m.
- Phí giao lắp ngoài bán kính 30 km.
- Chương trình khuyến mãi / quà tặng đang chạy.
`;

/* TODO (chủ shop): bổ sung số liệu thật vào các dòng dưới rồi bỏ dấu // để AI dùng được.
   Đừng để AI tự đoán — thiếu thì cứ để trống.
   // - Khuyến mãi tháng này: ...
   // - Phí giao lắp Quy Nhơn / Pleiku: ...
   // - Giá nệm foam Cozy 1m6: ...
   // - Giá bông ép Korea Plus 1m6: ...
*/

module.exports = (MANUAL.trim() + '\n\n' + GENERATED).trim();
