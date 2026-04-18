import re

html_path = '/Users/archilundilashvili/Desktop/AllRates.ge/rates.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

usd_old = """            <div class="header-row">
                <h2>USD / GEL</h2>
                <button id="btn-usd" class="sort-btn sort-best" onclick="toggleSort('usd')" title="სორტირება სპრედით">&#9650;</button>
            </div>"""

usd_new = """            <div class="header-row" style="justify-content: center; gap: 12px; margin-bottom: 20px;">
                <img src="Logos/US.png" alt="US Flag" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
                <h2 style="margin: 0; font-size: 1.5em; color: var(--text-main); font-weight: 700;">USD <span style="color: #64748b; font-weight: 400;">/</span> GEL</h2>
            </div>"""

eur_old = """            <div class="header-row">
                <h2>EUR / GEL</h2>
                <button id="btn-eur" class="sort-btn sort-best" onclick="toggleSort('eur')" title="სორტირება სპრედით">&#9650;</button>
            </div>"""

eur_new = """            <div class="header-row" style="justify-content: center; gap: 12px; margin-bottom: 20px;">
                <img src="Logos/EU.png" alt="EU Flag" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
                <h2 style="margin: 0; font-size: 1.5em; color: var(--text-main); font-weight: 700;">EUR <span style="color: #64748b; font-weight: 400;">/</span> GEL</h2>
            </div>"""

html = html.replace(usd_old, usd_new)
html = html.replace(eur_old, eur_new)

# if toggleSort button exists with different whitespace:
if usd_old not in html:
    # use regex
    html = re.sub(r'<div class="header-row">\s*<h2>USD / GEL</h2>\s*<button id="btn-usd"[^>]+>.*?</button>\s*</div>', usd_new, html)
    html = re.sub(r'<div class="header-row">\s*<h2>EUR / GEL</h2>\s*<button id="btn-eur"[^>]+>.*?</button>\s*</div>', eur_new, html)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
