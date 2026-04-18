import re

html_path = '/Users/archilundilashvili/Desktop/AllRates.ge/official.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Add Flatpickr CSS
if 'flatpickr.min.css' not in html:
    html = html.replace('</head>', '    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">\n</head>')

# Update the search container HTML
old_search_html = """        <div class="search-container">
            <input type="text" id="searchInput" class="search-input" placeholder="მოძებნე ვალუტა (მაგ. დოლარი, USD...)">
            <div id="dateDisplay" style="color: #64748b; font-weight: 500; font-size: 14px;"></div>
        </div>"""

new_search_html = """        <div class="search-container">
            <input type="text" id="searchInput" class="search-input" placeholder="მოძებნე ვალუტა (მაგ. დოლარი, USD...)" style="flex: 1; max-width: 350px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span id="dateLabel" style="color: #64748b; font-weight: 500; font-size: 13px; text-align: right;">აირჩიეთ თარიღი:</span>
                <div style="position: relative;">
                    <input type="text" id="datePicker" class="search-input" placeholder="თარიღი..." style="width: 140px; padding-left: 35px; cursor: pointer; text-align: center; background: #f8fafc;">
                    <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #3b82f6; pointer-events: none;">📅</span>
                </div>
            </div>
        </div>"""

html = html.replace(old_search_html, new_search_html)

# Add Flatpickr JS and update fetch logic
old_script = """    let allRates = [];

    async function fetchOfficialRates() {
        try {
            // Adding a timestamp to prevent caching issues if needed, but standard URL is fine
            const res = await fetch('https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json/');
            const data = await res.json();
            
            if (data && data.length > 0) {
                const latest = data[0];
                allRates = latest.currencies;
                
                
                // Sort to put USD, EUR, GBP, RUB first, then alphabetical
                const priority = { 'USD': 1, 'EUR': 2, 'GBP': 3, 'RUB': 4 };
                allRates.sort((a, b) => {
                    const pA = priority[a.code] || 99;
                    const pB = priority[b.code] || 99;
                    if (pA !== pB) return pA - pB;
                    return a.code.localeCompare(b.code);
                });
                
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
    }"""

new_script = """    let allRates = [];
    let fpInstance = null;

    async function fetchOfficialRates(dateStr = '') {
        try {
            document.getElementById('loader').style.display = 'block';
            document.getElementById('loader').innerHTML = '⏳ მონაცემები იტვირთება...';
            document.getElementById('tableWrapper').style.display = 'none';
            
            let url = 'https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json/';
            if (dateStr) {
                url += `?date=${dateStr}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            
            if (data && data.length > 0) {
                const latest = data[0];
                allRates = latest.currencies;
                
                // Sort to put USD, EUR, GBP, RUB first, then alphabetical
                const priority = { 'USD': 1, 'EUR': 2, 'GBP': 3, 'RUB': 4 };
                allRates.sort((a, b) => {
                    const pA = priority[a.code] || 99;
                    const pB = priority[b.code] || 99;
                    if (pA !== pB) return pA - pB;
                    return a.code.localeCompare(b.code);
                });
                
                // Format date nicely for the label
                const dateObj = new Date(latest.date);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                document.getElementById('dateLabel').innerHTML = `კურსები მოქმედებს:<br><b>${dateObj.toLocaleDateString('ka-GE', options)}</b>`;
                
                // Update picker silently if it wasn't a user pick
                if (!dateStr && fpInstance) {
                    fpInstance.setDate(dateObj, false);
                }

                // If user typed in search box already, keep filter applied
                const term = document.getElementById('searchInput').value.toLowerCase().trim();
                if (term) {
                    const filtered = allRates.filter(item => {
                        return item.code.toLowerCase().includes(term) || 
                               item.name.toLowerCase().includes(term);
                    });
                    renderTable(filtered);
                } else {
                    renderTable(allRates);
                }
                
                document.getElementById('loader').style.display = 'none';
                document.getElementById('tableWrapper').style.display = 'block';
            } else {
                document.getElementById('loader').innerHTML = '❌ ამ თარიღზე მონაცემები არ მოიძებნა.';
            }
        } catch (error) {
            console.error("Error fetching NBG rates:", error);
            document.getElementById('loader').innerHTML = '❌ მონაცემების ჩატვირთვა ვერ მოხერხდა.';
        }
    }"""

html = html.replace(old_script, new_script)

old_init = """    // Initialize
    fetchOfficialRates();
</script>"""

new_init = """    // Initialize Calendar and Fetch
    const script1 = document.createElement('script');
    script1.src = "https://cdn.jsdelivr.net/npm/flatpickr";
    script1.onload = () => {
        const script2 = document.createElement('script');
        script2.src = "https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ka.js";
        script2.onload = () => {
            fpInstance = flatpickr("#datePicker", {
                locale: "ka",
                dateFormat: "Y-m-d",
                maxDate: "today",
                onChange: function(selectedDates, dateStr, instance) {
                    fetchOfficialRates(dateStr);
                }
            });
            fetchOfficialRates();
        };
        document.body.appendChild(script2);
    };
    document.body.appendChild(script1);
</script>"""

if 'flatpickr' not in old_init:
    html = html.replace(old_init, new_init)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
    
print("Calendar added!")
