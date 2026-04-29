import os
import re

# 1. Update rates.html table headers and add info modal
rates_path = os.path.expanduser('~/Desktop/allrates.ge/rates.html')
with open(rates_path, 'r', encoding='utf-8') as f:
    rates_html = f.read()

rates_html = rates_html.replace(
    '<th class="sortable" onclick="sortData(\'usd\', \'spread\')">სპრედი <span class="sort-icon"></span></th>',
    '<th class="sortable" onclick="sortData(\'usd\', \'spread\')">სპრედი <span class="sort-icon"></span></th>\n                        <th style="width: 60px; text-align: center;">ინფო</th>'
)
rates_html = rates_html.replace(
    '<th class="sortable" onclick="sortData(\'eur\', \'spread\')">სპრედი <span class="sort-icon"></span></th>',
    '<th class="sortable" onclick="sortData(\'eur\', \'spread\')">სპრედი <span class="sort-icon"></span></th>\n                        <th style="width: 60px; text-align: center;">ინფო</th>'
)
rates_html = rates_html.replace(
    '<th class="sortable" onclick="sortData(\'gbp\', \'spread\')">სპრედი <span class="sort-icon"></span></th>',
    '<th class="sortable" onclick="sortData(\'gbp\', \'spread\')">სპრედი <span class="sort-icon"></span></th>\n                        <th style="width: 60px; text-align: center;">ინფო</th>'
)
rates_html = rates_html.replace(
    '<th class="sortable" onclick="sortData(\'rub\', \'spread\')">სპრედი <span class="sort-icon"></span></th>',
    '<th class="sortable" onclick="sortData(\'rub\', \'spread\')">სპრედი <span class="sort-icon"></span></th>\n                        <th style="width: 60px; text-align: center;">ინფო</th>'
)
rates_html = rates_html.replace(
    '<th class="sortable" onclick="sortData(\'try\', \'spread\')">სპრედი <span class="sort-icon"></span></th>',
    '<th class="sortable" onclick="sortData(\'try\', \'spread\')">სპრედი <span class="sort-icon"></span></th>\n                        <th style="width: 60px; text-align: center;">ინფო</th>'
)

info_modal = '''
    <!-- Company Info Details Modal -->
    <div id="company-info-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content" style="max-width: 550px;">
            <span class="modal-close" onclick="document.getElementById('company-info-modal').style.display='none'">&times;</span>
            <div id="info-modal-header" class="modal-header" style="border-bottom: none; margin-bottom: 0;"></div>
            <div id="info-modal-body"></div>
        </div>
    </div>
'''

if 'id="company-info-modal"' not in rates_html:
    rates_html = rates_html.replace('<script src="js/main.js', info_modal + '\n<script src="js/main.js')

with open(rates_path, 'w', encoding='utf-8') as f:
    f.write(rates_html)


# 2. Update main.js
js_path = os.path.expanduser('~/Desktop/allrates.ge/js/main.js')
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace('<td class="spread">${spreadDisplay}</td>\n                `;',
                '<td class="spread">${spreadDisplay}</td>\n                    <td class="info-cell"><button class="btn-info-icon" onclick="event.preventDefault(); openCompanyInfo(\'${companyKey}\', \'${compNameKa}\')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></button></td>\n                `;')

company_info_js = '''
const COMPANY_INFO_DATA = {
    'bog': { fullName: 'სს "საქართველოს ბანკი"', branches: ['გაგარინის ქ. 29ა (სათაო ოფისი)', 'პუშკინის ქ. 5/7', 'ჭავჭავაძის გამზ. 74', 'წერეთლის გამზ. 112', '+ 100-ზე მეტი ფილიალი მთელ საქართველოში'], mapUrl: 'https://bankofgeorgia.ge/ka/retail/branches' },
    'tbc': { fullName: 'სს "თიბისი ბანკი"', branches: ['მარჯანიშვილის ქ. 7 (სათაო ოფისი)', 'რუსთაველის გამზ. 24', 'ჭავჭავაძის გამზ. 11', 'პეკინის გამზ. 14', '+ 100-ზე მეტი ფილიალი'], mapUrl: 'https://www.tbcbank.ge/web/ka/web/guest/branch-network' },
    'liberty': { fullName: 'სს "ლიბერთი ბანკი"', branches: ['ჭავჭავაძის გამზ. 74 (სათაო ოფისი)', 'აღმაშენებლის გამზ. 86', 'ვაჟა-ფშაველას გამზ. 70', 'რუსთაველის გამზ. 14', '+ 300-მდე ფილიალი'], mapUrl: 'https://libertybank.ge/ka/faq/geografia' },
    'bb': { fullName: 'სს "ბაზისბანკი"', branches: ['ქეთევან წამებულის გამზ. 1 (სათაო ოფისი)', 'რუსთაველის გამზ. 30', 'ყაზბეგის გამზ. 14', 'ჭავჭავაძის გამზ. 37'], mapUrl: 'https://www.basisbank.ge/ka/branches' },
    'credo': { fullName: 'სს "კრედო ბანკი"', branches: ['რ. თაბუკაშვილის ქ. 27 (სათაო ოფისი)', 'წერეთლის გამზ. 73', 'აღმაშენებლის ხეივანი მე-12 კმ', 'ყაზბეგის გამზ. 14ა', '+ 80-ზე მეტი ფილიალი'], mapUrl: 'https://credobank.ge/branches/' },
    'cartu': { fullName: 'სს "ბანკი ქართუ"', branches: ['ჭავჭავაძის გამზ. 39ა (სათაო ოფისი)', 'აღმაშენებლის გამზ. 138', 'პეკინის გამზ. 14', 'წერეთლის გამზ. 112'], mapUrl: 'https://cartubank.ge/ka/branches' },
    'tera': { fullName: 'სს "ტერაბანკი"', branches: ['წმინდა ქეთევან დედოფლის გამზ. 3 (სათაო)', 'ჭავჭავაძის გამზ. 29', 'ყაზბეგის გამზ. 14', 'მელიქიშვილის გამზ. 17'], mapUrl: 'https://terabank.ge/ka/retail/contact' },
    'halyk': { fullName: 'სს "ხალიკ ბანკი საქართველო"', branches: ['შარტავას ქ. 40 (სათაო ოფისი)', 'კოსტავას ქ. 14', 'აღმაშენებლის გამზ. 137', 'ყაზბეგის გამზ. 24'], mapUrl: 'https://halykbank.ge/ka/individuals/branches' },
    'is': { fullName: 'სს "იშბანკი საქართველო"', branches: ['აღმაშენებლის გამზ. 140/ბ (სათაო)', 'ჭავჭავაძის გამზ. 74', 'ბათუმი, გოგებაშვილის ქ. 32'], mapUrl: 'http://isbank.ge/ka/individual/branches' },
    'silk': { fullName: 'სს "სილქ ბანკი"', branches: ['ზაარბრიუკენის მოედანი 2 (სათაო ოფისი)', 'წინანდლის ქ. 9'], mapUrl: 'https://silkbank.ge/contact/' },
    'paysera': { fullName: 'სს "პეისერა საქართველო"', branches: ['ბელიაშვილის ქ. 106 (სათაო ოფისი)'], mapUrl: 'https://www.paysera.ge/v2/ka-GE/contacts' },
    'crystal': { fullName: 'სს "მიკრობანკი კრისტალი"', branches: ['წერეთლის გამზ. 116 (სათაო)', 'ალ. ყაზბეგის გამზ. 15', 'პეკინის გამზ. 14', '+ 50-ზე მეტი ფილიალი'], mapUrl: 'https://crystal.ge/branches/' },
    'rico': { fullName: 'შპს "რიკო ექსპრესი"', branches: ['ჭავჭავაძის გამზ. 70 (სათაო ოფისი)', 'თამარაშვილის ქ. 14', 'პეკინის გამზ. 3', 'ვაჟა-ფშაველას გამზ. 71', 'მელიქიშვილის გამზ. 17', 'რუსთაველის გამზ. 14', 'წერეთლის გამზ. 111', 'აღმაშენებლის გამზ. 129', 'გლდანი, ვეკუას ქ. 14', '+ 50-მდე ფილიალი'], mapUrl: 'https://rico.ge/ka/branches' },
    'valuto': { fullName: 'შპს "ვალუტო"', branches: ['ალ. ყაზბეგის გამზ. 34', 'წერეთლის გამზ. 72ა', 'პეკინის გამზ. 5', 'აღმაშენებლის გამზ. 154', 'გურამიშვილის გამზ. 17', 'მოსკოვის გამზ. 14', 'დოლიძის ქ. 2', 'ქეთევან დედოფლის გამზ. 53'], mapUrl: 'https://valuto.ge/branches/' },
    'kursige': { fullName: 'შპს "კურსი"', branches: ['პეკინის გამზ. 21', 'ჭავჭავაძის გამზ. 33', 'ვაჟა-ფშაველას 71', 'რუსთაველის 14'], mapUrl: 'https://kursi.ge' },
    'inex': { fullName: 'შპს "ინტელიექსპრესი"', branches: ['აღმაშენებლის გამზ. 89 (სათაო)', 'ჭავჭავაძის გამზ. 24', 'მელიქიშვილის ქ. 17', 'პეკინის ქ. 4', 'წერეთლის გამზ. 116'], mapUrl: 'https://ge.inteliexpress.net/branches/' },
    'giro': { fullName: 'შპს "გირო კრედიტი"', branches: ['ყაზბეგის გამზ. 14 (სათაო)', 'წერეთლის 116', 'გურამიშვილის 15'], mapUrl: 'https://girocredit.ge/branch/' },
    'goa': { fullName: 'შპს "გოა კრედიტი"', branches: ['თევდორე მღვდლის ქ. 13', 'წერეთლის 73'], mapUrl: 'https://goacredit.ge' },
    'hash': { fullName: 'სს "ჰაშ ბანკი"', branches: ['რუსთაველის გამზ. 12', 'ზ. ფალიაშვილის 15'], mapUrl: 'https://hashbank.ge' },
    'mbc': { fullName: 'შპს "მიკრო ბიზნეს კაპიტალი (MBC)"', branches: ['წერეთლის გამზ. 114', 'ალ. ყაზბეგის 15', 'პეკინის გამზ. 14', 'ქეთევან დედოფლის გამზ. 67'], mapUrl: 'https://mbc.com.ge/ka/contact/branches' }
};

window.openCompanyInfo = function(key, displayName) {
    const modal = document.getElementById('company-info-modal');
    if (!modal) return;
    
    const info = COMPANY_INFO_DATA[key] || { fullName: displayName, branches: ['ინფორმაცია ფილიალებზე ხელმიუწვდომელია'], mapUrl: COMPANY_URLS[key] || '#' };
    const websiteUrl = COMPANY_URLS[key] || '#';
    const logoPath = LOGOS[key] || 'Logos/logo.jpg';
    
    const header = document.getElementById('info-modal-header');
    header.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; width: 100%;">
            <div style="width: 70px; height: 70px; border-radius: 16px; background: #ffffff; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); margin-bottom: 15px;">
                <img src="${logoPath}" style="width: 100%; height: 100%; object-fit: contain; object-position: center; border-radius: 12px;">
            </div>
            <h2 style="margin: 0 0 5px 0; color: var(--text-main); font-size: 1.6em;">${displayName}</h2>
            <div style="color: var(--text-muted); font-size: 0.9em; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${info.fullName}</div>
            <a href="${websiteUrl}" target="_blank" class="info-website-link" style="margin-top: 15px; display: inline-flex; align-items: center; gap: 8px; color: var(--primary); font-weight: 600; text-decoration: none; background: rgba(56, 189, 248, 0.1); padding: 8px 16px; border-radius: 20px; transition: background 0.2s;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                ვებ-გვერდზე გადასვლა
            </a>
        </div>
    `;
    
    let branchesHtml = `<div class="info-section-title" style="margin-top: 30px; margin-bottom: 15px; font-weight: 700; color: var(--text-main); font-size: 1.1em; display: flex; align-items: center; gap: 10px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--buy-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> მთავარი ფილიალები</div><ul class="info-branch-list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">`;
    
    info.branches.forEach(branch => {
        branchesHtml += `<li style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); padding: 12px 15px; border-radius: 8px; color: var(--text-main); font-size: 0.95em; display: flex; align-items: center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 12px; flex-shrink: 0;"><path d="M5 9l2.89 2.89a2 2 0 0 0 2.83 0L19 3"></path></svg>${branch}</li>`;
    });
    
    branchesHtml += `</ul>`;
    
    if (info.mapUrl && info.mapUrl !== '#') {
        branchesHtml += `
            <a href="${info.mapUrl}" target="_blank" style="display: block; text-align: center; margin-top: 20px; color: var(--primary); text-decoration: none; font-weight: 600; padding: 12px; border: 1px dashed var(--primary); border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='rgba(56, 189, 248, 0.1)'" onmouseout="this.style.background='transparent'">
                ყველა ფილიალის ნახვა რუკაზე &rarr;
            </a>
        `;
    }
    
    document.getElementById('info-modal-body').innerHTML = branchesHtml;
    modal.style.display = 'flex';
};

// Also close it correctly
document.addEventListener('DOMContentLoaded', () => {
    const infoModal = document.getElementById('company-info-modal');
    if (infoModal) {
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) {
                infoModal.style.display = 'none';
            }
        });
    }
});

'''
if 'COMPANY_INFO_DATA' not in js:
    js += '\n' + company_info_js
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js)

# 3. Add CSS for info button
css_path = os.path.expanduser('~/Desktop/allrates.ge/css/style.css')
with open(css_path, 'a', encoding='utf-8') as f:
    f.write('''
/* --- Info Icon Button --- */
.info-cell {
    text-align: center;
    vertical-align: middle;
}
.btn-info-icon {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}
.btn-info-icon:hover {
    color: var(--primary);
    background: rgba(56, 189, 248, 0.1);
    transform: scale(1.1);
}
.info-website-link:hover {
    background: rgba(56, 189, 248, 0.2) !important;
}
''')

print("Info Modals Implemented!")
