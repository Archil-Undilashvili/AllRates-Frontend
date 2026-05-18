const isLocalPreview = ['localhost', '127.0.0.1', ''].includes(window.location.hostname) || window.location.protocol === 'file:';

function getPreviewHref(path) {
    if (!isLocalPreview) return path;
    if (path === '/') return 'index.html';
    if (path === '/#faq') return 'index.html#faq';

    const [pagePath, hash] = path.split('#');
    const localPath = `${pagePath.replace(/^\//, '')}.html`;
    return hash ? `${localPath}#${hash}` : localPath;
}

document.write(`
<div class="site-header">
    <nav class="site-nav">
        <a href="${getPreviewHref('/')}" class="site-brand" aria-label="AllRates.ge მთავარი გვერდი">
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
            <a href="${getPreviewHref('/')}" class="nav-link" data-page="index">
                <svg class="nav-link-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5 10.5V20h5v-5h4v5h5v-9.5"></path></svg>
                მთავარი
            </a>
            <a href="${getPreviewHref('/rates')}" class="nav-link nav-link-with-note" data-page="rates">
                <svg class="nav-link-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h11"></path><path d="M7 17h11"></path><path d="M4 7h.01"></path><path d="M4 17h.01"></path><path d="m15 4 3 3-3 3"></path><path d="m10 14-3 3 3 3"></path></svg>
                შეადარე კურსები <span>(მოძებნე საუკეთესო კურსი)</span>
            </a>
            <a href="${getPreviewHref('/sawvavis-fasebi')}" class="nav-link nav-link-gas" data-page="sawvavis-fasebi" aria-label="საწვავის ფასები">
                <svg class="nav-gas-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 3h7a2 2 0 0 1 2 2v16H5V5a2 2 0 0 1 2-2Z"></path>
                    <path d="M8 6h5v5H8V6Z"></path>
                    <path d="M16 8h1.6c.5 0 .9.2 1.2.6l1.4 1.7c.3.4.5.9.5 1.4V18a2 2 0 0 1-4 0v-4.5"></path>
                    <path d="M19 10.5v1.8"></path>
                </svg>
                საწვავის ფასები
            </a>
            <a href="${getPreviewHref('/calculator')}" class="nav-link" data-page="calculator">
                <svg class="nav-link-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"></rect><path d="M8 7h8"></path><path d="M8 11h.01"></path><path d="M12 11h.01"></path><path d="M16 11h.01"></path><path d="M8 15h.01"></path><path d="M12 15h.01"></path><path d="M16 15h.01"></path></svg>
                კონვერტაციის კალკულატორი
            </a>
            <a href="${getPreviewHref('/official')}" class="nav-link nav-link-with-note" data-page="official">
                <img src="Logos/nbg_logo_new.jpg" alt="" class="nav-link-logo">
                ოფიციალური კურსები <span>(ჩამოტვირთე xlsx.)</span>
            </a>
            <a href="${getPreviewHref('/contact')}" class="nav-link" data-page="contact">
                <svg class="nav-link-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4z"></path><path d="m4 7 8 6 8-6"></path></svg>
                კონტაქტი
            </a>
            <button id="authBtn" class="auth-nav-btn">ავტორიზაცია</button>
        </div>
    </nav>
</div>
<script src="js/auth.js"></script>
`);

document.addEventListener('DOMContentLoaded', () => {
    const pathPart = window.location.pathname.split('/').filter(Boolean).pop() || 'index';
    const page = pathPart.replace('.html', '') || 'index';
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
