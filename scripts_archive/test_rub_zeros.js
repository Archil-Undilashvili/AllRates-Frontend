fetch('https://allrates-backend-api.onrender.com/api/rates/latest')
    .then(res => res.json())
    .then(data => {
        const rubs = data.map(d => ({ comp: d.company, buy: d.rubBuy, sell: d.rubSell }));
        let bestBuy = -Infinity;
        let bestSell = Infinity;
        rubs.forEach(r => {
            let buy = parseFloat(r.buy);
            let sell = parseFloat(r.sell);
            if(!isNaN(buy) && buy > bestBuy) bestBuy = buy;
            if(!isNaN(sell) && sell < bestSell) bestSell = sell;
        });
        console.log("Best buy:", bestBuy);
        console.log("Best sell:", bestSell);
        console.log("Who has best sell?", rubs.filter(r => parseFloat(r.sell) === bestSell));
    });
