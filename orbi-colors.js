/* ============================================================
   ORBI SELLER â Chromatic hierarchy
   Wraps specific words in color spans across the prose copy.
   Runs over a curated set of text containers only â never touches
   badges, mockup data rows, tables, nav or buttons.
   ============================================================ */
(function () {
  'use strict';

  // letter-words â class (matched with unicode letter boundaries, case-insensitive)
  const wordClass = {};
  const groups = [
    ['c-shopee', ['shopee']],
    ['c-magalu', ['magalu']],
    ['c-tiktok', ['tiktok']],
    ['c-amazon', ['amazon']],
    ['c-pos', ['lucro', 'lucrar', 'lucrando', 'margem', 'crescer', 'escalar', 'escala', 'resultado', 'resultados', 'dados', 'decisÃ£o', 'decisÃµes', 'controle', 'controlar']],
    ['c-neg', ['prejuÃ­zo', 'perder', 'perdendo', 'perde', 'queimar', 'queimando', 'achismo', 'escuro', 'improviso']],
    ['c-stg', ['orbi', 'grÃ¡tis', 'garantia']]
  ];
  groups.forEach(([cls, words]) => words.forEach((w) => { wordClass[w.toLowerCase()] = cls; }));

  // multi-word / numeric literals â class (matched verbatim, longest first)
  const litMap = {
    'mercado livre': 'c-ml',
    'zero risco': 'c-stg',
    'r$ 247,90': 'c-num',
    'r$ 147,90': 'c-num',
    'r$ 79,90': 'c-num',
    'r$ 7.000': 'c-num',
    '14 dias': 'c-num',
    '3 meses': 'c-num',
    '100%': 'c-num'
  };

  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const litPat = Object.keys(litMap).sort((a, b) => b.length - a.length).map(esc);
  const wordPat = Object.keys(wordClass).sort((a, b) => b.length - a.length);

  let re;
  try {
    re = new RegExp('(' + litPat.join('|') + ')|(?<![\\p{L}])(' + wordPat.join('|') + ')(?![\\p{L}])', 'giu');
  } catch (e) {
    // fallback without lookbehind (older engines)
    re = new RegExp('(' + litPat.join('|') + ')|\\b(' + wordPat.join('|') + ')\\b', 'gi');
  }

  // prose containers to colorize
  const roots = document.querySelectorAll([
    '.hero .display', '.hero .subhead', '.hero-proof',
    '.dor-list p',
    '.agit .shead h2', '.agit .shead .label', '.agit-cell p', '.agit .wrap > p.reveal',
    '.sol-quote',
    '#funcionalidades .shead h2', '#funcionalidades .shead p',
    '.feat-copy h3', '.feat-copy > p', '.feat-points li',
    '.testi p',
    '.guarantee h2', '.guarantee p',
    '.cta h2', '.cta p',
    '.faq-q', '.faq-a-inner'
  ].join(','));

  // never descend into these
  const SKIP = '.badge, .ck-pill, .faq-icon, script, style, .card-glow';

  function classify(m) {
    if (m[1] != null) return litMap[m[1].toLowerCase()];
    if (m[2] != null) return wordClass[m[2].toLowerCase()];
    return null;
  }

  function processText(node) {
    const text = node.nodeValue;
    re.lastIndex = 0;
    if (!re.test(text)) return;
    re.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0, m;
    while ((m = re.exec(text)) !== null) {
      const cls = classify(m);
      if (!cls) continue;
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const span = document.createElement('span');
      span.className = cls;
      span.textContent = m[0];
      frag.appendChild(span);
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }

  function walk(el) {
    if (el.nodeType === 1 && el.matches && el.matches(SKIP)) return;
    const kids = Array.prototype.slice.call(el.childNodes);
    for (const k of kids) {
      if (k.nodeType === 3) processText(k);
      else if (k.nodeType === 1) walk(k);
    }
  }

  roots.forEach(walk);
})();
