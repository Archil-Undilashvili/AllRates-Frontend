fetch('https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json/')
    .then(res => res.json())
    .then(data => {
        const top5 = data[0].currencies.slice(0, 5);
        console.log("Top 5 Official:", top5.map(c => `${c.code}: ${c.rateFormated} (${c.diffFormated})`));
    });
