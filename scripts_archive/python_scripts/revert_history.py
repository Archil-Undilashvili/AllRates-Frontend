import os
import re

filepath = os.path.expanduser('~/Desktop/allrates.ge/index.html')
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# The exact string to find
old_string = '<a href="history.html" style="text-decoration:none; color:inherit; cursor:pointer;" title="ნახეთ საათობრივი ისტორია">ვალუტის კურსები ქართულ ბაზარზე <span class="card-uniform-subtitle" style="text-decoration:underline;">(Top 10 საშუალო)</span></a>'
new_string = 'ვალუტის კურსები ქართულ ბაზარზე <span class="card-uniform-subtitle">(Top 10 საშუალო)</span>'

content = content.replace(old_string, new_string)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

os.remove(os.path.expanduser('~/Desktop/allrates.ge/history.html'))
print("reverted")
