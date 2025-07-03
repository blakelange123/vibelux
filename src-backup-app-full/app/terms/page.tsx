'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, AlertTriangle, Scale, FileText, ChevronRight } from 'lucide-react';

export default function TermsOfService() {
  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'services', title: 'Services & Revenue Sharing' },
    { id: 'ai-services', title: 'AI Services & Claude Integration' },
    { id: 'disclaimers', title: 'Disclaimers & Warnings' },
    { id: 'limitations', title: 'Limitation of Liability' },
    { id: 'indemnification', title: 'Indemnification' },
    { id: 'warranties', title: 'Warranty Disclaimers' },
    { id: 'arbitration', title: 'Arbitration & Disputes' },
    { id: 'affiliate', title: 'Affiliate Program' },
    { id: 'general', title: 'General Provisions' }
  ];

  return (
    <div className="min-h-screen bg-gray-950 pt-24">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
          </div>
          <p className="text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
            <p className="text-yellow-400 text-sm flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              IMPORTANT: These terms limit our liability and require arbitration of disputes. 
              Please read carefully before using VibeLux services.
            </p>
          </div>
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
          <section id="acceptance">
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                By accessing or using VibeLux services ("Services"), you agree to be bound by these 
                Terms of Service ("Terms"). If you disagree with any part of these terms, you may 
                not access our Services.
              </p>
              <p>
                <strong>YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE 
                BOUND BY THEM.</strong>
              </p>
            </div>
          </section>

          <section id="services">
            <h2 className="text-2xl font-bold text-white mb-4">2. Services & Revenue Sharing Model</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                VibeLux provides cultivation facility optimization software under a revenue sharing 
                model. You pay only a percentage of documented savings or improvements.
              </p>
              <div className="ml-6 space-y-2">
                <p>• <strong>No Guarantees:</strong> While we strive for optimal results, we DO NOT 
                guarantee any specific savings, yield improvements, or business outcomes.</p>
                <p>• <strong>Calculation Methods:</strong> Savings calculations are estimates based on 
                historical data and industry averages. Actual results WILL vary.</p>
                <p>• <strong>Your Responsibilities:</strong> You must provide accurate baseline data 
                and maintain equipment properly for the revenue sharing model to function.</p>
                <p>• <strong>Verification Rights:</strong> We reserve the right to audit savings 
                calculations through third-party verification.</p>
              </div>
            </div>
          </section>

          <section id="ai-services">
            <h2 className="text-2xl font-bold text-white mb-4">3. AI Services & Claude Integration</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                VibeLux integrates Claude AI (by Anthropic) and other machine learning technologies 
                to provide intelligent cultivation assistance, automated analysis, and predictive insights.
              </p>
              
              <h3 className="text-xl font-semibold text-white mt-6">3.1 AI Service Limitations</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>No Guarantees:</strong> AI recommendations are based on statistical models 
                and historical data. Results are NOT guaranteed and may be incorrect or inappropriate 
                for your specific situation.</li>
                <li><strong>Not Professional Advice:</strong> AI outputs do not constitute professional 
                agronomic, legal, financial, or medical advice. Always consult qualified professionals.</li>
                <li><strong>Human Oversight Required:</strong> All AI recommendations should be reviewed 
                by qualified personnel before implementation.</li>
                <li><strong>Data Accuracy:</strong> AI performance depends on data quality. Inaccurate 
                input data will produce unreliable results.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-white mt-6">3.2 Data Usage for AI Services</h3>
              <p>By using AI features, you acknowledge and agree that:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Your facility data may be processed by third-party AI providers (e.g., Anthropic)</li>
                <li>Anonymized data may be used to improve AI models and services</li>
                <li>AI providers may retain processed data according to their retention policies</li>
                <li>You have necessary rights to submit any data processed by AI services</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-white mt-6">3.3 AI-Specific Disclaimers</h3>
              <div className="p-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
                <p className="text-yellow-400 font-semibold mb-2">⚠️ AI HALLUCINATION WARNING</p>
                <p>
                  AI systems may generate plausible-sounding but incorrect or fictional information 
                  ("hallucinations"). Always verify AI outputs against trusted sources before making 
                  critical decisions.
                </p>
              </div>
              <ul className="list-disc ml-6 space-y-2 mt-4">
                <li><strong>Research Citations:</strong> While our AI cites research papers, always 
                verify citations and read source materials directly.</li>
                <li><strong>Predictive Models:</strong> Predictions are probabilistic estimates, not 
                certainties. Many factors can affect actual outcomes.</li>
                <li><strong>Anomaly Detection:</strong> False positives and false negatives may occur. 
                AI alerts supplement but do not replace human monitoring.</li>
                <li><strong>Compliance Assistance:</strong> AI compliance features are informational 
                only. You remain fully responsible for regulatory compliance.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-white mt-6">3.4 API Usage Costs</h3>
              <p>
                AI features may incur additional API usage costs from third-party providers. These 
                costs may be passed through to users based on usage. Heavy AI usage may result in 
                usage limits or additional charges.
              </p>
            </div>
          </section>

          <section id="disclaimers">
            <h2 className="text-2xl font-bold text-white mb-4">4. Critical Disclaimers & Warnings</h2>
            <div className="space-y-4 text-gray-300">
              <div className="p-4 bg-red-900/20 border border-red-600/50 rounded-lg">
                <p className="text-red-400 font-semibold mb-2">⚠️ CANNABIS INDUSTRY DISCLAIMER</p>
                <p>
                  Cannabis remains federally illegal in the United States. You are solely responsible 
                  for compliance with all applicable local, state, and federal laws. VibeLux does not 
                  provide legal advice.
                </p>
              </div>
              <p>
                <strong>NO CULTIVATION ADVICE:</strong> VibeLux provides software tools only. We are 
                NOT responsible for cultivation outcomes, crop failures, or regulatory violations.
              </p>
              <p>
                <strong>EQUIPMENT INTEGRATION RISKS:</strong> Integration with third-party equipment 
                may cause malfunctions. Always maintain manual override capabilities.
              </p>
              <p>
                <strong>ENVIRONMENTAL FACTORS:</strong> External factors including but not limited to 
                weather, pests, diseases, power outages, and human error can impact results.
              </p>
            </div>
          </section>

          <section id="limitations">
            <h2 className="text-2xl font-bold text-white mb-4">5. LIMITATION OF LIABILITY</h2>
            <div className="space-y-4 text-gray-300">
              <div className="p-4 bg-purple-900/20 border border-purple-600/50 rounded-lg">
                <p className="font-bold text-white mb-2">MAXIMUM LIABILITY CAP</p>
                <p>
                  IN NO EVENT SHALL VIBELUX'S TOTAL CUMULATIVE LIABILITY EXCEED THE GREATER OF:
                  (A) THE TOTAL AMOUNT PAID BY YOU TO VIBELUX IN THE TWELVE (12) MONTHS PRECEDING 
                  THE EVENT GIVING RISE TO LIABILITY, OR (B) ONE HUNDRED DOLLARS ($100.00).
                </p>
              </div>
              <p>
                <strong>EXCLUSION OF DAMAGES:</strong> IN NO EVENT SHALL VIBELUX BE LIABLE FOR:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Lost profits, revenue, or business opportunities</li>
                <li>Loss of crops or cultivation failures</li>
                <li>Regulatory fines or legal penalties</li>
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Equipment damage or malfunction</li>
                <li>Data loss or corruption</li>
                <li>Third-party claims</li>
              </ul>
              <p>
                THESE LIMITATIONS APPLY REGARDLESS OF THE THEORY OF LIABILITY, WHETHER BASED IN 
                CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR OTHERWISE, EVEN IF 
                VIBELUX HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
            </div>
          </section>

          <section id="indemnification">
            <h2 className="text-2xl font-bold text-white mb-4">6. Indemnification</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                You agree to indemnify, defend, and hold harmless VibeLux, its officers, directors, 
                employees, agents, and affiliates from and against any and all claims, damages, 
                obligations, losses, liabilities, costs, and expenses arising from:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Your use of the Services</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Your violation of any applicable laws or regulations</li>
                <li>Any claim that your cultivation operations caused damage or injury</li>
                <li>Your negligence or willful misconduct</li>
              </ul>
              <p>
                This indemnification obligation will survive termination of these Terms.
              </p>
            </div>
          </section>

          <section id="warranties">
            <h2 className="text-2xl font-bold text-white mb-4">7. Warranty Disclaimers</h2>
            <div className="space-y-4 text-gray-300">
              <p className="font-bold">
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.
              </p>
              <p>
                WE EXPRESSLY DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Implied warranties of merchantability</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement</li>
                <li>Course of performance</li>
                <li>Accuracy or completeness of data</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Compatibility with all equipment or systems</li>
              </ul>
              <p>
                No advice or information obtained from VibeLux shall create any warranty not 
                expressly stated in these Terms.
              </p>
            </div>
          </section>

          <section id="arbitration">
            <h2 className="text-2xl font-bold text-white mb-4">8. Mandatory Arbitration & Dispute Resolution</h2>
            <div className="space-y-4 text-gray-300">
              <div className="p-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
                <p className="font-bold text-yellow-400">
                  PLEASE READ CAREFULLY - THIS AFFECTS YOUR LEGAL RIGHTS
                </p>
              </div>
              <p>
                <strong>Binding Arbitration:</strong> Any dispute arising from these Terms or your 
                use of the Services shall be resolved through binding arbitration in accordance with 
                the Commercial Arbitration Rules of the American Arbitration Association.
              </p>
              <p>
                <strong>Class Action Waiver:</strong> YOU AGREE TO BRING CLAIMS AGAINST VIBELUX ONLY 
                IN YOUR INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED 
                CLASS OR REPRESENTATIVE PROCEEDING.
              </p>
              <p>
                <strong>Arbitration Details:</strong>
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Location: San Francisco, California</li>
                <li>Governing Law: Laws of California, without regard to conflict of law principles</li>
                <li>Language: English</li>
                <li>Arbitrator Selection: Single arbitrator mutually agreed upon</li>
                <li>Costs: Each party bears its own costs, unless arbitrator determines otherwise</li>
              </ul>
              <p>
                <strong>30-Day Right to Opt Out:</strong> You have the right to opt out of this 
                arbitration provision by sending written notice within 30 days of first accepting 
                these Terms to: legal@vibelux.com
              </p>
            </div>
          </section>

          <section id="affiliate">
            <h2 className="text-2xl font-bold text-white mb-4">9. Affiliate Program & Revenue Sharing</h2>
            <div className="space-y-4 text-gray-300">
              <h3 className="text-xl font-semibold text-white">9.1 Affiliate Commission Structure</h3>
              <p>
                VibeLux offers an affiliate program with the following declining commission structure 
                for successful referrals:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Months 1-6: 35% commission on referred customer's revenue share payments</li>
                <li>Months 7-18: 25% commission</li>
                <li>Months 19-36: 15% commission</li>
                <li>Months 37+: 8% commission</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-white mt-6">9.2 Affiliate Terms & Conditions</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Commissions are calculated on actual revenue share payments received from referred customers</li>
                <li>Payouts processed monthly via Stripe Connect or ACH transfer</li>
                <li>Minimum payout threshold: $50 USD</li>
                <li>Commissions under threshold roll over to next month</li>
                <li>Affiliate must maintain active account in good standing</li>
                <li>Self-referrals are prohibited and will result in termination</li>
                <li>Fraudulent referrals result in immediate termination and forfeiture of commissions</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-white mt-6">9.3 Marketing Compliance</h3>
              <p>Affiliates must:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Comply with all applicable laws and regulations, especially cannabis advertising laws</li>
                <li>Not make false or misleading claims about VibeLux services</li>
                <li>Not use spam or unsolicited communications</li>
                <li>Not bid on VibeLux trademark terms in paid advertising</li>
                <li>Clearly disclose affiliate relationship when promoting</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-white mt-6">9.4 Commission Adjustments</h3>
              <p>
                Commissions are subject to adjustment for:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Refunds or chargebacks from referred customers</li>
                <li>Customers who fail to pay or default on agreements</li>
                <li>Violations of these Terms or affiliate guidelines</li>
                <li>Changes to the affiliate program (with 30 days notice)</li>
              </ul>
            </div>
          </section>

          <section id="general">
            <h2 className="text-2xl font-bold text-white mb-4">10. General Provisions</h2>
            <div className="space-y-4 text-gray-300">
              <h3 className="text-xl font-semibold text-white">10.1 Force Majeure</h3>
              <p>
                Neither party shall be liable for any failure or delay in performance due to causes 
                beyond its reasonable control, including but not limited to acts of God, natural 
                disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, 
                fire, floods, pandemic, accidents, strikes, or shortages of transportation, 
                facilities, fuel, energy, labor, or materials.
              </p>

              <h3 className="text-xl font-semibold text-white">9.2 Termination</h3>
              <p>
                Either party may terminate these Terms at any time with 30 days written notice. 
                Upon termination, you must cease all use of the Services and pay any outstanding 
                amounts owed under the revenue sharing agreement.
              </p>

              <h3 className="text-xl font-semibold text-white">9.3 Survival</h3>
              <p>
                Sections relating to liability limitations, indemnification, arbitration, and 
                general provisions shall survive termination of these Terms.
              </p>

              <h3 className="text-xl font-semibold text-white">9.4 Entire Agreement</h3>
              <p>
                These Terms constitute the entire agreement between you and VibeLux regarding the 
                Services and supersede all prior agreements and understandings.
              </p>

              <h3 className="text-xl font-semibold text-white">9.5 Severability</h3>
              <p>
                If any provision of these Terms is found to be unenforceable, the remaining 
                provisions will continue in full force and effect.
              </p>

              <h3 className="text-xl font-semibold text-white">9.6 Assignment</h3>
              <p>
                You may not assign or transfer these Terms without our prior written consent. 
                VibeLux may assign these Terms without restriction.
              </p>

              <h3 className="text-xl font-semibold text-white">9.7 Modifications</h3>
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of 
                material changes via email or through the Services. Continued use after 
                modifications constitutes acceptance.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mt-16 p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
            <div className="space-y-2 text-gray-300">
              <p><strong>VibeLux Inc.</strong></p>
              <p>Legal Department</p>
              <p>Email: legal@vibelux.com</p>
              <p>Address: 1 Market Street, Suite 300<br />
              San Francisco, CA 94105<br />
              United States</p>
            </div>
          </section>

          {/* Final Agreement */}
          <section className="mt-8 p-6 bg-purple-900/20 border border-purple-600/50 rounded-lg">
            <p className="text-white font-semibold text-center">
              BY USING VIBELUX SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, 
              AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}