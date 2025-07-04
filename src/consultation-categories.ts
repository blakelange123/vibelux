export interface ConsultationCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  subcategories: ConsultationSubcategory[];
}

export interface ConsultationSubcategory {
  id: string;
  name: string;
  description: string;
  expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  typicalDuration: number; // in minutes
  averageRate: number; // in USD per hour
  keywords: string[];
}

export const consultationCategories: ConsultationCategory[] = [
  {
    id: 'growing-agronomy',
    name: 'Growing & Agronomy',
    description: 'Crop cultivation, nutrition, and plant science expertise',
    icon: '🌱',
    color: 'green',
    subcategories: [
      {
        id: 'crop-selection',
        name: 'Crop Selection & Variety Optimization',
        description: 'Market-driven crop selection and variety optimization for maximum ROI',
        expertiseLevel: 'intermediate',
        typicalDuration: 90,
        averageRate: 200,
        keywords: ['crop selection', 'varieties', 'market demand', 'ROI', 'genetics']
      },
      {
        id: 'nutrient-recipes',
        name: 'Nutrient Recipe Formulation',
        description: 'Custom nutrient solutions and pH management strategies',
        expertiseLevel: 'advanced',
        typicalDuration: 120,
        averageRate: 225,
        keywords: ['nutrients', 'fertilizer', 'pH', 'EC', 'hydroponics', 'fertigation']
      },
      {
        id: 'ipm-strategies',
        name: 'Integrated Pest Management (IPM)',
        description: 'Sustainable pest and disease prevention and control strategies',
        expertiseLevel: 'expert',
        typicalDuration: 90,
        averageRate: 250,
        keywords: ['IPM', 'pest control', 'beneficial insects', 'organic', 'biocontrol']
      },
      {
        id: 'light-optimization',
        name: 'Light Spectrum & Photoperiod',
        description: 'LED lighting optimization for growth stages and quality',
        expertiseLevel: 'advanced',
        typicalDuration: 60,
        averageRate: 200,
        keywords: ['LED', 'spectrum', 'photoperiod', 'DLI', 'photosynthesis']
      },
      {
        id: 'climate-control',
        name: 'Climate Control Strategies',
        description: 'Environmental optimization for different crop types',
        expertiseLevel: 'intermediate',
        typicalDuration: 90,
        averageRate: 200,
        keywords: ['climate', 'temperature', 'humidity', 'VPD', 'CO2']
      },
      {
        id: 'crop-troubleshooting',
        name: 'Crop Issue Troubleshooting',
        description: 'Diagnosing and solving plant health and deficiency problems',
        expertiseLevel: 'expert',
        typicalDuration: 60,
        averageRate: 275,
        keywords: ['troubleshooting', 'deficiencies', 'plant health', 'diagnosis']
      }
    ]
  },
  {
    id: 'engineering-systems',
    name: 'Engineering & Systems Design',
    description: 'Technical facility design and infrastructure planning',
    icon: '⚙️',
    color: 'blue',
    subcategories: [
      {
        id: 'facility-layout',
        name: 'Facility Layout & Workflow',
        description: 'Optimizing space utilization and operational efficiency',
        expertiseLevel: 'expert',
        typicalDuration: 120,
        averageRate: 300,
        keywords: ['layout', 'workflow', 'space planning', 'efficiency', 'ergonomics']
      },
      {
        id: 'hvac-design',
        name: 'HVAC & Environmental Systems',
        description: 'Climate control system design and optimization',
        expertiseLevel: 'expert',
        typicalDuration: 90,
        averageRate: 275,
        keywords: ['HVAC', 'ventilation', 'cooling', 'heating', 'air handling']
      },
      {
        id: 'lighting-systems',
        name: 'Lighting System Design',
        description: 'LED selection, placement, and control system design',
        expertiseLevel: 'advanced',
        typicalDuration: 90,
        averageRate: 250,
        keywords: ['LED design', 'fixtures', 'controls', 'uniformity', 'efficiency']
      },
      {
        id: 'irrigation-design',
        name: 'Irrigation & Fertigation',
        description: 'Water and nutrient delivery system design',
        expertiseLevel: 'advanced',
        typicalDuration: 90,
        averageRate: 225,
        keywords: ['irrigation', 'fertigation', 'pumps', 'sensors', 'automation']
      },
      {
        id: 'automation-integration',
        name: 'Automation & Robotics',
        description: 'Automated systems and robotics integration',
        expertiseLevel: 'expert',
        typicalDuration: 120,
        averageRate: 325,
        keywords: ['automation', 'robotics', 'PLC', 'sensors', 'integration']
      },
      {
        id: 'energy-efficiency',
        name: 'Energy Efficiency Audits',
        description: 'Energy usage analysis and optimization strategies',
        expertiseLevel: 'advanced',
        typicalDuration: 120,
        averageRate: 250,
        keywords: ['energy audit', 'efficiency', 'utilities', 'renewable', 'costs']
      }
    ]
  },
  {
    id: 'food-safety-compliance',
    name: 'Food Safety & Compliance',
    description: 'Regulatory compliance and food safety protocols',
    icon: '🛡️',
    color: 'red',
    subcategories: [
      {
        id: 'gap-certification',
        name: 'GAP Certification',
        description: 'Good Agricultural Practices certification guidance',
        expertiseLevel: 'expert',
        typicalDuration: 120,
        averageRate: 275,
        keywords: ['GAP', 'certification', 'audit', 'food safety', 'compliance']
      },
      {
        id: 'haccp-development',
        name: 'HACCP Plan Development',
        description: 'Hazard Analysis Critical Control Points planning',
        expertiseLevel: 'expert',
        typicalDuration: 180,
        averageRate: 300,
        keywords: ['HACCP', 'food safety', 'critical control', 'hazard analysis']
      },
      {
        id: 'organic-certification',
        name: 'Organic Certification',
        description: 'USDA Organic and other organic certification guidance',
        expertiseLevel: 'advanced',
        typicalDuration: 120,
        averageRate: 250,
        keywords: ['organic', 'USDA', 'certification', 'standards', 'documentation']
      },
      {
        id: 'regulatory-compliance',
        name: 'Local Regulatory Compliance',
        description: 'State and local agricultural regulation compliance',
        expertiseLevel: 'expert',
        typicalDuration: 90,
        averageRate: 275,
        keywords: ['regulations', 'permits', 'zoning', 'local laws', 'compliance']
      },
      {
        id: 'traceability-systems',
        name: 'Traceability Implementation',
        description: 'Supply chain tracking and traceability systems',
        expertiseLevel: 'intermediate',
        typicalDuration: 90,
        averageRate: 225,
        keywords: ['traceability', 'tracking', 'QR codes', 'blockchain', 'supply chain']
      },
      {
        id: 'recall-procedures',
        name: 'Recall Procedure Development',
        description: 'Food safety recall planning and procedures',
        expertiseLevel: 'expert',
        typicalDuration: 120,
        averageRate: 300,
        keywords: ['recall', 'food safety', 'procedures', 'crisis management']
      }
    ]
  },
  {
    id: 'business-operations',
    name: 'Business Operations',
    description: 'Financial planning, operations, and strategic business guidance',
    icon: '📊',
    color: 'purple',
    subcategories: [
      {
        id: 'financial-modeling',
        name: 'Financial Modeling & Unit Economics',
        description: 'Business model analysis and financial projections',
        expertiseLevel: 'expert',
        typicalDuration: 120,
        averageRate: 300,
        keywords: ['financial model', 'unit economics', 'ROI', 'cash flow', 'projections']
      },
      {
        id: 'operational-efficiency',
        name: 'Operational Efficiency Assessment',
        description: 'Process optimization and productivity improvements',
        expertiseLevel: 'advanced',
        typicalDuration: 120,
        averageRate: 275,
        keywords: ['efficiency', 'optimization', 'lean', 'productivity', 'processes']
      },
      {
        id: 'labor-optimization',
        name: 'Labor Optimization & Training',
        description: 'Workforce planning and training program development',
        expertiseLevel: 'intermediate',
        typicalDuration: 90,
        averageRate: 225,
        keywords: ['labor', 'training', 'workforce', 'productivity', 'management']
      },
      {
        id: 'sop-development',
        name: 'Standard Operating Procedures',
        description: 'SOP creation and documentation systems',
        expertiseLevel: 'intermediate',
        typicalDuration: 120,
        averageRate: 200,
        keywords: ['SOP', 'procedures', 'documentation', 'standards', 'quality']
      },
      {
        id: 'kpi-dashboards',
        name: 'KPI Dashboard Setup',
        description: 'Performance metrics and monitoring systems',
        expertiseLevel: 'advanced',
        typicalDuration: 90,
        averageRate: 250,
        keywords: ['KPI', 'metrics', 'dashboard', 'monitoring', 'analytics']
      },
      {
        id: 'scaling-strategies',
        name: 'Scaling & Expansion Planning',
        description: 'Growth strategies and expansion planning',
        expertiseLevel: 'expert',
        typicalDuration: 120,
        averageRate: 325,
        keywords: ['scaling', 'expansion', 'growth', 'strategy', 'planning']
      }
    ]
  },
  {
    id: 'marketing-sales',
    name: 'Marketing & Sales',
    description: 'Brand development, customer acquisition, and sales strategies',
    icon: '📈',
    color: 'orange',
    subcategories: [
      {
        id: 'brand-development',
        name: 'Brand Development & Positioning',
        description: 'Brand strategy and market positioning',
        expertiseLevel: 'advanced',
        typicalDuration: 120,
        averageRate: 275,
        keywords: ['branding', 'positioning', 'marketing', 'identity', 'strategy']
      },
      {
        id: 'buyer-relationships',
        name: 'Buyer Identification & Relationships',
        description: 'Customer acquisition and relationship building',
        expertiseLevel: 'intermediate',
        typicalDuration: 90,
        averageRate: 225,
        keywords: ['buyers', 'customers', 'relationships', 'acquisition', 'networking']
      },
      {
        id: 'pricing-strategy',
        name: 'Pricing Strategy',
        description: 'Market-based pricing and revenue optimization',
        expertiseLevel: 'advanced',
        typicalDuration: 90,
        averageRate: 250,
        keywords: ['pricing', 'strategy', 'revenue', 'market analysis', 'optimization']
      },
      {
        id: 'packaging-design',
        name: 'Packaging Design & Appeal',
        description: 'Product packaging for freshness and shelf appeal',
        expertiseLevel: 'intermediate',
        typicalDuration: 90,
        averageRate: 200,
        keywords: ['packaging', 'design', 'freshness', 'shelf appeal', 'materials']
      },
      {
        id: 'direct-consumer',
        name: 'Direct-to-Consumer Channels',
        description: 'D2C strategy and channel development',
        expertiseLevel: 'intermediate',
        typicalDuration: 90,
        averageRate: 225,
        keywords: ['D2C', 'direct sales', 'e-commerce', 'channels', 'consumer']
      },
      {
        id: 'retail-partnerships',
        name: 'Retail & Foodservice Partnerships',
        description: 'B2B partnership development and management',
        expertiseLevel: 'advanced',
        typicalDuration: 120,
        averageRate: 275,
        keywords: ['retail', 'foodservice', 'partnerships', 'B2B', 'distribution']
      }
    ]
  },
  {
    id: 'supply-chain-distribution',
    name: 'Supply Chain & Distribution',
    description: 'Post-harvest handling, logistics, and distribution optimization',
    icon: '🚚',
    color: 'yellow',
    subcategories: [
      {
        id: 'post-harvest',
        name: 'Post-Harvest Handling',
        description: 'Harvesting, washing, and packaging procedures',
        expertiseLevel: 'intermediate',
        typicalDuration: 90,
        averageRate: 200,
        keywords: ['post-harvest', 'handling', 'washing', 'packaging', 'quality']
      },
      {
        id: 'cold-chain',
        name: 'Cold Chain Management',
        description: 'Temperature-controlled supply chain optimization',
        expertiseLevel: 'advanced',
        typicalDuration: 90,
        averageRate: 250,
        keywords: ['cold chain', 'temperature', 'refrigeration', 'logistics', 'quality']
      },
      {
        id: 'distribution-network',
        name: 'Distribution Network Design',
        description: 'Logistics and distribution strategy development',
        expertiseLevel: 'expert',
        typicalDuration: 120,
        averageRate: 300,
        keywords: ['distribution', 'logistics', 'network', 'strategy', 'optimization']
      },
      {
        id: 'packaging-materials',
        name: 'Packaging Material Selection',
        description: 'Sustainable and functional packaging choices',
        expertiseLevel: 'intermediate',
        typicalDuration: 60,
        averageRate: 200,
        keywords: ['packaging', 'materials', 'sustainable', 'functional', 'costs']
      },
      {
        id: 'inventory-management',
        name: 'Inventory Management Systems',
        description: 'Stock management and inventory optimization',
        expertiseLevel: 'intermediate',
        typicalDuration: 90,
        averageRate: 225,
        keywords: ['inventory', 'stock', 'management', 'optimization', 'systems']
      },
      {
        id: 'last-mile-delivery',
        name: 'Last-Mile Delivery Optimization',
        description: 'Final delivery logistics and customer experience',
        expertiseLevel: 'advanced',
        typicalDuration: 90,
        averageRate: 250,
        keywords: ['last mile', 'delivery', 'logistics', 'customer', 'optimization']
      }
    ]
  },
  {
    id: 'technology-integration',
    name: 'Technology Integration',
    description: 'Smart farming technology, automation, and data systems',
    icon: '💻',
    color: 'indigo',
    subcategories: [
      {
        id: 'sensor-systems',
        name: 'Sensor Selection & Placement',
        description: 'IoT sensor strategy and implementation',
        expertiseLevel: 'advanced',
        typicalDuration: 90,
        averageRate: 275,
        keywords: ['sensors', 'IoT', 'monitoring', 'placement', 'selection']
      },
      {
        id: 'data-architecture',
        name: 'Data Architecture Design',
        description: 'Data collection, storage, and analysis systems',
        expertiseLevel: 'expert',
        typicalDuration: 120,
        averageRate: 325,
        keywords: ['data architecture', 'database', 'analytics', 'storage', 'design']
      },
      {
        id: 'erp-integration',
        name: 'ERP/MES System Integration',
        description: 'Business system integration and workflow automation',
        expertiseLevel: 'expert',
        typicalDuration: 120,
        averageRate: 350,
        keywords: ['ERP', 'MES', 'integration', 'workflow', 'automation']
      },
      {
        id: 'cybersecurity',
        name: 'Cybersecurity for Connected Farms',
        description: 'IoT security and data protection strategies',
        expertiseLevel: 'expert',
        typicalDuration: 90,
        averageRate: 300,
        keywords: ['cybersecurity', 'IoT security', 'data protection', 'network security']
      },
      {
        id: 'custom-software',
        name: 'Custom Software Development',
        description: 'Tailored software solutions for specific needs',
        expertiseLevel: 'expert',
        typicalDuration: 120,
        averageRate: 350,
        keywords: ['software development', 'custom', 'applications', 'programming']
      },
      {
        id: 'api-integration',
        name: 'API Integration & Connectivity',
        description: 'System connectivity and third-party integrations',
        expertiseLevel: 'advanced',
        typicalDuration: 90,
        averageRate: 300,
        keywords: ['API', 'integration', 'connectivity', 'third-party', 'systems']
      }
    ]
  }
];

// Helper functions for category management
export const getAllSubcategories = (): ConsultationSubcategory[] => {
  return consultationCategories.flatMap(category => category.subcategories);
};

export const getSubcategoriesByExpertise = (level: ConsultationSubcategory['expertiseLevel']): ConsultationSubcategory[] => {
  return getAllSubcategories().filter(sub => sub.expertiseLevel === level);
};

export const getSubcategoriesByCategory = (categoryId: string): ConsultationSubcategory[] => {
  const category = consultationCategories.find(cat => cat.id === categoryId);
  return category ? category.subcategories : [];
};

export const searchSubcategories = (query: string): ConsultationSubcategory[] => {
  const lowercaseQuery = query.toLowerCase();
  return getAllSubcategories().filter(sub => 
    sub.name.toLowerCase().includes(lowercaseQuery) ||
    sub.description.toLowerCase().includes(lowercaseQuery) ||
    sub.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
  );
};

export const getAverageRateByCategory = (categoryId: string): number => {
  const subcategories = getSubcategoriesByCategory(categoryId);
  if (subcategories.length === 0) return 200;
  
  const total = subcategories.reduce((sum, sub) => sum + sub.averageRate, 0);
  return Math.round(total / subcategories.length);
};

export const getExpertiseDistribution = () => {
  const subcategories = getAllSubcategories();
  const distribution = {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    expert: 0
  };
  
  subcategories.forEach(sub => {
    distribution[sub.expertiseLevel]++;
  });
  
  return distribution;
};

// Category color mappings for UI
export const categoryColors = {
  'growing-agronomy': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  'engineering-systems': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  'food-safety-compliance': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  'business-operations': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  'marketing-sales': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  'supply-chain-distribution': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  'technology-integration': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' }
};

// Quick access to legacy specialty mapping
export const legacySpecialtyToCategoryMapping = {
  'growing': 'growing-agronomy',
  'packaging': 'supply-chain-distribution',
  'engineering': 'engineering-systems',
  'IPM': 'growing-agronomy',
  'sales': 'marketing-sales',
  'compliance': 'food-safety-compliance',
  'business': 'business-operations'
};