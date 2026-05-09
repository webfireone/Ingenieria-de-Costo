import { jsx as _jsx } from "react/jsx-runtime";
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
            case 'dashboard': return _jsx(Dashboard, {});
            case 'plants': return _jsx(Plants, {});
            case 'projects': return _jsx(Projects, {});
            case 'presupuestos': return _jsx(Presupuestos, {});
            case 'alerts': return _jsx(Alerts, {});
            case 'quality': return _jsx(Quality, {});
            case 'mixers': return _jsx(Mixers, {});
            case 'weather': return _jsx(Weather, {});
            case 'comparativa': return _jsx(Comparativa, {});
            case 'projections': return _jsx(Projections, {});
            case 'risks': return _jsx(Risks, {});
            case 'reports': return _jsx(Reports, {});
            case 'settings': return _jsx(SettingsPage, {});
            default: return _jsx(Dashboard, {});
        }
    };
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(Layout, { currentPage: currentPage, onNavigate: setCurrentPage, children: renderPage() }) }));
}
export default App;
