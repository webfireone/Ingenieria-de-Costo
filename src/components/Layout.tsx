import React from 'react';
import { LayoutDashboard, Factory, Briefcase, BarChart3, ShieldAlert, FileOutput, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '#' },
    { icon: Factory, label: 'Plantas', path: '#' },
    { icon: Briefcase, label: 'Proyectos', path: '#' },
    { icon: BarChart3, label: 'Proyecciones', path: '#' },
    { icon: ShieldAlert, label: 'Riesgos', path: '#' },
    { icon: FileOutput, label: 'Reportes', path: '#' },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/30 backdrop-blur-xl flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            ConcreteEng PRO
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-all group"
            >
              <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configuración</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 neo-gradient">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Análisis Operativo</h2>
            <p className="text-muted-foreground">Monitoreo de costos y rentabilidad en tiempo real</p>
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
