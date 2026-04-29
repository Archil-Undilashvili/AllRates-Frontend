import os

js_path = os.path.expanduser('~/Desktop/allrates.ge/js/main.js')
css_path = os.path.expanduser('~/Desktop/allrates.ge/css/style.css')
header_path = os.path.expanduser('~/Desktop/allrates.ge/js/header.js')

# 1. Update JS to add class for hiding on mobile
with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

old_div = '<div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; line-height: 1.25; max-width: 160px;">'
new_div = '<div class="company-text-container" style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; line-height: 1.25; max-width: 160px; overflow: hidden;">'
js_content = js_content.replace(old_div, new_div)

# Truncate text instead of wrapping or hide entirely
js_content = js_content.replace('white-space: normal; word-break: break-word;', 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;')

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

# 2. Update CSS with mobile rules
mobile_css = """
/* Mobile Optimization - High Quality */
@media (max-width: 768px) {
    body { font-size: 14px; }
    .page-section { padding: 15px 10px !important; }
    
    /* Header & Nav */
    nav { flex-direction: column; gap: 15px; }
    nav > div { flex-wrap: wrap; justify-content: center; gap: 10px !important; }
    .nav-link { font-size: 12px !important; padding: 6px 10px; background: rgba(0,0,0,0.03); border-radius: 8px; }
    
    /* Tables */
    th, td { padding: 12px 6px !important; font-size: 13px !important; }
    .table-container { border-radius: 12px !important; }
    
    /* Company names truncation for tablet */
    .company-text-container { max-width: 100px !important; }
    
    /* Tabs */
    .tab-btn { padding: 8px 12px !important; font-size: 12px !important; flex: 1; text-align: center; }
    div[style*="gap: 15px; margin-bottom: 30px;"] { gap: 8px !important; }
}

@media (max-width: 480px) {
    /* Extreme Mobile - exactly as requested: hide names, leave only logos */
    .company-text-container { display: none !important; }
    
    /* Make logos slightly smaller to fit better */
    td > a > div > div { width: 34px !important; height: 34px !important; }
    
    /* Table optimizations */
    th, td { padding: 10px 4px !important; font-size: 12px !important; }
    
    /* Header */
    nav > a > span { font-size: 20px !important; }
    
    /* Cards */
    .home-card-uniform { padding: 15px !important; }
    .rate-block .rate-value { font-size: 14px !important; }
    
    /* Modals */
    .modal-content { width: 95% !important; padding: 20px !important; }
}
"""

with open(css_path, 'a', encoding='utf-8') as f:
    f.write("\n" + mobile_css)

print("done")
