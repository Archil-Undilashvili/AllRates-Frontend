import re

js_path = '/Users/archilundilashvili/Desktop/AllRates.ge/official.html'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Add a sorter inside fetchOfficialRates right before renderTable(allRates)
sort_logic = """
                // Sort to put USD, EUR, GBP, RUB first, then alphabetical
                const priority = { 'USD': 1, 'EUR': 2, 'GBP': 3, 'RUB': 4 };
                allRates.sort((a, b) => {
                    const pA = priority[a.code] || 99;
                    const pB = priority[b.code] || 99;
                    if (pA !== pB) return pA - pB;
                    return a.code.localeCompare(b.code);
                });
                
                // Format date nicely"""

js = js.replace('// Format date nicely', sort_logic)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)
