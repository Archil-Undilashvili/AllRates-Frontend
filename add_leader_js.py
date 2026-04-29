import os
import re

filepath = os.path.expanduser('~/Desktop/allrates.ge/js/main.js')
with open(filepath, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Add to ALL_COMPANIES, MFO_COMPANIES
js_content = js_content.replace("'procredit']", "'procredit', 'leader']")
js_content = js_content.replace("'goa', 'mbc']", "'goa', 'mbc', 'leader']")

# Add to COMPANY_NAMES_KA
js_content = js_content.replace("'procredit': 'პროკრედიტ ბანკი',", "'procredit': 'პროკრედიტ ბანკი',\n        'leader': 'ლიდერ კრედიტი',")

# Add to LOGOS
js_content = js_content.replace("'procredit': 'Logos/procredit.jpg',", "'procredit': 'Logos/procredit.jpg',\n            'leader': 'Logos/leader.jpg',")

# Base mapping
mapping_code = """if (base === 'procredit') base = 'procredit';"""
mapping_code_new = mapping_code + "\n                            if (base === 'leader') base = 'leader';"
js_content = js_content.replace(mapping_code, mapping_code_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(js_content)
print("done")
