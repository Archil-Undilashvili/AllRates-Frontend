import os

path = os.path.expanduser('~/Desktop/allrates.ge/js/main.js')
with open(path, 'r', encoding='utf-8') as f:
    js = f.read()

old_logic = """        const uniqueComps = {};
        originalData.forEach(item => {
            const base = item.baseCompany || item.Company.toLowerCase();
            if (!uniqueComps[base]) {
                uniqueComps[base] = item;
            }
        });
        
        const matches = [];
        for (let base in uniqueComps) {
            const item = uniqueComps[base];
            const nameKa = COMPANY_NAMES_KA[base] || item.Company;
            const nameEn = base;
            
            if (nameKa.toLowerCase().includes(val) || nameEn.toLowerCase().includes(val)) {
                matches.push({ base: base, item: item, nameKa: nameKa });
            }
        }"""

new_logic = """        const matches = [];
        
        originalData.forEach(item => {
            const base = item.baseCompany || item.Company.toLowerCase();
            
            let compNameKa = item.Company;
            if (item.baseCompany && COMPANY_NAMES_KA[item.baseCompany]) {
                const match = item.Company.match(/\((.*?)\)/);
                if (match) {
                    compNameKa = COMPANY_NAMES_KA[item.baseCompany] + ' (' + match[1] + ')';
                } else {
                    compNameKa = COMPANY_NAMES_KA[item.baseCompany];
                }
            } else if (COMPANY_NAMES_KA[base]) {
                compNameKa = COMPANY_NAMES_KA[base];
            }
            
            const nameEn = item.Company.toLowerCase();
            const nameEnBase = base.toLowerCase();
            const searchKa = compNameKa.toLowerCase();
            
            if (searchKa.includes(val) || nameEn.includes(val) || nameEnBase.includes(val)) {
                matches.push({ base: base, item: item, nameKa: compNameKa });
            }
        });"""

js = js.replace(old_logic, new_logic)

with open(path, 'w', encoding='utf-8') as f:
    f.write(js)

print("Search logic updated to show multiple categories.")
