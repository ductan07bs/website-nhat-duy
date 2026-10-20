/* =========================================================
   NỘI THẤT NHẬT DUY — Interactions
   - Mobile nav
   - Sticky-header state
   - Combo filter
   - Lỗ Ban 42.9cm calculator
   - Gửi lead (form đặt lịch + Phiếu phong thủy + quiz chọn nệm) về LEAD_ENDPOINT
   - Quiz chọn nệm: gợi ý dòng nệm + thu số điện thoại
   - Bảng giá dạng thẻ trên mobile, accordion nhóm sản phẩm phụ
   - Scroll reveal
   ========================================================= */

/* ╔══════════════════════════════════════════════════════════╗
   ║  CẤU HÌNH NHẬN LEAD — CHỦ SHOP TỰ ĐIỀN                   ║
   ╚══════════════════════════════════════════════════════════╝
   SHEET_ENDPOINT: URL Web App của Google Apps Script (xem file
   google-apps-script.gs để cài: ghi Google Sheet + báo Telegram).
   Dạng: https://script.google.com/macros/s/XXXX/exec
   Cũng dán được endpoint Formspree: https://formspree.io/f/XXXX

   Khi SHEET_ENDPOINT còn để trống, lead tạm gửi về email qua
   FormSubmit (FALLBACK_ENDPOINT) để không mất khách. */
const SHEET_ENDPOINT = ''; // TODO: chủ shop dán URL Apps Script / Formspree vào đây
const FALLBACK_ENDPOINT = 'https://formsubmit.co/ajax/ductan07bs@gmail.com';
const LEAD_ENDPOINT = SHEET_ENDPOINT || FALLBACK_ENDPOINT;
const ZALO_URL = 'https://zalo.me/0909001336';

/* ── Đo lường dùng chung ───────────────────────────────────
   track('ten_su_kien', { ... }) gửi tới công cụ nào đang có trên trang:
     - Google Analytics 4 (gtag)        → gtag('event', ...)
     - Google Tag Manager (dataLayer)   → dataLayer.push(...)
     - Vercel Web Analytics (window.va) → va('event', ...)
   Chưa gắn công cụ nào thì không gửi đi đâu (xem BAO-CAO-CRO.md cách bật). */
function track(eventName, params) {
  const data = Object.assign({ page_path: location.pathname }, params || {});
  try {
    if (typeof window.gtag === 'function') window.gtag('event', eventName, data);
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(Object.assign({ event: eventName }, data));
    if (typeof window.va === 'function') window.va('event', { name: eventName, data });
  } catch (_) { /* đo lường lỗi không được làm hỏng trang */ }
}
window.track = track;

(() => {
  'use strict';

  /* ── Thông điệp dùng chung (site-config.js) ──────────── */
  const CFG = window.SITE_CONFIG || {};
  if (CFG.delivery) {
    document.querySelectorAll('[data-cfg="delivery-short"]').forEach(el => { el.textContent = CFG.delivery.short; });
    document.querySelectorAll('[data-cfg="delivery-long"]').forEach(el => { el.textContent = CFG.delivery.long; });
  }

  /* ── Cờ bật/tắt tuyên bố (SITE_CONFIG.flags) ─────────────
     data-flag="X"     → chỉ hiện khi cờ X = true (trong HTML luôn để sẵn hidden)
     data-flag-off="X" → chỉ hiện khi cờ X = false
     Cờ thiếu hoặc site-config.js không tải được → coi như false (ẩn tuyên bố). */
  const FLAGS = CFG.flags || {};
  document.querySelectorAll('[data-flag]').forEach(el => {
    if (FLAGS[el.dataset.flag] === true) el.hidden = false;
    else el.remove();
  });
  document.querySelectorAll('[data-flag-off]').forEach(el => {
    if (FLAGS[el.dataset.flagOff] === true) el.remove();
  });

  /* Điểm sao Google: chỉ hiện khi bật cờ VÀ đã điền số thật trong business.rating */
  const rating = (CFG.business || {}).rating;
  document.querySelectorAll('[data-cfg="google-rating"]').forEach(el => {
    if (rating && rating.ratingValue && rating.reviewCount) {
      el.textContent = String(rating.ratingValue).replace('.', ',') + '/5 · ' + rating.reviewCount + ' đánh giá trên Google';
    } else {
      (el.closest('[data-flag]') || el).remove();
    }
  });
  const moitLink = document.querySelector('[data-cfg="moit-link"]');
  if (moitLink) {
    if (CFG.moitNoticeUrl) moitLink.href = CFG.moitNoticeUrl;
    else (moitLink.closest('[data-flag]') || moitLink).remove();
  }

  /* ── Đo lường bấm nút liên hệ ─────────────────────────
     Nút có data-cta="zalo|call|booking|…" và data-pos="hero|sticky|product|footer|…".
     Link Zalo / tel: chưa gắn nhãn (vd. trong thông báo lỗi, chatbox) tự suy ra loại
     và lấy vị trí theo khu vực chứa nó. */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-cta], a[href*="zalo.me"], a[href^="tel:"]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const cta = a.dataset.cta || (href.startsWith('tel:') ? 'call' : 'zalo');
    const area = a.closest('section[id], footer, header, .ndchat');
    const pos = a.dataset.pos || (area ? (area.id || area.className.split(' ')[0]) : 'other');
    track('click_' + cta, { cta, position: pos, link_text: a.textContent.trim().slice(0, 60) });
  });

  /* ── Mobile nav ──────────────────────────────────────── */
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.querySelector('.primary-nav');
  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const open = primaryNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    primaryNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        primaryNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Sticky header tone ──────────────────────────────── */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-stuck', window.scrollY > 40);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Combo filter ────────────────────────────────────── */
  const chips = document.querySelectorAll('.combos__filter .chip');
  const combos = document.querySelectorAll('#combosGrid .combo');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => {
        c.classList.remove('chip--active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('chip--active');
      chip.setAttribute('aria-selected', 'true');
      const filter = chip.dataset.filter;
      combos.forEach(card => {
        const match = filter === 'all' || card.dataset.audience === filter;
        card.style.display = match ? '' : 'none';
      });
    });
  });

  /* ── Lỗ Ban Calculator ───────────────────────────────── */
  /* 8 cung × 5.3625 cm = 42.9 cm  (thước Lỗ Ban khối đặc) */
  const CUNG = [
    { name: 'Tài',    good: true,  sub: ['Tài Đức','Bảo Khố','Lục Hợp','Nghênh Phúc'] },
    { name: 'Bệnh',   good: false, sub: ['Thoái Tài','Công Sự','Lao Chấp','Cô Quả'] },
    { name: 'Ly',     good: false, sub: ['Trường Khố','Kiếp Tài','Quan Quỷ','Thất Thoát'] },
    { name: 'Nghĩa',  good: true,  sub: ['Thêm Đinh','Ích Lợi','Quý Tử','Đại Cát'] },
    { name: 'Quan',   good: true,  sub: ['Thuận Khoa','Hoạnh Tài','Tiến Ích','Phú Quý'] },
    { name: 'Kiếp',   good: false, sub: ['Tử Biệt','Thoái Khẩu','Ly Hương','Tài Thất'] },
    { name: 'Hại',    good: false, sub: ['Tai Chí','Tử Tuyệt','Bệnh Lâm','Khẩu Thiệt'] },
    { name: 'Bản',    good: true,  sub: ['Tài Chí','Đăng Khoa','Tiến Bảo','Hưng Vượng'] }
  ];
  const CYCLE_MM = 429;            // 42.9 cm = 429 mm
  const CUNG_MM  = CYCLE_MM / 8;   // 53.625 mm
  const SUB_MM   = CUNG_MM / 4;    // 13.40625 mm

  function lookupCm(cm) {
    const mm = +(cm * 10).toFixed(2);
    const pos = ((mm % CYCLE_MM) + CYCLE_MM) % CYCLE_MM;
    const cungIdx = Math.floor(pos / CUNG_MM);
    const subIdx  = Math.floor((pos - cungIdx * CUNG_MM) / SUB_MM);
    const c = CUNG[cungIdx];
    return {
      cm, mm, pos,
      cungIdx,
      cung: c.name,
      good: c.good,
      sub: c.sub[subIdx] || c.sub[0]
    };
  }

  /* Tìm kích thước cát gần nhất bằng cách quét quanh giá trị nhập.
     Chỉ nhận số cách ranh cung ≥ 0.5cm để đo lệch chút vẫn nằm trong cung tốt. */
  const SAFE_CM = 0.5;
  function nearestGoodSize(target, range = 20, step = 0.5) {
    let best = null;
    let bestDist = Infinity;
    for (let d = step; d <= range; d += step) {
      for (const sign of [+1, -1]) {
        const v = +(target + sign * d).toFixed(1);
        if (v <= 0) continue;
        const r = lookupCm(v);
        const safe = lookupCm(v - SAFE_CM).cungIdx === r.cungIdx && lookupCm(v + SAFE_CM).cungIdx === r.cungIdx;
        if (r.good && safe && d < bestDist) {
          best = { value: v, ...r };
          bestDist = d;
        }
      }
      if (best) break;
    }
    return best;
  }

  const form = document.getElementById('lobanForm');
  const result = document.getElementById('lobanResult');
  const verdict = document.getElementById('lobanVerdict');
  const rows = document.getElementById('lobanRows');
  const suggestBox = document.getElementById('lobanSuggest');
  const suggestList = document.getElementById('lobanSuggestList');
  const rulerCungs = document.querySelectorAll('.loban__ruler-cung');

  let lastDims = null;

  function calcAndRender(e) {
    if (e) e.preventDefault();
    const w = parseFloat(document.getElementById('lbWidth').value);
    const l = parseFloat(document.getElementById('lbLength').value);
    const h = parseFloat(document.getElementById('lbHeight').value);
    /* Thiếu số đo → báo rõ thay vì để trống kết quả */
    if (!(w > 0 && l > 0 && h > 0)) {
      verdict.classList.remove('is-good');
      verdict.classList.add('is-bad');
      verdict.innerHTML = '<strong>Bạn nhập đủ 3 kích thước Rộng, Dài, Cao (cm)</strong> để Nhật Duy đối chiếu nhé — ví dụ 160 × 200 × 25.';
      rows.innerHTML = '';
      suggestBox.hidden = true;
      rulerCungs.forEach(el => el.classList.remove('is-hit'));
      result.hidden = false;
      return;
    }

    const dims = [
      { key: 'Rộng', cm: w, range: 20 },
      { key: 'Dài',  cm: l, range: 25 },
      { key: 'Cao',  cm: h, range: 6  }
    ].map(d => {
      const res = lookupCm(d.cm);
      return { ...d, res, fix: res.good ? null : nearestGoodSize(d.cm, d.range) };
    });

    const allGood = dims.every(d => d.res.good);
    const someGood = dims.some(d => d.res.good);

    verdict.classList.remove('is-good','is-bad');
    if (allGood) {
      verdict.classList.add('is-good');
      verdict.innerHTML =
        `<strong>Tất cả ba chiều rơi vào cung cát.</strong> ` +
        `Kích thước hiện tại đã chuẩn phong thủy — giữ nguyên là một lựa chọn tốt.`;
    } else if (someGood) {
      verdict.classList.add('is-bad');
      const bad = dims.filter(d => !d.res.good).map(d => `<strong>${d.key} ${d.cm}cm</strong> (cung ${d.res.cung})`).join(', ');
      verdict.innerHTML =
        `Một phần kích thước rơi vào cung hung: ${bad}. ` +
        `Gợi ý điều chỉnh phía dưới.`;
    } else {
      verdict.classList.add('is-bad');
      verdict.innerHTML =
        `<strong>Cả ba chiều đều rơi vào cung hung.</strong> ` +
        `Nhật Duy đề xuất kích thước phong thủy thay thế hoặc combo "Đệm cao su thiên nhiên + Gối phong thủy Nhật Duy" để hóa giải.`;
    }

    rows.innerHTML = dims.map(d => `
      <div class="loban__row" data-good="${d.res.good ? 1 : 0}" role="listitem">
        <span>${d.key} <b>${d.cm}cm</b></span>
        <span>Cung <strong>${d.res.cung}</strong> · ${d.res.sub}${d.fix
          ? `<em class="loban__row-fix">Gần nhất đẹp: <b>${d.fix.value}cm</b> (cung ${d.fix.cung})</em>` : ''}</span>
        <span class="cung-tag">${d.res.good ? 'Tốt · Cát' : 'Xấu · Hung'}</span>
      </div>
    `).join('');

    /* highlight ruler — show width's hit as primary */
    rulerCungs.forEach(el => el.classList.remove('is-hit'));
    dims.forEach(d => {
      const el = rulerCungs[d.res.cungIdx];
      if (el) el.classList.add('is-hit');
    });

    /* suggestions if any bad */
    if (!allGood) {
      const items = dims.filter(d => !d.res.good).map(d => {
        const n = d.fix;
        if (!n) return '';
        return `<li>
          <span>${d.key} <strong>${d.cm}cm</strong> → đổi sang <strong>${n.value}cm</strong></span>
          <span>cung ${n.cung} · ${n.sub}</span>
        </li>`;
      }).join('');
      suggestList.innerHTML = items;
      suggestBox.hidden = false;
    } else {
      suggestBox.hidden = true;
    }

    lastDims = dims;
    resetPhieu();
    if (e) track('use_loban', { width: w, length: l, height: h, all_good: allGood });
    result.hidden = false;
    /* Chỉ cuộn khi khách bấm đối chiếu — lần tính sẵn lúc tải trang không được kéo trang xuống */
    if (e) {
      requestAnimationFrame(() => {
        result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }

  if (form) {
    form.addEventListener('submit', calcAndRender);
    /* run once on load so users see immediate value */
    calcAndRender();
  }

  /* ── Gửi lead ─────────────────────────────────────────── */
  /* Gửi dạng form-urlencoded: không bị CORS preflight với Apps Script,
     Formspree và FormSubmit đều nhận. Chỉ resolve khi HTTP 2xx VÀ
     endpoint trả JSON không báo lỗi. */
  function sendLead(fields) {
    const body = new URLSearchParams();
    Object.keys(fields).forEach(k => body.append(k, fields[k] == null ? '' : String(fields[k])));
    body.append('page_url', document.URL);
    body.append('submitted_at', new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));

    return fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body
    }).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(data => {
      if (!data || data.ok === false || data.success === false || data.success === 'false' || data.error || data.errors) {
        throw new Error('Endpoint từ chối');
      }
      return data;
    });
  }

  /* ── Kiểm tra form bằng tiếng Việt (thay bong bóng trình duyệt) ── */
  function normalizePhone(raw) {
    let p = String(raw || '').replace(/[\s.\-()]/g, '');
    if (p.startsWith('+84')) p = '0' + p.slice(3);
    else if (p.startsWith('84') && p.length === 11) p = '0' + p.slice(2);
    return p;
  }

  function fieldError(input) {
    const val = input.value.trim();
    if (!val) return input.dataset.required || '';
    if (input.type === 'tel' && !/^0\d{9}$/.test(normalizePhone(val))) {
      return 'Số điện thoại chưa đúng — cần 10 số, bắt đầu bằng 0 (ví dụ 0909 001 336)';
    }
    return '';
  }

  function showFieldError(input, msg) {
    const field = input.closest('.field');
    if (!field) return;
    let el = field.querySelector('.field__error');
    if (!msg) {
      if (el) el.remove();
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
      return;
    }
    if (!el) {
      el = document.createElement('span');
      el.className = 'field__error';
      el.id = 'err-' + Math.random().toString(36).slice(2, 8);
      el.setAttribute('role', 'alert');
      field.appendChild(el);
    }
    el.textContent = msg;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', el.id);
  }

  /* Trả về true nếu hợp lệ; nếu không thì hiện lỗi dưới từng ô và focus ô đầu tiên */
  function validateForm(formEl) {
    let firstBad = null;
    formEl.querySelectorAll('[data-required]').forEach(input => {
      const msg = fieldError(input);
      showFieldError(input, msg);
      if (msg && !firstBad) firstBad = input;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  document.querySelectorAll('[data-required]').forEach(input => {
    input.addEventListener('input', () => {
      if (input.hasAttribute('aria-invalid')) showFieldError(input, fieldError(input));
    });
  });

  /* ── Booking form ─────────────────────────────────────── */
  const booking = document.getElementById('bookingForm');
  const ok = document.getElementById('bookingOk');
  const err = document.getElementById('bookingErr');
  if (booking) {
    const btn = booking.querySelector('button[type="submit"]');
    const btnText = btn.textContent;
    let sending = false;

    booking.addEventListener('submit', (e) => {
      e.preventDefault();
      if (sending) return;
      ok.hidden = true;
      err.hidden = true;
      if (!validateForm(booking)) return;

      /* Bot điền ô bẫy → bỏ qua, không gửi */
      if (booking._honey && booking._honey.value) return;

      sending = true;
      btn.disabled = true;
      btn.textContent = 'Đang gửi...';

      const selText = (sel) => (sel && sel.value ? sel.options[sel.selectedIndex].text : '');
      const guestName = booking.elements.name.value.trim();
      const guestPhone = normalizePhone(booking.elements.phone.value);
      sendLead({
        _subject: '[Nhật Duy] Đặt lịch trải nghiệm tại Showroom',
        source: 'Form đặt lịch',
        name: guestName,
        phone: guestPhone,
        ward: booking.elements.ward.value,
        service: selText(booking.elements.service),
        visit_date: booking.elements.visit_date.value,
        visit_time: selText(booking.elements.visit_time),
        zalo: booking.elements.zalo.checked ? 'Có' : 'Không'
      }).then(() => {
        document.getElementById('bookingOkMsg').textContent =
          `Cảm ơn ${guestName}. Nhật Duy sẽ gọi số ${guestPhone} để xác nhận giờ ghé trong giờ mở cửa (7:30 – 21:00).`;
        ok.hidden = false;
        btn.textContent = 'Đã gửi — Cảm ơn bạn';
        track('generate_lead', { form: 'booking' });
        ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
        ok.focus({ preventScroll: true });
      }).catch(() => {
        /* Giữ nguyên dữ liệu khách đã nhập, cho gửi lại */
        err.hidden = false;
        btn.disabled = false;
        btn.textContent = btnText;
        err.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }).finally(() => { sending = false; });
    });
  }

  /* Trình duyệt tắt JS gửi form thẳng tới FormSubmit rồi quay về ?booked=1 → báo đã nhận */
  if (ok && /[?&]booked=1/.test(location.search)) {
    ok.hidden = false;
    requestAnimationFrame(() => ok.scrollIntoView({ block: 'center' }));
  }

  /* ── Phiếu Phong Thủy Giấc Ngủ ────────────────────────── */
  const phieuForm = document.getElementById('phieuForm');
  const phieuOut = document.getElementById('phieuOut');
  const phieuCard = document.getElementById('phieuCard');
  const phieuNote = document.getElementById('phieuNote');

  /* Mỗi lần đối chiếu lại thước → ẩn phiếu cũ, mời nhận phiếu mới */
  /* Tra phần tử tại chỗ: hàm này chạy lần đầu trước khi các const phía trên khởi tạo */
  function resetPhieu() {
    const box = document.getElementById('phieuBox');
    if (!box) return;
    box.hidden = false;
    document.getElementById('phieuOut').hidden = true;
    document.getElementById('phieuNote').hidden = true;
    const b = box.querySelector('button[type="submit"]');
    b.disabled = false;
    b.textContent = 'Nhận phiếu phong thủy';
  }

  function note(msg) {
    phieuNote.textContent = msg;
    phieuNote.hidden = false;
  }

  function renderPhieu(name) {
    const li = (left, right, good) =>
      `<li data-good="${good ? 1 : 0}"><span>${left}</span><span>${right}</span></li>`;

    document.getElementById('phieuName').textContent = name;
    document.getElementById('phieuCurrent').innerHTML = lastDims.map(d =>
      li(`${d.key} <b>${d.cm}cm</b>`, `Cung ${d.res.cung} · ${d.res.good ? 'Cát' : 'Hung'}`, d.res.good)
    ).join('');

    const fixes = lastDims.filter(d => !d.res.good)
      .map(d => ({ d, n: nearestGoodSize(d.cm, d.range) }))
      .filter(x => x.n);
    document.getElementById('phieuSuggest').innerHTML = fixes.length
      ? fixes.map(x => li(`${x.d.key} <b>${x.n.value}cm</b>`, `Cung ${x.n.cung} · ${x.n.sub}`, true)).join('')
      : li('Giữ nguyên kích thước hiện tại', 'Đã chuẩn cung cát', true);

    document.getElementById('phieuWish').textContent =
      `Chúc ${name} và gia đình ngủ ngon, an khang, vạn sự hanh thông.`;

    return fixes;
  }

  if (phieuForm) {
    let sending = false;
    phieuForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (sending || !lastDims) return;
      if (!validateForm(phieuForm)) return;
      if (phieuForm._honey && phieuForm._honey.value) return;

      const name = phieuForm.elements.name.value.trim();
      const btn = phieuForm.querySelector('button[type="submit"]');
      const fixes = renderPhieu(name);
      phieuOut.hidden = false;
      phieuNote.hidden = true;
      phieuOut.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      sending = true;
      btn.disabled = true;
      btn.textContent = 'Đang gửi...';
      sendLead({
        _subject: '[Nhật Duy] Khách nhận Phiếu phong thủy',
        source: 'Phiếu phong thủy',
        name,
        phone: normalizePhone(phieuForm.elements.phone.value),
        service: 'Tư vấn phong thủy phòng ngủ (Lỗ Ban)',
        kich_thuoc: lastDims.map(d => `${d.key} ${d.cm}cm`).join(' × '),
        cung: lastDims.map(d => `${d.key}: ${d.res.cung} (${d.res.good ? 'cát' : 'hung'})`).join('; '),
        de_xuat: fixes.map(x => `${x.d.key} ${x.n.value}cm (${x.n.cung})`).join('; ') || 'Giữ nguyên'
      }).then(() => {
        btn.textContent = 'Đã gửi — Nhật Duy sẽ gọi tư vấn';
        track('generate_lead', { form: 'phieu_phong_thuy' });
        note('Phiếu của bạn ở ngay trên. Nhật Duy đã nhận thông tin và sẽ gọi tư vấn kích thước cho bạn.');
      }).catch(() => {
        /* Khách vẫn nhận phiếu; chỉ báo thật là thông tin chưa về tới shop */
        btn.disabled = false;
        btn.textContent = 'Nhận phiếu phong thủy';
        note('Phiếu của bạn ở ngay trên. Mạng chập chờn nên Nhật Duy chưa nhận được số của bạn — bạn nhắn Zalo hoặc gọi 0909 001 336 để được tư vấn nhé.');
      }).finally(() => { sending = false; });
    });

    /* html2canvas chỉ tải khi khách bấm tải/chia sẻ phiếu */
    let h2cPromise = null;
    const loadH2C = () => {
      if (window.html2canvas) return Promise.resolve();
      if (!h2cPromise) {
        h2cPromise = new Promise((resolve, reject) => {
          const sc = document.createElement('script');
          sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          sc.onload = resolve;
          sc.onerror = () => { h2cPromise = null; reject(new Error('Không tải được html2canvas')); };
          document.head.appendChild(sc);
        });
      }
      return h2cPromise;
    };
    const phieuBlob = () => loadH2C()
      .then(() => window.html2canvas(phieuCard, {
        scale: 2, backgroundColor: null, useCORS: true,
        onclone: (doc) => doc.getElementById('phieuCard').classList.add('is-export')
      }))
      .then(canvas => new Promise((resolve, reject) =>
        canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Không tạo được ảnh'))), 'image/png')));
    const FILE_NAME = 'phieu-phong-thuy-nhat-duy.png';
    const saveBlob = (blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = FILE_NAME;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };
    const imgFail = () => note('Chưa tạo được ảnh phiếu — bạn chụp màn hình phiếu giúp Nhật Duy nhé.');

    document.getElementById('phieuDownload').addEventListener('click', () => {
      phieuBlob().then(saveBlob).catch(imgFail);
    });

    /* Điện thoại: mở bảng chia sẻ kèm ảnh phiếu (chọn Zalo).
       Máy không hỗ trợ: tải ảnh về rồi mở Zalo Nhật Duy để gửi. */
    document.getElementById('phieuShare').addEventListener('click', () => {
      phieuBlob().then(blob => {
        const file = new File([blob], FILE_NAME, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          return navigator.share({
            files: [file],
            title: 'Phiếu Phong Thủy Giấc Ngủ — Nội Thất Nhật Duy',
            text: 'Phiếu phong thủy giấc ngủ của mình từ Nội Thất Nhật Duy.'
          }).catch(() => {});
        }
        saveBlob(blob);
        note('Ảnh phiếu đã tải về máy — mở Zalo và gửi ảnh này cho người thân hoặc Nhật Duy nhé.');
        window.open(ZALO_URL, '_blank', 'noopener');
      }).catch(() => {
        imgFail();
        window.open(ZALO_URL, '_blank', 'noopener');
      });
    });
  }

  /* ── Quiz chọn nệm → gợi ý + thu số điện thoại ──────────── */
  /* Giá nệm Kymdan đọc từ ô bảng giá (data-pkey) — luôn khớp bảng giá & kiểu hiển thị đang chọn.
     Bông ép không phải hàng Kymdan → giữ giá "từ" như dòng bông ép trong bảng. */
  const QUIZ_PRODUCTS = {
    bongEp: {
      title: 'Nệm Bông ép Hàn Quốc',
      desc: 'Thoáng mát, kháng khuẩn, nhẹ và dễ vệ sinh — hợp phòng trẻ em, người hay nóng lưng và ngân sách vừa phải.',
      price: 'Giá tham khảo: từ 2.620.000₫ · bảo hành 3 năm',
      img: 'assets/img/products/bong-ep-korea-plus.webp',
      service: 'foam'
    },
    deluxe10: {
      title: 'Nệm Kymdan Deluxe 10cm',
      desc: 'Dòng nền tảng của Kymdan — cao su thiên nhiên 100%, nâng đỡ cột sống tốt, bảo hành chính hãng 15 năm.',
      priceKey: 'deluxe|160x200x10',
      img: 'assets/img/products/nem-deluxe.webp',
      service: 'kymdan'
    },
    deluxe20: {
      title: 'Nệm Kymdan Deluxe 20cm',
      desc: 'Bản dày nhất của dòng Deluxe — bề mặt chắc, nâng đỡ trọn thân, bảo hành chính hãng 15 năm.',
      priceKey: 'deluxe|160x200x20',
      img: 'assets/img/products/nem-deluxe.webp',
      service: 'kymdan'
    },
    cloud: {
      title: 'Nệm Kymdan Special Deluxe Pillow Top Cloud',
      desc: 'Lớp Pillow Top thoáng hơi trên nền cao su thiên nhiên — êm mà vẫn thông thoáng, bảo hành 15 năm.',
      priceKey: 'pillowTopCloud|160x200x27',
      img: 'assets/img/products/nem-pillowtop.webp',
      service: 'kymdan'
    },
    royal: {
      title: 'Nệm Kymdan Special Deluxe Pillow Top Royal',
      desc: 'Dòng cao cấp nhất của Kymdan — dày 32cm, lớp Pillow Top êm ái, nâng đỡ cột sống toàn diện.',
      priceKey: 'pillowTopRoyal|160x200x32',
      img: 'assets/img/products/nem-pillowtop.webp',
      service: 'kymdan'
    }
  };
  const QUIZ_LABELS = {
    s1: { A: 'Nằm ngửa', B: 'Nằm nghiêng', C: 'Nằm sấp' },
    s2: { A: 'Đau lưng / cột sống', B: 'Hay đổ mồ hôi, nóng lưng', C: 'Dành cho trẻ em', D: 'Không vấn đề đặc biệt' },
    s3: { A: 'Dưới 10 triệu', B: '10–30 triệu', C: 'Trên 30 triệu' }
  };

  /* Ngân sách quyết định nhóm dòng nệm; tư thế và nhu cầu chọn dòng cụ thể + lý do */
  function quizPick(a) {
    const reasons = [];
    let key;
    if (a.s3 === 'A' || a.s2 === 'C' || (a.s2 === 'B' && a.s3 === 'B')) {
      key = 'bongEp';
    } else if (a.s3 === 'C') {
      key = a.s1 === 'C' ? 'deluxe20' : a.s2 === 'B' ? 'cloud' : 'royal';
    } else {
      key = 'deluxe10';
    }

    if (a.s1 === 'A') reasons.push('Nằm ngửa cần nệm nâng đỡ đều từ lưng tới hông để cột sống giữ được đường cong tự nhiên.');
    if (a.s1 === 'B') reasons.push('Nằm nghiêng cần bề mặt đủ êm để vai và hông lún vừa phải, không bị tê mỏi khi thức dậy.');
    if (a.s1 === 'C') reasons.push('Nằm sấp nên chọn bề mặt chắc, tránh nệm quá mềm làm võng vùng bụng và mỏi thắt lưng.');

    if (a.s2 === 'A') reasons.push('Với người đau lưng, cao su thiên nhiên nâng đỡ chắc và đàn hồi đều — nên nằm thử trực tiếp để chọn độ dày vừa người.');
    if (a.s2 === 'B') reasons.push(
      key === 'cloud' ? 'Bạn hay nóng lưng nên Nhật Duy ưu tiên bản Cloud — lớp Pillow Top thoáng hơi.'
      : key === 'bongEp' ? 'Bạn hay nóng lưng nên Nhật Duy ưu tiên dòng thoáng mát, thoát nhiệt tốt.'
      : 'Bạn hay nóng lưng — khi ghé showroom, chuyên viên sẽ tư vấn thêm ga, vỏ bọc thoáng khí đi kèm.');
    if (a.s2 === 'C') reasons.push('Cho trẻ em, ưu tiên nệm kháng khuẩn, nhẹ, dễ vệ sinh và giá hợp lý.');

    if (a.s3 === 'A') reasons.push('Vừa ngân sách dưới 10 triệu. Nếu thích cảm giác ôm người hơn, Nhật Duy có thêm nệm Foam từ 1.720.000₫ để bạn so sánh.');
    if (key === 'deluxe10') reasons.push('Vừa tầm 10–30 triệu cho các size phổ biến — xem đủ giá từng size ở bảng giá bên dưới.');
    if (a.s3 === 'C' && (key === 'royal' || key === 'cloud')) reasons.push('Nếu muốn cân đối ngân sách hơn, Kymdan Deluxe 15–20cm cũng là lựa chọn rất đáng cân nhắc.');

    return { key, product: QUIZ_PRODUCTS[key], reasons };
  }

  /* Giá đang hiển thị trong bảng cho size 1m6 × 2m; không có ô → không ghi giá (không đoán) */
  function quizPrice(p) {
    if (p.price) return p.price;
    const cell = document.querySelector(`.kd-price[data-pkey="${p.priceKey}"]`);
    if (!cell) return '';
    const now = cell.querySelector('.kd-price__now');
    return (now ? 'Giá khuyến mại Kymdan' : 'Giá niêm yết Kymdan') + ' size 1m6 × 2m: ' + (now || cell).textContent.trim();
  }

  const quizCard = document.getElementById('quizCard');
  if (quizCard) {
    let answers = {};
    let pick = null;
    const step = (n) => document.getElementById('qStep' + n);
    const qResult = document.getElementById('qResult');
    const leadForm = document.getElementById('quizLeadForm');
    const leadOk = document.getElementById('quizLeadOk');
    const leadErr = document.getElementById('quizLeadErr');
    const leadBtn = leadForm.querySelector('button[type="submit"]');
    const leadBtnText = leadBtn.textContent;
    let sending = false;

    const resetLead = () => {
      leadOk.hidden = true;
      leadErr.hidden = true;
      leadBtn.disabled = false;
      leadBtn.textContent = leadBtnText;
    };

    const showResult = () => {
      pick = quizPick(answers);
      const p = pick.product;
      document.getElementById('qResultTitle').textContent = p.title;
      document.getElementById('qResultDesc').textContent = p.desc + (quizPrice(p) ? ' ' + quizPrice(p) + '.' : '');
      document.getElementById('qResultReasons').innerHTML =
        pick.reasons.map(r => `<li>${r}</li>`).join('');
      const thumb = document.getElementById('qResultImg');
      thumb.src = p.img; thumb.alt = p.title; thumb.hidden = false;
      resetLead();
      track('quiz_complete', { result: pick.key, s1: answers.s1, s2: answers.s2, s3: answers.s3 });
      qResult.hidden = false;
      qResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    quizCard.querySelectorAll('.quiz__opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const n = +btn.dataset.step;
        answers['s' + n] = btn.dataset.val;
        step(n).hidden = true;
        if (n < 3) step(n + 1).hidden = false;
        else showResult();
      });
    });

    document.getElementById('qRestart').addEventListener('click', () => {
      answers = {};
      pick = null;
      qResult.hidden = true;
      step(1).hidden = false;
      step(2).hidden = true;
      step(3).hidden = true;
    });

    /* "Xem luôn tại showroom" → chọn sẵn dịch vụ phù hợp trong form đặt lịch */
    document.getElementById('qResultCTA').addEventListener('click', () => {
      const svc = document.getElementById('bookingService');
      if (svc && pick) svc.value = pick.product.service;
    });

    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (sending || !pick) return;
      leadOk.hidden = true;
      leadErr.hidden = true;
      if (!validateForm(leadForm)) return;
      if (leadForm._honey && leadForm._honey.value) return;

      sending = true;
      leadBtn.disabled = true;
      leadBtn.textContent = 'Đang gửi...';
      const summary = ['s1', 's2', 's3'].map(k => QUIZ_LABELS[k][answers[k]]).join(' · ');
      sendLead({
        _subject: '[Nhật Duy] Khách làm quiz chọn nệm — xin báo giá',
        source: 'Quiz chọn nệm',
        /* Apps Script bắt buộc có tên → khách bỏ trống thì ghi rõ để chuyên viên hỏi khi gọi */
        name: leadForm.elements.name.value.trim() || '(Khách quiz — chưa để tên)',
        phone: normalizePhone(leadForm.elements.phone.value),
        service: 'Báo giá ' + pick.product.title,
        note: 'Quiz: ' + summary + ' → gợi ý ' + pick.product.title
      }).then(() => {
        leadOk.innerHTML = '<strong>Đã nhận số của bạn.</strong> Nhật Duy sẽ gọi gửi báo giá ' +
          pick.product.title + ' và tư vấn 1:1 trong giờ mở cửa (7:30 – 21:00). Cảm ơn bạn!';
        leadOk.hidden = false;
        leadBtn.textContent = 'Đã gửi — Cảm ơn bạn';
        track('generate_lead', { form: 'quiz' });
      }).catch(() => {
        leadErr.hidden = false;
        leadBtn.disabled = false;
        leadBtn.textContent = leadBtnText;
      }).finally(() => { sending = false; });
    });
  }

  /* ── Bảng giá Kymdan: hết đợt khuyến mại → tự quay về giá niêm yết ──
     (giá KM chỉ hiện kèm hạn; phòng khi chưa kịp chạy lại npm run build) */
  const todayVN = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
  const fmtVnd = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
  document.querySelectorAll('.kd-price[data-promo-end]').forEach(el => {
    if (el.dataset.promoEnd >= todayVN) return;
    el.textContent = fmtVnd(el.dataset.list);
    el.removeAttribute('data-promo-end');
  });
  document.querySelectorAll('[data-promo-note][data-promo-end]').forEach(el => {
    if (el.dataset.promoEnd < todayVN) el.textContent = 'Đợt khuyến mại của Kymdan đã kết thúc — bảng đang hiển thị giá niêm yết.';
  });

  /* "Giá từ" ở khối So sánh: tính lại theo giá đang hiện (hết đợt KM thì theo giá niêm yết) */
  document.querySelectorAll('[data-price-from]').forEach(el => {
    const prices = el.dataset.priceFrom.split(',').flatMap(k =>
      Array.from(document.querySelectorAll(`.kd-price[data-pkey^="${k}|"]`)).map(c =>
        +(c.dataset.promoEnd && c.dataset.promo ? c.dataset.promo : c.dataset.list)))
      .filter(n => n > 0);
    if (prices.length) el.textContent = fmtVnd(Math.min(...prices));
  });

  /* ── Bảng giá: gắn nhãn cột cho bố cục thẻ trên mobile ── */
  document.querySelectorAll('.price-grid').forEach(table => {
    const heads = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
    table.querySelectorAll('tbody tr').forEach(tr => {
      let col = 0;
      Array.from(tr.cells).forEach(td => {
        if (col > 0 && td.colSpan === 1 && heads[col]) td.dataset.label = heads[col];
        col += td.colSpan;
      });
    });
  });

  /* ── Accordion nhóm sản phẩm phụ (mặc định đóng) ─────── */
  const accSections = document.querySelectorAll('section[data-accordion]');
  const setAcc = (sec, open) => {
    const btnEl = sec.querySelector('.acc__toggle');
    const panel = sec.querySelector('.acc__panel');
    btnEl.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    sec.classList.toggle('is-open', open);
  };
  accSections.forEach(sec => {
    const container = sec.querySelector('.container');
    const panel = document.createElement('div');
    panel.className = 'acc__panel';
    panel.id = 'acc-panel-' + sec.id;
    panel.setAttribute('role', 'region');
    while (container.firstChild) panel.appendChild(container.firstChild);

    const h = document.createElement('h3');
    h.className = 'acc__heading';
    const btnEl = document.createElement('button');
    btnEl.type = 'button';
    btnEl.className = 'acc__toggle';
    btnEl.id = 'acc-btn-' + sec.id;
    btnEl.setAttribute('aria-controls', panel.id);
    btnEl.innerHTML =
      `<span class="acc__title">${sec.dataset.accordion}` +
      (sec.dataset.accFrom ? ` <span class="acc__from">— ${sec.dataset.accFrom}</span>` : '') + '</span>' +
      `<span class="acc__meta">Xem mẫu &amp; bảng giá</span>` +
      `<span class="acc__icon" aria-hidden="true"></span>`;
    panel.setAttribute('aria-labelledby', btnEl.id);
    h.appendChild(btnEl);
    container.append(h, panel);
    sec.classList.add('acc');
    setAcc(sec, false);
    btnEl.addEventListener('click', () => {
      const open = btnEl.getAttribute('aria-expanded') !== 'true';
      setAcc(sec, open);
      if (open) track('open_price_group', { group: sec.dataset.accordion });
    });
  });

  if (accSections.length) accSections[accSections.length - 1].classList.add('acc--last');

  /* Link #foam, #bong-ep… → mở đúng khối rồi mới cuộn tới */
  const openAccFor = (hash) => {
    if (!hash || hash.length < 2) return;
    let target = null;
    try { target = document.querySelector(hash); } catch (_) { return; }
    const sec = target && target.closest('section[data-accordion]');
    if (!sec) return;
    setAcc(sec, true);
    requestAnimationFrame(() => sec.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  if (accSections.length) {
    window.addEventListener('hashchange', () => openAccFor(location.hash));
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (a && a.getAttribute('href') === location.hash) openAccFor(location.hash);
    });
    openAccFor(location.hash);
  }

  /* ── Ảnh thật của showroom: có file trong assets/img/showroom/ thì tự thay ảnh tạm ── */
  document.querySelectorAll('img[data-real-src]').forEach(img => {
    const probe = new Image();
    probe.onload = () => {
      img.src = img.dataset.realSrc;
      if (img.dataset.realAlt) img.alt = img.dataset.realAlt;
      if (img.hidden) {
        img.hidden = false;
        const fallback = img.parentElement.querySelector('.js-photo-fallback');
        if (fallback) fallback.remove();
      }
    };
    probe.src = img.dataset.realSrc;
  });

  /* ── Scroll reveal ────────────────────────────────────── */
  const reveals = document.querySelectorAll(
    '.section-head, .why__item, .combo, .story, .local-trust article, .booking__form, .booking__copy, .loban__intro, .loban__panel, .product-card, .compare__col, .quiz__card, .price-table__wrapper, .price-table__note'
  );
  reveals.forEach(el => el.classList.add('reveal'));

  /* stagger groups */
  document.querySelectorAll('.why__grid, .combos__grid, .stories__grid, .local-trust__grid, .product-grid, .compare__grid')
    .forEach(g => g.classList.add('reveal-stagger'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));

})();
