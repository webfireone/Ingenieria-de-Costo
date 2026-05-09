import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { ClipboardCheck, FlaskConical, AlertTriangle, CheckCircle2, XCircle, TrendingUp, Activity } from 'lucide-react';
import KPICard from '../components/KPICard';

interface Sample {
  id: string;
  project: string;
  concreteClass: string;
  slump: number;
  slumpTarget: number;
  resistance7d: number;
  resistance28d: number;
  resistanceTarget: number;
  date: string;
  status: 'aprobado' | 'rechazado' | 'en_curso';
}

const samples: Sample[] = [
  { id: 'M-001', project: 'Skyline Towers', concreteClass: 'H-30', slump: 12, slumpTarget: 12, resistance7d: 22.5, resistance28d: 32.8, resistanceTarget: 30, date: '2026-04-28', status: 'aprobado' },
  { id: 'M-002', project: 'Skyline Towers', concreteClass: 'H-30', slump: 14, slumpTarget: 12, resistance7d: 20.1, resistance28d: 30.2, resistanceTarget: 30, date: '2026-04-25', status: 'aprobado' },
  { id: 'M-003', project: 'Puente Interurbano', concreteClass: 'H-40', slump: 10, slumpTarget: 10, resistance7d: 28.3, resistance28d: 41.5, resistanceTarget: 40, date: '2026-04-22', status: 'aprobado' },
  { id: 'M-004', project: 'Skyline Towers', concreteClass: 'H-30', slump: 18, slumpTarget: 12, resistance7d: 18.2, resistance28d: 27.1, resistanceTarget: 30, date: '2026-04-20', status: 'rechazado' },
  { id: 'M-005', project: 'Puente Interurbano', concreteClass: 'H-40', slump: 9, slumpTarget: 10, resistance7d: 26.8, resistance28d: 39.7, resistanceTarget: 40, date: '2026-04-18', status: 'en_curso' },
  { id: 'M-006', project: 'Skyline Towers', concreteClass: 'H-30', slump: 13, slumpTarget: 12, resistance7d: 21.0, resistance28d: 31.5, resistanceTarget: 30, date: '2026-04-15', status: 'aprobado' },
  { id: 'M-007', project: 'Puente Interurbano', concreteClass: 'H-40', slump: 11, slumpTarget: 10, resistance7d: 27.5, resistance28d: 40.2, resistanceTarget: 40, date: '2026-04-12', status: 'aprobado' },
  { id: 'M-008', project: 'Skyline Towers', concreteClass: 'H-30', slump: 15, slumpTarget: 12, resistance7d: 19.4, resistance28d: 28.9, resistanceTarget: 30, date: '2026-04-10', status: 'rechazado' },
];

const Quality: React.FC = () => {
  const [filter, setFilter] = useState<'todos' | 'aprobado' | 'rechazado' | 'en_curso'>('todos');

  const filtered = filter === 'todos' ? samples : samples.filter(s => s.status === filter);
  const approved = samples.filter(s => s.status === 'aprobado').length;
  const rejected = samples.filter(s => s.status === 'rechazado').length;
  const avgResistance28d = samples.filter(s => s.status !== 'en_curso').reduce((sum, s) => sum + s.resistance28d, 0) / (samples.length - samples.filter(s => s.status === 'en_curso').length);

  const resistanceChart = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: { data: ['Resistencia 28d', 'Resistencia 7d', 'Objetivo'], textStyle: { color: '#94a3b8' } },
    xAxis: { type: 'category', data: samples.map(s => s.id), axisLabel: { color: '#94a3b8', rotate: 45 } },
    yAxis: { type: 'value', name: 'MPa', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
    series: [
      { name: 'Resistencia 28d', type: 'bar', data: samples.map(s => s.status !== 'en_curso' ? s.resistance28d : null), itemStyle: { borderRadius: [4, 4, 0, 0], color: '#3b82f6' } },
      { name: 'Resistencia 7d', type: 'bar', data: samples.map(s => s.resistance7d), itemStyle: { borderRadius: [4, 4, 0, 0], color: '#6366f1' } },
      { name: 'Objetivo', type: 'line', data: samples.map(s => s.resistanceTarget), lineStyle: { color: '#ef4444', width: 2, type: 'dashed' }, symbol: 'none' },
    ],
    grid: { left: '8%', right: '5%', bottom: '20%', containLabel: true },
  };

  const slumpChart = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: samples.map(s => s.id), axisLabel: { color: '#94a3b8', rotate: 45 } },
    yAxis: { type: 'value', name: 'Slump (cm)', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
    series: [
      { name: 'Slump Real', type: 'scatter', data: samples.map(s => s.slump), symbolSize: 12, itemStyle: { color: '#f59e0b' } },
      { name: 'Slump Objetivo', type: 'line', data: samples.map(s => s.slumpTarget), lineStyle: { color: '#10b981', width: 2, type: 'dashed' }, symbol: 'none' },
    ],
    grid: { left: '8%', right: '5%', bottom: '20%', containLabel: true },
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Muestras Totales" value={samples.length} icon={FlaskConical} />
        <KPICard title="Aprobadas" value={approved} icon={CheckCircle2} trend={{ value: Math.round(approved / samples.length * 100), isUp: true }} description="% de cumplimiento" />
        <KPICard title="Rechazadas" value={rejected} icon={XCircle} trend={{ value: Math.round(rejected / samples.length * 100), isUp: false }} description="% de rechazo" />
        <KPICard title="Resistencia Prom. 28d" value={`${avgResistance28d.toFixed(1)} MPa`} icon={Activity} trend={{ value: 3, isUp: true }} description="vs especificación" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6 rounded-xl">
          <h3 className="font-bold text-lg mb-4">Resistencia a Compresión</h3>
          <div className="h-[350px]"><ReactECharts option={resistanceChart} style={{ height: '100%' }} /></div>
        </div>
        <div className="glass-card p-6 rounded-xl">
          <h3 className="font-bold text-lg mb-4">Control de Slump (Asentamiento)</h3>
          <div className="h-[350px]"><ReactECharts option={slumpChart} style={{ height: '100%' }} /></div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg flex items-center gap-2"><ClipboardCheck className="w-5 h-5" /> Registro de Muestras</h3>
          <div className="flex bg-background border border-border rounded-lg p-1">
            {(['todos', 'aprobado', 'rechazado', 'en_curso'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {f === 'todos' ? 'Todos' : f === 'aprobado' ? 'Aprobados' : f === 'rechazado' ? 'Rechazados' : 'En Curso'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-4">Muestra</th>
                <th className="text-left py-3 px-4">Proyecto</th>
                <th className="text-center py-3 px-4">Clase</th>
                <th className="text-center py-3 px-4">Slump (cm)</th>
                <th className="text-right py-3 px-4">R 7d (MPa)</th>
                <th className="text-right py-3 px-4">R 28d (MPa)</th>
                <th className="text-center py-3 px-4">Fecha</th>
                <th className="text-center py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4 font-medium">{s.id}</td>
                  <td className="py-3 px-4">{s.project}</td>
                  <td className="py-3 px-4 text-center">{s.concreteClass}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={s.slump === s.slumpTarget ? 'text-green-500' : Math.abs(s.slump - s.slumpTarget) <= 2 ? 'text-yellow-500' : 'text-red-500'}>
                      {s.slump} / {s.slumpTarget}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">{s.resistance7d.toFixed(1)}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {s.status === 'en_curso' ? <span className="text-muted-foreground">---</span> : <span className={s.resistance28d >= s.resistanceTarget ? 'text-green-500' : 'text-red-500'}>{s.resistance28d.toFixed(1)}</span>}
                  </td>
                  <td className="py-3 px-4 text-center text-muted-foreground">{s.date}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      s.status === 'aprobado' ? 'bg-green-500/10 text-green-500' : s.status === 'rechazado' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {s.status === 'aprobado' ? <CheckCircle2 className="w-3 h-3" /> : s.status === 'rechazado' ? <XCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {s.status === 'aprobado' ? 'Aprobado' : s.status === 'rechazado' ? 'Rechazado' : 'En Curso'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Quality;
