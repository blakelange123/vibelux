'use client';

import React from 'react';
import Link from 'next/link';

export default function AffiliateTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Vibelux Affiliate Program Terms and Conditions
          </h1>
          
          <div className="text-sm text-gray-500 mb-6">
            Effective Date: {new Date().toLocaleDateString()}
          </div>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement</h2>
              <p className="text-gray-700 mb-4">
                These Affiliate Program Terms and Conditions ("Agreement") constitute a legal agreement between you 
                ("Affiliate," "you," or "your") and Vibelux, Inc. ("Company," "we," "us," or "our"). By participating 
                in the Vibelux Affiliate Program ("Program"), you agree to be bound by this Agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Enrollment and Account</h2>
              <p className="text-gray-700 mb-4">
                2.1. <strong>Eligibility:</strong> You must be at least 18 years old and have the legal capacity to enter 
                into this Agreement. You must provide accurate and complete information during enrollment.
              </p>
              <p className="text-gray-700 mb-4">
                2.2. <strong>Approval:</strong> We reserve the right to accept or reject any application at our sole discretion. 
                Approval may be revoked if you violate this Agreement.
              </p>
              <p className="text-gray-700 mb-4">
                2.3. <strong>Account Maintenance:</strong> You are responsible for maintaining the confidentiality of your 
                account credentials and for all activities under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Commission Structure</h2>
              <p className="text-gray-700 mb-4">
                3.1. <strong>Smart Declining Commission Rates:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li className="text-gray-700 mb-2">Months 1-6: 35% commission on subscription payments</li>
                <li className="text-gray-700 mb-2">Months 7-18: 25% commission on subscription payments</li>
                <li className="text-gray-700 mb-2">Months 19-36: 15% commission on subscription payments</li>
                <li className="text-gray-700 mb-2">Months 37+: 8% commission on subscription payments</li>
              </ul>
              <p className="text-gray-700 mb-4">
                3.2. <strong>Revenue Sharing Customers:</strong> For customers on revenue-sharing plans, commissions are 
                calculated at 20% of Vibelux's share of revenue.
              </p>
              <p className="text-gray-700 mb-4">
                3.3. <strong>Tier Bonuses:</strong> Additional bonuses may apply based on your affiliate tier (Bronze, Silver, Gold).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Qualified Referrals</h2>
              <p className="text-gray-700 mb-4">
                4.1. <strong>Attribution:</strong> A referral is attributed to you when a user clicks your unique affiliate 
                link and completes a purchase within 30 days.
              </p>
              <p className="text-gray-700 mb-4">
                4.2. <strong>Valid Referrals:</strong> Only new customers who have not previously had a Vibelux account 
                qualify for commissions.
              </p>
              <p className="text-gray-700 mb-4">
                4.3. <strong>Self-Referrals:</strong> You cannot earn commissions on your own purchases or accounts 
                associated with your business.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payment Terms</h2>
              <p className="text-gray-700 mb-4">
                5.1. <strong>Payment Schedule:</strong> Commissions are paid monthly via Stripe Connect, subject to a 
                minimum payout threshold of $100.
              </p>
              <p className="text-gray-700 mb-4">
                5.2. <strong>Payment Requirements:</strong> You must complete Stripe Connect onboarding and provide 
                valid tax information to receive payments.
              </p>
              <p className="text-gray-700 mb-4">
                5.3. <strong>Refunds and Chargebacks:</strong> Commissions are reversed for refunded orders or chargebacks.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Marketing Guidelines</h2>
              <p className="text-gray-700 mb-4">
                6.1. <strong>Approved Methods:</strong> You may promote Vibelux through websites, social media, email 
                marketing (to opted-in subscribers), and content marketing.
              </p>
              <p className="text-gray-700 mb-4">
                6.2. <strong>Prohibited Methods:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li className="text-gray-700 mb-2">Spam or unsolicited communications</li>
                <li className="text-gray-700 mb-2">Misleading or false advertising</li>
                <li className="text-gray-700 mb-2">Trademark bidding or URL squatting</li>
                <li className="text-gray-700 mb-2">Cookie stuffing or forced clicks</li>
                <li className="text-gray-700 mb-2">Incentivized traffic without disclosure</li>
              </ul>
              <p className="text-gray-700 mb-4">
                6.3. <strong>FTC Compliance:</strong> You must clearly disclose your affiliate relationship in accordance 
                with FTC guidelines.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                7.1. <strong>Limited License:</strong> We grant you a limited, non-exclusive license to use our approved 
                marketing materials and trademarks solely for Program promotion.
              </p>
              <p className="text-gray-700 mb-4">
                7.2. <strong>Restrictions:</strong> You may not modify our trademarks or create derivative works without 
                written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Tax Obligations</h2>
              <p className="text-gray-700 mb-4">
                8.1. <strong>Tax Responsibility:</strong> You are solely responsible for all taxes related to your 
                commission earnings.
              </p>
              <p className="text-gray-700 mb-4">
                8.2. <strong>Tax Forms:</strong> U.S. affiliates earning $600+ annually will receive a 1099 form. 
                International affiliates must provide appropriate tax documentation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Confidentiality</h2>
              <p className="text-gray-700 mb-4">
                You agree to keep confidential any non-public information about our business, including commission rates, 
                conversion data, and strategic information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-700 mb-4">
                10.1. <strong>Termination Rights:</strong> Either party may terminate this Agreement at any time with 
                30 days written notice.
              </p>
              <p className="text-gray-700 mb-4">
                10.2. <strong>Immediate Termination:</strong> We may terminate immediately for Agreement violations, 
                fraudulent activity, or actions harmful to our reputation.
              </p>
              <p className="text-gray-700 mb-4">
                10.3. <strong>Post-Termination:</strong> Earned commissions will be paid according to regular schedule. 
                No new referrals will be attributed after termination.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, VIBELUX SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR PARTICIPATION IN THE PROGRAM.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Indemnification</h2>
              <p className="text-gray-700 mb-4">
                You agree to indemnify and hold harmless Vibelux from any claims, damages, or expenses arising from 
                your breach of this Agreement or your promotional activities.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Modifications</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify this Agreement at any time. Continued participation after modifications 
                constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                This Agreement is governed by the laws of Delaware, United States, without regard to conflict of law principles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about the Affiliate Program:
              </p>
              <p className="text-gray-700">
                Email: affiliates@vibelux.com<br />
                Address: Vibelux, Inc., 123 Innovation Way, San Francisco, CA 94105
              </p>
            </section>

            <div className="mt-12 p-6 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                By participating in the Vibelux Affiliate Program, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center">
            <Link href="/affiliate" className="text-purple-600 hover:text-purple-700">
              ← Back to Affiliate Program
            </Link>
            <Link href="/affiliate/dashboard" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}