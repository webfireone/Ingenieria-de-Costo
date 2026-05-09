import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import ReactECharts from 'echarts-for-react';
import { Factory, BarChart4, DollarSign, Activity, RefreshCw } from 'lucide-react';
import KPICard from '../components/KPICard';
import { useFirestoreCollection } from '../hooks/useFirestore';
const Comparativa = () => {
    const { data: plants, refetch, isFetching } = useFirestoreCollection('plants');
    const avgOEE = (p) => (p.availability * p.performance * p.qualityRate * 100).toFixed(1);
    const unitCost = (p) => p.materials.reduce((s, m) => s + m.unitPrice * m.quantityPerM3, 0);
    const totalFixed = (p) => p.operations.reduce((s, o) => s + o.monthlyFixed, 0);
    const names = plants?.map(p => p.name) ?? [];
    const oeeData = plants?.map(p => Number(avgOEE(p))) ?? [];
    const capacityData = plants?.map(p => p.installedCapacity) ?? [];
    const costData = plants?.map(p => unitCost(p)) ?? [];
    const barOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        legend: { data: ['Capacidad (m³)', 'OEE (%)', 'Costo Mat. ($/m³)'], textStyle: { color: '#94a3b8' } },
        xAxis: { type: 'category', data: names, axisLabel: { color: '#94a3b8' } },
        yAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
        series: [
            { name: 'Capacidad (m³)', type: 'bar', data: capacityData, itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } },
            { name: 'OEE (%)', type: 'bar', data: oeeData, itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] } },
            { name: 'Costo Mat. ($/m³)', type: 'bar', data: costData, itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] } },
        ],
        grid: { left: '10%', right: '5%', bottom: '15%', containLabel: true },
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsx(KPICard, { title: "Plantas", value: plants?.length ?? 0, icon: Factory }), _jsx(KPICard, { title: "Capacidad Total", value: `${(plants ?? []).reduce((s, p) => s + p.installedCapacity, 0).toLocaleString()} m³`, icon: BarChart4 }), _jsx(KPICard, { title: "OEE M\u00E1ximo", value: plants && plants.length > 0 ? `${Math.max(...plants.map(p => p.availability * p.performance * p.qualityRate * 100)).toFixed(1)}%` : '-', icon: Activity, description: "Mejor planta" }), _jsx(KPICard, { title: "Mejor Costo Mat.", value: plants && plants.length > 0 ? `$${Math.min(...plants.map(p => unitCost(p))).toFixed(2)}` : '-', icon: DollarSign, description: "Menor costo /m\u00B3" })] }), _jsxs("div", { className: "glass-card p-6 rounded-xl mb-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("h3", { className: "font-bold text-lg flex items-center gap-2", children: [_jsx(BarChart4, { className: "w-5 h-5" }), " Comparativa de Plantas"] }), _jsxs("button", { onClick: () => refetch(), disabled: isFetching, className: "flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-sm font-bold hover:bg-primary/10 transition-all disabled:opacity-50", children: [_jsx(RefreshCw, { className: `w-4 h-4 ${isFetching ? 'animate-spin' : ''}` }), " Refrescar"] })] }), _jsx("div", { className: "h-[350px]", children: _jsx(ReactECharts, { option: barOption, style: { height: '100%' } }) })] }), _jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-bold text-lg mb-6", children: "Tabla Comparativa" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border text-muted-foreground", children: [_jsx("th", { className: "text-left py-3 px-4", children: "Indicador" }), plants?.map(p => _jsx("th", { className: "text-right py-3 px-4", children: p.name }, p.id))] }) }), _jsx("tbody", { children: [
                                        { label: 'Capacidad (m³/mes)', values: plants?.map(p => p.installedCapacity.toLocaleString()) },
                                        { label: 'Disponibilidad', values: plants?.map(p => `${(p.availability * 100).toFixed(0)}%`) },
                                        { label: 'Rendimiento', values: plants?.map(p => `${(p.performance * 100).toFixed(0)}%`) },
                                        { label: 'Calidad', values: plants?.map(p => `${(p.qualityRate * 100).toFixed(0)}%`) },
                                        { label: 'OEE Global', values: plants?.map(p => `${avgOEE(p)}%`) },
                                        { label: 'Costo Mat./m³', values: plants?.map(p => `$${unitCost(p).toFixed(2)}`) },
                                        { label: 'Costos Fijos/mes', values: plants?.map(p => `$${totalFixed(p).toLocaleString()}`) },
                                        { label: 'Costo Var. Prom./m³', values: plants?.map(p => `$${p.operations.reduce((s, o) => s + o.variablePerM3, 0).toFixed(2)}`) },
                                    ].map((row, i) => (_jsxs("tr", { className: "border-b border-border/50 hover:bg-primary/5 transition-colors", children: [_jsx("td", { className: "py-3 px-4 font-medium", children: row.label }), row.values?.map((v, j) => _jsx("td", { className: "py-3 px-4 text-right font-medium", children: v }, j))] }, i))) })] }) })] })] }));
};
export default Comparativa;
