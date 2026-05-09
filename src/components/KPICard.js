import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs) {
    return twMerge(clsx(inputs));
}
const KPICard = ({ title, value, icon: Icon, trend, description, className }) => {
    return (_jsx("div", { className: cn("card-3d group relative", className), children: _jsxs("div", { className: "card-3d-inner glass-card p-5 rounded-2xl space-y-4 h-full relative overflow-hidden", children: [_jsx("div", { className: "absolute -inset-full top-0 left-0 w-full h-full bg-gradient-to-tr from-primary/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" }), _jsxs("div", { className: "flex justify-between items-start relative z-10", children: [_jsx("div", { className: "p-2.5 rounded-xl bg-gradient-to-br from-primary/15 to-violet-500/10 border border-primary/10 group-hover:border-primary/20 transition-all duration-300", children: _jsx(Icon, { className: "w-5 h-5 text-primary group-hover:text-primary transition-colors" }) }), trend && (_jsx("div", { className: cn("text-xs font-bold px-2.5 py-1 rounded-full border transition-all duration-300 group-hover:scale-105", trend.isUp
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/15"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20 group-hover:bg-rose-500/15"), children: _jsxs("span", { className: trend.isUp ? "text-gradient-emerald" : "text-gradient-rose", children: [trend.isUp ? "+" : "-", trend.value, "%"] }) }))] }), _jsxs("div", { className: "relative z-10", children: [_jsx("p", { className: "text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1", children: title }), _jsx("h3", { className: "text-2xl font-heading font-extrabold tracking-tight text-white group-hover:text-gradient transition-all duration-300", children: _jsx("span", { className: "stat-value", children: value }) })] }), description && (_jsxs("p", { className: "text-xs text-muted-foreground/80 relative z-10 flex items-center gap-1.5", children: [_jsx("span", { className: "w-1 h-1 rounded-full bg-primary/50" }), description] })), _jsx("div", { className: "absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-primary/0 via-primary/20 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-all duration-500" })] }) }));
};
export default KPICard;
export { cn };
