import re

html_path = '/Users/archilundilashvili/Desktop/AllRates.ge/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# The user wants exactly the old look without borders and vertical stacks.
old_look_html = """<div class="card-uniform-content" style="justify-content: flex-start; display: flex; flex-direction: column; gap: 0px;">
                    
                    <div class="home-section" style="width: 100%; box-sizing: border-box;">
                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;">
                            <img src="Logos/US.png" alt="US Flag" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border: 2px solid #ffffff;">
                            USD / აშშ დოლარი
                        </div>
                        <div class="rates-flex">
                            <div class="rate-block">
                                <div class="rate-label">ყიდვა</div>
                                <div class="rate-value buy" id="home-usd-market-buy">--.---</div>
                            </div>
                            <div class="rate-block">
                                <div class="rate-label">გაყიდვა</div>
                                <div class="rate-value sell" id="home-usd-market-sell">--.---</div>
                            </div>
                            <div class="rate-block">
                                <div class="rate-label" style="color: #64748b; font-weight: 600;">სპრედი</div>
                                <div class="rate-value" id="home-usd-market-spread" style="color: #64748b; font-weight: 600; font-size: 1.05em;">--.---</div>
                            </div>
                        </div>
                    </div>

                    <div class="home-section" style="width: 100%; box-sizing: border-box;">
                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;">
                            <img src="Logos/EU.png" alt="EU Flag" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border: 2px solid #ffffff;">
                            EUR / ევრო
                        </div>
                        <div class="rates-flex">
                            <div class="rate-block">
                                <div class="rate-label">ყიდვა</div>
                                <div class="rate-value buy" id="home-eur-market-buy">--.---</div>
                            </div>
                            <div class="rate-block">
                                <div class="rate-label">გაყიდვა</div>
                                <div class="rate-value sell" id="home-eur-market-sell">--.---</div>
                            </div>
                            <div class="rate-block">
                                <div class="rate-label" style="color: #64748b; font-weight: 600;">სპრედი</div>
                                <div class="rate-value" id="home-eur-market-spread" style="color: #64748b; font-weight: 600; font-size: 1.05em;">--.---</div>
                            </div>
                        </div>
                    </div>

                    <div class="home-section" style="width: 100%; box-sizing: border-box;">
                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;">
                            <img src="Logos/GB.png" alt="GB Flag" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border: 2px solid #ffffff;">
                            GBP / გირვანქა სტერლინგი
                        </div>
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
                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;">
                            <img src="Logos/RU.png" alt="RU Flag" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border: 2px solid #ffffff;">
                            RUB / რუბლი
                        </div>
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

# Remove old wrapper if there was display flex column gap 20px
pattern = r'<div class="card-uniform-content"[^>]*>.*?</div>\s*<!-- International Rates Card -->'
html = re.sub(pattern, old_look_html + '\n                </div>\n\n            <!-- International Rates Card -->', html, flags=re.DOTALL)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Reverted to old look without borders and spacing!")
