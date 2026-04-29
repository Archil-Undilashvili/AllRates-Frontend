import os
import requests

missing = {
    'cartu': 'https://cartubank.ge/favicon.ico',
    'inex': 'https://inteliexpress.net/favicon.ico',
    'hash': 'https://hashbank.ge/favicon.ico',
    'halyk': 'https://halykbank.ge/favicon.ico'
}

base_dir = os.path.expanduser('~/Desktop/allrates.ge/Logos')
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}

for key, url in missing.items():
    icon_path = os.path.join(base_dir, f'{key}_icon.ico')
    try:
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code == 200 and len(r.content) > 100:
            with open(icon_path, 'wb') as f:
                f.write(r.content)
            print(f"Downloaded {key}")
        else:
            print(f"Failed {key} (status {r.status_code}, len {len(r.content)})")
    except Exception as e:
        print(f"Error {key}: {e}")

