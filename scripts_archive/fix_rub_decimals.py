import re

js_path = '/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Replace .toFixed(3) with .toFixed(currency === 'rub' ? 4 : 3)
js = js.replace(".toFixed(3)", ".toFixed(currency === 'rub' ? 4 : 3)")

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)
print("Decimals logic updated!")
