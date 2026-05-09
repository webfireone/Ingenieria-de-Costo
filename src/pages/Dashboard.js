import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import 'echarts-gl';
import { Factory, TrendingUp, DollarSign, Activity, AlertTriangle, CheckCircle2, FileSpreadsheet, FileText, BarChart3, PieChart, LayoutDashboard, Target, Clock, Users, Layers } from 'lucide-react';
import KPICard from '../components/KPICard';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { exportToExcel } from '../services/importExport';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
const Dashboard = () => {
    const { data: plants } = useFirestoreCollection('plants');
    const { data: projects } = useFirestoreCollection('projects');
    const [chartView, setChartView] = useState('pie');
    const [selectedPlant, setSelectedPlant] = useState('all');
    const chartRef = useRef(null);
    const gaugeRef = useRef(null);
    const curvaRef = useRef(null);
    const handleExportExcel = () => {
        if (!plants)
            return;
        const exportData = plants.map(p => ({
            Planta: p.name, Ubicación: p.location, Capacidad: `${p.installedCapacity} m3`,
            OEE: `${(p.availability * p.performance * p.qualityRate * 100).toFixed(1)}%`
        }));
        exportToExcel(exportData, `Reporte_Plantas_${new Date().toLocaleDateString()}`);
    };
    const handleExportPDF = async () => {
        if (!plants)
            return;
        const ov = totalOpVariable.toFixed(2);
        const of = totalOpFixed.toFixed(2);
        const mc = totalMaterialCost.toFixed(2);
        const ta = totalAll.toFixed(2);
        const mp = monthlyProduction.toLocaleString();
        const gm = grossMargin.toFixed(1);
        const oee = (filteredPlants && filteredPlants.length > 0
            ? filteredPlants.reduce((s, p) => s + plantOEE(p), 0) / filteredPlants.length
            : plants.reduce((s, p) => s + plantOEE(p), 0) / plants.length).toFixed(2);
        const van = (vanEst / 1000).toFixed(0);
        const roiVal = roi.toFixed(2);
        const pb = paybackMonths;
        const prod = productividad;
        const asp = avgSalePrice.toFixed(2);
        const tv = totalVolume.toLocaleString();
        const doc = new jsPDF();
        const pageW = doc.internal.pageSize.getWidth();
        let y = 20;
        // ── Title ──
        doc.setFontSize(22);
        doc.setTextColor(59, 130, 246);
        doc.text('GRUPO FALPAT', 14, y);
        y += 8;
        doc.setFontSize(14);
        doc.setTextColor(148, 163, 184);
        doc.text('Reporte Ejecutivo — Ingeniería de Costo', 14, y);
        y += 6;
        doc.setFontSize(9);
        doc.text(`Generado: ${new Date().toLocaleString('es-AR')}`, 14, y);
        y += 12;
        // ── 1. KPIs ──
        doc.setFontSize(13);
        doc.setTextColor(59, 130, 246);
        doc.text('Indicadores Clave (KPI)', 14, y);
        y += 8;
        const kpiData = [
            ['Producción Mensual', `${mp} m³`, 'Volumen total de hormigón producido por mes entre todas las plantas.'],
            ['Costo Promedio', `$${ta} /m³`, 'Suma de materiales ($${mc}) + operación variable ($${ov}) + fija ($${of}) por m³.'],
            ['Margen Bruto', `${gm}%`, 'Diferencia entre el precio de venta promedio ($${asp}) y el costo, sobre el precio.'],
            ['Eficiencia (OEE)', `${oee}%`, 'Disponibilidad × Rendimiento × Calidad. Mide la eficiencia global de las plantas.'],
            ['VAN Estimado', `$${van}k`, 'Valor Actual Neto de todos los proyectos activos. Positivo = proyecto rentable.'],
            ['ROI Proyectado', `${roiVal}%`, 'Retorno sobre la inversión. Porcentaje de ganancia respecto a lo invertido.'],
            ['Payback', `${pb} meses`, 'Tiempo estimado para recuperar la inversión inicial.'],
            ['Productividad', `${prod} m³/h/día`, 'm³ producidos por hora y por cuadrilla de trabajo.'],
        ];
        for (const [kpi, val, desc] of kpiData) {
            doc.setFontSize(10);
            doc.setTextColor(248, 250, 252);
            doc.text(`${kpi}:  `, 14, y);
            doc.setFontSize(11);
            doc.setTextColor(59, 130, 246);
            doc.text(String(val), 55, y);
            y += 4.5;
            doc.setFontSize(7.5);
            doc.setTextColor(148, 163, 184);
            const lines = doc.splitTextToSize(desc, pageW - 28);
            doc.text(lines, 14, y);
            y += lines.length * 3.5 + 3;
            if (y > 260) {
                doc.addPage();
                y = 20;
            }
        }
        y += 4;
        // ── 2. Charts ──
        const captureChart = (ref) => {
            return new Promise(resolve => {
                if (!ref)
                    return resolve(null);
                const canvas = ref.querySelector('canvas');
                if (!canvas)
                    return resolve(null);
                const instance = echarts.getInstanceByDom(canvas);
                if (!instance)
                    return resolve(null);
                try {
                    const dataUrl = instance.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#0f172a' });
                    resolve(dataUrl);
                }
                catch {
                    resolve(null);
                }
            });
        };
        const [chartImg, gaugeImg, curvaImg] = await Promise.all([
            captureChart(chartRef.current),
            captureChart(gaugeRef.current),
            captureChart(curvaRef.current),
        ]);
        if (chartImg) {
            if (y + 100 > 260) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(12);
            doc.setTextColor(59, 130, 246);
            doc.text('Gráfico — Costos Operativos', 14, y);
            y += 4;
            doc.setFontSize(7.5);
            doc.setTextColor(148, 163, 184);
            doc.text('Distribución de costos de materiales, operación, mantenimiento y logística por planta.', 14, y);
            y += 6;
            doc.addImage(chartImg, 'PNG', 14, y, pageW - 28, 80);
            y += 88;
        }
        if (gaugeImg) {
            if (y + 80 > 260) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(12);
            doc.setTextColor(59, 130, 246);
            doc.text('Gráfico — Eficiencia Global (OEE)', 14, y);
            y += 4;
            doc.setFontSize(7.5);
            doc.setTextColor(148, 163, 184);
            doc.text('Indicador tipo velocímetro que muestra el OEE promedio de todas las plantas.', 14, y);
            y += 6;
            doc.addImage(gaugeImg, 'PNG', 14, y, 80, 70);
            y += 76;
        }
        if (curvaImg) {
            if (y + 80 > 260) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(12);
            doc.setTextColor(59, 130, 246);
            doc.text('Gráfico — Curva S de Producción', 14, y);
            y += 4;
            doc.setFontSize(7.5);
            doc.setTextColor(148, 163, 184);
            doc.text('Compara el avance planificado vs real de producción acumulada mes a mes.', 14, y);
            y += 6;
            doc.addImage(curvaImg, 'PNG', 14, y, pageW - 28, 70);
            y += 76;
        }
        // ── 3. Plants table ──
        if (y + 30 > 260) {
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(13);
        doc.setTextColor(59, 130, 246);
        doc.text('Plantas de Hormigón', 14, y);
        y += 4;
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text('Detalle de cada planta: capacidad instalada, indicadores de eficiencia y costos.', 14, y);
        y += 6;
        const plantHeaders = [['Planta', 'Ubicación', 'Cap. (m³/mes)', 'Disponib.', 'Rendim.', 'Calidad', 'OEE (%)', 'Mat. ($/m³)', 'Op. ($/m³)']];
        const plantRows = plants.map(p => {
            const matCost = p.materials.reduce((s, m) => s + m.unitPrice * m.quantityPerM3, 0);
            const opCost = p.operations.reduce((s, o) => s + o.variablePerM3, 0) +
                p.operations.reduce((s, o) => s + o.monthlyFixed, 0) / p.installedCapacity;
            return [
                p.name, p.location, `${p.installedCapacity}`,
                `${(p.availability * 100).toFixed(0)}%`,
                `${(p.performance * 100).toFixed(0)}%`,
                `${(p.qualityRate * 100).toFixed(0)}%`,
                plantOEE(p).toFixed(1),
                `$${matCost.toFixed(2)}`,
                `$${opCost.toFixed(2)}`,
            ];
        });
        autoTable(doc, {
            head: plantHeaders,
            body: plantRows,
            startY: y,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246], fontSize: 7 },
            bodyStyles: { fontSize: 6.5, textColor: [248, 250, 252] },
            styles: { cellPadding: 2 },
        });
        y = doc.lastAutoTable.finalY + 12;
        // ── 4. Projects table ──
        if (projects && projects.length > 0) {
            if (y + 30 > 260) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(13);
            doc.setTextColor(59, 130, 246);
            doc.text('Proyectos y Obras', 14, y);
            y += 4;
            doc.setFontSize(7.5);
            doc.setTextColor(148, 163, 184);
            doc.text('Proyectos activos con volumen, duración, precio de venta e ingreso total estimado.', 14, y);
            y += 6;
            const projHeaders = [['Proyecto', 'Vol. (m³)', 'Duración (meses)', 'Precio ($/m³)', 'Ingreso Total']];
            const projRows = projects.map(p => [
                p.name, `${p.totalVolume}`, `${p.durationMonths}`,
                `$${p.salePricePerM3.toFixed(2)}`,
                `$${(p.totalVolume * p.salePricePerM3).toLocaleString()}`,
            ]);
            autoTable(doc, {
                head: projHeaders,
                body: projRows,
                startY: y,
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246], fontSize: 7 },
                bodyStyles: { fontSize: 6.5, textColor: [248, 250, 252] },
                styles: { cellPadding: 2 },
            });
            y = doc.lastAutoTable.finalY + 12;
        }
        // ── 5. Alert summary ──
        if (y + 20 > 260) {
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(13);
        doc.setTextColor(59, 130, 246);
        doc.text('Alertas de Control', 14, y);
        y += 4;
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text('Eventos detectados automáticamente sobre variaciones de precio, calidad y eficiencia.', 14, y);
        y += 6;
        const hasMatAlerts = filteredPlants && filteredPlants.length > 0 && filteredPlants.every(p => p.materials.length > 0);
        const alertBody = [];
        if (hasMatAlerts) {
            const plantNames = filteredPlants.length === 1 ? filteredPlants[0].name : 'plantas seleccionadas';
            alertBody.push(['Variación de Precio: Cemento Portland', '15% sobre lo esperado', plantNames, 'Crítica']);
        }
        if (filteredProjects && filteredProjects.length > 0) {
            alertBody.push(['Resistencia a 28 días', '98.5% de cumplimiento H-30', `${filteredProjects.length} proyectos`, 'Información']);
        }
        if (alertBody.length > 0) {
            autoTable(doc, {
                head: [['Alerta', 'Detalle', 'Fuente', 'Tipo']],
                body: alertBody,
                startY: y,
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246], fontSize: 7 },
                bodyStyles: { fontSize: 6.5, textColor: [248, 250, 252] },
                styles: { cellPadding: 2 },
            });
            y = doc.lastAutoTable.finalY + 12;
        }
        // ── Footer ──
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text('GRUPO FALPAT — Ingeniería de Costo | Reporte generado automáticamente', 14, doc.internal.pageSize.getHeight() - 10);
        doc.save(`Reporte_Ejecutivo_${new Date().toLocaleDateString('es-AR').replace(/\//g, '-')}.pdf`);
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
                emphasis: {
                    itemStyle: {
                        shadowBlur: 20,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(59, 130, 246, 0.4)',
                    },
                },
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
                areaStyle: { opacity: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: colors[i % colors.length] + '30' }, { offset: 1, color: colors[i % colors.length] + '00' }] } },
            };
        }) ?? [
            { name: 'Planta Norte', type: 'line', data: [142, 138, 145, 140, 155, 150, 148, 160, 158, 165, 170, 162], smooth: true, lineStyle: { color: '#3b82f6', width: 3 }, symbol: 'circle', symbolSize: 8, areaStyle: { opacity: 0.1, color: '#3b82f6' } },
            { name: 'Planta Sur', type: 'line', data: [135, 140, 138, 142, 148, 145, 150, 155, 152, 158, 162, 157], smooth: true, lineStyle: { color: '#10b981', width: 3 }, symbol: 'diamond', symbolSize: 8, areaStyle: { opacity: 0.1, color: '#10b981' } },
        ],
        grid: { left: '10%', right: '5%', bottom: '15%', containLabel: true },
    };
    const bar3dOption = {
        backgroundColor: 'transparent',
        tooltip: {},
        xAxis3D: {
            type: 'category',
            data: filteredPlants?.map(p => p.name) ?? ['Norte', 'Sur'],
            axisLabel: { color: '#94a3b8' },
        },
        yAxis3D: {
            type: 'category',
            data: ['Materiales', 'Operación', 'Mantenimiento', 'Logística'],
            axisLabel: { color: '#94a3b8' },
        },
        zAxis3D: {
            type: 'value',
            name: '$/m³',
            axisLabel: { color: '#94a3b8' },
        },
        grid3D: {
            boxWidth: 200,
            boxHeight: 120,
            boxDepth: 80,
            viewControl: {
                projection: 'perspective',
                autoRotate: true,
                autoRotateSpeed: 8,
                distance: 300,
                alpha: 25,
                beta: 30,
            },
            light: {
                main: { intensity: 1.2, shadow: true },
                ambient: { intensity: 0.4 },
            },
        },
        series: [{
                type: 'bar3D',
                shading: 'lambert',
                data: (filteredPlants ?? ['Norte', 'Sur']).flatMap((plant, pi) => {
                    const p = typeof plant === 'string' ? null : plant;
                    return ['Materiales', 'Operación', 'Mantenimiento', 'Logística'].map((_, ci) => {
                        let val = 0;
                        if (p) {
                            const mat = p.materials.reduce((s, m) => s + m.unitPrice * m.quantityPerM3, 0);
                            const op = p.operations.reduce((s, o) => s + o.variablePerM3, 0) +
                                p.operations.reduce((s, o) => s + o.monthlyFixed, 0) / p.installedCapacity;
                            if (ci === 0)
                                val = Math.round(mat);
                            else if (ci === 1)
                                val = Math.round(op);
                            else if (ci === 2)
                                val = Math.round(op * 0.3);
                            else
                                val = Math.round(mat * 0.15);
                        }
                        else {
                            val = [45, 25, 20, 10][ci];
                        }
                        return [pi, ci, Math.max(val, 1)];
                    });
                }),
                itemStyle: {
                    opacity: 0.85,
                    borderWidth: 0,
                },
                emphasis: {
                    itemStyle: {
                        opacity: 1,
                        borderWidth: 2,
                        borderColor: '#fff',
                    },
                },
            }],
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
        bar3d: { option: bar3dOption, label: '3D Costos', icon: Layers },
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-end gap-3 mb-6", children: [_jsxs("button", { onClick: handleExportExcel, className: "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:from-emerald-600/30 hover:to-emerald-500/20 transition-all duration-300 text-sm font-bold shadow-lg shadow-emerald-500/5", children: [_jsx(FileSpreadsheet, { className: "w-4 h-4" }), " Exportar Excel"] }), _jsxs("button", { onClick: handleExportPDF, className: "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600/20 to-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl hover:from-rose-600/30 hover:to-rose-500/20 transition-all duration-300 text-sm font-bold shadow-lg shadow-rose-500/5", children: [_jsx(FileText, { className: "w-4 h-4" }), " Descargar PDF"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6", children: [_jsx(KPICard, { title: "Producci\u00F3n Mensual", value: `${monthlyProduction.toLocaleString()} m³`, icon: Factory, trend: { value: 12, isUp: true }, description: "vs mes anterior" }), _jsx(KPICard, { title: "Costo Promedio", value: `$${totalAll.toFixed(2)} /m³`, icon: DollarSign, trend: { value: 3, isUp: false }, description: "Materiales + Operaci\u00F3n" }), _jsx(KPICard, { title: "Margen Bruto", value: `${grossMargin.toFixed(1)}%`, icon: TrendingUp, trend: { value: 5, isUp: true }, description: "Promedio consolidado" }), _jsx(KPICard, { title: "Eficiencia (OEE)", value: `${(filteredPlants && filteredPlants.length > 0 ? filteredPlants.reduce((s, p) => s + plantOEE(p), 0) / filteredPlants.length : plants && plants.length > 0 ? plants.reduce((s, p) => s + plantOEE(p), 0) / plants.length : 88.2).toFixed(2)}%`, icon: Activity, trend: { value: 2, isUp: true }, description: "Disponibilidad x Rend x Cal" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsx(KPICard, { title: "VAN Estimado", value: `$${(vanEst / 1000).toFixed(0)}k`, icon: Target, trend: { value: 8, isUp: true }, description: "Proyectos activos" }), _jsx(KPICard, { title: "ROI Proyectado", value: `${roi.toFixed(2)}%`, icon: TrendingUp, trend: { value: 2, isUp: true }, description: "Retorno sobre inversi\u00F3n" }), _jsx(KPICard, { title: "Payback", value: `${paybackMonths} meses`, icon: Clock, trend: { value: 1, isUp: false }, description: "Recuperaci\u00F3n estimada" }), _jsx(KPICard, { title: "Productividad", value: `${productividad} m³/h/día`, icon: Users, trend: { value: 4, isUp: true }, description: "Promedio por cuadrilla" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 glass-card p-6 rounded-2xl relative overflow-hidden", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h3", { className: "font-heading font-bold text-lg text-gradient", children: "Costos Operativos" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("div", { className: "flex bg-background/50 border border-border/50 rounded-xl p-1 gap-0.5 backdrop-blur-sm", children: Object.entries(charts).map(([key, chart]) => {
                                                    const Icon = chart.icon;
                                                    return (_jsxs("button", { onClick: () => setChartView(key), className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${chartView === key
                                                            ? 'bg-gradient-to-r from-primary to-violet-500 text-white shadow-lg shadow-primary/20'
                                                            : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'}`, children: [_jsx(Icon, { className: "w-3.5 h-3.5" }), " ", chart.label] }, key));
                                                }) }), _jsxs("select", { value: selectedPlant, onChange: e => setSelectedPlant(e.target.value), className: "bg-background/50 border border-border/50 rounded-xl px-3 py-1.5 text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30", children: [_jsx("option", { value: "all", children: "Todas las plantas" }), plants?.map(p => _jsx("option", { value: p.id, children: p.name }, p.id))] })] })] }), _jsx("div", { ref: chartRef, className: "h-[350px]", children: _jsx(ReactECharts, { option: charts[chartView].option, style: { height: '100%' } }, chartView) })] }), _jsxs("div", { className: "glass-card p-6 rounded-2xl relative overflow-hidden", children: [_jsx("h3", { className: "font-heading font-bold text-lg text-gradient mb-6", children: "Eficiencia Global" }), _jsx("div", { ref: gaugeRef, className: "h-[300px]", children: _jsx(ReactECharts, { option: {
                                        series: [{
                                                type: 'gauge', startAngle: 180, endAngle: 0, min: 0, max: 100, splitNumber: 8,
                                                axisLine: {
                                                    lineStyle: {
                                                        width: 8,
                                                        color: [[0.7, '#ef4444'], [0.85, '#f59e0b'], [1, '#10b981']],
                                                        shadowBlur: 10,
                                                        shadowColor: 'rgba(16, 185, 129, 0.3)',
                                                    },
                                                },
                                                pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '12%', width: 20, offsetCenter: [0, '-60%'], itemStyle: { color: 'auto' } },
                                                axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
                                                detail: { fontSize: 32, offsetCenter: [0, '-25%'], valueAnimation: true, formatter: '{value}%', color: '#f8fafc', fontFamily: 'JetBrains Mono', fontWeight: 'bold' },
                                                title: { offsetCenter: [0, '30%'], fontSize: 14, color: '#94a3b8' },
                                                data: [{ value: Math.round(filteredPlants && filteredPlants.length > 0 ? filteredPlants.reduce((s, p) => s + plantOEE(p), 0) / filteredPlants.length : plants && plants.length > 0 ? plants.reduce((s, p) => s + plantOEE(p), 0) / plants.length : 88), name: 'OEE' }]
                                            }]
                                    }, style: { height: '100%' } }) })] }), _jsxs("div", { className: "lg:col-span-3 glass-card p-6 rounded-2xl relative overflow-hidden", children: [_jsx("h3", { className: "font-heading font-bold text-lg text-gradient mb-4", children: "Curva S - Avance de Producci\u00F3n" }), _jsx("div", { ref: curvaRef, className: "h-[300px]", children: _jsx(ReactECharts, { option: curvaSOption, style: { height: '100%' } }) })] }), _jsxs("div", { className: "lg:col-span-3 glass-card p-6 rounded-2xl relative overflow-hidden", children: [_jsx("h3", { className: "font-heading font-bold text-lg text-gradient mb-4", children: "Alertas de Control & Calidad" }), _jsxs("div", { className: "space-y-4", children: [filteredPlants && filteredPlants.length > 0 && filteredPlants.every(p => p.materials.length > 0) && (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gradient-to-r from-rose-500/10 to-rose-500/5 border border-rose-500/20 rounded-xl group hover:from-rose-500/15 hover:to-rose-500/10 transition-all duration-300", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "p-2 bg-rose-500/10 rounded-lg group-hover:scale-110 transition-transform", children: _jsx(AlertTriangle, { className: "w-5 h-5 text-rose-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Variaci\u00F3n de Precio: Cemento Portland" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Incremento del 15% detectado en ", filteredPlants.length === 1 ? filteredPlants[0].name : 'plantas seleccionadas'] })] })] }), _jsx("button", { className: "text-sm font-bold text-rose-400 hover:text-rose-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-500/10", children: "RECALCULAR" })] })), filteredProjects && filteredProjects.length > 0 && (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl group hover:from-emerald-500/15 hover:to-emerald-500/10 transition-all duration-300", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "p-2 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform", children: _jsx(CheckCircle2, { className: "w-5 h-5 text-emerald-400" }) }), _jsxs("div", { children: [_jsxs("p", { className: "font-semibold", children: ["Resistencia a 28 d\u00EDas - ", filteredProjects.length === 1 ? filteredProjects[0].name : `${filteredProjects.length} proyectos`] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "98.5% de cumplimiento en muestras H-30" })] })] }), _jsx("span", { className: "text-xs text-muted-foreground", children: "Hace 2 horas" })] })), (!filteredPlants || filteredPlants.length === 0) && (_jsx("p", { className: "text-muted-foreground text-sm", children: "No hay datos para la planta seleccionada." }))] })] })] })] }));
};
export default Dashboard;
