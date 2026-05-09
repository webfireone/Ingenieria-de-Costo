import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Play, ShieldAlert, BarChart, Info } from 'lucide-react';
import { MonteCarloStats } from '../types';

const Risks: React.FC = () => {
  const [stats, setStats] = useState<MonteCarloStats | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [volatility, setVolatility] = useState(0.1);

  const runSimulation = () => {
    setIsSimulating(true);
    const worker = new Worker(new URL('../workers/monteCarlo.worker.ts', import.meta.url), { type: 'module' });
    
    worker.postMessage({
      iterations: 3000,
      initialInvestment: -1000000,
      monthlyRevenueBase: 150000,
      monthlyCostBase: 110000,
      durationMonths: 24,
      discountRate: 0.12,
      volatility: { revenue: volatility, cost: volatility * 0.8 }
    });

    worker.onmessage = (e) => {
      setStats(e.data);
      setIsSimulating(false);
      worker.terminate();
    };
  };

  const distributionOption = stats ? {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    xAxis: { 
      type: 'value', 
      name: 'VAN ($)', 
      axisLabel: { formatter: (v: number) => `$${(v/1000).toFixed(0)}k` } 
    },
    yAxis: { type: 'value', name: 'Frecuencia' },
    series: [{
      data: stats.distribution.map(d => [d.x, d.y]),
      type: 'line',
      smooth: true,
      areaStyle: { opacity: 0.3, color: '#3b82f6' },
      lineStyle: { color: '#3b82f6', width: 3 }
    }]
  } : {};

  const tornadoOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', position: 'top', splitLine: { lineStyle: { type: 'dashed' } } },
    yAxis: { type: 'category', data: ['Precio Cemento', 'Energía', 'Mano de Obra', 'Demanda', 'Merma'], axisTick: { show: false } },
    series: [
      {
        name: 'Impacto Negativo',
        type: 'bar',
        stack: 'Total',
        label: { show: true, position: 'left' },
        data: [-15000, -8000, -12000, -25000, -5000],
        itemStyle: { color: '#ef4444' }
      },
      {
        name: 'Impacto Positivo',
        type: 'bar',
        stack: 'Total',
        label: { show: true, position: 'right' },
        data: [12000, 7000, 10000, 30000, 4000],
        itemStyle: { color: '#10b981' }
      }
    ]
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Análisis de Riesgos & Monte Carlo</h2>
          <p className="text-muted-foreground">Simulación estocástica de escenarios financieros</p>
        </div>
        <button 
          onClick={runSimulation}
          disabled={isSimulating}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:scale-105 transition-all disabled:opacity-50"
        >
          <Play className="w-5 h-5 fill-current" />
          {isSimulating ? 'Simulando...' : 'Ejecutar 3,000 Iteraciones'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="glass-card p-6 rounded-xl space-y-6">
          <h3 className="font-heading font-bold flex items-center gap-2 text-gradient"><BarChart className="w-5 h-5" /> Parámetros</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Volatilidad del Mercado ({volatility * 100}%)</label>
              <input 
                type="range" min="0.05" max="0.3" step="0.01" 
                value={volatility} onChange={(e) => setVolatility(parseFloat(e.target.value))}
                className="w-full accent-primary" 
              />
            </div>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4" /> Las simulaciones se ejecutan en segundo plano utilizando Web Workers.
              </p>
            </div>
          </div>

          {stats && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Estadísticas de VAN</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-card rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground">Media (P50)</p>
                  <p className="text-lg font-bold text-blue-400">${(stats.p50/1000).toFixed(1)}k</p>
                </div>
                <div className="p-3 bg-card rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground">Riesgo (P5)</p>
                  <p className="text-lg font-bold text-red-400">${(stats.p5/1000).toFixed(1)}k</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Distribution Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-xl">
          <h3 className="font-heading font-bold mb-6 flex items-center gap-2 text-gradient"><ShieldAlert className="w-5 h-5" /> Distribución de Probabilidad del VAN</h3>
          <div className="h-[400px]">
            {stats ? (
              <ReactECharts option={distributionOption} style={{ height: '100%' }} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                Haga clic en "Ejecutar" para visualizar la distribución
              </div>
            )}
          </div>
        </div>

        {/* Tornado Chart */}
        <div className="lg:col-span-3 glass-card p-6 rounded-xl">
          <h3 className="font-heading font-bold mb-6 text-gradient">Análisis de Sensibilidad (Tornado)</h3>
          <div className="h-[400px]">
            <ReactECharts option={tornadoOption} style={{ height: '100%' }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Risks;
