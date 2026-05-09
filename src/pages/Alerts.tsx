import React, { useState, useEffect, useMemo } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, Settings, SlidersHorizontal, Weight, Gauge, DollarSign, Factory, BarChart3, RefreshCw } from 'lucide-react';
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

interface AlertHistoryEntry {
  action: 'resolved' | 'reactivated';
  at: string;
}

interface AlertEvent {
  id: string;
  type: 'critica' | 'advertencia' | 'info';
  title: string;
  description: string;
  source: string;
  plantId?: string;
  date: string;
  history: AlertHistoryEntry[];
}

const defaultConfig: AlertConfig = {
  priceVariation: 10,
  slumpDeviation: 3,
  resistanceDeviation: 5,
  minOEE: 75,
  minProduction: 3000,
};

const defaultAlerts: AlertEvent[] = [
  { id: 'A-001', type: 'critica', title: 'Variación de Precio: Cemento Portland', description: 'Incremento del 15% detectado en {plant-north}', source: 'Insumos', plantId: 'plant-north', date: '2026-05-08', history: [] },
  { id: 'A-002', type: 'advertencia', title: 'OEE por debajo del umbral', description: '{plant-south} registra 72% de OEE (mínimo: 75%)', source: 'Eficiencia', plantId: 'plant-south', date: '2026-05-07', history: [] },
  { id: 'A-003', type: 'advertencia', title: 'Desviación de Slump en muestra', description: 'Muestra M-004: slump 18cm (objetivo: 12cm)', source: 'Calidad', date: '2026-05-06', history: [] },
  { id: 'A-004', type: 'info', title: 'Mantenimiento preventivo programado', description: '{plant-north} - Cambio de mezclador (22 de mayo)', source: 'Mantenimiento', plantId: 'plant-north', date: '2026-05-05', history: [] },
  { id: 'A-005', type: 'critica', title: 'Resistencia 28d por debajo de especificación', description: 'Muestra M-004: 27.1 MPa (objetivo: 30 MPa)', source: 'Calidad', date: '2026-05-04', history: [{ action: 'resolved', at: '09/05/2026 10:30:00' }] },
  { id: 'A-006', type: 'info', title: 'Producción mensual estable', description: '4,250 m³ producidos en el mes', source: 'Producción', date: '2026-05-03', history: [{ action: 'resolved', at: '09/05/2026 11:00:00' }] },
];

function deriveState(a: AlertEvent) {
  const h = a.history ?? [];
  if (h.length === 0) return { resolved: false, resolvedAt: undefined, cycleCount: 0 };
  const last = h[h.length - 1];
  const resolved = last.action === 'resolved';
  const resolvedAt = resolved ? last.at : undefined;
  const cycleCount = h.filter(h => h.action === 'reactivated').length;
  return { resolved, resolvedAt, cycleCount };
}

const fmtDatetime = () => new Date().toLocaleString('es-AR', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hour12: false,
});

const Alerts: React.FC = () => {
  const { data: plants } = useFirestoreCollection<Plant>('plants');
  const [config, setConfig] = useState<AlertConfig>(() => {
    const saved = localStorage.getItem('alert_config');
    return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
  });
  const [alerts, setAlerts] = useState<AlertEvent[]>(() => {
    try {
      const saved = localStorage.getItem('alert_data');
      if (!saved) return defaultAlerts;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return defaultAlerts;
      const migrated = parsed.map((a: any) => {
        if (!a.history && 'resolved' in a) {
          const hadHistory = a.resolved || a.resolvedAt;
          return {
            id: a.id, type: a.type, title: a.title,
            description: a.description, source: a.source, plantId: a.plantId, date: a.date,
            history: hadHistory ? [{ action: 'resolved' as const, at: a.resolvedAt || 'desconocido' }] : [],
          };
        }
        return { ...a, history: a.history ?? [] };
      });
      return migrated;
    } catch {
      return defaultAlerts;
    }
  });
  const [showResolved, setShowResolved] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [activeTab, setActiveTab] = useState<'registro' | 'stats'>('registro');

  const plantMap = useMemo(() => {
    if (!plants) return {} as Record<string, string>;
    return Object.fromEntries(plants.map(p => [p.id, p.name]));
  }, [plants]);

  const enrichedAlerts = useMemo(() =>
    alerts.map(a => ({
      ...a,
      description: a.description.replace(/\{([^}]+)\}/g, (_, id) => plantMap[id] ?? id),
      ...deriveState(a),
    })),
  [alerts, plantMap]);

  useEffect(() => {
    localStorage.setItem('alert_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('alert_data', JSON.stringify(alerts));
  }, [alerts]);

  const activeAlerts = enrichedAlerts.filter((a: any) => !a.resolved);
  const critical = activeAlerts.filter((a: any) => a.type === 'critica').length;
  const warnings = activeAlerts.filter((a: any) => a.type === 'advertencia').length;
  const infoCount = activeAlerts.filter((a: any) => a.type === 'info').length;
  const resolvedCount = enrichedAlerts.filter((a: any) => a.resolved).length;

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, history: [...a.history, { action: 'resolved' as const, at: fmtDatetime() }] } : a));
  };

  const reactivateAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, history: [...a.history, { action: 'reactivated' as const, at: fmtDatetime() }] } : a));
  };

  const displayAlerts = showResolved ? enrichedAlerts : activeAlerts;

  const stats = useMemo(() => {
    const byTitle: Record<string, { count: number; recurring: number; alerts: typeof enrichedAlerts }> = {};
    const bySource: Record<string, number> = {};
    const byPlant: Record<string, number> = {};

    enrichedAlerts.forEach((a: any) => {
      if (!byTitle[a.title]) byTitle[a.title] = { count: 0, recurring: 0, alerts: [] };
      byTitle[a.title].count++;
      byTitle[a.title].alerts.push(a);
      if (a.cycleCount > 0) byTitle[a.title].recurring++;

      bySource[a.source] = (bySource[a.source] || 0) + 1;

      const pid = a.plantId;
      if (pid) {
        byPlant[pid] = (byPlant[pid] || 0) + 1;
      }
    });

    const topAlerts = Object.entries(byTitle)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    const recurringAlerts = Object.entries(byTitle)
      .filter(([_, v]) => v.recurring > 0)
      .sort((a, b) => b[1].recurring - a[1].recurring);

    return { topAlerts, bySource, byPlant, recurringAlerts };
  }, [enrichedAlerts]);

  const typeIcon = { critica: AlertCircle, advertencia: AlertTriangle, info: Info };
  const typeColor = { critica: 'text-red-500 bg-red-500/10 border-red-500/20', advertencia: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', info: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
  const totalAlerts = enrichedAlerts.length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Alertas Activas" value={activeAlerts.length} icon={Bell} />
        <KPICard title="Críticas" value={critical} icon={AlertTriangle} trend={critical > 0 ? { value: critical, isUp: false } : undefined} description="Requieren atención inmediata" />
        <KPICard title="Advertencias" value={warnings} icon={AlertCircle} description="Monitoreo recomendado" />
        <KPICard title="Resueltas" value={resolvedCount} icon={CheckCircle2} description="Total resueltas" />
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('registro')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'registro' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`}>
            Registro
          </button>
          <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'stats' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`}>
            Estadísticas
          </button>
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

      {activeTab === 'stats' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Alertas más frecuentes</h3>
            <div className="space-y-3">
              {stats.topAlerts.length === 0 && <p className="text-muted-foreground text-sm">Sin datos.</p>}
              {stats.topAlerts.map(([title, data]) => (
                <div key={title} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{title}</p>
                    <p className="text-xs text-muted-foreground">{data.alerts[0].source}</p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-lg font-bold text-primary">{data.count}</span>
                      <p className="text-xs text-muted-foreground">total</p>
                    </div>
                    {data.recurring > 0 && (
                      <div>
                        <span className="text-lg font-bold text-yellow-500">{data.recurring}</span>
                        <p className="text-xs text-muted-foreground">reincidentes</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><RefreshCw className="w-5 h-5" /> Alertas reincidentes</h3>
            {stats.recurringAlerts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay alertas reincidentes.</p>
            ) : (
              <div className="space-y-3">
                {stats.recurringAlerts.map(([title, data]) => (
                  <div key={title} className="p-3 bg-card border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{title}</p>
                      <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">{data.recurring} ciclos</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.alerts.filter((a: any) => a.plantId).map((a: any) => (
                        <span key={a.id} className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded">
                          {plantMap[a.plantId] ?? a.plantId}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-4">Alertas por Fuente</h3>
            <div className="space-y-2">
              {Object.entries(stats.bySource)
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                    <span className="text-sm">{source}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${(count / totalAlerts) * 100}px`, maxWidth: '120px' }} />
                      <span className="text-sm font-bold w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-4">Alertas por Planta</h3>
            <div className="space-y-2">
              {Object.entries(stats.byPlant)
                .sort((a, b) => b[1] - a[1])
                .map(([pid, count]) => (
                  <div key={pid} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                    <span className="text-sm">{plantMap[pid] ?? pid}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${(count / totalAlerts) * 100}px`, maxWidth: '120px' }} />
                      <span className="text-sm font-bold w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              {Object.keys(stats.byPlant).length === 0 && <p className="text-muted-foreground text-sm">Sin datos de planta.</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><Bell className="w-5 h-5" /> Registro de Alertas</h3>
            <div className="flex bg-background border border-border rounded-lg p-1">
              <button onClick={() => setShowResolved(false)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!showResolved ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Activas</button>
              <button onClick={() => setShowResolved(true)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${showResolved ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Todas</button>
            </div>
          </div>
          <div className="space-y-3">
            {displayAlerts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No hay alertas {!showResolved && 'activas'}. ¡Todo en orden!</div>
            )}
            {displayAlerts.map((alert) => {
              const a = alert as AlertEvent & { resolved: boolean; resolvedAt?: string; cycleCount: number };
              const Icon = typeIcon[a.type];
              return (
                <div key={a.id} className={`flex items-start justify-between p-4 rounded-xl border ${a.resolved ? 'bg-card/50 border-border/50 opacity-60' : typeColor[a.type]}`}>
                  <div className="flex items-start gap-4">
                    <Icon className={`w-5 h-5 mt-0.5 ${a.resolved ? 'text-muted-foreground' : ''}`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{a.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          a.type === 'critica' ? 'bg-red-500/10 text-red-500' : a.type === 'advertencia' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {a.type.charAt(0).toUpperCase() + a.type.slice(1)}
                        </span>
                        {a.cycleCount > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-yellow-500/10 text-yellow-500">{a.cycleCount}x reincidente</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{a.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{a.source}</span>
                        <span>Inicio: {a.date}</span>
                        {a.resolvedAt && <span>Solucionado: {a.resolvedAt}</span>}
                        <span className="font-mono">{a.id}</span>
                      </div>
                      {a.history.length > 1 && (
                        <details className="mt-1">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">Historial ({a.history.length} eventos)</summary>
                          <div className="mt-1 space-y-0.5">
                            {a.history.map((h: any, i: number) => (
                              <p key={i} className={`text-xs ${h.action === 'resolved' ? 'text-green-500' : 'text-yellow-500'}`}>
                                {h.action === 'resolved' ? 'Resuelto' : 'Reactivado'} — {h.at}
                              </p>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                  {!a.resolved ? (
                    <button onClick={() => resolveAlert(a.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all whitespace-nowrap">
                      <CheckCircle2 className="w-3 h-3" /> Resolver
                    </button>
                  ) : (
                    <button onClick={() => reactivateAlert(a.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-all whitespace-nowrap">
                      <AlertTriangle className="w-3 h-3" /> Reactivar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Alerts;