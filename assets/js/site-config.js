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
  /* Địa chỉ web DUY NHẤT của site — canonical, og:url, og:image, JSON-LD, robots.txt,
     sitemap.xml đều sinh từ đây bằng `npm run build` (scripts/build-seo.js). */
  var SITE_URL = 'https://noithatnhatduy.vercel.app';

  var SITE_CONFIG = {
    siteUrl: SITE_URL,

    /* SEO trang chủ — title ~60 ký tự, description ~155 ký tự để Google không cắt */
    seo: {
      title: 'Nệm Kymdan chính hãng Bồng Sơn, Gia Lai | Nội Thất Nhật Duy',
      description: 'Đại lý Kymdan Gia Lai tại 2657 Quang Trung, Bồng Sơn: nệm Kymdan chính hãng, nội thất phòng ngủ, nệm foam, bông ép. Mua nệm Kymdan trả góp 0%.',
      ogImage: '/assets/img/og-image.png',   // 1200 × 630
      ogImageAlt: 'Nội Thất Nhật Duy — đại lý nệm Kymdan chính hãng tại Bồng Sơn, Gia Lai'
    },

    /* Thông tin cửa hàng thật — dùng cho JSON-LD (FurnitureStore) */
    business: {
      name: 'Nội Thất Nhật Duy — Đại lý Kymdan chính hãng',
      streetAddress: '2657 Quang Trung',
      addressLocality: 'Phường Bồng Sơn',
      addressRegion: 'Gia Lai',
      phones: ['+84909001336', '+84905070785'],
      opens: '07:30',
      closes: '21:00',
      areaServed: ['Bồng Sơn', 'Hoài Nhơn', 'Hoài Ân', 'An Lão', 'Phù Mỹ'],
      /* TODO: Ba Tân cung cấp vĩ độ, kinh độ của showroom (lấy trên Google Maps: nhấn giữ vào
         vị trí cửa hàng → copy 2 số). Điền dạng { latitude: 14.xxx, longitude: 109.xxx }. */
      geo: null,
      /* TODO: Ba Tân xác nhận số đánh giá thật (lấy từ hồ sơ Google doanh nghiệp).
         Điền dạng { ratingValue: 4.9, reviewCount: 25 }. Để null = không khai báo — KHÔNG điền số ước lượng. */
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
