/* =========================================================
   NỘI THẤT NHẬT DUY — Interactions
   - Mobile nav
   - Sticky-header state
   - Combo filter
   - Lỗ Ban 42.9cm calculator
   - Booking form (mock submit + Zalo/SMS routing)
   - Scroll reveal
   ========================================================= */

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

  /* ── Booking form ─────────────────────────────────────── */
  const booking = document.getElementById('bookingForm');
  const ok = document.getElementById('bookingOk');
  if (booking) {
    booking.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!booking.checkValidity()) {
        booking.reportValidity();
        return;
      }
      const btn = booking.querySelector('button[type="submit"]');
      const btnText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Đang gửi…';

      const showSuccess = () => {
        ok.hidden = false;
        ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
        btn.textContent = 'Đã gửi — Cảm ơn bạn';
      };

      /* Gửi lead thật qua FormSubmit AJAX → email về nemnhatduy@gmail.com.
         Lần đầu cần xác nhận email kích hoạt từ FormSubmit (chỉ một lần). */
      fetch('https://formsubmit.co/ajax/nemnhatduy@gmail.com', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(booking)
      })
      .then((r) => r.json())
      .then(showSuccess)
      .catch(() => {
        /* Không để mất lead: hướng dẫn khách gửi nhanh qua Zalo */
        btn.disabled = false;
        btn.textContent = btnText;
        const name = encodeURIComponent((booking.name && booking.name.value) || '');
        const phone = encodeURIComponent((booking.phone && booking.phone.value) || '');
        const msg = encodeURIComponent('Em muốn đặt lịch ghé Showroom Nhật Duy. Tên: ' +
          decodeURIComponent(name) + ' — SĐT: ' + decodeURIComponent(phone));
        if (confirm('Gửi qua mạng chưa được. Bấm OK để nhắn nhanh qua Zalo cho Nhật Duy nhé?')) {
          window.open('https://zalo.me/0909001336?text=' + msg, '_blank', 'noopener');
        }
      });
    });
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
