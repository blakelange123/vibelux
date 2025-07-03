/**
 * Terms and Conditions Page
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | VibeLux',
  description: 'Terms and conditions for using VibeLux cultivation lighting platform',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using VibeLux ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Cultivation Disclaimer</h2>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ CRITICAL SAFETY WARNING</h3>
                <p className="text-red-700 leading-relaxed">
                  <strong>Cannabis cultivation lighting requires extreme caution.</strong> Improper spectrum settings can cause:
                </p>
                <ul className="list-disc list-inside text-red-700 mt-2 space-y-1">
                  <li><strong>Far-red excess ({'>'} 25%):</strong> Severe stem stretching, structural collapse, and crop failure</li>
                  <li><strong>High white light ({'>'} 70%):</strong> Leaf bleaching, tip burn, and cannabinoid degradation</li>
                  <li><strong>UV-B overexposure ({'>'} 5%):</strong> DNA damage, leaf necrosis, and plant death</li>
                  <li><strong>Excessive intensity ({'>'} 1200 PPFD):</strong> Photoinhibition, heat stress, and complete crop loss</li>
                </ul>
              </div>
              <p className="text-gray-700 leading-relaxed">
                VibeLux provides guidance tools only. Users are solely responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                <li>Daily monitoring of plant health and stress indicators</li>
                <li>Following all local laws and regulations regarding cultivation</li>
                <li>Implementing proper safety protocols and equipment</li>
                <li>Consulting with qualified horticulturists for commercial operations</li>
                <li>Understanding plant biology and appropriate cultivation techniques</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Legal Compliance</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">🏛️ LEGAL RESPONSIBILITY</h3>
                <p className="text-yellow-700 leading-relaxed">
                  <strong>Users must comply with all applicable laws.</strong> Cannabis cultivation may be:
                </p>
                <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
                  <li>Illegal in your jurisdiction</li>
                  <li>Require licenses, permits, or registration</li>
                  <li>Subject to plant count limitations</li>
                  <li>Restricted to specific locations or security requirements</li>
                  <li>Subject to taxation and reporting obligations</li>
                </ul>
              </div>
              <p className="text-gray-700 leading-relaxed">
                VibeLux does not provide legal advice and assumes no responsibility for legal compliance. 
                Users must research and follow all local, state, and federal regulations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Platform Use and Limitations</h2>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Permitted Use</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                VibeLux is designed for legitimate agricultural and horticultural lighting design. Users may:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Design lighting systems for legal cultivation operations</li>
                <li>Calculate PPFD and spectrum distributions</li>
                <li>Generate reports and documentation</li>
                <li>Access educational resources and best practices</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">Prohibited Use</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Users may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Use the platform for illegal cultivation activities</li>
                <li>Share login credentials or violate account security</li>
                <li>Attempt to reverse engineer or copy proprietary algorithms</li>
                <li>Use the platform to harm competitors or spread misinformation</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Liability and Disclaimers</h2>
              <div className="bg-gray-50 border border-gray-200 p-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">🛡️ LIABILITY LIMITATION</h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>VibeLux provides tools and information "as is" without warranties.</strong> We are not liable for:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                  <li>Crop losses, plant damage, or cultivation failures</li>
                  <li>Legal consequences from cultivation activities</li>
                  <li>Equipment malfunctions or safety incidents</li>
                  <li>Financial losses or business interruptions</li>
                  <li>Accuracy of calculations or recommendations</li>
                  <li>Third-party integrations or hardware compatibility</li>
                </ul>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Maximum liability is limited to the amount paid for platform services in the 12 months prior to any claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data and Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                VibeLux collects and processes data to provide services. By using the platform:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>You consent to data collection as described in our Privacy Policy</li>
                <li>Cultivation data remains confidential and is not shared without consent</li>
                <li>We may use aggregated, anonymized data for research and improvement</li>
                <li>You retain ownership of your designs and cultivation data</li>
                <li>Data may be stored in cloud infrastructure for reliability</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Subscription and Payment Terms</h2>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Billing</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Subscription fees are billed monthly or annually as selected</li>
                <li>Pricing is subject to change with 30 days notice</li>
                <li>All payments are processed securely through Stripe</li>
                <li>Taxes may apply based on your location</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">Cancellation</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>You may cancel your subscription at any time</li>
                <li>Access continues until the end of the current billing period</li>
                <li>No refunds for partial periods unless required by law</li>
                <li>Data export is available for 30 days after cancellation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Affiliate Program</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                VibeLux offers an affiliate program with declining commission structure:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Months 1-6: 35% commission on referral subscriptions</li>
                <li>Months 7-18: 25% commission</li>
                <li>Months 19-36: 15% commission</li>
                <li>Months 37+: 8% commission</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                Affiliate terms:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Payouts processed monthly via Stripe Connect</li>
                <li>$50 minimum payout threshold</li>
                <li>Fraudulent referrals result in immediate termination</li>
                <li>Marketing must comply with applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                VibeLux retains ownership of:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Platform software, algorithms, and methodologies</li>
                <li>Lighting calculation engines and optimization systems</li>
                <li>User interface designs and branding</li>
                <li>Educational content and documentation</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Users retain ownership of their cultivation designs and facility data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Modification of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                VibeLux reserves the right to modify these terms at any time. Users will be notified of material changes 
                via email or platform notification. Continued use after modification constitutes acceptance of new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                VibeLux may terminate accounts for:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Violation of these terms</li>
                <li>Illegal use of the platform</li>
                <li>Non-payment of subscription fees</li>
                <li>Abusive behavior toward staff or other users</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These terms are governed by the laws of California. Disputes will be resolved through binding arbitration 
                or in the courts of San Francisco County, California.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about these terms, contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="text-gray-700">
                  Email: legal@vibelux.com<br />
                  Address: 1 Market Street, Suite 300, San Francisco, CA 94105<br />
                  Phone: 1-800-VIBELUX (1-800-842-3589)
                </p>
              </div>
            </section>

            <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">🔬 Remember: VibeLux is a Tool, Not a Substitute for Expertise</h3>
              <p className="text-blue-700 leading-relaxed">
                Professional cultivation requires deep understanding of plant biology, environmental science, and local regulations. 
                VibeLux provides calculations and guidance, but successful cultivation depends on your knowledge, experience, and careful monitoring.
                Always consult with qualified professionals for commercial operations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}