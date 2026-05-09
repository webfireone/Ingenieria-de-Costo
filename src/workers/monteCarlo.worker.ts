// Monte Carlo Simulation Worker
// Offloads heavy stochastic processing from the main thread

import { calculateNPV, calculateIRR } from '../services/formulas';

interface SimulationInput {
  iterations: number;
  initialInvestment: number;
  monthlyRevenueBase: number;
  monthlyCostBase: number;
  durationMonths: number;
  discountRate: number;
  volatility: {
    revenue: number; // e.g. 0.1 for 10%
    cost: number;
  };
}

/**
 * Generates a random value using a Box-Muller transform for normal distribution
 */
const randomNormal = (mean: number, stdDev: number) => {
  const u = 1 - Math.random();
  const v = 1 - Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
};

self.onmessage = (e: MessageEvent<SimulationInput>) => {
  const { 
    iterations, 
    initialInvestment, 
    monthlyRevenueBase, 
    monthlyCostBase, 
    durationMonths, 
    discountRate,
    volatility 
  } = e.data;

  const results: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const cashFlows = [initialInvestment];
    
    for (let t = 1; t <= durationMonths; t++) {
      // Simulate monthly fluctuations
      const revenue = randomNormal(monthlyRevenueBase, monthlyRevenueBase * volatility.revenue);
      const cost = randomNormal(monthlyCostBase, monthlyCostBase * volatility.cost);
      cashFlows.push(revenue - cost);
    }

    const npv = calculateNPV(cashFlows, discountRate / 12); // monthly discount rate
    results.push(npv);
  }

  // Sort results for percentiles
  results.sort((a, b) => a - b);

  const stats = {
    min: results[0],
    max: results[results.length - 1],
    mean: results.reduce((a, b) => a + b, 0) / results.length,
    p5: results[Math.floor(iterations * 0.05)],
    p50: results[Math.floor(iterations * 0.50)],
    p95: results[Math.floor(iterations * 0.95)],
    distribution: generateHistogram(results, 50)
  };

  self.postMessage(stats);
};

function generateHistogram(data: number[], bins: number) {
  const min = data[0];
  const max = data[data.length - 1];
  const binWidth = (max - min) / bins;
  const histogram: { x: number; y: number }[] = [];

  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = data.filter(v => v >= binStart && v < binEnd).length;
    histogram.push({ x: (binStart + binEnd) / 2, y: count });
  }

  return histogram;
}
