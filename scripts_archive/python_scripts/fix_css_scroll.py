import os

path = os.path.expanduser('~/Desktop/allrates.ge/css/style.css')
with open(path, 'r', encoding='utf-8') as f:
    css = f.read()

if 'scroll-margin-top' not in css:
    css = css.replace('.container {', '.container {\\n            scroll-margin-top: 20px;')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(css)

