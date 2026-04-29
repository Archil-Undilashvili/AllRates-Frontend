import re
import os

path = os.path.expanduser('~/Desktop/allrates.ge/index.html')
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

# Instead of strict string matching, let's use regex to find each section by its title flag.
currencies = {
    'US.png': 'usd',
    'EU.png': 'eur',
    'GB.png': 'gbp',
    'RU.png': 'rub',
    'TR.png': 'try'
}

for img, cur in currencies.items():
    # Find <div class="home-section interactive-card" > ... <img src="Logos/US.png"
    pattern = r'<div class="home-section interactive-card"\s*>(\s*<div class="section-title"[^>]*><img src="Logos/' + img + r'")'
    replacement = r'<div class="home-section interactive-card" onclick="window.location.href=\'rates.html#' + cur + r'-container\'">\1'
    html = re.sub(pattern, replacement, html)

with open(path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Onclicks added!")
