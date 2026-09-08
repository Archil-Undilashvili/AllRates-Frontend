const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('node:zlib');
const {createCache} = require('./scripts/page-snapshot');
const {render} = require('./scripts/render-page-snapshot');
const {optimize} = require('./scripts/optimize-markup');
const snapshots = createCache();
const ready = snapshots.refresh().catch(error => console.error('Initial snapshot refresh failed; using saved data:', error));
const refreshTimer = setInterval(() => snapshots.refresh().catch(console.error), 60000);
refreshTimer.unref();
const renderedPages = new Map();

const root = __dirname;
const port = Number(process.env.PORT) || 8080;

const redirects = new Map([
  ['/valutis-kursi', '/'], ['/valutis-kursebi', '/'], ['/laris-kursi', '/'],
  ['/valutis-kursebi-dges', '/official'], ['/erovnuli-bankis-kursi', '/official'],
  ['/bankebis-kursebi', '/rates'], ['/jixurebis-kursebi', '/rates'], ['/valutis-gacvla', '/rates'],
  ['/valutis-kalkulatori', '/calculator'], ['/valutis-konvertacia', '/calculator'],
  ['/dolaris-kursi', '/rates'], ['/evros-kursi', '/rates'],
  ['/funtis-kursi', '/rates'], ['/rublis-kursi', '/rates'],
  ['/liris-kursi', '/rates'], ['/bitcoinis-fasi', '/#crypto-rates-section'],
  ['/kriptovalutis-kursebi', '/#crypto-rates-section'], ['/oqros-fasi', '/#popular-assets-list']
]);

for (const slug of ['usd-gel', 'eur-gel', 'gbp-gel', 'rub-gel', 'try-gel']) redirects.set(`/market-rates/${slug}`, '/rates');

const mimeTypes = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.xml': 'application/xml; charset=UTF-8',
  '.txt': 'text/plain; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

function cleanPath(urlPath) {
  return decodeURIComponent(urlPath.split('?')[0]).replace(/\/+$/, '') || '/';
}

function fileForRoute(routePath) {
  if (routePath === '/') return 'index.html';
  if (routePath.endsWith('.html')) return routePath.slice(1);
  return `${routePath.slice(1)}.html`;
}

function serveFile(req, res, filePath) {
  fs.readFile(filePath, async (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.html') {
      await ready;
      const key = `${filePath}:${fs.statSync(filePath).mtimeMs}:${snapshots.version()}`;
      try {
        if (!renderedPages.has(key)) {
          if(renderedPages.size>50)renderedPages.clear();
          const relative=path.relative(root,filePath);
          const needsRates=['index.html','rates.html','official.html'].includes(relative)||relative.startsWith('official-rates/');
          renderedPages.set(key,optimize(needsRates?render(data.toString(),snapshots.get()):data.toString()));
        }
        data=Buffer.from(renderedPages.get(key));
      } catch(error) { console.error('HTML snapshot render failed:',error); }
      res.setHeader('Cache-Control','no-cache');
      res.setHeader('X-Snapshot-Updated',String(snapshots.get().entries.market?.fetchedAt||''));
    } else if(filePath.includes('/assets/optimized/')) res.setHeader('Cache-Control','public, max-age=31536000, immutable');
    else res.setHeader('Cache-Control','no-cache');
    res.setHeader('Vary','Accept-Encoding');
    if (['.html','.js','.css','.json','.svg','.xml'].includes(ext) && /\bgzip\b/.test(req.headers['accept-encoding']||'')) {
      data=zlib.gzipSync(data);res.setHeader('Content-Encoding','gzip');
    }
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream', 'Content-Length':data.length });
    if(req.method==='HEAD'){res.end();return;}
    res.end(data);
  });
}

http.createServer((req, res) => {
  const spotSource = (req.url || '').match(/^\/api\/spot-snapshot\/(market|official|sheets|crypto|cryptoMeta)$/)?.[1];
  if (spotSource) {
    ready.then(() => {
      const entry=snapshots.get().entries[spotSource];
      res.writeHead(entry?200:503,{'Content-Type':'application/json; charset=UTF-8','Cache-Control':entry?'public, max-age=30':'no-store'});
      res.end(JSON.stringify(entry?.payload || {error:'Snapshot temporarily unavailable'}));
    }).catch(()=>{res.writeHead(503);res.end();});
    return;
  }
  let routePath;
  try { routePath = cleanPath(req.url || '/'); }
  catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('Bad request');
    return;
  }
  const requested = path.normalize(routePath).replace(/^(\.\.[/\\])+/, '');

  if (requested.includes('..')) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('Bad request');
    return;
  }

  const redirectKey = routePath.replace(/\.html$/, '');
  if (redirects.has(redirectKey)) {
    res.writeHead(301, { Location: redirects.get(redirectKey) });
    res.end();
    return;
  }

  // Serve one public URL for each HTML page, including legacy file links.
  if (routePath.endsWith('.html') && fs.existsSync(path.join(root, routePath.slice(1)))) {
    const query = (req.url || '').includes('?') ? (req.url || '').slice((req.url || '').indexOf('?')) : '';
    res.writeHead(301, { Location: (routePath === '/index.html' ? '/' : routePath.slice(0, -5)) + query });
    res.end();
    return;
  }

  const directFile = path.join(root, requested === '/' ? 'index.html' : requested.slice(1));
  if (fs.existsSync(directFile) && fs.statSync(directFile).isFile()) {
    serveFile(req, res, directFile);
    return;
  }

  const htmlFile = path.join(root, fileForRoute(routePath));
  if (fs.existsSync(htmlFile) && fs.statSync(htmlFile).isFile()) {
    serveFile(req, res, htmlFile);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
  res.end('Not found');
}).listen(port, () => {
  console.log(`AllRates local server: http://localhost:${port}`);
});
