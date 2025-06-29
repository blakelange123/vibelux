import Link from 'next/link';
import { ArrowLeft, FileText, Shield, Users, DollarSign, Package, AlertCircle, Scale } from 'lucide-react';

export default function MarketplaceTermsPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link 
            href="/marketplace"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <FileText className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">
            Marketplace Terms and Conditions
          </h1>
          <p className="text-xl text-gray-400">
            Effective Date: January 1, 2025
          </p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-gray-900 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Scale className="w-6 h-6 text-green-400" />
              1. Agreement to Terms
            </h2>
            <p className="text-gray-300 mb-4">
              By accessing or using the Vibelux CEA Marketplace ("Marketplace"), you agree to be bound by these 
              Terms and Conditions ("Terms"). If you disagree with any part of these terms, you may not access 
              the Marketplace.
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-green-400" />
              2. User Accounts
            </h2>
            <ul className="space-y-3 text-gray-300">
              <li>• You must provide accurate, complete, and current information</li>
              <li>• You are responsible for maintaining the confidentiality of your account</li>
              <li>• You must be at least 18 years old to use the Marketplace</li>
              <li>• One account per business entity is allowed</li>
              <li>• You are responsible for all activities under your account</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Package className="w-6 h-6 text-green-400" />
              3. Listing Guidelines
            </h2>
            <h3 className="text-lg font-semibold text-white mb-3">Prohibited Items:</h3>
            <ul className="space-y-2 text-gray-300 mb-6">
              <li>• Products not grown/produced by the seller</li>
              <li>• Misrepresented or counterfeit products</li>
              <li>• Products that violate any laws or regulations</li>
              <li>• Products with false certifications</li>
            </ul>
            
            <h3 className="text-lg font-semibold text-white mb-3">Listing Requirements:</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• All product information must be accurate and up-to-date</li>
              <li>• Photos must accurately represent the product</li>
              <li>• Prices must include all applicable fees except delivery</li>
              <li>• Certifications must be valid and verifiable</li>
              <li>• Stock levels must be accurately maintained</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-green-400" />
              4. Fees and Payments
            </h2>
            <ul className="space-y-3 text-gray-300">
              <li>• Marketplace access: $29/month after free trial period</li>
              <li>• Transaction fee: 5% of each completed sale</li>
              <li>• Payment processing fees may apply</li>
              <li>• Fees are subject to change with 30 days notice</li>
              <li>• All fees are non-refundable unless otherwise stated</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-400" />
              5. Seller Responsibilities
            </h2>
            <ul className="space-y-3 text-gray-300">
              <li>• Fulfill orders in a timely manner</li>
              <li>• Maintain product quality as described</li>
              <li>• Respond to buyer inquiries within 24 hours</li>
              <li>• Handle returns and refunds per your stated policy</li>
              <li>• Comply with all applicable food safety regulations</li>
              <li>• Maintain necessary licenses and permits</li>
              <li>• Provide accurate tracking information when applicable</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-green-400" />
              6. Dispute Resolution
            </h2>
            <p className="text-gray-300 mb-4">
              In the event of a dispute between buyers and sellers:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li>• First attempt to resolve directly with the other party</li>
              <li>• Contact Vibelux support if direct resolution fails</li>
              <li>• Vibelux may mediate but is not responsible for outcomes</li>
              <li>• All disputes are subject to binding arbitration</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              7. Liability and Disclaimers
            </h2>
            <p className="text-gray-300 mb-4">
              Vibelux provides the Marketplace platform but:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li>• Does not guarantee product quality or seller performance</li>
              <li>• Is not responsible for transactions between users</li>
              <li>• Does not provide warranties for products sold</li>
              <li>• Limits liability to the fees paid for Marketplace access</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              8. Termination
            </h2>
            <p className="text-gray-300 mb-4">
              Vibelux reserves the right to:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li>• Suspend or terminate accounts for Terms violations</li>
              <li>• Remove listings that violate guidelines</li>
              <li>• Modify or discontinue the Marketplace with notice</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              9. Privacy and Data
            </h2>
            <p className="text-gray-300">
              Your use of the Marketplace is also governed by our{' '}
              <Link href="/privacy" className="text-green-400 underline hover:text-green-300">
                Privacy Policy
              </Link>
              . We collect and use data as described in that policy.
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              10. Contact Information
            </h2>
            <p className="text-gray-300 mb-4">
              For questions about these Terms, contact us at:
            </p>
            <div className="text-gray-300">
              <p>Email: marketplace@vibelux.com</p>
              <p>Phone: 1-800-VIBELUX</p>
              <p>Address: 123 Innovation Way, San Francisco, CA 94105</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <p className="text-sm text-yellow-200">
              <strong>Note:</strong> These Terms were last updated on January 1, 2025. We may update these 
              Terms from time to time. Continued use of the Marketplace after changes constitutes acceptance 
              of the new Terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}