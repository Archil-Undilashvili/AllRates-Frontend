import os
filepath = os.path.expanduser('~/Desktop/allrates.ge/history.html')
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<script src="js/main.js"></script>\n</body>\n</html>\n<footer', '<footer')
content = content.replace('</body></html>', '')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
