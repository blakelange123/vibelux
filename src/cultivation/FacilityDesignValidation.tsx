'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Shield,
  Ruler,
  Grid3x3,
  Layers,
  Lightbulb,
  Wind,
  Droplets,
  Thermometer,
  Zap,
  Navigation,
  Package,
  Users,
  Building,
  DoorOpen,
  Camera,
  Wifi,
  AlertCircle,
  Settings,
  Download,
  Upload,
  Play,
  Pause,
  RefreshCw,
  ChevronRight,
  BarChart3,
  Target,
  Activity,
  GitBranch,
  Maximize2,
  Move,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Box,
  Cpu,
  HardDrive,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  ClipboardCheck,
  Gauge,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  RotateCw,
  Copy,
  Eye,
  EyeOff,
  DollarSign
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Sankey } from 'recharts';

interface ValidationRule {
  id: string;
  category: 'code' | 'safety' | 'efficiency' | 'workflow' | 'environmental' | 'security';
  name: string;
  description: string;
  severity: 'critical' | 'major' | 'minor' | 'suggestion';
  status: 'pass' | 'fail' | 'warning' | 'not-applicable';
  details?: string;
  recommendation?: string;
  cost?: number;
  autoFixable: boolean;
}

interface DesignElement {
  id: string;
  type: 'room' | 'equipment' | 'infrastructure' | 'access' | 'utility';
  name: string;
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  properties: Record<string, any>;
  connections: string[];
  validationStatus: 'valid' | 'invalid' | 'warning';
  issues: ValidationIssue[];
}

interface ValidationIssue {
  id: string;
  elementId: string;
  ruleId: string;
  type: 'spacing' | 'capacity' | 'flow' | 'safety' | 'compliance' | 'efficiency';
  severity: 'critical' | 'major' | 'minor';
  message: string;
  suggestion?: string;
  autoFix?: () => void;
}

interface WorkflowAnalysis {
  id: string;
  name: string;
  type: 'material' | 'personnel' | 'product' | 'waste';
  path: { x: number; y: number }[];
  efficiency: number;
  bottlenecks: string[];
  crossContamination: boolean;
  optimizedPath?: { x: number; y: number }[];
}

interface ComplianceCheck {
  id: string;
  regulation: string;
  category: string;
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'needs-review';
  evidence?: string;
  notes?: string;
}

interface SimulationResult {
  metric: string;
  current: number;
  optimized: number;
  improvement: number;
  unit: string;
}

export default function FacilityDesignValidation() {
  const [validationMode, setValidationMode] = useState<'manual' | 'auto' | 'real-time'>('auto');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'code' | 'safety' | 'efficiency' | 'workflow'>('all');
  const [showOptimizations, setShowOptimizations] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [view3D, setView3D] = useState(false);

  // Mock validation rules
  const validationRules: ValidationRule[] = [
    {
      id: '1',
      category: 'code',
      name: 'Minimum Aisle Width',
      description: 'Main aisles must be at least 4 feet wide for equipment access',
      severity: 'critical',
      status: 'pass',
      details: 'All main aisles meet minimum width requirements',
      autoFixable: false
    },
    {
      id: '2',
      category: 'safety',
      name: 'Emergency Exit Access',
      description: 'All areas must be within 150 feet of an emergency exit',
      severity: 'critical',
      status: 'fail',
      details: 'Flower Room 3 exceeds maximum distance to exit (165 feet)',
      recommendation: 'Add emergency exit on north wall or reconfigure layout',
      cost: 5000,
      autoFixable: false
    },
    {
      id: '3',
      category: 'efficiency',
      name: 'Light Coverage Uniformity',
      description: 'PPFD uniformity should be >80% across canopy',
      severity: 'major',
      status: 'warning',
      details: 'Current uniformity: 76% in Veg Room 2',
      recommendation: 'Adjust fixture spacing or add 2 additional fixtures',
      cost: 800,
      autoFixable: true
    },
    {
      id: '4',
      category: 'workflow',
      name: 'Cross-Contamination Prevention',
      description: 'Dirty and clean paths should not intersect',
      severity: 'major',
      status: 'pass',
      details: 'Material flow properly segregated',
      autoFixable: false
    },
    {
      id: '5',
      category: 'environmental',
      name: 'HVAC Capacity',
      description: 'HVAC must handle peak thermal load + 20% buffer',
      severity: 'critical',
      status: 'warning',
      details: 'Current capacity: 95% of peak load',
      recommendation: 'Upgrade to 15-ton unit or add supplemental cooling',
      cost: 12000,
      autoFixable: false
    }
  ];

  const validationSummary = {
    total: validationRules.length,
    passed: validationRules.filter(r => r.status === 'pass').length,
    failed: validationRules.filter(r => r.status === 'fail').length,
    warnings: validationRules.filter(r => r.status === 'warning').length,
    score: 78
  };

  const categoryBreakdown = [
    { category: 'Code Compliance', score: 92, issues: 2 },
    { category: 'Safety', score: 85, issues: 5 },
    { category: 'Efficiency', score: 76, issues: 8 },
    { category: 'Workflow', score: 88, issues: 3 },
    { category: 'Environmental', score: 72, issues: 6 },
    { category: 'Security', score: 95, issues: 1 }
  ];

  const workflowMetrics = [
    { workflow: 'Clone to Harvest', efficiency: 85, time: '12 weeks', bottlenecks: 2 },
    { workflow: 'Harvest to Package', efficiency: 78, time: '14 days', bottlenecks: 3 },
    { workflow: 'Material Handling', efficiency: 82, time: '45 min/batch', bottlenecks: 1 },
    { workflow: 'Personnel Movement', efficiency: 91, time: 'N/A', bottlenecks: 0 }
  ];

  const spaceUtilization = {
    total: 25000, // sq ft
    canopy: 12000,
    walkways: 4000,
    equipment: 3000,
    storage: 2000,
    office: 1500,
    mechanical: 2500
  };

  const simulationResults: SimulationResult[] = [
    { metric: 'Energy Efficiency', current: 2.1, optimized: 2.8, improvement: 33, unit: 'μmol/J' },
    { metric: 'Space Utilization', current: 48, optimized: 62, improvement: 29, unit: '%' },
    { metric: 'Workflow Time', current: 45, optimized: 32, improvement: -29, unit: 'min' },
    { metric: 'Labor Efficiency', current: 75, optimized: 88, improvement: 17, unit: '%' },
    { metric: 'Yield per Sq Ft', current: 45, optimized: 58, improvement: 29, unit: 'g' }
  ];

  const complianceChecks: ComplianceCheck[] = [
    {
      id: '1',
      regulation: 'State Cannabis Control',
      category: 'Security',
      requirement: 'Limited access areas with badge control',
      status: 'compliant',
      evidence: 'Badge system installed and operational'
    },
    {
      id: '2',
      regulation: 'Fire Code',
      category: 'Safety',
      requirement: 'Maximum travel distance to exit: 150 ft',
      status: 'non-compliant',
      notes: 'Flower Room 3 exceeds limit'
    },
    {
      id: '3',
      regulation: 'ADA',
      category: 'Accessibility',
      requirement: 'Accessible routes to all areas',
      status: 'compliant',
      evidence: 'All areas wheelchair accessible'
    },
    {
      id: '4',
      regulation: 'OSHA',
      category: 'Worker Safety',
      requirement: 'Proper ventilation in chemical storage',
      status: 'needs-review',
      notes: 'Awaiting air quality test results'
    }
  ];

  const runValidation = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
      case 'compliant':
        return '#10B981';
      case 'fail':
      case 'non-compliant':
        return '#EF4444';
      case 'warning':
      case 'needs-review':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'major':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'minor':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const radarData = categoryBreakdown.map(cat => ({
    category: cat.category,
    score: cat.score
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600" />
              Facility Design Validation
            </h2>
            <p className="text-gray-600 mt-1">
              Comprehensive validation for code compliance, safety, and efficiency
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={runValidation}
              disabled={isValidating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Validation
                </>
              )}
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Validation Mode</label>
            <select 
              value={validationMode} 
              onChange={(e) => setValidationMode(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="manual">Manual</option>
              <option value="auto">Automatic</option>
              <option value="real-time">Real-Time</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Filter</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="code">Code Compliance</option>
              <option value="safety">Safety</option>
              <option value="efficiency">Efficiency</option>
              <option value="workflow">Workflow</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOptimizations}
                onChange={(e) => setShowOptimizations(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Show Optimizations</span>
            </label>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={view3D}
                onChange={(e) => setView3D(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">3D View</span>
            </label>
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-blue-600">{validationSummary.score}%</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Overall Score</h3>
          <p className="text-sm text-gray-600 mt-1">Design validation score</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-green-600">{validationSummary.passed}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Passed</h3>
          <p className="text-sm text-gray-600 mt-1">Validation rules</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
            <span className="text-3xl font-bold text-red-600">{validationSummary.failed}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Failed</h3>
          <p className="text-sm text-gray-600 mt-1">Critical issues</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <span className="text-3xl font-bold text-yellow-600">{validationSummary.warnings}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Warnings</h3>
          <p className="text-sm text-gray-600 mt-1">Need attention</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">$17.8K</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Fix Cost</h3>
          <p className="text-sm text-gray-600 mt-1">Estimated total</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Validation Results */}
        <div className="col-span-8 space-y-6">
          {/* Issues List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                Validation Results
              </h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  Auto-Fix All
                </button>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  Generate Report
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {validationRules
                .filter(rule => selectedCategory === 'all' || rule.category === selectedCategory)
                .map(rule => (
                  <div key={rule.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(rule.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{rule.name}</h4>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              rule.status === 'pass' ? 'bg-green-100 text-green-700' :
                              rule.status === 'fail' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {rule.status}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                              {rule.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                          {rule.details && (
                            <p className="text-sm text-gray-700 mt-2 font-medium">{rule.details}</p>
                          )}
                          {rule.recommendation && (
                            <div className="mt-2 p-3 bg-blue-50 rounded">
                              <p className="text-sm text-blue-700">
                                <span className="font-medium">Recommendation:</span> {rule.recommendation}
                              </p>
                              {rule.cost && (
                                <p className="text-sm text-blue-600 mt-1">
                                  Estimated cost: ${rule.cost.toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {rule.autoFixable && (
                          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                            Auto-Fix
                          </button>
                        )}
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Space Utilization */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Grid3x3 className="w-5 h-5 text-purple-600" />
              Space Utilization Analysis
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Current Layout</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Canopy', value: spaceUtilization.canopy, fill: '#10B981' },
                        { name: 'Walkways', value: spaceUtilization.walkways, fill: '#F59E0B' },
                        { name: 'Equipment', value: spaceUtilization.equipment, fill: '#3B82F6' },
                        { name: 'Storage', value: spaceUtilization.storage, fill: '#8B5CF6' },
                        { name: 'Office', value: spaceUtilization.office, fill: '#EC4899' },
                        { name: 'Mechanical', value: spaceUtilization.mechanical, fill: '#6B7280' }
                      ]}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                    >
                      <Cell />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{((spaceUtilization.canopy / spaceUtilization.total) * 100).toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Canopy Coverage</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Optimization Opportunities</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm text-gray-700">Increase canopy area</span>
                    <span className="text-sm font-medium text-green-600">+2,400 sq ft</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-sm text-gray-700">Optimize walkway width</span>
                    <span className="text-sm font-medium text-yellow-600">-800 sq ft</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm text-gray-700">Consolidate storage</span>
                    <span className="text-sm font-medium text-blue-600">-400 sq ft</span>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Potential canopy increase</span>
                    <span className="text-lg font-bold text-green-600">+20%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-indigo-600" />
              Workflow Efficiency
            </h3>
            
            <div className="space-y-4">
              {workflowMetrics.map((workflow, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{workflow.workflow}</h4>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">{workflow.time}</span>
                      <span className={`text-lg font-bold ${
                        workflow.efficiency >= 85 ? 'text-green-600' :
                        workflow.efficiency >= 75 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {workflow.efficiency}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            workflow.efficiency >= 85 ? 'bg-green-500' :
                            workflow.efficiency >= 75 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${workflow.efficiency}%` }}
                        />
                      </div>
                    </div>
                    {workflow.bottlenecks > 0 && (
                      <p className="text-sm text-yellow-600">
                        {workflow.bottlenecks} bottleneck{workflow.bottlenecks > 1 ? 's' : ''} identified
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-4 space-y-6">
          {/* Category Scores */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Category Analysis
            </h3>
            
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Score" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {categoryBreakdown.map((cat, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{cat.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{cat.issues} issues</span>
                    <span className={`text-sm font-medium ${
                      cat.score >= 90 ? 'text-green-600' :
                      cat.score >= 80 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {cat.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-green-600" />
              Compliance Status
            </h3>
            
            <div className="space-y-3">
              {complianceChecks.map(check => (
                <div key={check.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          check.status === 'compliant' ? 'bg-green-500' :
                          check.status === 'non-compliant' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`} />
                        <h4 className="text-sm font-medium text-gray-900">{check.regulation}</h4>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{check.category}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      check.status === 'compliant' ? 'bg-green-100 text-green-700' :
                      check.status === 'non-compliant' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {check.status.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700">{check.requirement}</p>
                  {(check.evidence || check.notes) && (
                    <p className="text-xs text-gray-500 mt-2">
                      {check.evidence || check.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Simulation Results */}
          {showOptimizations && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-600" />
                Optimization Simulation
              </h3>
              
              <div className="space-y-3">
                {simulationResults.map((result, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{result.metric}</span>
                      <span className={`text-sm font-medium ${
                        result.improvement > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.improvement > 0 ? '+' : ''}{result.improvement}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">Current: {result.current}{result.unit}</span>
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                      <span className="font-medium text-gray-700">Optimized: {result.optimized}{result.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
                Apply Optimizations
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-600" />
                View 3D Model
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg flex items-center gap-2">
                <Copy className="w-4 h-4 text-gray-600" />
                Clone Layout
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-600" />
                Configure Rules
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg flex items-center gap-2">
                <Download className="w-4 h-4 text-gray-600" />
                Export CAD
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}