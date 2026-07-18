const isFooterLocalPreview = ['localhost', '127.0.0.1', ''].includes(window.location.hostname) || window.location.protocol === 'file:';

function getFooterHref(path) {
    if (!isFooterLocalPreview) return path;
    if (path === '/') return 'index.html';
    if (path === '/#faq') return 'index.html#faq';

    const [pagePath, hash] = path.split('#');
    const localPath = `${pagePath.replace(/^\//, '')}.html`;
    return hash ? `${localPath}#${hash}` : localPath;
}

document.write(`
<footer class="allrates-footer">
    <div class="allrates-footer-grid">
        <div class="allrates-footer-column">
            <h4>ნავიგაცია</h4>
            <ul>
                <li><a href="${getFooterHref('/')}">მთავარი</a></li>
                <li><a href="${getFooterHref('/rates')}">შეადარე კურსები</a></li>
                <li><a href="${getFooterHref('/sawvavis-fasebi')}">საწვავის ფასები</a></li>
                <li><a href="${getFooterHref('/calculator')}">კონვერტაციის კალკულატორი</a></li>
                <li><a href="${getFooterHref('/official')}">ოფიციალური კურსები</a></li>
                <li><a href="${getFooterHref('/#faq')}">FAQ</a></li>
                <li><a href="${getFooterHref('/contact')}">კონტაქტი</a></li>
            </ul>
        </div>

        <div class="allrates-footer-column">
            <h4>პოპულარული გვერდები</h4>
            <ul>
                <li><a href="${getFooterHref('/valutis-kursi')}">ვალუტის კურსი</a></li>
                <li><a href="${getFooterHref('/dolaris-kursi')}">დოლარის კურსი</a></li>
                <li><a href="${getFooterHref('/evros-kursi')}">ევროს კურსი</a></li>
                <li><a href="${getFooterHref('/laris-kursi')}">ლარის კურსი</a></li>
                <li><a href="${getFooterHref('/valutis-gacvla')}">ვალუტის გაცვლა</a></li>
                <li><a href="${getFooterHref('/bitcoinis-fasi')}">ბიტკოინის ფასი</a></li>
                <li><a href="${getFooterHref('/valutis-kursebi-dges')}">NBG სტატისტიკა</a></li>
            </ul>
        </div>

        <div class="allrates-footer-column allrates-footer-note">
            <h4>მნიშვნელოვანი ინფორმაცია</h4>
            <p>
                AllRates.ge-ზე განთავსებული მონაცემები ატარებს საინფორმაციო ხასიათს და არ წარმოადგენს ფინანსურ ან საინვესტიციო რჩევას.
                ვალუტის გადაცვლამდე გადაამოწმეთ საბოლოო კურსი შესაბამის კომპანიასთან.
            </p>
        </div>

        <div class="allrates-footer-column">
            <h4>კონტაქტი</h4>
            <div class="allrates-footer-socials">
                <a href="https://www.linkedin.com/company/allratesge/" target="_blank" rel="noopener" title="LinkedIn" aria-label="LinkedIn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
            </div>
            <p class="allrates-footer-contact">info@allrates.ge</p>
        </div>
    </div>

    <div class="allrates-footer-bottom">
        &copy; ${new Date().getFullYear()} AllRates.ge. ყველა უფლება დაცულია.
    </div>
</footer>
`);
