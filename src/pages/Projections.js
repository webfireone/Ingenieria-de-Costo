import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { BarChart3, Calendar, TrendingUp, Target } from 'lucide-react';
import KPICard from '../components/KPICard';
const Projections = () => {
    const [period, setPeriod] = useState('mensual');
    const [scenario, setScenario] = useState('base');
    const scenarioMultiplier = { base: 1, optimista: 1.15, pesimista: 0.85 };
    const cashFlowData = {
        mensual: [120, 135, 142, 138, 150, 155, 148, 160, 165, 170, 175, 180],
        trimestral: [397, 443, 473, 525],
        anual: [1800, 2100],
    };
    const months = { mensual: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], trimestral: ['Q1', 'Q2', 'Q3', 'Q4'], anual: ['Año 1', 'Año 2'] };
    const data = cashFlowData[period].map(v => v * scenarioMultiplier[scenario]);
    const labels = months[period];
    const chartOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        legend: { data: ['Ingresos', 'Egresos', 'Flujo Neto'], textStyle: { color: '#94a3b8' } },
        xAxis: { type: 'category', data: labels, axisLabel: { color: '#94a3b8' } },
        yAxis: { type: 'value', name: 'miles $', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
        grid: { left: '10%', right: '5%', bottom: '10%', containLabel: true },
        series: [
            { name: 'Ingresos', type: 'bar', data: data.map(v => v * 1.4), itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } },
            { name: 'Egresos', type: 'bar', data: data.map(v => v * 1.1), itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] } },
            { name: 'Flujo Neto', type: 'line', data: data.map(v => v * 0.3), lineStyle: { color: '#10b981', width: 3 }, symbol: 'circle', symbolSize: 8, itemStyle: { color: '#10b981' } },
        ],
    };
    const breakEvenOption = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'value', name: 'm³ producidos', axisLabel: { color: '#94a3b8' } },
        yAxis: { type: 'value', name: 'miles $', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
        series: [
            { name: 'Ingresos', type: 'line', data: [[0, 0], [5000, 925]], lineStyle: { color: '#3b82f6', width: 3 }, itemStyle: { color: '#3b82f6' } },
            { name: 'Costos Totales', type: 'line', data: [[0, 250], [5000, 850]], lineStyle: { color: '#ef4444', width: 3 }, itemStyle: { color: '#ef4444' } },
            { name: 'Punto Equilibrio', type: 'scatter', data: [[1875, 347]], symbolSize: 16, itemStyle: { color: '#f59e0b' }, label: { show: true, formatter: '1,875 m³', position: 'right', color: '#f59e0b', fontWeight: 'bold' } },
        ],
        grid: { left: '10%', right: '10%', bottom: '10%', containLabel: true },
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsx(KPICard, { title: "Per\u00EDodo", value: period.charAt(0).toUpperCase() + period.slice(1), icon: Calendar }), _jsx(KPICard, { title: "Escenario", value: scenario.charAt(0).toUpperCase() + scenario.slice(1), icon: BarChart3 }), _jsx(KPICard, { title: "Ingreso Proyectado", value: `$${(data.reduce((a, b) => a + b, 0) * 1.4).toFixed(0)}k`, icon: TrendingUp, description: "Per\u00EDodo seleccionado" }), _jsx(KPICard, { title: "Punto Equilibrio", value: "1,875 m\u00B3", icon: Target, description: "Promedio mensual" })] }), _jsxs("div", { className: "flex gap-4 mb-6 flex-wrap", children: [_jsx("div", { className: "flex items-center gap-2 bg-card border border-border rounded-lg p-1", children: ['mensual', 'trimestral', 'anual'].map(p => (_jsx("button", { onClick: () => setPeriod(p), className: `px-4 py-2 rounded-md text-sm font-bold transition-all ${period === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`, children: p.charAt(0).toUpperCase() + p.slice(1) }, p))) }), _jsx("div", { className: "flex items-center gap-2 bg-card border border-border rounded-lg p-1", children: ['base', 'optimista', 'pesimista'].map(s => (_jsx("button", { onClick: () => setScenario(s), className: `px-4 py-2 rounded-md text-sm font-bold transition-all ${scenario === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`, children: s.charAt(0).toUpperCase() + s.slice(1) }, s))) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-bold mb-4", children: "Flujo de Caja Proyectado" }), _jsx("div", { className: "h-[350px]", children: _jsx(ReactECharts, { option: chartOption, style: { height: '100%' } }) })] }), _jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-bold mb-4", children: "Punto de Equilibrio" }), _jsx("div", { className: "h-[350px]", children: _jsx(ReactECharts, { option: breakEvenOption, style: { height: '100%' } }) })] })] })] }));
};
export default Projections;
