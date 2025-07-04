/**
 * Research Context Integration
 * Provides context-aware research recommendations based on current VibeLux usage
 */

import { OpenAccessResearchClient, ResearchPaper, AGRICULTURAL_SEARCH_QUERIES } from './open-access-research';

export interface ResearchContext {
  facilityId?: string;
  cropType?: string;
  growthStage?: string;
  lightingConfiguration?: {
    fixtureTypes: string[];
    spectrumType: string;
    ppfd: number;
    dli: number;
  };
  environmentalConditions?: {
    temperature: number;
    humidity: number;
    co2: number;
    vpd: number;
  };
  challenges?: string[];
  researchGoals?: string[];
}

export interface ContextualRecommendation {
  papers: ResearchPaper[];
  relevanceExplanation: string;
  actionableInsights: string[];
  relatedSearchTerms: string[];
}

export class ResearchContextIntegration {
  private client: OpenAccessResearchClient;

  constructor() {
    this.client = new OpenAccessResearchClient();
  }

  /**
   * Get research recommendations based on current facility context
   */
  async getContextualRecommendations(context: ResearchContext): Promise<ContextualRecommendation[]> {
    const recommendations: ContextualRecommendation[] = [];

    // Generate search queries based on context
    const searchQueries = this.generateContextualQueries(context);

    for (const query of searchQueries) {
      try {
        const papers = await this.client.searchPapers(query.searchTerm);
        
        if (papers.length > 0) {
          recommendations.push({
            papers: papers.slice(0, 5), // Top 5 most relevant
            relevanceExplanation: query.explanation,
            actionableInsights: query.insights,
            relatedSearchTerms: query.relatedTerms
          });
        }
      } catch (error) {
        console.error(`Error searching for ${query.searchTerm}:`, error);
      }
    }

    return recommendations;
  }

  /**
   * Generate contextual search queries based on facility parameters
   */
  private generateContextualQueries(context: ResearchContext): Array<{
    searchTerm: string;
    explanation: string;
    insights: string[];
    relatedTerms: string[];
  }> {
    const queries: Array<{
      searchTerm: string;
      explanation: string;
      insights: string[];
      relatedTerms: string[];
    }> = [];

    // Crop-specific research
    if (context.cropType) {
      queries.push({
        searchTerm: `${context.cropType} LED lighting spectrum optimization`,
        explanation: `Research specific to ${context.cropType} lighting requirements and spectrum optimization`,
        insights: [
          `Optimal PPFD ranges for ${context.cropType}`,
          'Spectrum ratios for different growth stages',
          'Energy efficiency improvements'
        ],
        relatedTerms: [`${context.cropType} cultivation`, 'LED horticulture', 'spectrum optimization']
      });
    }

    // PPFD-specific research
    if (context.lightingConfiguration?.ppfd) {
      const ppfd = context.lightingConfiguration.ppfd;
      let intensity = 'moderate';
      if (ppfd > 800) intensity = 'high';
      if (ppfd < 200) intensity = 'low';

      queries.push({
        searchTerm: `${intensity} light intensity plant growth PPFD ${ppfd}`,
        explanation: `Research on plant responses to ${intensity} light intensity (${ppfd} PPFD)`,
        insights: [
          'Photosynthetic saturation points',
          'Light stress indicators',
          'Optimal photoperiod for this intensity'
        ],
        relatedTerms: ['PPFD optimization', 'light intensity', 'photosynthetic efficiency']
      });
    }

    // Environmental challenges
    if (context.challenges && context.challenges.length > 0) {
      context.challenges.forEach(challenge => {
        queries.push({
          searchTerm: `${challenge} controlled environment agriculture solution`,
          explanation: `Research addressing the specific challenge: ${challenge}`,
          insights: [
            'Proven mitigation strategies',
            'Environmental control recommendations',
            'Technology solutions'
          ],
          relatedTerms: [challenge, 'greenhouse management', 'environmental control']
        });
      });
    }

    // VPD-specific research
    if (context.environmentalConditions?.vpd) {
      const vpd = context.environmentalConditions.vpd;
      let vpdCategory = 'optimal';
      if (vpd > 1.5) vpdCategory = 'high';
      if (vpd < 0.5) vpdCategory = 'low';

      queries.push({
        searchTerm: `vapor pressure deficit VPD ${vpdCategory} plant transpiration`,
        explanation: `Research on plant responses to ${vpdCategory} VPD conditions (${vpd} kPa)`,
        insights: [
          'Transpiration rate optimization',
          'Stomatal conductance management',
          'Irrigation scheduling recommendations'
        ],
        relatedTerms: ['VPD management', 'transpiration', 'humidity control']
      });
    }

    // Spectrum-specific research
    if (context.lightingConfiguration?.spectrumType) {
      queries.push({
        searchTerm: `${context.lightingConfiguration.spectrumType} spectrum plant morphology development`,
        explanation: `Research on plant responses to ${context.lightingConfiguration.spectrumType} spectrum`,
        insights: [
          'Morphological responses',
          'Biochemical changes',
          'Optimal spectrum ratios'
        ],
        relatedTerms: ['light spectrum', 'plant development', 'photomorphogenesis']
      });
    }

    // Growth stage research
    if (context.growthStage) {
      queries.push({
        searchTerm: `${context.growthStage} stage lighting requirements plant development`,
        explanation: `Research on optimal lighting for ${context.growthStage} growth stage`,
        insights: [
          'Stage-specific light requirements',
          'Transition timing recommendations',
          'Yield optimization strategies'
        ],
        relatedTerms: [context.growthStage, 'growth stages', 'plant development']
      });
    }

    return queries;
  }

  /**
   * Get research recommendations for specific problems
   */
  async getProblemSolvingResearch(
    problem: string,
    context: ResearchContext
  ): Promise<ResearchPaper[]> {
    const problemSearchTerms = this.generateProblemSearchTerms(problem, context);
    const allPapers: ResearchPaper[] = [];

    for (const searchTerm of problemSearchTerms) {
      try {
        const papers = await this.client.searchPapers(searchTerm);
        allPapers.push(...papers);
      } catch (error) {
        console.error(`Error searching for problem: ${problem}`, error);
      }
    }

    // Remove duplicates and return top 10
    const uniquePapers = this.removeDuplicates(allPapers);
    return uniquePapers.slice(0, 10);
  }

  /**
   * Generate search terms for specific problems
   */
  private generateProblemSearchTerms(problem: string, context: ResearchContext): string[] {
    const baseTerms = [problem];
    
    if (context.cropType) {
      baseTerms.push(`${problem} ${context.cropType}`);
    }
    
    baseTerms.push(`${problem} controlled environment agriculture`);
    baseTerms.push(`${problem} greenhouse management`);
    baseTerms.push(`${problem} indoor farming solution`);

    return baseTerms;
  }

  /**
   * Remove duplicate papers
   */
  private removeDuplicates(papers: ResearchPaper[]): ResearchPaper[] {
    const seen = new Set<string>();
    return papers.filter(paper => {
      const key = paper.doi || paper.title.toLowerCase().replace(/\s+/g, '');
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Get trending research topics based on recent papers
   */
  async getTrendingTopics(): Promise<Array<{
    topic: string;
    paperCount: number;
    recentPapers: ResearchPaper[];
  }>> {
    const trendingTopics = [
      'LED spectrum optimization',
      'vertical farming automation',
      'energy efficient greenhouse',
      'plant phenotyping AI',
      'controlled environment agriculture',
      'hydroponic nutrient management'
    ];

    const results = [];

    for (const topic of trendingTopics) {
      try {
        const papers = await this.client.searchPapers(topic, {
          dateRange: {
            start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
            end: new Date()
          }
        });

        if (papers.length > 0) {
          results.push({
            topic,
            paperCount: papers.length,
            recentPapers: papers.slice(0, 3) // Top 3 most recent/relevant
          });
        }
      } catch (error) {
        console.error(`Error getting trending papers for ${topic}:`, error);
      }
    }

    // Sort by paper count (popularity)
    return results.sort((a, b) => b.paperCount - a.paperCount);
  }

  /**
   * Generate research insights based on multiple papers
   */
  generateResearchInsights(papers: ResearchPaper[], context: ResearchContext): {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    furtherReading: string[];
  } {
    // This would ideally use an LLM to analyze the abstracts and generate insights
    // For now, providing template-based insights
    
    const summary = `Analysis of ${papers.length} research papers related to ${context.cropType || 'agricultural'} lighting and environmental control.`;
    
    const keyFindings = [
      'Optimal PPFD ranges vary significantly by crop type and growth stage',
      'Spectrum composition affects both yield and quality parameters',
      'Environmental parameters interact synergistically with lighting',
      'Energy efficiency can be improved through dynamic control strategies'
    ];

    const recommendations = [
      'Consider implementing spectrum scheduling based on growth stages',
      'Monitor plant responses to validate theoretical optimal ranges',
      'Integrate environmental sensors for closed-loop control',
      'Document facility-specific performance for future optimization'
    ];

    const furtherReading = papers.slice(0, 3).map(paper => 
      `"${paper.title}" - ${paper.authors[0]} et al. (${paper.publishedDate.getFullYear()})`
    );

    return {
      summary,
      keyFindings,
      recommendations,
      furtherReading
    };
  }
}

/**
 * Helper function to extract research context from VibeLux facility data
 */
export function extractResearchContext(facilityData: any): ResearchContext {
  return {
    facilityId: facilityData.id,
    cropType: facilityData.cropType,
    growthStage: facilityData.currentGrowthStage,
    lightingConfiguration: {
      fixtureTypes: facilityData.fixtures?.map((f: any) => f.type) || [],
      spectrumType: facilityData.spectrumProfile,
      ppfd: facilityData.currentPPFD || 0,
      dli: facilityData.currentDLI || 0
    },
    environmentalConditions: {
      temperature: facilityData.currentTemperature || 0,
      humidity: facilityData.currentHumidity || 0,
      co2: facilityData.currentCO2 || 0,
      vpd: facilityData.currentVPD || 0
    },
    challenges: facilityData.reportedIssues || [],
    researchGoals: facilityData.optimizationGoals || []
  };
}