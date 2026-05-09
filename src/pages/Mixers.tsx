import React from 'react';
import { Truck, Clock, AlertTriangle, MapPin, Gauge, Droplets } from 'lucide-react';
import KPICard from '../components/KPICard';

interface Mixer {
  id: string;
  plate: string;
  driver: string;
  status: 'disponible' | 'en_ruta' | 'en_obra' | 'descargando' | 'mantenimiento';
  location: string;
  capacity: number;
  cycleTime: number;
  tripsToday: number;
  lostConcrete: number;
}

const mixers: Mixer[] = [
  { id: 'M-001', plate: 'ABC-123', driver: 'Carlos López', status: 'en_ruta', location: 'Ruta 34 - Km 12', capacity: 8, cycleTime: 95, tripsToday: 3, lostConcrete: 0.2 },
  { id: 'M-002', plate: 'DEF-456', driver: 'Juan Pérez', status: 'descargando', location: 'Obra Skyline Towers', capacity: 8, cycleTime: 110, tripsToday: 4, lostConcrete: 0.5 },
  { id: 'M-003', plate: 'GHI-789', driver: 'Pedro Gómez', status: 'en_obra', location: 'Puente Interurbano', capacity: 7, cycleTime: 85, tripsToday: 5, lostConcrete: 0 },
  { id: 'M-004', plate: 'JKL-012', driver: 'Luis Martínez', status: 'disponible', location: 'Planta Norte', capacity: 8, cycleTime: 0, tripsToday: 2, lostConcrete: 0 },
  { id: 'M-005', plate: 'MNO-345', driver: 'Carlos Ruiz', status: 'mantenimiento', location: 'Taller Central', capacity: 8, cycleTime: 0, tripsToday: 0, lostConcrete: 0 },
  { id: 'M-006', plate: 'PQR-678', driver: 'José Fernández', status: 'en_ruta', location: 'Ruta 9 - Km 5', capacity: 7, cycleTime: 90, tripsToday: 3, lostConcrete: 0.3 },
];

const statusLabel = { disponible: 'Disponible', en_ruta: 'En Ruta', en_obra: 'En Obra', descargando: 'Descargando', mantenimiento: 'Mantenimiento' };
const statusColor = { disponible: 'bg-green-500/10 text-green-500 border-green-500/20', en_ruta: 'bg-blue-500/10 text-blue-500 border-blue-500/20', en_obra: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', descargando: 'bg-purple-500/10 text-purple-500 border-purple-500/20', mantenimiento: 'bg-red-500/10 text-red-500 border-red-500/20' };

const Mixers: React.FC = () => {
  const active = mixers.filter(m => m.status !== 'disponible' && m.status !== 'mantenimiento').length;
  const totalLost = mixers.reduce((s, m) => s + m.lostConcrete, 0);
  const totalTrips = mixers.reduce((s, m) => s + m.tripsToday, 0);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Total Camiones" value={mixers.length} icon={Truck} />
        <KPICard title="En Operación" value={active} icon={Clock} trend={{ value: Math.round(active / mixers.length * 100), isUp: true }} description="% en uso" />
        <KPICard title="Viajes Hoy" value={totalTrips} icon={MapPin} />
        <KPICard title="Hormigón Perdido" value={`${totalLost.toFixed(1)} m³`} icon={Droplets} trend={{ value: 8, isUp: false }} description="Por rechazo/demora" />
      </div>

      <div className="glass-card p-6 rounded-xl">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Truck className="w-5 h-5" /> Flota de Mixers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-4">Unidad</th>
                <th className="text-left py-3 px-4">Patente</th>
                <th className="text-left py-3 px-4">Conductor</th>
                <th className="text-center py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Ubicación</th>
                <th className="text-center py-3 px-4">Capacidad</th>
                <th className="text-center py-3 px-4">Ciclo (min)</th>
                <th className="text-center py-3 px-4">Viajes Hoy</th>
                <th className="text-right py-3 px-4">Perdido (m³)</th>
              </tr>
            </thead>
            <tbody>
              {mixers.map((m) => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4 font-medium">{m.id}</td>
                  <td className="py-3 px-4 font-mono text-xs">{m.plate}</td>
                  <td className="py-3 px-4">{m.driver}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor[m.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'en_ruta' || m.status === 'descargando' ? 'bg-current animate-pulse' : 'bg-current'}`} />
                      {statusLabel[m.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{m.location}</td>
                  <td className="py-3 px-4 text-center">{m.capacity} m³</td>
                  <td className="py-3 px-4 text-center">{m.cycleTime > 0 ? `${m.cycleTime} min` : '---'}</td>
                  <td className="py-3 px-4 text-center font-medium">{m.tripsToday}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={m.lostConcrete > 0 ? 'text-red-500 font-medium' : 'text-muted-foreground'}>{m.lostConcrete > 0 ? `${m.lostConcrete} m³` : '---'}</span>
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

export default Mixers;
