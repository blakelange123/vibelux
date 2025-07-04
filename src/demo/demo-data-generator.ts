// Demo data generator for showcasing Vibelux capabilities

import { faker } from '@faker-js/faker';

export interface DemoFacility {
  id: string;
  name: string;
  type: 'indoor' | 'greenhouse' | 'vertical';
  size: number; // sq ft
  location: string;
  established: Date;
  metrics: {
    currentYield: number; // g/sq ft
    targetYield: number;
    energyUsage: number; // kWh/month
    waterUsage: number; // gallons/month
    laborHours: number; // hours/week
  };
  improvements: {
    yieldIncrease: number; // percentage
    energySavings: number; // percentage
    waterSavings: number; // percentage
    laborSavings: number; // percentage
  };
  roi: {
    monthlyRevenue: number;
    monthlyCosts: number;
    monthlyProfit: number;
    vibeluxROI: number; // months to payback
  };
}

export interface DemoProject {
  id: string;
  facilityId: string;
  name: string;
  created: Date;
  status: 'planning' | 'active' | 'completed';
  roomCount: number;
  fixtureCount: number;
  totalPPFD: number;
  uniformity: number;
  energyEfficiency: number; // μmol/J
}

export interface DemoAlert {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  facility?: string;
}

export interface DemoYieldData {
  date: Date;
  predicted: number;
  actual: number;
  strain: string;
}

export class DemoDataGenerator {
  private static facilities: DemoFacility[] = [
    {
      id: 'demo-1',
      name: 'Pacific Coast Cultivation',
      type: 'greenhouse',
      size: 50000,
      location: 'California, USA',
      established: new Date('2021-03-15'),
      metrics: {
        currentYield: 65,
        targetYield: 85,
        energyUsage: 125000,
        waterUsage: 85000,
        laborHours: 320,
      },
      improvements: {
        yieldIncrease: 28,
        energySavings: 42,
        waterSavings: 35,
        laborSavings: 25,
      },
      roi: {
        monthlyRevenue: 850000,
        monthlyCosts: 425000,
        monthlyProfit: 425000,
        vibeluxROI: 2.5,
      },
    },
    {
      id: 'demo-2',
      name: 'Mountain View Vertical Farms',
      type: 'vertical',
      size: 15000,
      location: 'Colorado, USA',
      established: new Date('2022-06-01'),
      metrics: {
        currentYield: 120,
        targetYield: 165,
        energyUsage: 95000,
        waterUsage: 25000,
        laborHours: 160,
      },
      improvements: {
        yieldIncrease: 38,
        energySavings: 45,
        waterSavings: 60,
        laborSavings: 40,
      },
      roi: {
        monthlyRevenue: 425000,
        monthlyCosts: 180000,
        monthlyProfit: 245000,
        vibeluxROI: 1.8,
      },
    },
    {
      id: 'demo-3',
      name: 'Green Valley Indoor Gardens',
      type: 'indoor',
      size: 25000,
      location: 'Michigan, USA',
      established: new Date('2020-11-20'),
      metrics: {
        currentYield: 75,
        targetYield: 95,
        energyUsage: 85000,
        waterUsage: 45000,
        laborHours: 240,
      },
      improvements: {
        yieldIncrease: 32,
        energySavings: 38,
        waterSavings: 28,
        laborSavings: 22,
      },
      roi: {
        monthlyRevenue: 625000,
        monthlyCosts: 285000,
        monthlyProfit: 340000,
        vibeluxROI: 2.1,
      },
    },
  ];

  static generateDemoProjects(count: number = 10): DemoProject[] {
    const projects: DemoProject[] = [];
    const projectTypes = [
      'Flowering Room Optimization',
      'Vegetative Growth Enhancement',
      'Mother Plant Facility',
      'Clone Room Design',
      'Processing Area Lighting',
      'Greenhouse Supplemental',
      'Vertical Tower System',
      'Research Lab Setup',
      'Microgreens Production',
      'Hemp Field Lighting',
    ];

    for (let i = 0; i < count; i++) {
      projects.push({
        id: `demo-project-${i}`,
        facilityId: faker.helpers.arrayElement(this.facilities).id,
        name: projectTypes[i] || faker.company.catchPhrase(),
        created: faker.date.recent({ days: 90 }),
        status: faker.helpers.arrayElement(['planning', 'active', 'completed']),
        roomCount: faker.number.int({ min: 1, max: 12 }),
        fixtureCount: faker.number.int({ min: 20, max: 500 }),
        totalPPFD: faker.number.int({ min: 600, max: 1200 }),
        uniformity: faker.number.float({ min: 0.85, max: 0.95 }),
        energyEfficiency: faker.number.float({ min: 2.3, max: 3.2 }),
      });
    }

    return projects.sort((a, b) => b.created.getTime() - a.created.getTime());
  }

  static generateYieldData(days: number = 365): DemoYieldData[] {
    const data: DemoYieldData[] = [];
    const strains = ['Blue Dream', 'OG Kush', 'Girl Scout Cookies', 'Sour Diesel', 'Purple Haze'];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Create realistic growth curve
      const growthFactor = 1 + (i / days) * 0.3; // 30% improvement over time
      const seasonalFactor = 1 + Math.sin((i / 365) * Math.PI * 2) * 0.1; // ±10% seasonal
      const randomFactor = 0.95 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1; // ±5% random
      
      const baseYield = 65;
      const predicted = baseYield * growthFactor * seasonalFactor;
      const actual = predicted * randomFactor;

      data.push({
        date,
        predicted: Math.round(predicted),
        actual: Math.round(actual),
        strain: strains[Math.floor(i / 73) % strains.length], // Change strain every ~73 days
      });
    }

    return data;
  }

  static generateAlerts(): DemoAlert[] {
    return [
      {
        id: 'alert-1',
        type: 'success',
        title: 'Energy Savings Milestone',
        message: 'Your facility has saved 125,000 kWh this quarter, reducing costs by $15,000',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        facility: 'Pacific Coast Cultivation',
      },
      {
        id: 'alert-2',
        type: 'info',
        title: 'AI Optimization Complete',
        message: 'New light recipe deployed. Expected yield increase: 8-12%',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        facility: 'Mountain View Vertical Farms',
      },
      {
        id: 'alert-3',
        type: 'warning',
        title: 'Maintenance Reminder',
        message: '15 fixtures in Room 3B are approaching 50,000 hours runtime',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        facility: 'Green Valley Indoor Gardens',
      },
      {
        id: 'alert-4',
        type: 'success',
        title: 'Compliance Report Generated',
        message: 'Q4 regulatory compliance report ready for download',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: 'alert-5',
        type: 'info',
        title: 'New Cultivar Recipe Available',
        message: 'Optimized light recipe for "Wedding Cake" now in your library',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
      },
    ];
  }

  static generateHeatmapData(width: number = 20, height: number = 20): number[][] {
    const data: number[][] = [];
    const centerX = width / 2;
    const centerY = height / 2;

    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        // Create realistic light distribution
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
        const intensity = 1 - (distance / maxDistance) * 0.3; // 30% drop at corners
        
        // Add some fixture patterns
        const fixtureX = x % 4 === 2;
        const fixtureY = y % 4 === 2;
        const fixtureBoost = fixtureX && fixtureY ? 0.15 : 0;
        
        // Random variation
        const random = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.05;
        
        const ppfd = Math.round((800 + fixtureBoost * 200) * intensity + random * 100);
        row.push(Math.max(600, Math.min(1000, ppfd)));
      }
      data.push(row);
    }

    return data;
  }

  static generateTimeSeriesData(metric: 'energy' | 'yield' | 'cost', days: number = 30) {
    const data = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      let value: number;
      switch (metric) {
        case 'energy':
          // Energy usage with daily patterns
          value = 3500 + Math.sin(i * 0.2) * 500 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200;
          break;
        case 'yield':
          // Steady growth with harvests
          value = 65 + (days - i) * 0.5 + (i % 7 === 0 ? 15 : 0);
          break;
        case 'cost':
          // Operating costs with weekly patterns
          value = 1200 + Math.sin(i * 0.15) * 200 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100;
          break;
      }

      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value),
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }

    return data;
  }

  static generateComparisonData() {
    return {
      beforeVibelux: {
        yield: 65,
        energy: 50,
        uniformity: 0.72,
        labor: 40,
        waterUsage: 100,
        profit: 25,
      },
      afterVibelux: {
        yield: 85,
        energy: 30,
        uniformity: 0.91,
        labor: 30,
        waterUsage: 75,
        profit: 45,
      },
    };
  }

  static getDemoCredentials() {
    return {
      email: 'demo@vibelux.com',
      password: 'demo123',
      message: 'Use these credentials to explore all features',
    };
  }

  static getDemoFacilities() {
    return this.facilities;
  }

  static generateDashboardStats() {
    return {
      totalFacilities: 3,
      activeProjects: 12,
      totalSqFt: 90000,
      monthlyRevenue: 1900000,
      energySaved: 425000, // kWh
      carbonReduced: 185, // tons
      yieldIncrease: 32, // percentage
      totalFixtures: 2847,
      alerts: 5,
      maintenanceDue: 23,
    };
  }
}