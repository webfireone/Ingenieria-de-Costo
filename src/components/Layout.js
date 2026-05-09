import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LayoutDashboard, Factory, Briefcase, BarChart3, ShieldAlert, FileOutput, Settings } from 'lucide-react';
const Layout = ({ children }) => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '#' },
        { icon: Factory, label: 'Plantas', path: '#' },
        { icon: Briefcase, label: 'Proyectos', path: '#' },
        { icon: BarChart3, label: 'Proyecciones', path: '#' },
        { icon: ShieldAlert, label: 'Riesgos', path: '#' },
        { icon: FileOutput, label: 'Reportes', path: '#' },
    ];
    return (_jsxs("div", { className: "flex h-screen bg-background text-foreground overflow-hidden", children: [_jsxs("aside", { className: "w-64 border-r border-border bg-card/30 backdrop-blur-xl flex flex-col", children: [_jsx("div", { className: "p-6", children: _jsx("h1", { className: "text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent", children: "ConcreteEng PRO" }) }), _jsx("nav", { className: "flex-1 px-4 space-y-2", children: navItems.map((item) => (_jsxs("a", { href: item.path, className: "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-all group", children: [_jsx(item.icon, { className: "w-5 h-5 text-muted-foreground group-hover:text-primary" }), _jsx("span", { className: "font-medium", children: item.label })] }, item.label))) }), _jsx("div", { className: "p-4 border-t border-border", children: _jsxs("button", { className: "flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all", children: [_jsx(Settings, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: "Configuraci\u00F3n" })] }) })] }), _jsxs("main", { className: "flex-1 overflow-y-auto p-8 neo-gradient", children: [_jsxs("header", { className: "flex justify-between items-center mb-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold tracking-tight", children: "An\u00E1lisis Operativo" }), _jsx("p", { className: "text-muted-foreground", children: "Monitoreo de costos y rentabilidad en tiempo real" })] }), _jsx("div", { className: "flex gap-4", children: _jsxs("div", { className: "px-4 py-2 bg-card rounded-md border border-border flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-green-500 animate-pulse" }), _jsx("span", { className: "text-sm font-medium", children: "Sincronizado con Firebase" })] }) })] }), children] })] }));
};
export default Layout;
