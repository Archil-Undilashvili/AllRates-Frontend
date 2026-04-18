import re

html_path = '/Users/archilundilashvili/Desktop/AllRates.ge/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# We need to target the exact block since the previous regex failed
start = html.find('<div class="card-uniform-content" style="justify-content: flex-start;">')
end = html.find('<!-- Box 2 -->')

new_content = """<div class="card-uniform-content" style="display: flex; flex-direction: column; gap: 20px;">
                    <div class="home-section" style="width: 100%; box-sizing: border-box; background: #ffffff; border-radius: 12px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;">
                            <img src="Logos/US.png" alt="US Flag" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border: 2px solid #ffffff;">
                            <span style="font-size: 1.1em; font-weight: 700; color: #1e293b;">USD / აშშ დოლარი</span>
                        </div>
                        <div class="rates-flex" style="display: flex; justify-content: space-between; text-align: center; gap: 10px;">
                            <div class="rate-block" style="flex: 1;">
                                <div class="rate-label" style="font-size: 0.85em; color: #64748b; margin-bottom: 5px;">ყიდვა</div>
                                <div class="rate-value buy" id="home-usd-market-buy" style="font-size: 1.15em; font-weight: 700; color: #10b981;">--.---</div>
                            </div>
                            <div class="rate-block" style="flex: 1;">
                                <div class="rate-label" style="font-size: 0.85em; color: #64748b; margin-bottom: 5px;">გაყიდვა</div>
                                <div class="rate-value sell" id="home-usd-market-sell" style="font-size: 1.15em; font-weight: 700; color: #ef4444;">--.---</div>
                            </div>
                            <div class="rate-block" style="flex: 1;">
                                <div class="rate-label" style="font-size: 0.85em; color: #64748b; margin-bottom: 5px; font-weight: 600;">სპრედი</div>
                                <div class="rate-value" id="home-usd-market-spread" style="font-size: 1.1em; font-weight: 600; color: #64748b;">--.---</div>
                            </div>
                        </div>
                    </div>

                    <div class="home-section" style="width: 100%; box-sizing: border-box; background: #ffffff; border-radius: 12px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;">
                            <img src="Logos/EU.png" alt="EU Flag" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border: 2px solid #ffffff;">
                            <span style="font-size: 1.1em; font-weight: 700; color: #1e293b;">EUR / ევრო</span>
                        </div>
                        <div class="rates-flex" style="display: flex; justify-content: space-between; text-align: center; gap: 10px;">
                            <div class="rate-block" style="flex: 1;">
                                <div class="rate-label" style="font-size: 0.85em; color: #64748b; margin-bottom: 5px;">ყიდვა</div>
                                <div class="rate-value buy" id="home-eur-market-buy" style="font-size: 1.15em; font-weight: 700; color: #10b981;">--.---</div>
                            </div>
                            <div class="rate-block" style="flex: 1;">
                                <div class="rate-label" style="font-size: 0.85em; color: #64748b; margin-bottom: 5px;">გაყიდვა</div>
                                <div class="rate-value sell" id="home-eur-market-sell" style="font-size: 1.15em; font-weight: 700; color: #ef4444;">--.---</div>
                            </div>
                            <div class="rate-block" style="flex: 1;">
                                <div class="rate-label" style="font-size: 0.85em; color: #64748b; margin-bottom: 5px; font-weight: 600;">სპრედი</div>
                                <div class="rate-value" id="home-eur-market-spread" style="font-size: 1.1em; font-weight: 600; color: #64748b;">--.---</div>
                            </div>
                        </div>
                    </div>

                    <div class="home-section" style="width: 100%; box-sizing: border-box; background: #ffffff; border-radius: 12px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;">
                            <img src="Logos/GB.png" alt="GB Flag" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border: 2px solid #ffffff;">
                            <span style="font-size: 1.1em; font-weight: 700; color: #1e293b;">GBP / გირვანქა სტერლინგი</span>
                        </div>
                        <div class="rates-flex" style="display: flex; justify-content: space-between; text-align: center; gap: 10px;">
                            <div class="rate-block" style="flex: 1;">
                                <div class="rate-label" style="font-size: 0.85em; color: #64748b; margin-bottom: 5px;">ყიდვა</div>
                                <div class="rate-value buy" id="home-gbp-market-buy" style="font-size: 1.15em; font-weight: 700; color: #10b981;">--.---</div>
                            </div>
                            <div class="rate-block" style="flex: 1;">
                                <div class="rate-label" style="font-size: 0.85em; color: #64748b; margin-bottom: 5px;">გაყიდვა</div>
                                <div class="rate-value sell" id="home-gbp-market-sell" style="font-size: 1.15em; font-weight: 700; color: #ef4444;">--.---</div>
                            </div>
                            <div class="rate-block" style="flex: 1;">
                                <div class="rate-label" style="font-size: 0.85em; color: #64748b; margin-bottom: 5px; font-weight: 600;">სპრედი</div>
                                <div class="rate-value" id="home-gbp-market-spread" style="font-size: 1.1em; font-weight: 600; color: #64748b;">--.---</div>
                            </div>
                        </div>
                    </div>

                    <div class="home-section" style="width: 100%; box-sizing: border-box; background: #ffffff; border-radius: 12px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                        <div class="section-title" style="margin-bottom: 15px; justify-content: center; display: flex; align-items: center; gap: 10px;">
                            <img src="Logos/RU.png" alt="RU Flag" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border: 2px solid #ffffff;">
                            <span style="font-size: 1.1em; font-weight: 700; color: #1e293b;">RUB / რუბლი</span>
                        </div>
                        <div class="rates-flex" style="display: flex; justify-content: space-between; text-align: center; gap: 10px;">
                            <div class="rate-block" style="flex: 1;">
                                <div class="rate-label" style="font-size: 0.85em; color: #64748b; margin-bottom: 5px;">ყიდვა</div>
                                <div class="rate-value buy" id="home-rub-market-buy" style="font-size: 1.15em; font-weight: 700; color: #10b981;">--.---</div>
                            </div>
                            <div class="rate-block" style="flex: 1;">
                                <div class="rate-label" style="font-size: 0.85em; color: #64748b; margin-bottom: 5px;">გაყიდვა</div>
                                <div class="rate-value sell" id="home-rub-market-sell" style="font-size: 1.15em; font-weight: 700; color: #ef4444;">--.---</div>
                            </div>
                            <div class="rate-block" style="flex: 1;">
                                <div class="rate-label" style="font-size: 0.85em; color: #64748b; margin-bottom: 5px; font-weight: 600;">სპრედი</div>
                                <div class="rate-value" id="home-rub-market-spread" style="font-size: 1.1em; font-weight: 600; color: #64748b;">--.---</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>"""

if start != -1 and end != -1:
    html = html[:start] + new_content + html[end:]
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Fixed home layout completely!")
