import React from 'react';
import { Factory, Activity, MapPin, Package, Wrench } from 'lucide-react';
import KPICard from '../components/KPICard';
import { useFirestoreCollection } from '../hooks/useFirestore';
import type { Plant } from '../types';

const Plants: React.FC = () => {
  const { data: plants } = useFirestoreCollection<Plant>('plants');

  const totalCapacity = (plants ?? []).reduce((s, p) => s + p.installedCapacity, 0);
  const avgOEE = plants && plants.length > 0
    ? plants.reduce((s, p) => s + (p.availability * p.performance * p.qualityRate), 0) / plants.length * 100
    : 0;

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
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-4">Nombre</th>
                <th className="text-left py-3 px-4">Ubicación</th>
                <th className="text-right py-3 px-4">Capacidad (m³/mes)</th>
                <th className="text-right py-3 px-4">Disponibilidad</th>
                <th className="text-right py-3 px-4">Rendimiento</th>
                <th className="text-right py-3 px-4">Calidad</th>
                <th className="text-right py-3 px-4">OEE</th>
              </tr>
            </thead>
            <tbody>
              {plants?.map((plant) => (
                <tr key={plant.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4 font-medium">{plant.name}</td>
                  <td className="py-3 px-4 text-muted-foreground"><span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{plant.location}</span></td>
                  <td className="py-3 px-4 text-right">{plant.installedCapacity.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">{(plant.availability * 100).toFixed(0)}%</td>
                  <td className="py-3 px-4 text-right">{(plant.performance * 100).toFixed(0)}%</td>
                  <td className="py-3 px-4 text-right">{(plant.qualityRate * 100).toFixed(0)}%</td>
                  <td className="py-3 px-4 text-right font-bold text-primary">{(plant.availability * plant.performance * plant.qualityRate * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {plants?.map((plant) => (
          <div key={plant.id} className="glass-card p-6 rounded-xl">
            <h4 className="font-bold mb-4 flex items-center gap-2"><Wrench className="w-4 h-4 text-primary" /> {plant.name} - Insumos</h4>
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
    </>
  );
};

export default Plants;
