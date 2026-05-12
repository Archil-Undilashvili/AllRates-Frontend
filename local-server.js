const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT) || 8080;

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

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

http.createServer((req, res) => {
  const routePath = cleanPath(req.url || '/');
  const requested = path.normalize(routePath).replace(/^(\.\.[/\\])+/, '');

  if (requested.includes('..')) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('Bad request');
    return;
  }

  const directFile = path.join(root, requested === '/' ? 'index.html' : requested.slice(1));
  if (fs.existsSync(directFile) && fs.statSync(directFile).isFile()) {
    serveFile(res, directFile);
    return;
  }

  const htmlFile = path.join(root, fileForRoute(routePath));
  if (fs.existsSync(htmlFile) && fs.statSync(htmlFile).isFile()) {
    serveFile(res, htmlFile);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
  res.end('Not found');
}).listen(port, () => {
  console.log(`AllRates local server: http://localhost:${port}`);
});
