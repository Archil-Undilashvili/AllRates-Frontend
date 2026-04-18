import re

html_path = '/Users/archilundilashvili/Desktop/AllRates.ge/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('</div><!-- Box 2 -->', '<!-- Box 2 -->')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
