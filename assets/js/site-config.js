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
  /* Địa chỉ web CHÍNH THỨC của site — canonical, og:url, og:image, JSON-LD, robots.txt,
     sitemap.xml đều sinh từ đây bằng `npm run build` (scripts/build-seo.js). */
  var SITE_URL = 'https://noithatnhatduy.vercel.app';

  var SITE_CONFIG = {
    siteUrl: SITE_URL,

    /* ── CỜ BẬT/TẮT CÁC TUYÊN BỐ CẦN BA XÁC NHẬN ─────────────────
       true  = hiện trên trang (và chatbox được phép nói tới)
       false = ẩn HOÀN TOÀN: trang, chatbox, FAQ trên Google (JSON-LD)
       Chỉ bật khi có giấy tờ / chính sách thật. Sửa xong chạy:  npm run build
       Hướng dẫn chi tiết: BAO-CAO-CRO.md, mục 4. */
    flags: {
      SHOW_INSTALLMENT_0: false, // Trả góp 0% qua thẻ + tên 6 ngân hàng — cần hợp đồng trả góp với ngân hàng
      SHOW_REFUND_200: false,    // "Phát hiện hàng giả đền 200%" — Ba đã bỏ ngày 19/10/2026
      SHOW_GOOGLE_RATING: false, // Điểm sao Google — cần điền business.rating bên dưới bằng số THẬT
      SHOW_MOIT_NOTICE: false,   // "Đã thông báo Bộ Công Thương" — cần mã/link online.gov.vn (moitNoticeUrl)
      SHOW_TESTIMONIALS: false,  // Lời đánh giá có tên khách — chỉ lời khách THẬT, có khách đồng ý
      SHOW_TRADE_IN: true        // Thu nệm cũ 200K–500K khi đổi nệm mới
    },
    /* Link xác nhận thông báo website trên online.gov.vn — dùng khi bật SHOW_MOIT_NOTICE */
    moitNoticeUrl: '',

    /* SEO trang chủ — title ~60 ký tự, description ~155 ký tự để Google không cắt */
    seo: {
      title: 'Nệm Kymdan chính hãng Bồng Sơn, Gia Lai | Nội Thất Nhật Duy',
      description: 'Đại lý Kymdan Gia Lai tại 2657 Quang Trung, Bồng Sơn: nệm Kymdan chính hãng, nội thất phòng ngủ, nệm foam, bông ép. Bảo hành 15 năm, giao lắp trong 4 giờ.',
      ogImage: '/assets/img/og-image.png',   // 1200 × 630
      ogImageAlt: 'Nội Thất Nhật Duy — đại lý nệm Kymdan chính hãng tại Bồng Sơn, Gia Lai',
      /* Mã xác minh Google Search Console (thẻ HTML) — giữ nguyên, xóa là mất quyền quản lý */
      googleSiteVerification: 'hbPae7SEoGPTwzOppdJPQrN1j12qipnbEkE2fnAxW-w'
    },

    /* Thông tin cửa hàng thật — dùng cho JSON-LD (FurnitureStore) */
    business: {
      name: 'Nội Thất Nhật Duy — Đại lý Kymdan chính hãng',
      streetAddress: '2657 Quang Trung',
      addressLocality: 'Phường Bồng Sơn',
      addressRegion: 'Gia Lai',
      phones: ['+84909001336', '+84905070785'],
      email: 'ductan07bs@gmail.com',
      opens: '07:30',
      closes: '21:00',
      areaServed: ['Bồng Sơn', 'Hoài Nhơn', 'Hoài Ân', 'An Lão', 'Phù Mỹ'],
      /* Tọa độ ghim của hồ sơ Google "Đai Lý Kymdan-Nội Thất Nhật Duy" (kiểm tra 19/10/2026) */
      geo: { latitude: 14.4375628, longitude: 109.0182714 },
      /* Số đánh giá thật trên hồ sơ Google. 19/10/2026 hồ sơ CHƯA có đánh giá nào → để null.
         Khi có, điền đúng số Google hiển thị, dạng { ratingValue: 4.9, reviewCount: 25 }. KHÔNG điền số ước lượng. */
      rating: null
    },

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
       Ba Tân đã chọn 'promo' (19/10/2026). */
    prices: {
      priceDisplayMode: 'promo'
    }
  };
  if (typeof module === 'object' && module.exports) module.exports = SITE_CONFIG;
  else root.SITE_CONFIG = SITE_CONFIG;
})(this);
