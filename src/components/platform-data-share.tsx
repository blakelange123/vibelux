'use client';

import React, { useState } from 'react';
import { 
  Monitor, 
  Database, 
  BarChart3, 
  Settings, 
  Thermometer,
  Droplets,
  Zap,
  Leaf,
  Camera,
  FileText,
  Share,
  Eye,
  Lock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface PlatformModule {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'monitoring' | 'control' | 'analytics' | 'management';
  requiresPermission: boolean;
  dataTypes: string[];
  url: string;
}

const platformModules: PlatformModule[] = [
  {
    id: 'environmental-dashboard',
    name: 'Environmental Dashboard',
    description: 'Real-time environmental data and monitoring',
    icon: Monitor,
    category: 'monitoring',
    requiresPermission: false,
    dataTypes: ['Temperature', 'Humidity', 'CO2', 'Light levels'],
    url: '/dashboard/environmental'
  },
  {
    id: 'bms-control',
    name: 'Building Management System',
    description: 'HVAC and climate control interface',
    icon: Settings,
    category: 'control',
    requiresPermission: true,
    dataTypes: ['HVAC status', 'Temperature controls', 'Ventilation'],
    url: '/dashboard/bms'
  },
  {
    id: 'irrigation-system',
    name: 'Irrigation Management',
    description: 'Water and nutrient delivery systems',
    icon: Droplets,
    category: 'control',
    requiresPermission: true,
    dataTypes: ['Water flow', 'Nutrient levels', 'pH/EC readings'],
    url: '/dashboard/irrigation'
  },
  {
    id: 'lighting-control',
    name: 'Lighting Control',
    description: 'LED lighting schedules and spectrum control',
    icon: Zap,
    category: 'control',
    requiresPermission: true,
    dataTypes: ['Light schedules', 'Spectrum settings', 'Energy usage'],
    url: '/dashboard/lighting'
  },
  {
    id: 'crop-monitoring',
    name: 'Crop Health Monitoring',
    description: 'Plant health tracking and growth analytics',
    icon: Leaf,
    category: 'monitoring',
    requiresPermission: false,
    dataTypes: ['Growth metrics', 'Health scores', 'Yield predictions'],
    url: '/dashboard/crops'
  },
  {
    id: 'energy-analytics',
    name: 'Energy Analytics',
    description: 'Power consumption and efficiency tracking',
    icon: BarChart3,
    category: 'analytics',
    requiresPermission: false,
    dataTypes: ['Power usage', 'Efficiency metrics', 'Cost analysis'],
    url: '/dashboard/energy'
  },
  {
    id: 'visual-monitoring',
    name: 'Visual Monitoring',
    description: 'Camera feeds and visual inspection tools',
    icon: Camera,
    category: 'monitoring',
    requiresPermission: true,
    dataTypes: ['Camera feeds', 'Time-lapse', 'Visual alerts'],
    url: '/dashboard/visual'
  },
  {
    id: 'data-analytics',
    name: 'Data Analytics',
    description: 'Historical data analysis and reporting',
    icon: Database,
    category: 'analytics',
    requiresPermission: false,
    dataTypes: ['Historical trends', 'Performance reports', 'Insights'],
    url: '/dashboard/analytics'
  },
  {
    id: 'compliance-reports',
    name: 'Compliance & Reporting',
    description: 'Regulatory compliance and documentation',
    icon: FileText,
    category: 'management',
    requiresPermission: false,
    dataTypes: ['Compliance logs', 'Audit trails', 'Reports'],
    url: '/dashboard/compliance'
  }
];

interface PlatformDataShareProps {
  consultationId: string;
  isExpert: boolean;
  onShareData: (moduleId: string, shareType: 'view' | 'control') => void;
}

export default function PlatformDataShare({ 
  consultationId, 
  isExpert, 
  onShareData 
}: PlatformDataShareProps) {
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [shareType, setShareType] = useState<'view' | 'control'>('view');
  const [isSharing, setIsSharing] = useState(false);

  const handleModuleToggle = (moduleId: string) => {
    const newSelected = new Set(selectedModules);
    if (newSelected.has(moduleId)) {
      newSelected.delete(moduleId);
    } else {
      newSelected.add(moduleId);
    }
    setSelectedModules(newSelected);
  };

  const handleShareSelected = async () => {
    if (selectedModules.size === 0) return;

    setIsSharing(true);
    try {
      for (const moduleId of selectedModules) {
        await onShareData(moduleId, shareType);
      }
      setSelectedModules(new Set());
    } catch (error) {
      console.error('Error sharing platform data:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'monitoring': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'control': return 'bg-red-100 text-red-800 border-red-200';
      case 'analytics': return 'bg-green-100 text-green-800 border-green-200';
      case 'management': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isExpert) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Platform data sharing is only available for experts during consultations.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Share className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Share Platform Data</h3>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          Share specific platform modules with your client during the consultation. 
          You can grant view-only access or limited control permissions.
        </p>

        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium text-gray-700">Share Type:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setShareType('view')}
              className={`px-3 py-1 text-sm rounded-md border ${
                shareType === 'view'
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-1" />
              View Only
            </button>
            <button
              onClick={() => setShareType('control')}
              className={`px-3 py-1 text-sm rounded-md border ${
                shareType === 'control'
                  ? 'bg-orange-100 text-orange-800 border-orange-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-1" />
              Limited Control
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {platformModules.map((module) => {
          const Icon = module.icon;
          const isSelected = selectedModules.has(module.id);
          const canControl = !module.requiresPermission || shareType === 'view';

          return (
            <div
              key={module.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } ${!canControl && shareType === 'control' ? 'opacity-50' : ''}`}
              onClick={() => canControl && handleModuleToggle(module.id)}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 flex-shrink-0 ${
                  isSelected ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-medium ${
                      isSelected ? 'text-indigo-900' : 'text-gray-900'
                    }`}>
                      {module.name}
                    </h4>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2">{module.description}</p>
                  
                  <div className={`inline-flex items-center px-2 py-1 text-xs rounded-md border ${
                    getCategoryColor(module.category)
                  }`}>
                    {module.category}
                  </div>

                  {module.requiresPermission && shareType === 'control' && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                      <AlertCircle className="w-3 h-3" />
                      <span>Requires permission</span>
                    </div>
                  )}

                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Data includes:</p>
                    <div className="flex flex-wrap gap-1">
                      {module.dataTypes.slice(0, 2).map((dataType) => (
                        <span
                          key={dataType}
                          className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded"
                        >
                          {dataType}
                        </span>
                      ))}
                      {module.dataTypes.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{module.dataTypes.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedModules.size > 0 && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedModules.size} module{selectedModules.size !== 1 ? 's' : ''} selected
              {shareType === 'control' && (
                <span className="text-orange-600 ml-2">
                  (with limited control access)
                </span>
              )}
            </div>
            <button
              onClick={handleShareSelected}
              disabled={isSharing}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSharing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share className="w-4 h-4" />
                  Share Selected
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Platform Data Sharing Notes:</p>
            <ul className="text-xs space-y-1">
              <li>• Shared access is automatically revoked when the consultation ends</li>
              <li>• All client interactions with shared modules are logged for security</li>
              <li>• You can revoke access to any module at any time during the consultation</li>
              <li>• Screen sharing is still available as an alternative to direct access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}