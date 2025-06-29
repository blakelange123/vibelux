'use client';

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Star,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  TrendingUp,
  Award,
  Calendar,
  Edit,
  MoreVertical,
  Upload,
  Download,
  BarChart3,
  Package,
  Truck
} from 'lucide-react';
import { 
  Vendor, 
  VendorStatus, 
  VendorCategory,
  VendorPerformance,
  Certification,
  VendorRating
} from '@/lib/purchasing/purchase-types';

interface VendorManagementProps {
  onSelectVendor?: (vendor: Vendor) => void;
}

export function VendorManagement({ onSelectVendor }: VendorManagementProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'compliance' | 'documents'>('overview');

  // Sample vendors
  const vendors: Vendor[] = [
    {
      id: 'v-001',
      name: 'Advanced Nutrients Co.',
      code: 'AN-001',
      status: VendorStatus.Active,
      category: VendorCategory.Nutrients,
      contacts: [
        {
          name: 'James Wilson',
          title: 'Sales Manager',
          email: 'james@advancednutrients.com',
          phone: '555-0123',
          mobile: '555-9876',
          isPrimary: true,
          department: 'Sales'
        },
        {
          name: 'Lisa Chen',
          title: 'Account Manager',
          email: 'lisa@advancednutrients.com',
          phone: '555-0124',
          isPrimary: false,
          department: 'Customer Service'
        }
      ],
      addresses: [
        {
          type: 'both',
          street1: '123 Industrial Ave',
          street2: 'Suite 200',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA',
          isDefault: true
        }
      ],
      paymentTerms: {
        termCode: 'NET30',
        description: 'Net 30 Days',
        netDays: 30,
        discountPercent: 2,
        discountDays: 10
      },
      currency: 'USD',
      taxId: '12-3456789',
      certifications: [
        {
          type: 'ISO 9001',
          number: 'ISO9001-2023-1234',
          issuedBy: 'ISO Certification Body',
          issueDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() + 185 * 24 * 60 * 60 * 1000),
          status: 'Valid',
          document: 'iso-cert.pdf'
        },
        {
          type: 'Organic Certified',
          number: 'ORG-2023-5678',
          issuedBy: 'USDA',
          issueDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
          status: 'Valid'
        }
      ],
      documents: [
        {
          id: 'doc-1',
          type: 'W9 Form',
          name: 'W9_AdvancedNutrients_2024.pdf',
          uploadDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          url: '/documents/w9.pdf',
          verified: true
        },
        {
          id: 'doc-2',
          type: 'Insurance Certificate',
          name: 'Insurance_Certificate_2024.pdf',
          uploadDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000),
          url: '/documents/insurance.pdf',
          verified: true
        }
      ],
      bankDetails: {
        bankName: 'Chase Bank',
        accountName: 'Advanced Nutrients Co.',
        accountNumber: '****1234',
        routingNumber: '123456789',
        swiftCode: 'CHASUS33'
      },
      rating: {
        overall: 4.5,
        quality: 4.7,
        delivery: 4.3,
        price: 4.2,
        service: 4.6,
        compliance: 5.0,
        reviewCount: 24,
        lastReview: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      compliance: {
        isCompliant: true,
        lastAudit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        nextAudit: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        licenses: [
          {
            type: 'Business License',
            number: 'BL-2024-1234',
            expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000)
          }
        ],
        insurance: [
          {
            type: 'General Liability',
            provider: 'State Farm',
            policyNumber: 'GL-123456',
            coverage: 1000000,
            expiryDate: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000)
          }
        ],
        violations: []
      },
      createdDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'v-002',
      name: 'GrowTech Equipment',
      code: 'GT-002',
      status: VendorStatus.Active,
      category: VendorCategory.Equipment,
      contacts: [
        {
          name: 'Mike Rodriguez',
          title: 'Regional Manager',
          email: 'mike@growtech.com',
          phone: '555-0456',
          isPrimary: true
        }
      ],
      addresses: [
        {
          type: 'both',
          street1: '456 Tech Park Blvd',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA',
          isDefault: true
        }
      ],
      paymentTerms: {
        termCode: 'NET45',
        description: 'Net 45 Days',
        netDays: 45
      },
      currency: 'USD',
      taxId: '98-7654321',
      certifications: [],
      documents: [],
      bankDetails: {
        bankName: 'Wells Fargo',
        accountName: 'GrowTech Equipment Inc.',
        accountNumber: '****5678',
        routingNumber: '987654321'
      },
      rating: {
        overall: 4.2,
        quality: 4.5,
        delivery: 3.8,
        price: 4.0,
        service: 4.3,
        compliance: 4.5,
        reviewCount: 18,
        lastReview: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
      },
      compliance: {
        isCompliant: true,
        licenses: [],
        insurance: [],
        violations: []
      },
      createdDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ];

  const getStatusColor = (status: VendorStatus) => {
    switch (status) {
      case VendorStatus.Active: return 'text-green-400 bg-green-900/20';
      case VendorStatus.Inactive: return 'text-gray-400 bg-gray-900/20';
      case VendorStatus.Pending: return 'text-yellow-400 bg-yellow-900/20';
      case VendorStatus.Suspended: return 'text-orange-400 bg-orange-900/20';
      case VendorStatus.Blacklisted: return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    onSelectVendor?.(vendor);
  };

  // Sample performance data
  const performanceData: VendorPerformance = {
    vendorId: selectedVendor?.id || '',
    period: {
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      type: 'Quarterly'
    },
    metrics: {
      onTimeDelivery: 94,
      qualityScore: 4.6,
      priceVariance: -2.3,
      responseTime: 4.2,
      defectRate: 0.8,
      returnRate: 0.5,
      orderAccuracy: 98.5,
      documentationAccuracy: 99.2
    },
    scorecard: {
      totalScore: 88,
      grade: 'B',
      trend: 'Improving',
      ranking: 3,
      recommendations: [
        'Improve delivery times for rush orders',
        'Enhance communication on order status updates',
        'Consider volume discount agreements'
      ]
    },
    issues: [
      {
        id: 'issue-1',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        type: 'Delivery Delay',
        description: 'Equipment delivery delayed by 3 days due to shipping issues',
        impact: 'Medium',
        resolution: 'Expedited shipping for future orders',
        preventiveAction: 'Added buffer time to delivery estimates'
      }
    ],
    improvements: [
      {
        area: 'On-Time Delivery',
        target: 98,
        current: 94,
        actions: ['Implement real-time tracking', 'Add local warehouse'],
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendors..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="all">All Categories</option>
          {Object.values(VendorCategory).map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4 mr-2 inline" />
          Add Vendor
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Vendor List */}
        <div className="col-span-1 space-y-3">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              onClick={() => handleSelectVendor(vendor)}
              className={`bg-gray-900 rounded-lg p-4 border cursor-pointer transition-all ${
                selectedVendor?.id === vendor.id
                  ? 'border-purple-600'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  <h3 className="font-medium text-white">{vendor.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(vendor.status)}`}>
                  {vendor.status}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-2">{vendor.code} • {vendor.category}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-white">{vendor.rating.overall.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({vendor.rating.reviewCount})</span>
                </div>
                <span className="text-xs text-gray-500">
                  Active {Math.floor((Date.now() - vendor.createdDate.getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Vendor Details */}
        {selectedVendor && (
          <div className="col-span-2 bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{selectedVendor.name}</h2>
                  <p className="text-gray-400">Code: {selectedVendor.code} • Tax ID: {selectedVendor.taxId}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-6">
                {['overview', 'performance', 'compliance', 'documents'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedVendor.contacts.map((contact, idx) => (
                        <div key={idx} className="bg-gray-800 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-white">{contact.name}</h4>
                            {contact.isPrimary && (
                              <span className="px-2 py-0.5 bg-purple-900/20 text-purple-400 text-xs rounded-full">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{contact.title}</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-300">{contact.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-300">{contact.phone}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
                    {selectedVendor.addresses.map((address, idx) => (
                      <div key={idx} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-300 capitalize">{address.type} Address</span>
                        </div>
                        <p className="text-white">
                          {address.street1}{address.street2 && `, ${address.street2}`}
                        </p>
                        <p className="text-white">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-gray-400">{address.country}</p>
                      </div>
                    ))}
                  </div>

                  {/* Payment & Banking */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Payment Information</h3>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Payment Terms</p>
                          <p className="text-white">{selectedVendor.paymentTerms.description}</p>
                          {selectedVendor.paymentTerms.discountPercent && (
                            <p className="text-sm text-green-400 mt-1">
                              {selectedVendor.paymentTerms.discountPercent}% discount if paid within {selectedVendor.paymentTerms.discountDays} days
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Currency</p>
                          <p className="text-white">{selectedVendor.currency}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-6">
                  {/* Performance Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">On-Time Delivery</span>
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{performanceData.metrics.onTimeDelivery}%</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Quality Score</span>
                          <Star className="w-4 h-4 text-yellow-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{performanceData.metrics.qualityScore}/5</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Order Accuracy</span>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{performanceData.metrics.orderAccuracy}%</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Defect Rate</span>
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{performanceData.metrics.defectRate}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Scorecard */}
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Vendor Scorecard</h3>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-3xl font-bold text-white">{performanceData.scorecard.totalScore}/100</p>
                        <p className="text-sm text-gray-400">Overall Score</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-purple-400">Grade {performanceData.scorecard.grade}</p>
                        <p className="text-sm text-gray-400">{performanceData.scorecard.trend}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">#{performanceData.scorecard.ranking}</p>
                        <p className="text-sm text-gray-400">Vendor Ranking</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-400 mb-2">Recommendations</p>
                      <ul className="space-y-1">
                        {performanceData.scorecard.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-purple-400">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'compliance' && (
                <div className="space-y-6">
                  {/* Compliance Status */}
                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Compliance Status</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        selectedVendor.compliance.isCompliant
                          ? 'bg-green-900/20 text-green-400'
                          : 'bg-red-900/20 text-red-400'
                      }`}>
                        {selectedVendor.compliance.isCompliant ? 'Compliant' : 'Non-Compliant'}
                      </span>
                    </div>
                    {selectedVendor.compliance.lastAudit && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Last Audit</p>
                          <p className="text-white">{selectedVendor.compliance.lastAudit.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Next Audit</p>
                          <p className="text-white">{selectedVendor.compliance.nextAudit?.toLocaleDateString() || 'Not scheduled'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Certifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Certifications</h3>
                    <div className="space-y-3">
                      {selectedVendor.certifications.map((cert, idx) => (
                        <div key={idx} className="bg-gray-800 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Award className="w-4 h-4 text-purple-400" />
                                <h4 className="font-medium text-white">{cert.type}</h4>
                              </div>
                              <p className="text-sm text-gray-400">Certificate #{cert.number}</p>
                              <p className="text-sm text-gray-400">Issued by {cert.issuedBy}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              cert.status === 'Valid'
                                ? 'bg-green-900/20 text-green-400'
                                : cert.status === 'Expiring'
                                ? 'bg-yellow-900/20 text-yellow-400'
                                : 'bg-red-900/20 text-red-400'
                            }`}>
                              {cert.status}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span>Issued: {cert.issueDate.toLocaleDateString()}</span>
                            <span>Expires: {cert.expiryDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Documents</h3>
                    <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-medium transition-colors">
                      <Upload className="w-4 h-4 mr-2 inline" />
                      Upload
                    </button>
                  </div>
                  <div className="space-y-3">
                    {selectedVendor.documents.map((doc) => (
                      <div key={doc.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-white">{doc.name}</p>
                              <div className="flex items-center gap-3 text-sm text-gray-400">
                                <span>{doc.type}</span>
                                <span>•</span>
                                <span>Uploaded {doc.uploadDate.toLocaleDateString()}</span>
                                {doc.expiryDate && (
                                  <>
                                    <span>•</span>
                                    <span>Expires {doc.expiryDate.toLocaleDateString()}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.verified && (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                            <button className="p-1.5 hover:bg-gray-700 rounded transition-colors">
                              <Download className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}