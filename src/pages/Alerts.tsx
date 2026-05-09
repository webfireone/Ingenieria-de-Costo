import React, { useState, useEffect, useMemo } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, Settings, SlidersHorizontal, Weight, Gauge, DollarSign, Factory } from 'lucide-react';
import KPICard from '../components/KPICard';
import { useFirestoreCollection } from '../hooks/useFirestore';
import type { Plant } from '../types';

interface AlertConfig {
  priceVariation: number;
  slumpDeviation: number;
  resistanceDeviation: number;
  minOEE: number;
  minProduction: number;
}

interface AlertEvent {
  id: string;
  type: 'critica' | 'advertencia' | 'info';
  title: string;
  description: string;
  source: string;
  date: string;
  resolved: boolean;
  resolvedAt?: string;
}

const defaultConfig: AlertConfig = {
  priceVariation: 10,
  slumpDeviation: 3,
  resistanceDeviation: 5,
  minOEE: 75,
  minProduction: 3000,
};

const defaultAlerts: AlertEvent[] = [
  { id: 'A-001', type: 'critica', title: 'Variación de Precio: Cemento Portland', description: 'Incremento del 15% detectado en {plant-north}', source: 'Insumos', date: '2026-05-08', resolved: false },
  { id: 'A-002', type: 'advertencia', title: 'OEE por debajo del umbral', description: '{plant-south} registra 72% de OEE (mínimo: 75%)', source: 'Eficiencia', date: '2026-05-07', resolved: false },
  { id: 'A-003', type: 'advertencia', title: 'Desviación de Slump en muestra', description: 'Muestra M-004: slump 18cm (objetivo: 12cm)', source: 'Calidad', date: '2026-05-06', resolved: false },
  { id: 'A-004', type: 'info', title: 'Mantenimiento preventivo programado', description: '{plant-north} - Cambio de mezclador (22 de mayo)', source: 'Mantenimiento', date: '2026-05-05', resolved: false },
  { id: 'A-005', type: 'critica', title: 'Resistencia 28d por debajo de especificación', description: 'Muestra M-004: 27.1 MPa (objetivo: 30 MPa)', source: 'Calidad', date: '2026-05-04', resolved: true, resolvedAt: '2026-05-09' },
  { id: 'A-006', type: 'info', title: 'Producción mensual estable', description: '4,250 m³ producidos en el mes', source: 'Producción', date: '2026-05-03', resolved: true, resolvedAt: '2026-05-09' },
];

const Alerts: React.FC = () => {
  const { data: plants } = useFirestoreCollection<Plant>('plants');
  const [config, setConfig] = useState<AlertConfig>(() => {
    const saved = localStorage.getItem('alert_config');
    return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
  });
  const [alerts, setAlerts] = useState<AlertEvent[]>(() => {
    const saved = localStorage.getItem('alert_data');
    return saved ? JSON.parse(saved) : defaultAlerts;
  });
  const [showResolved, setShowResolved] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const plantMap = useMemo(() => {
    if (!plants) return {} as Record<string, string>;
    return Object.fromEntries(plants.map(p => [p.id, p.name]));
  }, [plants]);

  const resolvedAlerts = useMemo(() =>
    alerts.map(a => ({
      ...a,
      description: a.description.replace(/\{([^}]+)\}/g, (_, id) => plantMap[id] ?? id),
    })),
  [alerts, plantMap]);

  useEffect(() => {
    localStorage.setItem('alert_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('alert_data', JSON.stringify(alerts));
  }, [alerts]);

  const fmtDatetime = () => new Date().toLocaleString('es-AR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });

  const activeAlerts = resolvedAlerts.filter(a => !a.resolved);
  const critical = activeAlerts.filter(a => a.type === 'critica').length;
  const warnings = activeAlerts.filter(a => a.type === 'advertencia').length;
  const infoCount = activeAlerts.filter(a => a.type === 'info').length;
  const resolvedToday = alerts.filter(a => a.resolved).length;

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true, resolvedAt: fmtDatetime() } : a));
  };

  const reactivateAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: false, resolvedAt: undefined } : a));
  };

  const displayAlerts = showResolved ? resolvedAlerts : activeAlerts;

  const typeIcon = { critica: AlertCircle, advertencia: AlertTriangle, info: Info };
  const typeColor = { critica: 'text-red-500 bg-red-500/10 border-red-500/20', advertencia: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', info: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Alertas Activas" value={activeAlerts.length} icon={Bell} />
        <KPICard title="Críticas" value={critical} icon={AlertTriangle} trend={critical > 0 ? { value: critical, isUp: false } : undefined} description="Requieren atención inmediata" />
        <KPICard title="Advertencias" value={warnings} icon={AlertCircle} description="Monitoreo recomendado" />
        <KPICard title="Resueltas" value={resolvedToday} icon={CheckCircle2} description="Total resueltas" />
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button onClick={() => setShowResolved(false)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!showResolved ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`}>Activas</button>
          <button onClick={() => setShowResolved(true)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${showResolved ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`}>Todas</button>
        </div>
        <button onClick={() => setShowConfig(!showConfig)} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-bold hover:bg-primary/10 transition-all">
          <SlidersHorizontal className="w-4 h-4" /> Umbrales
        </button>
      </div>

      {showConfig && (
        <div className="glass-card p-6 rounded-xl mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Settings className="w-5 h-5" /> Configuración de Umbrales de Alerta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2"><DollarSign className="w-4 h-4 text-muted-foreground" /> Variación de Precio Máx.</label>
              <div className="flex items-center gap-3">
                <input type="range" min="5" max="30" step="1" value={config.priceVariation} onChange={e => setConfig(c => ({ ...c, priceVariation: Number(e.target.value) }))} className="flex-1 accent-primary" />
                <span className="text-lg font-bold w-12 text-right">{config.priceVariation}%</span>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2"><Weight className="w-4 h-4 text-muted-foreground" /> Desviación de Slump Máx.</label>
              <div className="flex items-center gap-3">
                <input type="range" min="1" max="8" step="0.5" value={config.slumpDeviation} onChange={e => setConfig(c => ({ ...c, slumpDeviation: Number(e.target.value) }))} className="flex-1 accent-primary" />
                <span className="text-lg font-bold w-12 text-right">{config.slumpDeviation} cm</span>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2"><Weight className="w-4 h-4 text-muted-foreground" /> Desviación de Resistencia Máx.</label>
              <div className="flex items-center gap-3">
                <input type="range" min="1" max="15" step="0.5" value={config.resistanceDeviation} onChange={e => setConfig(c => ({ ...c, resistanceDeviation: Number(e.target.value) }))} className="flex-1 accent-primary" />
                <span className="text-lg font-bold w-12 text-right">{config.resistanceDeviation} MPa</span>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2"><Gauge className="w-4 h-4 text-muted-foreground" /> OEE Mínimo</label>
              <div className="flex items-center gap-3">
                <input type="range" min="50" max="95" step="1" value={config.minOEE} onChange={e => setConfig(c => ({ ...c, minOEE: Number(e.target.value) }))} className="flex-1 accent-primary" />
                <span className="text-lg font-bold w-12 text-right">{config.minOEE}%</span>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2"><Factory className="w-4 h-4 text-muted-foreground" /> Producción Mínima (m³/mes)</label>
              <div className="flex items-center gap-3">
                <input type="range" min="1000" max="8000" step="100" value={config.minProduction} onChange={e => setConfig(c => ({ ...c, minProduction: Number(e.target.value) }))} className="flex-1 accent-primary" />
                <span className="text-lg font-bold w-20 text-right">{config.minProduction.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-6 rounded-xl">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Bell className="w-5 h-5" /> Registro de Alertas</h3>
        <div className="space-y-3">
          {displayAlerts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No hay alertas {!showResolved && 'activas'}. ¡Todo en orden!</div>
          )}
          {displayAlerts.map((alert) => {
            const Icon = typeIcon[alert.type];
            return (
              <div key={alert.id} className={`flex items-start justify-between p-4 rounded-xl border ${alert.resolved ? 'bg-card/50 border-border/50 opacity-60' : typeColor[alert.type]}`}>
                <div className="flex items-start gap-4">
                  <Icon className={`w-5 h-5 mt-0.5 ${alert.resolved ? 'text-muted-foreground' : ''}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{alert.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        alert.type === 'critica' ? 'bg-red-500/10 text-red-500' : alert.type === 'advertencia' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{alert.source}</span>
                      <span>Inicio: {alert.date}</span>
                      {alert.resolvedAt && <span>Solucionado: {alert.resolvedAt}</span>}
                      <span className="font-mono">{alert.id}</span>
                    </div>
                  </div>
                </div>
                {!alert.resolved ? (
                  <button onClick={() => resolveAlert(alert.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3" /> Resolver
                  </button>
                ) : (
                  <button onClick={() => reactivateAlert(alert.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-all whitespace-nowrap">
                    <AlertTriangle className="w-3 h-3" /> Reactivar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Alerts;
