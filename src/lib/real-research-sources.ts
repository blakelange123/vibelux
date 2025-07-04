/**
 * Real Research Sources Available for Plant & Light Spectrum Research
 * Documents actual APIs and databases that VibeLux could integrate with
 */

export interface RealResearchSource {
  name: string;
  type: 'api' | 'database' | 'web_scraping' | 'subscription_required';
  url: string;
  accessType: 'free' | 'api_key' | 'subscription' | 'institutional';
  description: string;
  dataTypes: string[];
  implementationNotes: string;
  agriculturalRelevance: 'high' | 'medium' | 'low';
}

/**
 * Comprehensive list of real research sources for plant and lighting research
 */
export const REAL_RESEARCH_SOURCES: RealResearchSource[] = [
  // Open Access Repositories (Already Implemented)
  {
    name: 'ArXiv',
    type: 'api',
    url: 'http://export.arxiv.org/api/query',
    accessType: 'free',
    description: 'Preprint repository for physics, including agricultural engineering',
    dataTypes: ['preprints', 'agricultural_engineering', 'photobiology'],
    implementationNotes: 'Already implemented in VibeLux',
    agriculturalRelevance: 'medium'
  },
  {
    name: 'bioRxiv',
    type: 'api',
    url: 'https://api.biorxiv.org/details/biorxiv',
    accessType: 'free',
    description: 'Life sciences preprints including plant biology',
    dataTypes: ['plant_biology', 'ecology', 'bioengineering'],
    implementationNotes: 'Already implemented in VibeLux',
    agriculturalRelevance: 'high'
  },
  {
    name: 'PubMed Central (PMC)',
    type: 'api',
    url: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
    accessType: 'free',
    description: 'Open access biomedical research papers',
    dataTypes: ['biomedical_research', 'plant_physiology', 'photobiology'],
    implementationNotes: 'Already implemented in VibeLux',
    agriculturalRelevance: 'high'
  },

  // Government Sources (Limited Public Access)
  {
    name: 'USDA NAL (National Agricultural Library)',
    type: 'database',
    url: 'https://www.nal.usda.gov/',
    accessType: 'free',
    description: 'USDA agricultural research database - web interface only',
    dataTypes: ['agricultural_research', 'plant_science', 'nutrition'],
    implementationNotes: 'No public API - would require web scraping AGRICOLA database',
    agriculturalRelevance: 'high'
  },
  {
    name: 'USDA GRIN-Global',
    type: 'database',
    url: 'https://npgsweb.ars-grin.gov/gringlobal/search',
    accessType: 'free',
    description: 'Plant genetic resources information network',
    dataTypes: ['germplasm_data', 'plant_varieties', 'genetic_resources'],
    implementationNotes: 'No API - web scraping possible but complex',
    agriculturalRelevance: 'high'
  },
  {
    name: 'NREL OpenEI',
    type: 'api',
    url: 'https://openei.org/services/',
    accessType: 'api_key',
    description: 'Energy information including renewable energy research',
    dataTypes: ['energy_data', 'solar_radiation', 'efficiency_studies'],
    implementationNotes: 'API available - VibeLux partially uses for rebate data',
    agriculturalRelevance: 'medium'
  },

  // Plant Science Databases
  {
    name: 'PlantNet API',
    type: 'api',
    url: 'https://my-api.plantnet.org/',
    accessType: 'api_key',
    description: 'Plant identification and taxonomic information',
    dataTypes: ['plant_identification', 'taxonomy', 'morphology'],
    implementationNotes: 'Already implemented in VibeLux',
    agriculturalRelevance: 'medium'
  },
  {
    name: 'Kew Gardens Plant Portal',
    type: 'database',
    url: 'http://www.plantsoftheworldonline.org/',
    accessType: 'free',
    description: 'Comprehensive plant database from Royal Botanic Gardens',
    dataTypes: ['taxonomy', 'distribution', 'conservation_status'],
    implementationNotes: 'No API - would require web scraping',
    agriculturalRelevance: 'medium'
  },
  {
    name: 'GBIF (Global Biodiversity Information Facility)',
    type: 'api',
    url: 'https://api.gbif.org/v1/',
    accessType: 'free',
    description: 'Global biodiversity and species occurrence data',
    dataTypes: ['species_occurrence', 'biodiversity', 'taxonomy'],
    implementationNotes: 'API available - could be integrated',
    agriculturalRelevance: 'low'
  },

  // Lighting & Photobiology Sources
  {
    name: 'CIE Publications Database',
    type: 'subscription_required',
    url: 'https://cie.co.at/publications',
    accessType: 'subscription',
    description: 'International Commission on Illumination standards',
    dataTypes: ['photometric_standards', 'lighting_standards', 'colorimetry'],
    implementationNotes: 'Subscription required - no API',
    agriculturalRelevance: 'medium'
  },
  {
    name: 'IES (Illuminating Engineering Society)',
    type: 'subscription_required',
    url: 'https://www.ies.org/',
    accessType: 'subscription',
    description: 'Lighting engineering standards and research',
    dataTypes: ['lighting_standards', 'horticultural_lighting', 'measurement_protocols'],
    implementationNotes: 'Member access only - no public API',
    agriculturalRelevance: 'high'
  },
  {
    name: 'ASTM Standards Database',
    type: 'subscription_required',
    url: 'https://www.astm.org/',
    accessType: 'subscription',
    description: 'Testing methodology standards including photobiology',
    dataTypes: ['testing_standards', 'measurement_protocols', 'quality_standards'],
    implementationNotes: 'Subscription required - no API',
    agriculturalRelevance: 'medium'
  },

  // Academic Journal APIs (Limited)
  {
    name: 'CrossRef API',
    type: 'api',
    url: 'https://api.crossref.org/',
    accessType: 'free',
    description: 'Metadata for academic publications across publishers',
    dataTypes: ['publication_metadata', 'citations', 'doi_resolution'],
    implementationNotes: 'API available - provides metadata but not full text',
    agriculturalRelevance: 'high'
  },
  {
    name: 'DOAJ API',
    type: 'api',
    url: 'https://doaj.org/api/v2/',
    accessType: 'free',
    description: 'Directory of Open Access Journals',
    dataTypes: ['open_access_papers', 'journal_metadata', 'abstracts'],
    implementationNotes: 'Already implemented in VibeLux',
    agriculturalRelevance: 'high'
  },
  {
    name: 'Europe PMC API',
    type: 'api',
    url: 'https://europepmc.org/RestfulWebService',
    accessType: 'free',
    description: 'European biomedical research papers',
    dataTypes: ['biomedical_research', 'full_text_access', 'citations'],
    implementationNotes: 'API available - could complement PMC integration',
    agriculturalRelevance: 'high'
  },

  // Commercial Databases (Subscription Required)
  {
    name: 'Web of Science API',
    type: 'api',
    url: 'https://developer.clarivate.com/apis/wos',
    accessType: 'subscription',
    description: 'Comprehensive academic research database',
    dataTypes: ['research_papers', 'citation_analysis', 'impact_metrics'],
    implementationNotes: 'Expensive subscription - institutional access typically required',
    agriculturalRelevance: 'high'
  },
  {
    name: 'Scopus API',
    type: 'api',
    url: 'https://dev.elsevier.com/sc_apis.html',
    accessType: 'subscription',
    description: 'Elsevier academic database',
    dataTypes: ['research_papers', 'abstracts', 'author_profiles'],
    implementationNotes: 'Subscription required - API available for institutions',
    agriculturalRelevance: 'high'
  },

  // Manufacturer Research (Limited Access)
  {
    name: 'Philips Horticulture Research',
    type: 'database',
    url: 'https://www.lighting.philips.com/main/application-areas/horticulture',
    accessType: 'free',
    description: 'Commercial horticulture lighting research',
    dataTypes: ['LED_research', 'spectrum_studies', 'crop_trials'],
    implementationNotes: 'No API - marketing materials and white papers only',
    agriculturalRelevance: 'high'
  },
  {
    name: 'OSRAM Plant Lighting',
    type: 'database',
    url: 'https://www.osram.com/os/applications/horticulture/index.jsp',
    accessType: 'free',
    description: 'OSRAM horticultural LED research',
    dataTypes: ['LED_specifications', 'application_guides', 'efficiency_data'],
    implementationNotes: 'No API - product documentation and case studies',
    agriculturalRelevance: 'high'
  }
];

/**
 * Get actually implementable research sources
 */
export function getImplementableResearchSources(): RealResearchSource[] {
  return REAL_RESEARCH_SOURCES.filter(source => 
    source.accessType === 'free' || 
    source.accessType === 'api_key'
  );
}

/**
 * Get high-value research sources for agriculture
 */
export function getHighValueAgriculturalSources(): RealResearchSource[] {
  return REAL_RESEARCH_SOURCES.filter(source => 
    source.agriculturalRelevance === 'high' &&
    (source.accessType === 'free' || source.accessType === 'api_key')
  );
}

/**
 * Get research sources that VibeLux hasn't implemented yet
 */
export function getUnimplementedSources(): RealResearchSource[] {
  const implemented = [
    'ArXiv', 'bioRxiv', 'PubMed Central (PMC)', 'DOAJ API', 
    'PlantNet API', 'NREL OpenEI'
  ];
  
  return REAL_RESEARCH_SOURCES.filter(source => 
    !implemented.includes(source.name) &&
    (source.accessType === 'free' || source.accessType === 'api_key')
  );
}

/**
 * Research gaps analysis
 */
export const RESEARCH_GAPS = {
  governmentData: {
    issue: 'Limited access to government agricultural research',
    solution: 'Most USDA/government databases lack public APIs',
    workaround: 'Web scraping or institutional partnerships'
  },
  
  manufacturerResearch: {
    issue: 'LED manufacturer research not systematically accessible',
    solution: 'No public APIs from major manufacturers',
    workaround: 'Manual curation of white papers and case studies'
  },
  
  standardsAccess: {
    issue: 'Lighting and testing standards behind paywalls',
    solution: 'CIE, IES, ASTM require expensive subscriptions',
    workaround: 'Focus on open access equivalents'
  },
  
  realtimeResearch: {
    issue: 'Limited real-time access to latest research',
    solution: 'Most journal APIs provide metadata only',
    workaround: 'Focus on preprint repositories and open access journals'
  }
};

/**
 * Next implementation priorities based on real availability
 */
export const IMPLEMENTATION_PRIORITIES = [
  {
    source: 'CrossRef API',
    effort: 'low',
    value: 'high',
    description: 'Enhance existing papers with better metadata and citations'
  },
  {
    source: 'Europe PMC API', 
    effort: 'medium',
    value: 'high',
    description: 'Complement existing PMC with European research'
  },
  {
    source: 'GBIF API',
    effort: 'medium',
    value: 'medium',
    description: 'Add species occurrence and biodiversity data'
  },
  {
    source: 'USDA NAL Web Scraping',
    effort: 'high',
    value: 'high',
    description: 'Access USDA research through web scraping (complex but valuable)'
  }
];