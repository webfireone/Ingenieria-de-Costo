import React, { useState } from 'react';
import { LayoutDashboard, Factory, Briefcase, ClipboardCheck, BarChart3, ShieldAlert, FileOutput, Settings, Receipt, Bell, Truck, CloudRain, BarChart4, Menu, X, Smartphone, Monitor } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  alerts: { title: 'Alertas y Umbrales', description: 'Configuración de umbrales y monitoreo de alertas del sistema' },
  mixers: { title: 'Flota de Mixers', description: 'Seguimiento de camiones, tiempos de ciclo y hormigón perdido' },
  weather: { title: 'Clima y Lluvias', description: 'Registro de días de lluvia e impacto en la producción' },
  comparativa: { title: 'Comparativa de Plantas', description: 'Tabla comparativa de indicadores entre plantas' },
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
  { icon: Bell, label: 'Alertas', page: 'alerts' },
  { icon: Truck, label: 'Mixers', page: 'mixers' },
  { icon: CloudRain, label: 'Clima', page: 'weather' },
  { icon: BarChart4, label: 'Comparativa', page: 'comparativa' },
  { icon: BarChart3, label: 'Proyecciones', page: 'projections' },
  { icon: ShieldAlert, label: 'Riesgos', page: 'risks' },
  { icon: FileOutput, label: 'Reportes', page: 'reports' },
];

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const [mobilePreview, setMobilePreview] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const meta = pageMeta[currentPage] ?? pageMeta.dashboard;

  const sidebar = (
    <aside className={cn(
      "w-64 border-r border-border bg-card/30 backdrop-blur-xl flex flex-col shrink-0",
      mobilePreview && "fixed inset-y-0 left-0 z-50 bg-card shadow-2xl transition-transform duration-300",
      mobilePreview && !sidebarOpen && "-translate-x-full"
    )}>
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          GRUPO FALPAT
        </h1>
        {mobilePreview && (
          <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-primary/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.label}
              onClick={() => { onNavigate(item.page); if (mobilePreview) setSidebarOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left",
                isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive ? 'text-primary' : 'text-muted-foreground')} />
              <span className="font-medium truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={() => { onNavigate('settings'); if (mobilePreview) setSidebarOpen(false); }}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
            currentPage === 'settings' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
          )}
        >
          <Settings className={cn("w-5 h-5 shrink-0", currentPage === 'settings' ? 'text-primary' : 'text-muted-foreground')} />
          <span className="font-medium">Configuración</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden flex">
      {/* Desktop sidebar */}
      <div className={cn(mobilePreview && "hidden")}>
        {sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {mobilePreview && (
        <>
          {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />}
          {sidebar}
        </>
      )}

      <main className={cn(
        "flex-1 overflow-y-auto neo-gradient",
        mobilePreview ? "max-w-[430px] mx-auto mobile-preview" : "",
        mobilePreview ? "p-3" : "p-8"
      )}>
        <header className={cn(
          "flex items-center gap-3 mb-6",
          mobilePreview ? "flex-wrap" : "justify-between"
        )}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {mobilePreview && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors shrink-0">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="min-w-0">
              <h2 className={cn("font-bold tracking-tight", mobilePreview ? "text-lg" : "text-2xl")}>{meta.title}</h2>
              <p className="text-muted-foreground text-sm truncate">{meta.description}</p>
            </div>
          </div>
          
          <div className={cn("flex items-center gap-2", mobilePreview && "w-full justify-end")}>
            <button
              onClick={() => setMobilePreview(!mobilePreview)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shrink-0",
                mobilePreview
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              )}
              title={mobilePreview ? 'Cambiar a vista PC' : 'Vista previa móvil'}
            >
              {mobilePreview ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{mobilePreview ? 'Vista Móvil' : 'Vista PC'}</span>
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default Layout;
