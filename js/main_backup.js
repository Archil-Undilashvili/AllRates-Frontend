
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

const API_MFO_URL = 'https://sheets-api-t266.onrender.com/api/data';
        const API_BANKS_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AWDtjMWFvbEgN6VC6wxI7pN9ABktXkqPN7bGMwsIYTLiCaWN4RieM33AZbs8-qa8HEDeftgFpcn-xFFPzwRSaTgjgRterE2f47ma1nXbsnHqRmyv3qqRUMcoK7bahbIzBU_73IYXskTCuokqU9ASX-yjm1xliNjC7W5CizWaijDgyoNmiB5-6hUsmGPO1wvrVcnBCp2ksgioARRQyHhKY31wcHxhT1kVD_E-qjxhMSAuplX7ZceMfMGKWPatecLm8K4G5KP7AjaRKvtVWWLD9LIwZtTTmE6fGg&lib=M-V5mEnEclei2QLgjN86iAykVBAJz9-Q8';
        const API_NBG_URL = 'https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json';
        
        // კატეგორიები
        const ALL_COMPANIES = ['rico', 'valuto', 'kursige', 'crystal', 'bog', 'tbc', 'liberty', 'bb', 'credo', 'cartu', 'inex', 'giro', 'goa', 'hash', 'mbc', 'tera', 'halyk', 'is'];
        const MFO_COMPANIES = ['rico', 'valuto', 'kursige', 'crystal', 'inex', 'giro', 'goa', 'mbc'];
        const BANK_COMPANIES = ['bog', 'tbc', 'liberty', 'bb', 'credo', 'cartu', 'hash', 'tera', 'halyk', 'is'];

        let currentTab = 'all';

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

            if (!email || !message) {
                error.textContent = '✗   გთხოვთ შეავსოთ სავალდებულო ველები (ელ-ფოსტა და შეტყობინება).';
                error.style.display = 'block';
                return;
            }

            btn.disabled = true;
            btn.textContent = 'იგზავნება...';

            try {
                const res = await fetch('https://formsubmit.co/ajax/archilundilashvili@gmail.com', {
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
            'rico': 'რიკო ჯგუფი',
            'valuto': 'ვალუტო',
            'kursige': 'კურსი ჯი',
            'crystal': 'მიკრო ბანკი კრისტალი',
            'bog': 'საქართველოს ბანკი',
            'tbc': 'თიბისი ბანკი',
            'liberty': 'ლიბერთი ბანკი',
            'bb': 'ბაზის ბანკი',
            'credo': 'კრედო ბანკი',
            'cartu': 'ბანკი ქართუ',
            'inex': 'ინტელ ექსპრესი',
            'giro': 'გირო კრედიტი',
            'goa': 'გოა კრედიტი',
            'hash': 'ჰეშ ბანკი',
            'mbc': 'ემ ბი სი',
            'tera': 'ტერა ბანკი',
            'halyk': 'ხალიკ ბანკი',
            'is': 'იშ ბანკი',
            'paysera': 'პეისერა ბანკი'
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
            'paysera': 'https://www.paysera.ge/v2/ka-GE/index'
        };

        const LOGOS = {
            'rico': 'Logos/rico.png',
            'valuto': 'https://valuto.ge/uploads/2021/03/%E1%83%95%E1%83%90%E1%83%9A%E1%83%A3%E1%83%A2%E1%83%9D-%E1%83%9A%E1%83%9D%E1%83%92%E1%83%9D.png',
            'kursige': 'Logos/kursige.png',
            'crystal': 'Logos/crystal.png',
            'bog': 'Logos/bog.png',
            'tbc': 'https://tbcbank.ge/assets/tbc-ge/favicon.png',
            'liberty': 'Logos/Liberty.png',
            'bb': 'Logos/bb.png',
            'credo': 'Logos/credo.png',
            'cartu': 'Logos/cartu.png',
            'inex': 'Logos/Inex.png',
            'giro': 'Logos/Giro.png',
            'goa': 'Logos/Goa.png',
            'hash': 'Logos/Hash.png',
            'mbc': 'Logos/mbc.png',
            'tera': 'Logos/TERA.png',
            'halyk': 'Logos/HALYK.png',
            'is': 'Logos/IS.png',
            'paysera': 'Logos/PAYSERA.png'
        };

        let originalData = [];
        let usdData = [];
        let eurData = [];

        // 0: Best (Smallest Spread), 1: Worst (Largest Spread)
        let sortStates = { usd: 0, eur: 0 };
        const sortIcons = ["&#9650;", "&#9660;"];

        
        async function fetchRates() {
            fetchNBG();
            fetchCrypto();
                        fetchCommodities();
            
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

                const popularAssetsList = ['Gold', 'Silver', 'Platinium', 'Platinum', 'WTI Crude Oil', 'Brent Crude Oil', 'Natural Gas'];

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
                                        if (!isFx) {
                                            const lowerPair = pairName.toLowerCase();
                                            let logoSrc = '';
                                            if (lowerPair.includes('wti')) logoSrc = 'WTI.png';
                                            else if (lowerPair.includes('brent')) logoSrc = 'BRENT.png';
                                            else if (lowerPair.includes('gas')) logoSrc = 'Natural Gas.png';
                                            else if (lowerPair.includes('gold')) logoSrc = 'GOLD.png';
                                            else if (lowerPair.includes('silver')) logoSrc = 'SILVER.png';
                                            else if (lowerPair.includes('platin')) logoSrc = 'PLATINIUM.png';
                                            
                                            if (logoSrc) {
                                                logoHtml = `<img src="Logos/${logoSrc}" alt="${pairName}" style="width: 28px; height: 28px; object-fit: contain; margin-right: 12px; vertical-align: middle; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));">`;
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
                                        if (!isFx) {
                                            const lowerPair = pairName.toLowerCase();
                                            let logoSrc = '';
                                            if (lowerPair.includes('wti')) logoSrc = 'WTI.png';
                                            else if (lowerPair.includes('brent')) logoSrc = 'BRENT.png';
                                            else if (lowerPair.includes('gas')) logoSrc = 'Natural Gas.png';
                                            else if (lowerPair.includes('gold')) logoSrc = 'GOLD.png';
                                            else if (lowerPair.includes('silver')) logoSrc = 'SILVER.png';
                                            else if (lowerPair.includes('platin')) logoSrc = 'PLATINIUM.png';
                                            
                                            if (logoSrc) {
                                                logoHtml = `<img src="Logos/${logoSrc}" alt="${pairName}" style="width: 28px; height: 28px; object-fit: contain; margin-right: 12px; vertical-align: middle; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));">`;
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
                            });
                    }
                }

                originalData = combinedData.filter(item => item.Company && ALL_COMPANIES.includes(item.Company.toLowerCase()));
                
                // Calculate spreads and store
                originalData = originalData.map(item => {
                    const usdB = parseFloat(item['USDGEL (Buy)']);
                    const usdS = parseFloat(item['USDGEL (Sell)']);
                    const eurB = parseFloat(item['EURGEL (Buy)']);
                    const eurS = parseFloat(item['EURGEL (Sell)']);
                    
                    return {
                        ...item,
                        usdSpread: (!isNaN(usdS) && !isNaN(usdB)) ? (usdS - usdB) : Infinity,
                        eurSpread: (!isNaN(eurS) && !isNaN(eurB)) ? (eurS - eurB) : Infinity
                    };
                });

                // Clone for sorting and set initial sort
                usdData = [...originalData].sort((a, b) => a.usdSpread - b.usdSpread);
                eurData = [...originalData].sort((a, b) => a.eurSpread - b.eurSpread);

                renderTable('usd');
                renderTable('eur');
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
                    } else {
                        buy = parseFloat(item['EURGEL (Buy)']);
                        sell = parseFloat(item['EURGEL (Sell)']);
                        spread = item.eurSpread;
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
                setInnerText(`home-${currency}-market-buy`, isNaN(stats.avgBuy) ? '--.---' : stats.avgBuy.toFixed(3));
                setInnerText(`home-${currency}-market-sell`, isNaN(stats.avgSell) ? '--.---' : stats.avgSell.toFixed(3));
                setInnerText(`home-${currency}-market-spread`, isNaN(stats.avgSpread) ? '--.---' : stats.avgSpread.toFixed(3));

                // Removed best bank/mfo from home

            }

            const usdStats = calculateStats('usd');
            const eurStats = calculateStats('eur');

            updateDom('usd', usdStats);
            updateDom('eur', eurStats);
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
                // Binance public API for 24h ticker (price + change)
                const symbols = '["BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","USDCUSDT","XRPUSDT","DOGEUSDT","TONUSDT","ADAUSDT"]';
                const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`);
                if (!res.ok) return;
                const data = await res.json();
                
                let cryptoData = { usdt: { price: "1.00", change: "0.0" } }; // Hardcode USDT
                
                data.forEach(item => {
                    const coin = item.symbol.replace('USDT', '').toLowerCase();
                    const val = parseFloat(item.lastPrice);
                    const change = parseFloat(item.priceChangePercent);
                    
                    // Format nicely based on value
                    let formatted;
                    if (coin === 'usdc' || coin === 'usdt') formatted = val.toFixed(2);
                    else if (val > 1000) formatted = val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                    else if (val > 1) formatted = val.toFixed(2);
                    else if (val > 0.01) formatted = val.toFixed(4);
                    else formatted = val.toFixed(5);
                    
                    cryptoData[coin] = { price: formatted, change: change.toFixed(1) };
                });
                
                // Update DOM
                const renderCrypto = (dataObj, elId) => {
                    if (!dataObj) return;
                    const el = document.getElementById(elId);
                    if (!el) return;
                    
                    const changeVal = parseFloat(dataObj.change);
                    let changeHtml = '';
                    if (changeVal > 0) {
                        changeHtml = `<span style="color: var(--buy-color); font-size: 0.65em; margin-left: 8px;">+${dataObj.change}%</span>`;
                    } else if (changeVal < 0) {
                        changeHtml = `<span style="color: var(--sell-color); font-size: 0.65em; margin-left: 8px;">${dataObj.change}%</span>`;
                    } else {
                        changeHtml = `<span style="color: var(--text-muted); font-size: 0.65em; margin-left: 8px;">0.0%</span>`;
                    }
                    
                    el.innerHTML = `$ ${dataObj.price} ${changeHtml}`;
                };

                const cryptos = ['btc', 'eth', 'usdt', 'bnb', 'sol', 'usdc', 'xrp', 'doge', 'ton', 'ada'];
                cryptos.forEach(c => renderCrypto(cryptoData[c], `crypto-${c}`));
                
                // Cache it
                localStorage.setItem('cachedCryptoData', JSON.stringify(cryptoData));
                
            } catch (err) {
                console.error("კრიპტოს ჩატვირთვის შეცდომა:", err);
            }
        }

        async function fetchNBG() {
            try {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                const formattedDate = `${yyyy}-${mm}-${dd}`;
                
                const res = await fetch(`${API_NBG_URL}?date=${formattedDate}`);
                if (!res.ok) return;
                const data = await res.json();
                
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

                    // Update special home elements if they exist
                    if (cacheData.usd && setInnerText('home-nbg-usd')) document.getElementById('home-nbg-usd', cacheData.usd);
                    if (cacheData.eur && setInnerText('home-nbg-eur')) document.getElementById('home-nbg-eur', cacheData.eur);
                    
                    // Update dates
                    const dateElem = document.getElementById('nbg-date');
                    if(dateElem) dateElem.innerText = dateStr;
                    if(setInnerText('home-nbg-date')) document.getElementById('home-nbg-date', dateStr);
                    
                    setDisplay('nbg-rates-box', 'flex');
                    
                    // Cache NBG data
                    localStorage.setItem('cachedNBGData', JSON.stringify(cacheData));
                }
            } catch (err) {
                console.error('ეროვნული ბანკის კურსების ჩატვირთვა ვერ მოხერხდა', err);
            }
        }

        function switchTab(tab) {
            currentTab = tab;
            
            // ღილაკების ვიზუალის განახლება
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`).classList.add('active');

            renderTable('usd');
            renderTable('eur');
        }

        function toggleSort(currency) {
            sortStates[currency] = (sortStates[currency] + 1) % 2;
            const btn = document.getElementById(`btn-${currency}`);
            btn.innerHTML = sortIcons[sortStates[currency]];
            
            // ფერების შეცვლა (0 = საუკეთესო/მწვანე, 1 = ყველაზე ცუდი/წითელი)
            if (sortStates[currency] === 0) {
                btn.className = 'sort-btn sort-best';
            } else {
                btn.className = 'sort-btn sort-worst';
            }
            
            let dataArr = currency === 'usd' ? usdData : eurData;
            const spreadKey = currency === 'usd' ? 'usdSpread' : 'eurSpread';

            if (sortStates[currency] === 0) {
                // Best (Smallest Spread)
                dataArr.sort((a, b) => a[spreadKey] - b[spreadKey]);
            } else if (sortStates[currency] === 1) {
                // Worst (Largest Spread)
                dataArr.sort((a, b) => b[spreadKey] - a[spreadKey]);
            }

            renderTable(currency);
        }

        function renderTable(currency) {
            const tbody = document.getElementById(`${currency}-body`);
            if(!tbody) return;
            tbody.innerHTML = ''; 

            let dataArr = currency === 'usd' ? usdData : eurData;

            // ვფილტრავთ არჩეული გვერდის (Tab) მიხედვით
            let dataToRender = dataArr.filter(item => {
                const comp = item.Company.toLowerCase();
                if (currentTab === 'all') return true;
                if (currentTab === 'banks') return BANK_COMPANIES.includes(comp);
                if (currentTab === 'mfo') return MFO_COMPANIES.includes(comp);
            });

            if (dataToRender.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="empty-message">ჯერჯერობით მონაცემები არ არის</td></tr>`;
                setInnerText(`${currency}-market-buy`, '--.---');
                setInnerText(`${currency}-market-sell`, '--.---');
                setInnerText(`${currency}-market-spread`, '--.---');
                return;
            }

            // საუკეთესო კურსების პოვნა მიმდინარე ტაბისთვის
            let bestBuy = -Infinity;
            let bestSell = Infinity;

            dataToRender.forEach(item => {
                let buy = currency === 'usd' ? parseFloat(item['USDGEL (Buy)']) : parseFloat(item['EURGEL (Buy)']);
                let sell = currency === 'usd' ? parseFloat(item['USDGEL (Sell)']) : parseFloat(item['EURGEL (Sell)']);
                if (!isNaN(buy) && buy > bestBuy) bestBuy = buy;
                if (!isNaN(sell) && sell < bestSell) bestSell = sell;
            });

            // Calculate averages for this tab (Top 10)
            let validForAvg = dataToRender.map(item => {
                let buy = currency === 'usd' ? parseFloat(item['USDGEL (Buy)']) : parseFloat(item['EURGEL (Buy)']);
                let sell = currency === 'usd' ? parseFloat(item['USDGEL (Sell)']) : parseFloat(item['EURGEL (Sell)']);
                let spread = currency === 'usd' ? item.usdSpread : item.eurSpread;
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

            dataToRender.forEach(item => {
                const tr = document.createElement('tr');
                
                let buy, sell, spread;
                if (currency === 'usd') {
                    buy = parseFloat(item['USDGEL (Buy)']);
                    sell = parseFloat(item['USDGEL (Sell)']);
                    spread = item.usdSpread;
                } else {
                    buy = parseFloat(item['EURGEL (Buy)']);
                    sell = parseFloat(item['EURGEL (Sell)']);
                    spread = item.eurSpread;
                }

                const companyKey = item.Company.toLowerCase();
                const logoUrl = LOGOS[companyKey] || '';
                
                let logoClass = 'company-logo';
                if (companyKey === 'kursige') logoClass += ' logo-kursige';
                if (companyKey === 'credo') logoClass += ' logo-credo';

                const compNameKa = COMPANY_NAMES_KA[companyKey] || item.Company.toUpperCase();
                const compUrl = COMPANY_URLS[companyKey] || '#';

                let buyDisplay = isNaN(buy) ? '' : (buy === bestBuy ? `${buy.toFixed(3)}<span class="best-dot" title="საუკეთესო კურსი"></span>` : buy.toFixed(3));
                let sellDisplay = isNaN(sell) ? '' : (sell === bestSell ? `${sell.toFixed(3)}<span class="best-dot" title="საუკეთესო კურსი"></span>` : sell.toFixed(3));
                let spreadDisplay = (isNaN(spread) || spread === Infinity) ? '' : spread.toFixed(3);

                tr.innerHTML = `
                    <td class="company-name">
                        <a href="${compUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
                            <div class="company-logo-wrapper" title="${compNameKa}">
                                ${logoUrl ? `<img src="${logoUrl}" alt="${compNameKa}" class="${logoClass}">` : `<span>${compNameKa}</span>`}
                            </div>
                        </a>
                    </td>
                    <td class="buy">${buyDisplay}</td>
                    <td class="sell">${sellDisplay}</td>
                    <td class="spread">${spreadDisplay}</td>
                `;
                
                tbody.appendChild(tr);
            });

            // Display market averages based on top 10
            const avgBuyDom = countAvg > 0 ? (totalBuyAvg / countAvg).toFixed(3) : '--.---';
            const avgSellDom = countAvg > 0 ? (totalSellAvg / countAvg).toFixed(3) : '--.---';
            const avgSpreadDom = countAvg > 0 ? ((totalSellAvg / countAvg) - (totalBuyAvg / countAvg)).toFixed(3) : '--.---';
            
            setInnerText(`${currency}-market-buy`, avgBuyDom);
            setInnerText(`${currency}-market-sell`, avgSellDom);
            setInnerText(`${currency}-market-spread`, avgSpreadDom);
        }

        function loadCachedData() {
            try {
                // Load main rates
                const cachedRates = localStorage.getItem('cachedRatesData');
                if (cachedRates) {
                    originalData = JSON.parse(cachedRates);
                    usdData = [...originalData].sort((a, b) => a.usdSpread - b.usdSpread);
                    eurData = [...originalData].sort((a, b) => a.eurSpread - b.eurSpread);
                    
                    renderTable('usd');
                    renderTable('eur');
                    renderHomePage();
                    setDisplay('tables-wrapper', 'flex');
                }
                
                // Load NBG rates
                const cachedCrypto = localStorage.getItem('cachedCryptoData');
                if (cachedCrypto) {
                    const crypto = JSON.parse(cachedCrypto);
                    const cryptos = ['btc', 'eth', 'usdt', 'bnb', 'sol', 'usdc', 'xrp', 'doge', 'ton', 'ada'];
                    
                    const renderCrypto = (dataObj, elId) => {
                        if (!dataObj) return;
                        const el = document.getElementById(elId);
                        if (!el) return;
                        
                        // Handle old cache format (string) vs new cache format (object with price/change)
                        if (typeof dataObj === 'string') {
                            el.innerHTML = `$ ${dataObj}`;
                            return;
                        }

                        const changeVal = parseFloat(dataObj.change);
                        let changeHtml = '';
                        if (changeVal > 0) {
                            changeHtml = `<span style="color: var(--buy-color); font-size: 0.65em; margin-left: 8px;">+${dataObj.change}%</span>`;
                        } else if (changeVal < 0) {
                            changeHtml = `<span style="color: var(--sell-color); font-size: 0.65em; margin-left: 8px;">${dataObj.change}%</span>`;
                        } else {
                            changeHtml = `<span style="color: var(--text-muted); font-size: 0.65em; margin-left: 8px;">0.0%</span>`;
                        }
                        
                        el.innerHTML = `$ ${dataObj.price} ${changeHtml}`;
                    };

                    cryptos.forEach(c => renderCrypto(crypto[c], `crypto-${c}`));
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
                    
                    setDisplay('nbg-rates-box', 'flex');
                }
            } catch (err) {
                console.error("ქეშის ჩატვირთვის შეცდომა:", err);
            }
        }

        
        loadCachedData(); // Load cached numbers instantly
        fetchRates();     // Fetch fresh numbers silently