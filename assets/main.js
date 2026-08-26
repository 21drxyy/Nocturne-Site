/* Nocturne - landing page behaviour.
   No dependencies, no build step. Everything degrades to a readable static page
   if this file never loads.                                                     */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -- sticky nav ---------------------------------------------------------- */

  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('stuck', window.scrollY > 12);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  }

  /* -- scroll reveals ------------------------------------------------------ */

  const revealables = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // Small stagger so a row of cards arrives in sequence rather than as a block.
        setTimeout(() => entry.target.classList.add('is-visible'), i * 70);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(el => io.observe(el));
  }

  /* -- hero demo ----------------------------------------------------------- */
  /* A miniature of the real application. Deliberately synthetic: a screenshot
     would publish whichever processes happened to be running on the author's
     machine, which is nobody's business.                                       */

  const METRICS = [
    { key: 'cpu',  label: 'Processor', unit: '%',    colour: 'var(--cpu)',  base: 38, swing: 15, fixed: true  },
    { key: 'gpu',  label: 'Graphics',  unit: '%',    colour: 'var(--gpu)',  base: 71, swing: 12, fixed: true  },
    { key: 'mem',  label: 'Memory',    unit: '%',    colour: 'var(--mem)',  base: 47, swing: 3,  fixed: true  },
    { key: 'disk', label: 'Disk',      unit: 'MB/s', colour: 'var(--disk)', base: 12, swing: 22, fixed: false },
    { key: 'net',  label: 'Network',   unit: 'KB/s', colour: 'var(--net)',  base: 96, swing: 90, fixed: false },
  ];

  const PROCS = [
    ['Helldivers2', 46, 61],
    ['chrome',      9,  14],
    ['Discord',     4,  7 ],
    ['steam',       2,  1 ],
    ['OBS',         3,  3 ],
  ];

  const HISTORY = 46;
  const rowsHost = document.getElementById('demoRows');
  const procHost = document.getElementById('demoProc');

  // Deterministic noise, so the demo looks organic without ever producing a
  // pathological spike on someone's first visit.
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const series = {};

  function buildRows() {
    if (!rowsHost) return;

    METRICS.forEach(m => {
      series[m.key] = Array.from({ length: HISTORY }, () => m.base);

      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML =
        `<span class="row-label">${m.label}</span>` +
        `<span class="row-value" data-v="${m.key}">-</span>` +
        `<svg viewBox="0 0 240 26" preserveAspectRatio="none">` +
          `<path data-fill="${m.key}" fill="${m.colour}" opacity=".15"></path>` +
          `<path data-line="${m.key}" fill="none" stroke="${m.colour}" stroke-width="1.4" stroke-linejoin="round"></path>` +
        `</svg>`;
      rowsHost.appendChild(row);
    });
  }

  function buildProcs() {
    if (!procHost) return;
    procHost.innerHTML = PROCS
      .map(([name, cpu, gpu]) => `<div class="proc-row"><span>${name}</span><span>${cpu}%</span><span>${gpu}% gpu</span></div>`)
      .join('');
  }

  function step() {
    METRICS.forEach(m => {
      const arr = series[m.key];
      let v = arr[arr.length - 1] + (rand() - 0.5) * m.swing;
      // Pull gently back toward the baseline so the line wanders without drifting
      // off to a rail and staying there.
      v += (m.base - v) * 0.06;
      v = Math.max(m.fixed ? 1 : 0, m.fixed ? Math.min(99, v) : v);
      arr.push(v);
      arr.shift();
    });
  }

  function paint() {
    METRICS.forEach(m => {
      const arr = series[m.key];
      const lo = Math.min(...arr);
      const hi = Math.max(...arr);

      // Percentages are drawn against a true 0-100 axis; unbounded rates fit
      // themselves. Same rule the application uses.
      const min = m.fixed ? 0 : lo;
      const span = (m.fixed ? 100 : hi - lo) || 1;

      const stepX = 240 / (arr.length - 1);
      let d = '';
      arr.forEach((val, i) => {
        const x = i * stepX;
        const y = 24 - ((val - min) / span) * 22;
        d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
      });

      const line = rowsHost.querySelector(`[data-line="${m.key}"]`);
      const fill = rowsHost.querySelector(`[data-fill="${m.key}"]`);
      const out  = rowsHost.querySelector(`[data-v="${m.key}"]`);
      if (line) line.setAttribute('d', d);
      if (fill) fill.setAttribute('d', d + `L240,26L0,26Z`);

      const now = arr[arr.length - 1];
      if (out) out.textContent = m.unit === '%'
        ? `${now.toFixed(0)} %`
        : `${now.toFixed(now < 10 ? 1 : 0)} ${m.unit}`;
    });
  }

  const OVERLAY_KEYS = { gpu: 'gpu', cpu: 'cpu', ram: 'mem' };
  function paintOverlay() {
    document.querySelectorAll('.ov-v').forEach(el => {
      const key = OVERLAY_KEYS[el.dataset.ov];
      const arr = series[key];
      if (arr) el.textContent = `${arr[arr.length - 1].toFixed(0)}%`;
    });
  }

  if (rowsHost) {
    buildRows();
    buildProcs();
    // Warm the buffers so the first paint shows a history rather than a flat line.
    for (let i = 0; i < HISTORY; i++) step();
    paint();
    paintOverlay();

    if (!reduceMotion) {
      let timer = null;
      const tick = () => { step(); paint(); paintOverlay(); };

      // Only animate while the demo is actually on screen, and never in a
      // background tab.
      const start = () => { if (!timer) timer = setInterval(tick, 900); };
      const stop  = () => { clearInterval(timer); timer = null; };

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => e.isIntersecting ? start() : stop(), { threshold: 0.15 })
          .observe(rowsHost.closest('.hero-demo') || rowsHost);
      } else {
        start();
      }

      document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    }
  }

  /* -- count-up on the hero facts ------------------------------------------ */

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const nums = document.querySelectorAll('.facts .num[data-count]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const decimals = (el.dataset.count.split('.')[1] || '').length;
        const started = performance.now();

        const frame = (now) => {
          const t = Math.min(1, (now - started) / 900);
          // Ease-out so it decelerates into the final value.
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = (target * eased).toFixed(decimals);
          if (t < 1) requestAnimationFrame(frame);
          else el.textContent = target.toFixed(decimals);
        };

        requestAnimationFrame(frame);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });

    nums.forEach(el => io.observe(el));
  }
})();
