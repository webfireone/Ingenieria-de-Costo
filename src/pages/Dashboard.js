import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Factory, TrendingUp, DollarSign, Activity, AlertTriangle, CheckCircle2, FileSpreadsheet, FileText, BarChart3, PieChart, LayoutDashboard, Target, Clock, Users } from 'lucide-react';
import KPICard from '../components/KPICard';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { exportToExcel, exportToPDF } from '../services/importExport';
const Dashboard = () => {
    const { data: plants } = useFirestoreCollection('plants');
    const { data: projects } = useFirestoreCollection('projects');
    const [chartView, setChartView] = useState('pie');
    const [selectedPlant, setSelectedPlant] = useState('all');
    const handleExportExcel = () => {
        if (!plants)
            return;
        const exportData = plants.map(p => ({
            Planta: p.name, Ubicación: p.location, Capacidad: `${p.installedCapacity} m3`,
            OEE: `${(p.availability * p.performance * p.qualityRate * 100).toFixed(1)}%`
        }));
        exportToExcel(exportData, `Reporte_Plantas_${new Date().toLocaleDateString()}`);
    };
    const handleExportPDF = () => {
        if (!plants)
            return;
        const headers = [['Planta', 'Ubicación', 'Capacidad Mensual', 'Eficiencia OEE']];
        const rows = plants.map(p => [p.name, p.location, `${p.installedCapacity} m3`, `${(p.availability * p.performance * p.qualityRate * 100).toFixed(1)}%`]);
        exportToPDF('Reporte Ejecutivo - Ingeniería de Costo', headers, rows, 'Reporte_Ejecutivo');
    };
    const plantOEE = (p) => p.availability * p.performance * p.qualityRate * 100;
    const costDistributionOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item' },
        series: [{
                name: 'Distribución de Costos',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 10, borderColor: '#0f172a', borderWidth: 2 },
                label: { show: false },
                data: [
                    { value: 45, name: 'Materiales', itemStyle: { color: '#3b82f6' } },
                    { value: 25, name: 'Operación', itemStyle: { color: '#10b981' } },
                    { value: 20, name: 'Mantenimiento', itemStyle: { color: '#f59e0b' } },
                    { value: 10, name: 'Logística', itemStyle: { color: '#6366f1' } },
                ]
            }]
    };
    const heatmapData = [];
    const plantNames = plants?.map(p => p.name) ?? ['Planta Norte', 'Planta Sur'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const baseCosts = [142, 138, 145, 140, 155, 150, 148, 160, 158, 165, 170, 162];
    plantNames.forEach((_, pi) => {
        months.forEach((_, mi) => {
            heatmapData.push([mi, pi, baseCosts[mi] + Math.floor(Math.random() * 20 - 10)]);
        });
    });
    const heatmapOption = {
        backgroundColor: 'transparent',
        tooltip: { position: 'top', formatter: (p) => `${months[p.data[0]]} - ${plantNames[p.data[1]]}<br/>$${p.data[2]}/m³` },
        xAxis: { type: 'category', data: months, axisLabel: { color: '#94a3b8' }, splitArea: { show: true } },
        yAxis: { type: 'category', data: plantNames, axisLabel: { color: '#94a3b8' }, splitArea: { show: true } },
        visualMap: { min: 120, max: 180, calculable: true, orient: 'horizontal', left: 'center', bottom: '5%', inRange: { color: ['#1e3a5f', '#3b82f6', '#f59e0b', '#ef4444'] } },
        series: [{ type: 'heatmap', data: heatmapData, label: { show: true, color: '#fff', fontSize: 11 }, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } } }],
        grid: { left: '15%', right: '5%', top: '5%', bottom: '20%', containLabel: true },
    };
    const lineChartOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        legend: { data: ['Planta Norte', 'Planta Sur'], textStyle: { color: '#94a3b8' } },
        xAxis: { type: 'category', data: months, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
        yAxis: { type: 'value', name: 'Costo $/m³', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
        series: [
            { name: 'Planta Norte', type: 'line', data: [142, 138, 145, 140, 155, 150, 148, 160, 158, 165, 170, 162], smooth: true, lineStyle: { color: '#3b82f6', width: 3 }, symbol: 'circle', symbolSize: 8, areaStyle: { opacity: 0.1, color: '#3b82f6' } },
            { name: 'Planta Sur', type: 'line', data: [135, 140, 138, 142, 148, 145, 150, 155, 152, 158, 162, 157], smooth: true, lineStyle: { color: '#10b981', width: 3 }, symbol: 'diamond', symbolSize: 8, areaStyle: { opacity: 0.1, color: '#10b981' } },
        ],
        grid: { left: '10%', right: '5%', bottom: '15%', containLabel: true },
    };
    const curvaSOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        legend: { data: ['Planificado', 'Real', 'Variación'], textStyle: { color: '#94a3b8' } },
        xAxis: { type: 'category', data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], axisLabel: { color: '#94a3b8' } },
        yAxis: { type: 'value', name: 'm³ acumulados', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
        series: [
            { name: 'Planificado', type: 'line', data: [400, 900, 1500, 2200, 3000, 3800, 4600, 5400, 6200, 7000, 7800, 8500], smooth: true, lineStyle: { color: '#3b82f6', width: 3, type: 'dashed' }, symbol: 'none' },
            { name: 'Real', type: 'line', data: [380, 850, 1400, 2100, 2800, 3600, 4500, 5200, 6100, 6800, 7600, 8300], smooth: true, lineStyle: { color: '#10b981', width: 3 }, symbol: 'circle', areaStyle: { opacity: 0.1, color: '#10b981' } },
            { name: 'Variación', type: 'bar', data: [-20, -50, -100, -100, -200, -200, -100, -200, -100, -200, -200, -200], itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] } },
        ],
        grid: { left: '10%', right: '5%', bottom: '15%', containLabel: true },
    };
    const charts = {
        pie: { option: costDistributionOption, label: 'Distribución', icon: PieChart },
        heatmap: { option: heatmapOption, label: 'Heatmap', icon: LayoutDashboard },
        line: { option: lineChartOption, label: 'Evolución', icon: BarChart3 },
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-end gap-3 mb-6", children: [_jsxs("button", { onClick: handleExportExcel, className: "flex items-center gap-2 px-4 py-2 bg-green-600/10 text-green-500 border border-green-600/20 rounded-lg hover:bg-green-600/20 transition-all text-sm font-bold", children: [_jsx(FileSpreadsheet, { className: "w-4 h-4" }), " Exportar Excel"] }), _jsxs("button", { onClick: handleExportPDF, className: "flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-500 border border-red-600/20 rounded-lg hover:bg-red-600/20 transition-all text-sm font-bold", children: [_jsx(FileText, { className: "w-4 h-4" }), " Descargar PDF"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6", children: [_jsx(KPICard, { title: "Producci\u00F3n Mensual", value: "4,250 m\u00B3", icon: Factory, trend: { value: 12, isUp: true }, description: "vs mes anterior" }), _jsx(KPICard, { title: "Costo Promedio", value: "$142.50 /m\u00B3", icon: DollarSign, trend: { value: 3, isUp: false }, description: "Materiales + Operaci\u00F3n" }), _jsx(KPICard, { title: "Margen Bruto", value: "28.4%", icon: TrendingUp, trend: { value: 5, isUp: true }, description: "Promedio consolidado" }), _jsx(KPICard, { title: "Eficiencia (OEE)", value: `${plants && plants.length > 0 ? plants.reduce((s, p) => s + plantOEE(p), 0) / plants.length : 88.2}%`, icon: Activity, trend: { value: 2, isUp: true }, description: "Disponibilidad x Rend x Cal" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsx(KPICard, { title: "VAN Estimado", value: "$1,245k", icon: Target, trend: { value: 8, isUp: true }, description: "Proyectos activos" }), _jsx(KPICard, { title: "ROI Proyectado", value: "18.3%", icon: TrendingUp, trend: { value: 2, isUp: true }, description: "Retorno sobre inversi\u00F3n" }), _jsx(KPICard, { title: "Payback", value: "14 meses", icon: Clock, trend: { value: 1, isUp: false }, description: "Recuperaci\u00F3n estimada" }), _jsx(KPICard, { title: "Productividad", value: "8.2 m\u00B3/h/d\u00EDa", icon: Users, trend: { value: 4, isUp: true }, description: "Promedio por cuadrilla" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 glass-card p-6 rounded-xl", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h3", { className: "font-bold text-lg", children: "Costos Operativos" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("div", { className: "flex bg-background border border-border rounded-lg p-1", children: Object.entries(charts).map(([key, chart]) => {
                                                    const Icon = chart.icon;
                                                    return (_jsxs("button", { onClick: () => setChartView(key), className: `flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${chartView === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`, children: [_jsx(Icon, { className: "w-3.5 h-3.5" }), " ", chart.label] }, key));
                                                }) }), _jsxs("select", { value: selectedPlant, onChange: e => setSelectedPlant(e.target.value), className: "bg-background border border-border rounded px-2 py-1 text-sm", children: [_jsx("option", { value: "all", children: "Todas las plantas" }), plants?.map(p => _jsx("option", { value: p.id, children: p.name }, p.id))] })] })] }), _jsx("div", { className: "h-[300px]", children: _jsx(ReactECharts, { option: charts[chartView].option, style: { height: '100%' } }) })] }), _jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-bold text-lg mb-6", children: "Eficiencia Global de Planta" }), _jsx("div", { className: "h-[300px]", children: _jsx(ReactECharts, { option: {
                                        series: [{
                                                type: 'gauge', startAngle: 180, endAngle: 0, min: 0, max: 100, splitNumber: 8,
                                                axisLine: { lineStyle: { width: 6, color: [[0.7, '#ef4444'], [0.85, '#f59e0b'], [1, '#10b981']] } },
                                                pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '12%', width: 20, offsetCenter: [0, '-60%'], itemStyle: { color: 'auto' } },
                                                axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
                                                detail: { fontSize: 30, offsetCenter: [0, '-20%'], valueAnimation: true, formatter: '{value}%', color: 'inherit' },
                                                data: [{ value: plants && plants.length > 0 ? plants.reduce((s, p) => s + plantOEE(p), 0) / plants.length : 88, name: 'OEE Global' }]
                                            }]
                                    }, style: { height: '100%' } }) })] }), _jsxs("div", { className: "lg:col-span-3 glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-bold text-lg mb-4", children: "Curva S - Avance de Producci\u00F3n" }), _jsx("div", { className: "h-[300px]", children: _jsx(ReactECharts, { option: curvaSOption, style: { height: '100%' } }) })] }), _jsxs("div", { className: "lg:col-span-3 glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-bold text-lg mb-4", children: "Alertas de Control & Calidad" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(AlertTriangle, { className: "text-red-500" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Variaci\u00F3n de Precio: Cemento Portland" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Incremento del 15% detectado en Planta Norte" })] })] }), _jsx("button", { className: "text-sm font-bold text-red-500", children: "RECALCULAR" })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(CheckCircle2, { className: "text-green-500" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Resistencia a 28 d\u00EDas - Proyecto Skyline" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "98.5% de cumplimiento en muestras H-30" })] })] }), _jsx("span", { className: "text-xs text-muted-foreground", children: "Hace 2 horas" })] })] })] })] })] }));
};
export default Dashboard;
