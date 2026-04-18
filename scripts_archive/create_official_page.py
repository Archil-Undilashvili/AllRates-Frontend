import os

html_content = """<!DOCTYPE html>
<html lang="ka">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ოფიციალური კურსები - AllRates.ge</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <style>
        .search-container {
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fff;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
        }
        .search-input {
            width: 100%;
            max-width: 400px;
            padding: 12px 15px;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
            font-size: 15px;
            outline: none;
            transition: border-color 0.2s;
            font-family: inherit;
        }
        .search-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .official-table-wrapper {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
            overflow: hidden;
            width: 100%;
        }
        .official-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }
        .official-table th {
            background: #f8fafc;
            padding: 16px 20px;
            font-size: 14px;
            color: #64748b;
            font-weight: 600;
            border-bottom: 1px solid #e2e8f0;
            text-transform: uppercase;
        }
        .official-table td {
            padding: 16px 20px;
            border-bottom: 1px solid #f1f5f9;
            color: #1e293b;
            font-size: 15px;
        }
        .official-table tr:last-child td {
            border-bottom: none;
        }
        .official-table tr:hover {
            background-color: #f8fafc;
        }
        .code-cell {
            font-weight: 700;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .rate-cell {
            font-weight: 600;
            font-size: 16px;
        }
        .diff-cell {
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .diff-up { color: #ef4444; } /* Red for up (foreign currency became more expensive) */
        .diff-down { color: #10b981; } /* Green for down */
        .diff-none { color: #94a3b8; }
        .currency-name {
            color: #475569;
            font-weight: 500;
        }
        .quantity-badge {
            display: inline-block;
            background: #f1f5f9;
            color: #64748b;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 8px;
        }
        .currency-flag {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            object-fit: cover;
            border: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
<script src="js/header.js"></script>

<div class="page-section" style="display: flex; justify-content: center; padding: 20px;">
    <div style="width: 100%; max-width: 1000px;">
        <h1 style="color: #1e293b; margin-bottom: 25px; font-size: 28px;">საქართველოს ეროვნული ბანკის ოფიციალური კურსები</h1>
        
        <div class="search-container">
            <input type="text" id="searchInput" class="search-input" placeholder="მოძებნე ვალუტა (მაგ. დოლარი, USD...)">
            <div id="dateDisplay" style="color: #64748b; font-weight: 500; font-size: 14px;"></div>
        </div>

        <div id="loader" class="loader" style="display: block; text-align: center; padding: 40px; color: #64748b;">
            ⏳ მონაცემები იტვირთება...
        </div>

        <div class="official-table-wrapper" id="tableWrapper" style="display: none;">
            <table class="official-table">
                <thead>
                    <tr>
                        <th style="width: 25%;">ვალუტა</th>
                        <th style="width: 40%;">დასახელება</th>
                        <th style="width: 20%;">კურსი</th>
                        <th style="width: 15%;">ცვლილება</th>
                    </tr>
                </thead>
                <tbody id="ratesBody">
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
    let allRates = [];

    async function fetchOfficialRates() {
        try {
            // Adding a timestamp to prevent caching issues if needed, but standard URL is fine
            const res = await fetch('https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json/');
            const data = await res.json();
            
            if (data && data.length > 0) {
                const latest = data[0];
                allRates = latest.currencies;
                
                // Format date nicely
                const dateObj = new Date(latest.date);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                document.getElementById('dateDisplay').innerHTML = `კურსები განახლებულია: <b>${dateObj.toLocaleDateString('ka-GE', options)}</b>`;
                
                renderTable(allRates);
                
                document.getElementById('loader').style.display = 'none';
                document.getElementById('tableWrapper').style.display = 'block';
            }
        } catch (error) {
            console.error("Error fetching NBG rates:", error);
            document.getElementById('loader').innerHTML = '❌ მონაცემების ჩატვირთვა ვერ მოხერხდა.';
        }
    }

    function renderTable(rates) {
        const tbody = document.getElementById('ratesBody');
        tbody.innerHTML = '';
        
        if (rates.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 30px; color: #64748b;">ვერაფერი მოიძებნა</td></tr>';
            return;
        }

        rates.forEach(item => {
            const tr = document.createElement('tr');
            
            // Format Diff
            let diffClass = 'diff-none';
            let diffIcon = '';
            let diffText = '0.0000';
            
            if (item.diff > 0) {
                diffClass = 'diff-up';
                diffIcon = '&#9650;'; // Up arrow
                diffText = item.diffFormated;
            } else if (item.diff < 0) {
                diffClass = 'diff-down';
                diffIcon = '&#9660;'; // Down arrow
                diffText = item.diffFormated;
            }

            // Flag URL using flagcdn
            const countryCode = item.code.substring(0, 2).toLowerCase();
            const flagUrl = `https://flagcdn.com/w40/${countryCode}.png`;

            // Handle special flags (like EUR -> EU, BTC, etc if NBG ever added them)
            let finalFlagUrl = flagUrl;
            if (item.code === 'EUR') finalFlagUrl = 'https://flagcdn.com/w40/eu.png';

            tr.innerHTML = `
                <td>
                    <div class="code-cell">
                        <img src="${finalFlagUrl}" alt="${item.code}" class="currency-flag" onerror="this.style.display='none'">
                        <span>${item.code}</span>
                    </div>
                </td>
                <td>
                    <span class="currency-name">${item.name}</span>
                    ${item.quantity > 1 ? `<span class="quantity-badge">${item.quantity} ერთეული</span>` : ''}
                </td>
                <td>
                    <span class="rate-cell">${item.rateFormated}</span>
                </td>
                <td>
                    <span class="diff-cell ${diffClass}">
                        <span>${diffIcon}</span>
                        <span>${diffText}</span>
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        if (!term) {
            renderTable(allRates);
            return;
        }
        
        const filtered = allRates.filter(item => {
            return item.code.toLowerCase().includes(term) || 
                   item.name.toLowerCase().includes(term);
        });
        renderTable(filtered);
    });

    // Initialize
    fetchOfficialRates();
</script>

</body>
</html>
"""

with open('/Users/archilundilashvili/Desktop/AllRates.ge/official.html', 'w', encoding='utf-8') as f:
    f.write(html_content)
    
print("official.html created!")
