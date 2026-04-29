import os

path = os.path.expanduser('~/Desktop/allrates.ge/css/style.css')
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix tr:hover
    content = content.replace('tr:hover { background-color: #fcfcfc; }', 'tr:hover { background-color: rgba(255, 255, 255, 0.05); }')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Hover fixed!")
