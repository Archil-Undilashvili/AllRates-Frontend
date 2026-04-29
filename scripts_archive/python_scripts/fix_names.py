import re
import os

files = ['~/Desktop/allrates.ge/js/main.js', '~/Desktop/allrates.ge/calculator.html']

new_dict = """const COMPANY_NAMES_KA = {
        'rico': 'რიკო',
        'valuto': 'ვალუტო',
        'kursige': 'კურსიჯი',
        'crystal': 'კრისტალი',
        'bog': 'საქართველოს ბანკი',
        'tbc': 'თიბისი',
        'liberty': 'ლიბერთი',
        'bb': 'ბაზისბანკი',
        'credo': 'კრედო ბანკი',
        'cartu': 'ბანკი ქართუ',
        'inex': 'ინტელიექსპრესი',
        'giro': 'გირო კრედიტი',
        'goa': 'გოა კრედიტი',
        'hash': 'ჰაშ ბანკი',
        'mbc': 'ემბისი',
        'tera': 'ტერაბანკი',
        'halyk': 'ხალიკ ბანკი',
        'is': 'იშბანკი',
        'silk': 'სილქ ბანკი',
        'paysera': 'Paysera'
    };"""

for p in files:
    path = os.path.expanduser(p)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        content = re.sub(r'const COMPANY_NAMES_KA = \{.*?\};', new_dict, content, flags=re.DOTALL)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {p}")
