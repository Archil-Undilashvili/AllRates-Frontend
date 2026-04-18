const fs = require('fs');

let code = fs.readFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', 'utf8');

const badBlock = `\${logoUrl ? \`<div style="display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 44px; height: 44px;"><img src="\${logoUrl}" alt="\${compNameKa}" class="\${logoClass}" style="width: 100%; height: auto; object-fit: contain; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.05));"></div>\` : \`<div style="width: 44px; height: 44px; border-radius: 8px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><span style="font-weight:bold; font-size: 18px; color:\${initialColor};">\${mainName.charAt(0)}</span></div>\`}`;

const goodBlock = `\${logoUrl ? \`<div style="display: flex; align-items: center; justify-content: flex-start; flex-shrink: 0; width: 75px;"><img src="\${logoUrl}" alt="\${compNameKa}" class="\${logoClass}" style="max-width: 100%; max-height: 36px; object-fit: contain; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.05));"></div>\` : \`<div style="width: 36px; height: 36px; border-radius: 8px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 39px;"><span style="font-weight:bold; font-size: 16px; color:\${initialColor};">\${mainName.charAt(0)}</span></div>\`}`;

if (code.includes(badBlock)) {
    code = code.replace(badBlock, goodBlock);
    fs.writeFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', code);
    console.log("Fixed logo sizes");
} else {
    console.log("Could not find the exact string.");
}