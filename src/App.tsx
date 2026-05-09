import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Plants from './pages/Plants';
import Projects from './pages/Projects';
import Projections from './pages/Projections';
import Presupuestos from './pages/Presupuestos';
import Alerts from './pages/Alerts';
import Quality from './pages/Quality';
import Mixers from './pages/Mixers';
import Weather from './pages/Weather';
import Comparativa from './pages/Comparativa';
import Risks from './pages/Risks';
import Reports from './pages/Reports';
import SettingsPage from './pages/Settings';

const queryClient = new QueryClient();

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'plants': return <Plants />;
      case 'projects': return <Projects />;
      case 'presupuestos': return <Presupuestos />;
      case 'alerts': return <Alerts />;
      case 'quality': return <Quality />;
      case 'mixers': return <Mixers />;
      case 'weather': return <Weather />;
      case 'comparativa': return <Comparativa />;
      case 'projections': return <Projections />;
      case 'risks': return <Risks />;
      case 'reports': return <Reports />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
    </QueryClientProvider>
  );
}

export default App;
