fetch('https://allrates-backend-api.onrender.com/api/rates/latest')
    .then(res => res.json())
    .then(data => {
        const BANK_COMPANIES = ['bog', 'tbc', 'liberty', 'bb', 'credo', 'cartu', 'hash', 'tera', 'halyk', 'is', 'silk'];
        const rubs = data.filter(d => {
            let base = d.company.split(' ')[0].toLowerCase();
            if (base === 'isbank') base = 'is';
            if (base === 'terabank') base = 'tera';
            if (base === 'inteliexpress' || base === 'inteli' || d.company.toLowerCase().includes('inex')) base = 'inex';
            if (base === 'cartubank') base = 'cartu';
            if (base === 'hashbank') base = 'hash';
            if (base === 'basisbank') base = 'bb';
            return BANK_COMPANIES.includes(base);
        }).map(d => ({ comp: d.company, buy: d.rubBuy, sell: d.rubSell }));
        
        let bestBuy = -Infinity;
        let bestSell = Infinity;
        rubs.forEach(r => {
            let buy = parseFloat(r.buy);
            let sell = parseFloat(r.sell);
            if(!isNaN(buy) && buy > bestBuy) bestBuy = buy;
            if(!isNaN(sell) && sell < bestSell) bestSell = sell;
        });
        console.log("Banks Best buy:", bestBuy);
        console.log("Banks Best sell:", bestSell);
        console.log("Who has best sell?", rubs.filter(r => parseFloat(r.sell) === bestSell));
    });
