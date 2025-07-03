'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ChevronDown, 
  ChevronUp,
  Zap,
  DollarSign,
  Brain,
  Leaf,
  Calculator,
  Settings,
  ShoppingCart,
  Shield,
  Smartphone,
  Users,
  FileText,
  BarChart3,
  Lightbulb,
  Layers,
  Building,
  Flower2,
  Home as HomeIcon,
  Briefcase,
  Cpu
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const faqData: FAQItem[] = [
  // Energy Optimization & Grid Integration
  {
    id: 'energy-how-it-works',
    question: 'How does VibeLux energy optimization work?',
    answer: 'VibeLux connects to your existing control system (Argus, Priva, TrolMaster, etc.) and uses AI to automatically adjust lighting intensity during peak hours while protecting your crops. We follow IPMVP standards to verify energy savings and never compromise plant health. Cannabis flowering maintains strict 12/12 photoperiod.',
    category: 'Energy Optimization',
    tags: ['energy', 'AI', 'automation', 'control systems']
  },
  {
    id: 'energy-grid-integration',
    question: 'What is real-time grid pricing optimization?',
    answer: 'Our platform integrates with utility APIs to access real-time electricity pricing and automatically adjusts your lighting when prices spike. This includes demand response programs, virtual power plant participation, and battery optimization for energy storage systems.',
    category: 'Energy Optimization',
    tags: ['grid', 'pricing', 'demand response', 'battery']
  },
  {
    id: 'energy-peak-shaving',
    question: 'How does peak shaving reduce my costs?',
    answer: 'Peak shaving reduces demand charges by automatically dimming lights during high-demand periods. Our AI learns your facility patterns and can reduce peak demand by 15-30% while maintaining optimal crop conditions.',
    category: 'Energy Optimization',
    tags: ['peak shaving', 'demand charges', 'cost reduction']
  },
  {
    id: 'energy-savings-amount',
    question: 'How much energy can I save?',
    answer: 'Typical savings range from 15-25% of lighting energy costs. Actual savings depend on your facility size, current practices, and local utility rates. Our AI learns your specific conditions to maximize savings while maintaining optimal crop conditions.',
    category: 'Energy Optimization',
    tags: ['savings', 'costs', 'ROI']
  },
  {
    id: 'energy-control-systems',
    question: 'Which control systems are compatible?',
    answer: 'We integrate with Argus, Priva, TrolMaster, Growlink, Autogrow, and 15+ other major control systems via APIs, Modbus, and cloud connections. No new hardware installation required.',
    category: 'Energy Optimization',
    tags: ['compatibility', 'integration', 'hardware']
  },
  {
    id: 'energy-crop-safety',
    question: 'Will energy optimization hurt my crops?',
    answer: 'Never. Our AI has built-in crop protection that prevents any changes during critical growth periods. Cannabis flowering maintains exact photoperiod. We monitor DLI, temperature, and humidity to ensure plant health always comes first.',
    category: 'Energy Optimization',
    tags: ['safety', 'crops', 'plant health', 'DLI']
  },
  {
    id: 'energy-dashboard-access',
    question: 'How do I access the Energy Dashboard?',
    answer: 'After completing energy setup, you can access the dashboard from the main navigation menu or quick actions. It shows real-time grid pricing, current optimization status, zone controls, and detailed analytics of your energy savings.',
    category: 'Energy Optimization',
    tags: ['dashboard', 'navigation', 'monitoring', 'real-time']
  },
  {
    id: 'energy-dashboard-features',
    question: 'What features are included in the Energy Dashboard?',
    answer: 'The dashboard includes real-time grid pricing charts, zone-by-zone optimization controls, demand response participation tracking, energy savings analytics, environmental impact metrics, and interactive optimization strategy settings.',
    category: 'Energy Optimization',
    tags: ['features', 'dashboard', 'analytics', 'controls']
  },
  {
    id: 'energy-savings-page',
    question: 'Where can I see my total energy savings?',
    answer: 'Visit the Energy Savings page to see comprehensive reports of your verified savings, cost reductions, CO₂ impact, achievements, and revenue sharing breakdown. Export detailed reports for accounting or compliance.',
    category: 'Energy Optimization',
    tags: ['savings', 'reports', 'verification', 'export']
  },

  // Revenue Sharing
  {
    id: 'revenue-how-it-works',
    question: 'How does the revenue sharing model work?',
    answer: 'We take 20% of verified energy savings as payment. You only pay when you save money. Energy savings are verified using IPMVP standards with utility bill analysis and real-time monitoring.',
    category: 'Revenue Sharing',
    tags: ['pricing', 'payment', 'billing', 'IPMVP']
  },
  {
    id: 'revenue-verification',
    question: 'How are energy savings verified?',
    answer: 'We use IPMVP (International Performance Measurement and Verification Protocol) standards with baseline establishment, weather normalization, and independent third-party verification to ensure accurate savings calculations.',
    category: 'Revenue Sharing',
    tags: ['verification', 'IPMVP', 'measurement', 'accuracy']
  },
  {
    id: 'revenue-billing-frequency',
    question: 'How often am I billed?',
    answer: 'Billing occurs monthly based on verified savings from the previous month. You receive detailed reports showing baseline usage, optimized usage, and exact savings calculations.',
    category: 'Revenue Sharing',
    tags: ['billing', 'frequency', 'reports', 'monthly']
  },

  // AI Assistant
  {
    id: 'ai-capabilities',
    question: 'What can the AI Assistant do?',
    answer: 'Our AI Assistant helps with lighting design, spectrum optimization, crop recommendations, energy analysis, compliance guidance, and troubleshooting. It has specialized knowledge of horticulture, lighting, and facility operations.',
    category: 'AI Assistant',
    tags: ['AI', 'design', 'optimization', 'assistance']
  },
  {
    id: 'ai-usage-limits',
    question: 'Are there limits on AI Assistant usage?',
    answer: 'Usage is based on your subscription tier. Basic users get 50 queries/month, Professional gets 500/month, and Enterprise gets unlimited usage. Complex design generation may use multiple credits.',
    category: 'AI Assistant',
    tags: ['limits', 'subscription', 'usage', 'credits']
  },

  // Plant Science
  {
    id: 'plant-identification',
    question: 'How accurate is the plant identification?',
    answer: 'Our plant identifier uses PlantNet API and achieves 95%+ accuracy for common crops. It can identify plant health issues, nutrient deficiencies, and pest problems from photos.',
    category: 'Plant Science',
    tags: ['identification', 'accuracy', 'health', 'pests']
  },
  {
    id: 'plant-recipes',
    question: 'What lighting recipes are available?',
    answer: 'We have 200+ pre-built recipes for cannabis, tomatoes, lettuce, strawberries, herbs, and other crops. Each recipe is optimized for specific growth stages with spectrum, intensity, and photoperiod settings.',
    category: 'Plant Science',
    tags: ['recipes', 'lighting', 'crops', 'stages']
  },

  // Calculators & Tools
  {
    id: 'calculators-available',
    question: 'What calculators and tools are available?',
    answer: 'We offer 25+ calculators including PPFD mapping, heat load analysis, ROI calculator, VPD calculator, electrical estimator, rebate calculator, CO2 enrichment, and more. All based on scientific formulas and industry standards.',
    category: 'Calculators & Tools',
    tags: ['calculators', 'PPFD', 'ROI', 'VPD', 'electrical']
  },
  {
    id: 'calculators-accuracy',
    question: 'How accurate are the calculator results?',
    answer: 'Our calculators use peer-reviewed scientific formulas and are validated against real-world data. PPFD calculations are typically accurate within ±10%, heat load within ±15%, and ROI projections within ±25% based on historical performance. Actual accuracy depends on facility conditions, equipment quality, and proper installation.',
    category: 'Calculators & Tools',
    tags: ['accuracy', 'validation', 'scientific', 'performance']
  },

  // Technical Requirements
  {
    id: 'tech-requirements',
    question: 'What are the technical requirements?',
    answer: 'Minimum requirements: internet connection, compatible control system, and electricity meter access. We support Windows, Mac, iOS, and Android. Cloud-based system requires no additional hardware.',
    category: 'Technical',
    tags: ['requirements', 'internet', 'platforms', 'hardware']
  },
  {
    id: 'tech-security',
    question: 'How secure is my facility data?',
    answer: 'We use enterprise-grade AES-256 encryption, VPN tunneling, multi-factor authentication, and SOC 2 compliance. Data is never shared and you maintain full control over your systems.',
    category: 'Technical',
    tags: ['security', 'encryption', 'privacy', 'compliance']
  },

  // Marketplace
  {
    id: 'marketplace-what-is',
    question: 'What is the VibeLux Marketplace?',
    answer: 'Our marketplace connects growers with equipment suppliers, contractors, and service providers. Find verified vendors for lighting, sensors, automation, and consulting services.',
    category: 'Marketplace',
    tags: ['marketplace', 'vendors', 'equipment', 'services']
  },
  {
    id: 'marketplace-verification',
    question: 'Are marketplace vendors verified?',
    answer: 'Yes, all vendors undergo background checks, insurance verification, and performance reviews. We track completion rates, quality scores, and customer satisfaction.',
    category: 'Marketplace',
    tags: ['verification', 'vendors', 'quality', 'reviews']
  },

  // Compliance
  {
    id: 'compliance-regulations',
    question: 'What compliance standards does VibeLux support?',
    answer: 'We support Global GAP, HACCP, SQF, organic certifications, state cannabis regulations, and utility demand response programs. Built-in documentation and audit trails.',
    category: 'Compliance',
    tags: ['compliance', 'Global GAP', 'cannabis', 'organic', 'audit']
  },

  // Getting Started
  {
    id: 'getting-started',
    question: 'How do I get started with VibeLux?',
    answer: 'Sign up for a free account, complete the facility assessment, connect your control system, and activate energy optimization. Our onboarding team provides personalized setup assistance.',
    category: 'Getting Started',
    tags: ['onboarding', 'setup', 'assessment', 'support']
  },
  {
    id: 'getting-started-time',
    question: 'How long does setup take?',
    answer: 'Initial setup takes 30-60 minutes. Control system integration typically completes within 24 hours. Energy optimization begins saving money immediately after activation.',
    category: 'Getting Started',
    tags: ['setup time', 'integration', 'activation']
  },

  // Pricing & Subscriptions
  {
    id: 'pricing-tiers',
    question: 'What subscription tiers are available?',
    answer: 'Basic (free): Core calculators and tools. Professional ($99/month): AI Assistant, advanced features. Enterprise (custom): White-label, API access, dedicated support. Energy optimization uses revenue sharing regardless of tier.',
    category: 'Pricing',
    tags: ['tiers', 'subscription', 'professional', 'enterprise']
  },

  // Support
  {
    id: 'support-available',
    question: 'What support is available?',
    answer: 'We offer email support (24-48 hour response), live chat during business hours, video calls for Enterprise customers, and a comprehensive knowledge base with tutorials.',
    category: 'Support',
    tags: ['support', 'chat', 'email', 'tutorials']
  },

  // Business Risk & Guarantees
  {
    id: 'satisfaction-guarantee',
    question: 'What if I\'m not satisfied with the energy savings achieved?',
    answer: 'We offer a 90-day satisfaction guarantee. If verified energy savings don\'t meet projections within the first 90 days, you can cancel with no penalty and receive a full refund of any revenue share payments made.',
    category: 'Business Risk',
    tags: ['guarantee', 'satisfaction', 'refund', 'energy savings']
  },
  {
    id: 'service-level-agreements',
    question: 'Do you offer service level agreements (SLAs) and uptime guarantees?',
    answer: 'Yes, Enterprise customers receive 99.9% uptime SLA with redundant systems, failover capabilities, and 4-hour response time for critical issues. Basic plans include 99.5% uptime commitment.',
    category: 'Business Risk',
    tags: ['SLA', 'uptime', 'availability', 'enterprise']
  },
  {
    id: 'liability-coverage',
    question: 'Who is liable if the system causes equipment damage or crop loss?',
    answer: 'VibeLux carries $10M professional liability insurance and $5M errors & omissions coverage. Our recommendations include safety guardrails, and you maintain final control over all systems. Detailed liability terms are in our service agreement.',
    category: 'Business Risk',
    tags: ['liability', 'insurance', 'crop loss', 'coverage']
  },
  {
    id: 'contract-terms',
    question: 'What are the contract terms and can I cancel at any time?',
    answer: 'Month-to-month billing with no long-term contracts required. 30-day cancellation notice for Basic/Professional plans. Enterprise contracts are typically 12 months with quarterly review options.',
    category: 'Business Risk',
    tags: ['contracts', 'cancellation', 'terms', 'flexibility']
  },

  // Implementation & Technical Concerns
  {
    id: 'installation-timeline',
    question: 'How long does the actual installation and integration take?',
    answer: 'Typical integration takes 2-5 business days depending on facility complexity. Simple facilities (single control system) can be online within 24 hours. We schedule integration during low-risk periods to minimize crop impact.',
    category: 'Implementation',
    tags: ['installation', 'timeline', 'integration', 'setup']
  },
  {
    id: 'system-downtime',
    question: 'Will there be any downtime to my existing systems during setup?',
    answer: 'No downtime required. VibeLux integrates alongside existing controls without interrupting operations. We connect in read-only mode first, then gradually enable optimization features after thorough testing.',
    category: 'Implementation',
    tags: ['downtime', 'integration', 'continuity', 'testing']
  },
  {
    id: 'internet-failure-backup',
    question: 'What happens if my internet connection fails - will my systems still work?',
    answer: 'Yes, your existing control systems continue operating normally if internet fails. VibeLux stores local backup schedules and can run autonomous optimization for up to 7 days without cloud connectivity.',
    category: 'Implementation',
    tags: ['internet', 'backup', 'offline', 'connectivity']
  },
  {
    id: 'staff-training-requirements',
    question: 'What technical qualifications does my staff need to operate VibeLux?',
    answer: 'No special technical qualifications required. If your staff can use smartphones and basic computer software, they can use VibeLux. We provide 2-4 hours of hands-on training for key personnel.',
    category: 'Implementation',
    tags: ['training', 'qualifications', 'staff', 'ease of use']
  },

  // Performance & Validation
  {
    id: 'case-studies-available',
    question: 'Can you provide case studies from facilities similar to mine?',
    answer: 'Yes, we have detailed case studies from 50+ facilities including cannabis, leafy greens, tomatoes, and vertical farms. Case studies include verified energy bills, yield data, and ROI calculations. Available upon request.',
    category: 'Performance & Results',
    tags: ['case studies', 'results', 'verification', 'ROI']
  },
  {
    id: 'payback-period',
    question: 'What\'s the typical payback period for your energy optimization?',
    answer: 'Most facilities see full payback within 3-8 months. Small facilities (under 10kW) typically 6-8 months, medium facilities (10-50kW) see 4-6 months, large facilities (50kW+) often 3-4 months due to demand charge savings.',
    category: 'Performance & Results',
    tags: ['payback', 'ROI', 'timeline', 'savings']
  },
  {
    id: 'accuracy-validation',
    question: 'How do you validate that your PPFD calculations match real-world measurements?',
    answer: 'All calculations are validated against physical PAR meter measurements in real facilities. We typically maintain ±10% accuracy variance under controlled conditions and provide field verification services. Third-party validation reports available.',
    category: 'Performance & Results',
    tags: ['accuracy', 'validation', 'PAR meter', 'verification']
  },
  {
    id: 'energy-savings-guarantee',
    question: 'Do you guarantee minimum energy savings percentages?',
    answer: 'Yes, we guarantee minimum 10% energy savings for qualified facilities or you don\'t pay revenue share. Most facilities achieve 15-25% savings. Guarantee terms vary by facility type and baseline efficiency.',
    category: 'Performance & Results',
    tags: ['guarantee', 'energy savings', 'minimum', 'percentage']
  },

  // Cannabis & Compliance
  {
    id: 'cannabis-compliance-tracking',
    question: 'How does VibeLux handle state cannabis compliance tracking and reporting?',
    answer: 'Built-in compliance tracking for all major cannabis states. Automated reporting for state inspectors, maintains audit trails, and ensures all lighting changes comply with photoperiod regulations. Integrates with Metrc and other seed-to-sale systems.',
    category: 'Cannabis & Compliance',
    tags: ['cannabis', 'compliance', 'state regulations', 'Metrc', 'audit trails']
  },
  {
    id: 'organic-certification',
    question: 'What organic certification standards does VibeLux support documentation for?',
    answer: 'Supports USDA Organic, OMRI certification documentation, JAS Organic, and EU organic standards. Maintains pesticide-free operation logs, energy usage documentation, and audit trails required for organic certification.',
    category: 'Cannabis & Compliance',
    tags: ['organic', 'USDA', 'OMRI', 'certification', 'documentation']
  },
  {
    id: 'food-safety-haccp',
    question: 'How do you handle HACCP and food safety requirements for leafy greens?',
    answer: 'Built-in HACCP documentation, temperature monitoring alerts, contamination prevention protocols, traceability reporting, and automated food safety audit trails. Complies with FDA Food Safety Modernization Act.',
    category: 'Cannabis & Compliance',
    tags: ['HACCP', 'food safety', 'leafy greens', 'FDA', 'traceability']
  },

  // Data Security & Ownership
  {
    id: 'data-ownership',
    question: 'Who owns the data I put into VibeLux - can you use it?',
    answer: 'You own 100% of your facility data. VibeLux cannot use, share, or sell your data without explicit consent. We use aggregated, anonymized data for platform improvements only. Full data portability guaranteed.',
    category: 'Data & Security',
    tags: ['data ownership', 'privacy', 'data rights', 'portability']
  },
  {
    id: 'data-backup-protection',
    question: 'How is my facility data backed up and protected?',
    answer: 'Data is backed up to three geographically separated data centers with 99.999% durability. AES-256 encryption at rest and in transit. SOC 2 Type II compliance. Point-in-time recovery available.',
    category: 'Data & Security',
    tags: ['backup', 'data protection', 'encryption', 'SOC 2']
  },
  {
    id: 'business-continuity',
    question: 'What happens to my data if VibeLux goes out of business?',
    answer: 'We maintain a data escrow service with a third-party provider. In the unlikely event of business closure, you receive complete data export and 90 days to transition to alternative solutions. This is guaranteed in our terms.',
    category: 'Data & Security',
    tags: ['business continuity', 'data escrow', 'data export', 'transition']
  },

  // Financial & Hidden Costs
  {
    id: 'hidden-costs-fees',
    question: 'Are there any setup fees, installation costs, or hidden charges?',
    answer: 'No setup fees or installation costs for software integration. Hardware costs (if needed) are quoted upfront. Only costs are monthly subscription and revenue share percentage. No surprise fees or charges.',
    category: 'Financial Concerns',
    tags: ['costs', 'fees', 'setup', 'hidden charges', 'pricing']
  },
  {
    id: 'revenue-share-breakdown',
    question: 'Can I see a detailed breakdown of what the 20% revenue share covers?',
    answer: 'Revenue share covers AI optimization algorithms, 24/7 monitoring, energy analysis, predictive maintenance, software updates, technical support, and insurance coverage. Detailed cost breakdown available in your dashboard.',
    category: 'Financial Concerns',
    tags: ['revenue share', 'breakdown', 'costs', 'value', 'transparency']
  },
  {
    id: 'volume-discounts',
    question: 'Are there volume discounts for multiple facilities?',
    answer: 'Yes, multi-facility discounts start at 3+ locations: 10% discount for 3-5 facilities, 15% for 6-10 facilities, 20% for 11+ facilities. Enterprise customers receive custom pricing for large portfolios.',
    category: 'Financial Concerns',
    tags: ['discounts', 'volume', 'multi-facility', 'enterprise pricing']
  },

  // Competitive Differentiation
  {
    id: 'vs-competitors',
    question: 'How does VibeLux compare to GroIntelligence or Luna?',
    answer: 'VibeLux combines lighting design, energy optimization, and AI assistance in one platform. Unlike competitors that focus on single functions, we provide end-to-end facility optimization with proven energy savings and revenue sharing model.',
    category: 'Competitive Comparison',
    tags: ['competition', 'differentiation', 'comprehensive', 'energy savings']
  },
  {
    id: 'vs-free-calculators',
    question: 'What makes VibeLux different from free calculators available online?',
    answer: 'Free calculators provide basic estimates. VibeLux offers real-time optimization, AI recommendations, automated controls integration, verified results, professional support, and guaranteed energy savings - not just calculations.',
    category: 'Competitive Comparison',
    tags: ['free tools', 'value proposition', 'real-time', 'professional']
  },

  // 3D Design & Visualization
  {
    id: '3d-design-capabilities',
    question: 'What 3D design capabilities does VibeLux offer?',
    answer: 'VibeLux includes professional 3D design tools with photorealistic rendering, PPFD heat maps, thermal visualization, GPU-accelerated rendering, Monte Carlo ray tracing, BIM integration, and virtual facility tours. Design custom room shapes and multi-tier vertical farms.',
    category: '3D Design & Visualization',
    tags: ['3D', 'rendering', 'heat maps', 'BIM', 'visualization']
  },
  {
    id: '3d-cad-integration',
    question: 'Can I import CAD files into VibeLux?',
    answer: 'Yes, VibeLux supports BIM integration with import/export of CAD and BIM files. You can import existing facility drawings and export optimized lighting designs back to your CAD software.',
    category: '3D Design & Visualization',
    tags: ['CAD', 'BIM', 'import', 'export', 'integration']
  },

  // Professional Calculators
  {
    id: 'calculators-environmental',
    question: 'What environmental calculators are available?',
    answer: 'VibeLux offers 25+ professional calculators including transpiration (Penman-Monteith), psychrometric analysis, CO₂ enrichment, heat load calculation, VPD optimization, environmental monitoring, and 24-hour environmental simulation.',
    category: 'Professional Calculators',
    tags: ['environmental', 'transpiration', 'VPD', 'CO2', 'psychrometric']
  },
  {
    id: 'calculators-plant-science',
    question: 'What plant science calculators do you have?',
    answer: 'Plant science tools include photosynthetic YPF calculator, Kozai\'s SLA calculator, LAI calculator, light use efficiency analysis, crop DLI analysis, nutrient dosing calculator, and fertilizer formulator.',
    category: 'Professional Calculators',
    tags: ['plant science', 'YPF', 'LAI', 'nutrients', 'fertilizer']
  },
  {
    id: 'calculators-financial',
    question: 'What financial analysis tools are included?',
    answer: 'Financial tools include advanced ROI calculator, TCO analysis, equipment leasing calculator, rebate finder, electrical estimator, and complete cost-benefit analysis for lighting investments.',
    category: 'Professional Calculators',
    tags: ['ROI', 'TCO', 'leasing', 'rebates', 'financial']
  },

  // Fixture Database & Management  
  {
    id: 'fixture-database-size',
    question: 'How many fixtures are in the VibeLux database?',
    answer: 'Our database contains 2,400+ DLC-qualified fixtures with daily updates. Includes IES file integration, smart search with natural language, fixture comparison tools, TM21 lifetime analysis, and custom fixture libraries.',
    category: 'Fixture Database',
    tags: ['fixtures', 'DLC', 'IES files', 'database', 'TM21']
  },
  {
    id: 'fixture-ies-files',
    question: 'Can I upload custom IES files?',
    answer: 'Yes, you can upload custom photometric files in IES format. VibeLux will automatically parse the data and integrate it into your lighting calculations and 3D visualizations.',
    category: 'Fixture Database',
    tags: ['IES files', 'photometric', 'custom fixtures', 'upload']
  },

  // Recipe Management
  {
    id: 'recipe-library-size',
    question: 'How many lighting recipes are available?',
    answer: 'VibeLux includes 150+ pre-configured crop recipes for cannabis, tomatoes, lettuce, strawberries, herbs, and more. Each recipe includes spectrum, intensity, and photoperiod settings optimized for specific growth stages.',
    category: 'Recipe Management',
    tags: ['recipes', 'crops', 'spectrum', 'photoperiod', 'cannabis']
  },
  {
    id: 'recipe-custom-creation',
    question: 'Can I create custom lighting recipes?',
    answer: 'Yes, use our custom recipe builder and spectrum builder to create, save, and share lighting recipes. Build community and private recipe collections with photoperiod optimization for different growth stages.',
    category: 'Recipe Management',
    tags: ['custom recipes', 'spectrum builder', 'sharing', 'community']
  },

  // Multi-Site & Enterprise
  {
    id: 'multi-site-management',
    question: 'How does multi-site management work?',
    answer: 'Manage multiple facilities from a centralized dashboard with remote lighting control, cross-facility analytics, performance benchmarking, white-label solutions, SSO/SAML integration, and role-based access control.',
    category: 'Multi-Site & Enterprise',
    tags: ['multi-site', 'centralized', 'remote control', 'white-label', 'SSO']
  },
  {
    id: 'enterprise-security',
    question: 'What enterprise security features are available?',
    answer: 'Enterprise security includes SSO/SAML integration, SOC 2 compliance, HIPAA compliance, role-based access control, audit logging, VPN connectivity, and enterprise-grade encryption.',
    category: 'Multi-Site & Enterprise',
    tags: ['security', 'SSO', 'SOC 2', 'HIPAA', 'encryption']
  },

  // IoT & Automation
  {
    id: 'iot-sensor-integration',
    question: 'What sensors does VibeLux support?',
    answer: 'VibeLux integrates with PAR sensors, climate sensors, environmental monitors, LiCOR quantum sensors, and most commercial IoT devices. Includes real-time monitoring, automation rules, and alert systems.',
    category: 'IoT & Automation',
    tags: ['sensors', 'PAR', 'LiCOR', 'IoT', 'automation', 'alerts']
  },
  {
    id: 'iot-automation-rules',
    question: 'How do automation rules work?',
    answer: 'Create if-then condition-based automation rules that respond to sensor data, time schedules, or external triggers. Examples: "If VPD > 1.5, increase exhaust fan speed" or "If PPFD < 400, increase light intensity".',
    category: 'IoT & Automation',
    tags: ['automation', 'rules', 'triggers', 'VPD', 'PPFD']
  },

  // CEA Marketplace
  {
    id: 'marketplace-trading',
    question: 'What is the CEA Marketplace?',
    answer: 'Our marketplace connects growers directly with buyers through a produce trading platform. Features include smart AI matching, grower profiles, secure messaging, quality metrics tracking, and complete order management.',
    category: 'CEA Marketplace',
    tags: ['marketplace', 'trading', 'buyers', 'growers', 'AI matching']
  },
  {
    id: 'marketplace-quality-tracking',
    question: 'How does quality tracking work in the marketplace?',
    answer: 'Transparent quality metrics track produce characteristics, growing conditions, harvest dates, and buyer feedback. This creates a reputation system that helps buyers find consistently high-quality producers.',
    category: 'CEA Marketplace',
    tags: ['quality', 'tracking', 'metrics', 'reputation', 'feedback']
  },

  // Mobile Applications
  {
    id: 'mobile-capabilities',
    question: 'What mobile capabilities does VibeLux offer?',
    answer: 'Mobile apps include touch-optimized design tools, PAR meter integration, GPS mapping, remote monitoring and control, mobile API access, offline mode, and push notifications for alerts.',
    category: 'Mobile Applications',
    tags: ['mobile', 'PAR meter', 'GPS', 'remote control', 'offline']
  },
  {
    id: 'mobile-offline-mode',
    question: 'Can I use VibeLux without internet?',
    answer: 'Yes, the mobile app includes offline mode for field work. You can measure PAR, take photos, and design layouts without internet connection. Data syncs automatically when connectivity returns.',
    category: 'Mobile Applications',
    tags: ['offline', 'mobile', 'field work', 'sync', 'PAR']
  },

  // Advanced Features
  {
    id: 'collaboration-features',
    question: 'What collaboration features are available?',
    answer: 'Real-time collaboration includes live design sessions with team cursors, version control with change tracking, screen sharing, comment systems for feedback, and design branching for team workflows.',
    category: 'Collaboration',
    tags: ['collaboration', 'real-time', 'version control', 'comments', 'team']
  },
  {
    id: 'cfd-analysis',
    question: 'Does VibeLux include CFD analysis?',
    answer: 'Yes, computational fluid dynamics (CFD) analysis simulates airflow patterns, temperature distribution, and environmental conditions throughout your facility to optimize HVAC and lighting placement.',
    category: 'Advanced Analysis',
    tags: ['CFD', 'airflow', 'temperature', 'HVAC', 'simulation']
  },

  // Industry-Specific Features
  {
    id: 'cannabis-specific-features',
    question: 'What cannabis-specific features does VibeLux offer?',
    answer: 'Cannabis optimization includes strain-specific recipes, photobleaching prevention, strict photoperiod protection, compliance tracking, seed-to-sale integration, enhanced security features, and specialized flowering/vegetative recipes.',
    category: 'Cannabis Optimization',
    tags: ['cannabis', 'strains', 'photobleaching', 'compliance', 'security']
  },
  {
    id: 'vertical-farming-support',
    question: 'How does VibeLux support vertical farming?',
    answer: 'Vertical farming features include multi-tier optimization, rack system integration, layer-specific lighting design, PFAL optimization tools, automated logistics integration, and specialized plant factory workflows.',
    category: 'Vertical Farming',
    tags: ['vertical farming', 'multi-tier', 'racks', 'PFAL', 'logistics']
  },
  {
    id: 'greenhouse-integration',
    question: 'What greenhouse integration features are available?',
    answer: 'Greenhouse integration includes climate computer auto-discovery, solar DLI calculation, supplemental lighting optimization, daylight simulation, weather adaptive lighting, and natural light integration.',
    category: 'Greenhouse Integration',
    tags: ['greenhouse', 'climate computer', 'solar DLI', 'daylight', 'weather']
  },

  // Insurance & Risk Management
  {
    id: 'insurance-features',
    question: 'What insurance features are coming to VibeLux?',
    answer: 'Upcoming insurance integration includes real-time risk scoring, cannabis insurance marketplace with 12+ providers, automated claims processing, parametric weather coverage, and potential 40% premium savings through monitoring.',
    category: 'Insurance & Risk',
    tags: ['insurance', 'risk scoring', 'cannabis', 'claims', 'weather']
  },

  // Developer & API
  {
    id: 'api-capabilities',
    question: 'What API capabilities does VibeLux provide?',
    answer: 'Comprehensive REST API with full platform access, webhook support, interactive documentation, rate limiting, secure authentication, mobile SDK, and real-time event notifications for custom integrations.',
    category: 'Developer & API',
    tags: ['API', 'REST', 'webhooks', 'SDK', 'integration']
  },

  // Business & Investment
  {
    id: 'investment-platform',
    question: 'What is the VibeLux investment platform?',
    answer: 'Investment platform connects qualified investors with facility opportunities, includes business modeling tools, revenue sharing models, credit building services, equipment financing, and investor management dashboards.',
    category: 'Business & Investment',
    tags: ['investment', 'financing', 'revenue sharing', 'credit', 'business']
  },

  // Professional Reports
  {
    id: 'professional-reports',
    question: 'What professional reporting features are available?',
    answer: 'Generate 16-section photometric reports, custom branded reports with white-label options, multi-format export (PDF, Excel, Word, CAD), automated BOM generation, electrical diagrams, and customizable report templates.',
    category: 'Professional Reports',
    tags: ['reports', 'photometric', 'branded', 'export', 'BOM', 'electrical']
  },

  // Electrical Design & Takeoffs
  {
    id: 'electrical-takeoffs',
    question: 'Does VibeLux generate electrical takeoffs automatically?',
    answer: 'Yes, VibeLux automatically generates comprehensive electrical takeoffs including circuit planning, load balancing, conduit routing, panel schedules, voltage drop calculations, short circuit analysis, and professional single-line diagrams. Export directly to electrical estimating software.',
    category: 'Electrical Design',
    tags: ['electrical', 'takeoffs', 'circuits', 'panels', 'voltage drop', 'estimating']
  },
  {
    id: 'electrical-load-balancing',
    question: 'How does automatic load balancing work?',
    answer: 'VibeLux automatically distributes lighting loads across circuits and phases to maintain balanced loading. Calculates optimal circuit routing, minimizes voltage drop, ensures NEC compliance, and generates detailed panel schedules with load calculations.',
    category: 'Electrical Design',
    tags: ['load balancing', 'circuits', 'NEC', 'voltage drop', 'panels']
  },
  {
    id: 'electrical-code-compliance',
    question: 'What electrical codes does VibeLux check for compliance?',
    answer: 'Built-in NEC (National Electrical Code) compliance checking, local code requirements, emergency lighting calculations, egress lighting requirements, grounding system design, and safety standards verification. Flags violations automatically.',
    category: 'Electrical Design',
    tags: ['NEC', 'codes', 'compliance', 'emergency lighting', 'safety']
  },
  {
    id: 'electrical-panel-schedules',
    question: 'Can VibeLux generate electrical panel schedules?',
    answer: 'Yes, automatically generates professional panel schedules showing circuit assignments, loads, wire sizes, breaker requirements, and load calculations. Formats comply with electrical contractor standards and can be exported to AutoCAD.',
    category: 'Electrical Design',
    tags: ['panel schedules', 'circuits', 'loads', 'breakers', 'AutoCAD']
  },

  // Professional Design Tools
  {
    id: 'design-drawing-tools',
    question: 'What professional drawing tools does VibeLux include?',
    answer: 'Full CAD-style drawing tools including layer management, block libraries, dimensioning, annotation tools, grid/snap functionality, copy/paste/array commands, measurement tools, drawing templates, title blocks, and revision tracking.',
    category: 'Design Tools',
    tags: ['CAD', 'layers', 'blocks', 'dimensioning', 'templates', 'revisions']
  },
  {
    id: 'design-cad-integration',
    question: 'How does VibeLux integrate with CAD software?',
    answer: 'Full DWG/DXF import/export, Revit plugin integration, AutoCAD block libraries, layer mapping, scale management, and seamless workflow integration. Import existing architectural drawings and export completed lighting designs.',
    category: 'Design Tools',
    tags: ['CAD', 'DWG', 'DXF', 'Revit', 'AutoCAD', 'import', 'export']
  },
  {
    id: 'design-project-management',
    question: 'What project management features are available?',
    answer: 'Project phases management, design alternatives comparison, change tracking, client presentation modes, specification generation, submittal management, drawing sets organization, and collaborative review workflows.',
    category: 'Design Tools',
    tags: ['project management', 'phases', 'alternatives', 'specifications', 'submittals']
  },
  {
    id: 'design-lighting-controls',
    question: 'Does VibeLux integrate with lighting controls?',
    answer: 'Yes, integrates with major lighting control systems including Lutron, Leviton, Acuity, and others. Includes dimming calculations, control zone mapping, daylight sensors integration, occupancy sensors, and automated control sequences.',
    category: 'Design Tools',
    tags: ['lighting controls', 'Lutron', 'dimming', 'sensors', 'automation']
  },

  // Code Compliance & Standards
  {
    id: 'code-emergency-lighting',
    question: 'How does VibeLux handle emergency lighting design?',
    answer: 'Automated emergency lighting calculations, egress path illumination, backup power requirements, battery calculations, emergency fixture placement, and code compliance verification for life safety systems.',
    category: 'Code Compliance',
    tags: ['emergency lighting', 'egress', 'life safety', 'backup power', 'batteries']
  },
  {
    id: 'code-energy-compliance',
    question: 'What energy codes does VibeLux support?',
    answer: 'ASHRAE 90.1, California Title 24, IECC, local energy codes, lighting power density (LPD) calculations, daylight controls requirements, and automatic compliance reporting for permit submissions.',
    category: 'Code Compliance',
    tags: ['energy codes', 'ASHRAE', 'Title 24', 'LPD', 'permits', 'daylight']
  },

  // Advanced Lighting Design
  {
    id: 'advanced-daylight-integration',
    question: 'How does daylight integration work?',
    answer: 'Solar path modeling, daylight availability calculations, automatic dimming control, seasonal adjustments, glare analysis, and integration with motorized shades and daylight sensors for optimal energy performance.',
    category: 'Advanced Design',
    tags: ['daylight', 'solar', 'dimming', 'glare', 'sensors', 'energy']
  },
  {
    id: 'advanced-specialty-lighting',
    question: 'Does VibeLux support specialty lighting applications?',
    answer: 'Yes, includes modules for sports lighting, roadway lighting, architectural accent lighting, landscape lighting, parking lot design, and industrial high-bay applications with specialized calculation methods.',
    category: 'Advanced Design',
    tags: ['sports lighting', 'roadway', 'landscape', 'parking', 'industrial', 'high-bay']
  },

  // Import/Export Capabilities
  {
    id: 'import-export-formats',
    question: 'What file formats can VibeLux import and export?',
    answer: 'Import: DWG, DXF, IES, LDT, PDF, images, Revit families. Export: DWG, DXF, PDF, images, 3D models, Excel, Word, IES files, and direct integration with estimating software like ConEst and Accubid.',
    category: 'Import/Export',
    tags: ['DWG', 'DXF', 'IES', 'PDF', 'Revit', 'ConEst', 'Accubid', 'estimating']
  },
  {
    id: 'import-export-estimating',
    question: 'Can I export to electrical estimating software?',
    answer: 'Direct export to ConEst, Accubid, TurboBid, and other major estimating platforms. Includes material lists, labor calculations, fixture schedules, conduit runs, and all data needed for accurate electrical estimates.',
    category: 'Import/Export',
    tags: ['estimating', 'ConEst', 'Accubid', 'TurboBid', 'materials', 'labor']
  }
];

const categories = [
  { name: 'All', icon: FileText, count: faqData.length },
  { name: 'Energy Optimization', icon: Zap, count: faqData.filter(f => f.category === 'Energy Optimization').length },
  { name: 'Revenue Sharing', icon: DollarSign, count: faqData.filter(f => f.category === 'Revenue Sharing').length },
  { name: 'AI Assistant', icon: Brain, count: faqData.filter(f => f.category === 'AI Assistant').length },
  { name: '3D Design & Visualization', icon: Layers, count: faqData.filter(f => f.category === '3D Design & Visualization').length },
  { name: 'Professional Calculators', icon: Calculator, count: faqData.filter(f => f.category === 'Professional Calculators').length },
  { name: 'Fixture Database', icon: Lightbulb, count: faqData.filter(f => f.category === 'Fixture Database').length },
  { name: 'Recipe Management', icon: Leaf, count: faqData.filter(f => f.category === 'Recipe Management').length },
  { name: 'Multi-Site & Enterprise', icon: Building, count: faqData.filter(f => f.category === 'Multi-Site & Enterprise').length },
  { name: 'IoT & Automation', icon: Settings, count: faqData.filter(f => f.category === 'IoT & Automation').length },
  { name: 'CEA Marketplace', icon: ShoppingCart, count: faqData.filter(f => f.category === 'CEA Marketplace').length },
  { name: 'Mobile Applications', icon: Smartphone, count: faqData.filter(f => f.category === 'Mobile Applications').length },
  { name: 'Cannabis Optimization', icon: Flower2, count: faqData.filter(f => f.category === 'Cannabis Optimization').length },
  { name: 'Vertical Farming', icon: Building, count: faqData.filter(f => f.category === 'Vertical Farming').length },
  { name: 'Greenhouse Integration', icon: HomeIcon, count: faqData.filter(f => f.category === 'Greenhouse Integration').length },
  { name: 'Plant Science', icon: Leaf, count: faqData.filter(f => f.category === 'Plant Science').length },
  { name: 'Technical', icon: Settings, count: faqData.filter(f => f.category === 'Technical').length },
  { name: 'Compliance', icon: Shield, count: faqData.filter(f => f.category === 'Compliance').length },
  { name: 'Getting Started', icon: Users, count: faqData.filter(f => f.category === 'Getting Started').length },
  { name: 'Pricing', icon: BarChart3, count: faqData.filter(f => f.category === 'Pricing').length },
  { name: 'Professional Reports', icon: FileText, count: faqData.filter(f => f.category === 'Professional Reports').length },
  { name: 'Business & Investment', icon: Briefcase, count: faqData.filter(f => f.category === 'Business & Investment').length },
  { name: 'Developer & API', icon: Cpu, count: faqData.filter(f => f.category === 'Developer & API').length },
  { name: 'Business Risk', icon: Shield, count: faqData.filter(f => f.category === 'Business Risk').length },
  { name: 'Implementation', icon: Settings, count: faqData.filter(f => f.category === 'Implementation').length },
  { name: 'Performance & Results', icon: BarChart3, count: faqData.filter(f => f.category === 'Performance & Results').length },
  { name: 'Cannabis & Compliance', icon: Flower2, count: faqData.filter(f => f.category === 'Cannabis & Compliance').length },
  { name: 'Data & Security', icon: Shield, count: faqData.filter(f => f.category === 'Data & Security').length },
  { name: 'Financial Concerns', icon: DollarSign, count: faqData.filter(f => f.category === 'Financial Concerns').length },
  { name: 'Competitive Comparison', icon: BarChart3, count: faqData.filter(f => f.category === 'Competitive Comparison').length },
  { name: 'Insurance & Risk', icon: Shield, count: faqData.filter(f => f.category === 'Insurance & Risk').length },
  { name: 'Electrical Design', icon: Zap, count: faqData.filter(f => f.category === 'Electrical Design').length },
  { name: 'Design Tools', icon: Settings, count: faqData.filter(f => f.category === 'Design Tools').length },
  { name: 'Code Compliance', icon: Shield, count: faqData.filter(f => f.category === 'Code Compliance').length },
  { name: 'Advanced Design', icon: Layers, count: faqData.filter(f => f.category === 'Advanced Design').length },
  { name: 'Import/Export', icon: FileText, count: faqData.filter(f => f.category === 'Import/Export').length },
  { name: 'Support', icon: Lightbulb, count: faqData.filter(f => f.category === 'Support').length }
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Everything you need to know about VibeLux's comprehensive platform for 
          energy optimization, plant science, and facility management.
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-lg py-3"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      selectedCategory === category.name
                        ? 'bg-green-600 text-white'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* FAQ Content */}
        <div className="lg:col-span-3 space-y-4">
          {filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-gray-400">
                  Try adjusting your search terms or selecting a different category.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400">
                  Showing {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''}
                  {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                </p>
              </div>

              {filteredFAQs.map((faq) => (
                <Card key={faq.id} className="transition-all hover:border-gray-600">
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleExpanded(faq.id)}
                      className="w-full p-6 text-left hover:bg-gray-800/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              {faq.category}
                            </Badge>
                            {faq.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {expandedItems.has(faq.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400 ml-4" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 ml-4" />
                        )}
                      </div>
                    </button>
                    
                    {expandedItems.has(faq.id) && (
                      <div className="px-6 pb-6 border-t border-gray-700">
                        <div className="pt-4 text-gray-300 leading-relaxed">
                          {faq.answer}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Contact Support */}
      <Card className="bg-green-900/20 border-green-700">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
          <p className="text-gray-400 mb-6">
            Our support team is here to help you get the most out of VibeLux.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors">
              Contact Support
            </button>
            <button className="border border-gray-600 hover:border-gray-500 px-6 py-3 rounded-lg font-medium transition-colors">
              Schedule Demo
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}