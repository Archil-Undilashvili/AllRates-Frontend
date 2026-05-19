
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

const API_MFO_URL = 'https://sheets-api-production-c989.up.railway.app/api/data';
const API_GAS_URL = 'https://allrates-backend-api-production.up.railway.app/api/gas/latest';
const CACHE_INTL_RATES_HTML_KEY = 'cachedIntlRatesHtml_v2';
const CACHE_POPULAR_ASSETS_HTML_KEY = 'cachedPopularAssetsHtml_v2';
const HOME_GAS_CACHE_KEY = 'allrates_home_gas_market_cache_v1';
        const API_BANKS_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AWDtjMWFvbEgN6VC6wxI7pN9ABktXkqPN7bGMwsIYTLiCaWN4RieM33AZbs8-qa8HEDeftgFpcn-xFFPzwRSaTgjgRterE2f47ma1nXbsnHqRmyv3qqRUMcoK7bahbIzBU_73IYXskTCuokqU9ASX-yjm1xliNjC7W5CizWaijDgyoNmiB5-6hUsmGPO1wvrVcnBCp2ksgioARRQyHhKY31wcHxhT1kVD_E-qjxhMSAuplX7ZceMfMGKWPatecLm8K4G5KP7AjaRKvtVWWLD9LIwZtTTmE6fGg&lib=M-V5mEnEclei2QLgjN86iAykVBAJz9-Q8';
        const API_NBG_URL = 'https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json';
        
        // კატეგორიები
        const ALL_COMPANIES = ['rico', 'valuto', 'kursige', 'crystal', 'bog', 'tbc', 'liberty', 'bb', 'credo', 'cartu', 'inex', 'giro', 'goa', 'hash', 'mbc', 'tera', 'halyk', 'is', 'silk', 'procredit', 'leader', 'paysera'];
        const BANK_COMPANIES = ['bog', 'tbc', 'liberty', 'bb', 'credo', 'cartu', 'hash', 'tera', 'halyk', 'is', 'silk', 'procredit', 'crystal', 'mbc'];
        const MFO_COMPANIES = ['rico', 'inex', 'giro', 'goa', 'leader'];
        const KIOSK_COMPANIES = ALL_COMPANIES.filter(company => !BANK_COMPANIES.includes(company) && !MFO_COMPANIES.includes(company));

        let currentTab = localStorage.getItem('allrates_current_tab') || 'all';

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
                const res = await fetch('https://formsubmit.co/ajax/info@allrates.ge', {
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
        'giro': 'გირო კრედიტი',
        'goa': 'გოა კრედიტი',
        'hash': 'ჰაშ ბანკი',
        'mbc': 'ემბისი',
        'tera': 'ტერაბანკი',
        'halyk': 'ხალიკ ბანკი',
        'is': 'იშბანკი',
        'silk': 'სილქ ბანკი',
        'procredit': 'პროკრედიტ ბანკი',
        'leader': 'ლიდერ კრედიტი',
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
        'inex': 'http://ge.inteliexpress.net/',
        'giro': 'https://girocredit.ge/',
        'goa': 'https://goacredit.ge/',
        'hash': 'https://hashbank.ge/ka',
        'mbc': 'https://mbc.com.ge/',
        'tera': 'https://terabank.ge/ka/retail',
        'halyk': 'https://halykbank.ge/ka/individuals',
        'is': 'http://isbank.ge/ka/individual',
        'silk': 'https://silkbank.ge/',
        'paysera': 'https://www.paysera.ge/v2/ka-GE/index',
        'procredit': 'https://procreditbank.ge/',
        'leader': 'https://leadercredit.ge/'
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
            'giro': 'Logos/giro_icon.png',
            'goa': 'Logos/goa_icon.png',
            'hash': 'Logos/hash_icon.ico',
            'mbc': 'Logos/mbc_icon.png',
            'tera': 'Logos/tera_icon.png',
            'halyk': 'Logos/halyk_icon.png',
            'is': 'Logos/is_icon.png',
            'silk': 'Logos/silk_icon.png',
            'procredit': 'Logos/procredit.jpg',
            'leader': 'Logos/leader.jpg',
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

        
        async function fetchRates() {
            fetchNBG();
            fetchCrypto();
            fetchHomeGasMarketPrices();
                        // fetchCommodities();
            
            try {
                // Fetch unified API (MFOs and Banks together)
                const resAll = await fetch(API_MFO_URL).catch(() => null);
                
                let combinedData = [];

                if (resAll && resAll.ok) {
                    let rawData = await resAll.json();
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
                                                <div style="display: flex; align-items: center; margin-right: 12px; position: relative; min-width: 40px; justify-content: center;">
                                                    <img src="https://flagcdn.com/w40/${flag1}.png" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover; border: 2px solid #fff; z-index: 2; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                                    <img src="https://flagcdn.com/w40/${flag2}.png" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover; border: 2px solid #fff; z-index: 1; margin-left: -12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
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

                                        cont.innerHTML += `
                                            <div class="intl-rate-item">
                                                <span class="intl-pair" style="display: flex; align-items: center;">${logoHtml}${pairName}</span>
                                                <span class="intl-value">${displayRate} ${changeHtml}</span>
                                            </div>
                                        `;
                                    });
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
                                                <div style="display: flex; align-items: center; margin-right: 12px; position: relative; min-width: 40px; justify-content: center;">
                                                    <img src="https://flagcdn.com/w40/${flag1}.png" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover; border: 2px solid #fff; z-index: 2; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                                    <img src="https://flagcdn.com/w40/${flag2}.png" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover; border: 2px solid #fff; z-index: 1; margin-left: -12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
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

                                        cont.innerHTML += `
                                            <div class="intl-rate-item">
                                                <span class="intl-pair" style="display: flex; align-items: center;">${logoHtml}${pairName}</span>
                                                <span class="intl-value">${displayRate}</span>
                                            </div>
                                        `;
                                    });
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
                    const newApiRes = await fetch('https://allrates-backend-api-production.up.railway.app/api/rates/latest');
                    if (newApiRes.ok) {
                        const rawNewData = await newApiRes.json();
                        newApiData = rawNewData.map(item => {
                            let base = item.company.split(' ')[0].toLowerCase();
                            if (base === 'isbank') base = 'is';
                            if (base === 'terabank') base = 'tera';
                            if (base === 'inteliexpress' || base === 'inteli' || item.company.toLowerCase().includes('inex')) base = 'inex';
                            if (base === 'cartubank') base = 'cartu';
                            if (base === 'hashbank') base = 'hash';
                            if (base === 'basisbank') base = 'bb';
                            if (base === 'procredit') base = 'procredit';
                            if (base === 'leader') base = 'leader';
                            
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
                                'Update Time': item.tbilisiDateString || item.createdAt
                            };
                        });
                    }
                } catch(e) { console.error("New API fetch failed:", e); }

                originalData = newApiData.length > 0 ? newApiData : combinedData.filter(item => item.Company && ALL_COMPANIES.includes(item.Company.toLowerCase()));

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
                        return !isNaN(buy) && !isNaN(sell);
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
                
                // Cache data for instant loading next time
                localStorage.setItem('cachedRatesData', JSON.stringify(originalData));

                setDisplay('loader', 'none');
            } catch (error) {
                console.error('შეცდომა:', error);
                setDisplay('loader', 'none');
                setDisplay('error-msg', 'block'); const el = document.getElementById('error-msg'); if (el) el.innerText += ' ' + error.message;
            }
        }

        function renderHomePage() {
            if (originalData.length === 0) return;

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
                    return { buy, sell, spread };
                }).filter(item => !isNaN(item.buy) && !isNaN(item.sell) && !isNaN(item.spread) && item.spread !== Infinity);

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
                setInnerText(`home-${currency}-market-buy`, isNaN(stats.avgBuy) ? '--.---' : stats.avgBuy.toFixed((currency === 'rub' || currency === 'try') ? 4 : 3));
                setInnerText(`home-${currency}-market-sell`, isNaN(stats.avgSell) ? '--.---' : stats.avgSell.toFixed((currency === 'rub' || currency === 'try') ? 4 : 3));
                setInnerText(`home-${currency}-market-spread`, isNaN(stats.avgSpread) ? '--.---' : stats.avgSpread.toFixed((currency === 'rub' || currency === 'try') ? 4 : 3));

                // Removed best bank/mfo from home

            }

            ['usd', 'eur', 'gbp', 'rub', 'try'].forEach(currency => {
                const stats = calculateStats(currency);
                updateDom(currency, stats);
            });
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

        async function fetchCrypto() {
            try {
                const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
                if (!res.ok) return;
                const data = await res.json();

                const cryptoData = data
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
                            logo: getCryptoLogo(symbol)
                        };
                    });

                renderCryptoList(cryptoData);
                localStorage.setItem('cachedCryptoData', JSON.stringify(cryptoData));
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
                const logoHtml = item.logo
                    ? `<img src="${item.logo}" alt="${item.symbol}" class="crypto-token-logo" onerror="this.outerHTML='<span class=&quot;crypto-token-initial&quot;>${item.symbol.charAt(0)}</span>';">`
                    : `<span class="crypto-token-initial">${item.symbol.charAt(0)}</span>`;

                return `
                    <div class="intl-rate-item crypto-rate-item">
                        <span class="intl-pair crypto-token-name" data-crypto-search="${`${item.name} ${item.symbol}`.toLowerCase()}">
                            ${logoHtml}
                            <span>${item.name} (${item.symbol})</span>
                        </span>
                        <span class="intl-value">$ ${item.price} <span style="color: ${changeColor}; font-size: 0.65em; margin-left: 8px;">${changeText}</span></span>
                    </div>
                `;
            }).join('');
            filterMarketList('crypto-rates-list', document.getElementById('crypto-search-input')?.value || '');
        }

        const HOME_GAS_CATEGORIES = [
            {
                label: 'სუპერი',
                match: text => (text.includes('სუპერ') || text.includes('super')) && !text.includes('premium') && !text.includes('პრემიუმ')
            },
            {
                label: 'პრემიუმი',
                match: text => text.includes('პრემიუმ') || text.includes('premium') || text.includes('avangard')
            },
            {
                label: 'რეგულარი',
                match: text => text.includes('რეგულარ') || text.includes('regular')
            },
            {
                label: 'დიზელი',
                match: text => text.includes('დიზელ') || text.includes('diesel')
            },
            {
                label: 'თხევადი გაზი',
                match: text => (text.includes('თხევად') || text.includes('გაზი') || text.includes('აირი')) && !text.includes('ბუნებრივ')
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
                        .filter(price => category.match(`${price.product || ''} ${price.productEng || ''} ${price.code || ''}`.toLowerCase()))
                        .map(getHomeGasComparablePrice)
                        .filter(value => Number.isFinite(value) && value > 0);

                    if (companyCategoryPrices.length) {
                        companyBestPrices.push(Math.min(...companyCategoryPrices));
                    }
                });

                const average = companyBestPrices.length
                    ? companyBestPrices.reduce((sum, value) => sum + value, 0) / companyBestPrices.length
                    : null;

                return { label: category.label, average };
            });

            container.innerHTML = rows.map(row => `
                <div class="intl-rate-item home-gas-rate-item" data-market-search="${row.label.toLowerCase()}">
                    <span class="intl-pair home-gas-pair">${row.label}</span>
                    <span class="intl-value home-gas-value">${row.average ? `${row.average.toFixed(2)} ₾` : '- - -'}</span>
                </div>
            `).join('');
        }

        async function fetchHomeGasMarketPrices() {
            const container = document.getElementById('home-gas-rates-list');
            if (!container) return;
            let hasCachedGas = false;

            try {
                const cached = JSON.parse(localStorage.getItem(HOME_GAS_CACHE_KEY) || 'null');
                if (Array.isArray(cached?.records) && cached.records.length) {
                    renderHomeGasMarketPrices(cached.records);
                    hasCachedGas = true;
                }
            } catch {
                localStorage.removeItem(HOME_GAS_CACHE_KEY);
            }

            try {
                const response = await fetch(API_GAS_URL, { headers: { accept: 'application/json' } });
                if (!response.ok) throw new Error(`Gas API error: ${response.status}`);

                const records = await response.json();
                renderHomeGasMarketPrices(records);
                localStorage.setItem(HOME_GAS_CACHE_KEY, JSON.stringify({ records, updatedAt: Date.now() }));
            } catch (error) {
                console.error('საწვავის საბაზრო ფასების ჩატვირთვის შეცდომა:', error);
                if (!hasCachedGas) {
                    container.innerHTML = `
                        <div class="intl-rate-item home-gas-rate-item">
                            <span class="intl-pair">საწვავის ფასები</span>
                            <span class="intl-value">- - -</span>
                        </div>
                    `;
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
                    let cacheData = { date: dateStr };
                    
                    ['USD', 'EUR', 'GBP', 'CHF', 'RUB', 'TRY', 'AMD', 'AZN', 'ILS'].forEach(code => {
                        const obj = currencies.find(c => c.code === code);
                        if (obj) {
                            const val = obj.rate.toFixed(4);
                            cacheData[code.toLowerCase()] = val;
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
                        changeClass: change === null ? 'home-official-change-neutral' : change > 0 ? 'home-official-change-positive' : change < 0 ? 'home-official-change-negative' : 'home-official-change-neutral'
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
                        ${item.logo ? `<img src="${item.logo}" alt="${item.code} Flag" loading="lazy" onerror="this.style.display='none'">` : ''}
                        <span>${item.title}</span>
                    </div>
                    <div class="rates-flex home-official-rate-row">
                        <div class="rate-block home-official-rate-block">
                            <div class="rate-label">კურსი</div>
                            <div class="home-official-values">
                                <span class="rate-value buy">${item.rate}</span>
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
                        date: queryDate,
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
            const cacheId = `${type}_${pair}_${period}`;
            if (nbgChartState.dataCache[cacheId]) return nbgChartState.dataCache[cacheId];

            const cacheKey = `cachedNbgChart_${cacheId}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    nbgChartState.dataCache[cacheId] = parsed;
                    return parsed;
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
                values: points.map(point => point.value)
            };

            if (data.values.length) {
                nbgChartState.dataCache[cacheId] = data;
                localStorage.setItem(cacheKey, JSON.stringify(data));
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

            const modal = document.getElementById('home-chart-modal');
            const modalClose = document.getElementById('home-chart-modal-close');

            Object.keys(nbgChartMeta).forEach(type => {
                const panel = document.getElementById(nbgChartMeta[type].inlinePanelId);
                if (panel) panel.addEventListener('click', () => openNbgChartModal(type));

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

        function switchTab(tab) {
            currentTab = tab;
            localStorage.setItem('allrates_current_tab', tab);
            
            // ღილაკების ვიზუალის განახლება
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`).classList.add('active');

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
                    const k = currency === 'usd' ? 'USDGEL (Buy)' : currency === 'eur' ? 'EURGEL (Buy)' : currency === 'gbp' ? 'GBPGEL (Buy)' : currency === 'rub' ? 'RUBGEL (Buy)' : 'TRYGEL (Buy)';
                    const vA = parseFloat(a[k]) || 0;
                    const vB = parseFloat(b[k]) || 0;
                    return (vA - vB) * isAsc;
                } else if (config.column === 'sell') {
                    const k = currency === 'usd' ? 'USDGEL (Sell)' : currency === 'eur' ? 'EURGEL (Sell)' : currency === 'gbp' ? 'GBPGEL (Sell)' : currency === 'rub' ? 'RUBGEL (Sell)' : 'TRYGEL (Sell)';
                    const vA = parseFloat(a[k]) || Infinity;
                    const vB = parseFloat(b[k]) || Infinity;
                    return (vA - vB) * isAsc;
                } else if (config.column === 'spread') {
                    const k = currency === 'usd' ? 'usdSpread' : currency === 'eur' ? 'eurSpread' : currency === 'gbp' ? 'gbpSpread' : currency === 'rub' ? 'rubSpread' : 'trySpread';
                    const vA = parseFloat(a[k]) || Infinity;
                    const vB = parseFloat(b[k]) || Infinity;
                    return (vA - vB) * isAsc;
                }
                return 0;
            });

            renderTable(currency);
            updateHeadersUI(currency);
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

            // ვფილტრავთ არჩეული გვერდის (Tab) მიხედვით
            let dataToRender = dataArr.filter(item => {
                const comp = item.baseCompany || item.Company.toLowerCase();
                let matchTab = false;
                if (currentTab === 'all') matchTab = true;
                else if (currentTab === 'banks') matchTab = BANK_COMPANIES.includes(comp);
                else if (currentTab === 'mfo') matchTab = MFO_COMPANIES.includes(comp);
                else if (currentTab === 'kiosks') matchTab = KIOSK_COMPANIES.includes(comp);
                
                if (!matchTab) return false;

                if (currency === 'gbp' || currency === 'rub' || currency === 'try') {
                    let buy = currency === 'gbp' ? parseFloat(item['GBPGEL (Buy)']) : currency === 'rub' ? parseFloat(item['RUBGEL (Buy)']) : parseFloat(item['TRYGEL (Buy)']);
                    let sell = currency === 'gbp' ? parseFloat(item['GBPGEL (Sell)']) : currency === 'rub' ? parseFloat(item['RUBGEL (Sell)']) : parseFloat(item['TRYGEL (Sell)']);
                    if (isNaN(buy) || isNaN(sell) || buy === 0 || sell === 0) return false;
                }
                return true;
            });

            if (dataToRender.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="empty-message">ჯერჯერობით მონაცემები არ არის</td></tr>`;
                setInnerText(`${currency}-market-buy`, '- - -');
                setInnerText(`${currency}-market-sell`, '- - -');
                setInnerText(`${currency}-market-spread`, '- - -');
                return;
            }

            // საუკეთესო კურსების პოვნა მიმდინარე ტაბისთვის
            let bestBuy = -Infinity;
            let bestSell = Infinity;

            dataToRender.forEach(item => {
                let buy = currency === 'usd' ? parseFloat(item['USDGEL (Buy)']) : currency === 'eur' ? parseFloat(item['EURGEL (Buy)']) : currency === 'gbp' ? parseFloat(item['GBPGEL (Buy)']) : currency === 'rub' ? parseFloat(item['RUBGEL (Buy)']) : parseFloat(item['TRYGEL (Buy)']);
                let sell = currency === 'usd' ? parseFloat(item['USDGEL (Sell)']) : currency === 'eur' ? parseFloat(item['EURGEL (Sell)']) : currency === 'gbp' ? parseFloat(item['GBPGEL (Sell)']) : currency === 'rub' ? parseFloat(item['RUBGEL (Sell)']) : parseFloat(item['TRYGEL (Sell)']);
                if (!isNaN(buy) && buy > bestBuy) bestBuy = buy;
                if (!isNaN(sell) && sell < bestSell) bestSell = sell;
            });

            // Calculate averages for this tab (Top 10)
            let validForAvg = dataToRender.map(item => {
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

                let buyDisplay = isNaN(buy) ? '<span style="display:inline-block; padding: 2px 8px; background: rgba(255,255,255,0.08); color: #94a3b8; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 1px;">- - -</span>' : (buy === bestBuy ? `${buy.toFixed((currency === 'rub' || currency === 'try') ? 4 : 3)}<span class="best-dot" title="საუკეთესო კურსი"></span>` : buy.toFixed((currency === 'rub' || currency === 'try') ? 4 : 3));
                let sellDisplay = isNaN(sell) ? '<span style="display:inline-block; padding: 2px 8px; background: rgba(255,255,255,0.08); color: #94a3b8; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 1px;">- - -</span>' : (sell === bestSell ? `${sell.toFixed((currency === 'rub' || currency === 'try') ? 4 : 3)}<span class="best-dot" title="საუკეთესო კურსი"></span>` : sell.toFixed((currency === 'rub' || currency === 'try') ? 4 : 3));
                let spreadDisplay = (isNaN(spread) || spread === Infinity) ? '<span style="display:inline-block; padding: 2px 8px; background: rgba(255,255,255,0.08); color: #94a3b8; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 1px;">- - -</span>' : spread.toFixed((currency === 'rub' || currency === 'try') ? 4 : 3);

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
                    <td class="buy">${buyDisplay}</td>
                    <td class="sell">${sellDisplay}</td>
                    <td class="spread">${spreadDisplay}</td>
                    <td class="info-cell"><button class="btn-info-icon" onclick="event.preventDefault(); openCompanyInfo('${companyKey}', '${compNameKa}')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></button></td>
                `;
                
                tbody.appendChild(tr);
            });

            // Display market averages based on top 10
            const avgBuyDom = countAvg > 0 ? (totalBuyAvg / countAvg).toFixed((currency === 'rub' || currency === 'try') ? 4 : 3) : '- - -';
            const avgSellDom = countAvg > 0 ? (totalSellAvg / countAvg).toFixed((currency === 'rub' || currency === 'try') ? 4 : 3) : '- - -';
            const avgSpreadDom = countAvg > 0 ? ((totalSellAvg / countAvg) - (totalBuyAvg / countAvg)).toFixed((currency === 'rub' || currency === 'try') ? 4 : 3) : '- - -';
            
            setInnerText(`${currency}-market-buy`, avgBuyDom);
            setInnerText(`${currency}-market-sell`, avgSellDom);
            setInnerText(`${currency}-market-spread`, avgSpreadDom);
            
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
                }

                const cachedPopularAssetsHtml = localStorage.getItem(CACHE_POPULAR_ASSETS_HTML_KEY);
                const popularAssetsContainer = document.getElementById('popular-assets-list');
                if (cachedPopularAssetsHtml && popularAssetsContainer) {
                    popularAssetsContainer.innerHTML = cachedPopularAssetsHtml;
                }

                // Load main rates
                const cachedRates = localStorage.getItem('cachedRatesData');
                if (cachedRates) {
                    originalData = JSON.parse(cachedRates);
                    usdData = [...originalData]; applySorting("usd");
                    eurData = [...originalData]; applySorting("eur");
                gbpData = [...originalData]; applySorting("gbp");
                rubData = [...originalData]; applySorting("rub");
                tryData = [...originalData]; applySorting("try");
                    
                    
                    renderHomePage();
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
                }
            } catch (err) {
                console.error("ქეშის ჩატვირთვის შეცდომა:", err);
            }
        }

        
        loadCachedData(); // Load cached numbers instantly
        fetchRates();     // Fetch fresh numbers silently


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
    'bog': { fullName: 'სს "საქართველოს ბანკი"', branches: ['გაგარინის ქ. 29ა (სათაო ოფისი)', 'პუშკინის ქ. 5/7', 'ჭავჭავაძის გამზ. 74', 'წერეთლის გამზ. 112', '+ 100-ზე მეტი ფილიალი მთელ საქართველოში'], mapUrl: 'https://bankofgeorgia.ge/ka/retail/branches' },
    'tbc': { fullName: 'სს "თიბისი ბანკი"', branches: ['მარჯანიშვილის ქ. 7 (სათაო ოფისი)', 'რუსთაველის გამზ. 24', 'ჭავჭავაძის გამზ. 11', 'პეკინის გამზ. 14', '+ 100-ზე მეტი ფილიალი'], mapUrl: 'https://www.tbcbank.ge/web/ka/web/guest/branch-network' },
    'liberty': { fullName: 'სს "ლიბერთი ბანკი"', branches: ['ჭავჭავაძის გამზ. 74 (სათაო ოფისი)', 'აღმაშენებლის გამზ. 86', 'ვაჟა-ფშაველას გამზ. 70', 'რუსთაველის გამზ. 14', '+ 300-მდე ფილიალი'], mapUrl: 'https://libertybank.ge/ka/faq/geografia' },
    'bb': { fullName: 'სს "ბაზისბანკი"', branches: ['ქეთევან წამებულის გამზ. 1 (სათაო ოფისი)', 'რუსთაველის გამზ. 30', 'ყაზბეგის გამზ. 14', 'ჭავჭავაძის გამზ. 37'], mapUrl: 'https://www.basisbank.ge/ka/branches' },
    'credo': { fullName: 'სს "კრედო ბანკი"', branches: ['რ. თაბუკაშვილის ქ. 27 (სათაო ოფისი)', 'წერეთლის გამზ. 73', 'აღმაშენებლის ხეივანი მე-12 კმ', 'ყაზბეგის გამზ. 14ა', '+ 80-ზე მეტი ფილიალი'], mapUrl: 'https://credobank.ge/branches/' },
    'cartu': { fullName: 'სს "ბანკი ქართუ"', branches: ['ჭავჭავაძის გამზ. 39ა (სათაო ოფისი)', 'აღმაშენებლის გამზ. 138', 'პეკინის გამზ. 14', 'წერეთლის გამზ. 112'], mapUrl: 'https://cartubank.ge/ka/branches' },
    'tera': { fullName: 'სს "ტერაბანკი"', branches: ['წმინდა ქეთევან დედოფლის გამზ. 3 (სათაო)', 'ჭავჭავაძის გამზ. 29', 'ყაზბეგის გამზ. 14', 'მელიქიშვილის გამზ. 17'], mapUrl: 'https://terabank.ge/ka/retail/contact' },
    'halyk': { fullName: 'სს "ხალიკ ბანკი საქართველო"', branches: ['შარტავას ქ. 40 (სათაო ოფისი)', 'კოსტავას ქ. 14', 'აღმაშენებლის გამზ. 137', 'ყაზბეგის გამზ. 24'], mapUrl: 'https://halykbank.ge/ka/individuals/branches' },
    'is': { fullName: 'სს "იშბანკი საქართველო"', branches: ['აღმაშენებლის გამზ. 140/ბ (სათაო)', 'ჭავჭავაძის გამზ. 74', 'ბათუმი, გოგებაშვილის ქ. 32'], mapUrl: 'http://isbank.ge/ka/individual/branches' },
    'silk': { fullName: 'სს "სილქ ბანკი"', branches: ['ზაარბრიუკენის მოედანი 2 (სათაო ოფისი)', 'წინანდლის ქ. 9'], mapUrl: 'https://silkbank.ge/contact/' },
    'paysera': { fullName: 'სს "პეისერა საქართველო"', branches: ['ბელიაშვილის ქ. 106 (სათაო ოფისი)'], mapUrl: 'https://www.paysera.ge/v2/ka-GE/contacts' },
    'crystal': { fullName: 'სს "მიკრობანკი კრისტალი"', branches: ['წერეთლის გამზ. 116 (სათაო)', 'ალ. ყაზბეგის გამზ. 15', 'პეკინის გამზ. 14', '+ 50-ზე მეტი ფილიალი'], mapUrl: 'https://crystal.ge/branches/' },
    'rico': { fullName: 'შპს "რიკო ექსპრესი"', branches: ['ჭავჭავაძის გამზ. 70 (სათაო ოფისი)', 'თამარაშვილის ქ. 14', 'პეკინის გამზ. 3', 'ვაჟა-ფშაველას გამზ. 71', 'მელიქიშვილის გამზ. 17', 'რუსთაველის გამზ. 14', 'წერეთლის გამზ. 111', 'აღმაშენებლის გამზ. 129', 'გლდანი, ვეკუას ქ. 14', '+ 50-მდე ფილიალი'], mapUrl: 'https://rico.ge/ka/branches' },
    'valuto': { fullName: 'შპს "ვალუტო"', branches: ['ალ. ყაზბეგის გამზ. 34', 'წერეთლის გამზ. 72ა', 'პეკინის გამზ. 5', 'აღმაშენებლის გამზ. 154', 'გურამიშვილის გამზ. 17', 'მოსკოვის გამზ. 14', 'დოლიძის ქ. 2', 'ქეთევან დედოფლის გამზ. 53'], mapUrl: 'https://valuto.ge/branches/' },
    'kursige': { fullName: 'შპს "კურსი"', branches: ['პეკინის გამზ. 21', 'ჭავჭავაძის გამზ. 33', 'ვაჟა-ფშაველას 71', 'რუსთაველის 14'], mapUrl: 'https://kursi.ge' },
    'inex': { fullName: 'შპს "ინტელიექსპრესი"', branches: ['აღმაშენებლის გამზ. 89 (სათაო)', 'ჭავჭავაძის გამზ. 24', 'მელიქიშვილის ქ. 17', 'პეკინის ქ. 4', 'წერეთლის გამზ. 116'], mapUrl: 'https://ge.inteliexpress.net/branches/' },
    'giro': { fullName: 'შპს "გირო კრედიტი"', branches: ['ყაზბეგის გამზ. 14 (სათაო)', 'წერეთლის 116', 'გურამიშვილის 15'], mapUrl: 'https://girocredit.ge/branch/' },
    'goa': { fullName: 'შპს "გოა კრედიტი"', branches: ['თევდორე მღვდლის ქ. 13', 'წერეთლის 73'], mapUrl: 'https://goacredit.ge' },
    'hash': { fullName: 'სს "ჰაშ ბანკი"', branches: ['რუსთაველის გამზ. 12', 'ზ. ფალიაშვილის 15'], mapUrl: 'https://hashbank.ge' },
    'mbc': { fullName: 'შპს "მიკრო ბიზნეს კაპიტალი (MBC)"', branches: ['წერეთლის გამზ. 114', 'ალ. ყაზბეგის 15', 'პეკინის გამზ. 14', 'ქეთევან დედოფლის გამზ. 67'], mapUrl: 'https://mbc.com.ge/ka/contact/branches' },
    'procredit': { fullName: 'სს "პროკრედიტ ბანკი"', branches: ['ალ. ყაზბეგის გამზ. 21 (სათაო ოფისი)', 'წერეთლის გამზ. 105', 'დავით აღმაშენებლის გამზ. 154', 'რუსთაველის გამზ. 31'], mapUrl: 'https://www.procreditbank.ge/ge/contact' },
    'leader': { fullName: 'შპს "ლიდერ კრედიტი"', branches: ['თბილისი, დადიანის ქ. 7', 'თბილისი, ჭავჭავაძის გამზ. 39', 'ბათუმი, გორგილაძის ქ. 54', 'ქუთაისი, წერეთლის ქ. 2'], mapUrl: 'https://leadercredit.ge' }
};

window.openCompanyInfo = function(key, displayName) {
    const modal = document.getElementById('company-info-modal');
    if (!modal) return;
    
    const info = COMPANY_INFO_DATA[key] || { fullName: displayName, branches: ['ინფორმაცია ფილიალებზე ხელმიუწვდომელია'], mapUrl: COMPANY_URLS[key] || '#' };
    const websiteUrl = COMPANY_URLS[key] || '#';
    const logoPath = LOGOS[key] || 'Logos/logo.jpg';
    
    const header = document.getElementById('info-modal-header');
    header.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; width: 100%;">
            <div style="width: 70px; height: 70px; border-radius: 16px; background: #ffffff; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); margin-bottom: 15px;">
                <img src="${logoPath}" style="width: 100%; height: 100%; object-fit: contain; object-position: center; border-radius: 12px;">
            </div>
            <h2 style="margin: 0 0 5px 0; color: var(--text-main); font-size: 1.6em;">${displayName}</h2>
            <div style="color: var(--text-muted); font-size: 0.9em; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${info.fullName}</div>
            <a href="${websiteUrl}" target="_blank" class="info-website-link" style="margin-top: 15px; display: inline-flex; align-items: center; gap: 8px; color: var(--primary); font-weight: 600; text-decoration: none; background: rgba(56, 189, 248, 0.1); padding: 8px 16px; border-radius: 20px; transition: background 0.2s;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                ვებ-გვერდზე გადასვლა
            </a>
        </div>
    `;
    
    let branchesHtml = `<div class="info-section-title" style="margin-top: 30px; margin-bottom: 15px; font-weight: 700; color: var(--text-main); font-size: 1.1em; display: flex; align-items: center; gap: 10px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--buy-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> მთავარი ფილიალები</div><ul class="info-branch-list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">`;
    
    info.branches.forEach(branch => {
        branchesHtml += `<li style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); padding: 12px 15px; border-radius: 8px; color: var(--text-main); font-size: 0.95em; display: flex; align-items: center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 12px; flex-shrink: 0;"><path d="M5 9l2.89 2.89a2 2 0 0 0 2.83 0L19 3"></path></svg>${branch}</li>`;
    });
    
    branchesHtml += `</ul>`;
    
    if (info.mapUrl && info.mapUrl !== '#') {
        branchesHtml += `
            <a href="${info.mapUrl}" target="_blank" style="display: block; text-align: center; margin-top: 20px; color: var(--primary); text-decoration: none; font-weight: 600; padding: 12px; border: 1px dashed var(--primary); border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='rgba(56, 189, 248, 0.1)'" onmouseout="this.style.background='transparent'">
                ყველა ფილიალის ნახვა რუკაზე &rarr;
            </a>
        `;
    }
    
    document.getElementById('info-modal-body').innerHTML = branchesHtml;
    modal.style.display = 'flex';
};

// Also close it correctly
document.addEventListener('DOMContentLoaded', () => {
    const savedTab = localStorage.getItem('allrates_current_tab');
    if (savedTab) {
        const tabBtns = document.querySelectorAll('.tab-btn');
        if (tabBtns.length > 0) {
            tabBtns.forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.querySelector(`.tab-btn[onclick="switchTab('${savedTab}')"]`);
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

    bindMarketSearch();
    bindHomeMarketScrollControls();

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
