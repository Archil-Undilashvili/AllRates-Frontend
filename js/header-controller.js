document.addEventListener('DOMContentLoaded', () => {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const firstSegment = pathSegments[0] || 'index';
    const lastSegment = pathSegments[pathSegments.length - 1] || 'index';
    const page = lastSegment.replace('.html', '') || 'index';

    document.querySelectorAll('.nav-link, .nav-dropdown-item').forEach(link => {
        const target = link.getAttribute('data-page');
        const isPairPage = target === 'currency-pairs' && ['market-rates', 'official-rates'].includes(firstSegment);
        if (target === page || target === firstSegment || isPairPage) link.classList.add('active');
    });

    if (['calculator', 'loan-calculator', 'loan-comparison', 'deposit-calculator', 'inflation-calculator'].includes(page)) {
        document.querySelector('.nav-dropdown-toggle[data-page="calculators"]')?.classList.add('active');
    }
    if (['market-rates', 'official-rates'].includes(firstSegment)) {
        document.querySelector('.nav-dropdown-toggle[data-page="currency-pairs"]')?.classList.add('active');
    }

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

    document.querySelectorAll('.nav-dropdown-toggle').forEach(dropdownToggle => {
        dropdownToggle.addEventListener('click', event => {
            event.stopPropagation();
            const dropdown = dropdownToggle.closest('.nav-dropdown');
            const isOpen = dropdown?.classList.toggle('open');
            dropdownToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
        });
    });

    links.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('click', event => {
        document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
            if (!dropdown.contains(event.target)) {
                dropdown.classList.remove('open');
                dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
            }
        });
        if (!event.target.closest('.site-nav')) closeMenu();
    });
});
