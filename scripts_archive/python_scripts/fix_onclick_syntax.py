import re
import os

path = os.path.expanduser('~/Desktop/allrates.ge/index.html')
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the backslashes from the onclick attribute
html = html.replace("onclick=\"window.location.href=\\'rates.html#usd-container\\'\"", "onclick=\"window.location.href='rates.html#usd-container'\"")
html = html.replace("onclick=\"window.location.href=\\'rates.html#eur-container\\'\"", "onclick=\"window.location.href='rates.html#eur-container'\"")
html = html.replace("onclick=\"window.location.href=\\'rates.html#gbp-container\\'\"", "onclick=\"window.location.href='rates.html#gbp-container'\"")
html = html.replace("onclick=\"window.location.href=\\'rates.html#rub-container\\'\"", "onclick=\"window.location.href='rates.html#rub-container'\"")
html = html.replace("onclick=\"window.location.href=\\'rates.html#try-container\\'\"", "onclick=\"window.location.href='rates.html#try-container'\"")

with open(path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Syntax fixed!")
