import re

html_path = '/Users/archilundilashvili/Desktop/AllRates.ge/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<div class="card-uniform-content" style="justify-content: flex-start; display: flex; flex-direction: column; gap: 0px;">', '<div class="card-uniform-content" style="justify-content: flex-start; display: flex; flex-direction: row; flex-wrap: wrap; gap: 20px;">')

# Make sure the home sections don't take full width so they can sit next to each other
html = html.replace('<div class="home-section" style="width: 100%; box-sizing: border-box;">', '<div class="home-section" style="width: 100%; box-sizing: border-box; margin-bottom: 20px;">')

# Just remove the flex-direction completely to let original CSS handle it
html = html.replace('<div class="card-uniform-content" style="justify-content: flex-start; display: flex; flex-direction: row; flex-wrap: wrap; gap: 20px;">', '<div class="card-uniform-content" style="justify-content: flex-start;">')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
