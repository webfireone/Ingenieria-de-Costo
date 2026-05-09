# Documentación Técnica: Ingeniería de Costos

Este documento detalla la lógica de negocio y las fórmulas implementadas en la plataforma **ConcreteEng PRO**.

## 1. Indicadores Financieros

### Valor Actual Neto (VAN / NPV)
Calcula el valor presente de una serie de flujos de caja futuros, descontados a una tasa específica.
- **Fórmula:** `Σ [CFt / (1+r)^t]`
- **Implementación:** `calculateNPV` en `formulas.ts`

### Tasa Interna de Retorno (TIR / IRR)
La tasa de descuento que hace que el VAN sea igual a cero.
- **Método:** Newton-Raphson para convergencia numérica.
- **Implementación:** `calculateIRR` en `formulas.ts`

### Período de Recuperación (Payback)
Tiempo necesario para que los flujos de caja acumulados cubran la inversión inicial.
- **Método:** Interpolación lineal entre el último periodo negativo y el primero positivo.

## 2. Eficiencia Operativa (OEE)

El **Overall Equipment Effectiveness** se calcula como el producto de tres factores:
1. **Disponibilidad:** (Tiempo Operativo / Tiempo Planeado)
2. **Rendimiento:** (Producción Real / Producción Teórica)
3. **Calidad:** (Unidades Buenas / Producción Total)

**Fórmula:** `OEE = Disponibilidad × Rendimiento × Calidad`

## 3. Simulación Monte Carlo

La simulación de riesgos utiliza un modelo estocástico para proyectar el VAN bajo incertidumbre:
- **Distribución:** Normal (Gaussiana) para variaciones de ingresos y costos.
- **Iteraciones:** 3,000 por ejecución.
- **Salida:** Percentiles de riesgo (P5), mediana (P50) y escenario optimista (P95).
- **Procesamiento:** Ejecutado en un **Web Worker** para no bloquear la interfaz de usuario.

## 4. Análisis de Sensibilidad (Tornado)

Mide el impacto individual de cada variable crítica (Cemento, Energía, MO) manteniendo las demás constantes. Ayuda a identificar los mayores "drivers" de costo en la planta.
