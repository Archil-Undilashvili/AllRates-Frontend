import re
import os

html_path = os.path.expanduser('~/Desktop/allrates.ge/rates.html')
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add Search Input to Header
if 'id="company-search-input"' not in html:
    header_old = '<div class="header-wrapper">\\n        <h1>მიმდინარე კურსები</h1>'
    header_new = '''<div class="header-wrapper" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
        <h1 style="margin: 0;">მიმდინარე კურსები</h1>
        <div class="company-search-container">
            <svg style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted);" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="company-search-input" placeholder="მოძებნე კომპანია..." autocomplete="off">
            <div id="company-search-dropdown" class="search-dropdown"></div>
        </div>'''
    html = html.replace(header_old, header_new)

# 2. Add Modal Container
if 'id="company-modal"' not in html:
    modal_html = '''
    <!-- Company Search Modal -->
    <div id="company-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content">
            <span class="modal-close" id="modal-close-btn">&times;</span>
            <div id="modal-company-header" class="modal-header"></div>
            <div id="modal-company-rates" class="modal-rates-grid"></div>
        </div>
    </div>
    '''
    # Insert before <script src="js/main.js">
    html = html.replace('<script src="js/main.js', modal_html + '\\n<script src="js/main.js')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)


# 3. Add CSS
css_path = os.path.expanduser('~/Desktop/allrates.ge/css/style.css')
with open(css_path, 'a', encoding='utf-8') as f:
    f.write('''
/* --- Company Search --- */
.company-search-container {
    position: relative;
    width: 100%;
    max-width: 300px;
}
#company-search-input {
    width: 100%;
    padding: 10px 15px 10px 38px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background-color: var(--card-bg);
    color: var(--text-main);
    font-family: inherit;
    font-size: 0.95em;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.2s;
}
#company-search-input:focus {
    border-color: var(--primary);
}
.search-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 5px;
    background-color: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    max-height: 300px;
    overflow-y: auto;
    z-index: 100;
    display: none;
}
.dropdown-item {
    padding: 12px 15px;
    cursor: pointer;
    color: var(--text-main);
    border-bottom: 1px solid var(--border);
    transition: background 0.2s;
}
.dropdown-item:last-child {
    border-bottom: none;
}
.dropdown-item:hover {
    background-color: rgba(255,255,255,0.05);
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(3px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}
.modal-content {
    background: var(--card-bg);
    padding: 30px;
    border-radius: var(--radius-lg);
    width: 90%;
    max-width: 500px;
    position: relative;
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
    animation: modalPop 0.3s ease;
}
@keyframes modalPop {
    from { opacity: 0; transform: scale(0.95) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}
.modal-close {
    position: absolute;
    top: 15px; right: 20px;
    font-size: 28px;
    color: var(--text-muted);
    cursor: pointer;
    line-height: 1;
}
.modal-close:hover { color: var(--text-main); }
.modal-header {
    display: flex;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--border);
}
.modal-rates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
}
.modal-rate-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 15px;
}
.modal-rate-title {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: var(--primary);
    margin-bottom: 10px;
    font-size: 1.1em;
}
.modal-rate-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    font-size: 0.95em;
}
.modal-rate-lbl { color: var(--text-muted); }
.modal-rate-buy { color: var(--buy-color); font-weight: bold; }
.modal-rate-sell { color: var(--sell-color); font-weight: bold; }
''')

# 4. Add JS logic to main.js
js_path = os.path.expanduser('~/Desktop/allrates.ge/js/main.js')
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# We will inject the logic inside the fetchRates.then block or just as a standalone initializer that uses originalData.
# It's safest to append it and call it after rendering, or inside renderHomePage.
# Let's just append an initialization function to the end of main.js, and call it when data arrives.

search_js = '''
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
        
        const uniqueComps = {};
        originalData.forEach(item => {
            const base = item.baseCompany || item.Company.toLowerCase();
            if (!uniqueComps[base]) {
                uniqueComps[base] = item;
            }
        });
        
        const matches = [];
        for (let base in uniqueComps) {
            const item = uniqueComps[base];
            const nameKa = COMPANY_NAMES_KA[base] || item.Company;
            const nameEn = base;
            
            if (nameKa.toLowerCase().includes(val) || nameEn.toLowerCase().includes(val)) {
                matches.push({ base: base, item: item, nameKa: nameKa });
            }
        }
        
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
'''
if '// --- Company Search Logic ---' not in js:
    js += '\n' + search_js
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js)

print("Search functionality injected!")
