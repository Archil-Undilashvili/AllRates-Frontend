(function (root) {
    // Intersect actual observation times. Never invent or forward-fill rates.
    function align(first, second, intraday) {
        const series = points => new Map(points.map(point => {
            const date = new Date(point.timestamp);
            if (!Number.isFinite(date.getTime())) return [NaN, NaN];
            const timestamp = intraday ? date.getTime() : Date.parse(date.toISOString().slice(0, 10));
            const value = point.buy !== undefined && point.sell !== undefined ? (Number(point.buy) + Number(point.sell)) / 2 : Number(point.rate);
            return [timestamp, value];
        }).filter(([time, value]) => Number.isFinite(time) && Number.isFinite(value) && value > 0));
        const a = series(first), b = series(second);
        const common = [...a.keys()].filter(time => b.has(time)).sort((x,y) => x-y);
        if (!common.length) return [];
        const bases = [a.get(common[0]), b.get(common[0])];
        return common.map(timestamp => {
            const values = [a.get(timestamp), b.get(timestamp)];
            return { timestamp, values, changes: values.map((value,index) => (value / bases[index] - 1) * 100) };
        });
    }
    function axes(rows) {
        const bases = rows[0].values;
        let low = 1, high = 1;
        for (const row of rows) row.values.forEach((value, index) => {
            low = Math.min(low, value / bases[index]);
            high = Math.max(high, value / bases[index]);
        });
        const padding = Math.max((high - low) * .12, .001);
        low = Math.max(0, low - padding);
        high += padding;
        return bases.map(base => ({ min: base * low, max: base * high }));
    }
    if (typeof module !== 'undefined') module.exports = { align, axes };
    else root.AllRatesComparison = { align, axes };
})(typeof window === 'undefined' ? this : window);
