import os

html_path = os.path.expanduser('~/Desktop/allrates.ge/rates.html')
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# We missed the exact text replacement because of newlines.
old_header = """<div class="header-wrapper">
        <h1>მიმდინარე კურსები</h1>"""

new_header = """<div class="header-wrapper" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
        <h1 style="margin: 0;">მიმდინარე კურსები</h1>
        <div class="company-search-container">
            <svg style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted);" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="company-search-input" placeholder="მოძებნე კომპანია..." autocomplete="off">
            <div id="company-search-dropdown" class="search-dropdown"></div>
        </div>"""

if 'id="company-search-input"' not in html:
    html = html.replace(old_header, new_header)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Search html fixed!")
