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
      'STORY BIBLE INDEXED',
      'CRITIQUE ENGINE: ONLINE',
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

  /* ---------- hero instrument canvas (waveform + nodes + scan) ---------- */
  const canvas = $('#heroCanvas');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, nodes, raf, running = true, t = 0;
    const LINK = 160;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.parentElement.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(40, Math.round(w * h / 42000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
        amber: Math.random() < 0.16
      }));
    };

    const waveform = () => {
      const my = h * 0.66, amp = Math.min(80, h * 0.11);
      // baseline + ticks
      ctx.strokeStyle = 'rgba(225,6,0,.16)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, my); ctx.lineTo(w, my); ctx.stroke();
      ctx.strokeStyle = 'rgba(225,6,0,.22)';
      for (let x = 0; x < w; x += 32) {
        const maj = x % 128 === 0;
        ctx.beginPath(); ctx.moveTo(x, my); ctx.lineTo(x, my + (maj ? 9 : 5)); ctx.stroke();
      }
      // two superimposed sine traces
      const trace = (phase, freq, a, col, lw) => {
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const y = my + Math.sin(x * freq + phase) * a * Math.sin(x * 0.0016 + phase * 0.5);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      };
      trace(t * 0.9, 0.012, amp, 'rgba(225,6,0,.5)', 1.6);
      trace(-t * 0.6 + 2, 0.018, amp * 0.6, 'rgba(255,176,0,.34)', 1.2);
      // sample markers riding the main trace
      ctx.fillStyle = 'rgba(255,45,24,.9)';
      for (let x = 0; x <= w; x += 96) {
        const y = my + Math.sin(x * 0.012 + t * 0.9) * amp * Math.sin(x * 0.0016 + t * 0.45);
        ctx.fillRect(x - 1.8, y - 1.8, 3.6, 3.6);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      waveform();
      // drifting node graph
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(225,6,0,${(1 - d / LINK) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      for (const n of nodes) {
        ctx.fillStyle = n.amber ? 'rgba(255,176,0,.8)' : 'rgba(255,45,24,.6)';
        ctx.fillRect(n.x - 1.5, n.y - 1.5, 3, 3);
        if (n.amber) { ctx.strokeStyle = 'rgba(255,176,0,.3)'; ctx.lineWidth = 1; ctx.strokeRect(n.x - 4, n.y - 4, 8, 8); }
      }
      // vertical scan sweep
      const sx = ((t * 0.6) % (w + 200)) - 100;
      const g = ctx.createLinearGradient(sx - 60, 0, sx + 60, 0);
      g.addColorStop(0, 'rgba(225,6,0,0)'); g.addColorStop(0.5, 'rgba(225,6,0,.06)'); g.addColorStop(1, 'rgba(225,6,0,0)');
      ctx.fillStyle = g; ctx.fillRect(sx - 60, 0, 120, h);
      ctx.strokeStyle = 'rgba(255,45,24,.28)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, h); ctx.stroke();

      t += 1;
      if (running) raf = requestAnimationFrame(draw);
    };

    build(); draw();
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(draw); else cancelAnimationFrame(raf);
    });
  }

  /* ---------- procedural HUD graphics (rulers, core radar, schematic) ---------- */
  const mulberry32 = a => () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let x = Math.imul(a ^ a >>> 15, 1 | a);
    x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  };
  const NS = 'http://www.w3.org/2000/svg';
  const polar = (cx, cy, r, deg) => {
    const a = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const buildRuler = svg => {
    const wpx = Math.round(svg.getBoundingClientRect().width) || 260;
    const gap = 16, n = Math.floor(wpx / gap), step = +svg.dataset.step || 10, start = +svg.dataset.start || 0;
    svg.setAttribute('viewBox', `0 0 ${wpx} 24`);
    svg.setAttribute('preserveAspectRatio', 'xMinYMid meet');
    let s = `<line x1="0" y1="22" x2="${wpx}" y2="22"/>`;
    for (let i = 0; i <= n; i++) {
      const x = i * gap, maj = i % 5 === 0;
      s += `<line ${maj ? 'class="ruler__maj" ' : ''}x1="${x}" y1="22" x2="${x}" y2="${maj ? 11 : 16}"/>`;
      if (maj) s += `<text x="${x + 2}" y="8">${String(start + i * step).padStart(3, '0')}</text>`;
    }
    svg.innerHTML = s;
  };

  const buildCore = svg => {
    const cx = 180, cy = 180, R = 168;
    let s = '';
    // concentric rings
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#e10600" stroke-opacity=".45" stroke-width="1"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="150" fill="none" stroke="#5e0b07" stroke-width="1"/>`;
    s += `<g class="core__ring--spin"><circle cx="${cx}" cy="${cy}" r="126" fill="none" stroke="#e10600" stroke-opacity=".4" stroke-width="1" stroke-dasharray="3 8"/></g>`;
    s += `<circle cx="${cx}" cy="${cy}" r="92" fill="none" stroke="#5e0b07" stroke-width="1" stroke-dasharray="2 5"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="60" fill="none" stroke="#3a3a42" stroke-width="1"/>`;
    // radial ticks + numbers
    let ticks = '', nums = '';
    for (let i = 0; i < 72; i++) {
      const deg = i * 5, maj = i % 6 === 0;
      const [x1, y1] = polar(cx, cy, R, deg);
      const [x2, y2] = polar(cx, cy, R - (maj ? 12 : 6), deg);
      ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${maj ? '#e10600' : '#5e0b07'}" stroke-width="1"/>`;
      if (maj) { const [nx, ny] = polar(cx, cy, 138, deg); nums += `<text x="${nx.toFixed(1)}" y="${(ny + 3).toFixed(1)}" text-anchor="middle" fill="#ffb000" fill-opacity=".7" font-family="'Share Tech Mono',monospace" font-size="8">${String(deg).padStart(3, '0')}</text>`; }
    }
    s += ticks + nums;
    // triangle + spokes + nodes
    const verts = [polar(cx, cy, 104, 0), polar(cx, cy, 104, 120), polar(cx, cy, 104, 240)];
    s += `<path d="M${verts[0][0].toFixed(1)} ${verts[0][1].toFixed(1)} L${verts[1][0].toFixed(1)} ${verts[1][1].toFixed(1)} L${verts[2][0].toFixed(1)} ${verts[2][1].toFixed(1)} Z" fill="none" stroke="#e10600" stroke-width="1.3"/>`;
    verts.forEach(v => s += `<line x1="${cx}" y1="${cy}" x2="${v[0].toFixed(1)}" y2="${v[1].toFixed(1)}" stroke="#e10600" stroke-opacity=".5" stroke-width="1" stroke-dasharray="3 3"/>`);
    // sweep wedge (animated)
    const [sxA, syA] = polar(cx, cy, R, -13), [sxB, syB] = polar(cx, cy, R, 13);
    s += `<g class="core__sweep"><path d="M${cx} ${cy} L${sxA.toFixed(1)} ${syA.toFixed(1)} A${R} ${R} 0 0 1 ${sxB.toFixed(1)} ${syB.toFixed(1)} Z" fill="#e10600" fill-opacity=".12"/><line x1="${cx}" y1="${cy}" x2="${polar(cx, cy, R, 0)[0].toFixed(1)}" y2="${polar(cx, cy, R, 0)[1].toFixed(1)}" stroke="#ff2d18" stroke-width="1.4"/></g>`;
    // core nodes (muses)
    const muses = [['CALLIOPE', 'PROSE'], ['MELPOMENE', 'DRAMA'], ['CLIO', 'LORE']];
    verts.forEach((v, i) => {
      const out = polar(cx, cy, 150, i * 120);
      s += `<circle cx="${v[0].toFixed(1)}" cy="${v[1].toFixed(1)}" r="5" fill="#0a0608" stroke="#ffb000" stroke-width="1.4"/><circle cx="${v[0].toFixed(1)}" cy="${v[1].toFixed(1)}" r="1.8" fill="#ffb000"/>`;
      const bx = Math.max(34, Math.min(326, out[0])), by = out[1];
      s += `<g font-family="'Share Tech Mono',monospace"><rect x="${(bx - 34).toFixed(1)}" y="${(by - 13).toFixed(1)}" width="68" height="26" fill="#0a0608" stroke="#ffb000" stroke-opacity=".7" stroke-width="1"/><text x="${bx.toFixed(1)}" y="${(by - 1).toFixed(1)}" text-anchor="middle" fill="#ffb000" font-size="8.5">${muses[i][0]}</text><text x="${bx.toFixed(1)}" y="${(by + 9).toFixed(1)}" text-anchor="middle" fill="#8a8a93" font-size="6.5">${muses[i][1]}</text></g>`;
    });
    // central core
    s += `<polygon points="${cx},${cy - 13} ${cx + 12},${cy + 9} ${cx - 12},${cy + 9}" fill="#ffb000"/><text x="${cx}" y="${cy + 6}" text-anchor="middle" font-family="'Share Tech Mono',monospace" fill="#0a0608" font-size="8">01</text>`;
    svg.innerHTML = s;
  };

  const buildSchematic = svg => {
    const W = 1440, H = 220, rnd = mulberry32(7);
    const cols = [110, 270, 430, 590, 750, 910, 1070, 1230, 1350];
    const nodes = [];
    cols.forEach((x, ci) => {
      const count = 2 + Math.floor(rnd() * 3);
      for (let k = 0; k < count; k++)
        nodes.push({ x, y: 38 + (k + 0.5) * (H - 86) / count + (rnd() - 0.5) * 20, ci, amber: rnd() < 0.13 });
    });
    let paths = '', marks = '';
    nodes.forEach(n => {
      const nexts = nodes.filter(m => m.ci === n.ci + 1);
      if (!nexts.length) return;
      const links = rnd() < 0.3 ? 2 : 1;
      for (let l = 0; l < links && l < nexts.length; l++) {
        const t = nexts[Math.floor(rnd() * nexts.length)], mx = (n.x + t.x) / 2;
        const hot = n.amber || t.amber;
        paths += `<path${rnd() < 0.4 ? ' class="schematic__flow"' : ''} d="M${n.x} ${n.y.toFixed(1)} H${mx} V${t.y.toFixed(1)} H${t.x}" fill="none" stroke="${hot ? '#ffb000' : '#e10600'}" stroke-width="1" opacity="${hot ? .5 : .26}"/>`;
      }
    });
    nodes.forEach(n => {
      if (n.amber) {
        marks += `<rect x="${n.x - 5}" y="${(n.y - 5).toFixed(1)}" width="10" height="10" fill="none" stroke="#ffb000" stroke-width="1"/><rect x="${n.x - 2}" y="${(n.y - 2).toFixed(1)}" width="4" height="4" fill="#ffb000"/>`;
        marks += `<text x="${n.x + 9}" y="${(n.y + 3).toFixed(1)}" fill="#ffb000" fill-opacity=".75" font-family="'Share Tech Mono',monospace" font-size="8">N.${String(Math.floor(rnd() * 900 + 100))}</text>`;
      } else marks += `<rect x="${n.x - 2.5}" y="${(n.y - 2.5).toFixed(1)}" width="5" height="5" fill="#e10600" opacity=".65"/>`;
    });
    let ruler = '<g>';
    for (let x = 40; x < W; x += 24) {
      const maj = (x - 40) % 120 === 0;
      ruler += `<line x1="${x}" y1="206" x2="${x}" y2="${maj ? 196 : 201}" stroke="#3a3a42" stroke-width="1"/>`;
      if (maj) ruler += `<text x="${x + 2}" y="190" fill="#5a5a63" font-family="'Share Tech Mono',monospace" font-size="7">${String(x).padStart(4, '0')}</text>`;
    }
    ruler += '</g>';
    svg.innerHTML = paths + marks + ruler;
  };

  const coreSvg = $('#coreSvg'); if (coreSvg) buildCore(coreSvg);
  const schSvg = $('#schematicSvg'); if (schSvg) buildSchematic(schSvg);
  const rulers = $$('.ruler'); rulers.forEach(buildRuler);
  let rrt; window.addEventListener('resize', () => { clearTimeout(rrt); rrt = setTimeout(() => rulers.forEach(buildRuler), 200); });

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
