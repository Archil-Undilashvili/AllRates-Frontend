import re

js_path = '/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Let's completely replace the injected `let sortConfigs... updateHeadersUI(currency) { ... }` logic.
old_logic_pattern = re.compile(r'let sortConfigs = {.*?function updateHeadersUI\(currency\) \{.*?\}', re.DOTALL)
js = old_logic_pattern.sub('', js)

new_sort_logic = """
        let sortConfigs = {
            usd: { column: 'spread', order: 'asc' },
            eur: { column: 'spread', order: 'asc' }
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

            applySorting(currency);
            
            if (column === 'company') {
                const otherCur = currency === 'usd' ? 'eur' : 'usd';
                sortConfigs[otherCur].column = 'company';
                sortConfigs[otherCur].order = sortConfigs[currency].order;
                applySorting(otherCur);
            }
        }

        function toggleSort(currency) {
            sortData(currency, 'spread');
        }

        function applySorting(currency) {
            const dataArr = currency === 'usd' ? usdData : eurData;
            const config = sortConfigs[currency];
            const isAsc = config.order === 'asc' ? 1 : -1;

            dataArr.sort((a, b) => {
                if (config.column === 'company') {
                    const getKey = (item) => {
                        const ck = item.baseCompany || item.Company.toLowerCase();
                        let name = item.Company;
                        if (item.baseCompany && typeof COMPANY_NAMES_KA !== 'undefined' && COMPANY_NAMES_KA[item.baseCompany]) {
                            const match = item.Company.match(/\\((.*?)\\)/);
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
                    const k = currency === 'usd' ? 'USDGEL (Buy)' : 'EURGEL (Buy)';
                    const vA = parseFloat(a[k]) || 0;
                    const vB = parseFloat(b[k]) || 0;
                    return (vA - vB) * isAsc;
                } else if (config.column === 'sell') {
                    const k = currency === 'usd' ? 'USDGEL (Sell)' : 'EURGEL (Sell)';
                    const vA = parseFloat(a[k]) || Infinity;
                    const vB = parseFloat(b[k]) || Infinity;
                    return (vA - vB) * isAsc;
                } else if (config.column === 'spread') {
                    const k = currency === 'usd' ? 'usdSpread' : 'eurSpread';
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
            const btn = document.getElementById(`btn-${currency}`);
            if (btn) {
                if (sortConfigs[currency].column === 'spread') {
                    btn.innerHTML = sortConfigs[currency].order === 'asc' ? '&#9650;' : '&#9660;';
                    btn.className = sortConfigs[currency].order === 'asc' ? 'sort-btn sort-best' : 'sort-btn sort-worst';
                } else {
                    btn.innerHTML = '&#9650;';
                    btn.className = 'sort-btn';
                }
            }
            
            // Highlight table headers
            const tableHeaders = document.querySelectorAll(`#${currency}-market-box ~ table th.sortable`);
            const colMap = { company: 0, buy: 1, sell: 2, spread: 3 };
            const indexToCol = ['company', 'buy', 'sell', 'spread'];
            
            // Actually it's easier to find them by mapping:
            // Since there's one table per container, let's use the closest selector
            const tbody = document.getElementById(`${currency}-body`);
            if (tbody) {
                const thead = tbody.parentElement.querySelector('thead');
                if (thead) {
                    const ths = thead.querySelectorAll('th.sortable');
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
"""

js = js.replace('function renderTable(currency) {', new_sort_logic + '\n        function renderTable(currency) {')

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)
