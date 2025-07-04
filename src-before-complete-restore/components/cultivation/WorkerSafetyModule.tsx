'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  Eye,
  Thermometer,
  Clock,
  Users,
  Map,
  FileText,
  Sun,
  HardHat,
  Activity,
  CheckCircle,
  XCircle,
  Info,
  Download,
  Settings,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useDesigner } from '../designer/context/DesignerContext';

interface SafetyZone {
  id: string;
  type: 'uv-high' | 'heat-stress' | 'high-intensity' | 'restricted' | 'ppe-required';
  severity: 'low' | 'medium' | 'high' | 'critical';
  coordinates: { x: number; y: number; width: number; height: number };
  requirements: string[];
  exposureLimit?: number; // minutes
}

interface MaintenanceAccess {
  fixtureId: string;
  accessScore: number; // 0-100
  issues: string[];
  recommendations: string[];
}

interface WorkerExposure {
  workerId: string;
  name: string;
  role: string;
  dailyUVDose: number; // J/m²
  heatExposure: number; // °C-hours
  ppe: string[];
  lastTraining: Date;
}

export function WorkerSafetyModule() {
  const { state } = useDesigner();
  const [safetyZones, setSafetyZones] = useState<SafetyZone[]>([]);
  const [maintenanceScores, setMaintenanceScores] = useState<MaintenanceAccess[]>([]);
  const [workerExposures, setWorkerExposures] = useState<WorkerExposure[]>([]);
  const [selectedView, setSelectedView] = useState<'zones' | 'maintenance' | 'exposure' | 'compliance'>('zones');
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [ppeRequirements, setPpeRequirements] = useState<Record<string, string[]>>({});

  // Calculate safety zones based on fixture placement
  useEffect(() => {
    if (state.objects && state.room) {
      calculateSafetyZones();
      calculateMaintenanceAccess();
      calculateWorkerExposures();
    }
  }, [state.objects, state.room]);

  const calculateSafetyZones = () => {
    const zones: SafetyZone[] = [];
    const fixtures = state.objects.filter(obj => obj.type === 'fixture' && obj.enabled);

    fixtures.forEach(fixture => {
      const wattage = fixture.model?.wattage || 600;
      const hasUV = fixture.model?.spectrum?.includes('UV') || false;
      
      // UV exposure zones
      if (hasUV || wattage > 400) {
        zones.push({
          id: `uv-${fixture.id}`,
          type: 'uv-high',
          severity: wattage > 600 ? 'high' : 'medium',
          coordinates: {
            x: fixture.x - 3,
            y: fixture.y - 3,
            width: 6,
            height: 6
          },
          requirements: ['UV protective eyewear', 'Long sleeves recommended'],
          exposureLimit: wattage > 600 ? 15 : 30
        });
      }

      // Heat stress zones
      if (wattage > 500) {
        const heatRadius = Math.sqrt(wattage / 100);
        zones.push({
          id: `heat-${fixture.id}`,
          type: 'heat-stress',
          severity: wattage > 800 ? 'high' : 'medium',
          coordinates: {
            x: fixture.x - heatRadius,
            y: fixture.y - heatRadius,
            width: heatRadius * 2,
            height: heatRadius * 2
          },
          requirements: ['Hydration breaks every 30 min', 'Heat stress monitoring'],
          exposureLimit: 60
        });
      }

      // High intensity zones (for eye protection)
      const intensityRadius = 4;
      zones.push({
        id: `intensity-${fixture.id}`,
        type: 'high-intensity',
        severity: 'medium',
        coordinates: {
          x: fixture.x - intensityRadius,
          y: fixture.y - intensityRadius,
          width: intensityRadius * 2,
          height: intensityRadius * 2
        },
        requirements: ['Protective eyewear required', 'No direct viewing'],
        exposureLimit: undefined
      });
    });

    setSafetyZones(zones);
  };

  const calculateMaintenanceAccess = () => {
    const scores: MaintenanceAccess[] = [];
    const fixtures = state.objects.filter(obj => obj.type === 'fixture');

    if (!state.room?.width || !state.room?.length) {
      setMaintenanceAccess([]);
      return;
    }

    fixtures.forEach(fixture => {
      let score = 100;
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Check height accessibility
      if (fixture.z > 12) {
        score -= 30;
        issues.push('Requires lift equipment for maintenance');
        recommendations.push('Consider lowering fixture or adding catwalk');
      } else if (fixture.z > 8) {
        score -= 15;
        issues.push('Requires ladder for maintenance');
        recommendations.push('Install safety rails or lower mounting height');
      }

      // Check proximity to walls
      const wallDistance = Math.min(
        fixture.x,
        fixture.y,
        state.room.width - fixture.x,
        state.room.length - fixture.y
      );
      
      if (wallDistance < 3) {
        score -= 20;
        issues.push('Limited access due to wall proximity');
        recommendations.push('Maintain 3ft clearance from walls');
      }

      // Check fixture density
      const nearbyFixtures = fixtures.filter(f => 
        f.id !== fixture.id &&
        Math.abs(f.x - fixture.x) < 4 &&
        Math.abs(f.y - fixture.y) < 4
      );

      if (nearbyFixtures.length > 2) {
        score -= 15;
        issues.push('Congested area - difficult access');
        recommendations.push('Increase fixture spacing for maintenance');
      }

      scores.push({
        fixtureId: fixture.id,
        accessScore: Math.max(0, score),
        issues,
        recommendations
      });
    });

    setMaintenanceScores(scores);
  };

  const calculateWorkerExposures = () => {
    // Mock worker data - in production, integrate with time tracking
    const mockWorkers: WorkerExposure[] = [
      {
        workerId: 'w001',
        name: 'John Smith',
        role: 'Cultivation Technician',
        dailyUVDose: 2.5,
        heatExposure: 4.2,
        ppe: ['Safety glasses', 'Gloves'],
        lastTraining: new Date('2024-01-15')
      },
      {
        workerId: 'w002',
        name: 'Maria Garcia',
        role: 'Maintenance Engineer',
        dailyUVDose: 4.8,
        heatExposure: 6.1,
        ppe: ['UV protective eyewear', 'Hard hat', 'Safety vest'],
        lastTraining: new Date('2024-02-20')
      },
      {
        workerId: 'w003',
        name: 'David Chen',
        role: 'Grower',
        dailyUVDose: 1.2,
        heatExposure: 3.5,
        ppe: ['Safety glasses'],
        lastTraining: new Date('2023-12-10')
      }
    ];

    setWorkerExposures(mockWorkers);
  };

  const generateSafetyReport = () => {
    const report = {
      facilityName: 'Cultivation Facility',
      date: new Date(),
      safetyZones: safetyZones,
      maintenanceScores: maintenanceScores,
      workerExposures: workerExposures,
      recommendations: [
        'Install UV warning signs in high exposure areas',
        'Provide cooling vests for workers in heat stress zones',
        'Schedule maintenance during lights-off periods',
        'Update PPE requirements based on zone mapping'
      ]
    };

    // In production, generate PDF report
    alert('Safety report generated! Check console for details.');
  };

  const getZoneColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/30 border-red-500';
      case 'high': return 'bg-orange-500/30 border-orange-500';
      case 'medium': return 'bg-yellow-500/30 border-yellow-500';
      case 'low': return 'bg-blue-500/30 border-blue-500';
      default: return 'bg-gray-500/30 border-gray-500';
    }
  };

  const getAccessScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-green-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Worker Safety & Ergonomics
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Ensure safe working conditions and compliance
            </p>
          </div>
        </div>
        <button
          onClick={generateSafetyReport}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'zones', label: 'Safety Zones', icon: Map },
          { id: 'maintenance', label: 'Maintenance Access', icon: Settings },
          { id: 'exposure', label: 'Worker Exposure', icon: Users },
          { id: 'compliance', label: 'Compliance', icon: FileText }
        ].map(view => (
          <button
            key={view.id}
            onClick={() => setSelectedView(view.id as any)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              selectedView === view.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <view.icon className="w-4 h-4" />
            {view.label}
          </button>
        ))}
      </div>

      {/* Safety Zones View */}
      {selectedView === 'zones' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Zone Map */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Safety Zone Map
              </h3>
              <div className="relative bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden" 
                   style={{ paddingBottom: '60%' }}>
                <div className="absolute inset-0 p-4">
                  {/* Room outline */}
                  <div className="absolute inset-4 border-2 border-gray-400 dark:border-gray-600 rounded-lg" />
                  
                  {/* Safety zones */}
                  {showHeatMap && state.room?.width && state.room?.length && safetyZones.map(zone => (
                    <div
                      key={zone.id}
                      className={`absolute border-2 rounded-lg ${getZoneColor(zone.severity)}`}
                      style={{
                        left: `${(zone.coordinates.x / state.room.width) * 100}%`,
                        top: `${(zone.coordinates.y / state.room.length) * 100}%`,
                        width: `${(zone.coordinates.width / state.room.width) * 100}%`,
                        height: `${(zone.coordinates.height / state.room.length) * 100}%`
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showHeatMap}
                    onChange={(e) => setShowHeatMap(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show zones</span>
                </label>
              </div>
            </div>

            {/* Zone Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Identified Safety Zones
              </h3>
              
              {['uv-high', 'heat-stress', 'high-intensity'].map(zoneType => {
                const zones = safetyZones.filter(z => z.type === zoneType);
                if (zones.length === 0) return null;

                return (
                  <div key={zoneType} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {zoneType === 'uv-high' && <Sun className="w-5 h-5 text-purple-500" />}
                      {zoneType === 'heat-stress' && <Thermometer className="w-5 h-5 text-red-500" />}
                      {zoneType === 'high-intensity' && <Zap className="w-5 h-5 text-yellow-500" />}
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {zoneType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <span className="text-sm text-gray-500">({zones.length} zones)</span>
                    </div>
                    
                    <div className="space-y-2">
                      {zones[0].requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="text-gray-700 dark:text-gray-300">{req}</span>
                        </div>
                      ))}
                      {zones[0].exposureLimit && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-700 dark:text-gray-300">
                            Max exposure: {zones[0].exposureLimit} minutes
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PPE Requirements Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <HardHat className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Required Personal Protective Equipment (PPE)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  UV protective eyewear in all cultivation areas
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  Long sleeves in high UV zones
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  Cooling vests in heat stress areas
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Access View */}
      {selectedView === 'maintenance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Access Scores */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Fixture Accessibility Scores
              </h3>
              <div className="space-y-3">
                {maintenanceScores.map(score => {
                  const fixture = state.objects.find(obj => obj.id === score.fixtureId);
                  return (
                    <div key={score.fixtureId} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {fixture?.customName || `Fixture ${score.fixtureId}`}
                          </span>
                        </div>
                        <span className={`text-2xl font-bold ${getAccessScoreColor(score.accessScore)}`}>
                          {score.accessScore}
                        </span>
                      </div>
                      
                      {score.issues.length > 0 && (
                        <div className="space-y-1 mb-2">
                          {score.issues.map((issue, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                              <span className="text-gray-600 dark:text-gray-400">{issue}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {score.recommendations.length > 0 && (
                        <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">
                          {score.recommendations.map((rec, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                              <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Stats */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Maintenance Summary
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {maintenanceScores.filter(s => s.accessScore >= 80).length}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Easily Accessible
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {maintenanceScores.filter(s => s.accessScore >= 60 && s.accessScore < 80).length}
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    Moderate Access
                  </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {maintenanceScores.filter(s => s.accessScore >= 40 && s.accessScore < 60).length}
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">
                    Difficult Access
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {maintenanceScores.filter(s => s.accessScore < 40).length}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">
                    Poor Access
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                  General Recommendations
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-200">
                      Install permanent catwalks for fixtures above 10 feet
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-200">
                      Maintain 3-foot clearance around all fixtures
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-200">
                      Schedule maintenance during dark periods
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-200">
                      Use quick-disconnect systems for easier servicing
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Worker Exposure View */}
      {selectedView === 'exposure' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {workerExposures.map(worker => (
              <div key={worker.workerId} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {worker.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {worker.role}
                    </p>
                  </div>
                  <Users className="w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-3">
                  {/* UV Exposure */}
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">UV Exposure</span>
                      <span className={`font-medium ${
                        worker.dailyUVDose > 4 ? 'text-red-600' : 
                        worker.dailyUVDose > 2 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {worker.dailyUVDose} J/m²
                      </span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          worker.dailyUVDose > 4 ? 'bg-red-500' : 
                          worker.dailyUVDose > 2 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, (worker.dailyUVDose / 5) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Heat Exposure */}
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Heat Exposure</span>
                      <span className={`font-medium ${
                        worker.heatExposure > 6 ? 'text-red-600' : 
                        worker.heatExposure > 4 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {worker.heatExposure} °C-hrs
                      </span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          worker.heatExposure > 6 ? 'bg-red-500' : 
                          worker.heatExposure > 4 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, (worker.heatExposure / 8) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* PPE Status */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      PPE Assigned
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {worker.ppe.map((item, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Training Status */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Last Training</span>
                    <span className={`font-medium ${
                      new Date().getTime() - worker.lastTraining.getTime() > 90 * 24 * 60 * 60 * 1000
                        ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {worker.lastTraining.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Exposure Guidelines */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                OSHA Exposure Guidelines
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  UV Radiation Limits
                </h4>
                <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                  <li>• 8-hour exposure: 3.0 J/m²</li>
                  <li>• Peak exposure: 5.0 J/m²</li>
                  <li>• Required PPE above 2.0 J/m²</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Heat Stress Prevention
                </h4>
                <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                  <li>• Work/rest cycles in hot zones</li>
                  <li>• Hydration every 30 minutes</li>
                  <li>• Cooling vests above 85°F</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance View */}
      {selectedView === 'compliance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Safety Compliance Checklist
              </h3>
              <div className="space-y-3">
                {[
                  { item: 'UV hazard warning signs posted', status: true },
                  { item: 'PPE stations at all entrances', status: true },
                  { item: 'Emergency eyewash stations', status: false },
                  { item: 'Heat stress monitoring program', status: true },
                  { item: 'Maintenance lockout/tagout procedures', status: true },
                  { item: 'Worker safety training records', status: false },
                  { item: 'Incident reporting system', status: true },
                  { item: 'Regular safety audits', status: true }
                ].map((check, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {check.item}
                    </span>
                    {check.status ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Regulatory Requirements
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    OSHA Standards
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• 29 CFR 1910.95 - Occupational noise exposure</li>
                    <li>• 29 CFR 1910.133 - Eye and face protection</li>
                    <li>• 29 CFR 1910.147 - Lockout/tagout</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    State Requirements
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Heat illness prevention program</li>
                    <li>• Ergonomic safety standards</li>
                    <li>• Cannabis-specific worker safety</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                Required Actions
              </h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <span className="text-red-700 dark:text-red-300">1.</span>
                <span className="text-red-700 dark:text-red-300">
                  Install emergency eyewash stations within 10 seconds walking distance of UV exposure areas
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-red-700 dark:text-red-300">2.</span>
                <span className="text-red-700 dark:text-red-300">
                  Update worker safety training records for 2 employees
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-red-700 dark:text-red-300">3.</span>
                <span className="text-red-700 dark:text-red-300">
                  Implement continuous heat stress monitoring in high-temperature zones
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}