/* =========================================================
   Đổ giá nệm Kymdan từ data/kymdan-prices.json vào bảng giá index.html
   ---------------------------------------------------------
   Chạy qua:  npm run build
   Chỉ thay phần giữa các dấu mốc trong index.html:
     <!-- KYMDAN-PRICES:START --> … <!-- KYMDAN-PRICES:END -->  (các dòng nệm Kymdan)
     <!-- KYMDAN-NOTE:START -->   … <!-- KYMDAN-NOTE:END -->    (dòng ghi chú ngày cập nhật)
   Dòng nệm foam & bông ép Hàn Quốc nằm ngoài dấu mốc → giữ nguyên.

   Kiểu hiển thị giá: SITE_CONFIG.prices.priceDisplayMode trong assets/js/site-config.js.
   Size không có trong dữ liệu → "Liên hệ" (không suy ra, không làm tròn).
   ========================================================= */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HTML_FILE = path.join(ROOT, 'index.html');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'kymdan-prices.json'), 'utf8'));
const OWN = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'nhatduy-prices.json'), 'utf8'));
const MODE = require(path.join(ROOT, 'assets', 'js', 'site-config.js')).prices.priceDisplayMode;
if (!['list', 'promo', 'nhatduy'].includes(MODE)) throw new Error('priceDisplayMode không hợp lệ: ' + MODE);

/* Cột của bảng (giữ nguyên tiêu đề cột hiện có trong index.html) */
const COLS = [[100, 200], [120, 200], [140, 200], [160, 200], [180, 200]];

/* Dòng hiển thị trên site — chọn độ dày tiêu biểu; dữ liệu đầy đủ mọi size nằm trong JSON */
const ROWS = [
  { key: 'deluxe', thickness: 10, title: 'Kymdan Deluxe', sub: 'Cao su thiên nhiên · Độ dày 10cm' },
  { key: 'deluxe', thickness: 15, title: 'Kymdan Deluxe', sub: 'Cao su thiên nhiên · Độ dày 15cm' },
  { key: 'deluxe', thickness: 20, title: 'Kymdan Deluxe', sub: 'Cao su thiên nhiên · Độ dày 20cm' },
  { key: 'massage', thickness: 11, title: 'Kymdan Massage', sub: 'Bề mặt massage · Độ dày 11cm' },
  { key: 'massage', thickness: 16, title: 'Kymdan Massage', sub: 'Bề mặt massage · Độ dày 16cm' },
  { key: 'pillowTopSoft', thickness: 25, title: 'Special Deluxe Pillow Top Soft', sub: 'Pillow Top mềm · Độ dày 25cm' },
  { key: 'pillowTopCloud', thickness: 27, title: 'Special Deluxe Pillow Top Cloud', sub: 'Pillow Top thoáng · Độ dày 27cm' },
  { key: 'pillowTopRoyal', thickness: 32, title: 'Special Deluxe Pillow Top Royal', sub: 'Cao cấp nhất · Độ dày 32cm', highlight: true },
  { key: 'nemXep', variant: 0, thickness: 5, title: 'Nệm Xếp Kymdan', sub: 'Gấp gọn · Độ dày 5cm' },
  { key: 'mini', compact: true, title: 'Kymdan Mini', sub: 'Cho trẻ em · Giường cũi' },
  { key: 'ultimateCare', compact: true, title: 'Kymdan Y tế UltimateCare+', sub: 'Nệm y tế · Vỏ bọc UltimateCare+' }
];
const WARRANTY = '15 năm'; // kymdan.com ghi bảo hành 15 năm cho cả 8 dòng nệm trên (10/2026)

const todayVN = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }); // yyyy-mm-dd
const vnd = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';            // 25320000 → 25.320.000₫
const dmy = (iso) => iso.slice(0, 10).split('-').reverse().join('/');
const sizeKey = (r) => `${r.width}x${r.length}x${r.thickness}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function rowsOf(spec) {
  const p = DATA.products[spec.key];
  if (!p) return null;
  return (p.variants[spec.variant || 0] || { rows: [] }).rows;
}

/* Một ô giá. data-* để trang tự quay về giá niêm yết khi đợt KM hết hạn, và để quiz đọc giá */
function priceHtml(spec, r) {
  if (!r) return 'Liên hệ';
  const pkey = `${spec.key}|${sizeKey(r)}`;
  const p = DATA.products[spec.key];
  const promo = (p.variants[spec.variant || 0] || {}).promotion || p.promotion;
  const attrs = `class="kd-price" data-pkey="${pkey}" data-list="${r.listPrice}"`;

  if (MODE === 'nhatduy') {
    const own = OWN.prices[pkey];
    return Number.isInteger(own) && own > 0 ? `<span ${attrs}>${vnd(own)}</span>` : 'Liên hệ';
  }
  if (MODE === 'promo' && r.promoPrice && promo && promo.to && promo.to >= todayVN) {
    return `<span ${attrs} data-promo="${r.promoPrice}" data-promo-end="${promo.to}">` +
      `<s class="kd-price__was">${vnd(r.listPrice)}</s> <b class="kd-price__now">${vnd(r.promoPrice)}</b></span>`;
  }
  return `<span ${attrs}>${vnd(r.listPrice)}</span>`;
}

const I = '          ';
function renderRow(spec) {
  const rows = rowsOf(spec);
  const p = DATA.products[spec.key];
  const star = p && /chào mới/i.test(p.priceLabel || '') && MODE !== 'nhatduy' ? ' <sup title="Giá chào mới của Kymdan">*</sup>' : '';
  const head = `<td><strong>${esc(spec.title)}</strong>${star}<br /><small>${esc(spec.sub)}</small></td>`;
  let cells;
  if (spec.compact) {
    const items = (rows || []).map(r =>
      `<span class="kd-item">${r.width}×${r.length}×${String(r.thickness).replace('.', ',')}cm: ${priceHtml(spec, r)}</span>`);
    cells = `<td colspan="5" class="kd-compact"><em>${items.length ? items.join(' ') : 'Liên hệ'}</em></td>`;
  } else {
    cells = COLS.map(([w, l]) => {
      const r = (rows || []).find(x => x.width === w && x.length === l && x.thickness === spec.thickness);
      return `<td>${priceHtml(spec, r)}</td>`;
    }).join(`\n${I}  `);
  }
  return `${I}<tr${spec.highlight ? ' class="price-grid__highlight"' : ''}>\n${I}  ${head}\n${I}  ${cells}\n${I}  <td>${WARRANTY}</td>\n${I}</tr>`;
}

function renderNote() {
  const used = [...new Set(ROWS.map(r => r.key))].map(k => DATA.products[k]).filter(Boolean);
  const oldest = used.map(p => p.fetchedAt).sort()[0];
  const stale = used.filter(p => p.stale).map(p => p.name);
  const promo = used.map(p => p.promotion).find(x => x && x.to);
  const pct = used.flatMap(p => p.variants.flatMap(v => v.rows.map(r => r.discountPercent))).find(x => x != null);
  const hasChaoMoi = used.some(p => /chào mới/i.test(p.priceLabel || ''));
  const parts = [];

  if (MODE === 'nhatduy') {
    parts.push(`Giá bán tại Nội Thất Nhật Duy${OWN.updatedAt ? `, cập nhật ngày ${dmy(OWN.updatedAt)}` : ''} (đã gồm VAT). Size chưa có giá: vui lòng liên hệ.`);
  } else {
    parts.push(`Giá tham khảo theo niêm yết Kymdan, cập nhật ngày ${dmy(oldest)} từ <a href="${DATA.source}" target="_blank" rel="noopener">kymdan.com</a> (VND/bộ, đã gồm VAT).`);
    if (hasChaoMoi) parts.push('(*) Pillow Top: Kymdan niêm yết là “giá chào mới”.');
    if (promo && promo.to >= todayVN) {
      const kmText = `Kymdan đang khuyến mại${pct ? ` giảm ${pct}%` : ''} từ ${dmy(promo.from)} đến ${dmy(promo.to)}`;
      parts.push(MODE === 'promo'
        ? `<span data-promo-note data-promo-end="${promo.to}">Giá in đậm là giá khuyến mại — ${kmText}; giá gạch ngang là giá niêm yết.</span>`
        : `${kmText} — gọi Nhật Duy để được báo giá khuyến mại.`);
    }
    parts.push('Giá có thể thay đổi theo từng đợt của Kymdan.');
  }
  if (stale.length) parts.push(`Giá ${stale.join(', ')} chưa cập nhật được ở lần gần nhất.`);
  return '        ' + parts.join('\n        ');
}

function replaceBetween(html, name, body) {
  const re = new RegExp(`(<!-- ${name}:START[^>]*-->)[\\s\\S]*?(\\n[ \\t]*<!-- ${name}:END -->)`);
  if (!re.test(html)) throw new Error(`Không thấy dấu mốc ${name} trong index.html`);
  return html.replace(re, (_, a, b) => a + '\n' + body + b);
}

/* Giá đang hiện ở một ô (cùng quy tắc với priceHtml); không có giá → null */
function shownPrice(spec, r) {
  if (!r) return null;
  const p = DATA.products[spec.key];
  const promo = (p.variants[spec.variant || 0] || {}).promotion || p.promotion;
  if (MODE === 'nhatduy') {
    const own = OWN.prices[`${spec.key}|${sizeKey(r)}`];
    return Number.isInteger(own) && own > 0 ? own : null;
  }
  if (MODE === 'promo' && r.promoPrice && promo && promo.to && promo.to >= todayVN) return r.promoPrice;
  return r.listPrice;
}
function shownRows(spec) {
  const rows = rowsOf(spec) || [];
  if (spec.compact) return rows;
  return COLS.map(([w, l]) => rows.find(x => x.width === w && x.length === l && x.thickness === spec.thickness)).filter(Boolean);
}

let html = fs.readFileSync(HTML_FILE, 'utf8');
html = replaceBetween(html, 'KYMDAN-PRICES', ROWS.map(renderRow).join('\n'));
html = replaceBetween(html, 'KYMDAN-NOTE', renderNote());
/* "Giá từ" ở khối So sánh = giá thấp nhất đang hiện trong bảng của các dòng đó */
html = html.replace(/(<strong class="price-from" data-price-from="([\w,]+)">)[^<]*(<\/strong>)/g, (_, a, keys, b) => {
  const want = keys.split(',');
  const prices = ROWS.filter(s => want.includes(s.key)).flatMap(s => shownRows(s).map(r => shownPrice(s, r))).filter(Boolean);
  return a + (prices.length ? vnd(Math.min(...prices)) : 'Liên hệ') + b;
});
fs.writeFileSync(HTML_FILE, html, 'utf8');

const missing = ROWS.filter(s => !DATA.products[s.key]).map(s => s.title);
console.log(`Đã đổ giá Kymdan vào index.html — kiểu hiển thị: ${MODE}, dữ liệu ngày ${dmy(DATA.updatedAt)}.`);
if (missing.length) console.warn('⚠ Chưa có dữ liệu (hiện "Liên hệ"):', [...new Set(missing)].join(', '));
