
document.write(`
<div style="width: calc(100% + 40px); background-color: var(--card-bg); box-shadow: var(--shadow-sm); display: flex; justify-content: center; margin-bottom: 40px; margin-top: 0; padding: 15px 20px; margin-left: -20px; margin-right: -20px; border-bottom: 1px solid var(--border); box-sizing: border-box; z-index: 10;">
    <nav style="width: 100%; max-width: 1400px; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box;">
        <a href="index.html">
            <img src="Logos/logo.jpg" alt="AllRates Logo" style="height: 45px; width: auto; object-fit: contain; object-position: left center; cursor: pointer; border-radius: 8px; margin-left: 0;" />
        </a>
        <div style="display: flex; align-items: center; margin-left: auto; gap: 24px;">
            <a href="index.html" class="nav-link" data-page="index" style="text-decoration: none; color: var(--text-muted); font-weight: 700; font-size: 14px; cursor: pointer; text-transform: uppercase; transition: color 0.2s ease;">მთავარი</a>
            <a href="rates.html" class="nav-link" data-page="rates" style="text-decoration: none; color: var(--text-muted); font-weight: 700; font-size: 14px; cursor: pointer; text-transform: uppercase; transition: color 0.2s ease;">გაცვლითი კურსები ქართულ ბაზარზე</a>
            <a href="calculator.html" class="nav-link" data-page="calculator" style="text-decoration: none; color: var(--text-muted); font-weight: 700; font-size: 14px; cursor: pointer; text-transform: uppercase; transition: color 0.2s ease;">მოძებნე საუკეთესო კურსი</a>
            <a href="official.html" class="nav-link" data-page="official" style="text-decoration: none; color: var(--text-muted); font-weight: 700; font-size: 14px; cursor: pointer; text-transform: uppercase; transition: color 0.2s ease;">ოფიციალური კურსები</a>
            <a href="api.html" class="nav-link" data-page="api" style="text-decoration: none; color: var(--text-muted); font-weight: 700; font-size: 14px; cursor: pointer; text-transform: uppercase; transition: color 0.2s ease;">API სერვისი</a>
            <a href="contact.html" class="nav-link" data-page="contact" style="text-decoration: none; color: var(--text-muted); font-weight: 700; font-size: 14px; cursor: pointer; text-transform: uppercase; transition: color 0.2s ease;">კონტაქტი</a>
        </div>
    </nav>
</div>
`);

// Highlight active link
document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    document.querySelectorAll('.nav-link').forEach(link => {
        if(link.getAttribute('data-page') === page) {
            link.style.color = 'var(--primary)';
        }
    });
});
