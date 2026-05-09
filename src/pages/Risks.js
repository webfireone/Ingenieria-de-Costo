import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Play, ShieldAlert, BarChart, Info } from 'lucide-react';
import Layout from '../components/Layout';
const Risks = () => {
    const [stats, setStats] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [volatility, setVolatility] = useState(0.1);
    const runSimulation = () => {
        setIsSimulating(true);
        const worker = new Worker(new URL('../workers/monteCarlo.worker.ts', import.meta.url), { type: 'module' });
        worker.postMessage({
            iterations: 3000,
            initialInvestment: -1000000,
            monthlyRevenueBase: 150000,
            monthlyCostBase: 110000,
            durationMonths: 24,
            discountRate: 0.12,
            volatility: { revenue: volatility, cost: volatility * 0.8 }
        });
        worker.onmessage = (e) => {
            setStats(e.data);
            setIsSimulating(false);
            worker.terminate();
        };
    };
    const distributionOption = stats ? {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'value',
            name: 'VAN ($)',
            axisLabel: { formatter: (v) => `$${(v / 1000).toFixed(0)}k` }
        },
        yAxis: { type: 'value', name: 'Frecuencia' },
        series: [{
                data: stats.distribution.map(d => [d.x, d.y]),
                type: 'line',
                smooth: true,
                areaStyle: { opacity: 0.3, color: '#3b82f6' },
                lineStyle: { color: '#3b82f6', width: 3 }
            }]
    } : {};
    const tornadoOption = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value', position: 'top', splitLine: { lineStyle: { type: 'dashed' } } },
        yAxis: { type: 'category', data: ['Precio Cemento', 'Energía', 'Mano de Obra', 'Demanda', 'Merma'], axisTick: { show: false } },
        series: [
            {
                name: 'Impacto Negativo',
                type: 'bar',
                stack: 'Total',
                label: { show: true, position: 'left' },
                data: [-15000, -8000, -12000, -25000, -5000],
                itemStyle: { color: '#ef4444' }
            },
            {
                name: 'Impacto Positivo',
                type: 'bar',
                stack: 'Total',
                label: { show: true, position: 'right' },
                data: [12000, 7000, 10000, 30000, 4000],
                itemStyle: { color: '#10b981' }
            }
        ]
    };
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "An\u00E1lisis de Riesgos & Monte Carlo" }), _jsx("p", { className: "text-muted-foreground", children: "Simulaci\u00F3n estoc\u00E1stica de escenarios financieros" })] }), _jsxs("button", { onClick: runSimulation, disabled: isSimulating, className: "flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:scale-105 transition-all disabled:opacity-50", children: [_jsx(Play, { className: "w-5 h-5 fill-current" }), isSimulating ? 'Simulando...' : 'Ejecutar 3,000 Iteraciones'] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "glass-card p-6 rounded-xl space-y-6", children: [_jsxs("h3", { className: "font-bold flex items-center gap-2", children: [_jsx(BarChart, { className: "w-5 h-5" }), " Par\u00E1metros"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "text-sm text-muted-foreground block mb-2", children: ["Volatilidad del Mercado (", volatility * 100, "%)"] }), _jsx("input", { type: "range", min: "0.05", max: "0.3", step: "0.01", value: volatility, onChange: (e) => setVolatility(parseFloat(e.target.value)), className: "w-full accent-primary" })] }), _jsx("div", { className: "p-4 bg-primary/5 border border-primary/20 rounded-lg", children: _jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-2", children: [_jsx(Info, { className: "w-4 h-4" }), " Las simulaciones se ejecutan en segundo plano utilizando Web Workers."] }) })] }), stats && (_jsxs("div", { className: "space-y-4 pt-4 border-t border-border", children: [_jsx("h4", { className: "text-sm font-bold uppercase tracking-wider text-muted-foreground", children: "Estad\u00EDsticas de VAN" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "p-3 bg-card rounded-lg border border-border", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Media (P50)" }), _jsxs("p", { className: "text-lg font-bold text-blue-400", children: ["$", (stats.p50 / 1000).toFixed(1), "k"] })] }), _jsxs("div", { className: "p-3 bg-card rounded-lg border border-border", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Riesgo (P5)" }), _jsxs("p", { className: "text-lg font-bold text-red-400", children: ["$", (stats.p5 / 1000).toFixed(1), "k"] })] })] })] }))] }), _jsxs("div", { className: "lg:col-span-2 glass-card p-6 rounded-xl", children: [_jsxs("h3", { className: "font-bold mb-6 flex items-center gap-2", children: [_jsx(ShieldAlert, { className: "w-5 h-5" }), " Distribuci\u00F3n de Probabilidad del VAN"] }), _jsx("div", { className: "h-[400px]", children: stats ? (_jsx(ReactECharts, { option: distributionOption, style: { height: '100%' } })) : (_jsx("div", { className: "h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg", children: "Haga clic en \"Ejecutar\" para visualizar la distribuci\u00F3n" })) })] }), _jsxs("div", { className: "lg:col-span-3 glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-bold mb-6", children: "An\u00E1lisis de Sensibilidad (Tornado)" }), _jsx("div", { className: "h-[400px]", children: _jsx(ReactECharts, { option: tornadoOption, style: { height: '100%' } }) })] })] })] }));
};
export default Risks;
