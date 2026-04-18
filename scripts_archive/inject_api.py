import re

js_path = '/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

target = "originalData = combinedData.filter(item => item.Company && ALL_COMPANIES.includes(item.Company.toLowerCase()));"

new_code = """
                // --- NEW API CALL FOR GEORGIAN COMPANIES ---
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

                originalData = newApiData.length > 0 ? newApiData : combinedData.filter(item => item.Company && ALL_COMPANIES.includes(item.Company.toLowerCase()));
"""

if target in js:
    js = js.replace(target, new_code)
    
    # Also fix the filter comp
    js = js.replace("const comp = item.Company.toLowerCase();", "const comp = item.baseCompany || item.Company.toLowerCase();")
    js = js.replace("const companyKey = item.Company.toLowerCase();", "const companyKey = item.baseCompany || item.Company.toLowerCase();")
    
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js)
    print("Injected successfully!")
else:
    print("Target not found!")
