/* Transporta a atribuição da URL entre páginas da landing e para o app. */
(function () {
  var current = new URL(window.location.href);
  var attribution = new URLSearchParams();
  var keys = new Set(['oppref', 'ad_group_id', 'ad_id', 'adgroupid', 'adid']);

  current.searchParams.forEach(function (value, key) {
    if (value && (keys.has(key) || key.startsWith('utm_')) && !attribution.has(key)) {
      attribution.set(key, value);
    }
  });
  if (!attribution.size) return;

  document.querySelectorAll('a[href]').forEach(function (anchor) {
    var href = anchor.getAttribute('href').trim();
    if (!href || href.startsWith('#') || anchor.hasAttribute('download')) return;

    var destination;
    try {
      destination = new URL(href, document.baseURI);
    } catch {
      return;
    }
    if (destination.protocol !== 'https:' && destination.protocol !== 'http:') return;
    if (/\.(?:pdf|zip|rar|7z|gz|tar|csv|tsv|xlsx?|docx?|pptx?|exe|dmg|apk|png|jpe?g|gif|svg|webp|ico|mp[34]|webm|wav|woff2?|ttf|css|js)$/i.test(destination.pathname)) return;

    var anotherPage = destination.origin === current.origin && destination.pathname !== current.pathname;
    var app = destination.hostname === 'orbiseller.com';
    if (!anotherPage && !app) return;

    attribution.forEach(function (value, key) {
      var existing = destination.searchParams.getAll(key).find(function (item) { return item !== ''; });
      destination.searchParams.set(key, existing || value);
    });
    anchor.setAttribute('href', destination.href);
  });
})();
