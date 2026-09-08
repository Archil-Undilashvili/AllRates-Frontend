// Reuse the existing UI renderers in a network-free DOM so SSR and hydration
// share markup, precision, ordering, names and classes. Never evaluate API code.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const acorn = require('acorn');
const {parseHTML} = require('linkedom');
const ROOT = process.env.ALLRATES_ROOT || path.resolve(__dirname, '..');
function declarations(source) {
  const found = new Map();
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'FunctionDeclaration' && node.id) found.set(node.id.name, source.slice(node.start, node.end));
    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier' && node.init && !found.has(node.id.name)) found.set(node.id.name, `const ${source.slice(node.start, node.end)};`);
    for (const value of Object.values(node)) if (Array.isArray(value)) value.forEach(visit); else if (value?.type) visit(value);
  }
  visit(acorn.parse(source, {ecmaVersion:'latest'}));
  return found;
}
const source = fs.readFileSync(path.join(ROOT, 'js/main.js'), 'utf8');
const defs = declarations(source);
const names = `ALL_COMPANIES BANK_COMPANIES MFO_COMPANIES KIOSK_COMPANIES DISABLED_COMPANIES DEFAULT_RATE_RELEVANCE_THRESHOLD RATE_KEY_BY_CURRENCY LOGOS COMPANY_NAMES_KA COMPANY_URLS HOME_OFFICIAL_PRIORITY HOME_OFFICIAL_META HOME_OFFICIAL_FLAG_COUNTRIES CRYPTO_NAMES CRYPTO_LOGOS CACHE_INTL_RATES_HTML_KEY normalizeCompanyKey normalizeScraperRateItem parseCompanyUpdateTime formatCompanyUpdateTime getCompanyKey getRateChannelName isAllowedBankRateChannel buildCompanyRowCounts getOfficialMarketRate getRateValues getRateRelevanceThreshold isCompanyRateOutlier renderTable renderHomePage getHomeOfficialLogo buildHomeOfficialRates renderHomeOfficialRates formatCryptoPrice formatMarketCap getCryptoLogo sortCryptoTickers renderCryptoList normalizeForexPairCode getForexAnalyticsUrl renderHomeForexRates`.split(' ');
const script = new vm.Script(names.map(name => {
  if (!defs.has(name)) throw new Error(`Missing shared UI renderer: ${name}`);
  return defs.get(name);
}).join('\n') + `
let originalData = (inputs.market || []).map(normalizeScraperRateItem).filter(r => !DISABLED_COMPANIES.has(r.baseCompany));
for (const row of originalData) for (const [cur, config] of Object.entries(RATE_KEY_BY_CURRENCY)) {
 const buy = parseFloat(row[config.buy]), sell = parseFloat(row[config.sell]);
 row[config.spread] = Number.isFinite(buy) && Number.isFinite(sell) ? sell-buy : Infinity;
}
let usdData, eurData, gbpData, rubData, tryData;
const arrays = {};
for (const [cur, config] of Object.entries(RATE_KEY_BY_CURRENCY)) arrays[cur] = [...originalData].sort((a,b) => Number(isCompanyRateOutlier(a,cur))-Number(isCompanyRateOutlier(b,cur)) || a[config.spread]-b[config.spread]);
[usdData,eurData,gbpData,rubData,tryData] = ['usd','eur','gbp','rub','try'].map(c => arrays[c]);
const currentTab='all', expandedStates={usd:true,eur:true,gbp:true,rub:true,try:true};
if (originalData.length) { for (const cur of Object.keys(arrays)) renderTable(cur); renderHomePage(); }
if (inputs.official?.[0]?.currencies) renderHomeOfficialRates(inputs.official[0].currencies, inputs.official[0].currencies.map(c=>({...c,rate:Number(c.rate)-Number(c.diff)})));
if (inputs.forex?.length) renderHomeForexRates(inputs.forex);
if (inputs.crypto?.length) {
 const tickers = inputs.crypto.filter(r=>r.symbol.endsWith('USDT') && !/(?:UP|DOWN|BULL|BEAR)USDT$/.test(r.symbol) && Number(r.lastPrice)>0);
 const bySymbol=new Map(tickers.map(r=>[r.symbol.slice(0,-4),r]));
 const meta = (inputs.cryptoMeta||[]).filter(r=>bySymbol.has(String(r.symbol).toUpperCase()));
 const selected = meta.length ? meta.map(r=>({...bySymbol.get(String(r.symbol).toUpperCase()), coinMeta:r})) : tickers.sort(sortCryptoTickers).slice(0,100);
 renderCryptoList(selected.map(r=>{const symbol=r.symbol.slice(0,-4);return {symbol,name:r.coinMeta?.name||CRYPTO_NAMES[symbol]||symbol,price:formatCryptoPrice(Number(r.lastPrice)),change:Number(r.priceChangePercent).toFixed(1),logo:r.coinMeta?.image||getCryptoLogo(symbol),marketCap:r.coinMeta?.market_cap};}));
}
`);
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(html, snapshot) {
  const inputs = Object.fromEntries(Object.entries(snapshot.entries || {}).map(([key,v])=>[key,v.payload]));
  if (!Object.keys(inputs).length) return html;
  // Constrain upstream strings before interpolation in the established templates.
  inputs.market = (inputs.market || []).filter(r => typeof r.company === 'string' && !/[<>"'`\\]/.test(r.company));
  if(inputs.official?.[0]?.currencies) inputs.official=[{...inputs.official[0],currencies:inputs.official[0].currencies.filter(c=>/^[A-Z]{3}$/.test(c.code)&&Number(c.rate)>0&&Number(c.quantity)>0).map(c=>({...c,name:escape(c.name)}))}];
  if(inputs.crypto)inputs.crypto=inputs.crypto.filter(r=>/^[A-Z0-9]{2,24}$/.test(r.symbol));
  if(inputs.cryptoMeta)inputs.cryptoMeta=inputs.cryptoMeta.filter(r=>/^[a-z0-9]{2,20}$/i.test(r.symbol)).map(r=>({...r,name:escape(r.name),image:/^https:\/\/[^\s"'<>]+$/.test(r.image||'')?r.image:''}));
  const {document} = parseHTML(html);
  const sheets = inputs.sheets?.data;
  inputs.forex = Array.isArray(sheets) ? sheets.slice(1).map(row=>Object.fromEntries(sheets[0].map((key,i)=>[key,row[i]]))).filter(r=>r['Pair (Popular)'] && r['Rate (Popular)']).slice(0,10).map(r=>({Pair:r['Pair (Popular)'],Rate:r['Rate (Popular)']})) : [];
  inputs.forex=inputs.forex.filter(r=>/^[A-Z]{3}\s*\/?\s*[A-Z]{3}$/i.test(r.Pair)&&Number(r.Rate)>0);
  const rates = {};
  inputs.official?.[0]?.currencies?.forEach(c=>{rates[c.code]=Number(c.rate)/Number(c.quantity||1);});
  const cache = new Map([['cachedNBGData', JSON.stringify({marketOfficialRates:rates})]]);
  const setText = (id,value) => {const el=document.getElementById(id);if(el)el.textContent=String(value);};
  const sandbox = {document, inputs, console, URL, URLSearchParams, Intl, IS_LOCAL_FRONTEND:true,
    localStorage:{getItem:k=>cache.get(k)||null,setItem:(k,v)=>cache.set(k,v)},
    flashLiveValue:()=>'', filterMarketList:()=>{}, hydrateForexRateLinks:()=>{}, startForexMarketTicks:()=>{}, fetchHomeMarketHistoryRates:()=>{},
    setLiveInnerText:setText, setInnerText:setText, setInnerHTML:(id,v)=>{const e=document.getElementById(id);if(e)e.innerHTML=v;}, setLiveInnerHTML:(id,v)=>{const e=document.getElementById(id);if(e)e.innerHTML=v;},
  };
  vm.createContext(sandbox);
  script.runInContext(sandbox, {timeout:4000});
  for (const cur of ['usd','eur','gbp','rub','try']) {
    const body = document.getElementById(`${cur}-body`);
    if (!body) continue;
    Array.from(body.children).slice(10).forEach(row=>{row.hidden=true;row.classList.add('snapshot-overflow-row');});
    const button=document.getElementById(`${cur}-expand-btn`);
    if(button)button.innerHTML='მეტის ნახვა &#9660;';
  }
  if (document.getElementById('ratesBody') && inputs.official?.[0]?.currencies) {
    const sorted=[...inputs.official[0].currencies].sort((a,b)=>({USD:1,EUR:2,GBP:3,RUB:4}[a.code]||99)-({USD:1,EUR:2,GBP:3,RUB:4}[b.code]||99)||a.code.localeCompare(b.code));
    document.getElementById('ratesBody').innerHTML=sorted.map(c=>`<tr><td><div class="code-cell"><img src="https://flagcdn.com/w40/${c.code.slice(0,2).toLowerCase()}.png" alt="${escape(c.code)}" class="currency-flag"><span>${escape(c.code)}</span></div></td><td><span class="currency-name">${escape(c.name)}</span>${c.quantity>1?`<span class="quantity-badge">${c.quantity} ერთეული</span>`:''}</td><td><span class="rate-cell">${Number(c.rate).toFixed(4)}</span></td><td><span class="diff-cell ${c.diff>0?'diff-up':c.diff<0?'diff-down':'diff-none'}"><span>${c.diff>0?'&#9650;':c.diff<0?'&#9660;':''}</span><span>${Math.abs(Number(c.diff)).toFixed(4)}</span></span></td></tr>`).join('');
    document.getElementById('tableWrapper').style.display='block';
  }
  const pairRoot=document.querySelector('[data-pair-page]:not([data-analytics-page])');
  if(pairRoot && inputs.official?.[0]?.currencies) {
    const code=pairRoot.dataset.pair.slice(0,3).toUpperCase();
    const item=inputs.official[0].currencies.find(c=>c.code===code);
    if(item) {
      const rate=Number(item.rate)/Number(item.quantity||1),diff=Number(item.diff)/Number(item.quantity||1);
      const date=new Intl.DateTimeFormat('ka-GE',{dateStyle:'medium',timeZone:'Asia/Tbilisi'}).format(new Date(item.validFromDate));
      for(const [selector,text] of [['[data-rate-main]',`${rate.toFixed(4)} GEL`],['[data-official-diff]',`${diff>0?'+':''}${diff.toFixed(4)}`],['[data-official-previous]',(rate-diff).toFixed(4)],['[data-rate-updated]',date],['[data-board-date]',date]]){const el=document.querySelector(selector);if(el)el.textContent=text;}
      document.querySelectorAll('[data-board-code]').forEach(tile=>{const c=inputs.official[0].currencies.find(c=>c.code===tile.dataset.boardCode);if(!c)return;const d=Number(c.diff)/Number(c.quantity||1);tile.querySelector('[data-board-rate]').textContent=(Number(c.rate)/Number(c.quantity||1)).toFixed(4);const node=tile.querySelector('[data-board-diff]');node.textContent=`${d>0?'+':''}${d.toFixed(4)}`;node.className=`asset-rate-tile-diff ${d>0?'up':d<0?'down':'flat'}`;});
      document.querySelectorAll('meta[name="description"],meta[property="og:description"]').forEach(el=>el.content=el.content.replace(/1 [A-Z]{3} = [\d.]+ GEL/,`1 ${code} = ${rate.toFixed(4)} GEL`));
      for(const schema of document.querySelectorAll('script[type="application/ld+json"]')){const data=JSON.parse(schema.textContent);for(const entity of data['@graph']||[])if(entity['@type']==='WebPage'){entity.dateModified=item.date;entity.description=document.querySelector('meta[name="description"]').content;}schema.textContent=JSON.stringify(data).replace(/</g,'\\u003c');}
    }
  }
  if (inputs.market?.length || inputs.official?.length) {const loader=document.getElementById('loader');if(loader)loader.style.display='none';}
  const old=document.getElementById('initial-page-snapshot');if(old)old.remove();
  const boot=document.createElement('script');boot.id='initial-page-snapshot';boot.type='application/json';
  boot.textContent=JSON.stringify({market:document.getElementById('usd-body')||document.getElementById('home-usd-market-buy')?inputs.market:undefined,sheets:document.getElementById('intl-rates-container')?inputs.sheets:undefined,official:inputs.official,updatedAt:Object.fromEntries(Object.entries(snapshot.entries).map(([k,v])=>[k,v.fetchedAt]))}).replace(/</g,'\\u003c');
  document.head.append(boot);
  document.querySelectorAll('noscript').forEach(el=>{if(el.textContent.includes('.snapshot-overflow-row[hidden]'))el.remove();});
  const nojs=document.createElement('noscript');nojs.innerHTML='<style>.snapshot-overflow-row[hidden]{display:table-row!important}</style>';document.body.append(nojs);
  return document.toString();
}
module.exports = {render};
