import re

html_path = '/Users/archilundilashvili/Desktop/AllRates.ge/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

gbp_rub_html = """                    <div class="home-section" style="width: 100%; box-sizing: border-box;">
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
                    </div>

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

if "home-gbp-market-buy" not in html:
    pattern = r'(<div class="home-section" style="width: 100%; box-sizing: border-box;">\s*<div class="section-title"[^>]*>.*?EUR / ევრო</div>.*?</div>\s*</div>)'
    html = re.sub(pattern, r'\1\n' + gbp_rub_html, html, flags=re.DOTALL)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Home HTML updated!")
else:
    print("Already exists.")

