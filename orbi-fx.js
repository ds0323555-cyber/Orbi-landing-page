/* ============================================================
   ORBI SELLER â Premium FX
   custom cursor Â· parallax Â· card glow Â· seller counter Â·
   CTA ripple Â· live cockpit numbers
   ============================================================ */
(function () {
  'use strict';
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1 Â· Custom cursor with soft trailing ring ---------- */
  if (fine && !reduce) {
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    dot.style.opacity = ring.style.opacity = '0';
    document.body.appendChild(dot); document.body.appendChild(ring);
    document.body.classList.add('has-cursor');

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let shown = false;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      if (!shown) { shown = true; dot.style.opacity = ring.style.opacity = '1'; }
    });
    window.addEventListener('mousedown', () => ring.classList.add('down'));
    window.addEventListener('mouseup', () => ring.classList.remove('down'));
    document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = '0'; shown = false; });

    // ring lags behind for a trail feel
    (function follow() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(follow);
    })();

    // grow ring over interactive elements
    const hot = 'a, button, .btn, .faq-q, .card-hoverable, .ck-ricon, input';
    document.querySelectorAll(hot).forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('hot'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hot'));
    });
  }

  /* ---------- 2 Â· Hero grid parallax ---------- */
  const grid = document.querySelector('.tech-grid');
  if (grid && !reduce) {
    let ticking = false;
    const apply = () => {
      grid.style.transform = 'translate3d(0,' + (window.scrollY * 0.16) + 'px,0)';
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
    apply();
  }

  /* ---------- 3 Â· Mouse-following glow inside feature cards ---------- */
  if (!reduce) {
    document.querySelectorAll('.appmock').forEach((card) => {
      const glow = card.querySelector('.card-glow');
      if (!glow) return;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        glow.style.setProperty('--gx', (e.clientX - r.left) + 'px');
        glow.style.setProperty('--gy', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- 4 Â· Seller proof counter ---------- */
  const seller = document.getElementById('sellerCount');
  if (seller) {
    const fmt = (n) => Math.round(n).toLocaleString('pt-BR');
    let val = 2000;
    const target = 2147;
    if (reduce) {
      seller.textContent = fmt(target);
    } else {
      // count up once, then tick slowly to feel live
      const start = performance.now();
      const dur = 1400;
      function up(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        seller.textContent = fmt(2000 + (target - 2000) * eased);
        if (p < 1) requestAnimationFrame(up);
        else { val = target; live(); }
      }
      function live() {
        setTimeout(() => {
          val += Math.floor(Math.random() * 3) + 1;
          seller.textContent = fmt(val);
          seller.style.transition = 'color 200ms ease';
          seller.style.color = '#a5a8ff';
          setTimeout(() => { seller.style.color = '#fff'; }, 260);
          live();
        }, 3500 + Math.random() * 4000);
      }
      requestAnimationFrame(up);
    }
  }

  /* ---------- 6 Â· CTA ripple + delayed navigation ---------- */
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (reduce) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2.2;
      const rip = document.createElement('span');
      rip.className = 'ripple';
      rip.style.width = rip.style.height = size + 'px';
      rip.style.left = (e.clientX - r.left) + 'px';
      rip.style.top = (e.clientY - r.top) + 'px';
      btn.appendChild(rip);
      setTimeout(() => rip.remove(), 650);

      // let the wave play before following an in-page anchor
      const href = btn.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        setTimeout(() => {
          const tgt = document.querySelector(href);
          if (tgt) {
            const top = tgt.getBoundingClientRect().top + window.scrollY - 60;
            window.scrollTo({ top: top, behavior: 'smooth' });
          }
        }, 340);
      }
    });
  });

  /* ---------- 7 Â· Live cockpit numbers (loop) ---------- */
  if (!reduce) {
    const fatEl = document.querySelector('[data-live="fat"]');
    const pedEl = document.querySelector('[data-live="ped"]');
    let fat = 184920, ped = 2318;
    const fmtBRL = (n) => 'R$ ' + Math.round(n).toLocaleString('pt-BR');
    const fmtInt = (n) => Math.round(n).toLocaleString('pt-BR');

    function bump(el, from, to, fmt, dur) {
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(from + (to - from) * eased);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = fmt(to);
      }
      requestAnimationFrame(tick);
    }

    function loop() {
      setTimeout(() => {
        if (fatEl) { const nf = fat + Math.floor(Math.random() * 380) + 60; bump(fatEl, fat, nf, fmtBRL, 900); fat = nf; }
        if (pedEl && Math.random() > 0.35) { const np = ped + Math.floor(Math.random() * 3) + 1; bump(pedEl, ped, np, fmtInt, 700); ped = np; }
        loop();
      }, 2400 + Math.random() * 1800);
    }
    // start once the cockpit has had a moment to settle
    setTimeout(loop, 2600);
  }

  /* ---------- Demo video modal ---------- */
  (function demoModal() {
    const modal = document.getElementById('demoModal');
    const openBtn = document.getElementById('openDemo');
    if (!modal || !openBtn) return;
    const open = () => { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
    const close = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
    openBtn.addEventListener('click', open);
    modal.querySelectorAll('[data-close], #closeDemo').forEach((el) => el.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
  })();
})();
