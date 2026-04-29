import os
import re

path = os.path.expanduser('~/Desktop/allrates.ge/js/main.js')
with open(path, 'r', encoding='utf-8') as f:
    js = f.read()

new_names = """const COMPANY_NAMES_KA = {
            'rico': 'რიკო ექსპრესი',
            'valuto': 'ვალუტო',
            'kursige': 'კურსი',
            'crystal': 'კრისტალი',
            'bog': 'საქართველოს ბანკი',
            'tbc': 'თიბისი',
            'liberty': 'ლიბერთი',
            'bb': 'ბაზისბანკი',
            'credo': 'კრედო',
            'cartu': 'ქართუ',
            'inex': 'ინტელიექსპრესი',
            'giro': 'გირო კრედიტი',
            'goa': 'გოა კრედიტი',
            'hash': 'ჰაშ ბანკი',
            'mbc': 'MBC',
            'tera': 'ტერაბანკი',
            'halyk': 'ხალიკ ბანკი',
            'is': 'იშბანკი',
            'silk': 'სილქ ბანკი',
            'paysera': 'Paysera'
        };"""

js = re.sub(r'const COMPANY_NAMES_KA = \{.*?\};', new_names, js, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(js)

print("COMPANY_NAMES_KA updated in main.js!")
