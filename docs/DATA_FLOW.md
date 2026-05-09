# Manual de Variables y Flujo de Datos

## Visión General de la Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     App (App.tsx)                            │
│  currentPage → renderiza 1 de 13 páginas                    │
│         ↓                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layout (sidebar + header)                          │   │
│  │  onNavigate → cambia currentPage                    │   │
│  └─────────────────────────────────────────────────────┘   │
│         ↓                                                   │
│  ┌──────────┬───────────┬──────────┬──────────────┐        │
│  │ Firebase  │ localStorage │ Memoria  │ Hardcodeado  │        │
│  │ (compartido)│ (por máquina) │ (efímero) │ (código)    │        │
│  └──────────┴───────────┴──────────┴──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

- **Firebase** → datos compartidos entre todos los usuarios (Plantas, Proyectos, Mixers)
- **localStorage** → datos locales por navegador (Alertas, Configuración)
- **Memoria** → datos que se pierden al recargar (Presupuestos, resultados Monte Carlo)
- **Hardcodeado** → datos fijos en el código (muestras de Calidad, clima)

---

## 1. ALMACENAMIENTO EN FIREBASE (compartido)

Todas las colecciones se leen con `useFirestoreCollection<T>(nombre)` y se modifican con los hooks `useCreateDocument`, `useUpdateDocument`, `useDeleteDocument`.

Cada mutación invalida automáticamente la caché de React Query, forzando un re-render de **todas** las páginas que usen esa colección.

### Colección `plants`

| Campo | Tipo | Ejemplo | ¿Qué controla? |
|-------|------|---------|----------------|
| `id` | string | `plant-north` | Identificador único |
| `name` | string | `Planta Norte` | Se muestra en todas las páginas |
| `location` | string | `Ruta 34, Km 12` | Ubicación de la planta |
| `installedCapacity` | number | `5000` | **Capacidad instalada mensual** → cálculos de producción, OEE, productividad |
| `availability` | number (0-1) | `0.85` | **Disponibilidad** → OEE, producción real, radar chart |
| `performance` | number (0-1) | `0.85` | **Rendimiento** → OEE, producción real |
| `qualityRate` | number (0-1) | `0.95` | **Tasa de calidad** → OEE |
| `materials` | `MaterialCost[]` | ver abajo | **Costo de materiales** → unit cost, márgenes, gráficos |
| `operations` | `OperationalCost[]` | ver abajo | **Costos operativos** → unit cost, márgenes |

Cada `MaterialCost`:

| Campo | Ejemplo | Afecta |
|-------|---------|--------|
| `name` | `Cemento Portland` | Solo visual |
| `unit` | `ton` | Solo visual |
| `unitPrice` | `180000` | **Costo de material** → unit cost, Dashboard, Comparativa |
| `quantityPerM3` | `0.35` | **Cantidad por m³** → unit cost, Dashboard, Comparativa |

Cada `OperationalCost`:

| Campo | Ejemplo | Afecta |
|-------|---------|--------|
| `name` | `Energía Eléctrica` | Solo visual |
| `monthlyFixed` | `8000000` | **Costo fijo mensual** → unit cost al dividir por capacidad |
| `variablePerM3` | `2500` | **Costo variable por m³** → unit cost |

**Páginas que modifican `plants`**: Solo Plants (CRUD)
**Páginas que leen `plants`**: Dashboard, Plants, Projects, Presupuestos, Projections, Alerts, Quality, Comparativa, Reports, Mixers

### Colección `projects`

| Campo | Tipo | Ejemplo | ¿Qué controla? |
|-------|------|---------|----------------|
| `id` | string | `proj-skyline` | Identificador único |
| `name` | string | `Skyline Towers` | Se muestra en tablas y gráficos |
| `plantId` | string | `plant-north` | **Vinculación a planta** → filtros, mapas |
| `totalVolume` | number | `15000` | **Volumen total** → ingresos, duración, S-curve, Dashboard |
| `durationMonths` | number | `18` | **Duración** → ingresos anualizados, Dashboard |
| `salePricePerM3` | number | `210` | **Precio de venta** → márgenes, break-even, Dashboard |
| `discountRate` | number (0-1) | `0.12` | **Tasa de descuento** → VAN, payback |
| `startDate` | string | `2026-03-01` | Fecha de inicio |

**Páginas que modifican `projects`**: Solo Projects (CRUD)
**Páginas que leen `projects`**: Dashboard, Projects, Projections, Quality, Reports

### Colección `mixers`

| Campo | Tipo | Ejemplo | ¿Qué controla? |
|-------|------|---------|----------------|
| `id` | string | auto-generado | Identificador único |
| `plate` | string | `ABC-123` | Patente (identificador visible) |
| `driver` | string | `Carlos López` | Nombre del conductor |
| `plantId` | string | `plant-north` | **Planta asignada** → badges por planta |
| `status` | enum | `en_ruta` | **Estado** → tarjetas "En Operación", colores |
| `location` | string | `Ruta 34 - Km 12` | Ubicación actual |
| `capacity` | number | `8` | Capacidad en m³ |
| `cycleTime` | number | `95` | Tiempo de ciclo en minutos |
| `tripsToday` | number | `3` | **Viajes del día** → KPI |
| `lostConcrete` | number | `0.2` | **Hormigón perdido** → KPI |
| `ultimaActualizacion` | string | `09/05/2026 08:15` | Cuándo se modificó por última vez |

**Páginas que modifican `mixers`**: Solo Mixers (CRUD)
**Páginas que leen `mixers`**: Solo Mixers

---

## 2. ALMACENAMIENTO EN localStorage (por máquina)

### Clave `alert_data`

Tipo: `AlertEvent[]`

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| `id` | string | `A-001` |
| `type` | `'critica' \| 'advertencia' \| 'info'` | `critica` |
| `title` | string | `Variación de Precio: Cemento Portland` |
| `description` | string | `Incremento del 15%` |
| `source` | string | `Insumos` |
| `plantId?` | string \| undefined | `plant-north` |
| `date` | string | `2026-05-08` |
| `history` | `AlertHistoryEntry[]` | `[{ action: 'resolved', at: '...' }]` |

Cada `history` entry: `{ action: 'resolved' | 'reactivated', at: string }`

**Lo modifica**: Alerts (resolver/reactivar)
**Lo lee**: Alerts

### Clave `alert_config`

Tipo: `AlertConfig`

| Campo | Rango | Default | ¿Qué controla? |
|-------|-------|---------|----------------|
| `priceVariation` | 5-30% | 10 | Umbral de alerta de variación de precio |
| `slumpDeviation` | 1-8 cm | 3 | Umbral de alerta de desviación de slump |
| `resistanceDeviation` | 1-15 MPa | 5 | Umbral de alerta de desviación de resistencia |
| `minOEE` | 50-95% | 75 | Umbral de alerta de OEE mínimo |
| `minProduction` | 1000-8000 | 3000 | Umbral de alerta de producción mínima |

**Lo modifica**: Alerts (sliders de configuración)
**Lo lee**: Alerts

### Clave `app_settings`

Tipo: `AppSettings`

| Campo | Rango | Default | ¿Qué controla? |
|-------|-------|---------|----------------|
| `discountRate` | 0-30% | 12 | ⚠️ **No es usado por ninguna página** |
| `inflationRate` | 0-20% | 3.5 | ⚠️ **No es usado por ninguna página** |
| `taxRate` | 0-50% | 25 | ⚠️ **No es usado por ninguna página** |
| `fuelCost` | 0.5-3 | 1.45 | ⚠️ **No es usado por ninguna página** |
| `currency` | USD/ARS/MXN/... | USD | ⚠️ **No es usado por ninguna página** |

> **⚠️ Importante**: Configuración guarda estos valores pero **ninguna otra página los lee**. Son datos huérfanos.

**Lo modifica**: Settings
**Lo lee**: Settings

---

## 3. DATOS EN MEMORIA (se pierden al recargar)

### Presupuestos (`budgets`)

Tipo: `Budget[]`
**No persiste en ningún lado.**

Cada `Budget`:

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| `id` | string | `BGT-174678...` |
| `name` | string | `Presupuesto Torre Office` |
| `project` | string | `Edificio Corporativo` |
| `plantId` | string | `plant-north` |
| `client` | string | `Cliente S.A.` |
| `date` | string | `2026-05-09` |
| `items` | `BudgetItem[]` | Ver abajo |
| `taxRate` | number | `21` |
| `contingencyRate` | number | `5` |

Cada `BudgetItem`: `{ id, category, description, unit, quantity, unitPrice }`

### Resultados Monte Carlo (`stats`)

Tipo: `MonteCarloStats | null`
Se genera al ejecutar la simulación desde Riesgos. Se pierde al recargar.

| Campo | Descripción |
|-------|-------------|
| `min` | VAN mínimo |
| `max` | VAN máximo |
| `mean` | VAN promedio |
| `p5` | Percentil 5 (pesimista) |
| `p50` | Mediana |
| `p95` | Percentil 95 (optimista) |
| `distribution` | Histograma para el gráfico |

### Variables de UI (en todas las páginas)

| Página | Variable | Tipo | Controla |
|--------|----------|------|----------|
| Dashboard | `chartView` | `'pie' \| 'radar' \| 'line'` | Qué gráfico se muestra |
| Dashboard | `selectedPlant` | string | **Filtro global** que cambia TODOS los KPIs y gráficos |
| Alerts | `showResolved` | boolean | Muestra alertas activas o todas |
| Alerts | `showConfig` | boolean | Panel de configuración visible |
| Alerts | `activeTab` | `'registro' \| 'stats'` | Vista de registro o estadísticas |
| Projections | `period` | `'mensual' \| 'trimestral' \| 'anual'` | Agregación temporal del gráfico |
| Projections | `scenario` | `'base' \| 'optimista' \| 'pesimista'` | Multiplicador de datos (+15%/-15%) |
| Quality | `filter` | estado | Filtro de tabla por estado de muestra |
| Risks | `volatility` | 0.05-0.30 | **Volatilidad de mercado** para Monte Carlo |
| Layout | `mobilePreview` | boolean | Vista mobile/desktop |
| Layout | `sidebarOpen` | boolean | Sidebar en móvil |
| Reports | `importStatus` | string | Mensaje de importación |

---

## 4. DATOS FIJO/HARDCODEADOS

| Página | Dato | ¿Qué contiene? |
|--------|------|----------------|
| Quality | `rawSamples` | 8 muestras de control de calidad fijas |
| Weather | `rainDays` | Días de lluvia por mes |
| Weather | `impactPerDay` | 85 m³ perdidos por día de lluvia |
| Weather | `events` | 4 eventos climáticos |
| Alerts | `defaultAlerts` | 6 alertas de ejemplo iniciales |
| Alerts | `defaultConfig` | Umbrales de alerta por defecto |
| Settings | `defaultSettings` | Configuración por defecto |
| Risks | Parámetros Monte Carlo | investment: -1M, revenue: 150K, cost: 110K, duración: 24 meses, tasa: 12% |
| Risks | Tornado chart | Datos de sensibilidad fijos (no se generan dinámicamente) |
| Presupuestos | `defaultItems` | 7 ítems de presupuesto precargados |

---

## 5. MAPA DE IMPACTO: QUÉ AFECTA CADA CAMBIO

### Si modificás una **Planta** (desde Plants → Firebase → todas las páginas)

| Campo modificado | Páginas afectadas | Qué cambia |
|-----------------|-------------------|------------|
| `installedCapacity` | Dashboard, Projections | Producción mensual, OEE, productividad, capacidad total |
| `availability` | Dashboard, Comparativa | OEE, producción real |
| `performance` | Dashboard, Comparativa | OEE, producción real |
| `qualityRate` | Dashboard, Comparativa | OEE |
| `materials[].unitPrice` | Dashboard, Comparativa | Costo unitario, margen bruto |
| `materials[].quantityPerM3` | Dashboard, Comparativa | Costo unitario, margen bruto |
| `operations[].monthlyFixed` | Dashboard | Costo unitario (distribuido) |
| `operations[].variablePerM3` | Dashboard | Costo unitario |
| `name` | Todas | Etiquetas en todas las tablas, dropdowns y gráficos |

### Si modificás un **Proyecto** (desde Projects → Firebase → todas las páginas)

| Campo modificado | Páginas afectadas | Qué cambia |
|-----------------|-------------------|------------|
| `totalVolume` | Dashboard, Projections | Volumen total, ingresos, S-curve |
| `salePricePerM3` | Dashboard, Projections | Precio promedio, margen bruto, break-even |
| `durationMonths` | Dashboard | Duración promedio, ingresos anualizados |
| `discountRate` | Dashboard | VAN, payback |
| `plantId` | Dashboard, Quality | Filtros por planta |
| `name` | Dashboard, Projects, Quality | Etiquetas en tablas, filtros, dropdowns |

### Si modificás un **Mixer** (desde Mixers → Firebase → solo Mixers)

| Campo modificado | Qué cambia |
|-----------------|------------|
| `plate`, `driver`, `location` | Datos de tabla |
| `status` | KPI "En Operación", color del badge |
| `tripsToday` | KPI "Viajes Hoy" |
| `lostConcrete` | KPI "Hormigón Perdido" |
| `plantId` | Badges de planta, filtro |

### Si modificás **Alertas** (desde Alerts → localStorage → solo Alerts)

| Acción | Qué cambia |
|--------|------------|
| Resolver alerta | Se agrega entrada al historial, KPI "Resueltas" se actualiza |
| Reactivar alerta | Se agrega entrada al historial, KPI "Activas" se actualiza |
| Umbrales (sliders) | No afectan a datos existentes, solo definen límites visuales |

---

## 6. DIAGRAMA DE FLUJO DE DATOS DASHBOARD

Este es el flujo más complejo. Un cambio en una Planta o Proyecto repercute en cascada:

```
plants (Firestore)
  │
  ├── filteredPlants (filtrado por selectedPlant)
  │     ├── totalMaterialCost = avg(∑ unitPrice × quantityPerM3)
  │     ├── totalOpVariable = avg(∑ variablePerM3)
  │     ├── totalOpFixed = avg(∑ monthlyFixed / installedCapacity)
  │     ├── totalOp = totalOpVariable + totalOpFixed
  │     ├── totalAll = totalMaterialCost + totalOp
  │     ├── monthlyProduction = ∑ installedCapacity × performance
  │     ├── productividad = monthlyProduction / (25 × 8 × count)
  │     └── plantOEE(p) = availability × performance × qualityRate × 100
  │           ├── OEE KPI card
  │           ├── radar chart (per plant)
  │           └── gauge chart (average)
  │
  └── costDistributionOption (pie chart)
        ├── Materiales
        ├── Operación (variable)
        ├── Mantenimiento
        └── Logística

projects (Firestore)
  │
  ├── filteredProjects (filtrado por selectedPlant)
  │     ├── avgSalePrice → grossMargin, yearlyRevenue
  │     ├── totalVolume → yearlyRevenue, yearlyCost, S-curve
  │     └── avgDuration → yearlyRevenue, yearlyCost
  │
  └── curvaSOption (S-curve)
        ├── Planificado (curva basada en volumen total)
        ├── Real (curva basada en proyectos activos)
        └── Variación (diferencia)

Cálculos finales (cambian TODOS con cada filtro o modificación):
  │
  ├── vanEst = yearlyRevenue - yearlyCost
  ├── roi = (yearlyRevenue - yearlyCost) / yearlyCost × 100
  ├── paybackMonths = (totalAll × totalVolume) / (monthlyProduction × (avgSalePrice - totalAll)) × 12
  ├── grossMargin = (avgSalePrice - totalAll) / avgSalePrice × 100
  └── yearlyRevenue / yearlyCost (proyectados)
```

---

## 7. DIAGRAMA DE FLUJO PROYECCIONES

```
plants (Firestore)
  └── totalCapacity = ∑ installedCapacity × performance
        └── monthlyProduction = totalCapacity
              ├── monthlyRevenue = monthlyProduction × avgSalePrice / 1000
              │     └── cashFlowData (12 meses) → escenario (×1, ×1.15, ×0.85) → chart
              └── monthlyCost = monthlyProduction × avgMatCost / 1000
                    └── breakEvenPoint

projects (Firestore)
  ├── avgSalePrice → monthlyRevenue, breakEven
  └── avgMatCost → monthlyCost, breakEven
```

---

## 8. PARÁMETROS DEL WORKER DE MONTE CARLO (Riesgos)

Son valores fijos en `runSimulation()` (Risks.tsx líneas 15-23):

| Parámetro | Valor fijo | ¿Qué simula? |
|-----------|------------|--------------|
| `iterations` | 3000 | Número de iteraciones de Monte Carlo |
| `initialInvestment` | -1,000,000 | Inversión inicial (negativo = egreso) |
| `monthlyRevenueBase` | 150,000 | Ingreso mensual base en USD |
| `monthlyCostBase` | 110,000 | Costo mensual base en USD |
| `durationMonths` | 24 | Duración del proyecto en meses |
| `discountRate` | 0.12 (12%) | Tasa de descuento anual |

- **Volatilidad**: control deslizante del usuario (0.05 a 0.30), default 0.10
  - `volatility.revenue` = valor del slider
  - `volatility.cost` = slider × 0.8

- El worker genera valores aleatorios con distribución normal (Box-Muller) alrededor de los valores base, aplicando la volatilidad para crear escenarios. Calcula el VAN para cada iteración y devuelve estadísticas (min, max, mean, p5, p50, p95 + histograma).

---

## 9. HOOKS DE FIRESTORE (useFirestore.ts)

| Hook | Firma | Cache key | staleTime |
|------|-------|-----------|-----------|
| `useFirestoreCollection<T>` | `(collectionName) → { data, isLoading, refetch }` | `[collectionName]` | 5 min |
| `useFirestoreDocument<T>` | `(collectionName, id) → { data }` | `[collectionName, id]` | 5 min |
| `useCreateDocument` | `(collectionName) → { mutateAsync }` | Invalida `[collectionName]` | - |
| `useUpdateDocument` | `(collectionName) → { mutateAsync }` | Invalida `[collectionName]` | - |
| `useDeleteDocument` | `(collectionName) → { mutateAsync }` | Invalida `[collectionName]` | - |

> **Regla de oro**: cada creación/actualización/eliminación invalida la caché de TODA la colección, haciendo que todas las páginas que la usen se refresquen automáticamente.

---

## 10. VARIABLES QUE NO SE USAN O ESTÁN HUÉRFANAS

| Variable | Ubicación | Problema |
|----------|-----------|----------|
| `infoCount` (Alerts.tsx:120) | Declarada pero no usada en JSX | Cálculo innecesario |
| `app_settings` (localStorage) | Settings escribe, nadie lee | Datos guardados sin consumidor |
| Tornado chart (Risks.tsx:50-73) | Datos hardcodeados, no dinámicos | No refleja datos reales |
| `react-router-dom` en package.json | No se usa | La app usa state-based routing |
| `importExport.handleImportCSV` | Reportes | Solo muestra un mensaje, no importa realmente |

---

## 11. ZONAS DE RIESGO

| Situación | ¿Qué pasa? |
|-----------|------------|
| Recargar Presupuestos | **Todos los presupuestos se pierden** (no hay persistencia) |
| Recargar Riesgos | **Resultados de Monte Carlo se pierden** (solo en memoria) |
| Dos usuarios modifican la misma planta/proyecto/mixer simultáneamente | **Gana el último** (Firestore no tiene control de concurrencia en esta app) |
| Clave `alert_data` tiene formato viejo | Hay migración automática, pero si está corrupta, se resetea a defaults |
| Modificar `installedCapacity` de una planta | **Cambia todos los cálculos** del Dashboard, Proyecciones, y Comparativa |

---

## 12. RESUMEN: ¿QUÉ VARIABLE TOCAR PARA...?

| Si querés... | Tocá... | Dónde |
|-------------|---------|-------|
| Agregar/quitar plantas | CRUD en Plants | Firebase `plants` |
| Agregar/quitar proyectos | CRUD en Projects | Firebase `projects` |
| Agregar/quitar mixers | CRUD en Mixers | Firebase `mixers` |
| Cambiar capacidad de planta | `installedCapacity` en Plants | Firebase `plants` |
| Cambiar OEE | `availability`, `performance`, `qualityRate` en Plants | Firebase `plants` |
| Cambiar costos | `materials[].unitPrice`, `materials[].quantityPerM3`, `operations[].monthlyFixed`, `operations[].variablePerM3` | Firebase `plants` |
| Cambiar precio de venta | `salePricePerM3` en Projects | Firebase `projects` |
| Ver alertas activas | Alertas (Registro) | localStorage `alert_data` |
| Resolver/reactivar alerta | Botones en Alertas | localStorage `alert_data` |
| Cambiar umbrales de alerta | Sliders en Alertas | localStorage `alert_config` |
| Probar escenarios económicos | Pestaña "Escenario" en Proyecciones | Memoria (UI) |
| Ejecutar Monte Carlo | Botón "Ejecutar" en Riesgos | Worker + memoria |
| Exportar a Excel/PDF | Botones en Dashboard, Reports | Servicio importExport |
| Filtrar Dashboard por planta | Selector de planta en Dashboard | Memoria (UI) |
| Ver configuración general | Settings (guardado aislado) | localStorage `app_settings` |

---

*Documento generado el 09/05/2026*
