import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Factory, TrendingUp, DollarSign, Activity, AlertTriangle, CheckCircle2, FileSpreadsheet, FileText } from 'lucide-react';
import KPICard from '../components/KPICard';
import { useFirestoreCollection } from '../hooks/useFirestore';
import type { Plant, Project } from '../types';
import { exportToExcel, exportToPDF } from '../services/importExport';


const Dashboard: React.FC = () => {
  const { data: plants } = useFirestoreCollection<Plant>('plants');
  const { data: projects } = useFirestoreCollection<Project>('projects');

  const handleExportExcel = () => {
    if (!plants) return;
    const exportData = plants.map(p => ({
      Planta: p.name,
      Ubicación: p.location,
      Capacidad: `${p.installedCapacity} m3`,
      OEE: `${(p.availability * p.performance * p.qualityRate * 100).toFixed(1)}%`
    }));
    exportToExcel(exportData, `Reporte_Plantas_${new Date().toLocaleDateString()}`);
  };

  const handleExportPDF = () => {
    if (!plants) return;
    const headers = [['Planta', 'Ubicación', 'Capacidad Mensual', 'Eficiencia OEE']];
    const rows = plants.map(p => [
      p.name,
      p.location,
      `${p.installedCapacity} m3`,
      `${(p.availability * p.performance * p.qualityRate * 100).toFixed(1)}%`
    ]);
    exportToPDF('Reporte Ejecutivo - Ingeniería de Costo', headers, rows, 'Reporte_Ejecutivo');
  };

  const costDistributionOption = {

    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    series: [
      {
        name: 'Distribución de Costos',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#0f172a', borderWidth: 2 },
        label: { show: false },
        data: [
          { value: 45, name: 'Materiales', itemStyle: { color: '#3b82f6' } },
          { value: 25, name: 'Operación', itemStyle: { color: '#10b981' } },
          { value: 20, name: 'Mantenimiento', itemStyle: { color: '#f59e0b' } },
          { value: 10, name: 'Logística', itemStyle: { color: '#6366f1' } },
        ]
      }
    ]
  };

  const oeeOption = {
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 8,
      axisLine: { lineStyle: { width: 6, color: [[0.7, '#ef4444'], [0.85, '#f59e0b'], [1, '#10b981']] } },
      pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '12%', width: 20, offsetCenter: [0, '-60%'], itemStyle: { color: 'auto' } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: { fontSize: 30, offsetCenter: [0, '-20%'], valueAnimation: true, formatter: '{value}%', color: 'inherit' },
      data: [{ value: 88, name: 'OEE Global' }]
    }]
  };

  return (
    <>
      {/* Export Toolbar */}
      <div className="flex justify-end gap-3 mb-6">
        <button 
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600/10 text-green-500 border border-green-600/20 rounded-lg hover:bg-green-600/20 transition-all text-sm font-bold"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Exportar Excel
        </button>
        <button 
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-500 border border-red-600/20 rounded-lg hover:bg-red-600/20 transition-all text-sm font-bold"
        >
          <FileText className="w-4 h-4" />
          Descargar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <KPICard 
          title="Producción Mensual" 
          value="4,250 m³" 
          icon={Factory} 
          trend={{ value: 12, isUp: true }}
          description="vs mes anterior"
        />
        <KPICard 
          title="Costo Promedio" 
          value="$142.50 /m³" 
          icon={DollarSign} 
          trend={{ value: 3, isUp: false }}
          description="Materiales + Operación"
        />
        <KPICard 
          title="Margen Bruto" 
          value="28.4%" 
          icon={TrendingUp} 
          trend={{ value: 5, isUp: true }}
          description="Promedio consolidado"
        />
        <KPICard 
          title="Eficiencia (OEE)" 
          value="88.2%" 
          icon={Activity} 
          trend={{ value: 2, isUp: true }}
          description="Disponibilidad x Rend x Cal"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 glass-card p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Distribución de Costos Operativos</h3>
            <select className="bg-background border border-border rounded px-2 py-1 text-sm">
              <option>Todas las plantas</option>
              {plants?.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="h-[300px]">
            <ReactECharts option={costDistributionOption} style={{ height: '100%' }} />
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <h3 className="font-bold text-lg mb-6">Eficiencia Global de Planta</h3>
          <div className="h-[300px]">
            <ReactECharts option={oeeOption} style={{ height: '100%' }} />
          </div>
        </div>

        {/* Alerts Section */}
        <div className="lg:col-span-3 glass-card p-6 rounded-xl">
          <h3 className="font-bold text-lg mb-4">Alertas de Control & Calidad</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-4">
                <AlertTriangle className="text-red-500" />
                <div>
                  <p className="font-medium">Variación de Precio: Cemento Portland</p>
                  <p className="text-sm text-muted-foreground">Incremento del 15% detectado en Planta Norte</p>
                </div>
              </div>
              <button className="text-sm font-bold text-red-500">RECALCULAR</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="text-green-500" />
                <div>
                  <p className="font-medium">Resistencia a 28 días - Proyecto Skyline</p>
                  <p className="text-sm text-muted-foreground">98.5% de cumplimiento en muestras H-30</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Hace 2 horas</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
