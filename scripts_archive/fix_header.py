import re

header_path = '/Users/archilundilashvili/Desktop/AllRates.ge/js/header.js'
with open(header_path, 'r', encoding='utf-8') as f:
    header = f.read()

# We need to insert the new link after "გაცვლითი კურსები ქართულ ბაზარზე"
old_link = '<a href="rates.html" class="nav-link" data-page="rates" style="text-decoration: none; color: #64748b; font-weight: 700; font-size: 16px; cursor: pointer; text-transform: uppercase; transition: color 0.2s ease;">გაცვლითი კურსები ქართულ ბაზარზე</a>'
new_link = '<a href="official.html" class="nav-link" data-page="official" style="text-decoration: none; color: #64748b; font-weight: 700; font-size: 16px; cursor: pointer; text-transform: uppercase; transition: color 0.2s ease;">ოფიციალური კურსები</a>'

if new_link not in header:
    header = header.replace(old_link, old_link + '\n            ' + new_link)
    with open(header_path, 'w', encoding='utf-8') as f:
        f.write(header)
    print("Header updated!")
else:
    print("Already exists.")

