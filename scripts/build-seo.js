const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OFFLINE = process.argv.includes('--offline');
const MARKET_API = 'https://allrates-backend-api.onrender.com/api/rates/latest';
const NBG_API = 'https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json/';
const SNAPSHOT_FILE = path.join(ROOT, 'seo', 'rates-snapshot.json');
const ARTICLE_DATA_FILE = path.join(ROOT, 'content', 'articles.json');
const {optimize} = require('./optimize-markup');

const PAIRS = {
  USD: {
    slug: 'usd-gel', pair: 'USD/GEL', pairKey: 'usdgel', name: 'აშშ დოლარი', flag: '/Logos/US.png',
    bounds: [1, 5],
    context: 'აშშ დოლარი საქართველოში უძრავი ქონების, ავტომობილების, იმპორტის, საერთაშორისო მომსახურებებისა და დანაზოგების ერთ-ერთი ყველაზე გავრცელებული ვალუტაა. USD/GEL-ზე გავლენას ახდენს როგორც ადგილობრივი მოთხოვნა-მიწოდება, ისე გლობალური დოლარის მოძრაობა, ფედერალური რეზერვის პოლიტიკა და კაპიტალის ნაკადები.'
  },
  EUR: {
    slug: 'eur-gel', pair: 'EUR/GEL', pairKey: 'eurgel', name: 'ევრო', flag: '/Logos/EU.png',
    bounds: [1, 6],
    context: 'ევრო განსაკუთრებით მნიშვნელოვანია საქართველოსა და ევროკავშირს შორის ვაჭრობის, ტურიზმის, განათლებისა და ფულადი გზავნილებისთვის. EUR/GEL ხშირად ერთდროულად რეაგირებს USD/GEL-ისა და საერთაშორისო EUR/USD წყვილის მოძრაობაზე, ამიტომ მისი ცვლილება მხოლოდ ლარის მდგომარეობით არ აიხსნება.'
  },
  GBP: {
    slug: 'gbp-gel', pair: 'GBP/GEL', pairKey: 'gbpgel', name: 'ბრიტანული ფუნტი', flag: '/Logos/GB.png',
    bounds: [1, 8],
    context: 'ბრიტანული ფუნტი საჭიროა გაერთიანებულ სამეფოში სწავლის, მოგზაურობის, ონლაინ შესყიდვებისა და ფულადი გზავნილებისთვის. საქართველოში GBP-ის ბაზარი USD-სა და EUR-ზე შედარებით ნაკლებად ლიკვიდურია, რის გამოც სხვადასხვა მიმწოდებლის ყიდვა-გაყიდვის სხვაობა ხშირად უფრო ფართოა.'
  },
  RUB: {
    slug: 'rub-gel', pair: 'RUB/GEL', pairKey: 'rubgel', name: 'რუსული რუბლი', flag: '/Logos/RU.png',
    bounds: [0.005, 0.2],
    context: 'რუსული რუბლი საქართველოსთვის დაკავშირებულია ვაჭრობასთან, ტურიზმთან და ფულად გზავნილებთან. RUB შეიძლება მაღალი მერყეობით გამოირჩეოდეს რეგიონული, მონეტარული და სანქციებთან დაკავშირებული ფაქტორების გამო. ეროვნული ბანკი ოფიციალურ ცხრილში კურსს 100 RUB-ისთვის აქვეყნებს, ამ გვერდებზე კი შედარებისთვის 1 RUB-ის ფასი ჩანს.'
  },
  TRY: {
    slug: 'try-gel', pair: 'TRY/GEL', pairKey: 'trygel', name: 'თურქული ლირა', flag: '/Logos/TR.png',
    bounds: [0.005, 0.5],
    context: 'თურქული ლირა მნიშვნელოვანია საქართველო-თურქეთის ვაჭრობის, ტურიზმისა და ყოველდღიური საზღვრისპირა ოპერაციებისთვის. TRY/GEL-ზე მოქმედებს როგორც ლარის მოძრაობა, ისე თურქეთში ინფლაცია, საპროცენტო განაკვეთები და ლირის საერთაშორისო ფასი.'
  }
};

const REDIRECTED_FILES = new Set([
  'valutis-kursi.html', 'valutis-kursebi.html', 'laris-kursi.html', 'valutis-kursebi-dges.html',
  'dolaris-kursi.html', 'evros-kursi.html', 'funtis-kursi.html', 'rublis-kursi.html', 'liris-kursi.html',
  'erovnuli-bankis-kursi.html', 'bankebis-kursebi.html', 'jixurebis-kursebi.html',
  'valutis-gacvla.html', 'valutis-kalkulatori.html', 'valutis-konvertacia.html',
  'bitcoinis-fasi.html', 'kriptovalutis-kursebi.html', 'oqros-fasi.html'
]);

function read(relativePath) { return fs.readFileSync(path.join(ROOT, relativePath), 'utf8'); }
function write(relativePath, value) {
  if (/^<!doctype html/i.test(value)) value = optimize(value);
  const target = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value);
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);
}
function stripHtml(value) {
  return String(value || '').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function format(value, code) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(['RUB', 'TRY'].includes(code) ? 4 : 4) : '—';
}
function formatDate(value, includeTime = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || '');
  return new Intl.DateTimeFormat('ka-GE', {
    dateStyle: 'medium',
    ...(includeTime ? { timeStyle: 'short' } : {}),
    timeZone: 'Asia/Tbilisi'
  }).format(date);
}

function computeMarketSnapshot(rows) {
  const result = {};
  for (const [code, meta] of Object.entries(PAIRS)) {
    const lower = code.toLowerCase();
    const values = (Array.isArray(rows) ? rows : []).map(row => ({
      buy: Number(row[`${lower}Buy`]),
      sell: Number(row[`${lower}Sell`]),
      updatedAt: row.createdAt,
      company: row.company
    })).filter(item => Number.isFinite(item.buy) && Number.isFinite(item.sell)
      && item.buy > meta.bounds[0] && item.buy < meta.bounds[1]
      && item.sell > meta.bounds[0] && item.sell < meta.bounds[1]
      && item.sell > item.buy)
      .sort((a, b) => (a.sell - a.buy) - (b.sell - b.buy))
      .slice(0, 10);
    if (!values.length) throw new Error(`No valid market rates for ${code}`);
    const buy = values.reduce((sum, item) => sum + item.buy, 0) / values.length;
    const sell = values.reduce((sum, item) => sum + item.sell, 0) / values.length;
    result[code] = {
      buy, sell, spread: sell - buy, mid: (buy + sell) / 2,
      count: values.length,
      updatedAt: values.map(item => item.updatedAt).filter(Boolean).sort().pop()
    };
  }
  return result;
}

function computeOfficialSnapshot(payload) {
  const root = Array.isArray(payload) ? payload[0] : null;
  if (!root?.currencies) throw new Error('Invalid NBG payload');
  const result = {};
  for (const code of [...Object.keys(PAIRS), 'CHF']) {
    const item = root.currencies.find(currency => currency.code === code);
    if (!item) throw new Error(`No official rate for ${code}`);
    const quantity = Number(item.quantity || 1);
    result[code] = {
      rate: Number(item.rate) / quantity,
      diff: Number(item.diff || 0) / quantity,
      quantity,
      publishedRate: Number(item.rate),
      validFrom: item.validFromDate || root.date,
      updatedAt: item.date || root.date
    };
  }
  return result;
}

async function getSnapshot(fullSnapshot) {
  if (OFFLINE) return JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
  if (fullSnapshot?.entries?.market && fullSnapshot?.entries?.official) {
    const result={generatedAt:new Date(Math.min(fullSnapshot.entries.market.fetchedAt,fullSnapshot.entries.official.fetchedAt)).toISOString(),market:computeMarketSnapshot(fullSnapshot.entries.market.payload),official:computeOfficialSnapshot(fullSnapshot.entries.official.payload)};
    fs.writeFileSync(SNAPSHOT_FILE,JSON.stringify(result,null,2));
    return result;
  }
  try {
    const [marketResponse, officialResponse] = await Promise.all([
      fetch(MARKET_API, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(20000) }),
      fetch(NBG_API, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(20000) })
    ]);
    if (!marketResponse.ok || !officialResponse.ok) throw new Error(`Snapshot HTTP error ${marketResponse.status}/${officialResponse.status}`);
    const snapshot = {
      generatedAt: new Date().toISOString(),
      market: computeMarketSnapshot(await marketResponse.json()),
      official: computeOfficialSnapshot(await officialResponse.json())
    };
    fs.mkdirSync(path.dirname(SNAPSHOT_FILE), { recursive: true });
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2));
    return snapshot;
  } catch (error) {
    if (process.argv.includes('--strict')) throw error;
    if (fs.existsSync(SNAPSHOT_FILE)) {
      console.warn(`Live snapshot failed (${error.message}); using saved snapshot.`);
      return JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
    }
    throw error;
  }
}

function replaceMarked(html, marker, content) {
  const start = `<!-- ${marker}_START -->`;
  const end = `<!-- ${marker}_END -->`;
  const block = `${start}\n${content}\n${end}`;
  if (html.includes(start) && html.includes(end)) {
    return html.replace(new RegExp(`${start}[\\s\\S]*?${end}`, 'g'), block);
  }
  return html;
}

function injectSharedLayout(html) {
  const header = `<!-- STATIC_HEADER_START -->\n${read('partials/header.html')}\n<!-- STATIC_HEADER_END -->`;
  const footer = `<!-- STATIC_FOOTER_START -->\n${read('partials/footer.html')}\n<!-- STATIC_FOOTER_END -->`;
  if (html.includes('<!-- STATIC_HEADER_START -->')) html = replaceMarked(html, 'STATIC_HEADER', read('partials/header.html'));
  else html = html.replace(/<script\s+src=["'](?:\/)?js\/header\.js(?:\?[^"']*)?["']\s*><\/script>/i, header);
  if (!html.includes('<!-- STATIC_HEADER_START -->')) html = html.replace(/<body([^>]*)>/i, `<body$1>\n${header}`);
  if (html.includes('<!-- STATIC_FOOTER_START -->')) html = replaceMarked(html, 'STATIC_FOOTER', read('partials/footer.html'));
  else html = html.replace(/<script\s+src=["'](?:\/)?js\/footer\.js(?:\?[^"']*)?["']\s*><\/script>/i, footer);
  if (!html.includes('<!-- STATIC_FOOTER_START -->')) html = html.replace('</body>', `${footer}\n</body>`);
  if (!html.includes('/css/pair-pages.css')) html = html.replace('</head>', '    <link rel="stylesheet" href="/css/pair-pages.css?v=1">\n</head>');
  return html;
}

function ensureHeading(html, title, description, className = 'seo-page-heading') {
  if (/<h1\b/i.test(html)) return html;
  const heading = `<div class="${className}"><h1>${escapeHtml(title)}</h1>${description ? `<p>${escapeHtml(description)}</p>` : ''}</div>`;
  if (html.includes('<!-- STATIC_HEADER_END -->')) return html.replace('<!-- STATIC_HEADER_END -->', `<!-- STATIC_HEADER_END -->\n${heading}`);
  return html.replace(/<body([^>]*)>/i, `<body$1>\n${heading}`);
}

function setElementText(html, id, value) {
  const pattern = new RegExp(`(<[^>]+id=["']${id}["'][^>]*>)[\\s\\S]*?(<\\/[^>]+>)`, 'i');
  return html.replace(pattern, `$1${escapeHtml(value)}$2`);
}

function officialHomeMarkup(snapshot) {
  return Object.entries(PAIRS).map(([code, meta]) => {
    const item = snapshot.official[code];
    const change = `${item.diff > 0 ? '+' : ''}${format(item.diff, code)}`;
    const changeClass = item.diff > 0 ? 'home-official-change-negative' : item.diff < 0 ? 'home-official-change-positive' : 'home-official-change-neutral';
    return `<div class="home-section" data-market-search="${code.toLowerCase()} ${escapeHtml(meta.name)}"><div class="section-title home-official-section-title"><img src="${meta.flag}" alt="${code} დროშა" width="40" height="40"><span>${code} / ${escapeHtml(meta.name)}</span></div><div class="rates-flex home-official-rate-row"><div class="rate-block home-official-rate-block"><div class="home-official-values"><span class="rate-value buy home-split-main">${format(item.rate, code)}</span><span class="rate-value home-official-change ${changeClass}">${change}</span></div></div></div></div>`;
  }).join('\n');
}

function patchHomepage(snapshot) {
  let html = injectSharedLayout(read('index.html'));
  html = html.replace(/\s*<div class="home-seo-hero">[\s\S]*?<\/div>\s*/g, '\n');
  html = html.replace(/\s*<!-- CURRENCY_HUB_START -->[\s\S]*?<!-- CURRENCY_HUB_END -->\s*/g, '\n');
  if (!/<h1\b/i.test(html)) {
    html = html.replace(
      '<span>\n                        <svg class="home-title-icon"',
      '<h1 class="home-card-title-h1">\n                        <svg class="home-title-icon"'
    ).replace(
      'საბაზრო კურსები <span class="live-badge"><span class="live-dot"></span>LIVE</span>\n                    </span>',
      'საბაზრო კურსები <span class="live-badge"><span class="live-dot"></span>LIVE</span>\n                    </h1>'
    );
  }
  for (const [code, item] of Object.entries(snapshot.market)) {
    const lower = code.toLowerCase();
    html = setElementText(html, `home-${lower}-market-buy`, format(item.buy, code));
    html = setElementText(html, `home-${lower}-market-sell`, format(item.sell, code));
    html = setElementText(html, `home-${lower}-market-spread`, format(item.spread, code));
  }
  html = setElementText(html, 'home-official-date-note', `მოქმედებს: ${formatDate(snapshot.official.USD.validFrom)}`);
  if (!html.includes('<!-- SEO_OFFICIAL_SNAPSHOT_START -->')) {
    html = html.replace('<div class="home-section">\n                        <div class="section-title">იტვირთება...</div>\n                    </div>', `<!-- SEO_OFFICIAL_SNAPSHOT_START -->\n${officialHomeMarkup(snapshot)}\n<!-- SEO_OFFICIAL_SNAPSHOT_END -->`);
  } else html = replaceMarked(html, 'SEO_OFFICIAL_SNAPSHOT', officialHomeMarkup(snapshot));
  write('index.html', html);
}

function patchRates(snapshot) {
  let html = injectSharedLayout(read('rates.html'));
  html = ensureHeading(html, 'საბაზრო ვალუტის კურსების შედარება', 'შეადარე ბანკების, მიკროსაფინანსოებისა და სავალუტო ჯიხურების მიმდინარე ყიდვა-გაყიდვის კურსები.');
  html = html.replace('<p>შეადარე ბანკების, მიკროსაფინანსოებისა და სავალუტო ჯიხურების მიმდინარე ყიდვა-გაყიდვის კურსები.</p>', '');
  for (const [code, item] of Object.entries(snapshot.market)) {
    const lower = code.toLowerCase();
    html = setElementText(html, `${lower}-market-buy`, format(item.buy, code));
    html = setElementText(html, `${lower}-market-sell`, format(item.sell, code));
    html = setElementText(html, `${lower}-market-spread`, format(item.spread, code));
  }
  write('rates.html', html);
}

function patchOfficial(snapshot) {
  let html = injectSharedLayout(read('official.html'));
  const rows = Object.entries(PAIRS).map(([code, meta]) => {
    const item = snapshot.official[code];
    return `<tr><td><strong>${code}</strong></td><td>${escapeHtml(meta.name)}</td><td>${format(item.rate, code)} GEL</td><td>${item.diff > 0 ? '+' : ''}${format(item.diff, code)}</td></tr>`;
  }).join('\n');
  html = html.replace(/<div id="loader" class="loader"[^>]*>[\s\S]*?<\/div>\s*<div class="official-table-wrapper" id="tableWrapper" style="display: none;">/i, `<div id="loader" class="loader" style="display:none"></div>\n<div class="official-table-wrapper" id="tableWrapper" style="display:block;">`);
  html = html.replace(/<tbody id="ratesBody">[\s\S]*?<\/tbody>/i, `<tbody id="ratesBody">\n<!-- SEO_OFFICIAL_TABLE_START -->\n${rows}\n<!-- SEO_OFFICIAL_TABLE_END -->\n</tbody>`);
  write('official.html', html);
}

function pairFaq(code, meta, type) {
  const items = type === 'market' ? [
    [`რას ნიშნავს ${meta.pair}-ის საბაზრო კურსი?`, `საბაზრო კურსი აჩვენებს ვალუტის გადამცვლელი კომპანიებისა და ფინანსური ორგანიზაციების რეალურ ყიდვა-გაყიდვის შეთავაზებებს. ის შეიძლება დღის განმავლობაში რამდენჯერმე შეიცვალოს.`],
    ['რატომ განსხვავდება ყიდვის და გაყიდვის ფასი?', 'კომპანია ვალუტას შედარებით დაბალ ფასად ყიდულობს და უფრო მაღალ ფასად ყიდის. ამ ორ მნიშვნელობას შორის სხვაობას სპრედი ეწოდება.'],
    [`რით განსხვავდება ${meta.pair}-ის საბაზრო და ოფიციალური კურსი?`, 'საბაზრო კურსი კომერციული შეთავაზებების საშუალო სურათია, ოფიციალური კურსი კი საქართველოს ეროვნული ბანკის მიერ დადგენილი ინდიკატიური მაჩვენებელი.']
  ] : [
    [`ვინ აქვეყნებს ${meta.pair}-ის ოფიციალურ კურსს?`, 'ოფიციალურ კურსს საქართველოს ეროვნული ბანკი აქვეყნებს ბანკთაშორისი სავალუტო ბაზრის მონაცემებზე დაყრდნობით.'],
    ['შეიძლება ოფიციალური კურსით ვალუტის ყიდვა?', 'ოფიციალური კურსი ინდიკატიური მაჩვენებელია. ბანკისა და გადამცვლელი პუნქტის რეალური ყიდვა-გაყიდვის ფასი შეიძლება განსხვავდებოდეს.'],
    [`რამდენ ერთეულზეა ნაჩვენები ${code}-ის კურსი?`, `ამ გვერდზე ყველა მნიშვნელობა ნორმალიზებულია და აჩვენებს 1 ${code}-ის ფასს ქართულ ლარში. ეროვნული ბანკის საწყის ცხრილში ზოგი ვალუტა შეიძლება 10, 100 ან 1000 ერთეულით ქვეყნდებოდეს.`]
  ];
  return { items, html: items.map(([q, a]) => `<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join('') };
}

function pairPage(snapshot, code, type, analyticsOnly = false) {
  const meta = PAIRS[code];
  const market = snapshot.market[code];
  const official = snapshot.official[code];
  const isMarket = type === 'market';
  const isAssetDetailPage = type === 'official';
  const route = `/${isMarket ? 'market-rates' : 'official-rates'}/${meta.slug}`;
  const sibling = `/${isMarket ? 'official-rates' : 'market-rates'}/${meta.slug}`;
  const typeKa = isMarket ? 'საბაზრო' : 'ოფიციალური';
  const title = `${meta.pair} ${typeKa} კურსი დღეს | AllRates.ge`;
  const description = isMarket
    ? `${meta.pair} საბაზრო კურსი დღეს: მიმდინარე საშუალო ყიდვა ${format(market.buy, code)}, გაყიდვა ${format(market.sell, code)}, სპრედი და ისტორიული გრაფიკი.`
    : `${meta.pair} ოფიციალური კურსი დღეს ეროვნული ბანკის მონაცემებით: 1 ${code} = ${format(official.rate, code)} GEL. ისტორია და ინტერაქტიული გრაფიკი.`;
  const faq = pairFaq(code, meta, type);
  const structuredData = {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'WebPage', '@id': `https://allrates.ge${route}#webpage`, url: `https://allrates.ge${route}`, name: title, description, inLanguage: 'ka-GE', dateModified: snapshot.generatedAt },
      { '@type': 'Dataset', name: `${meta.pair} ${typeKa} კურსის ისტორია`, description: `${meta.pair} ${typeKa} კურსის მიმდინარე მნიშვნელობა და ისტორიული გრაფიკი.`, url: `https://allrates.ge${route}`, creator: { '@type': 'Organization', name: 'AllRates.ge', url: 'https://allrates.ge/' } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'მთავარი', item: 'https://allrates.ge/' },
        { '@type': 'ListItem', position: 2, name: `${typeKa} კურსები`, item: `https://allrates.ge/${isMarket ? 'rates' : 'official'}` },
        { '@type': 'ListItem', position: 3, name: meta.pair, item: `https://allrates.ge${route}` }
      ] },
      { '@type': 'FAQPage', mainEntity: faq.items.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) }
    ]
  };
  const primaryValue = isMarket ? market.mid : official.rate;
  const rateCard = isMarket
    ? `<span class="pair-rate-label">საბაზრო საშუალო კურსი</span><strong class="pair-rate-main" data-rate-main>${format(primaryValue, code)}</strong><div class="pair-market-grid"><div class="pair-market-stat buy"><span>ყიდვა</span><strong data-rate-buy>${format(market.buy, code)}</strong></div><div class="pair-market-stat sell"><span>გაყიდვა</span><strong data-rate-sell>${format(market.sell, code)}</strong></div><div class="pair-market-stat"><span>სპრედი</span><strong data-rate-spread>${format(market.spread, code)}</strong></div></div><div class="pair-rate-meta">ტოპ ${market.count} ვალიდური შეთავაზების საშუალო · განახლდა <span data-rate-updated>${escapeHtml(formatDate(market.updatedAt, true))}</span></div>`
    : isAssetDetailPage
      ? `<span class="pair-rate-label">1 ${code} =</span><strong class="pair-rate-main" data-rate-main>${format(primaryValue, code)} GEL</strong><div class="pair-market-grid"><div class="pair-market-stat"><span>დღიური ცვლილება</span><strong data-official-diff>${official.diff > 0 ? '+' : ''}${format(official.diff, code)}</strong></div><div class="pair-market-stat"><span>წინა კურსი</span><strong data-official-previous>${format(official.rate - official.diff, code)}</strong></div><div class="pair-market-stat"><span>მოქმედებს</span><strong data-rate-updated>${escapeHtml(formatDate(official.validFrom))}</strong></div></div><div class="pair-rate-meta">წყარო: საქართველოს ეროვნული ბანკი</div>`
      : `<span class="pair-rate-label">1 ${code} =</span><strong class="pair-rate-main" data-rate-main>${format(primaryValue, code)} GEL</strong><div class="pair-market-grid"><div class="pair-market-stat"><span>დღიური ცვლილება</span><strong data-official-diff>${official.diff > 0 ? '+' : ''}${format(official.diff, code)}</strong></div><div class="pair-market-stat"><span>NBG საწყისი რაოდენობა</span><strong>${official.quantity} ${code}</strong></div><div class="pair-market-stat"><span>მოქმედების თარიღი</span><strong>${escapeHtml(formatDate(official.validFrom))}</strong></div></div><div class="pair-rate-meta">წყარო: საქართველოს ეროვნული ბანკი · მოქმედებს <span data-rate-updated>${escapeHtml(formatDate(official.validFrom))}</span></div>`;
  const distinction = isMarket
    ? `ამ გვერდის მაჩვენებელი მიიღება მოქმედი კომერციული შეთავაზებებიდან: ვალიდური კურსები ლაგდება სპრედის მიხედვით და ნაჩვენებია საუკეთესო ათეულის საშუალო. ეს არ არის ეროვნული ბანკის კურსი და კონკრეტულ კომპანიაში საბოლოო ფასი შეიძლება განსხვავდებოდეს.`
    : `ეს გვერდი აჩვენებს მხოლოდ საქართველოს ეროვნული ბანკის ოფიციალურ, ინდიკატიურ კურსს. კომერციული ბანკი ან სავალუტო ჯიხური იყენებს საკუთარ ყიდვა-გაყიდვის ფასებს; მათი სანახავად გადადი ამავე წყვილის საბაზრო გვერდზე.`;
  const table = isMarket
    ? `<table class="pair-snapshot-table"><thead><tr><th>წყვილი</th><th>ყიდვა</th><th>გაყიდვა</th><th>სპრედი</th><th>განახლდა</th></tr></thead><tbody><tr><td>${meta.pair}</td><td>${format(market.buy, code)}</td><td>${format(market.sell, code)}</td><td>${format(market.spread, code)}</td><td>${escapeHtml(formatDate(market.updatedAt, true))}</td></tr></tbody></table>`
    : `<table class="pair-snapshot-table"><thead><tr><th>წყვილი</th><th>1 ${code}-ის ფასი</th><th>ცვლილება</th><th>მოქმედებს</th></tr></thead><tbody><tr><td>${meta.pair}</td><td>${format(official.rate, code)} GEL</td><td>${official.diff > 0 ? '+' : ''}${format(official.diff, code)}</td><td>${escapeHtml(formatDate(official.validFrom))}</td></tr></tbody></table>`;
  const related = Object.entries(PAIRS).filter(([related]) => related !== code).map(([related, relatedMeta]) => `<a href="/${isMarket ? 'market-rates' : 'official-rates'}/${relatedMeta.slug}">${relatedMeta.pair}</a>`).join('');
  const assetBoardMeta = {
    USD: { name: 'დოლარი', flag: '/Logos/US.png' },
    EUR: { name: 'ევრო', flag: '/Logos/EU.png' },
    GBP: { name: 'ფუნტი', flag: '/Logos/GB.png' },
    CHF: { name: 'ფრანკი', flag: '/Logos/CH.svg' },
    TRY: { name: 'ლირა', flag: '/Logos/TR.png' },
    RUB: { name: 'რუბლი', flag: '/Logos/RU.png' }
  };
  const assetBoard = isAssetDetailPage
    ? `<aside class="asset-rates-board" aria-labelledby="asset-rates-board-title"><div class="asset-rates-board-head"><div><span>ეროვნული ბანკი</span><h2 id="asset-rates-board-title">სხვა ოფიციალური კურსები</h2></div><span class="asset-rates-board-date" data-board-date>${escapeHtml(formatDate(official.validFrom))}</span></div><div class="asset-rates-board-grid">${Object.entries(assetBoardMeta).filter(([boardCode]) => boardCode !== code).map(([boardCode, boardMeta]) => { const item = snapshot.official[boardCode]; const diff = `${item.diff > 0 ? '+' : ''}${format(item.diff, boardCode)}`; const trend = item.diff > 0 ? 'up' : item.diff < 0 ? 'down' : 'flat'; return `<article class="asset-rate-tile" data-board-code="${boardCode}"><div class="asset-rate-tile-name"><img src="${boardMeta.flag}" alt="" width="24" height="24"><span><strong>${boardCode}</strong><small>${boardMeta.name}</small></span></div><strong class="asset-rate-tile-value" data-board-rate>${format(item.rate, boardCode)}</strong><span class="asset-rate-tile-diff ${trend}" data-board-diff>${diff}</span></article>`; }).join('')}</div></aside>`
    : '';
  const chartIcons = {
    official: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M6 17V9m4 8V9m4 8V9m4 8V9M3 7l9-4 9 4H3Z"></path></svg>',
    market: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17h16M6 13l4-4 4 4 4-6m0 0h-4m4 0v4"></path></svg>',
    forex: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21M12 3c-2.4 2.5-3.6 5.5-3.6 9s1.2 6.5 3.6 9"></path></svg>',
    crypto: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M9 8h4.2a2.2 2.2 0 0 1 0 4.4H9V8Zm0 4.4h4.7a2.3 2.3 0 0 1 0 4.6H9v-4.6ZM10 6v2m4-2v2m-4 9v2m4-2v2"></path></svg>'
  };
  const chartSection = isAssetDetailPage
    ? `<section class="pair-chart-card asset-chart-card" data-asset-chart aria-labelledby="asset-chart-title"><div class="asset-chart-toolbar"><h2 id="asset-chart-title"><span class="asset-pair-picker"><button type="button" id="asset-chart-pair-trigger" class="asset-pair-picker-trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="asset-chart-pair-menu"><span id="asset-chart-pair-label">${meta.pair}</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4"></path></svg></button><span id="asset-chart-pair-menu" class="asset-pair-picker-menu" role="listbox" aria-label="სავალუტო წყვილის არჩევა" hidden></span></span><span>კურსის დინამიკა</span></h2><div class="asset-chart-controls-row"><div class="asset-chart-market-tabs" role="tablist" aria-label="ბაზრის ტიპი"><button type="button" class="asset-chart-market-tab active" data-market="official" role="tab" aria-selected="true">${chartIcons.official}<span>ოფიციალური კურსები</span></button><button type="button" class="asset-chart-market-tab" data-market="market" role="tab" aria-selected="false">${chartIcons.market}<span>საბაზრო კურსები</span></button><button type="button" class="asset-chart-market-tab" data-market="forex" role="tab" aria-selected="false">${chartIcons.forex}<span>Forex</span></button><button type="button" class="asset-chart-market-tab" data-market="crypto" role="tab" aria-selected="false">${chartIcons.crypto}<span>კრიპტოვალუტები</span></button></div><div class="asset-chart-periods" aria-label="დროითი დიაპაზონი"></div></div></div><div class="pair-chart-wrap asset-chart-wrap"><canvas id="pair-history-chart" aria-label="${meta.pair} კურსის გრაფიკი"></canvas><div class="pair-chart-status">მონაცემები იტვირთება…</div></div></section>`
    : `<section class="pair-chart-card" aria-labelledby="pair-chart-title"><div class="pair-chart-header"><h2 id="pair-chart-title">${meta.pair} ${typeKa} კურსის დინამიკა</h2><div class="pair-periods"><button class="pair-period-btn" data-days="7">1 კვირა</button><button class="pair-period-btn active" data-days="30">1 თვე</button><button class="pair-period-btn" data-days="90">3 თვე</button><button class="pair-period-btn" data-days="365">1 წელი</button></div></div><div class="pair-chart-wrap"><canvas id="pair-history-chart" aria-label="${meta.pair} ${typeKa} კურსის გრაფიკი"></canvas><div class="pair-chart-status">მონაცემები იტვირთება…</div></div>${table}</section>`;
  const heroEyebrow = isAssetDetailPage ? `${meta.name} / ქართული ლარი` : `${typeKa} კურსი`;
  const heroTitle = isAssetDetailPage ? `${meta.pair} კურსი დღეს` : `${meta.pair} ${typeKa} კურსი დღეს`;
  const heroLead = isAssetDetailPage ? 'ეროვნული ბანკის მიმდინარე კურსი, დღიური ცვლილება და მოქმედების თარიღი.' : description;
  const heroSwitcher = isAssetDetailPage ? '' : `<div class="pair-switcher"><a href="${isMarket ? route : sibling}" ${isMarket ? 'aria-current="page"' : ''}>საბაზრო კურსი</a><a href="${isMarket ? sibling : route}" ${isMarket ? '' : 'aria-current="page"'}>ოფიციალური კურსი</a></div>`;
  const contentSection = isAssetDetailPage
    ? `<div class="pair-content-grid asset-content-grid"><article class="pair-content-card asset-about-card"><h2>${meta.pair}-ის შესახებ</h2><p>${meta.pair} აჩვენებს, რამდენი ქართული ლარია საჭირო 1 ${code}-ის შესაძენად. ${escapeHtml(meta.context)}</p><h3>როგორ გამოიყენო ეს მაჩვენებელი</h3><p>ეროვნული ბანკის კურსი ინდიკატიური მაჩვენებელია და გამოიყენება შედარებისა და სხვადასხვა ანგარიშსწორებისთვის. ბანკებისა და გადამცვლელი პუნქტების ყიდვა-გაყიდვის ფასები შეიძლება განსხვავდებოდეს.</p></article><section class="pair-content-card pair-faq"><h2>ხშირად დასმული კითხვები</h2>${faq.html}</section></div>`
    : `<div class="pair-content-grid"><article class="pair-content-card"><h2>${meta.pair}-ის შესახებ</h2><p>${escapeHtml(meta.context)}</p><h3>${typeKa} კურსის სწორად წაკითხვა</h3><p>${escapeHtml(distinction)}</p><p class="pair-source-note">მიმდინარე HTML snapshot შეიქმნა ${escapeHtml(formatDate(snapshot.generatedAt, true))}-ზე და live მონაცემი გვერდის გახსნის შემდეგ ახლდება.</p></article><section class="pair-content-card pair-faq"><h2>ხშირად დასმული კითხვები</h2>${faq.html}</section></div>`;
  const relatedSection = isAssetDetailPage ? '' : `<section class="pair-content-card"><h2>სხვა ${typeKa.toLowerCase()} სავალუტო წყვილები</h2><div class="pair-related-links">${related}</div></section>`;
  if (analyticsOnly) return `<!DOCTYPE html><html lang="ka"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>ანალიტიკა — კურსების გრაფიკები და შედარება | AllRates.ge</title><meta name="description" content="შეისწავლე ოფიციალური, საბაზრო, Forex და კრიპტოვალუტების ფასების დინამიკა და შეადარე აქტივები ინტერაქტიულ გრაფიკზე."><link rel="canonical" href="https://allrates.ge/analytics"><link rel="icon" href="/favicon-192.png"><link rel="stylesheet" href="/css/style.css?v=12"><link rel="stylesheet" href="/css/pair-pages.css?v=10"><script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script></head><body><!-- STATIC_HEADER_START -->${read('partials/header.html')}<!-- STATIC_HEADER_END --><main class="pair-page analytics-page" data-pair-page data-analytics-page data-pair="usdgel" data-rate-type="official">${chartSection}</main><!-- STATIC_FOOTER_START -->${read('partials/footer.html')}<!-- STATIC_FOOTER_END --><script src="/js/pair-comparison.js?v=2" defer></script><script src="/js/pair-page.js?v=10" defer></script></body></html>`;
  return `<!DOCTYPE html>
<html lang="ka"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="https://allrates.ge${route}"><meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="https://allrates.ge${route}"><meta property="og:image" content="https://allrates.ge${meta.flag}"><link rel="icon" href="/favicon-192.png"><link rel="stylesheet" href="/css/style.css?v=11"><link rel="stylesheet" href="/css/pair-pages.css?v=1"><script type="application/ld+json">${JSON.stringify(structuredData)}</script><script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script></head>
<body><div data-pair-page data-pair="${meta.pairKey}" data-rate-type="${type}">
<!-- STATIC_HEADER_START -->${read('partials/header.html')}<!-- STATIC_HEADER_END -->
<main class="pair-page${isAssetDetailPage ? ' asset-detail-page' : ''}">${isAssetDetailPage ? '' : `<nav class="pair-breadcrumbs" aria-label="Breadcrumb"><a href="/">მთავარი</a><span>›</span><a href="/${isMarket ? 'rates' : 'official'}">${typeKa} კურსები</a><span>›</span><span>${meta.pair}</span></nav>`}
<section class="pair-hero${isAssetDetailPage ? ' asset-detail-hero' : ''}"><div class="pair-hero-copy"><span class="pair-eyebrow"><img src="${meta.flag}" alt="" width="28" height="28">${heroEyebrow}</span><h1>${heroTitle}</h1><p class="pair-lead">${escapeHtml(heroLead)}</p>${heroSwitcher}</div><div class="pair-rate-card">${rateCard}</div></section>
${assetBoard}
${chartSection}
${contentSection}
${relatedSection}</main>
<!-- STATIC_FOOTER_START -->${read('partials/footer.html')}<!-- STATIC_FOOTER_END -->
<script src="/js/pair-comparison.js?v=2" defer></script><script src="/js/pair-page.js?v=9" defer></script></div></body></html>`;
}

function extractArticles() {
  if (fs.existsSync(ARTICLE_DATA_FILE)) return JSON.parse(fs.readFileSync(ARTICLE_DATA_FILE, 'utf8'));
  const source = read('articles.html');
  const blocks = source.match(/<article class="article-reader"[\s\S]*?<\/article>/g) || [];
  const seen = new Set();
  const articles = [];
  for (const html of blocks) {
    const slug = html.match(/data-slug="([^"]+)"/)?.[1];
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const title = stripHtml(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
    const date = html.match(/<time[^>]+datetime="([^"]+)"/)?.[1] || '';
    const image = html.match(/<img[^>]+class="article-reader-poster"[^>]+src="([^"]+)"/)?.[1] || '';
    const excerpt = stripHtml(html.match(/<div class="article-reader-body">([\s\S]*?)<\/div>\s*<\/article>/i)?.[1]).slice(0, 220);
    articles.push({ slug, title, date, image, excerpt, html });
  }
  if (!articles.length) throw new Error('No articles found for static generation');
  fs.mkdirSync(path.dirname(ARTICLE_DATA_FILE), { recursive: true });
  fs.writeFileSync(ARTICLE_DATA_FILE, JSON.stringify(articles, null, 2));
  return articles;
}

function articlePage(article, articles) {
  const canonical = `https://allrates.ge/articles/${article.slug}`;
  const description = `${article.excerpt}${article.excerpt.length >= 220 ? '…' : ''}`.slice(0, 180);
  const body = article.html
    .replace('<article class="article-reader"', '<article class="article-reader is-active"')
    .replace(/<time([^>]*)>/, `<div class="article-trust-line"><span>AllRates.ge-ის რედაქცია</span> · <time$1>`)
    .replace('</time>', '</time></div>');
  const related = articles.filter(item => item.slug !== article.slug).slice(0, 4).map(item => `<a class="article-tile" href="/articles/${item.slug}"><img src="${item.image}" alt="${escapeHtml(item.title)}" loading="lazy"><span class="article-tile-date">${escapeHtml(formatDate(item.date))}</span><strong>${escapeHtml(item.title)}</strong></a>`).join('');
  const schema = { '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description, image: `https://allrates.ge${article.image}`, datePublished: article.date, dateModified: article.date, mainEntityOfPage: canonical, author: { '@type': 'Organization', name: 'AllRates.ge-ის რედაქცია', url: 'https://allrates.ge/about' }, publisher: { '@type': 'Organization', name: 'AllRates.ge', url: 'https://allrates.ge/', logo: { '@type': 'ImageObject', url: 'https://allrates.ge/favicon-192.png' } } };
  return `<!DOCTYPE html><html lang="ka"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(article.title)} | AllRates.ge</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="article"><meta property="og:title" content="${escapeHtml(article.title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://allrates.ge${article.image}"><meta property="article:published_time" content="${article.date}"><link rel="icon" href="/favicon-192.png"><link rel="stylesheet" href="/css/style.css?v=11"><link rel="stylesheet" href="/css/pair-pages.css?v=1"><script type="application/ld+json">${JSON.stringify(schema)}</script></head><body class="articles-body"><!-- STATIC_HEADER_START -->${read('partials/header.html')}<!-- STATIC_HEADER_END --><main class="articles-page"><nav class="pair-breadcrumbs" aria-label="Breadcrumb"><a href="/">მთავარი</a><span>›</span><a href="/articles">სტატიები</a><span>›</span><span>${escapeHtml(article.title)}</span></nav><section class="articles-open-view"><div class="articles-reader-column">${body}</div><aside class="articles-related-grid" aria-label="სხვა სტატიები">${related}</aside></section></main><!-- STATIC_FOOTER_START -->${read('partials/footer.html')}<!-- STATIC_FOOTER_END --></body></html>`;
}

function articleCollection(articles) {
  const cards = articles.map(article => `<a class="article-tile" href="/articles/${article.slug}"><img src="${article.image}" alt="${escapeHtml(article.title)}" loading="${article === articles[0] ? 'eager' : 'lazy'}"><span class="article-tile-date">${escapeHtml(formatDate(article.date))}</span><strong>${escapeHtml(article.title)}</strong><span>${escapeHtml(article.excerpt.slice(0, 130))}…</span></a>`).join('\n');
  const itemList = articles.map((article, index) => ({ '@type': 'ListItem', position: index + 1, url: `https://allrates.ge/articles/${article.slug}`, name: article.title }));
  return `<!DOCTYPE html><html lang="ka"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>ფინანსური სტატიები და სავალუტო ბაზრის ანალიზი | AllRates.ge</title><meta name="description" content="სიღრმისეული სტატიები ვალუტის კურსებზე, USD/GEL და EUR/GEL მოძრაობაზე, ფინანსურ ბაზრებზე, ბონდებზე, საწვავსა და კრიპტოაქტივებზე."><link rel="canonical" href="https://allrates.ge/articles"><meta property="og:type" content="website"><meta property="og:title" content="ფინანსური სტატიები | AllRates.ge"><meta property="og:url" content="https://allrates.ge/articles"><link rel="icon" href="/favicon-192.png"><link rel="stylesheet" href="/css/style.css?v=11"><link rel="stylesheet" href="/css/pair-pages.css?v=1"><script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'ფინანსური სტატიები', url: 'https://allrates.ge/articles', mainEntity: { '@type': 'ItemList', itemListElement: itemList } })}</script></head><body class="articles-body"><!-- STATIC_HEADER_START -->${read('partials/header.html')}<!-- STATIC_HEADER_END --><main class="articles-page"><header class="seo-page-heading"><h1>ფინანსური სტატიები და სავალუტო ბაზრის ანალიზი</h1></header><section class="articles-grid-view" aria-label="სტატიების ჩამონათვალი">${cards}</section></main><!-- STATIC_FOOTER_START -->${read('partials/footer.html')}<!-- STATIC_FOOTER_END --></body></html>`;
}

function generateFooterNavigation(articles) {
  const pages = [['/', 'მთავარი'], ['/analytics', 'ანალიტიკა'], ['/rates', 'შეადარე კურსები'], ['/official', 'ოფიციალური კურსები'], ['/sawvavis-fasebi', 'საწვავის ფასები'], ['/articles', 'სტატიები'], ['/calculator', 'ვალუტის კალკულატორი'], ['/loan-calculator', 'სესხის კალკულატორი'], ['/loan-comparison', 'სესხების შედარება'], ['/deposit-calculator', 'დეპოზიტის კალკულატორი'], ['/inflation-calculator', 'ინფლაციის კალკულატორი'], ['/api', 'API'], ['/about', 'ჩვენს შესახებ'], ['/contact', 'კონტაქტი']];
  const list = items => `<ul>${items.map(([url, label]) => `<li><a href="${url}">${escapeHtml(label)}</a></li>`).join('')}</ul>`;
  const group = (label, items) => `<details class="footer-page-group"><summary>${label}</summary>${list(items)}</details>`;
  const pairs = Object.values(PAIRS);
  const navigation = `<div class="allrates-footer-column footer-navigation"><h4>ნავიგაცია</h4><details class="footer-navigation-content" open><summary>ყველა გვერდის ნახვა</summary>${list(pages)}${group('ოფიციალური სავალუტო წყვილები', pairs.map(p => [`/official-rates/${p.slug}`, p.pair]))}${group('ყველა სტატია', articles.map(a => [`/articles/${a.slug}`, a.title]))}</details></div>`;
  const popular = `<div class="allrates-footer-column"><h4>პოპულარული გვერდები</h4>${list([['/official-rates/usd-gel', 'USD/GEL'], ['/official-rates/eur-gel', 'EUR/GEL'], ['/analytics', 'კურსების გრაფიკები'], ['/rates', 'ბანკებისა და ჯიხურების კურსები'], ['/sawvavis-fasebi', 'საწვავის ფასები'], ['/calculator', 'ვალუტის კონვერტაცია'], ['/loan-calculator', 'სესხის გამოთვლა'], ['/official', 'ეროვნული ბანკის კურსები · XLS']])}</div>`;
  const footer = read('partials/footer.html').replace(/<div class="allrates-footer-column(?: footer-navigation)?"><h4>ნავიგაცია<\/h4>[\s\S]*?(?=<div class="allrates-footer-column allrates-footer-note")/, `${navigation}\n        ${popular}\n        `);
  write('partials/footer.html', footer);
}

function generateArticles() {
  const articles = extractArticles();
  for (const article of articles) write(`articles/${article.slug}.html`, articlePage(article, articles));
  write('articles.html', articleCollection(articles));
  return articles;
}

function patchOtherPages() {
  const headings = {
    'about.html': ['AllRates.ge-ის შესახებ', 'გაიგე როგორ ვაგროვებთ, ვამოწმებთ და ვადარებთ ფინანსურ მონაცემებს.'],
    'api.html': ['ვალუტის კურსების API', 'AllRates.ge-ის მიმდინარე და ისტორიული მონაცემების პროგრამული ინტეგრაცია.'],
    'calculator.html': ['ვალუტის კონვერტაციის კალკულატორი', 'გადაიყვანე თანხა ოფიციალური ან კომერციული კურსით და შეადარე შედეგი.'],
    'contact.html': ['დაგვიკავშირდი', 'მოგვწერე მონაცემებთან, თანამშრომლობასთან ან ტექნიკურ საკითხებთან დაკავშირებით.']
  };
  for (const file of fs.readdirSync(ROOT).filter(name => name.endsWith('.html'))) {
    if (['index.html', 'rates.html', 'official.html', 'articles.html'].includes(file) || REDIRECTED_FILES.has(file)) continue;
    let html = injectSharedLayout(read(file));
    if (['calculator.html', 'loan-calculator.html', 'loan-comparison.html', 'deposit-calculator.html', 'inflation-calculator.html'].includes(file)) {
      html = html.replace(/<!-- STATIC_FOOTER_START -->[\s\S]*?<!-- STATIC_FOOTER_END -->/g, '');
    }
    if (['admin.html', 'create-dashboard.html'].includes(file) && !/<meta[^>]+name=["']robots["']/i.test(html)) {
      html = html.replace('</head>', '<meta name="robots" content="noindex, follow">\n</head>');
    }
    if (headings[file]) html = ensureHeading(html, ...headings[file]);
    write(file, html);
  }
}

function generatePairPages(snapshot) {
  write('analytics.html', pairPage(snapshot, 'USD', 'official', true));
  for (const code of Object.keys(PAIRS)) {

    write(`official-rates/${PAIRS[code].slug}.html`, pairPage(snapshot, code, 'official'));
  }
}

function generateSitemap(snapshot, articles) {
  const lastmod = snapshot.generatedAt.slice(0, 10);
  const staticUrls = ['/', '/analytics', '/about', '/rates', '/calculator', '/loan-calculator', '/loan-comparison', '/deposit-calculator', '/inflation-calculator', '/official', '/articles', '/sawvavis-fasebi', '/api', '/contact'];
  const urls = [
    ...staticUrls.map(url => ({ url, changefreq: ['/', '/rates', '/official'].includes(url) ? 'hourly' : 'monthly', priority: url === '/' ? '1.0' : '0.7' })),
    ...Object.values(PAIRS).flatMap(meta => ([

      { url: `/official-rates/${meta.slug}`, changefreq: 'daily', priority: '0.9' }
    ])),
    ...articles.map(article => ({ url: `/articles/${article.slug}`, changefreq: 'monthly', priority: '0.75', lastmod: article.date }))
  ];
  const body = urls.map(item => `  <url><loc>https://allrates.ge${item.url}</loc><lastmod>${item.lastmod || lastmod}</lastmod><changefreq>${item.changefreq}</changefreq><priority>${item.priority}</priority></url>`).join('\n');
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
  const marker = '# GENERATED_CANONICAL_FILES';
  const redirects = read('_redirects').replace(new RegExp(`${marker}_START[\\s\\S]*?${marker}_END\\n?`), '');
  const fileRedirects = urls.filter(item => /^\/(?:articles|official-rates|market-rates)\//.test(item.url))
    .map(item => `${item.url}.html  ${item.url}  301!`).join('\n');
  write('_redirects', `${marker}_START\n${fileRedirects}\n${marker}_END\n${redirects}`);
}

function retireDocumentWriteFiles() {
  write('js/header.js', `// Header markup is injected into every HTML document by scripts/build-seo.js.\n// This compatibility file never writes markup at runtime.\nif (!document.querySelector('.site-header')) console.error('Static site header is missing. Run npm run build.');\n`);
  write('js/footer.js', `// Footer markup is injected into every HTML document by scripts/build-seo.js.\n// This compatibility file never writes markup at runtime.\nif (!document.querySelector('.allrates-footer')) console.error('Static site footer is missing. Run npm run build.');\n`);
}

async function main() {
  if (process.argv.includes('--articles-only')) {
    const articles = generateArticles();
    console.log(`Article build complete: ${articles.length} article pages.`);
    return;
  }
  const cache = require('./page-snapshot').createCache();
  const fullSnapshot = OFFLINE ? cache.get() : await cache.refresh();
  if (process.argv.includes('--strict') && ['market','official','sheets','crypto'].some(key => !fullSnapshot.entries[key] || Date.now()-fullSnapshot.entries[key].fetchedAt > 30*60000)) throw new Error('Complete fresh HTML snapshot required for release.');
  const snapshot = await getSnapshot(fullSnapshot);
  generateFooterNavigation(extractArticles());
  const articles = generateArticles();
  patchHomepage(snapshot);
  patchRates(snapshot);
  patchOfficial(snapshot);
  patchOtherPages();
  generatePairPages(snapshot);
  const {render} = require('./render-page-snapshot');
  for (const file of ['index.html','rates.html','official.html',...Object.values(PAIRS).map(p=>`official-rates/${p.slug}.html`)]) write(file,render(read(file),fullSnapshot));
  generateSitemap(snapshot, articles);
  retireDocumentWriteFiles();
  console.log(`SEO build complete: ${Object.keys(PAIRS).length} pair pages, ${articles.length} article pages, HTML snapshot ${snapshot.generatedAt}.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
