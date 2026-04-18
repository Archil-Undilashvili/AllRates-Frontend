const fs = require('fs');
let code = fs.readFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', 'utf8');

const badLogic = `const compNameKa = COMPANY_NAMES_KA[companyKey] || item.Company.toUpperCase();`;

const goodLogic = `let compNameKa = item.Company;
                if (item.baseCompany && COMPANY_NAMES_KA[item.baseCompany]) {
                    const match = item.Company.match(/\\((.*?)\\)/);
                    if (match) {
                        compNameKa = COMPANY_NAMES_KA[item.baseCompany] + ' (' + match[1] + ')';
                    } else {
                        compNameKa = COMPANY_NAMES_KA[item.baseCompany];
                    }
                } else if (COMPANY_NAMES_KA[companyKey]) {
                    compNameKa = COMPANY_NAMES_KA[companyKey];
                }`;

if (code.includes(badLogic)) {
    code = code.replace(badLogic, goodLogic);
    fs.writeFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', code);
    console.log("Fixed compNameKa logic!");
} else {
    console.log("Could not find badLogic.");
}
