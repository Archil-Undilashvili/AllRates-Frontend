const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {parseHTML}=require('linkedom');
const {createCache}=require('./page-snapshot');
const {render}=require('./render-page-snapshot');
const {optimize}=require('./optimize-markup');
const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');

test('shared cache deduplicates, expires, backs off and preserves last successful data',async()=>{
 let calls=0,time=100000,fail=false;
 const fetcher=async()=>{calls++;await new Promise(r=>setTimeout(r,10));return {ok:!fail,status:fail?503:200,json:async()=>[{price:2.6}]};};
 const cache=createCache({file:null,now:()=>time,fetcher,sources:{market:{ttl:1000,urls:['https://example.test/rates'],valid:p=>p?.[0]?.price>0}}});
 assert.equal(calls,0);
 await Promise.all(Array.from({length:8},()=>cache.refresh()));assert.equal(calls,1);
 await cache.refresh();assert.equal(calls,1);
 const initial=cache.get().entries.market;
 time+=1001;fail=true;await cache.refresh();assert.equal(calls,2);
 assert.deepEqual(cache.get().entries.market,initial);
 await cache.refresh();assert.equal(calls,2);
 time+=60001;fail=false;await cache.refresh();assert.equal(calls,3);
 assert.equal(cache.get().entries.market.fetchedAt,time);
});

test('incomplete API payload cannot overwrite valid cache',async()=>{
 let payload=[{rate:2}],time=0;
 const cache=createCache({file:null,now:()=>time,fetcher:async()=>({ok:true,json:async()=>payload}),sources:{official:{ttl:100,urls:['https://example.test/official'],valid:p=>p?.[0]?.rate>0}}});
 await cache.refresh();payload=[];time=101;await cache.refresh();assert.deepEqual(cache.get().entries.official.payload,[{rate:2}]);
});

test('raw HTML contains full currencies, companies, Forex and crypto with unchanged top-10 layout',()=>{
 const snapshot=JSON.parse(read('seo/page-snapshot.json'));
 const rates=parseHTML(render(read('rates.html'),snapshot)).document;
 for(const code of ['usd','eur','gbp','rub','try']){
   const rows=[...rates.querySelectorAll(`#${code}-body tr`)];
   assert.ok(rows.length>=10,`${code}: full rows missing`);
   assert.equal(rows.filter(r=>!r.hidden).length,10);
   assert.ok(rows.every(r=>r.children.length===6));
 }
 const official=parseHTML(render(read('official.html'),snapshot)).document;
 assert.equal(official.querySelectorAll('#ratesBody tr').length,snapshot.entries.official.payload[0].currencies.length);
 const home=parseHTML(optimize(render(read('index.html'),snapshot))).document;
 assert.ok(home.querySelectorAll('#home-official-list .home-section').length>=20);
 assert.equal(home.querySelectorAll('#intl-rates-container a[href^="/analytics?"]').length,10);
 assert.ok(home.querySelectorAll('#crypto-rates-list a[href^="/analytics?"]').length>=10);
 assert.equal(home.querySelectorAll('.home-section[onclick]').length,0);
 assert.equal(home.querySelectorAll('a.interactive-card[href^="/rates#"]').length,5);
});

test('fresh source values propagate to initial HTML, keeping actual publication dates',()=>{
 const snapshot=JSON.parse(read('seo/page-snapshot.json'));
 const usd=snapshot.entries.official.payload[0].currencies.find(c=>c.code==='USD');
  usd.rate=2.7654;usd.diff=.01;
  usd.validFromDate='2026-09-09T00:00:00.000Z';
 const html=render(read('official-rates/usd-gel.html'),snapshot),doc=parseHTML(html).document;
 assert.equal(doc.querySelector('[data-rate-main]').textContent,'2.7654 GEL');
 assert.ok(doc.querySelector('meta[name="description"]').content.includes('2.7654'));
  assert.equal(doc.querySelector('[data-official-previous]').textContent,'2.7554');
  assert.equal(doc.querySelector('[data-rate-updated]').textContent,new Intl.DateTimeFormat('ka-GE',{dateStyle:'medium',timeZone:'Asia/Tbilisi'}).format(new Date(usd.validFromDate)));
});

test('optimization preserves layout metadata, headings and script ordering',()=>{
 const doc=parseHTML(optimize(read('analytics.html'))).document;
 assert.equal(doc.querySelectorAll('h1').length,1);
 assert.equal(doc.querySelector('h1').id,'asset-chart-title');
 assert.equal(doc.querySelector('.analytics-intro'),null);
 const scripts=[...doc.querySelectorAll('script[src]')];
 const chart=scripts.findIndex(s=>s.dataset.source==='https://cdn.jsdelivr.net/npm/chart.js');
 const controller=scripts.findIndex(s=>s.dataset.source==='/js/pair-page.js');
 assert.ok(chart>=0&&chart<controller);
 assert.ok(scripts[chart].hasAttribute('defer'));
 const articles=parseHTML(read('articles.html')).document;
 assert.ok([...articles.querySelectorAll('.article-tile img')].every(img=>img.hasAttribute('width')&&img.hasAttribute('height')&&img.getAttribute('srcset')?.includes('.webp')));
 for(const asset of Object.values(JSON.parse(read('seo/assets-manifest.json')).assets))assert.ok(fs.existsSync(path.join(ROOT,asset)));
});
