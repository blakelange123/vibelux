'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  GraduationCap,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  Award,
  BookOpen,
  Play,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Download,
  Upload,
  Star,
  FileText,
  Video,
  Monitor
} from 'lucide-react';
import {
  Training,
  TrainingCategory,
  TrainingRecord,
  EmployeeRole
} from '@/lib/workforce/workforce-types';

// Mock training data
const mockTrainings: Training[] = [
  {
    id: '1',
    title: 'Cannabis Safety & Handling',
    description: 'Comprehensive safety training for cannabis cultivation and handling',
    category: TrainingCategory.SAFETY,
    requiredFor: [EmployeeRole.CULTIVATION_TECH, EmployeeRole.LEAD_GROWER, EmployeeRole.HEAD_GROWER],
    duration: 120,
    validityPeriod: 365,
    passingScore: 85,
    content: [
      { type: 'video', title: 'Introduction to Cannabis Safety', url: '/training/safety-intro.mp4', duration: 30 },
      { type: 'document', title: 'Safety Protocols Manual', url: '/training/safety-manual.pdf' },
      { type: 'interactive', title: 'PPE Selection Quiz', url: '/training/ppe-quiz' },
      { type: 'video', title: 'Emergency Procedures', url: '/training/emergency.mp4', duration: 20 }
    ],
    quiz: {
      questions: [],
      passingScore: 85,
      timeLimit: 30
    }
  },
  {
    id: '2',
    title: 'IPM Best Practices',
    description: 'Integrated Pest Management strategies and implementation',
    category: TrainingCategory.CULTIVATION,
    requiredFor: [EmployeeRole.IPM_SPECIALIST, EmployeeRole.LEAD_GROWER, EmployeeRole.HEAD_GROWER],
    duration: 180,
    validityPeriod: 180,
    passingScore: 90,
    content: [
      { type: 'video', title: 'IPM Fundamentals', url: '/training/ipm-basics.mp4', duration: 45 },
      { type: 'slides', title: 'Pest Identification Guide', url: '/training/pest-id.pptx' },
      { type: 'document', title: 'Treatment Protocols', url: '/training/treatments.pdf' },
      { type: 'interactive', title: 'Pest ID Simulation', url: '/training/pest-sim' }
    ],
    quiz: {
      questions: [],
      passingScore: 90,
      timeLimit: 45
    }
  },
  {
    id: '3',
    title: 'GMP Compliance Training',
    description: 'Good Manufacturing Practices for cannabis production',
    category: TrainingCategory.COMPLIANCE,
    requiredFor: [EmployeeRole.PROCESSING_TECH, EmployeeRole.QUALITY_CONTROL, EmployeeRole.MANAGER],
    duration: 90,
    validityPeriod: 365,
    passingScore: 95,
    content: [
      { type: 'video', title: 'GMP Overview', url: '/training/gmp-overview.mp4', duration: 25 },
      { type: 'document', title: 'SOP Library', url: '/training/sops.pdf' },
      { type: 'interactive', title: 'Compliance Checklist', url: '/training/compliance-check' }
    ],
    quiz: {
      questions: [],
      passingScore: 95,
      timeLimit: 30
    }
  },
  {
    id: '4',
    title: 'Equipment Maintenance',
    description: 'Proper maintenance procedures for cultivation equipment',
    category: TrainingCategory.EQUIPMENT,
    requiredFor: [EmployeeRole.MAINTENANCE, EmployeeRole.LEAD_GROWER],
    duration: 150,
    validityPeriod: 180,
    passingScore: 80,
    content: [
      { type: 'video', title: 'Daily Maintenance Routines', url: '/training/daily-maint.mp4', duration: 40 },
      { type: 'document', title: 'Equipment Manuals', url: '/training/equipment.pdf' },
      { type: 'interactive', title: 'Troubleshooting Simulator', url: '/training/troubleshoot' }
    ],
    quiz: {
      questions: [],
      passingScore: 80,
      timeLimit: 30
    }
  }
];

const mockTrainingRecords: (TrainingRecord & { employeeName: string, trainingTitle: string })[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'Sarah Johnson',
    trainingId: '1',
    trainingTitle: 'Cannabis Safety & Handling',
    startDate: new Date('2024-01-10'),
    completionDate: new Date('2024-01-12'),
    score: 92,
    passed: true,
    expiryDate: new Date('2025-01-12')
  },
  {
    id: '2',
    employeeId: '1',
    employeeName: 'Sarah Johnson',
    trainingId: '2',
    trainingTitle: 'IPM Best Practices',
    startDate: new Date('2024-01-15'),
    completionDate: new Date('2024-01-16'),
    score: 95,
    passed: true,
    expiryDate: new Date('2024-07-15')
  },
  {
    id: '3',
    employeeId: '2',
    employeeName: 'Mike Chen',
    trainingId: '1',
    trainingTitle: 'Cannabis Safety & Handling',
    startDate: new Date('2024-01-08'),
    completionDate: new Date('2024-01-10'),
    score: 88,
    passed: true,
    expiryDate: new Date('2025-01-10')
  },
  {
    id: '4',
    employeeId: '3',
    employeeName: 'Jessica Martinez',
    trainingId: '2',
    trainingTitle: 'IPM Best Practices',
    startDate: new Date('2024-01-05'),
    score: 78,
    passed: false
  },
  {
    id: '5',
    employeeId: '3',
    employeeName: 'Jessica Martinez',
    trainingId: '4',
    trainingTitle: 'Equipment Maintenance',
    startDate: new Date('2024-01-20'),
    completionDate: undefined,
    score: undefined,
    passed: false
  }
];

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<'courses' | 'records' | 'compliance'>('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TrainingCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTrainings = mockTrainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || training.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const filteredRecords = mockTrainingRecords.filter(record => {
    return record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           record.trainingTitle.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getCategoryColor = (category: TrainingCategory) => {
    switch (category) {
      case TrainingCategory.SAFETY: return 'bg-red-500/20 text-red-400 border-red-500/30';
      case TrainingCategory.COMPLIANCE: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case TrainingCategory.CULTIVATION: return 'bg-green-500/20 text-green-400 border-green-500/30';
      case TrainingCategory.EQUIPMENT: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case TrainingCategory.QUALITY: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case TrainingCategory.PROCESS: return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'slides': return <Monitor className="w-4 h-4" />;
      case 'interactive': return <Play className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getExpiryStatus = (expiryDate?: Date) => {
    if (!expiryDate) return null;
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', color: 'text-red-400' };
    if (daysUntilExpiry <= 30) return { status: 'expiring', color: 'text-yellow-400' };
    return { status: 'valid', color: 'text-green-400' };
  };

  const trainingStats = {
    totalCourses: mockTrainings.length,
    completedRecords: mockTrainingRecords.filter(r => r.passed).length,
    inProgress: mockTrainingRecords.filter(r => !r.completionDate && r.startDate).length,
    expiring: mockTrainingRecords.filter(r => {
      const status = getExpiryStatus(r.expiryDate);
      return status?.status === 'expiring';
    }).length
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/workforce"
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Training & Certification</h1>
                <p className="text-gray-400">Manage employee training and compliance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import Records
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Course
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex">
            {[
              { id: 'courses', label: 'Training Courses', icon: BookOpen },
              { id: 'records', label: 'Training Records', icon: Award },
              { id: 'compliance', label: 'Compliance Status', icon: CheckCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400">Total Courses</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{trainingStats.totalCourses}</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-400">Completed</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{trainingStats.completedRecords}</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400">In Progress</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">{trainingStats.inProgress}</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-400">Expiring Soon</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">{trainingStats.expiring}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search training..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
            />
          </div>
          {activeTab === 'courses' && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && activeTab === 'courses' && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as TrainingCategory | 'all')}
                className="w-full max-w-xs px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {Object.values(TrainingCategory).map(category => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Training Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {filteredTrainings.map((training) => (
              <div key={training.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{training.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(training.category)}`}>
                        {training.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-4">{training.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{training.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{training.requiredFor.length} roles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <span>{training.passingScore}% to pass</span>
                      </div>
                      {training.validityPeriod && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Valid {training.validityPeriod} days</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Start Training
                    </button>
                  </div>
                </div>

                {/* Training Content */}
                <div>
                  <h4 className="font-medium mb-3">Course Content</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {training.content.map((content, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                        {getContentTypeIcon(content.type)}
                        <div className="flex-1">
                          <div className="font-medium text-sm">{content.title}</div>
                          {content.duration && (
                            <div className="text-xs text-gray-400">{content.duration} minutes</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Training Records Tab */}
        {activeTab === 'records' && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Employee</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Training</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Started</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Completed</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Score</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Expires</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const expiryStatus = getExpiryStatus(record.expiryDate);
                  return (
                    <tr key={record.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="p-4">
                        <div className="font-medium">{record.employeeName}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{record.trainingTitle}</div>
                      </td>
                      <td className="p-4 text-gray-300">
                        {record.startDate.toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {record.completionDate ? (
                          <span className="text-green-400">{record.completionDate.toLocaleDateString()}</span>
                        ) : (
                          <span className="text-yellow-400">In Progress</span>
                        )}
                      </td>
                      <td className="p-4">
                        {record.score ? (
                          <span className={`font-medium ${record.passed ? 'text-green-400' : 'text-red-400'}`}>
                            {record.score}%
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {record.completionDate ? (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            record.passed 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {record.passed ? 'Passed' : 'Failed'}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                            In Progress
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {record.expiryDate ? (
                          <span className={expiryStatus?.color}>
                            {record.expiryDate.toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Compliance Status Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Compliance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">85%</div>
                  <div className="text-sm text-gray-400">Overall Compliance</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">3</div>
                  <div className="text-sm text-gray-400">Expiring This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">2</div>
                  <div className="text-sm text-gray-400">Overdue</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Required Training by Role</h3>
              <div className="space-y-4">
                {Object.values(EmployeeRole).slice(0, 5).map((role) => (
                  <div key={role} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium">{role.replace('_', ' ').charAt(0).toUpperCase() + role.replace('_', ' ').slice(1).toLowerCase()}</div>
                      <div className="text-sm text-gray-400">4 required trainings</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-600 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Export Compliance Reports</h3>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-left">
                  <h4 className="font-medium mb-2">Employee Compliance</h4>
                  <p className="text-sm text-gray-400">Individual compliance status</p>
                </button>
                <button className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-left">
                  <h4 className="font-medium mb-2">Expiring Certifications</h4>
                  <p className="text-sm text-gray-400">Upcoming renewal requirements</p>
                </button>
                <button className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-left">
                  <h4 className="font-medium mb-2">Training Summary</h4>
                  <p className="text-sm text-gray-400">Overall training metrics</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}