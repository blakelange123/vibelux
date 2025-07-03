'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar as CalendarIcon,
  FileText,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
  BarChart3,
  Filter,
  Search,
  ExternalLink,
  BookOpen,
  Target,
  Zap,
  Bell,
  ChevronRight
} from 'lucide-react';
import {
  Certification,
  CertificationRequirement,
  RenewalRequirement,
  TrainingRecord,
  Badge as BadgeType,
  AssessmentResult,
  TrainingProgram,
  ProgressStatus
} from '@/lib/training/training-types';

interface CertificationManagerProps {
  userId: string;
  employeeRole: string;
  department: string;
}

interface CertificationStatus {
  certification: Certification;
  isActive: boolean;
  expiryDate?: Date;
  progress: number;
  completedRequirements: string[];
  pendingRequirements: string[];
  canRenew: boolean;
  daysUntilExpiry?: number;
}

interface ComplianceReport {
  department: string;
  totalEmployees: number;
  compliantEmployees: number;
  complianceRate: number;
  expiringCertifications: number;
  overdueRenewals: number;
  certificationBreakdown: {
    certificationId: string;
    name: string;
    compliant: number;
    nonCompliant: number;
    expiringSoon: number;
  }[];
}

export default function CertificationManager({ userId, employeeRole, department }: CertificationManagerProps) {
  const [certificationStatuses, setCertificationStatuses] = useState<CertificationStatus[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [selectedCertification, setSelectedCertification] = useState<CertificationStatus | null>(null);
  const [upcomingTests, setUpcomingTests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'pending'>('all');

  useEffect(() => {
    loadCertificationData();
    loadComplianceReport();
  }, [userId, department]);

  const loadCertificationData = async () => {
    // In a real app, this would fetch from API
    setCertificationStatuses(mockCertificationStatuses);
    setTrainingRecords(mockTrainingRecords);
    setAssessmentResults(mockAssessmentResults);
    setUpcomingTests(mockUpcomingTests);
  };

  const loadComplianceReport = async () => {
    // Load compliance data for the department
    setComplianceReport(mockComplianceReport);
  };

  const getStatusColor = (status: CertificationStatus) => {
    if (!status.isActive) return 'bg-gray-500';
    if (status.daysUntilExpiry && status.daysUntilExpiry < 30) return 'bg-yellow-500';
    if (status.daysUntilExpiry && status.daysUntilExpiry < 7) return 'bg-red-500';
    return 'bg-green-500';
  };

  const getStatusText = (status: CertificationStatus) => {
    if (!status.isActive) return 'Expired';
    if (status.progress < 100) return 'In Progress';
    if (status.daysUntilExpiry && status.daysUntilExpiry < 30) return 'Expiring Soon';
    return 'Active';
  };

  const downloadCertificate = async (certificationId: string) => {
    // Generate and download certificate PDF
  };

  const scheduleAssessment = (certificationId: string) => {
    // Open assessment scheduling modal
  };

  const startRenewal = (certificationId: string) => {
    // Start renewal process
  };

  const filteredCertifications = certificationStatuses.filter(status => {
    const matchesSearch = status.certification.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         status.certification.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && status.isActive && status.progress === 100) ||
                         (filterStatus === 'expired' && !status.isActive) ||
                         (filterStatus === 'pending' && status.progress < 100);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Certification Manager</h1>
          <p className="text-gray-400 mt-1">Track certifications, schedule tests, and maintain compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Compliance Report
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
            <Award className="h-4 w-4" />
            Browse Certifications
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Certifications</p>
              <p className="text-2xl font-bold text-white mt-1">
                {certificationStatuses.filter(s => s.isActive).length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Expiring Soon</p>
              <p className="text-2xl font-bold text-white mt-1">
                {certificationStatuses.filter(s => s.daysUntilExpiry && s.daysUntilExpiry < 30).length}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Compliance Rate</p>
              <p className="text-2xl font-bold text-white mt-1">
                {complianceReport ? `${complianceReport.complianceRate}%` : '0%'}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Upcoming Tests</p>
              <p className="text-2xl font-bold text-white mt-1">{upcomingTests.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-900 border-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Test Schedule</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search certifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-600"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'expired', 'pending'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Certification Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCertifications.map((status) => (
              <Card key={status.certification.id} className="bg-gray-900 border-gray-800 p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                        <Award className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{status.certification.name}</h3>
                        <p className="text-sm text-gray-400">{status.certification.issuingBody}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(status)}>
                      {getStatusText(status)}
                    </Badge>
                  </div>

                  {/* Progress */}
                  {status.progress < 100 && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{status.progress}%</span>
                      </div>
                      <Progress value={status.progress} className="h-2" />
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-2">
                    {status.isActive && status.expiryDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Expires</span>
                        <span className="text-white">
                          {status.expiryDate.toLocaleDateString()} ({status.daysUntilExpiry} days)
                        </span>
                      </div>
                    )}
                    
                    {status.pendingRequirements.length > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Pending Requirements</span>
                        <span className="text-white">{status.pendingRequirements.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {status.isActive && status.progress === 100 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadCertificate(status.certification.id)}
                        className="flex-1 gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    )}
                    {status.progress < 100 && (
                      <Button
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => setSelectedCertification(status)}
                      >
                        <BookOpen className="h-4 w-4" />
                        Continue
                      </Button>
                    )}
                    {status.canRenew && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startRenewal(status.certification.id)}
                        className="flex-1 gap-1"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Renew
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedCertification(status)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          {/* Calendar View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-gray-900 border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Test Calendar</h3>
                <Calendar
                  mode="single"
                  className="rounded-md border border-gray-800"
                />
              </Card>
            </div>
            
            <div>
              <Card className="bg-gray-900 border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Upcoming Tests</h3>
                <div className="space-y-3">
                  {upcomingTests.map((test) => (
                    <div key={test.id} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{test.title}</h4>
                        <Badge variant="outline">{test.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{test.date}</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          Schedule
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          {/* Department Compliance Overview */}
          {complianceReport && (
            <>
              <Card className="bg-gray-900 border-gray-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Department Compliance Overview</h3>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    Export Report
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {complianceReport.complianceRate}%
                    </div>
                    <p className="text-sm text-gray-400">Overall Compliance</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500 mb-1">
                      {complianceReport.expiringCertifications}
                    </div>
                    <p className="text-sm text-gray-400">Expiring Soon</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500 mb-1">
                      {complianceReport.overdueRenewals}
                    </div>
                    <p className="text-sm text-gray-400">Overdue Renewals</p>
                  </div>
                </div>
              </Card>

              {/* Certification Breakdown */}
              <Card className="bg-gray-900 border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Certification Breakdown</h3>
                <div className="space-y-4">
                  {complianceReport.certificationBreakdown.map((cert) => (
                    <div key={cert.certificationId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white">{cert.name}</h4>
                        <span className="text-sm text-gray-400">
                          {cert.compliant} of {cert.compliant + cert.nonCompliant} compliant
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-green-600/20 rounded h-2">
                          <div
                            className="bg-green-600 h-full rounded"
                            style={{ width: `${(cert.compliant / (cert.compliant + cert.nonCompliant)) * 100}%` }}
                          />
                        </div>
                      </div>
                      {cert.expiringSoon > 0 && (
                        <p className="text-sm text-yellow-500">
                          {cert.expiringSoon} expiring within 30 days
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Training Records */}
          <Card className="bg-gray-900 border-gray-800">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Training History</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-800">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Training</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Score</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {trainingRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-800/50">
                        <td className="py-3 px-4 text-sm text-white">
                          {/* Would fetch training name by ID */}
                          Training Program {record.trainingId}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {record.completionDate?.toLocaleDateString() || 'In Progress'}
                        </td>
                        <td className="py-3 px-4 text-sm text-white">
                          {record.score || '-'}%
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={record.passed ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {record.passed ? 'Passed' : 'Failed'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {record.certificateUrl && (
                            <Button size="sm" variant="ghost" className="gap-1">
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Certification Details Modal */}
      {selectedCertification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-900 border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedCertification.certification.name}
                  </h2>
                  <p className="text-gray-400 mt-1">
                    {selectedCertification.certification.issuingBody}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCertification(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                  <p className="text-gray-300">{selectedCertification.certification.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Requirements</h3>
                  <div className="space-y-2">
                    {selectedCertification.completedRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-green-500">
                        <CheckCircle className="h-4 w-4" />
                        <span>{req}</span>
                      </div>
                    ))}
                    {selectedCertification.pendingRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-400">
                        <div className="h-4 w-4 rounded-full border-2 border-gray-600" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedCertification.certification.renewalRequirements && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Renewal Requirements</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>
                        {selectedCertification.certification.renewalRequirements.continuingEducationHours} hours of continuing education
                      </li>
                      {selectedCertification.certification.renewalRequirements.practicalAssessment && (
                        <li>Practical assessment required</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3">
                  {selectedCertification.progress < 100 && (
                    <Button className="flex-1">
                      Continue Training
                    </Button>
                  )}
                  {selectedCertification.isActive && selectedCertification.progress === 100 && (
                    <Button variant="outline" className="flex-1">
                      Download Certificate
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setSelectedCertification(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Mock data for demonstration
const mockCertificationStatuses: CertificationStatus[] = [
  {
    certification: {
      id: 'cert1',
      name: 'Good Manufacturing Practices (GMP)',
      description: 'Comprehensive GMP certification for cannabis manufacturing',
      issuingBody: 'Cannabis Compliance Institute',
      requirements: {
        requiredCourses: ['course1', 'course2'],
        minimumScore: 80,
        practicalAssessment: true
      },
      validityPeriod: 365,
      renewalRequirements: {
        continuingEducationHours: 8,
        practicalAssessment: true,
        renewalPeriod: 30
      },
      certificateTemplate: 'gmp-template'
    },
    isActive: true,
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    progress: 100,
    completedRequirements: ['GMP Fundamentals Course', 'Quality Control Course', 'Practical Assessment'],
    pendingRequirements: [],
    canRenew: true,
    daysUntilExpiry: 60
  },
  {
    certification: {
      id: 'cert2',
      name: 'Pesticide Applicator License',
      description: 'State-required pesticide applicator certification',
      issuingBody: 'State Department of Agriculture',
      requirements: {
        requiredCourses: ['course3'],
        minimumScore: 75,
        experienceHours: 40
      },
      validityPeriod: 730,
      certificateTemplate: 'pesticide-template'
    },
    isActive: false,
    progress: 100,
    completedRequirements: ['Pesticide Safety Course', 'Field Experience'],
    pendingRequirements: [],
    canRenew: true,
    daysUntilExpiry: -10 // Expired 10 days ago
  },
  {
    certification: {
      id: 'cert3',
      name: 'Cannabis Cultivation Specialist',
      description: 'Advanced cultivation techniques certification',
      issuingBody: 'Professional Cannabis Growers Association',
      requirements: {
        requiredCourses: ['course4', 'course5'],
        minimumScore: 85,
        experienceHours: 100
      },
      validityPeriod: 1095,
      certificateTemplate: 'cultivation-template'
    },
    isActive: false,
    progress: 65,
    completedRequirements: ['Basic Cultivation Course'],
    pendingRequirements: ['Advanced Techniques Course', 'Field Experience (60/100 hours)'],
    canRenew: false,
    daysUntilExpiry: undefined
  }
];

const mockTrainingRecords: TrainingRecord[] = [
  {
    id: 'tr1',
    employeeId: 'user1',
    trainingId: 'training1',
    startDate: new Date('2024-01-15'),
    completionDate: new Date('2024-01-20'),
    score: 92,
    passed: true,
    certificateUrl: '/certificates/tr1.pdf',
    expiryDate: new Date('2025-01-20')
  },
  {
    id: 'tr2',
    employeeId: 'user1',
    trainingId: 'training2',
    startDate: new Date('2024-02-01'),
    completionDate: new Date('2024-02-10'),
    score: 78,
    passed: true,
    certificateUrl: '/certificates/tr2.pdf'
  }
];

const mockAssessmentResults: AssessmentResult[] = [
  {
    id: 'ar1',
    assessmentId: 'assess1',
    userId: 'user1',
    score: 85,
    passed: true,
    answers: [],
    startedAt: new Date('2024-01-19'),
    submittedAt: new Date('2024-01-19'),
    timeTaken: 45,
    attempt: 1
  }
];

const mockUpcomingTests = [
  {
    id: 'test1',
    title: 'GMP Renewal Assessment',
    type: 'Practical',
    date: '2024-03-15',
    location: 'Training Center Room A'
  },
  {
    id: 'test2',
    title: 'Pesticide Safety Exam',
    type: 'Written',
    date: '2024-03-20',
    location: 'Online'
  }
];

const mockComplianceReport: ComplianceReport = {
  department: 'Cultivation',
  totalEmployees: 45,
  compliantEmployees: 38,
  complianceRate: 84,
  expiringCertifications: 7,
  overdueRenewals: 2,
  certificationBreakdown: [
    {
      certificationId: 'cert1',
      name: 'GMP Certification',
      compliant: 38,
      nonCompliant: 7,
      expiringSoon: 5
    },
    {
      certificationId: 'cert2',
      name: 'Pesticide License',
      compliant: 22,
      nonCompliant: 23,
      expiringSoon: 2
    }
  ]
};