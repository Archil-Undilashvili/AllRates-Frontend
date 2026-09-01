document.addEventListener('DOMContentLoaded', async () => {
    const isLocal = ['localhost', '127.0.0.1', ''].includes(window.location.hostname) || window.location.protocol === 'file:';
    const PROD_API = 'https://allrates-backend-api.onrender.com';
    const apiOrigin = window.ALLRATES_API_ORIGIN || (isLocal ? 'http://localhost:3000' : PROD_API);
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token) {
        window.location.href = isLocal ? 'index.html' : '/';
        return;
    }

    const tabs = document.querySelectorAll('.user-side-tab');
    const watchPanel = document.getElementById('watchlistPanel');
    const calendarPanel = document.getElementById('calendarPanel');
    const calendarContent = document.getElementById('economicCalendarContent');
    const calendarRefreshBtn = document.getElementById('calendarRefreshBtn');
    const calendarCountryInputs = document.querySelectorAll('[data-calendar-country]');
    const calendarPeriodButtons = document.querySelectorAll('[data-calendar-period]');
    const calendarFromDate = document.getElementById('calendarFromDate');
    const calendarToDate = document.getElementById('calendarToDate');
    const categoryButtons = document.querySelectorAll('.watch-category-btn');
    const searchArea = document.querySelector('.watch-search-area');
    const searchInput = document.getElementById('watchSearchInput');
    const dropdown = document.getElementById('watchSearchDropdown');
    const watchlistEl = document.getElementById('watchlistItems');
    const saveStatus = document.getElementById('watchSaveStatus');
    const WATCH_ALERTS_KEY = 'allrates_watchlist_alerts_ui_v1';
    const CRYPTO_WATCHLIST_CHANNEL = 'allrates_crypto_prices_v1';
    const cryptoWatchlistChannel = typeof BroadcastChannel !== 'undefined'
        ? new BroadcastChannel(CRYPTO_WATCHLIST_CHANNEL)
        : null;

    const NBG_API = 'https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json';
    const MARKET_HISTORY_API = `${apiOrigin}/api/market-history/latest`;
    const MARKET_HISTORY_FALLBACK_API = `${PROD_API}/api/market-history/latest`;
    const MAIN_CACHE_KEYS = {
        official: 'cachedNBGData',
        company: 'cachedRatesData_scraper_v2',
        market: 'allrates_home_market_history_latest_v1',
        forex: 'cachedIntlRatesHtml_v3',
        cryptoLive: 'allrates_crypto_live_map_v1',
        crypto: 'cachedCryptoData',
        cryptoUpdatedAt: 'cachedCryptoData_updatedAt',
        fuel: 'allrates_home_gas_market_cache_v2',
        asset: 'cachedPopularAssetsHtml_v3'
    };
    const categories = { official: [], market: [], company: [], forex: [], crypto: [], fuel: [], asset: [] };
    let activeCategory = 'official';
    let watchlist = [];
    let draggedId = '';
    let openAlertEditorId = '';
    let openOptionsId = '';
    let watchAlerts = {};
    let calendarLoaded = false;
    let calendarLoading = false;
    let activeCalendarPeriod = 'current-week';
    const alertDrafts = {};
    const flashingIds = new Set();

    const companyNames = {
        rico: 'რიკო', crystal: 'კრისტალი', kursige: 'კურსი ჯი', giro: 'გირო', valuto: 'ვალუტო',
        bog: 'საქართველოს ბანკი', tbc: 'თიბისი', liberty: 'ლიბერთი', bb: 'ბაზისბანკი', credo: 'კრედო',
        cartu: 'ქართუ', inex: 'ინტელიექსპრესი', mbc: 'ემბისი', goa: 'გოა', hash: 'ჰეშ ბანკი',
        tera: 'ტერაბანკი', halyk: 'ჰალიკ ბანკი', isbank: 'იშბანკი', silk: 'სილქ ბანკი', leader: 'ლიდერი',
        smarti: 'სმარტი', central: 'ცენტრალი', georgiancredit: 'ჯორჯიან კრედიტი', tbmc: 'თბილისის მიკროკრედიტი',
        bermeli: 'ბერმელი', alphaexpress: 'ალფა ექსპრესი', scapp: 'სქეფი', expresslombard: 'ექსპრეს ლომბარდი'
    };
    const companyLogos = {
        rico: 'Logos/rico_icon.png', crystal: 'Logos/crystal_icon.png', kursige: 'Logos/kursige_icon.png',
        giro: 'Logos/giro_icon.png', valuto: 'Logos/valuto_icon.png', bog: 'Logos/bog_icon.png',
        tbc: 'Logos/tbc_icon.png', liberty: 'Logos/liberty_icon.png', bb: 'Logos/bb_icon.png',
        credo: 'Logos/credo_icon.png', cartu: 'Logos/cartu_icon.ico', inex: 'Logos/Inex.png',
        mbc: 'Logos/mbc_icon.png', goa: 'Logos/goa_icon.png', hash: 'Logos/hash_icon.ico',
        tera: 'Logos/tera_icon.png', halyk: 'Logos/halyk_icon.png', is: 'Logos/is_icon.png',
        silk: 'Logos/silk_icon.png', leader: 'Logos/leader.jpg', smarti: 'Logos/smarti_icon.png',
        central: 'Logos/central_icon.svg', georgiancredit: 'Logos/georgiancredit_icon.png',
        tbmc: 'Logos/tbmc_icon.png', bermeli: 'Logos/bermeli_icon.svg',
        alphaexpress: 'Logos/alphaexpress_icon.png', scapp: 'Logos/scapp_icon.svg',
        expresslombard: 'Logos/expresslombard_icon.svg'
    };
    const currencyMeta = {
        USD: { title: 'აშშ დოლარი', logo: 'Logos/US.png' }, EUR: { title: 'ევრო', logo: 'Logos/EU.png' },
        GBP: { title: 'ფუნტი', logo: 'Logos/GB.png' }, RUB: { title: 'რუბლი', logo: 'Logos/RU.png' },
        TRY: { title: 'ლირა', logo: 'Logos/TR.png' }, CHF: { title: 'შვეიცარიული ფრანკი', logo: 'https://flagcdn.com/w40/ch.png' },
        CNY: { title: 'ჩინური იუანი', logo: 'https://flagcdn.com/w40/cn.png' },
        AZN: { title: 'აზერბაიჯანული მანათი', logo: 'https://flagcdn.com/w40/az.png' }, AMD: { title: 'სომხური დრამი', logo: 'https://flagcdn.com/w40/am.png' },
        AUD: { title: 'ავსტრალიური დოლარი', logo: 'https://flagcdn.com/w40/au.png' },
        BRL: { title: 'ბრაზილიური რეალი', logo: 'https://flagcdn.com/w40/br.png' },
        BYN: { title: 'ბელარუსული რუბლი', logo: 'https://flagcdn.com/w40/by.png' },
        CAD: { title: 'კანადური დოლარი', logo: 'https://flagcdn.com/w40/ca.png' },
        DKK: { title: 'დანიური კრონი', logo: 'https://flagcdn.com/w40/dk.png' },
        HKD: { title: 'ჰონგ კონგის დოლარი', logo: 'https://flagcdn.com/w40/hk.png' },
        JPY: { title: 'იაპონური იენი', logo: 'https://flagcdn.com/w40/jp.png' },
        NOK: { title: 'ნორვეგიული კრონი', logo: 'https://flagcdn.com/w40/no.png' },
        NZD: { title: 'ახალი ზელანდიის დოლარი', logo: 'https://flagcdn.com/w40/nz.png' },
        SEK: { title: 'შვედური კრონი', logo: 'https://flagcdn.com/w40/se.png' },
        SGD: { title: 'სინგაპურული დოლარი', logo: 'https://flagcdn.com/w40/sg.png' },
        ZAR: { title: 'სამხრეთ აფრიკული რენდი', logo: 'https://flagcdn.com/w40/za.png' },
        PLN: { title: 'პოლონური ზლოტი', logo: 'https://flagcdn.com/w40/pl.png' },
        UAH: { title: 'უკრაინული გრივნა', logo: 'https://flagcdn.com/w40/ua.png' },
        AED: { title: 'არაბეთის გაერთიანებული საამიროების დირჰამი', logo: 'https://flagcdn.com/w40/ae.png' },
        CZK: { title: 'ჩეხური კრონი', logo: 'https://flagcdn.com/w40/cz.png' },
        EGP: { title: 'ეგვიპტური ფუნტი', logo: 'https://flagcdn.com/w40/eg.png' },
        HUF: { title: 'უნგრული ფორინტი', logo: 'https://flagcdn.com/w40/hu.png' },
        IRR: { title: 'ირანული რიალი', logo: 'https://flagcdn.com/w40/ir.png' },
        ISK: { title: 'ისლანდიური კრონა', logo: 'https://flagcdn.com/w40/is.png' },
        KGS: { title: 'ყირგიზული სომი', logo: 'https://flagcdn.com/w40/kg.png' },
        KRW: { title: 'სამხრეთ კორეული ვონი', logo: 'https://flagcdn.com/w40/kr.png' },
        KWD: { title: 'ქუვეითური დინარი', logo: 'https://flagcdn.com/w40/kw.png' },
        KZT: { title: 'ყაზახური ტენგე', logo: 'https://flagcdn.com/w40/kz.png' },
        MDL: { title: 'მოლდოვური ლეი', logo: 'https://flagcdn.com/w40/md.png' },
        QAR: { title: 'კატარული რიალი', logo: 'https://flagcdn.com/w40/qa.png' },
        RON: { title: 'რუმინული ლეი', logo: 'https://flagcdn.com/w40/ro.png' },
        RSD: { title: 'სერბული დინარი', logo: 'https://flagcdn.com/w40/rs.png' },
        TJS: { title: 'ტაჯიკური სომონი', logo: 'https://flagcdn.com/w40/tj.png' },
        TMT: { title: 'თურქმენული მანათი', logo: 'https://flagcdn.com/w40/tm.png' },
        UZS: { title: 'უზბეკური სუმი', logo: 'https://flagcdn.com/w40/uz.png' },
        ILS: { title: 'ისრაელის შეკელი', logo: 'https://flagcdn.com/w40/il.png' },
        INR: { title: 'ინდური რუპია', logo: 'https://flagcdn.com/w40/in.png' }
    };
    const cryptoNames = {
        BTC: 'Bitcoin', ETH: 'Ethereum', USDT: 'Tether', BNB: 'BNB', SOL: 'Solana', USDC: 'USDC', XRP: 'XRP',
        DOGE: 'Dogecoin', TON: 'Toncoin', ADA: 'Cardano', TRX: 'TRON', AVAX: 'Avalanche', LINK: 'Chainlink',
        SUI: 'Sui', XLM: 'Stellar', BCH: 'Bitcoin Cash', HBAR: 'Hedera', LTC: 'Litecoin', DOT: 'Polkadot'
    };
    const cryptoLogos = { BTC: 'Logos/BTC.png', ETH: 'Logos/ETH.png', USDT: 'Logos/USDT.png', BNB: 'Logos/BNB.png', SOL: 'Logos/SOL.png', USDC: 'Logos/USDC.png', XRP: 'Logos/XRP.png', DOGE: 'Logos/DOGE.png', TON: 'Logos/TON.png', ADA: 'Logos/ADA.png' };
    const assets = [
        ['Gold', 'Logos/GOLD.png'], ['Silver', 'Logos/SILVER.png'], ['Platinium', 'Logos/PLATINIUM.png'], ['Platinum', 'Logos/PLATINIUM.png'],
        ['WTI Crude Oil', 'Logos/WTI.png'], ['Brent Crude Oil', 'Logos/BRENT.png'], ['Natural Gas', 'Logos/Natural Gas.png'],
        ['S&P 500', 'Logos/SP500.png'], ['Dow Jones', 'Logos/DJI.png'], ['NVIDIA', 'Logos/NVDA.png'],
        ['Apple', 'Logos/AAPL.png'], ['Tesla', 'Logos/TSLA.png']
    ];
    const officialPriority = ['USD', 'EUR', 'GBP', 'CHF', 'RUB', 'TRY', 'CNY'];
    const marketOrder = ['USDGEL', 'EURGEL', 'GBPGEL', 'RUBGEL', 'TRYGEL'];

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    }

    function compact(value) {
        return String(value || '').toLowerCase().replace(/[\s/_-]+/g, '');
    }

    function itemId(category, ...parts) {
        return [category, ...parts].map(compact).join(':');
    }

    function localHref(path) {
        if (!isLocal) return path;
        if (path === '/') return 'index.html';
        return `${path.replace(/^\//, '')}.html`;
    }

    async function fetchJson(url, options = {}) {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(url);
        return res.json();
    }

    async function apiFetch(path, options = {}) {
        const res = await fetch(`${apiOrigin}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...(options.headers || {})
            }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'API request failed');
        return data;
    }

    function previousBusinessDate(date) {
        const d = new Date(date);
        d.setDate(d.getDate() - 1);
        while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
    }

    function pct(current, previous) {
        const now = Number(current);
        const prev = Number(previous);
        if (!Number.isFinite(now) || !Number.isFinite(prev) || prev === 0) return { text: '', cls: 'neutral' };
        const change = ((now - prev) / prev) * 100;
        return { text: `${change > 0 ? '+' : ''}${change.toFixed(2)}%`, cls: change > 0 ? 'negative' : change < 0 ? 'positive' : 'neutral' };
    }

    function companyKey(item) {
        const raw = String(item.baseCompany || item.company || item.Company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (raw.includes('bankofgeorgia')) return 'bog';
        if (raw.includes('tbilmicrocredit')) return 'tbmc';
        if (raw.includes('georgian')) return 'georgiancredit';
        if (raw.includes('isbank')) return 'is';
        if (raw.includes('basisbank')) return 'bb';
        if (raw.includes('inteliexpress')) return 'inex';
        return raw;
    }

    function readNumber(item, keys) {
        for (const key of keys) {
            const value = Number(item[key]);
            if (Number.isFinite(value) && value > 0) return value;
        }
        return null;
    }

    function normalizeItem(item) {
        return {
            id: item.id,
            category: item.category,
            kind: item.kind || item.category,
            title: item.title,
            subtitle: item.subtitle || '',
            logo: item.logo || '',
            value: item.value || '',
            buy: item.buy || '',
            sell: item.sell || '',
            spread: item.spread || '',
            updatedAtText: item.updatedAtText || '',
            change: item.change || '',
            changeClass: item.changeClass || 'neutral',
            search: item.search || `${item.title} ${item.subtitle}`
        };
    }

    function alertTypeToOperator(type) {
        if (type === 'above') return 'gt';
        if (type === 'below') return 'lt';
        return 'pct';
    }

    function operatorToAlertType(operator) {
        if (operator === 'gt') return 'above';
        if (operator === 'lt') return 'below';
        return 'percent';
    }

    function alertStateFromApi(alert) {
        const id = alert.watchItemId || '';
        if (!id) return null;
        return {
            apiId: alert._id,
            type: operatorToAlertType(alert.operator),
            target: alert.operator === 'pct' ? `${alert.targetPercent ?? alert.targetRate}%` : String(alert.targetRate ?? ''),
            side: alert.side === 'buy' || alert.side === 'sell' ? alert.side : 'mid',
            status: alert.status || 'active',
            triggeredAt: alert.triggeredAt || '',
            triggeredRate: alert.triggeredRate || ''
        };
    }

    function loadWatchAlertsFromStorage() {
        try {
            const parsed = JSON.parse(localStorage.getItem(WATCH_ALERTS_KEY) || '{}');
            watchAlerts = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
        } catch {
            watchAlerts = {};
        }
    }

    function saveWatchAlerts() {
        localStorage.setItem(WATCH_ALERTS_KEY, JSON.stringify(watchAlerts));
    }

    async function loadWatchAlerts() {
        loadWatchAlertsFromStorage();
        try {
            const data = await apiFetch('/api/alerts');
            const next = {};
            (data.alerts || []).forEach(alert => {
                const state = alertStateFromApi(alert);
                if (state) next[alert.watchItemId] = state;
            });
            watchAlerts = next;
            saveWatchAlerts();
        } catch (error) {
            saveStatus.textContent = 'Alert-ების წამოღება ვერ მოხერხდა';
            setTimeout(() => { if (saveStatus.textContent === 'Alert-ების წამოღება ვერ მოხერხდა') saveStatus.textContent = ''; }, 1800);
        }
    }

    function logoHtml(src, alt) {
        return `<span class="watch-logo">${src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" onerror="this.outerHTML='<span>${escapeHtml(String(alt || '?').charAt(0))}</span>'">` : `<span>${escapeHtml(String(alt || '?').charAt(0))}</span>`}</span>`;
    }

    function getFlagCode(currency) {
        const map = { usd: 'us', eur: 'eu', gbp: 'gb', jpy: 'jp', chf: 'ch', aud: 'au', cad: 'ca', nzd: 'nz', try: 'tr', rub: 'ru', gel: 'ge', azn: 'az', amd: 'am', cny: 'cn', brl: 'br', byn: 'by', dkk: 'dk', hkd: 'hk', nok: 'no', sek: 'se', sgd: 'sg', zar: 'za', pln: 'pl', uah: 'ua', aed: 'ae', czk: 'cz', egp: 'eg', huf: 'hu', irr: 'ir', isk: 'is', kgs: 'kg', krw: 'kr', kwd: 'kw', kzt: 'kz', mdl: 'md', qar: 'qa', ron: 'ro', rsd: 'rs', tjs: 'tj', tmt: 'tm', uzs: 'uz', ils: 'il', inr: 'in' };
        return map[String(currency || '').toLowerCase()] || 'un';
    }

    function flagSrc(currency) {
        const code = String(currency || '').toUpperCase();
        if (currencyMeta[code]?.logo) return currencyMeta[code].logo;
        const flagCode = getFlagCode(code);
        return flagCode === 'un' ? '' : `https://flagcdn.com/w40/${flagCode}.png`;
    }

    function forexLogoSrc(pair) {
        const code = String(pair || '').replace('/', '').toUpperCase();
        return `${flagSrc(code.slice(0, 3))}|${flagSrc(code.slice(3, 6))}`;
    }

    function logoBlock(item) {
        if (String(item.logo || '').includes('|')) {
            const [first, second] = item.logo.split('|');
            return `<span class="watch-logo watch-logo-duo"><span class="forex-flag-stack watch-forex-stack"><img src="${escapeHtml(first)}" alt=""><img src="${escapeHtml(second)}" alt=""></span></span>`;
        }
        return logoHtml(item.logo, item.title);
    }

    async function loadSavedWatchlist() {
        const data = await apiFetch('/api/dashboard');
        watchlist = Array.isArray(data.watchlist) ? data.watchlist.map(normalizeItem) : [];
        renderWatchlist();
    }

    async function saveWatchlist() {
        saveStatus.textContent = 'ინახება...';
        try {
            const data = await apiFetch('/api/dashboard/watchlist', {
                method: 'PUT',
                body: JSON.stringify({ watchlist })
            });
            watchlist = Array.isArray(data.watchlist) ? data.watchlist.map(normalizeItem) : watchlist;
            saveStatus.textContent = 'შენახულია';
            setTimeout(() => { if (saveStatus.textContent === 'შენახულია') saveStatus.textContent = ''; }, 1400);
        } catch (error) {
            saveStatus.textContent = 'შენახვა ვერ მოხერხდა';
        }
    }

    function valueHtml(item) {
        if (item.buy || item.sell) {
            const spread = item.spread ? `<span class="watch-rate-stack watch-rate-spread"><small>სპრედი</small><b>${escapeHtml(item.spread)}</b></span>` : '';
            return `
                <span class="watch-mini-values">
                    <span class="watch-rate-stack watch-rate-buy"><small>ყიდვა</small><b>${escapeHtml(item.buy || '-')}</b></span>
                    <span class="watch-rate-stack watch-rate-sell"><small>გაყიდვა</small><b>${escapeHtml(item.sell || '-')}</b></span>
                    ${spread}
                </span>
            `;
        }
        return `<b>${escapeHtml(item.value || '-')}</b>`;
    }

    function parseDisplayNumber(value) {
        const normalized = String(value || '').replace(/,/g, '').replace(/[^0-9.-]/g, '');
        const number = Number(normalized);
        return Number.isFinite(number) ? number : null;
    }

    function hasBuySellPrice(item) {
        const buy = parseDisplayNumber(item.buy);
        const sell = parseDisplayNumber(item.sell);
        return (Number.isFinite(buy) && buy > 0) || (Number.isFinite(sell) && sell > 0);
    }

    function currentComparableValue(item, side = 'mid') {
        const buy = parseDisplayNumber(item.buy);
        const sell = parseDisplayNumber(item.sell);
        if (side === 'buy' && Number.isFinite(buy) && buy > 0) return buy;
        if (side === 'sell' && Number.isFinite(sell) && sell > 0) return sell;
        if (Number.isFinite(buy) && buy > 0 && Number.isFinite(sell) && sell > 0) return (buy + sell) / 2;
        if (Number.isFinite(buy) && buy > 0) return buy;
        if (Number.isFinite(sell) && sell > 0) return sell;
        return parseDisplayNumber(item.value);
    }

    function cleanAlertTarget(value, type) {
        const raw = String(value || '').replace(/\s/g, '');
        const normalized = raw.includes(',') && !raw.includes('.') && raw.split(',').pop().length <= 2
            ? raw.replace(',', '.')
            : raw.replace(/,/g, '');
        const numeric = normalized.replace(/[^0-9.]/g, '');
        if (type === 'percent' && numeric) return `${numeric}%`;
        return numeric;
    }

    function alertNumericTarget(value) {
        const raw = String(value || '').replace('%', '').replace(/\s/g, '');
        const normalized = raw.includes(',') && !raw.includes('.') && raw.split(',').pop().length <= 2
            ? raw.replace(',', '.')
            : raw.replace(/,/g, '');
        const number = Number(normalized.replace(/[^0-9.-]/g, ''));
        return Number.isFinite(number) ? number : NaN;
    }

    function priceDecimals(item) {
        const sample = String(item.value || item.buy || item.sell || '');
        const decimalMatch = sample.match(/[.,](\d+)/);
        if (item.category === 'crypto' || item.category === 'asset') return 2;
        if (decimalMatch) return Math.min(Math.max(decimalMatch[1].length, 2), 4);
        return 2;
    }

    function formatAlertTarget(value, item, type) {
        const number = alertNumericTarget(value);
        if (!Number.isFinite(number)) return '';
        if (type === 'percent') return `${number.toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;
        if (number >= 1000) {
            return number.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: priceDecimals(item)
            });
        }
        return number.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: priceDecimals(item)
        });
    }

    function formatCurrentForAlert(value, item) {
        if (!Number.isFinite(value)) return '';
        return value.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: priceDecimals(item)
        });
    }

    function alertDraftFor(itemOrId) {
        const id = typeof itemOrId === 'string' ? itemOrId : itemOrId.id;
        const item = typeof itemOrId === 'string' ? watchlist.find(candidate => candidate.id === id) : itemOrId;
        if (!alertDrafts[id]) alertDrafts[id] = { side: hasBuySellPrice(item || {}) ? 'buy' : 'mid', ...(watchAlerts[id] || { type: '', target: '' }) };
        return alertDrafts[id];
    }

    function alertPlaceholder(type) {
        return type === 'percent' ? 'სამიზნე %' : 'სამიზნე ფასი';
    }

    function validateAlertDraft(item, draft) {
        if (!draft?.type) return { ok: false, message: 'აირჩიე Alert-ის ტიპი' };
        const target = alertNumericTarget(draft.target);
        if (!Number.isFinite(target) || target <= 0) return { ok: false, message: 'ჩაწერე დადებითი რიცხვი' };
        if (draft.type === 'percent') {
            if (target > 100) return { ok: false, message: 'სამიზნე % უნდა იყოს 0-დან 100-მდე' };
            return { ok: true, message: '' };
        }
        const side = hasBuySellPrice(item) ? (draft.side || 'buy') : 'mid';
        const current = currentComparableValue(item, side);
        if (!Number.isFinite(current)) return { ok: false, message: 'მიმდინარე ფასი ვერ იკითხება' };
        const label = side === 'buy' ? 'ყიდვის კურსზე' : side === 'sell' ? 'გაყიდვის კურსზე' : 'მიმდინარე ფასზე';
        const formattedCurrent = formatCurrentForAlert(current, item);
        if (draft.type === 'above' && target <= current) return { ok: false, message: `სამიზნე ფასი უნდა იყოს მეტი ${label}: ${formattedCurrent}` };
        if (draft.type === 'below' && target >= current) return { ok: false, message: `სამიზნე ფასი უნდა იყოს ნაკლები ${label}: ${formattedCurrent}` };
        return { ok: true, message: '' };
    }

    function alertPayloadFor(item, draft) {
        const parts = item.id.split(':');
        const operator = alertTypeToOperator(draft.type);
        const payload = {
            watchItemId: item.id,
            displayName: `${item.title}${item.subtitle ? ` ${item.subtitle}` : ''}`.trim(),
            alertType: item.category,
            operator,
            targetRate: alertNumericTarget(draft.target),
            side: hasBuySellPrice(item) ? (draft.side || 'buy') : 'rate'
        };

        if (item.category === 'company') {
            payload.companyKey = parts[1] || '';
            payload.companyName = item.title;
            payload.pair = (parts[2] || item.subtitle || '').replace('/', '').toUpperCase();
            payload.side = draft.side || 'buy';
        } else if (item.category === 'official') {
            payload.pair = `${(parts[1] || item.title.slice(0, 3)).toUpperCase()}GEL`;
            payload.side = 'rate';
        } else if (item.category === 'market') {
            payload.pair = (parts[1] || item.title).replace('/', '').toUpperCase();
            payload.side = draft.side || 'buy';
        } else if (item.category === 'forex' || item.category === 'crypto') {
            payload.pair = (parts[1] || item.subtitle || item.title).replace('/', '').toUpperCase();
            payload.side = 'rate';
        } else if (item.category === 'fuel') {
            payload.pair = parts[1] || item.title;
            payload.side = 'rate';
        } else {
            payload.pair = item.title;
            payload.side = 'rate';
        }

        return payload;
    }

    async function saveAlertToApi(item, draft) {
        const existing = watchAlerts[item.id];
        const payload = alertPayloadFor(item, draft);
        const data = await apiFetch(existing?.apiId ? `/api/alerts/${existing.apiId}` : '/api/alerts', {
            method: existing?.apiId ? 'PUT' : 'POST',
            body: JSON.stringify(payload)
        });
        const state = alertStateFromApi(data.alert);
        if (state) watchAlerts[item.id] = state;
        saveWatchAlerts();
    }

    async function deleteAlertFromApi(id) {
        const apiId = watchAlerts[id]?.apiId;
        if (apiId) await apiFetch(`/api/alerts/${apiId}`, { method: 'DELETE' });
        delete watchAlerts[id];
        saveWatchAlerts();
    }

    function displaySubtitle(item, location = 'search') {
        if (location === 'watchlist' && item.category === 'official') return 'ოფიციალური კურსი';
        if (location === 'watchlist' && item.category === 'forex') return 'Forex';
        if (location === 'watchlist' && item.category === 'crypto') return 'კრიპტოვალუტა';
        return item.subtitle || '';
    }

    function valueSignature(item) {
        return [item.value, item.buy, item.sell, item.spread, item.updatedAtText].map(value => String(value || '')).join('|');
    }

    function countryLabel(country) {
        if (country === 'GE') return 'საქართველო';
        if (country === 'US') return 'United States';
        if (country === 'EU') return 'Euro Zone';
        if (country === 'UK') return 'United Kingdom';
        return country || '-';
    }

    function countryFlagSrc(country) {
        if (country === 'GE') return 'https://flagcdn.com/w40/ge.png';
        if (country === 'US') return 'Logos/US.png';
        if (country === 'EU') return 'Logos/EU.png';
        if (country === 'UK') return 'Logos/GB.png';
        return '';
    }

    function calendarCountryHtml(event) {
        const country = event.country || '';
        const label = event.countryName || countryLabel(country);
        const flag = countryFlagSrc(country);
        return flag
            ? `<img class="calendar-country-flag" src="${escapeHtml(flag)}" alt="${escapeHtml(label)}" title="${escapeHtml(label)}">`
            : `<b class="calendar-country calendar-country-${escapeHtml(country.toLowerCase())}" title="${escapeHtml(label)}">${escapeHtml(country || '-')}</b>`;
    }

    function calendarDateLabel(value, fallbackTime = '') {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return fallbackTime || '-';
        const day = new Intl.DateTimeFormat('ka-GE', {
            timeZone: 'Asia/Tbilisi',
            month: 'short',
            day: '2-digit'
        }).format(date);
        const time = new Intl.DateTimeFormat('ka-GE', {
            timeZone: 'Asia/Tbilisi',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23'
        }).format(date);
        return `${day} · ${time}`;
    }

    function dateInputValue(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function startOfWeek(date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const offset = (start.getDay() + 6) % 7;
        start.setDate(start.getDate() - offset);
        return start;
    }

    function endOfWeek(date) {
        const end = startOfWeek(date);
        end.setDate(end.getDate() + 6);
        return end;
    }

    function calendarPeriodRange(period) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (period === 'next-week') {
            const from = startOfWeek(today);
            from.setDate(from.getDate() + 7);
            return { from, to: endOfWeek(from) };
        }
        if (period === 'next-month') {
            const from = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            const to = new Date(today.getFullYear(), today.getMonth() + 2, 0);
            return { from, to };
        }
        return { from: today, to: endOfWeek(today) };
    }

    function setCalendarPeriod(period, options = {}) {
        activeCalendarPeriod = period;
        calendarPeriodButtons.forEach(button => button.classList.toggle('active', button.dataset.calendarPeriod === period));
        if (period !== 'custom') {
            const range = calendarPeriodRange(period);
            if (calendarFromDate) calendarFromDate.value = dateInputValue(range.from);
            if (calendarToDate) calendarToDate.value = dateInputValue(range.to);
        }
        calendarLoaded = false;
        if (!options.silent && calendarPanel && !calendarPanel.hidden) loadEconomicCalendar(true);
    }

    function selectedCalendarCountries() {
        return [...calendarCountryInputs]
            .filter(input => input.checked)
            .map(input => input.value)
            .join(',');
    }

    function calendarQuery(force = false) {
        const params = new URLSearchParams();
        const countries = selectedCalendarCountries();
        if (countries) params.set('countries', countries);
        if (calendarFromDate?.value) params.set('from', calendarFromDate.value);
        if (calendarToDate?.value) params.set('to', calendarToDate.value);
        if (force) params.set('force', '1');
        return params.toString();
    }

    function renderEconomicCalendar(events = []) {
        if (!calendarContent) return;
        if (!events.length) {
            calendarContent.innerHTML = '<p class="watch-empty economic-calendar-empty">არჩეულ ფილტრებში მომავალი მაღალი მნიშვნელობის მოვლენა ვერ მოიძებნა.</p>';
            return;
        }

        calendarContent.innerHTML = `
            <div class="economic-calendar-table" role="table" aria-label="ეკონომიკური კალენდარი">
                <div class="economic-calendar-row economic-calendar-row-head" role="row">
                    <span>ქვეყანა</span>
                    <span>დრო</span>
                    <span>მოვლენა</span>
                    <span>მნიშვნელობა</span>
                    <span>Actual</span>
                    <span>Forecast</span>
                    <span>Previous</span>
                </div>
                ${events.map(event => `
                    <div class="economic-calendar-row" role="row">
                        <span>${calendarCountryHtml(event)}</span>
                        <span>${escapeHtml(calendarDateLabel(event.dateTime, event.time))}</span>
                        <span><strong>${escapeHtml(event.event)}</strong></span>
                        <span>${escapeHtml(event.importance || '-')}</span>
                        <span>${escapeHtml(event.actual || '-')}</span>
                        <span>${escapeHtml(event.forecast || '-')}</span>
                        <span>${escapeHtml(event.previous || '-')}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async function loadEconomicCalendar(force = false) {
        if (!calendarContent || calendarLoading) return;
        if (!selectedCalendarCountries()) {
            calendarContent.innerHTML = '<p class="watch-empty economic-calendar-empty">აირჩიე მინიმუმ ერთი ქვეყანა.</p>';
            return;
        }
        calendarLoading = true;
        calendarContent.innerHTML = '<p class="watch-empty economic-calendar-loading">ეკონომიკური კალენდარი იტვირთება...</p>';
        if (calendarRefreshBtn) calendarRefreshBtn.disabled = true;
        try {
            const data = await apiFetch(`/api/economic-calendar?${calendarQuery(force)}`);
            renderEconomicCalendar(Array.isArray(data.events) ? data.events : []);
            calendarLoaded = true;
        } catch (error) {
            calendarContent.innerHTML = `<p class="watch-empty economic-calendar-error">${escapeHtml(error.message || 'ეკონომიკური კალენდრის წამოღება ვერ მოხერხდა')}</p>`;
        } finally {
            calendarLoading = false;
            if (calendarRefreshBtn) calendarRefreshBtn.disabled = false;
        }
    }

    function parsePercent(value) {
        return Number(String(value || '').replace('%', '').replace(',', '.'));
    }

    function parseJsonCache(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || 'null');
        } catch {
            return null;
        }
    }

    function updateCategoryItems(category, updates, flash = false) {
        if (!updates.size) return;
        categories[category] = categories[category].map(item => {
            const update = updates.get(item.id);
            return update ? normalizeItem({ ...item, ...update }) : item;
        });
        watchlist = watchlist.map(item => {
            const update = updates.get(item.id);
            if (!update) return item;
            const next = normalizeItem({ ...item, ...update });
            if (flash && valueSignature(item) && valueSignature(item) !== valueSignature(next)) flashingIds.add(item.id);
            return next;
        });
    }

    function applyOfficialCache(flash = false) {
        const cached = parseJsonCache(MAIN_CACHE_KEYS.official);
        const updates = new Map();
        if (Array.isArray(cached?.officialRates)) {
            cached.officialRates.forEach(rate => {
                const code = String(rate.code || '').toUpperCase();
                const value = Number(rate.rate ?? rate.value);
                const changeValue = parsePercent(rate.change ?? rate.changePercent);
                const update = {
                    value: Number.isFinite(value) ? value.toFixed(4) : String(rate.value || ''),
                    change: Number.isFinite(changeValue) ? `${changeValue > 0 ? '+' : ''}${changeValue.toFixed(2)}%` : String(rate.change || '')
                };
                if (update.change) {
                    update.changeClass = String(rate.changeClass || '').includes('positive')
                        ? 'positive'
                        : String(rate.changeClass || '').includes('negative')
                            ? 'negative'
                            : changeValue > 0 ? 'positive' : changeValue < 0 ? 'negative' : 'neutral';
                }
                if (code && update.value) updates.set(itemId('official', code), update);
            });
        } else {
            ['USD', 'EUR', 'GBP', 'CHF', 'RUB', 'TRY', 'CNY', 'AMD', 'AZN', 'ILS'].forEach(code => {
                const value = Number(cached?.[code.toLowerCase()]);
                if (Number.isFinite(value)) updates.set(itemId('official', code), { value: value.toFixed(4) });
            });
        }
        updateCategoryItems('official', updates, flash);
    }

    function applyCompanyCache(flash = false) {
        const cached = parseJsonCache(MAIN_CACHE_KEYS.company);
        if (!Array.isArray(cached)) return;
        const pairs = [
            ['USDGEL', ['usdBuy', 'USDGEL (Buy)'], ['usdSell', 'USDGEL (Sell)'], 3],
            ['EURGEL', ['eurBuy', 'EURGEL (Buy)'], ['eurSell', 'EURGEL (Sell)'], 3],
            ['GBPGEL', ['gbpBuy', 'GBPGEL (Buy)'], ['gbpSell', 'GBPGEL (Sell)'], 3],
            ['RUBGEL', ['rubBuy', 'RUBGEL (Buy)'], ['rubSell', 'RUBGEL (Sell)'], 4],
            ['TRYGEL', ['tryBuy', 'TRYGEL (Buy)'], ['trySell', 'TRYGEL (Sell)'], 4]
        ];
        const updates = new Map();
        cached.filter(item => !String(item.company || item.Company || item.baseCompany || '').toLowerCase().includes('procredit')).forEach(item => {
            const key = companyKey(item);
            pairs.forEach(([pair, buyKeys, sellKeys, digits]) => {
                const buy = readNumber(item, buyKeys);
                const sell = readNumber(item, sellKeys);
                if (!buy && !sell) return;
                const spread = buy && sell ? sell - buy : null;
                const update = {
                    buy: buy ? buy.toFixed(digits) : '-',
                    sell: sell ? sell.toFixed(digits) : '-',
                    spread: Number.isFinite(spread) ? spread.toFixed(digits) : '-'
                };
                const updatedAtText = formatCompanyUpdateTime(item);
                if (updatedAtText) update.updatedAtText = updatedAtText;
                updates.set(itemId('company', key, pair), update);
            });
        });
        updateCategoryItems('company', updates, flash);
    }

    function applyMarketCache(flash = false) {
        const cached = parseJsonCache(MAIN_CACHE_KEYS.market);
        const record = cached?.record || cached;
        const updates = new Map();
        marketOrder.forEach(pair => {
            const latest = record?.[pair.toLowerCase()];
            const buy = Number(latest?.buy);
            const sell = Number(latest?.sell);
            const spread = Number(latest?.spread);
            if (!Number.isFinite(buy) || !Number.isFinite(sell)) return;
            updates.set(itemId('market', pair), {
                buy: buy.toFixed(4),
                sell: sell.toFixed(4),
                spread: Number.isFinite(spread) ? spread.toFixed(4) : (sell - buy).toFixed(4)
            });
        });
        updateCategoryItems('market', updates, flash);
    }

    function parseCachedRowsHtml(cacheKey) {
        const html = localStorage.getItem(cacheKey);
        if (!html) return [];
        const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
        return Array.from(doc.querySelectorAll('.intl-rate-item')).map(row => ({
            title: row.querySelector('.intl-pair span:last-child, .crypto-token-copy span')?.textContent?.trim() || '',
            value: row.querySelector('.home-split-main, .crypto-price')?.textContent?.trim() || '',
            change: row.querySelector('.home-split-change, .crypto-change')?.textContent?.trim() || ''
        })).filter(row => row.title || row.value);
    }

    function applyForexCache(flash = false) {
        const updates = new Map();
        parseCachedRowsHtml(MAIN_CACHE_KEYS.forex).forEach(row => {
            const pair = row.title.replace(/[^A-Za-z]/g, '').toUpperCase();
            if (pair.length !== 6) return;
            const changeValue = Number(row.change.replace('%', ''));
            const update = { value: row.value };
            if (row.change) {
                update.change = row.change;
                update.changeClass = changeValue > 0 ? 'positive' : changeValue < 0 ? 'negative' : 'neutral';
            }
            updates.set(itemId('forex', pair), update);
        });
        updateCategoryItems('forex', updates, flash);
    }

    function applyCryptoCache(flash = false) {
        return applyCryptoRows(parseJsonCache(MAIN_CACHE_KEYS.cryptoLive), flash)
            || applyCryptoRows(parseJsonCache(MAIN_CACHE_KEYS.crypto), flash);
    }

    function normalizeCryptoRows(cached) {
        if (Array.isArray(cached)) return cached;
        if (cached?.items && typeof cached.items === 'object') return Object.values(cached.items);
        if (cached && typeof cached === 'object') return Object.values(cached);
        return [];
    }

    function applyCryptoRows(cached, flash = false) {
        const rows = normalizeCryptoRows(cached);
        if (!rows.length) return false;
        const updates = new Map();
        rows.forEach(item => {
            const symbol = String(item.symbol || '').toUpperCase();
            if (!symbol) return;
            const change = Number(item.change);
            updates.set(itemId('crypto', `${symbol}USDT`), {
                value: item.price ? `$ ${item.price}` : '',
                change: Number.isFinite(change) ? `${change > 0 ? '+' : ''}${change}%` : '',
                changeClass: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
            });
        });
        if (!updates.size) return false;
        updateCategoryItems('crypto', updates, flash);
        return true;
    }

    function applyFuelCache(flash = false) {
        const cached = parseJsonCache(MAIN_CACHE_KEYS.fuel);
        const rows = Array.isArray(cached?.summary?.categories) ? cached.summary.categories : [];
        const updates = new Map();
        rows.forEach(row => {
            const average = Number(row.average);
            const change = Number(row.changePercent);
            updates.set(itemId('fuel', row.key || row.label), {
                value: Number.isFinite(average) ? `${average.toFixed(2)} ₾` : '-',
                change: Number.isFinite(change) ? `${change > 0 ? '+' : ''}${change.toFixed(2)}%` : '',
                changeClass: change < 0 ? 'positive' : change > 0 ? 'negative' : 'neutral'
            });
        });
        updateCategoryItems('fuel', updates, flash);
    }

    function applyAssetCache(flash = false) {
        const updates = new Map();
        parseCachedRowsHtml(MAIN_CACHE_KEYS.asset).forEach(row => {
            if (!row.title || !row.value) return;
            updates.set(itemId('asset', row.title), { value: row.value });
        });
        updateCategoryItems('asset', updates, flash);
    }

    function applyMainPageCaches(flash = false) {
        applyOfficialCache(flash);
        applyCompanyCache(flash);
        applyMarketCache(flash);
        applyForexCache(flash);
        applyCryptoCache(flash);
        applyFuelCache(flash);
        applyAssetCache(flash);
        if (!openOptionsId && !openAlertEditorId) renderWatchlist();
    }

    function companyMetaHtml(item) {
        if (item.category !== 'company') return '<span class="watch-company-updated watch-company-placeholder" aria-hidden="true"></span>';
        return `<span class="watch-company-updated" title="კურსის განახლების დრო"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>${escapeHtml(item.updatedAtText || '-')}</span>`;
    }

    function companyHeaderHtml() {
        if (activeCategory !== 'company') return '';
        return `
            <div class="watch-company-header">
                <span></span><span></span>
                <span class="watch-company-header-values"><b>ყიდვა</b><b>გაყიდვა</b><b>სპრედი</b></span>
                <b title="კურსის განახლების დრო"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg></b>
                <span></span>
            </div>
        `;
    }

    function alertIcon(type) {
        if (type === 'above') return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5"></path><path d="m6 11 6-6 6 6"></path></svg>';
        if (type === 'below') return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14"></path><path d="m18 13-6 6-6-6"></path></svg>';
        return '<span class="watch-percent-mark" aria-hidden="true">%</span>';
    }

    function alertActionLabel(type) {
        if (type === 'above') return 'Top ზღვარი';
        if (type === 'below') return 'Bottom ზღვარი';
        return 'ფასის ცვლილებაზე';
    }

    function alertEditorHtml(item) {
        const draft = alertDraftFor(item);
        const validation = validateAlertDraft(item, draft);
        const hasType = Boolean(draft.type);
        const sidePicker = hasBuySellPrice(item) ? `
            <select class="watch-alert-side" data-alert-side="${escapeHtml(item.id)}" aria-label="Alert-ის ფასი">
                <option value="buy" ${draft.side === 'buy' ? 'selected' : ''}>ყიდვა</option>
                <option value="sell" ${draft.side === 'sell' ? 'selected' : ''}>გაყიდვა</option>
            </select>
        ` : '';
        return `
            <div class="watch-alert-panel" data-alert-editor="${escapeHtml(item.id)}">
                <div class="watch-alert-builder">
                    ${sidePicker}
                    <div class="watch-alert-actions" aria-label="Alert-ის ტიპები">
                        <button class="${draft.type === 'above' ? 'active' : ''}" type="button" data-alert-type="above" data-tooltip="Alert, თუ  აქტივის ფასი მეტი იქნება სამიზნე ფასზე">${alertIcon('above')}<span>${alertActionLabel('above')}</span></button>
                        <button class="${draft.type === 'below' ? 'active' : ''}" type="button" data-alert-type="below" data-tooltip="Alert, თუ  აქტივის ფასი ნაკლები იქნება სამიზნე ფასზე">${alertIcon('below')}<span>${alertActionLabel('below')}</span></button>
                        <button class="${draft.type === 'percent' ? 'active' : ''}" type="button" data-alert-type="percent" data-tooltip="Alert, თუ აქტივის ფასი შეიცვლება სამიზნე %-ით">${alertIcon('percent')}<span>${alertActionLabel('percent')}</span></button>
                    </div>
                    <input type="text" inputmode="decimal" data-alert-value="${escapeHtml(item.id)}" ${hasType ? '' : 'disabled'} placeholder="${escapeHtml(alertPlaceholder(draft.type))}" value="${escapeHtml(draft.target || '')}">
                    <span class="watch-alert-controls">
                        <button class="watch-alert-save" type="button" data-alert-save="${escapeHtml(item.id)}" ${validation.ok ? '' : 'disabled'} aria-label="Alert-ის შენახვა">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"></path><path d="M17 21v-8H7v8"></path><path d="M7 3v5h8"></path></svg>
                        </button>
                        <button class="watch-alert-close" type="button" data-alert-close="${escapeHtml(item.id)}" aria-label="Alert-ის დახურვა">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                        </button>
                    </span>
                </div>
                <span class="watch-alert-status ${validation.ok ? 'ok' : ''}">${escapeHtml(validation.message)}</span>
            </div>
        `;
    }

    function searchItemHtml(item) {
        const selected = watchlist.some(saved => saved.id === item.id);
        return `
            <button class="watch-result-row" type="button" data-watch-id="${escapeHtml(item.id)}">
                ${logoBlock(item)}
                <span class="watch-result-copy">
                    <strong>${escapeHtml(item.title)}</strong>
                    <small>${escapeHtml(displaySubtitle(item, 'search'))}</small>
                </span>
                <span class="watch-result-value">${valueHtml(item)}</span>
                ${companyMetaHtml(item)}
                <span class="watch-change ${escapeHtml(item.changeClass)}">${escapeHtml(item.change)}</span>
                <span class="watch-star${selected ? ' active' : ''}" aria-label="watchlist">★</span>
            </button>
        `;
    }

    function renderDropdown() {
        const term = compact(searchInput.value);
        const rows = categories[activeCategory]
            .filter(item => !term || compact(item.search).includes(term))
            .slice(0, 80);
        dropdown.innerHTML = rows.length ? `${companyHeaderHtml()}${rows.map(searchItemHtml).join('')}` : '<p class="watch-empty">მონაცემი ვერ მოიძებნა</p>';
        dropdown.hidden = false;
    }

    function watchItemHtml(item) {
        const flashClass = flashingIds.has(item.id) ? ' watchlist-card-flash' : '';
        const alertState = watchAlerts[item.id];
        const hasAlert = Boolean(alertState);
        const alertCompleted = alertState?.status === 'triggered';
        const editor = openAlertEditorId === item.id ? alertEditorHtml(item) : '';
        const optionsOpen = openOptionsId === item.id ? ' open' : '';
        return `
            <div class="watchlist-entry">
                <article class="watchlist-card${flashClass}" draggable="true" data-watch-id="${escapeHtml(item.id)}">
                    <span class="watch-drag" aria-hidden="true">⋮⋮</span>
                    ${logoBlock(item)}
                    <span class="watch-result-copy">
                        <strong>${escapeHtml(item.title)}</strong>
                        <small>${escapeHtml(displaySubtitle(item, 'watchlist'))}</small>
                    </span>
                    <span class="watch-result-value">${valueHtml(item)}</span>
                    ${companyMetaHtml(item)}
                    <span class="watch-change ${escapeHtml(item.changeClass)}">${escapeHtml(item.change)}</span>
                    <span class="watch-options${optionsOpen}">
                        ${hasAlert ? `<span class="watch-alert-active-bell${alertCompleted ? ' triggered' : ''}" title="${alertCompleted ? 'შესრულებული Alert' : 'აქტიური Alert'}" aria-label="${alertCompleted ? 'შესრულებული Alert' : 'აქტიური Alert'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M13.7 21a2 2 0 0 1-3.4 0"></path></svg></span>` : ''}
                        <button type="button" class="watch-options-btn" aria-label="ფუნქციები">⋯</button>
                        <span class="watch-options-menu">
                            <button type="button" data-alert-create="${escapeHtml(item.id)}" aria-label="Alert-ის შექმნა">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M13.7 21a2 2 0 0 1-3.4 0"></path><path d="M19 2v6"></path><path d="M16 5h6"></path></svg>
                                <span>Alert-ის შექმნა</span>
                            </button>
                            <button type="button" data-alert-view="${escapeHtml(item.id)}" ${hasAlert ? '' : 'disabled'} aria-label="Alert-ის რედაქტირება">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                                <span>Alert-ის რედაქტირება</span>
                            </button>
                            <button type="button" data-alert-remove="${escapeHtml(item.id)}" ${hasAlert ? '' : 'disabled'} aria-label="Alert-ის წაშლა">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M4 4l16 16"></path></svg>
                                <span>Alert-ის წაშლა</span>
                            </button>
                            <button type="button" class="danger" data-watch-delete="${escapeHtml(item.id)}" aria-label="Watchlist-დან წაშლა">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M6 7l1 14h10l1-14"></path><path d="M9 7V4h6v3"></path></svg>
                                <span>Watchlist-დან წაშლა</span>
                            </button>
                        </span>
                    </span>
                </article>
                ${editor}
            </div>
        `;
    }

    function renderWatchlist() {
        watchlistEl.innerHTML = watchlist.length
            ? watchlist.map(watchItemHtml).join('')
            : '<p class="watch-empty watchlist-empty">აირჩიე მონაცემი საძიებო ველიდან და ის აქ გამოჩნდება.</p>';
        if (!dropdown.hidden) renderDropdown();
        if (flashingIds.size) {
            setTimeout(() => {
                flashingIds.clear();
                document.querySelectorAll('.watchlist-card-flash').forEach(card => card.classList.remove('watchlist-card-flash'));
            }, 900);
        }
    }

    function updateAlertStatus(input, item, draft) {
        const panel = input.closest('.watch-alert-panel');
        const status = panel?.querySelector('.watch-alert-status');
        const saveButton = panel?.querySelector('[data-alert-save]');
        const validation = validateAlertDraft(item, draft);
        if (status) {
            status.textContent = validation.message;
            status.classList.toggle('ok', validation.ok);
        }
        if (saveButton) saveButton.disabled = !validation.ok;
    }

    function mergeLiveDataIntoWatchlist() {
        const liveById = new Map(Object.values(categories).flat().map(item => [item.id, item]));
        watchlist = watchlist.map(item => {
            const live = liveById.get(item.id);
            if (!live) return item;
            const next = { ...item, ...live };
            if (valueSignature(item) && valueSignature(item) !== valueSignature(next)) flashingIds.add(item.id);
            return next;
        });
        renderWatchlist();
    }

    async function loadOfficial() {
        const today = new Date().toISOString().split('T')[0];
        const [current, previous] = await Promise.all([
            fetchJson(`${NBG_API}?date=${today}`),
            fetchJson(`${NBG_API}?date=${previousBusinessDate(new Date())}`).catch(() => [])
        ]);
        const previousMap = new Map((previous?.[0]?.currencies || []).map(item => [item.code, item]));
        categories.official = (current?.[0]?.currencies || [])
            .filter(item => item.code && Number.isFinite(Number(item.rate)))
            .map(item => {
                const change = pct(item.rate, previousMap.get(item.code)?.rate);
                return normalizeItem({
                    id: itemId('official', item.code),
                    category: 'official',
                    title: `${item.code} / GEL`,
                    subtitle: currencyMeta[item.code]?.title || item.name || 'ოფიციალური კურსი',
                    logo: flagSrc(item.code),
                    value: Number(item.rate).toFixed(4),
                    change: change.text,
                    changeClass: change.cls,
                    search: `${item.code} ${item.name || ''} ოფიციალური ეროვნული ბანკი`
                });
            })
            .sort((a, b) => {
                const ai = officialPriority.indexOf(a.title.slice(0, 3));
                const bi = officialPriority.indexOf(b.title.slice(0, 3));
                if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                return a.title.localeCompare(b.title, 'ka');
            });
    }

    async function loadCompanyAndMarket() {
        const data = await fetchJson(`${apiOrigin}/api/rates/latest`).catch(() => fetchJson(`${PROD_API}/api/rates/latest`));
        const pairs = [
            ['USDGEL', ['usdBuy', 'USDGEL (Buy)'], ['usdSell', 'USDGEL (Sell)'], 3],
            ['EURGEL', ['eurBuy', 'EURGEL (Buy)'], ['eurSell', 'EURGEL (Sell)'], 3],
            ['GBPGEL', ['gbpBuy', 'GBPGEL (Buy)'], ['gbpSell', 'GBPGEL (Sell)'], 3],
            ['RUBGEL', ['rubBuy', 'RUBGEL (Buy)'], ['rubSell', 'RUBGEL (Sell)'], 4],
            ['TRYGEL', ['tryBuy', 'TRYGEL (Buy)'], ['trySell', 'TRYGEL (Sell)'], 4]
        ];
        const marketRows = Object.fromEntries(pairs.map(([pair]) => [pair, []]));
        categories.company = [];

        data.filter(item => !String(item.company || '').toLowerCase().includes('procredit')).forEach(item => {
            const key = companyKey(item);
            const name = companyNames[key] || item.company || item.Company || key;
            pairs.forEach(([pair, buyKeys, sellKeys, digits]) => {
                const buy = readNumber(item, buyKeys);
                const sell = readNumber(item, sellKeys);
                if (!buy && !sell) return;
                if (buy && sell) marketRows[pair].push({ buy, sell });
                const spread = buy && sell ? sell - buy : null;
                categories.company.push(normalizeItem({
                    id: itemId('company', key, pair),
                    category: 'company',
                    title: name,
                    subtitle: pair.replace('GEL', '/GEL'),
                    logo: companyLogos[key] || 'Logos/logo.jpg',
                    buy: buy ? buy.toFixed(digits) : '-',
                    sell: sell ? sell.toFixed(digits) : '-',
                    spread: Number.isFinite(spread) ? spread.toFixed(digits) : '-',
                    updatedAtText: formatCompanyUpdateTime(item),
                    search: `${name} ${key} ${pair} ყიდვა გაყიდვა`
                }));
            });
        });

        categories.market = pairs.map(([pair, , , digits]) => {
            const rows = marketRows[pair] || [];
            const avgBuy = rows.length ? rows.reduce((sum, row) => sum + row.buy, 0) / rows.length : null;
            const avgSell = rows.length ? rows.reduce((sum, row) => sum + row.sell, 0) / rows.length : null;
            return normalizeItem({
                id: itemId('market', pair),
                category: 'market',
                title: pair.replace('GEL', '/GEL'),
                subtitle: 'საბაზრო საშუალო',
                logo: flagSrc(pair.slice(0, 3)),
                buy: Number.isFinite(avgBuy) ? avgBuy.toFixed(digits) : '-',
                sell: Number.isFinite(avgSell) ? avgSell.toFixed(digits) : '-',
                spread: Number.isFinite(avgBuy) && Number.isFinite(avgSell) ? (avgSell - avgBuy).toFixed(digits) : '-',
                search: `${pair} საბაზრო კურსი`
            });
        }).sort((a, b) => marketOrder.indexOf(a.id.split(':')[1]?.toUpperCase() || '') - marketOrder.indexOf(b.id.split(':')[1]?.toUpperCase() || ''));

        const marketLatest = await fetchJson(MARKET_HISTORY_API).catch(() => fetchJson(MARKET_HISTORY_FALLBACK_API)).catch(() => null);
        if (marketLatest) {
            categories.market = categories.market.map(item => {
                const pair = item.id.split(':')[1]?.toLowerCase();
                const latest = marketLatest[pair];
                const buy = Number(latest?.buy);
                const sell = Number(latest?.sell);
                const spread = Number(latest?.spread);
                if (!Number.isFinite(buy) || !Number.isFinite(sell)) return item;
                return normalizeItem({
                    ...item,
                    buy: buy.toFixed(4),
                    sell: sell.toFixed(4),
                    spread: Number.isFinite(spread) ? spread.toFixed(4) : (sell - buy).toFixed(4)
                });
            });
        }
    }

    function formatUpdateTime(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            const match = String(value || '').match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
            return match ? `${match[1].padStart(2, '0')}:${match[2]}:${(match[3] || '00').padStart(2, '0')}` : '';
        }
        return new Intl.DateTimeFormat('ka-GE', { timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(date);
    }

    function getCompanyTimestampValue(item) {
        return item?.['Update Timestamp']
            || item?.['Update Time']
            || item?.createdAt
            || item?.updatedAt
            || item?.date
            || item?.tbilisiDateString
            || item?.timestamp
            || item?.lastUpdated
            || item?.scrapedAt
            || item?.fetchedAt
            || '';
    }

    function formatCompanyUpdateTime(item) {
        return formatUpdateTime(getCompanyTimestampValue(item));
    }

    async function fetchSheetRows() {
        const raw = await fetchJson(`${apiOrigin}/api/data?t=${Date.now()}`).catch(() => fetchJson(`${PROD_API}/api/data?t=${Date.now()}`));
        if (raw.data && Array.isArray(raw.data)) {
            const headers = raw.data[0] || [];
            return raw.data.slice(1).map(row => Object.fromEntries(headers.map((header, index) => [header, row[index]])));
        }
        return Array.isArray(raw) ? raw : [];
    }

    async function loadForexAndAssets() {
        const rows = await fetchSheetRows();
        const rateMap = new Map();
        rows.forEach(row => {
            [['Pair (Popular)', 'Rate (Popular)']].forEach(([pairKey, rateKey]) => {
                const pair = String(row[pairKey] || '').trim().toUpperCase();
                const rate = Number(row[rateKey]);
                if (pair && Number.isFinite(rate)) rateMap.set(pair, rate);
            });
        });
        const yesterdayForex = await getYesterdayForexMap().catch(() => null);
        categories.forex = Array.from(rateMap.entries()).map(([pair, rate]) => {
            const base = pair.slice(0, 3);
            const quote = pair.slice(3, 6);
            const oldRate = yesterdayForex?.[base] && yesterdayForex?.[quote] ? yesterdayForex[quote] / yesterdayForex[base] : null;
            const change = pct(rate, oldRate);
            return normalizeItem({
            id: itemId('forex', pair),
            category: 'forex',
            title: pair,
            subtitle: `${base}/${quote}`,
            logo: forexLogoSrc(pair),
            value: rate.toFixed(4),
            change: change.text,
            changeClass: change.cls,
            search: `${pair} forex`
        });
        });

        const assetMap = new Map();
        rows.forEach(row => {
            const name = String(row.MEA || '').trim();
            const value = Number(String(row['Rate (MEA)'] || '').replace(/,/g, ''));
            if (name && Number.isFinite(value)) assetMap.set(name.toLowerCase(), value);
        });
        const assetLookup = new Map(assets.map(([name, logo]) => [name.toLowerCase(), logo]));
        const names = rows.map(row => String(row.MEA || '').trim()).filter(Boolean);
        const orderedAssetNames = [...assets.map(([name]) => name), ...names.filter(name => !assetLookup.has(name.toLowerCase()))];
        categories.asset = orderedAssetNames.map(name => normalizeItem({
            id: itemId('asset', name),
            category: 'asset',
            title: name,
            subtitle: 'აქციები და სხვა',
            logo: assetLookup.get(name.toLowerCase()) || 'Logos/logo.jpg',
            value: assetMap.has(name.toLowerCase()) ? `$ ${assetMap.get(name.toLowerCase()).toLocaleString('en-US', { maximumFractionDigits: 3 })}` : '-',
            search: `${name} asset stock commodity`
        })).filter((item, index, self) => self.findIndex(other => other.id === item.id) === index);
    }

    async function getYesterdayForexMap() {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        if (d.getDay() === 0) d.setDate(d.getDate() - 2);
        else if (d.getDay() === 6) d.setDate(d.getDate() - 1);
        const data = await fetchJson(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${d.toISOString().split('T')[0]}/v1/currencies/eur.json`);
        const map = { EUR: 1 };
        Object.entries(data.eur || {}).forEach(([key, value]) => { map[key.toUpperCase()] = value; });
        return map;
    }

    async function loadCrypto() {
        const data = await fetchJson('https://api.binance.com/api/v3/ticker/24hr');
        categories.crypto = data
            .filter(item => item.symbol.endsWith('USDT') && !/(UP|DOWN|BULL|BEAR)USDT$/.test(item.symbol))
            .sort((a, b) => {
                const priority = { BTCUSDT: 1, ETHUSDT: 2 };
                if (priority[a.symbol] || priority[b.symbol]) return (priority[a.symbol] || 999) - (priority[b.symbol] || 999);
                return Number(b.quoteVolume) - Number(a.quoteVolume);
            })
            .slice(0, 100)
            .map(item => {
                const symbol = item.symbol.replace('USDT', '');
                const price = Number(item.lastPrice);
                const change = Number(item.priceChangePercent);
                return normalizeItem({
                    id: itemId('crypto', item.symbol),
                    category: 'crypto',
                    title: `${cryptoNames[symbol] || symbol} (${symbol})`,
                    subtitle: `${symbol}/USDT`,
                    logo: cryptoLogos[symbol] || `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`,
                    value: Number.isFinite(price) ? `$ ${price.toLocaleString('en-US', { maximumFractionDigits: price > 1 ? 2 : 6 })}` : '-',
                    change: Number.isFinite(change) ? `${change > 0 ? '+' : ''}${change.toFixed(2)}%` : '',
                    changeClass: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral',
                    search: `${cryptoNames[symbol] || ''} ${symbol} ${item.symbol}`
                });
            });
    }

    async function loadFuel() {
        const summary = await fetchJson(`${apiOrigin}/api/gas/market-summary`).catch(() => fetchJson(`${PROD_API}/api/gas/market-summary`));
        categories.fuel = (summary.categories || []).map(row => {
            const average = Number(row.average);
            const change = Number(row.changePercent);
            return normalizeItem({
                id: itemId('fuel', row.key || row.label),
                category: 'fuel',
                title: row.label || row.key,
                subtitle: 'საწვავის საშუალო ფასი',
                logo: row.icon || `Logos/gas/categories/${row.key}.svg`,
                value: Number.isFinite(average) ? `${average.toFixed(2)} ₾` : '-',
                change: Number.isFinite(change) ? `${change > 0 ? '+' : ''}${change.toFixed(2)}%` : '',
                changeClass: change < 0 ? 'positive' : change > 0 ? 'negative' : 'neutral',
                search: `${row.label || ''} ${row.key || ''} საწვავი`
            });
        });
    }

    async function loadAllCatalogs() {
        await Promise.allSettled([loadOfficial(), loadCompanyAndMarket(), loadForexAndAssets(), loadCrypto(), loadFuel()]);
        mergeLiveDataIntoWatchlist();
        dropdown.hidden = true;
    }

    setCalendarPeriod('current-week', { silent: true });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.userTab;
            tabs.forEach(item => item.classList.toggle('active', item === tab));
            watchPanel.hidden = target !== 'watchlist';
            calendarPanel.hidden = target !== 'calendar';
            if (searchArea) searchArea.hidden = target !== 'watchlist';
            if (target === 'calendar') dropdown.hidden = true;
            if (target === 'calendar' && !calendarLoaded) loadEconomicCalendar();
        });
    });

    calendarRefreshBtn?.addEventListener('click', () => {
        loadEconomicCalendar(true);
    });

    calendarPeriodButtons.forEach(button => {
        button.addEventListener('click', () => {
            setCalendarPeriod(button.dataset.calendarPeriod || 'current-week');
        });
    });

    calendarCountryInputs.forEach(input => {
        input.addEventListener('change', () => {
            calendarLoaded = false;
            if (calendarPanel && !calendarPanel.hidden) loadEconomicCalendar(true);
        });
    });

    [calendarFromDate, calendarToDate].forEach(input => {
        input?.addEventListener('change', () => {
            activeCalendarPeriod = 'custom';
            calendarPeriodButtons.forEach(button => button.classList.remove('active'));
            calendarLoaded = false;
            if (calendarFromDate?.value && calendarToDate?.value && calendarPanel && !calendarPanel.hidden) {
                loadEconomicCalendar(true);
            }
        });
    });

    categoryButtons.forEach(button => {
        button.addEventListener('click', event => {
            event.stopPropagation();
            activeCategory = button.dataset.category;
            categoryButtons.forEach(item => item.classList.toggle('active', item === button));
            searchInput.value = '';
            renderDropdown();
            setTimeout(() => searchInput.focus(), 0);
        });
    });

    searchInput.addEventListener('input', () => {
        if (!dropdown.hidden) renderDropdown();
    });

    window.addEventListener('storage', event => {
        if (Object.values(MAIN_CACHE_KEYS).includes(event.key)) applyMainPageCaches(true);
    });

    cryptoWatchlistChannel?.addEventListener('message', event => {
        if (event.data?.type !== 'crypto:update') return;
        if (applyCryptoRows(event.data.liveMap || event.data.data, true) && !openOptionsId && !openAlertEditorId) renderWatchlist();
    });

    setInterval(() => {
        if (!document.hidden) applyMainPageCaches(true);
    }, 3000);

    setInterval(async () => {
        if (document.hidden) return;
        const before = JSON.stringify(watchAlerts);
        await loadWatchAlerts();
        if (JSON.stringify(watchAlerts) !== before && !openOptionsId && !openAlertEditorId) renderWatchlist();
    }, 60 * 1000);

    document.addEventListener('click', event => {
        if (!event.target.closest('.watch-search-area')) dropdown.hidden = true;
        if (!event.target.closest('.watch-options')) {
            openOptionsId = '';
            document.querySelectorAll('.watch-options.open').forEach(menu => menu.classList.remove('open'));
        }
    });

    dropdown.addEventListener('click', async event => {
        const row = event.target.closest('.watch-result-row');
        if (!row) return;
        const item = categories[activeCategory].find(candidate => candidate.id === row.dataset.watchId);
        if (!item) return;
        const index = watchlist.findIndex(saved => saved.id === item.id);
        if (index >= 0) watchlist.splice(index, 1);
        else watchlist.push(item);
        renderWatchlist();
        await saveWatchlist();
    });

    watchlistEl.addEventListener('click', async event => {
        const optionsBtn = event.target.closest('.watch-options-btn');
        const deleteBtn = event.target.closest('[data-watch-delete]');
        const alertCreateBtn = event.target.closest('[data-alert-create]');
        const alertViewBtn = event.target.closest('[data-alert-view]');
        const alertRemoveBtn = event.target.closest('[data-alert-remove]');
        const alertTypeBtn = event.target.closest('[data-alert-type]');
        const alertSideSelect = event.target.closest('[data-alert-side]');
        const alertSaveBtn = event.target.closest('[data-alert-save]');
        const alertCloseBtn = event.target.closest('[data-alert-close]');
        if (optionsBtn) {
            event.stopPropagation();
            const card = optionsBtn.closest('.watchlist-card');
            const id = card?.dataset.watchId || '';
            openOptionsId = openOptionsId === id ? '' : id;
            renderWatchlist();
            return;
        }
        if (alertCreateBtn || alertViewBtn) {
            event.stopPropagation();
            const id = (alertCreateBtn || alertViewBtn).dataset.alertCreate || (alertCreateBtn || alertViewBtn).dataset.alertView;
            if (alertViewBtn?.disabled) return;
            openAlertEditorId = id;
            alertDraftFor(watchlist.find(candidate => candidate.id === id) || id);
            openOptionsId = '';
            renderWatchlist();
            const input = watchlistEl.querySelector(`[data-alert-value="${CSS.escape(id)}"]`);
            if (input && !input.disabled) setTimeout(() => input.focus(), 0);
            return;
        }
        if (alertRemoveBtn) {
            event.stopPropagation();
            if (alertRemoveBtn.disabled) return;
            const id = alertRemoveBtn.dataset.alertRemove;
            saveStatus.textContent = 'Alert იშლება...';
            try {
                await deleteAlertFromApi(id);
                delete alertDrafts[id];
                if (openAlertEditorId === id) openAlertEditorId = '';
                saveStatus.textContent = 'Alert წაშლილია';
                setTimeout(() => { if (saveStatus.textContent === 'Alert წაშლილია') saveStatus.textContent = ''; }, 1400);
                openOptionsId = '';
                renderWatchlist();
            } catch (error) {
                saveStatus.textContent = error.message || 'Alert-ის წაშლა ვერ მოხერხდა';
            }
            return;
        }
        if (alertSideSelect) {
            event.stopPropagation();
            return;
        }
        if (alertTypeBtn) {
            event.stopPropagation();
            const panel = alertTypeBtn.closest('.watch-alert-panel');
            const id = panel?.dataset.alertEditor;
            const item = watchlist.find(candidate => candidate.id === id);
            if (!item) return;
            const draft = alertDraftFor(item);
            draft.type = alertTypeBtn.dataset.alertType;
            draft.target = cleanAlertTarget(draft.target, draft.type);
            renderWatchlist();
            const input = watchlistEl.querySelector(`[data-alert-value="${CSS.escape(id)}"]`);
            if (input) setTimeout(() => input.focus(), 0);
            return;
        }
        if (alertSaveBtn) {
            event.stopPropagation();
            const id = alertSaveBtn.dataset.alertSave;
            const item = watchlist.find(candidate => candidate.id === id);
            const draft = item ? alertDraftFor(item) : null;
            if (!item || !draft) return;
            const input = watchlistEl.querySelector(`[data-alert-value="${CSS.escape(id)}"]`);
            if (input) {
                draft.target = cleanAlertTarget(input.value, draft.type);
                input.value = draft.target;
            }
            const validation = validateAlertDraft(item, draft);
            if (!validation.ok) {
                if (input) updateAlertStatus(input, item, draft);
                return;
            }
            const rawTarget = draft.target;
            draft.target = formatAlertTarget(draft.target, item, draft.type);
            saveStatus.textContent = 'Alert ინახება...';
            try {
                await saveAlertToApi(item, draft);
                openAlertEditorId = '';
                saveStatus.textContent = 'Alert შენახულია';
                setTimeout(() => { if (saveStatus.textContent === 'Alert შენახულია') saveStatus.textContent = ''; }, 1400);
                renderWatchlist();
            } catch (error) {
                draft.target = rawTarget;
                if (input) {
                    input.value = rawTarget;
                    const panel = input.closest('.watch-alert-panel');
                    const status = panel?.querySelector('.watch-alert-status');
                    if (status) {
                        status.textContent = error.message || 'Alert-ის შენახვა ვერ მოხერხდა';
                        status.classList.remove('ok');
                    }
                }
                saveStatus.textContent = '';
            }
            return;
        }
        if (alertCloseBtn) {
            event.stopPropagation();
            const id = alertCloseBtn.dataset.alertClose;
            delete alertDrafts[id];
            openAlertEditorId = '';
            renderWatchlist();
            return;
        }
        if (deleteBtn) {
            watchlist = watchlist.filter(item => item.id !== deleteBtn.dataset.watchDelete);
            await deleteAlertFromApi(deleteBtn.dataset.watchDelete).catch(() => {});
            delete alertDrafts[deleteBtn.dataset.watchDelete];
            renderWatchlist();
            await saveWatchlist();
        }
    });

    watchlistEl.addEventListener('input', event => {
        const input = event.target.closest('[data-alert-value]');
        if (!input) return;
        const item = watchlist.find(candidate => candidate.id === input.dataset.alertValue);
        if (!item) return;
        const draft = alertDraftFor(item);
        input.value = cleanAlertTarget(input.value, draft.type);
        draft.target = input.value;
        updateAlertStatus(input, item, draft);
    });

    watchlistEl.addEventListener('blur', event => {
        const input = event.target.closest('[data-alert-value]');
        if (!input) return;
        const item = watchlist.find(candidate => candidate.id === input.dataset.alertValue);
        if (!item) return;
        const draft = alertDraftFor(item);
        draft.target = formatAlertTarget(input.value, item, draft.type);
        input.value = draft.target;
        updateAlertStatus(input, item, draft);
    }, true);

    watchlistEl.addEventListener('change', event => {
        const select = event.target.closest('[data-alert-side]');
        if (!select) return;
        const item = watchlist.find(candidate => candidate.id === select.dataset.alertSide);
        if (!item) return;
        const draft = alertDraftFor(item);
        draft.side = select.value;
        renderWatchlist();
    });

    watchlistEl.addEventListener('dragstart', event => {
        const card = event.target.closest('.watchlist-card');
        if (!card) return;
        draggedId = card.dataset.watchId;
        card.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'move';
    });
    watchlistEl.addEventListener('dragend', event => {
        event.target.closest('.watchlist-card')?.classList.remove('dragging');
        draggedId = '';
    });
    watchlistEl.addEventListener('dragover', event => {
        event.preventDefault();
        const target = event.target.closest('.watchlist-card');
        if (!target || target.dataset.watchId === draggedId) return;
        const draggedIndex = watchlist.findIndex(item => item.id === draggedId);
        const targetIndex = watchlist.findIndex(item => item.id === target.dataset.watchId);
        if (draggedIndex < 0 || targetIndex < 0) return;
        const [item] = watchlist.splice(draggedIndex, 1);
        watchlist.splice(targetIndex, 0, item);
        renderWatchlist();
    });
    watchlistEl.addEventListener('drop', async event => {
        event.preventDefault();
        await saveWatchlist();
    });

    try {
        await apiFetch('/api/auth/me');
        await loadWatchAlerts();
        await loadSavedWatchlist();
        await loadAllCatalogs();
        applyMainPageCaches(false);
    } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = localHref('/');
    }
});
