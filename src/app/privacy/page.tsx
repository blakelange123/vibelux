'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Eye, Database, Globe, AlertTriangle, ChevronRight } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'collection', title: 'Information We Collect' },
    { id: 'usage', title: 'How We Use Information' },
    { id: 'ai-processing', title: 'AI & Machine Learning' },
    { id: 'sharing', title: 'Information Sharing' },
    { id: 'cannabis', title: 'Cannabis Industry Specific' },
    { id: 'security', title: 'Data Security' },
    { id: 'rights', title: 'Your Rights' },
    { id: 'contact', title: 'Contact Us' }
  ];

  return (
    <div className="min-h-screen bg-gray-950 pt-24">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <p className="text-gray-300 mt-4">
            VibeLux Inc. ("we," "our," or "us") is committed to protecting your privacy. This 
            Privacy Policy explains how we collect, use, and safeguard your information when you 
            use our cultivation facility optimization platform.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="mb-8 p-6 bg-gray-900 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-2 gap-2">
            {sections.map(section => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <ChevronRight className="w-4 h-4" />
                {section.title}
              </a>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-12">
          <section id="overview">
            <h2 className="text-2xl font-bold text-white mb-4">1. Overview</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                This Privacy Policy applies to information collected through VibeLux's software 
                platform, website, and related services (collectively, the "Services").
              </p>
              <p>
                By using our Services, you consent to the data practices described in this policy. 
                If you do not agree with our privacy practices, please do not use our Services.
              </p>
            </div>
          </section>

          <section id="collection">
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            <div className="space-y-4 text-gray-300">
              <h3 className="text-xl font-semibold text-white">2.1 Information You Provide</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Account Information:</strong> Name, email, company name, phone number</li>
                <li><strong>Facility Data:</strong> Location, size, room configurations, equipment details</li>
                <li><strong>Cultivation Data:</strong> Crop types, growth stages, environmental parameters</li>
                <li><strong>Business Information:</strong> License numbers, compliance documentation</li>
                <li><strong>Payment Information:</strong> Processed securely through third-party providers</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6">2.2 Automatically Collected Information</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Sensor Data:</strong> Temperature, humidity, CO2, light levels, equipment status</li>
                <li><strong>Usage Data:</strong> Feature usage, system performance, error logs</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Energy Data:</strong> Power consumption, equipment runtime, efficiency metrics</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6">2.3 Third-Party Integrations</h3>
              <p>
                When you connect third-party equipment or services (climate computers, IoT devices, 
                METRC), we may receive additional data as authorized by you.
              </p>
            </div>
          </section>

          <section id="usage">
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <div className="space-y-4 text-gray-300">
              <h3 className="text-xl font-semibold text-white">3.1 Service Provision</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Optimize facility operations and energy efficiency</li>
                <li>Calculate and verify revenue sharing amounts</li>
                <li>Provide predictive analytics and recommendations</li>
                <li>Maintain and improve system performance</li>
                <li>Send alerts and notifications about facility conditions</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6">3.2 Analytics & Improvement</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Analyze usage patterns to improve features</li>
                <li>Develop machine learning models for optimization</li>
                <li>Create aggregated industry benchmarks (anonymized)</li>
                <li>Research and development of new features</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6">3.3 Communication</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Service updates and announcements</li>
                <li>Technical support and customer service</li>
                <li>Marketing communications (with consent)</li>
                <li>Legal notices and policy updates</li>
              </ul>
            </div>
          </section>

          <section id="ai-processing">
            <h2 className="text-2xl font-bold text-white mb-4">4. AI & Machine Learning Data Processing</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                VibeLux uses advanced AI technologies, including Claude by Anthropic, to provide 
                intelligent cultivation assistance and predictive analytics.
              </p>
              
              <h3 className="text-xl font-semibold text-white">4.1 How AI Processes Your Data</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Natural Language Processing:</strong> Your questions and commands are processed 
                by Claude AI to understand intent and provide relevant responses</li>
                <li><strong>Pattern Recognition:</strong> Environmental and cultivation data is analyzed 
                to identify trends, anomalies, and optimization opportunities</li>
                <li><strong>Predictive Modeling:</strong> Historical data is used to predict future 
                outcomes like yields, energy usage, and potential issues</li>
                <li><strong>Research Verification:</strong> AI cross-references recommendations with 
                scientific literature from multiple research databases</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-white mt-6">4.2 AI Training & Improvement</h3>
              <p>
                To improve our AI services:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Anonymized facility data may be used to train and improve AI models</li>
                <li>Aggregated patterns help enhance prediction accuracy for all users</li>
                <li>Your specific facility data is never shared with other customers</li>
                <li>You can opt-out of contributing to model improvements in account settings</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-white mt-6">4.3 Third-Party AI Services</h3>
              <p>
                We use the following third-party AI providers:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Anthropic (Claude):</strong> For natural language understanding and generation. 
                <a href="https://www.anthropic.com/privacy" className="text-purple-400 hover:text-purple-300"> View Anthropic's Privacy Policy</a></li>
                <li><strong>Research APIs:</strong> For accessing scientific literature (ResearchGate, arXiv, 
                bioRxiv, PubMed Central)</li>
              </ul>
              <p className="mt-3">
                These providers process data according to their own privacy policies and data retention 
                practices. Data sent to AI providers is encrypted in transit.
              </p>
              
              <h3 className="text-xl font-semibold text-white mt-6">4.4 AI Data Retention</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>AI conversation history is retained for 90 days to improve service quality</li>
                <li>Anonymized training data may be retained indefinitely</li>
                <li>You can request deletion of your AI interaction history at any time</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-white mt-6">4.5 AI Privacy Controls</h3>
              <p>
                You have control over AI data processing:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Disable AI features entirely in account settings</li>
                <li>Choose which data types can be processed by AI</li>
                <li>Review and delete AI conversation history</li>
                <li>Opt-out of contributing to AI model improvements</li>
              </ul>
            </div>
          </section>

          <section id="sharing">
            <h2 className="text-2xl font-bold text-white mb-4">5. Information Sharing & Disclosure</h2>
            <div className="space-y-4 text-gray-300">
              <p className="font-semibold">
                We do not sell, rent, or trade your personal information to third parties.
              </p>
              
              <h3 className="text-xl font-semibold text-white">5.1 We May Share Information With:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Service Providers:</strong> Third parties who help us operate our Services 
                (hosting, analytics, payment processing)</li>
                <li><strong>Equipment Partners:</strong> When you authorize integrations with climate 
                control or IoT systems</li>
                <li><strong>Legal Compliance:</strong> When required by law, subpoena, or court order</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or 
                asset sales</li>
                <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6">5.2 Aggregated Data</h3>
              <p>
                We may share aggregated, anonymized data that cannot identify you or your facility 
                for industry research, benchmarking, or marketing purposes.
              </p>
            </div>
          </section>

          <section id="cannabis">
            <h2 className="text-2xl font-bold text-white mb-4">6. Cannabis Industry Specific Provisions</h2>
            <div className="space-y-4 text-gray-300">
              <div className="p-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
                <p className="text-yellow-400 font-semibold mb-2">
                  <AlertTriangle className="w-5 h-5 inline mr-2" />
                  Important Cannabis Data Considerations
                </p>
                <p>
                  Due to federal cannabis laws, special provisions apply to data handling in this industry.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-white">6.1 Compliance & Regulatory</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Track-and-Trace:</strong> Data shared with state systems (METRC, BioTrack) 
                as required by law</li>
                <li><strong>Retention Periods:</strong> We retain cultivation data as required by state 
                regulations (typically 3-7 years)</li>
                <li><strong>Audit Trails:</strong> All data modifications are logged for compliance purposes</li>
                <li><strong>Access Logs:</strong> We maintain records of who accesses cultivation data</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6">6.2 Law Enforcement</h3>
              <p>
                We may disclose information to law enforcement when:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Required by valid legal process</li>
                <li>Necessary to protect safety or prevent crime</li>
                <li>Related to violations of our Terms of Service</li>
              </ul>
              <p className="mt-3">
                We will attempt to notify you of law enforcement requests unless prohibited by law or 
                court order.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6">6.3 Data Location</h3>
              <p>
                All cultivation data is stored on servers located within the United States. We do not 
                transfer cannabis-related data internationally.
              </p>
            </div>
          </section>

          <section id="security">
            <h2 className="text-2xl font-bold text-white mb-4">7. Data Security</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Encryption:</strong> Data encrypted in transit (TLS) and at rest (AES-256)</li>
                <li><strong>Access Controls:</strong> Role-based permissions and multi-factor authentication</li>
                <li><strong>Infrastructure:</strong> Secure cloud hosting with SOC 2 certified providers</li>
                <li><strong>Monitoring:</strong> 24/7 security monitoring and intrusion detection</li>
                <li><strong>Auditing:</strong> Regular security audits and penetration testing</li>
                <li><strong>Incident Response:</strong> Established procedures for security incidents</li>
              </ul>
              <p className="mt-4">
                While we strive to protect your information, no method of transmission or storage is 
                100% secure. You are responsible for maintaining the security of your account credentials.
              </p>
            </div>
          </section>

          <section id="rights">
            <h2 className="text-2xl font-bold text-white mb-4">8. Your Rights & Choices</h2>
            <div className="space-y-4 text-gray-300">
              <h3 className="text-xl font-semibold text-white">8.1 Access & Correction</h3>
              <p>
                You can access and update your account information through the VibeLux dashboard or by 
                contacting support.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6">8.2 Data Export</h3>
              <p>
                You can export your cultivation data at any time through our API or data export tools.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6">8.3 Deletion</h3>
              <p>
                You may request deletion of your account and associated data, subject to:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Legal retention requirements (compliance records)</li>
                <li>Outstanding contractual obligations</li>
                <li>Legitimate business purposes (fraud prevention)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6">8.4 Marketing Communications</h3>
              <p>
                You can opt-out of marketing emails using the unsubscribe link or through account settings. 
                Service-related communications cannot be opted out of while using our Services.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6">8.5 California Privacy Rights</h3>
              <p>
                California residents have additional rights under CCPA, including:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Right to know what information we collect</li>
                <li>Right to delete personal information</li>
                <li>Right to opt-out of data sales (we do not sell data)</li>
                <li>Right to non-discrimination</li>
              </ul>
            </div>
          </section>

          <section id="other">
            <h2 className="text-2xl font-bold text-white mb-4">9. Other Important Information</h2>
            <div className="space-y-4 text-gray-300">
              <h3 className="text-xl font-semibold text-white">9.1 Children's Privacy</h3>
              <p>
                Our Services are not intended for individuals under 21 years of age. We do not 
                knowingly collect information from minors.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6">9.2 International Users</h3>
              <p>
                Our Services are intended for use in jurisdictions where cannabis cultivation is legal. 
                By using our Services from outside the United States, you consent to the transfer and 
                processing of your data in the United States.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6">9.3 Changes to Privacy Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material 
                changes via email or through the Services. Continued use after changes constitutes 
                acceptance of the updated policy.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6">9.4 Third-Party Links</h3>
              <p>
                Our Services may contain links to third-party websites. We are not responsible for 
                the privacy practices of these external sites.
              </p>
            </div>
          </section>

          <section id="contact">
            <h2 className="text-2xl font-bold text-white mb-4">10. Contact Information</h2>
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <p className="text-gray-300 mb-4">
                For privacy-related questions or to exercise your rights, please contact:
              </p>
              <div className="space-y-2 text-gray-300">
                <p><strong>VibeLux Inc.</strong></p>
                <p>Privacy Officer</p>
                <p>Email: privacy@vibelux.com</p>
                <p>Phone: 1-800-VIBELUX (1-800-842-3589)</p>
                <p>Address: 1 Market Street, Suite 300<br />
                San Francisco, CA 94105<br />
                United States</p>
              </div>
              <p className="text-gray-300 mt-4">
                For general support: support@vibelux.com
              </p>
            </div>
          </section>

          {/* CCPA Notice */}
          <section className="mt-8 p-6 bg-purple-900/20 border border-purple-600/50 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">California Consumer Privacy Act (CCPA) Notice</h3>
            <div className="space-y-2 text-gray-300">
              <p>
                <strong>Categories of Information Collected:</strong> Identifiers, commercial information, 
                biometric information (if using facial recognition for security), Internet activity, 
                geolocation data, professional information
              </p>
              <p>
                <strong>Business Purpose:</strong> Providing and improving our Services, security and 
                fraud prevention, legal compliance
              </p>
              <p>
                <strong>Sale of Personal Information:</strong> We do not sell personal information
              </p>
              <p>
                To exercise your rights under CCPA, email us at privacy@vibelux.com or call 1-800-VIBELUX (1-800-842-3589)
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}