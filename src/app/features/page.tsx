'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Layers,
  Monitor,
  BarChart3,
  Calculator,
  DollarSign,
  Activity,
  Lightbulb,
  Thermometer,
  Droplets,
  Leaf,
  Brain,
  Battery,
  Users,
  Shield,
  Globe,
  Smartphone,
  ArrowRight,
  Check,
  Zap,
  ShoppingCart,
  Bot,
  FileText,
  Database,
  Map,
  GitBranch,
  Sun,
  FlaskConical,
  Package,
  Wrench,
  Share2,
  BookOpen,
  Grid3x3,
  Target,
  Cpu,
  Camera,
  Building,
  Sparkles,
  Scale
} from 'lucide-react';

const featureCategories = [
  {
    title: 'Insurance & Risk Management',
    description: 'Future: Partner with insurers to reduce premiums through monitoring',
    icon: Shield,
    color: 'from-blue-500 to-cyan-500',
    badge: 'COMING SOON',
    features: [
      {
        name: 'Real-Time Risk Scoring',
        description: 'Live facility risk assessment for premium optimization',
        href: '/features/risk-scoring',
        highlights: ['24/7 monitoring', 'Multi-factor analysis', 'Premium impact', 'Mitigation alerts']
      },
      {
        name: 'Cannabis Insurance Marketplace',
        description: 'Compare quotes from 12+ specialized providers',
        href: '/features/insurance-marketplace',
        highlights: ['Instant quotes', 'Parametric coverage', 'Group buying power', '40% savings']
      },
      {
        name: 'Automated Claims & Compliance',
        description: 'Sensor-triggered claims and compliance tracking',
        href: '/features/claims-automation',
        highlights: ['Instant payouts', 'Auto-documentation', 'Blockchain verification', 'Audit trails']
      }
    ]
  },
  {
    title: 'AI-Powered Design',
    description: 'Revolutionary AI tools that design optimal lighting systems in seconds',
    icon: Bot,
    color: 'from-purple-500 to-purple-600',
    badge: 'NEW',
    features: [
      {
        name: 'AI Design Assistant',
        description: 'AI-powered assistant creates complete lighting layouts from natural language',
        href: '/features/ai-design-assistant',
        highlights: ['Conversational design', 'Multi-tier rack support', 'Auto-optimization', 'Fixture recommendations']
      },
      {
        name: 'Smart Layout Generation',
        description: 'Automatically generate optimal fixture arrangements based on room dimensions',
        href: '/features/auto-layout',
        highlights: ['Multiple layout options', 'PPFD optimization', 'Energy efficiency analysis', 'Cost comparisons']
      },
      {
        name: 'AI Plant Health Diagnosis',
        description: 'Upload photos for instant AI-powered plant health analysis',
        href: '/features/plant-health-ai',
        highlights: ['Disease detection', 'Nutrient deficiency analysis', 'Light stress identification', 'Treatment recommendations']
      }
    ]
  },
  {
    title: 'Advanced 3D Visualization',
    description: 'Stunning photorealistic 3D views with real-time analysis',
    icon: Layers,
    color: 'from-blue-500 to-blue-600',
    badge: 'ENHANCED',
    features: [
      {
        name: '3D Design Studio',
        description: 'Professional 3D lighting design with real-time PPFD calculations',
        href: '/features/3d-designer',
        highlights: ['Photorealistic rendering', 'Light cone visualization', 'Shadow analysis', 'Walk-through mode']
      },
      {
        name: 'PPFD Heat Maps',
        description: 'Interactive 3D heat maps showing light intensity distribution',
        href: '/features/ppfd-heatmaps',
        highlights: ['Real-time calculations', 'Multi-layer analysis', 'Uniformity metrics', 'Export to reports']
      },
      {
        name: 'Thermal Visualization',
        description: 'See heat distribution from fixtures in 3D space',
        href: '/features/thermal-view',
        highlights: ['Temperature gradients', 'HVAC integration', 'Hot spot detection', 'Cooling requirements']
      }
    ]
  },
  {
    title: 'Real-time Collaboration',
    description: 'Work together on designs with your team in real-time',
    icon: Users,
    color: 'from-green-500 to-green-600',
    badge: 'NEW',
    features: [
      {
        name: 'Live Design Sessions',
        description: 'Multiple users can edit designs simultaneously with live cursors',
        href: '/features/collaboration',
        highlights: ['Live cursor tracking', 'Voice & video chat', 'Screen sharing', 'Comment threads']
      },
      {
        name: 'Version Control',
        description: 'Track changes and revert to previous versions of your designs',
        href: '/features/version-control',
        highlights: ['Change history', 'Branching & merging', 'Approval workflows', 'Audit trail']
      },
      {
        name: 'Team Management',
        description: 'Manage permissions and access for team members',
        href: '/features/team-management',
        highlights: ['Role-based access', 'Project sharing', 'Activity monitoring', 'Guest access']
      }
    ]
  },
  {
    title: 'Equipment Investment Platform',
    description: 'Revolutionary equipment financing through revenue sharing partnerships',
    icon: Package,
    color: 'from-emerald-500 to-emerald-600',
    badge: 'LIVE',
    features: [
      {
        name: 'Equipment Request Board',
        description: 'Post equipment needs and receive offers from qualified investors',
        href: '/equipment-board',
        highlights: ['15% platform fee', 'Smart escrow protection', 'Performance-based payments', 'No upfront costs']
      },
      {
        name: 'Revenue Share Management',
        description: 'Automated revenue distribution and performance tracking',
        href: '/performance',
        highlights: ['Blockchain verification', 'Real-time monitoring', 'Automated calculations', 'Transparent reporting']
      },
      {
        name: 'Equipment Marketplace',
        description: 'Browse and submit offers on equipment investment opportunities',
        href: '/equipment-board/offers',
        highlights: ['Equipment matching', 'Investment portfolio', 'ROI projections', 'Risk assessment']
      }
    ]
  },
  {
    title: 'Professional Reports',
    description: 'Generate detailed reports that win projects and impress clients',
    icon: FileText,
    color: 'from-indigo-500 to-indigo-600',
    badge: 'ENHANCED',
    features: [
      {
        name: '16-Section Photometric Reports',
        description: 'Comprehensive lighting analysis reports with executive summaries',
        href: '/features/photometric-reports',
        highlights: ['Executive summary', 'Technical specifications', 'Energy analysis', 'ROI calculations']
      },
      {
        name: 'Custom Branded Reports',
        description: 'White-label reports with your company branding',
        href: '/features/branded-reports',
        highlights: ['Logo placement', 'Custom colors', 'Contact info', 'Terms inclusion']
      },
      {
        name: 'Multi-format Export',
        description: 'Export reports in PDF, Excel, Word, and CAD formats',
        href: '/features/export-options',
        highlights: ['PDF generation', 'Excel data export', 'CAD drawings', 'BIM integration']
      }
    ]
  },
  {
    title: 'Fixture Database',
    description: 'The most comprehensive horticultural lighting database available',
    icon: Database,
    color: 'from-orange-500 to-orange-600',
    badge: 'COMPREHENSIVE',
    features: [
      {
        name: 'DLC Fixture Library',
        description: 'Complete database of DLC qualified fixtures with daily updates',
        href: '/fixtures',
        highlights: ['Growing database', 'Multiple manufacturers', 'Pricing info', 'Spectral data']
      },
      {
        name: 'Smart Search & Filters',
        description: 'Advanced search with natural language queries',
        href: '/features/fixture-search',
        highlights: ['Natural language search', 'Multi-parameter filters', 'Comparison tools', 'Favorites system']
      },
      {
        name: 'IES File Integration',
        description: 'Upload custom IES files for accurate photometric calculations',
        href: '/features/ies-integration',
        highlights: ['IES file upload', 'Validation tools', 'Custom fixtures', 'Sharing library']
      }
    ]
  },
  {
    title: 'Advanced Calculators',
    description: 'Professional-grade calculators for every aspect of cultivation',
    icon: Calculator,
    color: 'from-violet-500 to-violet-600',
    badge: 'ENHANCED',
    features: [
      {
        name: 'Unified Calculator Suite',
        description: '20+ professional calculators organized by category (Environmental, Financial, Electrical)',
        href: '/calculators',
        highlights: ['6 calculator categories', 'Lazy loading', 'Multiple layouts', 'Export capabilities']
      },
      {
        name: 'Environmental Calculators',
        description: 'Advanced DLI, heat load, CO2 enrichment, psychrometric, and transpiration calculators',
        href: '/calculators/environmental',
        highlights: ['Weather integration', 'Climate modeling', 'Growth optimization', 'Energy efficiency']
      },
      {
        name: 'Financial & ROI Tools',
        description: 'Comprehensive financial analysis including TCO, energy costs, and equipment leasing',
        href: '/calculators/financial',
        highlights: ['Utility rebates', 'Energy modeling', '10-year projections', 'Carbon footprint']
      }
    ]
  },
  {
    title: 'Recipe Management',
    description: 'Create and manage lighting recipes for optimal growth',
    icon: FlaskConical,
    color: 'from-pink-500 to-pink-600',
    badge: 'ADVANCED',
    features: [
      {
        name: 'Crop Recipe Library',
        description: 'Pre-configured lighting recipes for optimal growth',
        href: '/features/recipe-library',
        highlights: ['Research-backed', 'Growth stage specific', 'Spectrum optimization', 'DLI recommendations']
      },
      {
        name: 'Custom Recipe Builder',
        description: 'Create and save custom lighting recipes',
        href: '/features/recipe-builder',
        highlights: ['Photoperiod scheduling', 'Spectrum control', 'Intensity ramping', 'Sunrise/sunset simulation']
      },
      {
        name: 'Recipe Sharing',
        description: 'Share recipes with the community or keep them private',
        href: '/features/recipe-sharing',
        highlights: ['Community library', 'Private sharing', 'Version tracking', 'Performance data']
      }
    ]
  },
  {
    title: 'Multi-Site Management',
    description: 'Manage multiple facilities from a single dashboard',
    icon: Map,
    color: 'from-teal-500 to-teal-600',
    badge: 'ENTERPRISE',
    features: [
      {
        name: 'Facility Dashboard',
        description: 'Bird\'s eye view of all your facilities',
        href: '/features/multi-site-dashboard',
        highlights: ['Real-time monitoring', 'Performance comparison', 'Alert aggregation', 'Custom KPIs']
      },
      {
        name: 'Centralized Control',
        description: 'Control lighting across all facilities from one place',
        href: '/features/centralized-control',
        highlights: ['Remote adjustments', 'Schedule sync', 'Bulk updates', 'Override controls']
      },
      {
        name: 'Cross-Facility Analytics',
        description: 'Compare performance across different locations',
        href: '/features/cross-facility-analytics',
        highlights: ['Benchmarking', 'Best practices', 'Energy analysis', 'Yield comparison']
      }
    ]
  },
  {
    title: 'IoT & Automation',
    description: 'Connect and automate your entire growing operation',
    icon: Cpu,
    color: 'from-red-500 to-red-600',
    features: [
      {
        name: 'Sensor Integration',
        description: 'Connect quantum sensors and environmental monitors',
        href: '/features/sensor-integration',
        highlights: ['PAR sensors', 'Climate sensors', 'Real-time data', 'Calibration tools']
      },
      {
        name: 'Automation Rules',
        description: 'Create if-then rules for automatic adjustments',
        href: '/features/automation-rules',
        highlights: ['Condition-based', 'Time-based', 'Sensor triggers', 'Alert actions']
      },
      {
        name: 'API & Webhooks',
        description: 'Integrate with any system using our comprehensive API',
        href: '/features/api',
        highlights: ['RESTful API', 'Webhooks', 'Real-time data', 'Custom integrations']
      }
    ]
  },
  {
    title: 'Mobile Tools',
    description: 'Full-featured mobile apps for iOS and Android',
    icon: Smartphone,
    color: 'from-cyan-500 to-cyan-600',
    features: [
      {
        name: 'Mobile Designer',
        description: 'Design lighting systems on your phone or tablet',
        href: '/features/mobile-designer',
        highlights: ['Touch optimized', 'AR preview', 'Offline mode', 'Cloud sync']
      },
      {
        name: 'Field Tools',
        description: 'PAR meter integration and field measurement tools',
        href: '/features/field-tools',
        highlights: ['Bluetooth sensors', 'GPS mapping', 'Photo documentation', 'Quick reports']
      },
      {
        name: 'Remote Monitoring',
        description: 'Monitor and control your facility from anywhere',
        href: '/features/remote-monitoring',
        highlights: ['Push notifications', 'Live streaming', 'Quick controls', 'Alert management']
      }
    ]
  },
  {
    title: 'Dispute Resolution System',
    description: 'Professional arbitration and conflict resolution for equipment partnerships',
    icon: Scale,
    color: 'from-red-500 to-orange-500',
    badge: 'SECURE',
    features: [
      {
        name: 'Smart Dispute Filing',
        description: 'Structured dispute submission with evidence management',
        href: '/disputes/new',
        highlights: ['Multi-step process', 'Evidence upload', 'Category classification', 'Priority levels']
      },
      {
        name: 'Professional Arbitration',
        description: 'Independent arbitrators resolve conflicts fairly',
        href: '/disputes',
        highlights: ['Certified arbitrators', 'Binding decisions', 'Quick resolution', 'Appeals process']
      },
      {
        name: 'Performance Protection',
        description: 'Automated triggers for performance-based disputes',
        href: '/performance',
        highlights: ['Sensor-based evidence', 'Real-time monitoring', 'Automated alerts', 'Fair resolution']
      }
    ]
  },
  {
    title: 'User Management & Onboarding',
    description: 'Streamlined user experience and authentication',
    icon: Users,
    color: 'from-cyan-600 to-blue-600',
    badge: 'ENHANCED',
    features: [
      {
        name: 'Multi-Factor Authentication',
        description: 'Secure login with OAuth and social providers',
        href: '/login',
        highlights: ['Google OAuth', 'GitHub integration', 'Email verification', 'Password recovery']
      },
      {
        name: 'Guided Onboarding',
        description: 'Step-by-step setup process for new users',
        href: '/get-started',
        highlights: ['Role selection', 'Facility setup', 'Equipment profiling', 'Integration guides']
      },
      {
        name: 'User Dashboard',
        description: 'Personalized dashboard based on user role',
        href: '/equipment-board',
        highlights: ['Role-based views', 'Custom widgets', 'Quick actions', 'Activity feeds']
      }
    ]
  },
  {
    title: 'Enterprise Features',
    description: 'Advanced features for large-scale operations',
    icon: Building,
    color: 'from-gray-600 to-gray-700',
    badge: 'PREMIUM',
    features: [
      {
        name: 'White Label Platform',
        description: 'Fully branded version for your business',
        href: '/features/white-label',
        highlights: ['Custom domain', 'Brand colors', 'Remove Vibelux branding', 'Custom features']
      },
      {
        name: 'Advanced Security',
        description: 'Enterprise-grade security and compliance',
        href: '/features/security',
        highlights: ['SSO/SAML', 'SOC 2 Type II', 'HIPAA compliant', 'Data encryption']
      },
      {
        name: 'Dedicated Support',
        description: 'Priority support with dedicated account management',
        href: '/features/enterprise-support',
        highlights: ['24/7 phone support', 'Dedicated CSM', 'Custom training', 'SLA guarantees']
      }
    ]
  },
  {
    title: 'Predictive Maintenance AI',
    description: 'ML-powered equipment failure prediction and optimization',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    badge: 'NEW',
    features: [
      {
        name: 'AI Failure Prediction',
        description: 'Predict equipment failures 7-30 days in advance',
        href: '/features/predictive-maintenance',
        highlights: ['92% accuracy', 'Sensor pattern analysis', 'Component-level predictions', 'Risk scoring']
      },
      {
        name: 'Smart Parts Inventory',
        description: 'AI-driven parts ordering based on predicted failures',
        href: '/features/parts-inventory',
        highlights: ['Auto-reordering', 'Lead time optimization', 'Cost predictions', 'Supplier management']
      },
      {
        name: 'Maintenance Optimization',
        description: 'Optimize maintenance schedules to reduce costs',
        href: '/features/maintenance-optimization',
        highlights: ['Cost vs risk analysis', 'Automated scheduling', 'Staff allocation', 'Performance tracking']
      }
    ]
  },
  {
    title: 'Research & Analysis',
    description: 'Advanced research tools and scientific analysis capabilities',
    icon: FlaskConical,
    color: 'from-emerald-500 to-teal-600',
    badge: 'NEW',
    features: [
      {
        name: 'Time-Lag Correlation Engine',
        description: 'Detect delayed plant responses to environmental changes',
        href: '/research-library',
        highlights: ['Correlation analysis', 'Configurable time windows', 'Plant response patterns', 'Statistical validation']
      },
      {
        name: 'Maintenance ROI Calculator',
        description: 'Calculate ROI for fixture cleaning and maintenance schedules',
        href: '/calculators/maintenance-roi',
        highlights: ['Light transmission analysis', 'Degradation modeling', 'Cost optimization', 'Performance tracking']
      },
      {
        name: '3D Biomass Visualizer',
        description: 'Interactive 3D visualization of biomass vs environmental factors',
        href: '/research-analysis/biomass-3d',
        highlights: ['Three.js rendering', 'Multi-axis analysis', 'Data export', 'Environmental correlation']
      }
    ]
  },
  {
    title: 'Energy Grid Integration',
    description: 'Advanced grid connectivity for revenue generation',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    badge: 'NEW',
    features: [
      {
        name: 'Real-Time Grid Pricing',
        description: 'Live energy pricing and automated optimization',
        href: '/features/grid-pricing',
        highlights: ['Time-of-use rates', 'Peak shaving', 'Load shifting', 'Price forecasting']
      },
      {
        name: 'Demand Response Programs',
        description: 'Participate in utility incentive programs',
        href: '/features/demand-response',
        highlights: ['Automated enrollment', 'Event participation', 'Revenue tracking', 'Performance analytics']
      },
      {
        name: 'Virtual Power Plant',
        description: 'Join collective energy markets for additional revenue',
        href: '/features/virtual-power-plant',
        highlights: ['Capacity aggregation', 'Market bidding', 'Revenue sharing', 'Real-time dispatch']
      }
    ]
  }
];

const stats = [
  { label: 'Insurance Savings', value: 'Up to 40%' },
  { label: 'Risk Score Improvement', value: '35%' },
  { label: 'Energy Saved', value: '$100M+' },
  { label: 'Premium Providers', value: '12+' }
];

const additionalFeatures = [
  { icon: Shield, label: 'Group Insurance', desc: '40% savings' },
  { icon: Zap, label: 'Instant Payouts', desc: '< 24 hours' },
  { icon: Brain, label: 'Risk Prediction', desc: '92% accurate' },
  { icon: DollarSign, label: 'Premium Finance', desc: 'Flexible payment' },
  { icon: Camera, label: 'Auto Claims', desc: 'Sensor triggered' },
  { icon: GitBranch, label: 'Blockchain', desc: 'Smart contracts' },
  { icon: Target, label: '12+ Insurers', desc: 'Best rates' },
  { icon: BookOpen, label: 'Research Library', desc: '7 data sources' },
  { icon: FlaskConical, label: 'Time-Lag Analysis', desc: 'Plant responses' },
  { icon: Share2, label: 'Broker Portal', desc: 'Multi-client' },
  { icon: Battery, label: 'Equipment Coverage', desc: '100% protected' },
  { icon: Leaf, label: 'Crop Insurance', desc: 'Yield protection' }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 backdrop-blur-sm rounded-full border border-purple-700/50 mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-200">170+ Professional Features</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Design Like a Pro
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
          >
            The platform that combines AI-powered lighting design with future insurance partnerships. 
            Coming soon: Qualify for premium discounts through certified risk monitoring.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-4"
          >
            <Link
              href="/design"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Start Designing Free
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              Watch Demo
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900 rounded-xl p-6 text-center border border-gray-800"
            >
              <div className="text-3xl font-bold text-purple-400 mb-2">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Categories */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {featureCategories.map((category, categoryIndex) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="mb-20"
            >
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`p-3 bg-gradient-to-br ${category.color} rounded-xl shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold">{category.title}</h2>
                    {category.badge && (
                      <span className={`px-3 py-1 ${
                        category.badge === 'NEW' ? 'bg-green-600' :
                        category.badge === 'BETA' ? 'bg-blue-600' :
                        category.badge === 'ENHANCED' ? 'bg-purple-600' :
                        category.badge === 'PREMIUM' ? 'bg-orange-600' :
                        'bg-gray-700'
                      } text-white text-xs font-semibold rounded-full`}>
                        {category.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400">{category.description}</p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {category.features.map((feature) => (
                  <div
                    key={feature.name}
                    className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-all duration-300 group border border-gray-800 hover:border-purple-700"
                  >
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                      {feature.name}
                    </h3>
                    <p className="text-gray-400 mb-4">{feature.description}</p>
                    <ul className="space-y-2 mb-6">
                      {feature.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={feature.href}
                      className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Features */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Plus Everything Else You Need</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {additionalFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-800 rounded-lg mb-3">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-1">{item.label}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="bg-gray-950 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Professionals Choose Vibelux</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-400 mb-4">40%</div>
              <h3 className="text-xl font-semibold mb-2">Insurance Savings</h3>
              <p className="text-gray-400">Group buying power reduces premiums dramatically</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-400 mb-4">24hr</div>
              <h3 className="text-xl font-semibold mb-2">Claim Payouts</h3>
              <p className="text-gray-400">Parametric insurance pays within 24 hours</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-400 mb-4">92%</div>
              <h3 className="text-xl font-semibold mb-2">Risk Prediction</h3>
              <p className="text-gray-400">AI prevents failures before they happen</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-400 mb-4">342%</div>
              <h3 className="text-xl font-semibold mb-2">Insurance ROI</h3>
              <p className="text-gray-400">Risk mitigation value proven</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-purple-900/20 to-gray-950 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">The Future of Grow Monitoring & Risk Reduction</h2>
          <p className="text-xl text-gray-300 mb-8">
            Coming soon: Insurance partnerships to help reduce your premiums
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/design"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Start Free Trial
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}