import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Settings as SettingsIcon, DollarSign, Percent, Globe, Save } from 'lucide-react';
const defaultSettings = {
    discountRate: 12,
    inflationRate: 3.5,
    taxRate: 25,
    fuelCost: 1.45,
    currency: 'USD',
};
const SettingsPage = () => {
    const [form, setForm] = useState(() => {
        const saved = localStorage.getItem('app_settings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    });
    const [saved, setSaved] = useState(false);
    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };
    const handleSave = () => {
        localStorage.setItem('app_settings', JSON.stringify(form));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };
    return (_jsx(_Fragment, { children: _jsx("div", { className: "max-w-2xl", children: _jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsxs("h3", { className: "font-bold text-lg mb-6 flex items-center gap-2", children: [_jsx(SettingsIcon, { className: "w-5 h-5 text-primary" }), " Par\u00E1metros Generales"] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "flex items-center gap-2 text-sm font-medium mb-2", children: [_jsx(Percent, { className: "w-4 h-4 text-muted-foreground" }), " Tasa de Descuento Anual"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "range", min: "0", max: "30", step: "0.5", value: form.discountRate, onChange: (e) => handleChange('discountRate', parseFloat(e.target.value)), className: "flex-1 accent-primary" }), _jsxs("span", { className: "text-lg font-bold w-16 text-right", children: [form.discountRate, "%"] })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "flex items-center gap-2 text-sm font-medium mb-2", children: [_jsx(Percent, { className: "w-4 h-4 text-muted-foreground" }), " Tasa de Inflaci\u00F3n Anual"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "range", min: "0", max: "20", step: "0.5", value: form.inflationRate, onChange: (e) => handleChange('inflationRate', parseFloat(e.target.value)), className: "flex-1 accent-primary" }), _jsxs("span", { className: "text-lg font-bold w-16 text-right", children: [form.inflationRate, "%"] })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "flex items-center gap-2 text-sm font-medium mb-2", children: [_jsx(Percent, { className: "w-4 h-4 text-muted-foreground" }), " Tasa Impositiva"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "range", min: "0", max: "50", step: "1", value: form.taxRate, onChange: (e) => handleChange('taxRate', parseFloat(e.target.value)), className: "flex-1 accent-primary" }), _jsxs("span", { className: "text-lg font-bold w-16 text-right", children: [form.taxRate, "%"] })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "flex items-center gap-2 text-sm font-medium mb-2", children: [_jsx(DollarSign, { className: "w-4 h-4 text-muted-foreground" }), " Costo de Combustible (por litro)"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "range", min: "0.5", max: "3", step: "0.05", value: form.fuelCost, onChange: (e) => handleChange('fuelCost', parseFloat(e.target.value)), className: "flex-1 accent-primary" }), _jsxs("span", { className: "text-lg font-bold w-16 text-right", children: ["$", form.fuelCost.toFixed(2)] })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "flex items-center gap-2 text-sm font-medium mb-2", children: [_jsx(Globe, { className: "w-4 h-4 text-muted-foreground" }), " Moneda"] }), _jsxs("select", { value: form.currency, onChange: (e) => handleChange('currency', e.target.value), className: "bg-background border border-border rounded-lg px-4 py-2 text-sm w-full", children: [_jsx("option", { value: "USD", children: "USD - D\u00F3lar Americano" }), _jsx("option", { value: "ARS", children: "ARS - Peso Argentino" }), _jsx("option", { value: "MXN", children: "MXN - Peso Mexicano" }), _jsx("option", { value: "CLP", children: "CLP - Peso Chileno" }), _jsx("option", { value: "COP", children: "COP - Peso Colombiano" }), _jsx("option", { value: "PEN", children: "PEN - Sol Peruano" })] })] }), _jsxs("button", { onClick: handleSave, className: "flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:scale-105 transition-all", children: [_jsx(Save, { className: "w-4 h-4" }), " ", saved ? 'Guardado ✓' : 'Guardar Configuración'] })] })] }) }) }));
};
export default SettingsPage;
