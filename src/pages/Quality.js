import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { ClipboardCheck, FlaskConical, AlertTriangle, CheckCircle2, XCircle, Activity } from 'lucide-react';
import KPICard from '../components/KPICard';
import { useFirestoreCollection } from '../hooks/useFirestore';
const rawSamples = [
    { id: 'M-001', project: 'Edificio Skyline Towers', concreteClass: 'H-30', slump: 12, slumpTarget: 12, resistance7d: 22.5, resistance28d: 32.8, resistanceTarget: 30, date: '2026-04-28', status: 'aprobado' },
    { id: 'M-002', project: 'Edificio Skyline Towers', concreteClass: 'H-30', slump: 14, slumpTarget: 12, resistance7d: 20.1, resistance28d: 30.2, resistanceTarget: 30, date: '2026-04-25', status: 'aprobado' },
    { id: 'M-003', project: 'Puente Interurbano', concreteClass: 'H-40', slump: 10, slumpTarget: 10, resistance7d: 28.3, resistance28d: 41.5, resistanceTarget: 40, date: '2026-04-22', status: 'aprobado' },
    { id: 'M-004', project: 'Edificio Skyline Towers', concreteClass: 'H-30', slump: 18, slumpTarget: 12, resistance7d: 18.2, resistance28d: 27.1, resistanceTarget: 30, date: '2026-04-20', status: 'rechazado' },
    { id: 'M-005', project: 'Puente Interurbano', concreteClass: 'H-40', slump: 9, slumpTarget: 10, resistance7d: 26.8, resistance28d: 39.7, resistanceTarget: 40, date: '2026-04-18', status: 'en_curso' },
    { id: 'M-006', project: 'Edificio Skyline Towers', concreteClass: 'H-30', slump: 13, slumpTarget: 12, resistance7d: 21.0, resistance28d: 31.5, resistanceTarget: 30, date: '2026-04-15', status: 'aprobado' },
    { id: 'M-007', project: 'Puente Interurbano', concreteClass: 'H-40', slump: 11, slumpTarget: 10, resistance7d: 27.5, resistance28d: 40.2, resistanceTarget: 40, date: '2026-04-12', status: 'aprobado' },
    { id: 'M-008', project: 'Edificio Skyline Towers', concreteClass: 'H-30', slump: 15, slumpTarget: 12, resistance7d: 19.4, resistance28d: 28.9, resistanceTarget: 30, date: '2026-04-10', status: 'rechazado' },
];
const Quality = () => {
    const { data: plants } = useFirestoreCollection('plants');
    const { data: projects } = useFirestoreCollection('projects');
    const [filter, setFilter] = useState('todos');
    const projectPlantMap = useMemo(() => {
        if (!projects || !plants)
            return {};
        const plantMap = new Map(plants.map(p => [p.id, p.name]));
        const map = {};
        projects.forEach(proj => {
            map[proj.name] = plantMap.get(proj.plantId) ?? proj.plantId;
        });
        return map;
    }, [projects, plants]);
    const samples = useMemo(() => rawSamples.map(s => ({
        ...s,
        plant: projectPlantMap[s.project] ?? 'Sin planta',
    })), [projectPlantMap]);
    const filtered = filter === 'todos' ? samples : samples.filter(s => s.status === filter);
    const approved = samples.filter(s => s.status === 'aprobado').length;
    const rejected = samples.filter(s => s.status === 'rechazado').length;
    const avgResistance28d = samples.filter(s => s.status !== 'en_curso').reduce((sum, s) => sum + s.resistance28d, 0) / (samples.length - samples.filter(s => s.status === 'en_curso').length);
    const resistanceChart = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        legend: { data: ['Resistencia 28d', 'Resistencia 7d', 'Objetivo'], textStyle: { color: '#94a3b8' } },
        xAxis: { type: 'category', data: samples.map(s => s.id), axisLabel: { color: '#94a3b8', rotate: 45 } },
        yAxis: { type: 'value', name: 'MPa', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
        series: [
            { name: 'Resistencia 28d', type: 'bar', data: samples.map(s => s.status !== 'en_curso' ? s.resistance28d : null), itemStyle: { borderRadius: [4, 4, 0, 0], color: '#3b82f6' } },
            { name: 'Resistencia 7d', type: 'bar', data: samples.map(s => s.resistance7d), itemStyle: { borderRadius: [4, 4, 0, 0], color: '#6366f1' } },
            { name: 'Objetivo', type: 'line', data: samples.map(s => s.resistanceTarget), lineStyle: { color: '#ef4444', width: 2, type: 'dashed' }, symbol: 'none' },
        ],
        grid: { left: '8%', right: '5%', bottom: '20%', containLabel: true },
    };
    const slumpChart = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: samples.map(s => s.id), axisLabel: { color: '#94a3b8', rotate: 45 } },
        yAxis: { type: 'value', name: 'Slump (cm)', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
        series: [
            { name: 'Slump Real', type: 'scatter', data: samples.map(s => s.slump), symbolSize: 12, itemStyle: { color: '#f59e0b' } },
            { name: 'Slump Objetivo', type: 'line', data: samples.map(s => s.slumpTarget), lineStyle: { color: '#10b981', width: 2, type: 'dashed' }, symbol: 'none' },
        ],
        grid: { left: '8%', right: '5%', bottom: '20%', containLabel: true },
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsx(KPICard, { title: "Muestras Totales", value: samples.length, icon: FlaskConical }), _jsx(KPICard, { title: "Aprobadas", value: approved, icon: CheckCircle2, trend: { value: Math.round(approved / samples.length * 100), isUp: true }, description: "% de cumplimiento" }), _jsx(KPICard, { title: "Rechazadas", value: rejected, icon: XCircle, trend: { value: Math.round(rejected / samples.length * 100), isUp: false }, description: "% de rechazo" }), _jsx(KPICard, { title: "Resistencia Prom. 28d", value: `${avgResistance28d.toFixed(1)} MPa`, icon: Activity, trend: { value: 3, isUp: true }, description: "vs especificaci\u00F3n" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8", children: [_jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-heading font-bold text-lg mb-4 text-gradient", children: "Resistencia a Compresi\u00F3n" }), _jsx("div", { className: "h-[350px]", children: _jsx(ReactECharts, { option: resistanceChart, style: { height: '100%' } }) })] }), _jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-heading font-bold text-lg mb-4 text-gradient", children: "Control de Slump (Asentamiento)" }), _jsx("div", { className: "h-[350px]", children: _jsx(ReactECharts, { option: slumpChart, style: { height: '100%' } }) })] })] }), _jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("h3", { className: "font-heading font-bold text-lg flex items-center gap-2 text-gradient", children: [_jsx(ClipboardCheck, { className: "w-5 h-5" }), " Registro de Muestras"] }), _jsx("div", { className: "flex bg-background border border-border rounded-lg p-1", children: ['todos', 'aprobado', 'rechazado', 'en_curso'].map(f => (_jsx("button", { onClick: () => setFilter(f), className: `px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`, children: f === 'todos' ? 'Todos' : f === 'aprobado' ? 'Aprobados' : f === 'rechazado' ? 'Rechazados' : 'En Curso' }, f))) })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border text-muted-foreground", children: [_jsx("th", { className: "text-left py-3 px-4", children: "Muestra" }), _jsx("th", { className: "text-left py-3 px-4", children: "Proyecto" }), _jsx("th", { className: "text-left py-3 px-4", children: "Planta" }), _jsx("th", { className: "text-center py-3 px-4", children: "Clase" }), _jsx("th", { className: "text-center py-3 px-4", children: "Slump (cm)" }), _jsx("th", { className: "text-right py-3 px-4", children: "R 7d (MPa)" }), _jsx("th", { className: "text-right py-3 px-4", children: "R 28d (MPa)" }), _jsx("th", { className: "text-center py-3 px-4", children: "Fecha" }), _jsx("th", { className: "text-center py-3 px-4", children: "Estado" })] }) }), _jsx("tbody", { children: filtered.map((s) => (_jsxs("tr", { className: "border-b border-border/50 hover:bg-primary/5 transition-colors", children: [_jsx("td", { className: "py-3 px-4 font-medium", children: s.id }), _jsx("td", { className: "py-3 px-4", children: s.project }), _jsx("td", { className: "py-3 px-4 text-muted-foreground", children: s.plant }), _jsx("td", { className: "py-3 px-4 text-center", children: s.concreteClass }), _jsx("td", { className: "py-3 px-4 text-center", children: _jsxs("span", { className: s.slump === s.slumpTarget ? 'text-green-500' : Math.abs(s.slump - s.slumpTarget) <= 2 ? 'text-yellow-500' : 'text-red-500', children: [s.slump, " / ", s.slumpTarget] }) }), _jsx("td", { className: "py-3 px-4 text-right", children: s.resistance7d.toFixed(1) }), _jsx("td", { className: "py-3 px-4 text-right font-medium", children: s.status === 'en_curso' ? _jsx("span", { className: "text-muted-foreground", children: "---" }) : _jsx("span", { className: s.resistance28d >= s.resistanceTarget ? 'text-green-500' : 'text-red-500', children: s.resistance28d.toFixed(1) }) }), _jsx("td", { className: "py-3 px-4 text-center text-muted-foreground", children: s.date }), _jsx("td", { className: "py-3 px-4 text-center", children: _jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${s.status === 'aprobado' ? 'bg-green-500/10 text-green-500' : s.status === 'rechazado' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`, children: [s.status === 'aprobado' ? _jsx(CheckCircle2, { className: "w-3 h-3" }) : s.status === 'rechazado' ? _jsx(XCircle, { className: "w-3 h-3" }) : _jsx(AlertTriangle, { className: "w-3 h-3" }), s.status === 'aprobado' ? 'Aprobado' : s.status === 'rechazado' ? 'Rechazado' : 'En Curso'] }) })] }, s.id))) })] }) })] })] }));
};
export default Quality;
