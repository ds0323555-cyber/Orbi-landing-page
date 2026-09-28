/* ============================================================
   MOTOR DE TAXAS DA SHOPEE — FONTE ÚNICA DA LANDING
   ============================================================

   ⚠ As regras aqui são cópia FIEL de Orbiseller-App/src/data/taxas.js
   (SHOPEE_FAIXAS, SHOPEE_ADICIONAL_CPF_ALTO_VOLUME e
   SHOPEE_ADICIONAL_CAMPANHA_DESTAQUE) e da função getShopeeComissao de
   src/utils/calculadoras.js. Se a tarifa mudar no app, muda aqui — e em
   lugar nenhum mais.

   POR QUE ESTE ARQUIVO EXISTE: a tabela vivia dentro do orbi.js, numa
   função `shopeeBand` que só a home enxergava. Com a página
   /calculadora-shopee passariam a existir DUAS cópias da mesma regra, e
   a atualização acertaria uma e deixaria a outra mentindo — foi
   exatamente isso que aconteceu no app, onde a tabela da Shopee chegou a
   viver em três lugares.

   DUAS DIVERGÊNCIAS REAIS foram corrigidas na extração:
   1. o orbi.js aplicava `Math.min(preco * rate, 100)`, o teto de R$ 100
      de comissão percentual — que a Shopee ENCERROU em março/2026. O
      app não tem teto nenhum. Acima de R$ 714,29 a landing cobrava
      menos comissão do que a Shopee cobra de verdade (num item de
      R$ 1.000 dava R$ 126,00 em vez de R$ 166,00);
   2. o orbi.js arredondava a tarifa da faixa abaixo de R$ 8 com
      `.toFixed(2)`; o app usa `p / 2` exato.

   Vigência: faixa de R$ 8 a R$ 79,99 com tarifa de R$ 4,50 desde
   01/10/2026 (antes R$ 4,00). As demais faixas não mudaram.
   ============================================================ */
(function (global) {
  'use strict';

  /* `ate` é o teto INCLUSIVO da faixa. `taxaFixa: null` significa "não é
     valor fixo, é função do preço" — o caso dos itens abaixo de R$ 8, em
     que a Shopee cobra metade do preço. Quem consome resolve
     `taxaFixaDe ? taxaFixaDe(p) : taxaFixa`. */
  var FAIXAS = [
    { ate: 7.99,     percent: 0.20, taxaFixa: null, taxaFixaDe: function (p) { return p / 2; } },
    { ate: 79.99,    percent: 0.20, taxaFixa: 4.50 },
    { ate: 99.99,    percent: 0.14, taxaFixa: 16.00 },
    { ate: 199.99,   percent: 0.14, taxaFixa: 20.00 },
    { ate: Infinity, percent: 0.14, taxaFixa: 26.00 }
  ];

  /* Não são faixa: são acréscimos sobre a faixa resolvida. */
  var ADICIONAL_CPF_ALTO_VOLUME = 3.00;   /* R$ por item, soma na TARIFA FIXA */
  var ADICIONAL_CAMPANHA_DESTAQUE = 0.035; /* soma no PERCENTUAL */

  function faixaDe(preco) {
    for (var i = 0; i < FAIXAS.length; i++) {
      if (preco <= FAIXAS[i].ate) return FAIXAS[i];
    }
    return FAIXAS[FAIXAS.length - 1];
  }

  function brl(n) {
    return 'R$ ' + Number(n).toLocaleString('pt-BR', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }

  /* Rótulo curto, no formato do app: "20% + R$ 4,50 por item". */
  function faixaLabel(preco) {
    var f = faixaDe(preco);
    var fixa = f.taxaFixaDe ? f.taxaFixaDe(preco) : f.taxaFixa;
    var pct = Math.round(f.percent * 100) + '%';
    return f.taxaFixaDe
      ? pct + ' + ' + brl(fixa) + ' (metade do preço)'
      : pct + ' + ' + brl(fixa) + ' por item';
  }

  /* Rótulo com a faixa escrita por extenso, para a página:
     "Faixa R$ 8 a R$ 79,99: 20% + R$ 4,50 por item". */
  function faixaDescricao(preco) {
    var f = faixaDe(preco);
    var i = FAIXAS.indexOf(f);
    var de = i === 0 ? 0 : FAIXAS[i - 1].ate + 0.01;
    var nome;
    if (i === 0) nome = 'Faixa abaixo de R$ 8';
    else if (f.ate === Infinity) nome = 'Faixa de ' + brl(de) + ' para cima';
    else nome = 'Faixa ' + brl(de) + ' a ' + brl(f.ate);
    return nome + ': ' + faixaLabel(preco);
  }

  /* Espelha getShopeeComissao() do app, linha por linha.
     ⚠ SEM teto: a Shopee encerrou o teto de R$ 100 em março/2026. */
  function taxasDaShopee(preco, cpfAltoVolume, campanhaDestaque) {
    var f = faixaDe(preco);
    var taxaFixa = f.taxaFixaDe ? f.taxaFixaDe(preco) : f.taxaFixa;
    if (cpfAltoVolume) taxaFixa += ADICIONAL_CPF_ALTO_VOLUME;

    var percentTotal = f.percent;
    if (campanhaDestaque) percentTotal += ADICIONAL_CAMPANHA_DESTAQUE;

    return {
      faixaPercent: f.percent,
      percentTotal: percentTotal,
      taxaFixa: taxaFixa,
      adicionalCpf: cpfAltoVolume ? ADICIONAL_CPF_ALTO_VOLUME : 0,
      adicionalDestaque: campanhaDestaque ? ADICIONAL_CAMPANHA_DESTAQUE : 0,
      comissaoPercentValor: preco * percentTotal,
      comissaoValor: preco * percentTotal + taxaFixa
    };
  }

  /* Conta completa de uma venda. `qtd` multiplica tudo que é por item. */
  function calcular(e) {
    var preco = Number(e.precoVenda) || 0;
    var qtd = Math.max(1, Math.floor(Number(e.qtd) || 1));
    var custo = Number(e.custoProduto) || 0;
    var embalagem = Number(e.custoEmbalagem) || 0;
    var adsPercent = Number(e.adsPercent) || 0;
    var aliquotaPercent = Number(e.aliquotaPercent) || 0;

    var t = taxasDaShopee(preco, !!e.cpfAltoVolume, !!e.campanhaDestaque);

    var faturamento = preco * qtd;
    var totalTaxas = t.comissaoValor * qtd;
    var totalAds = faturamento * (adsPercent / 100);
    var totalImposto = faturamento * (aliquotaPercent / 100);
    var totalCusto = (custo + embalagem) * qtd;

    var repasse = faturamento - totalTaxas;
    var lucro = repasse - totalAds - totalImposto - totalCusto;

    return {
      faixaPercent: t.faixaPercent * 100,
      percentTotal: t.percentTotal * 100,
      comissaoPercentValor: t.comissaoPercentValor * qtd,
      taxaFixa: t.taxaFixa * qtd,
      adicionalCpf: t.adicionalCpf * qtd,
      adicionalDestaque: t.adicionalDestaque * 100,
      faixaLabel: faixaLabel(preco),
      faixaDescricao: faixaDescricao(preco),
      faturamento: faturamento,
      totalTaxas: totalTaxas,
      totalAds: totalAds,
      totalImposto: totalImposto,
      totalCusto: totalCusto,
      repasse: repasse,
      lucro: lucro,
      margem: faturamento > 0 ? (lucro / faturamento) * 100 : 0
    };
  }

  global.OrbiCalcShopee = {
    FAIXAS: FAIXAS,
    ADICIONAL_CPF_ALTO_VOLUME: ADICIONAL_CPF_ALTO_VOLUME,
    ADICIONAL_CAMPANHA_DESTAQUE: ADICIONAL_CAMPANHA_DESTAQUE,
    faixaDe: faixaDe,
    faixaLabel: faixaLabel,
    faixaDescricao: faixaDescricao,
    taxasDaShopee: taxasDaShopee,
    calcular: calcular,
    brl: brl
  };
})(typeof window !== 'undefined' ? window : globalThis);
