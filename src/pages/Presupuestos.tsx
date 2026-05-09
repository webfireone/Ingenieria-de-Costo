import React, { useState } from 'react';
import { FileText, Plus, Pen, Trash2, Calculator, DollarSign, Percent, Truck, HardHat, Receipt, Download } from 'lucide-react';
import KPICard from '../components/KPICard';
import Modal from '../components/Modal';
import { exportToPDF } from '../services/importExport';
import { useFirestoreCollection } from '../hooks/useFirestore';
import type { Plant } from '../types';

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

interface Budget {
  id: string;
  name: string;
  project: string;
  plantId: string;
  client: string;
  date: string;
  items: BudgetItem[];
  taxRate: number;
  contingencyRate: number;
}

const defaultItems: BudgetItem[] = [
  { id: '1', category: 'Hormigón', description: 'Hormigón H-30 (incl. bombeo)', unit: 'm³', quantity: 1200, unitPrice: 145 },
  { id: '2', category: 'Acero', description: 'Acero de refuerzo ADN 420', unit: 'ton', quantity: 85, unitPrice: 1200 },
  { id: '3', category: 'Encofrado', description: 'Encofrado metálico (alquiler)', unit: 'm²', quantity: 2500, unitPrice: 18 },
  { id: '4', category: 'Mano de Obra', description: 'Cuadrilla de hormigonado', unit: 'jornal', quantity: 180, unitPrice: 320 },
  { id: '5', category: 'Maquinaria', description: 'Grúa torre + mixer', unit: 'mes', quantity: 6, unitPrice: 8500 },
  { id: '6', category: 'Dirección Técnica', description: 'Ingeniero residente + topografía', unit: 'mes', quantity: 8, unitPrice: 4500 },
  { id: '7', category: 'Transporte', description: 'Flete de materiales', unit: 'viaje', quantity: 90, unitPrice: 280 },
];

const Presupuestos: React.FC = () => {
  const { data: plants } = useFirestoreCollection<Plant>('plants');
  const [budgets, setBudgets] = useState<Budget[]>([
    { id: 'BGT-001', name: 'Presupuesto Skyline Towers', project: 'Skyline Towers', plantId: 'plant-north', client: 'Constructora del Norte S.A.', date: '2026-04-01', items: [...defaultItems], taxRate: 21, contingencyRate: 5 },
    { id: 'BGT-002', name: 'Presupuesto Puente Interurbano', project: 'Puente Interurbano', plantId: 'plant-north', client: 'Gobierno Provincial', date: '2026-03-15', items: defaultItems.map(i => ({ ...i, quantity: i.quantity * 0.7, unitPrice: i.unitPrice * 1.1 })), taxRate: 21, contingencyRate: 8 },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', project: '', plantId: '', client: '', date: new Date().toISOString().slice(0, 10), items: [...defaultItems], taxRate: 21, contingencyRate: 5 });

  const calcSubtotal = (items: BudgetItem[]) => items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const calcTotal = (b: { items: BudgetItem[]; taxRate: number; contingencyRate: number }) => {
    const sub = calcSubtotal(b.items);
    return sub + sub * (b.taxRate + b.contingencyRate) / 100;
  };

  const openCreate = () => {
    setForm({ name: '', project: '', plantId: '', client: '', date: new Date().toISOString().slice(0, 10), items: [...defaultItems], taxRate: 21, contingencyRate: 5 });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (b: Budget) => {
    setForm({ name: b.name, project: b.project, plantId: b.plantId, client: b.client, date: b.date, items: b.items, taxRate: b.taxRate, contingencyRate: b.contingencyRate });
    setEditingId(b.id);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editingId) {
      setBudgets(prev => prev.map(b => b.id === editingId ? { ...b, ...form } : b));
    } else {
      setBudgets(prev => [...prev, { id: `BGT-${String(prev.length + 1).padStart(3, '0')}`, ...form }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este presupuesto?')) setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const updateItem = (idx: number, field: keyof BudgetItem, value: any) => {
    setForm(f => ({ ...f, items: f.items.map((item, i) => i === idx ? { ...item, [field]: value } : item) }));
  };

  const totalPresupuestado = budgets.reduce((s, b) => s + calcTotal(b), 0);

  const handleExportPDF = (b: Budget) => {
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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Presupuestos" value={budgets.length} icon={FileText} />
        <KPICard title="Total Presupuestado" value={`$${(totalPresupuestado / 1000).toFixed(0)}k`} icon={DollarSign} trend={{ value: 12, isUp: true }} description="Suma de todos" />
        <KPICard title="Margen Estimado" value="22.4%" icon={Percent} trend={{ value: 3, isUp: true }} description="Sobre costo directo" />
        <KPICard title="Cotizaciones Activas" value={budgets.length} icon={Receipt} />
      </div>

      <div className="glass-card p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-heading font-bold text-lg flex items-center gap-2 text-gradient"><FileText className="w-5 h-5" /> Presupuestos y Cotizaciones</h3>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:scale-105 transition-all">
            <Plus className="w-4 h-4" /> Nuevo Presupuesto
          </button>
        </div>
        <div className="space-y-4">
          {budgets.map((b) => {
            const sub = calcSubtotal(b.items);
            const total = calcTotal(b);
            return (
              <div key={b.id} className="p-5 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold">{b.name}</h4>
                      <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded">{b.id}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{b.client} — {b.project} {b.plantId && plants ? `(${plants.find(p => p.id === b.plantId)?.name ?? b.plantId})` : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-lg font-bold text-primary">${total.toLocaleString()}</p>
                    </div>
                    <button onClick={() => handleExportPDF(b)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors" title="Descargar PDF"><Download className="w-4 h-4" /></button>
                    <button onClick={() => openEdit(b)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors"><Pen className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(b.id)} className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-muted-foreground">
                  <div><span className="block font-medium text-foreground">Subtotal</span>${sub.toLocaleString()}</div>
                  <div><span className="block font-medium text-foreground">IVA ({b.taxRate}%)</span>${(sub * b.taxRate / 100).toLocaleString()}</div>
                  <div><span className="block font-medium text-foreground">Imprevistos ({b.contingencyRate}%)</span>${(sub * b.contingencyRate / 100).toLocaleString()}</div>
                  <div><span className="block font-medium text-foreground">Ítems</span>{b.items.length}</div>
                  <div><span className="block font-medium text-foreground">Fecha</span>{b.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal title={editingId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'} isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Nombre</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" placeholder="Ej: Presupuesto..." />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Proyecto</label>
              <input type="text" value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Cliente</label>
              <input type="text" value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Planta</label>
              <select value={form.plantId} onChange={e => setForm(f => ({ ...f, plantId: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                <option value="">Seleccionar planta...</option>
                {plants?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Fecha</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><Calculator className="w-4 h-4" /> Partidas del Presupuesto</h4>
            <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium mb-2 px-1">
              <span className="col-span-3">Categoría</span>
              <span className="col-span-3">Descripción</span>
              <span className="col-span-1 text-center">Cant.</span>
              <span className="col-span-2 text-right">P. Unitario</span>
              <span className="col-span-3 text-right">Total</span>
            </div>
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center text-xs">
                  <span className="col-span-3 text-muted-foreground truncate">{item.category}</span>
                  <input className="col-span-3 bg-background border border-border rounded px-2 py-1.5" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} />
                  <input type="number" className="col-span-1 bg-background border border-border rounded px-2 py-1.5 w-full text-center" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} />
                  <input type="number" className="col-span-2 bg-background border border-border rounded px-2 py-1.5 w-full text-right" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} />
                  <span className="col-span-3 text-right font-medium">${(item.quantity * item.unitPrice).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Subtotal</span>
              <span>${calcSubtotal(form.items).toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="text-xs font-medium block mb-1">IVA / Impuestos (%)</label>
                <input type="number" value={form.taxRate} onChange={e => setForm(f => ({ ...f, taxRate: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Imprevistos (%)</label>
                <input type="number" value={form.contingencyRate} onChange={e => setForm(f => ({ ...f, contingencyRate: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm font-bold mt-3 pt-3 border-t border-border">
              <span>TOTAL</span>
              <span className="text-primary text-lg">${calcTotal(form).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={!form.name} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:scale-105 transition-all disabled:opacity-50">
              {editingId ? 'Actualizar' : 'Crear Presupuesto'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Presupuestos;
