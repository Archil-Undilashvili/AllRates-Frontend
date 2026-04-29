import re
import os

# Fix rates.html IDs
path = os.path.expanduser('~/Desktop/allrates.ge/rates.html')
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

# I will replace the first 5 <div class="container"> with ids
html = html.replace('<div class="container">', '<div class="container" id="usd-container">', 1)
html = html.replace('<div class="container">', '<div class="container" id="eur-container">', 1)
html = html.replace('<div class="container">', '<div class="container" id="gbp-container">', 1)
html = html.replace('<div class="container">', '<div class="container" id="rub-container">', 1)
html = html.replace('<div class="container">', '<div class="container" id="try-container">', 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(html)


# Fix index.html links to point to -container instead of -market-box
idx_path = os.path.expanduser('~/Desktop/allrates.ge/index.html')
with open(idx_path, 'r', encoding='utf-8') as f:
    idx = f.read()

idx = idx.replace('rates.html#usd-market-box', 'rates.html#usd-container')
idx = idx.replace('rates.html#eur-market-box', 'rates.html#eur-container')
idx = idx.replace('rates.html#gbp-market-box', 'rates.html#gbp-container')
idx = idx.replace('rates.html#rub-market-box', 'rates.html#rub-container')
idx = idx.replace('rates.html#try-market-box', 'rates.html#try-container')

with open(idx_path, 'w', encoding='utf-8') as f:
    f.write(idx)

print("IDs and links updated!")
