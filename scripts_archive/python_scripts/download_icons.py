import os
import requests
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

COMPANY_URLS = {
    'rico': 'rico.ge',
    'valuto': 'valuto.ge',
    'kursige': 'kursi.ge',
    'crystal': 'crystal.ge',
    'bog': 'bankofgeorgia.ge',
    'tbc': 'tbcbank.ge',
    'liberty': 'libertybank.ge',
    'bb': 'basisbank.ge',
    'credo': 'credobank.ge',
    'cartu': 'cartubank.ge',
    'inex': 'inteliexpress.net',
    'giro': 'girocredit.ge',
    'goa': 'goacredit.ge',
    'hash': 'hashbank.ge',
    'mbc': 'mbc.com.ge',
    'tera': 'terabank.ge',
    'halyk': 'halykbank.ge',
    'is': 'isbank.ge',
    'silk': 'silkbank.ge',
    'paysera': 'paysera.ge'
}

base_dir = os.path.expanduser('~/Desktop/allrates.ge/Logos')
os.makedirs(base_dir, exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0'}

for key, domain in COMPANY_URLS.items():
    icon_path = os.path.join(base_dir, f'{key}_icon.png')
    
    # 1. Try Clearbit
    url = f'https://logo.clearbit.com/{domain}'
    try:
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code == 200 and len(r.content) > 500:
            with open(icon_path, 'wb') as f:
                f.write(r.content)
            print(f"Downloaded clearbit for {key}")
            continue
    except:
        pass
    
    # 2. Try Google Favicon
    url = f'https://www.google.com/s2/favicons?domain={domain}&sz=128'
    try:
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code == 200 and len(r.content) > 500:
            with open(icon_path, 'wb') as f:
                f.write(r.content)
            print(f"Downloaded google favicon for {key}")
            continue
    except:
        pass
        
    print(f"Failed to get icon for {key}")

