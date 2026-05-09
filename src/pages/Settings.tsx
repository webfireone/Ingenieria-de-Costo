import React, { useState } from 'react';
import { Settings as SettingsIcon, DollarSign, Percent, Globe, Save } from 'lucide-react';

interface AppSettings {
  discountRate: number;
  inflationRate: number;
  taxRate: number;
  fuelCost: number;
  currency: string;
}

const defaultSettings: AppSettings = {
  discountRate: 12,
  inflationRate: 3.5,
  taxRate: 25,
  fuelCost: 1.45,
  currency: 'USD',
};

const SettingsPage: React.FC = () => {
  const [form, setForm] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('app_settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, value: number | string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('app_settings', JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="max-w-2xl">
        <div className="glass-card p-6 rounded-xl">
          <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2 text-gradient"><SettingsIcon className="w-5 h-5 text-primary" /> Parámetros Generales</h3>
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2"><Percent className="w-4 h-4 text-muted-foreground" /> Tasa de Descuento Anual</label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="30" step="0.5" value={form.discountRate} onChange={(e) => handleChange('discountRate', parseFloat(e.target.value))} className="flex-1 accent-primary" />
                <span className="text-lg font-bold w-16 text-right">{form.discountRate}%</span>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2"><Percent className="w-4 h-4 text-muted-foreground" /> Tasa de Inflación Anual</label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="20" step="0.5" value={form.inflationRate} onChange={(e) => handleChange('inflationRate', parseFloat(e.target.value))} className="flex-1 accent-primary" />
                <span className="text-lg font-bold w-16 text-right">{form.inflationRate}%</span>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2"><Percent className="w-4 h-4 text-muted-foreground" /> Tasa Impositiva</label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="50" step="1" value={form.taxRate} onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))} className="flex-1 accent-primary" />
                <span className="text-lg font-bold w-16 text-right">{form.taxRate}%</span>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2"><DollarSign className="w-4 h-4 text-muted-foreground" /> Costo de Combustible (por litro)</label>
              <div className="flex items-center gap-3">
                <input type="range" min="0.5" max="3" step="0.05" value={form.fuelCost} onChange={(e) => handleChange('fuelCost', parseFloat(e.target.value))} className="flex-1 accent-primary" />
                <span className="text-lg font-bold w-16 text-right">${form.fuelCost.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2"><Globe className="w-4 h-4 text-muted-foreground" /> Moneda</label>
              <select value={form.currency} onChange={(e) => handleChange('currency', e.target.value)} className="bg-background border border-border rounded-lg px-4 py-2 text-sm w-full">
                <option value="USD">USD - Dólar Americano</option>
                <option value="ARS">ARS - Peso Argentino</option>
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="CLP">CLP - Peso Chileno</option>
                <option value="COP">COP - Peso Colombiano</option>
                <option value="PEN">PEN - Sol Peruano</option>
              </select>
            </div>
            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:scale-105 transition-all">
              <Save className="w-4 h-4" /> {saved ? 'Guardado ✓' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
