import re

html_path = '/Users/archilundilashvili/Desktop/AllRates.ge/rates.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

gbp_table = """
        <!-- GBP Table -->
        <div class="container">
            <div class="header-row" style="justify-content: center; gap: 12px; margin-bottom: 20px;">
                <img src="Logos/GB.png" alt="GB Flag" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
                <h2 style="margin: 0; font-size: 1.5em; color: var(--text-main); font-weight: 700;">GBP <span style="color: #64748b; font-weight: 400;">/</span> GEL</h2>
            </div>
            
            <div class="market-rate-box" id="gbp-market-box">
                <div class="market-rate-title">საბაზრო კურსები</div>
                <div class="market-rate-items">
                    <div class="market-rate-item">
                        <div class="market-rate-label">ყიდვა</div>
                        <div class="market-rate-value buy" id="gbp-market-buy">--.---</div>
                    </div>
                    <div class="market-rate-item">
                        <div class="market-rate-label">გაყიდვა</div>
                        <div class="market-rate-value sell" id="gbp-market-sell">--.---</div>
                    </div>
                    <div class="market-rate-item">
                        <div class="market-rate-label">სპრედი</div>
                        <div class="market-rate-value spread" id="gbp-market-spread">--.---</div>
                    </div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th class="sortable" onclick="sortData('gbp', 'company')">კომპანია <span class="sort-icon"></span></th>
                        <th class="sortable" onclick="sortData('gbp', 'buy')">ყიდვა <span class="sort-icon"></span></th>
                        <th class="sortable" onclick="sortData('gbp', 'sell')">გაყიდვა <span class="sort-icon"></span></th>
                        <th class="sortable" onclick="sortData('gbp', 'spread')">სპრედი <span class="sort-icon"></span></th>
                    </tr>
                </thead>
                <tbody id="gbp-body"></tbody>
            </table>
        </div>
"""

rub_table = """
        <!-- RUB Table -->
        <div class="container">
            <div class="header-row" style="justify-content: center; gap: 12px; margin-bottom: 20px;">
                <img src="Logos/RU.png" alt="RU Flag" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
                <h2 style="margin: 0; font-size: 1.5em; color: var(--text-main); font-weight: 700;">RUB <span style="color: #64748b; font-weight: 400;">/</span> GEL</h2>
            </div>
            
            <div class="market-rate-box" id="rub-market-box">
                <div class="market-rate-title">საბაზრო კურსები</div>
                <div class="market-rate-items">
                    <div class="market-rate-item">
                        <div class="market-rate-label">ყიდვა</div>
                        <div class="market-rate-value buy" id="rub-market-buy">--.---</div>
                    </div>
                    <div class="market-rate-item">
                        <div class="market-rate-label">გაყიდვა</div>
                        <div class="market-rate-value sell" id="rub-market-sell">--.---</div>
                    </div>
                    <div class="market-rate-item">
                        <div class="market-rate-label">სპრედი</div>
                        <div class="market-rate-value spread" id="rub-market-spread">--.---</div>
                    </div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th class="sortable" onclick="sortData('rub', 'company')">კომპანია <span class="sort-icon"></span></th>
                        <th class="sortable" onclick="sortData('rub', 'buy')">ყიდვა <span class="sort-icon"></span></th>
                        <th class="sortable" onclick="sortData('rub', 'sell')">გაყიდვა <span class="sort-icon"></span></th>
                        <th class="sortable" onclick="sortData('rub', 'spread')">სპრედი <span class="sort-icon"></span></th>
                    </tr>
                </thead>
                <tbody id="rub-body"></tbody>
            </table>
        </div>
"""

# Insert before closing tag of tables-wrapper
pattern = r'(<tbody id="eur-body"></tbody>\s*</table>\s*</div>\s*)(</div>)'
if 'id="gbp-market-box"' not in html:
    html = re.sub(pattern, r'\1' + gbp_table + rub_table + r'\2', html)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("HTML updated!")
else:
    print("Already there.")
