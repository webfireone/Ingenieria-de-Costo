import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, Settings, SlidersHorizontal, Weight, Gauge, DollarSign, Factory, BarChart3, RefreshCw } from 'lucide-react';
import KPICard from '../components/KPICard';
import { useFirestoreCollection } from '../hooks/useFirestore';
const defaultConfig = {
    priceVariation: 10,
    slumpDeviation: 3,
    resistanceDeviation: 5,
    minOEE: 75,
    minProduction: 3000,
};
const defaultAlerts = [
    { id: 'A-001', type: 'critica', title: 'Variación de Precio: Cemento Portland', description: 'Incremento del 15% detectado en {plant-north}', source: 'Insumos', plantId: 'plant-north', date: '2026-05-08', history: [] },
    { id: 'A-002', type: 'advertencia', title: 'OEE por debajo del umbral', description: '{plant-south} registra 72% de OEE (mínimo: 75%)', source: 'Eficiencia', plantId: 'plant-south', date: '2026-05-07', history: [] },
    { id: 'A-003', type: 'advertencia', title: 'Desviación de Slump en muestra', description: 'Muestra M-004: slump 18cm (objetivo: 12cm)', source: 'Calidad', date: '2026-05-06', history: [] },
    { id: 'A-004', type: 'info', title: 'Mantenimiento preventivo programado', description: '{plant-north} - Cambio de mezclador (22 de mayo)', source: 'Mantenimiento', plantId: 'plant-north', date: '2026-05-05', history: [] },
    { id: 'A-005', type: 'critica', title: 'Resistencia 28d por debajo de especificación', description: 'Muestra M-004: 27.1 MPa (objetivo: 30 MPa)', source: 'Calidad', date: '2026-05-04', history: [{ action: 'resolved', at: '09/05/2026 10:30:00' }] },
    { id: 'A-006', type: 'info', title: 'Producción mensual estable', description: '4,250 m³ producidos en el mes', source: 'Producción', date: '2026-05-03', history: [{ action: 'resolved', at: '09/05/2026 11:00:00' }] },
];
function deriveState(a) {
    const h = a.history ?? [];
    if (h.length === 0)
        return { resolved: false, resolvedAt: undefined, cycleCount: 0 };
    const last = h[h.length - 1];
    const resolved = last.action === 'resolved';
    const resolvedAt = resolved ? last.at : undefined;
    const cycleCount = h.filter(h => h.action === 'reactivated').length;
    return { resolved, resolvedAt, cycleCount };
}
const fmtDatetime = () => new Date().toLocaleString('es-AR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
});
const Alerts = () => {
    const { data: plants } = useFirestoreCollection('plants');
    const [config, setConfig] = useState(() => {
        const saved = localStorage.getItem('alert_config');
        return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
    });
    const [alerts, setAlerts] = useState(() => {
        try {
            const saved = localStorage.getItem('alert_data');
            if (!saved)
                return defaultAlerts;
            const parsed = JSON.parse(saved);
            if (!Array.isArray(parsed))
                return defaultAlerts;
            const migrated = parsed.map((a) => {
                if (!a.history && 'resolved' in a) {
                    const hadHistory = a.resolved || a.resolvedAt;
                    return {
                        id: a.id, type: a.type, title: a.title,
                        description: a.description, source: a.source, plantId: a.plantId, date: a.date,
                        history: hadHistory ? [{ action: 'resolved', at: a.resolvedAt || 'desconocido' }] : [],
                    };
                }
                return { ...a, history: a.history ?? [] };
            });
            return migrated;
        }
        catch {
            return defaultAlerts;
        }
    });
    const [showResolved, setShowResolved] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [activeTab, setActiveTab] = useState('registro');
    const plantMap = useMemo(() => {
        if (!plants)
            return {};
        return Object.fromEntries(plants.map(p => [p.id, p.name]));
    }, [plants]);
    const enrichedAlerts = useMemo(() => alerts.map(a => ({
        ...a,
        description: a.description.replace(/\{([^}]+)\}/g, (_, id) => plantMap[id] ?? id),
        ...deriveState(a),
    })), [alerts, plantMap]);
    useEffect(() => {
        localStorage.setItem('alert_config', JSON.stringify(config));
    }, [config]);
    useEffect(() => {
        localStorage.setItem('alert_data', JSON.stringify(alerts));
    }, [alerts]);
    const activeAlerts = enrichedAlerts.filter((a) => !a.resolved);
    const critical = activeAlerts.filter((a) => a.type === 'critica').length;
    const warnings = activeAlerts.filter((a) => a.type === 'advertencia').length;
    const infoCount = activeAlerts.filter((a) => a.type === 'info').length;
    const resolvedCount = enrichedAlerts.filter((a) => a.resolved).length;
    const resolveAlert = (id) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, history: [...a.history, { action: 'resolved', at: fmtDatetime() }] } : a));
    };
    const reactivateAlert = (id) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, history: [...a.history, { action: 'reactivated', at: fmtDatetime() }] } : a));
    };
    const displayAlerts = showResolved ? enrichedAlerts : activeAlerts;
    const stats = useMemo(() => {
        const byTitle = {};
        const bySource = {};
        const byPlant = {};
        enrichedAlerts.forEach((a) => {
            if (!byTitle[a.title])
                byTitle[a.title] = { count: 0, recurring: 0, alerts: [] };
            byTitle[a.title].count++;
            byTitle[a.title].alerts.push(a);
            if (a.cycleCount > 0)
                byTitle[a.title].recurring++;
            bySource[a.source] = (bySource[a.source] || 0) + 1;
            const pid = a.plantId;
            if (pid) {
                byPlant[pid] = (byPlant[pid] || 0) + 1;
            }
        });
        const topAlerts = Object.entries(byTitle)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10);
        const recurringAlerts = Object.entries(byTitle)
            .filter(([_, v]) => v.recurring > 0)
            .sort((a, b) => b[1].recurring - a[1].recurring);
        return { topAlerts, bySource, byPlant, recurringAlerts };
    }, [enrichedAlerts]);
    const typeIcon = { critica: AlertCircle, advertencia: AlertTriangle, info: Info };
    const typeColor = { critica: 'text-red-500 bg-red-500/10 border-red-500/20', advertencia: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', info: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
    const totalAlerts = enrichedAlerts.length;
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsx(KPICard, { title: "Alertas Activas", value: activeAlerts.length, icon: Bell }), _jsx(KPICard, { title: "Cr\u00EDticas", value: critical, icon: AlertTriangle, trend: critical > 0 ? { value: critical, isUp: false } : undefined, description: "Requieren atenci\u00F3n inmediata" }), _jsx(KPICard, { title: "Advertencias", value: warnings, icon: AlertCircle, description: "Monitoreo recomendado" }), _jsx(KPICard, { title: "Resueltas", value: resolvedCount, icon: CheckCircle2, description: "Total resueltas" })] }), _jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setActiveTab('registro'), className: `px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'registro' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`, children: "Registro" }), _jsx("button", { onClick: () => setActiveTab('stats'), className: `px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'stats' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`, children: "Estad\u00EDsticas" })] }), _jsxs("button", { onClick: () => setShowConfig(!showConfig), className: "flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-bold hover:bg-primary/10 transition-all", children: [_jsx(SlidersHorizontal, { className: "w-4 h-4" }), " Umbrales"] })] }), showConfig && (_jsxs("div", { className: "glass-card p-6 rounded-xl mb-6", children: [_jsxs("h3", { className: "font-heading font-bold text-lg mb-4 flex items-center gap-2 text-gradient", children: [_jsx(Settings, { className: "w-5 h-5" }), " Configuraci\u00F3n de Umbrales de Alerta"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "flex items-center gap-2 text-sm font-medium mb-2", children: [_jsx(DollarSign, { className: "w-4 h-4 text-muted-foreground" }), " Variaci\u00F3n de Precio M\u00E1x."] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "range", min: "5", max: "30", step: "1", value: config.priceVariation, onChange: e => setConfig(c => ({ ...c, priceVariation: Number(e.target.value) })), className: "flex-1 accent-primary" }), _jsxs("span", { className: "text-lg font-bold w-12 text-right", children: [config.priceVariation, "%"] })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "flex items-center gap-2 text-sm font-medium mb-2", children: [_jsx(Weight, { className: "w-4 h-4 text-muted-foreground" }), " Desviaci\u00F3n de Slump M\u00E1x."] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "range", min: "1", max: "8", step: "0.5", value: config.slumpDeviation, onChange: e => setConfig(c => ({ ...c, slumpDeviation: Number(e.target.value) })), className: "flex-1 accent-primary" }), _jsxs("span", { className: "text-lg font-bold w-12 text-right", children: [config.slumpDeviation, " cm"] })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "flex items-center gap-2 text-sm font-medium mb-2", children: [_jsx(Weight, { className: "w-4 h-4 text-muted-foreground" }), " Desviaci\u00F3n de Resistencia M\u00E1x."] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "range", min: "1", max: "15", step: "0.5", value: config.resistanceDeviation, onChange: e => setConfig(c => ({ ...c, resistanceDeviation: Number(e.target.value) })), className: "flex-1 accent-primary" }), _jsxs("span", { className: "text-lg font-bold w-12 text-right", children: [config.resistanceDeviation, " MPa"] })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "flex items-center gap-2 text-sm font-medium mb-2", children: [_jsx(Gauge, { className: "w-4 h-4 text-muted-foreground" }), " OEE M\u00EDnimo"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "range", min: "50", max: "95", step: "1", value: config.minOEE, onChange: e => setConfig(c => ({ ...c, minOEE: Number(e.target.value) })), className: "flex-1 accent-primary" }), _jsxs("span", { className: "text-lg font-bold w-12 text-right", children: [config.minOEE, "%"] })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "flex items-center gap-2 text-sm font-medium mb-2", children: [_jsx(Factory, { className: "w-4 h-4 text-muted-foreground" }), " Producci\u00F3n M\u00EDnima (m\u00B3/mes)"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "range", min: "1000", max: "8000", step: "100", value: config.minProduction, onChange: e => setConfig(c => ({ ...c, minProduction: Number(e.target.value) })), className: "flex-1 accent-primary" }), _jsx("span", { className: "text-lg font-bold w-20 text-right", children: config.minProduction.toLocaleString() })] })] })] })] })), activeTab === 'stats' ? (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsxs("h3", { className: "font-heading font-bold text-lg mb-4 flex items-center gap-2 text-gradient", children: [_jsx(BarChart3, { className: "w-5 h-5" }), " Alertas m\u00E1s frecuentes"] }), _jsxs("div", { className: "space-y-3", children: [stats.topAlerts.length === 0 && _jsx("p", { className: "text-muted-foreground text-sm", children: "Sin datos." }), stats.topAlerts.map(([title, data]) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-card border border-border rounded-lg", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium truncate", children: title }), _jsx("p", { className: "text-xs text-muted-foreground", children: data.alerts[0].source })] }), _jsxs("div", { className: "flex items-center gap-4 text-right", children: [_jsxs("div", { children: [_jsx("span", { className: "text-lg font-bold text-primary", children: data.count }), _jsx("p", { className: "text-xs text-muted-foreground", children: "total" })] }), data.recurring > 0 && (_jsxs("div", { children: [_jsx("span", { className: "text-lg font-bold text-yellow-500", children: data.recurring }), _jsx("p", { className: "text-xs text-muted-foreground", children: "reincidentes" })] }))] })] }, title)))] })] }), _jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsxs("h3", { className: "font-heading font-bold text-lg mb-4 flex items-center gap-2 text-gradient", children: [_jsx(RefreshCw, { className: "w-5 h-5" }), " Alertas reincidentes"] }), stats.recurringAlerts.length === 0 ? (_jsx("p", { className: "text-muted-foreground text-sm", children: "No hay alertas reincidentes." })) : (_jsx("div", { className: "space-y-3", children: stats.recurringAlerts.map(([title, data]) => (_jsxs("div", { className: "p-3 bg-card border border-border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("p", { className: "text-sm font-medium", children: title }), _jsxs("span", { className: "text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full", children: [data.recurring, " ciclos"] })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: data.alerts.filter((a) => a.plantId).map((a) => (_jsx("span", { className: "text-xs text-muted-foreground bg-background px-2 py-0.5 rounded", children: plantMap[a.plantId] ?? a.plantId }, a.id))) })] }, title))) }))] }), _jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-heading font-bold text-lg mb-4 text-gradient", children: "Alertas por Fuente" }), _jsx("div", { className: "space-y-2", children: Object.entries(stats.bySource)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([source, count]) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-card border border-border rounded-lg", children: [_jsx("span", { className: "text-sm", children: source }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "h-2 rounded-full bg-primary", style: { width: `${(count / totalAlerts) * 100}px`, maxWidth: '120px' } }), _jsx("span", { className: "text-sm font-bold w-8 text-right", children: count })] })] }, source))) })] }), _jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsx("h3", { className: "font-heading font-bold text-lg mb-4 text-gradient", children: "Alertas por Planta" }), _jsxs("div", { className: "space-y-2", children: [Object.entries(stats.byPlant)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([pid, count]) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-card border border-border rounded-lg", children: [_jsx("span", { className: "text-sm", children: plantMap[pid] ?? pid }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "h-2 rounded-full bg-primary", style: { width: `${(count / totalAlerts) * 100}px`, maxWidth: '120px' } }), _jsx("span", { className: "text-sm font-bold w-8 text-right", children: count })] })] }, pid))), Object.keys(stats.byPlant).length === 0 && _jsx("p", { className: "text-muted-foreground text-sm", children: "Sin datos de planta." })] })] })] })) : (_jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsxs("h3", { className: "font-heading font-bold text-lg flex items-center gap-2 text-gradient", children: [_jsx(Bell, { className: "w-5 h-5" }), " Registro de Alertas"] }), _jsxs("div", { className: "flex bg-background border border-border rounded-lg p-1", children: [_jsx("button", { onClick: () => setShowResolved(false), className: `px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!showResolved ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`, children: "Activas" }), _jsx("button", { onClick: () => setShowResolved(true), className: `px-3 py-1.5 rounded-md text-xs font-bold transition-all ${showResolved ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`, children: "Todas" })] })] }), _jsxs("div", { className: "space-y-3", children: [displayAlerts.length === 0 && (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: ["No hay alertas ", !showResolved && 'activas', ". \u00A1Todo en orden!"] })), displayAlerts.map((alert) => {
                                const a = alert;
                                const Icon = typeIcon[a.type];
                                return (_jsxs("div", { className: `flex items-start justify-between p-4 rounded-xl border ${a.resolved ? 'bg-card/50 border-border/50 opacity-60' : typeColor[a.type]}`, children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx(Icon, { className: `w-5 h-5 mt-0.5 ${a.resolved ? 'text-muted-foreground' : ''}` }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("p", { className: "font-medium", children: a.title }), _jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-bold ${a.type === 'critica' ? 'bg-red-500/10 text-red-500' : a.type === 'advertencia' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`, children: a.type.charAt(0).toUpperCase() + a.type.slice(1) }), a.cycleCount > 0 && (_jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full font-bold bg-yellow-500/10 text-yellow-500", children: [a.cycleCount, "x reincidente"] }))] }), _jsx("p", { className: "text-sm text-muted-foreground", children: a.description }), _jsxs("div", { className: "flex items-center gap-3 mt-2 text-xs text-muted-foreground", children: [_jsx("span", { children: a.source }), _jsxs("span", { children: ["Inicio: ", a.date] }), a.resolvedAt && _jsxs("span", { children: ["Solucionado: ", a.resolvedAt] }), _jsx("span", { className: "font-mono", children: a.id })] }), a.history.length > 1 && (_jsxs("details", { className: "mt-1", children: [_jsxs("summary", { className: "text-xs text-muted-foreground cursor-pointer hover:text-foreground", children: ["Historial (", a.history.length, " eventos)"] }), _jsx("div", { className: "mt-1 space-y-0.5", children: a.history.map((h, i) => (_jsxs("p", { className: `text-xs ${h.action === 'resolved' ? 'text-green-500' : 'text-yellow-500'}`, children: [h.action === 'resolved' ? 'Resuelto' : 'Reactivado', " \u2014 ", h.at] }, i))) })] }))] })] }), !a.resolved ? (_jsxs("button", { onClick: () => resolveAlert(a.id), className: "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all whitespace-nowrap", children: [_jsx(CheckCircle2, { className: "w-3 h-3" }), " Resolver"] })) : (_jsxs("button", { onClick: () => reactivateAlert(a.id), className: "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-all whitespace-nowrap", children: [_jsx(AlertTriangle, { className: "w-3 h-3" }), " Reactivar"] }))] }, a.id));
                            })] })] }))] }));
};
export default Alerts;
