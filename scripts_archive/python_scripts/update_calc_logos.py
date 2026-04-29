import os
import re

path = os.path.expanduser('~/Desktop/allrates.ge/calculator.html')
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

# Update the LOGOS constant in calculator.html to match the ones we just downloaded
new_logos = """const LOGOS = {
        'rico': 'Logos/rico_icon.png',
        'valuto': 'Logos/valuto_icon.png',
        'kursige': 'Logos/kursige_icon.png',
        'crystal': 'Logos/crystal_icon.png',
        'bog': 'Logos/bog_icon.png',
        'tbc': 'Logos/tbc_icon.png',
        'liberty': 'Logos/liberty_icon.png',
        'bb': 'Logos/bb_icon.png',
        'credo': 'Logos/credo_icon.png',
        'cartu': 'Logos/cartu_icon.ico',
        'inex': 'Logos/Inex.png',
        'giro': 'Logos/giro_icon.png',
        'goa': 'Logos/goa_icon.png',
        'hash': 'Logos/hash_icon.ico',
        'mbc': 'Logos/mbc_icon.png',
        'tera': 'Logos/tera_icon.png',
        'halyk': 'Logos/halyk_icon.ico',
        'is': 'Logos/is_icon.png',
        'silk': 'Logos/silk_icon.png',
        'paysera': 'Logos/paysera_icon.png'
    };"""

html = re.sub(r'const LOGOS = \{.*?\};', new_logos, html, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(html)

print("calculator logos dict updated!")
