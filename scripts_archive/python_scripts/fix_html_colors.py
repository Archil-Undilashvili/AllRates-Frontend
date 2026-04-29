import os

files_to_fix = [
    '~/Desktop/allrates.ge/index.html',
    '~/Desktop/allrates.ge/rates.html',
    '~/Desktop/allrates.ge/calculator.html',
    '~/Desktop/allrates.ge/official.html',
    '~/Desktop/allrates.ge/api.html',
    '~/Desktop/allrates.ge/contact.html',
]

for p in files_to_fix:
    path = os.path.expanduser(p)
    if not os.path.exists(path): continue
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Image background and borders
    content = content.replace('background: #fff; border: 1px solid #eee;', 'background: var(--card-bg); border: 1px solid var(--border);')
    # Footer
    content = content.replace('background: #ffffff; border-top: 1px solid #e2e8f0;', 'background: var(--card-bg); border-top: 1px solid var(--border);')
    # Text colors
    content = content.replace('color: #64748b;', 'color: var(--text-muted);')
    content = content.replace('color: #475569;', 'color: var(--text-main);')
    # Top header inside rates
    content = content.replace('border: 2px solid #ffffff;', 'border: 2px solid var(--card-bg);')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("HTML files updated!")
