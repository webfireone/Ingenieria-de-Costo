import React from 'react';
import { LayoutDashboard, Factory, Briefcase, ClipboardCheck, BarChart3, ShieldAlert, FileOutput, Settings, Receipt } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const pageMeta: Record<string, { title: string; description: string }> = {
  dashboard: { title: 'Panel Operativo', description: 'Monitoreo de costos y rentabilidad en tiempo real' },
  plants: { title: 'Gestión de Plantas', description: 'Administración de plantas de hormigón y parámetros operativos' },
  projects: { title: 'Gestión de Proyectos', description: 'Planificación, presupuestos y seguimiento de obras' },
  presupuestos: { title: 'Presupuestos y Cotizaciones', description: 'Armado de presupuestos con materiales, MO, equipos e impuestos' },
  quality: { title: 'Control de Calidad', description: 'Resistencia, slump, muestras y rechazos de hormigón' },
  projections: { title: 'Proyecciones Financieras', description: 'Flujo de caja, punto de equilibrio y escenarios' },
  risks: { title: 'Análisis de Riesgos', description: 'Simulación Monte Carlo y análisis de sensibilidad' },
  reports: { title: 'Reportes y Exportación', description: 'Importación y exportación de datos (CSV, Excel, PDF)' },
  settings: { title: 'Configuración del Sistema', description: 'Ajustes generales y parámetros financieros' },
};

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
  { icon: Factory, label: 'Plantas', page: 'plants' },
  { icon: Briefcase, label: 'Proyectos', page: 'projects' },
  { icon: Receipt, label: 'Presupuestos', page: 'presupuestos' },
  { icon: ClipboardCheck, label: 'Calidad', page: 'quality' },
  { icon: BarChart3, label: 'Proyecciones', page: 'projections' },
  { icon: ShieldAlert, label: 'Riesgos', page: 'risks' },
  { icon: FileOutput, label: 'Reportes', page: 'reports' },
];

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const meta = pageMeta[currentPage] ?? pageMeta.dashboard;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <aside className="w-64 border-r border-border bg-card/30 backdrop-blur-xl flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            ConcreteEng PRO
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.page)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => onNavigate('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentPage === 'settings'
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
            }`}
          >
            <Settings className={`w-5 h-5 ${currentPage === 'settings' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-medium">Configuración</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 neo-gradient">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{meta.title}</h2>
            <p className="text-muted-foreground">{meta.description}</p>
          </div>
          
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-card rounded-md border border-border flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">Sincronizado con Firebase</span>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default Layout;
