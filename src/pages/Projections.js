import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { BarChart3, Calendar, TrendingUp, Target } from 'lucide-react';
import KPICard from '../components/KPICard';
import { useFirestoreCollection } from '../hooks/useFirestore';
const Projections = () => {
    const { data: plants } = useFirestoreCollection('plants');
    const { data: projects } = useFirestoreCollection('projects');
    const [period, setPeriod] = useState('mensual');
    const [scenario, setScenario] = useState('base');
    const scenarioMultiplier = { base: 1, optimista: 1.15, pesimista: 0.85 };
    const avgSalePrice = projects && projects.length > 0
        ? projects.reduce((s, p) => s + p.salePricePerM3, 0) / projects.length
        : 185;
    const totalCapacity = plants ? plants.reduce((s, p) => s + p.installedCapacity * p.performance, 0) : 5000;
    const avgMatCost = plants && plants.length > 0
        ? plants.reduce((s, p) => p.materials.reduce((s2, m) => s2 + m.unitPrice * m.quantityPerM3, 0), 0) / plants.length
        : 70;
    const monthlyProduction = Math.round(totalCapacity);
    const monthlyRevenue = monthlyProduction * avgSalePrice / 1000;
    const monthlyCost = monthlyProduction * avgMatCost / 1000;
    const cashFlowData = useMemo(() => {
        const base = [
            monthlyRevenue * 0.7, monthlyRevenue * 0.8, monthlyRevenue * 0.85,
            monthlyRevenue * 0.9, monthlyRevenue * 0.95, monthlyRevenue,
            monthlyRevenue, monthlyRevenue * 1.05, monthlyRevenue * 1.05,
            monthlyRevenue * 1.1, monthlyRevenue * 1.1, monthlyRevenue * 1.15,
        ];
        return {
            mensual: base,
            trimestral: [base.slice(0, 3).reduce((a, b) => a + b, 0), base.slice(3, 6).reduce((a, b) => a + b, 0), base.slice(6, 9).reduce((a, b) => a + b, 0), base.slice(9, 12).reduce((a, b) => a + b, 0)],
            anual: [base.reduce((a, b) => a + b, 0), base.reduce((a, b) => a + b, 0) * 1.1],
        };
    }, [monthlyRevenue]);
    const months = { mensual: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], trimestral: ['Q1', 'Q2', 'Q3', 'Q4'], anual: ['Año 1', 'Año 2'] };
    const data = cashFlowData[period].map(v => v * scenarioMultiplier[scenario]);
    const labels = months[period];
    const ingresoTotal = data.reduce((a, b) => a + b, 0);
    const chartOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        legend: { data: ['Ingresos', 'Egresos', 'Flujo Neto'], textStyle: { color: '#94a3b8' } },
        xAxis: { type: 'category', data: labels, axisLabel: { color: '#94a3b8' } },
        yAxis: { type: 'value', name: 'miles $', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
        grid: { left: '10%', right: '5%', bottom: '10%', containLabel: true },
        series: [
            { name: 'Ingresos', type: 'bar', data: data, itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } },
            { name: 'Egresos', type: 'bar', data: data.map(v => v * (avgMatCost / avgSalePrice)), itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] } },
            { name: 'Flujo Neto', type: 'line', data: data.map(v => v * (1 - avgMatCost / avgSalePrice)), lineStyle: { color: '#10b981', width: 3 }, symbol: 'circle', symbolSize: 8, itemStyle: { color: '#10b981' } },
        ],
    };
    const breakEvenPoint = Math.round((monthlyCost * 1000) / (avgSalePrice - avgMatCost));
    const breakEvenRevenue = Math.round(breakEvenPoint * avgSalePrice / 1000);
    const breakEvenOption = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'value', name: 'm³ producidos', axisLabel: { color: '#94a3b8' } },
        yAxis: { type: 'value', name: 'miles $', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
        series: [
            { name: 'Ingresos', type: 'line', data: [[0, 0], [monthlyProduction, Math.round(monthlyRevenue)]], lineStyle: { color: '#3b82f6', width: 3 }, itemStyle: { color: '#3b82f6' } },
            { name: 'Costos Totales', type: 'line', data: [[0, Math.round(monthlyCost * 0.3)], [monthlyProduction, monthlyCost]], lineStyle: { color: '#ef4444', width: 3 }, itemStyle: { color: '#ef4444' } },
            { name: 'Punto Equilibrio', type: 'scatter', data: [[breakEvenPoint, breakEvenRevenue]], symbolSize: 16, itemStyle: { color: '#f59e0b' }, label: { show: true, formatter: `${breakEvenPoint.toLocaleString()} m³`, position: 'right', color: '#f59e0b', fontWeight: 'bold' } },
        ],
        grid: { left: '10%', right: '10%', bottom: '10%', containLabel: true },
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsx(KPICard, { title: "Per\u00EDodo", value: period.charAt(0).toUpperCase() + period.slice(1), icon: Calendar }), _jsx(KPICard, { title: "Escenario", value: scenario.charAt(0).toUpperCase() + scenario.slice(1), icon: BarChart3 }), _jsx(KPICard, { title: "Ingreso Proyectado", value: `$${ingresoTotal.toFixed(0)}k`, icon: TrendingUp, description: "Per\u00EDodo seleccionado" }), _jsx(KPICard, { title: "Punto Equilibrio", value: `${breakEvenPoint.toLocaleString()} m³`, icon: Target, description: "Promedio mensual" })] }), _jsxs("div", { className: "flex gap-4 mb-6 flex-wrap", children: [_jsx("div", { className: "flex items-center gap-2 bg-card border border-border rounded-lg p-1", children: ['mensual', 'trimestral', 'anual'].map(p => (_jsx("button", { onClick: () => setPeriod(p), className: `px-4 py-2 rounded-md text-sm font-bold transition-all ${period === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`, children: p.charAt(0).toUpperCase() + p.slice(1) }, p))) }), _jsx("div", { className: "flex items-center gap-2 bg-card border border-border rounded-lg p-1", children: ['base', 'optimista', 'pesimista'].map(s => (_jsx("button", { onClick: () => setScenario(s), className: `px-4 py-2 rounded-md text-sm font-bold transition-all ${scenario === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`, children: s.charAt(0).toUpperCase() + s.slice(1) }, s))) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-bold mb-4", children: "Flujo de Caja Proyectado" }), _jsx("div", { className: "h-[350px]", children: _jsx(ReactECharts, { option: chartOption, style: { height: '100%' } }) })] }), _jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-bold mb-4", children: "Punto de Equilibrio" }), _jsx("div", { className: "h-[350px]", children: _jsx(ReactECharts, { option: breakEvenOption, style: { height: '100%' } }) })] })] })] }));
};
export default Projections;
