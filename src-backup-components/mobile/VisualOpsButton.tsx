'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera, Bug, Wrench, Shield, Eye, Package, Zap,
  ThermometerSun, Droplets, Leaf, AlertTriangle, Users,
  ClipboardCheck, X, ChevronRight, MapPin, Activity,
  Sparkles, Clock, CheckCircle
} from 'lucide-react';

interface VisualOpsButtonProps {
  facilityId: string;
  userId: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  compact?: boolean;
}

interface ReportType {
  id: string;
  title: string;
  icon: any;
  color: string;
  description: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  aiCapability?: string;
}

const reportTypes: ReportType[] = [
  {
    id: 'pest_disease',
    title: 'Pest/Disease',
    icon: Bug,
    color: 'from-red-500 to-red-600',
    description: 'Identify pests or plant diseases',
    urgency: 'high',
    aiCapability: 'AI identifies pest type & treatment'
  },
  {
    id: 'equipment_issue',
    title: 'Equipment',
    icon: Wrench,
    color: 'from-orange-500 to-orange-600',
    description: 'Report broken equipment',
    urgency: 'medium',
    aiCapability: 'Estimates repair cost & urgency'
  },
  {
    id: 'safety_hazard',
    title: 'Safety',
    icon: Shield,
    color: 'from-red-600 to-red-700',
    description: 'Report safety hazards',
    urgency: 'critical',
    aiCapability: 'OSHA compliance check'
  },
  {
    id: 'quality_issue',
    title: 'Quality',
    icon: Eye,
    color: 'from-indigo-500 to-indigo-600',
    description: 'Document quality issues',
    urgency: 'medium',
    aiCapability: 'Defect analysis & batch tracking'
  },
  {
    id: 'inventory_count',
    title: 'Inventory',
    icon: Package,
    color: 'from-green-500 to-green-600',
    description: 'Count stock levels',
    urgency: 'low',
    aiCapability: 'Auto-count & expiry detection'
  },
  {
    id: 'electrical_issue',
    title: 'Electrical',
    icon: Zap,
    color: 'from-yellow-500 to-yellow-600',
    description: 'Electrical hazards',
    urgency: 'critical',
    aiCapability: 'Fire risk assessment'
  },
  {
    id: 'environmental',
    title: 'Environment',
    icon: ThermometerSun,
    color: 'from-blue-500 to-blue-600',
    description: 'HVAC & climate issues',
    urgency: 'medium',
    aiCapability: 'Energy efficiency analysis'
  },
  {
    id: 'water_leak',
    title: 'Water/Leak',
    icon: Droplets,
    color: 'from-cyan-500 to-cyan-600',
    description: 'Report leaks',
    urgency: 'high',
    aiCapability: 'Damage assessment'
  },
  {
    id: 'plant_health',
    title: 'Plant Health',
    icon: Leaf,
    color: 'from-green-600 to-green-700',
    description: 'Monitor plant conditions',
    urgency: 'low',
    aiCapability: 'Yield prediction'
  },
  {
    id: 'compliance',
    title: 'Compliance',
    icon: ClipboardCheck,
    color: 'from-purple-500 to-purple-600',
    description: 'Audit documentation',
    urgency: 'low',
    aiCapability: 'Auto-compliance verification'
  },
  {
    id: 'cleaning_needed',
    title: 'Cleaning',
    icon: AlertTriangle,
    color: 'from-yellow-600 to-yellow-700',
    description: 'Areas need cleaning',
    urgency: 'medium',
    aiCapability: 'Contamination risk analysis'
  },
  {
    id: 'training_needed',
    title: 'Training',
    icon: Users,
    color: 'from-orange-600 to-orange-700',
    description: 'Report training gaps',
    urgency: 'low',
    aiCapability: 'Training recommendation'
  }
];

export default function VisualOpsButton({
  facilityId,
  userId,
  position = 'bottom-right',
  compact = false
}: VisualOpsButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [recentActivity, setRecentActivity] = useState<number>(0);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    // Simulate recent activity
    const interval = setInterval(() => {
      setRecentActivity(prev => prev + Math.floor(Math.random() * 3));
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 3000);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const positionClasses = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4'
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleReportSelect = (reportType: ReportType) => {
    if (!selectedLocation) {
      alert('Please select a location first');
      return;
    }
    
    router.push(`/tracking/visual-ops/capture?type=${reportType.id}&facility=${facilityId}&user=${userId}&location=${encodeURIComponent(selectedLocation)}`);
    setIsOpen(false);
  };

  const commonLocations = [
    'Veg Room 1', 'Veg Room 2', 'Flower Room 1', 'Flower Room 2',
    'Dry Room', 'Processing', 'Storage', 'Mechanical Room',
    'Main Hallway', 'Loading Dock'
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClasses[position]} z-40 group`}
      >
        <div className="relative">
          {showPulse && (
            <div className="absolute inset-0 bg-purple-600 rounded-full animate-ping opacity-75" />
          )}
          <div className={`bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all ${
            compact ? 'p-3' : 'p-4'
          }`}>
            <Camera className={compact ? 'w-5 h-5' : 'w-6 h-6'} />
          </div>
          {recentActivity > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {recentActivity}
            </div>
          )}
        </div>
        <div className="absolute bottom-full mb-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
            Visual Operations • Report Issues
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-gray-900 w-full sm:max-w-md max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Visual Operations</h2>
                <p className="text-sm text-purple-200">AI-Powered Issue Reporting</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* AI Features Banner */}
        <div className="bg-purple-900/30 border-b border-purple-800/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <p className="text-sm text-purple-300">
              AI analyzes photos in 30 seconds • 94% accuracy
            </p>
          </div>
        </div>

        {/* Location Selection */}
        <div className="p-4 border-b border-gray-800">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Location *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white appearance-none focus:border-purple-500 focus:outline-none"
            >
              <option value="">Choose location...</option>
              {commonLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Report Types Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">What do you want to report?</h3>
          <div className="grid grid-cols-2 gap-3">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => handleReportSelect(type)}
                  disabled={!selectedLocation}
                  className={`relative bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedLocation ? 'hover:border-purple-500' : ''
                  }`}
                >
                  {type.urgency && ['critical', 'high'].includes(type.urgency) && (
                    <div className={`absolute top-2 right-2 w-2 h-2 ${getUrgencyColor(type.urgency)} rounded-full`} />
                  )}
                  
                  <div className={`bg-gradient-to-r ${type.color} p-2 rounded-lg w-fit mb-2`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <h4 className="font-medium text-white text-sm mb-0.5">{type.title}</h4>
                  <p className="text-xs text-gray-400 line-clamp-1">{type.description}</p>
                  
                  {type.aiCapability && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Activity className="w-3 h-3" />
                      <span className="line-clamp-1">{type.aiCapability}</span>
                    </div>
                  )}
                  
                  <ChevronRight className={`absolute bottom-4 right-3 w-4 h-4 text-gray-600 transition-transform ${
                    selectedLocation ? 'group-hover:translate-x-1 group-hover:text-purple-400' : ''
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="border-t border-gray-800 p-4 bg-gray-800/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Avg response: 12 min</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <CheckCircle className="w-4 h-4" />
                <span>342 issues resolved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}