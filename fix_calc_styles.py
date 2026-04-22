import os

path = os.path.expanduser('~/Desktop/allrates.ge/calculator.html')
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacing colors in <style> block of calculator.html
    replacements = {
        'color: #1e293b;': 'color: var(--text-main);',
        'color: #64748b;': 'color: var(--text-muted);',
        'color: #94a3b8;': 'color: var(--text-muted);',
        'background: #ffffff;': 'background: var(--card-bg);',
        'background-color: #ffffff;': 'background-color: var(--card-bg);',
        'background: #f8fafc;': 'background: var(--bg-color);',
        'background-color: #f8fafc;': 'background-color: var(--bg-color);',
        'border: 1px solid #e2e8f0;': 'border: 1px solid var(--border);',
        'border-bottom: 1px solid #e2e8f0;': 'border-bottom: 1px solid var(--border);',
        'border: 2px solid #e2e8f0;': 'border: 2px solid var(--border);',
        'background: #e2e8f0;': 'background: var(--border);',
        'box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);': 'box-shadow: var(--shadow-md);',
        'box-shadow: 0 10px 30px rgba(0,0,0,0.06);': 'box-shadow: var(--shadow-lg);',
        'color: #1e3a8a;': 'color: var(--primary);',
        'color: #cbd5e1;': 'color: var(--text-muted);'
    }

    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("calculator.html styles updated!")
