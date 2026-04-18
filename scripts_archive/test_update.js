const fs = require('fs');
let mainJs = fs.readFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', 'utf8');

const target1 = `originalData = combinedData.filter(item => item.Company && ALL_COMPANIES.includes(item.Company.toLowerCase()));`;
console.log("Target 1 found:", mainJs.includes(target1));

const target2 = `const compNameKa = COMPANY_NAMES_KA[companyKey] || item.Company.toUpperCase();`;
console.log("Target 2 found:", mainJs.includes(target2));
