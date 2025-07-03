'use client';

import React, { useState } from 'react';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  FileText,
  AlertTriangle,
  Award,
  CreditCard,
  Building,
  Leaf,
  Star,
  Info,
  ExternalLink,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  VerificationSystem,
  BusinessVerification,
  QualityCertification,
  VerificationBadge
} from '@/lib/marketplace/verification-system';

interface VerificationDashboardProps {
  userId: string;
  businessVerification?: BusinessVerification;
  qualityCertifications?: QualityCertification;
  onUpdate?: () => void;
}

export function VerificationDashboard({
  userId,
  businessVerification,
  qualityCertifications,
  onUpdate
}: VerificationDashboardProps) {
  const [activeTab, setActiveTab] = useState<'business' | 'quality' | 'documents'>('business');
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>('');

  // Calculate verification score and status
  const verificationScore = businessVerification && qualityCertifications
    ? VerificationSystem.calculateVerificationScore(businessVerification, qualityCertifications)
    : 0;
  
  const verificationStatus = VerificationSystem.getVerificationStatus(verificationScore);
  
  const verificationReport = businessVerification && qualityCertifications
    ? VerificationSystem.generateVerificationReport(businessVerification, qualityCertifications)
    : null;

  const handleFileUpload = async (file: File, documentType: string) => {
    setUploadingDoc(documentType);
    
    // Validate document
    const validation = await VerificationSystem.validateDocument(file, documentType);
    if (!validation.valid) {
      alert(validation.errors?.join('\n'));
      setUploadingDoc(null);
      return;
    }
    
    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (vendor?.id) {
      formData.append('vendorId', vendor.id);
    }
    
    try {
      const response = await fetch('/api/marketplace/documents/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Show success message
        alert(`Document uploaded successfully! Status: ${result.data.status}`);
        
        // Update local state
        setUploadingDoc(null);
        setShowUploadModal(false);
        
        // Trigger parent update to refresh verification status
        onUpdate?.();
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload document');
      setUploadingDoc(null);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'verified':
      case 'active':
      case 'premium':
        return 'text-green-400';
      case 'pending':
      case 'partial':
        return 'text-yellow-400';
      case 'expired':
      case 'inactive':
      case 'unverified':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status?: string) => {
    switch (status) {
      case 'verified':
      case 'active':
      case 'premium':
        return 'bg-green-600/20 border-green-600/30';
      case 'pending':
      case 'partial':
        return 'bg-yellow-600/20 border-yellow-600/30';
      case 'expired':
      case 'inactive':
      case 'unverified':
        return 'bg-red-600/20 border-red-600/30';
      default:
        return 'bg-gray-600/20 border-gray-600/30';
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      {/* Header with Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Verification Center</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Status</span>
          </button>
        </div>
        
        {/* Verification Score Card */}
        <div className={`p-6 rounded-lg border ${getStatusBg(verificationStatus)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Verification Score</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-white">{verificationScore}</span>
                <span className="text-lg text-gray-400">/ 100</span>
              </div>
              <p className={`mt-2 text-sm font-medium ${getStatusColor(verificationStatus)}`}>
                Status: {verificationStatus?.toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <Shield className={`w-16 h-16 ${getStatusColor(verificationStatus)}`} />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  verificationScore >= 90 ? 'bg-green-500' :
                  verificationScore >= 70 ? 'bg-blue-500' :
                  verificationScore >= 40 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${verificationScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {verificationReport?.badges && verificationReport.badges.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Your Badges</h3>
          <div className="flex flex-wrap gap-3">
            {verificationReport.badges.map((badge) => (
              <div
                key={badge.id}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  badge.level === 'gold' ? 'bg-yellow-600/20 border border-yellow-600/30' :
                  badge.level === 'silver' ? 'bg-gray-400/20 border border-gray-400/30' :
                  'bg-green-600/20 border border-green-600/30'
                }`}
                title={badge.tooltip}
              >
                <span className="text-lg">{badge.icon}</span>
                <span className={`text-sm font-medium ${
                  badge.level === 'gold' ? 'text-yellow-400' :
                  badge.level === 'silver' ? 'text-gray-300' :
                  'text-green-400'
                }`}>
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {verificationReport && (
        <>
          {verificationReport.missingDocuments.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-400 mb-1">Missing Documents</p>
                  <p className="text-sm text-gray-300">
                    Upload these documents to improve your verification score: {verificationReport.missingDocuments.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {verificationReport.expiringDocuments.length > 0 && (
            <div className="mb-4 p-4 bg-orange-900/20 border border-orange-600/30 rounded-lg">
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-400 mb-1">Documents Expiring Soon</p>
                  <p className="text-sm text-gray-300">
                    These documents will expire within 30 days: {verificationReport.expiringDocuments.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('business')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'business'
              ? 'text-white border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Business Verification
        </button>
        <button
          onClick={() => setActiveTab('quality')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'quality'
              ? 'text-white border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Quality Certifications
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'documents'
              ? 'text-white border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Documents
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'business' && (
        <div className="space-y-4">
          {/* Business License */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-gray-400" />
                <h4 className="font-medium text-white">Business License</h4>
              </div>
              {businessVerification?.businessLicense?.verified ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <button
                  onClick={() => {
                    setSelectedDocType('business-license');
                    setShowUploadModal(true);
                  }}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                >
                  Upload
                </button>
              )}
            </div>
            {businessVerification?.businessLicense ? (
              <div className="text-sm text-gray-400">
                <p>License #: {businessVerification.businessLicense.number}</p>
                <p>State: {businessVerification.businessLicense.state}</p>
                <p>Expires: {new Date(businessVerification.businessLicense.expiryDate).toLocaleDateString()}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Not yet submitted</p>
            )}
          </div>

          {/* PACA License */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <h4 className="font-medium text-white">PACA License</h4>
                <span className="px-2 py-0.5 bg-yellow-600/20 text-yellow-400 text-xs rounded">
                  Recommended
                </span>
              </div>
              {businessVerification?.pacaLicense?.verified ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <button
                  onClick={() => {
                    setSelectedDocType('paca-license');
                    setShowUploadModal(true);
                  }}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                >
                  Upload
                </button>
              )}
            </div>
            {businessVerification?.pacaLicense ? (
              <div className="text-sm text-gray-400">
                <p>License #: {businessVerification.pacaLicense.number}</p>
                <p>Type: {businessVerification.pacaLicense.type}</p>
                <p>Expires: {new Date(businessVerification.pacaLicense.expiryDate).toLocaleDateString()}</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500">Required for trading with major buyers</p>
                <a href="https://www.ams.usda.gov/services/paca" target="_blank" rel="noopener noreferrer" 
                   className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1">
                  Learn about PACA <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* DRC Membership */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-gray-400" />
                <h4 className="font-medium text-white">DRC Membership</h4>
              </div>
              {businessVerification?.drcMembership?.verified ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <button
                  onClick={() => {
                    setSelectedDocType('drc-membership');
                    setShowUploadModal(true);
                  }}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                >
                  Verify
                </button>
              )}
            </div>
            {businessVerification?.drcMembership ? (
              <div className="text-sm text-gray-400">
                <p>Member ID: {businessVerification.drcMembership.memberId}</p>
                <p>Status: {businessVerification.drcMembership.status}</p>
                <p>Member Since: {new Date(businessVerification.drcMembership.joinedDate).toLocaleDateString()}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Dispute resolution membership</p>
            )}
          </div>

          {/* Credit Check */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <h4 className="font-medium text-white">Credit Verification</h4>
              </div>
              {businessVerification?.creditCheck ? (
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    businessVerification.creditCheck.rating === 'excellent' ? 'text-green-400' :
                    businessVerification.creditCheck.rating === 'good' ? 'text-blue-400' :
                    businessVerification.creditCheck.rating === 'fair' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {businessVerification.creditCheck.rating.toUpperCase()}
                  </span>
                </div>
              ) : (
                <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
                  Run Check
                </button>
              )}
            </div>
            {businessVerification?.creditCheck ? (
              <div className="text-sm text-gray-400">
                <p>Score: {businessVerification.creditCheck.score}</p>
                <p>Provider: {businessVerification.creditCheck.provider}</p>
                <p>Checked: {new Date(businessVerification.creditCheck.checkedAt).toLocaleDateString()}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Verify creditworthiness for better terms</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'quality' && (
        <div className="space-y-4">
          {/* Organic Certification */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Leaf className="w-5 h-5 text-gray-400" />
                <h4 className="font-medium text-white">Organic Certification</h4>
              </div>
              {qualityCertifications?.organic?.verified ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <button
                  onClick={() => {
                    setSelectedDocType('organic-cert');
                    setShowUploadModal(true);
                  }}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                >
                  Upload
                </button>
              )}
            </div>
            {qualityCertifications?.organic ? (
              <div className="text-sm text-gray-400">
                <p>Certifier: {qualityCertifications.organic.certifier}</p>
                <p>Certificate #: {qualityCertifications.organic.certificateNumber}</p>
                <p>Expires: {new Date(qualityCertifications.organic.expiryDate).toLocaleDateString()}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">USDA Organic certification</p>
            )}
          </div>

          {/* GAP Certification */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-gray-400" />
                <h4 className="font-medium text-white">GAP Certification</h4>
              </div>
              {qualityCertifications?.gap?.verified ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <button
                  onClick={() => {
                    setSelectedDocType('gap-cert');
                    setShowUploadModal(true);
                  }}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                >
                  Upload
                </button>
              )}
            </div>
            {qualityCertifications?.gap ? (
              <div className="text-sm text-gray-400">
                <p>Level: {qualityCertifications.gap.level}</p>
                <p>Auditor: {qualityCertifications.gap.auditor}</p>
                <p>Score: {qualityCertifications.gap.score}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Good Agricultural Practices certification</p>
            )}
          </div>

          {/* Food Safety */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <h4 className="font-medium text-white">Food Safety Certification</h4>
              </div>
              {qualityCertifications?.foodSafety?.verified ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <button
                  onClick={() => {
                    setSelectedDocType('food-safety');
                    setShowUploadModal(true);
                  }}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                >
                  Upload
                </button>
              )}
            </div>
            {qualityCertifications?.foodSafety ? (
              <div className="text-sm text-gray-400">
                <p>Type: {qualityCertifications.foodSafety.type}</p>
                <p>Auditor: {qualityCertifications.foodSafety.auditor}</p>
                <p>Expires: {new Date(qualityCertifications.foodSafety.expiryDate).toLocaleDateString()}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">SQF, BRC, FSSC 22000, or similar</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-400">
              All your uploaded documents in one place
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
          
          {/* Document list would go here */}
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No documents uploaded yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Upload your business and quality certifications to get verified
            </p>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Upload Document</h3>
            
            {!selectedDocType && (
              <div className="space-y-2 mb-4">
                <select
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  onChange={(e) => setSelectedDocType(e.target.value)}
                >
                  <option value="">Select document type...</option>
                  <option value="business-license">Business License</option>
                  <option value="paca-license">PACA License</option>
                  <option value="organic-cert">Organic Certification</option>
                  <option value="gap-cert">GAP Certification</option>
                  <option value="food-safety">Food Safety Certification</option>
                  <option value="insurance">Insurance Certificate</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}
            
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-300 mb-2">Drop files here or click to upload</p>
              <p className="text-sm text-gray-500">PDF, JPEG, or PNG up to 10MB</p>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files?.[0] && selectedDocType) {
                    handleFileUpload(e.target.files[0], selectedDocType);
                  }
                }}
              />
            </div>
            
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedDocType('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}