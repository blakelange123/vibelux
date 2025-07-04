/**
 * Research Verification and Credibility System
 * Provides real-time fact-checking and citation validation for AI recommendations
 */

import { OpenAccessResearchClient } from '../open-access-research';
import { cropDatabase } from './comprehensive-crop-database';

export interface ResearchCitation {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  url: string;
  abstract: string;
  citationCount: number;
  peerReviewed: boolean;
  openAccess: boolean;
  methodology: 'experimental' | 'review' | 'meta-analysis' | 'case-study';
  sampleSize?: number;
  confidence: 'high' | 'medium' | 'low';
  relevanceScore: number; // 0-1
}

export interface FactVerification {
  claim: string;
  verified: boolean;
  confidence: number;
  supportingEvidence: ResearchCitation[];
  contradictingEvidence: ResearchCitation[];
  consensusLevel: 'strong' | 'moderate' | 'weak' | 'conflicted';
  lastVerified: Date;
  expertReviews?: ExpertReview[];
}

export interface ExpertReview {
  reviewerId: string;
  expertName: string;
  credentials: string;
  affiliation: string;
  review: string;
  rating: 1 | 2 | 3 | 4 | 5;
  timestamp: Date;
  verified: boolean;
}

export interface CredibilityReport {
  recommendationId: string;
  overallCredibility: number; // 0-1
  researchBacking: {
    totalStudies: number;
    peerReviewedStudies: number;
    averageCitationCount: number;
    averageJournalImpact: number;
    methodologyDistribution: Record<string, number>;
  };
  factVerifications: FactVerification[];
  warnings: string[];
  disclaimers: string[];
  lastUpdated: Date;
}

export class ResearchVerificationSystem {
  private researchClient: OpenAccessResearchClient;
  private verificationCache: Map<string, FactVerification>;
  private expertReviewers: Map<string, ExpertReview[]>;

  // Trusted journal impact factors (simplified - would be comprehensive database)
  private readonly JOURNAL_IMPACT_FACTORS = {
    'Nature': 49.962,
    'Science': 47.728,
    'Plant Physiology': 8.34,
    'Journal of Experimental Botany': 6.992,
    'Plant Cell & Environment': 6.96,
    'Frontiers in Plant Science': 5.753,
    'HortScience': 1.676,
    'Acta Horticulturae': 0.5,
    'Controlled Environment Agriculture': 2.1, // Estimated
    'LEDs Magazine': 0.3, // Trade publication
    'Greenhouse Management': 0.2 // Trade publication
  };

  // Known credible institutions
  private readonly CREDIBLE_INSTITUTIONS = [
    'Cornell University',
    'Wageningen University',
    'UC Davis',
    'MIT',
    'USDA',
    'Netherlands Institute for Horticultural Development',
    'Philips Research',
    'Signify Research',
    'OSRAM',
    'LED Linear',
    'Fluence Bioengineering'
  ];

  constructor() {
    this.researchClient = new OpenAccessResearchClient();
    this.verificationCache = new Map();
    this.expertReviewers = new Map();
  }

  /**
   * Verify a specific claim with real-time research
   */
  async verifyClaim(claim: string, cropType?: string): Promise<FactVerification> {
    const cacheKey = `${claim}_${cropType || 'general'}`;
    
    // Check cache first
    const cached = this.verificationCache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    console.log(`Verifying claim: "${claim}"`);

    // Search for supporting and contradicting evidence
    const [supportingPapers, contradictingPapers] = await Promise.all([
      this.findSupportingEvidence(claim, cropType),
      this.findContradictingEvidence(claim, cropType)
    ]);

    const supportingCitations = await this.processPapers(supportingPapers, true);
    const contradictingCitations = await this.processPapers(contradictingPapers, false);

    // Calculate consensus
    const consensusLevel = this.calculateConsensus(supportingCitations, contradictingCitations);
    
    // Overall confidence based on evidence quality
    const confidence = this.calculateConfidence(supportingCitations, contradictingCitations);

    const verification: FactVerification = {
      claim,
      verified: confidence > 0.7 && consensusLevel !== 'conflicted',
      confidence,
      supportingEvidence: supportingCitations,
      contradictingEvidence: contradictingCitations,
      consensusLevel,
      lastVerified: new Date(),
      expertReviews: this.expertReviewers.get(cacheKey) || []
    };

    // Cache the result
    this.verificationCache.set(cacheKey, verification);

    return verification;
  }

  /**
   * Generate comprehensive credibility report for recommendation
   */
  async generateCredibilityReport(
    recommendationId: string,
    recommendation: string,
    claims: string[],
    cropType?: string
  ): Promise<CredibilityReport> {
    console.log(`Generating credibility report for: ${recommendation}`);

    // Verify each individual claim
    const factVerifications = await Promise.all(
      claims.map(claim => this.verifyClaim(claim, cropType))
    );

    // Aggregate research backing statistics
    const allCitations = factVerifications.flatMap(fv => [...fv.supportingEvidence, ...fv.contradictingEvidence]);
    const peerReviewedStudies = allCitations.filter(c => c.peerReviewed);
    
    const researchBacking = {
      totalStudies: allCitations.length,
      peerReviewedStudies: peerReviewedStudies.length,
      averageCitationCount: allCitations.reduce((sum, c) => sum + c.citationCount, 0) / allCitations.length || 0,
      averageJournalImpact: this.calculateAverageJournalImpact(allCitations),
      methodologyDistribution: this.calculateMethodologyDistribution(allCitations)
    };

    // Calculate overall credibility
    const overallCredibility = this.calculateOverallCredibility(factVerifications, researchBacking);

    // Generate warnings and disclaimers
    const { warnings, disclaimers } = this.generateWarningsAndDisclaimers(factVerifications, researchBacking);

    return {
      recommendationId,
      overallCredibility,
      researchBacking,
      factVerifications,
      warnings,
      disclaimers,
      lastUpdated: new Date()
    };
  }

  /**
   * Search for papers supporting the claim
   */
  private async findSupportingEvidence(claim: string, cropType?: string): Promise<any[]> {
    const searchTerms = this.extractKeyTerms(claim);
    const query = cropType ? `${cropType} ${searchTerms.join(' ')}` : searchTerms.join(' ');

    try {
      return await this.researchClient.searchPapers(query, {
        keywords: searchTerms,
        openAccessOnly: false, // Include all credible sources
        dateRange: {
          start: new Date('2015-01-01'), // Last 9 years for relevance
          end: new Date()
        },
        minCitations: 5 // Filter for impactful papers
      });
    } catch (error) {
      console.error('Error finding supporting evidence:', error);
      return [];
    }
  }

  /**
   * Search for papers that might contradict the claim
   */
  private async findContradictingEvidence(claim: string, cropType?: string): Promise<any[]> {
    const searchTerms = this.extractKeyTerms(claim);
    const contradictoryTerms = this.generateContradictoryTerms(searchTerms);
    const query = cropType ? `${cropType} ${contradictoryTerms.join(' ')}` : contradictoryTerms.join(' ');

    try {
      return await this.researchClient.searchPapers(query, {
        keywords: contradictoryTerms,
        openAccessOnly: false,
        dateRange: {
          start: new Date('2015-01-01'),
          end: new Date()
        },
        minCitations: 3
      });
    } catch (error) {
      console.error('Error finding contradicting evidence:', error);
      return [];
    }
  }

  /**
   * Process papers into research citations with credibility scoring
   */
  private async processPapers(papers: any[], supporting: boolean): Promise<ResearchCitation[]> {
    const citations: ResearchCitation[] = [];

    for (const paper of papers.slice(0, 10)) { // Limit to top 10 papers
      try {
        const citation: ResearchCitation = {
          id: paper.id || paper.doi || `paper_${Date.now()}_${Math.random()}`,
          title: paper.title,
          authors: paper.authors || [],
          journal: paper.journal || 'Unknown',
          year: paper.publishedDate ? new Date(paper.publishedDate).getFullYear() : 2023,
          doi: paper.doi,
          url: paper.url,
          abstract: paper.abstract || '',
          citationCount: paper.citationCount || 0,
          peerReviewed: this.isPeerReviewed(paper.journal),
          openAccess: paper.openAccessType !== undefined,
          methodology: this.inferMethodology(paper.title, paper.abstract),
          sampleSize: this.extractSampleSize(paper.abstract),
          confidence: this.assessPaperConfidence(paper),
          relevanceScore: this.calculateRelevanceScore(paper, supporting)
        };

        citations.push(citation);
      } catch (error) {
        console.error('Error processing paper:', error);
      }
    }

    return citations.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Calculate consensus level based on evidence
   */
  private calculateConsensus(supporting: ResearchCitation[], contradicting: ResearchCitation[]): 'strong' | 'moderate' | 'weak' | 'conflicted' {
    const supportingWeight = supporting.reduce((sum, c) => sum + c.relevanceScore * (c.citationCount / 10), 0);
    const contradictingWeight = contradicting.reduce((sum, c) => sum + c.relevanceScore * (c.citationCount / 10), 0);
    
    const totalWeight = supportingWeight + contradictingWeight;
    if (totalWeight === 0) return 'weak';
    
    const supportRatio = supportingWeight / totalWeight;
    
    if (contradictingWeight > supportingWeight * 0.5) return 'conflicted';
    if (supportRatio > 0.8) return 'strong';
    if (supportRatio > 0.6) return 'moderate';
    return 'weak';
  }

  /**
   * Calculate confidence score for verification
   */
  private calculateConfidence(supporting: ResearchCitation[], contradicting: ResearchCitation[]): number {
    const peerReviewedSupport = supporting.filter(c => c.peerReviewed).length;
    const highImpactSupport = supporting.filter(c => this.getJournalImpact(c.journal) > 3).length;
    const recentSupport = supporting.filter(c => c.year >= 2020).length;
    
    const peerReviewedContradict = contradicting.filter(c => c.peerReviewed).length;
    
    let confidence = 0;
    
    // Peer-reviewed support increases confidence
    confidence += (peerReviewedSupport / Math.max(supporting.length, 1)) * 0.4;
    
    // High-impact journal support
    confidence += (highImpactSupport / Math.max(supporting.length, 1)) * 0.3;
    
    // Recent research
    confidence += (recentSupport / Math.max(supporting.length, 1)) * 0.2;
    
    // Reduce confidence if contradicting evidence exists
    if (peerReviewedContradict > 0) {
      confidence *= 0.7;
    }
    
    // Boost confidence if many supporting papers
    if (supporting.length >= 5) {
      confidence += 0.1;
    }
    
    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * Helper methods
   */
  private extractKeyTerms(claim: string): string[] {
    // Extract meaningful terms from claim
    const terms = claim.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 3 && !['the', 'and', 'for', 'with', 'this', 'that'].includes(term));
    
    return [...new Set(terms)]; // Remove duplicates
  }

  private generateContradictoryTerms(terms: string[]): string[] {
    const contradictoryPrefixes = ['no effect', 'minimal', 'reduced', 'negative', 'ineffective'];
    const result: string[] = [];
    
    terms.forEach(term => {
      contradictoryPrefixes.forEach(prefix => {
        result.push(`${prefix} ${term}`);
      });
    });
    
    return result;
  }

  private isPeerReviewed(journal: string): boolean {
    // Most academic journals are peer-reviewed
    const nonPeerReviewed = ['LEDs Magazine', 'Greenhouse Management', 'Practical Hydroponics'];
    return !nonPeerReviewed.some(npr => journal.includes(npr));
  }

  private inferMethodology(title: string, abstract: string): 'experimental' | 'review' | 'meta-analysis' | 'case-study' {
    const text = `${title} ${abstract}`.toLowerCase();
    
    if (text.includes('meta-analysis') || text.includes('systematic review')) return 'meta-analysis';
    if (text.includes('review') || text.includes('survey')) return 'review';
    if (text.includes('case study') || text.includes('case report')) return 'case-study';
    return 'experimental';
  }

  private extractSampleSize(abstract: string): number | undefined {
    const sizeMatch = abstract.match(/n\s*=\s*(\d+)/i) || abstract.match(/(\d+)\s+plants?/i);
    return sizeMatch ? parseInt(sizeMatch[1]) : undefined;
  }

  private assessPaperConfidence(paper: any): 'high' | 'medium' | 'low' {
    let score = 0;
    
    // Journal impact factor
    const impact = this.getJournalImpact(paper.journal);
    if (impact > 5) score += 3;
    else if (impact > 2) score += 2;
    else if (impact > 0) score += 1;
    
    // Citation count
    if (paper.citationCount > 50) score += 2;
    else if (paper.citationCount > 10) score += 1;
    
    // Recent publication
    const year = paper.publishedDate ? new Date(paper.publishedDate).getFullYear() : 2020;
    if (year >= 2020) score += 1;
    
    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  private calculateRelevanceScore(paper: any, supporting: boolean): number {
    // Simple relevance scoring - would be more sophisticated in production
    let score = 0.5;
    
    // Higher relevance if it directly supports/contradicts
    score += supporting ? 0.3 : 0.2;
    
    // Journal quality
    const impact = this.getJournalImpact(paper.journal);
    score += Math.min(0.2, impact / 25);
    
    return Math.min(1, score);
  }

  private getJournalImpact(journal: string): number {
    return this.JOURNAL_IMPACT_FACTORS[journal] || 0;
  }

  private calculateAverageJournalImpact(citations: ResearchCitation[]): number {
    const impacts = citations.map(c => this.getJournalImpact(c.journal)).filter(i => i > 0);
    return impacts.length > 0 ? impacts.reduce((sum, i) => sum + i, 0) / impacts.length : 0;
  }

  private calculateMethodologyDistribution(citations: ResearchCitation[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    citations.forEach(c => {
      distribution[c.methodology] = (distribution[c.methodology] || 0) + 1;
    });
    return distribution;
  }

  private calculateOverallCredibility(verifications: FactVerification[], research: any): number {
    const avgFactConfidence = verifications.reduce((sum, v) => sum + v.confidence, 0) / verifications.length || 0;
    const peerReviewRatio = research.peerReviewedStudies / Math.max(research.totalStudies, 1);
    const impactBonus = Math.min(0.2, research.averageJournalImpact / 25);
    
    return Math.min(1, avgFactConfidence * 0.6 + peerReviewRatio * 0.3 + impactBonus);
  }

  private generateWarningsAndDisclaimers(verifications: FactVerification[], research: any): { warnings: string[]; disclaimers: string[] } {
    const warnings: string[] = [];
    const disclaimers: string[] = [];

    // Low confidence warnings
    const lowConfidenceVerifications = verifications.filter(v => v.confidence < 0.5);
    if (lowConfidenceVerifications.length > 0) {
      warnings.push(`${lowConfidenceVerifications.length} claim(s) have low research confidence`);
    }

    // Conflicted evidence warnings
    const conflictedVerifications = verifications.filter(v => v.consensusLevel === 'conflicted');
    if (conflictedVerifications.length > 0) {
      warnings.push(`${conflictedVerifications.length} claim(s) have conflicting research evidence`);
    }

    // Low research backing
    if (research.totalStudies < 3) {
      warnings.push('Limited research available for verification');
    }

    // Disclaimers
    disclaimers.push('Recommendations based on available scientific literature at time of analysis');
    disclaimers.push('Consult with horticultural professionals for facility-specific guidance');
    
    if (research.averageJournalImpact < 2) {
      disclaimers.push('Research evidence primarily from lower-impact journals');
    }

    return { warnings, disclaimers };
  }

  private isCacheValid(verification: FactVerification): boolean {
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    return Date.now() - verification.lastVerified.getTime() < maxAge;
  }

  /**
   * Add expert review to a claim
   */
  async addExpertReview(claim: string, review: Omit<ExpertReview, 'timestamp' | 'verified'>): Promise<void> {
    const expertReview: ExpertReview = {
      ...review,
      timestamp: new Date(),
      verified: await this.verifyExpertCredentials(review.expertName, review.affiliation)
    };

    const key = claim;
    const existing = this.expertReviewers.get(key) || [];
    existing.push(expertReview);
    this.expertReviewers.set(key, existing);
  }

  /**
   * Verify expert credentials (simplified - would integrate with professional databases)
   */
  private async verifyExpertCredentials(name: string, affiliation: string): Promise<boolean> {
    // In production, this would check against:
    // - University faculty directories
    // - Professional association member lists
    // - Research publication databases
    // - LinkedIn profiles with verified institutions
    
    return this.CREDIBLE_INSTITUTIONS.some(inst => 
      affiliation.toLowerCase().includes(inst.toLowerCase())
    );
  }
}

// Export singleton instance
export const researchVerificationSystem = new ResearchVerificationSystem();