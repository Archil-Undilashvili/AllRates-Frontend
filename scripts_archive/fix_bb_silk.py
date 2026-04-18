import re
import os

js_path = '/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update LOGOS (rename slik to silk)
js = js.replace("'paysera': 'Logos/PAYSERA.png'", "'paysera': 'Logos/PAYSERA.png',\n            'silk': 'Logos/silk.png'")

# 2. Update ALL_COMPANIES and BANK_COMPANIES
js = js.replace("['rico', 'valuto', 'kursige', 'crystal', 'bog', 'tbc', 'liberty', 'bb', 'credo', 'cartu', 'inex', 'giro', 'goa', 'hash', 'mbc', 'tera', 'halyk', 'is']", "['rico', 'valuto', 'kursige', 'crystal', 'bog', 'tbc', 'liberty', 'bb', 'credo', 'cartu', 'inex', 'giro', 'goa', 'hash', 'mbc', 'tera', 'halyk', 'is', 'silk']")
js = js.replace("['bog', 'tbc', 'liberty', 'bb', 'credo', 'cartu', 'hash', 'tera', 'halyk', 'is']", "['bog', 'tbc', 'liberty', 'bb', 'credo', 'cartu', 'hash', 'tera', 'halyk', 'is', 'silk']")

# 3. Update baseCompany mapping
old_base_logic = """if (base === 'hashbank') base = 'hash';"""
new_base_logic = """if (base === 'hashbank') base = 'hash';
                            if (base === 'basisbank') base = 'bb';"""
js = js.replace(old_base_logic, new_base_logic)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)
    
os.rename('/Users/archilundilashvili/Desktop/AllRates.ge/Logos/slik.png', '/Users/archilundilashvili/Desktop/AllRates.ge/Logos/silk.png')
print("Fixed!")
