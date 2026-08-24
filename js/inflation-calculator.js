(function () {
    const form = document.getElementById('inflation-form');
    const amountInput = document.getElementById('inflation-amount');
    const yearsInput = document.getElementById('inflation-years');
    const inflationInput = document.getElementById('inflation-rate');
    const growthInput = document.getElementById('income-growth-rate');
    const monthlyInput = document.getElementById('monthly-addition');
    const additionGrowthInput = document.getElementById('addition-growth-rate');
    const summary = document.getElementById('inflation-summary');
    const chartCard = document.getElementById('inflation-chart-card');
    const chart = document.getElementById('inflation-chart');
    const ctx = chart.getContext('2d');

    let lastRows = [];

    function money(value) {
        return new Intl.NumberFormat('ka-GE', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        }).format(Number(value || 0));
    }

    function readConfig() {
        return {
            amount: Math.max(0, Number(amountInput.value) || 0),
            years: Math.max(1, Math.min(80, Math.round(Number(yearsInput.value) || 1))),
            inflationRate: Number(inflationInput.value) || 0,
            growthRate: Number(growthInput.value) || 0,
            monthlyAddition: Math.max(0, Number(monthlyInput.value) || 0),
            additionGrowthRate: Number(additionGrowthInput.value) || 0
        };
    }

    function calculateRows(config) {
        const inflation = config.inflationRate / 100;
        const growth = config.growthRate / 100;
        const additionGrowth = config.additionGrowthRate / 100;
        const rows = [];
        let additions = 0;

        for (let year = 0; year <= config.years; year += 1) {
            const inflationFactor = Math.pow(1 + inflation, year);
            const nominalFactor = Math.pow(1 + growth, year);
            const yearlyAddition = year === 0
                ? 0
                : config.monthlyAddition * 12 * Math.pow(1 + additionGrowth, year - 1);
            additions += yearlyAddition;

            const futurePrice = config.amount * inflationFactor;
            const buyingPower = inflationFactor ? config.amount / inflationFactor : config.amount;
            const nominalValue = config.amount * nominalFactor + additions;
            const realValue = inflationFactor ? nominalValue / inflationFactor : nominalValue;

            rows.push({
                year,
                futurePrice,
                buyingPower,
                nominalValue,
                realValue,
                additions
            });
        }

        return rows;
    }

    function renderSummary(rows, config) {
        const last = rows.at(-1);
        document.getElementById('inflation-future-price').textContent = money(last.futurePrice);
        document.getElementById('inflation-buying-power').textContent = money(last.buyingPower);
        document.getElementById('inflation-lost-value').textContent = money(Math.max(0, config.amount - last.buyingPower));
        document.getElementById('inflation-real-growth').textContent = money(last.realValue - config.amount);
        document.getElementById('inflation-total-additions').textContent = money(last.additions);
        summary.hidden = false;
    }

    function drawLine(points, padding, plotWidth, plotHeight, maxValue, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        points.forEach((point, index) => {
            const x = padding.left + (plotWidth * index / Math.max(points.length - 1, 1));
            const y = padding.top + plotHeight - (point / maxValue * plotHeight);
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
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

        const padding = { top: 26, right: 40, bottom: 52, left: 82 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;
        const maxValue = Math.max(
            ...rows.flatMap(row => [row.futurePrice, row.realValue, row.nominalValue]),
            1
        );

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
            ctx.fillText(money(maxValue * (1 - i / 4)).replace(/\.\d{2}/, ''), 10, y + 4);
        }

        drawLine(rows.map(row => row.futurePrice), padding, plotWidth, plotHeight, maxValue, '#5b8fb9');
        drawLine(rows.map(row => row.realValue), padding, plotWidth, plotHeight, maxValue, '#b9874b');
        drawLine(rows.map(row => row.nominalValue), padding, plotWidth, plotHeight, maxValue, '#8ea7c2');

        ctx.fillStyle = '#94a3b8';
        const tickEvery = Math.max(1, Math.ceil(rows.length / 8));
        rows.forEach((row, index) => {
            if (index % tickEvery !== 0 && index !== rows.length - 1) return;
            const x = padding.left + plotWidth * index / Math.max(rows.length - 1, 1);
            ctx.fillText(`${row.year} წელი`, x - 14, height - 20);
        });
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        const config = readConfig();
        lastRows = calculateRows(config);
        renderSummary(lastRows, config);
        drawChart(lastRows);
        chartCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    window.addEventListener('resize', () => {
        if (lastRows.length && !chartCard.hidden) drawChart(lastRows);
    });
})();
