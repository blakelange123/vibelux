// Multi-site analytics and performance tracking

export interface SitePerformance {
  siteId: string;
  timestamp: Date;
  metrics: {
    energyEfficiency: number; // kWh per lb
    waterEfficiency: number; // gallons per lb
    yieldPerSqFt: number; // lbs per sq ft
    laborHours: number; // hours per lb
    qualityScore: number; // 0-100
  };
  trends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
}

export interface NetworkAnalytics {
  totalSites: number;
  activeSites: number;
  totalArea: number; // sq ft
  totalProduction: number; // lbs/month
  totalEnergy: number; // kWh/month
  totalWater: number; // gallons/month
  avgEfficiency: number;
  topPerformers: string[];
  alertCount: number;
}

export class SiteAnalyticsEngine {
  private performanceData: Map<string, SitePerformance[]> = new Map();

  // Calculate network-wide analytics
  calculateNetworkAnalytics(sites: any[]): NetworkAnalytics {
    const activeSites = sites.filter(s => s.status === 'active');
    
    const totalProduction = sites.reduce((sum, site) => sum + (site.metrics?.yield || 0), 0);
    const totalEnergy = sites.reduce((sum, site) => sum + (site.metrics?.energyUsage || 0), 0);
    const totalWater = sites.reduce((sum, site) => sum + (site.metrics?.waterUsage || 0), 0);
    const totalArea = sites.reduce((sum, site) => sum + (site.size || 0), 0);
    
    const avgEfficiency = totalProduction > 0 ? totalEnergy / totalProduction : 0;
    
    // Sort sites by yield per sq ft
    const sortedByPerformance = sites
      .filter(s => s.metrics?.yield && s.size)
      .sort((a, b) => (b.metrics.yield / b.size) - (a.metrics.yield / a.size));
    
    return {
      totalSites: sites.length,
      activeSites: activeSites.length,
      totalArea,
      totalProduction,
      totalEnergy,
      totalWater,
      avgEfficiency,
      topPerformers: sortedByPerformance.slice(0, 3).map(s => s.id),
      alertCount: sites.reduce((sum, site) => sum + (site.alerts?.length || 0), 0)
    };
  }

  // Compare site performance
  compareSites(siteA: any, siteB: any) {
    const metricsA = {
      yieldPerSqFt: siteA.metrics.yield / siteA.size,
      energyEfficiency: siteA.metrics.energyUsage / siteA.metrics.yield,
      waterEfficiency: siteA.metrics.waterUsage / siteA.metrics.yield
    };
    
    const metricsB = {
      yieldPerSqFt: siteB.metrics.yield / siteB.size,
      energyEfficiency: siteB.metrics.energyUsage / siteB.metrics.yield,
      waterEfficiency: siteB.metrics.waterUsage / siteB.metrics.yield
    };
    
    return {
      yieldAdvantage: ((metricsA.yieldPerSqFt - metricsB.yieldPerSqFt) / metricsB.yieldPerSqFt) * 100,
      energyAdvantage: ((metricsB.energyEfficiency - metricsA.energyEfficiency) / metricsB.energyEfficiency) * 100,
      waterAdvantage: ((metricsB.waterEfficiency - metricsA.waterEfficiency) / metricsB.waterEfficiency) * 100
    };
  }

  // Calculate optimization opportunities
  identifyOptimizationOpportunities(sites: any[]) {
    const opportunities = [];
    
    // Find underperforming sites
    const avgYieldPerSqFt = sites.reduce((sum, s) => sum + (s.metrics.yield / s.size), 0) / sites.length;
    
    sites.forEach(site => {
      const yieldPerSqFt = site.metrics.yield / site.size;
      
      if (yieldPerSqFt < avgYieldPerSqFt * 0.8) {
        opportunities.push({
          siteId: site.id,
          type: 'yield',
          message: `${site.name} is yielding 20% below network average`,
          potential: `+${Math.round((avgYieldPerSqFt - yieldPerSqFt) * site.size)} lbs/month`,
          priority: 'high'
        });
      }
      
      // High energy usage
      if (site.metrics.energyUsage / site.metrics.yield > 5) {
        opportunities.push({
          siteId: site.id,
          type: 'energy',
          message: `${site.name} has high energy usage per pound`,
          potential: `Save ${Math.round(site.metrics.energyUsage * 0.2)} kWh/month`,
          priority: 'medium'
        });
      }
    });
    
    return opportunities;
  }

  // Generate site performance report
  generatePerformanceReport(site: any) {
    const yieldPerSqFt = site.metrics.yield / site.size;
    const energyPerLb = site.metrics.energyUsage / site.metrics.yield;
    const waterPerLb = site.metrics.waterUsage / site.metrics.yield;
    
    return {
      summary: {
        monthlyYield: site.metrics.yield,
        yieldPerSqFt,
        energyPerLb,
        waterPerLb,
        totalCost: (site.metrics.energyUsage * 0.12) + (site.metrics.waterUsage * 0.003) // Rough cost estimate
      },
      grades: {
        yield: yieldPerSqFt > 0.5 ? 'A' : yieldPerSqFt > 0.3 ? 'B' : 'C',
        energy: energyPerLb < 3 ? 'A' : energyPerLb < 5 ? 'B' : 'C',
        water: waterPerLb < 1 ? 'A' : waterPerLb < 2 ? 'B' : 'C'
      },
      recommendations: [
        yieldPerSqFt < 0.3 && 'Consider upgrading lighting fixtures',
        energyPerLb > 5 && 'Implement energy efficiency measures',
        waterPerLb > 2 && 'Optimize irrigation schedules'
      ].filter(Boolean)
    };
  }
}

export const siteAnalytics = new SiteAnalyticsEngine();