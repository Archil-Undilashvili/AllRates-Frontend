import re

js_path = '/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Fix Crystal RUB data fetching logic
old_fetch = """                                'RUBGEL (Buy)': item.rubBuy,
                                'RUBGEL (Sell)': item.rubSell,
                                'Update Time': item.tbilisiDateString || item.createdAt
                            };"""

new_fetch = """                                'RUBGEL (Buy)': (base === 'crystal' && parseFloat(item.rubBuy) > 1) ? (parseFloat(item.rubBuy) / 100).toFixed(4) : item.rubBuy,
                                'RUBGEL (Sell)': (base === 'crystal' && parseFloat(item.rubSell) > 1) ? (parseFloat(item.rubSell) / 100).toFixed(4) : item.rubSell,
                                'Update Time': item.tbilisiDateString || item.createdAt
                            };"""

js = js.replace(old_fetch, new_fetch)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)
print("Crystal RUB logic updated!")
