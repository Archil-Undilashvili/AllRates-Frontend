import re

html_path = '/Users/archilundilashvili/Desktop/AllRates.ge/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Make the flags look more premium
old_style = 'width: 28px; height: 28px; border-radius: 50%; object-fit: cover; box-shadow: 0 1px 3px rgba(0,0,0,0.1);'
new_style = 'width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border: 2px solid #ffffff;'

html = html.replace(old_style, new_style)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
