/* =========================================================
   Sinh phần SEO từ assets/js/site-config.js (SITE_URL duy nhất)
   ---------------------------------------------------------
   Chạy qua:  npm run build
   Ghi:
     - index.html giữa <!-- SEO:START --> … <!-- SEO:END -->       title, description, canonical, Open Graph, Twitter
     - index.html giữa <!-- SCHEMA:START --> … <!-- SCHEMA:END -->  JSON-LD FurnitureStore + WebSite + Product
     - robots.txt, sitemap.xml
   Giá trong Product lấy từ data/kymdan-prices.json theo đúng kiểu hiển thị giá đang chọn.
   Không khai báo tọa độ / số đánh giá khi chưa có số thật (business.geo / business.rating = null).
   ========================================================= */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CFG = require(path.join(ROOT, 'assets', 'js', 'site-config.js'));
const PRICES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'kymdan-prices.json'), 'utf8'));
const OWN = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'nhatduy-prices.json'), 'utf8'));

const SITE_URL = CFG.siteUrl.replace(/\/+$/, '');
if (!/^https:\/\/[a-z0-9.-]+$/i.test(SITE_URL)) throw new Error('siteUrl không hợp lệ: ' + CFG.siteUrl);
const HOME = SITE_URL + '/';
const abs = (p) => SITE_URL + '/' + String(p).replace(/^\/+/, '');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const todayVN = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
const { seo, business: biz } = CFG;
const MODE = CFG.prices.priceDisplayMode;

/* ── 1. Thẻ meta trong <head> ─────────────────────────── */
const ogImage = abs(seo.ogImage);
const head = [
  `<title>${esc(seo.title)}</title>`,
  `<meta name="description" content="${esc(seo.description)}" />`,
  `<meta name="robots" content="index,follow,max-image-preview:large" />`,
  `<meta name="author" content="Nội Thất Nhật Duy" />`,
  `<link rel="canonical" href="${HOME}" />`,
  '',
  `<meta property="og:type" content="website" />`,
  `<meta property="og:locale" content="vi_VN" />`,
  `<meta property="og:site_name" content="Nội Thất Nhật Duy" />`,
  `<meta property="og:title" content="${esc(seo.title)}" />`,
  `<meta property="og:description" content="${esc(seo.description)}" />`,
  `<meta property="og:url" content="${HOME}" />`,
  `<meta property="og:image" content="${ogImage}" />`,
  `<meta property="og:image:secure_url" content="${ogImage}" />`,
  `<meta property="og:image:type" content="image/png" />`,
  `<meta property="og:image:width" content="1200" />`,
  `<meta property="og:image:height" content="630" />`,
  `<meta property="og:image:alt" content="${esc(seo.ogImageAlt)}" />`,
  `<meta name="twitter:card" content="summary_large_image" />`,
  `<meta name="twitter:title" content="${esc(seo.title)}" />`,
  `<meta name="twitter:description" content="${esc(seo.description)}" />`,
  `<meta name="twitter:image" content="${ogImage}" />`,
  `<meta name="twitter:image:alt" content="${esc(seo.ogImageAlt)}" />`
].join('\n');

/* Ảnh chia sẻ phải đúng 1200 × 630 */
{
  const png = fs.readFileSync(path.join(ROOT, seo.ogImage.replace(/^\/+/, '')));
  const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
  if (w !== 1200 || h !== 630) console.warn(`⚠ Ảnh chia sẻ ${seo.ogImage} đang là ${w}×${h}, nên là 1200×630.`);
}

/* ── 2. JSON-LD ───────────────────────────────────────── */
const STORE_ID = HOME + '#store';
const IMAGES = { deluxe: 'assets/img/products/nem-deluxe.webp', pillowTopRoyal: 'assets/img/products/nem-pillowtop.webp', pillowTopCloud: 'assets/img/products/nem-pillowtop.webp', pillowTopSoft: 'assets/img/products/nem-pillowtop.webp' };

const allRows = (p) => p.variants.flatMap(v => v.rows.map(r => ({ ...r, promotion: v.promotion || p.promotion })));

/* Giá trong schema = giá khách thấy trên trang (cùng priceDisplayMode). Không có giá → không có offers. */
function offersFor(key, p) {
  const rows = allRows(p);
  let prices = [];
  let validUntil = null;
  if (MODE === 'nhatduy') {
    prices = Object.entries(OWN.prices).filter(([k, v]) => k.startsWith(key + '|') && Number.isInteger(v) && v > 0).map(([, v]) => v);
  } else if (MODE === 'promo' && rows.some(r => r.promoPrice && r.promotion && r.promotion.to >= todayVN)) {
    const promoRows = rows.filter(r => r.promoPrice && r.promotion && r.promotion.to >= todayVN);
    prices = promoRows.map(r => r.promoPrice);
    validUntil = promoRows.map(r => r.promotion.to).sort()[0];
  } else {
    prices = rows.map(r => r.listPrice);
  }
  if (!prices.length) return null;
  const offer = {
    '@type': 'AggregateOffer',
    priceCurrency: 'VND',
    lowPrice: Math.min(...prices),
    highPrice: Math.max(...prices),
    offerCount: prices.length,
    url: HOME + '#bang-gia',
    seller: { '@id': STORE_ID }
  };
  if (validUntil) offer.priceValidUntil = validUntil;
  return offer;
}

const products = Object.entries(PRICES.products).map(([key, p]) => {
  const thick = [...new Set(allRows(p).map(r => r.thickness))].sort((a, b) => a - b);
  const prod = {
    '@type': 'Product',
    '@id': HOME + '#nem-' + key,
    name: 'Nệm ' + p.name.replace(/^Nệm /, '') + ' chính hãng',
    brand: { '@type': 'Brand', name: 'Kymdan' },
    category: 'Nệm cao su thiên nhiên',
    description: `${p.name} chính hãng tại đại lý Kymdan Bồng Sơn, Gia Lai — độ dày ${thick.join(', ').replace(/\./g, ',')} cm, bảo hành Kymdan 15 năm.`,
    url: HOME + '#bang-gia'
  };
  if (IMAGES[key]) prod.image = abs(IMAGES[key]);
  const offers = offersFor(key, p);
  if (offers) prod.offers = offers;
  return prod;
});

const listPrices = Object.values(PRICES.products).flatMap(p => allRows(p).map(r => r.listPrice));
const vnd = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';

const store = {
  '@type': 'FurnitureStore',
  '@id': STORE_ID,
  name: biz.name,
  url: HOME,
  image: ogImage,
  telephone: biz.phones[0],
  contactPoint: biz.phones.map(t => ({ '@type': 'ContactPoint', telephone: t, contactType: 'sales', areaServed: 'VN', availableLanguage: 'Vietnamese' })),
  address: {
    '@type': 'PostalAddress',
    streetAddress: biz.streetAddress,
    addressLocality: biz.addressLocality,
    addressRegion: biz.addressRegion,
    addressCountry: 'VN'
  },
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: biz.opens,
    closes: biz.closes
  }],
  /* Khoảng giá niêm yết nệm Kymdan trong data/kymdan-prices.json */
  priceRange: `${vnd(Math.min(...listPrices))} – ${vnd(Math.max(...listPrices))}`,
  areaServed: biz.areaServed.map(n => ({ '@type': 'Place', name: n })),
  makesOffer: products.map(p => ({ '@type': 'Offer', itemOffered: { '@id': p['@id'] } }))
};
if (biz.geo && biz.geo.latitude && biz.geo.longitude) {
  store.geo = { '@type': 'GeoCoordinates', latitude: biz.geo.latitude, longitude: biz.geo.longitude };
}
if (biz.rating && biz.rating.ratingValue && biz.rating.reviewCount) {
  store.aggregateRating = { '@type': 'AggregateRating', ratingValue: biz.rating.ratingValue, reviewCount: biz.rating.reviewCount, bestRating: 5, worstRating: 1 };
}

const website = { '@type': 'WebSite', '@id': HOME + '#website', url: HOME, name: 'Nội Thất Nhật Duy', inLanguage: 'vi-VN', publisher: { '@id': STORE_ID } };
const graph = { '@context': 'https://schema.org', '@graph': [store, website, ...products] };
const schema = '<script type="application/ld+json">\n' + JSON.stringify(graph, null, 2).replace(/<\//g, '<\\/') + '\n</script>';

/* ── 3. Ghi vào index.html ────────────────────────────── */
function replaceBetween(html, name, body) {
  const re = new RegExp(`(<!-- ${name}:START[^>]*-->)[\\s\\S]*?(\\n[ \\t]*<!-- ${name}:END -->)`);
  if (!re.test(html)) throw new Error(`Không thấy dấu mốc ${name} trong index.html`);
  return html.replace(re, (_, a, b) => a + '\n' + body + b);
}
const HTML_FILE = path.join(ROOT, 'index.html');
let html = fs.readFileSync(HTML_FILE, 'utf8');
html = replaceBetween(html, 'SEO', head);
html = replaceBetween(html, 'SCHEMA', schema);
/* Form đặt lịch khi trình duyệt tắt JS: quay về đúng địa chỉ web */
html = html.replace(/(<input type="hidden" name="_next" value=")[^"]*(")/, `$1${HOME}?booked=1$2`);
fs.writeFileSync(HTML_FILE, html, 'utf8');

/* ── 4. robots.txt & sitemap.xml ──────────────────────── */
fs.writeFileSync(path.join(ROOT, 'robots.txt'),
  ['# Tự sinh bằng npm run build (scripts/build-seo.js) — đừng sửa tay', 'User-agent: *', 'Allow: /', 'Disallow: /api/', '', `Sitemap: ${SITE_URL}/sitemap.xml`, ''].join('\n'));

/* Site chỉ có 1 trang thật (index.html); các mục #neo là cùng một trang nên không đưa vào */
const pages = [{ loc: HOME, priority: '1.0', changefreq: 'weekly' }];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  pages.map(p => `  <url>\n    <loc>${p.loc}</loc>\n    <lastmod>${todayVN}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`).join('') +
  '</urlset>\n');

/* ── 5. Rà nhanh ──────────────────────────────────────── */
const warn = [];
const h1 = (html.match(/<h1[\s>]/g) || []).length;
if (h1 !== 1) warn.push(`Trang có ${h1} thẻ H1 (cần đúng 1).`);
if (/noindex/i.test(html)) warn.push('Có chữ "noindex" trong index.html.');
const otherHosts = [...new Set([...html.matchAll(/https?:\/\/(noithatnhatduy[a-z0-9.-]*)/gi)].map(m => m[1]))].filter(h => 'https://' + h !== SITE_URL);
if (otherHosts.length) warn.push('Còn link trỏ địa chỉ khác SITE_URL: ' + otherHosts.join(', '));
if (!biz.geo) warn.push('Chưa có tọa độ showroom (business.geo) — TODO: Ba Tân cung cấp vĩ độ, kinh độ.');
if (!biz.rating) warn.push('Chưa khai báo số đánh giá (business.rating) — TODO: Ba Tân xác nhận số đánh giá thật.');

console.log(`Đã sinh SEO cho ${HOME} — ${products.length} sản phẩm trong JSON-LD, robots.txt, sitemap.xml.`);
warn.forEach(w => console.warn('⚠ ' + w));
