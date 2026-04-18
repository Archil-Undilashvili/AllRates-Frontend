fetch('https://allrates-backend-api.onrender.com/api/rates/latest')
    .then(res => res.json())
    .then(data => {
        const rubs = data.map(d => ({ comp: d.company, buy: d.rubBuy, sell: d.rubSell })).filter(d => d.buy || d.sell);
        let bestBuy = -Infinity;
        let bestSell = Infinity;
        rubs.forEach(r => {
            let buy = parseFloat(r.buy);
            let sell = parseFloat(r.sell);
            if(!isNaN(buy) && buy > bestBuy) bestBuy = buy;
            if(!isNaN(sell) && sell < bestSell) bestSell = sell;
        });
        console.log("Best buy:", bestBuy, rubs.find(r => parseFloat(r.buy) === bestBuy));
        console.log("Best sell:", bestSell, rubs.find(r => parseFloat(r.sell) === bestSell));
    });
