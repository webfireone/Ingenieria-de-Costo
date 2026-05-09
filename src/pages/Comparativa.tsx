import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Factory, BarChart4, TrendingUp, DollarSign, Activity } from 'lucide-react';
import KPICard from '../components/KPICard';
import { useFirestoreCollection } from '../hooks/useFirestore';
import type { Plant } from '../types';

const Comparativa: React.FC = () => {
  const { data: plants } = useFirestoreCollection<Plant>('plants');

  const avgOEE = (p: Plant) => (p.availability * p.performance * p.qualityRate * 100).toFixed(1);
  const unitCost = (p: Plant) => p.materials.reduce((s, m) => s + m.unitPrice * m.quantityPerM3, 0);
  const totalFixed = (p: Plant) => p.operations.reduce((s, o) => s + o.monthlyFixed, 0);

  const names = plants?.map(p => p.name) ?? [];
  const oeeData = plants?.map(p => Number(avgOEE(p))) ?? [];
  const capacityData = plants?.map(p => p.installedCapacity) ?? [];
  const costData = plants?.map(p => unitCost(p)) ?? [];

  const barOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: { data: ['Capacidad (m³)', 'OEE (%)', 'Costo Mat. ($/m³)'], textStyle: { color: '#94a3b8' } },
    xAxis: { type: 'category', data: names, axisLabel: { color: '#94a3b8' } },
    yAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
    series: [
      { name: 'Capacidad (m³)', type: 'bar', data: capacityData, itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } },
      { name: 'OEE (%)', type: 'bar', data: oeeData, itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] } },
      { name: 'Costo Mat. ($/m³)', type: 'bar', data: costData, itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] } },
    ],
    grid: { left: '10%', right: '5%', bottom: '15%', containLabel: true },
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Plantas" value={plants?.length ?? 0} icon={Factory} />
        <KPICard title="Capacidad Total" value={`${(plants ?? []).reduce((s, p) => s + p.installedCapacity, 0).toLocaleString()} m³`} icon={BarChart4} />
        <KPICard title="OEE Máximo" value={plants && plants.length > 0 ? `${Math.max(...plants.map(p => p.availability * p.performance * p.qualityRate * 100)).toFixed(1)}%` : '-'} icon={Activity} description="Mejor planta" />
        <KPICard title="Mejor Costo Mat." value={plants && plants.length > 0 ? `$${Math.min(...plants.map(p => unitCost(p))).toFixed(2)}` : '-'} icon={DollarSign} description="Menor costo /m³" />
      </div>

      <div className="glass-card p-6 rounded-xl mb-6">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><BarChart4 className="w-5 h-5" /> Comparativa de Plantas</h3>
        <div className="h-[350px]"><ReactECharts option={barOption} style={{ height: '100%' }} /></div>
      </div>

      <div className="glass-card p-6 rounded-xl">
        <h3 className="font-bold text-lg mb-6">Tabla Comparativa</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-4">Indicador</th>
                {plants?.map(p => <th key={p.id} className="text-right py-3 px-4">{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Capacidad (m³/mes)', values: plants?.map(p => p.installedCapacity.toLocaleString()) },
                { label: 'Disponibilidad', values: plants?.map(p => `${(p.availability * 100).toFixed(0)}%`) },
                { label: 'Rendimiento', values: plants?.map(p => `${(p.performance * 100).toFixed(0)}%`) },
                { label: 'Calidad', values: plants?.map(p => `${(p.qualityRate * 100).toFixed(0)}%`) },
                { label: 'OEE Global', values: plants?.map(p => `${avgOEE(p)}%`) },
                { label: 'Costo Mat./m³', values: plants?.map(p => `$${unitCost(p).toFixed(2)}`) },
                { label: 'Costos Fijos/mes', values: plants?.map(p => `$${totalFixed(p).toLocaleString()}`) },
                { label: 'Costo Var. Prom./m³', values: plants?.map(p => `$${p.operations.reduce((s, o) => s + o.variablePerM3, 0).toFixed(2)}`) },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4 font-medium">{row.label}</td>
                  {row.values?.map((v, j) => <td key={j} className="py-3 px-4 text-right font-medium">{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Comparativa;
