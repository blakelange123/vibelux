'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Bell,
  Info,
  ChevronRight,
  FileText,
  ClipboardCheck,
  Database,
  Lock,
  Key,
  Camera,
  Video,
  Wifi,
  Users,
  Package,
  Scale,
  Truck,
  Building,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Plus,
  Settings,
  Send,
  Archive,
  Flag,
  Zap
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar, PolarGrid } from 'recharts';

interface ComplianceRequirement {
  id: string;
  category: 'licensing' | 'testing' | 'security' | 'environmental' | 'labeling' | 'reporting' | 'record-keeping';
  subcategory: string;
  requirement: string;
  description: string;
  frequency: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'continuous';
  jurisdiction: string[];
  status: 'compliant' | 'non-compliant' | 'pending' | 'overdue' | 'not-applicable';
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate?: Date;
  lastCompleted?: Date;
  nextDue?: Date;
  automationLevel: 'full' | 'partial' | 'manual';
  evidence: Evidence[];
  responsibleParty?: string;
  regulatoryBody: string;
  penalties?: {
    type: 'fine' | 'suspension' | 'revocation';
    amount?: number;
    description: string;
  };
}

interface Evidence {
  id: string;
  type: 'document' | 'photo' | 'video' | 'log' | 'report' | 'certificate';
  name: string;
  uploadDate: Date;
  verifiedBy?: string;
  expiryDate?: Date;
  url?: string;
  status: 'valid' | 'expired' | 'pending-review';
}

interface ComplianceTask {
  id: string;
  requirementId: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  completedDate?: Date;
  notes?: string;
  attachments?: string[];
}

interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  category: string;
  user: string;
  details: string;
  ipAddress?: string;
  requirementId?: string;
  status: 'success' | 'failure' | 'warning';
}

interface ComplianceMetrics {
  overallScore: number;
  categoryScores: Record<string, number>;
  trendsData: {
    month: string;
    score: number;
    violations: number;
    tasksCompleted: number;
  }[];
  upcomingDeadlines: number;
  overdueItems: number;
  automationRate: number;
}

interface RegulatoryUpdate {
  id: string;
  date: Date;
  title: string;
  description: string;
  impactLevel: 'high' | 'medium' | 'low';
  affectedAreas: string[];
  requiredActions: string[];
  deadline?: Date;
  source: string;
  acknowledged: boolean;
}

// Mock compliance requirements
const mockRequirements: ComplianceRequirement[] = [
  {
    id: 'req-001',
    category: 'licensing',
    subcategory: 'Cultivation License',
    requirement: 'Annual License Renewal',
    description: 'Renew cultivation license with state regulatory agency',
    frequency: 'annually',
    jurisdiction: ['California'],
    status: 'compliant',
    priority: 'critical',
    lastCompleted: new Date('2024-01-15'),
    nextDue: new Date('2025-01-15'),
    automationLevel: 'partial',
    evidence: [
      {
        id: 'ev-001',
        type: 'certificate',
        name: 'Cultivation License 2024',
        uploadDate: new Date('2024-01-15'),
        expiryDate: new Date('2025-01-15'),
        status: 'valid'
      }
    ],
    regulatoryBody: 'California Department of Cannabis Control',
    penalties: {
      type: 'suspension',
      description: 'Immediate suspension of operations'
    }
  },
  {
    id: 'req-002',
    category: 'testing',
    subcategory: 'Product Testing',
    requirement: 'Batch Testing for Contaminants',
    description: 'Test every batch for pesticides, heavy metals, and microbials',
    frequency: 'continuous',
    jurisdiction: ['California'],
    status: 'compliant',
    priority: 'critical',
    automationLevel: 'full',
    evidence: [],
    regulatoryBody: 'California Department of Cannabis Control',
    penalties: {
      type: 'fine',
      amount: 10000,
      description: 'Per batch violation'
    }
  },
  {
    id: 'req-003',
    category: 'security',
    subcategory: 'Video Surveillance',
    requirement: '24/7 Video Surveillance',
    description: 'Maintain continuous video surveillance of all cultivation areas',
    frequency: 'continuous',
    jurisdiction: ['California'],
    status: 'compliant',
    priority: 'high',
    automationLevel: 'full',
    evidence: [],
    regulatoryBody: 'California Department of Cannabis Control'
  },
  {
    id: 'req-004',
    category: 'environmental',
    subcategory: 'Waste Management',
    requirement: 'Cannabis Waste Tracking',
    description: 'Track and report all cannabis waste disposal',
    frequency: 'daily',
    jurisdiction: ['California'],
    status: 'pending',
    priority: 'medium',
    nextDue: new Date(Date.now() + 24 * 60 * 60 * 1000),
    automationLevel: 'partial',
    evidence: [],
    regulatoryBody: 'CalRecycle'
  },
  {
    id: 'req-005',
    category: 'reporting',
    subcategory: 'Track and Trace',
    requirement: 'METRC Reporting',
    description: 'Report all plant and product movements in METRC',
    frequency: 'daily',
    jurisdiction: ['California'],
    status: 'compliant',
    priority: 'critical',
    automationLevel: 'full',
    evidence: [],
    regulatoryBody: 'METRC'
  }
];

// Mock audit logs
const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    action: 'License Renewal Submitted',
    category: 'licensing',
    user: 'John Smith',
    details: 'Submitted annual license renewal application',
    status: 'success'
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    action: 'Video Surveillance Check',
    category: 'security',
    user: 'System',
    details: 'Automated verification of video surveillance system',
    status: 'success'
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    action: 'Batch Test Results Upload',
    category: 'testing',
    user: 'Lab Tech',
    details: 'Uploaded test results for Batch #2024-0145',
    status: 'success'
  }
];

export function RegulatoryComplianceAutomation() {
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>(mockRequirements);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [activeView, setActiveView] = useState<'dashboard' | 'requirements' | 'tasks' | 'documents' | 'audit' | 'reports' | 'updates'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyNonCompliant, setShowOnlyNonCompliant] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<ComplianceRequirement | null>(null);

  // Calculate compliance metrics
  const calculateMetrics = (): ComplianceMetrics => {
    const totalRequirements = requirements.length;
    const compliantRequirements = requirements.filter(r => r.status === 'compliant').length;
    const overallScore = Math.round((compliantRequirements / totalRequirements) * 100);

    // Calculate category scores
    const categories = ['licensing', 'testing', 'security', 'environmental', 'labeling', 'reporting', 'record-keeping'];
    const categoryScores: Record<string, number> = {};
    
    categories.forEach(category => {
      const catReqs = requirements.filter(r => r.category === category);
      const catCompliant = catReqs.filter(r => r.status === 'compliant').length;
      categoryScores[category] = catReqs.length > 0 ? Math.round((catCompliant / catReqs.length) * 100) : 100;
    });

    // Generate trends data
    const trendsData = Array.from({ length: 6 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (5 - i));
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        score: 85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
        violations: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5),
        tasksCompleted: 20 + Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10)
      };
    });

    const upcomingDeadlines = requirements.filter(r => 
      r.nextDue && r.nextDue.getTime() > Date.now() && r.nextDue.getTime() < Date.now() + 30 * 24 * 60 * 60 * 1000
    ).length;

    const overdueItems = requirements.filter(r => r.status === 'overdue').length;
    
    const automatedReqs = requirements.filter(r => r.automationLevel === 'full').length;
    const automationRate = Math.round((automatedReqs / totalRequirements) * 100);

    return {
      overallScore,
      categoryScores,
      trendsData,
      upcomingDeadlines,
      overdueItems,
      automationRate
    };
  };

  const metrics = calculateMetrics();

  // Filter requirements
  const filteredRequirements = requirements.filter(req => {
    const matchesCategory = selectedCategory === 'all' || req.category === selectedCategory;
    const matchesSearch = req.requirement.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompliance = !showOnlyNonCompliant || req.status !== 'compliant';
    
    return matchesCategory && matchesSearch && matchesCompliance;
  });

  // Get status color
  const getStatusColor = (status: ComplianceRequirement['status']) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'non-compliant': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'overdue': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: ComplianceRequirement['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Get automation icon
  const getAutomationIcon = (level: ComplianceRequirement['automationLevel']) => {
    switch (level) {
      case 'full': return <Zap className="w-4 h-4 text-green-500" />;
      case 'partial': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'manual': return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1'];

  // Generate compliance score data for radial chart
  const getComplianceScoreData = () => [
    {
      name: 'Compliance',
      value: metrics.overallScore,
      fill: metrics.overallScore >= 90 ? '#10B981' : metrics.overallScore >= 70 ? '#F59E0B' : '#EF4444'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-green-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Regulatory Compliance Automation
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Automated tracking and reporting for cannabis compliance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Bell className="w-5 h-5" />
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Compliance Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Overall Compliance</span>
            <Shield className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.overallScore}%</p>
            <span className="text-xs text-green-500">+2% MTD</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${metrics.overallScore}%` }}
            />
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Automation Rate</span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.automationRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Fully automated</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Upcoming Deadlines</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.upcomingDeadlines}</p>
          <p className="text-xs text-gray-500 mt-1">Next 30 days</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Action Required</span>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {requirements.filter(r => r.status === 'non-compliant' || r.status === 'overdue').length}
          </p>
          <p className="text-xs text-orange-500 mt-1">
            {metrics.overdueItems} overdue
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'requirements', label: 'Requirements', icon: ClipboardCheck },
          { id: 'tasks', label: 'Tasks', icon: CheckCircle },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'audit', label: 'Audit Trail', icon: Shield },
          { id: 'reports', label: 'Reports', icon: FileCheck },
          { id: 'updates', label: 'Regulatory Updates', icon: Bell }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeView === tab.id
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === 'tasks' && requirements.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                {requirements.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Views */}
      {activeView === 'dashboard' && (
        <div className="space-y-6">
          {/* Compliance by Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Compliance by Category
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(metrics.categoryScores).map(([category, score]) => ({
                  category: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
                  score,
                  target: 95
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" tick={{ fill: '#6B7280', fontSize: 11 }} angle={-45} textAnchor="end" />
                  <YAxis tick={{ fill: '#6B7280' }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#E5E7EB' }}
                    formatter={(value: number) => `${value}%`}
                  />
                  <Bar dataKey="score" fill="#10B981" />
                  <Bar dataKey="target" fill="#E5E7EB" fillOpacity={0.3} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Compliance Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.trendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fill: '#6B7280' }} />
                  <YAxis tick={{ fill: '#6B7280' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#E5E7EB' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2} name="Compliance Score" />
                  <Line type="monotone" dataKey="violations" stroke="#EF4444" strokeWidth={2} name="Violations" />
                  <Line type="monotone" dataKey="tasksCompleted" stroke="#3B82F6" strokeWidth={2} name="Tasks Completed" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Critical Requirements */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Critical Requirements Status
            </h3>
            <div className="space-y-3">
              {requirements
                .filter(req => req.priority === 'critical')
                .slice(0, 5)
                .map(req => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        req.status === 'compliant' ? 'bg-green-100 dark:bg-green-900/30' :
                        req.status === 'non-compliant' ? 'bg-red-100 dark:bg-red-900/30' :
                        'bg-yellow-100 dark:bg-yellow-900/30'
                      }`}>
                        {req.status === 'compliant' ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : req.status === 'non-compliant' ? (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{req.requirement}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{req.subcategory}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getAutomationIcon(req.automationLevel)}
                      {req.nextDue && (
                        <span className="text-sm text-gray-500">
                          Due {new Date(req.nextDue).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <FileCheck className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="font-medium text-blue-900 dark:text-blue-100">Run Compliance Check</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Verify all requirements</p>
            </button>
            
            <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
              <p className="font-medium text-purple-900 dark:text-purple-100">Upload Evidence</p>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Add compliance docs</p>
            </button>
            
            <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <FileText className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
              <p className="font-medium text-green-900 dark:text-green-100">Generate Reports</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">Compliance reports</p>
            </button>
            
            <button className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
              <Bell className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" />
              <p className="font-medium text-orange-900 dark:text-orange-100">Configure Alerts</p>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">Deadline reminders</p>
            </button>
          </div>
        </div>
      )}

      {activeView === 'requirements' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requirements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="licensing">Licensing</option>
              <option value="testing">Testing</option>
              <option value="security">Security</option>
              <option value="environmental">Environmental</option>
              <option value="labeling">Labeling</option>
              <option value="reporting">Reporting</option>
              <option value="record-keeping">Record Keeping</option>
            </select>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlyNonCompliant}
                onChange={(e) => setShowOnlyNonCompliant(e.target.checked)}
                className="rounded text-green-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show only non-compliant</span>
            </label>
          </div>

          {/* Requirements List */}
          <div className="space-y-4">
            {filteredRequirements.map(req => (
              <div key={req.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      req.status === 'compliant' ? 'bg-green-100 dark:bg-green-900/30' :
                      req.status === 'non-compliant' ? 'bg-red-100 dark:bg-red-900/30' :
                      req.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      req.status === 'overdue' ? 'bg-orange-100 dark:bg-orange-900/30' :
                      'bg-gray-100 dark:bg-gray-900/30'
                    }`}>
                      {req.category === 'licensing' && <Key className="w-5 h-5 text-gray-600" />}
                      {req.category === 'testing' && <FileCheck className="w-5 h-5 text-gray-600" />}
                      {req.category === 'security' && <Lock className="w-5 h-5 text-gray-600" />}
                      {req.category === 'environmental' && <Truck className="w-5 h-5 text-gray-600" />}
                      {req.category === 'reporting' && <FileText className="w-5 h-5 text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{req.requirement}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(req.status)}`}>
                          {req.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(req.priority)}`}>
                          {req.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{req.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{req.subcategory}</span>
                        <span>•</span>
                        <span>{req.frequency}</span>
                        <span>•</span>
                        <span>{req.regulatoryBody}</span>
                        {req.nextDue && (
                          <>
                            <span>•</span>
                            <span>Due {new Date(req.nextDue).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getAutomationIcon(req.automationLevel)}
                    <button
                      onClick={() => setSelectedRequirement(req)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {req.evidence.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Evidence:</span>
                      {req.evidence.map((ev, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 rounded text-xs ${
                            ev.status === 'valid' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : ev.status === 'expired'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}
                        >
                          {ev.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {req.penalties && (
                  <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                    <span className="font-medium">Non-compliance penalty:</span> {req.penalties.description}
                    {req.penalties.amount && ` ($${req.penalties.amount.toLocaleString()})`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'tasks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Compliance Tasks
            </h3>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          </div>

          {/* Task List */}
          <div className="space-y-4">
            {[
              {
                id: 't-001',
                title: 'Submit Monthly METRC Report',
                requirement: 'METRC Reporting',
                assignedTo: 'John Smith',
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                status: 'in-progress',
                priority: 'high'
              },
              {
                id: 't-002',
                title: 'Renew Security System Certificate',
                requirement: '24/7 Video Surveillance',
                assignedTo: 'Security Manager',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: 'pending',
                priority: 'medium'
              },
              {
                id: 't-003',
                title: 'Upload Batch Test Results',
                requirement: 'Batch Testing for Contaminants',
                assignedTo: 'Lab Coordinator',
                dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                status: 'pending',
                priority: 'critical'
              }
            ].map(task => (
              <div key={task.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      task.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                      task.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      'bg-gray-100 dark:bg-gray-900/30'
                    }`}>
                      {task.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : task.status === 'in-progress' ? (
                        <Clock className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">{task.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Related to: {task.requirement}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">
                          <Users className="w-4 h-4 inline mr-1" />
                          {task.assignedTo}
                        </span>
                        <span className="text-gray-500">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Due {task.dueDate.toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          task.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'documents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Compliance Documents
            </h3>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>

          {/* Document Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { category: 'Licenses & Permits', count: 12, icon: Key, color: 'blue' },
              { category: 'Test Results', count: 145, icon: FileCheck, color: 'green' },
              { category: 'Security Records', count: 36, icon: Lock, color: 'purple' },
              { category: 'Training Certificates', count: 24, icon: Users, color: 'orange' },
              { category: 'Inspection Reports', count: 8, icon: ClipboardCheck, color: 'red' },
              { category: 'SOPs & Policies', count: 31, icon: FileText, color: 'gray' }
            ].map((cat, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <cat.icon className={`w-8 h-8 text-${cat.color}-500`} />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{cat.count}</span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">{cat.category}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Last updated {Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 7) + 1} days ago
                </p>
              </div>
            ))}
          </div>

          {/* Recent Documents */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Recent Documents</h4>
            <div className="space-y-3">
              {[
                { name: 'Cultivation License 2024.pdf', type: 'certificate', date: '2024-01-15', status: 'valid' },
                { name: 'Batch_2024_0145_TestResults.pdf', type: 'report', date: '2024-03-18', status: 'valid' },
                { name: 'Security_Audit_Q1_2024.pdf', type: 'report', date: '2024-03-01', status: 'valid' },
                { name: 'Employee_Training_Records.xlsx', type: 'document', date: '2024-03-10', status: 'pending-review' }
              ].map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                      <p className="text-sm text-gray-500">Uploaded {doc.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      doc.status === 'valid' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {doc.status}
                    </span>
                    <button className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'audit' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Audit Trail
            </h3>
            <div className="flex items-center gap-3">
              <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white">
                <option>All Activities</option>
                <option>Document Changes</option>
                <option>Status Updates</option>
                <option>User Actions</option>
              </select>
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Logs
              </button>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {log.timestamp.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {log.user}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {log.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {log.details}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.status === 'success' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : log.status === 'failure'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeView === 'reports' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Compliance Reports
          </h3>

          {/* Report Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Monthly Compliance Summary',
                description: 'Comprehensive overview of all compliance activities',
                lastGenerated: '2024-03-01',
                format: 'PDF',
                icon: FileText
              },
              {
                name: 'Regulatory Audit Report',
                description: 'Detailed audit trail for regulatory inspections',
                lastGenerated: '2024-02-15',
                format: 'PDF',
                icon: ClipboardCheck
              },
              {
                name: 'Testing & Quality Report',
                description: 'All test results and quality metrics',
                lastGenerated: '2024-03-18',
                format: 'Excel',
                icon: FileCheck
              },
              {
                name: 'License Status Report',
                description: 'Current status of all licenses and permits',
                lastGenerated: '2024-03-10',
                format: 'PDF',
                icon: Key
              },
              {
                name: 'Security Compliance Report',
                description: 'Security system compliance and incident logs',
                lastGenerated: '2024-03-05',
                format: 'PDF',
                icon: Shield
              },
              {
                name: 'Training Records Report',
                description: 'Employee training and certification status',
                lastGenerated: '2024-02-28',
                format: 'Excel',
                icon: Users
              }
            ].map((report, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <report.icon className="w-8 h-8 text-green-500" />
                  <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                    {report.format}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">{report.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{report.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Last: {report.lastGenerated}
                  </span>
                  <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                    Generate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'updates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Regulatory Updates
            </h3>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Subscribe to Alerts
            </button>
          </div>

          {/* Recent Updates */}
          <div className="space-y-4">
            {[
              {
                date: new Date('2024-03-15'),
                title: 'New Testing Requirements for Heavy Metals',
                description: 'California DCC announces stricter limits for heavy metal contamination',
                impact: 'high',
                affectedAreas: ['Testing', 'Quality Control'],
                deadline: new Date('2024-04-15')
              },
              {
                date: new Date('2024-03-10'),
                title: 'Updated Security Camera Storage Requirements',
                description: 'Video footage must now be retained for 90 days instead of 60',
                impact: 'medium',
                affectedAreas: ['Security', 'Record Keeping'],
                deadline: new Date('2024-05-01')
              },
              {
                date: new Date('2024-03-05'),
                title: 'METRC System Update',
                description: 'New API endpoints and reporting fields added',
                impact: 'low',
                affectedAreas: ['Reporting', 'Track and Trace'],
                deadline: new Date('2024-03-30')
              }
            ].map((update, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        update.impact === 'high' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : update.impact === 'medium'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {update.impact.toUpperCase()} IMPACT
                      </span>
                      <span className="text-sm text-gray-500">
                        {update.date.toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {update.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {update.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">
                        Affects: {update.affectedAreas.join(', ')}
                      </span>
                      {update.deadline && (
                        <span className="text-orange-600">
                          Deadline: {update.deadline.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for empty circle icon
function Circle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
    </svg>
  );
}