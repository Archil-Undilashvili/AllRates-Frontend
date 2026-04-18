fetch('https://allrates-backend-api.onrender.com/api/rates/latest')
    .then(res => res.json())
    .then(data => {
        const rubs = data.map(d => ({ comp: d.company, buy: d.rubBuy, sell: d.rubSell })).filter(d => d.comp.toLowerCase().includes('crystal') || d.comp.toLowerCase().includes('კრისტალ'));
        console.log("Crystal RUB:", rubs);
    });
