import os

filepath = os.path.expanduser('~/Desktop/allrates.ge/js/main.js')
with open(filepath, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Add to LOGOS object
js_content = js_content.replace("'silk': 'Logos/silk_icon.png',", "'silk': 'Logos/silk_icon.png',\n            'procredit': 'Logos/procredit.jpg',")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(js_content)
print("Logo mapping added.")
