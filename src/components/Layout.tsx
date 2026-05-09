import React, { useState, useEffect } from 'react';
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

const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  size: 60 + Math.random() * 120,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: 15 + Math.random() * 20,
  delay: Math.random() * 10,
}));

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const [mobilePreview, setMobilePreview] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const meta = pageMeta[currentPage] ?? pageMeta.dashboard;

  useEffect(() => {
    setMounted(true);
  }, []);

  const sidebar = (
    <aside className={cn(
      "w-64 border-r border-border/40 bg-background/70 backdrop-blur-2xl flex flex-col shrink-0 relative shimmer",
      mobilePreview && "fixed inset-y-0 left-0 z-50 bg-card/95 shadow-2xl transition-transform duration-300",
      mobilePreview && !sidebarOpen && "-translate-x-full"
    )}>
      <div className="p-6 flex items-center justify-between border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="font-heading font-black text-sm text-white">GF</span>
          </div>
          <div>
            <h1 className="text-base font-heading font-extrabold bg-gradient-to-r from-primary via-blue-300 to-violet-400 bg-clip-text text-transparent leading-tight">
              GRUPO FALPAT
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">Ingeniería de Costo</p>
          </div>
        </div>
        {mobilePreview && (
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.label}
              onClick={() => { onNavigate(item.page); if (mobilePreview) setSidebarOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-left group relative overflow-hidden",
                isActive
                  ? 'text-white'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive && (
                <span className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-xl border border-primary/20 shadow-inner" />
              )}
              <span className={cn(
                "relative z-10 flex items-center gap-3",
                isActive && "translate-x-0.5"
              )}>
                <span className={cn(
                  "p-1.5 rounded-lg transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-br from-primary to-violet-500 shadow-lg shadow-primary/20"
                    : "bg-transparent group-hover:bg-primary/5"
                )}>
                  <item.icon className={cn(
                    "w-4 h-4 transition-all duration-300",
                    isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"
                  )} />
                </span>
                <span className={cn(
                  "font-medium text-sm transition-all duration-300",
                  isActive ? "text-white" : "group-hover:text-white"
                )}>{item.label}</span>
              </span>
              {isActive && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border/30">
        <button
          onClick={() => { onNavigate('settings'); if (mobilePreview) setSidebarOpen(false); }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden group",
            currentPage === 'settings' ? 'text-white' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {currentPage === 'settings' && (
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-xl border border-primary/20 shadow-inner" />
          )}
          <span className="relative z-10 flex items-center gap-3">
            <span className={cn(
              "p-1.5 rounded-lg transition-all duration-300",
              currentPage === 'settings'
                ? "bg-gradient-to-br from-primary to-violet-500 shadow-lg shadow-primary/20"
                : "bg-transparent group-hover:bg-primary/5"
            )}>
              <Settings className={cn(
                "w-4 h-4 transition-all",
                currentPage === 'settings' ? "text-white" : "text-muted-foreground group-hover:text-primary"
              )} />
            </span>
            <span className="font-medium text-sm">Configuración</span>
          </span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="h-screen text-foreground overflow-hidden flex relative">
      {/* Animated Background */}
      <div className="animated-bg">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-gradient-to-br from-primary/3 to-violet-500/2 blur-3xl"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Desktop sidebar */}
      <div className={cn(mobilePreview && "hidden", "relative z-10")}>
        {sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {mobilePreview && (
        <>
          {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />}
          {sidebar}
        </>
      )}

      <main className={cn(
        "flex-1 overflow-y-auto relative z-10",
        mobilePreview ? "max-w-[430px] mx-auto mobile-preview" : "",
        mobilePreview ? "p-3" : "p-8"
      )}>
        <header className={cn(
          "flex items-center gap-3 mb-8",
          mobilePreview ? "flex-wrap" : "justify-between"
        )}>
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {mobilePreview && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors shrink-0">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="min-w-0">
              <h2 className={cn(
                "font-heading font-extrabold tracking-tight",
                mobilePreview ? "text-lg" : "text-2xl",
                "text-gradient"
              )}>
                {meta.title}
              </h2>
              <p className="text-muted-foreground text-sm truncate mt-0.5">{meta.description}</p>
            </div>
          </div>

          <div className={cn("flex items-center gap-2 shrink-0", mobilePreview && "w-full justify-end mt-2")}>
            <button
              onClick={() => setMobilePreview(!mobilePreview)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shrink-0",
                mobilePreview
                  ? 'bg-gradient-to-r from-primary to-violet-500 text-white border-primary/30 shadow-lg shadow-primary/20'
                  : 'bg-card/50 text-muted-foreground border-border/50 hover:text-foreground hover:border-primary/30 backdrop-blur-sm'
              )}
              title={mobilePreview ? 'Cambiar a vista PC' : 'Vista previa móvil'}
            >
              {mobilePreview ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{mobilePreview ? 'Vista Móvil' : 'Vista PC'}</span>
            </button>
          </div>
        </header>

        <div className={cn(mounted && "page-enter", "space-y-8")}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
