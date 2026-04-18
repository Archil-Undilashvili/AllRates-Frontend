import re

html_path = '/Users/archilundilashvili/Desktop/AllRates.ge/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Instead of "width: 100%; box-sizing: border-box;"
# we want them to sit side by side natively as they did before when it was flex-start.
# Oh, earlier it was: <div class="home-section" style="width: 100%; box-sizing: border-box;">
# Let's remove the inline styles entirely if they are causing it to stretch.
html = html.replace('style="width: 100%; box-sizing: border-box;"', '')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
