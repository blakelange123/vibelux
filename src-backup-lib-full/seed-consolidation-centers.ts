import { prisma } from '@/lib/prisma';

export async function seedConsolidationCenters() {
  const centers = [
    {
      name: 'Bay Area Cold Storage Hub',
      address: '1234 Distribution Way',
      city: 'Oakland',
      state: 'CA',
      zipCode: '94612',
      latitude: 37.8044,
      longitude: -122.2711,
      coldStorage: true,
      temperatureRanges: [
        { min: 32, max: 40, unit: 'F' },
        { min: 40, max: 50, unit: 'F' }
      ],
      maxCapacity: 500,
      capacityUnit: 'pallets',
      services: ['cross-docking', 'repackaging', 'quality-inspection', 'labeling'],
      operatingHours: {
        monday: { open: '06:00', close: '22:00' },
        tuesday: { open: '06:00', close: '22:00' },
        wednesday: { open: '06:00', close: '22:00' },
        thursday: { open: '06:00', close: '22:00' },
        friday: { open: '06:00', close: '22:00' },
        saturday: { open: '08:00', close: '18:00' },
        sunday: 'closed'
      },
      certifications: ['USDA Approved', 'SQF Certified', 'HACCP'],
      rating: 4.8,
      reviewCount: 127,
      storageFeePerDay: 5,
      handlingFee: 15,
      consolidationFee: 25,
      currentUtilization: 65
    },
    {
      name: 'Central Valley Fresh Hub',
      address: '5678 Logistics Blvd',
      city: 'Fresno',
      state: 'CA',
      zipCode: '93721',
      latitude: 36.7378,
      longitude: -119.7871,
      coldStorage: true,
      temperatureRanges: [
        { min: 35, max: 45, unit: 'F' }
      ],
      maxCapacity: 750,
      capacityUnit: 'pallets',
      services: ['cross-docking', 'quality-inspection'],
      operatingHours: {
        monday: { open: '05:00', close: '23:00' },
        tuesday: { open: '05:00', close: '23:00' },
        wednesday: { open: '05:00', close: '23:00' },
        thursday: { open: '05:00', close: '23:00' },
        friday: { open: '05:00', close: '23:00' },
        saturday: { open: '06:00', close: '20:00' },
        sunday: { open: '06:00', close: '20:00' }
      },
      certifications: ['GAP Certified', 'Organic Handler'],
      rating: 4.5,
      reviewCount: 89,
      storageFeePerDay: 4,
      handlingFee: 12,
      consolidationFee: 20,
      currentUtilization: 45
    },
    {
      name: 'Pacific Northwest Distribution Center',
      address: '9101 Commerce Park',
      city: 'Portland',
      state: 'OR',
      zipCode: '97230',
      latitude: 45.5152,
      longitude: -122.6784,
      coldStorage: true,
      temperatureRanges: [
        { min: 33, max: 41, unit: 'F' },
        { min: 50, max: 60, unit: 'F' }
      ],
      maxCapacity: 600,
      capacityUnit: 'pallets',
      services: ['cross-docking', 'repackaging', 'labeling', 'quality-inspection'],
      operatingHours: {
        monday: { open: '07:00', close: '21:00' },
        tuesday: { open: '07:00', close: '21:00' },
        wednesday: { open: '07:00', close: '21:00' },
        thursday: { open: '07:00', close: '21:00' },
        friday: { open: '07:00', close: '21:00' },
        saturday: { open: '08:00', close: '18:00' },
        sunday: { open: '10:00', close: '16:00' }
      },
      certifications: ['USDA Approved', 'ISO 22000', 'BRC Certified'],
      rating: 4.7,
      reviewCount: 156,
      storageFeePerDay: 5.5,
      handlingFee: 16,
      consolidationFee: 28,
      currentUtilization: 55
    },
    {
      name: 'Southwest Logistics Hub',
      address: '2468 Desert Commerce Dr',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85034',
      latitude: 33.4484,
      longitude: -112.0740,
      coldStorage: true,
      temperatureRanges: [
        { min: 34, max: 42, unit: 'F' }
      ],
      maxCapacity: 450,
      capacityUnit: 'pallets',
      services: ['cross-docking', 'quality-inspection'],
      operatingHours: {
        monday: { open: '06:00', close: '22:00' },
        tuesday: { open: '06:00', close: '22:00' },
        wednesday: { open: '06:00', close: '22:00' },
        thursday: { open: '06:00', close: '22:00' },
        friday: { open: '06:00', close: '22:00' },
        saturday: { open: '07:00', close: '19:00' },
        sunday: 'closed'
      },
      certifications: ['USDA Approved', 'AIB Certified'],
      rating: 4.4,
      reviewCount: 93,
      storageFeePerDay: 4.5,
      handlingFee: 14,
      consolidationFee: 22,
      currentUtilization: 70
    },
    {
      name: 'Rocky Mountain Fresh Center',
      address: '3690 Alpine Way',
      city: 'Denver',
      state: 'CO',
      zipCode: '80239',
      latitude: 39.7392,
      longitude: -104.9903,
      coldStorage: true,
      temperatureRanges: [
        { min: 32, max: 40, unit: 'F' },
        { min: 40, max: 48, unit: 'F' }
      ],
      maxCapacity: 550,
      capacityUnit: 'pallets',
      services: ['cross-docking', 'repackaging', 'quality-inspection', 'labeling'],
      operatingHours: {
        monday: { open: '05:30', close: '21:30' },
        tuesday: { open: '05:30', close: '21:30' },
        wednesday: { open: '05:30', close: '21:30' },
        thursday: { open: '05:30', close: '21:30' },
        friday: { open: '05:30', close: '21:30' },
        saturday: { open: '07:00', close: '17:00' },
        sunday: { open: '09:00', close: '15:00' }
      },
      certifications: ['USDA Approved', 'SQF Certified', 'Organic Handler'],
      rating: 4.6,
      reviewCount: 114,
      storageFeePerDay: 5.25,
      handlingFee: 15.5,
      consolidationFee: 26,
      currentUtilization: 58
    }
  ];

  
  for (const center of centers) {
    try {
      // Check if center exists
      const existing = await prisma.consolidationCenter.findFirst({
        where: { name: center.name }
      });

      if (existing) {
        await prisma.consolidationCenter.update({
          where: { id: existing.id },
          data: {
            ...center,
            updatedAt: new Date()
          }
        });
      } else {
        await prisma.consolidationCenter.create({
          data: center
        });
      }
    } catch (error) {
      console.error(`Error creating center ${center.name}:`, error);
    }
  }
  
}