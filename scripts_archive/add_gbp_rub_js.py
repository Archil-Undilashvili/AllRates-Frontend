import re

js_path = '/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Add to variables
if 'let gbpData = [];' not in js:
    js = js.replace('let eurData = [];', 'let eurData = [];\n        let gbpData = [];\n        let rubData = [];')

# Add spreads in map
old_spread = """                        eurSpread: (!isNaN(eurS) && !isNaN(eurB)) ? (eurS - eurB) : Infinity
                    };"""
new_spread = """                        eurSpread: (!isNaN(eurS) && !isNaN(eurB)) ? (eurS - eurB) : Infinity,
                        gbpSpread: (!isNaN(parseFloat(item['GBPGEL (Sell)'])) && !isNaN(parseFloat(item['GBPGEL (Buy)']))) ? (parseFloat(item['GBPGEL (Sell)']) - parseFloat(item['GBPGEL (Buy)'])) : Infinity,
                        rubSpread: (!isNaN(parseFloat(item['RUBGEL (Sell)'])) && !isNaN(parseFloat(item['RUBGEL (Buy)']))) ? (parseFloat(item['RUBGEL (Sell)']) - parseFloat(item['RUBGEL (Buy)'])) : Infinity
                    };"""
js = js.replace(old_spread, new_spread)

# Add to sortConfigs
old_configs = """let sortConfigs = {
            usd: { column: 'spread', order: 'asc' },
            eur: { column: 'spread', order: 'asc' }
        };"""
new_configs = """let sortConfigs = {
            usd: { column: 'spread', order: 'asc' },
            eur: { column: 'spread', order: 'asc' },
            gbp: { column: 'spread', order: 'asc' },
            rub: { column: 'spread', order: 'asc' }
        };"""
js = js.replace(old_configs, new_configs)

# Other parts of applySorting
js = js.replace("const dataArr = currency === 'usd' ? usdData : eurData;", "const dataArr = currency === 'usd' ? usdData : currency === 'eur' ? eurData : currency === 'gbp' ? gbpData : rubData;")

js = js.replace("const k = currency === 'usd' ? 'USDGEL (Buy)' : 'EURGEL (Buy)';", "const k = currency === 'usd' ? 'USDGEL (Buy)' : currency === 'eur' ? 'EURGEL (Buy)' : currency === 'gbp' ? 'GBPGEL (Buy)' : 'RUBGEL (Buy)';")
js = js.replace("const k = currency === 'usd' ? 'USDGEL (Sell)' : 'EURGEL (Sell)';", "const k = currency === 'usd' ? 'USDGEL (Sell)' : currency === 'eur' ? 'EURGEL (Sell)' : currency === 'gbp' ? 'GBPGEL (Sell)' : 'RUBGEL (Sell)';")
js = js.replace("const k = currency === 'usd' ? 'usdSpread' : 'eurSpread';", "const k = currency === 'usd' ? 'usdSpread' : currency === 'eur' ? 'eurSpread' : currency === 'gbp' ? 'gbpSpread' : 'rubSpread';")

js = js.replace("let dataArr = currency === 'usd' ? usdData : eurData;", "let dataArr = currency === 'usd' ? usdData : currency === 'eur' ? eurData : currency === 'gbp' ? gbpData : rubData;")

js = js.replace("let buy = currency === 'usd' ? parseFloat(item['USDGEL (Buy)']) : parseFloat(item['EURGEL (Buy)']);", "let buy = currency === 'usd' ? parseFloat(item['USDGEL (Buy)']) : currency === 'eur' ? parseFloat(item['EURGEL (Buy)']) : currency === 'gbp' ? parseFloat(item['GBPGEL (Buy)']) : parseFloat(item['RUBGEL (Buy)']);")
js = js.replace("let sell = currency === 'usd' ? parseFloat(item['USDGEL (Sell)']) : parseFloat(item['EURGEL (Sell)']);", "let sell = currency === 'usd' ? parseFloat(item['USDGEL (Sell)']) : currency === 'eur' ? parseFloat(item['EURGEL (Sell)']) : currency === 'gbp' ? parseFloat(item['GBPGEL (Sell)']) : parseFloat(item['RUBGEL (Sell)']);")
js = js.replace("let spread = currency === 'usd' ? item.usdSpread : item.eurSpread;", "let spread = currency === 'usd' ? item.usdSpread : currency === 'eur' ? item.eurSpread : currency === 'gbp' ? item.gbpSpread : item.rubSpread;")


render_ifs = """                let buy, sell, spread;
                if (currency === 'usd') {
                    buy = parseFloat(item['USDGEL (Buy)']);
                    sell = parseFloat(item['USDGEL (Sell)']);
                    spread = item.usdSpread;
                } else {
                    buy = parseFloat(item['EURGEL (Buy)']);
                    sell = parseFloat(item['EURGEL (Sell)']);
                    spread = item.eurSpread;
                }"""
new_render_ifs = """                let buy, sell, spread;
                if (currency === 'usd') {
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
js = js.replace(render_ifs, new_render_ifs)

# Formatting for empty data ("---")
old_display = """                let buyDisplay = isNaN(buy) ? '' : (buy === bestBuy ? `${buy.toFixed(3)}<span class="best-dot" title="საუკეთესო კურსი"></span>` : buy.toFixed(3));
                let sellDisplay = isNaN(sell) ? '' : (sell === bestSell ? `${sell.toFixed(3)}<span class="best-dot" title="საუკეთესო კურსი"></span>` : sell.toFixed(3));
                let spreadDisplay = (isNaN(spread) || spread === Infinity) ? '' : spread.toFixed(3);"""
new_display = """                let buyDisplay = isNaN(buy) ? '<span style="color:#cbd5e1;">- - -</span>' : (buy === bestBuy ? `${buy.toFixed(3)}<span class="best-dot" title="საუკეთესო კურსი"></span>` : buy.toFixed(3));
                let sellDisplay = isNaN(sell) ? '<span style="color:#cbd5e1;">- - -</span>' : (sell === bestSell ? `${sell.toFixed(3)}<span class="best-dot" title="საუკეთესო კურსი"></span>` : sell.toFixed(3));
                let spreadDisplay = (isNaN(spread) || spread === Infinity) ? '<span style="color:#cbd5e1;">- - -</span>' : spread.toFixed(3);"""
js = js.replace(old_display, new_display)

# Initial sorts in `fetchRates` and `loadCachedData`
js = js.replace('eurData = [...originalData]; applySorting("eur");', 'eurData = [...originalData]; applySorting("eur");\n                gbpData = [...originalData]; applySorting("gbp");\n                rubData = [...originalData]; applySorting("rub");')

# Syncing 'company' sort to all others
old_sync = """            if (column === 'company') {
                const otherCur = currency === 'usd' ? 'eur' : 'usd';
                sortConfigs[otherCur].column = 'company';
                sortConfigs[otherCur].order = sortConfigs[currency].order;
                applySorting(otherCur);
            }"""
new_sync = """            if (column === 'company') {
                const curs = ['usd', 'eur', 'gbp', 'rub'];
                curs.forEach(cur => {
                    if (cur !== currency) {
                        sortConfigs[cur].column = 'company';
                        sortConfigs[cur].order = sortConfigs[currency].order;
                        applySorting(cur);
                    }
                });
            }"""
js = js.replace(old_sync, new_sync)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)
