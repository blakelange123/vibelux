'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building,
  ChevronRight,
  CheckCircle,
  Upload,
  Shield,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Star,
  FileText,
  AlertCircle
} from 'lucide-react';
import { MarketplaceManager } from '@/lib/marketplace/marketplace-manager';

const marketplaceManager = new MarketplaceManager();

export default function VendorSignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Business Information
    businessName: '',
    businessType: 'equipment',
    taxId: '',
    yearEstablished: new Date().getFullYear(),
    website: '',
    description: '',
    
    // Step 2: Contact Information
    contactName: '',
    contactTitle: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    
    // Step 3: Business Details
    specialties: [] as string[],
    certifications: [] as string[],
    paymentTerms: 'Net 30',
    minimumOrder: 500,
    shippingZones: ['US'],
    
    // Step 4: Documents
    businessLicense: null as File | null,
    insuranceCert: null as File | null,
    w9Form: null as File | null,
    productCatalog: null as File | null,
    
    // Step 5: Agreement
    termsAccepted: false,
    feeStructureAccepted: false,
    policiesAccepted: false
  });

  const steps = [
    { number: 1, title: 'Business Information', icon: Building },
    { number: 2, title: 'Contact Details', icon: Users },
    { number: 3, title: 'Capabilities', icon: Package },
    { number: 4, title: 'Documentation', icon: FileText },
    { number: 5, title: 'Review & Submit', icon: CheckCircle }
  ];

  const businessTypes = [
    { value: 'equipment', label: 'Equipment & Hardware', description: 'Grow lights, HVAC, automation systems' },
    { value: 'genetics', label: 'Genetics & Seeds', description: 'Seeds, clones, tissue culture' },
    { value: 'supplies', label: 'Supplies & Consumables', description: 'Nutrients, media, containers' },
    { value: 'services', label: 'Services & Consulting', description: 'Design, installation, maintenance' }
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // In real implementation, this would submit to API
    alert('Your vendor application has been submitted for review!');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/marketplace" className="text-gray-400 hover:text-white transition-colors">
            ← Back to Marketplace
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Become a Vibelux Vendor
          </h1>
          <p className="text-xl text-gray-400">
            Join thousands of trusted suppliers in the indoor agriculture marketplace
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 px-6 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Grow Your Business</h3>
              <p className="text-sm text-gray-400">Access 10,000+ verified growers</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Verified Badge</h3>
              <p className="text-sm text-gray-400">Build trust with buyers</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Simple Pricing</h3>
              <p className="text-sm text-gray-400">15% transaction fee, volume discounts available</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="font-semibold mb-2">Premium Tools</h3>
              <p className="text-sm text-gray-400">Analytics & marketing tools</p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-semibold
                      ${currentStep >= step.number 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-400'
                      }
                    `}>
                      {currentStep > step.number ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        step.number
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`
                        w-full h-1 mx-4
                        ${currentStep > step.number ? 'bg-purple-600' : 'bg-gray-800'}
                      `} />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              {steps.map(step => (
                <div key={step.number} className="text-center">
                  <p className={`text-sm ${currentStep >= step.number ? 'text-white' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Form Steps */}
          <div className="bg-gray-900 rounded-xl p-8">
            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Business Information</h2>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Legal Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="ABC Grow Supplies LLC"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Business Type *
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {businessTypes.map(type => (
                      <label
                        key={type.value}
                        className={`
                          p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${formData.businessType === type.value
                            ? 'border-purple-600 bg-purple-600/10'
                            : 'border-gray-700 hover:border-gray-600'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="businessType"
                          value={type.value}
                          checked={formData.businessType === type.value}
                          onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                          className="sr-only"
                        />
                        <div>
                          <p className="font-semibold">{type.label}</p>
                          <p className="text-sm text-gray-400 mt-1">{type.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Tax ID / EIN *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.taxId}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      placeholder="XX-XXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Year Established *
                    </label>
                    <input
                      type="number"
                      required
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.yearEstablished}
                      onChange={(e) => setFormData({ ...formData, yearEstablished: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="https://www.example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Business Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    rows={4}
                    placeholder="Tell us about your business, products, and what makes you unique..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Title/Position *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactTitle}
                      onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Business Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      ZIP/Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Business Capabilities */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Business Capabilities</h2>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Specialties
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['LED Lighting', 'HVAC Systems', 'Automation', 'Nutrients', 'Growing Media', 'Genetics'].map(specialty => (
                      <label key={specialty} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.specialties.includes(specialty)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                specialties: [...formData.specialties, specialty]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                specialties: formData.specialties.filter(s => s !== specialty)
                              });
                            }
                          }}
                          className="rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Certifications
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['DLC Certified', 'UL Listed', 'ISO 9001', 'Organic', 'GMP', 'Fair Trade'].map(cert => (
                      <label key={cert} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.certifications.includes(cert)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                certifications: [...formData.certifications, cert]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                certifications: formData.certifications.filter(c => c !== cert)
                              });
                            }
                          }}
                          className="rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Payment Terms *
                    </label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="Prepaid">Prepaid</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 60">Net 60</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Minimum Order ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.minimumOrder}
                      onChange={(e) => setFormData({ ...formData, minimumOrder: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Shipping Zones
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['US', 'Canada', 'Mexico', 'International'].map(zone => (
                      <label key={zone} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.shippingZones.includes(zone)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                shippingZones: [...formData.shippingZones, zone]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                shippingZones: formData.shippingZones.filter(z => z !== zone)
                              });
                            }
                          }}
                          className="rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm">{zone}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Documentation */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Required Documentation</h2>
                
                <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-300">
                        All documents are securely stored and only used for verification purposes.
                        Files must be in PDF, JPG, or PNG format and less than 10MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="font-medium mb-1">Business License *</p>
                    <p className="text-sm text-gray-400 mb-3">Upload your current business license</p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        businessLicense: e.target.files?.[0] || null 
                      })}
                      className="hidden"
                      id="businessLicense"
                    />
                    <label
                      htmlFor="businessLicense"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer inline-block"
                    >
                      Choose File
                    </label>
                    {formData.businessLicense && (
                      <p className="text-sm text-green-400 mt-2">
                        ✓ {formData.businessLicense.name}
                      </p>
                    )}
                  </div>

                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="font-medium mb-1">Insurance Certificate *</p>
                    <p className="text-sm text-gray-400 mb-3">General liability insurance certificate</p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        insuranceCert: e.target.files?.[0] || null 
                      })}
                      className="hidden"
                      id="insuranceCert"
                    />
                    <label
                      htmlFor="insuranceCert"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer inline-block"
                    >
                      Choose File
                    </label>
                    {formData.insuranceCert && (
                      <p className="text-sm text-green-400 mt-2">
                        ✓ {formData.insuranceCert.name}
                      </p>
                    )}
                  </div>

                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="font-medium mb-1">W-9 Form *</p>
                    <p className="text-sm text-gray-400 mb-3">For US tax reporting purposes</p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        w9Form: e.target.files?.[0] || null 
                      })}
                      className="hidden"
                      id="w9Form"
                    />
                    <label
                      htmlFor="w9Form"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer inline-block"
                    >
                      Choose File
                    </label>
                    {formData.w9Form && (
                      <p className="text-sm text-green-400 mt-2">
                        ✓ {formData.w9Form.name}
                      </p>
                    )}
                  </div>

                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="font-medium mb-1">Product Catalog</p>
                    <p className="text-sm text-gray-400 mb-3">Optional: Upload your product catalog</p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        productCatalog: e.target.files?.[0] || null 
                      })}
                      className="hidden"
                      id="productCatalog"
                    />
                    <label
                      htmlFor="productCatalog"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer inline-block"
                    >
                      Choose File
                    </label>
                    {formData.productCatalog && (
                      <p className="text-sm text-green-400 mt-2">
                        ✓ {formData.productCatalog.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Review & Submit</h2>
                
                {/* Summary */}
                <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold mb-4">Application Summary</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Business Name</p>
                      <p className="font-medium">{formData.businessName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Business Type</p>
                      <p className="font-medium capitalize">{formData.businessType}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Contact</p>
                      <p className="font-medium">{formData.contactName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Email</p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                  </div>
                </div>

                {/* Fee Structure */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Fee Structure</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Transaction Fee</span>
                      <span className="font-semibold text-orange-400">15% per sale</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monthly Subscription</span>
                      <span>$0 (Free tier available)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Marketplace Access</span>
                      <span className="text-green-400">FREE for first 100 (then $29/month)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Volume Discount</span>
                      <span className="text-green-400">Up to 2% off fees for high volume</span>
                    </div>
                  </div>
                </div>

                {/* Platform Protection Notice */}
                <div className="bg-red-900/20 border border-red-600 rounded-lg p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    Platform Protection Policy
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• All transactions must be completed through Vibelux</li>
                    <li>• Sharing contact information in listings or messages is prohibited</li>
                    <li>• Attempts to circumvent platform fees will result in account suspension</li>
                    <li>• Messages are monitored for policy compliance</li>
                    <li>• Violations may result in permanent ban and forfeiture of funds</li>
                  </ul>
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                      className="rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-purple-500 mt-1"
                    />
                    <span className="text-sm">
                      I agree to the <Link href="/terms" className="text-purple-400 hover:text-purple-300">Terms of Service</Link> and <Link href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>
                    </span>
                  </label>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.feeStructureAccepted}
                      onChange={(e) => setFormData({ ...formData, feeStructureAccepted: e.target.checked })}
                      className="rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-purple-500 mt-1"
                    />
                    <span className="text-sm">
                      I understand and accept the fee structure outlined above
                    </span>
                  </label>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.policiesAccepted}
                      onChange={(e) => setFormData({ ...formData, policiesAccepted: e.target.checked })}
                      className="rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-purple-500 mt-1"
                    />
                    <span className="text-sm">
                      I agree to comply with all marketplace policies and guidelines
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                Previous
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!formData.termsAccepted || !formData.feeStructureAccepted || !formData.policiesAccepted}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    formData.termsAccepted && formData.feeStructureAccepted && formData.policiesAccepted
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Submit Application
                  <CheckCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}