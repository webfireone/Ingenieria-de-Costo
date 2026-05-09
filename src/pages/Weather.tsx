import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CloudRain, Calendar, TrendingDown, Umbrella } from 'lucide-react';
import KPICard from '../components/KPICard';

const rainDays = [4, 0, 2, 5, 3, 1, 0, 0, 2, 4, 3, 2];
const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const impactPerDay = 85;

const events = [
  { date: '15 Abr', days: 2, cause: 'Lluvias intensas', impact: 170 },
  { date: '22 Abr', days: 1, cause: 'Tormenta eléctrica', impact: 85 },
  { date: '05 May', days: 3, cause: 'Lluvias persistentes', impact: 255 },
  { date: '12 May', days: 1, cause: 'Inundación en acceso', impact: 85 },
];

const Weather: React.FC = () => {
  const totalRainDays = rainDays.reduce((a, b) => a + b, 0);
  const totalImpact = totalRainDays * impactPerDay;

  const chartOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: months, axisLabel: { color: '#94a3b8' } },
    yAxis: [
      { type: 'value', name: 'Días de lluvia', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
      { type: 'value', name: 'm³ no producidos', axisLabel: { color: '#94a3b8' }, splitLine: { show: false } },
    ],
    series: [
      { name: 'Días de lluvia', type: 'bar', data: rainDays, itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }, yAxisIndex: 0 },
      { name: 'Impacto producción', type: 'line', data: rainDays.map(d => d * impactPerDay), smooth: true, lineStyle: { color: '#ef4444', width: 3 }, symbol: 'circle', yAxisIndex: 1, areaStyle: { opacity: 0.1, color: '#ef4444' } },
    ],
    grid: { left: '10%', right: '10%', bottom: '10%', containLabel: true },
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Días de Lluvia (YTD)" value={totalRainDays} icon={CloudRain} />
        <KPICard title="Mes más lluvioso" value={months[rainDays.indexOf(Math.max(...rainDays))]} icon={Calendar} description={`${Math.max(...rainDays)} días`} />
        <KPICard title="Producción Perdida" value={`${totalImpact.toLocaleString()} m³`} icon={TrendingDown} trend={{ value: 12, isUp: false }} description="Estimación anual" />
        <KPICard title="Impacto Económico" value={`$${(totalImpact * 142).toLocaleString()}`} icon={Umbrella} description="Costo estimado" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6 rounded-xl">
          <h3 className="font-bold text-lg mb-4">Días de Lluvia por Mes</h3>
          <div className="h-[300px]"><ReactECharts option={chartOption} style={{ height: '100%' }} /></div>
        </div>
        <div className="glass-card p-6 rounded-xl">
          <h3 className="font-bold text-lg mb-4">Eventos Recientes</h3>
          <div className="space-y-4">
            {events.map((e, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg"><CloudRain className="w-5 h-5 text-blue-500" /></div>
                  <div>
                    <p className="font-medium">{e.date} — {e.days} día{e.days > 1 ? 's' : ''}</p>
                    <p className="text-sm text-muted-foreground">{e.cause}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Impacto</p>
                  <p className="font-bold text-red-400">-{e.impact} m³</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Weather;
