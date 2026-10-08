/* =========================================================
   Sinh kho tri thức cho chatbox từ index.html
   ---------------------------------------------------------
   Chạy lại MỖI KHI sửa giá / sản phẩm trong index.html:

       node scripts/build-knowledge.js

   Kết quả ghi vào data/knowledge-generated.js (đừng sửa tay file đó).
   Phần viết tay (liên hệ, chính sách, Lỗ Ban, TODO) nằm ở data/knowledge.js.
   ========================================================= */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

/* Bỏ thẻ HTML, giải mã entity, gom khoảng trắng */
function text(s) {
  return String(s || '')
    .replace(/<br\s*\/?>/gi, ' — ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[↓▸]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/(— )+/g, '— ')
    .trim();
}

const all = (re, s) => Array.from(s.matchAll(re));
const first = (re, s) => { const m = s.match(re); return m ? m[1] : ''; };

/* <section ... id="x"> … </section> (các section phụ không lồng nhau) */
function section(id) {
  const m = html.match(new RegExp('<section[^>]*\\sid="' + id + '"[^>]*>([\\s\\S]*?)\\n</section>'));
  if (!m) throw new Error('Không tìm thấy section #' + id + ' trong index.html');
  return m[1];
}

/* Bảng giá → mỗi dòng sản phẩm một dòng chữ "Tên | Cột: giá | …" */
function tableLines(sec) {
  const out = [];
  all(/<table class="price-grid"[^>]*>([\s\S]*?)<\/table>/g, sec).forEach(t => {
    const heads = all(/<th[^>]*>([\s\S]*?)<\/th>/g, t[1]).map(m => text(m[1]));
    all(/<tr[^>]*>([\s\S]*?)<\/tr>/g, first(/<tbody>([\s\S]*?)<\/tbody>/, t[1])).forEach(tr => {
      const parts = [];
      let col = 0;
      all(/<td([^>]*)>([\s\S]*?)<\/td>/g, tr[1]).forEach(td => {
        const span = Number(first(/colspan="(\d+)"/, td[1])) || 1;
        const val = text(td[2]);
        if (col === 0) parts.push(val);
        else if (span > 1) parts.push(val);
        else parts.push(heads[col] + ': ' + val);
        col += span;
      });
      out.push('- ' + parts.join(' | '));
    });
  });
  return out;
}

function cardLines(sec) {
  return all(/<article class="product-card">([\s\S]*?)<\/article>/g, sec).map(a =>
    '- ' + text(first(/<h3>([\s\S]*?)<\/h3>/, a[1])) + ': ' + text(first(/<p>([\s\S]*?)<\/p>/, a[1])) +
    ' — giá ' + text(first(/class="product-card__price">([\s\S]*?)<\/span>/, a[1])));
}

const captions = (sec) => all(/<p class="price-table__caption">([\s\S]*?)<\/p>/g, sec).map(m => 'Ghi chú: ' + text(m[1]));

const blocks = [];

/* 1. Bảng giá nệm Kymdan */
{
  const sec = section('bang-gia');
  blocks.push(['BẢNG GIÁ NỆM KYMDAN (giá theo kích thước rộng × dài)',
    ...tableLines(sec),
    'Ghi chú: ' + text(first(/<div class="price-table__note">\s*<p>([\s\S]*?)<\/p>/, sec))]);
}

/* 2. Các nhóm sản phẩm phụ */
all(/<section class="product-cat[^"]*" id="([\w-]+)" data-accordion="([^"]+)"/g, html).forEach(m => {
  const sec = section(m[1]);
  blocks.push([m[2].toUpperCase(),
    text(first(/<p class="section-lede">([\s\S]*?)<\/p>/, sec)),
    'Mẫu tiêu biểu:', ...cardLines(sec),
    'Bảng giá:', ...tableLines(sec),
    ...captions(sec)]);
});

/* 3. Combo phòng ngủ */
blocks.push(['COMBO PHÒNG NGỦ TRỌN BỘ',
  ...all(/<article class="combo[^"]*"[^>]*>([\s\S]*?)<\/article>/g, section('bo-suu-tap')).map(a => {
    const c = a[1];
    return '- ' + text(first(/<h3>([\s\S]*?)<\/h3>/, c)) + ' (' + text(first(/class="combo__audience">([\s\S]*?)<\/span>/, c)) + '): ' +
      all(/<li>([\s\S]*?)<\/li>/g, c).map(li => text(li[1])).join('; ') +
      ' | Độ cứng/mềm: ' + text(first(/class="firmness__text">([\s\S]*?)<\/span>/, c)) +
      ' | Giá niêm yết ' + text(first(/class="combo__price-old">([\s\S]*?)<\/span>/, c)) +
      ', giá ưu đãi ' + text(first(/class="combo__price-now">([\s\S]*?)<\/span>/, c)) +
      ' (' + text(first(/class="combo__save">([\s\S]*?)<\/span>/, c)) + '; ' + text(first(/class="combo__price-tag">([\s\S]*?)<\/span>/, c)) + ')';
  })]);

/* 4. So sánh 3 dòng nệm */
blocks.push(['SO SÁNH BA DÒNG NỆM',
  ...all(/<div class="compare__col[^"]*">([\s\S]*?)<a class="btn/g, section('so-sanh')).map(d => {
    const c = d[1];
    return '- ' + text(first(/<h3>([\s\S]*?)<\/h3>/, c)) + ' (' + text(first(/<\/h3>\s*<p>([\s\S]*?)<\/p>/, c)) + '): ' +
      all(/<li[^>]*>([\s\S]*?)<\/li>/g, c).map(li => text(li[1])).join('; ') + '. ' +
      text(first(/<p class="compare__best-for">([\s\S]*?)<\/p>/, c));
  })]);

/* 5. Cam kết dịch vụ */
blocks.push(['CAM KẾT DỊCH VỤ',
  ...all(/<article>\s*<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g,
    first(/<section class="local-trust"[^>]*>([\s\S]*?)\n<\/section>/, html)).map(m => '- ' + text(m[1]) + ': ' + text(m[2])),
  '- ' + text(first(/<p class="trust-badge__guarantee">([\s\S]*?)<\/p>/, html))]);

/* 6. Câu hỏi thường gặp */
blocks.push(['CÂU HỎI THƯỜNG GẶP',
  ...all(/<details class="faq__item"[^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>/g, html)
    .map(m => '- Hỏi: ' + text(m[1]) + ' Đáp: ' + text(m[2]))]);

const body = blocks.map(b => '## ' + b[0] + '\n' + b.slice(1).filter(Boolean).join('\n')).join('\n\n');

/* Chặn trường hợp index.html đổi cấu trúc khiến bóc tách ra rỗng */
blocks.forEach(b => { if (b.length < 3) throw new Error('Mục "' + b[0] + '" bóc tách ra rỗng — kiểm tra lại index.html'); });
if (!/25\.840\.000/.test(body)) console.warn('CẢNH BÁO: không thấy giá Kymdan Deluxe 10cm 1m6 quen thuộc — kiểm tra bảng giá.');

const outFile = path.join(ROOT, 'data', 'knowledge-generated.js');
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile,
  '/* FILE TỰ SINH từ index.html bằng `node scripts/build-knowledge.js` — ĐỪNG SỬA TAY.\n' +
  '   Muốn đổi giá: sửa index.html rồi chạy lại lệnh trên. */\n' +
  'module.exports = ' + JSON.stringify(body).replace(/\\n/g, '\\n" +\n  "') + ';\n');

console.log('Đã ghi ' + path.relative(ROOT, outFile) + ' — ' + body.length + ' ký tự, ' + blocks.length + ' mục.');
