import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs) {
    return twMerge(clsx(inputs));
}
const KPICard = ({ title, value, icon: Icon, trend, description, className }) => {
    return (_jsxs("div", { className: cn("glass-card p-6 rounded-xl space-y-4 hover:border-primary/30 transition-colors", className), children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsx("div", { className: "p-2 bg-primary/10 rounded-lg", children: _jsx(Icon, { className: "w-6 h-6 text-primary" }) }), trend && (_jsxs("div", { className: cn("text-xs font-medium px-2 py-1 rounded-full", trend.isUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"), children: [trend.isUp ? "+" : "-", trend.value, "%"] }))] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground font-medium", children: title }), _jsx("h3", { className: "text-2xl font-bold tracking-tight", children: value })] }), description && (_jsx("p", { className: "text-xs text-muted-foreground", children: description }))] }));
};
export default KPICard;
export { cn };
