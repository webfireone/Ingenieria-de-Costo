# MANUAL DE USUARIO — GRUPO FALPAT

## Ingeniería de Costo

---

### ¿Qué hace este sistema?

Este tablero le permite **cargar datos clave de su operación** (plantas, proyectos, camiones mixer, presupuestos, control de calidad, etc.) y automáticamente el sistema **calcula indicadores, gráficos y alertas** para que pueda tomar decisiones informadas sin hacer cuentas manuales.

No necesita saber programación ni fórmulas complejas. Solo cargar los datos que ya maneja en el día a día.

---

### Índice

1. [Conceptos básicos](#1-conceptos-básicos)
2. [Plantas de Hormigón](#2-plantas-de-hormigón)
3. [Proyectos y Obras](#3-proyectos-y-obras)
4. [Presupuestos y Cotizaciones](#4-presupuestos-y-cotizaciones)
5. [Mixers (Camiones)](#5-mixers-camiones)
6. [Control de Calidad](#6-control-de-calidad)
7. [Clima y Lluvias](#7-clima-y-lluvias)
8. [Alertas](#8-alertas)
9. [Comparativa entre Plantas](#9-comparativa-entre-plantas)
10. [Proyecciones Financieras](#10-proyecciones-financieras)
11. [Análisis de Riesgos](#11-análisis-de-riesgos)
12. [Reportes y Exportación](#12-reportes-y-exportación)
13. [Configuración del Sistema](#13-configuración-del-sistema)
14. [Dashboard — El Panel Principal](#14-dashboard--el-panel-principal)

---

### 1. Conceptos básicos

**¿Qué es una "Planta"?**
Una planta de hormigón. Cada planta tiene costos de materiales (cemento, arena, piedra, aditivos) y costos de operación (mano de obra, energía, mantenimiento).

**¿Qué es un "Proyecto"?**
Una obra o cliente al que le vende hormigón. Cada proyecto tiene un volumen total, un precio de venta y una duración estimada.

**¿Qué es un "Mixer"?**
Un camión hormigonero. Cada mixer tiene asignado un conductor, una planta de origen y un estado (disponible, en ruta, descargando, etc.).

**¿Qué es un "Presupuesto"?**
Una cotización que le hace a un cliente, con el detalle de ítems (materiales, mano de obra, equipos, etc.), impuestos y contingencias.

**¿Dónde se guarda la información?**
Los datos se guardan automáticamente en la nube (Firebase). Todos los usuarios que usen el sistema ven la misma información actualizada. No necesita guardar ni exportar manualmente.

---

### 2. Plantas de Hormigón

**📍 Dónde está:** Menú lateral → **Plantas**

#### Qué datos cargar

Complete una planta con la siguiente información:

| Campo | ¿Qué es? | Ejemplo |
|-------|----------|---------|
| Nombre | Nombre de la planta | "Planta Norte" |
| Ubicación | Dirección o zona | "Av. Siempre Viva 123" |
| Capacidad instalada | Cuántos m³ puede producir por mes | 5000 |
| Disponibilidad | % del tiempo que la planta está operativa (0 a 1) | 0.92 |
| Rendimiento | % de la capacidad que realmente se usa (0 a 1) | 0.85 |
| Tasa de calidad | % de producción que cumple estándares (0 a 1) | 0.98 |

Además, debe cargar:

**Materiales** (toque "Agregar Material"):
- Nombre del material (ej: "Cemento Portland", "Arena Fina", "Piedra 6-20")
- Unidad de medida (tonelada, m³, kg, litro, unidad)
- Precio por unidad
- Cantidad que se consume por cada m³ de hormigón

**Costos Operativos** (toque "Agregar Costo"):
- Nombre del concepto (ej: "Mano de obra", "Energía eléctrica")
- Costo fijo mensual (lo que se paga todos los meses, produzca o no)
- Costo variable por m³ (lo que aumenta con cada m³ producido)

#### Qué información obtendrá

- **Capacidad total** de todas sus plantas
- **OEE** (Eficiencia Global de la Planta): un indicador que combina disponibilidad, rendimiento y calidad. A mayor OEE, mejor.
- **Costo de materiales por m³**: cuánto le sale cada m³ de hormigón en materiales
- **Costo operativo por m³**: cuánto le sale la operación por cada m³
- **Tabla de costos**: desglose de cada material y cada costo operativo

---

### 3. Proyectos y Obras

**📍 Dónde está:** Menú lateral → **Proyectos**

#### Qué datos cargar

| Campo | ¿Qué es? | Ejemplo |
|-------|----------|---------|
| Nombre | Nombre del proyecto u obra | "Edificio Torres del Río" |
| Planta | A qué planta está asociado | "Planta Norte" |
| Volumen total | Cantidad total de hormigón del proyecto (m³) | 2500 |
| Duración | Meses estimados de obra | 8 |
| Precio de venta | A qué precio vende el m³ al cliente | $185 |
| Tasa de descuento | Tasa anual para calcular el VAN | 0.12 |
| Fecha de inicio | Cuándo arranca la obra | 01/03/2026 |

#### Qué información obtendrá

- **Volumen total** de todos los proyectos activos
- **Precio de venta promedio** por m³
- **Duración promedio** de las obras
- **Ingreso total estimado** por proyecto (volumen × precio)
- Tabla con todos los proyectos y su estado

---

### 4. Presupuestos y Cotizaciones

**📍 Dónde está:** Menú lateral → **Presupuestos**

#### Qué datos cargar

| Campo | ¿Qué es? | Ejemplo |
|-------|----------|---------|
| Nombre | Identificador del presupuesto | "Presupuesto Torres del Río" |
| Proyecto | Nombre del proyecto asociado | "Edificio Torres del Río" |
| Cliente | Nombre del cliente | "Constructora ABC" |
| Planta | Planta que abastecerá | "Planta Norte" |
| Fecha | Fecha del presupuesto | Hoy |
| % IVA | Porcentaje de impuesto | 21% |
| % Contingencia | Porcentaje adicional por imprevistos | 5% |

Luego debe cargar los **ítems del presupuesto**. El sistema le sugiere 7 ítems por defecto (Materiales, Mano de obra, Equipos, Transporte, Gastos generales, Subcontrataciones, Imprevistos). Para cada uno:
- Cantidad
- Precio unitario

#### Qué información obtendrá

- **Total presupuestado**: suma de todos los ítems más IVA y contingencias
- **Subtotal**: suma de ítems antes de impuestos
- **Margen estimado**: qué porcentaje de ganancia estima
- **Botón "Descargar PDF"**: genera un PDF listo para entregar al cliente

---

### 5. Mixers (Camiones)

**📍 Dónde está:** Menú lateral → **Mixers**

#### Qué datos cargar

| Campo | ¿Qué es? | Ejemplo |
|-------|----------|---------|
| Patente | Número de placa del camión | "AB 123 CD" |
| Conductor | Nombre del chofer | "Juan Pérez" |
| Planta | Planta a la que está asignado | "Planta Norte" |
| Estado | Situación actual del mixer | "Disponible", "En ruta", "En obra", "Descargando", "Mantenimiento" |
| Ubicación | Dónde está ahora | "Ruta 8, km 45" |
| Capacidad | Cuántos m³ transporta | 7 |
| Tiempo de ciclo | Minutos que tarda en completar un viaje | 90 |
| Viajes hoy | Cuántos viajes hizo hoy | 4 |
| Hormigón perdido | Cuántos m³ se perdieron (derrames, devoluciones) | 0.5 |

#### Qué información obtendrá

- **Total de camiones** en la flota
- **Camiones en operación** (los que no están en mantenimiento ni disponibles)
- **Porcentaje de utilización** de la flota
- **Viajes totales** del día
- **Hormigón perdido total** (para identificar pérdidas)
- Por cada planta, cuántos mixers tiene asignados
- Tabla completa con todos los datos de cada mixer y su estado (con colores: verde = disponible, azul = en ruta, etc.)

---

### 6. Control de Calidad

**📍 Dónde está:** Menú lateral → **Calidad**

#### Qué datos cargar

El sistema ya incluye 8 muestras de ejemplo. Usted puede modificarlas o agregar nuevas con:

| Campo | ¿Qué es? | Ejemplo |
|-------|----------|---------|
| Muestra | Identificador | "M-001" |
| Proyecto | Proyecto al que pertenece | "Edificio Torres del Río" |
| Clase de hormigón | Resistencia nominal | "H-30" |
| Slump real | Asentamiento medido (cm) | 12 |
| Slump objetivo | Asentamiento deseado (cm) | 10 |
| Resistencia 7 días | Resistencia a los 7 días (MPa) | 22 |
| Resistencia 28 días | Resistencia a los 28 días (MPa) | 33 |
| Resistencia objetivo | Resistencia que debe alcanzar (MPa) | 30 |
| Fecha | Fecha del ensayo | Hoy |
| Estado | Resultado | "Aprobado", "Rechazado", "En curso" |

#### Qué información obtendrá

- **Total de muestras** procesadas
- **Porcentaje de aprobación** y rechazo
- **Resistencia promedio a 28 días**
- **Gráfico de resistencias**: barras con la resistencia a 7 y 28 días de cada muestra, más la línea del objetivo
- **Gráfico de slump**: puntos con el asentamiento medido vs el objetivo
- Tabla detallada con filtros por estado (todos, aprobados, rechazados, en curso)

---

### 7. Clima y Lluvias

**📍 Dónde está:** Menú lateral → **Clima**

#### ¿Qué datos cargar?

**Ninguno.** El sistema obtiene automáticamente los datos del **Servicio Meteorológico Nacional (SMN)** y registra automáticamente cada día si llovió o no.

- Los datos se actualizan cada **30 minutos**
- El registro histórico se guarda automáticamente en la nube
- Con el tiempo, el sistema acumula un historial real de días de lluvia

#### Qué información obtendrá

- **Clima actual**: temperatura, humedad, viento, presión
- **Pronóstico 7 días**: temperatura máxima y mínima, si va a llover, con íconos
- **Días de lluvia del año**: suma de días con lluvia (reales + proyectados)
- **Producción perdida estimada**: cada día de lluvia equivale a 85 m³ no producidos
- **Impacto económico**: cuánto dinero se deja de facturar por lluvia
- **Gráfico mensual**: barras con días de lluvia registrados (azul sólido) y proyectados (azul transparente), más una línea roja con el impacto en producción
- **Eventos climáticos recientes**: tormentas y lluvias fuertes detectadas automáticamente

---

### 8. Alertas

**📍 Dónde está:** Menú lateral → **Alertas**

#### Qué datos cargar

No necesita cargar alertas manualmente. El sistema genera alertas automáticas basadas en los datos de sus plantas y proyectos.

Puede **configurar los umbrales** (límites) que disparan las alertas:

| Umbral | ¿Qué controla? | Valor sugerido |
|--------|----------------|----------------|
| Variación de precio | Máxima variación permitida en precio de materiales | 10% |
| Desviación de slump | Máxima diferencia entre slump real y objetivo (cm) | 3 cm |
| Desviación de resistencia | Máxima diferencia entre resistencia medida y objetivo (MPa) | 5 MPa |
| OEE mínimo | Mínima eficiencia global aceptable | 75% |
| Producción mínima | Mínima producción mensual aceptable (m³) | 3000 m³ |

#### Qué información obtendrá

- **Alertas activas**: cuántas hay sin resolver
- **Alertas críticas**: las más importantes (rojo)
- **Advertencias**: alertas de nivel medio (amarillo)
- **Alertas resueltas**: histórico de las que ya se solucionaron
- Lista completa de alertas con descripción, fuente, fecha y estado
- **Pestaña de estadísticas**:
  - Alertas más frecuentes
  - Alertas que se repiten (reincidentes)
  - Alertas por fuente (insumos, eficiencia, calidad, mantenimiento, producción)
  - Alertas por planta

---

### 9. Comparativa entre Plantas

**📍 Dónde está:** Menú lateral → **Comparativa**

#### Qué datos cargar

**Ninguno.** El sistema usa automáticamente los datos de todas las plantas que cargó en la sección **Plantas**.

#### Qué información obtendrá

- **Cantidad de plantas** registradas
- **Capacidad total** de todas las plantas juntas
- **OEE máximo** entre todas sus plantas (cuál es la mejor)
- **Mejor costo de materiales**: qué planta tiene los materiales más baratos
- **Gráfico de barras**: comparación visual de todas las plantas en capacidad, OEE y costo de materiales
- **Tabla comparativa**: filas con indicadores (capacidad, disponibilidad, rendimiento, calidad, OEE, costos) y columnas con cada planta. Ideal para ver de un vistazo qué planta rinde mejor y cuál necesita mejoras

---

### 10. Proyecciones Financieras

**📍 Dónde está:** Menú lateral → **Proyecciones**

#### Qué datos cargar

**Ninguno.** El sistema usa automáticamente los datos de sus **Plantas** y **Proyectos**.

Puede elegir:
- **Período**: mensual, trimestral o anual
- **Escenario**: base (normal), optimista (+15%), pesimista (−15%)

#### Qué información obtendrá

- **Ingreso proyectado**: cuánto dinero estima facturar
- **Punto de equilibrio**: cuántos m³ por mes necesita producir para no perder dinero
- **Gráfico de flujo de caja**: barras de ingresos y egresos, con línea de flujo neto
- **Gráfico de punto de equilibrio**: cruce entre la línea de ingresos y la línea de costos totales. El punto donde se cruzan es su punto de equilibrio

---

### 11. Análisis de Riesgos

**📍 Dónde está:** Menú lateral → **Riesgos**

#### Qué datos cargar

Solo un parámetro:

| Parámetro | ¿Qué es? | Valor sugerido |
|-----------|----------|----------------|
| Volatilidad | Qué tan variables pueden ser sus ingresos y costos | 0.10 (10%) |

Luego toque el botón **"Ejecutar 3,000 iteraciones"** para que el sistema haga una simulación.

#### Qué información obtendrá

- **Media (P50)**: el resultado más probable de su proyecto (VAN)
- **Riesgo (P5)**: el peor escenario razonable (solo hay 5% de probabilidad de que sea peor)
- **Gráfico de distribución**: una campana que muestra todos los resultados posibles y qué tan probable es cada uno
- **Gráfico de tornado**: qué factores afectan más su resultado (ej: si el cemento sube, si la demanda baja, etc.)

> Esto es una **simulación Monte Carlo**: el sistema hace 3,000 cálculos variando los valores aleatoriamente para mostrarle todos los escenarios posibles.

---

### 12. Reportes y Exportación

**📍 Dónde está:** Menú lateral → **Reportes**

#### Qué datos cargar

**Ninguno.** Solo elija qué quiere hacer:

- **Exportar Plantas a Excel**: descarga un archivo .xlsx con todas sus plantas
- **Exportar Proyectos a Excel**: descarga un archivo .xlsx con todos sus proyectos
- **Descargar Reporte PDF**: genera un PDF con el reporte ejecutivo de plantas
- **Importar Datos**: seleccione un archivo .csv o .xlsx para cargar datos (requiere procesamiento manual)

#### Qué información obtendrá

Archivos listos para compartir con su equipo, clientes o gerencia.

---

### 13. Configuración del Sistema

**📍 Dónde está:** Menú lateral → **Configuración** (abajo del todo)

#### Qué datos cargar

| Parámetro | ¿Qué es? | Valor sugerido |
|-----------|----------|----------------|
| Tasa de descuento | Tasa anual para cálculos financieros | 12% |
| Inflación anual | Inflación estimada del país | 3.5% |
| Tasa impositiva | Impuesto a las ganancias | 25% |
| Costo de combustible | Precio por litro de gasoil | $1.45 |
| Moneda | Moneda en la que trabaja | USD / ARS / etc. |

#### Qué información obtendrá

- Confirmación de que los datos se guardaron correctamente

---

### 14. Dashboard — El Panel Principal

**📍 Dónde está:** Menú lateral → **Dashboard** (primer ícono)

#### Qué datos cargar

**Ninguno.** El panel principal reúne automáticamente los datos de todas las secciones anteriores.

#### Qué información obtendrá

**Indicadores clave (KPIs):**

| Indicador | ¿Qué significa? |
|-----------|-----------------|
| Producción Mensual | Cuántos m³ produce al mes en total |
| Costo Promedio | Cuánto le cuesta producir cada m³ (materiales + operación) |
| Margen Bruto | Qué porcentaje de ganancia tiene sobre el precio de venta |
| Eficiencia (OEE) | Calificación general de eficiencia de sus plantas |
| VAN Estimado | Valor actual neto estimado de todos sus proyectos |
| ROI Proyectado | Retorno sobre la inversión (porcentaje de ganancia) |
| Payback | En cuántos meses recupera la inversión |
| Productividad | m³ producidos por hora y por persona |

**Gráficos:**

- **Costos Operativos** (elija entre 4 vistas):
  - *Distribución*: gráfico de torta que muestra cómo se reparten sus costos
  - *Radar KPIs*: tela de araña comparando plantas en 5 indicadores
  - *Evolución*: línea de costo por mes, comparando plantas
  - *3D Costos*: gráfico 3D con barras por planta y categoría de costo (gire con el mouse)
- **Eficiencia Global**: indicador tipo velocímetro con el OEE promedio
- **Curva S**: avance de producción planificado vs real (acumulado mensual)
- **Alertas**: eventos importantes de control y calidad

**Botones de exportación:**
- Exportar a Excel
- Descargar PDF

> 💡 **Use el selector "Todas las plantas"** para filtrar todos los indicadores y gráficos a una planta específica.

---

### Consejos rápidos

1. **Empiece por Plantas**: cargue sus plantas con todos los materiales y costos operativos. Es la base de todo el sistema.
2. **Luego cargue Proyectos**: así el sistema podrá calcular márgenes, VAN, ROI y proyecciones.
3. **Cargue los Mixers**: para tener visibilidad de su flota y el hormigón perdido.
4. **Revise el Dashboard**: una vez que tenga datos cargados, el panel principal le mostrará todos los indicadores.
5. **Las Alertas se generan solas**: no las cargue manualmente, revise la pestaña de estadísticas para ver patrones.
6. **El Clima se actualiza solo**: los datos vienen del SMN, usted no tiene que hacer nada.
7. **Todo se guarda automáticamente**: no necesita presionar "Guardar". Los datos persisten en la nube.

---

*Documento generado para GRUPO FALPAT — Sistema de Ingeniería de Costo*
