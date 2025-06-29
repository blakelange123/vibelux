'use client';

import React, { useState } from 'react';
import { 
  Download, 
  Trash2, 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  Lock,
  Database,
  UserX,
  Mail,
  Settings
} from 'lucide-react';

interface DataRequest {
  type: 'export' | 'deletion' | 'correction';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
}

export function GDPRDataManagement() {
  const [activeTab, setActiveTab] = useState<'export' | 'deletion' | 'settings'>('export');
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeletionConfirm, setShowDeletionConfirm] = useState(false);
  const [deletionConfirmText, setDeletionConfirmText] = useState('');

  const handleDataExport = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/gdpr/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const { requestId } = await response.json();
        setDataRequests([
          ...dataRequests,
          {
            type: 'export',
            status: 'processing',
            requestedAt: new Date(),
          }
        ]);
      }
    } catch (error) {
      console.error('Data export request failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (deletionConfirmText !== 'DELETE MY ACCOUNT') {
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/gdpr/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: true })
      });

      if (response.ok) {
        // Handle successful deletion request
        window.location.href = '/account-deleted';
      }
    } catch (error) {
      console.error('Account deletion request failed:', error);
    } finally {
      setIsProcessing(false);
      setShowDeletionConfirm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Privacy & Data Management</h2>
              <p className="text-gray-600 mt-1">
                Manage your personal data in compliance with GDPR
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('export')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'export'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Database className="w-4 h-4 inline mr-2" />
              Export Data
            </button>
            <button
              onClick={() => setActiveTab('deletion')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'deletion'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserX className="w-4 h-4 inline mr-2" />
              Delete Account
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Privacy Settings
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Export Data Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Your Right to Data Portability</h3>
                <p className="text-blue-700 text-sm">
                  Under GDPR Article 20, you have the right to receive your personal data in a 
                  structured, commonly used and machine-readable format. This includes all data 
                  you've provided to us and data generated through your use of our services.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">What's included in your data export:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="text-gray-700">Account information and profile data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="text-gray-700">Facility configurations and settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="text-gray-700">Historical sensor data and analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="text-gray-700">Lighting designs and configurations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="text-gray-700">Activity logs and usage history</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Request Data Export</h4>
                <p className="text-gray-600 mb-4">
                  We'll prepare a complete export of your data within 30 days. You'll receive an 
                  email notification when your download is ready.
                </p>
                <button
                  onClick={handleDataExport}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Request...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Request Data Export
                    </>
                  )}
                </button>
              </div>

              {/* Previous Requests */}
              {dataRequests.filter(r => r.type === 'export').length > 0 && (
                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Previous Export Requests</h4>
                  <div className="space-y-3">
                    {dataRequests
                      .filter(r => r.type === 'export')
                      .map((request, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                Data Export Request
                              </p>
                              <p className="text-sm text-gray-500">
                                Requested on {request.requestedAt.toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {request.status === 'completed' ? (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  Ready
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-yellow-600">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Processing
                                </span>
                              )}
                            </div>
                          </div>
                          {request.downloadUrl && (
                            <a
                              href={request.downloadUrl}
                              className="mt-3 inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
                            >
                              <Download className="w-4 h-4" />
                              Download Export
                            </a>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delete Account Tab */}
          {activeTab === 'deletion' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">
                      Permanent Account Deletion
                    </h3>
                    <p className="text-red-700 text-sm">
                      This action is permanent and cannot be undone. All your data will be permanently 
                      deleted from our systems within 30 days, except for data we're legally required 
                      to retain.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">What happens when you delete your account:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                    <span className="text-gray-700">
                      All personal information will be permanently deleted
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                    <span className="text-gray-700">
                      Active subscriptions will be cancelled immediately
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                    <span className="text-gray-700">
                      Facility data and configurations will be removed
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <span className="text-gray-700">
                      Some data may be retained for legal compliance (anonymized)
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Before you delete your account
                </h4>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-gray-700">
                    <FileText className="w-4 h-4" />
                    Export your data first if you want to keep a copy
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4" />
                    Update any important email notifications
                  </li>
                </ul>

                {!showDeletionConfirm ? (
                  <button
                    onClick={() => setShowDeletionConfirm(true)}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete My Account
                  </button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-700 font-medium">
                      To confirm deletion, please type: <span className="font-mono bg-gray-200 px-2 py-1 rounded">DELETE MY ACCOUNT</span>
                    </p>
                    <input
                      type="text"
                      value={deletionConfirmText}
                      onChange={(e) => setDeletionConfirmText(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Type confirmation text"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleAccountDeletion}
                        disabled={deletionConfirmText !== 'DELETE MY ACCOUNT' || isProcessing}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Processing...' : 'Confirm Deletion'}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeletionConfirm(false);
                          setDeletionConfirmText('');
                        }}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Privacy Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Communication Preferences</h4>
                
                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 text-purple-600 rounded"
                    defaultChecked
                  />
                  <div>
                    <p className="font-medium text-gray-900">Service Updates</p>
                    <p className="text-sm text-gray-600">
                      Important updates about service changes and maintenance
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 text-purple-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Marketing Communications</p>
                    <p className="text-sm text-gray-600">
                      News about features, tips, and promotional offers
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 text-purple-600 rounded"
                    defaultChecked
                  />
                  <div>
                    <p className="font-medium text-gray-900">Security Alerts</p>
                    <p className="text-sm text-gray-600">
                      Notifications about account security and suspicious activities
                    </p>
                  </div>
                </label>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Data Sharing</h4>
                
                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 text-purple-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Anonymous Usage Analytics</p>
                    <p className="text-sm text-gray-600">
                      Help improve our service by sharing anonymous usage data
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 text-purple-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Industry Benchmarking</p>
                    <p className="text-sm text-gray-600">
                      Contribute anonymized data to industry benchmark reports
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-4">
                <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  Save Privacy Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}