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

  /* ---------- static triple-core diagram (About) ---------- */
  const polar = (cx, cy, r, deg) => { const a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const coreSvg = $('#coreSvg');
  if (coreSvg) {
    const cx = 180, cy = 180, R = 168;
    let s = '';
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#e8120a" stroke-opacity=".45" stroke-width="1"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="150" fill="none" stroke="#4e0a08" stroke-width="1"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="126" fill="none" stroke="#e8120a" stroke-opacity=".4" stroke-width="1" stroke-dasharray="3 8"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="92" fill="none" stroke="#4e0a08" stroke-width="1" stroke-dasharray="2 5"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="60" fill="none" stroke="#3a3f52" stroke-width="1"/>`;
    for (let i = 0; i < 72; i++) {
      const deg = i * 5, maj = i % 6 === 0;
      const [x1, y1] = polar(cx, cy, R, deg);
      const [x2, y2] = polar(cx, cy, R - (maj ? 12 : 6), deg);
      s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${maj ? '#e8120a' : '#4e0a08'}" stroke-width="1"/>`;
      if (maj) { const [nx, ny] = polar(cx, cy, 138, deg); s += `<text x="${nx.toFixed(1)}" y="${(ny + 3).toFixed(1)}" text-anchor="middle" fill="#ffb300" fill-opacity=".7" font-family="'Share Tech Mono',monospace" font-size="8">${String(deg).padStart(3, '0')}</text>`; }
    }
    const verts = [polar(cx, cy, 104, 0), polar(cx, cy, 104, 120), polar(cx, cy, 104, 240)];
    s += `<path d="M${verts[0][0].toFixed(1)} ${verts[0][1].toFixed(1)} L${verts[1][0].toFixed(1)} ${verts[1][1].toFixed(1)} L${verts[2][0].toFixed(1)} ${verts[2][1].toFixed(1)} Z" fill="none" stroke="#e8120a" stroke-width="1.3"/>`;
    verts.forEach(v => s += `<line x1="${cx}" y1="${cy}" x2="${v[0].toFixed(1)}" y2="${v[1].toFixed(1)}" stroke="#e8120a" stroke-opacity=".5" stroke-width="1" stroke-dasharray="3 3"/>`);
    const muses = [['CALLIOPE', 'PROSE'], ['MELPOMENE', 'DRAMA'], ['CLIO', 'LORE']];
    verts.forEach((v, i) => {
      const out = polar(cx, cy, 150, i * 120);
      s += `<circle cx="${v[0].toFixed(1)}" cy="${v[1].toFixed(1)}" r="5" fill="#0a0608" stroke="#ffb300" stroke-width="1.4"/><circle cx="${v[0].toFixed(1)}" cy="${v[1].toFixed(1)}" r="1.8" fill="#ffb300"/>`;
      const bx = Math.max(34, Math.min(326, out[0])), by = out[1];
      s += `<g font-family="'Share Tech Mono',monospace"><rect x="${(bx - 34).toFixed(1)}" y="${(by - 13).toFixed(1)}" width="68" height="26" fill="#0a0608" stroke="#ffb300" stroke-opacity=".7" stroke-width="1"/><text x="${bx.toFixed(1)}" y="${(by - 1).toFixed(1)}" text-anchor="middle" fill="#ffb300" font-size="8.5">${muses[i][0]}</text><text x="${bx.toFixed(1)}" y="${(by + 9).toFixed(1)}" text-anchor="middle" fill="#8a8a93" font-size="6.5">${muses[i][1]}</text></g>`;
    });
    s += `<polygon points="${cx},${cy - 13} ${cx + 12},${cy + 9} ${cx - 12},${cy + 9}" fill="#ffb300"/><text x="${cx}" y="${cy + 6}" text-anchor="middle" font-family="'Share Tech Mono',monospace" fill="#0a0608" font-size="8">01</text>`;
    coreSvg.innerHTML = s;
  }
})();
