/* =========================================================
   NỘI THẤT NHẬT DUY — Interactions
   - Mobile nav
   - Sticky-header state
   - Combo filter
   - Lỗ Ban 42.9cm calculator
   - Gửi lead (form đặt lịch + Phiếu phong thủy) về LEAD_ENDPOINT
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

(() => {
  'use strict';

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

  /* Tìm kích thước cát gần nhất bằng cách quét quanh giá trị nhập */
  function nearestGoodSize(target, range = 20, step = 0.5) {
    let best = null;
    let bestDist = Infinity;
    for (let d = step; d <= range; d += step) {
      for (const sign of [+1, -1]) {
        const v = +(target + sign * d).toFixed(1);
        if (v <= 0) continue;
        const r = lookupCm(v);
        if (r.good && d < bestDist) {
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
    if (!w || !l || !h) return;

    const dims = [
      { key: 'Rộng', cm: w, range: 20 },
      { key: 'Dài',  cm: l, range: 25 },
      { key: 'Cao',  cm: h, range: 6  }
    ].map(d => ({ ...d, res: lookupCm(d.cm) }));

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
        <span>Cung <strong>${d.res.cung}</strong> · ${d.res.sub}</span>
        <span class="cung-tag">${d.res.good ? 'Cát' : 'Hung'}</span>
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
        const n = nearestGoodSize(d.cm, d.range);
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
    result.hidden = false;
    /* gentle scroll to result on first calc */
    requestAnimationFrame(() => {
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
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
      sendLead({
        _subject: '[Nhật Duy] Đặt lịch trải nghiệm tại Showroom',
        source: 'Form đặt lịch',
        name: booking.elements.name.value.trim(),
        phone: normalizePhone(booking.elements.phone.value),
        ward: booking.elements.ward.value,
        service: selText(booking.elements.service),
        visit_date: booking.elements.visit_date.value,
        visit_time: selText(booking.elements.visit_time),
        zalo: booking.elements.zalo.checked ? 'Có' : 'Không'
      }).then(() => {
        ok.hidden = false;
        btn.textContent = 'Đã gửi — Cảm ơn bạn';
        ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }).catch(() => {
        /* Giữ nguyên dữ liệu khách đã nhập, cho gửi lại */
        err.hidden = false;
        btn.disabled = false;
        btn.textContent = btnText;
        err.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }).finally(() => { sending = false; });
    });
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
      `<span class="acc__title">${sec.dataset.accordion}</span>` +
      `<span class="acc__meta">Xem mẫu &amp; bảng giá</span>` +
      `<span class="acc__icon" aria-hidden="true"></span>`;
    panel.setAttribute('aria-labelledby', btnEl.id);
    h.appendChild(btnEl);
    container.append(h, panel);
    sec.classList.add('acc');
    setAcc(sec, false);
    btnEl.addEventListener('click', () => setAcc(sec, btnEl.getAttribute('aria-expanded') !== 'true'));
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

  /* ── Scroll reveal ────────────────────────────────────── */
  const reveals = document.querySelectorAll(
    '.section-head, .space-card, .combo, .story, .local-trust article, .booking__form, .booking__copy, .loban__intro, .loban__panel, .product-card, .compare__col, .quiz__card, .price-table__wrapper, .price-table__note'
  );
  reveals.forEach(el => el.classList.add('reveal'));

  /* stagger groups */
  document.querySelectorAll('.space-filter__grid, .combos__grid, .stories__grid, .local-trust__grid, .product-grid, .compare__grid')
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
