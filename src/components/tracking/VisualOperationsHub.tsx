'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Camera, Wrench, AlertTriangle, CheckCircle, Clock, MapPin, Loader,
  Bug, Zap, Droplets, Thermometer, Shield, Package, Eye, Target,
  Send, X, Info, Plus, QrCode, Lightbulb, Wind, ChevronRight,
  Activity, Building, Users, ClipboardCheck, Leaf, ThermometerSun
} from 'lucide-react';
import { RealtimeTracker } from '@/lib/realtime-tracker';
import { IPMPhotoScout } from '@/lib/ipm-photo-scouting';
import { VisualMaintenanceSystem } from '@/lib/equipment-diagnostics';

interface VisualOperationsHubProps {
  tracker: RealtimeTracker;
  facilityId: string;
}

type ReportType = 
  | 'ipm' 
  | 'maintenance' 
  | 'safety' 
  | 'quality' 
  | 'inventory' 
  | 'environmental' 
  | 'task_completion'
  | 'compliance';

interface QuickAction {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  urgent?: boolean;
}

export function VisualOperationsHub({ tracker, facilityId }: VisualOperationsHubProps) {
  const { user } = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [roomZone, setRoomZone] = useState('');
  const [description, setDescription] = useState('');
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'quick' | 'full'>('quick');

  const ipmScout = useRef<IPMPhotoScout | null>(null);
  const maintenanceSystem = useRef<VisualMaintenanceSystem | null>(null);

  useEffect(() => {
    if (user) {
      ipmScout.current = new IPMPhotoScout(user.id, facilityId, tracker);
      maintenanceSystem.current = new VisualMaintenanceSystem(user.id, facilityId, tracker);
      
      // Set up event listeners
      ipmScout.current.onAlert((alert) => {
        setActiveAlerts(prev => [alert, ...prev.slice(0, 4)]);
      });

      maintenanceSystem.current.onAlert((alert) => {
        setActiveAlerts(prev => [alert, ...prev.slice(0, 4)]);
      });
    }
  }, [user, facilityId, tracker]);

  const quickActions: QuickAction[] = [
    {
      id: 'pest_disease',
      type: 'ipm',
      title: 'Pest/Disease',
      description: 'Report plant health issues',
      icon: <Bug className="w-6 h-6" />,
      color: 'bg-red-500 text-white',
      urgent: true
    },
    {
      id: 'equipment_issue',
      type: 'maintenance',
      title: 'Equipment Issue',
      description: 'Report broken or malfunctioning equipment',
      icon: <Wrench className="w-6 h-6" />,
      color: 'bg-orange-500 text-white'
    },
    {
      id: 'safety_hazard',
      type: 'safety',
      title: 'Safety Hazard',
      description: 'Report unsafe conditions',
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-red-600 text-white',
      urgent: true
    },
    {
      id: 'light_out',
      type: 'maintenance',
      title: 'Light Out',
      description: 'Burned out or flickering lights',
      icon: <Lightbulb className="w-6 h-6" />,
      color: 'bg-yellow-500 text-white'
    },
    {
      id: 'hvac_issue',
      type: 'environmental',
      title: 'HVAC Issue',
      description: 'Temperature or airflow problems',
      icon: <Wind className="w-6 h-6" />,
      color: 'bg-blue-500 text-white'
    },
    {
      id: 'water_leak',
      type: 'maintenance',
      title: 'Water Leak',
      description: 'Irrigation or plumbing leaks',
      icon: <Droplets className="w-6 h-6" />,
      color: 'bg-cyan-500 text-white',
      urgent: true
    },
    {
      id: 'electrical',
      type: 'safety',
      title: 'Electrical Issue',
      description: 'Wiring, outlets, or power problems',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-purple-500 text-white',
      urgent: true
    },
    {
      id: 'inventory_low',
      type: 'inventory',
      title: 'Low Inventory',
      description: 'Supplies or materials running low',
      icon: <Package className="w-6 h-6" />,
      color: 'bg-green-500 text-white'
    },
    {
      id: 'quality_issue',
      type: 'quality',
      title: 'Quality Issue',
      description: 'Product quality or compliance concerns',
      icon: <Eye className="w-6 h-6" />,
      color: 'bg-indigo-500 text-white'
    },
    {
      id: 'task_done',
      type: 'task_completion',
      title: 'Task Complete',
      description: 'Document completed work',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-600 text-white'
    },
    {
      id: 'qr_asset',
      type: 'inventory',
      title: 'Scan Asset',
      description: 'QR code asset check-in/out',
      icon: <QrCode className="w-6 h-6" />,
      color: 'bg-gray-600 text-white'
    },
    {
      id: 'environmental',
      type: 'environmental',
      title: 'Environmental',
      description: 'Temperature/humidity issues',
      icon: <ThermometerSun className="w-6 h-6" />,
      color: 'bg-amber-500 text-white'
    },
    {
      id: 'plant_health',
      type: 'quality',
      title: 'Plant Health',
      description: 'Document plant conditions',
      icon: <Leaf className="w-6 h-6" />,
      color: 'bg-green-600 text-white'
    },
    {
      id: 'compliance',
      type: 'compliance',
      title: 'Compliance',
      description: 'Documentation for audits',
      icon: <ClipboardCheck className="w-6 h-6" />,
      color: 'bg-purple-500 text-white'
    },
    {
      id: 'cleaning_needed',
      type: 'maintenance',
      title: 'Cleaning',
      description: 'Areas needing cleaning',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-yellow-600 text-white'
    },
    {
      id: 'training_needed',
      type: 'compliance',
      title: 'Training Issue',
      description: 'Report training needs',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-orange-600 text-white'
    }
  ];

  const handleQuickAction = async (action: QuickAction) => {
    if (!roomZone.trim()) {
      alert('Please enter the room/zone location first');
      return;
    }

    setSelectedType(action.type);
    setIsCapturing(true);

    try {
      switch (action.id) {
        case 'pest_disease':
          if (ipmScout.current) {
            await ipmScout.current.captureIPMPhoto('vegetative', roomZone, description);
          }
          break;
          
        case 'light_out':
        case 'hvac_issue':
        case 'water_leak':
        case 'equipment_issue':
          if (maintenanceSystem.current) {
            await maintenanceSystem.current.quickReport(action.id, roomZone);
          }
          break;

        case 'safety_hazard':
        case 'electrical':
          if (maintenanceSystem.current) {
            await maintenanceSystem.current.reportEquipmentIssue(
              'other',
              'safety',
              roomZone,
              description || action.description
            );
          }
          break;

        case 'task_done':
          await handleTaskCompletion();
          break;

        case 'inventory_low':
          await handleInventoryReport();
          break;

        case 'quality_issue':
          await handleQualityReport();
          break;

        default:
          await handleCustomReport(action);
      }

      // Add to recent reports
      setRecentReports(prev => [{
        id: Date.now().toString(),
        type: action.type,
        title: action.title,
        roomZone,
        description,
        timestamp: new Date(),
        status: 'analyzing'
      }, ...prev.slice(0, 9)]);

      // Clear form
      setDescription('');
      
    } catch (error) {
      console.error('Failed to create report:', error);
      alert('Failed to create report. Please try again.');
    } finally {
      setIsCapturing(false);
      setSelectedType(null);
    }
  };

  const handleTaskCompletion = async () => {
    // Take before/after photos for task completion
    await fetch('/api/tasks/complete-with-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facilityId,
        roomZone,
        description,
        completedBy: user?.id,
        location: await getCurrentLocation()
      })
    });
  };

  const handleInventoryReport = async () => {
    // Report inventory levels with photo documentation
    await fetch('/api/inventory/photo-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facilityId,
        roomZone,
        reportType: 'low_stock',
        description,
        reportedBy: user?.id,
        location: await getCurrentLocation()
      })
    });
  };

  const handleQualityReport = async () => {
    // Report quality issues with photo evidence
    await fetch('/api/quality/photo-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facilityId,
        roomZone,
        issueType: 'quality_concern',
        description,
        reportedBy: user?.id,
        location: await getCurrentLocation()
      })
    });
  };

  const handleCustomReport = async (action: QuickAction) => {
    // Generic photo report for any other issues
    await fetch('/api/reports/photo-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facilityId,
        reportType: action.id,
        category: action.type,
        title: action.title,
        roomZone,
        description: description || action.description,
        reportedBy: user?.id,
        location: await getCurrentLocation()
      })
    });
  };

  const getCurrentLocation = async () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }),
        reject
      );
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all transform hover:scale-110 z-40"
      >
        <Camera className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 sm:items-center">
      <div className="bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 rounded-t-2xl sm:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-6 h-6 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Visual Operations</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Report issues instantly with AI-powered photo analysis
          </p>
        </div>

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div className="p-4 border-b border-gray-700 bg-red-900/20">
            <h3 className="font-medium text-red-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Active Alerts ({activeAlerts.length})
            </h3>
            <div className="space-y-2">
              {activeAlerts.slice(0, 2).map((alert, index) => (
                <div key={index} className="bg-red-900/30 border border-red-800/50 rounded-lg p-3">
                  <div className="font-medium text-red-300">{alert.title}</div>
                  <div className="text-sm text-red-400">{alert.roomZone || alert.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('quick')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                viewMode === 'quick' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Quick Report
            </button>
            <button
              onClick={() => setViewMode('full')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                viewMode === 'full' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Full Camera Mode
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'quick' ? (
            <>
              {/* Location Input */}
              <div className="p-4 border-b border-gray-700">
                <label className="block font-medium text-gray-300 mb-2">Current Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={roomZone}
                    onChange={(e) => setRoomZone(e.target.value)}
                    placeholder="e.g., Veg Room A, Flower 3, Main Hallway"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="p-4">
                <h3 className="font-medium text-white mb-3">Select Issue Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.slice(0, 8).map((action) => (
                    <button
                      key={action.id}
                      onClick={() => {
                        if (!roomZone.trim()) {
                          alert('Please enter the room/zone location first');
                          return;
                        }
                        router.push(`/tracking/visual-ops/capture?type=${action.id}&facility=${facilityId}&user=${user?.id || 'anonymous'}`);
                      }}
                      disabled={isCapturing || !roomZone.trim()}
                      className={`${action.color} p-4 rounded-lg text-left hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed relative group`}
                    >
                      {action.urgent && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        {action.icon}
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="font-medium text-sm">{action.title}</span>
                    </button>
                  ))}
                </div>
                
                {/* More Options */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {quickActions.slice(8).map((action) => (
                    <button
                      key={action.id}
                      onClick={() => {
                        if (!roomZone.trim()) {
                          alert('Please enter the room/zone location first');
                          return;
                        }
                        router.push(`/tracking/visual-ops/capture?type=${action.id}&facility=${facilityId}&user=${user?.id || 'anonymous'}`);
                      }}
                      disabled={isCapturing || !roomZone.trim()}
                      className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-3 rounded-lg text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`${action.color} p-2 rounded`}>
                          {action.icon}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-white text-sm">{action.title}</span>
                          <p className="text-xs text-gray-400 mt-0.5">{action.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Full Camera Mode */
            <div className="p-4">
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <Camera className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Full Camera Mode</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Advanced photo capture with annotations, multiple photos, and detailed reporting
                </p>
                <button
                  onClick={() => {
                    router.push(`/tracking/visual-ops/capture?type=custom_issue&facility=${facilityId}&user=${user?.id || 'anonymous'}&mode=advanced`);
                  }}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Open Camera
                </button>
              </div>
            </div>
          )}
        </div>


        {/* Recent Reports */}
        {recentReports.length > 0 && (
          <div className="p-4 border-t border-gray-700">
            <h3 className="font-medium text-white mb-3">Recent Reports</h3>
            <div className="space-y-2">
              {recentReports.slice(0, 3).map((report) => (
                <div key={report.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{report.title}</div>
                      <div className="text-sm text-gray-400">
                        {report.roomZone} • {report.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className={`text-sm px-2 py-1 rounded ${
                      report.status === 'analyzing' ? 'bg-blue-900/50 text-blue-400' :
                      report.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                      'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {report.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <h3 className="font-medium text-white mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400" />
            Quick Tips
          </h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li className="flex items-start gap-2">
              <Activity className="w-3 h-3 text-green-400 mt-0.5" />
              <span>AI analyzes photos in 30 seconds</span>
            </li>
            <li className="flex items-start gap-2">
              <Camera className="w-3 h-3 text-blue-400 mt-0.5" />
              <span>Take multiple angles for better analysis</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-3 h-3 text-purple-400 mt-0.5" />
              <span>Location is auto-tagged with GPS</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}