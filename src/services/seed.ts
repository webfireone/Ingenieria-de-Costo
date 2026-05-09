import { collection, doc, writeBatch, enableIndexedDbPersistence } from 'firebase/firestore';
import { db } from './firebase';
import { Plant, Project } from '../types';

export const seedDatabase = async () => {
  console.log('Iniciando proceso de seeding...');
  const batch = writeBatch(db);

  try {
    const plants: Plant[] = [
      {
        id: 'plant-north',
        name: 'Planta Norte - Industrial',
        location: 'Sector Industrial Norte',
        installedCapacity: 5000,
        availability: 0.92,
        performance: 0.88,
        qualityRate: 0.98,
        materials: [
          { id: 'mat-1', name: 'Cemento Portland', unit: 'ton', unitPrice: 120, quantityPerM3: 0.35 },
          { id: 'mat-2', name: 'Arena Fina', unit: 'm3', unitPrice: 25, quantityPerM3: 0.8 },
          { id: 'mat-3', name: 'Grava 3/4', unit: 'm3', unitPrice: 30, quantityPerM3: 1.1 },
        ],
        operations: [
          { id: 'op-1', name: 'Energía Eléctrica', monthlyFixed: 1500, variablePerM3: 2.5 },
          { id: 'op-2', name: 'Mantenimiento', monthlyFixed: 3000, variablePerM3: 1.2 },
          { id: 'op-3', name: 'Salarios Operativos', monthlyFixed: 8000, variablePerM3: 0 },
        ]
      },
      {
        id: 'plant-south',
        name: 'Planta Sur - Logística',
        location: 'Puerto de Carga',
        installedCapacity: 4000,
        availability: 0.85,
        performance: 0.90,
        qualityRate: 0.95,
        materials: [
          { id: 'mat-1', name: 'Cemento Portland', unit: 'ton', unitPrice: 125, quantityPerM3: 0.35 },
          { id: 'mat-2', name: 'Arena Fina', unit: 'm3', unitPrice: 22, quantityPerM3: 0.8 },
          { id: 'mat-3', name: 'Grava 3/4', unit: 'm3', unitPrice: 28, quantityPerM3: 1.1 },
        ],
        operations: [
          { id: 'op-1', name: 'Energía Eléctrica', monthlyFixed: 1200, variablePerM3: 2.8 },
          { id: 'op-2', name: 'Mantenimiento', monthlyFixed: 2500, variablePerM3: 1.5 },
          { id: 'op-3', name: 'Salarios Operativos', monthlyFixed: 7500, variablePerM3: 0 },
        ]
      }
    ];

    const projects: Project[] = [
      {
        id: 'proj-skyline',
        name: 'Edificio Skyline Towers',
        plantId: 'plant-north',
        totalVolume: 12000,
        durationMonths: 18,
        salePricePerM3: 185,
        startDate: new Date().toISOString(),
        discountRate: 0.12
      },
      {
        id: 'proj-bridge',
        name: 'Puente Interurbano',
        plantId: 'plant-north',
        totalVolume: 8500,
        durationMonths: 12,
        salePricePerM3: 210,
        startDate: new Date().toISOString(),
        discountRate: 0.10
      }
    ];

    plants.forEach(plant => {
      const ref = doc(db, 'plants', plant.id);
      batch.set(ref, plant);
    });

    projects.forEach(project => {
      const ref = doc(db, 'projects', project.id);
      batch.set(ref, project);
    });

    console.log('Enviando batch a Firestore...');
    await batch.commit();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error detallado en seeding:', error);
    throw error;
  }
};
