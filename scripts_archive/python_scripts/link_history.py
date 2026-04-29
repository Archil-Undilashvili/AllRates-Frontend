import os
import re

filepath = os.path.expanduser('~/Desktop/allrates.ge/index.html')
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make the title clickable
old_title = 'ვალუტის კურსები ქართულ ბაზარზე <span class="card-uniform-subtitle">(Top 10 საშუალო)</span>'
new_title = '<a href="history.html" style="text-decoration:none; color:inherit; cursor:pointer;" title="ნახეთ საათობრივი ისტორია">ვალუტის კურსები ქართულ ბაზარზე <span class="card-uniform-subtitle" style="text-decoration:underline;">(Top 10 საშუალო)</span></a>'

content = content.replace(old_title, new_title)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
