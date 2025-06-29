'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Activity, AlertCircle, CheckCircle, Clock,
  XCircle, TrendingUp, Users, Zap, Bot, Database,
  FileText, Shield, Eye, Settings, RefreshCw, Info,
  Package, DollarSign, BarChart3, Loader2, ChevronRight,
  WifiOff, Wifi, AlertTriangle, Monitor
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  facility: string;
  status: 'automated' | 'semi-automated' | 'manual';
  automationLevel: number;
  issues: string[];
  lastSync: string;
  savingsTracked: number;
  verificationStatus: 'verified' | 'pending' | 'failed';
}

interface AutomationStep {
  name: string;
  status: 'complete' | 'partial' | 'missing';
  description: string;
  requirement?: string;
}

export default function ClientMonitoringPage() {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  const clients: Client[] = [
    {
      id: 'CLT-001',
      name: 'Green Valley Farms',
      facility: 'Sacramento, CA',
      status: 'manual',
      automationLevel: 15,
      issues: ['No utility API connection', 'Manual baseline entry', 'No Claude API'],
      lastSync: '2024-02-28 14:32',
      savingsTracked: 45230,
      verificationStatus: 'pending'
    },
    {
      id: 'CLT-002',
      name: 'Urban Grow Co',
      facility: 'Oakland, CA',
      status: 'semi-automated',
      automationLevel: 45,
      issues: ['PDF processing manual', 'Baseline not verified'],
      lastSync: '2024-02-28 16:45',
      savingsTracked: 28500,
      verificationStatus: 'pending'
    },
    {
      id: 'CLT-003',
      name: 'Sunshine Gardens',
      facility: 'Los Angeles, CA',
      status: 'manual',
      automationLevel: 20,
      issues: ['No utility connection', 'Manual invoice generation'],
      lastSync: '2024-02-28 12:15',
      savingsTracked: 62100,
      verificationStatus: 'failed'
    }
  ];

  const automationSteps: AutomationStep[] = [
    {
      name: 'IoT Sensor Connection',
      status: 'complete',
      description: 'Real-time energy monitoring via MQTT',
      requirement: 'Sensors installed and connected'
    },
    {
      name: 'Utility API Integration',
      status: 'missing',
      description: 'Direct connection to utility provider',
      requirement: 'Utility API key and OAuth setup'
    },
    {
      name: 'Claude API Integration',
      status: process.env.NEXT_PUBLIC_CLAUDE_API_CONFIGURED === 'true' ? 'complete' : 'partial',
      description: 'AI-powered PDF bill processing',
      requirement: 'Claude API key configured'
    },
    {
      name: 'Baseline Automation',
      status: 'complete',
      description: 'Automated baseline from utility data',
      requirement: 'Service implemented - awaiting utility API'
    },
    {
      name: 'Third-Party Verification',
      status: 'complete',
      description: 'Independent verification of savings',
      requirement: 'Service implemented - awaiting utility API'
    },
    {
      name: 'Invoice Generation',
      status: 'complete',
      description: 'Automated invoice creation',
      requirement: 'Service fully implemented'
    },
    {
      name: 'Blockchain Recording',
      status: 'complete',
      description: 'Immutable savings records',
      requirement: 'Smart contract deployed'
    },
    {
      name: 'Dispute Resolution',
      status: 'complete',
      description: 'Automated dispute handling',
      requirement: 'Service fully implemented'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'automated': return 'text-green-400 bg-green-400/10';
      case 'semi-automated': return 'text-yellow-400 bg-yellow-400/10';
      case 'manual': return 'text-red-400 bg-red-400/10';
      case 'complete': return 'text-green-400';
      case 'partial': return 'text-yellow-400';
      case 'missing': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const selectedClientData = selectedClient ? clients.find(c => c.id === selectedClient) : null;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Admin
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Client Automation Monitoring</h1>
              <p className="text-gray-400">
                Track automation status and identify manual processes across all clients
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {viewMode === 'overview' ? 'Detailed View' : 'Overview'}
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Automation Status Overview */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Critical Alert */}
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">No Fully Automated Clients</h3>
              <p className="text-gray-300 mb-3">
                All clients currently require manual intervention. Key missing components:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    No utility API connections (0/3 clients)
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    No Claude API for PDF processing
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    Manual baseline establishment
                  </li>
                </ul>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    No third-party verification
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    Manual invoice generation
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    Manual dispute resolution
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Automation Steps Status */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">System Automation Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {automationSteps.map((step, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white text-sm">{step.name}</h4>
                  {step.status === 'complete' ? (
                    <CheckCircle className={`w-5 h-5 ${getStatusColor(step.status)}`} />
                  ) : step.status === 'partial' ? (
                    <AlertTriangle className={`w-5 h-5 ${getStatusColor(step.status)}`} />
                  ) : (
                    <XCircle className={`w-5 h-5 ${getStatusColor(step.status)}`} />
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-2">{step.description}</p>
                {step.requirement && (
                  <p className="text-xs text-gray-500 italic">{step.requirement}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Client List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Client Status</h3>
            <div className="space-y-4">
              {clients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client.id)}
                  className={`bg-gray-900/50 rounded-xl p-6 border cursor-pointer transition-all duration-200 ${
                    selectedClient === client.id 
                      ? 'border-purple-500' 
                      : 'border-white/10 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{client.name}</h4>
                      <p className="text-sm text-gray-400">{client.facility}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                      {client.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Automation Level Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Automation Level</span>
                      <span className="text-sm text-white">{client.automationLevel}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          client.automationLevel > 70 ? 'bg-green-500' :
                          client.automationLevel > 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${client.automationLevel}%` }}
                      />
                    </div>
                  </div>

                  {/* Issues */}
                  <div className="space-y-2">
                    {client.issues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-gray-400">{issue}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800">
                    <div>
                      <p className="text-xs text-gray-400">Last Sync</p>
                      <p className="text-sm text-white">{new Date(client.lastSync).toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Savings (kWh)</p>
                      <p className="text-sm text-white">{client.savingsTracked.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Verification</p>
                      <p className={`text-sm ${
                        client.verificationStatus === 'verified' ? 'text-green-400' :
                        client.verificationStatus === 'pending' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {client.verificationStatus}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              {selectedClientData ? `${selectedClientData.name} Details` : 'Select a Client'}
            </h3>
            {selectedClientData ? (
              <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                <div className="space-y-6">
                  {/* Connection Status */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Connection Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400 flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          IoT Sensors
                        </span>
                        <span className="flex items-center gap-2 text-green-400">
                          <Wifi className="w-4 h-4" />
                          Connected
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Utility API
                        </span>
                        <span className="flex items-center gap-2 text-red-400">
                          <WifiOff className="w-4 h-4" />
                          Not Connected
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400 flex items-center gap-2">
                          <Bot className="w-4 h-4" />
                          Claude API
                        </span>
                        <span className="flex items-center gap-2 text-red-400">
                          <WifiOff className="w-4 h-4" />
                          Not Configured
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Manual Processes */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Manual Processes Required</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4 text-orange-400" />
                        Upload utility bills monthly
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4 text-orange-400" />
                        Enter baseline data manually
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4 text-orange-400" />
                        Calculate savings manually
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4 text-orange-400" />
                        Generate invoices manually
                      </li>
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Setup Utility API
                    </button>
                    <button className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                      Configure Claude API
                    </button>
                    <Link
                      href={`/admin/clients/${selectedClientData.id}`}
                      className="block w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-center"
                    >
                      View Full Details
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                <p className="text-gray-400 text-center">
                  Select a client to view detailed automation status
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Automation Roadmap */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-start gap-4">
            <Info className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Path to Full Automation</h3>
              <p className="text-gray-300 mb-4">
                To achieve fully automated energy savings verification and billing:
              </p>
              <ol className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">1.</span>
                  <span>Connect each client to their utility provider via Utility API</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">2.</span>
                  <span>Configure Claude API for intelligent PDF bill processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">3.</span>
                  <span>Enable automated baseline establishment from historical data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">4.</span>
                  <span>Activate third-party verification through utility data comparison</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">5.</span>
                  <span>Deploy automated invoice generation with verified savings</span>
                </li>
              </ol>
              <div className="mt-4">
                <Link
                  href="/integrations/utility-api"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Start Integration Setup
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}