'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Zap, FileText, Database, RefreshCw, 
  CheckCircle, AlertCircle, Upload, Download, Bot,
  Building, DollarSign, TrendingUp, Shield, Key,
  Clock, Activity, BarChart3, Settings, Info,
  FileUp, FileCheck, Loader2, ChevronRight, Eye
} from 'lucide-react';

interface UtilityProvider {
  id: string;
  name: string;
  logo: string;
  region: string;
  apiStatus: 'connected' | 'pending' | 'available';
  features: string[];
}

export default function UtilityAPIPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const utilityProviders: UtilityProvider[] = [
    {
      id: 'pge',
      name: 'Pacific Gas & Electric',
      logo: '/logos/pge.png',
      region: 'California',
      apiStatus: 'connected',
      features: ['Real-time usage', 'Historical data', 'Rate schedules', 'Demand response']
    },
    {
      id: 'sce',
      name: 'Southern California Edison',
      logo: '/logos/sce.png',
      region: 'California',
      apiStatus: 'connected',
      features: ['Smart meter data', 'TOU rates', 'Bill download', 'Usage alerts']
    },
    {
      id: 'coned',
      name: 'ConEd',
      logo: '/logos/coned.png',
      region: 'New York',
      apiStatus: 'pending',
      features: ['Usage history', 'Payment data', 'Peak pricing', 'Green power']
    },
    {
      id: 'duke',
      name: 'Duke Energy',
      logo: '/logos/duke.png',
      region: 'Southeast',
      apiStatus: 'available',
      features: ['Interval data', 'Budget billing', 'Outage info', 'Energy audits']
    }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setProcessing(true);
      // Simulate PDF processing
      setTimeout(() => {
        setProcessing(false);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Integrations
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Utility API Integration</h1>
              <p className="text-gray-400">
                Automate baseline verification and energy savings calculations with direct utility connections
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200">
                Connect New Utility
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-6 border-b border-gray-800">
            {['overview', 'connections', 'pdf-processing', 'automation'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Critical Missing Components Alert */}
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Critical Missing Components</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      No utility bill API integration
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      No automated baseline from utility data
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      No third-party verification system
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      No traditional invoice generation
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      Savings based on IoT data only
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                <Database className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Automated Baseline</h3>
                <p className="text-gray-400">
                  Automatically pull historical usage data to establish accurate baselines without manual input
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                <Shield className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Third-Party Verification</h3>
                <p className="text-gray-400">
                  Direct utility data provides independent verification of energy savings claims
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                <DollarSign className="w-12 h-12 text-purple-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Accurate Billing</h3>
                <p className="text-gray-400">
                  Generate traditional invoices based on verified utility data and actual rates
                </p>
              </div>
            </div>

            {/* Current Manual Processes */}
            <div className="bg-orange-900/20 border border-orange-500/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Manual Processes Required</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      Manual baseline establishment
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      Manual utility bill verification
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      Manual dispute resolution
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      Manual sensor registration
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      Manual oracle authorization
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* What Will Be Automated */}
            <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">What Will Be Automated</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-green-400" />
                        Real-time usage monitoring
                      </li>
                      <li className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-green-400" />
                        Baseline calculation from utility data
                      </li>
                      <li className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-green-400" />
                        Rate schedule optimization
                      </li>
                      <li className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-green-400" />
                        Demand response participation
                      </li>
                    </ul>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-green-400" />
                        Bill reconciliation
                      </li>
                      <li className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-green-400" />
                        Savings verification
                      </li>
                      <li className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-green-400" />
                        Invoice generation
                      </li>
                      <li className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-green-400" />
                        Dispute documentation
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="space-y-8">
            {/* API Credentials Placeholder */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">API Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Utility API Key
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="password"
                      placeholder="Enter your Utility API key"
                      className="flex-1 px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    />
                    <button className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                      <Key className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Get your API key from <a href="#" className="text-purple-400 hover:text-purple-300">utilityapi.com</a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    OAuth Redirect URL
                  </label>
                  <div className="px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-gray-400 font-mono text-sm">
                    https://app.vibelux.com/api/utility/callback
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Utilities */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Available Utility Connections</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {utilityProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className="bg-gray-900/50 rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{provider.name}</h4>
                        <p className="text-sm text-gray-400">{provider.region}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        provider.apiStatus === 'connected' 
                          ? 'bg-green-500/20 text-green-400'
                          : provider.apiStatus === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {provider.apiStatus === 'connected' ? 'Connected' : 
                         provider.apiStatus === 'pending' ? 'Pending' : 'Available'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {provider.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    {provider.apiStatus === 'connected' ? (
                      <button className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                        Manage Connection
                      </button>
                    ) : (
                      <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        Connect
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pdf-processing' && (
          <div className="space-y-8">
            {/* AI Processing Requirements */}
            <div className="bg-blue-900/20 border border-blue-500/50 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <Bot className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Claude API Integration Required</h3>
                  <p className="text-gray-300 mb-3">
                    To automatically extract and understand data from utility bill PDFs, we need to integrate Claude's API for:
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      Intelligent text extraction from complex PDF layouts
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      Understanding different utility bill formats across providers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      Extracting usage data, rates, and charges accurately
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      Handling multi-page bills and various document structures
                    </li>
                  </ul>
                  <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">API Configuration Needed:</h4>
                    <code className="text-xs text-gray-400 font-mono">
                      CLAUDE_API_KEY=sk-ant-api...<br/>
                      CLAUDE_MODEL=claude-3-opus-20240229
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Upload */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Utility Bill PDF Processing</h3>
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center hover:border-purple-500/50 transition-colors">
                <input
                  type="file"
                  id="pdf-upload"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <FileUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">Drop utility bill PDFs here or click to upload</p>
                  <p className="text-sm text-gray-500">Supports PDF files up to 10MB</p>
                </label>
              </div>

              {selectedFile && (
                <div className="mt-6 bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-white">{selectedFile.name}</p>
                        <p className="text-sm text-gray-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    {processing ? (
                      <div className="flex items-center gap-2 text-purple-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Processing Pipeline */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">PDF Processing Pipeline</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-purple-400 font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">PDF to Text Conversion</h4>
                    <p className="text-sm text-gray-400">Extract raw text using OCR if needed</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-purple-400 font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">Claude API Analysis</h4>
                    <p className="text-sm text-gray-400">Send text to Claude for intelligent parsing</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-purple-400 font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">Data Validation</h4>
                    <p className="text-sm text-gray-400">Verify extracted data against expected formats</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-purple-400 font-bold">4</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">Database Storage</h4>
                    <p className="text-sm text-gray-400">Store validated data for baseline calculations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Extracted Data Example */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Sample Extracted Data (via Claude API)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Account Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Account Number</span>
                      <span className="text-white">123-456-789</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Service Address</span>
                      <span className="text-white">123 Grow St</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rate Schedule</span>
                      <span className="text-white">AG-TOU-B</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Usage Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total kWh</span>
                      <span className="text-white">45,230</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Peak Demand</span>
                      <span className="text-white">125 kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Charges</span>
                      <span className="text-white">$8,456.32</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'automation' && (
          <div className="space-y-8">
            {/* Automation Workflows */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Automated Workflows</h3>
              <div className="space-y-4">
                {/* Baseline Automation */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Baseline Establishment</h4>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                      Active
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">Pull 12 months historical data</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">Calculate average usage patterns</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">Identify peak demand periods</span>
                    </div>
                  </div>
                </div>

                {/* Verification Automation */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Savings Verification</h4>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      Enabled
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">Compare IoT data with utility bills</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">Calculate verified savings</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">Generate audit reports</span>
                    </div>
                  </div>
                </div>

                {/* Invoice Automation */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Invoice Generation</h4>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                      Ready
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">Calculate savings share</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">Generate compliant invoices</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">Attach verification data</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Required Integrations */}
            <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/20 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Required API Integrations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Bot className="w-5 h-5 text-purple-400" />
                    <h4 className="font-medium text-white">Claude API</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• PDF text understanding</li>
                    <li>• Multi-format bill parsing</li>
                    <li>• Data extraction & validation</li>
                    <li>• Natural language processing</li>
                  </ul>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h4 className="font-medium text-white">Utility API</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Direct utility connections</li>
                    <li>• Real-time usage data</li>
                    <li>• Historical baselines</li>
                    <li>• Rate schedule access</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Integration Status */}
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
              <div className="flex items-start gap-4">
                <Info className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Integration Timeline</h3>
                  <p className="text-gray-300 mb-4">
                    Full utility API and Claude API integration will enable complete automation of baseline establishment, 
                    PDF bill processing, verification, and invoice generation. This will eliminate all manual processes and provide 
                    third-party verification for all energy savings claims.
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                      View Implementation Plan
                    </button>
                    <button className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors">
                      Contact Integration Team
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}