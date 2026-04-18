import re
import os

# 1. Update CSS
css_path = '/Users/archilundilashvili/Desktop/AllRates.ge/css/style.css'
with open(css_path, 'a', encoding='utf-8') as f:
    f.write("\n.expand-btn-container { text-align: center; margin-top: 15px; padding-bottom: 10px; }\n.expand-btn { background: none; border: none; color: var(--primary); font-weight: 600; font-size: 14px; cursor: pointer; padding: 8px 16px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 5px; border-radius: 6px; }\n.expand-btn:hover { background: rgba(30, 58, 138, 0.05); }\n")

# 2. Update HTML
html_path = '/Users/archilundilashvili/Desktop/AllRates.ge/rates.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

for cur in ['usd', 'eur', 'gbp', 'rub']:
    pattern = f'(<tbody id="{cur}-body"></tbody>\s*</table>)'
    replacement = f'\\1\n            <div class="expand-btn-container" id="{cur}-expand-container" style="display: none;">\n                <button class="expand-btn" id="{cur}-expand-btn" onclick="toggleExpand(\'{cur}\')">მეტის ნახვა &#9660;</button>\n            </div>'
    if f'id="{cur}-expand-container"' not in html:
        html = re.sub(pattern, replacement, html)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

# 3. Update JS
js_path = '/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

if 'let expandedStates =' not in js:
    js = js.replace('let sortConfigs = {', 'let expandedStates = { usd: false, eur: false, gbp: false, rub: false };\n\n        function toggleExpand(currency) {\n            expandedStates[currency] = !expandedStates[currency];\n            renderTable(currency);\n        }\n\n        let sortConfigs = {')

# Auto expand on sort
js = js.replace('applySorting(currency);', 'expandedStates[currency] = true;\n            applySorting(currency);')
js = js.replace("sortConfigs[cur].order = sortConfigs[currency].order;\n                        applySorting(cur);", "sortConfigs[cur].order = sortConfigs[currency].order;\n                        expandedStates[cur] = true;\n                        applySorting(cur);")

# Update render logic to slice
new_loop_start = """const countAvg = top10ForAvg.length;

            const visibleData = (expandedStates[currency] || dataToRender.length <= 10) ? dataToRender : dataToRender.slice(0, 10);
            visibleData.forEach(item => {"""

js = re.sub(r'const countAvg = top10ForAvg\.length;\s+dataToRender\.forEach\(item => \{', new_loop_start, js)

# End of renderTable to update button text/visibility
old_end = r'setInnerText\(`\$\{currency\}-market-spread`, avgSpreadDom\);\n\s*\}'
new_end = """setInnerText(`${currency}-market-spread`, avgSpreadDom);
            
            const expandContainer = document.getElementById(`${currency}-expand-container`);
            const expandBtn = document.getElementById(`${currency}-expand-btn`);
            if (expandContainer && expandBtn) {
                if (dataToRender.length > 10) {
                    expandContainer.style.display = 'block';
                    if (expandedStates[currency]) {
                        expandBtn.innerHTML = 'აკეცვა &#9650;';
                    } else {
                        expandBtn.innerHTML = 'მეტის ნახვა &#9660;';
                    }
                } else {
                    expandContainer.style.display = 'none';
                }
            }
        }"""
js = re.sub(old_end, new_end, js)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("Logic Added")
