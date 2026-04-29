import os
import re

filepath_html = os.path.expanduser('~/Desktop/allrates.ge/contact.html')
with open(filepath_html, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Hide success and error divs by default, and add some styling to make them look good when they appear
new_success = '<div id="contact-success" style="display:none; background:#ecfdf5; color:#059669; border:1px solid #a7f3d0; padding:12px 16px; border-radius:8px; font-size:14px; font-weight:500; margin-bottom:1.2rem; align-items:center;">\n                    ✓ &nbsp;თქვენი შეტყობინება წარმატებით გაიგზავნა! მადლობთ, რომ დაგვიკავშირდით.\n                </div>'
new_error = '<div id="contact-error" style="display:none; background:#fef2f2; color:#dc2626; border:1px solid #fecaca; padding:12px 16px; border-radius:8px; font-size:14px; font-weight:500; margin-bottom:1.2rem; align-items:center;"></div>'

html_content = re.sub(r'<div id="contact-success" style="">.*?</div>', new_success, html_content, flags=re.DOTALL)
html_content = re.sub(r'<div id="contact-error" style="">.*?</div>', new_error, html_content, flags=re.DOTALL)

with open(filepath_html, 'w', encoding='utf-8') as f:
    f.write(html_content)


filepath_js = os.path.expanduser('~/Desktop/allrates.ge/js/main.js')
with open(filepath_js, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Update sendContactForm function to include email validation
# Find the exact lines in main.js
js_find = """            if (!email || !message) {
                error.textContent = '✗   გთხოვთ შეავსოთ სავალდებულო ველები (ელ-ფოსტა და შეტყობინება).';
                error.style.display = 'block';
                return;
            }"""

js_replace = """            const emailInput = document.getElementById('c-email');
            emailInput.style.borderColor = ''; // reset border color

            if (!email || !message) {
                error.textContent = '✗   გთხოვთ შეავსოთ სავალდებულო ველები (ელ-ფოსტა და შეტყობინება).';
                error.style.display = 'block';
                return;
            }

            if (!email.includes('@')) {
                error.textContent = '✗   ელ ფოსტა არასწორია (არ შეიცავს @ სიმბოლოს).';
                error.style.display = 'block';
                emailInput.style.borderColor = '#dc2626'; // Red border
                return;
            }"""

js_content = js_content.replace(js_find, js_replace)

with open(filepath_js, 'w', encoding='utf-8') as f:
    f.write(js_content)
print("Updated HTML and JS")
