import os
import re

filepath = os.path.expanduser('~/Desktop/allrates.ge/contact.html')
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the description text
pattern = r'თქვენი მოსაზრება ჩვენთვის მნიშვნელოვანია! გაგვიზიარეთ თქვენი\s*მოთხოვნები, შეკითხვები ან შენიშვნები — ჩვენ მზად ვართ მოვუსმინოთ\s*და სწრაფი პასუხს გაგცეთ\.'
replacement = 'თქვენი მოსაზრება ჩვენთვის მნიშვნელოვანია! გაგვიზიარეთ თქვენი მოთხოვნები, შეკითხვები ან შენიშვნები.'
content = re.sub(pattern, replacement, content)

# 2. Fix the input field text colors
# The inputs have `background:#f8fafc` and `color:var(--text-main)`. 
# We will change `color:var(--text-main)` to `color:#0f172a` (dark slate) for the inputs/textarea
content = content.replace('color:var(--text-main); outline:none', 'color:#0f172a; outline:none')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixes applied successfully.")
