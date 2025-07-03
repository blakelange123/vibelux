'use client';

import React, { useState } from 'react';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  TrendingUp,
  Package,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react';
import { MarketplaceManager, Vendor } from '@/lib/marketplace/marketplace-manager';

interface VendorManagementProps {
  marketplaceManager: MarketplaceManager;
  isVendor?: boolean;
}

export function VendorManagement({ marketplaceManager, isVendor = false }: VendorManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'equipment' as Vendor['type'],
    contact: {
      email: '',
      phone: '',
      address: ''
    },
    businessInfo: {
      taxId: '',
      yearEstablished: new Date().getFullYear(),
      insuranceExpiry: ''
    },
    paymentTerms: 'Net 30',
    minimumOrder: 500,
    specialties: [] as string[],
    certifications: [] as string[],
    shippingZones: ['US']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const vendor = marketplaceManager.registerVendor({
      ...formData,
      verified: false,
      rating: 0,
      reviewCount: 0,
      businessInfo: {
        ...formData.businessInfo,
        insuranceExpiry: new Date(formData.businessInfo.insuranceExpiry)
      }
    });

    setShowAddForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'equipment',
      contact: { email: '', phone: '', address: '' },
      businessInfo: {
        taxId: '',
        yearEstablished: new Date().getFullYear(),
        insuranceExpiry: ''
      },
      paymentTerms: 'Net 30',
      minimumOrder: 500,
      specialties: [],
      certifications: [],
      shippingZones: ['US']
    });
  };

  const vendorTypes = [
    { id: 'equipment', name: 'Equipment & Hardware' },
    { id: 'genetics', name: 'Genetics & Seeds' },
    { id: 'supplies', name: 'Supplies & Consumables' },
    { id: 'services', name: 'Services & Consulting' }
  ];

  const certificationOptions = [
    'DLC Certified',
    'UL Listed',
    'ETL Listed',
    'Energy Star',
    'ISO 9001',
    'Organic Certified',
    'Virus-Free Certified',
    'GMP Certified'
  ];

  const specialtyOptions = {
    equipment: ['LED Lighting', 'HVAC Systems', 'Automation', 'Irrigation', 'Racking'],
    genetics: ['Cannabis', 'Hemp', 'Vegetables', 'Herbs', 'Tissue Culture'],
    supplies: ['Nutrients', 'Growing Media', 'Pest Control', 'Packaging', 'Testing'],
    services: ['Design', 'Installation', 'Maintenance', 'Consulting', 'Training']
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Vendor Management</h2>
          <p className="text-gray-400 mt-1">
            {isVendor ? 'Manage your vendor profile and listings' : 'Become a verified vendor'}
          </p>
        </div>
        
        {!isVendor && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Become a Vendor
          </button>
        )}
      </div>

      {/* Vendor Registration Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold">Vendor Registration</h3>
              <p className="text-gray-400 text-sm mt-1">
                Join our marketplace as a verified vendor
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Business Information */}
              <div>
                <h4 className="font-medium mb-4">Business Information</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Business Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        type: e.target.value as Vendor['type'],
                        specialties: []
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                      {vendorTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Tax ID / EIN *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.businessInfo.taxId}
                      onChange={(e) => setFormData({
                        ...formData,
                        businessInfo: { ...formData.businessInfo, taxId: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Year Established *
                    </label>
                    <input
                      type="number"
                      required
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.businessInfo.yearEstablished}
                      onChange={(e) => setFormData({
                        ...formData,
                        businessInfo: { ...formData.businessInfo, yearEstablished: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="font-medium mb-4">Contact Information</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.contact.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact: { ...formData.contact, email: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.contact.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact: { ...formData.contact, phone: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">
                      Business Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact.address}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact: { ...formData.contact, address: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div>
                <h4 className="font-medium mb-4">Business Details</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Payment Terms *
                    </label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="Prepaid">Prepaid</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 60">Net 60</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Minimum Order ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.minimumOrder}
                      onChange={(e) => setFormData({ ...formData, minimumOrder: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">
                      Insurance Expiry Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.businessInfo.insuranceExpiry}
                      onChange={(e) => setFormData({
                        ...formData,
                        businessInfo: { ...formData.businessInfo, insuranceExpiry: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <h4 className="font-medium mb-4">Specialties</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {specialtyOptions[formData.type]?.map(specialty => (
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

              {/* Certifications */}
              <div>
                <h4 className="font-medium mb-4">Certifications</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {certificationOptions.map(cert => (
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

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Benefits */}
      {!isVendor && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">Grow Your Business</h3>
            <p className="text-sm text-gray-400">
              Access thousands of verified growers and expand your customer base
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold mb-2">Verified Badge</h3>
            <p className="text-sm text-gray-400">
              Build trust with our verification process and stand out from competitors
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold mb-2">Easy Management</h3>
            <p className="text-sm text-gray-400">
              List products, manage orders, and track performance in one place
            </p>
          </div>
        </div>
      )}
    </div>
  );
}