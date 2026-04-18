import re

js_path = '/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace('usdData = [...originalData].sort((a, b) => a.usdSpread - b.usdSpread);', 'usdData = [...originalData]; applySorting("usd");')
js = js.replace('eurData = [...originalData].sort((a, b) => a.eurSpread - b.eurSpread);', 'eurData = [...originalData]; applySorting("eur");')
js = js.replace("renderTable('usd');\n                renderTable('eur');", "")
js = js.replace("renderTable('usd');\n                    renderTable('eur');", "")

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)
