/**
 * CrossRef API Integration
 * Enhances existing research papers with real citation data and metadata
 * CrossRef is free and provides metadata for 130+ million scholarly works
 */

import { ResearchPaper } from './open-access-research';

export interface CrossRefWork {
  DOI: string;
  title: string[];
  author: Array<{
    given: string;
    family: string;
    ORCID?: string;
  }>;
  published: {
    'date-parts': number[][];
  };
  'container-title': string[];
  abstract?: string;
  'is-referenced-by-count': number;
  'references-count': number;
  subject: string[];
  URL: string;
  license?: Array<{
    URL: string;
    'content-version': string;
  }>;
  'content-domain': {
    domain: string[];
    'crossmark-restriction': boolean;
  };
}

export interface EnhancedResearchPaper extends ResearchPaper {
  doi: string;
  citedByCount: number;
  referencesCount: number;
  subjects: string[];
  orcidIds: string[];
  license?: string;
  isOpenAccess: boolean;
  publisherDomain: string;
}

export class CrossRefClient {
  private readonly baseUrl = 'https://api.crossref.org/works';
  private readonly userAgent = 'VibeLux Research Platform (mailto:support@vibelux.com)';

  /**
   * Search CrossRef for works matching query
   */
  async searchWorks(query: string, filters?: {
    fromPubDate?: string; // YYYY-MM-DD
    untilPubDate?: string; // YYYY-MM-DD
    hasAbstract?: boolean;
    hasOrcid?: boolean;
    hasReferences?: boolean;
    isOpenAccess?: boolean;
  }): Promise<CrossRefWork[]> {
    try {
      const searchParams = new URLSearchParams({
        query: query,
        rows: '50',
        sort: 'relevance',
        order: 'desc'
      });

      // Add filters
      if (filters?.fromPubDate) {
        searchParams.append('filter', `from-pub-date:${filters.fromPubDate}`);
      }
      if (filters?.untilPubDate) {
        searchParams.append('filter', `until-pub-date:${filters.untilPubDate}`);
      }
      if (filters?.hasAbstract) {
        searchParams.append('filter', 'has-abstract:true');
      }
      if (filters?.hasOrcid) {
        searchParams.append('filter', 'has-orcid:true');
      }
      if (filters?.hasReferences) {
        searchParams.append('filter', 'has-references:true');
      }

      const response = await fetch(`${this.baseUrl}?${searchParams}`, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`CrossRef API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.message?.items || [];
    } catch (error) {
      console.error('CrossRef search error:', error);
      return [];
    }
  }

  /**
   * Get work details by DOI
   */
  async getWorkByDOI(doi: string): Promise<CrossRefWork | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(doi)}`, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // DOI not found
        }
        throw new Error(`CrossRef API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('CrossRef DOI lookup error:', error);
      return null;
    }
  }

  /**
   * Enhance existing research papers with CrossRef metadata
   */
  async enhancePapers(papers: ResearchPaper[]): Promise<EnhancedResearchPaper[]> {
    const enhanced: EnhancedResearchPaper[] = [];

    for (const paper of papers) {
      try {
        let crossrefData: CrossRefWork | null = null;

        // Try to get data by DOI first
        if (paper.doi) {
          crossrefData = await this.getWorkByDOI(paper.doi);
        }

        // If no DOI or DOI lookup failed, search by title
        if (!crossrefData && paper.title) {
          const searchResults = await this.searchWorks(paper.title, {
            hasAbstract: true
          });
          
          // Find best match by title similarity
          crossrefData = this.findBestTitleMatch(paper.title, searchResults);
        }

        if (crossrefData) {
          enhanced.push(this.mergeWithCrossRefData(paper, crossrefData));
        } else {
          // Return original paper if no CrossRef data found
          enhanced.push({
            ...paper,
            citedByCount: 0,
            referencesCount: 0,
            subjects: [],
            orcidIds: [],
            isOpenAccess: paper.openAccessType !== 'bronze',
            publisherDomain: new URL(paper.url).hostname
          } as EnhancedResearchPaper);
        }

        // Rate limiting - CrossRef recommends 50 requests per second max
        await this.delay(20);
      } catch (error) {
        console.error(`Error enhancing paper ${paper.title}:`, error);
        enhanced.push({
          ...paper,
          citedByCount: 0,
          referencesCount: 0,
          subjects: [],
          orcidIds: [],
          isOpenAccess: paper.openAccessType !== 'bronze',
          publisherDomain: 'unknown'
        } as EnhancedResearchPaper);
      }
    }

    return enhanced;
  }

  /**
   * Search for agricultural lighting papers specifically
   */
  async searchAgriculturalLighting(): Promise<CrossRefWork[]> {
    const queries = [
      'LED lighting horticulture controlled environment agriculture',
      'plant growth light spectrum photosynthesis',
      'greenhouse lighting energy efficiency',
      'vertical farming LED optimization',
      'horticultural lighting PPFD spectrum',
      'cannabis lighting THC cannabinoids',
      'tomato lettuce LED spectrum yield'
    ];

    const allResults: CrossRefWork[] = [];

    for (const query of queries) {
      try {
        const results = await this.searchWorks(query, {
          fromPubDate: '2015-01-01', // Focus on recent research
          hasAbstract: true,
          hasReferences: true
        });

        // Filter for agricultural relevance
        const relevant = results.filter(work => 
          this.isAgriculturallyRelevant(work)
        );

        allResults.push(...relevant);
        await this.delay(100); // Be respectful with rate limiting
      } catch (error) {
        console.error(`Error searching for query "${query}":`, error);
      }
    }

    // Remove duplicates and return top results
    return this.removeDuplicates(allResults).slice(0, 100);
  }

  /**
   * Get citation metrics for a paper
   */
  async getCitationMetrics(doi: string): Promise<{
    citedByCount: number;
    referencesCount: number;
    citingWorks: string[]; // DOIs of citing works
  }> {
    try {
      const work = await this.getWorkByDOI(doi);
      if (!work) {
        return { citedByCount: 0, referencesCount: 0, citingWorks: [] };
      }

      return {
        citedByCount: work['is-referenced-by-count'] || 0,
        referencesCount: work['references-count'] || 0,
        citingWorks: [] // Would require additional API calls to get citing works
      };
    } catch (error) {
      console.error('Error getting citation metrics:', error);
      return { citedByCount: 0, referencesCount: 0, citingWorks: [] };
    }
  }

  /**
   * Merge research paper with CrossRef data
   */
  private mergeWithCrossRefData(paper: ResearchPaper, crossrefData: CrossRefWork): EnhancedResearchPaper {
    const authors = crossrefData.author?.map(author => 
      `${author.given} ${author.family}`
    ) || paper.authors;

    const orcidIds = crossrefData.author?.filter(author => author.ORCID)
      .map(author => author.ORCID!) || [];

    const publishedDate = crossrefData.published?.['date-parts']?.[0] 
      ? new Date(
          crossrefData.published['date-parts'][0][0], // year
          (crossrefData.published['date-parts'][0][1] || 1) - 1, // month (0-indexed)
          crossrefData.published['date-parts'][0][2] || 1 // day
        )
      : paper.publishedDate;

    const journal = crossrefData['container-title']?.[0] || paper.journal;

    const isOpenAccess = crossrefData.license?.some(license => 
      license.URL.includes('creativecommons.org') ||
      license.URL.includes('opensource.org')
    ) || paper.openAccessType !== 'bronze';

    return {
      ...paper,
      doi: crossrefData.DOI || paper.doi || '',
      title: crossrefData.title?.[0] || paper.title,
      authors,
      publishedDate,
      journal,
      citedByCount: crossrefData['is-referenced-by-count'] || 0,
      referencesCount: crossrefData['references-count'] || 0,
      subjects: crossrefData.subject || [],
      orcidIds,
      license: crossrefData.license?.[0]?.URL,
      isOpenAccess,
      publisherDomain: crossrefData['content-domain']?.domain?.[0] || 'unknown',
      url: crossrefData.URL || paper.url
    };
  }

  /**
   * Find best title match from search results
   */
  private findBestTitleMatch(targetTitle: string, results: CrossRefWork[]): CrossRefWork | null {
    if (results.length === 0) return null;

    const targetLower = targetTitle.toLowerCase();
    let bestMatch: CrossRefWork | null = null;
    let bestScore = 0;

    for (const work of results) {
      const workTitle = work.title?.[0]?.toLowerCase() || '';
      const score = this.calculateTitleSimilarity(targetLower, workTitle);
      
      if (score > bestScore && score > 0.7) { // Require 70% similarity
        bestScore = score;
        bestMatch = work;
      }
    }

    return bestMatch;
  }

  /**
   * Calculate title similarity using simple word overlap
   */
  private calculateTitleSimilarity(title1: string, title2: string): number {
    const words1 = new Set(title1.split(/\s+/).filter(word => word.length > 2));
    const words2 = new Set(title2.split(/\s+/).filter(word => word.length > 2));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Check if a work is agriculturally relevant
   */
  private isAgriculturallyRelevant(work: CrossRefWork): boolean {
    const title = work.title?.[0]?.toLowerCase() || '';
    const subjects = work.subject?.map(s => s.toLowerCase()) || [];
    const journal = work['container-title']?.[0]?.toLowerCase() || '';

    const agricultureKeywords = [
      'agriculture', 'horticulture', 'plant', 'crop', 'greenhouse', 'farming',
      'cultivation', 'growth', 'yield', 'led', 'lighting', 'spectrum',
      'photosynthesis', 'photoperiod', 'biomass', 'cultivation'
    ];

    const lightingKeywords = [
      'led', 'light', 'lighting', 'spectrum', 'ppfd', 'photon', 'radiation',
      'illumination', 'photoperiod', 'photomorphogenesis'
    ];

    const hasAgricultureKeyword = agricultureKeywords.some(keyword =>
      title.includes(keyword) || 
      subjects.some(subject => subject.includes(keyword)) ||
      journal.includes(keyword)
    );

    const hasLightingKeyword = lightingKeywords.some(keyword =>
      title.includes(keyword) ||
      subjects.some(subject => subject.includes(keyword))
    );

    return hasAgricultureKeyword || (hasLightingKeyword && title.includes('plant'));
  }

  /**
   * Remove duplicate works based on DOI
   */
  private removeDuplicates(works: CrossRefWork[]): CrossRefWork[] {
    const seen = new Set<string>();
    return works.filter(work => {
      if (seen.has(work.DOI)) {
        return false;
      }
      seen.add(work.DOI);
      return true;
    });
  }

  /**
   * Rate limiting helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create CrossRef client instance
 */
export function createCrossRefClient(): CrossRefClient {
  return new CrossRefClient();
}

/**
 * Helper function to enhance VibeLux research papers with CrossRef data
 */
export async function enhanceVibeLuxResearch(papers: ResearchPaper[]): Promise<EnhancedResearchPaper[]> {
  const client = createCrossRefClient();
  return await client.enhancePapers(papers);
}