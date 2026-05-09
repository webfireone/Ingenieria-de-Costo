import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { FileText, Plus, Pen, Trash2, Calculator, DollarSign, Percent, Receipt, Download } from 'lucide-react';
import KPICard from '../components/KPICard';
import Modal from '../components/Modal';
import { exportToPDF } from '../services/importExport';
import { useFirestoreCollection } from '../hooks/useFirestore';
const defaultItems = [
    { id: '1', category: 'Hormigón', description: 'Hormigón H-30 (incl. bombeo)', unit: 'm³', quantity: 1200, unitPrice: 145 },
    { id: '2', category: 'Acero', description: 'Acero de refuerzo ADN 420', unit: 'ton', quantity: 85, unitPrice: 1200 },
    { id: '3', category: 'Encofrado', description: 'Encofrado metálico (alquiler)', unit: 'm²', quantity: 2500, unitPrice: 18 },
    { id: '4', category: 'Mano de Obra', description: 'Cuadrilla de hormigonado', unit: 'jornal', quantity: 180, unitPrice: 320 },
    { id: '5', category: 'Maquinaria', description: 'Grúa torre + mixer', unit: 'mes', quantity: 6, unitPrice: 8500 },
    { id: '6', category: 'Dirección Técnica', description: 'Ingeniero residente + topografía', unit: 'mes', quantity: 8, unitPrice: 4500 },
    { id: '7', category: 'Transporte', description: 'Flete de materiales', unit: 'viaje', quantity: 90, unitPrice: 280 },
];
const Presupuestos = () => {
    const { data: plants } = useFirestoreCollection('plants');
    const [budgets, setBudgets] = useState([
        { id: 'BGT-001', name: 'Presupuesto Skyline Towers', project: 'Skyline Towers', plantId: 'plant-north', client: 'Constructora del Norte S.A.', date: '2026-04-01', items: [...defaultItems], taxRate: 21, contingencyRate: 5 },
        { id: 'BGT-002', name: 'Presupuesto Puente Interurbano', project: 'Puente Interurbano', plantId: 'plant-north', client: 'Gobierno Provincial', date: '2026-03-15', items: defaultItems.map(i => ({ ...i, quantity: i.quantity * 0.7, unitPrice: i.unitPrice * 1.1 })), taxRate: 21, contingencyRate: 8 },
    ]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', project: '', plantId: '', client: '', date: new Date().toISOString().slice(0, 10), items: [...defaultItems], taxRate: 21, contingencyRate: 5 });
    const calcSubtotal = (items) => items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const calcTotal = (b) => {
        const sub = calcSubtotal(b.items);
        return sub + sub * (b.taxRate + b.contingencyRate) / 100;
    };
    const openCreate = () => {
        setForm({ name: '', project: '', plantId: '', client: '', date: new Date().toISOString().slice(0, 10), items: [...defaultItems], taxRate: 21, contingencyRate: 5 });
        setEditingId(null);
        setModalOpen(true);
    };
    const openEdit = (b) => {
        setForm({ name: b.name, project: b.project, plantId: b.plantId, client: b.client, date: b.date, items: b.items, taxRate: b.taxRate, contingencyRate: b.contingencyRate });
        setEditingId(b.id);
        setModalOpen(true);
    };
    const handleSave = () => {
        if (!form.name)
            return;
        if (editingId) {
            setBudgets(prev => prev.map(b => b.id === editingId ? { ...b, ...form } : b));
        }
        else {
            setBudgets(prev => [...prev, { id: `BGT-${String(prev.length + 1).padStart(3, '0')}`, ...form }]);
        }
        setModalOpen(false);
    };
    const handleDelete = (id) => {
        if (confirm('¿Eliminar este presupuesto?'))
            setBudgets(prev => prev.filter(b => b.id !== id));
    };
    const updateItem = (idx, field, value) => {
        setForm(f => ({ ...f, items: f.items.map((item, i) => i === idx ? { ...item, [field]: value } : item) }));
    };
    const totalPresupuestado = budgets.reduce((s, b) => s + calcTotal(b), 0);
    const handleExportPDF = (b) => {
        const sub = calcSubtotal(b.items);
        const total = calcTotal(b);
        const headers = [['Partida', 'Descripción', 'Cant.', 'P. Unit.', 'Total']];
        const rows = b.items.map(i => [
            i.category, i.description, `${i.quantity} ${i.unit}`,
            `$${i.unitPrice.toFixed(2)}`, `$${(i.quantity * i.unitPrice).toFixed(2)}`
        ]);
        rows.push(['', '', '', '', '']);
        rows.push(['', '', 'SUBTOTAL', '', `$${sub.toFixed(2)}`]);
        rows.push(['', '', `IVA (${b.taxRate}%)`, '', `$${(sub * b.taxRate / 100).toFixed(2)}`]);
        rows.push(['', '', `Imprevistos (${b.contingencyRate}%)`, '', `$${(sub * b.contingencyRate / 100).toFixed(2)}`]);
        rows.push(['', '', 'TOTAL', '', `$${total.toFixed(2)}`]);
        exportToPDF(`${b.name} - ${b.client}`, headers, rows, b.id);
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsx(KPICard, { title: "Presupuestos", value: budgets.length, icon: FileText }), _jsx(KPICard, { title: "Total Presupuestado", value: `$${(totalPresupuestado / 1000).toFixed(0)}k`, icon: DollarSign, trend: { value: 12, isUp: true }, description: "Suma de todos" }), _jsx(KPICard, { title: "Margen Estimado", value: "22.4%", icon: Percent, trend: { value: 3, isUp: true }, description: "Sobre costo directo" }), _jsx(KPICard, { title: "Cotizaciones Activas", value: budgets.length, icon: Receipt })] }), _jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("h3", { className: "font-heading font-bold text-lg flex items-center gap-2 text-gradient", children: [_jsx(FileText, { className: "w-5 h-5" }), " Presupuestos y Cotizaciones"] }), _jsxs("button", { onClick: openCreate, className: "flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:scale-105 transition-all", children: [_jsx(Plus, { className: "w-4 h-4" }), " Nuevo Presupuesto"] })] }), _jsx("div", { className: "space-y-4", children: budgets.map((b) => {
                            const sub = calcSubtotal(b.items);
                            const total = calcTotal(b);
                            return (_jsxs("div", { className: "p-5 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors", children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h4", { className: "font-bold", children: b.name }), _jsx("span", { className: "text-xs text-muted-foreground bg-background px-2 py-0.5 rounded", children: b.id })] }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [b.client, " \u2014 ", b.project, " ", b.plantId && plants ? `(${plants.find(p => p.id === b.plantId)?.name ?? b.plantId})` : ''] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Total" }), _jsxs("p", { className: "text-lg font-bold text-primary", children: ["$", total.toLocaleString()] })] }), _jsx("button", { onClick: () => handleExportPDF(b), className: "p-2 rounded-lg hover:bg-primary/10 transition-colors", title: "Descargar PDF", children: _jsx(Download, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => openEdit(b), className: "p-2 rounded-lg hover:bg-primary/10 transition-colors", children: _jsx(Pen, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleDelete(b.id), className: "p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-muted-foreground", children: [_jsxs("div", { children: [_jsx("span", { className: "block font-medium text-foreground", children: "Subtotal" }), "$", sub.toLocaleString()] }), _jsxs("div", { children: [_jsxs("span", { className: "block font-medium text-foreground", children: ["IVA (", b.taxRate, "%)"] }), "$", (sub * b.taxRate / 100).toLocaleString()] }), _jsxs("div", { children: [_jsxs("span", { className: "block font-medium text-foreground", children: ["Imprevistos (", b.contingencyRate, "%)"] }), "$", (sub * b.contingencyRate / 100).toLocaleString()] }), _jsxs("div", { children: [_jsx("span", { className: "block font-medium text-foreground", children: "\u00CDtems" }), b.items.length] }), _jsxs("div", { children: [_jsx("span", { className: "block font-medium text-foreground", children: "Fecha" }), b.date] })] })] }, b.id));
                        }) })] }), _jsx(Modal, { title: editingId ? 'Editar Presupuesto' : 'Nuevo Presupuesto', isOpen: modalOpen, onClose: () => setModalOpen(false), children: _jsxs("div", { className: "space-y-4 max-h-[60vh] overflow-y-auto pr-1", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium block mb-1", children: "Nombre" }), _jsx("input", { type: "text", value: form.name, onChange: e => setForm(f => ({ ...f, name: e.target.value })), className: "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm", placeholder: "Ej: Presupuesto..." })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium block mb-1", children: "Proyecto" }), _jsx("input", { type: "text", value: form.project, onChange: e => setForm(f => ({ ...f, project: e.target.value })), className: "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium block mb-1", children: "Cliente" }), _jsx("input", { type: "text", value: form.client, onChange: e => setForm(f => ({ ...f, client: e.target.value })), className: "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium block mb-1", children: "Planta" }), _jsxs("select", { value: form.plantId, onChange: e => setForm(f => ({ ...f, plantId: e.target.value })), className: "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm", children: [_jsx("option", { value: "", children: "Seleccionar planta..." }), plants?.map(p => _jsx("option", { value: p.id, children: p.name }, p.id))] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium block mb-1", children: "Fecha" }), _jsx("input", { type: "date", value: form.date, onChange: e => setForm(f => ({ ...f, date: e.target.value })), className: "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" })] })] }), _jsxs("div", { className: "border-t border-border pt-4", children: [_jsxs("h4", { className: "text-sm font-bold mb-3 flex items-center gap-2", children: [_jsx(Calculator, { className: "w-4 h-4" }), " Partidas del Presupuesto"] }), _jsxs("div", { className: "grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium mb-2 px-1", children: [_jsx("span", { className: "col-span-3", children: "Categor\u00EDa" }), _jsx("span", { className: "col-span-3", children: "Descripci\u00F3n" }), _jsx("span", { className: "col-span-1 text-center", children: "Cant." }), _jsx("span", { className: "col-span-2 text-right", children: "P. Unitario" }), _jsx("span", { className: "col-span-3 text-right", children: "Total" })] }), _jsx("div", { className: "space-y-2", children: form.items.map((item, idx) => (_jsxs("div", { className: "grid grid-cols-12 gap-2 items-center text-xs", children: [_jsx("span", { className: "col-span-3 text-muted-foreground truncate", children: item.category }), _jsx("input", { className: "col-span-3 bg-background border border-border rounded px-2 py-1.5", value: item.description, onChange: e => updateItem(idx, 'description', e.target.value) }), _jsx("input", { type: "number", className: "col-span-1 bg-background border border-border rounded px-2 py-1.5 w-full text-center", value: item.quantity, onChange: e => updateItem(idx, 'quantity', Number(e.target.value)) }), _jsx("input", { type: "number", className: "col-span-2 bg-background border border-border rounded px-2 py-1.5 w-full text-right", value: item.unitPrice, onChange: e => updateItem(idx, 'unitPrice', Number(e.target.value)) }), _jsxs("span", { className: "col-span-3 text-right font-medium", children: ["$", (item.quantity * item.unitPrice).toLocaleString()] })] }, item.id))) })] }), _jsxs("div", { className: "border-t border-border pt-4", children: [_jsxs("div", { className: "flex items-center justify-between text-sm font-medium", children: [_jsx("span", { children: "Subtotal" }), _jsxs("span", { children: ["$", calcSubtotal(form.items).toLocaleString()] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-medium block mb-1", children: "IVA / Impuestos (%)" }), _jsx("input", { type: "number", value: form.taxRate, onChange: e => setForm(f => ({ ...f, taxRate: Number(e.target.value) })), className: "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-medium block mb-1", children: "Imprevistos (%)" }), _jsx("input", { type: "number", value: form.contingencyRate, onChange: e => setForm(f => ({ ...f, contingencyRate: Number(e.target.value) })), className: "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" })] })] }), _jsxs("div", { className: "flex items-center justify-between text-sm font-bold mt-3 pt-3 border-t border-border", children: [_jsx("span", { children: "TOTAL" }), _jsxs("span", { className: "text-primary text-lg", children: ["$", calcTotal(form).toLocaleString()] })] })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-border", children: [_jsx("button", { onClick: () => setModalOpen(false), className: "px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors", children: "Cancelar" }), _jsx("button", { onClick: handleSave, disabled: !form.name, className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:scale-105 transition-all disabled:opacity-50", children: editingId ? 'Actualizar' : 'Crear Presupuesto' })] })] }) })] }));
};
export default Presupuestos;
