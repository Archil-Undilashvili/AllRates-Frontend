import os

path = os.path.expanduser('~/Desktop/allrates.ge/js/main.js')
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacing the logo render
    old_logo_html = '`${logoUrl ? `<div style="display: flex; align-items: center; justify-content: flex-start; flex-shrink: 0; width: 75px;"><img src="${logoUrl}" alt="${compNameKa}" class="${logoClass}" style="max-width: 100%; max-height: 36px; object-fit: contain; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.05));"></div>` : `<div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 39px;"><span style="font-weight:bold; font-size: 16px; color:${initialColor};">${mainName.charAt(0)}</span></div>`}`'
    
    new_logo_html = '`${logoUrl ? `<div style="width: 42px; height: 42px; border-radius: 50%; background: #ffffff; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; box-sizing: border-box; padding: 4px;"><img src="${logoUrl}" alt="${compNameKa}" class="${logoClass}" style="width: 100%; height: 100%; object-fit: contain; transform: scale(1.1);"></div>` : `<div style="width: 42px; height: 42px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-sizing: border-box;"><span style="font-weight:bold; font-size: 18px; color:${initialColor};">${mainName.charAt(0)}</span></div>`}`'
    
    # We might need regex or exact match based on quotes
    # Let's read lines 1120-1125 and replace the exact string
