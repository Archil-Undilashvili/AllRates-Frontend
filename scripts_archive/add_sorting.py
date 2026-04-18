import re
import os

html_path = '/Users/archilundilashvili/Desktop/AllRates.ge/rates.html'
js_path = '/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js'

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Update headers for USD
html = html.replace('<th>კომპანია</th>', '<th class="sortable" onclick="sortData(\'usd\', \'company\')">კომპანია <span class="sort-icon"></span></th>', 1)
html = html.replace('<th>ყიდვა</th>', '<th class="sortable" onclick="sortData(\'usd\', \'buy\')">ყიდვა <span class="sort-icon"></span></th>', 1)
html = html.replace('<th>გაყიდვა</th>', '<th class="sortable" onclick="sortData(\'usd\', \'sell\')">გაყიდვა <span class="sort-icon"></span></th>', 1)
html = html.replace('<th>სპრედი</th>', '<th class="sortable" onclick="sortData(\'usd\', \'spread\')">სპრედი <span class="sort-icon"></span></th>', 1)

# Update headers for EUR
html = html.replace('<th>კომპანია</th>', '<th class="sortable" onclick="sortData(\'eur\', \'company\')">კომპანია <span class="sort-icon"></span></th>', 1)
html = html.replace('<th>ყიდვა</th>', '<th class="sortable" onclick="sortData(\'eur\', \'buy\')">ყიდვა <span class="sort-icon"></span></th>', 1)
html = html.replace('<th>გაყიდვა</th>', '<th class="sortable" onclick="sortData(\'eur\', \'sell\')">გაყიდვა <span class="sort-icon"></span></th>', 1)
html = html.replace('<th>სპრედი</th>', '<th class="sortable" onclick="sortData(\'eur\', \'spread\')">სპრედი <span class="sort-icon"></span></th>', 1)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
