import os
import re

# Fix JS header
filepath_js = os.path.expanduser('~/Desktop/allrates.ge/js/header.js')
with open(filepath_js, 'r', encoding='utf-8') as f:
    js_content = f.read()

js_content = js_content.replace('გაცვლითი კურსები ქართულ ბაზარზე', 'ვალუტის კურსები ქართულ ბაზარზე')
# Replace and add subtitle in span for header
js_content = js_content.replace('მოძებნე საუკეთესო კურსი', 'კონვერტაციის კალკულატორი <span style="font-size: 11px; display: block; text-transform: none; font-weight: normal; margin-top: 2px;">(მოძებნე საუკეთესო კურსი)</span>')

with open(filepath_js, 'w', encoding='utf-8') as f:
    f.write(js_content)


# Fix index.html texts if any
filepath_html = os.path.expanduser('~/Desktop/allrates.ge/index.html')
with open(filepath_html, 'r', encoding='utf-8') as f:
    html_content = f.read()

html_content = html_content.replace('გაცვლითი კურსები ქართულ ბაზარზე', 'ვალუტის კურსები ქართულ ბაზარზე')
html_content = html_content.replace('მოძებნე საუკეთესო კურსი', 'კონვერტაციის კალკულატორი <span style="font-size: 11px; display: block; font-weight: normal; margin-top: 2px;">(მოძებნე საუკეთესო კურსი)</span>')

with open(filepath_html, 'w', encoding='utf-8') as f:
    f.write(html_content)
    
# Fix calculator.html texts if any
filepath_calc = os.path.expanduser('~/Desktop/allrates.ge/calculator.html')
with open(filepath_calc, 'r', encoding='utf-8') as f:
    calc_content = f.read()

calc_content = calc_content.replace('გაცვლითი კურსები ქართულ ბაზარზე', 'ვალუტის კურსები ქართულ ბაზარზე')

with open(filepath_calc, 'w', encoding='utf-8') as f:
    f.write(calc_content)

print("done")
