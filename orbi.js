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

/* ============================================================
   Carrossel de imagens reutilizável (.app-carousel)
   Alterna os .app-carousel-slide via cross-fade (opacity),
   alternando a classe .is-active. Reusável em qualquer seção:
   basta criar um .app-carousel com N imagens (a 1ª com .is-active)
   e, opcionalmente, data-interval="<ms>" (padrão 4000).
   Respeita prefers-reduced-motion: mostra só o 1º slide.
   ============================================================ */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.app-carousel').forEach(function(car){
    const slides = car.querySelectorAll('.app-carousel-slide');
    if (slides.length < 2 || reduce) return;
    const interval = parseInt(car.dataset.interval, 10) || 4000;
    let i = 0;
    setInterval(function(){
      if (document.body.classList.contains('lightbox-open')) return; // pausa com lightbox aberto
      slides[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
    }, interval);
  });
})();

/* ============================================================
   LIGHTBOX GENÉRICO para galerias de imagens
   ------------------------------------------------------------
   Qualquer .app-carousel (herda automático) ou qualquer container
   com class="lightbox-group" vira uma galeria: clicar numa <img>
   abre o lightbox; ‹ › navegam DENTRO daquele grupo; fecha no X,
   no clique no fundo escuro ou com ESC (setas do teclado também
   navegam). Pausa o carrossel enquanto aberto (via body.lightbox-open,
   checado pelo loop do carrossel). Funciona em desktop e mobile.

   COMO REUSAR numa nova seção:
     - Se usar .app-carousel: nada a fazer.
     - Galeria fora de carrossel: dê class="lightbox-group" ao
       container das <img>. O overlay e a dica são criados sozinhos.
   ============================================================ */
(function(){
  const groups = document.querySelectorAll('.app-carousel, .lightbox-group');
  if (!groups.length) return;

  // overlay criado uma única vez e reaproveitado por todas as galerias
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML =
    '<button class="lightbox-close" type="button" aria-label="Fechar">×</button>' +
    '<button class="lightbox-nav lightbox-prev" type="button" aria-label="Imagem anterior">‹</button>' +
    '<img class="lightbox-img" alt="">' +
    '<button class="lightbox-nav lightbox-next" type="button" aria-label="Próxima imagem">›</button>';
  document.body.appendChild(lb);
  const lbImg = lb.querySelector('.lightbox-img');

  let current = [];   // itens {src, alt} do grupo aberto
  let idx = 0;

  const hintSVG =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"></circle>' +
      '<path d="M20 20l-3.4-3.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>' +
      '<path d="M11 8.2v5.6M8.2 11h5.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>' +
    '</svg>';

  function show(i){
    if (!current.length) return;
    idx = (i + current.length) % current.length;
    lbImg.src = current[idx].src;
    lbImg.alt = current[idx].alt || '';
  }
  function open(items, i){
    current = items;
    document.body.classList.add('lightbox-open');
    lb.classList.add('is-open');
    show(i);
  }
  function close(){
    lb.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
  }

  groups.forEach(function(group){
    const imgs = Array.prototype.slice.call(group.querySelectorAll('img'));
    if (!imgs.length) return;

    // dica de clique (uma por galeria)
    if (!group.querySelector('.lightbox-hint')) {
      const hint = document.createElement('span');
      hint.className = 'lightbox-hint';
      hint.setAttribute('aria-hidden', 'true');
      hint.innerHTML = hintSVG + '<span class="lightbox-hint-txt">Ampliar</span>';
      group.appendChild(hint);
    }

    const items = imgs.map(function(im){ return { src: im.currentSrc || im.src, alt: im.alt }; });
    imgs.forEach(function(im, i){
      im.addEventListener('click', function(){ open(items, i); });
    });
  });

  lb.querySelector('.lightbox-next').addEventListener('click', function(e){ e.stopPropagation(); show(idx + 1); });
  lb.querySelector('.lightbox-prev').addEventListener('click', function(e){ e.stopPropagation(); show(idx - 1); });
  lb.querySelector('.lightbox-close').addEventListener('click', function(e){ e.stopPropagation(); close(); });
  lb.addEventListener('click', function(e){ if (e.target === lb) close(); }); // clique no fundo fecha

  document.addEventListener('keydown', function(e){
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'ArrowLeft') show(idx - 1);
  });
})();

/* ============================================================
   MINI CALCULADORA SHOPEE (demo interativa da landing)
   Taxas 2026 — fonte: taxas públicas Shopee Brasil (Mar/2026).
   ============================================================ */
(function () {
  'use strict';
  const root = document.getElementById('calculadora-demo');
  if (!root) return;

  const $ = (id) => document.getElementById(id);

  // --- parsing/format BR ---
  function parseBR(v) {
    if (v == null) return 0;
    const n = parseFloat(String(v).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
    return isNaN(n) ? 0 : n;
  }
  const fmtBRL = (n) =>
    (n < 0 ? '-' : '') + 'R$ ' + Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtPct = (n) =>
    n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

  // --- tabela de faixas Shopee 2026 (por preço unitário) ---
  function shopeeBand(price) {
    if (price < 8)          return { rate: 0.20, fixed: +(price * 0.5).toFixed(2), label: '20% + tarifa reduzida (produto < R$ 8)' };
    if (price <= 79.99)     return { rate: 0.20, fixed: 4,  label: '20% + R$ 4,00 (até R$ 79,99)' };
    if (price <= 99.99)     return { rate: 0.14, fixed: 16, label: '14% + R$ 16,00 (R$ 80–99,99)' };
    if (price <= 199.99)    return { rate: 0.14, fixed: 20, label: '14% + R$ 20,00 (R$ 100–199,99)' };
    if (price <= 499.99)    return { rate: 0.14, fixed: 24, label: '14% + R$ 24,00 (R$ 200–499,99)' };
    return                         { rate: 0.14, fixed: 26, label: '14% + R$ 26,00 (acima de R$ 500)' };
  }

  // --- estado dos segmentos/toggles ---
  const seg = $('calcVendedor');
  seg.addEventListener('click', (e) => {
    const btn = e.target.closest('.calc-seg-btn');
    if (!btn) return;
    seg.querySelectorAll('.calc-seg-btn').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
  });

  const adsToggle = $('calcAds');
  const adsPctWrap = $('calcAdsPctWrap');
  adsToggle.addEventListener('change', () => {
    adsPctWrap.hidden = !adsToggle.checked;
    if (adsToggle.checked) $('calcAdsPct').focus();
  });

  const regime = $('calcRegime');
  const aliqWrap = $('calcAliquotaWrap');
  regime.addEventListener('change', () => {
    const manual = regime.value === 'simples' || regime.value === 'outro';
    aliqWrap.hidden = !manual;
    if (regime.value === 'simples' && !$('calcAliquota').value) $('calcAliquota').value = '6';
  });

  // --- cálculo ---
  function calcular() {
    const custo = parseBR($('calcCusto').value);
    const preco = parseBR($('calcPreco').value);
    const qtd = Math.max(1, parseInt($('calcQtd').value, 10) || 1);
    const embalagem = parseBR($('calcEmbalagem').value);

    if (preco <= 0 || custo <= 0) {
      $('calcError').hidden = false;
      $('calcResult').hidden = true;
      return;
    }
    $('calcError').hidden = true;

    const cpf = seg.querySelector('.calc-seg-btn.is-active').dataset.val === 'cpf';
    const destaque = $('calcDestaque').checked;
    const band = shopeeBand(preco);

    // taxas Shopee por item
    let comissaoRate = band.rate + (destaque ? 0.035 : 0);
    let comissao = Math.min(preco * comissaoRate, 100); // teto R$ 100 de comissão percentual
    let taxaItem = comissao + band.fixed + (cpf ? 3 : 0);

    // totais
    const faturamento = preco * qtd;
    const totalTaxas = taxaItem * qtd;

    let adsPct = 0;
    if (adsToggle.checked) adsPct = Math.max(0, parseBR($('calcAdsPct').value));
    const totalAds = faturamento * (adsPct / 100);

    let aliq = 0;
    if (regime.value === 'simples' || regime.value === 'outro') aliq = Math.max(0, parseBR($('calcAliquota').value));
    const totalImposto = faturamento * (aliq / 100);

    const totalCusto = (custo + embalagem) * qtd;

    const repasse = faturamento - totalTaxas;
    const lucro = repasse - totalAds - totalImposto - totalCusto;
    const margem = faturamento > 0 ? (lucro / faturamento) * 100 : 0;

    // render
    $('calcBand').textContent = 'Faixa: ' + band.label;
    $('rFaturamento').textContent = fmtBRL(faturamento);
    $('rTaxas').textContent = '– ' + fmtBRL(totalTaxas);
    $('rCusto').textContent = '– ' + fmtBRL(totalCusto);
    $('rRepasse').textContent = fmtBRL(repasse);

    $('rAdsRow').hidden = !(totalAds > 0);
    $('rAds').textContent = '– ' + fmtBRL(totalAds);
    $('rImpostoRow').hidden = !(totalImposto > 0);
    $('rImposto').textContent = '– ' + fmtBRL(totalImposto);

    $('rLucro').textContent = fmtBRL(lucro);
    $('rMargem').textContent = fmtPct(margem);

    const hlL = $('rLucro').parentElement, hlM = $('rMargem').parentElement;
    const loss = lucro < 0;
    hlL.classList.toggle('is-loss', loss); hlL.classList.toggle('is-profit', !loss);
    hlM.classList.toggle('is-loss', loss); hlM.classList.toggle('is-profit', !loss);

    $('calcResult').hidden = false;
  }

  function limpar() {
    ['calcCusto', 'calcEmbalagem', 'calcPreco', 'calcAdsPct', 'calcAliquota'].forEach((id) => ($(id).value = ''));
    $('calcQtd').value = '1';
    $('calcDestaque').checked = false;
    adsToggle.checked = false; adsPctWrap.hidden = true;
    regime.value = '0'; aliqWrap.hidden = true;
    seg.querySelectorAll('.calc-seg-btn').forEach((b, i) => b.classList.toggle('is-active', i === 0));
    $('calcResult').hidden = true;
    $('calcError').hidden = true;
  }

  $('calcBtn').addEventListener('click', calcular);
  $('calcClear').addEventListener('click', limpar);
  root.querySelectorAll('input').forEach((inp) => {
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); calcular(); } });
  });
})();
