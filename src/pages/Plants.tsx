import React, { useState } from 'react';
import { Factory, Activity, MapPin, Package, Pen, Trash2, Plus } from 'lucide-react';
import KPICard from '../components/KPICard';
import Modal from '../components/Modal';
import { useFirestoreCollection, useCreateDocument, useUpdateDocument, useDeleteDocument } from '../hooks/useFirestore';
import type { Plant, MaterialCost, OperationalCost } from '../types';

interface PlantForm {
  name: string;
  location: string;
  installedCapacity: number;
  availability: number;
  performance: number;
  qualityRate: number;
  materials: MaterialCost[];
  operations: OperationalCost[];
}

const emptyForm: PlantForm = {
  name: '', location: '', installedCapacity: 5000,
  availability: 0.85, performance: 0.85, qualityRate: 0.95,
  materials: [],
  operations: [],
};

const Plants: React.FC = () => {
  const { data: plants, isLoading } = useFirestoreCollection<Plant>('plants');
  const createPlant = useCreateDocument('plants');
  const updatePlant = useUpdateDocument('plants');
  const deletePlant = useDeleteDocument('plants');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlantForm>(emptyForm);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };

  const openEdit = (plant: Plant) => {
    setForm({
      name: plant.name, location: plant.location,
      installedCapacity: plant.installedCapacity,
      availability: plant.availability, performance: plant.performance, qualityRate: plant.qualityRate,
      materials: plant.materials, operations: plant.operations,
    });
    setEditingId(plant.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.location) return;
    if (editingId) {
      await updatePlant.mutateAsync({ id: editingId, data: form });
    } else {
      await createPlant.mutateAsync(form);
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta planta? Esta acción no se puede deshacer.')) {
      await deletePlant.mutateAsync(id);
    }
  };

  const totalCapacity = (plants ?? []).reduce((s, p) => s + p.installedCapacity, 0);
  const avgOEE = plants && plants.length > 0
    ? plants.reduce((s, p) => s + (p.availability * p.performance * p.qualityRate), 0) / plants.length * 100
    : 0;

  const isSaving = createPlant.isPending || updatePlant.isPending;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Total Plantas" value={plants?.length ?? 0} icon={Factory} />
        <KPICard title="Capacidad Total" value={`${totalCapacity.toLocaleString()} m³/mes`} icon={Activity} />
        <KPICard title="OEE Promedio" value={`${avgOEE.toFixed(1)}%`} icon={Activity} />
        <KPICard title="Costo Prom. Material" value="$118.50 /m³" icon={Package} trend={{ value: 2, isUp: false }} description="Promedio entre plantas" />
      </div>

      <div className="glass-card p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg flex items-center gap-2"><Factory className="w-5 h-5" /> Plantas de Hormigón</h3>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:scale-105 transition-all">
            <Plus className="w-4 h-4" /> Agregar Planta
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-4">Nombre</th>
                <th className="text-left py-3 px-4">Ubicación</th>
                <th className="text-right py-3 px-4">Capacidad</th>
                <th className="text-right py-3 px-4">OEE</th>
                <th className="text-right py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {plants?.map((plant) => (
                <tr key={plant.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4 font-medium">{plant.name}</td>
                  <td className="py-3 px-4 text-muted-foreground"><span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{plant.location}</span></td>
                  <td className="py-3 px-4 text-right">{plant.installedCapacity.toLocaleString()} m³/mes</td>
                  <td className="py-3 px-4 text-right font-bold text-primary">{(plant.availability * plant.performance * plant.qualityRate * 100).toFixed(1)}%</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(plant)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors"><Pen className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(plant.id)} className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!plants || plants.length === 0) && !isLoading && (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No hay plantas registradas. Presione "Agregar Planta" para crear una.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {plants?.map((plant) => (
          <div key={plant.id} className="glass-card p-6 rounded-xl">
            <h4 className="font-bold mb-4 flex items-center gap-2"><Factory className="w-4 h-4 text-primary" /> {plant.name} - Insumos</h4>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2">Material</th>
                  <th className="text-center py-2">Unidad</th>
                  <th className="text-right py-2">Precio Unit.</th>
                  <th className="text-right py-2">Cant./m³</th>
                  <th className="text-right py-2">Costo/m³</th>
                </tr>
              </thead>
              <tbody>
                {plant.materials.map((m) => (
                  <tr key={m.id} className="border-b border-border/30">
                    <td className="py-2">{m.name}</td>
                    <td className="py-2 text-center text-muted-foreground">{m.unit}</td>
                    <td className="py-2 text-right">${m.unitPrice.toFixed(2)}</td>
                    <td className="py-2 text-right">{m.quantityPerM3}</td>
                    <td className="py-2 text-right font-medium">${(m.unitPrice * m.quantityPerM3).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h4 className="font-bold mb-2 text-sm text-muted-foreground uppercase tracking-wider">Costos Operativos</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2">Concepto</th>
                  <th className="text-right py-2">Fijo Mensual</th>
                  <th className="text-right py-2">Variable/m³</th>
                </tr>
              </thead>
              <tbody>
                {plant.operations.map((op) => (
                  <tr key={op.id} className="border-b border-border/30">
                    <td className="py-2">{op.name}</td>
                    <td className="py-2 text-right">${op.monthlyFixed.toLocaleString()}</td>
                    <td className="py-2 text-right">${op.variablePerM3.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <Modal title={editingId ? 'Editar Planta' : 'Nueva Planta'} isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Nombre</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" placeholder="Ej: Planta Norte" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Ubicación</label>
            <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" placeholder="Ej: Sector Industrial" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Capacidad Instalada (m³/mes)</label>
            <input type="number" value={form.installedCapacity} onChange={e => setForm(f => ({ ...f, installedCapacity: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Disponibilidad</label>
              <input type="number" min="0" max="1" step="0.01" value={form.availability} onChange={e => setForm(f => ({ ...f, availability: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Rendimiento</label>
              <input type="number" min="0" max="1" step="0.01" value={form.performance} onChange={e => setForm(f => ({ ...f, performance: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Calidad</label>
              <input type="number" min="0" max="1" step="0.01" value={form.qualityRate} onChange={e => setForm(f => ({ ...f, qualityRate: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={isSaving || !form.name || !form.location} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:scale-105 transition-all disabled:opacity-50">
              {isSaving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Planta'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Plants;
