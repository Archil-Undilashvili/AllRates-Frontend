(function () {
    const form = document.getElementById('loan-form');
    const amountInput = document.getElementById('loan-amount');
    const termInput = document.getElementById('loan-term');
    const rateInput = document.getElementById('loan-rate');
    const rateTypeInput = document.getElementById('loan-rate-type');
    const methodInput = document.getElementById('loan-method');
    const startInput = document.getElementById('loan-start');
    const summary = document.getElementById('loan-summary');
    const chartCard = document.getElementById('loan-chart-card');
    const tableCard = document.getElementById('loan-table-card');
    const scheduleBody = document.getElementById('loan-schedule-body');
    const chart = document.getElementById('loan-chart');
    const exportBtn = document.getElementById('loan-export-btn');
    const ctx = chart.getContext('2d');

    let prepayments = {};
    let rateChanges = {};
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

    function nominalEffectiveAnnualRate(annualRate) {
        const monthlyRate = Math.max(0, Number(annualRate) || 0) / 100 / 12;
        return (Math.pow(1 + monthlyRate, 12) - 1) * 100;
    }

    function cashflowEffectiveAnnualRate(rows, config) {
        if (!rows.length || !config.amount) return nominalEffectiveAnnualRate(config.annualRate);

        const cashflows = [config.amount, ...rows.map(row => -row.totalPayment)];
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
            const weighted = rows.reduce((acc, row) => {
                acc.balance += Math.max(0, row.startBalance);
                acc.rate += Math.max(0, row.startBalance) * row.annualRate;
                return acc;
            }, { balance: 0, rate: 0 });
            return weighted.balance ? nominalEffectiveAnnualRate(weighted.rate / weighted.balance) : nominalEffectiveAnnualRate(config.annualRate);
        }

        for (let i = 0; i < 80; i += 1) {
            const mid = (low + high) / 2;
            const midValue = npv(mid);
            if (Math.abs(midValue) < 0.000001) {
                return (Math.pow(1 + mid, 12) - 1) * 100;
            }
            if (lowValue * midValue <= 0) {
                high = mid;
                highValue = midValue;
            } else {
                low = mid;
                lowValue = midValue;
            }
        }

        const monthlyRate = (low + high) / 2;
        return (Math.pow(1 + monthlyRate, 12) - 1) * 100;
    }

    function monthLabel(startValue, index) {
        const [year, month, day] = startValue.split('-').map(Number);
        const targetMonth = month - 1 + index;
        const lastDay = new Date(year, targetMonth + 1, 0).getDate();
        const date = new Date(year, targetMonth, Math.min(day || 1, lastDay));
        return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
    }

    function annuityPayment(balance, monthlyRate, monthsLeft) {
        if (monthsLeft <= 0) return balance;
        if (monthlyRate === 0) return balance / monthsLeft;
        const factor = Math.pow(1 + monthlyRate, monthsLeft);
        return balance * monthlyRate * factor / (factor - 1);
    }

    function readConfig() {
        return {
            amount: Math.max(0, Number(amountInput.value) || 0),
            term: Math.max(1, Math.min(480, Math.round(Number(termInput.value) || 1))),
            annualRate: Math.max(0, Number(rateInput.value) || 0),
            rateType: rateTypeInput.value,
            method: methodInput.value,
            start: startInput.value
        };
    }

    function rateForMonth(config, month) {
        if (config.rateType !== 'variable') return config.annualRate;

        let activeRate = config.annualRate;
        Object.keys(rateChanges)
            .map(Number)
            .filter(changeMonth => changeMonth <= month)
            .sort((a, b) => a - b)
            .forEach(changeMonth => {
                activeRate = Math.max(0, Number(rateChanges[changeMonth]) || 0);
            });
        return activeRate;
    }

    function calculateRows(config) {
        const basePrincipal = config.method === 'equal-principal' ? config.amount / config.term : null;
        const rows = [];
        let balance = config.amount;

        for (let i = 1; i <= config.term && balance > 0.004; i += 1) {
            const startBalance = balance;
            const monthsLeft = config.term - i + 1;
            const annualRate = rateForMonth(config, i);
            const monthlyRate = annualRate / 100 / 12;
            const interest = startBalance * monthlyRate;
            const scheduledPayment = config.method === 'annuity'
                ? annuityPayment(startBalance, monthlyRate, monthsLeft)
                : Math.min(startBalance, basePrincipal + interest);
            const scheduledPrincipal = Math.min(startBalance, Math.max(0, scheduledPayment - interest));
            const enteredPrincipal = Number(prepayments[i] || 0);
            const extraPrincipal = enteredPrincipal > 0
                ? Math.min(startBalance - scheduledPrincipal, enteredPrincipal)
                : enteredPrincipal;
            const principalTotal = scheduledPrincipal + extraPrincipal;
            const totalPayment = principalTotal + interest;
            balance = Math.max(0, startBalance - principalTotal);

            rows.push({
                month: i,
                date: monthLabel(config.start, i - 1),
                annualRate,
                startBalance,
                principal: scheduledPrincipal,
                interest,
                extraPrincipal,
                totalPayment,
                endBalance: balance
            });
        }

        return rows;
    }

    function totals(rows) {
        return rows.reduce((acc, row) => {
            acc.principal += row.principal + row.extraPrincipal;
            acc.interest += row.interest;
            acc.total += row.totalPayment;
            return acc;
        }, { principal: 0, interest: 0, total: 0 });
    }

    function renderSummary(rows, config) {
        const total = totals(rows);
        document.getElementById('summary-payment').textContent = rows[0] ? money(rows[0].totalPayment) : '-';
        document.getElementById('summary-interest').textContent = money(total.interest);
        document.getElementById('summary-total').textContent = money(total.total);
        document.getElementById('summary-effective-rate').textContent = percent(cashflowEffectiveAnnualRate(rows, config));
        summary.hidden = false;
    }

    function renderTable(rows, config) {
        const variableRate = config.rateType === 'variable';
        scheduleBody.innerHTML = rows.map(row => `
            <tr>
                <td>${row.month}</td>
                <td>${row.date}</td>
                <td>${money(row.startBalance)}</td>
                <td>${money(row.principal)}</td>
                <td>${money(row.interest)}</td>
                <td>
                    ${variableRate
                        ? `<input class="loan-prepay-input loan-rate-input" type="number" min="0" max="100" step="0.01" inputmode="decimal" data-month="${row.month}" value="${rateChanges[row.month] !== undefined ? Number(rateChanges[row.month]).toFixed(2) : ''}" placeholder="${percent(row.annualRate)}">`
                        : `<span class="loan-rate-value">${percent(row.annualRate)}</span>`}
                </td>
                <td>
                    <input class="loan-prepay-input" type="number" step="any" inputmode="decimal" data-month="${row.month}" value="${row.extraPrincipal ? row.extraPrincipal.toFixed(2) : ''}" placeholder="0">
                </td>
                <td>${money(row.totalPayment)}</td>
                <td>${money(row.endBalance)}</td>
            </tr>
        `).join('');

        scheduleBody.querySelectorAll('.loan-prepay-input:not(.loan-rate-input)').forEach(input => {
            input.addEventListener('change', () => {
                const month = Number(input.dataset.month);
                const value = Number(input.value) || 0;
                if (value !== 0) prepayments[month] = value;
                else delete prepayments[month];
                regenerate(false);
            });
        });
        scheduleBody.querySelectorAll('.loan-rate-input').forEach(input => {
            input.addEventListener('change', () => {
                if (config.rateType !== 'variable') return;
                const month = Number(input.dataset.month);
                const value = Number(input.value);
                if (input.value.trim() === '' || !Number.isFinite(value)) delete rateChanges[month];
                else rateChanges[month] = Math.max(0, Math.min(100, value));
                regenerate(false);
            });
        });
        tableCard.hidden = false;
    }

    function drawChart(rows, config) {
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
        const maxPayment = Math.max(...rows.map(row => Math.max(0, row.principal + row.extraPrincipal) + row.interest), 1);
        const maxBalance = Math.max(...rows.map(row => row.startBalance), 1);
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
            const label = money(maxBalance * (1 - i / 4)).replace(/\.\d{2}/, '');
            ctx.fillText(label, 8, y + 4);
        }

        rows.forEach((row, index) => {
            const x = padding.left + step * index + step / 2 - barWidth / 2;
            let y = padding.top + plotHeight;
            const segments = [
                { value: Math.max(0, row.principal + row.extraPrincipal), color: '#5b8fb9' },
                { value: row.interest, color: '#b9874b' }
            ];
            segments.forEach(segment => {
                const h = segment.value / maxPayment * plotHeight;
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

        const rows = [
            ['სესხის კალკულატორი'],
            ['სესხის თანხა', lastConfig.amount],
            ['ვადა თვეებში', lastConfig.term],
            ['სესხის პროცენტი წლიური', lastConfig.annualRate + '%'],
            ['პროცენტის ტიპი', lastConfig.rateType === 'variable' ? 'ცვლადი' : 'ფიქსირებული'],
            ['ეფექტური პროცენტი', percent(cashflowEffectiveAnnualRate(lastRows, lastConfig))],
            ['გადახდის ტიპი', lastConfig.method === 'annuity' ? 'ანუიტეტი' : 'თანაბარი ძირი'],
            ['პირველი გადახდის თარიღი', lastConfig.start],
            [],
            ['თვე', 'თარიღი', 'საწყისი ბალანსი', 'ძირი', 'პროცენტი', 'წლიური %', 'ძირის დაფარვა / სესხის დამატება', 'ჯამური გადახდა', 'დარჩენილი ბალანსი'],
            ...lastRows.map(row => [
                row.month,
                row.date,
                Number(row.startBalance.toFixed(2)),
                Number(row.principal.toFixed(2)),
                Number(row.interest.toFixed(2)),
                Number(row.annualRate.toFixed(2)),
                Number(row.extraPrincipal.toFixed(2)),
                Number(row.totalPayment.toFixed(2)),
                Number(row.endBalance.toFixed(2))
            ])
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        worksheet['!cols'] = [
            { wch: 8 }, { wch: 12 }, { wch: 18 }, { wch: 14 },
            { wch: 14 }, { wch: 12 }, { wch: 28 }, { wch: 18 }, { wch: 20 }
        ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Loan Schedule');
        XLSX.writeFile(workbook, `loan_schedule_${lastConfig.start || 'allrates'}.xlsx`);
    }

    function regenerate(scrollToTable) {
        if (!lastConfig) return;
        lastRows = calculateRows(lastConfig);
        renderSummary(lastRows, lastConfig);
        drawChart(lastRows, lastConfig);
        renderTable(lastRows, lastConfig);
        if (scrollToTable) chartCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        prepayments = {};
        rateChanges = {};
        lastConfig = readConfig();
        regenerate(true);
    });

    rateTypeInput.addEventListener('change', () => {
        rateChanges = {};
        if (lastConfig) {
            lastConfig = readConfig();
            regenerate(false);
        }
    });

    exportBtn?.addEventListener('click', exportSchedule);

    window.addEventListener('resize', () => {
        if (lastRows.length && lastConfig) drawChart(lastRows, lastConfig);
    });

    setDefaultDate();
})();
