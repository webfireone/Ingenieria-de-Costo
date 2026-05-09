import React, { useState } from 'react';
import { Briefcase, Calendar, DollarSign, TrendingUp, Pen, Trash2, Plus } from 'lucide-react';
import KPICard from '../components/KPICard';
import Modal from '../components/Modal';
import { useFirestoreCollection, useCreateDocument, useUpdateDocument, useDeleteDocument } from '../hooks/useFirestore';
import type { Project, Plant } from '../types';

interface ProjectForm {
  name: string;
  plantId: string;
  totalVolume: number;
  durationMonths: number;
  salePricePerM3: number;
  discountRate: number;
  startDate: string;
}

const emptyForm: ProjectForm = {
  name: '', plantId: '', totalVolume: 5000,
  durationMonths: 12, salePricePerM3: 185,
  discountRate: 0.12, startDate: new Date().toISOString().slice(0, 10),
};

const Projects: React.FC = () => {
  const { data: projects } = useFirestoreCollection<Project>('projects');
  const { data: plants } = useFirestoreCollection<Plant>('plants');
  const createProject = useCreateDocument('projects');
  const updateProject = useUpdateDocument('projects');
  const deleteProject = useDeleteDocument('projects');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };

  const openEdit = (proj: Project) => {
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
    if (!form.name || !form.plantId) return;
    if (editingId) {
      await updateProject.mutateAsync({ id: editingId, data: form });
    } else {
      await createProject.mutateAsync(form);
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) {
      await deleteProject.mutateAsync(id);
    }
  };

  const getPlantName = (plantId: string) => plants?.find(p => p.id === plantId)?.name ?? plantId;

  const totalVolume = (projects ?? []).reduce((s, p) => s + p.totalVolume, 0);
  const avgPrice = projects && projects.length > 0
    ? projects.reduce((s, p) => s + p.salePricePerM3, 0) / projects.length
    : 0;

  const isSaving = createProject.isPending || updateProject.isPending;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Total Proyectos" value={projects?.length ?? 0} icon={Briefcase} />
        <KPICard title="Volumen Total" value={`${totalVolume.toLocaleString()} m³`} icon={Calendar} />
        <KPICard title="Precio Prom. Venta" value={`$${avgPrice.toFixed(2)} /m³`} icon={DollarSign} />
        <KPICard title="Duración Promedio" value={projects && projects.length > 0 ? `${(projects.reduce((s, p) => s + p.durationMonths, 0) / projects.length).toFixed(0)} meses` : '-'} icon={TrendingUp} />
      </div>

      <div className="glass-card p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-heading font-bold text-lg flex items-center gap-2 text-gradient"><Briefcase className="w-5 h-5" /> Proyectos y Obras</h3>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:scale-105 transition-all">
            <Plus className="w-4 h-4" /> Agregar Proyecto
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-4">Proyecto</th>
                <th className="text-left py-3 px-4">Planta</th>
                <th className="text-right py-3 px-4">Volumen (m³)</th>
                <th className="text-right py-3 px-4">Duración</th>
                <th className="text-right py-3 px-4">Precio /m³</th>
                <th className="text-right py-3 px-4">Ingreso Total</th>
                <th className="text-right py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {projects?.map((proj) => (
                <tr key={proj.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4 font-medium">{proj.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{getPlantName(proj.plantId)}</td>
                  <td className="py-3 px-4 text-right">{proj.totalVolume.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">{proj.durationMonths} meses</td>
                  <td className="py-3 px-4 text-right">${proj.salePricePerM3.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-bold text-primary">${(proj.totalVolume * proj.salePricePerM3).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(proj)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors"><Pen className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(proj.id)} className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!projects || projects.length === 0) && (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No hay proyectos registrados. Presione "Agregar Proyecto" para crear uno.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal title={editingId ? 'Editar Proyecto' : 'Nuevo Proyecto'} isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Nombre del Proyecto</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" placeholder="Ej: Edificio Torres" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Planta Asignada</label>
            <select value={form.plantId} onChange={e => setForm(f => ({ ...f, plantId: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
              <option value="">Seleccionar planta...</option>
              {plants?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Volumen Total (m³)</label>
              <input type="number" value={form.totalVolume} onChange={e => setForm(f => ({ ...f, totalVolume: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Duración (meses)</label>
              <input type="number" value={form.durationMonths} onChange={e => setForm(f => ({ ...f, durationMonths: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Precio Venta /m³</label>
              <input type="number" value={form.salePricePerM3} onChange={e => setForm(f => ({ ...f, salePricePerM3: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Tasa Descuento</label>
              <input type="number" min="0" max="1" step="0.01" value={form.discountRate} onChange={e => setForm(f => ({ ...f, discountRate: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Fecha de Inicio</label>
            <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={isSaving || !form.name || !form.plantId} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:scale-105 transition-all disabled:opacity-50">
              {isSaving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Proyecto'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Projects;
