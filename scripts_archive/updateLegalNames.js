const fs = require('fs');

let code = fs.readFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', 'utf8');

const oldDict = `        const COMPANY_NAMES_KA = {
            'rico': 'რიკო ჯგუფი',
            'valuto': 'ვალუტო',
            'kursige': 'კურსი ჯი',
            'crystal': 'მიკრო ბანკი კრისტალი',
            'bog': 'საქართველოს ბანკი',
            'tbc': 'თიბისი ბანკი',
            'liberty': 'ლიბერთი ბანკი',
            'bb': 'ბაზის ბანკი',
            'credo': 'კრედო ბანკი',
            'cartu': 'ბანკი ქართუ',
            'inex': 'ინტელ ექსპრესი',
            'giro': 'გირო კრედიტი',
            'goa': 'გოა კრედიტი',
            'hash': 'ჰეშ ბანკი',
            'mbc': 'ემ ბი სი',
            'tera': 'ტერა ბანკი',
            'halyk': 'ხალიკ ბანკი',
            'is': 'იშ ბანკი',
            'paysera': 'პეისერა ბანკი'
        };`;

const newDict = `        const COMPANY_NAMES_KA = {
            'rico': 'შპს "რიკო ექსპრესი"',
            'valuto': 'შპს "ვალუტო"',
            'kursige': 'შპს "კურსი"',
            'crystal': 'სს "მიკრობანკი კრისტალი"',
            'bog': 'სს "საქართველოს ბანკი"',
            'tbc': 'სს "თიბისი ბანკი"',
            'liberty': 'სს "ლიბერთი ბანკი"',
            'bb': 'სს "ბაზისბანკი"',
            'credo': 'სს "კრედო ბანკი"',
            'cartu': 'სს "ბანკი ქართუ"',
            'inex': 'შპს "მისო ინტელექსპრესი"',
            'giro': 'შპს "მისო გირო კრედიტი"',
            'goa': 'შპს "მისო გოა კრედიტი"',
            'hash': 'სს "ჰეში"',
            'mbc': 'სს "მისო მიკრო ბიზნეს კაპიტალი"',
            'tera': 'სს "ტერაბანკი"',
            'halyk': 'სს "ხალიკ ბანკი საქართველო"',
            'is': 'სს "იშბანკი საქართველო"',
            'silk': 'სს "სილქ ბანკი"',
            'paysera': 'სს "პეისერა ბანკი საქართველო"'
        };`;

code = code.replace(oldDict, newDict);

const oldHTML = `                                <div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; line-height: 1.2;">
                                    <span style="font-weight: 600; color: #1e293b; font-size: 15px; white-space: nowrap;">\${mainName}</span>
                                    \${subName ? \`<span style="font-size: 11.5px; color: #64748b; font-weight: 500; margin-top: 3px;">\${subName}</span>\` : ''}
                                </div>`;

const newHTML = `                                <div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">
                                    <span style="font-weight: 600; color: #1e293b; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;" title="\${mainName}">\${mainName}</span>
                                    \${subName ? \`<span style="font-size: 11px; color: #64748b; font-weight: 500; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;" title="\${subName}">\${subName}</span>\` : ''}
                                </div>`;

code = code.replace(oldHTML, newHTML);
fs.writeFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', code);
console.log("Updated legal names and styles");