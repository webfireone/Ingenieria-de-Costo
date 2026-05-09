import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Briefcase, Calendar, DollarSign, TrendingUp, Pen, Trash2, Plus } from 'lucide-react';
import KPICard from '../components/KPICard';
import Modal from '../components/Modal';
import { useFirestoreCollection, useCreateDocument, useUpdateDocument, useDeleteDocument } from '../hooks/useFirestore';
const emptyForm = {
    name: '', plantId: '', totalVolume: 5000,
    durationMonths: 12, salePricePerM3: 185,
    discountRate: 0.12, startDate: new Date().toISOString().slice(0, 10),
};
const Projects = () => {
    const { data: projects } = useFirestoreCollection('projects');
    const { data: plants } = useFirestoreCollection('plants');
    const createProject = useCreateDocument('projects');
    const updateProject = useUpdateDocument('projects');
    const deleteProject = useDeleteDocument('projects');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const openCreate = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
    const openEdit = (proj) => {
        setForm({
            name: proj.name, plantId: proj.plantId,
            totalVolume: proj.totalVolume, durationMonths: proj.durationMonths,
            salePricePerM3: proj.salePricePerM3, discountRate: proj.discountRate,
            startDate: proj.startDate.slice(0, 10),
        });
        setEditingId(proj.id);
        setModalOpen(true);
    };
    const handleSave = async () => {
        if (!form.name || !form.plantId)
            return;
        if (editingId) {
            await updateProject.mutateAsync({ id: editingId, data: form });
        }
        else {
            await createProject.mutateAsync(form);
        }
        setModalOpen(false);
    };
    const handleDelete = async (id) => {
        if (confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) {
            await deleteProject.mutateAsync(id);
        }
    };
    const getPlantName = (plantId) => plants?.find(p => p.id === plantId)?.name ?? plantId;
    const totalVolume = (projects ?? []).reduce((s, p) => s + p.totalVolume, 0);
    const avgPrice = projects && projects.length > 0
        ? projects.reduce((s, p) => s + p.salePricePerM3, 0) / projects.length
        : 0;
    const isSaving = createProject.isPending || updateProject.isPending;
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsx(KPICard, { title: "Total Proyectos", value: projects?.length ?? 0, icon: Briefcase }), _jsx(KPICard, { title: "Volumen Total", value: `${totalVolume.toLocaleString()} m³`, icon: Calendar }), _jsx(KPICard, { title: "Precio Prom. Venta", value: `$${avgPrice.toFixed(2)} /m³`, icon: DollarSign }), _jsx(KPICard, { title: "Duraci\u00F3n Promedio", value: projects && projects.length > 0 ? `${(projects.reduce((s, p) => s + p.durationMonths, 0) / projects.length).toFixed(0)} meses` : '-', icon: TrendingUp })] }), _jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("h3", { className: "font-heading font-bold text-lg flex items-center gap-2 text-gradient", children: [_jsx(Briefcase, { className: "w-5 h-5" }), " Proyectos y Obras"] }), _jsxs("button", { onClick: openCreate, className: "flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:scale-105 transition-all", children: [_jsx(Plus, { className: "w-4 h-4" }), " Agregar Proyecto"] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border text-muted-foreground", children: [_jsx("th", { className: "text-left py-3 px-4", children: "Proyecto" }), _jsx("th", { className: "text-left py-3 px-4", children: "Planta" }), _jsx("th", { className: "text-right py-3 px-4", children: "Volumen (m\u00B3)" }), _jsx("th", { className: "text-right py-3 px-4", children: "Duraci\u00F3n" }), _jsx("th", { className: "text-right py-3 px-4", children: "Precio /m\u00B3" }), _jsx("th", { className: "text-right py-3 px-4", children: "Ingreso Total" }), _jsx("th", { className: "text-right py-3 px-4", children: "Acciones" })] }) }), _jsxs("tbody", { children: [projects?.map((proj) => (_jsxs("tr", { className: "border-b border-border/50 hover:bg-primary/5 transition-colors", children: [_jsx("td", { className: "py-3 px-4 font-medium", children: proj.name }), _jsx("td", { className: "py-3 px-4 text-muted-foreground", children: getPlantName(proj.plantId) }), _jsx("td", { className: "py-3 px-4 text-right", children: proj.totalVolume.toLocaleString() }), _jsxs("td", { className: "py-3 px-4 text-right", children: [proj.durationMonths, " meses"] }), _jsxs("td", { className: "py-3 px-4 text-right", children: ["$", proj.salePricePerM3.toFixed(2)] }), _jsxs("td", { className: "py-3 px-4 text-right font-bold text-primary", children: ["$", (proj.totalVolume * proj.salePricePerM3).toLocaleString()] }), _jsx("td", { className: "py-3 px-4 text-right", children: _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => openEdit(proj), className: "p-2 rounded-lg hover:bg-primary/10 transition-colors", children: _jsx(Pen, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleDelete(proj.id), className: "p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, proj.id))), (!projects || projects.length === 0) && (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center py-8 text-muted-foreground", children: "No hay proyectos registrados. Presione \"Agregar Proyecto\" para crear uno." }) }))] })] }) })] }), _jsx(Modal, { title: editingId ? 'Editar Proyecto' : 'Nuevo Proyecto', isOpen: modalOpen, onClose: () => setModalOpen(false), children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium block mb-1", children: "Nombre del Proyecto" }), _jsx("input", { type: "text", value: form.name, onChange: e => setForm(f => ({ ...f, name: e.target.value })), className: "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm", placeholder: "Ej: Edificio Torres" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium block mb-1", children: "Planta Asignada" }), _jsxs("select", { value: form.plantId, onChange: e => setForm(f => ({ ...f, plantId: e.target.value })), className: "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm", children: [_jsx("option", { value: "", children: "Seleccionar planta..." }), plants?.map(p => _jsx("option", { value: p.id, children: p.name }, p.id))] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium block mb-1", children: "Volumen Total (m\u00B3)" }), _jsx("input", { type: "number", value: form.totalVolume, onChange: e => setForm(f => ({ ...f, totalVolume: Number(e.target.value) })), className: "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium block mb-1", children: "Duraci\u00F3n (meses)" }), _jsx("input", { type: "number", value: form.durationMonths, onChange: e => setForm(f => ({ ...f, durationMonths: Number(e.target.value) })), className: "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium block mb-1", children: "Precio Venta /m\u00B3" }), _jsx("input", { type: "number", value: form.salePricePerM3, onChange: e => setForm(f => ({ ...f, salePricePerM3: Number(e.target.value) })), className: "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium block mb-1", children: "Tasa Descuento" }), _jsx("input", { type: "number", min: "0", max: "1", step: "0.01", value: form.discountRate, onChange: e => setForm(f => ({ ...f, discountRate: Number(e.target.value) })), className: "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium block mb-1", children: "Fecha de Inicio" }), _jsx("input", { type: "date", value: form.startDate, onChange: e => setForm(f => ({ ...f, startDate: e.target.value })), className: "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-border", children: [_jsx("button", { onClick: () => setModalOpen(false), className: "px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors", children: "Cancelar" }), _jsx("button", { onClick: handleSave, disabled: isSaving || !form.name || !form.plantId, className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:scale-105 transition-all disabled:opacity-50", children: isSaving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Proyecto' })] })] }) })] }));
};
export default Projects;
