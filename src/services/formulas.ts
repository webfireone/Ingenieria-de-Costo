/**
 * Core formulas for Concrete Plant Cost Engineering
 */

/**
 * Net Present Value (VAN)
 * @param cashFlows Array of cash flows [Initial Investment, CF1, CF2, ...]
 * @param discountRate Periodic discount rate (decimal)
 */
export const calculateNPV = (cashFlows: number[], discountRate: number): number => {
  return cashFlows.reduce((acc, cf, t) => {
    return acc + cf / Math.pow(1 + discountRate, t);
  }, 0);
};

/**
 * Internal Rate of Return (TIR) using Newton-Raphson
 */
export const calculateIRR = (cashFlows: number[], guest: number = 0.1): number => {
  const maxIterations = 1000;
  const precision = 1e-7;
  let irr = guest;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dNPV = 0; // Derivative of NPV

    for (let t = 0; t < cashFlows.length; t++) {
      const discount = Math.pow(1 + irr, t);
      npv += cashFlows[t] / discount;
      if (t > 0) {
        dNPV -= (t * cashFlows[t]) / Math.pow(1 + irr, t + 1);
      }
    }

    const nextIrr = irr - npv / dNPV;
    if (Math.abs(nextIrr - irr) < precision) return nextIrr;
    irr = nextIrr;
  }
  return irr;
};

/**
 * Payback Period
 */
export const calculatePayback = (cashFlows: number[]): number => {
  let cumulativeCF = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    const prevCumulative = cumulativeCF;
    cumulativeCF += cashFlows[t];
    if (cumulativeCF >= 0 && t > 0) {
      // Linear interpolation for more precision
      return t - 1 + Math.abs(prevCumulative) / cashFlows[t];
    }
  }
  return -1; // Never pays back
};

/**
 * Break-even Point (Punto de Equilibrio en m3)
 */
export const calculateBreakEven = (
  fixedCosts: number,
  salePrice: number,
  variableCostPerM3: number
): number => {
  const margin = salePrice - variableCostPerM3;
  return margin > 0 ? fixedCosts / margin : Infinity;
};

/**
 * Overall Equipment Effectiveness (OEE)
 * OEE = Availability * Performance * Quality
 */
export const calculateOEE = (
  availability: number, // 0-1
  performance: number, // 0-1
  quality: number // 0-1
): number => {
  return availability * performance * quality;
};

/**
 * Total Cost per m3
 */
export const calculateUnitCost = (
  materials: { quantityPerM3: number; unitPrice: number }[],
  operationalVariable: number,
  fixedCostsAllocated: number
): number => {
  const materialCost = materials.reduce((sum, m) => sum + m.quantityPerM3 * m.unitPrice, 0);
  return materialCost + operationalVariable + fixedCostsAllocated;
};
