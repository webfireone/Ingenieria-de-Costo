import React, { useState } from 'react';
import { Truck, Clock, AlertTriangle, MapPin, Gauge, Droplets, Plus, Pen, Trash2 } from 'lucide-react';
import KPICard from '../components/KPICard';
import Modal from '../components/Modal';
import { useFirestoreCollection } from '../hooks/useFirestore';
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
}

const defaultMixers: Mixer[] = [
  { id: 'M-001', plate: 'ABC-123', driver: 'Carlos López', plantId: 'plant-north', status: 'en_ruta', location: 'Ruta 34 - Km 12', capacity: 8, cycleTime: 95, tripsToday: 3, lostConcrete: 0.2 },
  { id: 'M-002', plate: 'DEF-456', driver: 'Juan Pérez', plantId: 'plant-north', status: 'descargando', location: 'Obra Skyline Towers', capacity: 8, cycleTime: 110, tripsToday: 4, lostConcrete: 0.5 },
  { id: 'M-003', plate: 'GHI-789', driver: 'Pedro Gómez', plantId: 'plant-north', status: 'en_obra', location: 'Puente Interurbano', capacity: 7, cycleTime: 85, tripsToday: 5, lostConcrete: 0 },
  { id: 'M-004', plate: 'JKL-012', driver: 'Luis Martínez', plantId: 'plant-south', status: 'disponible', location: 'Planta Sur', capacity: 8, cycleTime: 0, tripsToday: 2, lostConcrete: 0 },
  { id: 'M-005', plate: 'MNO-345', driver: 'Carlos Ruiz', plantId: 'plant-north', status: 'mantenimiento', location: 'Taller Central', capacity: 8, cycleTime: 0, tripsToday: 0, lostConcrete: 0 },
  { id: 'M-006', plate: 'PQR-678', driver: 'José Fernández', plantId: 'plant-south', status: 'en_ruta', location: 'Ruta 9 - Km 5', capacity: 7, cycleTime: 90, tripsToday: 3, lostConcrete: 0.3 },
];

const statusLabel = { disponible: 'Disponible', en_ruta: 'En Ruta', en_obra: 'En Obra', descargando: 'Descargando', mantenimiento: 'Mantenimiento' };
const statusColor = { disponible: 'bg-green-500/10 text-green-500 border-green-500/20', en_ruta: 'bg-blue-500/10 text-blue-500 border-blue-500/20', en_obra: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', descargando: 'bg-purple-500/10 text-purple-500 border-purple-500/20', mantenimiento: 'bg-red-500/10 text-red-500 border-red-500/20' };

const emptyForm = { plate: '', driver: '', plantId: '', location: '', capacity: 8, cycleTime: 0, tripsToday: 0, lostConcrete: 0, status: 'disponible' as Mixer['status'] };

const Mixers: React.FC = () => {
  const { data: plants } = useFirestoreCollection<Plant>('plants');
  const [mixers, setMixers] = useState<Mixer[]>(defaultMixers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const active = mixers.filter(m => m.status !== 'disponible' && m.status !== 'mantenimiento').length;
  const totalLost = mixers.reduce((s, m) => s + m.lostConcrete, 0);
  const totalTrips = mixers.reduce((s, m) => s + m.tripsToday, 0);

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

  const handleSave = () => {
    if (!form.plate || !form.plantId) return;
    if (editingId) {
      setMixers(prev => prev.map(m => m.id === editingId ? { ...m, ...form } : m));
    } else {
      const nextId = `M-${String(mixers.length + 1).padStart(3, '0')}`;
      setMixers(prev => [...prev, { id: nextId, ...form }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este mixer?')) setMixers(prev => prev.filter(m => m.id !== id));
  };

  const plantName = (id: string) => plants?.find(p => p.id === id)?.name ?? id;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Total Camiones" value={mixers.length} icon={Truck} />
        <KPICard title="En Operación" value={active} icon={Clock} trend={{ value: Math.round(active / mixers.length * 100), isUp: true }} description="% en uso" />
        <KPICard title="Viajes Hoy" value={totalTrips} icon={MapPin} />
        <KPICard title="Hormigón Perdido" value={`${totalLost.toFixed(1)} m³`} icon={Droplets} trend={{ value: 8, isUp: false }} description="Por rechazo/demora" />
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {plants?.map(p => {
          const count = mixers.filter(m => m.plantId === p.id).length;
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
                <th className="text-left py-3 px-4">Unidad</th>
                <th className="text-left py-3 px-4">Patente</th>
                <th className="text-left py-3 px-4">Conductor</th>
                <th className="text-left py-3 px-4">Planta</th>
                <th className="text-center py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Ubicación</th>
                <th className="text-center py-3 px-4">Capacidad</th>
                <th className="text-center py-3 px-4">Ciclo (min)</th>
                <th className="text-center py-3 px-4">Viajes Hoy</th>
                <th className="text-right py-3 px-4">Perdido (m³)</th>
                <th className="text-center py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mixers.map((m) => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4 font-medium">{m.id}</td>
                  <td className="py-3 px-4 font-mono text-xs">{m.plate}</td>
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
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors" title="Editar"><Pen className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
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
            <button onClick={handleSave} disabled={!form.plate || !form.plantId} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:scale-105 transition-all disabled:opacity-50">
              {editingId ? 'Actualizar' : 'Agregar'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Mixers;