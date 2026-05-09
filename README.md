# ConcreteEng PRO - Plataforma de Ingeniería de Costos

Plataforma integral para la gestión de costos, rentabilidad y riesgos en plantas de hormigón.

## 🚀 Tecnologías
- **Frontend:** Vite, React 18, TypeScript, TailwindCSS
- **Visualización:** Apache ECharts (Heatmaps, Gauges, Tornado)
- **Cálculo:** Web Workers (Monte Carlo), TanStack Table
- **Backend:** Firebase Firestore (Spark Tier Optimized)
- **Despliegue:** Render (Static Site)

## 📦 Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno en `.env`:
   ```env
   VITE_FIREBASE_API_KEY=tu_key
   VITE_FIREBASE_PROJECT_ID=tu_id
   ...
   ```
4. Iniciar desarrollo:
   ```bash
   npm run dev
   ```

## 🛠️ Despliegue en Render

1. Conectar tu repositorio de GitHub a Render.
2. Seleccionar **Static Site**.
3. Build Command: `npm run build`
4. Publish Directory: `dist`
5. Configurar las variables de entorno en el panel de Render.

## 📊 Lógica de Negocio
Consultar el archivo [docs/formulas.md](./docs/formulas.md) para detalles sobre VAN, TIR, OEE y simulaciones Monte Carlo.

## 🛡️ Optimización Free Tier
- **Caché:** React Query implementado con `staleTime` de 5 min para reducir lecturas de Firestore.
- **Workers:** Cálculos pesados delegados al cliente para evitar costos de servidor.
- **Spark Tier:** Estructura preparada para mantenerse bajo los 50k reads/día.
