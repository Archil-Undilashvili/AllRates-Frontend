import re

js_path = '/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

badge = """<span style="display:inline-block; padding: 2px 8px; background: #f1f5f9; color: #94a3b8; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 1px;">- - -</span>"""
old_badge = """'<span style="color:#cbd5e1;">- - -</span>'"""

js = js.replace(old_badge, f"'{badge}'")

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)
