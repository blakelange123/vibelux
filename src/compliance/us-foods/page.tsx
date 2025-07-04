'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  Shield,
  FileCheck,
  AlertTriangle,
  ClipboardCheck,
  Package,
  Truck,
  Users,
  Calendar,
  Download,
  Camera,
  Thermometer,
  BookOpen,
  Award,
  Clock,
  Database,
  Activity,
  Zap,
  X
} from 'lucide-react';

const complianceModules = [
  {
    title: 'GFSI Certification Management',
    icon: Award,
    status: 'required',
    description: 'Track and maintain BRC, SQF, FSSC22000, IFS certifications',
    features: [
      'Certificate expiration tracking',
      'Audit report storage',
      'Corrective action management',
      'Automatic renewal reminders',
      'Unabridged report uploads',
      'Third-party warehouse audits'
    ]
  },
  {
    title: 'FSQA Data Management',
    icon: Database,
    status: 'required',
    description: 'Centralized system for all US Foods required documentation',
    features: [
      'Emergency contact management (24/7/365)',
      'Process flow diagrams with CCPs',
      'Risk/control documents',
      'Claim certifications (Kosher, Halal, Non-GMO)',
      'USF specification templates',
      'Annual registration tracking'
    ]
  },
  {
    title: 'Food Safety Plan Builder',
    icon: Shield,
    status: 'required',
    description: 'FSMA-compliant food safety plan development and management',
    features: [
      'Hazard analysis (biological, chemical, physical)',
      'Preventive controls identification',
      'Monitoring procedures',
      'Corrective action protocols',
      'Verification programs',
      'Validation documentation'
    ]
  },
  {
    title: 'Traceability System',
    icon: Package,
    status: 'required',
    description: 'One-step forward, one-step back tracking within 4 hours',
    features: [
      'Lot/batch code generation',
      'Raw material tracking',
      'Work-in-process tracking',
      'Distribution records',
      'Mock recall capability',
      'Customer shipment tracking'
    ]
  },
  {
    title: 'Temperature Monitoring',
    icon: Thermometer,
    status: 'required',
    description: 'Continuous temperature monitoring with automated logging',
    features: [
      'Real-time sensor integration',
      'Automatic deviation alerts',
      'Transportation temperature logs',
      'Cold chain verification',
      'TTR device integration',
      'Regulatory compliance reports'
    ]
  },
  {
    title: 'Allergen Management',
    icon: AlertTriangle,
    status: 'required',
    description: 'Comprehensive allergen control and cross-contact prevention',
    features: [
      'Allergen risk assessments',
      'Changeover procedures',
      'Sanitation verification',
      'Label verification',
      'Training documentation',
      'Supplier guarantees'
    ]
  }
];

const requirementCategories = [
  {
    category: 'Documentation Requirements',
    items: [
      { requirement: 'GFSI Certification', tool: 'Certificate Manager', status: 'available' },
      { requirement: 'FSQA Desk Risk Assessment', tool: 'Risk Assessment Builder', status: 'available' },
      { requirement: 'Emergency Contacts (24/7)', tool: 'Contact Management', status: 'available' },
      { requirement: 'Process Flow Diagrams', tool: 'Flow Diagram Creator', status: 'available' },
      { requirement: 'Specification Templates', tool: 'Spec Builder', status: 'available' },
      { requirement: 'Claim Certifications', tool: 'Certificate Storage', status: 'available' }
    ]
  },
  {
    category: 'Food Safety Requirements',
    items: [
      { requirement: 'HACCP/Preventive Controls', tool: 'HACCP Plan Builder', status: 'available' },
      { requirement: 'Environmental Monitoring', tool: 'Pathogen Testing Module', status: 'available' },
      { requirement: 'Sanitation SOPs', tool: 'SOP Manager', status: 'available' },
      { requirement: 'Pest Control Program', tool: 'Pest Activity Tracker', status: 'available' },
      { requirement: 'Employee Training', tool: 'Training Portal', status: 'available' },
      { requirement: 'Food Defense Program', tool: 'Security Audit Tool', status: 'available' }
    ]
  },
  {
    category: 'Quality & Testing',
    items: [
      { requirement: 'Product Testing Program', tool: 'Lab Results Manager', status: 'available' },
      { requirement: 'Shelf Life Validation', tool: 'Shelf Life Calculator', status: 'available' },
      { requirement: 'Weight Verification', tool: 'QC Check Module', status: 'available' },
      { requirement: 'Calibration Records', tool: 'Equipment Manager', status: 'available' },
      { requirement: 'Retain Sample Program', tool: 'Sample Tracker', status: 'available' },
      { requirement: 'COA Management', tool: 'Certificate Portal', status: 'available' }
    ]
  },
  {
    category: 'Operational Controls',
    items: [
      { requirement: 'Recall Program (Mock 2x/year)', tool: 'Recall Simulator', status: 'available' },
      { requirement: 'Complaint Management', tool: 'Complaint Tracker', status: 'available' },
      { requirement: 'Supplier Approval Program', tool: 'Vendor Management', status: 'available' },
      { requirement: 'Transportation Controls', tool: 'Shipping Manager', status: 'available' },
      { requirement: 'Code Dating System', tool: 'Lot Code Generator', status: 'available' },
      { requirement: 'Inventory FIFO', tool: 'Inventory System', status: 'available' }
    ]
  }
];

const produceRequirements = [
  {
    category: 'FSMA Produce Rule',
    items: [
      'Agricultural water testing and monitoring',
      'Biological soil amendments tracking',
      'Worker health and hygiene training',
      'Equipment sanitation logs',
      'Environmental assessments',
      'Sprout-specific requirements (if applicable)'
    ]
  },
  {
    category: 'Cross Valley Farms Standards',
    items: [
      'Harvest-to-ship within 2 days',
      'Temperature monitoring (TTR devices)',
      'Leafy greens cooling within 3 hours',
      'No packing above 85°F for leafy greens',
      'Approved facility GLN numbers',
      'Commodity-specific guidelines'
    ]
  },
  {
    category: 'Quality & Testing',
    items: [
      'Pesticide residue testing program',
      'Microbiological testing for RTE products',
      'Water quality testing records',
      'Environmental monitoring (Listeria)',
      'Shelf life validation studies',
      'Antimicrobial intervention for cut produce'
    ]
  },
  {
    category: 'Documentation & Certifications',
    items: [
      'GAP audit certification',
      'GFSI certification maintenance',
      'Organic certification (if applicable)',
      'Non-GMO verification (if claimed)',
      'Local/sustainable claims support',
      'Country of origin documentation'
    ]
  }
];

export default function USFoodsCompliancePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <Link
            href="/features/compliance/supplier-requirements"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Supplier Compliance
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="px-4 py-2 bg-blue-500/20 rounded-full">
                <span className="text-sm font-medium text-blue-300">US Foods Compliance Suite</span>
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-6">
              US Foods CEA Produce Compliance
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Complete compliance solution for controlled environment agriculture facilities 
              supplying fresh produce to US Foods. Automated tracking for Cross Valley Farms 
              and Exclusive Brand requirements.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/compliance/setup/us-foods"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Start Compliance Setup
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors">
                <Download className="w-5 h-5" />
                Download Checklist
              </button>
            </div>

            <div className="mt-8 bg-green-900/30 rounded-lg p-4">
              <p className="text-sm text-gray-300 mb-2 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                Automated compliance for GFSI, FSMA Produce Rule, and Cross Valley Farms standards
              </p>
              <p className="text-xs text-gray-400">
                Supporting CEA crops: Leafy Greens • Herbs • Microgreens • Tomatoes • Berries • Cucumbers • Peppers
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Requirements */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Core US Foods Requirements
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            VibeLux automates tracking and management of all mandatory US Foods supplier requirements
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceModules.map((module, index) => {
              const Icon = module.icon;
              return (
                <motion.div
                  key={module.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl p-6 relative"
                >
                  {module.status === 'required' && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-red-600 text-white text-xs rounded">
                      REQUIRED
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{module.description}</p>
                  
                  <ul className="space-y-2">
                    {module.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Requirement Mapping */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            How VibeLux Maps to US Foods Requirements
          </h2>
          
          <div className="space-y-8">
            {requirementCategories.map((category) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <h3 className="text-xl font-semibold text-blue-400 mb-4">{category.category}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item) => (
                    <div key={item.requirement} className="bg-gray-900 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white">{item.requirement}</h4>
                        {item.status === 'available' ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400">Tool: {item.tool}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CEA Produce-Specific Requirements */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            CEA Produce-Specific Requirements
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            Comprehensive compliance tracking for controlled environment agriculture operations 
            supplying fresh produce to US Foods
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {produceRequirements.map((section) => (
              <motion.div
                key={section.category}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold mb-4 text-green-400">
                  {section.category}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Special CEA Advantages */}
          <div className="mt-12 bg-green-900/20 rounded-xl p-8 border border-green-600/30">
            <h3 className="text-2xl font-bold mb-4 text-center text-green-400">
              CEA Advantages for US Foods Compliance
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="font-semibold mb-2">Reduced Risk</h4>
                <p className="text-sm text-gray-400">
                  Controlled environment eliminates many field-based contamination risks
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="font-semibold mb-2">Better Traceability</h4>
                <p className="text-sm text-gray-400">
                  Complete environmental data for every batch from seed to harvest
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="font-semibold mb-2">Year-Round Supply</h4>
                <p className="text-sm text-gray-400">
                  Consistent quality and availability regardless of season
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Automated Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">Automated Compliance Features</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-xl font-semibold">Mock Recall System</h3>
                  </div>
                  <p className="text-gray-400 mb-3">
                    Automated twice-yearly mock recalls with 4-hour traceability requirement
                  </p>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Automatic scheduling and reminders</li>
                    <li>• 100% product location tracking</li>
                    <li>• Documented results for audits</li>
                    <li>• US Foods RFI form templates</li>
                  </ul>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileCheck className="w-6 h-6 text-green-400" />
                    <h3 className="text-xl font-semibold">Document Control</h3>
                  </div>
                  <p className="text-gray-400 mb-3">
                    Version control and expiration tracking for all required documents
                  </p>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Automatic expiration alerts</li>
                    <li>• Version history tracking</li>
                    <li>• Secure document sharing</li>
                    <li>• Audit trail maintenance</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">Real-Time Monitoring</h2>
              
              <div className="bg-blue-900/20 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Live Compliance Dashboard
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <span className="text-gray-300">GFSI Certification</span>
                    <span className="text-green-400 text-sm">Valid until Dec 2024</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <span className="text-gray-300">Mock Recall Due</span>
                    <span className="text-yellow-400 text-sm">In 15 days</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <span className="text-gray-300">Document Updates</span>
                    <span className="text-green-400 text-sm">All current</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <span className="text-gray-300">Training Records</span>
                    <span className="text-green-400 text-sm">100% complete</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Integration Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Zap className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <span className="text-gray-300">Direct sync with US Foods data systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <span className="text-gray-300">Automatic specification updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <span className="text-gray-300">Real-time complaint tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <span className="text-gray-300">Scorecard performance monitoring</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Success with VibeLux</h2>
          
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
              <p className="text-gray-400 text-sm">US Foods approval rate</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">45 days</div>
              <p className="text-gray-400 text-sm">Average approval time</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">4 hours</div>
              <p className="text-gray-400 text-sm">Mock recall completion</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-yellow-400 mb-2">A+</div>
              <p className="text-gray-400 text-sm">Avg supplier score</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-8">
            <p className="text-xl text-gray-300 mb-4">
              "As a vertical farm supplying leafy greens to US Foods, VibeLux simplified our 
              entire compliance process. The automated FSMA tracking, mock recalls, and 
              temperature monitoring helped us achieve Cross Valley Farms approval in just 42 days."
            </p>
            <p className="text-gray-400">
              - Green Tower Farms, CEA Leafy Greens Supplier
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready for US Foods Approval?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Get compliant faster with our automated US Foods supplier platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/compliance/setup/us-foods"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-lg transition-colors"
            >
              Start US Foods Setup
            </Link>
            <Link
              href="/demo/us-foods"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium text-lg transition-colors"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}