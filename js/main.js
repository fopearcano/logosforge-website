/* ============================================================
   LOGOSFORGE — Narrative OS  ·  interaction layer
   ============================================================ */
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- live clock (HUD bar) ---------- */
  const clock = $('#clock');
  if (clock) {
    const pad = n => String(n).padStart(2, '0');
    const tick = () => {
      const d = new Date();
      clock.innerHTML =
        `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}&nbsp;` +
        `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- boot sequence typing ---------- */
  const bootEl = $('#bootLine');
  if (bootEl && !reduceMotion) {
    const lines = [
      'INITIALIZING FORGE CORE',
      'LOADING NARRATIVE ENGINES [5]',
      'INLINE AI CO-WRITER ONLINE',
      'STORY BIBLE SYNCED',
      'MAGI CRITIQUE: NOMINAL',
      'FORGE READY'
    ];
    let li = 0, ci = 0, deleting = false;
    const type = () => {
      const word = lines[li];
      bootEl.textContent = word.slice(0, ci);
      if (!deleting) {
        if (ci < word.length) { ci++; setTimeout(type, 38); }
        else { deleting = true; setTimeout(type, 1900); }
      } else {
        if (ci > 0) { ci--; setTimeout(type, 18); }
        else { deleting = false; li = (li + 1) % lines.length; setTimeout(type, 260); }
      }
    };
    type();
  }

  /* ---------- nav scrolled state ---------- */
  const nav = $('#nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- dropdown menus ---------- */
  const menuItems = $$('.menu__item.has-sub');
  const isMobile = () => window.innerWidth <= 1080;

  const closeAll = except => menuItems.forEach(it => {
    if (it !== except) { it.classList.remove('open'); it.querySelector('.menu__link')?.setAttribute('aria-expanded', 'false'); }
  });

  // Click-to-open dropdowns: robust across desktop, touch and keyboard, and
  // immune to the hover/click conflict and the button↔submenu gap problem.
  menuItems.forEach(item => {
    const link = item.querySelector('.menu__link');
    link.addEventListener('click', e => {
      e.preventDefault();
      const open = item.classList.toggle('open');
      link.setAttribute('aria-expanded', String(open));
      closeAll(item);
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.menu__item.has-sub')) closeAll(null);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeAll(null); closeMenu(); } });

  /* ---------- mobile drawer ---------- */
  const hamburger = $('#hamburger');
  const menu = $('#menu');
  const openMenu = () => { menu.classList.add('open'); hamburger.setAttribute('aria-expanded', 'true'); document.body.classList.add('menu-open'); };
  const closeMenu = () => { menu.classList.remove('open'); hamburger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); closeAll(null); };
  hamburger?.addEventListener('click', () => menu.classList.contains('open') ? closeMenu() : openMenu());
  $$('.submenu__link, .menu__item:not(.has-sub) .menu__link').forEach(a =>
    a.addEventListener('click', () => { closeAll(null); if (isMobile()) closeMenu(); }));
  window.addEventListener('resize', () => { if (!isMobile()) closeMenu(); });

  /* ---------- scroll reveal + counters ---------- */
  const revealTargets = $$([
    '.sec-head', '.feat', '.mode', '.priority', '.price',
    '.dl-block', '.dl-note', '.about__main', '.about__side'
  ].join(','));
  revealTargets.forEach((el, i) => {
    el.classList.add('reveal');
    if (el.style.getPropertyValue('--i')) el.setAttribute('data-stagger', '');
  });

  const animateCount = el => {
    const target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = target; return; }
    const dur = 1100, t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        $$('[data-count]', en.target).forEach(animateCount);
        obs.unobserve(en.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach(el => io.observe(el));
    // counters that sit outside reveal targets
    $$('[data-count]').forEach(el => { if (!el.closest('.reveal')) io.observe(el.parentElement); });
  } else {
    revealTargets.forEach(el => el.classList.add('in'));
    $$('[data-count]').forEach(animateCount);
  }

  /* ---------- hero constellation canvas ---------- */
  const canvas = $('#heroCanvas');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, nodes, raf, running = true;
    const LINK = 150;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.parentElement.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(64, Math.round(w * h / 22000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.26, vy: (Math.random() - 0.5) * 0.26,
        amber: Math.random() < 0.14
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const al = (1 - d / LINK) * 0.32;
            ctx.strokeStyle = `rgba(225,6,0,${al})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      // node markers (small Eva-style squares)
      for (const n of nodes) {
        ctx.fillStyle = n.amber ? 'rgba(255,176,0,.85)' : 'rgba(255,45,24,.7)';
        ctx.fillRect(n.x - 1.6, n.y - 1.6, 3.2, 3.2);
        if (n.amber) { ctx.strokeStyle = 'rgba(255,176,0,.35)'; ctx.lineWidth = 1; ctx.strokeRect(n.x - 4, n.y - 4, 8, 8); }
      }
      if (running) raf = requestAnimationFrame(draw);
    };

    build();
    draw();
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) { raf = requestAnimationFrame(draw); } else { cancelAnimationFrame(raf); }
    });
  }

  /* ---------- active section in nav (subtle) ---------- */
  const sections = $$('main section[id]');
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const id = en.target.id;
        $$('.menu__link, .submenu__link').forEach(l => {
          const href = l.getAttribute('href');
          l.classList.toggle('active', href === `#${id}`);
        });
      });
    }, { threshold: 0.5 });
    sections.forEach(s => spy.observe(s));
  }
})();
