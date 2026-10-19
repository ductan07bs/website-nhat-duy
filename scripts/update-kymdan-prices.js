/* =========================================================
   Lấy giá nệm Kymdan chính hãng từ kymdan.com
   ---------------------------------------------------------
   Chạy:   npm run update-kymdan-prices
   Ghi:    data/kymdan-prices.json  (đừng sửa tay — chạy lại script)
   Sau đó: npm run build   (đổ giá vào bảng giá index.html + dữ liệu chatbox)

   Nguồn: mỗi trang https://kymdan.com/san-pham/{slug} có bảng
   <table class="table-product-size"> — cột Kích thước, Giá niêm yết
   (Pillow Top ghi "Giá chào mới"), Giá khuyến mãi giảm N%, và tiêu đề
   "Khuyến mại được áp dụng từ dd/mm/yyyy đến dd/mm/yyyy".

   CHỐNG SAI:
   - Trang lỗi / không thấy bảng giá → báo tên sản phẩm, BỎ QUA, giữ nguyên
     dữ liệu lần trước của sản phẩm đó (kèm ngày lấy cũ). Không bịa, không ghi 0.
   - Không sản phẩm nào bóc được → dừng, không ghi file (có thể Kymdan đã
     đổi cấu trúc trang hoặc chuyển sang tải giá động).
   ========================================================= */

const fs = require('fs');
const path = require('path');

const BASE = 'https://kymdan.com';
const CATEGORY_URL = BASE + '/danh-muc/nem-kymdan?lang=vi';
const OUT = path.join(__dirname, '..', 'data', 'kymdan-prices.json');

/* Slug lấy đúng từ trang danh mục nệm Kymdan (10/2026).
   Không lấy: men-kymdan-sleep-soundly (mền), tam-an-toan-ve-sinh-nem-kymdan (tấm bảo vệ),
   nệm foam & bông ép Hàn Quốc (không phải hàng Kymdan). */
const PRODUCTS = [
  { key: 'deluxe',         name: 'Kymdan Deluxe',                         group: 'Deluxe',                       slug: 'nem-kymdan-deluxe' },
  { key: 'pillowTopRoyal', name: 'Kymdan Special Deluxe Pillow Top Royal', group: 'Special Deluxe Pillow Top',    slug: 'nem-kymdan-special-deluxe-pillow-top-royal' },
  { key: 'pillowTopCloud', name: 'Kymdan Special Deluxe Pillow Top Cloud', group: 'Special Deluxe Pillow Top',    slug: 'nem-kymdan-special-deluxe-pillow-top-cloud' },
  { key: 'pillowTopSoft',  name: 'Kymdan Special Deluxe Pillow Top Soft',  group: 'Special Deluxe Pillow Top',    slug: 'nem-kymdan-special-deluxe-pillow-top-soft' },
  { key: 'massage',        name: 'Kymdan Massage',                        group: 'Massage',                      slug: 'nem-kymdan-massage' },
  { key: 'nemXep',         name: 'Nệm Xếp Kymdan',                        group: 'Nệm xếp',                      slug: 'nem-xep-kymdan' },
  { key: 'mini',           name: 'Nệm Mini Kymdan',                       group: 'Mini',                         slug: 'nem-mini-kymdan' },
  { key: 'ultimateCare',   name: 'Nệm Kymdan Y tế UltimateCare+',         group: 'Nệm y tế UltimateCare+',       slug: 'nem-kymdan-y-te-vo-boc-ultimatecareplus' }
];
/* Link trên trang danh mục không phải nệm — không cảnh báo "sản phẩm mới" */
const IGNORED_SLUGS = ['men-kymdan-sleep-soundly', 'tam-an-toan-ve-sinh-nem-kymdan', 'goi-om-kymdan'];

const DELAY_MS = 800;           // nghỉ giữa các trang, tránh dồn tải lên kymdan.com
const TIMEOUT_MS = 30_000;
const RETRIES = 2;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const nowVN = () => new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).replace(' ', 'T') + '+07:00';

async function fetchHtml(url) {
  let lastErr;
  for (let i = 0; i <= RETRIES; i++) {
    try {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (NoiThatNhatDuy price sync; dai ly Kymdan)', 'Accept-Language': 'vi' },
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.text();
    } catch (e) {
      lastErr = e;
      if (i < RETRIES) await sleep(1500 * (i + 1));
    }
  }
  throw lastErr;
}

const clean = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
/* "25.320.000" → 25320000; không đúng dạng → null (không đoán) */
const toVnd = (s) => (/^\d{1,3}(\.\d{3})+$/.test(s.trim()) ? Number(s.trim().replace(/\./g, '')) : null);
/* "dd/mm/yyyy" → "yyyy-mm-dd" */
const toIsoDate = (d) => { const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d || ''); return m ? `${m[3]}-${m[2]}-${m[1]}` : null; };

/* Bóc một trang sản phẩm → { variants: [{ label, priceLabel, promotion, rows }] } */
function parseProductPage(html) {
  const starts = [...html.matchAll(/<table class="table-product-size/g)].map(m => m.index);
  if (!starts.length) throw new Error('Không thấy bảng giá (table-product-size) — có thể Kymdan đã đổi cấu trúc hoặc tải giá động');

  return starts.map((start, i) => {
    const seg = html.slice(start, i + 1 < starts.length ? starts[i + 1] : undefined);
    /* Tên biến thể: dòng "1. Nệm xếp ... :" ngay trước bảng (chỉ trang có nhiều bảng mới có) */
    const before = clean(html.slice(Math.max(0, start - 1500), start));
    const lm = before.match(/(?:^|\s)(\d+\.\s[^:]{3,200}):\s*(?:Kích thước.*)?$/);
    const label = starts.length > 1 && lm ? lm[1].trim() : '';

    const head = (seg.match(/<thead>([\s\S]*?)<\/thead>/) || [])[1] || '';
    const pm = head.match(/Khuyến mại được áp dụng từ (\d{2}\/\d{2}\/\d{4}) đến (\d{2}\/\d{2}\/\d{4})/);
    const dm = head.match(/Giá khuyến mãi giảm (\d+(?:[.,]\d+)?)%/);
    const promotion = pm ? {
      from: toIsoDate(pm[1]), to: toIsoDate(pm[2]),
      discountPercent: dm ? Number(dm[1].replace(',', '.')) : null,
      text: `Khuyến mại từ ${pm[1]} đến ${pm[2]}`
    } : null;

    const rowRe = /data-title='Kích thước[^']*'>\s*([^<]+?)\s*<\/td>\s*(?:<!--[\s\S]*?-->\s*)*<td data-title='(Giá [^'(]+?)\s*\(VND\/Bộ\)'[^>]*>\s*([^<]*?)\s*<\/td>\s*(?:<td data-title='Giá khuyến mãi giảm (\d+(?:[.,]\d+)?)%'[^>]*>\s*([^<]*?)\s*<\/td>)?/g;
    const bySize = new Map();
    const problems = [];
    let priceLabel = null;
    for (const m of seg.matchAll(rowRe)) {
      const sm = /^(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*\(cm\)$/.exec(m[1]);
      if (!sm) { problems.push(`kích thước lạ "${m[1]}"`); continue; }
      const [w, l, t] = sm.slice(1).map(v => Number(v.replace(',', '.')));
      const listPrice = toVnd(m[3]);
      if (!listPrice || listPrice < 100_000) { problems.push(`${m[1]}: giá niêm yết không đọc được "${m[3]}"`); continue; }
      const promoPrice = m[5] ? toVnd(m[5]) : null;
      if (m[5] && !promoPrice) problems.push(`${m[1]}: giá khuyến mãi không đọc được "${m[5]}" — bỏ giá KM dòng này`);
      priceLabel = priceLabel || m[2].trim();

      const row = {
        size: `${w} x ${l} x ${t}`, width: w, length: l, thickness: t,
        listPrice,
        promoPrice: promoPrice && promoPrice < listPrice ? promoPrice : null,
        discountPercent: promoPrice && m[4] ? Number(m[4].replace(',', '.')) : null
      };
      if (promoPrice && promoPrice >= listPrice) problems.push(`${row.size}: giá KM ≥ giá niêm yết — bỏ giá KM dòng này`);
      if (row.promoPrice && row.discountPercent != null) {
        const expect = listPrice * (1 - row.discountPercent / 100);
        if (Math.abs(expect - row.promoPrice) > 10_000) problems.push(`${row.size}: giá KM ${row.promoPrice} lệch so với giảm ${row.discountPercent}% (giữ nguyên số của Kymdan)`);
      }
      /* Kymdan in mỗi dòng 2 lần (bản desktop & mobile) — chỉ nhận khi 2 bản khớp nhau */
      const prev = bySize.get(row.size);
      if (prev && (prev.listPrice !== row.listPrice || prev.promoPrice !== row.promoPrice)) {
        problems.push(`${row.size}: 2 bản trên trang ghi giá khác nhau — bỏ dòng này`);
        prev.conflict = true;
        continue;
      }
      if (!prev) bySize.set(row.size, row);
    }
    const rows = [...bySize.values()].filter(r => !r.conflict)
      .sort((a, b) => b.thickness - a.thickness || a.width - b.width || a.length - b.length);
    return { label, priceLabel, promotion, rows, problems };
  });
}

async function checkCategory() {
  try {
    const html = await fetchHtml(CATEGORY_URL);
    const found = [...new Set([...html.matchAll(/\/san-pham\/([a-z0-9-]+)/g)].map(m => m[1]))];
    const known = PRODUCTS.map(p => p.slug);
    const added = found.filter(s => !known.includes(s) && !IGNORED_SLUGS.includes(s));
    const missing = known.filter(s => !found.includes(s));
    if (added.length) console.warn('⚠ Danh mục Kymdan có sản phẩm chưa theo dõi (thêm vào PRODUCTS nếu là nệm):', added.join(', '));
    if (missing.length) console.warn('⚠ Không còn thấy trên trang danh mục (có thể đã ngừng bán / đổi link):', missing.join(', '));
  } catch (e) {
    console.warn('⚠ Không tải được trang danh mục để rà sản phẩm mới:', e.message);
  }
}

async function main() {
  const old = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { products: {} };
  await checkCategory();

  const products = {};
  const errors = [];
  let okCount = 0;

  for (const p of PRODUCTS) {
    const url = `${BASE}/san-pham/${p.slug}?lang=vi`;
    process.stdout.write(`• ${p.name} … `);
    try {
      const html = await fetchHtml(url);
      const variants = parseProductPage(html);
      const rowCount = variants.reduce((n, v) => n + v.rows.length, 0);
      if (!rowCount) throw new Error('Có bảng nhưng không bóc được dòng giá nào — có thể Kymdan đã đổi cấu trúc');
      const problems = variants.flatMap(v => v.problems);
      const promos = variants.map(v => v.promotion).filter(Boolean);
      products[p.key] = {
        name: p.name, group: p.group, slug: p.slug, url,
        fetchedAt: nowVN(),
        priceLabel: variants[0].priceLabel,
        /* Đợt KM chung của sản phẩm (từng biến thể vẫn lưu riêng bên dưới) */
        promotion: promos.length && promos.every(x => x.to === promos[0].to) ? promos[0] : null,
        variants: variants.map(({ problems: _p, ...v }) => v)
      };
      okCount++;
      console.log(`${rowCount} dòng giá` + (problems.length ? ` (⚠ ${problems.length} cảnh báo)` : ''));
      problems.forEach(x => console.warn('    ⚠ ' + x));
    } catch (e) {
      console.log('LỖI');
      console.error(`    ✗ ${p.name} (${url}): ${e.message} — BỎ QUA, không cập nhật sản phẩm này`);
      errors.push({ key: p.key, name: p.name, url, message: e.message, at: nowVN() });
      if (old.products && old.products[p.key]) {
        products[p.key] = { ...old.products[p.key], stale: true };
        console.error(`      Giữ giá lần lấy trước (${old.products[p.key].fetchedAt}).`);
      }
    }
    await sleep(DELAY_MS);
  }

  if (!okCount) {
    console.error('\n✗ Không bóc được giá sản phẩm nào — DỪNG, không ghi file. Kiểm tra lại trang kymdan.com.');
    process.exit(1);
  }

  const data = {
    source: BASE,
    note: 'Giá bán lẻ Kymdan (VND/bộ, đã gồm VAT) lấy tự động từ kymdan.com. Không sửa tay — chạy npm run update-kymdan-prices.',
    updatedAt: nowVN(),
    products,
    errors
  };
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`\nĐã ghi ${path.relative(process.cwd(), OUT)} — ${okCount}/${PRODUCTS.length} sản phẩm OK` +
    (errors.length ? `, ${errors.length} lỗi (xem ở trên).` : '.'));
  console.log('Bước tiếp: npm run build  (đổ giá vào bảng giá trên site + dữ liệu chatbox)');
  if (errors.length) process.exitCode = 2;
}

main().catch(e => { console.error(e); process.exit(1); });
