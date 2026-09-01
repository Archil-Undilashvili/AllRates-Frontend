
function setInnerText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}
function setInnerHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}
function setDisplay(id, display) {
    const el = document.getElementById(id);
    if (el) el.style.display = display;
}

const liveValueSnapshots = new Map();

function flashLiveValue(key, nextValue) {
    if (!key) return '';
    const normalized = String(nextValue ?? '');
    const previous = liveValueSnapshots.get(key);
    liveValueSnapshots.set(key, normalized);
    return previous !== undefined && previous !== normalized ? ' live-value-flash' : '';
}

function setLiveInnerText(id, text, key = id) {
    const el = document.getElementById(id);
    if (!el) return;
    const flashClass = flashLiveValue(key, text).trim();
    el.innerText = text;
    if (flashClass) {
        el.classList.remove(flashClass);
        void el.offsetWidth;
        el.classList.add(flashClass);
    }
}

const IS_LOCAL_FRONTEND = ['localhost', '127.0.0.1', ''].includes(window.location.hostname) || window.location.protocol === 'file:';
const API_SHEETS_DATA_URL = IS_LOCAL_FRONTEND
    ? 'http://localhost:3000/api/data'
    : 'https://allrates-backend-api.onrender.com/api/data';
const API_RATES_URL = IS_LOCAL_FRONTEND
    ? 'http://localhost:3000/api/rates/latest'
    : 'https://allrates-backend-api.onrender.com/api/rates/latest';
const API_RATES_FALLBACK_URL = 'https://allrates-backend-api.onrender.com/api/rates/latest';
const API_GAS_URL = 'https://allrates-backend-api.onrender.com/api/gas/latest';
const API_GAS_SUMMARY_URL = IS_LOCAL_FRONTEND
    ? 'http://localhost:3000/api/gas/market-summary'
    : 'https://allrates-backend-api.onrender.com/api/gas/market-summary';
const API_GAS_SUMMARY_FALLBACK_URL = 'https://allrates-backend-api.onrender.com/api/gas/market-summary';
const API_MARKET_HISTORY_URL = IS_LOCAL_FRONTEND
    ? 'http://localhost:3000/api/market-history'
    : 'https://allrates-backend-api.onrender.com/api/market-history';
const HOME_MARKET_HISTORY_CACHE_KEY = 'allrates_home_market_history_latest_v1';
const MARKET_DYNAMICS_CACHE_PREFIX = 'cachedMarketDynamics_v2';
const NBG_CHART_CACHE_VERSION = 'v2';
const NBG_CHART_CACHE_VERSION_KEY = 'cachedNbgChartVersion';
const NBG_CHART_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const KURSIGE_PUBLIC_API_URLS = [
    'https://api-core.kursi.ge/api/public/currencies',
    'https://api.kursi.ge:8080/api/public/currencies'
];
const CACHE_INTL_RATES_HTML_KEY = 'cachedIntlRatesHtml_v3';
const CACHE_POPULAR_ASSETS_HTML_KEY = 'cachedPopularAssetsHtml_v3';
const CACHE_COMPANY_RATES_DATA_KEY = 'cachedRatesData_scraper_v2';
const HOME_GAS_CACHE_KEY = 'allrates_home_gas_market_cache_v2';
const DISABLED_COMPANIES = new Set(['procredit']);
const CRYPTO_REFRESH_INTERVAL_MS = 3 * 1000;
const FOREX_MARKET_REFRESH_INTERVAL_MS = 30 * 1000;
const COMPANY_RATES_SCHEDULE_CHECK_MS = 60 * 1000;
const FOREX_TICK_MIN_MS = 1000;
const FOREX_TICK_MAX_MS = 70000;
const CRYPTO_MARKET_CAP_CACHE_KEY = 'cachedCryptoMarketCaps_v1';
const CRYPTO_MARKET_CAP_TTL_MS = 5 * 60 * 1000;
const CRYPTO_WATCHLIST_CHANNEL = 'allrates_crypto_prices_v1';
const CRYPTO_LIVE_CACHE_KEY = 'allrates_crypto_live_map_v1';
const forexTickTimers = new Map();
const cryptoWatchlistChannel = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel(CRYPTO_WATCHLIST_CHANNEL)
    : null;

function getTbilisiScheduleParts(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Tbilisi',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(date).reduce((acc, part) => {
        acc[part.type] = part.value;
        return acc;
    }, {});

    return {
        weekday: parts.weekday,
        hour: Number(parts.hour),
        minute: Number(parts.minute)
    };
}

function shouldRefreshCompanyRatesNow(date = new Date()) {
    const { weekday, hour, minute } = getTbilisiScheduleParts(date);
    const isFiveMinuteMark = minute % 5 === 0;

    if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday)) {
        return hour >= 9 || isFiveMinuteMark;
    }

    if (weekday === 'Sat') return isFiveMinuteMark;
    if (weekday === 'Sun') return hour >= 2 && hour < 9 && isFiveMinuteMark;
    return false;
}

async function fetchJsonWithFallback(urls, options = {}) {
    let lastError = null;
    for (const url of [...new Set(urls.filter(Boolean))]) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`${url} HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            lastError = error;
        }
    }
    throw lastError || new Error('Fetch failed');
}

async function fetchSheetsData() {
    return fetchJsonWithFallback([
        API_SHEETS_DATA_URL,
        IS_LOCAL_FRONTEND ? 'https://allrates-backend-api.onrender.com/api/data' : null
    ]);
}

        const API_BANKS_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AWDtjMWFvbEgN6VC6wxI7pN9ABktXkqPN7bGMwsIYTLiCaWN4RieM33AZbs8-qa8HEDeftgFpcn-xFFPzwRSaTgjgRterE2f47ma1nXbsnHqRmyv3qqRUMcoK7bahbIzBU_73IYXskTCuokqU9ASX-yjm1xliNjC7W5CizWaijDgyoNmiB5-6hUsmGPO1wvrVcnBCp2ksgioARRQyHhKY31wcHxhT1kVD_E-qjxhMSAuplX7ZceMfMGKWPatecLm8K4G5KP7AjaRKvtVWWLD9LIwZtTTmE6fGg&lib=M-V5mEnEclei2QLgjN86iAykVBAJz9-Q8';
        const API_NBG_URL = 'https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json';
        
        // კატეგორიები
        const ALL_COMPANIES = ['rico', 'valuto', 'kursige', 'crystal', 'bog', 'tbc', 'liberty', 'bb', 'credo', 'cartu', 'inex', 'expresslombard', 'giro', 'goa', 'hash', 'mbc', 'tera', 'halyk', 'is', 'silk', 'leader', 'smarti', 'central', 'georgiancredit', 'tbmc', 'bermeli', 'alphaexpress', 'scapp', 'paysera'];
        const BANK_COMPANIES = ['bog', 'tbc', 'liberty', 'bb', 'credo', 'cartu', 'hash', 'tera', 'halyk', 'is', 'silk', 'crystal', 'mbc'];
        const MFO_COMPANIES = ['rico', 'giro', 'goa', 'leader', 'smarti', 'central', 'georgiancredit', 'tbmc', 'bermeli', 'alphaexpress', 'scapp'];
        const KIOSK_COMPANIES = ALL_COMPANIES.filter(company => !BANK_COMPANIES.includes(company) && !MFO_COMPANIES.includes(company));
        const TAB_LABELS = {
            all: 'ყველა კომპანია',
            banks: 'ბანკები',
            mfo: 'მიკროსაფინანსოები',
            kiosks: 'ჯიხურები'
        };

        let currentTab = localStorage.getItem('allrates_current_tab') || 'all';
        const DEFAULT_RATE_RELEVANCE_THRESHOLD = 0.50;
        const RATE_KEY_BY_CURRENCY = {
            usd: { code: 'USD', buy: 'USDGEL (Buy)', sell: 'USDGEL (Sell)', spread: 'usdSpread' },
            eur: { code: 'EUR', buy: 'EURGEL (Buy)', sell: 'EURGEL (Sell)', spread: 'eurSpread' },
            gbp: { code: 'GBP', buy: 'GBPGEL (Buy)', sell: 'GBPGEL (Sell)', spread: 'gbpSpread' },
            rub: { code: 'RUB', buy: 'RUBGEL (Buy)', sell: 'RUBGEL (Sell)', spread: 'rubSpread' },
            try: { code: 'TRY', buy: 'TRYGEL (Buy)', sell: 'TRYGEL (Sell)', spread: 'trySpread' }
        };

        function getRateRelevanceThreshold(currency) {
            return ['usd', 'eur'].includes(String(currency || '').toLowerCase())
                ? 0.10
                : DEFAULT_RATE_RELEVANCE_THRESHOLD;
        }

        function getOfficialMarketRate(currency) {
            try {
                const config = RATE_KEY_BY_CURRENCY[String(currency || '').toLowerCase()];
                const code = config ? config.code : String(currency || '').toUpperCase();
                const cachedNBG = JSON.parse(localStorage.getItem('cachedNBGData') || '{}');
                const adjustedRate = Number(cachedNBG.marketOfficialRates?.[code]);
                if (Number.isFinite(adjustedRate) && adjustedRate > 0) return adjustedRate;

                let rawRate = Number(cachedNBG[code.toLowerCase()]);
                if (!Number.isFinite(rawRate) || rawRate <= 0) return NaN;

                // Older cache entries kept NBG's displayed rate without quantity normalization.
                if ((code === 'RUB' || code === 'TRY') && rawRate > 1) rawRate /= 100;
                return rawRate;
            } catch (_) {
                return NaN;
            }
        }

        function getRateValues(item, currency) {
            const config = RATE_KEY_BY_CURRENCY[String(currency || '').toLowerCase()];
            if (!config || !item) return { buy: NaN, sell: NaN, spread: NaN };
            return {
                buy: parseFloat(item[config.buy]),
                sell: parseFloat(item[config.sell]),
                spread: parseFloat(item[config.spread])
            };
        }

        function isCompanyRateOutlier(item, currency) {
            const officialRate = getOfficialMarketRate(currency);
            if (!Number.isFinite(officialRate) || officialRate <= 0) return false;

            const { buy, sell } = getRateValues(item, currency);
            if (!Number.isFinite(buy) || !Number.isFinite(sell) || buy <= 0 || sell <= 0) return false;
            if (buy === sell) return true;

            const buyDeviation = Math.abs(buy - officialRate) / officialRate;
            const sellDeviation = Math.abs(sell - officialRate) / officialRate;
            const threshold = getRateRelevanceThreshold(currency);
            return buyDeviation > threshold || sellDeviation > threshold;
        }

        function refreshRateRelevanceViews() {
            if (!Array.isArray(originalData) || originalData.length === 0) return;
            ['usd', 'eur', 'gbp', 'rub', 'try'].forEach(currency => {
                const dataArr = currency === 'usd' ? usdData : currency === 'eur' ? eurData : currency === 'gbp' ? gbpData : currency === 'rub' ? rubData : tryData;
                if (Array.isArray(dataArr) && dataArr.length) applySorting(currency);
            });
            renderHomePage();
        }

        async function fetchRatesJsonWithFallback(urls) {
            let lastError = null;
            for (const url of [...new Set(urls.filter(Boolean))]) {
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const data = await response.json();
                    if (!Array.isArray(data) || data.length < 10) {
                        throw new Error(`Incomplete rates payload (${Array.isArray(data) ? data.length : 'not-array'})`);
                    }
                    return data;
                } catch (error) {
                    lastError = error;
                    console.warn(`Rates API fetch failed (${url}):`, error.message);
                }
            }
            throw lastError || new Error('Rates API fetch failed');
        }

        function normalizeCompanyKey(companyName) {
            const name = String(companyName || '');
            let base = name.split(' ')[0].toLowerCase();
            const lower = name.toLowerCase();
            if (base === 'isbank') base = 'is';
            if (base === 'terabank') base = 'tera';
            if (base === 'inteliexpress' || base === 'inteli' || lower.includes('inex')) base = 'inex';
            if (base === 'expresslombard' || lower.includes('express lombard')) base = 'expresslombard';
            if (base === 'cartubank') base = 'cartu';
            if (base === 'hashbank') base = 'hash';
            if (base === 'basisbank') base = 'bb';
            if (base === 'procredit') base = 'procredit';
            if (base === 'leader') base = 'leader';
            if (base === 'smarti' || base === 'smartfin' || base === 'smart') base = 'smarti';
            if (base === 'central') base = 'central';
            if (base === 'georgiancredit' || base === 'georgian') base = 'georgiancredit';
            if (base === 'tbmc' || base === 'tbilmicrocredit') base = 'tbmc';
            if (base === 'bermeli') base = 'bermeli';
            if (base === 'alphaexpress' || base === 'alpha') base = 'alphaexpress';
            if (base === 'scapp') base = 'scapp';
            return base;
        }

        function isDisabledCompany(companyNameOrKey) {
            return DISABLED_COMPANIES.has(normalizeCompanyKey(companyNameOrKey));
        }

        function normalizeScraperRateItem(item) {
            const base = normalizeCompanyKey(item.company);
            return {
                Company: item.company,
                baseCompany: base,
                'USDGEL (Buy)': item.usdBuy,
                'USDGEL (Sell)': item.usdSell,
                'EURGEL (Buy)': item.eurBuy,
                'EURGEL (Sell)': item.eurSell,
                'GBPGEL (Buy)': item.gbpBuy,
                'GBPGEL (Sell)': item.gbpSell,
                'RUBGEL (Buy)': (base === 'crystal' && parseFloat(item.rubBuy) > 1) ? (parseFloat(item.rubBuy) / 100).toFixed(4) : item.rubBuy,
                'RUBGEL (Sell)': (base === 'crystal' && parseFloat(item.rubSell) > 1) ? (parseFloat(item.rubSell) / 100).toFixed(4) : item.rubSell,
                'TRYGEL (Buy)': item.tryBuy,
                'TRYGEL (Sell)': item.trySell,
                'Update Time': item.tbilisiDateString || item.createdAt,
                'Update Timestamp': item.createdAt || item.date || item.tbilisiDateString
            };
        }

        function parseCompanyUpdateTime(item) {
            const value = item?.['Update Timestamp'] || item?.createdAt || item?.date || item?.['Update Time'];
            if (!value) return null;
            const parsed = new Date(value);
            if (!Number.isNaN(parsed.getTime())) return parsed;

            const match = String(value).match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4}).*?(\d{1,2}):(\d{2})/);
            if (!match) return null;
            const [, dd, mm, yyyy, hh, min] = match;
            const fallback = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
            return Number.isNaN(fallback.getTime()) ? null : fallback;
        }

        function formatCompanyUpdateTime(item) {
            const date = parseCompanyUpdateTime(item);
            if (!date) {
                return { label: '--:--:--', stale: true, full: 'განახლების დრო უცნობია' };
            }

            const formatter = new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Asia/Tbilisi',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hourCycle: 'h23'
            });
            const label = formatter.format(date).replace(',', '');
            const diffMs = Date.now() - date.getTime();
            return {
                label,
                stale: diffMs > 5 * 60 * 1000,
                full: `კურსის განახლების დრო: ${label}`
            };
        }

        function applyCompanyRatesData(rows) {
            originalData = rows.filter(item => !DISABLED_COMPANIES.has(getCompanyKey(item)));
            updateTabCounts();

            originalData = originalData.map(item => {
                const usdB = parseFloat(item['USDGEL (Buy)']);
                const usdS = parseFloat(item['USDGEL (Sell)']);
                const eurB = parseFloat(item['EURGEL (Buy)']);
                const eurS = parseFloat(item['EURGEL (Sell)']);

                return {
                    ...item,
                    usdSpread: (!isNaN(usdS) && !isNaN(usdB)) ? (usdS - usdB) : Infinity,
                    eurSpread: (!isNaN(eurS) && !isNaN(eurB)) ? (eurS - eurB) : Infinity,
                    gbpSpread: (!isNaN(parseFloat(item['GBPGEL (Sell)'])) && !isNaN(parseFloat(item['GBPGEL (Buy)']))) ? (parseFloat(item['GBPGEL (Sell)']) - parseFloat(item['GBPGEL (Buy)'])) : Infinity,
                    rubSpread: (!isNaN(parseFloat(item['RUBGEL (Sell)'])) && !isNaN(parseFloat(item['RUBGEL (Buy)']))) ? (parseFloat(item['RUBGEL (Sell)']) - parseFloat(item['RUBGEL (Buy)'])) : Infinity,
                    trySpread: (!isNaN(parseFloat(item['TRYGEL (Sell)'])) && !isNaN(parseFloat(item['TRYGEL (Buy)']))) ? (parseFloat(item['TRYGEL (Sell)']) - parseFloat(item['TRYGEL (Buy)'])) : Infinity
                };
            });

            usdData = [...originalData]; applySorting("usd");
            eurData = [...originalData]; applySorting("eur");
            gbpData = [...originalData]; applySorting("gbp");
            rubData = [...originalData]; applySorting("rub");
            tryData = [...originalData]; applySorting("try");

            renderHomePage();
            updateHomeConverter();
            localStorage.setItem(CACHE_COMPANY_RATES_DATA_KEY, JSON.stringify(originalData));
        }

        async function refreshCompanyRatesOnly() {
            try {
                const rawNewData = await fetchRatesJsonWithFallback([API_RATES_URL, API_RATES_FALLBACK_URL]);
                let rows = rawNewData
                    .filter(item => !isDisabledCompany(item.company))
                    .map(normalizeScraperRateItem);
                const kursigeLiveRow = await fetchKursigePublicRateRow();
                if (kursigeLiveRow) {
                    rows = rows.filter(item => getCompanyKey(item) !== 'kursige');
                    rows.push(kursigeLiveRow);
                }
                applyCompanyRatesData(rows);
            } catch (error) {
                console.warn('Market rates auto-refresh failed:', error.message);
            }
        }

        function switchPage(page) {
            ['home-page','rates-page','api-page','contact-page'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
            
            const navHome = document.getElementById('nav-home');
            const navRates = document.getElementById('nav-rates');
            const navApi = document.getElementById('nav-api');
            const navContact = document.getElementById('nav-contact');
            
            [navHome, navRates, navApi, navContact].forEach(el => { if(el) el.style.color = '#64748b'; });

            if (page === 'home' && document.getElementById('home-page')) {
                setDisplay('home-page', 'flex');
                if(navHome) navHome.style.color = '#1e3a8a';
            } else if (page === 'rates' && document.getElementById('rates-page')) {
                setDisplay('rates-page', 'flex');
                if(navRates) navRates.style.color = '#1e3a8a';
            } else if (page === 'api' && document.getElementById('api-page')) {
                setDisplay('api-page', 'flex');
                if(navApi) navApi.style.color = '#1e3a8a';
            } else if (page === 'contact' && document.getElementById('contact-page')) {
                setDisplay('contact-page', 'flex');
                if(navContact) navContact.style.color = '#1e3a8a';
            }
            sessionStorage.setItem('activePage', page);
        }

        async function sendContactForm() {
            const name    = document.getElementById('c-name').value.trim();
            const email   = document.getElementById('c-email').value.trim();
            const subject = document.getElementById('c-subject').value.trim();
            const message = document.getElementById('c-message').value.trim();
            const btn     = document.getElementById('c-submit-btn');
            const success = document.getElementById('contact-success');
            const error   = document.getElementById('contact-error');

            success.style.display = 'none';
            error.style.display = 'none';

            const emailInput = document.getElementById('c-email');
            emailInput.style.borderColor = ''; // reset border color

            if (!email || !message) {
                error.textContent = '✗   გთხოვთ შეავსოთ სავალდებულო ველები (ელ-ფოსტა და შეტყობინება).';
                error.style.display = 'block';
                return;
            }

            if (!email.includes('@')) {
                error.textContent = '✗   ელ ფოსტა არასწორია (არ შეიცავს @ სიმბოლოს).';
                error.style.display = 'block';
                emailInput.style.borderColor = '#dc2626'; // Red border
                return;
            }

            btn.disabled = true;
            btn.textContent = 'იგზავნება...';

            try {
                const res = await fetch('https://formsubmit.co/ajax/info.allrates@gmail.com', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        _subject: subject ? `AllRates კონტაქტი: ${subject}` : 'AllRates — ახალი შეტყობინება',
                        _replyto: email,
                        name: name || 'მითითებული არ არის',
                        email: email,
                        message: message
                    })
                });
                const data = await res.json();
                if (data.success === 'true' || data.success === true) {
                    success.style.display = 'block';
                    document.getElementById('c-name').value = '';
                    document.getElementById('c-email').value = '';
                    document.getElementById('c-subject').value = '';
                    document.getElementById('c-message').value = '';
                    document.getElementById('c-charcount').textContent = '0';
                } else { throw new Error(); }
            } catch {
                error.textContent = '✗   შეტყობინების გაგზავნა ვერ მოხერხდა. გთხოვთ სცადოთ განმეორებით.';
                error.style.display = 'block';
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> გაგზავნა';
                btn.onmouseover = function(){ this.style.background='#1e40af'; };
                btn.onmouseout = function(){ this.style.background='var(--primary)'; };
            }
        }

        const COMPANY_NAMES_KA = {
        'rico': 'რიკო',
        'valuto': 'ვალუტო',
        'kursige': 'კურსიჯი',
        'crystal': 'კრისტალი',
        'bog': 'საქართველოს ბანკი',
        'tbc': 'თიბისი ბანკი',
        'liberty': 'ლიბერთი ბანკი',
        'bb': 'ბაზისბანკი',
        'credo': 'კრედო ბანკი',
        'cartu': 'ბანკი ქართუ',
        'inex': 'ინტელიექსპრესი',
        'expresslombard': 'ექსპრეს ლომბარდი',
        'giro': 'გირო კრედიტი',
        'goa': 'გოა კრედიტი',
        'hash': 'ჰაშ ბანკი',
        'mbc': 'ემბისი',
        'tera': 'ტერაბანკი',
        'halyk': 'ხალიკ ბანკი',
        'is': 'იშბანკი',
        'silk': 'სილქ ბანკი',
        'leader': 'ლიდერ კრედიტი',
        'smarti': 'სმარტი',
        'central': 'ცენტრალი',
        'georgiancredit': 'ქართული კრედიტი',
        'tbmc': 'თბილმიკროკრედიტი',
        'bermeli': 'ბერმელი',
        'alphaexpress': 'ალფა ექსპრესი',
        'scapp': 'სკაპი',
        'paysera': 'Paysera'
    };

        const COMPANY_URLS = {
        'rico': 'https://rico.ge/',
        'valuto': 'https://valuto.ge/',
        'kursige': 'https://kursi.ge/',
        'crystal': 'https://crystal.ge/',
        'bog': 'https://bankofgeorgia.ge/',
        'tbc': 'https://tbcbank.ge/',
        'liberty': 'https://libertybank.ge/',
        'bb': 'https://basisbank.ge/',
        'credo': 'https://credobank.ge/',
        'cartu': 'https://cartubank.ge/',
        'inex': 'https://inteliexpress.com/ka/main-page-geo/',
        'expresslombard': 'https://expresslombard.ge/',
        'giro': 'https://girocredit.ge/',
        'goa': 'https://goacredit.ge/',
        'hash': 'https://hashbank.ge/ka',
        'mbc': 'https://mbc.com.ge/',
        'tera': 'https://terabank.ge/ka/retail',
        'halyk': 'https://halykbank.ge/ka/individuals',
        'is': 'http://isbank.ge/ka/individual',
        'silk': 'https://silkbank.ge/',
        'paysera': 'https://www.paysera.ge/v2/ka-GE/index',
        'leader': 'https://leadercredit.ge/',
        'smarti': 'http://smartfin.ge/index.php/ka/products-ka/currency-exchange-k',
        'central': 'https://central.ge/',
        'georgiancredit': 'https://www.georgiancredit.ge/',
        'tbmc': 'https://www.tbmc.ge/en/cven-shesaxeb/saqmianoba',
        'bermeli': 'https://bermeli.ge/ka/currency',
        'alphaexpress': 'https://alphaexpress.ge/',
        'scapp': 'https://scapp.ge/ka/currency'
    };

        const LOGOS = {
            'rico': 'Logos/rico_icon.png',
            'valuto': 'Logos/valuto_icon.png',
            'kursige': 'Logos/kursige_icon.png',
            'crystal': 'Logos/crystal_icon.png',
            'bog': 'Logos/bog_icon.png',
            'tbc': 'Logos/tbc_icon.png',
            'liberty': 'Logos/liberty_icon.png',
            'bb': 'Logos/bb_icon.png',
            'credo': 'Logos/credo_icon.png',
            'cartu': 'Logos/cartu_icon.ico',
            'inex': 'Logos/Inex.png',
            'expresslombard': 'Logos/expresslombard_icon.svg',
            'giro': 'Logos/giro_icon.png',
            'goa': 'Logos/goa_icon.png',
            'hash': 'Logos/hash_icon.ico',
            'mbc': 'Logos/mbc_icon.png',
            'tera': 'Logos/tera_icon.png',
            'halyk': 'Logos/halyk_icon.png',
            'is': 'Logos/is_icon.png',
            'silk': 'Logos/silk_icon.png',
            'leader': 'Logos/leader.jpg',
            'smarti': 'Logos/smarti_icon.png',
            'central': 'Logos/central_icon.svg',
            'georgiancredit': 'Logos/georgiancredit_icon.png',
            'tbmc': 'Logos/tbmc_icon.png',
            'bermeli': 'Logos/bermeli_icon.svg',
            'alphaexpress': 'Logos/alphaexpress_icon.png',
            'scapp': 'Logos/scapp_icon.svg',
            'paysera': 'Logos/paysera_icon.png'
        };

        let originalData = [];
        let usdData = [];
        let eurData = [];
        let gbpData = [];
        let rubData = [];
    let tryData = [];

        // 0: Best (Smallest Spread), 1: Worst (Largest Spread)
        let sortStates = { usd: 0, eur: 0 };
        const sortIcons = ["&#9650;", "&#9660;"];

        function normalizeForexPairCode(pair) {
            return String(pair || '').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6);
        }

        function getForexAnalyticsUrl(pair) {
            const pairCode = normalizeForexPairCode(pair) || 'EURUSD';
            const pagePath = IS_LOCAL_FRONTEND ? 'valutis-kursebi-dges.html' : '/valutis-kursebi-dges';
            return `${pagePath}?pair=${encodeURIComponent(pairCode)}&period=1w#official-analytics-chart`;
        }

        function hydrateForexRateLinks(container = document.getElementById('intl-rates-container')) {
            if (!container) return;
            container.querySelectorAll('.intl-rate-item').forEach(item => {
                const pairText = item.querySelector('.intl-pair')?.textContent || '';
                const pairCode = normalizeForexPairCode(item.dataset.forexPair || pairText);
                if (pairCode.length !== 6) return;
                item.classList.add('forex-rate-link');
                item.dataset.forexPair = pairCode;
                item.setAttribute('role', 'button');
                item.setAttribute('tabindex', '0');
                item.setAttribute('title', `NBG სტატისტიკაში ${pairCode.slice(0, 3)}/${pairCode.slice(3)} გრაფიკის ნახვა`);
            });
        }

        function getForexTickDelay() {
            return Math.floor(FOREX_TICK_MIN_MS + Math.random() * (FOREX_TICK_MAX_MS - FOREX_TICK_MIN_MS));
        }

        function clearForexTickTimers() {
            forexTickTimers.forEach(timerId => clearTimeout(timerId));
            forexTickTimers.clear();
        }

        function pulseForexRateItem(item) {
            if (!item || !document.body.contains(item)) return;
            const valueEl = item.querySelector('.home-split-main') || item.querySelector('.intl-value');
            if (valueEl) valueEl.classList.remove('live-value-flash');
            void (valueEl || item).offsetWidth;
            if (valueEl) valueEl.classList.add('live-value-flash');
        }

        function startForexMarketTicks(container = document.getElementById('intl-rates-container')) {
            if (!container) return;
            clearForexTickTimers();
            const items = Array.from(container.querySelectorAll('.forex-rate-link[data-forex-pair]'));
            items.forEach((item, index) => {
                const key = item.dataset.forexPair || `pair-${index}`;
                const schedule = () => {
                    const timerId = setTimeout(() => {
                        pulseForexRateItem(item);
                        if (document.body.contains(item)) schedule();
                    }, getForexTickDelay() + index * 90);
                    forexTickTimers.set(key, timerId);
                };
                schedule();
            });
        }

        function initForexRateLinks() {
            const container = document.getElementById('intl-rates-container');
            if (!container || container.dataset.forexLinksReady === 'true') return;
            container.dataset.forexLinksReady = 'true';

            const openPair = item => {
                const pairCode = normalizeForexPairCode(item?.dataset?.forexPair);
                if (pairCode.length !== 6) return;
                window.location.href = getForexAnalyticsUrl(pairCode);
            };

            container.addEventListener('click', event => {
                const item = event.target.closest('.forex-rate-link[data-forex-pair]');
                if (!item || !container.contains(item)) return;
                openPair(item);
            });

            container.addEventListener('keydown', event => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                const item = event.target.closest('.forex-rate-link[data-forex-pair]');
                if (!item || !container.contains(item)) return;
                event.preventDefault();
                openPair(item);
            });
        }

        function parseSheetsRows(rawData) {
            if (rawData?.data && Array.isArray(rawData.data)) {
                const headers = rawData.data[0];
                return rawData.data.slice(1)
                    .filter(row => row && row.length > 0)
                    .map(row => {
                        const obj = {};
                        headers.forEach((header, index) => obj[header] = row[index]);
                        return obj;
                    });
            }
            return Array.isArray(rawData) ? rawData : [];
        }

        async function getYesterdayForexMap() {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            if (d.getDay() === 0) d.setDate(d.getDate() - 2);
            else if (d.getDay() === 6) d.setDate(d.getDate() - 1);
            const yesterdayStr = d.toISOString().split('T')[0];
            const response = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${yesterdayStr}/v1/currencies/eur.json`);
            if (!response.ok) throw new Error(`Historical FX HTTP ${response.status}`);
            const historicalData = await response.json();
            const map = { EUR: 1 };
            Object.entries(historicalData.eur || {}).forEach(([key, value]) => {
                map[key.toUpperCase()] = value;
            });
            return map;
        }

        function renderHomeForexRates(intlRates, ratesYdayMap = null) {
            const container = document.querySelector('.intl-rates-list');
            if (!container || !Array.isArray(intlRates) || intlRates.length === 0) return;

            const getFlagCode = cur => {
                const map = {
                    usd: 'us', eur: 'eu', gbp: 'gb', jpy: 'jp',
                    chf: 'ch', aud: 'au', cad: 'ca', nzd: 'nz',
                    try: 'tr', rub: 'ru', gel: 'ge', azn: 'az', amd: 'am'
                };
                return map[String(cur || '').toLowerCase()] || 'un';
            };

            container.innerHTML = intlRates.map(rate => {
                let pairName = String(rate.Pair || '').trim().toUpperCase();
                const forexPairCode = normalizeForexPairCode(pairName);
                const currentRate = parseFloat(rate.Rate);
                if (!pairName || !Number.isFinite(currentRate)) return '';

                let baseCur = pairName.substring(0, 3);
                let quoteCur = pairName.substring(3, 6);
                if (pairName.length === 6 && !pairName.includes('/')) {
                    pairName = `${baseCur} / ${quoteCur}`;
                } else if (pairName.includes('/')) {
                    const parts = pairName.split('/');
                    baseCur = parts[0].trim();
                    quoteCur = parts[1].trim();
                }

                let changeHtml = '';
                if (ratesYdayMap?.[baseCur] && ratesYdayMap?.[quoteCur]) {
                    const yesterdayRate = ratesYdayMap[quoteCur] / ratesYdayMap[baseCur];
                    const changePercent = ((currentRate - yesterdayRate) / yesterdayRate) * 100;
                    const color = changePercent > 0 ? 'var(--buy-color)' : changePercent < 0 ? 'var(--sell-color)' : 'var(--text-muted)';
                    const sign = changePercent > 0 ? '+' : '';
                    changeHtml = `<span style="color: ${color}; font-size: 0.65em; margin-left: 8px;">${sign}${changePercent.toFixed(2)}%</span>`;
                }

                const flag1 = getFlagCode(baseCur);
                const flag2 = getFlagCode(quoteCur);
                const logoHtml = `
                    <div class="forex-flag-stack">
                        <img src="https://flagcdn.com/w40/${flag1}.png" alt="">
                        <img src="https://flagcdn.com/w40/${flag2}.png" alt="">
                    </div>`;
                const forexClass = forexPairCode.length === 6 ? ' forex-rate-link' : '';
                const forexData = forexPairCode.length === 6 ? ` data-forex-pair="${forexPairCode}" role="button" tabindex="0"` : '';

                return `
                    <div class="intl-rate-item${forexClass}"${forexData}>
                        <span class="intl-pair forex-pair-row">${logoHtml}<span>${pairName}</span></span>
                        <span class="intl-value home-split-value${flashLiveValue(`forex:${forexPairCode || pairName}`, currentRate.toFixed(4))}">
                            <span class="home-split-main">${currentRate.toFixed(4)}</span>
                            <span class="home-split-change">${changeHtml}</span>
                        </span>
                    </div>
                `;
            }).join('');

            hydrateForexRateLinks(container);
            startForexMarketTicks(container);
            if (container.innerHTML.trim()) localStorage.setItem(CACHE_INTL_RATES_HTML_KEY, container.innerHTML);
        }

        async function refreshForexRatesOnly() {
            try {
                const rows = parseSheetsRows(await fetchSheetsData());
                const intlRates = rows
                    .filter(item => item['Pair (Popular)'] && item['Rate (Popular)'])
                    .map(item => ({ Pair: item['Pair (Popular)'], Rate: item['Rate (Popular)'] }))
                    .slice(0, 10);
                if (!intlRates.length) return;
                try {
                    renderHomeForexRates(intlRates, await getYesterdayForexMap());
                } catch (_) {
                    renderHomeForexRates(intlRates);
                }
            } catch (error) {
                console.warn('Forex auto-refresh failed:', error.message);
            }
        }

        function preloadHomeLogos() {
            const logoPaths = [
                'Logos/nbg_logo_cropped.png',
                'Logos/market-rates-icon.svg',
                'Logos/forex-icon.svg',
                'Logos/crypto-icon.svg',
                'Logos/fuel-icon.svg',
                'Logos/assets-icon.svg',
                'Logos/US.png',
                'Logos/EU.png',
                'Logos/GB.png',
                'Logos/RU.png',
                'Logos/TR.png',
                ...Object.values(CRYPTO_LOGOS || {}).slice(0, 10)
            ];
            [...new Set(logoPaths)].forEach(src => {
                if (!src) return;
                const img = new Image();
                img.decoding = 'sync';
                img.loading = 'eager';
                img.fetchPriority = 'high';
                img.src = src;
            });
        }

        
        async function fetchRates() {
            fetchNBG();
            fetchCrypto();
            fetchHomeGasMarketPrices();
                        // fetchCommodities();
            
            try {
                // Fetch Google Sheet data only for FOREX and popular assets.
                let combinedData = [];
                const rawData = await fetchSheetsData().catch(error => {
                    console.warn('Sheets initial fetch failed:', error.message);
                    return null;
                });

                if (rawData) {
                    if (rawData.data && Array.isArray(rawData.data)) {
                        let headers = rawData.data[0];
                        // Skip empty rows and map to objects
                        combinedData = rawData.data.slice(1)
                            .filter(row => row && row.length > 0)
                            .map(row => {
                                let obj = {};
                                headers.forEach((h, i) => obj[h] = row[i]);
                                return obj;
                            });
                    } else {
                        combinedData = rawData;
                    }
                }

                // Update International Rates if available
                let intlRates = [];
                let popularAssetsRates = [];

                const popularAssetsList = ['Gold', 'Silver', 'Platinium', 'Platinum', 'WTI Crude Oil', 'Brent Crude Oil', 'Natural Gas', 'S&P 500', 'Dow Jones', 'NVIDIA', 'Apple', 'Tesla'];

                combinedData.forEach(item => {
// მხოლოდ Popular წყვილები "საერთაშორისო კურსები" ბოქსისთვის
if (item['Pair (Popular)'] && item['Rate (Popular)']) {
    intlRates.push({ Pair: item['Pair (Popular)'], Rate: item['Rate (Popular)'] });
}

                    if (item['MEA'] && item['Rate (MEA)']) {
                        let name = item['MEA'].trim();
                        let obj = { Pair: name, Rate: item['Rate (MEA)'] };
                        if (popularAssetsList.includes(name)) popularAssetsRates.push(obj);
                        // fallback removed
                    }
                });

                const intlContainer = document.querySelector('.intl-rates-list'); // first one is FX
                const popularAssetsContainer = document.getElementById('popular-assets-list');

                
                if (intlRates.length > 0 || popularAssetsRates.length > 0) {
                    // Cut the list at GBPJPY
                    intlRates = intlRates.slice(0, 10); // Keep only the first 10 popular pairs

                    if (intlContainer) {
                        // Keep previous HTML until we fetch yesterday's rates
                        let currentHtml = '';
                        
                        // We need yesterday's date
                        const d = new Date();
                        d.setDate(d.getDate() - 1);
                        if (d.getDay() === 0) d.setDate(d.getDate() - 2); // if Sunday, go to Friday
                        else if (d.getDay() === 6) d.setDate(d.getDate() - 1); // if Saturday, go to Friday
                        const yesterdayStr = d.toISOString().split('T')[0];
                        
                        // Let's use fawazahmed0 currency-api for yesterday's rates
                        // frankfurter base is EUR by default but it misses RUB and other currencies
                        fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${yesterdayStr}/v1/currencies/eur.json`)
                            .then(res => res.json())
                            .then(historicalData => {
                                // fawazahmed0 has all lowercase keys in eur object
                                const ratesYday = historicalData.eur;
                                
                                // To keep the logic below identical, we just need to ensure uppercase keys
                                const upperRatesYday = {};
                                for (let key in ratesYday) {
                                    upperRatesYday[key.toUpperCase()] = ratesYday[key];
                                }
                                upperRatesYday['EUR'] = 1.0; // base just in case
                                
                                // Override the old ratesYday variable mapping
                                const ratesYdayMap = upperRatesYday;

                                function titleCase(str) {
                                    return str.toLowerCase().split(' ').map(word => {
                                        return word.charAt(0).toUpperCase() + word.slice(1);
                                    }).join(' ');
                                }

                                function renderRates(arr, cont, isFx) {
                                    if (!cont) return;
                                    cont.innerHTML = '';
                                    arr.forEach(rate => {
                                        let pairName = rate.Pair;
                                        const forexPairCode = normalizeForexPairCode(pairName);
                                        let currentRate = parseFloat(rate.Rate);
                                        let changeHtml = '';
                                        
                                        if (isFx) {
                                            let baseCur = pairName.substring(0,3);
                                            let quoteCur = pairName.substring(3,6);
                                            
                                            if (pairName.length === 6 && !pairName.includes('/')) {
                                                pairName = baseCur + ' / ' + quoteCur;
                                            } else if (pairName.includes('/')) {
                                                let parts = pairName.split('/');
                                                baseCur = parts[0].trim();
                                                quoteCur = parts[1].trim();
                                            }
                                            
                                            if (ratesYdayMap[baseCur] && ratesYdayMap[quoteCur]) {
                                                let yesterdayRate = ratesYdayMap[quoteCur] / ratesYdayMap[baseCur];
                                                let changePercent = ((currentRate - yesterdayRate) / yesterdayRate) * 100;
                                                let finalChange = changePercent;
                                                
                                                if (finalChange > 0) {
                                                    changeHtml = `<span style="color: var(--buy-color); font-size: 0.65em; margin-left: 8px;">+${finalChange.toFixed(2)}%</span>`;
                                                } else if (finalChange < 0) {
                                                    changeHtml = `<span style="color: var(--sell-color); font-size: 0.65em; margin-left: 8px;">${finalChange.toFixed(2)}%</span>`;
                                                } else {
                                                    changeHtml = `<span style="color: var(--text-muted); font-size: 0.65em; margin-left: 8px;">0.00%</span>`;
                                                }
                                            }
                                        } else {
                                            // Non-FX: Title case, no slash splitting
                                            pairName = titleCase(pairName);
                                            // Note: since we don't have historical data for commodities from frankfurter, no percent change is calculated here.
                                            // To calculate percent change for metals we need historical data from elsewhere (not implemented in this block).
                                            // Leaving changeHtml empty as in fallback or calculate it if provided.
                                        }
                                        
                                        let displayRate = isFx ? currentRate.toFixed(4) : currentRate.toFixed(2);

                                        let logoHtml = '';
                                        
                                        const getFlagCode = (cur) => {
                                            const map = {
                                                'usd': 'us', 'eur': 'eu', 'gbp': 'gb', 'jpy': 'jp',
                                                'chf': 'ch', 'aud': 'au', 'cad': 'ca', 'nzd': 'nz',
                                                'try': 'tr', 'rub': 'ru', 'gel': 'ge', 'azn': 'az', 'amd': 'am'
                                            };
                                            return map[cur.toLowerCase()] || 'un';
                                        };

                                        if (isFx) {
                                            let baseCur = pairName.split('/')[0] ? pairName.split('/')[0].trim() : '';
                                            let quoteCur = pairName.split('/')[1] ? pairName.split('/')[1].trim() : '';
                                            
                                            if (baseCur && quoteCur) {
                                                const flag1 = getFlagCode(baseCur);
                                                const flag2 = getFlagCode(quoteCur);
                                                logoHtml = `
                                                <div class="forex-flag-stack">
                                                    <img src="https://flagcdn.com/w40/${flag1}.png" alt="">
                                                    <img src="https://flagcdn.com/w40/${flag2}.png" alt="">
                                                </div>`;
                                            }
                                        } else {
                                            const lowerPair = pairName.toLowerCase();
                                            let logoSrc = '';
                                            if (lowerPair.includes('wti')) logoSrc = 'WTI.png';
                                            else if (lowerPair.includes('brent')) logoSrc = 'BRENT.png';
                                            else if (lowerPair.includes('gas')) logoSrc = 'Natural Gas.png';
                                            else if (lowerPair.includes('gold')) logoSrc = 'GOLD.png';
                                            else if (lowerPair.includes('silver')) logoSrc = 'SILVER.png';
                                            else if (lowerPair.includes('platin')) logoSrc = 'PLATINIUM.png';
                                            else if (lowerPair.includes('s&p')) logoSrc = 'SP500.png';
                                            else if (lowerPair.includes('dow')) logoSrc = 'DJI.png';
                                            else if (lowerPair.includes('nvidia')) logoSrc = 'NVDA.png';
                                            else if (lowerPair.includes('apple')) logoSrc = 'AAPL.png';
                                            else if (lowerPair.includes('tesla')) logoSrc = 'TSLA.png';
                                            
                                            if (logoSrc) {
                                                logoHtml = `<img src="Logos/${logoSrc}" alt="${pairName}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; margin-right: 12px; vertical-align: middle; box-shadow: 0 2px 4px rgba(0,0,0,0.1); background: #fff; border: 1px solid #eee;">`;
                                            }
                                        }

                                        const forexClass = isFx && forexPairCode.length === 6 ? ' forex-rate-link' : '';
                                        const forexData = isFx && forexPairCode.length === 6 ? ` data-forex-pair="${forexPairCode}" role="button" tabindex="0"` : '';

                                        const valueHtml = isFx
                                            ? `<span class="intl-value home-split-value">
                                                    <span class="home-split-main">${displayRate}</span>
                                                    <span class="home-split-change">${changeHtml}</span>
                                                </span>`
                                            : `<span class="intl-value">$ ${displayRate} ${changeHtml}</span>`;
                                        cont.innerHTML += `
                                            <div class="intl-rate-item${forexClass}"${forexData}>
                                                <span class="intl-pair forex-pair-row">${logoHtml}<span>${pairName}</span></span>
                                                ${valueHtml}
                                            </div>
                                        `;
                                    });
                                    if (isFx) {
                                        hydrateForexRateLinks(cont);
                                        startForexMarketTicks(cont);
                                    }
                                }

                                renderRates(intlRates, intlContainer, true);
                                renderRates(popularAssetsRates, popularAssetsContainer, false);
                                if (intlContainer && intlContainer.innerHTML.trim()) {
                                    localStorage.setItem(CACHE_INTL_RATES_HTML_KEY, intlContainer.innerHTML);
                                }
                                if (popularAssetsContainer && popularAssetsContainer.innerHTML.trim()) {
                                    localStorage.setItem(CACHE_POPULAR_ASSETS_HTML_KEY, popularAssetsContainer.innerHTML);
                                }
                                
                            })
                            .catch(err => {
                                // Fallback
                                const renderFallback = (arr, cont, isFx) => {
                                    if(!cont) return;
                                    cont.innerHTML = '';
                                    arr.forEach(rate => {
                                        let pairName = rate.Pair;
                                        const forexPairCode = normalizeForexPairCode(pairName);
                                        if (isFx) {
                                            if (pairName.length === 6 && !pairName.includes('/')) {
                                                pairName = pairName.substring(0,3) + ' / ' + pairName.substring(3);
                                            }
                                        } else {
                                            pairName = pairName.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                        }
                                        let currentRate = parseFloat(rate.Rate);
                                        let displayRate = isFx ? currentRate.toFixed(4) : currentRate.toFixed(2);

                                        let logoHtml = '';
                                        
                                        const getFlagCode = (cur) => {
                                            const map = {
                                                'usd': 'us', 'eur': 'eu', 'gbp': 'gb', 'jpy': 'jp',
                                                'chf': 'ch', 'aud': 'au', 'cad': 'ca', 'nzd': 'nz',
                                                'try': 'tr', 'rub': 'ru', 'gel': 'ge', 'azn': 'az', 'amd': 'am'
                                            };
                                            return map[cur.toLowerCase()] || 'un';
                                        };

                                        if (isFx) {
                                            let baseCur = pairName.split('/')[0] ? pairName.split('/')[0].trim() : '';
                                            let quoteCur = pairName.split('/')[1] ? pairName.split('/')[1].trim() : '';
                                            
                                            if (baseCur && quoteCur) {
                                                const flag1 = getFlagCode(baseCur);
                                                const flag2 = getFlagCode(quoteCur);
                                                logoHtml = `
                                                <div class="forex-flag-stack">
                                                    <img src="https://flagcdn.com/w40/${flag1}.png" alt="">
                                                    <img src="https://flagcdn.com/w40/${flag2}.png" alt="">
                                                </div>`;
                                            }
                                        } else {
                                            const lowerPair = pairName.toLowerCase();
                                            let logoSrc = '';
                                            if (lowerPair.includes('wti')) logoSrc = 'WTI.png';
                                            else if (lowerPair.includes('brent')) logoSrc = 'BRENT.png';
                                            else if (lowerPair.includes('gas')) logoSrc = 'Natural Gas.png';
                                            else if (lowerPair.includes('gold')) logoSrc = 'GOLD.png';
                                            else if (lowerPair.includes('silver')) logoSrc = 'SILVER.png';
                                            else if (lowerPair.includes('platin')) logoSrc = 'PLATINIUM.png';
                                            else if (lowerPair.includes('s&p')) logoSrc = 'SP500.png';
                                            else if (lowerPair.includes('dow')) logoSrc = 'DJI.png';
                                            else if (lowerPair.includes('nvidia')) logoSrc = 'NVDA.png';
                                            else if (lowerPair.includes('apple')) logoSrc = 'AAPL.png';
                                            else if (lowerPair.includes('tesla')) logoSrc = 'TSLA.png';
                                            
                                            if (logoSrc) {
                                                logoHtml = `<img src="Logos/${logoSrc}" alt="${pairName}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; margin-right: 12px; vertical-align: middle; box-shadow: 0 2px 4px rgba(0,0,0,0.1); background: #fff; border: 1px solid #eee;">`;
                                            }
                                        }

                                        const forexClass = isFx && forexPairCode.length === 6 ? ' forex-rate-link' : '';
                                        const forexData = isFx && forexPairCode.length === 6 ? ` data-forex-pair="${forexPairCode}" role="button" tabindex="0"` : '';

                                        const valueHtml = isFx
                                            ? `<span class="intl-value home-split-value">
                                                    <span class="home-split-main">${displayRate}</span>
                                                    <span class="home-split-change"></span>
                                                </span>`
                                            : `<span class="intl-value">$ ${displayRate}</span>`;
                                        cont.innerHTML += `
                                            <div class="intl-rate-item${forexClass}"${forexData}>
                                                <span class="intl-pair forex-pair-row">${logoHtml}<span>${pairName}</span></span>
                                                ${valueHtml}
                                            </div>
                                        `;
                                    });
                                    if (isFx) hydrateForexRateLinks(cont);
                                };
                                renderFallback(intlRates, intlContainer, true);
                                renderFallback(popularAssetsRates, popularAssetsContainer, false);
                                if (intlContainer && intlContainer.innerHTML.trim()) {
                                    localStorage.setItem(CACHE_INTL_RATES_HTML_KEY, intlContainer.innerHTML);
                                }
                                if (popularAssetsContainer && popularAssetsContainer.innerHTML.trim()) {
                                    localStorage.setItem(CACHE_POPULAR_ASSETS_HTML_KEY, popularAssetsContainer.innerHTML);
                                }
                                
                            });
                    }
                }

                
                // --- NEW API CALL FOR GEORGIAN COMPANIES ---
                let newApiData = [];
                try {
                        const rawNewData = await fetchRatesJsonWithFallback([API_RATES_URL, API_RATES_FALLBACK_URL]);
                        newApiData = rawNewData
                            .filter(item => !isDisabledCompany(item.company))
                            .map(normalizeScraperRateItem);
                } catch(e) { console.error("New API fetch failed:", e); }

                originalData = newApiData.filter(item => !DISABLED_COMPANIES.has(getCompanyKey(item)));
                const kursigeLiveRow = await fetchKursigePublicRateRow();
                if (kursigeLiveRow) {
                    originalData = originalData.filter(item => getCompanyKey(item) !== 'kursige');
                    originalData.push(kursigeLiveRow);
                }
                updateTabCounts();

                // --- POPULATE TICKER ---
                function populateTicker(data) {
                    const wrap = document.getElementById('main-ticker-wrap');
                    const content = document.getElementById('ticker-content');
                    if (!wrap || !content || data.length === 0) return;
                    
                    let htmlStr = '';
                    
                    // Sort by USD/GEL spread (lowest first)
                    const sortedData = [...data].filter(item => {
                        const buy = parseFloat(item['USDGEL (Buy)']);
                        const sell = parseFloat(item['USDGEL (Sell)']);
                        return !isNaN(buy) && !isNaN(sell) && !isCompanyRateOutlier(item, 'usd');
                    }).sort((a, b) => {
                        const spreadA = parseFloat(a['USDGEL (Sell)']) - parseFloat(a['USDGEL (Buy)']);
                        const spreadB = parseFloat(b['USDGEL (Sell)']) - parseFloat(b['USDGEL (Buy)']);
                        return spreadA - spreadB;
                    });
                    
                    const top10Data = sortedData.slice(0, 10);
                    top10Data.forEach(item => {
                        const comp = item.Company;
                        const buy = parseFloat(item['USDGEL (Buy)']);
                        const sell = parseFloat(item['USDGEL (Sell)']);
                        
                        if (buy && sell) {
                            htmlStr += `
                                <div class="ticker-item">
                                    <span class="ticker-company">${comp}</span>
                                    <span class="ticker-currency">USD/GEL</span>
                                    <span class="ticker-buy">▲ ${buy.toFixed(4)}</span>
                                    <span class="ticker-sell">▼ ${sell.toFixed(4)}</span>
                                </div>
                            `;
                        }
                    });
                    
                    if (htmlStr) {
                        // Duplicate for smooth infinite scroll
                        content.innerHTML = htmlStr + htmlStr;
                        wrap.style.display = 'flex';
                    }
                }
                populateTicker(originalData);
                // -----------------------


                
                // Calculate spreads and store
                originalData = originalData.map(item => {
                    const usdB = parseFloat(item['USDGEL (Buy)']);
                    const usdS = parseFloat(item['USDGEL (Sell)']);
                    const eurB = parseFloat(item['EURGEL (Buy)']);
                    const eurS = parseFloat(item['EURGEL (Sell)']);
                    
                    return {
                        ...item,
                        usdSpread: (!isNaN(usdS) && !isNaN(usdB)) ? (usdS - usdB) : Infinity,
                        eurSpread: (!isNaN(eurS) && !isNaN(eurB)) ? (eurS - eurB) : Infinity,
                        gbpSpread: (!isNaN(parseFloat(item['GBPGEL (Sell)'])) && !isNaN(parseFloat(item['GBPGEL (Buy)']))) ? (parseFloat(item['GBPGEL (Sell)']) - parseFloat(item['GBPGEL (Buy)'])) : Infinity,
                        rubSpread: (!isNaN(parseFloat(item['RUBGEL (Sell)'])) && !isNaN(parseFloat(item['RUBGEL (Buy)']))) ? (parseFloat(item['RUBGEL (Sell)']) - parseFloat(item['RUBGEL (Buy)'])) : Infinity,
                        trySpread: (!isNaN(parseFloat(item['TRYGEL (Sell)'])) && !isNaN(parseFloat(item['TRYGEL (Buy)']))) ? (parseFloat(item['TRYGEL (Sell)']) - parseFloat(item['TRYGEL (Buy)'])) : Infinity
                    };
                });

                // Clone for sorting and set initial sort
                usdData = [...originalData]; applySorting("usd");
                eurData = [...originalData]; applySorting("eur");
                gbpData = [...originalData]; applySorting("gbp");
                rubData = [...originalData]; applySorting("rub");
                tryData = [...originalData]; applySorting("try");

                
                renderHomePage();
                updateHomeConverter();
                
                // Cache data for instant loading next time
                localStorage.setItem(CACHE_COMPANY_RATES_DATA_KEY, JSON.stringify(originalData));

                setDisplay('loader', 'none');
            } catch (error) {
                console.error('შეცდომა:', error);
                setDisplay('loader', 'none');
                setDisplay('error-msg', 'block'); const el = document.getElementById('error-msg'); if (el) el.innerText += ' ' + error.message;
            }
        }

        function renderHomePage() {
            if (originalData.length === 0) return;

            function formatMarketChange(stats, currency) {
                if (!Number.isFinite(stats.avgBuy) || !Number.isFinite(stats.avgSell)) return '';

                const officialRate = getOfficialMarketRate(currency);
                if (!Number.isFinite(officialRate) || officialRate <= 0) return '';

                const marketMid = (stats.avgBuy + stats.avgSell) / 2;
                const change = ((officialRate - marketMid) / officialRate) * 100;
                if (!Number.isFinite(change)) return '';

                const className = change > 0
                    ? 'market-change-positive'
                    : change < 0
                        ? 'market-change-negative'
                        : 'market-change-neutral';
                const sign = change > 0 ? '+' : '';
                return {
                    className,
                    text: `${sign}${change.toFixed(2)}%`
                };
            }

            function isValidMarketRate(currency, buy, sell) {
                if (!Number.isFinite(buy) || !Number.isFinite(sell) || buy <= 0 || sell <= 0 || sell < buy) return false;

                const sanityRanges = {
                    usd: [1, 5],
                    eur: [1, 6],
                    gbp: [1, 7],
                    rub: [0.01, 0.1],
                    try: [0.02, 0.15]
                };
                const [min, max] = sanityRanges[currency] || [0, Infinity];
                return buy >= min && sell <= max;
            }

            function calculateStats(currency) {
                // Get valid items and sort by spread to find top 10
                let validItems = originalData.map(item => {
                    let buy, sell, spread;
                    if (currency === 'usd') {
                        buy = parseFloat(item['USDGEL (Buy)']);
                        sell = parseFloat(item['USDGEL (Sell)']);
                        spread = item.usdSpread;
                    } else if (currency === 'eur') {
                        buy = parseFloat(item['EURGEL (Buy)']);
                        sell = parseFloat(item['EURGEL (Sell)']);
                        spread = item.eurSpread;
                    } else if (currency === 'gbp') {
                        buy = parseFloat(item['GBPGEL (Buy)']);
                        sell = parseFloat(item['GBPGEL (Sell)']);
                        spread = item.gbpSpread;
                    } else if (currency === 'rub') {
                        buy = parseFloat(item['RUBGEL (Buy)']);
                        sell = parseFloat(item['RUBGEL (Sell)']);
                        spread = item.rubSpread;
                    } else if (currency === 'try') {
                        buy = parseFloat(item['TRYGEL (Buy)']);
                        sell = parseFloat(item['TRYGEL (Sell)']);
                        spread = item.trySpread;
                    }
                    return { source: item, buy, sell, spread };
                }).filter(item => !isCompanyRateOutlier(item.source, currency) && isValidMarketRate(currency, item.buy, item.sell) && Number.isFinite(item.spread) && item.spread !== Infinity);

                // Sort by spread (ascending)
                validItems.sort((a, b) => a.spread - b.spread);

                // Take top 10
                let top10 = validItems.slice(0, 10);

                let totalBuy = 0, totalSell = 0;
                top10.forEach(item => {
                    totalBuy += item.buy;
                    totalSell += item.sell;
                });

                const count = top10.length;
                const avgBuy = count > 0 ? (totalBuy / count) : NaN;
                const avgSell = count > 0 ? (totalSell / count) : NaN;
                const avgSpread = count > 0 ? (avgSell - avgBuy) : NaN;

                return { avgBuy, avgSell, avgSpread };
            }

            function updateDom(currency, stats) {
                const digits = (currency === 'rub' || currency === 'try') ? 4 : 3;
                const change = formatMarketChange(stats, currency);
                const buyText = isNaN(stats.avgBuy) ? '--.---' : stats.avgBuy.toFixed(digits);
                const sellText = isNaN(stats.avgSell) ? '--.---' : stats.avgSell.toFixed(digits);

                const spreadText = isNaN(stats.avgSpread) ? '--.---' : stats.avgSpread.toFixed((currency === 'rub' || currency === 'try') ? 4 : 3);
                setLiveInnerText(`home-${currency}-market-buy`, buyText, `market:${currency}:buy`);
                setLiveInnerText(`home-${currency}-market-sell`, sellText, `market:${currency}:sell`);
                setLiveInnerText(`home-${currency}-market-spread`, spreadText, `market:${currency}:spread`);
                setInnerHTML(
                    `home-${currency}-market-change`,
                    change ? `<span class="${change.className}">${change.text}</span>` : ''
                );

                // Removed best bank/mfo from home

            }

            ['usd', 'eur', 'gbp', 'rub', 'try'].forEach(currency => {
                const stats = calculateStats(currency);
                updateDom(currency, stats);
            });

            fetchHomeMarketHistoryRates();
        }

        function applyHomeMarketHistoryPair(currency, pairData) {
            const buy = Number(pairData?.buy);
            const sell = Number(pairData?.sell);
            const spread = Number(pairData?.spread);
            if (!Number.isFinite(buy) || !Number.isFinite(sell)) return false;

            const stats = {
                avgBuy: buy,
                avgSell: sell,
                avgSpread: Number.isFinite(spread) ? spread : sell - buy
            };
            const change = (() => {
                const officialRate = getOfficialMarketRate(currency);
                if (!Number.isFinite(officialRate) || officialRate <= 0) return '';
                const marketMid = (stats.avgBuy + stats.avgSell) / 2;
                const value = ((officialRate - marketMid) / officialRate) * 100;
                if (!Number.isFinite(value)) return '';
                const className = value > 0
                    ? 'market-change-positive'
                    : value < 0
                        ? 'market-change-negative'
                        : 'market-change-neutral';
                const sign = value > 0 ? '+' : '';
                return `<span class="${className}">${sign}${value.toFixed(2)}%</span>`;
            })();

            setInnerText(`home-${currency}-market-buy`, stats.avgBuy.toFixed(3));
            setInnerText(`home-${currency}-market-sell`, stats.avgSell.toFixed(3));
            setInnerText(`home-${currency}-market-spread`, stats.avgSpread.toFixed(3));
            setInnerHTML(`home-${currency}-market-change`, change);
            return true;
        }

        function renderHomeMarketHistoryLatest(record) {
            if (!record) return false;
            const usdUpdated = applyHomeMarketHistoryPair('usd', record.usdgel);
            const eurUpdated = applyHomeMarketHistoryPair('eur', record.eurgel);
            return usdUpdated || eurUpdated;
        }

        async function fetchHomeMarketHistoryRates() {
            try {
                const cached = JSON.parse(localStorage.getItem(HOME_MARKET_HISTORY_CACHE_KEY) || 'null');
                if (cached?.record && Date.now() - Number(cached.cachedAt || 0) < 60_000) {
                    renderHomeMarketHistoryLatest(cached.record);
                }
            } catch {
                localStorage.removeItem(HOME_MARKET_HISTORY_CACHE_KEY);
            }

            try {
                const response = await fetch(`${API_MARKET_HISTORY_URL}/latest`, { headers: { accept: 'application/json' } });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const record = await response.json();
                if (renderHomeMarketHistoryLatest(record)) {
                    localStorage.setItem(HOME_MARKET_HISTORY_CACHE_KEY, JSON.stringify({
                        cachedAt: Date.now(),
                        record
                    }));
                }
            } catch (error) {
                console.warn('საბაზრო USD/EUR ისტორიის ბოლო კურსის ჩატვირთვა ვერ მოხერხდა:', error.message);
            }
        }

        function getHomeConverterCurrency(pair) {
            return String(pair || 'USDGEL').replace('GEL', '').toUpperCase();
        }

        function updateHomeConverterDirectionLabels() {
            const pairEl = document.getElementById('home-converter-pair');
            const directionEl = document.getElementById('home-converter-direction');
            if (!pairEl || !directionEl) return;

            const currency = getHomeConverterCurrency(pairEl.value);
            const selected = directionEl.value || 'gel-to-foreign';
            directionEl.innerHTML = `
                <option value="gel-to-foreign">გავყიდი GEL ⇄ ვიყიდი ${currency}</option>
                <option value="foreign-to-gel">გავყიდი ${currency} ⇄ ვიყიდი GEL</option>
            `;
            directionEl.value = selected;
        }

        function getHomeConverterCurrencies() {
            const pairEl = document.getElementById('home-converter-pair');
            const directionEl = document.getElementById('home-converter-direction');
            const currency = getHomeConverterCurrency(pairEl?.value);
            const direction = directionEl?.value || 'gel-to-foreign';
            return {
                sellCurrency: direction === 'foreign-to-gel' ? currency : 'GEL',
                buyCurrency: direction === 'foreign-to-gel' ? 'GEL' : currency
            };
        }

        function setHomeConverterInputValue(el, value, currency) {
            if (!el) return;
            if (!Number.isFinite(value)) {
                el.value = '';
                return;
            }
            const decimals = currency === 'GEL' ? 2 : getHomeConverterDecimals(currency);
            el.value = value.toFixed(decimals);
        }

        function getHomeConverterDecimals(currency) {
            return ['RUB', 'TRY'].includes(currency) ? 4 : 3;
        }

        function formatHomeConverterValue(value, currency) {
            if (!Number.isFinite(value)) return '--';
            const decimals = currency === 'GEL' ? 2 : getHomeConverterDecimals(currency);
            return `${value.toLocaleString('ka-GE', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            })} ${currency}`;
        }

        function getHomeOfficialRate(currency) {
            try {
                const cachedNBG = JSON.parse(localStorage.getItem('cachedNBGData') || '{}');
                const direct = Number(cachedNBG[String(currency).toLowerCase()]);
                if (Number.isFinite(direct) && direct > 0) return direct;
                const item = Array.isArray(cachedNBG.officialRates)
                    ? cachedNBG.officialRates.find(rate => rate.code === currency)
                    : null;
                const fromList = Number(item?.rate);
                return Number.isFinite(fromList) && fromList > 0 ? fromList : NaN;
            } catch {
                return NaN;
            }
        }

        function getHomeCompanyName(item) {
            if (!item) return '';
            const key = item.baseCompany || getCompanyKey(item);
            let name = item.Company || '';
            if (key && typeof COMPANY_NAMES_KA !== 'undefined' && COMPANY_NAMES_KA[key]) {
                const match = String(item.Company || '').match(/\((.*?)\)/);
                name = match ? `${COMPANY_NAMES_KA[key]} (${match[1]})` : COMPANY_NAMES_KA[key];
            }
            return name;
        }

        function getKursigePublicPair(rows, secondaryCode) {
            const row = Array.isArray(rows) ? rows.find(item =>
                String(item?.baseCurrencyCode || '').toUpperCase() === 'GEL' &&
                String(item?.secondaryCurrencyCode || '').toUpperCase() === secondaryCode
            ) : null;
            return {
                buy: row && Number.isFinite(Number(row.buyRate)) ? Number(row.buyRate) : '',
                sell: row && Number.isFinite(Number(row.sellRate)) ? Number(row.sellRate) : ''
            };
        }

        async function fetchKursigePublicRateRow() {
            try {
                const rows = await fetchJsonWithFallback(KURSIGE_PUBLIC_API_URLS, { headers: { accept: 'application/json' } });
                const usd = getKursigePublicPair(rows, 'USD');
                const eur = getKursigePublicPair(rows, 'EUR');
                const rub = getKursigePublicPair(rows, 'RUB');
                if (!usd.buy && !usd.sell && !eur.buy && !eur.sell && !rub.buy && !rub.sell) return null;

                return {
                    Company: 'Kursige',
                    baseCompany: 'kursige',
                    'USDGEL (Buy)': usd.buy,
                    'USDGEL (Sell)': usd.sell,
                    'EURGEL (Buy)': eur.buy,
                    'EURGEL (Sell)': eur.sell,
                    'GBPGEL (Buy)': '',
                    'GBPGEL (Sell)': '',
                    'RUBGEL (Buy)': rub.buy,
                    'RUBGEL (Sell)': rub.sell,
                    'TRYGEL (Buy)': '',
                    'TRYGEL (Sell)': '',
                    'Update Time': new Date().toISOString()
                };
            } catch (error) {
                console.warn('Kursi.ge public API fetch failed:', error.message);
                return null;
            }
        }

        function getHomeCommercialRate(pair, direction) {
            const currency = getHomeConverterCurrency(pair).toLowerCase();
            const buyKey = `${currency.toUpperCase()}GEL (Buy)`;
            const sellKey = `${currency.toUpperCase()}GEL (Sell)`;
            const candidates = originalData
                .map(item => ({
                    item,
                    buy: Number(item[buyKey]),
                    sell: Number(item[sellKey])
                }))
                .filter(row => Number.isFinite(row.buy) && row.buy > 0 && Number.isFinite(row.sell) && row.sell > 0 && !isCompanyRateOutlier(row.item, currency));

            if (!candidates.length) return null;
            const best = candidates.sort((a, b) => {
                return direction === 'foreign-to-gel' ? b.buy - a.buy : a.sell - b.sell;
            })[0];

            return {
                rate: direction === 'foreign-to-gel' ? best.buy : best.sell,
                company: getHomeCompanyName(best.item)
            };
        }

        function updateHomeConverter() {
            const sellAmountEl = document.getElementById('home-converter-sell-amount');
            const buyAmountEl = document.getElementById('home-converter-buy-amount');
            const sellLabelEl = document.getElementById('home-converter-sell-label');
            const buyLabelEl = document.getElementById('home-converter-buy-label');
            const pairEl = document.getElementById('home-converter-pair');
            const directionEl = document.getElementById('home-converter-direction');
            const noteEl = document.getElementById('home-converter-rate-note');
            const sourceEl = document.getElementById('home-converter-source');
            if (!sellAmountEl || !buyAmountEl || !pairEl || !directionEl || !noteEl || !sourceEl) return;

            const typeBtn = document.querySelector('.home-converter-type.active');
            const type = typeBtn?.dataset.homeConverterType || 'official';
            const pair = pairEl.value || 'USDGEL';
            const currency = getHomeConverterCurrency(pair);
            const direction = directionEl.value || 'gel-to-foreign';
            const { sellCurrency, buyCurrency } = getHomeConverterCurrencies();
            if (sellLabelEl) sellLabelEl.textContent = `გასაყიდი ${sellCurrency}`;
            if (buyLabelEl) buyLabelEl.textContent = `საყიდელი ${buyCurrency}`;

            let rate = NaN;
            let source = '';
            if (type === 'commercial') {
                const commercial = getHomeCommercialRate(pair, direction);
                if (commercial) {
                    rate = commercial.rate;
                    source = `კომპანია: ${commercial.company || 'უცნობი'} (არჩეული წყვილისთვის საუკეთესო კურსი, ${direction === 'foreign-to-gel' ? 'ყიდვა' : 'გაყიდვა'})`;
                }
            } else {
                rate = getHomeOfficialRate(currency);
                source = 'წყარო: საქართველოს ეროვნული ბანკი';
            }

            if (!Number.isFinite(rate) || rate <= 0) {
                buyAmountEl.value = '';
                noteEl.textContent = 'არჩეულ წყვილზე კურსი ჯერ ვერ მოიძებნა';
                sourceEl.textContent = source || 'წყარო: --';
                return;
            }

            const activeSide = document.activeElement === buyAmountEl ? 'buy' : 'sell';
            const sellAmount = Number(sellAmountEl.value);
            const buyAmount = Number(buyAmountEl.value);

            if (activeSide === 'buy') {
                if (!Number.isFinite(buyAmount) || buyAmount < 0) {
                    sellAmountEl.value = '';
                } else {
                    const converted = direction === 'foreign-to-gel' ? buyAmount / rate : buyAmount * rate;
                    setHomeConverterInputValue(sellAmountEl, converted, sellCurrency);
                }
            } else if (!Number.isFinite(sellAmount) || sellAmount < 0) {
                buyAmountEl.value = '';
            } else {
                const converted = direction === 'foreign-to-gel' ? sellAmount * rate : sellAmount / rate;
                setHomeConverterInputValue(buyAmountEl, converted, buyCurrency);
            }

            noteEl.textContent = `1 ${currency} = ${rate.toFixed(getHomeConverterDecimals(currency))} GEL`;
            sourceEl.textContent = source;
        }

        function initHomeConverter() {
            const sellAmountEl = document.getElementById('home-converter-sell-amount');
            const buyAmountEl = document.getElementById('home-converter-buy-amount');
            const pairEl = document.getElementById('home-converter-pair');
            const directionEl = document.getElementById('home-converter-direction');
            if (!sellAmountEl || !buyAmountEl || !pairEl || !directionEl) return;

            document.querySelectorAll('.home-converter-type').forEach(button => {
                button.addEventListener('click', () => {
                    document.querySelectorAll('.home-converter-type').forEach(item => item.classList.remove('active'));
                    button.classList.add('active');
                    updateHomeConverter();
                });
            });
            [sellAmountEl, buyAmountEl].forEach(el => el.addEventListener('input', updateHomeConverter));
            pairEl.addEventListener('change', () => {
                updateHomeConverterDirectionLabels();
                updateHomeConverter();
            });
            directionEl.addEventListener('change', updateHomeConverter);
            updateHomeConverterDirectionLabels();
            updateHomeConverter();
        }

        
        async function fetchCommodities() {
            try {
                const symbols = ['GC=F', 'SI=F', 'HG=F', 'PL=F', 'PA=F', 'CL=F', 'BZ=F', 'NG=F', 'RB=F', 'HO=F', 'ZC=F', 'ZW=F', 'ZS=F', 'KC=F', 'SB=F', 'CT=F'];
                
                // Yahoo Finance blocks direct browser requests (CORS error), so we use a CORS proxy
                // Some browsers might block Yahoo API, but let's try direct first.
                // If it fails, fallback to a CORS proxy.
                // We use Yahoo Finance API via a free proxy `https://cors-anywhere.herokuapp.com` but it might be limited.
                // An alternative free working API without CORS limits for Yahoo: `https://api.allorigins.win/get?url=`
                // Yahoo Finance API blocks rapid parallel requests (429 Too Many Requests).
                // We must fetch them sequentially with a small delay.
                // We can use an open reverse proxy specifically for yahoo: https://cors-anywhere.herokuapp.com/ is limited,
                // But a reliable proxy is `https://api.allorigins.win/get?url=` if requested slowly.
                // Yahoo Finance API blocks rapid parallel requests (429 Too Many Requests).
                // We must fetch sequentially with a delay.
                // We use corsproxy.io because it works great in real browsers (unlike allorigins which gets Captcha).
                const results = [];
                for (let i = 0; i < symbols.length; i++) {
                    const sym = symbols[i];
                    try {
                        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}`;
                        const res = await fetch(url);
                        
                        if (res.ok) {
                            const data = await res.json();
                            results.push(data);
                        } else {
                            results.push(null);
                        }
                    } catch (e) {
                        results.push(null);
                    }
                    // 600ms delay to prevent IP ban (429 Too Many Requests)
                    await new Promise(r => setTimeout(r, 600));
                }
                
                results.forEach((res, index) => {
                    const sym = symbols[index];
                    if (res && res.chart && res.chart.result && res.chart.result.length > 0) {
                        const meta = res.chart.result[0].meta;
                        
                        // We also need previous close to calculate percent change to make it look cool!
                        if (meta && meta.regularMarketPrice) {
                            const price = meta.regularMarketPrice;
                            const prevClose = meta.chartPreviousClose || meta.previousClose;
                            let changeHtml = '';
                            
                            if (prevClose) {
                                const changePercent = ((price - prevClose) / prevClose) * 100;
                                if (changePercent > 0) {
                                    changeHtml = `<span style="color: var(--buy-color); font-size: 0.65em; margin-left: 8px;">+${changePercent.toFixed(2)}%</span>`;
                                } else if (changePercent < 0) {
                                    changeHtml = `<span style="color: var(--sell-color); font-size: 0.65em; margin-left: 8px;">${changePercent.toFixed(2)}%</span>`;
                                } else {
                                    changeHtml = `<span style="color: var(--text-muted); font-size: 0.65em; margin-left: 8px;">0.00%</span>`;
                                }
                            }
                            
                            const el = document.getElementById(`comm-${sym}`);
                            if (el) {
                                el.innerHTML = `$ ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${changeHtml}`;
                            } else {
                                console.warn(`Element comm-${sym} not found!`);
                            }
                        }
                    }
                });
            } catch(e) {
                console.error("Error fetching commodities:", e);
            }
        }

        async function fetchCryptoMarketCaps() {
            try {
                const cached = JSON.parse(localStorage.getItem(CRYPTO_MARKET_CAP_CACHE_KEY) || 'null');
                if (cached?.updatedAt && Date.now() - cached.updatedAt < CRYPTO_MARKET_CAP_TTL_MS && Array.isArray(cached.items)) {
                    return cached.items;
                }
            } catch (_) {}

            const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h');
            if (!response.ok) throw new Error(`CoinGecko HTTP ${response.status}`);
            const items = await response.json();
            const normalized = (Array.isArray(items) ? items : [])
                .filter(item => item?.symbol && Number.isFinite(Number(item.market_cap)))
                .map((item, index) => ({
                    symbol: String(item.symbol).toUpperCase(),
                    name: item.name,
                    marketCap: Number(item.market_cap),
                    marketCapRank: Number(item.market_cap_rank) || index + 1,
                    logo: item.image || ''
                }));
            localStorage.setItem(CRYPTO_MARKET_CAP_CACHE_KEY, JSON.stringify({ updatedAt: Date.now(), items: normalized }));
            return normalized;
        }

        function getCachedCryptoMarketCaps() {
            try {
                const cached = JSON.parse(localStorage.getItem(CRYPTO_MARKET_CAP_CACHE_KEY) || 'null');
                return Array.isArray(cached?.items) ? cached.items : [];
            } catch (_) {
                return [];
            }
        }

        async function getCryptoMarketCapsSafe() {
            try {
                return await fetchCryptoMarketCaps();
            } catch (error) {
                console.warn('Crypto market cap fetch failed:', error.message);
                return getCachedCryptoMarketCaps();
            }
        }

        function formatMarketCap(value) {
            const num = Number(value);
            if (!Number.isFinite(num) || num <= 0) return '';
            if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(1)}T`;
            if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
            if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
            if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
            return num.toFixed(1);
        }

        function publishCryptoCache(cryptoData) {
            const updatedAt = Date.now();
            const liveMap = {};
            cryptoData.forEach(item => {
                const symbol = String(item.symbol || '').toUpperCase();
                if (!symbol) return;
                liveMap[symbol] = {
                    symbol,
                    name: item.name || '',
                    price: item.price || '',
                    change: item.change || '',
                    logo: item.logo || '',
                    updatedAt
                };
            });
            localStorage.setItem('cachedCryptoData', JSON.stringify(cryptoData));
            localStorage.setItem(CRYPTO_LIVE_CACHE_KEY, JSON.stringify({ updatedAt, items: liveMap }));
            localStorage.setItem('cachedCryptoData_updatedAt', String(updatedAt));
            cryptoWatchlistChannel?.postMessage({ type: 'crypto:update', data: cryptoData, liveMap, updatedAt });
        }

        async function fetchCrypto() {
            try {
                const [res, marketCaps] = await Promise.all([
                    fetch('https://api.binance.com/api/v3/ticker/24hr'),
                    getCryptoMarketCapsSafe()
                ]);
                if (!res.ok) return;
                const data = await res.json();
                const binanceBySymbol = new Map(
                    data
                        .filter(item => item.symbol.endsWith('USDT') && !item.symbol.includes('UPUSDT') && !item.symbol.includes('DOWNUSDT') && !item.symbol.includes('BULLUSDT') && !item.symbol.includes('BEARUSDT'))
                        .map(item => [item.symbol.replace('USDT', ''), item])
                );

                const marketCapRows = marketCaps
                    .filter(meta => binanceBySymbol.has(meta.symbol))
                    .sort((a, b) => (a.marketCapRank || 9999) - (b.marketCapRank || 9999))
                    .slice(0, 100)
                    .map(meta => {
                        const item = binanceBySymbol.get(meta.symbol);
                        return {
                            symbol: meta.symbol,
                            name: meta.name || CRYPTO_NAMES[meta.symbol] || meta.symbol,
                            price: formatCryptoPrice(Number(item.lastPrice)),
                            change: Number(item.priceChangePercent).toFixed(1),
                            logo: meta.logo || getCryptoLogo(meta.symbol),
                            marketCap: meta.marketCap,
                            marketCapRank: meta.marketCapRank
                        };
                    });
                const cryptoData = marketCapRows.length
                    ? marketCapRows
                    : data
                        .filter(item => item.symbol.endsWith('USDT') && !item.symbol.includes('UPUSDT') && !item.symbol.includes('DOWNUSDT') && !item.symbol.includes('BULLUSDT') && !item.symbol.includes('BEARUSDT'))
                        .sort(sortCryptoTickers)
                        .slice(0, 100)
                        .map(item => {
                            const symbol = item.symbol.replace('USDT', '');
                            return {
                                symbol,
                                name: CRYPTO_NAMES[symbol] || symbol,
                                price: formatCryptoPrice(Number(item.lastPrice)),
                                change: Number(item.priceChangePercent).toFixed(1),
                                logo: getCryptoLogo(symbol),
                                marketCap: null,
                                marketCapRank: null
                            };
                        });

                renderCryptoList(cryptoData);
                publishCryptoCache(cryptoData);
            } catch (err) {
                console.error("კრიპტოს ჩატვირთვის შეცდომა:", err);
            }
        }

        const CRYPTO_NAMES = {
            BTC: 'Bitcoin', ETH: 'Ethereum', USDT: 'Tether', BNB: 'BNB', SOL: 'Solana',
            USDC: 'USDC', XRP: 'XRP', DOGE: 'Dogecoin', TON: 'Toncoin', ADA: 'Cardano',
            TRX: 'TRON', AVAX: 'Avalanche', LINK: 'Chainlink', SUI: 'Sui', XLM: 'Stellar',
            BCH: 'Bitcoin Cash', HBAR: 'Hedera', LTC: 'Litecoin', DOT: 'Polkadot',
            UNI: 'Uniswap', AAVE: 'Aave', PEPE: 'Pepe', NEAR: 'NEAR Protocol',
            ETC: 'Ethereum Classic', ICP: 'Internet Computer', FIL: 'Filecoin',
            ARB: 'Arbitrum', OP: 'Optimism', INJ: 'Injective', ATOM: 'Cosmos',
            ALGO: 'Algorand', VET: 'VeChain', FET: 'Artificial Superintelligence Alliance',
            RENDER: 'Render', WIF: 'dogwifhat', BONK: 'Bonk', JUP: 'Jupiter',
            SEI: 'Sei', TIA: 'Celestia', GRT: 'The Graph', RUNE: 'THORChain',
            ENA: 'Ethena', WLD: 'Worldcoin', PENDLE: 'Pendle', SAND: 'The Sandbox',
            MANA: 'Decentraland', IMX: 'Immutable', GALA: 'Gala', LDO: 'Lido DAO'
        };

        const CRYPTO_LOGOS = {
            BTC: 'Logos/BTC.png', ETH: 'Logos/ETH.png', USDT: 'Logos/USDT.png', BNB: 'Logos/BNB.png',
            SOL: 'Logos/SOL.png', USDC: 'Logos/USDC.png', XRP: 'Logos/XRP.png', DOGE: 'Logos/DOGE.png',
            TON: 'Logos/TON.png', ADA: 'Logos/ADA.png'
        };

        function sortCryptoTickers(a, b) {
            const priority = { BTCUSDT: 1, ETHUSDT: 2 };
            if (priority[a.symbol] || priority[b.symbol]) {
                return (priority[a.symbol] || 999) - (priority[b.symbol] || 999);
            }
            return Number(b.quoteVolume) - Number(a.quoteVolume);
        }

        function getCryptoLogo(symbol) {
            if (CRYPTO_LOGOS[symbol]) return CRYPTO_LOGOS[symbol];
            return `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;
        }

        function formatCryptoPrice(value) {
            if (!Number.isFinite(value)) return '-';
            if (value > 1000) return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
            if (value > 1) return value.toFixed(2);
            if (value > 0.01) return value.toFixed(4);
            return value.toFixed(6);
        }

        function renderCryptoList(cryptoData) {
            const container = document.getElementById('crypto-rates-list');
            if (!container || !Array.isArray(cryptoData) || !cryptoData.length) return;

            container.innerHTML = cryptoData.map(item => {
                const changeVal = Number(item.change);
                const changeColor = changeVal > 0 ? 'var(--buy-color)' : changeVal < 0 ? 'var(--sell-color)' : 'var(--text-muted)';
                const changeText = changeVal > 0 ? `+${item.change}%` : `${item.change}%`;
                const marketCapText = formatMarketCap(item.marketCap);
                const liveClass = flashLiveValue(`crypto:${item.symbol}`, `${item.price}:${item.change}`).trim();
                const logoHtml = item.logo
                    ? `<img src="${item.logo}" alt="${item.symbol}" class="crypto-token-logo" loading="eager" decoding="sync" fetchpriority="high" onerror="this.outerHTML='<span class=&quot;crypto-token-initial&quot;>${item.symbol.charAt(0)}</span>';">`
                    : `<span class="crypto-token-initial">${item.symbol.charAt(0)}</span>`;

                return `
                    <div class="intl-rate-item crypto-rate-item">
                        <span class="intl-pair crypto-token-name" data-crypto-search="${`${item.name} ${item.symbol}`.toLowerCase()}">
                            ${logoHtml}
                            <span class="crypto-token-copy">
                                <span>${item.name} (${item.symbol})</span>
                            </span>
                        </span>
                        <span class="intl-value crypto-value">
                            <span class="crypto-price${liveClass ? ` ${liveClass}` : ''}">$ ${item.price}</span>
                            <span class="crypto-change" style="color: ${changeColor};">${changeText}</span>
                            ${marketCapText ? `<span class="crypto-market-cap">MC ${marketCapText}</span>` : '<span class="crypto-market-cap"></span>'}
                        </span>
                    </div>
                `;
            }).join('');
            filterMarketList('crypto-rates-list', document.getElementById('crypto-search-input')?.value || '');
        }

        const HOME_GAS_CATEGORIES = [
            {
                label: 'სუპერი',
                icon: 'Logos/gas/categories/super.svg',
                match: text => (text.includes('სუპერ') || text.includes('super')) && !text.includes('premium') && !text.includes('პრემიუმ')
            },
            {
                label: 'პრემიუმი',
                icon: 'Logos/gas/categories/premium.svg',
                match: text => text.includes('პრემიუმ') || text.includes('premium') || text.includes('avangard')
            },
            {
                label: 'რეგულარი',
                icon: 'Logos/gas/categories/regular.svg',
                match: text => text.includes('რეგულარ') || text.includes('regular')
            },
            {
                label: 'დიზელი',
                icon: 'Logos/gas/categories/diesel.svg',
                match: text => text.includes('დიზელ') || text.includes('diesel')
            },
            {
                label: 'თხევადი გაზი',
                icon: 'Logos/gas/categories/lpg.svg',
                match: text => (text.includes('lpg') || text.includes('თხევად') || text.includes('გაზი') || text.includes('აირი')) && !text.includes('ბუნებრივ')
            }
        ];

        function getHomeGasPrimaryPrice(price) {
            if (price.standardPrice !== null && price.standardPrice !== undefined) return Number(price.standardPrice);
            if (price.price !== null && price.price !== undefined) return Number(price.price);
            return NaN;
        }

        function getHomeGasComparablePrice(price) {
            const values = [];
            const primary = getHomeGasPrimaryPrice(price);

            if (Number.isFinite(primary) && primary > 0) values.push(primary);
            if (Number(price.selfServicePrice) > 0) values.push(Number(price.selfServicePrice));
            if (Number(price.onlinePrice) > 0) values.push(Number(price.onlinePrice));

            return values.length ? Math.min(...values) : NaN;
        }

        function renderHomeGasMarketPrices(records) {
            const container = document.getElementById('home-gas-rates-list');
            if (!container) return;

            const rows = HOME_GAS_CATEGORIES.map(category => {
                const companyBestPrices = [];

                (records || []).forEach(record => {
                    const prices = Array.isArray(record.prices) ? record.prices : [];
                    const companyCategoryPrices = prices
                        .filter(price => category.match(`${price.product || ''} ${price.productEng || ''} ${price.code || ''} ${price.type || ''}`.toLowerCase()))
                        .map(getHomeGasComparablePrice)
                        .filter(value => Number.isFinite(value) && value > 0);

                    if (companyCategoryPrices.length) {
                        companyBestPrices.push(Math.min(...companyCategoryPrices));
                    }
                });

                const average = companyBestPrices.length
                    ? companyBestPrices.reduce((sum, value) => sum + value, 0) / companyBestPrices.length
                    : null;

                return { label: category.label, icon: category.icon, average };
            });

            container.innerHTML = rows.map(row => `
                <div class="intl-rate-item home-gas-rate-item" data-market-search="${row.label.toLowerCase()}">
                    <span class="intl-pair home-gas-pair">
                        <img src="${row.icon}" alt="" class="home-gas-category-icon" loading="eager" decoding="sync" fetchpriority="high">
                        <span>${row.label}</span>
                    </span>
                    <span class="intl-value home-gas-value home-split-value">
                        <span class="home-split-main">${row.average ? `${row.average.toFixed(2)} ₾` : '- - -'}</span>
                        <span class="home-split-change"></span>
                    </span>
                </div>
            `).join('');
        }

        function formatHomeGasChange(changePercent) {
            const value = Number(changePercent);
            if (!Number.isFinite(value)) return '';

            const className = value < 0
                ? 'home-gas-change-positive'
                : value > 0
                    ? 'home-gas-change-negative'
                    : 'home-gas-change-neutral';
            const sign = value > 0 ? '+' : '';
            return `<span class="home-gas-change ${className}">${sign}${value.toFixed(2)}%</span>`;
        }

        function renderHomeGasMarketSummary(summary) {
            const container = document.getElementById('home-gas-rates-list');
            if (!container) return false;

            const categories = Array.isArray(summary?.categories) ? summary.categories : [];
            if (!categories.length) return false;

            container.innerHTML = categories.map(row => {
                const average = Number(row.average);
                const valueText = Number.isFinite(average) && average > 0 ? `${average.toFixed(2)} ₾` : '- - -';
                return `
                    <div class="intl-rate-item home-gas-rate-item" data-market-search="${String(row.label || '').toLowerCase()}">
                        <span class="intl-pair home-gas-pair">
                            <img src="${row.icon || `Logos/gas/categories/${row.key}.svg`}" alt="" class="home-gas-category-icon" loading="eager" decoding="sync" fetchpriority="high">
                            <span>${row.label}</span>
                        </span>
                        <span class="intl-value home-gas-value home-split-value">
                            <span class="home-split-main">${valueText}</span>
                            <span class="home-split-change">${formatHomeGasChange(row.changePercent)}</span>
                        </span>
                    </div>
                `;
            }).join('');

            return true;
        }

        async function fetchGasSummaryWithFallback() {
            const urls = IS_LOCAL_FRONTEND
                ? [API_GAS_SUMMARY_URL, API_GAS_SUMMARY_FALLBACK_URL]
                : [API_GAS_SUMMARY_URL];

            let lastError = null;
            for (const url of [...new Set(urls)]) {
                try {
                    const response = await fetch(url, { headers: { accept: 'application/json' } });
                    if (!response.ok) throw new Error(`Gas summary API error: ${response.status}`);
                    const summary = await response.json();
                    if (!Array.isArray(summary?.categories) || !summary.categories.length) {
                        throw new Error('Incomplete gas summary payload');
                    }
                    return summary;
                } catch (error) {
                    lastError = error;
                    console.warn(`Gas summary fetch failed (${url}):`, error.message);
                }
            }
            throw lastError || new Error('Gas summary fetch failed');
        }

        async function fetchHomeGasMarketPrices() {
            const container = document.getElementById('home-gas-rates-list');
            if (!container) return;
            let hasCachedGas = false;

            try {
                const cached = JSON.parse(localStorage.getItem(HOME_GAS_CACHE_KEY) || 'null');
                if (cached?.summary && renderHomeGasMarketSummary(cached.summary)) {
                    hasCachedGas = true;
                } else if (Array.isArray(cached?.records) && cached.records.length) {
                    renderHomeGasMarketPrices(cached.records);
                    hasCachedGas = true;
                }
            } catch {
                localStorage.removeItem(HOME_GAS_CACHE_KEY);
            }

            try {
                const summary = await fetchGasSummaryWithFallback();
                renderHomeGasMarketSummary(summary);
                localStorage.setItem(HOME_GAS_CACHE_KEY, JSON.stringify({ summary, updatedAt: Date.now() }));
            } catch (error) {
                console.error('საწვავის საბაზრო ფასების ჩატვირთვის შეცდომა:', error);
                if (!hasCachedGas) {
                    try {
                        const response = await fetch(API_GAS_URL, { headers: { accept: 'application/json' } });
                        if (!response.ok) throw new Error(`Gas API error: ${response.status}`);
                        const records = await response.json();
                        renderHomeGasMarketPrices(records);
                        localStorage.setItem(HOME_GAS_CACHE_KEY, JSON.stringify({ records, updatedAt: Date.now() }));
                    } catch (fallbackError) {
                        console.error('საწვავის fallback ფასების ჩატვირთვის შეცდომა:', fallbackError);
                        container.innerHTML = `
                            <div class="intl-rate-item home-gas-rate-item">
                                <span class="intl-pair">საწვავის ფასები</span>
                                <span class="intl-value">- - -</span>
                            </div>
                        `;
                    }
                }
            }
        }

        function bindMarketSearch() {
            document.querySelectorAll('.market-search-toggle').forEach(toggle => {
                const panel = document.getElementById(toggle.dataset.searchPanel);
                const input = panel?.querySelector('input[data-filter-list]');
                if (!panel || !input) return;

                toggle.addEventListener('click', () => {
                    const willOpen = panel.hidden;
                    panel.hidden = !willOpen;
                    toggle.classList.toggle('active', willOpen);
                    toggle.setAttribute('aria-expanded', String(willOpen));
                    if (willOpen) input.focus();
                    else {
                        input.value = '';
                        filterMarketList(input.dataset.filterList, '');
                    }
                });

                input.addEventListener('input', () => filterMarketList(input.dataset.filterList, input.value));
            });
        }

        function bindHomeMarketScrollControls() {
            const frame = document.querySelector('.home-market-scroll-frame');
            const scroller = document.querySelector('.home-market-scroll');
            const leftButton = document.querySelector('.home-market-arrow-left');
            const rightButton = document.querySelector('.home-market-arrow-right');
            if (!frame || !scroller || !leftButton || !rightButton) return;

            const getStep = () => {
                const card = scroller.querySelector('.home-card-uniform');
                const gap = Number.parseFloat(getComputedStyle(scroller).gap) || 0;
                return card ? card.getBoundingClientRect().width + gap : scroller.clientWidth * 0.8;
            };

            const updateControls = () => {
                const maxScroll = scroller.scrollWidth - scroller.clientWidth;
                const hasLeft = scroller.scrollLeft > 4;
                const hasRight = maxScroll > 4 && scroller.scrollLeft < maxScroll - 4;

                frame.classList.toggle('has-left-scroll', hasLeft);
                frame.classList.toggle('has-right-scroll', hasRight);
            };

            leftButton.addEventListener('click', () => {
                scroller.scrollBy({ left: -getStep(), behavior: 'smooth' });
            });

            rightButton.addEventListener('click', () => {
                scroller.scrollBy({ left: getStep(), behavior: 'smooth' });
            });

            updateControls();
            scroller.addEventListener('scroll', updateControls, { passive: true });
            window.addEventListener('resize', updateControls);
            setTimeout(updateControls, 400);
        }

        function filterMarketList(listId, value) {
            const term = String(value || '').toLowerCase().trim();
            const container = document.getElementById(listId);
            if (!container) return;

            container.classList.toggle('is-searching', Boolean(term));
            container.querySelectorAll('.intl-rate-item, .home-section').forEach(item => {
                const explicitSearch = item.dataset.marketSearch || item.querySelector('[data-market-search], [data-crypto-search]')?.dataset.marketSearch || item.querySelector('[data-crypto-search]')?.dataset.cryptoSearch;
                const search = (explicitSearch || item.textContent || '').toLowerCase();
                item.style.display = !term || search.includes(term) ? '' : 'none';
            });
        }

        const HOME_OFFICIAL_PRIORITY = ['USD', 'EUR', 'GBP', 'RUB', 'TRY'];
        const HOME_OFFICIAL_META = {
            USD: { title: 'USD / აშშ დოლარი', logo: 'Logos/US.png' },
            EUR: { title: 'EUR / ევრო', logo: 'Logos/EU.png' },
            GBP: { title: 'GBP/ფუნტი', logo: 'Logos/GB.png' },
            RUB: { title: 'RUB / რუბლი', logo: 'Logos/RU.png' },
            TRY: { title: 'TRY / ლირა', logo: 'Logos/TR.png' }
        };
        const HOME_OFFICIAL_FLAG_COUNTRIES = {
            AED: 'ae', AMD: 'am', AUD: 'au', AZN: 'az', BGN: 'bg', BRL: 'br', BYN: 'by',
            CAD: 'ca', CHF: 'ch', CNY: 'cn', CZK: 'cz', DKK: 'dk', EGP: 'eg', EUR: 'eu',
            GBP: 'gb', HKD: 'hk', HUF: 'hu', ILS: 'il', INR: 'in', IRR: 'ir', ISK: 'is',
            JPY: 'jp', KGS: 'kg', KRW: 'kr', KWD: 'kw', KZT: 'kz', MDL: 'md', NOK: 'no',
            NZD: 'nz', PLN: 'pl', QAR: 'qa', RON: 'ro', RSD: 'rs', RUB: 'ru', SEK: 'se',
            SGD: 'sg', TJS: 'tj', TMT: 'tm', TRY: 'tr', UAH: 'ua', USD: 'us', UZS: 'uz',
            ZAR: 'za'
        };

        async function fetchNBG() {
            try {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                const formattedDate = `${yyyy}-${mm}-${dd}`;
                const previousDate = previousBusinessDate(today);
                setHomeOfficialDateNote(today);
                
                const [res, previousRes] = await Promise.all([
                    fetch(`${API_NBG_URL}?date=${formattedDate}`),
                    fetch(`${API_NBG_URL}?date=${previousDate}`)
                ]);
                if (!res.ok) return;
                const data = await res.json();
                const previousData = previousRes.ok ? await previousRes.json() : [];
                const previousCurrencies = previousData && previousData.length > 0 ? previousData[0].currencies || [] : [];
                
                if (data && data.length > 0 && data[0].currencies) {
                    const currencies = data[0].currencies;
                    const dateStr = `${dd}/${mm}/${yyyy}`;
                    let cacheData = { date: dateStr, marketOfficialRates: {} };
                    
                    ['USD', 'EUR', 'GBP', 'CHF', 'RUB', 'TRY', 'AMD', 'AZN', 'ILS'].forEach(code => {
                        const obj = currencies.find(c => c.code === code);
                        if (obj) {
                            const val = obj.rate.toFixed(4);
                            cacheData[code.toLowerCase()] = val;
                            const unitRate = Number(obj.rate) / Number(obj.quantity || 1);
                            if (Number.isFinite(unitRate) && unitRate > 0) cacheData.marketOfficialRates[code] = unitRate;
                            const el = document.getElementById(`nbg-${code.toLowerCase()}`);
                            if(el) el.innerText = val;
                        }
                    });

                    renderHomeOfficialRates(currencies, previousCurrencies);
                    cacheData.officialRates = buildHomeOfficialRates(currencies, previousCurrencies);

                    // Update special home elements if they exist
                    if (cacheData.usd && setInnerText('home-nbg-usd')) document.getElementById('home-nbg-usd', cacheData.usd);
                    if (cacheData.eur && setInnerText('home-nbg-eur')) document.getElementById('home-nbg-eur', cacheData.eur);
                    
                    // Update dates
                    const dateElem = document.getElementById('nbg-date');
                    if(dateElem) dateElem.innerText = dateStr;
                    if(setInnerText('home-nbg-date')) document.getElementById('home-nbg-date', dateStr);
                    setHomeOfficialDateNote(today);
                    
                    setDisplay('nbg-rates-box', 'flex');
                    
                    // Cache NBG data
                    localStorage.setItem('cachedNBGData', JSON.stringify(cacheData));
                    refreshRateRelevanceViews();
                    updateHomeConverter();
                }
            } catch (err) {
                console.error('ეროვნული ბანკის კურსების ჩატვირთვა ვერ მოხერხდა', err);
            }
        }

        function previousBusinessDate(date) {
            const d = new Date(date);
            d.setDate(d.getDate() - 1);
            while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
            return d.toISOString().split('T')[0];
        }

        function formatHomeOfficialDate(date) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        }

        function setHomeOfficialDateNote(date = new Date()) {
            const el = document.getElementById('home-official-date-note');
            if (el) el.textContent = `(${formatHomeOfficialDate(date)})`;
        }

        function buildHomeOfficialRates(currencies, previousCurrencies = []) {
            const previousByCode = new Map(previousCurrencies.map(currency => [currency.code, currency]));
            return [...currencies]
                .filter(currency => currency && currency.code && Number.isFinite(Number(currency.rate)))
                .sort((a, b) => {
                    const priorityA = HOME_OFFICIAL_PRIORITY.indexOf(a.code);
                    const priorityB = HOME_OFFICIAL_PRIORITY.indexOf(b.code);
                    if (priorityA !== -1 || priorityB !== -1) {
                        return (priorityA === -1 ? 999 : priorityA) - (priorityB === -1 ? 999 : priorityB);
                    }
                    return a.code.localeCompare(b.code);
                })
                .map(currency => {
                    const rate = Number(currency.rate);
                    const previousRate = Number(previousByCode.get(currency.code)?.rate);
                    const change = Number.isFinite(previousRate) && previousRate !== 0
                        ? ((rate - previousRate) / previousRate) * 100
                        : null;
                    return {
                        code: currency.code,
                        title: HOME_OFFICIAL_META[currency.code]?.title || `${currency.code} / ${currency.name || ''}`.trim(),
                        logo: getHomeOfficialLogo(currency.code),
                        rate: rate.toFixed(4),
                        change: change === null ? '--' : `${change > 0 ? '+' : ''}${change.toFixed(2)}%`,
                        changeClass: change === null ? 'home-official-change-neutral' : change > 0 ? 'home-official-change-negative' : change < 0 ? 'home-official-change-positive' : 'home-official-change-neutral'
                    };
                });
        }

        function getHomeOfficialLogo(code) {
            if (HOME_OFFICIAL_META[code]?.logo) return HOME_OFFICIAL_META[code].logo;
            const country = HOME_OFFICIAL_FLAG_COUNTRIES[code];
            return country ? `https://flagcdn.com/w40/${country}.png` : '';
        }

        function renderHomeOfficialRates(currencies, previousCurrencies = []) {
            const list = Array.isArray(currencies) && currencies.length && currencies[0]?.rate !== undefined && !currencies[0]?.changeClass
                ? buildHomeOfficialRates(currencies, previousCurrencies)
                : currencies;
            const container = document.getElementById('home-official-list');
            if (!container || !Array.isArray(list)) return;

            container.innerHTML = list.map(item => `
                <div class="home-section" data-market-search="${`${item.code} ${item.title}`.toLowerCase()}">
                    <div class="section-title home-official-section-title">
                        ${item.logo ? `<img src="${item.logo}" alt="${item.code} Flag" loading="eager" decoding="sync" fetchpriority="high" onerror="this.style.display='none'">` : ''}
                        <span>${item.title}</span>
                    </div>
                    <div class="rates-flex home-official-rate-row">
                        <div class="rate-block home-official-rate-block">
                            <div class="home-official-values">
                                <span class="rate-value buy home-split-main">${item.rate}</span>
                                <span class="rate-value home-official-change ${item.changeClass}">${item.change}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        const nbgChartState = {
            activeType: 'usdgel',
            periodByType: { usdgel: '1w', eurusd: '1w' },
            pairByType: { usdgel: 'USDGEL', eurusd: 'EURUSD' },
            charts: {},
            dataCache: {}
        };

        const nbgChartMeta = {
            usdgel: {
                title: 'ქართული ლარი vs უცხოური ვალუტები',
                inlineCanvasId: 'home-nbg-usd-chart',
                inlinePanelId: 'home-nbg-chart-panel',
                loaderId: 'home-nbg-chart-loading',
                buttonClass: 'home-usdgel-period-btn',
                selectId: 'home-gel-pair-select',
                subtitleId: 'home-gel-chart-subtitle',
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.14)',
                yDigits: 2,
                tooltipDigits: 4
            },
            eurusd: {
                title: 'Forex კურსები',
                inlineCanvasId: 'home-eurusd-chart',
                inlinePanelId: 'home-eurusd-chart-panel',
                loaderId: 'home-eurusd-chart-loading',
                buttonClass: 'home-eurusd-period-btn',
                selectId: 'home-cross-pair-select',
                subtitleId: 'home-cross-chart-subtitle',
                borderColor: '#34d399',
                backgroundColor: 'rgba(52, 211, 153, 0.14)',
                yDigits: 3,
                tooltipDigits: 4
            }
        };

        const nbgChartPeriods = {
            '1w': { days: 7, stepDays: 1 },
            '1m': { months: 1, stepDays: 1 },
            '3m': { months: 3, stepDays: 3 },
            '1y': { months: 12, stepDays: 7 },
            '5y': { months: 60, stepDays: 30 }
        };

        const marketDynamicsState = {
            mode: 'usd',
            period: '1d',
            chart: null,
            blinkTimer: null,
            dataCache: {}
        };
        const MARKET_DYNAMICS_CACHE_MS = 60_000;

        const marketDynamicsPeriods = {
            '1d': { hours: 24, label: 'ბოლო 12 საათი' },
            '3d': { hours: 72, label: 'ბოლო 3 დღე' },
            '1w': { hours: 168, label: 'ბოლო 1 კვირა' },
            custom: { label: 'არჩეული დღე' }
        };

        function formatDateForInput(date) {
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }

        function formatDateForMarketHistoryPath(dateInputValue) {
            const [year, month, day] = String(dateInputValue || '').split('-');
            if (!year || !month || !day) return '';
            return `${day}-${month}-${year}`;
        }

        function addDaysToInputDate(dateInputValue, days) {
            const date = new Date(`${dateInputValue}T12:00:00`);
            date.setDate(date.getDate() + days);
            return formatDateForInput(date);
        }

        function formatMarketRecordLabel(record, includeDate = false) {
            if (!includeDate) return record.time;
            const [day, month] = String(record.date || '').split('.');
            return `${day}/${month} ${record.time}`;
        }

        function formatMarketSlotTime(timestamp) {
            const date = new Date(timestamp);
            return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        }

        function formatDateForApi(date) {
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }

        function formatChartLabel(dateStr, compact = true) {
            const date = new Date(`${dateStr}T00:00:00`);
            const dd = String(date.getDate()).padStart(2, '0');
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const yy = String(date.getFullYear()).slice(-2);
            return compact ? `${dd}/${mm}/${yy}` : `${dd}/${mm}/${date.getFullYear()}`;
        }

        function getNbgSampleDates(period) {
            const config = nbgChartPeriods[period] || nbgChartPeriods['1m'];
            const end = new Date();
            const start = new Date();
            if (config.days) {
                start.setDate(start.getDate() - config.days);
            } else {
                start.setMonth(start.getMonth() - config.months);
            }

            const dates = [];
            const cursor = new Date(start);
            while (cursor <= end) {
                dates.push(formatDateForApi(cursor));
                cursor.setDate(cursor.getDate() + config.stepDays);
            }
            const todayStr = formatDateForApi(end);
            if (dates[dates.length - 1] !== todayStr) dates.push(todayStr);
            return dates;
        }

        function clearStaleNbgChartCache() {
            try {
                if (localStorage.getItem(NBG_CHART_CACHE_VERSION_KEY) === NBG_CHART_CACHE_VERSION) return;
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('cachedNbgChart_')) localStorage.removeItem(key);
                });
                localStorage.setItem(NBG_CHART_CACHE_VERSION_KEY, NBG_CHART_CACHE_VERSION);
            } catch {}
        }

        async function fetchNbgRatesForDate(dateStr) {
            const baseDate = new Date(`${dateStr}T00:00:00`);
            for (let i = 0; i < 5; i++) {
                const d = new Date(baseDate);
                d.setDate(d.getDate() - i);
                const queryDate = formatDateForApi(d);
                const res = await fetch(`${API_NBG_URL}?date=${queryDate}`);
                if (!res.ok) continue;
                const data = await res.json();
                const currencies = data?.[0]?.currencies || [];
                const rates = { GEL: 1 };
                currencies.forEach(currency => {
                    const rate = Number(currency.rate);
                    const quantity = Number(currency.quantity || 1);
                    if (currency.code && rate && quantity) {
                        rates[currency.code] = rate / quantity;
                    }
                });
                if (rates.USD) {
                    return {
                        date: dateStr,
                        sourceDate: queryDate,
                        rates
                    };
                }
            }
            return null;
        }

        function formatNbgPair(pair) {
            if (!pair || pair.length < 6) return pair || '';
            return `${pair.slice(0, 3)}/${pair.slice(3)}`;
        }

        function parseNbgPair(pair) {
            const normalized = String(pair || '').replace('/', '').toUpperCase();
            return {
                base: normalized.slice(0, 3),
                quote: normalized.slice(3, 6)
            };
        }

        function valueFromNbgPoint(pair, point) {
            const { base, quote } = parseNbgPair(pair);
            const baseRate = point.rates?.[base];
            const quoteRate = point.rates?.[quote];
            if (!baseRate || !quoteRate) return null;
            return Number((baseRate / quoteRate).toFixed(4));
        }

        async function loadNbgChartData(type, period, pair = nbgChartState.pairByType[type]) {
            const todayKey = formatDateForApi(new Date());
            const cacheId = `${type}_${pair}_${period}_${todayKey}`;
            if (nbgChartState.dataCache[cacheId]) return nbgChartState.dataCache[cacheId];

            const cacheKey = `cachedNbgChart_${cacheId}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (Date.now() - Number(parsed.cachedAt || 0) < NBG_CHART_CACHE_TTL_MS && parsed.data) {
                        nbgChartState.dataCache[cacheId] = parsed.data;
                        return parsed.data;
                    }
                    localStorage.removeItem(cacheKey);
                } catch {}
            }

            const samples = await Promise.all(getNbgSampleDates(period).map(fetchNbgRatesForDate));
            const seen = new Set();
            const points = samples
                .filter(Boolean)
                .map(point => ({ date: point.date, value: valueFromNbgPoint(pair, point) }))
                .filter(point => point.value !== null)
                .filter(point => {
                    if (seen.has(point.date)) return false;
                    seen.add(point.date);
                    return true;
                })
                .sort((a, b) => a.date.localeCompare(b.date));

            const data = {
                labels: points.map(point => formatChartLabel(point.date)),
                values: points.map(point => point.value),
                dates: points.map(point => point.date)
            };

            if (data.values.length) {
                nbgChartState.dataCache[cacheId] = data;
                localStorage.setItem(cacheKey, JSON.stringify({
                    cachedAt: Date.now(),
                    version: NBG_CHART_CACHE_VERSION,
                    data
                }));
            }
            return data;
        }

        function updateNbgPairText(type) {
            const meta = nbgChartMeta[type];
            const label = formatNbgPair(nbgChartState.pairByType[type]);
            const subtitle = document.getElementById(meta.subtitleId);
            if (subtitle) subtitle.textContent = label;
            return label;
        }

        function setNbgChartLoading(type, isLoading) {
            const loader = document.getElementById(nbgChartMeta[type]?.loaderId);
            if (loader) loader.style.display = isLoading ? 'flex' : 'none';
        }

        function makeNbgChartConfig(type, data) {
            const meta = nbgChartMeta[type] || nbgChartMeta.usdgel;
            const label = formatNbgPair(nbgChartState.pairByType[type]);
            return {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label,
                        data: data.values,
                        borderColor: meta.borderColor,
                        backgroundColor: meta.backgroundColor,
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        fill: true,
                        tension: 0.35
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { intersect: false, mode: 'index' },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: ctx => `${label}: ${Number(ctx.raw).toFixed(meta.tooltipDigits)}`
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#94a3b8', maxTicksLimit: 7 },
                            grid: { color: 'rgba(148, 163, 184, 0.12)' }
                        },
                        y: {
                            ticks: { color: '#94a3b8', callback: value => Number(value).toFixed(meta.yDigits) },
                            grid: { color: 'rgba(148, 163, 184, 0.12)' }
                        }
                    }
                }
            };
        }

        function renderNbgChart(type, canvasId, data, chartKey) {
            const canvas = document.getElementById(canvasId);
            if (!canvas || typeof Chart === 'undefined' || !data?.values?.length) return;
            if (nbgChartState.charts[chartKey]) nbgChartState.charts[chartKey].destroy();
            nbgChartState.charts[chartKey] = new Chart(canvas, makeNbgChartConfig(type, data));
        }

        function setNbgPeriodButtons(type, period) {
            const selector = type === 'modal' ? '.home-modal-period-btn' : `.${nbgChartMeta[type].buttonClass}`;
            document.querySelectorAll(selector).forEach(btn => {
                btn.classList.toggle('active', btn.dataset.period === period);
            });
        }

        async function updateNbgChart(type, period = nbgChartState.periodByType[type]) {
            if (!nbgChartMeta[type]) return;
            nbgChartState.periodByType[type] = period;
            const label = updateNbgPairText(type);
            setNbgPeriodButtons(type, period);
            if (nbgChartState.activeType === type) setNbgPeriodButtons('modal', period);
            setNbgChartLoading(type, true);
            try {
                const data = await loadNbgChartData(type, period, nbgChartState.pairByType[type]);
                renderNbgChart(type, nbgChartMeta[type].inlineCanvasId, data, `${type}InlineChart`);
                if (nbgChartState.activeType === type) {
                    const modalSubtitle = document.getElementById('home-chart-modal-subtitle');
                    if (modalSubtitle) modalSubtitle.textContent = label;
                    renderNbgChart(type, 'home-chart-modal-canvas', data, 'modalChart');
                }
            } catch (err) {
                console.error(`${label} ჩარტის ჩატვირთვა ვერ მოხერხდა`, err);
            } finally {
                setNbgChartLoading(type, false);
            }
        }

        function openNbgChartModal(type) {
            const modal = document.getElementById('home-chart-modal');
            if (!modal || !nbgChartMeta[type]) return;
            nbgChartState.activeType = type;
            const meta = nbgChartMeta[type];
            const title = document.getElementById('home-chart-modal-title');
            const subtitle = document.getElementById('home-chart-modal-subtitle');
            if (title) title.textContent = meta.title;
            if (subtitle) subtitle.textContent = formatNbgPair(nbgChartState.pairByType[type]);
            setNbgPeriodButtons('modal', nbgChartState.periodByType[type]);
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            updateNbgChart(type, nbgChartState.periodByType[type]);
            setTimeout(() => {
                if (nbgChartState.charts.modalChart) nbgChartState.charts.modalChart.resize();
            }, 60);
        }

        function initNbgCharts() {
            if (typeof Chart === 'undefined') return;
            clearStaleNbgChartCache();

            const modal = document.getElementById('home-chart-modal');
            const modalClose = document.getElementById('home-chart-modal-close');

            Object.keys(nbgChartMeta).forEach(type => {
                const panel = document.getElementById(nbgChartMeta[type].inlinePanelId);
                if (panel) {
                    panel.addEventListener('click', event => {
                        if (event.target.closest('a, button, select, input, textarea')) return;
                        openNbgChartModal(type);
                    });
                }

                const select = document.getElementById(nbgChartMeta[type].selectId);
                if (select) {
                    select.value = nbgChartState.pairByType[type];
                    select.addEventListener('click', event => event.stopPropagation());
                    select.addEventListener('change', event => {
                        event.stopPropagation();
                        nbgChartState.pairByType[type] = select.value;
                        updateNbgChart(type, nbgChartState.periodByType[type]);
                    });
                }

                document.querySelectorAll(`.${nbgChartMeta[type].buttonClass}`).forEach(btn => {
                    btn.addEventListener('click', event => {
                        event.stopPropagation();
                        updateNbgChart(type, btn.dataset.period || '1w');
                    });
                });

                updateNbgChart(type, nbgChartState.periodByType[type]);
            });

            document.querySelectorAll('.home-modal-period-btn').forEach(btn => {
                btn.addEventListener('click', event => {
                    event.stopPropagation();
                    updateNbgChart(nbgChartState.activeType, btn.dataset.period || '1w');
                });
            });

            const closeModal = () => {
                if (!modal) return;
                modal.classList.remove('open');
                modal.setAttribute('aria-hidden', 'true');
            };

            if (modalClose) modalClose.addEventListener('click', closeModal);
            if (modal) {
                modal.addEventListener('click', event => {
                    if (event.target === modal) closeModal();
                });
            }
        }

        function setMarketDynamicsLoading(isLoading) {
            const loader = document.getElementById('home-market-dynamics-loading');
            if (loader) loader.style.display = isLoading ? 'flex' : 'none';
        }

        function setMarketDynamicsEmpty(isEmpty) {
            const empty = document.getElementById('home-market-dynamics-empty');
            if (empty) empty.hidden = !isEmpty;
        }

        function stopMarketDynamicsBlink() {
            if (marketDynamicsState.blinkTimer) {
                clearInterval(marketDynamicsState.blinkTimer);
                marketDynamicsState.blinkTimer = null;
            }
        }

        function formatMarketDynamicsTitle(mode) {
            if (mode === 'eur') return 'საბაზრო კურსის დინამიკა დროში (EURGEL)';
            if (mode === 'both') return 'საბაზრო კურსის დინამიკა დროში (USDGEL & EURGEL)';
            return 'საბაზრო კურსის დინამიკა დროში (USDGEL)';
        }

        function updateMarketDynamicsTexts(mode, label, count) {
            const title = document.getElementById('home-market-dynamics-title');
            const subtitle = document.getElementById('home-market-dynamics-subtitle');
            if (title) title.textContent = formatMarketDynamicsTitle(mode);
            if (subtitle) {
                subtitle.textContent = count
                    ? label
                    : `${label} · მონაცემები ჯერ არ არის`;
            }
        }

        function hasMarketDynamicsRecords(data) {
            return Array.isArray(data?.records) && data.records.length > 0;
        }

        async function loadMarketDynamicsData(dateValue) {
            const datePath = formatDateForMarketHistoryPath(dateValue);
            if (!datePath) return { records: [] };
            const memoryCached = marketDynamicsState.dataCache[datePath];
            if (memoryCached && hasMarketDynamicsRecords(memoryCached.data) && Date.now() - Number(memoryCached.cachedAt || 0) < MARKET_DYNAMICS_CACHE_MS) {
                return memoryCached.data;
            }

            const cacheKey = `${MARKET_DYNAMICS_CACHE_PREFIX}_${datePath}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    const cacheRecord = parsed?.data ? parsed : { data: parsed, cachedAt: 0 };
                    if (hasMarketDynamicsRecords(cacheRecord.data) && Date.now() - Number(cacheRecord.cachedAt || 0) < MARKET_DYNAMICS_CACHE_MS) {
                        marketDynamicsState.dataCache[datePath] = cacheRecord;
                        return cacheRecord.data;
                    }
                } catch {}
            }

            const response = await fetch(`${API_MARKET_HISTORY_URL}/day/${datePath}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (Array.isArray(data.records) && data.records.length) {
                const cacheRecord = { cachedAt: Date.now(), data };
                marketDynamicsState.dataCache[datePath] = cacheRecord;
                localStorage.setItem(cacheKey, JSON.stringify(cacheRecord));
            } else {
                delete marketDynamicsState.dataCache[datePath];
                localStorage.removeItem(cacheKey);
            }
            return data;
        }

        async function loadMarketDynamicsRangeData(fromDateValue, toDateValue) {
            const fromPath = formatDateForMarketHistoryPath(fromDateValue);
            const toPath = formatDateForMarketHistoryPath(toDateValue);
            if (!fromPath || !toPath) return { records: [] };

            const cacheKey = `range_${fromPath}_${toPath}`;
            const memoryCached = marketDynamicsState.dataCache[cacheKey];
            if (memoryCached && hasMarketDynamicsRecords(memoryCached.data) && Date.now() - Number(memoryCached.cachedAt || 0) < MARKET_DYNAMICS_CACHE_MS) {
                return memoryCached.data;
            }

            const localCacheKey = `${MARKET_DYNAMICS_CACHE_PREFIX}_${cacheKey}`;
            const cached = localStorage.getItem(localCacheKey);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (hasMarketDynamicsRecords(parsed.data) && Date.now() - Number(parsed.cachedAt || 0) < MARKET_DYNAMICS_CACHE_MS) {
                        marketDynamicsState.dataCache[cacheKey] = parsed;
                        return parsed.data;
                    }
                } catch {}
            }

            const response = await fetch(`${API_MARKET_HISTORY_URL}/range/${fromPath}/${toPath}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (Array.isArray(data.records) && data.records.length) {
                const cacheRecord = { cachedAt: Date.now(), data };
                marketDynamicsState.dataCache[cacheKey] = cacheRecord;
                localStorage.setItem(localCacheKey, JSON.stringify(cacheRecord));
            } else {
                delete marketDynamicsState.dataCache[cacheKey];
                localStorage.removeItem(localCacheKey);
            }
            return data;
        }

        function filterMarketDynamicsPeriodRecords(records, period) {
            const sortedRecords = [...records].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            if (period === 'custom' || !sortedRecords.length) return sortedRecords;

            const hours = marketDynamicsPeriods[period]?.hours || 24;
            const latestTimestamp = new Date(sortedRecords[sortedRecords.length - 1].timestamp).getTime();
            const fromTimestamp = latestTimestamp - (hours * 60 * 60 * 1000);
            return sortedRecords.filter(record => new Date(record.timestamp).getTime() >= fromTimestamp);
        }

        function buildMarketDynamicsLiveEndSlots(records) {
            const sortedRecords = [...records].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            if (!sortedRecords.length) return sortedRecords;

            const slotMs = 30 * 60 * 1000;
            const latestTimestamp = new Date(sortedRecords[sortedRecords.length - 1].timestamp).getTime();
            const hoursBack = marketDynamicsState.period === '1d'
                ? 12
                : (marketDynamicsPeriods[marketDynamicsState.period]?.hours || 24);
            const startTimestamp = latestTimestamp - (hoursBack * 60 * 60 * 1000);
            const endTimestamp = latestTimestamp + (3 * 60 * 60 * 1000);
            const byTimestamp = new Map(sortedRecords.map(record => [new Date(record.timestamp).getTime(), record]));
            const slots = [];

            for (let timestamp = startTimestamp; timestamp <= endTimestamp; timestamp += slotMs) {
                const record = byTimestamp.get(timestamp);
                slots.push(record || {
                    timestamp: new Date(timestamp).toISOString(),
                    date: '',
                    time: formatMarketSlotTime(timestamp),
                    isEmptySlot: true
                });
            }

            return slots;
        }

        function shouldUseMarketDynamicsLiveEnd(period) {
            return ['1d', '3d', '1w'].includes(period);
        }

        function getMarketDynamicsLastDataIndex(data) {
            for (let index = data.length - 1; index >= 0; index -= 1) {
                if (data[index] !== null && data[index] !== undefined && Number.isFinite(Number(data[index]))) return index;
            }
            return -1;
        }

        function getMarketDynamicsPairValues(record, pairKey) {
            const source = record?.[pairKey] || {};
            const buy = Number(source.buy);
            const sell = Number(source.sell);
            return {
                buy: Number.isFinite(buy) ? buy : null,
                sell: Number.isFinite(sell) ? sell : null,
                spread: Number(source.spread),
                average: Number.isFinite(buy) && Number.isFinite(sell) ? Number(((buy + sell) / 2).toFixed(4)) : null
            };
        }

        function buildMarketDynamicsDatasets(records, mode) {
            if (mode === 'both') {
                return [
                    {
                        label: 'USD/GEL საშუალო',
                        data: records.map(record => getMarketDynamicsPairValues(record, 'usdgel').average),
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.08)',
                        borderWidth: 2,
                        pointRadius: 2,
                        pointHoverRadius: 5,
                        tension: 0.35,
                        spanGaps: false,
                        yAxisID: 'yUsd'
                    },
                    {
                        label: 'EUR/GEL საშუალო',
                        data: records.map(record => getMarketDynamicsPairValues(record, 'eurgel').average),
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.08)',
                        borderWidth: 2,
                        pointRadius: 2,
                        pointHoverRadius: 5,
                        tension: 0.35,
                        spanGaps: false,
                        yAxisID: 'yEur'
                    }
                ];
            }

            const pairKey = mode === 'eur' ? 'eurgel' : 'usdgel';
            const pairLabel = mode === 'eur' ? 'EUR/GEL' : 'USD/GEL';
            return [
                {
                    label: `${pairLabel} გაყიდვა`,
                    data: records.map(record => getMarketDynamicsPairValues(record, pairKey).sell),
                    borderColor: '#fb7185',
                    backgroundColor: 'rgba(251, 113, 133, 0.16)',
                    borderWidth: 2,
                    pointRadius: 2,
                    pointHoverRadius: 5,
                    tension: 0.35,
                    spanGaps: false,
                    fill: '+1'
                },
                {
                    label: `${pairLabel} ყიდვა`,
                    data: records.map(record => getMarketDynamicsPairValues(record, pairKey).buy),
                    borderColor: '#34d399',
                    backgroundColor: 'rgba(52, 211, 153, 0.10)',
                    borderWidth: 2,
                    pointRadius: 2,
                    pointHoverRadius: 5,
                    tension: 0.35,
                    spanGaps: false,
                    fill: false
                }
            ];
        }

        const marketDynamicsLivePointPlugin = {
            id: 'marketDynamicsLivePoint',
            afterDatasetsDraw(chart, args, pluginOptions) {
                if (!pluginOptions?.enabled) return;
                const { ctx, data } = chart;
                const pulse = 0.5 + (Math.sin(Date.now() / 260) + 1) / 2;

                data.datasets.forEach((dataset, datasetIndex) => {
                    const values = Array.isArray(dataset.data) ? dataset.data : [];
                    const pointIndex = getMarketDynamicsLastDataIndex(values);
                    if (pointIndex < 0) return;

                    const meta = chart.getDatasetMeta(datasetIndex);
                    const point = meta?.data?.[pointIndex];
                    const value = Number(values[pointIndex]);
                    if (!point || !Number.isFinite(value)) return;

                    const { x, y } = point.getProps(['x', 'y'], true);
                    const color = dataset.borderColor || '#38bdf8';

                    ctx.save();
                    ctx.globalAlpha = 0.16 + pulse * 0.12;
                    ctx.beginPath();
                    ctx.arc(x, y, 5 + pulse * 4, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                    ctx.globalAlpha = 1;

                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 10 + pulse * 8;
                    ctx.fill();

                    const text = value.toFixed(4);
                    const textX = Math.min(x + 13, chart.chartArea.right - 82);
                    const textY = y - 11 + (datasetIndex % 2) * 24;
                    ctx.shadowBlur = 0;
                    ctx.font = '950 16px Inter, sans-serif';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    ctx.lineWidth = 6;
                    ctx.strokeStyle = 'rgba(15, 23, 42, 0.96)';
                    ctx.strokeText(text, textX, textY);
                    ctx.fillStyle = color;
                    ctx.shadowColor = 'rgba(15, 23, 42, 0.55)';
                    ctx.shadowBlur = 4;
                    ctx.fillText(text, textX, textY);
                    ctx.restore();
                });
            }
        };

        function makeMarketDynamicsChartConfig(records, mode, period = marketDynamicsState.period) {
            const labels = records.map(record => formatMarketRecordLabel(record, period !== '1d' && period !== 'custom'));
            const datasets = buildMarketDynamicsDatasets(records, mode);
            const isBothMode = mode === 'both';
            const isLiveEndMode = shouldUseMarketDynamicsLiveEnd(period);

            return {
                type: 'line',
                data: { labels, datasets },
                plugins: [marketDynamicsLivePointPlugin],
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { intersect: false, mode: 'index' },
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                color: '#cbd5e1',
                                boxWidth: 10,
                                boxHeight: 10,
                                usePointStyle: true,
                                font: { size: 11, weight: '700' }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.raw).toFixed(4)}`,
                                afterBody: (items) => {
                                    if (isBothMode || !items?.length) return [];
                                    const record = records[items[0].dataIndex];
                                    const pairKey = mode === 'eur' ? 'eurgel' : 'usdgel';
                                    const values = getMarketDynamicsPairValues(record, pairKey);
                                    const spread = Number.isFinite(values.spread)
                                        ? values.spread
                                        : (Number.isFinite(values.sell) && Number.isFinite(values.buy) ? values.sell - values.buy : NaN);
                                    return Number.isFinite(spread) ? [`სპრედი: ${spread.toFixed(4)}`] : [];
                                }
                            }
                        },
                        marketDynamicsLivePoint: {
                            enabled: isLiveEndMode
                        }
                    },
                    scales: isBothMode
                        ? {
                            x: {
                                ticks: {
                                    color: '#94a3b8',
                                    maxTicksLimit: period === '1d' ? 31 : 14,
                                    autoSkip: period !== '1d',
                                    font: { size: period === '1d' ? 10 : 11 }
                                },
                                grid: { color: 'rgba(148, 163, 184, 0.10)' }
                            },
                            yUsd: {
                                position: 'left',
                                ticks: { color: '#38bdf8', callback: value => Number(value).toFixed(4) },
                                grid: { color: 'rgba(148, 163, 184, 0.10)' }
                            },
                            yEur: {
                                position: 'right',
                                ticks: { color: '#f59e0b', callback: value => Number(value).toFixed(4) },
                                grid: { drawOnChartArea: false }
                            }
                        }
                        : {
                            x: {
                                ticks: {
                                    color: '#94a3b8',
                                    maxTicksLimit: period === '1d' ? 31 : 14,
                                    autoSkip: period !== '1d',
                                    font: { size: period === '1d' ? 10 : 11 }
                                },
                                grid: { color: 'rgba(148, 163, 184, 0.10)' }
                            },
                            y: {
                                ticks: { color: '#94a3b8', callback: value => Number(value).toFixed(4) },
                                grid: { color: 'rgba(148, 163, 184, 0.10)' }
                            }
                        }
                }
            };
        }

        async function updateMarketDynamicsChart() {
            const canvas = document.getElementById('home-market-dynamics-chart');
            const dateInput = document.getElementById('home-market-dynamics-date');
            if (!canvas || !dateInput || typeof Chart === 'undefined') return;

            const dateValue = dateInput.value || formatDateForInput(new Date());
            setMarketDynamicsLoading(true);
            setMarketDynamicsEmpty(false);

            try {
                let data;
                let label;
                if (marketDynamicsState.period === 'custom') {
                    data = await loadMarketDynamicsData(dateValue);
                    label = `${dateValue.split('-').reverse().join('.')} · არჩეული დღე`;
                } else {
                    const periodConfig = marketDynamicsPeriods[marketDynamicsState.period] || marketDynamicsPeriods['1d'];
                    const daysBack = Math.ceil((periodConfig.hours || 24) / 24) + 1;
                    const fromDateValue = addDaysToInputDate(dateValue, -daysBack);
                    const toDateValue = addDaysToInputDate(dateValue, 1);
                    data = await loadMarketDynamicsRangeData(fromDateValue, toDateValue);
                    label = periodConfig.label;
                }

                const records = filterMarketDynamicsPeriodRecords(
                    Array.isArray(data.records) ? data.records : [],
                    marketDynamicsState.period
                );
                updateMarketDynamicsTexts(marketDynamicsState.mode, label, records.length);

                if (marketDynamicsState.chart) {
                    stopMarketDynamicsBlink();
                    marketDynamicsState.chart.destroy();
                    marketDynamicsState.chart = null;
                }

                const chartRecords = shouldUseMarketDynamicsLiveEnd(marketDynamicsState.period)
                    ? buildMarketDynamicsLiveEndSlots(records)
                    : records;

                if (!chartRecords.length) {
                    setMarketDynamicsEmpty(true);
                    return;
                }

                marketDynamicsState.chart = new Chart(canvas, makeMarketDynamicsChartConfig(chartRecords, marketDynamicsState.mode, marketDynamicsState.period));
                if (shouldUseMarketDynamicsLiveEnd(marketDynamicsState.period)) {
                    marketDynamicsState.blinkTimer = setInterval(() => {
                        if (marketDynamicsState.chart) marketDynamicsState.chart.draw();
                    }, 260);
                }
            } catch (error) {
                console.error('საბაზრო კურსების დინამიკის ჩატვირთვა ვერ მოხერხდა:', error);
                updateMarketDynamicsTexts(marketDynamicsState.mode, marketDynamicsPeriods[marketDynamicsState.period]?.label || 'არჩეული დღე', 0);
                setMarketDynamicsEmpty(true);
            } finally {
                setMarketDynamicsLoading(false);
            }
        }

        function initMarketDynamicsChart() {
            const panel = document.querySelector('.home-market-dynamics-panel');
            const dateInput = document.getElementById('home-market-dynamics-date');
            if (!panel || !dateInput || typeof Chart === 'undefined') return;

            dateInput.value = formatDateForInput(new Date());
            dateInput.addEventListener('change', () => {
                marketDynamicsState.period = 'custom';
                document.querySelectorAll('.home-market-dynamics-period').forEach(item => item.classList.remove('active'));
                updateMarketDynamicsChart();
            });

            document.querySelectorAll('.home-market-dynamics-period').forEach(button => {
                button.addEventListener('click', () => {
                    marketDynamicsState.period = button.dataset.marketDynamicsPeriod || '1d';
                    document.querySelectorAll('.home-market-dynamics-period').forEach(item => {
                        item.classList.toggle('active', item === button);
                    });
                    updateMarketDynamicsChart();
                });
            });

            document.querySelectorAll('.home-market-dynamics-mode').forEach(button => {
                button.addEventListener('click', () => {
                    marketDynamicsState.mode = button.dataset.marketDynamicsMode || 'usd';
                    document.querySelectorAll('.home-market-dynamics-mode').forEach(item => {
                        item.classList.toggle('active', item === button);
                    });
                    updateMarketDynamicsChart();
                });
            });

            updateMarketDynamicsChart();
        }

        function switchTab(tab) {
            currentTab = tab;
            localStorage.setItem('allrates_current_tab', tab);
            
            // ღილაკების ვიზუალის განახლება
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            const activeTabButton = document.querySelector(`.tab-btn[data-tab="${tab}"]`) || document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`);
            if (activeTabButton) activeTabButton.classList.add('active');

            renderTable('usd');
            renderTable('eur');
            renderTable('gbp');
            renderTable('rub');
            renderTable('try');
        }

        

        
        let expandedStates = { usd: false, eur: false, gbp: false, rub: false, try: false };

        function toggleExpand(currency) {
            // Toggle all states based on the clicked one
            const newState = !expandedStates[currency];
            expandedStates.usd = newState;
            expandedStates.eur = newState;
            expandedStates.gbp = newState;
            expandedStates.rub = newState;
            expandedStates.try = newState;
            
            renderTable('usd');
            renderTable('eur');
            renderTable('gbp');
            renderTable('rub');
            renderTable('try');
            
            // Scroll to the top of the tables wrapper if collapsing so we don't end up far down the page
            if (!newState) {
                const wrapper = document.getElementById('tables-wrapper');
                if (wrapper) {
                    const yOffset = -80; 
                    const y = wrapper.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({top: y, behavior: 'smooth'});
                }
            }
        }

        let sortConfigs = {
            usd: { column: 'spread', order: 'asc' },
            eur: { column: 'spread', order: 'asc' },
            gbp: { column: 'spread', order: 'asc' },
            rub: { column: 'spread', order: 'asc' },
            try: { column: 'spread', order: 'asc' }
        };

        function sortData(currency, column) {
            if (sortConfigs[currency].column === column) {
                sortConfigs[currency].order = sortConfigs[currency].order === 'asc' ? 'desc' : 'asc';
            } else {
                if (column === 'company') sortConfigs[currency].order = 'asc';
                else if (column === 'buy') sortConfigs[currency].order = 'desc';
                else if (column === 'sell') sortConfigs[currency].order = 'asc';
                else if (column === 'spread') sortConfigs[currency].order = 'asc';
                
                sortConfigs[currency].column = column;
            }

            expandedStates.usd = true;
            expandedStates.eur = true;
            expandedStates.gbp = true;
            expandedStates.rub = true;
            
            applySorting(currency);
            // Render other tables to show expanded state
            ['usd', 'eur', 'gbp', 'rub', 'try'].forEach(cur => {
                if (cur !== currency) renderTable(cur);
            });
            
            if (column === 'company') {
                const curs = ['usd', 'eur', 'gbp', 'rub', 'try'];
                curs.forEach(cur => {
                    if (cur !== currency) {
                        sortConfigs[cur].column = 'company';
                        sortConfigs[cur].order = sortConfigs[currency].order;
                        expandedStates[cur] = true;
                        applySorting(cur);
                    }
                });
            }
        }

        function toggleSort(currency) {
            sortData(currency, 'spread');
        }

        function applySorting(currency) {
            const dataArr = currency === 'usd' ? usdData : currency === 'eur' ? eurData : currency === 'gbp' ? gbpData : currency === 'rub' ? rubData : tryData;
            const config = sortConfigs[currency];
            const isAsc = config.order === 'asc' ? 1 : -1;

            dataArr.sort((a, b) => {
                const aOutlier = isCompanyRateOutlier(a, currency);
                const bOutlier = isCompanyRateOutlier(b, currency);
                if (aOutlier !== bOutlier) return aOutlier ? 1 : -1;

                if (config.column === 'company') {
                    const getKey = (item) => {
                        const ck = item.baseCompany || item.Company.toLowerCase();
                        let name = item.Company;
                        if (item.baseCompany && typeof COMPANY_NAMES_KA !== 'undefined' && COMPANY_NAMES_KA[item.baseCompany]) {
                            const match = item.Company.match(/\((.*?)\)/);
                            if (match) name = COMPANY_NAMES_KA[item.baseCompany] + ' (' + match[1] + ')';
                            else name = COMPANY_NAMES_KA[item.baseCompany];
                        } else if (typeof COMPANY_NAMES_KA !== 'undefined' && COMPANY_NAMES_KA[ck]) {
                            name = COMPANY_NAMES_KA[ck];
                        }
                        return name.toLowerCase();
                    };
                    const cA = getKey(a);
                    const cB = getKey(b);
                    if (cA < cB) return -1 * isAsc;
                    if (cA > cB) return 1 * isAsc;
                    return 0;
                } else if (config.column === 'buy') {
                    const k = RATE_KEY_BY_CURRENCY[currency].buy;
                    const vA = parseFloat(a[k]) || 0;
                    const vB = parseFloat(b[k]) || 0;
                    return (vA - vB) * isAsc;
                } else if (config.column === 'sell') {
                    const k = RATE_KEY_BY_CURRENCY[currency].sell;
                    const vA = parseFloat(a[k]) || Infinity;
                    const vB = parseFloat(b[k]) || Infinity;
                    return (vA - vB) * isAsc;
                } else if (config.column === 'spread') {
                    const k = RATE_KEY_BY_CURRENCY[currency].spread;
                    const vA = parseFloat(a[k]) || Infinity;
                    const vB = parseFloat(b[k]) || Infinity;
                    return (vA - vB) * isAsc;
                }
                return 0;
            });

            renderTable(currency);
            updateHeadersUI(currency);
        }

        function getCompanyKey(item) {
            if (!item) return '';
            if (item.baseCompany) return String(item.baseCompany).toLowerCase();
            const company = String(item.Company || item.company || '').toLowerCase();
            if (!company) return '';
            if (company.includes('bog')) return 'bog';
            if (company.includes('credo')) return 'credo';
            if (company.includes('liberty')) return 'liberty';
            if (company.includes('basis')) return 'bb';
            if (company.includes('cartu')) return 'cartu';
            if (company.includes('hash')) return 'hash';
            if (company.includes('inteliexpress') || company.includes('inex')) return 'inex';
            if (company.includes('expresslombard') || company.includes('express lombard')) return 'expresslombard';
            if (company.includes('isbank')) return 'is';
            if (company.includes('terabank')) return 'tera';
            if (company.includes('leader')) return 'leader';
            if (company.includes('smarti') || company.includes('smartfin') || company.includes('smart')) return 'smarti';
            if (company.includes('central')) return 'central';
            if (company.includes('georgiancredit') || company.includes('georgian credit')) return 'georgiancredit';
            if (company.includes('tbmc') || company.includes('tbilmicrocredit')) return 'tbmc';
            if (company.includes('bermeli')) return 'bermeli';
            if (company.includes('alphaexpress') || company.includes('alpha express')) return 'alphaexpress';
            if (company.includes('scapp')) return 'scapp';
            if (company.includes('procredit')) return 'procredit';
            if (company.includes('kursige') || company.includes('kursi')) return 'kursige';
            return company.split(/\s|\(/)[0];
        }

        function getRateChannelName(item) {
            const match = String(item?.Company || '').match(/\((.*?)\)/);
            return match ? match[1].trim().toLowerCase() : '';
        }

        function isAllowedBankRateChannel(item) {
            const channel = getRateChannelName(item);
            if (!channel) return true;
            if (channel.includes('კომერც')) return true;
            if (channel.includes('mobile') || channel.includes('მობაილ')) return true;
            if (channel.includes('ინტერნეტ ბანკი')) return true;
            return false;
        }

        function buildCompanyRowCounts(data) {
            return data.reduce((counts, item) => {
                const key = getCompanyKey(item);
                if (!key) return counts;
                counts[key] = (counts[key] || 0) + 1;
                return counts;
            }, {});
        }

        function countUniqueCompaniesForTab(tab, data = originalData) {
            const source = Array.isArray(data) && data.length ? data : ALL_COMPANIES.map(company => ({ baseCompany: company }));
            const companies = new Set();
            source.forEach(item => {
                const key = getCompanyKey(item);
                if (!key) return;
                if (tab === 'banks' && !BANK_COMPANIES.includes(key)) return;
                if (tab === 'mfo' && !MFO_COMPANIES.includes(key)) return;
                if (tab === 'kiosks' && !KIOSK_COMPANIES.includes(key)) return;
                companies.add(key);
            });
            return companies.size;
        }

        function updateTabCounts() {
            const counts = {
                all: countUniqueCompaniesForTab('all'),
                banks: countUniqueCompaniesForTab('banks'),
                mfo: countUniqueCompaniesForTab('mfo'),
                kiosks: countUniqueCompaniesForTab('kiosks')
            };

            Object.entries(TAB_LABELS).forEach(([tab, label]) => {
                const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
                if (btn) btn.textContent = `${label} (${counts[tab]})`;
            });
        }

        function updateHeadersUI(currency) {
            const btn = document.getElementById('btn-' + currency);
            if (btn) {
                if (sortConfigs[currency].column === 'spread') {
                    btn.innerHTML = sortConfigs[currency].order === 'asc' ? '&#9650;' : '&#9660;';
                    btn.className = sortConfigs[currency].order === 'asc' ? 'sort-btn sort-best' : 'sort-btn sort-worst';
                } else {
                    btn.innerHTML = '&#9650;';
                    btn.className = 'sort-btn';
                }
            }
            
            const tbody = document.getElementById(currency + '-body');
            if (tbody) {
                const thead = tbody.parentElement.querySelector('thead');
                if (thead) {
                    const ths = thead.querySelectorAll('th.sortable');
                    const indexToCol = ['company', 'buy', 'sell', 'spread'];
                    ths.forEach((th, idx) => {
                        th.classList.remove('active-sort');
                        const iconSpan = th.querySelector('.sort-icon');
                        if (iconSpan) iconSpan.innerHTML = '';
                        
                        if (indexToCol[idx] === sortConfigs[currency].column) {
                            th.classList.add('active-sort');
                            if (iconSpan) {
                                iconSpan.innerHTML = sortConfigs[currency].order === 'asc' ? '&#9650;' : '&#9660;';
                            }
                        }
                    });
                }
            }
        }

        function renderTable(currency) {
            const tbody = document.getElementById(`${currency}-body`);
            if(!tbody) return;
            tbody.innerHTML = ''; 

            let dataArr = currency === 'usd' ? usdData : currency === 'eur' ? eurData : currency === 'gbp' ? gbpData : currency === 'rub' ? rubData : tryData;
            const companyRowCounts = buildCompanyRowCounts(dataArr);

            // ვფილტრავთ არჩეული გვერდის (Tab) მიხედვით
            let dataToRender = dataArr.filter(item => {
                const comp = getCompanyKey(item);
                let matchTab = false;
                if (currentTab === 'all') matchTab = true;
                else if (currentTab === 'banks') matchTab = BANK_COMPANIES.includes(comp);
                else if (currentTab === 'mfo') matchTab = MFO_COMPANIES.includes(comp);
                else if (currentTab === 'kiosks') matchTab = KIOSK_COMPANIES.includes(comp);
                
                if (!matchTab) return false;
                if (BANK_COMPANIES.includes(comp) && companyRowCounts[comp] > 1 && !isAllowedBankRateChannel(item)) return false;

                if (currency === 'gbp' || currency === 'rub' || currency === 'try') {
                    let buy = currency === 'gbp' ? parseFloat(item['GBPGEL (Buy)']) : currency === 'rub' ? parseFloat(item['RUBGEL (Buy)']) : parseFloat(item['TRYGEL (Buy)']);
                    let sell = currency === 'gbp' ? parseFloat(item['GBPGEL (Sell)']) : currency === 'rub' ? parseFloat(item['RUBGEL (Sell)']) : parseFloat(item['TRYGEL (Sell)']);
                    if (isNaN(buy) || isNaN(sell) || buy === 0 || sell === 0) return false;
                }
                return true;
            });

            if (dataToRender.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="empty-message">ჯერჯერობით მონაცემები არ არის</td></tr>`;
                setLiveInnerText(`${currency}-market-buy`, '- - -', `rates:${currency}:buy`);
                setLiveInnerText(`${currency}-market-sell`, '- - -', `rates:${currency}:sell`);
                setLiveInnerText(`${currency}-market-spread`, '- - -', `rates:${currency}:spread`);
                return;
            }

            // საუკეთესო კურსების პოვნა მიმდინარე ტაბისთვის
            let bestBuy = -Infinity;
            let bestSell = Infinity;
            const relevantDataToRank = dataToRender.filter(item => !isCompanyRateOutlier(item, currency));

            relevantDataToRank.forEach(item => {
                let buy = currency === 'usd' ? parseFloat(item['USDGEL (Buy)']) : currency === 'eur' ? parseFloat(item['EURGEL (Buy)']) : currency === 'gbp' ? parseFloat(item['GBPGEL (Buy)']) : currency === 'rub' ? parseFloat(item['RUBGEL (Buy)']) : parseFloat(item['TRYGEL (Buy)']);
                let sell = currency === 'usd' ? parseFloat(item['USDGEL (Sell)']) : currency === 'eur' ? parseFloat(item['EURGEL (Sell)']) : currency === 'gbp' ? parseFloat(item['GBPGEL (Sell)']) : currency === 'rub' ? parseFloat(item['RUBGEL (Sell)']) : parseFloat(item['TRYGEL (Sell)']);
                if (!isNaN(buy) && buy > bestBuy) bestBuy = buy;
                if (!isNaN(sell) && sell < bestSell) bestSell = sell;
            });

            // Calculate averages for this tab (Top 10)
            let validForAvg = relevantDataToRank.map(item => {
                let buy = currency === 'usd' ? parseFloat(item['USDGEL (Buy)']) : currency === 'eur' ? parseFloat(item['EURGEL (Buy)']) : currency === 'gbp' ? parseFloat(item['GBPGEL (Buy)']) : currency === 'rub' ? parseFloat(item['RUBGEL (Buy)']) : parseFloat(item['TRYGEL (Buy)']);
                let sell = currency === 'usd' ? parseFloat(item['USDGEL (Sell)']) : currency === 'eur' ? parseFloat(item['EURGEL (Sell)']) : currency === 'gbp' ? parseFloat(item['GBPGEL (Sell)']) : currency === 'rub' ? parseFloat(item['RUBGEL (Sell)']) : parseFloat(item['TRYGEL (Sell)']);
                let spread = currency === 'usd' ? item.usdSpread : currency === 'eur' ? item.eurSpread : currency === 'gbp' ? item.gbpSpread : currency === 'rub' ? item.rubSpread : item.trySpread;
                return { buy, sell, spread };
            }).filter(item => !isNaN(item.buy) && !isNaN(item.sell) && !isNaN(item.spread) && item.spread !== Infinity);
            
            validForAvg.sort((a, b) => a.spread - b.spread);
            let top10ForAvg = validForAvg.slice(0, 10);
            
            let totalBuyAvg = 0, totalSellAvg = 0;
            top10ForAvg.forEach(item => {
                totalBuyAvg += item.buy;
                totalSellAvg += item.sell;
            });
            const countAvg = top10ForAvg.length;

            const visibleData = (expandedStates[currency] || dataToRender.length <= 10) ? dataToRender : dataToRender.slice(0, 10);
            visibleData.forEach(item => {
                const tr = document.createElement('tr');
                const isOutlier = isCompanyRateOutlier(item, currency);
                if (isOutlier) tr.classList.add('rate-outlier-row');
                
                let buy, sell, spread;
                if (currency === 'usd') {
                    buy = parseFloat(item['USDGEL (Buy)']);
                    sell = parseFloat(item['USDGEL (Sell)']);
                    spread = item.usdSpread;
                } else if (currency === 'eur') {
                    buy = parseFloat(item['EURGEL (Buy)']);
                    sell = parseFloat(item['EURGEL (Sell)']);
                    spread = item.eurSpread;
                } else if (currency === 'gbp') {
                    buy = parseFloat(item['GBPGEL (Buy)']);
                    sell = parseFloat(item['GBPGEL (Sell)']);
                    spread = item.gbpSpread;
                } else if (currency === 'rub') {
                    buy = parseFloat(item['RUBGEL (Buy)']);
                    sell = parseFloat(item['RUBGEL (Sell)']);
                    spread = item.rubSpread;
                } else {
                    buy = parseFloat(item['TRYGEL (Buy)']);
                    sell = parseFloat(item['TRYGEL (Sell)']);
                    spread = item.trySpread;
                }

                const companyKey = item.baseCompany || item.Company.toLowerCase();
                const logoUrl = LOGOS[companyKey] || '';
                
                let logoClass = 'company-logo';
                if (companyKey === 'kursige') logoClass += ' logo-kursige';
                if (companyKey === 'credo') logoClass += ' logo-credo';

                let compNameKa = item.Company;
                if (item.baseCompany && COMPANY_NAMES_KA[item.baseCompany]) {
                    const match = item.Company.match(/\((.*?)\)/);
                    if (match) {
                        compNameKa = COMPANY_NAMES_KA[item.baseCompany] + ' (' + match[1] + ')';
                    } else {
                        compNameKa = COMPANY_NAMES_KA[item.baseCompany];
                    }
                } else if (COMPANY_NAMES_KA[companyKey]) {
                    compNameKa = COMPANY_NAMES_KA[companyKey];
                }
                const compUrl = COMPANY_URLS[companyKey] || '#';

                let buyDisplay = isNaN(buy) ? '<span style="display:inline-block; padding: 2px 8px; background: rgba(255,255,255,0.08); color: #94a3b8; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 1px;">- - -</span>' : (!isOutlier && buy === bestBuy ? `${buy.toFixed((currency === 'rub' || currency === 'try') ? 4 : 3)}<span class="best-dot" title="საუკეთესო კურსი"></span>` : buy.toFixed((currency === 'rub' || currency === 'try') ? 4 : 3));
                let sellDisplay = isNaN(sell) ? '<span style="display:inline-block; padding: 2px 8px; background: rgba(255,255,255,0.08); color: #94a3b8; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 1px;">- - -</span>' : (!isOutlier && sell === bestSell ? `${sell.toFixed((currency === 'rub' || currency === 'try') ? 4 : 3)}<span class="best-dot" title="საუკეთესო კურსი"></span>` : sell.toFixed((currency === 'rub' || currency === 'try') ? 4 : 3));
                let spreadDisplay = (isNaN(spread) || spread === Infinity) ? '<span style="display:inline-block; padding: 2px 8px; background: rgba(255,255,255,0.08); color: #94a3b8; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 1px;">- - -</span>' : spread.toFixed((currency === 'rub' || currency === 'try') ? 4 : 3);
                const updateTime = formatCompanyUpdateTime(item);

                let mainName = compNameKa;
                let subName = '';
                const matchObj = compNameKa.match(/^(.*?)\s*\((.*?)\)$/);
                if (matchObj) {
                    mainName = matchObj[1];
                    subName = matchObj[2]; // ფრჩხილების გარეშე ვიღებთ შიგთავსს
                }

                // თუ Silk არის (რადგან ლოგო არ აქვს და მხოლოდ S ასო გამოჩნდა), მოვუნიშნოთ რამე ფერი
                let initialColor = "#64748b";
                if (mainName === "Silk") initialColor = "#8b5cf6"; 

                tr.innerHTML = `
                    <td class="company-name">
                        <a href="javascript:void(0)" onclick="searchRates(this, '${item.baseCompany || companyKey}', '${item.Company.replace(/'/g, "\\'")}')" style="text-decoration: none; display: block; cursor: pointer;">
                            <div style="display: flex; align-items: center; gap: 14px; padding: 4px 0;">
                                ${logoUrl ? `<div style="width: 42px; height: 42px; border-radius: 12px; background: #ffffff; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-sizing: border-box; overflow: hidden; padding: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><img src="${logoUrl}" alt="${compNameKa}" class="${logoClass}" style="width: 100%; height: 100%; object-fit: contain; object-position: center; border-radius: 8px;"></div>` : `<div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(255,255,255,0.08); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-sizing: border-box; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><span style="font-weight:bold; font-size: 18px; color:${initialColor};">${mainName.charAt(0)}</span></div>`}
                                <div class="company-text-container" style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; line-height: 1.25; max-width: 160px; overflow: hidden;">
                                    <span style="font-weight: 600; color: var(--text-main); font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${mainName}</span>
                                    ${subName ? `<span style="font-size: 11px; color: var(--text-muted); font-weight: 500; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${subName}</span>` : ''}
                                </div>
                            </div>
                        </a>
                    </td>
                    <td class="buy${isOutlier ? ' rate-outlier-value' : ''}">${buyDisplay}</td>
                    <td class="sell${isOutlier ? ' rate-outlier-value' : ''}">${sellDisplay}</td>
                    <td class="spread">${spreadDisplay}</td>
                    <td class="rate-updated-cell">
                        <span class="rate-updated-time${updateTime.stale ? ' is-stale' : ''}" title="${updateTime.full}">${updateTime.label}</span>
                    </td>
                    <td class="info-cell"><button class="btn-info-icon" onclick="event.preventDefault(); openCompanyInfo('${companyKey}', '${compNameKa}')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></button></td>
                `;
                
                tbody.appendChild(tr);
            });

            // Display market averages based on top 10
            const avgBuyDom = countAvg > 0 ? (totalBuyAvg / countAvg).toFixed((currency === 'rub' || currency === 'try') ? 4 : 3) : '- - -';
            const avgSellDom = countAvg > 0 ? (totalSellAvg / countAvg).toFixed((currency === 'rub' || currency === 'try') ? 4 : 3) : '- - -';
            const avgSpreadDom = countAvg > 0 ? ((totalSellAvg / countAvg) - (totalBuyAvg / countAvg)).toFixed((currency === 'rub' || currency === 'try') ? 4 : 3) : '- - -';
            
            setLiveInnerText(`${currency}-market-buy`, avgBuyDom, `rates:${currency}:buy`);
            setLiveInnerText(`${currency}-market-sell`, avgSellDom, `rates:${currency}:sell`);
            setLiveInnerText(`${currency}-market-spread`, avgSpreadDom, `rates:${currency}:spread`);
            
            const expandContainer = document.getElementById(`${currency}-expand-container`);
            const expandBtn = document.getElementById(`${currency}-expand-btn`);
            if (expandContainer && expandBtn) {
                if (dataToRender.length > 10) {
                    expandContainer.style.display = 'block';
                    if (expandedStates[currency]) {
                        expandBtn.innerHTML = 'დაბრუნება ტოპ 10-ზე &#9650;';
                    } else {
                        expandBtn.innerHTML = 'მეტის ნახვა &#9660;';
                    }
                } else {
                    expandContainer.style.display = 'none';
                }
            }
        }

        function loadCachedData() {
            try {
                const cachedIntlRatesHtml = localStorage.getItem(CACHE_INTL_RATES_HTML_KEY);
                const intlContainer = document.querySelector('.intl-rates-list');
                if (cachedIntlRatesHtml && intlContainer) {
                    intlContainer.innerHTML = cachedIntlRatesHtml;
                    hydrateForexRateLinks(intlContainer);
                }

                const cachedPopularAssetsHtml = localStorage.getItem(CACHE_POPULAR_ASSETS_HTML_KEY);
                const popularAssetsContainer = document.getElementById('popular-assets-list');
                if (cachedPopularAssetsHtml && popularAssetsContainer) {
                    popularAssetsContainer.innerHTML = cachedPopularAssetsHtml;
                }

                // Load main rates
                const cachedRates = localStorage.getItem(CACHE_COMPANY_RATES_DATA_KEY);
                if (cachedRates) {
                    originalData = JSON.parse(cachedRates).filter(item => !DISABLED_COMPANIES.has(getCompanyKey(item)));
                    updateTabCounts();
                    usdData = [...originalData]; applySorting("usd");
                    eurData = [...originalData]; applySorting("eur");
                gbpData = [...originalData]; applySorting("gbp");
                rubData = [...originalData]; applySorting("rub");
                tryData = [...originalData]; applySorting("try");
                    
                    
                    renderHomePage();
                    updateHomeConverter();
                    setDisplay('loader', 'none');
                    setDisplay('tables-wrapper', 'flex');
                }
                
                // Load NBG rates
                const cachedCrypto = localStorage.getItem('cachedCryptoData');
                if (cachedCrypto) {
                    const crypto = JSON.parse(cachedCrypto);
                    if (Array.isArray(crypto)) renderCryptoList(crypto);
                }
                
                const cachedNBG = localStorage.getItem('cachedNBGData');
                if (cachedNBG) {
                    const nbg = JSON.parse(cachedNBG);
                    
                    ['usd', 'eur', 'gbp', 'chf', 'rub', 'try', 'amd', 'azn', 'ils'].forEach(c => {
                        if (nbg[c] && document.getElementById(`nbg-${c}`)) {
                            setInnerText(`nbg-${c}`, nbg[c]);
                        }
                    });

                    if (nbg.usd && setInnerText('home-nbg-usd')) document.getElementById('home-nbg-usd', nbg.usd);
                    if (nbg.eur && setInnerText('home-nbg-eur')) document.getElementById('home-nbg-eur', nbg.eur);
                    
                    if (nbg.date && setInnerText('nbg-date')) document.getElementById('nbg-date', nbg.date);
                    if (nbg.date && setInnerText('home-nbg-date')) document.getElementById('home-nbg-date', nbg.date);
                    setHomeOfficialDateNote();
                    
                    setDisplay('nbg-rates-box', 'flex');
                    if (Array.isArray(nbg.officialRates)) renderHomeOfficialRates(nbg.officialRates);
                    refreshRateRelevanceViews();
                    updateHomeConverter();
                }
            } catch (err) {
                console.error("ქეშის ჩატვირთვის შეცდომა:", err);
            }
        }

        
        preloadHomeLogos();
        loadCachedData(); // Load cached numbers instantly
        initForexRateLinks();
        fetchRates();     // Fetch fresh numbers silently
        if (document.getElementById('crypto-rates-list')) {
            setInterval(fetchCrypto, CRYPTO_REFRESH_INTERVAL_MS);
        }
        if (document.querySelector('.intl-rates-list')) {
            setInterval(() => {
                if (document.hidden) return;
                refreshForexRatesOnly();
            }, FOREX_MARKET_REFRESH_INTERVAL_MS);
        }
        if (document.getElementById('home-commercial-list') || document.getElementById('usd-body')) {
            setInterval(() => {
                if (document.hidden || !shouldRefreshCompanyRatesNow()) return;
                refreshCompanyRatesOnly();
            }, COMPANY_RATES_SCHEDULE_CHECK_MS);
        }


// --- Company Search Logic ---
function initCompanySearch() {
    const searchInput = document.getElementById('company-search-input');
    const searchDropdown = document.getElementById('company-search-dropdown');
    if (!searchInput || !searchDropdown) return;

    searchInput.addEventListener('input', function() {
        const val = this.value.toLowerCase().trim();
        searchDropdown.innerHTML = '';
        if (!val) {
            searchDropdown.style.display = 'none';
            return;
        }
        
        const matches = [];
        
        originalData.forEach(item => {
            const base = item.baseCompany || item.Company.toLowerCase();
            
            let compNameKa = item.Company;
            if (item.baseCompany && COMPANY_NAMES_KA[item.baseCompany]) {
                const match = item.Company.match(/\((.*?)\)/);
                if (match) {
                    compNameKa = COMPANY_NAMES_KA[item.baseCompany] + ' (' + match[1] + ')';
                } else {
                    compNameKa = COMPANY_NAMES_KA[item.baseCompany];
                }
            } else if (COMPANY_NAMES_KA[base]) {
                compNameKa = COMPANY_NAMES_KA[base];
            }
            
            const nameEn = item.Company.toLowerCase();
            const nameEnBase = base.toLowerCase();
            const searchKa = compNameKa.toLowerCase();
            
            if (searchKa.includes(val) || nameEn.includes(val) || nameEnBase.includes(val)) {
                matches.push({ base: base, item: item, nameKa: compNameKa });
            }
        });
        
        if (matches.length > 0) {
            matches.forEach(m => {
                const div = document.createElement('div');
                div.className = 'dropdown-item';
                div.innerText = m.nameKa;
                div.onclick = () => {
                    showCompanyRatesModal(m.item, m.nameKa, m.base);
                    searchDropdown.style.display = 'none';
                    searchInput.value = '';
                };
                searchDropdown.appendChild(div);
            });
            searchDropdown.style.display = 'block';
        } else {
            const div = document.createElement('div');
            div.className = 'dropdown-item';
            div.style.color = 'var(--text-muted)';
            div.innerText = 'კომპანია არ მოიძებნა';
            searchDropdown.appendChild(div);
            searchDropdown.style.display = 'block';
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.company-search-container')) {
            searchDropdown.style.display = 'none';
        }
    });

    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
        closeBtn.onclick = () => {
            document.getElementById('company-modal').style.display = 'none';
        };
    }
    
    const modalOverlay = document.getElementById('company-modal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.style.display = 'none';
            }
        });
    }
}

function showCompanyRatesModal(item, nameKa, base) {
    const modal = document.getElementById('company-modal');
    const header = document.getElementById('modal-company-header');
    const ratesGrid = document.getElementById('modal-company-rates');
    
    if (!modal) return;
    
    const logoPath = LOGOS[base] || 'Logos/logo.jpg';
    header.innerHTML = `
        <div style="width: 48px; height: 48px; border-radius: 12px; background: #ffffff; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 2px; margin-right: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <img src="${logoPath}" style="width: 100%; height: 100%; object-fit: contain; object-position: center; border-radius: 8px;">
        </div>
        <h2 style="margin:0;color:var(--text-main); font-size: 1.4em;">${nameKa}</h2>
    `;
    
    const currencies = [
        { id: 'usd', label: 'USD', flag: 'US.png', b: 'USDGEL (Buy)', s: 'USDGEL (Sell)' },
        { id: 'eur', label: 'EUR', flag: 'EU.png', b: 'EURGEL (Buy)', s: 'EURGEL (Sell)' },
        { id: 'gbp', label: 'GBP', flag: 'GB.png', b: 'GBPGEL (Buy)', s: 'GBPGEL (Sell)' },
        { id: 'rub', label: 'RUB', flag: 'RU.png', b: 'RUBGEL (Buy)', s: 'RUBGEL (Sell)', rubBuy: item.rubBuy, rubSell: item.rubSell },
        { id: 'try', label: 'TRY', flag: 'TR.png', b: 'TRYGEL (Buy)', s: 'TRYGEL (Sell)' }
    ];
    
    let html = '';
    currencies.forEach(c => {
        let buy, sell;
        if (c.id === 'rub' && base === 'crystal' && parseFloat(c.rubBuy) > 1) {
            buy = parseFloat(c.rubBuy) / 100;
            sell = parseFloat(c.rubSell) / 100;
        } else if (c.id === 'rub' || c.id === 'try') {
            buy = parseFloat(item[c.b]);
            sell = parseFloat(item[c.s]);
        } else {
            buy = parseFloat(item[c.b]);
            sell = parseFloat(item[c.s]);
        }

        let decimals = (c.id === 'rub' || c.id === 'try') ? 4 : 3;
        
        let buyStr = (!isNaN(buy) && buy > 0) ? buy.toFixed(decimals) : '- - -';
        let sellStr = (!isNaN(sell) && sell > 0) ? sell.toFixed(decimals) : '- - -';
        
        html += `
            <div class="modal-rate-card">
                <div class="modal-rate-title"><img src="Logos/${c.flag}" style="width:24px;height:24px;border-radius:50%;margin-right:10px; border: 1px solid var(--border);">${c.label} / GEL</div>
                <div class="modal-rate-row"><span class="modal-rate-lbl">ყიდვა:</span> <span class="modal-rate-buy">${buyStr}</span></div>
                <div class="modal-rate-row"><span class="modal-rate-lbl">გაყიდვა:</span> <span class="modal-rate-sell">${sellStr}</span></div>
            </div>
        `;
    });
    
    ratesGrid.innerHTML = html;
    modal.style.display = 'flex';
}

// Intercept data load to bind search
const originalRenderTables = renderTable;
let searchInitialized = false;
window.renderTable = function(currency) {
    originalRenderTables(currency);
    if (!searchInitialized && originalData && originalData.length > 0) {
        initCompanySearch();
        searchInitialized = true;
    }
};

if (typeof originalData !== 'undefined' && originalData.length > 0) {
    initCompanySearch();
    searchInitialized = true;
}


const COMPANY_INFO_DATA = {
    'bog': { fullName: 'სს "საქართველოს ბანკი"', website: 'https://bankofgeorgia.ge/', headOffice: 'გაგარინის ქ. 29ა, თბილისი', officeLabel: 'სათაო ოფისი', hotline: '032 244 44 44' },
    'tbc': { fullName: 'სს "თიბისი ბანკი"', website: 'https://tbcbank.ge/', headOffice: 'მარჯანიშვილის ქ. 7, თბილისი', officeLabel: 'სათაო ოფისი', hotline: '032 227 27 27' },
    'liberty': { fullName: 'სს "ლიბერთი ბანკი"', website: 'https://libertybank.ge/', headOffice: 'ჭავჭავაძის გამზ. 74, თბილისი', officeLabel: 'სათაო ოფისი', hotline: '032 255 55 00' },
    'bb': { fullName: 'სს "ბაზისბანკი"', website: 'https://basisbank.ge/', headOffice: 'ქეთევან წამებულის გამზ. 1, თბილისი', officeLabel: 'სათაო ოფისი', hotline: '032 292 29 22' },
    'credo': { fullName: 'სს "კრედო ბანკი"', website: 'https://credobank.ge/', headOffice: 'რ. თაბუკაშვილის ქ. 27, თბილისი', officeLabel: 'სათაო ოფისი', hotline: '032 242 42 42' },
    'cartu': { fullName: 'სს "ბანკი ქართუ"', website: 'https://cartubank.ge/', headOffice: 'ჭავჭავაძის გამზ. 39ა, თბილისი', officeLabel: 'სათაო ოფისი', hotline: '032 200 80 80' },
    'tera': { fullName: 'სს "ტერაბანკი"', website: 'https://terabank.ge/ka/retail', headOffice: 'წმინდა ქეთევან დედოფლის გამზ. 3, თბილისი', officeLabel: 'სათაო ოფისი', hotline: '032 255 00 00' },
    'halyk': { fullName: 'სს "ხალიკ ბანკი საქართველო"', website: 'https://halykbank.ge/ka/individuals', headOffice: 'შარტავას ქ. 40, თბილისი', officeLabel: 'სათაო ოფისი', hotline: '032 224 07 07' },
    'is': { fullName: 'სს "იშბანკი საქართველო"', website: 'http://isbank.ge/ka/individual', headOffice: 'აღმაშენებლის გამზ. 140ბ, თბილისი', officeLabel: 'სათაო ოფისი', hotline: '032 294 22 44' },
    'silk': { fullName: 'სს "სილქ ბანკი"', website: 'https://silkbank.ge/', headOffice: 'ზაარბრიუკენის მოედანი 2, თბილისი', officeLabel: 'სათაო ოფისი', hotline: '032 242 42 42' },
    'paysera': { fullName: 'სს "პეისერა საქართველო"', website: 'https://www.paysera.ge/v2/ka-GE/index', headOffice: 'ბელიაშვილის ქ. 106, თბილისი', officeLabel: 'სათაო ოფისი', hotline: '032 242 42 40' },
    'crystal': { fullName: 'სს "მიკრობანკი კრისტალი"', website: 'https://crystal.ge/', headOffice: 'წერეთლის გამზ. 116, თბილისი', officeLabel: 'სათაო ოფისი', hotline: '032 202 20 20' },
    'rico': { fullName: 'შპს "რიკო ექსპრესი"', website: 'https://rico.ge/', headOffice: 'ჭავჭავაძის გამზ. 70, თბილისი', officeLabel: 'მთავარი ოფისი', hotline: '+995 322 29 29 29' },
    'valuto': { fullName: 'შპს "ვალუტო"', website: 'https://valuto.ge/', headOffice: 'ალ. ყაზბეგის გამზ. 34, თბილისი', officeLabel: 'მთავარი ოფისი', hotline: '032 2 24 27 27' },
    'kursige': { fullName: 'შპს "კურსი"', website: 'https://kursi.ge/', headOffice: 'პეკინის გამზ. 21, თბილისი', officeLabel: 'მთავარი ოფისი', hotline: '0322 20 30 40' },
    'inex': { fullName: 'შპს "ინტელიექსპრესი"', website: 'https://inteliexpress.com/ka/main-page-geo/', headOffice: 'აღმაშენებლის გამზ. 89, თბილისი', officeLabel: 'სათაო ოფისი', hotline: '032 249 25 25' },
    'expresslombard': { fullName: 'შპს "ექსპრეს ლომბარდი"', website: 'https://expresslombard.ge/', headOffice: 'გურამ ფანჯიკიძის ქუჩა, შესახვევი I, N8, 0160, თბილისი', officeLabel: 'მთავარი ოფისი', hotline: '0322 39 39 39' },
    'giro': { fullName: 'შპს "გირო კრედიტი"', website: 'https://girocredit.ge/', headOffice: 'ყაზბეგის გამზ. 14, თბილისი', officeLabel: 'მთავარი ოფისი', hotline: '0322 38 37 37' },
    'goa': { fullName: 'შპს "გოა კრედიტი"', website: 'https://goacredit.ge/', headOffice: 'თევდორე მღვდლის ქ. 13, თბილისი', officeLabel: 'მთავარი ოფისი', hotline: '032 2 37 15 15' },
    'hash': { fullName: 'სს "ჰაშ ბანკი"', website: 'https://hashbank.ge/ka', headOffice: 'ვაჟა-ფშაველას გამზ. N71, ოფისი N21, თბილისი', officeLabel: 'იურიდიული და ფაქტობრივი მისამართი', hotline: '+995 32 280 11 77' },
    'mbc': { fullName: 'შპს "მიკრო ბიზნეს კაპიტალი (MBC)"', website: 'https://mbc.com.ge/', headOffice: 'წერეთლის გამზ. 114, თბილისი', officeLabel: 'სათაო ოფისი', hotline: '032 250 50 02' },
    'leader': { fullName: 'შპს "ლიდერ კრედიტი"', website: 'https://leadercredit.ge/', headOffice: 'დადიანის ქ. 7, თბილისი', officeLabel: 'მთავარი ოფისი', hotline: '032 273 00 73' },
    'smarti': { fullName: 'შპს "სმარტი მიკროსაფინანსო"', website: 'http://smartfin.ge/', headOffice: '4, Newport str. Kutaisi', officeLabel: 'მთავარი ოფისი', hotline: '(431) 26 26 26' },
    'central': { fullName: 'შპს "ცენტრალი მიკროსაფინანსო ორგანიზაცია"', website: 'https://central.ge/', headOffice: 'ინფორმაცია მოწმდება', officeLabel: 'სათაო ოფისი', hotline: '+995 322 88 00 88' },
    'georgiancredit': { fullName: 'შპს "ქართული კრედიტი"', website: 'https://www.georgiancredit.ge/', headOffice: 'გურამ ფანჯიკიძის ქუჩა, შესახვევი I, N8, 0160, თბილისი', officeLabel: 'მთავარი ოფისი', hotline: '(+995 32) 2 500 100' },
    'tbmc': { fullName: 'შპს "თბილმიკროკრედიტი"', website: 'https://www.tbmc.ge/', headOffice: 'ინფორმაცია მოწმდება', officeLabel: 'მთავარი ოფისი', hotline: 'ინფორმაცია მოწმდება' },
    'bermeli': { fullName: 'შპს "ბერმელი"', website: 'https://bermeli.ge/', headOffice: 'ბათუმი, საქართველო', officeLabel: 'მთავარი ოფისი', hotline: '+995 568 700 300 / 0422 27 56 50' },
    'alphaexpress': { fullName: 'შპს "ალფა ექსპრესი"', website: 'https://alphaexpress.ge/', headOffice: 'ლ. კავსაძის ქ. 5, თბილისი', officeLabel: 'მთავარი ოფისი', hotline: '(032) 2 355 112' },
    'scapp': { fullName: 'შპს "სკაპი"', website: 'https://scapp.ge/', headOffice: 'წერეთლის გამზ. 118, I პავილიონი, თბილისი', officeLabel: 'მთავარი ოფისი', hotline: '032 2 300 300' }
};

function escapeInfoHtml(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

function formatWebsiteLabel(url) {
    if (!url || url === '#') return 'ვებ გვერდი მითითებული არ არის';
    try {
        return new URL(url).hostname.replace(/^www\./, 'www.');
    } catch {
        return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
}

window.openCompanyInfo = function(key, displayName) {
    const modal = document.getElementById('company-info-modal');
    if (!modal) return;

    const info = COMPANY_INFO_DATA[key] || {
        fullName: displayName,
        website: COMPANY_URLS[key] || '#',
        headOffice: 'ინფორმაცია მოწმდება',
        officeLabel: 'მთავარი ოფისი',
        hotline: 'ინფორმაცია მოწმდება'
    };
    const websiteUrl = info.website || COMPANY_URLS[key] || '#';
    const logoPath = LOGOS[key] || 'Logos/logo.jpg';
    const companyName = displayName || COMPANY_NAMES_KA[key] || info.fullName || 'კომპანია';
    const safeWebsiteUrl = websiteUrl === '#' ? '#' : escapeInfoHtml(websiteUrl);
    const websiteLabel = formatWebsiteLabel(websiteUrl);
    
    const header = document.getElementById('info-modal-header');
    header.innerHTML = `
        <div class="company-info-profile">
            <div class="company-info-logo">
                <img src="${escapeInfoHtml(logoPath)}" alt="${escapeInfoHtml(companyName)} ლოგო">
            </div>
            <h2>${escapeInfoHtml(companyName)}</h2>
            <div class="company-info-official-name">${escapeInfoHtml(info.fullName || companyName)}</div>
        </div>
    `;

    document.getElementById('info-modal-body').innerHTML = `
        <div class="company-info-details">
            <a class="company-info-row company-info-row-link" href="${safeWebsiteUrl}" target="_blank" rel="noopener noreferrer">
                <span class="company-info-row-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 0 20"></path><path d="M12 2a15.3 15.3 0 0 0 0 20"></path></svg>
                </span>
                <span class="company-info-copy">
                    <span class="company-info-label">მთავარი ვებ გვერდი</span>
                    <span class="company-info-value">${escapeInfoHtml(websiteLabel)}</span>
                </span>
            </a>
            <div class="company-info-row">
                <span class="company-info-row-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M5 21V7l8-4v18"></path><path d="M19 21V11l-6-4"></path><path d="M9 9h1"></path><path d="M9 13h1"></path><path d="M9 17h1"></path></svg>
                </span>
                <span class="company-info-copy">
                    <span class="company-info-label">${escapeInfoHtml(info.officeLabel || 'მთავარი ოფისი')}</span>
                    <span class="company-info-value">${escapeInfoHtml(info.headOffice || 'ინფორმაცია მოწმდება')}</span>
                </span>
            </div>
            <div class="company-info-row">
                <span class="company-info-row-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.11 5.18 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.61a2 2 0 0 1-.45 2.11L9 10.71a16 16 0 0 0 4.29 4.29l1.27-1.27a2 2 0 0 1 2.11-.45c.84.29 1.71.5 2.61.62A2 2 0 0 1 22 16.92z"></path></svg>
                </span>
                <span class="company-info-copy">
                    <span class="company-info-label">ცხელი ხაზი</span>
                    <span class="company-info-value">${escapeInfoHtml(info.hotline || 'ინფორმაცია მოწმდება')}</span>
                </span>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
};

window.openRatesInfoModal = function() {
    const modal = document.getElementById('rates-info-modal');
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
};

window.closeRatesInfoModal = function() {
    const modal = document.getElementById('rates-info-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
};

// Also close it correctly
document.addEventListener('DOMContentLoaded', () => {
    const savedTab = localStorage.getItem('allrates_current_tab');
    updateTabCounts();
    if (savedTab) {
        const tabBtns = document.querySelectorAll('.tab-btn');
        if (tabBtns.length > 0) {
            tabBtns.forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.querySelector(`.tab-btn[data-tab="${savedTab}"]`) || document.querySelector(`.tab-btn[onclick="switchTab('${savedTab}')"]`);
            if (activeBtn) activeBtn.classList.add('active');
        }
    }
    const infoModal = document.getElementById('company-info-modal');
    if (infoModal) {
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) {
                infoModal.style.display = 'none';
            }
        });
    }
    const ratesInfoModal = document.getElementById('rates-info-modal');
    if (ratesInfoModal) {
        ratesInfoModal.addEventListener('click', (e) => {
            if (e.target === ratesInfoModal) closeRatesInfoModal();
        });
    }

    bindMarketSearch();
    bindHomeMarketScrollControls();
    initHomeConverter();

    initMarketDynamicsChart();
    initNbgCharts();
});


window.searchRates = function(element, baseKey, companyNameRaw) {
    if (!originalData) return;
    
    let targetItem = null;
    let nameKa = "";
    
    originalData.forEach(item => {
        if (item.Company === companyNameRaw) {
            targetItem = item;
            let base = item.baseCompany || item.Company.split(' ')[0].toLowerCase();
            
            if (item.baseCompany && COMPANY_NAMES_KA[item.baseCompany]) {
                const match = item.Company.match(/\((.*?)\)/);
                if (match) {
                    nameKa = COMPANY_NAMES_KA[item.baseCompany] + ' (' + match[1] + ')';
                } else {
                    nameKa = COMPANY_NAMES_KA[item.baseCompany];
                }
            } else if (COMPANY_NAMES_KA[base]) {
                nameKa = COMPANY_NAMES_KA[base];
            } else {
                nameKa = item.Company;
            }
        }
    });
    
    if (targetItem) {
        let finalBase = targetItem.baseCompany || targetItem.Company.split(' ')[0].toLowerCase();
        showCompanyRatesModal(targetItem, nameKa, finalBase);
    }
};
