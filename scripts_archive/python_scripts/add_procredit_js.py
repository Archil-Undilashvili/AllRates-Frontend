import os
import re

filepath = os.path.expanduser('~/Desktop/allrates.ge/js/main.js')
with open(filepath, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Add to BANK_COMPANIES
js_content = js_content.replace("'tera', 'halyk', 'is', 'silk'", "'tera', 'halyk', 'is', 'silk', 'procredit'")

# Add to COMPANY_NAMES_KA
js_content = js_content.replace("'silk': 'სილქ ბანკი',", "'silk': 'სილქ ბანკი',\n        'procredit': 'პროკრედიტ ბანკი',")

# Ensure it's mapped in the new API response logic if base mapping is required
mapping_code = """if (base === 'isbank') base = 'is';
                            if (base === 'terabank') base = 'tera';
                            if (base === 'inteliexpress' || base === 'inteli' || item.company.toLowerCase().includes('inex')) base = 'inex';
                            if (base === 'cartubank') base = 'cartu';
                            if (base === 'hashbank') base = 'hash';
                            if (base === 'basisbank') base = 'bb';"""

mapping_code_new = mapping_code + "\n                            if (base === 'procredit') base = 'procredit';"

js_content = js_content.replace(mapping_code, mapping_code_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(js_content)

print("done")
