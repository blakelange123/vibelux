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
  Award
} from 'lucide-react';

const complianceModules = [
  {
    title: 'Food Safety Documentation',
    icon: Shield,
    description: 'Automated record keeping for HACCP, GAP, and food safety protocols',
    features: [
      'Temperature monitoring logs',
      'Sanitation records',
      'Employee training tracking',
      'Pest control documentation',
      'Water quality testing logs',
      'Chemical usage records'
    ]
  },
  {
    title: 'Traceability System',
    icon: Package,
    description: 'Complete seed-to-sale tracking for recall readiness',
    features: [
      'Lot/batch tracking',
      'Input material tracking',
      'Harvest date recording',
      'Processing records',
      'Distribution tracking',
      'One-step recall capability'
    ]
  },
  {
    title: 'Quality Assurance',
    icon: ClipboardCheck,
    description: 'Digital quality control and inspection management',
    features: [
      'Incoming material inspection',
      'Pre-harvest inspections',
      'Post-harvest quality checks',
      'Photo documentation',
      'Defect tracking',
      'Corrective action plans'
    ]
  },
  {
    title: 'Compliance Calendar',
    icon: Calendar,
    description: 'Never miss a certification renewal or audit deadline',
    features: [
      'Audit scheduling',
      'Certification renewals',
      'Training deadlines',
      'Testing reminders',
      'Document expiration alerts',
      'Regulatory updates'
    ]
  }
];

const supplierRequirements = [
  {
    category: 'Food Safety',
    items: [
      'GFSI certification (SQF, BRC, FSSC 22000)',
      'Third-party audits',
      'HACCP plans',
      'Allergen controls',
      'Recall procedures',
      'Crisis management plans'
    ]
  },
  {
    category: 'Traceability',
    items: [
      'One-up, one-down tracking',
      'Lot code management',
      'Electronic record keeping',
      '24-hour recall capability',
      'Supply chain visibility',
      'Ingredient sourcing records'
    ]
  },
  {
    category: 'Quality Standards',
    items: [
      'Product specifications',
      'COA requirements',
      'Shelf life validation',
      'Sensory evaluation',
      'Microbiological testing',
      'Pesticide residue testing'
    ]
  },
  {
    category: 'Operational Requirements',
    items: [
      'Insurance coverage',
      'Facility inspections',
      'Employee training',
      'Sustainability reporting',
      'Social responsibility',
      'Business continuity plans'
    ]
  }
];

export default function SupplierRequirementsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Features
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
                <span className="text-sm font-medium text-blue-300">Compliance & Food Safety</span>
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-6">
              Supplier Compliance Hub
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Meet and exceed requirements from major buyers like US Foods, Sysco, and retail chains. 
              Automated compliance tracking, documentation, and audit preparation in one platform.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/compliance"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Launch Compliance Hub
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors">
                <Download className="w-5 h-5" />
                Download Checklist
              </button>
            </div>

            <div className="mt-8 bg-green-900/30 rounded-lg p-4 flex items-center gap-3">
              <Award className="w-6 h-6 text-green-400 flex-shrink-0" />
              <p className="text-sm text-gray-300">
                Already supporting GlobalGAP, SQF, and other major certification programs
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Modules */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comprehensive Compliance Management
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {complianceModules.map((module, index) => {
              const Icon = module.icon;
              return (
                <motion.div
                  key={module.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold">{module.title}</h3>
                  </div>
                  
                  <p className="text-gray-400 mb-6">{module.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {module.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supplier Requirements Matrix */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Major Buyer Requirements Coverage
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            VibeLux helps you meet requirements from all major food service companies and retailers
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supplierRequirements.map((category) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-blue-400 mb-4">{category.category}</h3>
                <ul className="space-y-2">
                  {category.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Automated Features */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">Automated Documentation</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Thermometer className="w-6 h-6 text-red-400" />
                    <h3 className="text-xl font-semibold">Temperature Monitoring</h3>
                  </div>
                  <p className="text-gray-400">
                    Automatic temperature logging from connected sensors with alerts for 
                    deviations. Generate reports for audits with one click.
                  </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Camera className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-semibold">Photo Documentation</h3>
                  </div>
                  <p className="text-gray-400">
                    Capture and organize photos for quality issues, corrective actions, 
                    and audit evidence. Time-stamped and GPS-tagged.
                  </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileCheck className="w-6 h-6 text-green-400" />
                    <h3 className="text-xl font-semibold">Digital Forms</h3>
                  </div>
                  <p className="text-gray-400">
                    Replace paper forms with digital checklists. Pre-populated fields, 
                    automatic calculations, and instant submission.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">Audit Preparation Tools</h2>
              
              <div className="bg-blue-900/20 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Mock Audit System
                </h3>
                <p className="text-gray-300 mb-4">
                  Run practice audits using actual buyer checklists. Identify gaps 
                  before the real audit.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• US Foods supplier checklist</li>
                  <li>• Sysco quality standards</li>
                  <li>• Walmart produce requirements</li>
                  <li>• Whole Foods quality standards</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Document Control</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Version control for all documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Automatic backup and archiving</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Secure sharing with auditors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Expiration notifications</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Training Resources */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Training & Education Resources
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Food Safety Fundamentals',
                modules: 12,
                duration: '6 hours',
                description: 'Complete HACCP and GAP training program'
              },
              {
                title: 'Supplier Requirements Guide',
                modules: 8,
                duration: '4 hours',
                description: 'Specific requirements for major buyers'
              },
              {
                title: 'Audit Preparation Workshop',
                modules: 6,
                duration: '3 hours',
                description: 'Step-by-step audit readiness training'
              }
            ].map((course) => (
              <div key={course.title} className="bg-gray-800 rounded-xl p-6">
                <BookOpen className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{course.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{course.modules} modules</span>
                  <span className="text-gray-500">{course.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Story */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Proven Success with Major Buyers</h2>
          
          <div className="bg-gray-800 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Shield key={i} className="w-6 h-6 text-green-400 fill-current" />
              ))}
            </div>
            <p className="text-xl text-gray-300 mb-4">
              "VibeLux helped us achieve US Foods supplier approval in just 45 days. 
              The automated documentation and audit prep tools made the process seamless."
            </p>
            <p className="text-gray-400">
              - Fresh Greens Vertical Farm, Ohio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">98%</div>
              <p className="text-gray-400">First audit pass rate</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">60%</div>
              <p className="text-gray-400">Reduction in prep time</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
              <p className="text-gray-400">Traceability coverage</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Meet Buyer Requirements?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join growers who've successfully onboarded with major food service companies
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/compliance"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-lg transition-colors"
            >
              Start Compliance Setup
            </Link>
            <Link
              href="/demo"
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