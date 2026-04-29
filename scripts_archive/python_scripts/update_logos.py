import os
import re

js_path = os.path.expanduser('~/Desktop/allrates.ge/js/main.js')
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Find the LOGOS block
logos_match = re.search(r'const LOGOS = \{.*?\};', js, re.DOTALL)
if logos_match:
    old_logos_block = logos_match.group(0)
    
    # We want to replace it.
    new_logos_block = """const LOGOS = {
            'rico': 'Logos/rico_icon.png',
            'valuto': 'Logos/valuto_icon.png',
            'kursige': 'Logos/kursige_icon.png',
            'crystal': 'Logos/crystal_icon.png',
            'bog': 'Logos/bog_icon.png',
            'tbc': 'Logos/tbc_icon.png',
            'liberty': 'Logos/liberty_icon.png',
            'bb': 'Logos/bb_icon.png',
            'credo': 'Logos/credo_icon.png',
            'cartu': 'Logos/cartu.png',
            'inex': 'Logos/Inex.png',
            'giro': 'Logos/giro_icon.png',
            'goa': 'Logos/goa_icon.png',
            'hash': 'Logos/Hash.png',
            'mbc': 'Logos/mbc_icon.png',
            'tera': 'Logos/tera_icon.png',
            'halyk': 'Logos/HALYK.png',
            'is': 'Logos/is_icon.png',
            'silk': 'Logos/silk_icon.png',
            'paysera': 'Logos/paysera_icon.png'
        };"""
    
    js = js.replace(old_logos_block, new_logos_block)
    
    # Also adjust the container style. The user wants the logo to occupy 90% and NOT be just an object-fit of a horizontal logo.
    # Actually, now that we have squarish favicons, they look good filling 100%.
    
with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("JS LOGOS updated!")
