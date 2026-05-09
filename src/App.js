import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Plants from './pages/Plants';
import Projects from './pages/Projects';
import Projections from './pages/Projections';
import Quality from './pages/Quality';
import Risks from './pages/Risks';
import Reports from './pages/Reports';
import SettingsPage from './pages/Settings';
import { seedDatabase } from './services/seed';
const queryClient = new QueryClient();
function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isSeeding, setIsSeeding] = useState(false);
    const handleSeed = async () => {
        setIsSeeding(true);
        try {
            console.log('Iniciando carga de datos...');
            await seedDatabase();
            alert('¡Base de datos poblada con éxito!');
            window.location.reload();
        }
        catch (error) {
            console.error('Error detallado:', error);
            alert('Error de conexión: Por favor verifica que Firestore esté activado en tu consola Firebase.');
        }
        finally {
            setIsSeeding(false);
        }
    };
    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return _jsx(Dashboard, {});
            case 'plants': return _jsx(Plants, {});
            case 'projects': return _jsx(Projects, {});
            case 'projections': return _jsx(Projections, {});
            case 'quality': return _jsx(Quality, {});
            case 'risks': return _jsx(Risks, {});
            case 'reports': return _jsx(Reports, {});
            case 'settings': return _jsx(SettingsPage, {});
            default: return _jsx(Dashboard, {});
        }
    };
    return (_jsxs(QueryClientProvider, { client: queryClient, children: [_jsx(Layout, { currentPage: currentPage, onNavigate: setCurrentPage, children: renderPage() }), _jsx("div", { className: "fixed bottom-4 right-4 z-50", children: _jsx("button", { onClick: handleSeed, disabled: isSeeding, className: "px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl hover:scale-105 transition-all disabled:opacity-50 text-sm font-black flex items-center gap-2", children: isSeeding ? ('Procesando...') : (_jsxs(_Fragment, { children: [_jsx("span", { className: "w-2 h-2 bg-green-400 rounded-full animate-ping" }), "POBLAR DATOS DEMO"] })) }) })] }));
}
export default App;
