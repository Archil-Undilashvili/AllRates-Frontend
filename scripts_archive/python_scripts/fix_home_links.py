import re
import os

path = os.path.expanduser('~/Desktop/allrates.ge/index.html')
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

# Add cursor: pointer and onclick to home-section
html = html.replace('<div class="home-section" >', '<div class="home-section interactive-card" >')

# We need to distinguish which section is which. They contain 'USD /', 'EUR /', etc.
# We can regex or just manually replace since there are only 5.

usd_old = '<div class="home-section interactive-card" >\\n                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;"><img src="Logos/US.png" alt="US Flag"'
usd_new = '<div class="home-section interactive-card" onclick="window.location.href=\\\'rates.html#usd-market-box\\\'" >\\n                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;"><img src="Logos/US.png" alt="US Flag"'
html = html.replace(usd_old.replace('\\\\', '\\'), usd_new.replace('\\\\', '\\'))

eur_old = '<div class="home-section interactive-card" >\\n                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;"><img src="Logos/EU.png" alt="EU Flag"'
eur_new = '<div class="home-section interactive-card" onclick="window.location.href=\\\'rates.html#eur-market-box\\\'" >\\n                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;"><img src="Logos/EU.png" alt="EU Flag"'
html = html.replace(eur_old.replace('\\\\', '\\'), eur_new.replace('\\\\', '\\'))

gbp_old = '<div class="home-section interactive-card" >\\n                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;"><img src="Logos/GB.png" alt="GB Flag"'
gbp_new = '<div class="home-section interactive-card" onclick="window.location.href=\\\'rates.html#gbp-market-box\\\'" >\\n                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;"><img src="Logos/GB.png" alt="GB Flag"'
html = html.replace(gbp_old.replace('\\\\', '\\'), gbp_new.replace('\\\\', '\\'))

rub_old = '<div class="home-section interactive-card" >\\n                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;"><img src="Logos/RU.png" alt="RU Flag"'
rub_new = '<div class="home-section interactive-card" onclick="window.location.href=\\\'rates.html#rub-market-box\\\'" >\\n                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;"><img src="Logos/RU.png" alt="RU Flag"'
html = html.replace(rub_old.replace('\\\\', '\\'), rub_new.replace('\\\\', '\\'))

try_old = '<div class="home-section interactive-card" >\\n                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;"><img src="Logos/TR.png" alt="TR Flag"'
try_new = '<div class="home-section interactive-card" onclick="window.location.href=\\\'rates.html#try-market-box\\\'" >\\n                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;"><img src="Logos/TR.png" alt="TR Flag"'
html = html.replace(try_old.replace('\\\\', '\\'), try_new.replace('\\\\', '\\'))

with open(path, 'w', encoding='utf-8') as f:
    f.write(html)

print("index.html updated!")
