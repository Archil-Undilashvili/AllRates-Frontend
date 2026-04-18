import re

js_path = '/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update switchTab to render all 4 tables
old_switch = """        function switchTab(tab) {
            currentTab = tab;
            
            // ღილაკების ვიზუალის განახლება
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`).classList.add('active');

            renderTable('usd');
            renderTable('eur');
        }"""
new_switch = """        function switchTab(tab) {
            currentTab = tab;
            
            // ღილაკების ვიზუალის განახლება
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`).classList.add('active');

            renderTable('usd');
            renderTable('eur');
            renderTable('gbp');
            renderTable('rub');
        }"""
js = js.replace(old_switch, new_switch)

# 2. Update toggleExpand to toggle ALL tables
old_expand = """        function toggleExpand(currency) {
            expandedStates[currency] = !expandedStates[currency];
            renderTable(currency);
        }"""
new_expand = """        function toggleExpand(currency) {
            // Toggle all states based on the clicked one
            const newState = !expandedStates[currency];
            expandedStates.usd = newState;
            expandedStates.eur = newState;
            expandedStates.gbp = newState;
            expandedStates.rub = newState;
            
            renderTable('usd');
            renderTable('eur');
            renderTable('gbp');
            renderTable('rub');
            
            // Scroll to the top of the tables wrapper if collapsing so we don't end up far down the page
            if (!newState) {
                const wrapper = document.getElementById('tables-wrapper');
                if (wrapper) {
                    const yOffset = -80; 
                    const y = wrapper.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({top: y, behavior: 'smooth'});
                }
            }
        }"""
js = js.replace(old_expand, new_expand)

# 3. Update sortData to expand ALL tables
old_sort_expand = """            expandedStates[currency] = true;
            applySorting(currency);"""
new_sort_expand = """            expandedStates.usd = true;
            expandedStates.eur = true;
            expandedStates.gbp = true;
            expandedStates.rub = true;
            
            applySorting(currency);
            // Render other tables to show expanded state
            ['usd', 'eur', 'gbp', 'rub'].forEach(cur => {
                if (cur !== currency) renderTable(cur);
            });"""
js = js.replace(old_sort_expand, new_sort_expand)

# 4. Change button text from "აკეცვა" to "დაბრუნება ტოპ 10-ზე"
js = js.replace("expandBtn.innerHTML = 'აკეცვა &#9650;';", "expandBtn.innerHTML = 'დაბრუნება ტოპ 10-ზე &#9650;';")

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)
print("Fixes applied successfully!")
