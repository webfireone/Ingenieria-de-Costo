import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import ReactECharts from 'echarts-for-react';
import { CloudRain, Calendar, TrendingDown, Umbrella } from 'lucide-react';
import KPICard from '../components/KPICard';
const rainDays = [4, 0, 2, 5, 3, 1, 0, 0, 2, 4, 3, 2];
const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const impactPerDay = 85;
const events = [
    { date: '15 Abr', days: 2, cause: 'Lluvias intensas', impact: 170 },
    { date: '22 Abr', days: 1, cause: 'Tormenta eléctrica', impact: 85 },
    { date: '05 May', days: 3, cause: 'Lluvias persistentes', impact: 255 },
    { date: '12 May', days: 1, cause: 'Inundación en acceso', impact: 85 },
];
const Weather = () => {
    const totalRainDays = rainDays.reduce((a, b) => a + b, 0);
    const totalImpact = totalRainDays * impactPerDay;
    const chartOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: months, axisLabel: { color: '#94a3b8' } },
        yAxis: [
            { type: 'value', name: 'Días de lluvia', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
            { type: 'value', name: 'm³ no producidos', axisLabel: { color: '#94a3b8' }, splitLine: { show: false } },
        ],
        series: [
            { name: 'Días de lluvia', type: 'bar', data: rainDays, itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }, yAxisIndex: 0 },
            { name: 'Impacto producción', type: 'line', data: rainDays.map(d => d * impactPerDay), smooth: true, lineStyle: { color: '#ef4444', width: 3 }, symbol: 'circle', yAxisIndex: 1, areaStyle: { opacity: 0.1, color: '#ef4444' } },
        ],
        grid: { left: '10%', right: '10%', bottom: '10%', containLabel: true },
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsx(KPICard, { title: "D\u00EDas de Lluvia (YTD)", value: totalRainDays, icon: CloudRain }), _jsx(KPICard, { title: "Mes m\u00E1s lluvioso", value: months[rainDays.indexOf(Math.max(...rainDays))], icon: Calendar, description: `${Math.max(...rainDays)} días` }), _jsx(KPICard, { title: "Producci\u00F3n Perdida", value: `${totalImpact.toLocaleString()} m³`, icon: TrendingDown, trend: { value: 12, isUp: false }, description: "Estimaci\u00F3n anual" }), _jsx(KPICard, { title: "Impacto Econ\u00F3mico", value: `$${(totalImpact * 142).toLocaleString()}`, icon: Umbrella, description: "Costo estimado" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8", children: [_jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-bold text-lg mb-4", children: "D\u00EDas de Lluvia por Mes" }), _jsx("div", { className: "h-[300px]", children: _jsx(ReactECharts, { option: chartOption, style: { height: '100%' } }) })] }), _jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-bold text-lg mb-4", children: "Eventos Recientes" }), _jsx("div", { className: "space-y-4", children: events.map((e, i) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-card border border-border rounded-xl", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "p-2 bg-blue-500/10 rounded-lg", children: _jsx(CloudRain, { className: "w-5 h-5 text-blue-500" }) }), _jsxs("div", { children: [_jsxs("p", { className: "font-medium", children: [e.date, " \u2014 ", e.days, " d\u00EDa", e.days > 1 ? 's' : ''] }), _jsx("p", { className: "text-sm text-muted-foreground", children: e.cause })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Impacto" }), _jsxs("p", { className: "font-bold text-red-400", children: ["-", e.impact, " m\u00B3"] })] })] }, i))) })] })] })] }));
};
export default Weather;
