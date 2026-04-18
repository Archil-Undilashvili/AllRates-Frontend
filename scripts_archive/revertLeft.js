const fs = require('fs');

let code = fs.readFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', 'utf8');

const centerHTML = `                                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; line-height: 1.25; max-width: 160px;">
                                    <span style="font-weight: 600; color: #1e293b; font-size: 13px; white-space: normal; word-break: break-word;">\${mainName}</span>
                                    \${subName ? \`<span style="font-size: 11px; color: #64748b; font-weight: 500; margin-top: 3px; white-space: normal; word-break: break-word;">\${subName}</span>\` : ''}
                                </div>`;

const leftHTML = `                                <div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; line-height: 1.25; max-width: 160px;">
                                    <span style="font-weight: 600; color: #1e293b; font-size: 13px; white-space: normal; word-break: break-word;">\${mainName}</span>
                                    \${subName ? \`<span style="font-size: 11px; color: #64748b; font-weight: 500; margin-top: 3px; white-space: normal; word-break: break-word;">\${subName}</span>\` : ''}
                                </div>`;

code = code.replace(centerHTML, leftHTML);

const oldLogos = `const LOGOS = {
            'rico': 'Logos/rico.png',
            'valuto': 'https://valuto.ge/uploads/2021/03/%E1%83%95%E1%83%90%E1%83%9A%E1%83%A3%E1%83%A2%E1%83%9D-%E1%83%9A%E1%83%9D%E1%83%92%E1%83%9D.png',
            'kursige': 'Logos/kursige.png',
            'crystal': 'Logos/crystal.png',
            'bog': 'Logos/bog.png',
            'tbc': 'https://tbcbank.ge/assets/tbc-ge/favicon.png',
            'liberty': 'Logos/Liberty.png',
            'bb': 'Logos/bb.png',
            'credo': 'Logos/credo.png',
            'cartu': 'Logos/cartu.png',
            'inex': 'Logos/Inex.png',
            'giro': 'Logos/Giro.png',
            'goa': 'Logos/Goa.png',
            'hash': 'Logos/Hash.png',
            'mbc': 'Logos/mbc.png',
            'tera': 'Logos/TERA.png',
            'halyk': 'Logos/HALYK.png',
            'is': 'Logos/IS.png',
            'paysera': 'Logos/PAYSERA.png'
        };`;

const newLogos = `const LOGOS = {
            'rico': 'Logos/rico.png',
            'valuto': 'https://valuto.ge/uploads/2021/03/%E1%83%95%E1%83%90%E1%83%9A%E1%83%A3%E1%83%A2%E1%83%9D-%E1%83%9A%E1%83%9D%E1%83%92%E1%83%9D.png',
            'kursige': 'Logos/kursige.png',
            'crystal': 'Logos/crystal.png',
            'bog': 'Logos/bog.png',
            'tbc': 'https://tbcbank.ge/assets/tbc-ge/favicon.png',
            'liberty': 'Logos/Liberty.png',
            'bb': 'Logos/BB.png',
            'credo': 'Logos/credo.png',
            'cartu': 'Logos/cartu.png',
            'inex': 'Logos/Inex.png',
            'giro': 'Logos/Giro.png',
            'goa': 'Logos/Goa.png',
            'hash': 'Logos/Hash.png',
            'mbc': 'Logos/mbc.png',
            'tera': 'Logos/TERA.png',
            'halyk': 'Logos/HALYK.png',
            'is': 'Logos/IS.png',
            'silk': 'Logos/silk.png',
            'paysera': 'Logos/PAYSERA.png'
        };`;

code = code.replace(oldLogos, newLogos);

const oldNameBB = `'bb': 'სს "ბაზისბანკი"',`;
const newNameBB = `'bb': 'სს "ბაზის ბანკი"',`;

code = code.replace(oldNameBB, newNameBB);

fs.writeFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', code);
console.log("Reverted alignment, fixed Silk/BB logos, fixed BB name");