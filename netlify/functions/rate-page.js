// Render public rate pages on cache misses; never fetch chart history here.
const fs = require('node:fs');
const path = require('node:path');
process.env.ALLRATES_ROOT = process.cwd();
const {createCache} = require('../../scripts/page-snapshot');
const snapshots = createCache({persist: false});
const pages = new Map([
  ['home', 'index.html'], ['rates', 'rates.html'], ['official', 'official.html'],
  ...['usd-gel','eur-gel','gbp-gel','rub-gel','try-gel'].map(pair => [pair, `official-rates/${pair}.html`])
]);
exports.handler = async event => {
  if (!['GET','HEAD'].includes(event.httpMethod)) return {statusCode:405,headers:{Allow:'GET, HEAD'},body:''};
  const file = pages.get(event.queryStringParameters?.page);
  if (!file) return {statusCode:404,body:'Not found'};
  const template = fs.readFileSync(path.join(process.env.ALLRATES_ROOT,file),'utf8');
  let html = template;
  let rendered = false;
  try {
    const {render} = require('../../scripts/render-page-snapshot');
    html = render(template, await snapshots.refresh());
    rendered = true;
  }
  catch(error) { console.error('Rate HTML refresh unavailable; retaining build snapshot:',error.message); }
  return {statusCode:200, headers:{
    'Content-Type':'text/html; charset=utf-8',
    'Cache-Control':'public, max-age=0, must-revalidate',
    'Netlify-CDN-Cache-Control':'public, durable, max-age=60, stale-while-revalidate=60',
    'X-Content-Type-Options':'nosniff',
    'X-Rate-HTML':rendered ? 'server-rendered' : 'saved-snapshot',
    'X-Snapshot-Updated':String(snapshots.get().entries.market?.fetchedAt || '')
  },body:event.httpMethod==='HEAD'?'':html};
};
