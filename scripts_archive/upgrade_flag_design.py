import re

html_path = '/Users/archilundilashvili/Desktop/AllRates.ge/rates.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Make the flags look more premium
old_style = 'width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 2px 6px rgba(0,0,0,0.15);'
new_style = 'width: 36px; height: 36px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border: 2px solid #ffffff;'

html = html.replace(old_style, new_style)

# Make the text layout a bit more aligned
html = html.replace('<div class="header-row" style="justify-content: center; gap: 12px; margin-bottom: 20px;">', '<div class="header-row" style="justify-content: center; align-items: center; gap: 14px; margin-bottom: 24px;">')
html = html.replace('<h2 style="margin: 0; font-size: 1.5em; color: var(--text-main); font-weight: 700;">', '<h2 style="margin: 0; font-size: 1.55em; color: var(--text-main); font-weight: 800; letter-spacing: -0.5px;">')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
