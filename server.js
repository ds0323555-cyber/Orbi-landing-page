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
