import re

js_path = '/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

old_calc = """                    if (currency === 'usd') {
                        buy = parseFloat(item['USDGEL (Buy)']);
                        sell = parseFloat(item['USDGEL (Sell)']);
                        spread = item.usdSpread;
                    } else {
                        buy = parseFloat(item['EURGEL (Buy)']);
                        sell = parseFloat(item['EURGEL (Sell)']);
                        spread = item.eurSpread;
                    }"""

new_calc = """                    if (currency === 'usd') {
                        buy = parseFloat(item['USDGEL (Buy)']);
                        sell = parseFloat(item['USDGEL (Sell)']);
                        spread = item.usdSpread;
                    } else if (currency === 'eur') {
                        buy = parseFloat(item['EURGEL (Buy)']);
                        sell = parseFloat(item['EURGEL (Sell)']);
                        spread = item.eurSpread;
                    } else if (currency === 'gbp') {
                        buy = parseFloat(item['GBPGEL (Buy)']);
                        sell = parseFloat(item['GBPGEL (Sell)']);
                        spread = item.gbpSpread;
                    } else {
                        buy = parseFloat(item['RUBGEL (Buy)']);
                        sell = parseFloat(item['RUBGEL (Sell)']);
                        spread = item.rubSpread;
                    }"""
js = js.replace(old_calc, new_calc)

old_update = """            ['usd', 'eur'].forEach(currency => {
                const stats = calculateStats(currency);
                updateDom(currency, stats);
            });"""
new_update = """            ['usd', 'eur', 'gbp', 'rub'].forEach(currency => {
                const stats = calculateStats(currency);
                updateDom(currency, stats);
            });"""
js = js.replace(old_update, new_update)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)
print("Updated home page stats logic!")
