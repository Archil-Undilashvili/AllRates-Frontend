import re
import os

files = ['~/Desktop/allrates.ge/js/main.js', '~/Desktop/allrates.ge/calculator.html']

for p in files:
    path = os.path.expanduser(p)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        content = content.replace("'tbc': 'თიბისი',", "'tbc': 'თიბისი ბანკი',")
        content = content.replace("'liberty': 'ლიბერთი',", "'liberty': 'ლიბერთი ბანკი',")
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {p}")
