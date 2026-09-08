// Shared, bounded upstream cache. Only public spot prices; never chart history.
const fs = require('node:fs');
const path = require('node:path');
const ROOT = process.env.ALLRATES_ROOT || path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'seo/page-snapshot.json');
const remote = 'https://allrates-backend-api.onrender.com';
// A local development backend may intentionally have its collectors disabled.
// Use the live public source unless an explicit backend override is supplied.
const backend = process.env.RATES_BACKEND_URL || remote;
const SOURCES = {
  market: {ttl: 60000, urls:[`${backend}/api/rates/latest`, `${remote}/api/rates/latest`], valid: p => Array.isArray(p) && p.length >= 10 && p.some(r => Number(r.usdBuy) > 0)},
  official: {ttl: 900000, urls:['https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json/'], valid: p => Array.isArray(p?.[0]?.currencies) && p[0].currencies.length >= 20 && p[0].currencies.some(r => r.code === 'USD' && r.rate > 0)},
  sheets: {ttl: 300000, urls:[`${backend}/api/data`, `${remote}/api/data`], valid: p => Array.isArray(p?.data) && p.data.length > 1},
  crypto: {ttl: 60000, urls:['https://data-api.binance.vision/api/v3/ticker/24hr'], valid: p => Array.isArray(p) && p.some(r => r.symbol === 'BTCUSDT' && Number(r.lastPrice) > 0)},
  cryptoMeta: {ttl: 3600000, urls:['https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h'], valid: p => Array.isArray(p) && p.length > 10 && p[0].symbol}
};
function createCache({sources = SOURCES, fetcher = fetch, now = Date.now, file = FILE, persist = true} = {}) {
  let entries = {};
  try { entries = JSON.parse(fs.readFileSync(file, 'utf8')).entries || {}; } catch (_) {}
  const pending = new Map(), retry = new Map();
  async function refreshSource(key, force = false) {
    if (pending.has(key)) return pending.get(key);
    const source = sources[key], hit = entries[key];
    if (!force && ((hit && now() - hit.fetchedAt < source.ttl) || (retry.get(key) || 0) > now())) return hit;
    const task = (async () => {
      let lastError;
      for (const url of [...new Set(source.urls)]) {
        try {
          const response = await fetcher(url, {signal: AbortSignal.timeout(12000), headers:{accept:'application/json'}});
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const payload = await response.json();
          if (!source.valid(payload)) throw new Error('Invalid/incomplete payload');
          entries[key] = {fetchedAt: now(), source: url, payload};
          retry.delete(key);
          return entries[key];
        } catch (error) { lastError = error; }
      }
      retry.set(key, now() + 60000);
      console.warn(`Snapshot ${key}: ${lastError.message}; retaining last successful data.`);
      return hit;
    })().finally(() => pending.delete(key));
    pending.set(key, task);
    return task;
  }
  async function refresh(force = false) {
    await Promise.all(Object.keys(sources).map(key => refreshSource(key, force)));
    if (file && persist) {
      fs.mkdirSync(path.dirname(file), {recursive:true});
      const temporary = `${file}.${process.pid}.${now()}.tmp`;
      fs.writeFileSync(temporary, JSON.stringify({entries}));
      fs.renameSync(temporary, file);
    }
    return {entries};
  }
  return {refresh, refreshSource, get: () => ({entries}), version: () => Object.entries(entries).map(([k,v]) => `${k}:${v.fetchedAt}`).join('|')};
}
module.exports = {createCache, SOURCES};
