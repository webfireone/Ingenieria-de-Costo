import React from 'react';
import { Briefcase, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import KPICard from '../components/KPICard';
import { useFirestoreCollection } from '../hooks/useFirestore';
import type { Project, Plant } from '../types';

const Projects: React.FC = () => {
  const { data: projects } = useFirestoreCollection<Project>('projects');
  const { data: plants } = useFirestoreCollection<Plant>('plants');

  const totalVolume = (projects ?? []).reduce((s, p) => s + p.totalVolume, 0);
  const avgPrice = projects && projects.length > 0
    ? projects.reduce((s, p) => s + p.salePricePerM3, 0) / projects.length
    : 0;

  const getPlantName = (plantId: string) => plants?.find(p => p.id === plantId)?.name ?? plantId;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Total Proyectos" value={projects?.length ?? 0} icon={Briefcase} />
        <KPICard title="Volumen Total" value={`${totalVolume.toLocaleString()} m³`} icon={Calendar} />
        <KPICard title="Precio Prom. Venta" value={`$${avgPrice.toFixed(2)} /m³`} icon={DollarSign} />
        <KPICard title="Duración Promedio" value={projects && projects.length > 0 ? `${(projects.reduce((s, p) => s + p.durationMonths, 0) / projects.length).toFixed(0)} meses` : '-'} icon={TrendingUp} />
      </div>

      <div className="glass-card p-6 rounded-xl">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Briefcase className="w-5 h-5" /> Proyectos y Obras</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-4">Proyecto</th>
                <th className="text-left py-3 px-4">Planta</th>
                <th className="text-right py-3 px-4">Volumen (m³)</th>
                <th className="text-right py-3 px-4">Duración (meses)</th>
                <th className="text-right py-3 px-4">Precio Venta /m³</th>
                <th className="text-right py-3 px-4">Tasa Descuento</th>
                <th className="text-right py-3 px-4">Ingreso Total</th>
              </tr>
            </thead>
            <tbody>
              {projects?.map((proj) => (
                <tr key={proj.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4 font-medium">{proj.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{getPlantName(proj.plantId)}</td>
                  <td className="py-3 px-4 text-right">{proj.totalVolume.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">{proj.durationMonths}</td>
                  <td className="py-3 px-4 text-right">${proj.salePricePerM3.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">{(proj.discountRate * 100).toFixed(1)}%</td>
                  <td className="py-3 px-4 text-right font-bold text-primary">${(proj.totalVolume * proj.salePricePerM3).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Projects;
