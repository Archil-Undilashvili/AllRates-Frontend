import os

# Fix 1: Increase font size of subtitle in header.js
filepath_js = os.path.expanduser('~/Desktop/allrates.ge/js/header.js')
with open(filepath_js, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Replace font-size: 10px; with font-size: 12px; in the specific span
js_content = js_content.replace('font-size: 10px;', 'font-size: 12px;')

with open(filepath_js, 'w', encoding='utf-8') as f:
    f.write(js_content)

# Fix 2: Change title in index.html
filepath_html = os.path.expanduser('~/Desktop/allrates.ge/index.html')
with open(filepath_html, 'r', encoding='utf-8') as f:
    html_content = f.read()

html_content = html_content.replace('საერთაშორისო კურსები', 'Forex ვალუტის კურსები')

with open(filepath_html, 'w', encoding='utf-8') as f:
    f.write(html_content)

print("done")
