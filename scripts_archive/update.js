const fs = require('fs');

let mainJs = fs.readFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', 'utf8');

const fetchBlock = `                // --- NEW API CALL FOR GEORGIAN COMPANIES ---
                let newApiData = [];
                try {
                    const newApiRes = await fetch('https://allrates-backend-api.onrender.com/api/rates/latest');
                    if (newApiRes.ok) {
                        const rawNewData = await newApiRes.json();
                        newApiData = rawNewData.map(item => {
                            let base = item.company.split(' ')[0].toLowerCase();
                            if (base === 'isbank') base = 'is';
                            if (base === 'terabank') base = 'tera';
                            if (base === 'inteliexpress' || base === 'inteli' || item.company.toLowerCase().includes('inex')) base = 'inex';
                            if (base === 'cartubank') base = 'cartu';
                            if (base === 'hashbank') base = 'hash';
                            
                            return {
                                Company: item.company,
                                baseCompany: base,
                                'USDGEL (Buy)': item.usdBuy,
                                'USDGEL (Sell)': item.usdSell,
                                'EURGEL (Buy)': item.eurBuy,
                                'EURGEL (Sell)': item.eurSell,
                                'GBPGEL (Buy)': item.gbpBuy,
                                'GBPGEL (Sell)': item.gbpSell,
                                'RUBGEL (Buy)': item.rubBuy,
                                'RUBGEL (Sell)': item.rubSell,
                                'Update Time': item.tbilisiDateString || item.createdAt
                            };
                        });
                    }
                } catch(e) { console.error("New API fetch failed:", e); }

                originalData = newApiData.length > 0 ? newApiData : combinedData.filter(item => item.Company && ALL_COMPANIES.includes(item.Company.toLowerCase()));`;

mainJs = mainJs.replace(
    `originalData = combinedData.filter(item => item.Company && ALL_COMPANIES.includes(item.Company.toLowerCase()));`,
    fetchBlock
);

mainJs = mainJs.replace(
    `const comp = item.Company.toLowerCase();`,
    `const comp = item.baseCompany || item.Company.toLowerCase();`
);

mainJs = mainJs.replace(
    `const companyKey = item.Company.toLowerCase();`,
    `const companyKey = item.baseCompany || item.Company.toLowerCase();`
);

const nameLogic = `let compNameKa = item.Company;
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

mainJs = mainJs.replace(
    `const compNameKa = COMPANY_NAMES_KA[companyKey] || item.Company.toUpperCase();`,
    nameLogic
);

fs.writeFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', mainJs);
console.log("Updated main.js");