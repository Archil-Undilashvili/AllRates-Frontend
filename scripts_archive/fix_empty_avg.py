import re

js_path = '/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

old_avg = "const avgBuyDom = countAvg > 0 ? (totalBuyAvg / countAvg).toFixed(3) : '--.---';"
new_avg = "const avgBuyDom = countAvg > 0 ? (totalBuyAvg / countAvg).toFixed(3) : '- - -';"
js = js.replace(old_avg, new_avg)

js = js.replace("const avgSellDom = countAvg > 0 ? (totalSellAvg / countAvg).toFixed(3) : '--.---';", "const avgSellDom = countAvg > 0 ? (totalSellAvg / countAvg).toFixed(3) : '- - -';")
js = js.replace("const avgSpreadDom = countAvg > 0 ? ((totalSellAvg / countAvg) - (totalBuyAvg / countAvg)).toFixed(3) : '--.---';", "const avgSpreadDom = countAvg > 0 ? ((totalSellAvg / countAvg) - (totalBuyAvg / countAvg)).toFixed(3) : '- - -';")

# also for empty set
js = js.replace("setInnerText(`${currency}-market-buy`, '--.---');", "setInnerText(`${currency}-market-buy`, '- - -');")
js = js.replace("setInnerText(`${currency}-market-sell`, '--.---');", "setInnerText(`${currency}-market-sell`, '- - -');")
js = js.replace("setInnerText(`${currency}-market-spread`, '--.---');", "setInnerText(`${currency}-market-spread`, '- - -');")

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)
