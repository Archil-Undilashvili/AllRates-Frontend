import re

js_path = '/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Replace toggleSort function with our custom sortData and updated toggleSort if needed.
# First, let's remove the old toggleSort function.
toggle_pattern = re.compile(r'function toggleSort\(currency\) \{.*?\n        \}', re.DOTALL)
js = toggle_pattern.sub('', js)

new_sort_logic = """
        let sortConfigs = {
            usd: { column: 'spread', order: 'asc' },
            eur: { column: 'spread', order: 'asc' }
        };

        function sortData(currency, column) {
            // Toggle order if clicking same column
            if (sortConfigs[currency].column === column) {
                sortConfigs[currency].order = sortConfigs[currency].order === 'asc' ? 'desc' : 'asc';
            } else {
                // Default directions
                if (column === 'company') sortConfigs[currency].order = 'asc';
                else if (column === 'buy') sortConfigs[currency].order = 'desc';
                else if (column === 'sell') sortConfigs[currency].order = 'asc';
                else if (column === 'spread') sortConfigs[currency].order = 'asc';
                
                sortConfigs[currency].column = column;
            }

            applySorting(currency);
            
            // Sync logic for company
            if (column === 'company') {
                const otherCur = currency === 'usd' ? 'eur' : 'usd';
                sortConfigs[otherCur].column = 'company';
                sortConfigs[otherCur].order = sortConfigs[currency].order;
                applySorting(otherCur);
            }
        }

        function toggleSort(currency) {
            // This is called by the small button next to title. We'll map it to spread sort.
            sortData(currency, 'spread');
        }

        function applySorting(currency) {
            const dataArr = currency === 'usd' ? usdData : eurData;
            const config = sortConfigs[currency];
            const isAsc = config.order === 'asc' ? 1 : -1;

            dataArr.sort((a, b) => {
                if (config.column === 'company') {
                    const cA = (legalNames[a.Company.toLowerCase()] || a.Company).toLowerCase();
                    const cB = (legalNames[b.Company.toLowerCase()] || b.Company).toLowerCase();
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

            // Optional: update header icons if you want them visually represented.
        }
"""

js = js.replace('function renderTable(currency) {', new_sort_logic + '\n        function renderTable(currency) {')

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)
