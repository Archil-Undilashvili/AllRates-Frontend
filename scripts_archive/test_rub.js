fetch('https://allrates-backend-api.onrender.com/api/rates/latest')
    .then(res => res.json())
    .then(data => {
        const rubs = data.map(d => ({ comp: d.company, buy: d.rubBuy, sell: d.rubSell })).filter(d => d.buy || d.sell);
        console.log("RUB rates:", rubs.slice(0, 5));
        let bestBuy = -Infinity;
        rubs.forEach(r => {
            let buy = parseFloat(r.buy);
            if(!isNaN(buy) && buy > bestBuy) bestBuy = buy;
        });
        console.log("Best buy:", bestBuy);
        console.log("Does any match?", rubs.filter(r => parseFloat(r.buy) === bestBuy));
    });
