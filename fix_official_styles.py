import os

path = os.path.expanduser('~/Desktop/allrates.ge/official.html')
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    replacements = {
        'color: #1e293b;': 'color: var(--text-main);',
        'color: #0f172a;': 'color: var(--text-main);',
        'color: #64748b;': 'color: var(--text-muted);',
        'color: #94a3b8;': 'color: var(--text-muted);',
        'background: #ffffff;': 'background: var(--card-bg);',
        'background: #fff;': 'background: var(--card-bg);',
        'background-color: #ffffff;': 'background-color: var(--card-bg);',
        'background: #f8fafc;': 'background: var(--bg-color);',
        'background-color: #f8fafc;': 'background-color: var(--bg-color);',
        'background: #f1f5f9;': 'background: rgba(255,255,255,0.05);',
        'border-color: #3b82f6;': 'border-color: var(--primary);',
        'color: #3b82f6;': 'color: var(--primary);',
        'color: #ef4444;': 'color: var(--sell-color);',
        'color: #10b981;': 'color: var(--buy-color);'
    }

    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("official.html updated!")
