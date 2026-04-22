
document.write(`
<div style="width: calc(100% + 40px); background-color: var(--card-bg); box-shadow: var(--shadow-sm); display: flex; justify-content: center; margin-bottom: 40px; margin-top: 0; padding: 15px 20px; margin-left: -20px; margin-right: -20px; border-bottom: 1px solid var(--border); box-sizing: border-box; z-index: 10;">
    <nav style="width: 100%; max-width: 1400px; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box;">
        <a href="index.html" style="text-decoration: none; display: flex; align-items: center; gap: 10px; margin-left: 0;">
            <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">
                <defs>
                    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f97316" /> <!-- Orange -->
                        <stop offset="50%" stop-color="#a855f7" /> <!-- Purple -->
                        <stop offset="100%" stop-color="#0ea5e9" /> <!-- Blue/Greenish -->
                    </linearGradient>
                </defs>
                <!-- Outer Ring Arrows -->
                <path d="M 50 12 A 38 38 0 0 1 87.6 30 L 98 30 L 78 55 L 58 30 L 70 30 A 24 24 0 0 0 30 30 L 16 14 A 38 38 0 0 1 50 12 Z" fill="url(#logoGrad)"/>
                <path d="M 50 88 A 38 38 0 0 1 12.4 70 L 2 70 L 22 45 L 42 70 L 30 70 A 24 24 0 0 0 70 70 L 84 86 A 38 38 0 0 1 50 88 Z" fill="url(#logoGrad)"/>
            </svg>
            <span style="font-size: 26px; font-weight: 800; font-family: 'Inter', sans-serif; letter-spacing: -0.5px; background: -webkit-linear-gradient(45deg, #f97316, #a855f7, #0ea5e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">AllRates<span style="color: #f1f5f9; -webkit-text-fill-color: #f1f5f9; font-weight: 600; font-size: 20px;">.ge</span></span>
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
