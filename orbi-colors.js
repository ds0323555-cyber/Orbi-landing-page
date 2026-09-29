/* ============================================================
   ORBI SELLER — DESTAQUE DE MARCA NO TEXTO
   ============================================================

   REGRA, em uma frase: o texto é branco; o roxo da marca aparece em
   "Orbi"/"Orbi Seller" e, no máximo, em UM trecho-chave por parágrafo.

   ⚠ O QUE ISTO SUBSTITUIU. Antes este arquivo pintava o texto por
   "psicologia das cores": nove classes, com cada marketplace na cor da
   marca DELE (Shopee laranja, Mercado Livre amarelo, Magalu azul, TikTok
   ciano, Amazon laranja) e o vocabulário dividido entre verde — lucro,
   margem, crescer, dados, controle — e vermelho — prejuízo, perder,
   queimando, achismo, escuro. Um parágrafo de dor chegava a ter cinco
   cores, e o destaque deixava de destacar: quando tudo é colorido, nada
   é. Nome de marketplace no texto corrido agora é texto, não logotipo.

   DUAS REGRAS, e a segunda é o que segura a mão:
   1. MARCA — toda ocorrência de "Orbi" vira roxo. É o nome do produto e
      pode repetir.
   2. CHAVE — no máximo UM destaque por elemento de texto, o primeiro que
      casar, e só da lista curta abaixo. O teto é POR ELEMENTO e não por
      página justamente para que um parágrafo com "margem" três vezes não
      vire um parágrafo roxo.

   Parágrafo sem nenhum termo da lista fica inteiro em branco, e isso é o
   esperado: nem todo parágrafo precisa de destaque.
   ============================================================ */
(function () {
  'use strict';

  /* Trechos-chave, casados literalmente e do mais longo para o mais curto,
     para que "lucro real" vença "margem". Lista curta de propósito: cada
     item que entra aqui rouba atenção de todos os outros.

     ⚠ 'dados' e não 'decidir com dados': o orbi.js quebra o H1 do hero em
     <span class="word"><i>palavra</i></span>, um nó de texto por palavra,
     para a animação de entrada. Frase de várias palavras NUNCA casa lá —
     medido, dava zero destaque no H1. */
  const CHAVES = [
    'lucro líquido real',
    'lucro real',
    'margem real',
    'lucro por anúncio',
    'margem',
    'dados'
  ];

  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const chavesPat = CHAVES.slice().sort((a, b) => b.length - a.length).map(esc).join('|');

  /* "Orbi Seller" antes de "Orbi", senão só o primeiro nome casaria. */
  const MARCA = 'Orbi Seller|Orbi';

  let reMarca, reChave;
  try {
    reMarca = new RegExp('(?<![\\p{L}])(' + MARCA + ')(?![\\p{L}])', 'giu');
    reChave = new RegExp('(?<![\\p{L}])(' + chavesPat + ')(?![\\p{L}])', 'giu');
  } catch (e) {
    /* motores sem lookbehind */
    reMarca = new RegExp('\\b(' + MARCA + ')\\b', 'gi');
    reChave = new RegExp('\\b(' + chavesPat + ')\\b', 'gi');
  }

  /* Os mesmos contêineres de texto corrido de antes: nunca badge, nunca
     linha de mockup, nunca tabela, nav ou botão. */
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

  const SKIP = '.badge, .ck-pill, .faq-icon, script, style, .card-glow';

  /* Envolve as ocorrências de `re` em <span class="hl-brand">.
     `limite` maior que zero corta após esse número de destaques.
     Devolve quantos pintou, para o chamador saber se gastou a cota. */
  function pintar(node, re, limite) {
    const text = node.nodeValue;
    re.lastIndex = 0;
    if (!re.test(text)) return 0;
    re.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let last = 0, m, feitos = 0;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const span = document.createElement('span');
      span.className = 'hl-brand';
      span.textContent = m[0];
      frag.appendChild(span);
      last = m.index + m[0].length;
      feitos++;
      if (limite && feitos >= limite) break;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
    return feitos;
  }

  /* Percorre os nós de texto do elemento. `estado.restam` é a cota de
     destaques-chave daquele elemento; a marca não consome cota. */
  function walk(el, estado) {
    if (el.nodeType === 1 && el.matches && el.matches(SKIP)) return;
    const kids = Array.prototype.slice.call(el.childNodes);
    for (const k of kids) {
      if (k.nodeType === 3) {
        /* Marca primeiro: se "Orbi" e um trecho-chave se sobrepusessem, o
           nome do produto é que tem de ganhar. */
        if (pintar(k, reMarca, 0) > 0) continue;
        if (estado.restam > 0) estado.restam -= pintar(k, reChave, estado.restam);
      } else if (k.nodeType === 1) {
        walk(k, estado);
      }
    }
  }

  roots.forEach((el) => walk(el, { restam: 1 }));
})();
