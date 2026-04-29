import os

path = os.path.expanduser('~/Desktop/allrates.ge/js/header.js')
with open(path, 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace('color: #64748b;', 'color: var(--text-muted);')
js = js.replace("link.style.color = '#1e3a8a';", "link.style.color = 'var(--primary)';")
js = js.replace('mix-blend-mode: multiply;', 'border-radius: 8px;')

with open(path, 'w', encoding='utf-8') as f:
    f.write(js)

print("header.js updated!")
