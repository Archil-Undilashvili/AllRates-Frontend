(function () {
    const root = document.querySelector('[data-pair-page]');
    if (!root) return;

    const pair = String(root.dataset.pair || 'usdgel').toLowerCase();
    const code = pair.slice(0, 3).toUpperCase();
    const type = root.dataset.rateType === 'official' ? 'official' : 'market';
    const analyticsOnly = root.hasAttribute('data-analytics-page');
    const apiBase = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? 'http://localhost:3000'
        : 'https://allrates-backend-api.onrender.com';
    const nbgApi = 'https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json/';
    const digits = 4;
    let chart = null;
    let chartRequest = 0;
    let comparing = false;
    const comparisonPairs = {};
    const cryptoHistoryCache = new Map();
    const cryptoMetadata = new Map();
    function formatChartPrice(value, category) {
        if (!Number.isFinite(value)) return '—';
        // Match the homepage's price-dependent crypto precision, including boundaries.
        if (category === 'crypto') {
            if (value > 1000) return value.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});
            if (value > 1) return value.toFixed(2);
            if (value > 0.01) return value.toFixed(4);
            return value.toFixed(6);
        }
        const precision = category === 'market' ? 3 : 4;
        return new Intl.NumberFormat('en-US', {minimumFractionDigits: precision, maximumFractionDigits: precision}).format(value);
    }
    const priceSummaryPlugin = {
        id: 'priceSummary',
        afterDatasetsDraw(instance, args, options) {
            const {ctx, chartArea: area} = instance;
            if (!area || area.width < 40) return;
            const occupied = [];
            const descriptions = [];
            ctx.save();
            ctx.font = '600 11px sans-serif';
            ctx.textBaseline = 'middle';
            instance.data.datasets.forEach((dataset, index) => {
                if (!instance.isDatasetVisible(index)) return;
                const meta = instance.getDatasetMeta(index);
                const values = dataset.data.map((point, i) => ({i, value: typeof point === 'object' && point !== null ? point.y : point}))
                    .filter(point => typeof point.value === 'number' && Number.isFinite(point.value) && meta.data[point.i] && !meta.data[point.i].skip);
                if (!values.length) return;
                const min = values.reduce((a,b) => b.value < a.value ? b : a);
                const max = values.reduce((a,b) => b.value > a.value ? b : a);
                const markers = new Map();
                [['მინ.', min], ['მაქს.', max], ['ბოლო', values[values.length - 1]]].forEach(([label, point]) => {
                    if (!markers.has(point.i)) markers.set(point.i, {point, labels:[]});
                    markers.get(point.i).labels.push(label);
                });
                for (const {point, labels} of markers.values()) {
                    const anchor = meta.data[point.i];
                    const value = formatChartPrice(point.value, options.category);
                    const text = value;
                    descriptions.push(`${dataset.label}: ${labels.join('/')} ${value}`);
                    const width = Math.min(ctx.measureText(text).width + 14, area.width - 4);
                    const height = 23;
                    const clampX = x => Math.max(area.left + 2, Math.min(x, area.right - width - 2));
                    const clampY = y => Math.max(area.top + 2, Math.min(y, area.bottom - height - 2));
                    let box;
                    let best = Infinity;
                    for (const dy of [-32, 10, -60, 38, -88, 66, -116, 94]) {
                        for (const dx of [10, -width - 10, -width / 2]) {
                            const candidate = {x:clampX(anchor.x + dx), y:clampY(anchor.y + dy), width, height};
                            const overlaps = occupied.filter(b => candidate.x < b.x+b.width+4 && candidate.x+width+4 > b.x && candidate.y < b.y+b.height+4 && candidate.y+height+4 > b.y).length;
                            const score = overlaps * 10000 + Math.abs(dy) + Math.abs(dx) * .1;
                            if (score < best) {best = score; box = candidate;}
                        }
                    }
                    occupied.push(box);
                    ctx.strokeStyle = dataset.borderColor;
                    ctx.lineWidth = 1;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(anchor.x, anchor.y);
                    ctx.lineTo(Math.max(box.x, Math.min(anchor.x, box.x+width)), Math.max(box.y, Math.min(anchor.y, box.y+height)));
                    ctx.stroke();
                    ctx.fillStyle = '#0f172a';
                    ctx.fillRect(box.x, box.y, width, height);
                    ctx.fillStyle = dataset.borderColor;
                    ctx.fillText(text, box.x+7, box.y+height/2, width-14);
                    ctx.beginPath();
                    ctx.arc(anchor.x, anchor.y, 3.5, 0, Math.PI*2);
                    ctx.fill();
                }
            });
            ctx.restore();
            instance.canvas.setAttribute('aria-label', descriptions.join('; '));
        }
    };
    function seriesLabel(value, category) {
        return category === 'crypto' ? `${value}/${cryptoMetadata.get(`${value}:${assetState.periodByMarket.crypto}`)?.quote || (value === 'TON' ? 'USD' : value === 'USDT' ? 'USDC' : 'USDT')}` : formatPairLabel(value);
    }

    function comparisonControls() {
        const host = document.querySelector('.asset-chart-toolbar');
        if (!host) return;
        if (!document.getElementById('compare-toggle')) {
            const row = document.createElement('div');
            row.className = 'asset-compare-row';
            row.innerHTML = '<button id="compare-toggle" type="button" aria-pressed="false"><span aria-hidden="true">＋</span> შედარება</button><label id="compare-picker" hidden>მეორე წყვილი <select id="compare-pair" aria-label="შესადარებელი წყვილი"></select></label><span id="compare-note" hidden>ორი ღერძი · პროპორციული მასშტაბი</span>';
            host.append(row);
            row.querySelector('button').addEventListener('click', () => { comparing = !comparing; comparisonControls(); loadAssetChart(); });
            row.querySelector('select').addEventListener('change', event => { comparisonPairs[assetState.market] = event.target.value; loadAssetChart(); });
        }
        const category = assetState.market;
        const options = assetLists[category].filter(value => value !== assetState.pairByMarket[category]);
        if (!options.includes(comparisonPairs[category])) comparisonPairs[category] = options[0];
        const toggle = document.getElementById('compare-toggle');
        toggle.disabled = options.length === 0;
        toggle.setAttribute('aria-pressed', String(comparing));
        toggle.title = 'ორი კურსი · მარცხენა და მარჯვენა ღერძი';
        document.getElementById('compare-picker').hidden = !comparing;
        document.getElementById('compare-note').hidden = !comparing;
        document.getElementById('compare-note').textContent = category === 'market' ? 'ორი ღერძი · პროპორციული მასშტაბი · ყიდვა/გაყიდვის შუა ფასი' : 'ორი ღერძი · პროპორციული მასშტაბი';
        if (!document.getElementById('crypto-source-note')) {
            const note = document.createElement('p');
            note.id = 'crypto-source-note';
            note.style.cssText = 'color:#94a3b8;font-size:12px;margin:8px 0 0;line-height:1.6';
            host.append(note);
        }
        document.getElementById('crypto-source-note').textContent = '';
        document.getElementById('compare-pair').innerHTML = options.map(value => `<option value="${value}"${value === comparisonPairs[category] ? ' selected' : ''}>${formatPairLabel(value)}</option>`).join('');
    }

    function renderComparison(first, second, category, firstPair, secondPair) {
        const rows = window.AllRatesComparison.align(first, second, category === 'market' || category === 'crypto');
        if (rows.length < 2) throw new Error('შედარებისთვის საკმარისი საერთო თარიღები არ მოიძებნა');
        const bounds = window.AllRatesComparison.axes(rows);
        const scale = (index, selected) => ({
            type: 'linear', position: index ? 'right' : 'left', ...bounds[index],
            title: { display: true, text: seriesLabel(selected, category), color: index ? '#c4a1ff' : '#38bdf8' },
            ticks: { count: 6, color: index ? '#c4a1ff' : '#38bdf8', callback: value => formatChartPrice(value, category) },
            grid: { drawOnChartArea: !index, color: 'rgba(148,163,184,.1)' }
        });
        destroyChart();
        const canvas = document.getElementById('pair-history-chart');
        canvas.setAttribute('aria-label', `${formatPairLabel(firstPair)} და ${formatPairLabel(secondPair)} — კურსების შედარება ორი ღერძით`);
        chart = new Chart(canvas, {
            plugins: [priceSummaryPlugin],
            type: 'line',
            data: { datasets: [firstPair, secondPair].map((value, index) => ({
                label: seriesLabel(value, category),
                yAxisID: index ? 'yRight' : 'y',
                data: rows.map(row => ({ x: row.timestamp, y: row.values[index] })),
                borderColor: index ? '#c4a1ff' : '#38bdf8', borderDash: index ? [6, 3] : [],
                borderWidth: 2.5, pointRadius: rows.length < 25 ? 2 : 0, pointHoverRadius: 5, fill: false, tension: 0
            })) },
            options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
                plugins: {
                    priceSummary: {category},
                    legend: { labels: { color: '#cbd5e1', usePointStyle: true } },
                    tooltip: { callbacks: {
                        title: items => new Intl.DateTimeFormat('ka-GE', { dateStyle: 'medium', ...(['market', 'crypto'].includes(category) ? {timeStyle:'short'} : {}), timeZone: 'Asia/Tbilisi' }).format(items[0].parsed.x),
                        label: ctx => `${ctx.dataset.label}: ${formatChartPrice(ctx.parsed.y, category)}`
                    } }
                },
                scales: {
                    x: { type: 'linear', ticks: { color: '#94a3b8', maxTicksLimit: 8, callback: value => new Intl.DateTimeFormat('ka-GE', { month:'short', day:'numeric', ...(['market', 'crypto'].includes(category) ? {hour:'2-digit',minute:'2-digit'} : {}), timeZone:'Asia/Tbilisi' }).format(value) }, grid: {color:'rgba(148,163,184,.1)'} },
                    y: scale(0, firstPair),
                    yRight: scale(1, secondPair)
                }
            }
        });
    }

    const assetLists = {
        official: [
            'USDGEL', 'EURGEL', 'GBPGEL', 'RUBGEL', 'TRYGEL', 'AZNGEL', 'AMDGEL',
            'AUDGEL', 'BGNGEL', 'CADGEL', 'CHFGEL', 'CNYGEL', 'DKKGEL', 'HKDGEL',
            'HUFGEL', 'ILSGEL', 'INRGEL', 'JPYGEL', 'KZTGEL', 'NOKGEL', 'NZDGEL',
            'PLNGEL', 'SEKGEL', 'SGDGEL', 'UAHGEL'
        ],
        market: ['USDGEL', 'EURGEL'],
        forex: [
            'EURUSD', 'GBPUSD', 'USDCHF', 'USDJPY', 'USDRUB', 'USDTRY', 'USDCNY',
            'USDILS', 'USDCAD', 'AUDUSD'
        ],
        crypto: ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'USDC', 'XRP', 'DOGE', 'TON', 'ADA']
    };

    const assetPeriods = {
        official: [[7, '1 კვირა'], [30, '1 თვე'], [90, '3 თვე'], [365, '1 წელი'], [1095, '3 წელი'], [1825, '5 წელი']],
        forex: [[7, '1 კვირა'], [30, '1 თვე'], [90, '3 თვე'], [365, '1 წელი'], [1095, '3 წელი'], [1825, '5 წელი']],
        crypto: [[7, '1 კვირა'], [30, '1 თვე'], [90, '3 თვე'], [365, '1 წელი'], [1095, '3 წელი'], [1825, '5 წელი']],
        market: [[1, '1 დღე'], [3, '3 დღე'], [7, '1 კვირა'], [30, '1 თვე']]
    };

    const assetState = {
        market: 'official',
        pairByMarket: {
            official: pair.toUpperCase(),
            market: assetLists.market.includes(pair.toUpperCase()) ? pair.toUpperCase() : assetLists.market[0],
            forex: 'EURUSD',
            crypto: 'BTC'
        },
        periodByMarket: { official: 30, market: 1, forex: 30, crypto: 7 }
    };

    function formatNumber(value) {
        const number = Number(value);
        return Number.isFinite(number) ? number.toFixed(digits) : '—';
    }

    function formatPairLabel(value) {
        const normalized = String(value || '').replace(/[^a-z]/gi, '').toUpperCase();
        return normalized.length === 6 ? `${normalized.slice(0, 3)}/${normalized.slice(3)}` : normalized;
    }

    function setText(selector, value) {
        const node = document.querySelector(selector);
        if (node) node.textContent = value;
    }

    function marketAverage(rows) {
        const buyKey = `${code.toLowerCase()}Buy`;
        const sellKey = `${code.toLowerCase()}Sell`;
        const bounds = { USD: [1, 5], EUR: [1, 6], GBP: [1, 8], RUB: [0.005, 0.2], TRY: [0.005, 0.5] }[code];
        const valid = (Array.isArray(rows) ? rows : []).map(row => ({
            buy: Number(row[buyKey]), sell: Number(row[sellKey]), updatedAt: row.createdAt
        })).filter(row => Number.isFinite(row.buy) && Number.isFinite(row.sell)
            && row.buy > bounds[0] && row.buy < bounds[1]
            && row.sell > bounds[0] && row.sell < bounds[1] && row.sell > row.buy)
            .sort((a, b) => (a.sell - a.buy) - (b.sell - b.buy)).slice(0, 10);
        if (!valid.length) return null;
        const buy = valid.reduce((sum, row) => sum + row.buy, 0) / valid.length;
        const sell = valid.reduce((sum, row) => sum + row.sell, 0) / valid.length;
        return { buy, sell, spread: sell - buy, updatedAt: valid.map(row => row.updatedAt).filter(Boolean).sort().pop() };
    }

    async function refreshCurrentRate() {
        try {
            if (type === 'market') {
                const response = await fetch(`${apiBase}/api/rates/latest`, { headers: { accept: 'application/json' } });
                if (!response.ok) throw new Error('market snapshot unavailable');
                const average = marketAverage(await response.json());
                if (!average) throw new Error('market pair unavailable');
                setText('[data-rate-buy]', formatNumber(average.buy));
                setText('[data-rate-sell]', formatNumber(average.sell));
                setText('[data-rate-spread]', formatNumber(average.spread));
                setText('[data-rate-main]', formatNumber((average.buy + average.sell) / 2));
                setText('[data-rate-updated]', new Intl.DateTimeFormat('ka-GE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Tbilisi' }).format(new Date(average.updatedAt)));
                return;
            }
            const response = await fetch(nbgApi, { headers: { accept: 'application/json' } });
            if (!response.ok) throw new Error('official snapshot unavailable');
            const payload = await response.json();
            const currency = payload?.[0]?.currencies?.find(item => item.code === code);
            if (!currency) throw new Error('official pair unavailable');
            const unitRate = Number(currency.rate) / Number(currency.quantity || 1);
            const unitDiff = Number(currency.diff) / Number(currency.quantity || 1);
            setText('[data-rate-main]', `${formatNumber(unitRate)} GEL`);
            setText('[data-official-diff]', `${unitDiff > 0 ? '+' : ''}${formatNumber(unitDiff)}`);
            setText('[data-official-previous]', formatNumber(unitRate - unitDiff));
            setText('[data-rate-updated]', new Intl.DateTimeFormat('ka-GE', { dateStyle: 'medium', timeZone: 'Asia/Tbilisi' }).format(new Date(currency.validFromDate || payload[0].date)));
            document.querySelectorAll('[data-board-code]').forEach(tile => {
                const boardCurrency = payload?.[0]?.currencies?.find(item => item.code === tile.dataset.boardCode);
                if (!boardCurrency) return;
                const quantity = Number(boardCurrency.quantity || 1);
                const rate = Number(boardCurrency.rate) / quantity;
                const diff = Number(boardCurrency.diff || 0) / quantity;
                const rateNode = tile.querySelector('[data-board-rate]');
                const diffNode = tile.querySelector('[data-board-diff]');
                if (rateNode) rateNode.textContent = formatNumber(rate);
                if (diffNode) {
                    diffNode.textContent = `${diff > 0 ? '+' : ''}${formatNumber(diff)}`;
                    diffNode.classList.remove('up', 'down', 'flat');
                    diffNode.classList.add(diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat');
                }
            });
            const boardDate = document.querySelector('[data-board-date]');
            if (boardDate) boardDate.textContent = new Intl.DateTimeFormat('ka-GE', { dateStyle: 'medium', timeZone: 'Asia/Tbilisi' }).format(new Date(currency.validFromDate || payload[0].date));
        } catch (error) {
            console.warn('Pair live refresh failed; keeping HTML snapshot.', error.message);
        }
    }

    function dateToIso(date) {
        return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
    }

    function nbgStep(days) {
        if (days <= 7) return 1;
        if (days <= 30) return 2;
        if (days <= 90) return 5;
        if (days <= 365) return 15;
        if (days <= 1095) return 45;
        return 75;
    }

    async function loadNbgPairHistory(selectedPair, days) {
        const normalized = String(selectedPair || '').replace(/[^a-z]/gi, '').toUpperCase();
        const base = normalized.slice(0, 3);
        const quote = normalized.slice(3, 6);
        const dates = [];
        const today = new Date();
        for (let offset = days; offset >= 0; offset -= nbgStep(days)) {
            const date = new Date(today);
            date.setDate(today.getDate() - offset);
            dates.push(dateToIso(date));
        }
        if (dates[dates.length - 1] !== dateToIso(today)) dates.push(dateToIso(today));
        const results = await Promise.all(dates.map(async date => {
            try {
                const response = await fetch(`${nbgApi}?date=${date}`);
                if (!response.ok) return null;
                const row = (await response.json())?.[0];
                if (!row?.currencies?.length) return null;
                const rates = { GEL: 1 };
                row.currencies.forEach(currency => {
                    const rate = Number(currency.rate);
                    const quantity = Number(currency.quantity || 1);
                    if (currency.code && Number.isFinite(rate) && quantity) rates[currency.code] = rate / quantity;
                });
                if (!rates[base] || !rates[quote]) return null;
                return { timestamp: row.validFromDate || row.date || `${date}T12:00:00Z`, rate: rates[base] / rates[quote] };
            } catch (_) { return null; }
        }));
        const seen = new Set();
        return results.filter(Boolean).filter(item => {
            const day = String(item.timestamp).slice(0, 10);
            if (seen.has(day)) return false;
            seen.add(day);
            return Number.isFinite(item.rate);
        }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    async function loadMarketHistory(selectedPair, days) {
        const normalized = String(selectedPair || pair).replace(/[^a-z]/gi, '').toLowerCase();
        if (['usdgel', 'eurgel'].includes(normalized)) {
            const today = new Date();
            const from = new Date(today);
            const to = new Date(today);
            from.setDate(today.getDate() - Math.max(days, 1) - 1);
            to.setDate(today.getDate() + 1);
            const response = await fetch(`${apiBase}/api/market-history/range/${dateToIso(from)}/${dateToIso(to)}`, { headers: { accept: 'application/json' } });
            if (!response.ok) throw new Error('საბაზრო ისტორია დროებით მიუწვდომელია');
            const payload = await response.json();
            const points = (payload.records || []).map(record => ({
                timestamp: record.timestamp,
                buy: Number(record?.[normalized]?.buy),
                sell: Number(record?.[normalized]?.sell)
            })).filter(point => Number.isFinite(point.buy) && Number.isFinite(point.sell));
            if (!points.length) return points;
            const latest = new Date(points[points.length - 1].timestamp).getTime();
            const fromTime = latest - days * 24 * 60 * 60 * 1000;
            return points.filter(point => new Date(point.timestamp).getTime() >= fromTime);
        }
        const response = await fetch(`${apiBase}/api/pair-history/${normalized}?days=${days}`, { headers: { accept: 'application/json' } });
        if (!response.ok) throw new Error('საბაზრო ისტორია დროებით მიუწვდომელია');
        const payload = await response.json();
        return (payload.points || []).map(point => ({ timestamp: point.timestamp, buy: Number(point.buy), sell: Number(point.sell) }))
            .filter(point => Number.isFinite(point.buy) && Number.isFinite(point.sell));
    }

    function loadCryptoHistory(selectedAsset, days) {
        const asset = String(selectedAsset || 'BTC').toUpperCase().replace(/[^A-Z0-9]/g, '');
        const key = `${asset}:${days}`;
        const hit = cryptoHistoryCache.get(key);
        if (hit?.expiresAt > Date.now()) return hit.task;
        const entry = {expiresAt: Infinity};
        const task = fetch(`${apiBase}/api/crypto-history/${encodeURIComponent(asset)}?days=${days}`, { headers: { accept: 'application/json' } })
            .then(async response => {
                const payload = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(payload.error || 'კრიპტოვალუტის ისტორია დროებით მიუწვდომელია');
                cryptoMetadata.set(key, payload);
                entry.expiresAt = Date.now() + 15 * 60 * 1000;
                return (payload.points || []).map(point => ({ timestamp: point.timestamp, rate: Number(point.rate) }))
                    .filter(point => Number.isFinite(point.rate) && point.rate > 0);
            }).catch(error => {
                cryptoHistoryCache.delete(key);
                throw error;
            });
        entry.task = task;
        cryptoHistoryCache.set(key, entry);
        return task;
    }

    function destroyChart() {
        if (chart) chart.destroy();
        chart = null;
    }

    function chartLabels(points, includeTime) {
        return points.map(point => new Intl.DateTimeFormat('ka-GE', {
            month: 'short', day: '2-digit', hour: includeTime ? '2-digit' : undefined,
            minute: includeTime ? '2-digit' : undefined, timeZone: 'Asia/Tbilisi'
        }).format(new Date(point.timestamp)));
    }

    function renderChart(points, chartType, selectedPair) {
        const canvas = document.getElementById('pair-history-chart');
        if (!canvas || typeof Chart === 'undefined') return;
        destroyChart();
        const pairLabel = seriesLabel(selectedPair, chartType);
        const isMarket = chartType === 'market';
        const isCrypto = chartType === 'crypto';
        const datasets = isMarket ? [
            { label: `${pairLabel} გაყიდვა`, data: points.map(point => point.sell), borderColor: '#fb7185', backgroundColor: 'rgba(251,113,133,.18)', fill: '+1', borderWidth: 2.2, pointRadius: points.length < 50 ? 2 : 0, pointHoverRadius: 5, tension: .35 },
            { label: `${pairLabel} ყიდვა`, data: points.map(point => point.buy), borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,.10)', fill: false, borderWidth: 2.2, pointRadius: points.length < 50 ? 2 : 0, pointHoverRadius: 5, tension: .35 }
        ] : [
            { label: pairLabel, data: points.map(point => point.rate), borderColor: isCrypto ? '#f59e0b' : chartType === 'forex' ? '#34d399' : '#38bdf8', backgroundColor: isCrypto ? 'rgba(245,158,11,.14)' : chartType === 'forex' ? 'rgba(52,211,153,.13)' : 'rgba(56,189,248,.14)', fill: true, borderWidth: 2.5, pointRadius: points.length < 20 ? 2 : 0, pointHoverRadius: 5, tension: .3 }
        ];
        canvas.setAttribute('aria-label', `${pairLabel} კურსის გრაფიკი`);
        chart = new Chart(canvas, {
            plugins: [priceSummaryPlugin],
            type: 'line', data: { labels: chartLabels(points, isMarket || isCrypto), datasets },
            options: {
                responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' },
                plugins: {
                    priceSummary: {category: chartType},
                    legend: { labels: { color: '#cbd5e1', usePointStyle: true, boxWidth: 10, font: { weight: '700' } } },
                    tooltip: { callbacks: { label: context => `${context.dataset.label}: ${formatChartPrice(context.raw, chartType)}${chartType === 'official' ? ' GEL' : ''}` } }
                },
                scales: {
                    x: { ticks: { color: '#94a3b8', maxTicksLimit: isMarket ? 16 : 10 }, grid: { color: 'rgba(148,163,184,.10)' } },
                    y: { ticks: { color: '#94a3b8', callback: value => formatChartPrice(value, chartType) }, grid: { color: 'rgba(148,163,184,.10)' } }
                }
            }
        });
    }

    function setChartStatus(message, isVisible) {
        const status = document.querySelector('.pair-chart-status');
        const wrap = document.querySelector('.asset-chart-wrap');
        if (status) { status.hidden = !isVisible; status.textContent = message || ''; }
        if (wrap) wrap.classList.toggle('is-empty', isVisible && message !== 'მონაცემები იტვირთება…');
    }

    async function loadLegacyChart(days = 30) {
        setChartStatus('მონაცემები იტვირთება…', true);
        try {
            const points = type === 'market' ? await loadMarketHistory(pair, days) : await loadNbgPairHistory(pair.toUpperCase(), days);
            if (points.length < 2) throw new Error('არჩეული პერიოდისთვის ისტორია არ მოიძებნა');
            renderChart(points, type, pair);
            setChartStatus('', false);
        } catch (error) { setChartStatus(error.message, true); }
    }

    function closeAssetPairMenu() {
        const trigger = document.getElementById('asset-chart-pair-trigger');
        const menu = document.getElementById('asset-chart-pair-menu');
        if (!trigger || !menu) return;
        menu.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
    }

    function populateAssetPairPicker() {
        const label = document.getElementById('asset-chart-pair-label');
        const menu = document.getElementById('asset-chart-pair-menu');
        if (!label || !menu) return;
        const market = assetState.market;
        const selected = assetState.pairByMarket[market];
        label.textContent = formatPairLabel(selected);
        menu.innerHTML = assetLists[market].map(item => `<button type="button" class="asset-pair-picker-option" role="option" data-value="${item}" aria-selected="${item === selected ? 'true' : 'false'}">${formatPairLabel(item)}</button>`).join('');
        menu.querySelectorAll('.asset-pair-picker-option').forEach(option => {
            option.addEventListener('click', () => {
                assetState.pairByMarket[market] = option.dataset.value;
                populateAssetPairPicker();
                closeAssetPairMenu();
                loadAssetChart();
            });
        });
    }

    function renderAssetPeriods() {
        const container = document.querySelector('.asset-chart-periods');
        if (!container) return;
        const market = assetState.market;
        const selected = assetState.periodByMarket[market];
        container.innerHTML = assetPeriods[market].map(([days, label]) => `<button type="button" class="asset-chart-period-btn${days === selected ? ' active' : ''}" data-days="${days}">${label}</button>`).join('');
        container.querySelectorAll('.asset-chart-period-btn').forEach(button => {
            button.addEventListener('click', () => {
                assetState.periodByMarket[market] = Number(button.dataset.days);
                renderAssetPeriods();
                loadAssetChart();
            });
        });
    }

    async function loadAssetChart() {
        const request = ++chartRequest;
        comparisonControls();
        if (analyticsOnly) {
            const url = new URL(window.location.href);
            url.searchParams.set('category', assetState.market);
            url.searchParams.set('asset', assetState.pairByMarket[assetState.market]);
            url.searchParams.set('days', assetState.periodByMarket[assetState.market]);
            if (comparing) url.searchParams.set('compare', comparisonPairs[assetState.market]);
            else url.searchParams.delete('compare');
            window.history.replaceState(null, '', url);
            try { localStorage.setItem('allrates.analytics.selection.v1', url.search); } catch (_) {}
        }
        const market = assetState.market;
        const selectedPair = assetState.pairByMarket[market];
        const comparePair = comparisonPairs[market];
        const useComparison = comparing;
        const days = assetState.periodByMarket[market];
        setChartStatus('მონაცემები იტვირთება…', true);
        destroyChart();
        try {
            const loader = market === 'market' ? loadMarketHistory : market === 'crypto' ? loadCryptoHistory : loadNbgPairHistory;
            const [points, other] = await Promise.all([loader(selectedPair, days), useComparison ? loader(comparePair, days) : Promise.resolve(null)]);
            if (request !== chartRequest) return;
            if (points.length < 2) throw new Error('არჩეული პერიოდისთვის ისტორია არ მოიძებნა');
            if (useComparison) renderComparison(points, other, market, selectedPair, comparePair);
            else renderChart(points, market, selectedPair);
            if (market === 'crypto') {
                document.getElementById('crypto-source-note').textContent = [selectedPair, ...(useComparison ? [comparePair] : [])].map(value => {
                    const meta = cryptoMetadata.get(`${value}:${days}`);
                    const since = new Intl.DateTimeFormat('ka-GE', {dateStyle:'medium'}).format(new Date(meta.points[0].timestamp));
                    return `${seriesLabel(value, market)} · ${meta.source} · ${meta.interval}${meta.limitedHistory ? ` · ხელმისაწვდომია ${since}-დან` : ''}`;
                }).join(' | ') + ' · დასრულებული პერიოდების დახურვის ფასები';
            }
            setChartStatus('', false);
        } catch (error) {
            if (request !== chartRequest) return;
            destroyChart();
            setChartStatus(error.message || 'გრაფიკის მონაცემები დროებით მიუწვდომელია', true);
        }
    }

    function syncAssetChartWidth() {
        const card = document.querySelector('.asset-chart-card');
        if (!card) return;
        const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
        card.style.width = viewportWidth > 1200 ? `${viewportWidth - 40}px` : '100%';
    }

    function initAssetChart() {
        const picker = document.querySelector('.asset-pair-picker');
        const trigger = document.getElementById('asset-chart-pair-trigger');
        const menu = document.getElementById('asset-chart-pair-menu');
        if (!picker || !trigger || !menu) return;
        let search = window.location.search;
        if (analyticsOnly && !new URLSearchParams(search).has('category')) {
            try { search = localStorage.getItem('allrates.analytics.selection.v1') || search; } catch (_) {}
        }
        const params = new URLSearchParams(search);
        const category = params.get('category');
        const selectedAsset = String(params.get('asset') || '').toUpperCase();
        if (category === 'crypto' && /^[A-Z0-9]{2,20}$/.test(selectedAsset) && !assetLists.crypto.includes(selectedAsset)) {
            assetLists.crypto.push(selectedAsset);
        }
        if (Object.hasOwn(assetLists, category) && assetLists[category].includes(selectedAsset)) {
            assetState.market = category;
            assetState.pairByMarket[category] = selectedAsset;
            if (analyticsOnly) {
                const days = Number(params.get('days'));
                if (assetPeriods[category].some(([value]) => value === days)) assetState.periodByMarket[category] = days;
                const compare = String(params.get('compare') || '').toUpperCase();
                if (category === 'crypto' && /^[A-Z0-9]{2,20}$/.test(compare) && !assetLists.crypto.includes(compare)) assetLists.crypto.push(compare);
                if (compare !== selectedAsset && assetLists[category].includes(compare)) {
                    comparing = true;
                    comparisonPairs[category] = compare;
                }
            }
        }
        document.querySelectorAll('.asset-chart-market-tab').forEach(button => {
            const active = button.dataset.market === assetState.market;
            button.classList.toggle('active', active);
            button.setAttribute('aria-selected', String(active));
        });
        populateAssetPairPicker();
        renderAssetPeriods();
        syncAssetChartWidth();
        window.addEventListener('resize', syncAssetChartWidth, { passive: true });
        trigger.addEventListener('click', event => {
            event.stopPropagation();
            const opening = menu.hidden;
            closeAssetPairMenu();
            if (opening) {
                menu.hidden = false;
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
        menu.addEventListener('click', event => event.stopPropagation());
        document.addEventListener('click', event => {
            if (!picker.contains(event.target)) closeAssetPairMenu();
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') closeAssetPairMenu();
        });
        document.querySelectorAll('.asset-chart-market-tab').forEach(button => {
            button.addEventListener('click', () => {
                assetState.market = button.dataset.market || 'official';
                if (!assetLists[assetState.market].includes(assetState.pairByMarket[assetState.market])) {
                    assetState.pairByMarket[assetState.market] = assetLists[assetState.market][0];
                }
                document.querySelectorAll('.asset-chart-market-tab').forEach(item => {
                    const active = item === button;
                    item.classList.toggle('active', active);
                    item.setAttribute('aria-selected', active ? 'true' : 'false');
                });
                populateAssetPairPicker();
                closeAssetPairMenu();
                renderAssetPeriods();
                loadAssetChart();
            });
        });
        loadAssetChart();
    }

    function initLegacyChart() {
        document.querySelectorAll('.pair-period-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.pair-period-btn').forEach(item => item.classList.toggle('active', item === button));
                loadLegacyChart(Number(button.dataset.days || 30));
            });
        });
        loadLegacyChart(30);
    }

    if (!analyticsOnly) refreshCurrentRate();
    if (document.querySelector('[data-asset-chart]')) initAssetChart();
    else initLegacyChart();
})();
