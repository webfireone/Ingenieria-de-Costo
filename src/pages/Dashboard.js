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
    const filteredPlants = plants && (selectedPlant === 'all' ? plants : plants.filter(p => p.id === selectedPlant));
    const filteredProjects = projects && (selectedPlant === 'all' ? projects : projects.filter(p => p.plantId === selectedPlant));
    const totalMaterialCost = filteredPlants ? filteredPlants.reduce((sum, p) => {
        return sum + p.materials.reduce((s, m) => s + m.unitPrice * m.quantityPerM3, 0);
    }, 0) / filteredPlants.length : 0;
    const totalOpVariable = filteredPlants ? filteredPlants.reduce((sum, p) => {
        return sum + p.operations.reduce((s, o) => s + o.variablePerM3, 0);
    }, 0) / filteredPlants.length : 0;
    const totalOpFixed = filteredPlants ? filteredPlants.reduce((sum, p) => {
        return sum + p.operations.reduce((s, o) => s + o.monthlyFixed, 0) / p.installedCapacity;
    }, 0) / filteredPlants.length : 0;
    const totalOp = totalOpVariable + totalOpFixed;
    const totalAll = totalMaterialCost + totalOp;
    const monthlyProduction = filteredPlants ? Math.round(filteredPlants.reduce((s, p) => s + p.installedCapacity * p.performance, 0)) : 4250;
    const avgSalePrice = filteredProjects && filteredProjects.length > 0
        ? filteredProjects.reduce((s, p) => s + p.salePricePerM3, 0) / filteredProjects.length
        : 200;
    const grossMargin = avgSalePrice > 0 ? ((avgSalePrice - totalAll) / avgSalePrice * 100) : 28.4;
    const totalVolume = filteredProjects ? filteredProjects.reduce((s, p) => s + p.totalVolume, 0) : 0;
    const avgDuration = filteredProjects && filteredProjects.length > 0
        ? filteredProjects.reduce((s, p) => s + p.durationMonths, 0) / filteredProjects.length
        : 12;
    const yearlyRevenue = totalVolume * avgSalePrice / (avgDuration / 12 || 1);
    const yearlyCost = totalVolume * totalAll / (avgDuration / 12 || 1);
    const vanEst = yearlyRevenue - yearlyCost;
    const roi = yearlyCost > 0 ? ((yearlyRevenue - yearlyCost) / yearlyCost * 100) : 18.3;
    const paybackMonths = monthlyProduction > 0 && totalAll > 0
        ? Math.round(totalVolume * totalAll / (monthlyProduction * (avgSalePrice - totalAll)) * 12)
        : 14;
    const productividad = filteredPlants && filteredPlants.length > 0
        ? (filteredPlants.reduce((s, p) => s + p.installedCapacity * p.performance, 0) / (25 * 8 * filteredPlants.length)).toFixed(1)
        : '8.2';
    const costDistributionOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item', formatter: '{b}: ${c} /m³ ({d}%)' },
        series: [{
                name: 'Distribución de Costos', type: 'pie', radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 10, borderColor: '#0f172a', borderWidth: 2 },
                label: { show: false },
                data: totalAll > 0 ? [
                    { value: Math.round(totalMaterialCost), name: 'Materiales', itemStyle: { color: '#3b82f6' } },
                    { value: Math.round(totalOp), name: 'Operación', itemStyle: { color: '#10b981' } },
                    { value: Math.round(totalOp * 0.3), name: 'Mantenimiento', itemStyle: { color: '#f59e0b' } },
                    { value: Math.round(totalMaterialCost * 0.15), name: 'Logística', itemStyle: { color: '#6366f1' } },
                ] : [
                    { value: 45, name: 'Materiales', itemStyle: { color: '#3b82f6' } },
                    { value: 25, name: 'Operación', itemStyle: { color: '#10b981' } },
                    { value: 20, name: 'Mantenimiento', itemStyle: { color: '#f59e0b' } },
                    { value: 10, name: 'Logística', itemStyle: { color: '#6366f1' } },
                ]
            }]
    };
    const plantNames = filteredPlants?.map(p => p.name) ?? ['Planta Norte', 'Planta Sur'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const radarOption = {
        backgroundColor: 'transparent',
        tooltip: {},
        legend: { data: plantNames, textStyle: { color: '#94a3b8' }, bottom: 0 },
        radar: {
            indicator: [
                { name: 'Disponibilidad', max: 100 },
                { name: 'Rendimiento', max: 100 },
                { name: 'Calidad', max: 100 },
                { name: 'OEE', max: 100 },
                { name: 'Eficiencia Costo', max: 100 },
            ],
            axisName: { color: '#94a3b8' },
            splitArea: { areaStyle: { color: ['rgba(59,130,246,0.02)', 'rgba(59,130,246,0.05)'] } },
            splitLine: { lineStyle: { color: '#1e293b' } },
        },
        series: [{
                type: 'radar',
                data: (filteredPlants ?? []).map((plant, i) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'];
                    const oee = plantOEE(plant);
                    const matCost = plant.materials.reduce((s, m) => s + m.unitPrice * m.quantityPerM3, 0);
                    const opCost = plant.operations.reduce((s, o) => s + o.variablePerM3, 0) +
                        plant.operations.reduce((s, o) => s + o.monthlyFixed, 0) / plant.installedCapacity;
                    const totalCost = matCost + opCost;
                    const costEfficiency = Math.min(100, Math.max(0, 100 - (totalCost - 80) * 0.8));
                    return {
                        name: plant.name,
                        value: [
                            plant.availability * 100,
                            plant.performance * 100,
                            plant.qualityRate * 100,
                            oee,
                            Math.round(costEfficiency),
                        ],
                        lineStyle: { color: colors[i % colors.length], width: 2 },
                        areaStyle: { color: colors[i % colors.length], opacity: 0.1 },
                        itemStyle: { color: colors[i % colors.length] },
                    };
                }),
            }],
    };
    const lineChartOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        legend: { data: plantNames, textStyle: { color: '#94a3b8' } },
        xAxis: { type: 'category', data: months, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
        yAxis: { type: 'value', name: 'Costo $/m³', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
        series: filteredPlants?.map((plant, i) => {
            const matCost = plant.materials.reduce((s, m) => s + m.unitPrice * m.quantityPerM3, 0);
            const opCost = plant.operations.reduce((s, o) => s + o.variablePerM3, 0) +
                plant.operations.reduce((s, o) => s + o.monthlyFixed, 0) / plant.installedCapacity;
            const plantBase = Math.round(matCost + opCost);
            const seasonal = [0, -2, 1, -1, 3, 2, -1, 4, 2, 5, 3, 1];
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'];
            const symbols = ['circle', 'diamond', 'triangle', 'rect'];
            return {
                name: plant.name,
                type: 'line',
                data: seasonal.map(s => plantBase + s),
                smooth: true,
                lineStyle: { color: colors[i % colors.length], width: 3 },
                symbol: symbols[i % symbols.length],
                symbolSize: 8,
                areaStyle: { opacity: 0.1, color: colors[i % colors.length] },
            };
        }) ?? [
            { name: 'Planta Norte', type: 'line', data: [142, 138, 145, 140, 155, 150, 148, 160, 158, 165, 170, 162], smooth: true, lineStyle: { color: '#3b82f6', width: 3 }, symbol: 'circle', symbolSize: 8, areaStyle: { opacity: 0.1, color: '#3b82f6' } },
            { name: 'Planta Sur', type: 'line', data: [135, 140, 138, 142, 148, 145, 150, 155, 152, 158, 162, 157], smooth: true, lineStyle: { color: '#10b981', width: 3 }, symbol: 'diamond', symbolSize: 8, areaStyle: { opacity: 0.1, color: '#10b981' } },
        ],
        grid: { left: '10%', right: '5%', bottom: '15%', containLabel: true },
    };
    const curvaSOption = (() => {
        const totalPlan = filteredProjects ? filteredProjects.reduce((s, p) => s + p.totalVolume, 0) : 8500;
        const plan = months.map((_, i) => Math.round(totalPlan * ((i + 1) / months.length)));
        const real = plan.map(v => Math.round(v * 0.95));
        const varian = plan.map((v, i) => real[i] - v);
        return {
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            legend: { data: ['Planificado', 'Real', 'Variación'], textStyle: { color: '#94a3b8' } },
            xAxis: { type: 'category', data: months, axisLabel: { color: '#94a3b8' } },
            yAxis: { type: 'value', name: 'm³ acumulados', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
            series: [
                { name: 'Planificado', type: 'line', data: plan, smooth: true, lineStyle: { color: '#3b82f6', width: 3, type: 'dashed' }, symbol: 'none' },
                { name: 'Real', type: 'line', data: real, smooth: true, lineStyle: { color: '#10b981', width: 3 }, symbol: 'circle', areaStyle: { opacity: 0.1, color: '#10b981' } },
                { name: 'Variación', type: 'bar', data: varian, itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] } },
            ],
            grid: { left: '10%', right: '5%', bottom: '15%', containLabel: true },
        };
    })();
    const charts = {
        pie: { option: costDistributionOption, label: 'Distribución', icon: PieChart },
        radar: { option: radarOption, label: 'Radar KPIs', icon: LayoutDashboard },
        line: { option: lineChartOption, label: 'Evolución', icon: BarChart3 },
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-end gap-3 mb-6", children: [_jsxs("button", { onClick: handleExportExcel, className: "flex items-center gap-2 px-4 py-2 bg-green-600/10 text-green-500 border border-green-600/20 rounded-lg hover:bg-green-600/20 transition-all text-sm font-bold", children: [_jsx(FileSpreadsheet, { className: "w-4 h-4" }), " Exportar Excel"] }), _jsxs("button", { onClick: handleExportPDF, className: "flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-500 border border-red-600/20 rounded-lg hover:bg-red-600/20 transition-all text-sm font-bold", children: [_jsx(FileText, { className: "w-4 h-4" }), " Descargar PDF"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6", children: [_jsx(KPICard, { title: "Producci\u00F3n Mensual", value: `${monthlyProduction.toLocaleString()} m³`, icon: Factory, trend: { value: 12, isUp: true }, description: "vs mes anterior" }), _jsx(KPICard, { title: "Costo Promedio", value: `$${totalAll.toFixed(2)} /m³`, icon: DollarSign, trend: { value: 3, isUp: false }, description: "Materiales + Operaci\u00F3n" }), _jsx(KPICard, { title: "Margen Bruto", value: `${grossMargin.toFixed(1)}%`, icon: TrendingUp, trend: { value: 5, isUp: true }, description: "Promedio consolidado" }), _jsx(KPICard, { title: "Eficiencia (OEE)", value: `${(filteredPlants && filteredPlants.length > 0 ? filteredPlants.reduce((s, p) => s + plantOEE(p), 0) / filteredPlants.length : plants && plants.length > 0 ? plants.reduce((s, p) => s + plantOEE(p), 0) / plants.length : 88.2).toFixed(2)}%`, icon: Activity, trend: { value: 2, isUp: true }, description: "Disponibilidad x Rend x Cal" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsx(KPICard, { title: "VAN Estimado", value: `$${(vanEst / 1000).toFixed(0)}k`, icon: Target, trend: { value: 8, isUp: true }, description: "Proyectos activos" }), _jsx(KPICard, { title: "ROI Proyectado", value: `${roi.toFixed(2)}%`, icon: TrendingUp, trend: { value: 2, isUp: true }, description: "Retorno sobre inversi\u00F3n" }), _jsx(KPICard, { title: "Payback", value: `${paybackMonths} meses`, icon: Clock, trend: { value: 1, isUp: false }, description: "Recuperaci\u00F3n estimada" }), _jsx(KPICard, { title: "Productividad", value: `${productividad} m³/h/día`, icon: Users, trend: { value: 4, isUp: true }, description: "Promedio por cuadrilla" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 glass-card p-6 rounded-xl", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h3", { className: "font-bold text-lg", children: "Costos Operativos" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("div", { className: "flex bg-background border border-border rounded-lg p-1", children: Object.entries(charts).map(([key, chart]) => {
                                                    const Icon = chart.icon;
                                                    return (_jsxs("button", { onClick: () => setChartView(key), className: `flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${chartView === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`, children: [_jsx(Icon, { className: "w-3.5 h-3.5" }), " ", chart.label] }, key));
                                                }) }), _jsxs("select", { value: selectedPlant, onChange: e => setSelectedPlant(e.target.value), className: "bg-background border border-border rounded px-2 py-1 text-sm", children: [_jsx("option", { value: "all", children: "Todas las plantas" }), plants?.map(p => _jsx("option", { value: p.id, children: p.name }, p.id))] })] })] }), _jsx("div", { className: "h-[300px]", children: _jsx(ReactECharts, { option: charts[chartView].option, style: { height: '100%' } }, chartView) })] }), _jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-bold text-lg mb-6", children: "Eficiencia Global de Planta" }), _jsx("div", { className: "h-[300px]", children: _jsx(ReactECharts, { option: {
                                        series: [{
                                                type: 'gauge', startAngle: 180, endAngle: 0, min: 0, max: 100, splitNumber: 8,
                                                axisLine: { lineStyle: { width: 6, color: [[0.7, '#ef4444'], [0.85, '#f59e0b'], [1, '#10b981']] } },
                                                pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '12%', width: 20, offsetCenter: [0, '-60%'], itemStyle: { color: 'auto' } },
                                                axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
                                                detail: { fontSize: 30, offsetCenter: [0, '-20%'], valueAnimation: true, formatter: '{value}%', color: 'inherit' },
                                                data: [{ value: Math.round(filteredPlants && filteredPlants.length > 0 ? filteredPlants.reduce((s, p) => s + plantOEE(p), 0) / filteredPlants.length : plants && plants.length > 0 ? plants.reduce((s, p) => s + plantOEE(p), 0) / plants.length : 88), name: 'OEE' }]
                                            }]
                                    }, style: { height: '100%' } }) })] }), _jsxs("div", { className: "lg:col-span-3 glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-bold text-lg mb-4", children: "Curva S - Avance de Producci\u00F3n" }), _jsx("div", { className: "h-[300px]", children: _jsx(ReactECharts, { option: curvaSOption, style: { height: '100%' } }) })] }), _jsxs("div", { className: "lg:col-span-3 glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-bold text-lg mb-4", children: "Alertas de Control & Calidad" }), _jsxs("div", { className: "space-y-4", children: [filteredPlants && filteredPlants.length > 0 && filteredPlants.every(p => p.materials.length > 0) && (_jsxs("div", { className: "flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(AlertTriangle, { className: "text-red-500" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Variaci\u00F3n de Precio: Cemento Portland" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Incremento del 15% detectado en ", filteredPlants.length === 1 ? filteredPlants[0].name : 'plantas seleccionadas'] })] })] }), _jsx("button", { className: "text-sm font-bold text-red-500", children: "RECALCULAR" })] })), filteredProjects && filteredProjects.length > 0 && (_jsxs("div", { className: "flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(CheckCircle2, { className: "text-green-500" }), _jsxs("div", { children: [_jsxs("p", { className: "font-medium", children: ["Resistencia a 28 d\u00EDas - ", filteredProjects.length === 1 ? filteredProjects[0].name : `${filteredProjects.length} proyectos`] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "98.5% de cumplimiento en muestras H-30" })] })] }), _jsx("span", { className: "text-xs text-muted-foreground", children: "Hace 2 horas" })] })), (!filteredPlants || filteredPlants.length === 0) && (_jsx("p", { className: "text-muted-foreground text-sm", children: "No hay datos para la planta seleccionada." }))] })] })] })] }));
};
export default Dashboard;
