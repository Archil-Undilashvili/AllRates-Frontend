fetch('https://allrates-backend-api.onrender.com/api/rates/latest')
    .then(res => res.json())
    .then(data => {
        const banks = data.filter(d => d.company.toLowerCase().includes('basis') || d.company.toLowerCase().includes('silk') || d.company.toLowerCase().includes('ბაზის'));
        console.log("Found banks:", banks.map(b => b.company));
    });
