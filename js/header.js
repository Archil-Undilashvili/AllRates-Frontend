document.write(`
<div class="site-header">
    <nav class="site-nav">
        <a href="/" class="site-brand" aria-label="AllRates.ge მთავარი გვერდი">
            <span class="site-brand-main">
                <svg class="site-logo" width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#f97316" />
                            <stop offset="50%" stop-color="#a855f7" />
                            <stop offset="100%" stop-color="#0ea5e9" />
                        </linearGradient>
                    </defs>
                    <path d="M 50 12 A 38 38 0 0 1 87.6 30 L 98 30 L 78 55 L 58 30 L 70 30 A 24 24 0 0 0 30 30 L 16 14 A 38 38 0 0 1 50 12 Z" fill="url(#logoGrad)"/>
                    <path d="M 50 88 A 38 38 0 0 1 12.4 70 L 2 70 L 22 45 L 42 70 L 30 70 A 24 24 0 0 0 70 70 L 84 86 A 38 38 0 0 1 50 88 Z" fill="url(#logoGrad)"/>
                </svg>
                <span class="site-brand-text">AllRates<span>.ge</span></span>
            </span>
            <span class="site-brand-tagline">ბიზნეს და საბანკო პლათფორმა</span>
        </a>

        <button class="mobile-menu-toggle" type="button" aria-label="მენიუს გახსნა" aria-expanded="false" aria-controls="site-nav-links">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <div class="site-nav-links" id="site-nav-links">
            <a href="/" class="nav-link" data-page="index">მთავარი</a>
            <a href="/rates" class="nav-link nav-link-with-note" data-page="rates">შეადარე კურსები <span>(მოძებნე საუკეთესო კურსი)</span></a>
            <a href="/calculator" class="nav-link" data-page="calculator">კონვერტაციის კალკულატორი</a>
            <a href="/official" class="nav-link nav-link-with-note" data-page="official">ოფიციალური კურსები <span>(ჩამოტვირთე xlsx.)</span></a>
            <a href="/valutis-kursebi-dges" class="nav-link" data-page="valutis-kursebi-dges">NBG სტატისტიკა</a>
            <a href="/contact" class="nav-link" data-page="contact">კონტაქტი</a>
            <button id="authBtn" class="auth-nav-btn">ავტორიზაცია</button>
        </div>
    </nav>
</div>
<script src="js/auth.js"></script>
`);

document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });

    const toggle = document.querySelector('.mobile-menu-toggle');
    const links = document.getElementById('site-nav-links');
    if (!toggle || !links) return;

    const closeMenu = () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
        const isOpen = links.classList.toggle('open');
        toggle.classList.toggle('open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('click', event => {
        if (!event.target.closest('.site-nav')) closeMenu();
    });
});
