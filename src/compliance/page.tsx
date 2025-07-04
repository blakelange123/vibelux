'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, CheckCircle, AlertTriangle, FileText, Lock, Camera, Database, Users } from 'lucide-react';

export default function CompliancePage() {
  const stateRegulations = [
    { state: 'California', system: 'METRC', licenseTypes: 'Type 1-5, 10-12', testing: 'Required' },
    { state: 'Colorado', system: 'METRC', licenseTypes: 'Tier 1-3', testing: 'Required' },
    { state: 'Michigan', system: 'METRC', licenseTypes: 'Class A-C', testing: 'Required' },
    { state: 'Massachusetts', system: 'METRC', licenseTypes: 'Tier 1-11', testing: 'Required' },
    { state: 'Nevada', system: 'METRC', licenseTypes: 'Cultivation, Production', testing: 'Required' },
    { state: 'Oregon', system: 'METRC', licenseTypes: 'Tier I-II', testing: 'Required' }
  ];

  return (
    <div className="min-h-screen bg-gray-950 pt-24">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Compliance & Regulatory</h1>
          </div>
          <p className="text-gray-300 text-lg">
            VibeLux helps you maintain compliance with state cannabis regulations through integrated 
            tracking, reporting, and security features.
          </p>
        </div>

        {/* Key Compliance Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <Database className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Track & Trace Integration</h3>
            <p className="text-gray-400">
              Seamless integration with METRC, BioTrack, and other state tracking systems for 
              automated compliance reporting.
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <Camera className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Security & Surveillance</h3>
            <p className="text-gray-400">
              Camera integration, access control, and alarm systems to meet state security 
              requirements.
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <FileText className="w-10 h-10 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Automated Reporting</h3>
            <p className="text-gray-400">
              Generate compliance reports for inspections, audits, and regulatory submissions 
              automatically.
            </p>
          </div>
        </div>

        {/* State-by-State Compliance */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">State Regulatory Requirements</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-900 rounded-lg overflow-hidden">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-white">State</th>
                  <th className="px-6 py-4 text-left text-white">Tracking System</th>
                  <th className="px-6 py-4 text-left text-white">License Types</th>
                  <th className="px-6 py-4 text-left text-white">Testing Required</th>
                </tr>
              </thead>
              <tbody>
                {stateRegulations.map((state, index) => (
                  <tr key={state.state} className={index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/50'}>
                    <td className="px-6 py-4 text-gray-300">{state.state}</td>
                    <td className="px-6 py-4 text-gray-300">{state.system}</td>
                    <td className="px-6 py-4 text-gray-300">{state.licenseTypes}</td>
                    <td className="px-6 py-4">
                      <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {state.testing}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            * Regulations vary by state and are subject to change. Always consult current state laws.
          </p>
        </section>

        {/* Security Requirements */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Security & Surveillance Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Camera Requirements</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  24/7 recording with 30-90 day retention
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  Coverage of all entrances, exits, and cultivation areas
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  Minimum 720p resolution, clear plant identification
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  Battery backup for continuous operation
                </li>
              </ul>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Access Control</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  Limited access areas with badge/biometric entry
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  Visitor logs and escort requirements
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  Employee background checks and badging
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  Alarm systems with law enforcement notification
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Record Keeping */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Record Keeping Requirements</h2>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Required Records</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Cultivation records (planting, harvesting, destruction)</li>
                  <li>• Inventory tracking and adjustments</li>
                  <li>• Testing results and certificates of analysis</li>
                  <li>• Employee records and training documentation</li>
                  <li>• Waste disposal logs and manifests</li>
                  <li>• Security footage and incident reports</li>
                  <li>• Financial records and tax documentation</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Retention Periods</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Cultivation records: 3-7 years</li>
                  <li>• Video surveillance: 30-90 days</li>
                  <li>• Testing results: 5 years</li>
                  <li>• Financial records: 7 years</li>
                  <li>• Employee records: 3 years post-employment</li>
                  <li>• Waste manifests: 3 years</li>
                  <li>• License documentation: Permanent</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* VibeLux Compliance Tools */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">VibeLux Compliance Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/50">
              <h3 className="text-lg font-semibold text-white mb-3">Automated METRC Sync</h3>
              <p className="text-gray-300">
                Real-time synchronization with METRC for plant tracking, inventory management, and 
                transfer manifests.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/50">
              <h3 className="text-lg font-semibold text-white mb-3">Audit Trail</h3>
              <p className="text-gray-300">
                Complete audit logging of all system activities, user actions, and data modifications 
                for compliance reviews.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/50">
              <h3 className="text-lg font-semibold text-white mb-3">Compliance Alerts</h3>
              <p className="text-gray-300">
                Automated notifications for expiring licenses, required testing, and regulatory 
                deadlines.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/50">
              <h3 className="text-lg font-semibold text-white mb-3">Role-Based Access</h3>
              <p className="text-gray-300">
                Granular permissions system ensuring employees only access authorized areas and 
                functions.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/50">
              <h3 className="text-lg font-semibold text-white mb-3">Inspection Ready</h3>
              <p className="text-gray-300">
                One-click report generation for state inspections with all required documentation 
                and records.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/50">
              <h3 className="text-lg font-semibold text-white mb-3">Data Retention</h3>
              <p className="text-gray-300">
                Automatic data archival and retention policies meeting state-specific requirements.
              </p>
            </div>
          </div>
        </section>

        {/* Warning Banner */}
        <div className="p-6 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Legal Disclaimer</h3>
              <p className="text-gray-300">
                This information is provided for general guidance only and does not constitute legal advice. 
                Cannabis regulations vary significantly by jurisdiction and change frequently. Always consult 
                with qualified legal counsel and verify current regulations with state and local authorities 
                before making compliance decisions. VibeLux software assists with compliance tracking but 
                does not guarantee regulatory compliance.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section className="mt-12 bg-gray-900 rounded-lg p-8 border border-gray-800 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Stay Compliant with VibeLux</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Our platform is designed to simplify compliance management while you focus on growing 
            your business. Get automated tracking, reporting, and alerts tailored to your state's 
            requirements.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/demo" 
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Schedule Demo
            </Link>
            <Link 
              href="/docs/compliance" 
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              View Documentation
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}