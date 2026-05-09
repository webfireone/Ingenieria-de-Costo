export type ScenarioType = 'base' | 'optimistic' | 'pessimistic';

export interface MaterialCost {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  quantityPerM3: number;
}

export interface OperationalCost {
  id: string;
  name: string;
  monthlyFixed: number;
  variablePerM3: number;
}

export interface Plant {
  id: string;
  name: string;
  location: string;
  installedCapacity: number; // m3/month
  availability: number; // 0-1
  performance: number; // 0-1
  qualityRate: number; // 0-1
  materials: MaterialCost[];
  operations: OperationalCost[];
}

export interface Project {
  id: string;
  name: string;
  plantId: string;
  totalVolume: number; // m3
  durationMonths: number;
  salePricePerM3: number;
  startDate: string;
  discountRate: number; // annual
}

export interface SimulationResult {
  npv: number;
  irr: number;
  payback: number;
  breakEven: number;
  totalCost: number;
  totalRevenue: number;
  margin: number;
  oee: number;
}

export interface MonteCarloStats {
  min: number;
  max: number;
  mean: number;
  p5: number;
  p50: number;
  p95: number;
  distribution: { x: number; y: number }[];
}

export interface SensitivityData {
  parameter: string;
  lowImpact: number;
  highImpact: number;
  baseValue: number;
}
