import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import Risks from './pages/Risks';
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
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsxs("div", { className: "relative h-screen bg-background", children: [currentPage === 'dashboard' ? _jsx(Dashboard, {}) : _jsx(Risks, {}), _jsxs("div", { className: "fixed top-4 right-4 z-50 flex gap-2", children: [_jsx("button", { onClick: () => setCurrentPage('dashboard'), className: `px-4 py-2 rounded-md text-sm font-bold shadow-xl transition-all border ${currentPage === 'dashboard'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card/80 backdrop-blur-md text-muted-foreground border-border hover:bg-card'}`, children: "Dashboard Operativo" }), _jsx("button", { onClick: () => setCurrentPage('risks'), className: `px-4 py-2 rounded-md text-sm font-bold shadow-xl transition-all border ${currentPage === 'risks'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card/80 backdrop-blur-md text-muted-foreground border-border hover:bg-card'}`, children: "Simulaci\u00F3n Riesgos" })] }), _jsx("div", { className: "fixed bottom-4 right-4 z-50", children: _jsx("button", { onClick: handleSeed, disabled: isSeeding, className: "px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl hover:scale-105 transition-all disabled:opacity-50 text-sm font-black flex items-center gap-2", children: isSeeding ? ('Procesando...') : (_jsxs(_Fragment, { children: [_jsx("span", { className: "w-2 h-2 bg-green-400 rounded-full animate-ping" }), "POBLAR DATOS DEMO"] })) }) })] }) }));
}
export default App;
