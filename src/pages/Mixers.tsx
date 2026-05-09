import React, { useState } from 'react';
import { Truck, Clock, AlertTriangle, MapPin, Gauge, Droplets, Plus, Pen, Trash2 } from 'lucide-react';
import KPICard from '../components/KPICard';
import Modal from '../components/Modal';
import { useFirestoreCollection, useCreateDocument, useUpdateDocument, useDeleteDocument } from '../hooks/useFirestore';
import type { Plant } from '../types';

interface Mixer {
  id: string;
  plate: string;
  driver: string;
  plantId: string;
  status: 'disponible' | 'en_ruta' | 'en_obra' | 'descargando' | 'mantenimiento';
  location: string;
  capacity: number;
  cycleTime: number;
  tripsToday: number;
  lostConcrete: number;
  ultimaActualizacion: string;
}

const statusLabel = { disponible: 'Disponible', en_ruta: 'En Ruta', en_obra: 'En Obra', descargando: 'Descargando', mantenimiento: 'Mantenimiento' };
const statusColor = { disponible: 'bg-green-500/10 text-green-500 border-green-500/20', en_ruta: 'bg-blue-500/10 text-blue-500 border-blue-500/20', en_obra: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', descargando: 'bg-purple-500/10 text-purple-500 border-purple-500/20', mantenimiento: 'bg-red-500/10 text-red-500 border-red-500/20' };

const emptyForm = { plate: '', driver: '', plantId: '', location: '', capacity: 8, cycleTime: 0, tripsToday: 0, lostConcrete: 0, status: 'disponible' as Mixer['status'] };

const now = () => new Date().toLocaleString('es-AR', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false,
});

const Mixers: React.FC = () => {
  const { data: plants } = useFirestoreCollection<Plant>('plants');
  const { data: mixers } = useFirestoreCollection<Mixer>('mixers');
  const createMixer = useCreateDocument('mixers');
  const updateMixer = useUpdateDocument('mixers');
  const deleteMixer = useDeleteDocument('mixers');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const list = mixers ?? [];

  const active = list.filter(m => m.status !== 'disponible' && m.status !== 'mantenimiento').length;
  const totalLost = list.reduce((s, m) => s + m.lostConcrete, 0);
  const totalTrips = list.reduce((s, m) => s + m.tripsToday, 0);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (m: Mixer) => {
    setForm({ plate: m.plate, driver: m.driver, plantId: m.plantId, location: m.location, capacity: m.capacity, cycleTime: m.cycleTime, tripsToday: m.tripsToday, lostConcrete: m.lostConcrete, status: m.status });
    setEditingId(m.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.plate || !form.plantId) return;
    const ts = now();
    if (editingId) {
      await updateMixer.mutateAsync({ id: editingId, data: { ...form, ultimaActualizacion: ts } });
    } else {
      await createMixer.mutateAsync({ ...form, ultimaActualizacion: ts });
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este mixer?')) {
      await deleteMixer.mutateAsync(id);
    }
  };

  const plantName = (id: string) => plants?.find(p => p.id === id)?.name ?? id;
  const isSaving = createMixer.isPending || updateMixer.isPending;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Total Camiones" value={list.length} icon={Truck} />
        <KPICard title="En Operación" value={active} icon={Clock} trend={list.length > 0 ? { value: Math.round(active / list.length * 100), isUp: true } : undefined} description="% en uso" />
        <KPICard title="Viajes Hoy" value={totalTrips} icon={MapPin} />
        <KPICard title="Hormigón Perdido" value={`${totalLost.toFixed(1)} m³`} icon={Droplets} trend={{ value: 8, isUp: false }} description="Por rechazo/demora" />
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {plants?.map(p => {
          const count = list.filter(m => m.plantId === p.id).length;
          if (count === 0) return null;
          return (
            <div key={p.id} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm">
              <Truck className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{p.name}</span>
              <span className="text-lg font-bold text-primary">{count}</span>
              <span className="text-muted-foreground text-xs">camión{count !== 1 ? 'es' : ''}</span>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg flex items-center gap-2"><Truck className="w-5 h-5" /> Flota de Mixers</h3>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:scale-105 transition-all">
            <Plus className="w-4 h-4" /> Agregar Mixer
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-4">Patente</th>
                <th className="text-left py-3 px-4">Conductor</th>
                <th className="text-left py-3 px-4">Planta</th>
                <th className="text-center py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Ubicación</th>
                <th className="text-center py-3 px-4">Capacidad</th>
                <th className="text-center py-3 px-4">Ciclo (min)</th>
                <th className="text-center py-3 px-4">Viajes Hoy</th>
                <th className="text-right py-3 px-4">Perdido (m³)</th>
                <th className="text-right py-3 px-4">Ult. Actualización</th>
                <th className="text-center py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs font-medium">{m.plate}</td>
                  <td className="py-3 px-4">{m.driver}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{plantName(m.plantId)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor[m.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'en_ruta' || m.status === 'descargando' ? 'bg-current animate-pulse' : 'bg-current'}`} />
                      {statusLabel[m.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{m.location}</td>
                  <td className="py-3 px-4 text-center">{m.capacity} m³</td>
                  <td className="py-3 px-4 text-center">{m.cycleTime > 0 ? `${m.cycleTime} min` : '---'}</td>
                  <td className="py-3 px-4 text-center font-medium">{m.tripsToday}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={m.lostConcrete > 0 ? 'text-red-500 font-medium' : 'text-muted-foreground'}>{m.lostConcrete > 0 ? `${m.lostConcrete} m³` : '---'}</span>
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-muted-foreground">{m.ultimaActualizacion}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors" title="Editar"><Pen className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={11} className="text-center py-8 text-muted-foreground">No hay mixers registrados. Presione "Agregar Mixer" para crear uno.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal title={editingId ? 'Editar Mixer' : 'Nuevo Mixer'} isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Patente</label>
              <input type="text" value={form.plate} onChange={e => setForm(f => ({ ...f, plate: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" placeholder="ABC-123" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Conductor</label>
              <input type="text" value={form.driver} onChange={e => setForm(f => ({ ...f, driver: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Planta</label>
            <select value={form.plantId} onChange={e => setForm(f => ({ ...f, plantId: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
              <option value="">Seleccionar planta...</option>
              {plants?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Estado</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Mixer['status'] }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Ubicación</label>
              <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium block mb-1">Capacidad (m³)</label>
              <input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Ciclo (min)</label>
              <input type="number" value={form.cycleTime} onChange={e => setForm(f => ({ ...f, cycleTime: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Viajes Hoy</label>
              <input type="number" value={form.tripsToday} onChange={e => setForm(f => ({ ...f, tripsToday: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Perdido (m³)</label>
              <input type="number" step="0.1" value={form.lostConcrete} onChange={e => setForm(f => ({ ...f, lostConcrete: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={isSaving || !form.plate || !form.plantId} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:scale-105 transition-all disabled:opacity-50">
              {isSaving ? 'Guardando...' : editingId ? 'Actualizar' : 'Agregar'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Mixers;
