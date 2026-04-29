import os
import re

css_path = os.path.expanduser('~/Desktop/allrates.ge/css/style.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Replacements
css = css.replace('background: #ffffff;', 'background: var(--card-bg);')
css = css.replace('background-color: #ffffff;', 'background-color: var(--card-bg);')
css = css.replace('border: 1px solid #e2e8f0;', 'border: 1px solid var(--border);')
css = css.replace('border-bottom: 1px solid #e2e8f0;', 'border-bottom: 1px solid var(--border);')
css = css.replace('border-right: 1px solid #e2e8f0;', 'border-right: 1px solid var(--border);')
css = css.replace('background: #e2e8f0;', 'background: var(--border);') # tabs bg
css = css.replace('background-color: #2c3e50;', 'background-color: #0b1120;') # market-rate-box (darker than slate-800)
css = css.replace('background-color: #f0f0f0;', 'background-color: rgba(255,255,255,0.1);') # sort-btn hover
css = css.replace('background-color: #f0f4f8;', 'background-color: rgba(255,255,255,0.1);') # nav a hover
css = css.replace('background: #f8fafc;', 'background: rgba(255,255,255,0.02);') # home-section, intl-rate-item
css = css.replace('background: #f1f1f1;', 'background: var(--bg-color);') # scrollbar track
css = css.replace('background-color: #f8fafc;', 'background-color: var(--bg-color);')
css = css.replace('color: #1e293b;', 'color: var(--text-main);')
css = css.replace('color: #64748b;', 'color: var(--text-muted);')
css = css.replace('color: #475569;', 'color: var(--text-main);')
css = css.replace('color: #1e3a8a;', 'color: var(--primary);')
css = css.replace('border: 2px solid #ffffff;', 'border: 2px solid var(--card-bg);')

# Also fix the header logo drop shadow to stand out better in dark mode
# Filter drop-shadow will be easier if we just remove the specific box-shadow or change to white shadow? Let's leave images alone for now.
# Tables header rows
css = css.replace('background-color: #f8fafc;', 'background-color: var(--bg-color);')
css = css.replace('border-bottom: 2px solid #e2e8f0;', 'border-bottom: 2px solid var(--border);')
css = css.replace('border-bottom: 1px solid #f1f5f9;', 'border-bottom: 1px solid var(--border);')
css = css.replace('color: #64748b', 'color: var(--text-muted)')
css = css.replace('color: #1e293b', 'color: var(--text-main)')

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

print("CSS updated for Dark Mode!")
