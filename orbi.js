/* ============================================================
   ORBI SELLER â Interactions (rect-based, IO-free for portability)
   ============================================================ */
(function () {
  'use strict';

  /* ---- Nav scroll state ---- */
  const nav = document.querySelector('.nav');
  const onNav = () => {
    if (window.scrollY > 12) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onNav, { passive: true });
  onNav();

  /* ---- Stagger delays within groups (data-stagger="ms", default 80) ---- */
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    const step = parseInt(group.getAttribute('data-stagger'), 10) || 80;
    group.querySelectorAll(':scope > .reveal').forEach((el, i) => {
      el.style.transitionDelay = (i * step) + 'ms';
    });
  });

  /* ---- Hero intro sequence (runs on load) ---- */
  (function heroIntro() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const badge = hero.querySelector('.tag') ? hero.querySelector('.tag').closest('.reveal') : null;
    const h1 = hero.querySelector('.display');
    const subhead = hero.querySelector('.subhead');
    const cta = hero.querySelector('.hero-cta');
    const proof = hero.querySelector('.hero-proof');
    const mock = hero.querySelector('.hero-mock-wrap');

    // split the headline into per-word spans for the word-by-word rise
    let wordCount = 0;
    if (h1) {
      const words = h1.textContent.trim().split(/\s+/);
      wordCount = words.length;
      h1.innerHTML = words.map((w) => '<span class="word"><i>' + w + '</i></span>').join(' ');
    }

    if (reduce) { hero.classList.add('intro-done'); return; }

    // major-element delays (badge â headline â subhead â buttons â mock)
    const wordStep = 55;
    const h1Base = 140;                      // headline begins ~140ms after badge
    const afterWords = h1Base + wordCount * wordStep + 120;
    if (badge) badge.style.transitionDelay = '0ms';
    if (h1) h1.style.transitionDelay = h1Base + 'ms';
    if (subhead) subhead.style.transitionDelay = afterWords + 'ms';
    if (cta) cta.style.transitionDelay = (afterWords + 120) + 'ms';
    if (proof) proof.style.transitionDelay = (afterWords + 220) + 'ms';
    if (mock) mock.style.transitionDelay = (afterWords + 360) + 'ms';

    // per-word cascade
    if (h1) {
      h1.querySelectorAll('.word > i').forEach((wi, i) => {
        wi.style.transitionDelay = (h1Base + i * wordStep) + 'ms';
      });
    }

    // trigger on next frames so transitions register
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('intro-done')));
    // safety net
    setTimeout(() => hero.classList.add('intro-done'), 1200);
  })();

  /* ---- Animated counters ---- */
  const counted = new WeakSet();
  function runCounter(el) {
    if (counted.has(el)) return;
    counted.add(el);
    const target = parseFloat(el.getAttribute('data-count'));
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const dur = 1000;
    const start = performance.now();
    const fmt = (n) => prefix + n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(target);
    }
    requestAnimationFrame(tick);
  }

  /* ---- Cockpit bars ---- */
  let barsDone = false;
  function runBars() {
    if (barsDone) return;
    barsDone = true;
    document.querySelectorAll('.ck-bars .bar').forEach((b, i) => {
      const h = b.getAttribute('data-h') || '40';
      b.style.height = '6px';
      setTimeout(() => { b.style.transition = 'height 600ms cubic-bezier(.22,1,.36,1)'; b.style.height = h + '%'; }, i * 55);
    });
  }

  /* ---- Reveal on scroll (rect-based) â hero handled separately by intro ---- */
  const reveals = Array.from(document.querySelectorAll('.reveal')).filter((el) => !el.closest('.hero'));
  function reveal() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const trigger = vh * 0.92;
    for (let i = reveals.length - 1; i >= 0; i--) {
      const el = reveals[i];
      if (el.getBoundingClientRect().top < trigger) {
        el.classList.add('in');
        el.querySelectorAll('[data-count]').forEach(runCounter);
        if (el.querySelector('.ck-bars') || el.classList.contains('hero-mock-wrap')) runBars();
        reveals.splice(i, 1);
      }
    }
    // bare counters / bars not wrapped in a reveal
    document.querySelectorAll('[data-count]').forEach((el) => {
      if (el.getBoundingClientRect().top < trigger) runCounter(el);
    });
    const bars = document.querySelector('.ck-bars');
    if (bars && bars.getBoundingClientRect().top < trigger) runBars();
  }
  window.addEventListener('scroll', reveal, { passive: true });
  window.addEventListener('resize', reveal);
  reveal();
  // safety: ensure nothing ever stays hidden, even if metrics are odd
  setTimeout(reveal, 250);
  setTimeout(() => { reveals.slice().forEach((el) => { el.classList.add('in'); el.querySelectorAll('[data-count]').forEach(runCounter); }); }, 2500);

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((o) => {
        if (o !== item) { o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = '0px'; }
      });
      if (isOpen) { item.classList.remove('open'); a.style.maxHeight = '0px'; }
      else { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

  /* ---- Floating particles in hero ---- */
  (function particles() {
    const canvas = document.getElementById('heroParticles');
    if (!canvas) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let dots = [];

    function size() {
      const host = canvas.parentElement;
      w = host.offsetWidth;
      h = host.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(70, Math.round(w * h / 16000));
      dots = [];
      for (let i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.6 + 0.5,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18 - 0.05,
          a: Math.random() * 0.5 + 0.2,
          tw: Math.random() * Math.PI * 2,
          indigo: Math.random() > 0.55
        });
      }
    }

    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < -10) d.x = w + 10; if (d.x > w + 10) d.x = -10;
        if (d.y < -10) d.y = h + 10; if (d.y > h + 10) d.y = -10;
        const twinkle = 0.5 + 0.5 * Math.sin(t * 0.0012 + d.tw);
        const alpha = d.a * (0.45 + 0.55 * twinkle);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.indigo
          ? 'rgba(129, 132, 245, ' + alpha + ')'
          : 'rgba(255, 255, 255, ' + (alpha * 0.7) + ')';
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    let raf;
    size();
    window.addEventListener('resize', () => { dpr = Math.min(window.devicePixelRatio || 1, 2); size(); });
    if (reduce) {
      // draw a single static field
      for (const d of dots) {
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(129,132,245,' + d.a + ')'; ctx.fill();
      }
    } else {
      raf = requestAnimationFrame(frame);
    }
  })();
})();

/* ============================================================
   Toggle de período dos planos (Mensal / Trimestral / Anual)
   ============================================================ */
(function(){
  const toggle=document.querySelector('.plan-toggle');
  if(!toggle)return;
  function aplicar(periodo){
    document.querySelectorAll('.plan-toggle-btn').forEach(b=>b.classList.toggle('is-active',b.dataset.periodo===periodo));
    document.querySelectorAll('.pprice').forEach(el=>{const v=el.dataset['preco'+periodo.charAt(0).toUpperCase()+periodo.slice(1)];if(v)el.innerHTML=v;});
    document.querySelectorAll('.psub').forEach(el=>{const v=el.dataset['sub'+periodo.charAt(0).toUpperCase()+periodo.slice(1)];el.textContent=v||'';});
    document.querySelectorAll('.plan-cta').forEach(el=>{const v=el.dataset['link'+periodo.charAt(0).toUpperCase()+periodo.slice(1)];if(v)el.href=v;});
  }
  toggle.addEventListener('click',e=>{const btn=e.target.closest('.plan-toggle-btn');if(btn)aplicar(btn.dataset.periodo);});
})();
