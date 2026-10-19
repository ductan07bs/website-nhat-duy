/* =========================================================
   CẤU HÌNH DÙNG CHUNG — Nội Thất Nhật Duy
   ---------------------------------------------------------
   Thông điệp giao lắp CHỈ sửa tại đây. Dùng ở:
     - Trang web: main.js điền vào mọi phần tử có data-cfg="delivery-short" / "delivery-long"
     - Chatbox:   data/knowledge.js đọc DELIVERY.long

   Sửa xong nhớ:
     1. Sửa luôn chữ tĩnh trong index.html (meta description, og:description,
        FAQ JSON-LD) — các thẻ đó không chạy JavaScript nên không tự đổi theo.
        Tìm nhanh bằng cụm "bán kính 30 km".
     2. Chạy  node scripts/build-knowledge.js  nếu có đổi bảng giá.
   ========================================================= */
(function (root) {
  var SITE_CONFIG = {
    delivery: {
      hours: 4,
      radiusKm: 30,
      short: 'Giao & lắp đặt trong 4 giờ — bán kính 30 km',
      long: 'Giao & lắp đặt miễn phí trong 4 giờ trong bán kính 30 km (Bồng Sơn, Hoài Nhơn, Hoài Ân, An Lão, Phù Mỹ). Ngoài 30 km, vui lòng liên hệ để Nhật Duy báo lịch và phí giao.'
    },

    /* Bảng giá nệm Kymdan — giá lấy từ data/kymdan-prices.json (npm run update-kymdan-prices).
       priceDisplayMode:
         'list'    — giá niêm yết Kymdan (Pillow Top: "giá chào mới" của Kymdan)
         'promo'   — giá khuyến mãi Kymdan đang chạy, gạch ngang giá niêm yết, ghi rõ hạn áp dụng.
                     Hết hạn → trang tự quay về giá niêm yết (kể cả khi chưa chạy lại build).
         'nhatduy' — giá riêng của Nhật Duy, điền trong data/nhatduy-prices.json; size chưa điền hiện "Liên hệ".
       Đổi xong chạy:  npm run build
       TODO: Ba Tân chọn kiểu hiển thị giá (tạm để 'list'). */
    prices: {
      priceDisplayMode: 'list'
    }
  };
  if (typeof module === 'object' && module.exports) module.exports = SITE_CONFIG;
  else root.SITE_CONFIG = SITE_CONFIG;
})(this);
