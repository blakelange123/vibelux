'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Download, Check, AlertCircle, Upload } from 'lucide-react';

export default function AffiliateTaxCenterPage() {
  const [taxFormType, setTaxFormType] = useState<'w9' | 'w8ben' | ''>('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Affiliate Tax Center
          </h1>

          {/* Tax Status Overview */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Tax Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tax Form Status</span>
                  {formSubmitted ? (
                    <span className="flex items-center text-green-600">
                      <Check className="w-4 h-4 mr-1" />
                      Submitted
                    </span>
                  ) : (
                    <span className="flex items-center text-amber-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Required
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{currentYear} YTD Earnings</span>
                  <span className="font-semibold">$2,847.50</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">1099 Threshold</span>
                  <span className="font-semibold">$600</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Form Submission */}
          {!formSubmitted && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Submit Tax Information</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Tax information is required before you can receive payouts. 
                  US affiliates need to submit a W-9 form. International affiliates need a W-8BEN form.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Your Tax Form Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setTaxFormType('w9')}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        taxFormType === 'w9' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <h3 className="font-semibold mb-1">W-9 Form</h3>
                      <p className="text-sm text-gray-600">For US citizens and residents</p>
                    </button>
                    <button
                      onClick={() => setTaxFormType('w8ben')}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        taxFormType === 'w8ben' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <h3 className="font-semibold mb-1">W-8BEN Form</h3>
                      <p className="text-sm text-gray-600">For international affiliates</p>
                    </button>
                  </div>
                </div>

                {taxFormType && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-4">
                      {taxFormType === 'w9' ? 'W-9 Tax Form' : 'W-8BEN Tax Form'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Please download the form, complete it, and upload the signed copy.
                    </p>
                    
                    <div className="flex gap-4 mb-6">
                      <a 
                        href={`/forms/${taxFormType}.pdf`}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                      >
                        <Download className="w-4 h-4" />
                        Download {taxFormType.toUpperCase()} Form
                      </a>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Drop your completed form here or click to upload</p>
                      <input type="file" className="hidden" accept=".pdf,.jpg,.png" />
                      <button className="text-purple-600 hover:text-purple-700">Browse Files</button>
                    </div>

                    <button
                      onClick={() => setFormSubmitted(true)}
                      className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700"
                    >
                      Submit Tax Form
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Tax Documents */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tax Documents</h2>
            <div className="space-y-3">
              <div className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">1099-NEC {previousYear}</p>
                    <p className="text-sm text-gray-500">Issued January 31, {currentYear}</p>
                  </div>
                </div>
                <a href="#" className="text-purple-600 hover:text-purple-700 flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
              
              <div className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">1099-NEC {previousYear - 1}</p>
                    <p className="text-sm text-gray-500">Issued January 31, {previousYear}</p>
                  </div>
                </div>
                <a href="#" className="text-purple-600 hover:text-purple-700 flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          </section>

          {/* Tax FAQ */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tax FAQ</h2>
            <div className="space-y-4">
              <details className="border rounded-lg p-4">
                <summary className="font-medium cursor-pointer">When will I receive my 1099?</summary>
                <p className="mt-2 text-gray-600">
                  1099 forms are issued by January 31st for affiliates who earned $600 or more in the previous year.
                </p>
              </details>
              
              <details className="border rounded-lg p-4">
                <summary className="font-medium cursor-pointer">Do I need to pay quarterly taxes?</summary>
                <p className="mt-2 text-gray-600">
                  As an independent contractor, you may need to pay quarterly estimated taxes. Consult with a tax 
                  professional for guidance specific to your situation.
                </p>
              </details>
              
              <details className="border rounded-lg p-4">
                <summary className="font-medium cursor-pointer">What expenses can I deduct?</summary>
                <p className="mt-2 text-gray-600">
                  Common deductions include advertising costs, website hosting, internet bills (partial), home office 
                  expenses, and professional services. Keep detailed records and consult a tax professional.
                </p>
              </details>
              
              <details className="border rounded-lg p-4">
                <summary className="font-medium cursor-pointer">International tax withholding</summary>
                <p className="mt-2 text-gray-600">
                  International affiliates may be subject to 30% withholding unless a tax treaty applies. Submit a 
                  W-8BEN form to claim treaty benefits if applicable.
                </p>
              </details>
            </div>
          </section>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Disclaimer:</strong> This information is for general guidance only. Vibelux is not providing 
              tax advice. Please consult with a qualified tax professional for advice specific to your situation.
            </p>
          </div>

          <div className="mt-8">
            <Link href="/affiliate/dashboard" className="text-purple-600 hover:text-purple-700">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}