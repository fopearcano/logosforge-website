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
})();
