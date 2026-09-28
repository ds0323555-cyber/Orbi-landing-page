const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve arquivos estáticos do diretório (landing, assets e todos os arquivos do blog).
// Isso já resolve /blog/<artigo>.html, /blog/blog.css, /orbi.css, etc.
app.use(express.static(path.join(__dirname), { acceptRanges: false }));

// Blog: /blog e /blog/ servem o índice do blog explicitamente
// (antes do catch-all da landing).
app.get(['/blog', '/blog/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'blog', 'index.html'), { acceptRanges: false });
});

// Calculadora Shopee: página com URL própria e indexável.
// A canonical é SEM barra final, então a versão com barra redireciona 301 —
// as duas servindo 200 seriam conteúdo duplicado para o Google.
// ⚠ Precisa vir ANTES do catch-all: sem estas rotas, /calculadora-shopee cai
// na curinga e devolve a HOME com 200, que é o pior desfecho possível para
// SEO (o buscador indexa a home no lugar da página).
// ⚠ UM handler só para as duas formas: com `strict routing` desligado (o
// padrão do Express) '/calculadora-shopee' e '/calculadora-shopee/' são a
// MESMA rota, então registrar a versão com barra para redirecionar faria a
// sem barra redirecionar para si mesma, em laço. Quem decide é a URL crua.
app.get('/calculadora-shopee', (req, res) => {
  const [caminho, busca] = req.originalUrl.split('?');
  if (caminho.endsWith('/')) {
    return res.redirect(301, '/calculadora-shopee' + (busca ? '?' + busca : ''));
  }
  res.sendFile(path.join(__dirname, 'calculadora-shopee.html'), { acceptRanges: false });
});

// Fallback:
// - rotas /blog/* não encontradas voltam ao índice do blog;
// - qualquer outra rota volta para a landing (index.html), como antes.
app.get('*', (req, res) => {
  if (req.path === '/blog' || req.path.startsWith('/blog/')) {
    return res.sendFile(path.join(__dirname, 'blog', 'index.html'), { acceptRanges: false });
  }
  res.sendFile(path.join(__dirname, 'index.html'), { acceptRanges: false });
});

app.listen(PORT, () => {
  console.log(`Orbi Seller rodando na porta ${PORT}`);
});
