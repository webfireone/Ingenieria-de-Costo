import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { BarChart3, Calendar, TrendingUp, Target } from 'lucide-react';
import KPICard from '../components/KPICard';

type Period = 'mensual' | 'trimestral' | 'anual';
type Scenario = 'base' | 'optimista' | 'pesimista';

const Projections: React.FC = () => {
  const [period, setPeriod] = useState<Period>('mensual');
  const [scenario, setScenario] = useState<Scenario>('base');

  const scenarioMultiplier = { base: 1, optimista: 1.15, pesimista: 0.85 };

  const cashFlowData = {
    mensual: [120, 135, 142, 138, 150, 155, 148, 160, 165, 170, 175, 180],
    trimestral: [397, 443, 473, 525],
    anual: [1800, 2100],
  };

  const months = { mensual: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], trimestral: ['Q1', 'Q2', 'Q3', 'Q4'], anual: ['Año 1', 'Año 2'] };

  const data = cashFlowData[period].map(v => v * scenarioMultiplier[scenario]);
  const labels = months[period];

  const chartOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: { data: ['Ingresos', 'Egresos', 'Flujo Neto'], textStyle: { color: '#94a3b8' } },
    xAxis: { type: 'category', data: labels, axisLabel: { color: '#94a3b8' } },
    yAxis: { type: 'value', name: 'miles $', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
    grid: { left: '10%', right: '5%', bottom: '10%', containLabel: true },
    series: [
      { name: 'Ingresos', type: 'bar', data: data.map(v => v * 1.4), itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } },
      { name: 'Egresos', type: 'bar', data: data.map(v => v * 1.1), itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] } },
      { name: 'Flujo Neto', type: 'line', data: data.map(v => v * 0.3), lineStyle: { color: '#10b981', width: 3 }, symbol: 'circle', symbolSize: 8, itemStyle: { color: '#10b981' } },
    ],
  };

  const breakEvenOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'value', name: 'm³ producidos', axisLabel: { color: '#94a3b8' } },
    yAxis: { type: 'value', name: 'miles $', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
    series: [
      { name: 'Ingresos', type: 'line', data: [[0, 0], [5000, 925]], lineStyle: { color: '#3b82f6', width: 3 }, itemStyle: { color: '#3b82f6' } },
      { name: 'Costos Totales', type: 'line', data: [[0, 250], [5000, 850]], lineStyle: { color: '#ef4444', width: 3 }, itemStyle: { color: '#ef4444' } },
      { name: 'Punto Equilibrio', type: 'scatter', data: [[1875, 347]], symbolSize: 16, itemStyle: { color: '#f59e0b' }, label: { show: true, formatter: '1,875 m³', position: 'right', color: '#f59e0b', fontWeight: 'bold' } },
    ],
    grid: { left: '10%', right: '10%', bottom: '10%', containLabel: true },
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Período" value={period.charAt(0).toUpperCase() + period.slice(1)} icon={Calendar} />
        <KPICard title="Escenario" value={scenario.charAt(0).toUpperCase() + scenario.slice(1)} icon={BarChart3} />
        <KPICard title="Ingreso Proyectado" value={`$${(data.reduce((a, b) => a + b, 0) * 1.4).toFixed(0)}k`} icon={TrendingUp} description="Período seleccionado" />
        <KPICard title="Punto Equilibrio" value="1,875 m³" icon={Target} description="Promedio mensual" />
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
          {(['mensual', 'trimestral', 'anual'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${period === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
          {(['base', 'optimista', 'pesimista'] as Scenario[]).map(s => (
            <button key={s} onClick={() => setScenario(s)} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${scenario === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-xl">
          <h3 className="font-bold mb-4">Flujo de Caja Proyectado</h3>
          <div className="h-[350px]"><ReactECharts option={chartOption} style={{ height: '100%' }} /></div>
        </div>
        <div className="glass-card p-6 rounded-xl">
          <h3 className="font-bold mb-4">Punto de Equilibrio</h3>
          <div className="h-[350px]"><ReactECharts option={breakEvenOption} style={{ height: '100%' }} /></div>
        </div>
      </div>
    </>
  );
};

export default Projections;
