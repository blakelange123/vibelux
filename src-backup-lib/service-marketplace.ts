import { prisma } from '@/lib/prisma';

export interface ServiceProviderMatch {
  id: string;
  companyName: string;
  contactName: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  distance?: number;
  specializations: string[];
  certifications: string[];
  averageBidAmount?: number;
  responseTime?: number; // hours
  availability: 'immediate' | 'within_24h' | 'within_48h' | 'next_week';
  emergencyService: boolean;
  verified: boolean;
}

export interface BidAnalysis {
  bidId: string;
  serviceProviderId: string;
  companyName: string;
  amount: number;
  rating: number;
  completedJobs: number;
  estimatedDuration: number;
  score: number; // Calculated score based on multiple factors
  recommendationReason: string;
  warningsFlags: string[];
}

export interface MarketplaceInsights {
  averageBidAmount: number;
  bidRange: { min: number; max: number };
  averageRating: number;
  totalBids: number;
  recommendedBudget: { min: number; max: number };
  marketFactors: string[];
}

export class ServiceMarketplace {
  
  /**
   * Find matching service providers for a service request
   */
  static async findMatchingProviders(
    serviceRequestId: string,
    maxResults: number = 20
  ): Promise<ServiceProviderMatch[]> {
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: {
        facility: true,
        equipment: true,
      },
    });

    if (!serviceRequest) return [];

    const matches: ServiceProviderMatch[] = [];

    // Find providers with matching specializations
    const providers = await prisma.serviceProvider.findMany({
      where: {
        status: 'ACTIVE',
        verified: true,
        specializations: {
          some: {
            category: serviceRequest.category,
          },
        },
        // Check if provider serves this area
        serviceAreas: {
          some: {
            zipCode: serviceRequest.facility.zipCode || '',
          },
        },
      },
      include: {
        specializations: true,
        certifications: {
          where: { verified: true },
        },
        serviceAreas: {
          where: {
            zipCode: serviceRequest.facility.zipCode || '',
          },
        },
        serviceBids: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          select: { amount: true },
        },
        reviews: {
          select: { overallRating: true },
          take: 10,
        },
      },
      take: maxResults,
      orderBy: [
        { rating: 'desc' },
        { completedJobs: 'desc' },
      ],
    });

    for (const provider of providers) {
      // Calculate average bid amount
      const avgBidAmount = provider.serviceBids.length > 0 ?
        provider.serviceBids.reduce((sum, bid) => sum + bid.amount, 0) / provider.serviceBids.length :
        undefined;

      // Determine availability based on emergency service and current workload
      let availability: 'immediate' | 'within_24h' | 'within_48h' | 'next_week' = 'next_week';
      
      if (provider.emergencyService && serviceRequest.emergencyService) {
        availability = 'immediate';
      } else if (provider.completedJobs < 5) {
        availability = 'within_24h';
      } else if (provider.rating > 4.5) {
        availability = 'within_48h';
      }

      // Calculate distance (placeholder - would use actual geocoding)
      const distance = this.calculateDistance(
        serviceRequest.facility.zipCode || '',
        provider.serviceAreas[0]?.zipCode || ''
      );

      matches.push({
        id: provider.id,
        companyName: provider.companyName,
        contactName: provider.contactName,
        rating: provider.rating,
        reviewCount: provider.reviewCount,
        completedJobs: provider.completedJobs,
        distance: distance,
        specializations: provider.specializations.map(s => s.category),
        certifications: provider.certifications.map(c => c.certificationType),
        averageBidAmount: avgBidAmount,
        availability: availability,
        emergencyService: provider.emergencyService,
        verified: provider.verified,
      });
    }

    return matches;
  }

  /**
   * Analyze and rank bids for a service request
   */
  static async analyzeBids(serviceRequestId: string): Promise<BidAnalysis[]> {
    const bids = await prisma.serviceBid.findMany({
      where: {
        serviceRequestId: serviceRequestId,
        status: 'SUBMITTED',
      },
      include: {
        serviceProvider: {
          include: {
            reviews: {
              select: { overallRating: true },
              take: 10,
            },
          },
        },
      },
    });

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
    });

    if (!serviceRequest) return [];

    const analyses: BidAnalysis[] = [];

    for (const bid of bids) {
      const provider = bid.serviceProvider;
      
      // Calculate score based on multiple factors
      let score = 0;
      const warnings: string[] = [];
      let recommendation = '';

      // Price factor (40% weight)
      const maxBudget = serviceRequest.maxBudget || 10000;
      const priceScore = Math.max(0, (maxBudget - bid.amount) / maxBudget * 40);
      score += priceScore;

      if (bid.amount > maxBudget) {
        warnings.push('Bid exceeds maximum budget');
      }

      // Rating factor (30% weight)
      const ratingScore = (provider.rating / 5) * 30;
      score += ratingScore;

      if (provider.rating < 4.0) {
        warnings.push('Below average rating');
      }

      // Experience factor (20% weight)
      const experienceScore = Math.min(provider.completedJobs / 50, 1) * 20;
      score += experienceScore;

      if (provider.completedJobs < 5) {
        warnings.push('Limited experience (less than 5 completed jobs)');
      }

      // Time factor (10% weight)
      const timeScore = bid.estimatedDuration ? 
        Math.max(0, (24 - (bid.estimatedDuration || 8)) / 24) * 10 : 5;
      score += timeScore;

      // Determine recommendation reason
      if (score >= 80) {
        recommendation = 'Highly recommended - excellent balance of price, quality, and experience';
      } else if (score >= 60) {
        recommendation = 'Good option - solid provider with reasonable pricing';
      } else if (score >= 40) {
        recommendation = 'Consider with caution - review provider details carefully';
      } else {
        recommendation = 'Not recommended - significant concerns with price, rating, or experience';
      }

      // Additional quality checks
      if (!provider.verified) {
        warnings.push('Provider not verified');
        score -= 10;
      }

      if (provider.reviewCount < 3) {
        warnings.push('Limited reviews available');
      }

      analyses.push({
        bidId: bid.id,
        serviceProviderId: provider.id,
        companyName: provider.companyName,
        amount: bid.amount,
        rating: provider.rating,
        completedJobs: provider.completedJobs,
        estimatedDuration: bid.estimatedDuration || 0,
        score: Math.round(score),
        recommendationReason: recommendation,
        warningsFlags: warnings,
      });
    }

    // Sort by score (highest first)
    return analyses.sort((a, b) => b.score - a.score);
  }

  /**
   * Get marketplace insights for a service category
   */
  static async getMarketplaceInsights(
    category: string,
    zipCode?: string,
    urgency?: string
  ): Promise<MarketplaceInsights> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent bids for this category
    const recentBids = await prisma.serviceBid.findMany({
      where: {
        serviceRequest: {
          category: category,
          createdAt: { gte: thirtyDaysAgo },
          ...(zipCode && {
            facility: {
              zipCode: zipCode,
            },
          }),
        },
        status: { in: ['SUBMITTED', 'ACCEPTED'] },
      },
      include: {
        serviceProvider: {
          select: { rating: true },
        },
      },
    });

    const bidAmounts = recentBids.map(b => b.amount);
    const ratings = recentBids.map(b => b.serviceProvider.rating);

    const averageBidAmount = bidAmounts.length > 0 ?
      bidAmounts.reduce((sum, amount) => sum + amount, 0) / bidAmounts.length : 0;

    const minBid = bidAmounts.length > 0 ? Math.min(...bidAmounts) : 0;
    const maxBid = bidAmounts.length > 0 ? Math.max(...bidAmounts) : 0;

    const averageRating = ratings.length > 0 ?
      ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

    // Calculate recommended budget range (±20% of average)
    const recommendedMin = averageBidAmount * 0.8;
    const recommendedMax = averageBidAmount * 1.2;

    // Identify market factors
    const marketFactors: string[] = [];

    if (urgency === 'EMERGENCY') {
      marketFactors.push('Emergency service premium (+20-50%)');
    }

    if (bidAmounts.length < 5) {
      marketFactors.push('Limited market data - prices may vary significantly');
    }

    const avgRating = averageRating;
    if (avgRating > 4.5) {
      marketFactors.push('High-quality providers available in this area');
    } else if (avgRating < 3.5) {
      marketFactors.push('Consider expanding search area for better quality providers');
    }

    // Check seasonal factors (placeholder logic)
    const month = new Date().getMonth();
    if ([11, 0, 1].includes(month)) { // Winter months
      marketFactors.push('Winter season - potential weather delays');
    } else if ([5, 6, 7].includes(month)) { // Summer months
      marketFactors.push('Peak season - higher demand and pricing');
    }

    return {
      averageBidAmount: Math.round(averageBidAmount),
      bidRange: { min: Math.round(minBid), max: Math.round(maxBid) },
      averageRating: Math.round(averageRating * 10) / 10,
      totalBids: bidAmounts.length,
      recommendedBudget: { 
        min: Math.round(recommendedMin), 
        max: Math.round(recommendedMax) 
      },
      marketFactors: marketFactors,
    };
  }

  /**
   * Auto-match service requests with providers
   */
  static async autoMatchServiceRequest(serviceRequestId: string): Promise<string[]> {
    const matches = await this.findMatchingProviders(serviceRequestId, 10);
    const matchedProviderIds: string[] = [];

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
    });

    if (!serviceRequest) return [];

    for (const match of matches) {
      // Check if provider meets minimum criteria
      if (match.rating >= 4.0 && 
          match.completedJobs >= 3 && 
          match.verified &&
          (match.distance || 0) <= 50) { // Within 50 miles
        
        // Check if emergency service requirement is met
        if (serviceRequest.emergencyService && !match.emergencyService) {
          continue;
        }

        matchedProviderIds.push(match.id);
      }
    }

    // TODO: Send notifications to matched providers
    return matchedProviderIds;
  }

  /**
   * Calculate distance between zip codes (placeholder)
   */
  static calculateDistance(zipCode1: string, zipCode2: string): number {
    // This would use a real geocoding service
    // For now, return a random distance between 5-50 miles
    return Math.round(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 45 + 5);
  }

  /**
   * Get marketplace statistics
   */
  static async getMarketplaceStatistics(facilityId?: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const whereClause: any = {
      createdAt: { gte: thirtyDaysAgo },
    };

    if (facilityId) {
      whereClause.facilityId = facilityId;
    }

    const [
      totalRequests,
      openRequests,
      completedRequests,
      averageBids,
      averageCompletionTime,
      totalProviders,
      activeProviders,
    ] = await Promise.all([
      prisma.serviceRequest.count({ where: whereClause }),
      prisma.serviceRequest.count({ 
        where: { ...whereClause, status: { in: ['OPEN', 'BIDDING'] } } 
      }),
      prisma.serviceRequest.count({ 
        where: { ...whereClause, status: 'COMPLETED' } 
      }),
      prisma.serviceBid.groupBy({
        by: ['serviceRequestId'],
        where: {
          serviceRequest: whereClause,
        },
        _count: { id: true },
      }),
      prisma.workOrder.aggregate({
        where: {
          status: 'COMPLETED',
          completedAt: { gte: thirtyDaysAgo },
          ...(facilityId && {
            serviceRequest: { facilityId },
          }),
        },
        _avg: {
          hoursWorked: true,
        },
      }),
      prisma.serviceProvider.count(),
      prisma.serviceProvider.count({ where: { status: 'ACTIVE' } }),
    ]);

    const avgBidsPerRequest = averageBids.length > 0 ?
      averageBids.reduce((sum, group) => sum + group._count.id, 0) / averageBids.length : 0;

    return {
      totalRequests,
      openRequests,
      completedRequests,
      completionRate: totalRequests > 0 ? (completedRequests / totalRequests * 100) : 0,
      averageBidsPerRequest: Math.round(avgBidsPerRequest * 10) / 10,
      averageCompletionTime: averageCompletionTime._avg.hoursWorked || 0,
      totalProviders,
      activeProviders,
      providerUtilization: totalProviders > 0 ? (activeProviders / totalProviders * 100) : 0,
    };
  }
}