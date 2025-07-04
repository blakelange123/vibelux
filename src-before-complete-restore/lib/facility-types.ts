/**
 * Facility Type Definitions and Industry-Specific Features
 */

export enum FacilityType {
  CANNABIS = 'CANNABIS',
  PRODUCE = 'PRODUCE',
  ORNAMENTAL = 'ORNAMENTAL',
  RESEARCH = 'RESEARCH'
}

export interface FacilityTypeConfig {
  type: FacilityType;
  displayName: string;
  description: string;
  icon: string;
  features: {
    trackTrace: boolean;
    testingRequired: boolean;
    ageRestricted: boolean;
    bankingRestrictions: boolean;
    organicCertification: boolean;
    gapCertification: boolean;
    fsmaCompliance: boolean;
  };
  metrics: string[];
  productCategories: string[];
  complianceRequirements: string[];
  integrations: string[];
}

export const FACILITY_TYPE_CONFIGS: Record<FacilityType, FacilityTypeConfig> = {
  [FacilityType.CANNABIS]: {
    type: FacilityType.CANNABIS,
    displayName: 'Cannabis Cultivation',
    description: 'Licensed cannabis cultivation facility with track & trace compliance',
    icon: '🌿',
    features: {
      trackTrace: true,
      testingRequired: true,
      ageRestricted: true,
      bankingRestrictions: true,
      organicCertification: false,
      gapCertification: false,
      fsmaCompliance: false
    },
    metrics: [
      'THC %',
      'CBD %',
      'Terpene Profile',
      'Cannabinoid Profile',
      'Microbial Testing',
      'Pesticide Testing',
      'Heavy Metal Testing',
      'Potency',
      'Yield per Plant',
      'Grams per Watt',
      'Grams per Square Foot'
    ],
    productCategories: [
      'Flower',
      'Pre-Rolls',
      'Trim',
      'Shake',
      'Concentrates',
      'Clones',
      'Seeds',
      'Mother Plants',
      'Biomass'
    ],
    complianceRequirements: [
      'State Cannabis License',
      'Track & Trace Compliance',
      'Security Requirements',
      'Testing Requirements',
      'Packaging & Labeling',
      'Waste Disposal Tracking',
      'Transportation Manifests',
      'Age Verification'
    ],
    integrations: [
      'METRC',
      'BioTrackTHC',
      'LeafLink',
      'Confident Cannabis',
      'Steep Hill Labs',
      'SC Labs',
      'Wurk HCM',
      'Treez',
      'Flowhub'
    ]
  },
  [FacilityType.PRODUCE]: {
    type: FacilityType.PRODUCE,
    displayName: 'Produce & Leafy Greens',
    description: 'Commercial produce cultivation for food markets',
    icon: '🥬',
    features: {
      trackTrace: false,
      testingRequired: false,
      ageRestricted: false,
      bankingRestrictions: false,
      organicCertification: true,
      gapCertification: true,
      fsmaCompliance: true
    },
    metrics: [
      'Yield per Square Meter',
      'Days to Harvest',
      'Brix Level',
      'Nutritional Content',
      'Shelf Life',
      'Water Usage Efficiency',
      'Post-Harvest Loss Rate',
      'Pack-Out Rate',
      'Food Safety Score'
    ],
    productCategories: [
      'Leafy Greens',
      'Herbs',
      'Microgreens',
      'Tomatoes',
      'Peppers',
      'Cucumbers',
      'Strawberries',
      'Mushrooms',
      'Sprouts'
    ],
    complianceRequirements: [
      'Food Safety Certification',
      'GAP Certification',
      'FSMA Compliance',
      'Organic Certification (Optional)',
      'Local Health Permits',
      'Water Quality Testing',
      'Pesticide Use Reporting',
      'Traceability Records'
    ],
    integrations: [
      'FarmOS',
      'AgriDigital',
      'FoodLogiQ',
      'HarvestMark',
      'Produce Pro',
      'Famous Software',
      'Blue Book Services',
      'Whole Foods Supplier Portal',
      'Sysco SHOP'
    ]
  },
  [FacilityType.ORNAMENTAL]: {
    type: FacilityType.ORNAMENTAL,
    displayName: 'Ornamental Plants',
    description: 'Flowers, ornamental plants, and nursery operations',
    icon: '🌺',
    features: {
      trackTrace: false,
      testingRequired: false,
      ageRestricted: false,
      bankingRestrictions: false,
      organicCertification: false,
      gapCertification: false,
      fsmaCompliance: false
    },
    metrics: [
      'Plants per Square Foot',
      'Flower Count',
      'Color Quality',
      'Stem Length',
      'Vase Life',
      'Propagation Success Rate',
      'Seasonal Demand Match',
      'Shrinkage Rate'
    ],
    productCategories: [
      'Cut Flowers',
      'Potted Plants',
      'Bedding Plants',
      'Perennials',
      'Shrubs',
      'Trees',
      'Bulbs',
      'Seeds',
      'Plugs'
    ],
    complianceRequirements: [
      'Nursery License',
      'Phytosanitary Certificates',
      'Interstate Shipping Permits',
      'Invasive Species Compliance',
      'Pesticide Applicator License'
    ],
    integrations: [
      'Ball FastFinish',
      'Nursery Management Software',
      'FloraHolland',
      'LinkFresh',
      'Picas Greenhouse Production'
    ]
  },
  [FacilityType.RESEARCH]: {
    type: FacilityType.RESEARCH,
    displayName: 'Research Facility',
    description: 'Agricultural research and development',
    icon: '🔬',
    features: {
      trackTrace: false,
      testingRequired: false,
      ageRestricted: false,
      bankingRestrictions: false,
      organicCertification: false,
      gapCertification: false,
      fsmaCompliance: false
    },
    metrics: [
      'Experiment Success Rate',
      'Data Points Collected',
      'Phenotype Variations',
      'Growth Rate Comparisons',
      'Stress Response Metrics',
      'Genetic Expression Levels',
      'Publication Count',
      'Patent Applications'
    ],
    productCategories: [
      'Research Samples',
      'Tissue Cultures',
      'Genetic Lines',
      'Trial Batches',
      'Reference Materials'
    ],
    complianceRequirements: [
      'Institutional Approvals',
      'Research Permits',
      'Biosafety Protocols',
      'Data Management Plans',
      'IP Protection'
    ],
    integrations: [
      'LabArchives',
      'Benchling',
      'Geneious',
      'GraphPad Prism',
      'JMP Statistical Software'
    ]
  }
};

/**
 * Get industry-specific features based on facility type
 */
export function getFacilityFeatures(type: FacilityType): FacilityTypeConfig {
  return FACILITY_TYPE_CONFIGS[type];
}

/**
 * Determine which analytics metrics to show based on facility type
 */
export function getAnalyticsMetrics(type: FacilityType): string[] {
  switch (type) {
    case FacilityType.CANNABIS:
      return [
        'total_revenue',
        'grams_per_sqft',
        'grams_per_watt',
        'thc_average',
        'cost_per_gram',
        'compliance_score'
      ];
    case FacilityType.PRODUCE:
      return [
        'total_revenue',
        'yield_per_sqm',
        'water_efficiency',
        'days_to_harvest',
        'food_safety_score',
        'shelf_life_average'
      ];
    case FacilityType.ORNAMENTAL:
      return [
        'total_revenue',
        'plants_per_sqft',
        'propagation_rate',
        'shrinkage_rate',
        'seasonal_efficiency',
        'average_price_point'
      ];
    case FacilityType.RESEARCH:
      return [
        'experiments_completed',
        'data_points_collected',
        'success_rate',
        'publications',
        'grant_funding',
        'collaboration_score'
      ];
  }
}

/**
 * Get appropriate data input sources for facility type
 */
export function getDataInputSources(type: FacilityType): string[] {
  switch (type) {
    case FacilityType.CANNABIS:
      return ['manual', 'iot', 'track_trace', 'accounting', 'lab_testing', 'pos'];
    case FacilityType.PRODUCE:
      return ['manual', 'iot', 'accounting', 'food_safety', 'distribution', 'erp'];
    case FacilityType.ORNAMENTAL:
      return ['manual', 'iot', 'accounting', 'inventory', 'ecommerce'];
    case FacilityType.RESEARCH:
      return ['manual', 'iot', 'lab_equipment', 'data_loggers', 'image_analysis'];
  }
}