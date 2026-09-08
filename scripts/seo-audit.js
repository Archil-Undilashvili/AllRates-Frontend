const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const failures = [];
const warnings = [];

function read(relative) { return fs.readFileSync(path.join(ROOT, relative), 'utf8'); }
function fail(message) { failures.push(message); }
function warn(message) { warnings.push(message); }
function count(value, regex) { return (value.match(regex) || []).length; }

function fileForUrl(url) {
  const route = new URL(url).pathname.replace(/^\/+|\/+$/g, '');
  if (!route) return 'index.html';
  if (route.startsWith('articles/') || route.startsWith('market-rates/') || route.startsWith('official-rates/')) return `${route}.html`;
  return `${route}.html`;
}

function extract(html, regex) { return html.match(regex)?.[1]?.trim() || ''; }

const sitemap = read('sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
if (!urls.length) fail('Sitemap is empty.');
if (new Set(urls).size !== urls.length) fail('Sitemap contains duplicate URLs.');

const titles = new Map();
const descriptions = new Map();

for (const url of urls) {
  const file = fileForUrl(url);
  const target = path.join(ROOT, file);
  if (!fs.existsSync(target)) {
    fail(`Sitemap URL has no HTML file: ${url} -> ${file}`);
    continue;
  }
  const html = fs.readFileSync(target, 'utf8');
  const title = extract(html, /<title>([\s\S]*?)<\/title>/i);
  const description = extract(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
    || extract(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const canonical = extract(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || extract(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const h1Count = count(html, /<h1\b/gi);
  const linkCount = count(html, /<a\b[^>]+href=/gi);

  if (!title) fail(`${file}: missing title.`);
  if (!description) fail(`${file}: missing meta description.`);
  if (canonical.replace(/\/$/, '') !== url.replace(/\/$/, '')) fail(`${file}: canonical mismatch (${canonical} vs ${url}).`);
  const expectedH1 = 1;
  if (h1Count !== expectedH1) fail(`${file}: expected ${expectedH1} H1, found ${h1Count}.`);
  const calculatorPage = ['calculator.html', 'loan-calculator.html', 'loan-comparison.html', 'deposit-calculator.html', 'inflation-calculator.html'].includes(file);
  if (!html.includes('<!-- STATIC_HEADER_START -->') || (!calculatorPage && !html.includes('<!-- STATIC_FOOTER_START -->'))) fail(`${file}: static header/footer missing.`);
  if (calculatorPage && html.includes('allrates-footer')) fail(`${file}: calculator footer should be absent.`);
  if (linkCount < 12) warn(`${file}: only ${linkCount} crawlable links.`);
  if (/document\.write\s*\(/.test(html)) fail(`${file}: document.write call remains.`);
  for (const asset of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/gi)) {
    const value = asset[1];
    if (/^(?:https?:|\/\/|data:)/.test(value) || !/\.(?:js|css)(?:[?#]|$)/i.test(value)) continue;
    const assetPath = new URL(value, url).pathname;
    if (!fs.existsSync(path.join(ROOT, assetPath))) fail(`${file}: missing asset ${assetPath}.`);
  }
  if (title) {
    if (titles.has(title)) fail(`${file}: duplicate title with ${titles.get(title)}.`);
    else titles.set(title, file);
  }
  if (description) {
    if (descriptions.has(description)) warn(`${file}: duplicate description with ${descriptions.get(description)}.`);
    else descriptions.set(description, file);
  }

  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); }
    catch (error) { fail(`${file}: invalid JSON-LD (${error.message}).`); }
  }
}

const index = read('index.html');
const analytics = read('analytics.html');
if (!analytics.includes('data-analytics-page') || count(analytics, /data-asset-chart\b/g) !== 1) fail('Analytics must contain one standalone chart.');
if (/class="(?:pair-hero|asset-rates-board|asset-content-grid)/.test(analytics)) fail('Analytics contains currency-detail panels.');
const footer = read('partials/footer.html');
for (const url of urls) {
  const route = new URL(url).pathname;
  if (!footer.includes(`href="${route}"`)) fail(`Footer is missing public page ${route}.`);
}
if (!read('partials/header.html').includes('href="/analytics"')) fail('Header must link to standalone analytics.');
const rates = read('rates.html');
for (const code of ['usd', 'eur', 'gbp', 'rub', 'try']) {
  for (const field of ['buy', 'sell', 'spread']) {
    const homeValue = extract(index, new RegExp(`id=["']home-${code}-market-${field}["'][^>]*>([^<]+)<`, 'i'));
    const ratesValue = extract(rates, new RegExp(`id=["']${code}-market-${field}["'][^>]*>([^<]+)<`, 'i'));
    if (!/^\d+\.\d+$/.test(homeValue)) fail(`Homepage ${code}/${field} is not a numeric HTML snapshot (${homeValue}).`);
    if (!/^\d+\.\d+$/.test(ratesValue)) fail(`Rates page ${code}/${field} is not a numeric HTML snapshot (${ratesValue}).`);
  }
}

const pairPages = fs.readdirSync(path.join(ROOT, 'official-rates')).filter(name => name.endsWith('.html'));
if (pairPages.length !== 5) fail(`Expected 5 official pair pages, found ${pairPages.length}.`);
if (urls.some(url => url.includes('/market-rates/'))) fail('Retired market pair pages remain in sitemap.');
if (/home-nbg-usd-chart|home-eurusd-chart/.test(index)) fail('Retired homepage charts remain.');

const articleFiles = fs.readdirSync(path.join(ROOT, 'articles')).filter(name => name.endsWith('.html'));
const expectedArticleCount = JSON.parse(read('content/articles.json')).length;
if (articleFiles.length !== expectedArticleCount) fail(`Expected ${expectedArticleCount} article pages, found ${articleFiles.length}.`);
for (const file of articleFiles) {
  const html = read(`articles/${file}`);
  if (!html.includes('"@type":"Article"')) fail(`articles/${file}: Article structured data missing.`);
  if (!html.includes('AllRates.ge-ის რედაქცია')) fail(`articles/${file}: editorial attribution missing.`);
}

const redirectedRoutes = ['/valutis-kursi', '/valutis-kursebi', '/laris-kursi', '/erovnuli-bankis-kursi', '/bankebis-kursebi', '/jixurebis-kursebi', '/valutis-kalkulatori'];
for (const route of redirectedRoutes) {
  if (urls.some(url => new URL(url).pathname === route)) fail(`Redirected legacy route remains in sitemap: ${route}`);
}

const jsFiles = ['js/header.js', 'js/footer.js', 'js/header-controller.js', 'js/footer-controller.js', 'js/pair-page.js'];
for (const file of jsFiles) {
  const source = read(file);
  if (/document\.write\s*\(/.test(source)) fail(`${file}: document.write call remains.`);
}

if (warnings.length) {
  console.log(`SEO audit warnings (${warnings.length}):`);
  warnings.forEach(message => console.log(`- ${message}`));
}
if (failures.length) {
  console.error(`SEO audit failed (${failures.length}):`);
  failures.forEach(message => console.error(`- ${message}`));
  process.exit(1);
}
console.log(`SEO audit passed: ${urls.length} canonical URLs, ${pairPages.length} pair pages, ${articleFiles.length} article pages, static rate snapshots present.`);
