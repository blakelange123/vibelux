'use client';

import React, { useState, useEffect } from 'react';
import {
  QrCode, Package, MapPin, Activity, Users, Shield,
  Download, Upload, Printer, Eye, Settings, AlertTriangle,
  CheckCircle, Clock, TrendingUp, BarChart3, Navigation, Radio
} from 'lucide-react';
import { QRCodeGenerator, QRCodeData } from '@/lib/qr-code-generator';
import { BLEMeshTracker } from '@/lib/ble-mesh-tracker';
import { RealtimeTrackingMap } from './RealtimeTrackingMap';

interface AssetTrackingDashboardProps {
  facilityId: string;
}

export function AssetTrackingDashboard({ facilityId }: AssetTrackingDashboardProps) {
  const [activeTab, setActiveTab] = useState<'qr' | 'tracking' | 'workers' | 'analytics' | 'realtime'>('qr');
  const [qrGenerator] = useState(() => new QRCodeGenerator());
  const [bleTracker] = useState(() => new BLEMeshTracker(facilityId));
  const [generatedQRs, setGeneratedQRs] = useState<Array<{ qrCode: string; data: QRCodeData }>>([]);
  const [selectedQRType, setSelectedQRType] = useState<QRCodeData['type']>('container');
  const [isGenerating, setIsGenerating] = useState(false);

  // QR Code generation form state
  const [qrFormData, setQrFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    quantity: 1
  });

  // Worker tracking state
  const [workers, setWorkers] = useState<Array<{
    id: string;
    name: string;
    role: string;
    currentZone: string;
    lastSeen: Date;
    status: 'active' | 'inactive' | 'break';
    safetyScore: number;
  }>>([]);

  // Asset tracking state
  const [trackedAssets, setTrackedAssets] = useState<Array<{
    id: string;
    name: string;
    type: string;
    location: string;
    lastMovement: Date;
    status: 'stationary' | 'in-transit' | 'maintenance';
  }>>([]);

  const handleGenerateQR = async () => {
    setIsGenerating(true);
    try {
      if (qrFormData.quantity > 1) {
        // Batch generation
        const batch = await qrGenerator.generateBatchQR(
          qrFormData.quantity,
          selectedQRType,
          facilityId,
          {
            name: qrFormData.name,
            description: qrFormData.description,
            category: qrFormData.category,
            locationId: qrFormData.location
          }
        );
        setGeneratedQRs([...generatedQRs, ...batch]);
      } else {
        // Single generation
        let result;
        const metadata = {
          name: qrFormData.name,
          description: qrFormData.description,
          category: qrFormData.category,
          locationId: qrFormData.location
        };

        switch (selectedQRType) {
          case 'container':
            result = await qrGenerator.generateContainerQR(
              `CNT-${Date.now()}`,
              facilityId,
              metadata
            );
            break;
          case 'inventory':
            result = await qrGenerator.generateInventoryQR(
              `INV-${Date.now()}`,
              facilityId,
              metadata
            );
            break;
          case 'asset':
            result = await qrGenerator.generateAssetQR(
              `AST-${Date.now()}`,
              facilityId,
              metadata
            );
            break;
          case 'location':
            result = await qrGenerator.generateLocationQR(
              `LOC-${Date.now()}`,
              facilityId,
              metadata
            );
            break;
        }

        if (result) {
          setGeneratedQRs([...generatedQRs, result]);
        }
      }

      // Reset form
      setQrFormData({
        name: '',
        description: '',
        category: '',
        location: '',
        quantity: 1
      });
    } catch (error) {
      console.error('QR generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = (qrCode: string, filename: string) => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQRCodes = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Codes</title>
            <style>
              body { margin: 0; padding: 20px; }
              .qr-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
              .qr-item { text-align: center; break-inside: avoid; }
              .qr-item img { width: 150px; height: 150px; }
              .qr-item p { margin: 5px 0; font-size: 12px; }
              @media print {
                body { margin: 0; }
                .qr-grid { grid-template-columns: repeat(4, 1fr); }
              }
            </style>
          </head>
          <body>
            <div class="qr-grid">
              ${generatedQRs.map(({ qrCode, data }) => `
                <div class="qr-item">
                  <img src="${qrCode}" alt="${data.metadata.name}" />
                  <p><strong>${data.metadata.name}</strong></p>
                  <p>${data.type} - ${data.id}</p>
                </div>
              `).join('')}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Asset & Labor Tracking System</h1>
          <p className="text-gray-400">QR code generation and BLE mesh tracking for containers, inventory, and workers</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'qr' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code Generator
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('tracking')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'tracking' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Asset Tracking
            </div>
          </button>

          <button
            onClick={() => setActiveTab('workers')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'workers' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Worker Tracking
            </div>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'analytics' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics
            </div>
          </button>

          <button
            onClick={() => setActiveTab('realtime')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'realtime' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5" />
              Real-Time
            </div>
          </button>
        </div>

        {/* QR Code Generator Tab */}
        {activeTab === 'qr' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Generation Form */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-6">Generate QR Codes</h2>
              
              {/* QR Type Selection */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">QR Code Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['container', 'inventory', 'asset', 'location'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedQRType(type)}
                      className={`p-3 rounded-lg border capitalize transition-all ${
                        selectedQRType === type
                          ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                          : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={qrFormData.name}
                    onChange={(e) => setQrFormData({ ...qrFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                    placeholder={`${selectedQRType} name`}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={qrFormData.description}
                    onChange={(e) => setQrFormData({ ...qrFormData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                    rows={2}
                    placeholder="Optional description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Category</label>
                    <input
                      type="text"
                      value={qrFormData.category}
                      onChange={(e) => setQrFormData({ ...qrFormData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                      placeholder="Category"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Location</label>
                    <input
                      type="text"
                      value={qrFormData.location}
                      onChange={(e) => setQrFormData({ ...qrFormData, location: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                      placeholder="Location ID"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={qrFormData.quantity}
                    onChange={(e) => setQrFormData({ ...qrFormData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Generate multiple QR codes at once (max 100)</p>
                </div>
              </div>

              <button
                onClick={handleGenerateQR}
                disabled={!qrFormData.name || isGenerating}
                className="w-full mt-6 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    Generate QR Code{qrFormData.quantity > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>

            {/* Generated QR Codes */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Generated QR Codes</h2>
                {generatedQRs.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={printQRCodes}
                      className="px-3 py-1.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-1 text-sm"
                    >
                      <Printer className="w-4 h-4" />
                      Print All
                    </button>
                    <button
                      onClick={() => setGeneratedQRs([])}
                      className="px-3 py-1.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {generatedQRs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <QrCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No QR codes generated yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                  {generatedQRs.map(({ qrCode, data }, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4">
                      <img
                        src={qrCode}
                        alt={data.metadata.name}
                        className="w-full h-32 object-contain mb-3"
                      />
                      <h3 className="font-medium text-sm mb-1">{data.metadata.name}</h3>
                      <p className="text-xs text-gray-400 mb-2">
                        {data.type} • {data.id}
                      </p>
                      <button
                        onClick={() => downloadQRCode(qrCode, `qr-${data.type}-${data.id}.png`)}
                        className="w-full px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Asset Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Real-time Asset Map */}
            <div className="lg:col-span-2 bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Real-time Asset Location
              </h2>
              
              <div className="bg-gray-800 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Navigation className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Live tracking map visualization</p>
                  <p className="text-sm mt-2">Integrates with BLE mesh network</p>
                </div>
              </div>

              {/* Asset List */}
              <div className="mt-6">
                <h3 className="font-medium mb-3">Tracked Assets</h3>
                <div className="space-y-2">
                  {[
                    { id: 'CNT-001', name: 'Container A1', location: 'Zone 1', status: 'stationary' },
                    { id: 'CNT-002', name: 'Container B2', location: 'Loading Bay', status: 'in-transit' },
                    { id: 'INV-101', name: 'Nutrient Tank #1', location: 'Storage', status: 'stationary' }
                  ].map((asset) => (
                    <div key={asset.id} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-sm text-gray-400">{asset.id} • {asset.location}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        asset.status === 'in-transit' 
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {asset.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Asset Analytics */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-6">Asset Analytics</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Total Assets</span>
                    <span className="text-2xl font-bold">247</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="text-green-400">+12</span> this week
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Active Movements</span>
                    <span className="text-2xl font-bold">18</span>
                  </div>
                  <Activity className="w-8 h-8 text-blue-400 mx-auto mt-2" />
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Utilization Rate</span>
                    <span className="text-2xl font-bold">87%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Asset Distribution</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Containers</span>
                      <span>142</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Equipment</span>
                      <span>67</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Inventory</span>
                      <span>38</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Worker Tracking Tab */}
        {activeTab === 'workers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Worker Safety Dashboard */}
            <div className="lg:col-span-2 bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Worker Safety & Location
              </h2>
              
              {/* Zone Overview */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold">32</p>
                  <p className="text-sm text-gray-400">Active Workers</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-sm text-gray-400">Safety Compliance</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-gray-400">Active Alerts</p>
                </div>
              </div>

              {/* Worker List */}
              <div>
                <h3 className="font-medium mb-3">Worker Locations</h3>
                <div className="space-y-2">
                  {[
                    { name: 'John Smith', role: 'Operator', zone: 'Production Floor', status: 'active', safety: 95 },
                    { name: 'Sarah Johnson', role: 'Supervisor', zone: 'Control Room', status: 'active', safety: 100 },
                    { name: 'Mike Chen', role: 'Technician', zone: 'Maintenance Bay', status: 'active', safety: 92 },
                    { name: 'Emily Davis', role: 'QA Inspector', zone: 'Quality Lab', status: 'break', safety: 98 }
                  ].map((worker, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${
                          worker.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                        }`}></div>
                        <div>
                          <p className="font-medium">{worker.name}</p>
                          <p className="text-sm text-gray-400">{worker.role} • {worker.zone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">Safety Score</p>
                          <p className={`text-lg font-bold ${
                            worker.safety >= 95 ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {worker.safety}%
                          </p>
                        </div>
                        <button className="px-3 py-1.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BLE Mesh Configuration */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                BLE Mesh Network
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Network Status</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-green-400">Connected</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">12 gateways • 47 nodes</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Atrius Integration</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Enable Atrius Navigator</span>
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    Advanced indoor positioning and analytics
                  </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Tracking Settings</h4>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Update Interval</span>
                      <select className="bg-gray-700 rounded px-2 py-1 text-sm">
                        <option>5 seconds</option>
                        <option>10 seconds</option>
                        <option>30 seconds</option>
                      </select>
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Accuracy Mode</span>
                      <select className="bg-gray-700 rounded px-2 py-1 text-sm">
                        <option>High Precision</option>
                        <option>Balanced</option>
                        <option>Power Saving</option>
                      </select>
                    </label>
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Configure Edge Computing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Movement Patterns */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-6">Movement Analytics</h2>
              
              <div className="bg-gray-800 rounded-lg h-64 flex items-center justify-center mb-6">
                <div className="text-center text-gray-400">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Movement heatmap visualization</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Avg. Transit Time</p>
                  <p className="text-xl font-bold">4.2 min</p>
                  <p className="text-xs text-green-400">-15% vs last week</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Bottlenecks</p>
                  <p className="text-xl font-bold">3</p>
                  <p className="text-xs text-yellow-400">Loading Bay, Zone 2</p>
                </div>
              </div>
            </div>

            {/* Productivity Metrics */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-6">Productivity Insights</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Zone Efficiency</h4>
                  <div className="space-y-2">
                    {[
                      { zone: 'Production Floor', efficiency: 92 },
                      { zone: 'Packaging Area', efficiency: 87 },
                      { zone: 'Storage Zone', efficiency: 95 },
                      { zone: 'Loading Bay', efficiency: 78 }
                    ].map((zone) => (
                      <div key={zone.zone}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{zone.zone}</span>
                          <span>{zone.efficiency}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              zone.efficiency >= 90 ? 'bg-green-500' :
                              zone.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${zone.efficiency}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Labor Utilization</h4>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-400">82%</p>
                    <p className="text-sm text-gray-400 mt-1">Average utilization rate</p>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-400">Productive</p>
                      <p className="font-bold">74%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Transit</p>
                      <p className="font-bold">8%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Idle</p>
                      <p className="font-bold">18%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-Time Tracking Tab */}
        {activeTab === 'realtime' && (
          <RealtimeTrackingMap
            userId={`user-${Date.now()}`} // In real app, get from auth context
            facilityId={facilityId}
            isAdmin={true}
          />
        )}
      </div>
    </div>
  );
}