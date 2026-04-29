import os
js_path = os.path.expanduser('~/Desktop/allrates.ge/js/main.js')
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Replace hardcoded light mode badge background
js = js.replace('background: #f1f5f9;', 'background: rgba(255,255,255,0.08);')
# Replace hardcoded dark text in JS elements
js = js.replace('color: #1e293b;', 'color: var(--text-main);')
js = js.replace('color: #64748b;', 'color: var(--text-muted);')

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("JS updated!")
