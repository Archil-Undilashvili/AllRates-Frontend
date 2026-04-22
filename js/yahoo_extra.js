async function fetchAndAppendExtraAssets() {
    const extraSymbols = [
        { sym: '^GSPC', name: 'S&P 500', logo: 'SP500.png', id: 'extra-gspc' },
        { sym: '^DJI', name: 'Dow Jones', logo: 'DJI.png', id: 'extra-dji' },
        { sym: 'NVDA', name: 'NVIDIA', logo: 'NVDA.png', id: 'extra-nvda' },
        { sym: 'AAPL', name: 'Apple', logo: 'AAPL.png', id: 'extra-aapl' },
        { sym: 'TSLA', name: 'Tesla', logo: 'TSLA.png', id: 'extra-tsla' }
    ];
    
    // Check if we already injected them to prevent dupes
    if (document.getElementById('extra-aapl')) return;

    for (let item of extraSymbols) {
        try {
            // First try direct fetch (just like main.js fetchCommodities)
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${item.sym}`;
            let res = await fetch(url).catch(() => null);
            
            // Fallback to allorigins if direct fails
            if (!res || !res.ok) {
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
                res = await fetch(proxyUrl);
                if (res && res.ok) {
                    const proxyData = await res.json();
                    item.data = JSON.parse(proxyData.contents);
                }
            } else {
                item.data = await res.json();
            }
            
            if (item.data && item.data.chart && item.data.chart.result && item.data.chart.result.length > 0) {
                const meta = item.data.chart.result[0].meta;
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
                
                let displayRate = price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                let logoHtml = `<img src="Logos/${item.logo}" alt="${item.name}" style="width:20px; height:20px; margin-right:8px; border-radius:50%; object-fit: cover; background: white;">`;
                
                item.html = `
                    <span class="intl-pair" style="display: flex; align-items: center;">${logoHtml}${item.name}</span>
                    <span class="intl-value">$${displayRate} ${changeHtml}</span>
                `;
            }
        } catch (e) {
            console.error('Error fetching', item.sym, e);
        }
    }
    
    // Now wait for the main container to be populated by main.js, then append
    const container = document.getElementById('popular-assets-list');
    if (!container) return;
    
    function inject() {
        // If container is empty, wait for main.js to populate it first
        if (container.children.length === 0) {
            setTimeout(inject, 500);
            return;
        }
        
        // If our items are already there, stop
        if (document.getElementById('extra-aapl')) return;
        
        // Append our items
        extraSymbols.forEach(item => {
            if (item.html) {
                const div = document.createElement('div');
                div.className = 'intl-rate-item';
                div.id = item.id;
                div.innerHTML = item.html;
                container.appendChild(div);
            }
        });
    }
    
    inject();
}

// Call initially
fetchAndAppendExtraAssets();

// And check periodically if main.js wipes them out during its own refresh
setInterval(() => {
    const container = document.getElementById('popular-assets-list');
    if (container && container.children.length > 0 && !document.getElementById('extra-aapl')) {
        fetchAndAppendExtraAssets();
    }
}, 5000);
