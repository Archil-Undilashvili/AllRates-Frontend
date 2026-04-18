import re

html_path = '/Users/archilundilashvili/Desktop/AllRates.ge/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('კრიპტოვალუტები <span class="card-uniform-subtitle">(Top 10)</span>', 'კრიპტოვალუტები')
html = html.replace('კრიპტოვალუტები Top 10', 'კრიპტოვალუტები')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Title fixed!")
