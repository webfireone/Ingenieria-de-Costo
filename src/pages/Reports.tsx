import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Download, Upload, FileUp } from 'lucide-react';
import { useFirestoreCollection } from '../hooks/useFirestore';
import type { Plant } from '../types';
import { exportToExcel, exportToPDF } from '../services/importExport';

const Reports: React.FC = () => {
  const { data: plants } = useFirestoreCollection<Plant>('plants');
  const { data: projects } = useFirestoreCollection<any>('projects');
  const [importStatus, setImportStatus] = useState('');

  const handleExportPlants = () => {
    if (!plants) return;
    const data = plants.map(p => ({
      Planta: p.name, Ubicación: p.location, Capacidad: `${p.installedCapacity} m³`,
      OEE: `${(p.availability * p.performance * p.qualityRate * 100).toFixed(1)}%`,
      CostoMaterial_m3: `$${p.materials.reduce((s, m) => s + m.unitPrice * m.quantityPerM3, 0).toFixed(2)}`,
    }));
    exportToExcel(data, `Plantas_${new Date().toLocaleDateString()}`);
  };

  const handleExportProjects = () => {
    if (!projects) return;
    const data = projects.map((p: any) => ({
      Proyecto: p.name, Volumen: `${p.totalVolume} m³`, Duracion: `${p.durationMonths} meses`,
      PrecioVenta: `$${p.salePricePerM3}`, IngresoTotal: `$${(p.totalVolume * p.salePricePerM3).toLocaleString()}`,
    }));
    exportToExcel(data, `Proyectos_${new Date().toLocaleDateString()}`);
  };

  const handleExportPDF = () => {
    if (!plants) return;
    const headers = [['Planta', 'Ubicación', 'Capacidad', 'OEE']];
    const rows = plants.map(p => [p.name, p.location, `${p.installedCapacity} m³`, `${(p.availability * p.performance * p.qualityRate * 100).toFixed(1)}%`]);
    exportToPDF('Reporte Ejecutivo - Ingeniería de Costo', headers, rows, `Reporte_Ejecutivo_${new Date().toLocaleDateString()}`);
  };

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        setImportStatus(`Archivo "${file.name}" seleccionado (${(file.size / 1024).toFixed(1)} KB). La importación a Firestore requiere procesamiento manual.`);
      }
    };
    input.click();
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6 rounded-xl">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Download className="w-5 h-5 text-primary" /> Exportar Datos</h3>
          <p className="text-sm text-muted-foreground mb-6">Descargue los datos del sistema en formato Excel o PDF para su análisis y presentación.</p>
          <div className="space-y-4">
            <button onClick={handleExportPlants} className="w-full flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-all">
              <span className="flex items-center gap-3"><FileSpreadsheet className="w-5 h-5 text-green-500" /><span className="font-medium">Exportar Plantas a Excel</span></span>
              <span className="text-xs text-muted-foreground">.xlsx</span>
            </button>
            <button onClick={handleExportProjects} className="w-full flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all">
              <span className="flex items-center gap-3"><FileSpreadsheet className="w-5 h-5 text-blue-500" /><span className="font-medium">Exportar Proyectos a Excel</span></span>
              <span className="text-xs text-muted-foreground">.xlsx</span>
            </button>
            <button onClick={handleExportPDF} className="w-full flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all">
              <span className="flex items-center gap-3"><FileText className="w-5 h-5 text-red-500" /><span className="font-medium">Descargar Reporte PDF</span></span>
              <span className="text-xs text-muted-foreground">.pdf</span>
            </button>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-primary" /> Importar Datos</h3>
          <p className="text-sm text-muted-foreground mb-6">Cargue archivos CSV o Excel con datos de plantas, proyectos o presupuestos.</p>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer" onClick={handleImportCSV}>
            <FileUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-medium mb-1">Haga clic para seleccionar archivo</p>
            <p className="text-xs text-muted-foreground">CSV, Excel (.xlsx, .xls)</p>
          </div>
          {importStatus && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm text-muted-foreground">{importStatus}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default Reports;
