import re

js_path = '/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

old_dom = """            const usdStats = calculateStats('usd');
            const eurStats = calculateStats('eur');

            updateDom('usd', usdStats);
            updateDom('eur', eurStats);"""

new_dom = """            ['usd', 'eur', 'gbp', 'rub'].forEach(currency => {
                const stats = calculateStats(currency);
                updateDom(currency, stats);
            });"""

if old_dom in js:
    js = js.replace(old_dom, new_dom)
else:
    # Use regex
    js = re.sub(r'const usdStats = calculateStats\(\'usd\'\);\s*const eurStats = calculateStats\(\'eur\'\);\s*updateDom\(\'usd\', usdStats\);\s*updateDom\(\'eur\', eurStats\);', new_dom, js)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)
print("Dom logic updated!")
