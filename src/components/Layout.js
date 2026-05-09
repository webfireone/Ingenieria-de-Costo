import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LayoutDashboard, Factory, Briefcase, ClipboardCheck, BarChart3, ShieldAlert, FileOutput, Settings, Receipt, Bell } from 'lucide-react';
const pageMeta = {
    dashboard: { title: 'Panel Operativo', description: 'Monitoreo de costos y rentabilidad en tiempo real' },
    plants: { title: 'Gestión de Plantas', description: 'Administración de plantas de hormigón y parámetros operativos' },
    projects: { title: 'Gestión de Proyectos', description: 'Planificación, presupuestos y seguimiento de obras' },
    presupuestos: { title: 'Presupuestos y Cotizaciones', description: 'Armado de presupuestos con materiales, MO, equipos e impuestos' },
    quality: { title: 'Control de Calidad', description: 'Resistencia, slump, muestras y rechazos de hormigón' },
    alerts: { title: 'Alertas y Umbrales', description: 'Configuración de umbrales y monitoreo de alertas del sistema' },
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
    { icon: BarChart3, label: 'Proyecciones', page: 'projections' },
    { icon: ShieldAlert, label: 'Riesgos', page: 'risks' },
    { icon: FileOutput, label: 'Reportes', page: 'reports' },
];
const Layout = ({ children, currentPage, onNavigate }) => {
    const meta = pageMeta[currentPage] ?? pageMeta.dashboard;
    return (_jsxs("div", { className: "flex h-screen bg-background text-foreground overflow-hidden", children: [_jsxs("aside", { className: "w-64 border-r border-border bg-card/30 backdrop-blur-xl flex flex-col", children: [_jsx("div", { className: "p-6", children: _jsx("h1", { className: "text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent", children: "ConcreteEng PRO" }) }), _jsx("nav", { className: "flex-1 px-4 space-y-2", children: navItems.map((item) => {
                            const isActive = currentPage === item.page;
                            return (_jsxs("button", { onClick: () => onNavigate(item.page), className: `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-primary/15 text-primary'
                                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'}`, children: [_jsx(item.icon, { className: `w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}` }), _jsx("span", { className: "font-medium", children: item.label })] }, item.label));
                        }) }), _jsx("div", { className: "p-4 border-t border-border", children: _jsxs("button", { onClick: () => onNavigate('settings'), className: `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentPage === 'settings'
                                ? 'bg-primary/15 text-primary'
                                : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'}`, children: [_jsx(Settings, { className: `w-5 h-5 ${currentPage === 'settings' ? 'text-primary' : 'text-muted-foreground'}` }), _jsx("span", { className: "font-medium", children: "Configuraci\u00F3n" })] }) })] }), _jsxs("main", { className: "flex-1 overflow-y-auto p-8 neo-gradient", children: [_jsxs("header", { className: "flex justify-between items-center mb-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold tracking-tight", children: meta.title }), _jsx("p", { className: "text-muted-foreground", children: meta.description })] }), _jsx("div", { className: "flex gap-4", children: _jsxs("div", { className: "px-4 py-2 bg-card rounded-md border border-border flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-green-500 animate-pulse" }), _jsx("span", { className: "text-sm font-medium", children: "Sincronizado con Firebase" })] }) })] }), children] })] }));
};
export default Layout;
