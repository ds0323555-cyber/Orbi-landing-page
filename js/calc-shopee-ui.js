/* ============================================================
   LIGAÇÃO DA CALCULADORA SHOPEE COM O DOM
   ============================================================

   A CONTA não mora aqui: mora em js/calc-shopee.js, que é a cópia fiel
   das regras do app. Este arquivo só lê os campos, chama o motor e
   escreve o resultado na tela.

   Roda em QUALQUER página que tenha a marcação da calculadora (hoje
   /calculadora-shopee). Sai calado se os campos não existirem, então
   pode ser incluído em toda a landing sem guarda no HTML.

   Antes isto era um IIFE dentro do orbi.js, com a tabela de faixas
   embutida — o que tornava impossível reaproveitar a calculadora fora
   da home sem copiar a regra junto.
   ============================================================ */
(function () {
  'use strict';

  var motor = window.OrbiCalcShopee;
  var $ = function (id) { return document.getElementById(id); };
  if (!motor || !$('calcBtn')) return;

  /* --- parsing/format BR (idênticos aos que estavam no orbi.js) --- */
  function parseBR(v) {
    if (v == null) return 0;
    var n = parseFloat(String(v).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
    return isNaN(n) ? 0 : n;
  }
  function fmtBRL(n) {
    return (n < 0 ? '-' : '') + 'R$ ' + Math.abs(n).toLocaleString('pt-BR', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }
  function fmtPct(n, casas) {
    var c = casas == null ? 1 : casas;
    return n.toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c }) + '%';
  }

  /* --- estado dos segmentos/toggles --- */
  var seg = $('calcVendedor');
  seg.addEventListener('click', function (e) {
    var btn = e.target.closest('.calc-seg-btn');
    if (!btn) return;
    seg.querySelectorAll('.calc-seg-btn').forEach(function (b) { b.classList.remove('is-active'); });
    btn.classList.add('is-active');
  });

  var adsToggle = $('calcAds');
  var adsPctWrap = $('calcAdsPctWrap');
  adsToggle.addEventListener('change', function () {
    adsPctWrap.hidden = !adsToggle.checked;
    if (adsToggle.checked) $('calcAdsPct').focus();
  });

  var regime = $('calcRegime');
  var aliqWrap = $('calcAliquotaWrap');
  regime.addEventListener('change', function () {
    var manual = regime.value === 'simples' || regime.value === 'outro';
    aliqWrap.hidden = !manual;
    if (regime.value === 'simples' && !$('calcAliquota').value) $('calcAliquota').value = '6';
  });

  function mostrar(id, visivel) { var el = $(id); if (el) el.hidden = !visivel; }
  function escrever(id, txt) { var el = $(id); if (el) el.textContent = txt; }

  /* --- cálculo --- */
  function calcular() {
    var custo = parseBR($('calcCusto').value);
    var preco = parseBR($('calcPreco').value);

    if (preco <= 0 || custo <= 0) {
      mostrar('calcError', true);
      mostrar('calcResult', false);
      return;
    }
    mostrar('calcError', false);

    var r = motor.calcular({
      precoVenda: preco,
      custoProduto: custo,
      qtd: parseInt($('calcQtd').value, 10) || 1,
      custoEmbalagem: parseBR($('calcEmbalagem').value),
      cpfAltoVolume: seg.querySelector('.calc-seg-btn.is-active').dataset.val === 'cpf',
      campanhaDestaque: $('calcDestaque').checked,
      adsPercent: adsToggle.checked ? Math.max(0, parseBR($('calcAdsPct').value)) : 0,
      aliquotaPercent: (regime.value === 'simples' || regime.value === 'outro')
        ? Math.max(0, parseBR($('calcAliquota').value)) : 0
    });

    escrever('calcBand', r.faixaDescricao);
    escrever('rFaturamento', fmtBRL(r.faturamento));
    escrever('rTaxas', '– ' + fmtBRL(r.totalTaxas));
    escrever('rCusto', '– ' + fmtBRL(r.totalCusto));
    escrever('rRepasse', fmtBRL(r.repasse));

    /* Quebra das taxas — só existe na página dedicada; na home esses
       elementos não estão no HTML e o escrever() simplesmente não acha. */
    escrever('rComissaoPct', '– ' + fmtBRL(r.comissaoPercentValor));
    escrever('rComissaoPctLabel', 'Comissão (' + fmtPct(r.percentTotal, 1) + ')');
    escrever('rTaxaFixa', '– ' + fmtBRL(r.taxaFixa));
    mostrar('rAdicionalCpfRow', r.adicionalCpf > 0);
    escrever('rAdicionalCpf', '– ' + fmtBRL(r.adicionalCpf));
    mostrar('rAdicionalDestaqueRow', r.adicionalDestaque > 0);
    escrever('rAdicionalDestaque', 'incluído nos ' + fmtPct(r.percentTotal, 1));

    mostrar('rAdsRow', r.totalAds > 0);
    escrever('rAds', '– ' + fmtBRL(r.totalAds));
    mostrar('rImpostoRow', r.totalImposto > 0);
    escrever('rImposto', '– ' + fmtBRL(r.totalImposto));

    escrever('rLucro', fmtBRL(r.lucro));
    escrever('rMargem', fmtPct(r.margem));

    var hlL = $('rLucro').parentElement, hlM = $('rMargem').parentElement;
    var prejuizo = r.lucro < 0;
    hlL.classList.toggle('is-loss', prejuizo); hlL.classList.toggle('is-profit', !prejuizo);
    hlM.classList.toggle('is-loss', prejuizo); hlM.classList.toggle('is-profit', !prejuizo);

    mostrar('calcResult', true);
  }

  function limpar() {
    ['calcCusto', 'calcEmbalagem', 'calcPreco', 'calcAdsPct', 'calcAliquota'].forEach(function (id) {
      if ($(id)) $(id).value = '';
    });
    $('calcQtd').value = '1';
    $('calcDestaque').checked = false;
    adsToggle.checked = false; adsPctWrap.hidden = true;
    regime.value = '0'; aliqWrap.hidden = true;
    seg.querySelectorAll('.calc-seg-btn').forEach(function (b, i) { b.classList.toggle('is-active', i === 0); });
    mostrar('calcResult', false);
    mostrar('calcError', false);
  }

  $('calcBtn').addEventListener('click', calcular);
  var btnLimpar = $('calcClear');
  if (btnLimpar) btnLimpar.addEventListener('click', limpar);

  var escopo = $('calcBtn').closest('section') || document;
  escopo.querySelectorAll('input').forEach(function (inp) {
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); calcular(); }
    });
  });
})();
