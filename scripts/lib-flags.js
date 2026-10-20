/* =========================================================
   Bỏ khỏi chuỗi HTML các khối đang TẮT theo SITE_CONFIG.flags
   ---------------------------------------------------------
   Dùng chung cho build-seo.js (FAQ JSON-LD) và build-knowledge.js (chatbox)
   để Google và chatbox không nói tới tuyên bố Ba chưa xác nhận.
     data-flag="X"      → giữ khi cờ X = true
     data-flag-off="X"  → giữ khi cờ X = false
   Đếm thẻ cùng tên để lấy đúng thẻ đóng (khối lồng nhau vẫn đúng).
   ========================================================= */

const VOID = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'source']);

function stripFlagged(html, flags) {
  const re = /<([a-z][a-z0-9]*)\b[^>]*\sdata-flag(-off)?="([A-Z0-9_]+)"[^>]*>/g;
  let out = html;
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(out))) {
    const [open, tag, off, name] = m;
    const keep = off ? flags[name] !== true : flags[name] === true;
    if (keep) continue;
    const start = m.index;
    let end = start + open.length;
    if (!VOID.has(tag)) {
      const tagRe = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g');
      tagRe.lastIndex = end;
      let depth = 1, t;
      while (depth && (t = tagRe.exec(out))) {
        depth += t[1] ? -1 : 1;
        end = tagRe.lastIndex;
      }
      if (depth) throw new Error(`Không tìm thấy thẻ đóng </${tag}> cho khối data-flag="${name}"`);
    }
    out = out.slice(0, start) + out.slice(end);
    re.lastIndex = start;
  }
  return out;
}

module.exports = { stripFlagged };
