import os
import re

filepath = os.path.expanduser('~/Desktop/allrates.ge/js/main.js')
with open(filepath, 'r', encoding='utf-8') as f:
    js_content = f.read()

# 1. Remove leader from BANK_COMPANIES
js_content = js_content.replace("'procredit', 'leader']", "'procredit']")

# 2. Add leader and procredit to COMPANY_URLS
js_content = js_content.replace("'paysera': 'https://www.paysera.ge/v2/ka-GE/index'", "'paysera': 'https://www.paysera.ge/v2/ka-GE/index',\n        'procredit': 'https://procreditbank.ge/',\n        'leader': 'https://leadercredit.ge/'")

# 3. Add leader and procredit to COMPANY_INFO_DATA
info_data_replace = """    'mbc': { fullName: 'შპს "მიკრო ბიზნეს კაპიტალი (MBC)"', branches: ['წერეთლის გამზ. 114', 'ალ. ყაზბეგის 15', 'პეკინის გამზ. 14', 'ქეთევან დედოფლის გამზ. 67'], mapUrl: 'https://mbc.com.ge/ka/contact/branches' }
};"""
info_data_new = """    'mbc': { fullName: 'შპს "მიკრო ბიზნეს კაპიტალი (MBC)"', branches: ['წერეთლის გამზ. 114', 'ალ. ყაზბეგის 15', 'პეკინის გამზ. 14', 'ქეთევან დედოფლის გამზ. 67'], mapUrl: 'https://mbc.com.ge/ka/contact/branches' },
    'procredit': { fullName: 'სს "პროკრედიტ ბანკი"', branches: ['ალ. ყაზბეგის გამზ. 21 (სათაო ოფისი)', 'წერეთლის გამზ. 105', 'დავით აღმაშენებლის გამზ. 154', 'რუსთაველის გამზ. 31'], mapUrl: 'https://www.procreditbank.ge/ge/contact' },
    'leader': { fullName: 'შპს "ლიდერ კრედიტი"', branches: ['თბილისი, დადიანის ქ. 7', 'თბილისი, ჭავჭავაძის გამზ. 39', 'ბათუმი, გორგილაძის ქ. 54', 'ქუთაისი, წერეთლის ქ. 2'], mapUrl: 'https://leadercredit.ge' }
};"""
js_content = js_content.replace(info_data_replace, info_data_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(js_content)
print("done")
