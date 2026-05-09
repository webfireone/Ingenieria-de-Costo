import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { FileSpreadsheet, FileText, Download, Upload, FileUp } from 'lucide-react';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { exportToExcel, exportToPDF } from '../services/importExport';
const Reports = () => {
    const { data: plants } = useFirestoreCollection('plants');
    const { data: projects } = useFirestoreCollection('projects');
    const [importStatus, setImportStatus] = useState('');
    const handleExportPlants = () => {
        if (!plants)
            return;
        const data = plants.map(p => ({
            Planta: p.name, Ubicación: p.location, Capacidad: `${p.installedCapacity} m³`,
            OEE: `${(p.availability * p.performance * p.qualityRate * 100).toFixed(1)}%`,
            CostoMaterial_m3: `$${p.materials.reduce((s, m) => s + m.unitPrice * m.quantityPerM3, 0).toFixed(2)}`,
        }));
        exportToExcel(data, `Plantas_${new Date().toLocaleDateString()}`);
    };
    const handleExportProjects = () => {
        if (!projects)
            return;
        const data = projects.map((p) => ({
            Proyecto: p.name, Volumen: `${p.totalVolume} m³`, Duracion: `${p.durationMonths} meses`,
            PrecioVenta: `$${p.salePricePerM3}`, IngresoTotal: `$${(p.totalVolume * p.salePricePerM3).toLocaleString()}`,
        }));
        exportToExcel(data, `Proyectos_${new Date().toLocaleDateString()}`);
    };
    const handleExportPDF = () => {
        if (!plants)
            return;
        const headers = [['Planta', 'Ubicación', 'Capacidad', 'OEE']];
        const rows = plants.map(p => [p.name, p.location, `${p.installedCapacity} m³`, `${(p.availability * p.performance * p.qualityRate * 100).toFixed(1)}%`]);
        exportToPDF('Reporte Ejecutivo - Ingeniería de Costo', headers, rows, `Reporte_Ejecutivo_${new Date().toLocaleDateString()}`);
    };
    const handleImportCSV = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx,.xls';
        input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (file) {
                setImportStatus(`Archivo "${file.name}" seleccionado (${(file.size / 1024).toFixed(1)} KB). La importación a Firestore requiere procesamiento manual.`);
            }
        };
        input.click();
    };
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8", children: [_jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsxs("h3", { className: "font-bold text-lg mb-4 flex items-center gap-2", children: [_jsx(Download, { className: "w-5 h-5 text-primary" }), " Exportar Datos"] }), _jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Descargue los datos del sistema en formato Excel o PDF para su an\u00E1lisis y presentaci\u00F3n." }), _jsxs("div", { className: "space-y-4", children: [_jsxs("button", { onClick: handleExportPlants, className: "w-full flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-all", children: [_jsxs("span", { className: "flex items-center gap-3", children: [_jsx(FileSpreadsheet, { className: "w-5 h-5 text-green-500" }), _jsx("span", { className: "font-medium", children: "Exportar Plantas a Excel" })] }), _jsx("span", { className: "text-xs text-muted-foreground", children: ".xlsx" })] }), _jsxs("button", { onClick: handleExportProjects, className: "w-full flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all", children: [_jsxs("span", { className: "flex items-center gap-3", children: [_jsx(FileSpreadsheet, { className: "w-5 h-5 text-blue-500" }), _jsx("span", { className: "font-medium", children: "Exportar Proyectos a Excel" })] }), _jsx("span", { className: "text-xs text-muted-foreground", children: ".xlsx" })] }), _jsxs("button", { onClick: handleExportPDF, className: "w-full flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all", children: [_jsxs("span", { className: "flex items-center gap-3", children: [_jsx(FileText, { className: "w-5 h-5 text-red-500" }), _jsx("span", { className: "font-medium", children: "Descargar Reporte PDF" })] }), _jsx("span", { className: "text-xs text-muted-foreground", children: ".pdf" })] })] })] }), _jsxs("div", { className: "glass-card p-6 rounded-xl", children: [_jsxs("h3", { className: "font-bold text-lg mb-4 flex items-center gap-2", children: [_jsx(Upload, { className: "w-5 h-5 text-primary" }), " Importar Datos"] }), _jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Cargue archivos CSV o Excel con datos de plantas, proyectos o presupuestos." }), _jsxs("div", { className: "border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer", onClick: handleImportCSV, children: [_jsx(FileUp, { className: "w-12 h-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "font-medium mb-1", children: "Haga clic para seleccionar archivo" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "CSV, Excel (.xlsx, .xls)" })] }), importStatus && (_jsx("div", { className: "mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm text-muted-foreground", children: importStatus }))] })] }) }));
};
export default Reports;
