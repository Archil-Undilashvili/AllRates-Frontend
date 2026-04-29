import os

path = os.path.expanduser('~/Desktop/allrates.ge/js/header.js')
with open(path, 'r', encoding='utf-8') as f:
    js = f.read()

# The old <a> block
old_a = '''<a href="index.html">
            <img src="Logos/logo.jpg" alt="AllRates Logo" style="height: 45px; width: auto; object-fit: contain; object-position: left center; cursor: pointer; border-radius: 8px; margin-left: 0;" />
        </a>'''

new_a = '''<a href="index.html" style="text-decoration: none; display: flex; align-items: center; gap: 10px; margin-left: 0;">
            <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">
                <defs>
                    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f97316" /> <!-- Orange -->
                        <stop offset="50%" stop-color="#a855f7" /> <!-- Purple -->
                        <stop offset="100%" stop-color="#0ea5e9" /> <!-- Blue/Greenish -->
                    </linearGradient>
                </defs>
                <!-- Outer Ring Arrows -->
                <path d="M 50 12 A 38 38 0 0 1 87.6 30 L 98 30 L 78 55 L 58 30 L 70 30 A 24 24 0 0 0 30 30 L 16 14 A 38 38 0 0 1 50 12 Z" fill="url(#logoGrad)"/>
                <path d="M 50 88 A 38 38 0 0 1 12.4 70 L 2 70 L 22 45 L 42 70 L 30 70 A 24 24 0 0 0 70 70 L 84 86 A 38 38 0 0 1 50 88 Z" fill="url(#logoGrad)"/>
            </svg>
            <span style="font-size: 26px; font-weight: 800; font-family: 'Inter', sans-serif; letter-spacing: -0.5px; background: -webkit-linear-gradient(45deg, #f97316, #a855f7, #0ea5e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">AllRates<span style="color: #f1f5f9; -webkit-text-fill-color: #f1f5f9; font-weight: 600; font-size: 20px;">.ge</span></span>
        </a>'''

js = js.replace(old_a, new_a)

with open(path, 'w', encoding='utf-8') as f:
    f.write(js)

print("header.js logo updated!")
