import { prisma } from '@/lib/prisma';

export interface BenchmarkMetrics {
  yieldPerSqFt: number;
  energyPerGram: number;
  laborCostPerPound: number;
  revenuePerSqFt: number;
  lightingEfficiency: number;
  qualityScore: number;
}

export interface FacilityRanking {
  facilityId: string;
  facilityName: string;
  metrics: BenchmarkMetrics;
  overallRank: number;
  percentile: number;
}

export interface BenchmarkReportData {
  reportType: string;
  period: string;
  startDate: Date;
  endDate: Date;
  facilityMetrics: BenchmarkMetrics;
  industryAverages: BenchmarkMetrics;
  rankings: {
    overall: number;
    yield: number;
    energy: number;
    revenue: number;
  };
  comparisons: {
    topPerformers: FacilityRanking[];
    peerGroup: FacilityRanking[];
  };
  insights: string[];
  recommendations: string[];
}

export class BenchmarkReportGenerator {
  private facilityId: string;
  private reportType: string;
  private startDate: Date;
  private endDate: Date;

  constructor(facilityId: string, reportType: string, startDate: Date, endDate: Date) {
    this.facilityId = facilityId;
    this.reportType = reportType;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  async generateReport(): Promise<BenchmarkReportData> {
    // Fetch facility data
    const facilityData = await this.fetchFacilityData();
    
    // Calculate facility metrics
    const facilityMetrics = await this.calculateFacilityMetrics(facilityData);
    
    // Get industry benchmarks
    const industryData = await this.fetchIndustryData();
    const industryAverages = this.calculateIndustryAverages(industryData);
    
    // Calculate rankings
    const rankings = this.calculateRankings(facilityMetrics, industryData);
    
    // Get peer comparisons
    const comparisons = await this.getPeerComparisons(facilityData.facility.type);
    
    // Generate insights and recommendations
    const insights = this.generateInsights(facilityMetrics, industryAverages, rankings);
    const recommendations = this.generateRecommendations(facilityMetrics, industryAverages);

    return {
      reportType: this.reportType,
      period: this.getPeriodLabel(),
      startDate: this.startDate,
      endDate: this.endDate,
      facilityMetrics,
      industryAverages,
      rankings,
      comparisons,
      insights,
      recommendations,
    };
  }

  private async fetchFacilityData() {
    return await prisma.facility.findUnique({
      where: { id: this.facilityId },
      include: {
        harvestBatches: {
          where: {
            harvestDate: {
              gte: this.startDate,
              lte: this.endDate,
            },
          },
          include: {
            harvests: true,
          },
        },
        sensorReadings: {
          where: {
            timestamp: {
              gte: this.startDate,
              lte: this.endDate,
            },
          },
        },
        marketData: {
          where: {
            saleDate: {
              gte: this.startDate,
              lte: this.endDate,
            },
          },
        },
      },
    });
  }

  private async calculateFacilityMetrics(facilityData: any): Promise<BenchmarkMetrics> {
    const squareFeet = facilityData.size || 1;
    
    // Calculate yield metrics
    const totalYield = facilityData.harvestBatches.reduce((sum: number, batch: any) => {
      return sum + batch.harvests.reduce((hSum: number, h: any) => hSum + h.weight, 0);
    }, 0);
    
    // Calculate energy usage (from sensor readings)
    const energyReadings = facilityData.sensorReadings.filter((r: any) => 
      r.sensorType === 'energy_meter'
    );
    const totalEnergy = energyReadings.reduce((sum: number, r: any) => 
      sum + r.value, 0
    );
    
    // Calculate revenue
    const totalRevenue = facilityData.marketData.reduce((sum: number, m: any) => 
      sum + m.totalRevenue, 0
    );
    
    // Labor costs (estimated for now)
    const laborCostPerPound = 150; // TODO: Get from actual data
    
    // Quality score from market data
    const qualityScores: Record<string, number> = { 'A': 1, 'B': 0.8, 'C': 0.6, 'D': 0.4 };
    const avgQuality = facilityData.marketData.reduce((sum: number, m: any) => 
      sum + (qualityScores[m.quality] || 0.5), 0
    ) / (facilityData.marketData.length || 1);

    return {
      yieldPerSqFt: totalYield / squareFeet,
      energyPerGram: totalEnergy / (totalYield * 453.592), // Convert pounds to grams
      laborCostPerPound,
      revenuePerSqFt: totalRevenue / squareFeet,
      lightingEfficiency: totalYield / (totalEnergy || 1),
      qualityScore: avgQuality,
    };
  }

  private async fetchIndustryData() {
    // Fetch all facilities of similar type
    const facilities = await prisma.facility.findMany({
      where: {
        type: await this.getFacilityType(),
      },
      include: {
        harvestBatches: {
          where: {
            harvestDate: {
              gte: this.startDate,
              lte: this.endDate,
            },
          },
          include: {
            harvests: true,
          },
        },
        marketData: {
          where: {
            saleDate: {
              gte: this.startDate,
              lte: this.endDate,
            },
          },
        },
      },
    });

    return facilities;
  }

  private calculateIndustryAverages(facilities: any[]): BenchmarkMetrics {
    const metrics: BenchmarkMetrics[] = [];

    for (const facility of facilities) {
      if (facility.harvestBatches.length > 0) {
        const facilityMetrics = this.calculateSimpleMetrics(facility);
        metrics.push(facilityMetrics);
      }
    }

    if (metrics.length === 0) {
      return {
        yieldPerSqFt: 0,
        energyPerGram: 0,
        laborCostPerPound: 0,
        revenuePerSqFt: 0,
        lightingEfficiency: 0,
        qualityScore: 0,
      };
    }

    // Calculate averages
    return {
      yieldPerSqFt: metrics.reduce((sum, m) => sum + m.yieldPerSqFt, 0) / metrics.length,
      energyPerGram: metrics.reduce((sum, m) => sum + m.energyPerGram, 0) / metrics.length,
      laborCostPerPound: metrics.reduce((sum, m) => sum + m.laborCostPerPound, 0) / metrics.length,
      revenuePerSqFt: metrics.reduce((sum, m) => sum + m.revenuePerSqFt, 0) / metrics.length,
      lightingEfficiency: metrics.reduce((sum, m) => sum + m.lightingEfficiency, 0) / metrics.length,
      qualityScore: metrics.reduce((sum, m) => sum + m.qualityScore, 0) / metrics.length,
    };
  }

  private calculateSimpleMetrics(facility: any): BenchmarkMetrics {
    const squareFeet = facility.size || 1;
    
    const totalYield = facility.harvestBatches.reduce((sum: number, batch: any) => 
      sum + batch.harvests.reduce((hSum: number, h: any) => hSum + h.weight, 0), 0
    );
    
    const totalRevenue = facility.marketData.reduce((sum: number, m: any) => 
      sum + m.totalRevenue, 0
    );

    return {
      yieldPerSqFt: totalYield / squareFeet,
      energyPerGram: 0.5, // Default estimate
      laborCostPerPound: 150,
      revenuePerSqFt: totalRevenue / squareFeet,
      lightingEfficiency: 0.8,
      qualityScore: 0.75,
    };
  }

  private calculateRankings(facilityMetrics: BenchmarkMetrics, industryData: any[]) {
    const allMetrics = industryData.map(f => this.calculateSimpleMetrics(f));
    allMetrics.push(facilityMetrics);

    // Sort by each metric and find facility's position
    const yieldRank = this.getRank(allMetrics, facilityMetrics, 'yieldPerSqFt');
    const energyRank = this.getRank(allMetrics, facilityMetrics, 'energyPerGram', true); // Lower is better
    const revenueRank = this.getRank(allMetrics, facilityMetrics, 'revenuePerSqFt');
    
    // Calculate overall rank (average of all ranks)
    const overallRank = Math.round((yieldRank + energyRank + revenueRank) / 3);

    return {
      overall: overallRank,
      yield: yieldRank,
      energy: energyRank,
      revenue: revenueRank,
    };
  }

  private getRank(
    allMetrics: BenchmarkMetrics[], 
    targetMetrics: BenchmarkMetrics, 
    metricKey: keyof BenchmarkMetrics,
    ascending = false
  ): number {
    const sorted = [...allMetrics].sort((a, b) => {
      const diff = (a[metricKey] as number) - (b[metricKey] as number);
      return ascending ? diff : -diff;
    });

    return sorted.findIndex(m => m === targetMetrics) + 1;
  }

  private async getPeerComparisons(facilityType: string) {
    const topPerformers = await this.getTopPerformers(facilityType);
    const peerGroup = await this.getPeerGroup(facilityType);

    return {
      topPerformers,
      peerGroup,
    };
  }

  private async getTopPerformers(facilityType: string): Promise<FacilityRanking[]> {
    // Fetch top 5 performing facilities
    const facilities = await prisma.facility.findMany({
      where: { type: facilityType },
      take: 5,
      include: {
        harvestBatches: {
          where: {
            harvestDate: {
              gte: this.startDate,
              lte: this.endDate,
            },
          },
        },
      },
    });

    return facilities.map((f, index) => ({
      facilityId: f.id,
      facilityName: f.name,
      metrics: this.calculateSimpleMetrics(f),
      overallRank: index + 1,
      percentile: 95 - (index * 5),
    }));
  }

  private async getPeerGroup(facilityType: string): Promise<FacilityRanking[]> {
    // Get facilities with similar characteristics
    const facility = await prisma.facility.findUnique({
      where: { id: this.facilityId },
    });

    const peers = await prisma.facility.findMany({
      where: {
        type: facilityType,
        size: {
          gte: (facility?.size || 0) * 0.8,
          lte: (facility?.size || 0) * 1.2,
        },
        id: { not: this.facilityId },
      },
      take: 10,
    });

    return peers.map((f, index) => ({
      facilityId: f.id,
      facilityName: f.name,
      metrics: this.calculateSimpleMetrics(f),
      overallRank: index + 10,
      percentile: 75 - (index * 2),
    }));
  }

  private generateInsights(
    facilityMetrics: BenchmarkMetrics, 
    industryAverages: BenchmarkMetrics,
    rankings: any
  ): string[] {
    const insights = [];

    // Yield insights
    const yieldDiff = ((facilityMetrics.yieldPerSqFt - industryAverages.yieldPerSqFt) / 
      industryAverages.yieldPerSqFt) * 100;
    
    if (yieldDiff > 10) {
      insights.push(`Your yield per square foot is ${Math.round(yieldDiff)}% above industry average`);
    } else if (yieldDiff < -10) {
      insights.push(`Your yield per square foot is ${Math.abs(Math.round(yieldDiff))}% below industry average`);
    }

    // Energy insights
    if (facilityMetrics.energyPerGram < industryAverages.energyPerGram) {
      insights.push('Your energy efficiency is better than industry average');
    }

    // Revenue insights
    if (facilityMetrics.revenuePerSqFt > industryAverages.revenuePerSqFt * 1.2) {
      insights.push('Your revenue per square foot significantly exceeds industry standards');
    }

    // Ranking insights
    if (rankings.overall <= 10) {
      insights.push(`You rank in the top ${rankings.overall} facilities in your category`);
    }

    return insights;
  }

  private generateRecommendations(
    facilityMetrics: BenchmarkMetrics,
    industryAverages: BenchmarkMetrics
  ): string[] {
    const recommendations = [];

    // Yield recommendations
    if (facilityMetrics.yieldPerSqFt < industryAverages.yieldPerSqFt * 0.9) {
      recommendations.push('Consider optimizing plant density and pruning techniques to improve yield');
      recommendations.push('Review lighting intensity and coverage for underperforming areas');
    }

    // Energy recommendations
    if (facilityMetrics.energyPerGram > industryAverages.energyPerGram * 1.1) {
      recommendations.push('Implement LED lighting upgrades to reduce energy consumption');
      recommendations.push('Consider installing motion sensors and scheduling systems');
    }

    // Quality recommendations
    if (facilityMetrics.qualityScore < 0.7) {
      recommendations.push('Focus on environmental control to improve product quality');
      recommendations.push('Implement stricter quality control measures during harvest');
    }

    // Revenue recommendations
    if (facilityMetrics.revenuePerSqFt < industryAverages.revenuePerSqFt) {
      recommendations.push('Explore premium product lines or value-added processing');
      recommendations.push('Review pricing strategy based on quality grades');
    }

    return recommendations;
  }

  private async getFacilityType(): Promise<string> {
    const facility = await prisma.facility.findUnique({
      where: { id: this.facilityId },
      select: { type: true },
    });
    return facility?.type || 'INDOOR';
  }

  private getPeriodLabel(): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (this.reportType === 'monthly') {
      return `${months[this.startDate.getMonth()]} ${this.startDate.getFullYear()}`;
    } else if (this.reportType === 'quarterly') {
      const quarter = Math.floor(this.startDate.getMonth() / 3) + 1;
      return `Q${quarter} ${this.startDate.getFullYear()}`;
    } else {
      return `${this.startDate.getFullYear()}`;
    }
  }
}