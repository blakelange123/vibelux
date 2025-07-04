/**
 * CEA-Specific Food Safety Compliance Standards
 * Tailored for hydroponic, aeroponic, and vertical farming operations
 */

export interface CEAFoodSafetyStandard {
  id: string;
  name: string;
  category: 'hydroponic' | 'aeroponic' | 'vertical' | 'general';
  description: string;
  requirements: CEARequirement[];
  certificationBody?: string;
  renewalPeriod?: number; // months
}

export interface CEARequirement {
  id: string;
  title: string;
  description: string;
  critical: boolean;
  checkpoints: string[];
  documentation: string[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  category: 'water' | 'nutrients' | 'growing_media' | 'environment' | 'harvest' | 'personnel';
}

export const CEAComplianceStandards: CEAFoodSafetyStandard[] = [
  {
    id: 'cea-food-safety-coalition',
    name: 'CEA Food Safety Coalition Standards',
    category: 'general',
    description: 'Industry-specific standards developed for controlled environment agriculture',
    requirements: [
      {
        id: 'water-system-sanitation',
        title: 'Water System Sanitation and Management',
        description: 'Comprehensive water system safety for hydroponic and aeroponic systems',
        critical: true,
        category: 'water',
        frequency: 'daily',
        checkpoints: [
          'Test water source for E. coli and Salmonella (weekly)',
          'Monitor chlorine/sanitizer levels in recirculating systems',
          'Verify biofilm prevention protocols are followed',
          'Check water temperature in all zones',
          'Inspect and clean water storage tanks',
          'Validate UV sterilization systems (if used)',
          'Test electrical conductivity (EC) and pH levels'
        ],
        documentation: [
          'Water testing results log',
          'Sanitizer concentration records',
          'Biofilm inspection reports',
          'Tank cleaning schedules',
          'UV system maintenance logs'
        ]
      },
      {
        id: 'nutrient-solution-safety',
        title: 'Nutrient Solution Safety and Monitoring',
        description: 'Safe handling and monitoring of hydroponic nutrient solutions',
        critical: true,
        category: 'nutrients',
        frequency: 'daily',
        checkpoints: [
          'Monitor nutrient solution EC and pH',
          'Check for signs of nutrient solution contamination',
          'Verify proper storage of nutrient concentrates',
          'Test for heavy metals in nutrient solutions (monthly)',
          'Monitor nutrient solution temperature',
          'Check mixing equipment cleanliness',
          'Validate automated dosing system accuracy'
        ],
        documentation: [
          'Daily EC/pH monitoring logs',
          'Nutrient solution testing results',
          'Heavy metals test certificates',
          'Mixing equipment cleaning records',
          'Dosing system calibration logs'
        ]
      },
      {
        id: 'growing-media-management',
        title: 'Growing Media Sanitation and Handling',
        description: 'Safe handling and sterilization of growing substrates',
        critical: true,
        category: 'growing_media',
        frequency: 'weekly',
        checkpoints: [
          'Verify growing media sterilization procedures',
          'Check media storage conditions (dry, pest-free)',
          'Inspect for signs of contamination or mold',
          'Monitor media moisture levels in storage',
          'Validate steam sterilization temperatures (if used)',
          'Check media handling equipment cleanliness',
          'Verify supplier certificates of analysis'
        ],
        documentation: [
          'Media sterilization logs',
          'Storage condition monitoring',
          'Supplier COA documents',
          'Equipment cleaning records',
          'Contamination inspection reports'
        ]
      },
      {
        id: 'environmental-controls',
        title: 'Environmental Control System Verification',
        description: 'Maintain optimal growing conditions to prevent pathogen growth',
        critical: true,
        category: 'environment',
        frequency: 'daily',
        checkpoints: [
          'Monitor temperature and humidity in all growing zones',
          'Check air filtration system performance',
          'Verify positive air pressure maintenance',
          'Monitor CO2 levels and ventilation rates',
          'Check HVAC system cleanliness',
          'Inspect for condensation and moisture buildup',
          'Validate environmental alarm systems'
        ],
        documentation: [
          'Environmental monitoring logs',
          'Air filtration maintenance records',
          'HVAC cleaning schedules',
          'Alarm system test results',
          'Condensation inspection reports'
        ]
      },
      {
        id: 'biofilm-prevention',
        title: 'Biofilm Prevention and Control',
        description: 'Prevent biofilm formation in hydroponic and irrigation systems',
        critical: true,
        category: 'water',
        frequency: 'weekly',
        checkpoints: [
          'Inspect all water contact surfaces for biofilm',
          'Clean and sanitize irrigation lines',
          'Check for dead zones in water circulation',
          'Monitor water velocity in all pipes',
          'Inspect pumps and filters for biofilm buildup',
          'Test sanitizer penetration in system components',
          'Verify proper system drainage'
        ],
        documentation: [
          'Biofilm inspection checklists',
          'System cleaning and sanitizing logs',
          'Water velocity measurements',
          'Sanitizer efficacy test results'
        ]
      },
      {
        id: 'ipm-documentation',
        title: 'Integrated Pest Management (IPM) Documentation',
        description: 'Document pesticide-free pest management in controlled environments',
        critical: false,
        category: 'environment',
        frequency: 'weekly',
        checkpoints: [
          'Monitor beneficial insect populations',
          'Inspect for pest presence using sticky traps',
          'Document biological control releases',
          'Check exclusion methods (screens, seals)',
          'Monitor pheromone trap catches',
          'Inspect plants for pest damage',
          'Verify quarantine procedures for new plants'
        ],
        documentation: [
          'Beneficial insect monitoring logs',
          'Pest trap inspection records',
          'Biological control release logs',
          'Facility exclusion inspection reports'
        ]
      }
    ]
  },
  {
    id: 'hydroponic-specific',
    name: 'Hydroponic System Safety Standards',
    category: 'hydroponic',
    description: 'Specific requirements for hydroponic growing systems',
    requirements: [
      {
        id: 'hydroponic-system-design',
        title: 'Hydroponic System Design Compliance',
        description: 'Ensure hydroponic systems meet food safety design requirements',
        critical: true,
        category: 'water',
        frequency: 'monthly',
        checkpoints: [
          'Verify sloped channels for proper drainage',
          'Check for adequate water circulation',
          'Inspect system for dead zones or stagnant areas',
          'Verify cleanable surfaces throughout system',
          'Check for proper root zone aeration',
          'Inspect water return filtration',
          'Verify emergency drainage capabilities'
        ],
        documentation: [
          'System design verification reports',
          'Flow rate measurements',
          'Drainage test results',
          'Aeration monitoring logs'
        ]
      },
      {
        id: 'nutrient-film-technique',
        title: 'NFT System Specific Requirements',
        description: 'Special considerations for Nutrient Film Technique systems',
        critical: true,
        category: 'water',
        frequency: 'daily',
        checkpoints: [
          'Monitor film flow rate and uniformity',
          'Check for proper channel slope (1:30 to 1:40)',
          'Inspect for root blockages',
          'Verify return flow filtration',
          'Monitor reservoir water levels',
          'Check pump operation and backup systems',
          'Inspect channels for algae growth'
        ],
        documentation: [
          'Flow rate monitoring logs',
          'Channel inspection reports',
          'Pump maintenance records',
          'Algae monitoring checklists'
        ]
      }
    ]
  },
  {
    id: 'vertical-farm-specific',
    name: 'Vertical Farm Safety Standards',
    category: 'vertical',
    description: 'Multi-tier growing specific food safety requirements',
    requirements: [
      {
        id: 'multi-tier-sanitation',
        title: 'Multi-Tier Sanitation Protocols',
        description: 'Sanitation procedures for vertical growing systems',
        critical: true,
        category: 'environment',
        frequency: 'daily',
        checkpoints: [
          'Clean and sanitize each growing tier',
          'Verify proper spacing between tiers',
          'Check for cross-contamination between levels',
          'Monitor drip prevention from upper tiers',
          'Inspect tier access and worker safety',
          'Verify proper waste water collection',
          'Check LED fixture cleanliness'
        ],
        documentation: [
          'Tier-by-tier cleaning logs',
          'Cross-contamination prevention records',
          'Drip collection system reports',
          'LED cleaning schedules'
        ]
      },
      {
        id: 'vertical-airflow',
        title: 'Vertical Airflow Management',
        description: 'Air circulation and filtration for multi-tier systems',
        critical: true,
        category: 'environment',
        frequency: 'daily',
        checkpoints: [
          'Monitor airflow between growing tiers',
          'Check for proper air distribution',
          'Verify tier-specific temperature control',
          'Monitor humidity levels at each tier',
          'Check air filtration for each zone',
          'Inspect for stagnant air pockets',
          'Verify emergency ventilation systems'
        ],
        documentation: [
          'Tier-specific environmental logs',
          'Airflow measurement records',
          'Air filtration maintenance logs',
          'Emergency system test results'
        ]
      }
    ]
  }
];

export const CEACertificationBodies = {
  'CEA Food Safety Coalition': {
    website: 'https://ceafoodsafetycoalition.org',
    standards: ['CEA Food Safety Guidelines'],
    auditFrequency: 'Annual',
    cost: '$2500-5000'
  },
  'GLOBALG.A.P.': {
    website: 'https://www.globalgap.org',
    standards: ['GRASP (GLOBALG.A.P. Risk Assessment on Social Practice)'],
    auditFrequency: 'Annual',
    cost: '$3000-7000'
  },
  'Primus GFS': {
    website: 'https://primusgfs.com',
    standards: ['Primus GFS Standard'],
    auditFrequency: 'Annual',
    cost: '$2000-4000'
  },
  'SQF': {
    website: 'https://sqfi.com',
    standards: ['SQF Food Safety Code'],
    auditFrequency: 'Annual',
    cost: '$4000-8000'
  }
};

export const CEAHACCPTemplates = {
  hydroponic: {
    criticalControlPoints: [
      {
        step: 'Water Source Treatment',
        hazard: 'Pathogenic bacteria (E. coli, Salmonella)',
        criticalLimit: 'Chlorine residual 1-3 ppm',
        monitoring: 'Continuous chlorine monitoring',
        corrective: 'Increase sanitizer, test water source'
      },
      {
        step: 'Nutrient Solution pH',
        hazard: 'Pathogen survival',
        criticalLimit: 'pH 5.5-6.5',
        monitoring: 'Continuous pH monitoring',
        corrective: 'Adjust pH, investigate cause'
      },
      {
        step: 'Harvest Washing',
        hazard: 'Cross-contamination',
        criticalLimit: 'Wash water chlorine 50-200 ppm',
        monitoring: 'Test wash water every 2 hours',
        corrective: 'Replace wash water, re-wash product'
      }
    ]
  },
  vertical: {
    criticalControlPoints: [
      {
        step: 'Air Filtration',
        hazard: 'Airborne contamination',
        criticalLimit: 'MERV 13 or higher filtration',
        monitoring: 'Daily filter differential pressure',
        corrective: 'Replace filters, investigate source'
      },
      {
        step: 'Tier Sanitation',
        hazard: 'Cross-contamination between tiers',
        criticalLimit: 'ATP swab <500 RLU',
        monitoring: 'Weekly ATP testing per tier',
        corrective: 'Re-sanitize, verify procedures'
      }
    ]
  }
};

// CEA-specific microbial testing requirements
export const CEAMicrobialTesting = {
  waterSystems: {
    frequency: 'Weekly',
    parameters: [
      'E. coli O157:H7',
      'Salmonella spp.',
      'Total coliforms',
      'Generic E. coli',
      'Aerobic plate count'
    ],
    limits: {
      'E. coli O157:H7': 'Not detected in 100ml',
      'Salmonella spp.': 'Not detected in 100ml',
      'Total coliforms': '<1 CFU/100ml',
      'Generic E. coli': 'Not detected in 100ml'
    }
  },
  surfaces: {
    frequency: 'Weekly',
    parameters: [
      'ATP luminescence',
      'Aerobic plate count',
      'Enterobacteriaceae'
    ],
    limits: {
      'ATP luminescence': '<500 RLU',
      'Aerobic plate count': '<100 CFU/cm²',
      'Enterobacteriaceae': '<10 CFU/cm²'
    }
  },
  products: {
    frequency: 'Per lot',
    parameters: [
      'E. coli O157:H7',
      'Salmonella spp.',
      'Listeria monocytogenes',
      'Generic E. coli'
    ],
    sampleSize: 'n=60 (leafy greens), n=30 (others)'
  }
};