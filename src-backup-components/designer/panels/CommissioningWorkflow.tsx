'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck, FileCheck, AlertCircle, CheckCircle,
  XCircle, Clock, Download, Upload, Printer,
  Camera, FileText, Users, Shield, ChevronRight,
  ChevronDown, Info, Settings, Mail, X
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';

interface ChecklistItem {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'pending' | 'pass' | 'fail' | 'na';
  notes: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  evidence?: {
    photos: string[];
    measurements: Record<string, number>;
    timestamp: Date;
  };
}

interface CommissioningPhase {
  id: string;
  name: string;
  description: string;
  progress: number;
  items: ChecklistItem[];
  requiredForHandover: boolean;
}

interface ProjectInfo {
  name: string;
  location: string;
  client: string;
  contractor: string;
  engineer: string;
  commissioning_date: string;
  system_size: string;
}

export function CommissioningWorkflow({ onClose }: { onClose: () => void }) {
  const { state } = useDesigner();
  const { showNotification } = useNotifications();
  
  const [activePhase, setActivePhase] = useState(0);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    name: 'VibeLux Installation',
    location: '',
    client: '',
    contractor: '',
    engineer: '',
    commissioning_date: new Date().toISOString().split('T')[0],
    system_size: `${state.objects.filter(obj => obj.type === 'fixture').length} fixtures`
  });
  
  const [phases, setPhases] = useState<CommissioningPhase[]>([
    {
      id: 'pre-commissioning',
      name: 'Pre-Commissioning',
      description: 'Documentation review and system preparation',
      progress: 0,
      requiredForHandover: true,
      items: [
        {
          id: 'design-docs',
          category: 'Documentation',
          name: 'Design Documentation Complete',
          description: 'Verify all design documents are current and approved',
          status: 'pending',
          notes: '',
          priority: 'high'
        },
        {
          id: 'electrical-drawings',
          category: 'Documentation',
          name: 'Electrical Drawings',
          description: 'Single-line diagrams, panel schedules, and circuit layouts',
          status: 'pending',
          notes: '',
          priority: 'critical'
        },
        {
          id: 'fixture-specs',
          category: 'Documentation',
          name: 'Fixture Specifications',
          description: 'Manufacturer datasheets and IES files for all fixtures',
          status: 'pending',
          notes: '',
          priority: 'high'
        },
        {
          id: 'control-narrative',
          category: 'Documentation',
          name: 'Control Sequence Narrative',
          description: 'Written description of all control sequences and setpoints',
          status: 'pending',
          notes: '',
          priority: 'medium'
        },
        {
          id: 'safety-review',
          category: 'Safety',
          name: 'Safety Procedures Review',
          description: 'Lock-out/tag-out procedures and emergency protocols',
          status: 'pending',
          notes: '',
          priority: 'critical'
        }
      ]
    },
    {
      id: 'installation-verification',
      name: 'Installation Verification',
      description: 'Physical installation and mounting checks',
      progress: 0,
      requiredForHandover: true,
      items: [
        {
          id: 'fixture-mounting',
          category: 'Physical',
          name: 'Fixture Mounting',
          description: 'All fixtures securely mounted per manufacturer specs',
          status: 'pending',
          notes: '',
          priority: 'critical'
        },
        {
          id: 'fixture-orientation',
          category: 'Physical',
          name: 'Fixture Orientation',
          description: 'Fixtures oriented correctly for optimal coverage',
          status: 'pending',
          notes: '',
          priority: 'high'
        },
        {
          id: 'cable-routing',
          category: 'Electrical',
          name: 'Cable Routing',
          description: 'Cables properly routed, supported, and protected',
          status: 'pending',
          notes: '',
          priority: 'high'
        },
        {
          id: 'grounding',
          category: 'Electrical',
          name: 'Grounding System',
          description: 'All fixtures and equipment properly grounded',
          status: 'pending',
          notes: '',
          priority: 'critical'
        },
        {
          id: 'labels',
          category: 'Documentation',
          name: 'Equipment Labeling',
          description: 'All fixtures, circuits, and controls properly labeled',
          status: 'pending',
          notes: '',
          priority: 'medium'
        }
      ]
    },
    {
      id: 'electrical-testing',
      name: 'Electrical Testing',
      description: 'Power quality and safety verification',
      progress: 0,
      requiredForHandover: true,
      items: [
        {
          id: 'megger-test',
          category: 'Safety',
          name: 'Insulation Resistance',
          description: 'Megger test all circuits (>1MΩ required)',
          status: 'pending',
          notes: '',
          priority: 'critical',
          evidence: { photos: [], measurements: {}, timestamp: new Date() }
        },
        {
          id: 'voltage-verification',
          category: 'Power',
          name: 'Voltage Verification',
          description: 'Verify correct voltage at all connection points',
          status: 'pending',
          notes: '',
          priority: 'critical',
          evidence: { photos: [], measurements: {}, timestamp: new Date() }
        },
        {
          id: 'phase-balance',
          category: 'Power',
          name: 'Phase Balance',
          description: 'Verify load balance across all phases (<10% imbalance)',
          status: 'pending',
          notes: '',
          priority: 'high',
          evidence: { photos: [], measurements: {}, timestamp: new Date() }
        },
        {
          id: 'breaker-coordination',
          category: 'Protection',
          name: 'Breaker Coordination',
          description: 'Verify breaker sizes and trip settings',
          status: 'pending',
          notes: '',
          priority: 'high'
        },
        {
          id: 'emergency-stop',
          category: 'Safety',
          name: 'Emergency Stop Function',
          description: 'Test all emergency stop circuits',
          status: 'pending',
          notes: '',
          priority: 'critical'
        }
      ]
    },
    {
      id: 'control-commissioning',
      name: 'Control System',
      description: 'Control system configuration and testing',
      progress: 0,
      requiredForHandover: true,
      items: [
        {
          id: 'network-comm',
          category: 'Communication',
          name: 'Network Communication',
          description: 'All fixtures responding to control commands',
          status: 'pending',
          notes: '',
          priority: 'critical'
        },
        {
          id: 'zone-mapping',
          category: 'Configuration',
          name: 'Zone Mapping',
          description: 'Fixtures correctly assigned to control zones',
          status: 'pending',
          notes: '',
          priority: 'high'
        },
        {
          id: 'dimming-response',
          category: 'Function',
          name: 'Dimming Response',
          description: 'Smooth dimming from 0-100% without flicker',
          status: 'pending',
          notes: '',
          priority: 'high'
        },
        {
          id: 'schedule-operation',
          category: 'Function',
          name: 'Schedule Operation',
          description: 'Time schedules operating correctly',
          status: 'pending',
          notes: '',
          priority: 'medium'
        },
        {
          id: 'sensor-calibration',
          category: 'Sensors',
          name: 'Sensor Calibration',
          description: 'All environmental sensors calibrated',
          status: 'pending',
          notes: '',
          priority: 'medium'
        }
      ]
    },
    {
      id: 'performance-verification',
      name: 'Performance Testing',
      description: 'Light levels and uniformity verification',
      progress: 0,
      requiredForHandover: true,
      items: [
        {
          id: 'ppfd-targets',
          category: 'Photometric',
          name: 'PPFD Target Achievement',
          description: 'Measured PPFD meets design targets (±10%)',
          status: 'pending',
          notes: '',
          priority: 'critical',
          evidence: { photos: [], measurements: {}, timestamp: new Date() }
        },
        {
          id: 'uniformity',
          category: 'Photometric',
          name: 'Uniformity Verification',
          description: 'Light uniformity meets specifications (>0.7)',
          status: 'pending',
          notes: '',
          priority: 'high',
          evidence: { photos: [], measurements: {}, timestamp: new Date() }
        },
        {
          id: 'spectrum-verification',
          category: 'Photometric',
          name: 'Spectrum Verification',
          description: 'Spectral output matches specifications',
          status: 'pending',
          notes: '',
          priority: 'medium',
          evidence: { photos: [], measurements: {}, timestamp: new Date() }
        },
        {
          id: 'power-consumption',
          category: 'Energy',
          name: 'Power Consumption',
          description: 'Actual power draw within 5% of design',
          status: 'pending',
          notes: '',
          priority: 'high',
          evidence: { photos: [], measurements: {}, timestamp: new Date() }
        },
        {
          id: 'thermal-performance',
          category: 'Thermal',
          name: 'Thermal Performance',
          description: 'Fixture temperatures within specifications',
          status: 'pending',
          notes: '',
          priority: 'medium',
          evidence: { photos: [], measurements: {}, timestamp: new Date() }
        }
      ]
    },
    {
      id: 'training-handover',
      name: 'Training & Handover',
      description: 'User training and system handover',
      progress: 0,
      requiredForHandover: true,
      items: [
        {
          id: 'operator-training',
          category: 'Training',
          name: 'Operator Training',
          description: 'Daily operation procedures training completed',
          status: 'pending',
          notes: '',
          priority: 'high'
        },
        {
          id: 'maintenance-training',
          category: 'Training',
          name: 'Maintenance Training',
          description: 'Preventive maintenance procedures training',
          status: 'pending',
          notes: '',
          priority: 'high'
        },
        {
          id: 'emergency-training',
          category: 'Training',
          name: 'Emergency Procedures',
          description: 'Emergency response training completed',
          status: 'pending',
          notes: '',
          priority: 'critical'
        },
        {
          id: 'documentation-handover',
          category: 'Documentation',
          name: 'Documentation Package',
          description: 'All as-built drawings and manuals delivered',
          status: 'pending',
          notes: '',
          priority: 'high'
        },
        {
          id: 'spare-parts',
          category: 'Materials',
          name: 'Spare Parts',
          description: 'Recommended spare parts delivered',
          status: 'pending',
          notes: '',
          priority: 'low'
        }
      ]
    }
  ]);
  
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showOnlyFailed, setShowOnlyFailed] = useState(false);

  // Calculate phase progress
  useEffect(() => {
    const updatedPhases = phases.map(phase => {
      const totalItems = phase.items.length;
      const completedItems = phase.items.filter(item => 
        item.status === 'pass' || item.status === 'na'
      ).length;
      return {
        ...phase,
        progress: totalItems > 0 ? (completedItems / totalItems) * 100 : 0
      };
    });
    setPhases(updatedPhases);
  }, [phases]);

  const updateItemStatus = (phaseIndex: number, itemId: string, status: ChecklistItem['status']) => {
    const updatedPhases = [...phases];
    const item = updatedPhases[phaseIndex].items.find(i => i.id === itemId);
    if (item) {
      item.status = status;
      setPhases(updatedPhases);
    }
  };

  const updateItemNotes = (phaseIndex: number, itemId: string, notes: string) => {
    const updatedPhases = [...phases];
    const item = updatedPhases[phaseIndex].items.find(i => i.id === itemId);
    if (item) {
      item.notes = notes;
      setPhases(updatedPhases);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'na':
        return <Info className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: ChecklistItem['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const generateReport = () => {
    const reportData = {
      project: projectInfo,
      commissioning_date: new Date().toISOString(),
      phases: phases.map(phase => ({
        name: phase.name,
        progress: phase.progress,
        items: phase.items.map(item => ({
          name: item.name,
          status: item.status,
          notes: item.notes,
          priority: item.priority
        }))
      })),
      summary: {
        total_items: phases.reduce((sum, phase) => sum + phase.items.length, 0),
        passed: phases.reduce((sum, phase) => 
          sum + phase.items.filter(i => i.status === 'pass').length, 0
        ),
        failed: phases.reduce((sum, phase) => 
          sum + phase.items.filter(i => i.status === 'fail').length, 0
        ),
        pending: phases.reduce((sum, phase) => 
          sum + phase.items.filter(i => i.status === 'pending').length, 0
        ),
        na: phases.reduce((sum, phase) => 
          sum + phase.items.filter(i => i.status === 'na').length, 0
        )
      }
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commissioning-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('success', 'Commissioning report generated');
  };

  const calculateReadiness = () => {
    const requiredPhases = phases.filter(p => p.requiredForHandover);
    const criticalItems = requiredPhases.flatMap(p => 
      p.items.filter(i => i.priority === 'critical')
    );
    const criticalPassed = criticalItems.filter(i => 
      i.status === 'pass' || i.status === 'na'
    ).length;
    
    return {
      percentage: criticalItems.length > 0 
        ? Math.round((criticalPassed / criticalItems.length) * 100)
        : 0,
      criticalRemaining: criticalItems.filter(i => i.status === 'pending' || i.status === 'fail')
    };
  };

  const readiness = calculateReadiness();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-7xl w-full h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Commissioning Workflow</h2>
              <p className="text-sm text-gray-400">System validation and handover checklist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Project Info Bar */}
        <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-400">Project:</span>
                <input
                  type="text"
                  value={projectInfo.name}
                  onChange={(e) => setProjectInfo({...projectInfo, name: e.target.value})}
                  className="ml-2 px-2 py-1 bg-gray-700 text-white rounded"
                />
              </div>
              <div>
                <span className="text-gray-400">Client:</span>
                <input
                  type="text"
                  value={projectInfo.client}
                  onChange={(e) => setProjectInfo({...projectInfo, client: e.target.value})}
                  className="ml-2 px-2 py-1 bg-gray-700 text-white rounded"
                />
              </div>
              <div>
                <span className="text-gray-400">Date:</span>
                <input
                  type="date"
                  value={projectInfo.commissioning_date}
                  onChange={(e) => setProjectInfo({...projectInfo, commissioning_date: e.target.value})}
                  className="ml-2 px-2 py-1 bg-gray-700 text-white rounded"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showOnlyFailed}
                  onChange={(e) => setShowOnlyFailed(e.target.checked)}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-gray-300">Show only issues</span>
              </label>
              <button
                onClick={generateReport}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Phase Navigation */}
          <div className="w-64 bg-gray-800 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Commissioning Phases</h3>
            {phases.map((phase, index) => (
              <button
                key={phase.id}
                onClick={() => setActivePhase(index)}
                className={`w-full mb-2 p-3 rounded-lg transition-all text-left ${
                  activePhase === index
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{phase.name}</span>
                  <span className="text-xs">{Math.round(phase.progress)}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
              </button>
            ))}
            
            {/* Readiness Summary */}
            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-2">System Readiness</h4>
              <div className="text-2xl font-bold text-center mb-2">
                <span className={readiness.percentage >= 90 ? 'text-green-500' : 'text-yellow-500'}>
                  {readiness.percentage}%
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {readiness.criticalRemaining.length} critical items remaining
              </div>
            </div>
          </div>
          
          {/* Checklist Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-white mb-2">{phases[activePhase].name}</h3>
              <p className="text-gray-400">{phases[activePhase].description}</p>
            </div>
            
            {/* Group items by category */}
            {Object.entries(
              phases[activePhase].items.reduce((acc, item) => {
                if (!acc[item.category]) acc[item.category] = [];
                if (!showOnlyFailed || (item.status === 'fail' || item.status === 'pending')) {
                  acc[item.category].push(item);
                }
                return acc;
              }, {} as Record<string, ChecklistItem[]>)
            ).map(([category, items]) => (
              <div key={category} className="mb-6">
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex items-center gap-2 mb-3 text-lg font-semibold text-white hover:text-purple-400"
                >
                  {expandedCategories.has(category) ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                  {category}
                  <span className="text-sm text-gray-400 ml-2">({items.length} items)</span>
                </button>
                
                {(expandedCategories.has(category) || expandedCategories.size === 0) && (
                  <div className="space-y-3">
                    {items.map((item, itemIndex) => {
                      const phaseItemIndex = phases[activePhase].items.findIndex(i => i.id === item.id);
                      return (
                        <div key={item.id} className="bg-gray-800 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-3 flex-1">
                              {getStatusIcon(item.status)}
                              <div className="flex-1">
                                <h4 className="font-medium text-white">{item.name}</h4>
                                <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                                <span className={`text-xs ${getPriorityColor(item.priority)} mt-2 inline-block`}>
                                  {item.priority.toUpperCase()} PRIORITY
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateItemStatus(activePhase, item.id, 'pass')}
                                className={`px-3 py-1 rounded text-sm ${
                                  item.status === 'pass'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                Pass
                              </button>
                              <button
                                onClick={() => updateItemStatus(activePhase, item.id, 'fail')}
                                className={`px-3 py-1 rounded text-sm ${
                                  item.status === 'fail'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                Fail
                              </button>
                              <button
                                onClick={() => updateItemStatus(activePhase, item.id, 'na')}
                                className={`px-3 py-1 rounded text-sm ${
                                  item.status === 'na'
                                    ? 'bg-gray-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                N/A
                              </button>
                            </div>
                          </div>
                          
                          {/* Notes field */}
                          <div className="mt-3">
                            <textarea
                              value={item.notes}
                              onChange={(e) => updateItemNotes(activePhase, item.id, e.target.value)}
                              placeholder="Add notes, measurements, or observations..."
                              className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm resize-none"
                              rows={2}
                            />
                          </div>
                          
                          {/* Evidence section for items with measurements */}
                          {item.evidence && (
                            <div className="mt-3 flex gap-3">
                              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                Add Photo
                              </button>
                              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Add Measurement
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}