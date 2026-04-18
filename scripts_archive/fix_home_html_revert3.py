import re

html_path = '/Users/archilundilashvili/Desktop/AllRates.ge/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# I see it didn't replace because there are TWO places with this block. Wait, I'll use backup.
with open('/Users/archilundilashvili/Desktop/AllRates.ge/currency_rates_backup.html', 'r', encoding='utf-8') as f:
    backup_html = f.read()

match = re.search(r'(<div class="home-section" style="width: 100%; box-sizing: border-box;">.*?</div>\s*</div>\s*</div>)\s*<!-- International Rates Card -->', backup_html, re.DOTALL)
if match:
    old_pure_block = match.group(1)
    # Now we just need to add GBP and RUB to it using the EXACT SAME markup style.
    
    gbp_block = """
                    <div class="home-section" style="width: 100%; box-sizing: border-box;">
                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;"><img src="Logos/GB.png" alt="GB Flag" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border: 2px solid #ffffff;">GBP / გირვანქა სტერლინგი</div>
                        <div class="rates-flex">
                            <div class="rate-block">
                                <div class="rate-label">ყიდვა</div>
                                <div class="rate-value buy" id="home-gbp-market-buy">--.---</div>
                            </div>
                            <div class="rate-block">
                                <div class="rate-label">გაყიდვა</div>
                                <div class="rate-value sell" id="home-gbp-market-sell">--.---</div>
                            </div>
                            <div class="rate-block">
                                <div class="rate-label" style="color: #64748b; font-weight: 600;">სპრედი</div>
                                <div class="rate-value" id="home-gbp-market-spread" style="color: #64748b; font-weight: 600; font-size: 1.05em;">--.---</div>
                            </div>
                        </div>
                    </div>"""
                    
    rub_block = """
                    <div class="home-section" style="width: 100%; box-sizing: border-box;">
                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;"><img src="Logos/RU.png" alt="RU Flag" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border: 2px solid #ffffff;">RUB / რუბლი</div>
                        <div class="rates-flex">
                            <div class="rate-block">
                                <div class="rate-label">ყიდვა</div>
                                <div class="rate-value buy" id="home-rub-market-buy">--.---</div>
                            </div>
                            <div class="rate-block">
                                <div class="rate-label">გაყიდვა</div>
                                <div class="rate-value sell" id="home-rub-market-sell">--.---</div>
                            </div>
                            <div class="rate-block">
                                <div class="rate-label" style="color: #64748b; font-weight: 600;">სპრედი</div>
                                <div class="rate-value" id="home-rub-market-spread" style="color: #64748b; font-weight: 600; font-size: 1.05em;">--.---</div>
                            </div>
                        </div>
                    </div>"""
                    
    old_pure_block = old_pure_block.replace("</div>\n                </div>", "</div>\n" + gbp_block + "\n" + rub_block + "\n                </div>")
    
    # Replace flags in old_pure_block to be 32px like we updated
    old_pure_block = old_pure_block.replace('width: 28px; height: 28px; border-radius: 50%; object-fit: cover; box-shadow: 0 1px 3px rgba(0,0,0,0.1);', 'width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border: 2px solid #ffffff;')
    
    current_match = re.search(r'(<div class="card-uniform-content" style="display: flex; flex-direction: column; gap: 20px;">.*?</div>\s*</div>)\s*<!-- International Rates Card -->', html, re.DOTALL)
    if current_match:
        html = html.replace(current_match.group(1), old_pure_block)
    else:
        # Fallback if I already messed it up
        current_match = re.search(r'(<div class="card-uniform-content" style="justify-content: flex-start;">.*?</div>\s*</div>)\s*<!-- International Rates Card -->', html, re.DOTALL)
        if current_match:
            html = html.replace(current_match.group(1), old_pure_block)
            
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Reverted to pure backup structure!")
else:
    print("Could not find backup block.")
