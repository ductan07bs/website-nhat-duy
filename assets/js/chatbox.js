/* =========================================================
   NỘI THẤT NHẬT DUY — Chatbox "Trợ lý Nhật Duy"
   - Gửi câu hỏi tới /api/chat, lưu lịch sử trong phiên (sessionStorage)
   - Thu Tên + SĐT qua /api/lead
   Không có khóa API nào ở đây — mọi khóa nằm trong /api (biến môi trường Vercel).
   ========================================================= */

(() => {
  'use strict';

  /* ── Cấu hình ────────────────────────────────────────── */
  const CHAT_ENDPOINT = '/api/chat';
  const LEAD_ENDPOINT = '/api/lead';
  const PHONE_TEL = '0909001336';
  const PHONE_TEXT = '0909 001 336';
  const ZALO_URL = 'https://zalo.me/0909001336';
  const STORE_KEY = 'nd_chat_v1';
  const MAX_INPUT = 500;
  const GREETING = 'Chào anh/chị! Em là trợ lý của Nội Thất Nhật Duy. Anh/chị cần em tư vấn về nệm, giá hay phong thủy giường nệm ạ?';
  const SUGGESTIONS = ['Giá nệm Kymdan 1m6', 'Nệm cho người đau lưng', 'Kích thước hợp phong thủy'];

  /* ── Trạng thái (giữ trong phiên) ────────────────────── */
  let state = { messages: [], open: false, leadShown: false, leadDone: false };
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null');
    if (saved && Array.isArray(saved.messages)) state = Object.assign(state, saved);
  } catch (_) { /* trình duyệt chặn sessionStorage → chạy không lưu */ }
  const save = () => {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (_) { /* bỏ qua */ }
  };

  /* ── Dựng giao diện ──────────────────────────────────── */
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  const ICON_CHAT = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M4 5h16v11H10l-5 4v-4H4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8.5 9.5h7M8.5 12.5h4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const ICON_SEND = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 12l16-7-6 16-3-6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  const launcher = el('button', 'ndchat-launcher');
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Mở trợ lý Nhật Duy');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'ndchatPanel');
  launcher.innerHTML = ICON_CHAT + '<span class="ndchat-launcher__label">Hỏi trợ lý</span>';

  const panel = el('section', 'ndchat');
  panel.id = 'ndchatPanel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Trợ lý Nhật Duy');
  panel.innerHTML =
    '<header class="ndchat__head">' +
      '<div><strong class="ndchat__title">Trợ lý Nhật Duy</strong>' +
      '<span class="ndchat__sub">Tư vấn nệm · giá · phong thủy</span></div>' +
      '<button type="button" class="ndchat__close" aria-label="Đóng trợ lý">×</button>' +
    '</header>' +
    '<div class="ndchat__actions">' +
      '<a class="ndchat__action ndchat__action--call" href="tel:' + PHONE_TEL + '">Gọi ' + PHONE_TEXT + '</a>' +
      '<a class="ndchat__action ndchat__action--zalo" href="' + ZALO_URL + '" target="_blank" rel="noopener">Zalo</a>' +
      '<button type="button" class="ndchat__action ndchat__action--lead">Để lại số</button>' +
    '</div>' +
    '<div class="ndchat__log" role="log" aria-live="polite" tabindex="0"></div>' +
    '<form class="ndchat__input" novalidate>' +
      '<label class="sr-only" for="ndchatText">Nhập câu hỏi</label>' +
      '<textarea id="ndchatText" rows="1" maxlength="' + MAX_INPUT + '" placeholder="Nhập câu hỏi của anh/chị…" enterkeyhint="send"></textarea>' +
      '<button type="submit" class="ndchat__send" aria-label="Gửi">' + ICON_SEND + '</button>' +
    '</form>';

  document.body.append(launcher, panel);

  const log = panel.querySelector('.ndchat__log');
  const form = panel.querySelector('.ndchat__input');
  const input = panel.querySelector('textarea');
  const sendBtn = panel.querySelector('.ndchat__send');

  const scrollDown = () => { log.scrollTop = log.scrollHeight; };

  function addBubble(role, text) {
    const b = el('div', 'ndchat__msg ndchat__msg--' + (role === 'user' ? 'user' : 'bot'), text);
    log.appendChild(b);
    scrollDown();
    return b;
  }

  /* Bong bóng xin lỗi kèm nút Gọi / Zalo */
  function addHandoff(text) {
    const b = addBubble('assistant', text + ' ');
    const call = el('a', null, 'Gọi ' + PHONE_TEXT);
    call.href = 'tel:' + PHONE_TEL;
    const zalo = el('a', null, 'nhắn Zalo');
    zalo.href = ZALO_URL; zalo.target = '_blank'; zalo.rel = 'noopener';
    b.append(call, ' hoặc ', zalo, '.');
    scrollDown();
  }

  /* ── Form Tên + SĐT ngay trong khung chat ────────────── */
  let leadForm = null;

  function normalizePhone(raw) {
    let p = String(raw || '').replace(/[\s.\-()]/g, '');
    if (p.startsWith('+84')) p = '0' + p.slice(3);
    else if (p.startsWith('84') && p.length === 11) p = '0' + p.slice(2);
    return p;
  }

  /* Nhu cầu của khách = vài câu khách vừa hỏi, để nhân viên gọi lại nắm được ngay */
  const leadNote = () => state.messages.filter(m => m.role === 'user').slice(-3).map(m => m.content).join(' | ').slice(0, 500);

  function showLeadForm(prefillPhone) {
    if (state.leadDone) return;
    if (!leadForm) {
      leadForm = el('form', 'ndchat__lead');
      leadForm.noValidate = true;
      leadForm.innerHTML =
        '<strong>Để lại số — chuyên viên gọi lại trong 30 phút</strong>' +
        '<label><span class="sr-only">Họ tên</span><input type="text" name="name" autocomplete="name" placeholder="Tên anh/chị" maxlength="80" /></label>' +
        '<label><span class="sr-only">Số điện thoại</span><input type="tel" name="phone" inputmode="tel" autocomplete="tel" placeholder="Số điện thoại" maxlength="20" /></label>' +
        '<p class="ndchat__lead-err" role="alert" hidden></p>' +
        '<button type="submit" class="btn btn--gold btn--block">Gửi — Nhật Duy gọi lại</button>';
      leadForm.addEventListener('submit', submitLead);
    }
    if (prefillPhone && !leadForm.elements.phone.value) leadForm.elements.phone.value = prefillPhone;
    log.appendChild(leadForm); // luôn đưa form xuống cuối khung chat
    state.leadShown = true;
    save();
    scrollDown();
  }

  let leadSending = false;
  function submitLead(e) {
    e.preventDefault();
    if (leadSending) return;
    const errEl = leadForm.querySelector('.ndchat__lead-err');
    const btn = leadForm.querySelector('button[type="submit"]');
    const name = leadForm.elements.name.value.trim();
    const phone = normalizePhone(leadForm.elements.phone.value);
    const fail = (msg, field) => {
      errEl.textContent = msg;
      errEl.hidden = false;
      if (field) field.focus();
      scrollDown();
    };
    errEl.hidden = true;
    if (!name) return fail('Anh/chị cho em xin tên để tiện xưng hô ạ.', leadForm.elements.name);
    if (!/^0\d{9}$/.test(phone)) return fail('Số điện thoại chưa đúng — cần 10 số, bắt đầu bằng 0.', leadForm.elements.phone);

    leadSending = true;
    btn.disabled = true;
    const btnText = btn.textContent;
    btn.textContent = 'Đang gửi...';

    fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, note: leadNote(), page_url: document.URL })
    })
      .then(r => r.json().catch(() => null).then(data => {
        if (!r.ok || !data || data.ok !== true) throw new Error('lead');
      }))
      .then(() => {
        state.leadDone = true;
        leadForm.remove();
        const thanks = 'Cảm ơn anh/chị, Nhật Duy sẽ gọi lại trong 30 phút.';
        state.messages.push({ role: 'user', content: 'Tôi đã để lại tên ' + name + ' và số điện thoại.' });
        state.messages.push({ role: 'assistant', content: thanks });
        save();
        addBubble('assistant', thanks);
        panel.querySelector('.ndchat__action--lead').hidden = true;
      })
      .catch(() => {
        /* Giữ nguyên tên + số khách đã nhập để bấm gửi lại */
        btn.disabled = false;
        btn.textContent = btnText;
        fail('Em xin lỗi, chưa gửi được thông tin. Anh/chị bấm gửi lại, hoặc Gọi ' + PHONE_TEXT + ' / nhắn Zalo giúp em nhé.');
      })
      .finally(() => { leadSending = false; });
  }

  /* ── Gửi câu hỏi ─────────────────────────────────────── */
  let asking = false;
  function ask(text) {
    text = String(text || '').trim().slice(0, MAX_INPUT);
    if (!text || asking) return;
    asking = true;
    sendBtn.disabled = true;
    const chips = log.querySelector('.ndchat__chips');
    if (chips) chips.remove();

    state.messages.push({ role: 'user', content: text });
    save();
    addBubble('user', text);

    const typing = el('div', 'ndchat__msg ndchat__msg--bot ndchat__typing');
    typing.setAttribute('aria-label', 'Trợ lý đang trả lời');
    typing.innerHTML = '<span></span><span></span><span></span>';
    log.appendChild(typing);
    scrollDown();

    /* Khách tự gõ số điện thoại vào ô chat → mở sẵn form với số đó */
    const typedPhone = (text.match(/(?:\+?84|0)(?:[\s.\-]?\d){9}/) || [''])[0];

    fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: state.messages })
    })
      .then(r => r.json().catch(() => null).then(data => {
        if (!r.ok || !data || !data.reply) throw new Error((data && r.status === 429 && data.error) || '');
        return data;
      }))
      .then(data => {
        typing.remove();
        state.messages.push({ role: 'assistant', content: data.reply });
        save();
        addBubble('assistant', data.reply);
        if (data.askLead || typedPhone) showLeadForm(normalizePhone(typedPhone));
      })
      .catch(err => {
        typing.remove();
        addHandoff(err.message || 'Em xin lỗi, em đang bị gián đoạn một chút. Anh/chị thử lại sau ít giây, hoặc');
        if (typedPhone) showLeadForm(normalizePhone(typedPhone));
      })
      .finally(() => {
        asking = false;
        sendBtn.disabled = false;
      });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value;
    if (!text.trim() || asking) return;
    input.value = '';
    input.style.height = '';
    ask(text);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
  input.addEventListener('input', () => {
    input.style.height = '';
    input.style.height = Math.min(input.scrollHeight, 96) + 'px';
  });

  /* ── Mở / đóng ───────────────────────────────────────── */
  let rendered = false;
  function render() {
    if (rendered) return;
    rendered = true;
    addBubble('assistant', GREETING);
    state.messages.forEach(m => addBubble(m.role, m.content));
    if (!state.messages.length) {
      const chips = el('div', 'ndchat__chips');
      SUGGESTIONS.forEach(s => {
        const c = el('button', 'ndchat__chip', s);
        c.type = 'button';
        c.addEventListener('click', () => ask(s));
        chips.appendChild(c);
      });
      log.appendChild(chips);
    }
    if (state.leadDone) panel.querySelector('.ndchat__action--lead').hidden = true;
    else if (state.leadShown) showLeadForm();
  }

  function setOpen(open, focus) {
    state.open = open;
    save();
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('ndchat-open', open);
    if (open) {
      render();
      scrollDown();
      /* Trên điện thoại không tự focus để bàn phím khỏi che khung chat */
      if (focus && window.matchMedia('(min-width: 721px)').matches) input.focus();
    } else if (focus) {
      launcher.focus();
    }
  }

  launcher.addEventListener('click', () => setOpen(true, true));
  panel.querySelector('.ndchat__close').addEventListener('click', () => setOpen(false, true));
  panel.querySelector('.ndchat__action--lead').addEventListener('click', () => showLeadForm());
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false, true); });

  if (state.open) setOpen(true, false);
})();
