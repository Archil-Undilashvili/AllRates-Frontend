(function () {
    const form = document.getElementById('deposit-form');
    const initialInput = document.getElementById('deposit-initial');
    const termInput = document.getElementById('deposit-term');
    const rateInput = document.getElementById('deposit-rate');
    const typeInput = document.getElementById('deposit-type');
    const monthlyInput = document.getElementById('deposit-monthly');
    const growthInput = document.getElementById('deposit-growth');
    const interestModeInput = document.getElementById('deposit-interest-mode');
    const startInput = document.getElementById('deposit-start');
    const summary = document.getElementById('deposit-summary');
    const chartCard = document.getElementById('deposit-chart-card');
    const tableCard = document.getElementById('deposit-table-card');
    const scheduleBody = document.getElementById('deposit-schedule-body');
    const chart = document.getElementById('deposit-chart');
    const exportBtn = document.getElementById('deposit-export-btn');
    const submitBtn = document.getElementById('deposit-submit-btn');
    const ctx = chart.getContext('2d');

    let overrides = {};
    let lastConfig = null;
    let lastRows = [];

    function pad(value) {
        return String(value).padStart(2, '0');
    }

    function setDefaultDate() {
        const now = new Date();
        startInput.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    }

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

    function effectiveAnnualRate(config) {
        const monthlyRate = Math.max(0, Number(config.annualRate) || 0) / 100 / 12;
        if (config.interestMode === 'monthly') return config.annualRate;
        return (Math.pow(1 + monthlyRate, 12) - 1) * 100;
    }

    function monthLabel(startValue, index) {
        const [year, month, day] = startValue.split('-').map(Number);
        const targetMonth = month - 1 + index;
        const lastDay = new Date(year, targetMonth + 1, 0).getDate();
        const date = new Date(year, targetMonth, Math.min(day || 1, lastDay));
        return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
    }

    function readConfig() {
        return {
            initial: Math.max(0, Number(initialInput.value) || 0),
            term: Math.max(1, Math.min(480, Math.round(Number(termInput.value) || 1))),
            annualRate: Math.max(0, Number(rateInput.value) || 0),
            type: typeInput.value,
            monthly: Math.max(0, Number(monthlyInput.value) || 0),
            annualGrowth: Math.max(0, Number(growthInput.value) || 0),
            interestMode: interestModeInput.value,
            start: startInput.value
        };
    }

    function plannedContribution(config, month) {
        if (config.type !== 'growing') return 0;
        const yearIndex = Math.floor((month - 1) / 12);
        return config.monthly * Math.pow(1 + config.annualGrowth / 100, yearIndex);
    }

    function calculateRows(config) {
        const monthlyRate = config.annualRate / 100 / 12;
        const rows = [];
        let balance = config.initial;

        for (let month = 1; month <= config.term; month += 1) {
            const startBalance = balance;
            const contribution = overrides[month] !== undefined
                ? Number(overrides[month] || 0)
                : plannedContribution(config, month);
            const interest = Math.max(0, startBalance + contribution) * monthlyRate;
            const withdrawnInterest = config.interestMode === 'monthly' ? interest : 0;
            const capitalizedInterest = config.interestMode === 'capitalized' ? interest : 0;
            balance = Math.max(0, startBalance + contribution + capitalizedInterest);

            rows.push({
                month,
                date: monthLabel(config.start, month - 1),
                startBalance,
                contribution,
                interest,
                withdrawnInterest,
                endBalance: balance
            });
        }

        return rows;
    }

    function totals(rows, config) {
        const contributions = rows.reduce((sum, row) => sum + row.contribution, 0);
        const interest = rows.reduce((sum, row) => sum + row.interest, 0);
        const withdrawnInterest = rows.reduce((sum, row) => sum + row.withdrawnInterest, 0);
        const finalBalance = rows.at(-1)?.endBalance || config.initial;
        return {
            contributions,
            interest,
            withdrawnInterest,
            finalBalance,
            averageGrowth: rows.length ? (finalBalance + withdrawnInterest - config.initial) / rows.length : 0
        };
    }

    function renderSummary(rows, config) {
        const total = totals(rows, config);
        document.getElementById('deposit-final').textContent = money(total.finalBalance);
        document.getElementById('deposit-contributions').textContent = money(total.contributions);
        document.getElementById('deposit-interest').textContent = money(total.interest);
        document.getElementById('deposit-average-growth').textContent = money(total.averageGrowth);
        document.getElementById('deposit-effective-rate').textContent = percent(effectiveAnnualRate(config));
        summary.hidden = false;
    }

    function renderTable(rows) {
        scheduleBody.innerHTML = rows.map(row => `
            <tr>
                <td>${row.month}</td>
                <td>${row.date}</td>
                <td>${money(row.startBalance)}</td>
                <td>${money(row.contribution)}</td>
                <td>${money(row.interest)}</td>
                <td>${money(row.withdrawnInterest)}</td>
                <td>${money(row.endBalance)}</td>
                <td>
                    <input class="loan-prepay-input deposit-contribution-input" type="number" min="0" step="any" inputmode="decimal" data-month="${row.month}" value="${overrides[row.month] !== undefined ? Number(overrides[row.month]).toFixed(2) : ''}" placeholder="გეგმით">
                </td>
            </tr>
        `).join('');

        scheduleBody.querySelectorAll('.deposit-contribution-input').forEach(input => {
            input.addEventListener('change', () => {
                const month = Number(input.dataset.month);
                if (input.value.trim() === '') delete overrides[month];
                else overrides[month] = Math.max(0, Number(input.value) || 0);
                regenerate(false);
            });
        });
        tableCard.hidden = false;
    }

    function drawChart(rows) {
        chartCard.hidden = false;
        const width = chart.clientWidth || 1200;
        const height = 430;
        const dpr = window.devicePixelRatio || 1;
        chart.width = Math.round(width * dpr);
        chart.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const padding = { top: 24, right: 58, bottom: 46, left: 72 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;
        const maxColumn = Math.max(...rows.map(row => row.contribution + row.interest), 1);
        const maxBalance = Math.max(...rows.map(row => row.endBalance), 1);
        const step = plotWidth / Math.max(rows.length, 1);
        const barWidth = Math.max(3, Math.min(18, step * 0.48));

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
            ctx.fillText(money(maxBalance * (1 - i / 4)).replace(/\.\d{2}/, ''), 8, y + 4);
        }

        rows.forEach((row, index) => {
            const x = padding.left + step * index + step / 2 - barWidth / 2;
            let y = padding.top + plotHeight;
            [
                { value: row.contribution, color: '#5b8fb9' },
                { value: row.interest, color: '#b9874b' }
            ].forEach(segment => {
                const h = segment.value / maxColumn * plotHeight;
                y -= h;
                ctx.fillStyle = segment.color;
                ctx.fillRect(x, y, barWidth, h);
            });
        });

        ctx.strokeStyle = '#8ea7c2';
        ctx.lineWidth = 2;
        ctx.beginPath();
        rows.forEach((row, index) => {
            const x = padding.left + step * index + step / 2;
            const y = padding.top + plotHeight - row.endBalance / maxBalance * plotHeight;
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        const tickEvery = Math.max(1, Math.ceil(rows.length / 8));
        rows.forEach((row, index) => {
            if (index % tickEvery !== 0 && index !== rows.length - 1) return;
            const x = padding.left + step * index + step / 2;
            ctx.save();
            ctx.translate(x, height - 18);
            ctx.rotate(-Math.PI / 7);
            ctx.fillText(row.date, 0, 0);
            ctx.restore();
        });
    }

    function exportSchedule() {
        if (!lastRows.length || !lastConfig) return;
        if (!window.XLSX) {
            alert('Excel ფაილის მოსამზადებელი ბიბლიოთეკა ვერ ჩაიტვირთა.');
            return;
        }

        const total = totals(lastRows, lastConfig);
        const rows = [
            ['დეპოზიტის კალკულატორი'],
            ['საწყისი თანხა', lastConfig.initial],
            ['ვადა თვეებში', lastConfig.term],
            ['სარგებელი წლიური', lastConfig.annualRate + '%'],
            ['ეფექტური პროცენტი', percent(effectiveAnnualRate(lastConfig))],
            ['დეპოზიტის ტიპი', lastConfig.type === 'growing' ? 'ზრდადი' : 'სტანდარტული'],
            ['სარგებლის გატანის ტიპი', lastConfig.interestMode === 'monthly' ? 'ყოველთვიური' : 'ვადის ბოლოს'],
            ['თვიური შენატანი', lastConfig.type === 'growing' ? lastConfig.monthly : 0],
            ['შენატანის ზრდა წლიური', lastConfig.type === 'growing' ? lastConfig.annualGrowth + '%' : '0%'],
            ['დაწყების თარიღი', lastConfig.start],
            ['საბოლოო ბალანსი', Number(total.finalBalance.toFixed(2))],
            ['დარიცხული სარგებელი', Number(total.interest.toFixed(2))],
            ['გატანილი სარგებელი', Number(total.withdrawnInterest.toFixed(2))],
            [],
            ['თვე', 'თარიღი', 'საწყისი ბალანსი', 'შენატანი', 'სარგებელი', 'გატანილი სარგებელი', 'საბოლოო ბალანსი'],
            ...lastRows.map(row => [
                row.month,
                row.date,
                Number(row.startBalance.toFixed(2)),
                Number(row.contribution.toFixed(2)),
                Number(row.interest.toFixed(2)),
                Number(row.withdrawnInterest.toFixed(2)),
                Number(row.endBalance.toFixed(2))
            ])
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        worksheet['!cols'] = [
            { wch: 8 }, { wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 18 }
        ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Deposit Schedule');
        XLSX.writeFile(workbook, `deposit_schedule_${lastConfig.start || 'allrates'}.xlsx`);
    }

    function regenerate(scrollToChart) {
        if (!lastConfig) return;
        lastRows = calculateRows(lastConfig);
        renderSummary(lastRows, lastConfig);
        if (lastConfig.type === 'growing') {
            drawChart(lastRows);
            renderTable(lastRows);
            if (scrollToChart) chartCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        chartCard.hidden = true;
        tableCard.hidden = true;
        scheduleBody.innerHTML = '';
        if (scrollToChart) summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function syncTypeFields() {
        const growing = typeInput.value === 'growing';
        document.querySelectorAll('.deposit-growing-field').forEach(field => {
            field.hidden = !growing;
        });
        monthlyInput.disabled = !growing;
        growthInput.disabled = !growing;
        if (submitBtn) submitBtn.textContent = growing ? 'გრაფიკის გენერირება' : 'დათვლა';
        if (lastConfig) {
            overrides = {};
            lastConfig = readConfig();
            regenerate(false);
        }
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        overrides = {};
        lastConfig = readConfig();
        regenerate(true);
    });

    typeInput.addEventListener('change', syncTypeFields);
    exportBtn?.addEventListener('click', exportSchedule);
    window.addEventListener('resize', () => {
        if (lastRows.length && lastConfig?.type === 'growing') drawChart(lastRows);
    });

    setDefaultDate();
    syncTypeFields();
})();
