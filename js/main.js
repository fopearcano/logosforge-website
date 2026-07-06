/* ============================================================
   LOGOSFORGE — interaction layer (minimal)
   ============================================================ */
(() => {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- nav scrolled state ---------- */
  const nav = $('#nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- dropdown menus (click to open) ---------- */
  const menuItems = $$('.menu__item.has-sub');
  const isMobile = () => window.innerWidth <= 1080;
  const closeAll = except => menuItems.forEach(it => {
    if (it !== except) { it.classList.remove('open'); it.querySelector('.menu__link')?.setAttribute('aria-expanded', 'false'); }
  });
  menuItems.forEach(item => {
    const link = item.querySelector('.menu__link');
    link.addEventListener('click', e => {
      e.preventDefault();
      const open = item.classList.toggle('open');
      link.setAttribute('aria-expanded', String(open));
      closeAll(item);
    });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.menu__item.has-sub')) closeAll(null); });

  /* ---------- mobile drawer ---------- */
  const hamburger = $('#hamburger');
  const menu = $('#menu');
  const openMenu  = () => { menu.classList.add('open');    hamburger.setAttribute('aria-expanded', 'true');  document.body.classList.add('menu-open'); };
  const closeMenu = () => { menu.classList.remove('open'); hamburger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); closeAll(null); };
  hamburger?.addEventListener('click', () => menu.classList.contains('open') ? closeMenu() : openMenu());
  $$('.submenu__link, .menu__item:not(.has-sub) .menu__link').forEach(a =>
    a.addEventListener('click', () => { closeAll(null); if (isMobile()) closeMenu(); }));
  window.addEventListener('resize', () => { if (!isMobile()) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeAll(null); closeMenu(); } });

  /* ---------- legal modals (floating windows) ---------- */
  $$('[data-dialog]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dlg = document.getElementById(btn.dataset.dialog);
      if (dlg && dlg.showModal) { dlg.showModal(); document.body.classList.add('modal-open'); }
    });
  });
  $$('.modal').forEach(dlg => {
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });   // click outside box
    dlg.querySelector('[data-close]')?.addEventListener('click', () => dlg.close());
    dlg.addEventListener('close', () => document.body.classList.remove('modal-open'));
  });

  /* ---------- screenshot lightbox (uses the shared .modal handlers above) ---------- */
  const lightbox = $('#lightbox');
  if (lightbox) {
    const lbImg = $('#lightbox-img');
    $$('[data-shot]').forEach(btn => btn.addEventListener('click', () => {
      if (lbImg) lbImg.setAttribute('src', btn.dataset.shot);
      if (lightbox.showModal) { lightbox.showModal(); document.body.classList.add('modal-open'); }
    }));
    lbImg?.addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('close', () => { if (lbImg) lbImg.setAttribute('src', ''); });
  }

  /* ---------- pricing billing toggle (one-time / monthly / yearly) ---------- */
  const bill = $('#bill');
  if (bill) {
    const opts = $$('.bill-toggle__opt', bill);
    const apply = mode => {
      $$('[data-' + mode + ']').forEach(el => {
        const v = el.getAttribute('data-' + mode);
        if (v === null) return;
        if (el.hasAttribute('data-cta')) {
          const label = el.querySelector('.btn__label'); if (label) label.textContent = v;
          const href = el.getAttribute('data-href-' + mode); if (href) el.setAttribute('href', href);
        } else {
          el.textContent = v;
        }
      });
    };
    opts.forEach(o => o.addEventListener('click', () => {
      opts.forEach(x => x.classList.toggle('is-active', x === o));
      apply(o.dataset.bill);
    }));
  }

  /* ---------- newsletter sign-up (client-side stub) ---------- */
  const nl = $('#newsletter');
  if (nl) {
    nl.addEventListener('submit', e => {
      e.preventDefault();
      const email = $('#nl-email'), msg = $('#nl-msg');
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      if (!valid) { msg.style.color = 'var(--red-bright)'; msg.textContent = '✕ Enter a valid email address.'; return; }
      msg.style.color = 'var(--amber)'; msg.textContent = '✓ Subscribed — check your inbox to confirm.';
      email.value = ''; email.disabled = true;
      nl.querySelector('.newsletter__btn').disabled = true;
    });
  }
})();
