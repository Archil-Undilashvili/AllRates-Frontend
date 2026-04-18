fetch('https://allrates-backend-api.onrender.com/api/rates/latest')
    .then(res => res.json())
    .then(data => {
        const bogs = data.filter(d => d.company.toLowerCase().includes('bog'));
        console.log("BOG rates:", bogs.map(b => b.company));
    });
