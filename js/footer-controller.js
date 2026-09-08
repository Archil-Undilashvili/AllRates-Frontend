document.addEventListener('DOMContentLoaded', () => {
    const compact = window.matchMedia('(max-width: 600px)');
    const syncNavigation = () => document.querySelectorAll('.footer-navigation-content').forEach(node => { node.open = !compact.matches; });
    syncNavigation();
    compact.addEventListener('change', syncNavigation);
    document.querySelectorAll('[data-current-year]').forEach(node => {
        node.textContent = String(new Date().getFullYear());
    });
});
