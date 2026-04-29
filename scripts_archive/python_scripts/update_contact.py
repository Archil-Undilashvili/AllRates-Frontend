import os

filepath = os.path.expanduser('~/Desktop/allrates.ge/contact.html')

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the email text
content = content.replace("archilundilashvili@gmail.com", "info@allrates.ge")

# Fix form submit URL (assuming it exists in main.js, but let's check if the form uses a JS function)
# Actually, the user asked to change the email.

# Check if the footer is already there. If not, append it before the scripts.
footer_html = """
    <!-- Footer Section -->
    <footer style="margin-top: 60px; padding: 40px 20px 20px; border-top: 1px solid var(--border); background: transparent;">
        <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 40px; text-align: center;">
            
            <!-- Column 1: Menu -->
            <div>
                <h4 style="color: var(--text-main); font-size: 1.1em; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary)"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    ნავიგაცია
                </h4>
                <style>
                    .footer-nav-link { color: var(--text-muted); text-decoration: none; font-size: 0.95em; transition: color 0.2s; display: inline-block; padding: 4px 0; }
                    .footer-nav-link:hover { color: var(--primary); }
                    .footer-social-link { color: var(--text-muted); transition: all 0.2s; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: var(--card-bg); border: 1px solid var(--border); }
                    .footer-social-link:hover { color: var(--primary); border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                </style>
                <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
                    <li><a href="index.html" class="footer-nav-link">მთავარი</a></li>
                    <li><a href="rates.html" class="footer-nav-link">ყველა კურსი</a></li>
                    <li><a href="official.html" class="footer-nav-link">ოფიციალური კურსები</a></li>
                    <li><a href="calculator.html" class="footer-nav-link">კალკულატორი</a></li>
                </ul>
            </div>

            <!-- Column 2: Important Info (Center) -->
            <div>
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 15px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <h4 style="margin: 0; color: var(--text-main); font-size: 1.1em;">მნიშვნელოვანი ინფორმაცია</h4>
                </div>
                <p style="margin: 0; color: var(--text-muted); font-size: 0.85em; line-height: 1.6;">
                    ვებგვერდზე (allrates.ge) განთავსებული მონაცემები ატარებს მხოლოდ საინფორმაციო ხასიათს და <strong>არ წარმოადგენს ფინანსურ ან საინვესტიციო რჩევას</strong>. 
                    ჩვენ არ ვიღებთ პასუხისმგებლობას ინფორმაციის აბსოლუტურ სიზუსტეზე, დაგვიანებაზე ან ამ მონაცემებზე დაყრდნობით მიღებულ ფინანსურ გადაწყვეტილებებსა და შესაძლო ზარალზე.
                </p>
            </div>

            <!-- Column 3: Social -->
            <div>
                <h4 style="color: var(--text-main); font-size: 1.1em; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary)"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    კონტაქტი
                </h4>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <a href="#" target="_blank" title="Facebook" class="footer-social-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </a>
                    <a href="#" target="_blank" title="Instagram" class="footer-social-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </a>
                </div>
                <p style="margin-top: 15px; color: var(--text-muted); font-size: 0.9em; line-height: 1.5;">
                    გამოგვყევით სოციალურ ქსელებში, რათა არ გამოტოვოთ სიახლეები.
                </p>
            </div>

        </div>
        
        <div style="max-width: 1200px; margin: 40px auto 0; padding-top: 20px; border-top: 1px solid var(--border); text-align: center; color: var(--text-muted); font-size: 0.85em;">
            &copy; <span id="current-year"></span> AllRates.ge. ყველა უფლება დაცულია.
        </div>
        <script>document.getElementById('current-year').textContent = new Date().getFullYear();</script>
    </footer>
"""

# Let's fix the layout of the contact page to make it occupy the full viewport efficiently.
# It currently has: <div id="contact-page" class="page-section" style="">
# We'll make it a flex container that grows.
content = content.replace('<div id="contact-page" class="page-section" style="">', '<div id="contact-page" class="page-section" style="min-height: calc(100vh - 350px); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px;">')

# The wrapper has max-width 680px. Let's make it responsive and centered
content = content.replace('<div style="width: 100%; max-width: 680px; padding: 20px 0 60px 0;">', '<div style="width: 100%; max-width: 700px; padding: 20px 0; margin: 0 auto;">')

# Fix a small bug in the current code where there is a rogue "<" at the end of the div
content = content.replace('    <\n\n<script src="js/main.js"></script>', '    </div>\n</div>\n\n' + footer_html + '\n<script src="js/main.js"></script>')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("done contact.html")
