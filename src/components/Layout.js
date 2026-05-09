import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { LayoutDashboard, Factory, Briefcase, ClipboardCheck, BarChart3, ShieldAlert, FileOutput, Settings, Receipt, Bell, Truck, CloudRain, BarChart4, Menu, X, Smartphone, Monitor } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs) {
    return twMerge(clsx(inputs));
}
const pageMeta = {
    dashboard: { title: 'Panel Operativo', description: 'Monitoreo de costos y rentabilidad en tiempo real' },
    plants: { title: 'Gestión de Plantas', description: 'Administración de plantas de hormigón y parámetros operativos' },
    projects: { title: 'Gestión de Proyectos', description: 'Planificación, presupuestos y seguimiento de obras' },
    presupuestos: { title: 'Presupuestos y Cotizaciones', description: 'Armado de presupuestos con materiales, MO, equipos e impuestos' },
    quality: { title: 'Control de Calidad', description: 'Resistencia, slump, muestras y rechazos de hormigón' },
    alerts: { title: 'Alertas y Umbrales', description: 'Configuración de umbrales y monitoreo de alertas del sistema' },
    mixers: { title: 'Flota de Mixers', description: 'Seguimiento de camiones, tiempos de ciclo y hormigón perdido' },
    weather: { title: 'Clima y Lluvias', description: 'Registro de días de lluvia e impacto en la producción' },
    comparativa: { title: 'Comparativa de Plantas', description: 'Tabla comparativa de indicadores entre plantas' },
    projections: { title: 'Proyecciones Financieras', description: 'Flujo de caja, punto de equilibrio y escenarios' },
    risks: { title: 'Análisis de Riesgos', description: 'Simulación Monte Carlo y análisis de sensibilidad' },
    reports: { title: 'Reportes y Exportación', description: 'Importación y exportación de datos (CSV, Excel, PDF)' },
    settings: { title: 'Configuración del Sistema', description: 'Ajustes generales y parámetros financieros' },
};
const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
    { icon: Factory, label: 'Plantas', page: 'plants' },
    { icon: Briefcase, label: 'Proyectos', page: 'projects' },
    { icon: Receipt, label: 'Presupuestos', page: 'presupuestos' },
    { icon: ClipboardCheck, label: 'Calidad', page: 'quality' },
    { icon: Bell, label: 'Alertas', page: 'alerts' },
    { icon: Truck, label: 'Mixers', page: 'mixers' },
    { icon: CloudRain, label: 'Clima', page: 'weather' },
    { icon: BarChart4, label: 'Comparativa', page: 'comparativa' },
    { icon: BarChart3, label: 'Proyecciones', page: 'projections' },
    { icon: ShieldAlert, label: 'Riesgos', page: 'risks' },
    { icon: FileOutput, label: 'Reportes', page: 'reports' },
];
const Layout = ({ children, currentPage, onNavigate }) => {
    const [mobilePreview, setMobilePreview] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const meta = pageMeta[currentPage] ?? pageMeta.dashboard;
    const sidebar = (_jsxs("aside", { className: cn("w-64 border-r border-border bg-card/30 backdrop-blur-xl flex flex-col shrink-0", mobilePreview && "fixed inset-y-0 left-0 z-50 bg-card shadow-2xl transition-transform duration-300", mobilePreview && !sidebarOpen && "-translate-x-full"), children: [_jsxs("div", { className: "p-6 flex items-center justify-between", children: [_jsx("h1", { className: "text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent", children: "GRUPO FALPAT" }), mobilePreview && (_jsx("button", { onClick: () => setSidebarOpen(false), className: "p-1 rounded-lg hover:bg-primary/10 transition-colors", children: _jsx(X, { className: "w-5 h-5" }) }))] }), _jsx("nav", { className: "flex-1 px-4 space-y-2 overflow-y-auto", children: navItems.map((item) => {
                    const isActive = currentPage === item.page;
                    return (_jsxs("button", { onClick: () => { onNavigate(item.page); if (mobilePreview)
                            setSidebarOpen(false); }, className: cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left", isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'), children: [_jsx(item.icon, { className: cn("w-5 h-5 shrink-0", isActive ? 'text-primary' : 'text-muted-foreground') }), _jsx("span", { className: "font-medium truncate", children: item.label })] }, item.label));
                }) }), _jsx("div", { className: "p-4 border-t border-border", children: _jsxs("button", { onClick: () => { onNavigate('settings'); if (mobilePreview)
                        setSidebarOpen(false); }, className: cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all", currentPage === 'settings' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'), children: [_jsx(Settings, { className: cn("w-5 h-5 shrink-0", currentPage === 'settings' ? 'text-primary' : 'text-muted-foreground') }), _jsx("span", { className: "font-medium", children: "Configuraci\u00F3n" })] }) })] }));
    return (_jsxs("div", { className: "h-screen bg-background text-foreground overflow-hidden flex", children: [_jsx("div", { className: cn(mobilePreview && "hidden"), children: sidebar }), mobilePreview && (_jsxs(_Fragment, { children: [sidebarOpen && _jsx("div", { className: "fixed inset-0 bg-black/50 z-40", onClick: () => setSidebarOpen(false) }), sidebar] })), _jsxs("main", { className: cn("flex-1 overflow-y-auto neo-gradient", mobilePreview ? "max-w-[430px] mx-auto mobile-preview" : "", mobilePreview ? "p-3" : "p-8"), children: [_jsxs("header", { className: cn("flex items-center gap-3 mb-6", mobilePreview ? "flex-wrap" : "justify-between"), children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0 flex-1", children: [mobilePreview && (_jsx("button", { onClick: () => setSidebarOpen(true), className: "p-2 rounded-lg hover:bg-primary/10 transition-colors shrink-0", children: _jsx(Menu, { className: "w-5 h-5" }) })), _jsxs("div", { className: "min-w-0", children: [_jsx("h2", { className: cn("font-bold tracking-tight", mobilePreview ? "text-lg" : "text-2xl"), children: meta.title }), _jsx("p", { className: "text-muted-foreground text-sm truncate", children: meta.description })] })] }), _jsx("div", { className: cn("flex items-center gap-2", mobilePreview && "w-full justify-end"), children: _jsxs("button", { onClick: () => setMobilePreview(!mobilePreview), className: cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shrink-0", mobilePreview
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-card text-muted-foreground border-border hover:text-foreground'), title: mobilePreview ? 'Cambiar a vista PC' : 'Vista previa móvil', children: [mobilePreview ? _jsx(Smartphone, { className: "w-3.5 h-3.5" }) : _jsx(Monitor, { className: "w-3.5 h-3.5" }), _jsx("span", { className: "hidden sm:inline", children: mobilePreview ? 'Vista Móvil' : 'Vista PC' })] }) })] }), children] })] }));
};
export default Layout;
