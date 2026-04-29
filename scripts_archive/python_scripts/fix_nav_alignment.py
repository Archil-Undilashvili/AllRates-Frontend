import os

filepath_js = os.path.expanduser('~/Desktop/allrates.ge/js/header.js')
with open(filepath_js, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Current text
old_html = 'კონვერტაციის კალკულატორი <span style="font-size: 11px; display: block; text-transform: none; font-weight: normal; margin-top: 2px;">(მოძებნე საუკეთესო კურსი)</span>'

# New text with absolute positioning to fix alignment and centering
# Adding position: relative to the <a> tag is required. We'll modify the style inline.
new_html = 'კონვერტაციის კალკულატორი <span style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); font-size: 10px; text-transform: none; font-weight: normal; margin-top: 4px; white-space: nowrap; text-align: center; color: var(--text-muted);">(მოძებნე საუკეთესო კურსი)</span>'

js_content = js_content.replace(old_html, new_html)

# Now inject position: relative into that specific link
js_content = js_content.replace('data-page="calculator" style="text-decoration: none;', 'data-page="calculator" style="position: relative; text-decoration: none;')

with open(filepath_js, 'w', encoding='utf-8') as f:
    f.write(js_content)


# Also fix index.html just in case there's an inline header
filepath_html = os.path.expanduser('~/Desktop/allrates.ge/index.html')
with open(filepath_html, 'r', encoding='utf-8') as f:
    html_content = f.read()

if old_html in html_content:
    html_content = html_content.replace(old_html, new_html)
    html_content = html_content.replace('data-page="calculator" style="text-decoration: none;', 'data-page="calculator" style="position: relative; text-decoration: none;')
    with open(filepath_html, 'w', encoding='utf-8') as f:
        f.write(html_content)

print("done")
