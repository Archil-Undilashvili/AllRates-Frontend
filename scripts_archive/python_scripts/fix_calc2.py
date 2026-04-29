import os

path = os.path.expanduser('~/Desktop/allrates.ge/calculator.html')
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    replacements = {
        'background: #fff;': 'background: var(--card-bg);',
        'background-color: #f1f5f9;': 'background-color: rgba(255,255,255,0.05);',
        'color: #1e293b;': 'color: var(--text-main);',
        'color: #0f172a;': 'color: var(--text-main);',
        'color: #64748b;': 'color: var(--text-muted);',
        'color: #3b82f6;': 'color: var(--primary);',
        'border: 1px solid #e2e8f0;': 'border: 1px solid var(--border);',
        'background: #f1f5f9;': 'background: rgba(255,255,255,0.05);'
    }

    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("calculator.html second pass updated!")
