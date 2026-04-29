import os
import re

filepath = os.path.expanduser('~/Desktop/allrates.ge/js/main.js')
with open(filepath, 'r', encoding='utf-8') as f:
    js_content = f.read()

# 1. Update currentTab initialization
js_content = js_content.replace("let currentTab = 'all';", "let currentTab = localStorage.getItem('allrates_current_tab') || 'all';")

# 2. Update switchTab function to save to localStorage
old_switch = """function switchTab(tab) {
            currentTab = tab;"""
new_switch = """function switchTab(tab) {
            currentTab = tab;
            localStorage.setItem('allrates_current_tab', tab);"""
js_content = js_content.replace(old_switch, new_switch)

# 3. Add DOMContentLoaded logic to apply the saved tab's UI state
dom_load_logic = """document.addEventListener('DOMContentLoaded', () => {
    const savedTab = localStorage.getItem('allrates_current_tab');
    if (savedTab) {
        const tabBtns = document.querySelectorAll('.tab-btn');
        if (tabBtns.length > 0) {
            tabBtns.forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.querySelector(`.tab-btn[onclick="switchTab('${savedTab}')"]`);
            if (activeBtn) activeBtn.classList.add('active');
        }
    }"""
js_content = js_content.replace("document.addEventListener('DOMContentLoaded', () => {", dom_load_logic)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(js_content)
print("done")
