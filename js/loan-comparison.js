(function () {
    const form = document.getElementById('loan-comparison-form');
    const grid = document.getElementById('loan-comparison-grid');
    const addBtn = document.getElementById('add-loan-btn');
    const resultsSection = document.getElementById('loan-comparison-results');
    const resultGrid = document.getElementById('loan-comparison-result-grid');
    const chartCard = document.getElementById('loan-comparison-chart-card');
    const chart = document.getElementById('loan-comparison-chart');
    const ctx = chart.getContext('2d');

    const maxLoans = 4;
    let loanDrafts = [defaultLoan(1), defaultLoan(2)];
    let lastResults = [];

    const tooltips = {
        name: 'სახელი მხოლოდ შედარებისთვის გამოიყენება. მაგალითად: ბანკი A, შეთავაზება 1 ან იპოთეკა.',
        amount: 'შეიყვანე სესხის ძირი, ანუ ის თანხა, რომელსაც იღებ.',
        term: 'სესხის სრული ვადა თვეებში. მაგალითად 120 ნიშნავს 10 წელს.',
        rate: 'საწყისი წლიური საპროცენტო განაკვეთი. ცვლადი სესხის შემთხვევაში ეს არის ფიქსირებული პერიოდის პროცენტი.',
        rateType: 'ფიქსირებულის დროს პროცენტი მთელი ვადის განმავლობაში უცვლელია. ცვლადის დროს გარკვეული პერიოდის შემდეგ პროცენტი იცვლება.',
        fixedMonths: 'რამდენი თვე რჩება საწყისი პროცენტი ძალაში. ამ პერიოდის შემდეგ დარჩენილ ვადაზე პროცენტი შეიცვლება.',
        increase: 'რამდენი პროცენტული პუნქტით იზრდება საწყისი პროცენტი ცვლად პერიოდზე გადასვლისას. მაგალითად 3 ნიშნავს 12%-დან 15%-მდე ზრდას.',
        method: 'ანუიტეტი ნიშნავს შედარებით თანაბარ გადახდას. თანაბარი ძირი ნიშნავს ყოველ თვე ერთი და იგივე ძირის დაფარვას.'
    };

    function money(value) {
        return new Intl.NumberFormat('ka-GE', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        }).format(Number(value || 0));
    }

    function percent(value) {
        return `${new Intl.NumberFormat('ka-GE', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        }).format(Number(value || 0))}%`;
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function fieldLabel(text, key) {
        return `
            <span class="loan-field-title">
                ${text}
                <i class="loan-info-dot" tabindex="0" aria-label="${tooltips[key]}">i</i>
            </span>
        `;
    }

    function plainLabel(text) {
        return `<span class="loan-field-title">${text}</span>`;
    }

    function annuityPayment(balance, monthlyRate, monthsLeft) {
        if (monthsLeft <= 0) return balance;
        if (monthlyRate === 0) return balance / monthsLeft;
        const factor = Math.pow(1 + monthlyRate, monthsLeft);
        return balance * monthlyRate * factor / (factor - 1);
    }

    function defaultLoan(number) {
        return {
            name: `სესხი ${number}`,
            amount: 100000,
            term: 120,
            rate: number === 1 ? 11.5 : 12.5,
            rateType: 'fixed',
            fixedMonths: 24,
            increase: 3,
            method: 'annuity'
        };
    }

    function cashflowEffectiveAnnualRate(rows, amount) {
        if (!rows.length || !amount) return 0;
        const cashflows = [amount, ...rows.map(row => -row.payment)];
        const npv = rate => cashflows.reduce((sum, cashflow, index) => (
            sum + cashflow / Math.pow(1 + rate, index)
        ), 0);

        let low = -0.9999;
        let high = 1;
        let lowValue = npv(low);
        let highValue = npv(high);

        for (let i = 0; i < 16 && lowValue * highValue > 0; i += 1) {
            high *= 2;
            highValue = npv(high);
        }

        if (!Number.isFinite(lowValue) || !Number.isFinite(highValue) || lowValue * highValue > 0) {
            const averageRate = rows.reduce((sum, row) => sum + row.rate, 0) / rows.length;
            const monthlyRate = averageRate / 100 / 12;
            return (Math.pow(1 + monthlyRate, 12) - 1) * 100;
        }

        for (let i = 0; i < 80; i += 1) {
            const mid = (low + high) / 2;
            const midValue = npv(mid);
            if (Math.abs(midValue) < 0.000001) return (Math.pow(1 + mid, 12) - 1) * 100;
            if (lowValue * midValue <= 0) {
                high = mid;
                highValue = midValue;
            } else {
                low = mid;
                lowValue = midValue;
            }
        }

        return (Math.pow(1 + (low + high) / 2, 12) - 1) * 100;
    }

    function renderCards() {
        grid.innerHTML = loanDrafts.map((loan, index) => {
            const number = index + 1;
            return `
                <article class="loan-compare-card" data-loan-card="${number}">
                    <div class="loan-compare-card-head">
                        <h2>სესხი ${number}</h2>
                        <button type="button" class="loan-remove-btn" data-remove-loan="${number}" ${loanDrafts.length <= 1 ? 'disabled' : ''}>წაშლა</button>
                    </div>
                    <label>
                        ${plainLabel('დასახელება')}
                        <input type="text" data-field="name" value="${escapeHtml(loan.name)}">
                    </label>
                    <label>
                        ${plainLabel('სესხის თანხა')}
                        <input type="number" data-field="amount" min="0" step="any" inputmode="decimal" value="${loan.amount}" required>
                    </label>
                    <label>
                        ${plainLabel('ვადა თვეებში')}
                        <input type="number" data-field="term" min="1" max="480" step="1" value="${loan.term}" required>
                    </label>
                    <label>
                        ${plainLabel('საწყისი პროცენტი')}
                        <input type="number" data-field="rate" min="0" max="100" step="0.01" inputmode="decimal" value="${loan.rate}" required>
                    </label>
                    <label>
                        ${fieldLabel('პროცენტის ტიპი', 'rateType')}
                        <select data-field="rateType">
                            <option value="fixed" ${loan.rateType === 'fixed' ? 'selected' : ''}>ფიქსირებული</option>
                            <option value="variable" ${loan.rateType === 'variable' ? 'selected' : ''}>ცვლადი</option>
                        </select>
                    </label>
                    <div class="loan-variable-fields" hidden>
                        <label>
                            ${fieldLabel('ფიქს. თვეები', 'fixedMonths')}
                            <input type="number" data-field="fixedMonths" min="0" max="480" step="1" value="${loan.fixedMonths}">
                        </label>
                        <label>
                            ${fieldLabel('+ პროცენტი', 'increase')}
                            <input type="number" data-field="increase" min="-100" max="100" step="0.01" inputmode="decimal" value="${loan.increase}">
                        </label>
                    </div>
                    <label>
                        ${fieldLabel('გადახდის ტიპი', 'method')}
                        <select data-field="method">
                            <option value="annuity" ${loan.method === 'annuity' ? 'selected' : ''}>ანუიტეტი</option>
                            <option value="equal-principal" ${loan.method === 'equal-principal' ? 'selected' : ''}>თანაბარი ძირი</option>
                        </select>
                    </label>
                </article>
            `;
        }).join('');

        syncVariableFields();
        addBtn.disabled = loanDrafts.length >= maxLoans;
    }

    function syncVariableFields() {
        grid.querySelectorAll('.loan-compare-card').forEach(card => {
            const rateType = card.querySelector('[data-field="rateType"]').value;
            const variableFields = card.querySelector('.loan-variable-fields');
            variableFields.hidden = rateType !== 'variable';
            variableFields.querySelectorAll('input').forEach(input => {
                input.disabled = rateType !== 'variable';
            });
        });
    }

    function readLoan(card, index) {
        const get = field => card.querySelector(`[data-field="${field}"]`);
        const amount = Math.max(0, Number(get('amount').value) || 0);
        const term = Math.max(1, Math.min(480, Math.round(Number(get('term').value) || 1)));
        const rate = Math.max(0, Number(get('rate').value) || 0);
        const rateType = get('rateType').value;
        return {
            id: index + 1,
            name: get('name').value.trim() || `სესხი ${index + 1}`,
            amount,
            term,
            rate,
            rateType,
            fixedMonths: rateType === 'variable'
                ? Math.max(0, Math.min(term, Math.round(Number(get('fixedMonths').value) || 0)))
                : term,
            increase: rateType === 'variable' ? Number(get('increase').value) || 0 : 0,
            method: get('method').value
        };
    }

    function readDrafts() {
        return Array.from(grid.querySelectorAll('.loan-compare-card')).map(readLoan);
    }

    function rateForMonth(loan, month) {
        if (loan.rateType !== 'variable' || month <= loan.fixedMonths) return loan.rate;
        return Math.max(0, loan.rate + loan.increase);
    }

    function calculateLoan(loan) {
        const rows = [];
        const basePrincipal = loan.method === 'equal-principal' ? loan.amount / loan.term : null;
        let balance = loan.amount;

        for (let month = 1; month <= loan.term && balance > 0.004; month += 1) {
            const startBalance = balance;
            const monthsLeft = loan.term - month + 1;
            const annualRate = rateForMonth(loan, month);
            const monthlyRate = annualRate / 100 / 12;
            const interest = startBalance * monthlyRate;
            const payment = loan.method === 'annuity'
                ? annuityPayment(startBalance, monthlyRate, monthsLeft)
                : Math.min(startBalance, basePrincipal + interest);
            const principal = Math.min(startBalance, Math.max(0, payment - interest));
            balance = Math.max(0, startBalance - principal);
            rows.push({ month, rate: annualRate, principal, interest, payment: principal + interest, endBalance: balance });
        }

        const principal = rows.reduce((sum, row) => sum + row.principal, 0);
        const interest = rows.reduce((sum, row) => sum + row.interest, 0);
        const total = rows.reduce((sum, row) => sum + row.payment, 0);
        const changeMonth = loan.rateType === 'variable' && loan.fixedMonths < loan.term ? loan.fixedMonths + 1 : null;
        const changedPayment = changeMonth ? rows[changeMonth - 1]?.payment || 0 : 0;

        return {
            ...loan,
            rows,
            principal,
            interest,
            total,
            initialPayment: rows[0]?.payment || 0,
            changedPayment,
            averagePayment: rows.length ? total / rows.length : 0,
            effectiveRate: cashflowEffectiveAnnualRate(rows, loan.amount),
            finalRate: rateForMonth(loan, loan.term)
        };
    }

    function renderResults(results) {
        resultGrid.innerHTML = results.map((loan, index) => `
            <article class="loan-result-card ${index === 0 ? 'is-reference' : ''}">
                <span class="loan-result-eyebrow">${loan.rateType === 'variable' ? 'ცვლადი პროცენტი' : 'ფიქსირებული პროცენტი'}</span>
                <h2>${escapeHtml(loan.name)}</h2>
                <dl>
                    <div><dt>საწყისი თვიური გადასახადი</dt><dd>${money(loan.initialPayment)}</dd></div>
                    <div><dt>${loan.rateType === 'variable' ? 'ცვლილების შემდეგ' : 'საშუალო გადასახადი'}</dt><dd>${money(loan.rateType === 'variable' ? loan.changedPayment : loan.averagePayment)}</dd></div>
                    <div><dt>სულ პროცენტი</dt><dd>${money(loan.interest)}</dd></div>
                    <div><dt>ჯამური გადახდა</dt><dd>${money(loan.total)}</dd></div>
                    <div><dt>ეფექტური პროცენტი</dt><dd>${percent(loan.effectiveRate)}</dd></div>
                    <div><dt>ბოლო წლიური %</dt><dd>${percent(loan.finalRate)}</dd></div>
                </dl>
            </article>
        `).join('');
        resultsSection.hidden = false;
    }

    function drawChart(results) {
        chartCard.hidden = false;
        const width = chart.clientWidth || 1200;
        const height = 430;
        const dpr = window.devicePixelRatio || 1;
        chart.width = Math.round(width * dpr);
        chart.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const padding = { top: 28, right: 36, bottom: 74, left: 86 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;
        const maxTotal = Math.max(...results.map(item => item.total), 1);
        const groupWidth = plotWidth / Math.max(results.length, 1);
        const barWidth = Math.max(38, Math.min(92, groupWidth * 0.42));

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
        ctx.lineWidth = 1;
        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        for (let i = 0; i <= 4; i += 1) {
            const y = padding.top + plotHeight * i / 4;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            ctx.fillText(money(maxTotal * (1 - i / 4)).replace(/\.\d{2}/, ''), 10, y + 4);
        }

        results.forEach((loan, index) => {
            const x = padding.left + groupWidth * index + groupWidth / 2 - barWidth / 2;
            let y = padding.top + plotHeight;
            [
                { value: loan.principal, color: '#5b8fb9' },
                { value: loan.interest, color: '#b9874b' }
            ].forEach(segment => {
                const h = segment.value / maxTotal * plotHeight;
                y -= h;
                ctx.fillStyle = segment.color;
                ctx.fillRect(x, y, barWidth, h);
            });

            ctx.fillStyle = '#8ea7c2';
            ctx.font = '700 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(money(loan.total).replace(/\.\d{2}/, ''), x + barWidth / 2, y - 8);

            ctx.save();
            ctx.translate(x + barWidth / 2, height - 24);
            ctx.rotate(-Math.PI / 10);
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '700 12px Inter, sans-serif';
            ctx.fillText(loan.name.slice(0, 20), 0, 0);
            ctx.restore();
        });
        ctx.textAlign = 'left';
    }

    function generate() {
        const loans = readDrafts();
        loanDrafts = loans.map(loan => ({
            name: loan.name,
            amount: loan.amount,
            term: loan.term,
            rate: loan.rate,
            rateType: loan.rateType,
            fixedMonths: loan.fixedMonths,
            increase: loan.increase,
            method: loan.method
        }));
        lastResults = loans.map(calculateLoan);
        renderResults(lastResults);
        drawChart(lastResults);
        chartCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    grid.addEventListener('change', event => {
        if (event.target.matches('[data-field="rateType"]')) syncVariableFields();
    });

    grid.addEventListener('click', event => {
        const removeBtn = event.target.closest('[data-remove-loan]');
        if (!removeBtn || loanDrafts.length <= 1) return;
        loanDrafts = readDrafts();
        loanDrafts.splice(Number(removeBtn.dataset.removeLoan) - 1, 1);
        renderCards();
        resultsSection.hidden = true;
        chartCard.hidden = true;
    });

    addBtn.addEventListener('click', () => {
        if (loanDrafts.length >= maxLoans) return;
        loanDrafts = readDrafts();
        loanDrafts.push(defaultLoan(loanDrafts.length + 1));
        renderCards();
        resultsSection.hidden = true;
        chartCard.hidden = true;
    });

    form.addEventListener('submit', event => {
        event.preventDefault();
        generate();
    });

    window.addEventListener('resize', () => {
        if (lastResults.length && !chartCard.hidden) drawChart(lastResults);
    });

    renderCards();
})();
