'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FlaskConical,
  Search,
  Filter,
  Plus,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  MoreVertical,
  Beaker,
  Microscope,
  Shield,
  Leaf
} from 'lucide-react';

interface LabTest {
  id: string;
  sampleId: string;
  packageId: string;
  tagId: string;
  strain: string;
  productType: string;
  batchId: string;
  labName: string;
  testType: 'Potency' | 'Pesticides' | 'Heavy Metals' | 'Microbials' | 'Residual Solvents' | 'Full Panel';
  status: 'Sample Sent' | 'In Progress' | 'Completed' | 'Failed' | 'Remediation Required';
  sampleDate: string;
  receivedDate?: string;
  completedDate?: string;
  results?: {
    thc: number;
    cbd: number;
    totalCannabinoids: number;
    terpenes: number;
    moisture: number;
    pesticides: 'Pass' | 'Fail' | 'N/A';
    heavyMetals: 'Pass' | 'Fail' | 'N/A';
    microbials: 'Pass' | 'Fail' | 'N/A';
    residualSolvents: 'Pass' | 'Fail' | 'N/A';
  };
  coaUrl?: string;
  notes: string;
}

export default function TestingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTestType, setFilterTestType] = useState<string>('all');
  const [filterLab, setFilterLab] = useState<string>('all');

  // Mock data
  const labTests: LabTest[] = [
    {
      id: 'LAB-2024-0123',
      sampleId: 'SAMP-2024-0089',
      packageId: 'PKG-2024-0456',
      tagId: '1A4FF0100000000000000456',
      strain: 'Blue Dream',
      productType: 'Flower',
      batchId: 'HB-2024-0032',
      labName: 'Cannabis Testing Lab Inc',
      testType: 'Full Panel',
      status: 'Completed',
      sampleDate: '2024-03-15',
      receivedDate: '2024-03-16',
      completedDate: '2024-03-20',
      results: {
        thc: 22.4,
        cbd: 0.8,
        totalCannabinoids: 24.1,
        terpenes: 2.1,
        moisture: 11.2,
        pesticides: 'Pass',
        heavyMetals: 'Pass',
        microbials: 'Pass',
        residualSolvents: 'N/A'
      },
      coaUrl: '/coa/LAB-2024-0123.pdf',
      notes: 'All tests passed. High quality sample.'
    },
    {
      id: 'LAB-2024-0124',
      sampleId: 'SAMP-2024-0090',
      packageId: 'PKG-2024-0459',
      tagId: '1A4FF0100000000000000459',
      strain: 'OG Kush',
      productType: 'Flower',
      batchId: 'HB-2024-0033',
      labName: 'Green Analytics',
      testType: 'Potency',
      status: 'In Progress',
      sampleDate: '2024-03-18',
      receivedDate: '2024-03-19',
      notes: 'Potency testing in progress'
    },
    {
      id: 'LAB-2024-0125',
      sampleId: 'SAMP-2024-0091',
      packageId: 'PKG-2024-0461',
      tagId: '1A4FF0100000000000000461',
      strain: 'Girl Scout Cookies',
      productType: 'Concentrate',
      batchId: 'HB-2024-0034',
      labName: 'Cannabis Testing Lab Inc',
      testType: 'Full Panel',
      status: 'Failed',
      sampleDate: '2024-03-17',
      receivedDate: '2024-03-18',
      completedDate: '2024-03-21',
      results: {
        thc: 75.2,
        cbd: 2.1,
        totalCannabinoids: 82.3,
        terpenes: 8.4,
        moisture: 3.2,
        pesticides: 'Fail',
        heavyMetals: 'Pass',
        microbials: 'Pass',
        residualSolvents: 'Pass'
      },
      notes: 'Failed pesticide screening. Remediation required.'
    },
    {
      id: 'LAB-2024-0126',
      sampleId: 'SAMP-2024-0092',
      packageId: 'PKG-2024-0462',
      tagId: '1A4FF0100000000000000462',
      strain: 'Purple Haze',
      productType: 'Pre-Roll',
      batchId: 'HB-2024-0035',
      labName: 'Scientific Cannabis',
      testType: 'Microbials',
      status: 'Sample Sent',
      sampleDate: '2024-03-22',
      notes: 'Expedited microbial testing requested'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sample Sent': return 'text-blue-400 bg-blue-900/30';
      case 'In Progress': return 'text-yellow-400 bg-yellow-900/30';
      case 'Completed': return 'text-green-400 bg-green-900/30';
      case 'Failed': return 'text-red-400 bg-red-900/30';
      case 'Remediation Required': return 'text-orange-400 bg-orange-900/30';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const getTestTypeColor = (type: string) => {
    switch (type) {
      case 'Full Panel': return 'text-purple-400';
      case 'Potency': return 'text-green-400';
      case 'Pesticides': return 'text-red-400';
      case 'Heavy Metals': return 'text-orange-400';
      case 'Microbials': return 'text-blue-400';
      case 'Residual Solvents': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getPassFailColor = (result: string) => {
    switch (result) {
      case 'Pass': return 'text-green-400';
      case 'Fail': return 'text-red-400';
      case 'N/A': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const filteredTests = labTests.filter(test => {
    const matchesSearch = test.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.strain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.labName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || test.status === filterStatus;
    const matchesTestType = filterTestType === 'all' || test.testType === filterTestType;
    const matchesLab = filterLab === 'all' || test.labName.includes(filterLab);
    
    return matchesSearch && matchesStatus && matchesTestType && matchesLab;
  });

  const stats = {
    total: labTests.length,
    pending: labTests.filter(t => ['Sample Sent', 'In Progress'].includes(t.status)).length,
    completed: labTests.filter(t => t.status === 'Completed').length,
    failed: labTests.filter(t => ['Failed', 'Remediation Required'].includes(t.status)).length,
    passRate: labTests.filter(t => t.status === 'Completed').length / 
              labTests.filter(t => ['Completed', 'Failed'].includes(t.status)).length * 100,
    avgTurnaround: 4.2 // Mock average turnaround time in days
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateTurnaround = (sampleDate: string, completedDate?: string) => {
    if (!completedDate) return null;
    const diffTime = new Date(completedDate).getTime() - new Date(sampleDate).getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/seed-to-sale" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Seed-to-Sale
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <FlaskConical className="w-8 h-8 text-pink-400" />
                Lab Testing
              </h1>
              <p className="text-gray-400">
                Track sample testing and Certificate of Analysis (COA) results
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Batch COAs
              </button>
              <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Submit Sample
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Tests</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
            <div className="text-sm text-gray-400">Failed</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{stats.passRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Pass Rate</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold">{stats.avgTurnaround}</div>
            <div className="text-sm text-gray-400">Avg Days</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by sample ID, strain, tag, or lab..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Sample Sent">Sample Sent</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
              <option value="Remediation Required">Remediation Required</option>
            </select>
            
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
              value={filterTestType}
              onChange={(e) => setFilterTestType(e.target.value)}
            >
              <option value="all">All Test Types</option>
              <option value="Full Panel">Full Panel</option>
              <option value="Potency">Potency</option>
              <option value="Pesticides">Pesticides</option>
              <option value="Heavy Metals">Heavy Metals</option>
              <option value="Microbials">Microbials</option>
              <option value="Residual Solvents">Residual Solvents</option>
            </select>

            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
              value={filterLab}
              onChange={(e) => setFilterLab(e.target.value)}
            >
              <option value="all">All Labs</option>
              <option value="Cannabis Testing Lab">Cannabis Testing Lab Inc</option>
              <option value="Green Analytics">Green Analytics</option>
              <option value="Scientific Cannabis">Scientific Cannabis</option>
            </select>

            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              More Filters
            </button>
          </div>
        </div>

        {/* Test List */}
        <div className="space-y-4">
          {filteredTests.map((test) => (
            <div key={test.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-xl">{test.strain}</h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                    <span className={`text-sm font-medium ${getTestTypeColor(test.testType)}`}>
                      {test.testType}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>Sample: {test.sampleId}</span>
                    <span>•</span>
                    <span>Tag: {test.tagId}</span>
                    <span>•</span>
                    <span>Lab: {test.labName}</span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                <div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Sample Date
                  </span>
                  <div className="text-sm font-medium mt-1">{formatDate(test.sampleDate)}</div>
                </div>
                {test.receivedDate && (
                  <div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Beaker className="w-3 h-3" />
                      Received
                    </span>
                    <div className="text-sm font-medium mt-1">{formatDate(test.receivedDate)}</div>
                  </div>
                )}
                {test.completedDate && (
                  <div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                    <div className="text-sm font-medium mt-1 text-green-400">{formatDate(test.completedDate)}</div>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    Product Type
                  </span>
                  <div className="text-sm font-medium mt-1">{test.productType}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Batch ID
                  </span>
                  <div className="text-sm font-medium mt-1">{test.batchId}</div>
                </div>
                {test.completedDate && (
                  <div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Turnaround
                    </span>
                    <div className="text-sm font-medium mt-1">
                      {calculateTurnaround(test.sampleDate, test.completedDate)} days
                    </div>
                  </div>
                )}
              </div>

              {/* Test Results */}
              {test.results && (
                <div className="bg-gray-900 rounded-lg p-4 mb-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Microscope className="w-4 h-4" />
                    Test Results
                  </h4>
                  
                  {/* Potency Results */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <span className="text-xs text-gray-400">THC</span>
                      <div className="text-lg font-bold text-green-400">{test.results.thc}%</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">CBD</span>
                      <div className="text-lg font-bold text-blue-400">{test.results.cbd}%</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Total Cannabinoids</span>
                      <div className="text-lg font-bold text-purple-400">{test.results.totalCannabinoids}%</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Terpenes</span>
                      <div className="text-lg font-bold text-orange-400">{test.results.terpenes}%</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Moisture</span>
                      <div className="text-lg font-bold text-gray-300">{test.results.moisture}%</div>
                    </div>
                  </div>

                  {/* Safety Results */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Pesticides</span>
                      <span className={`text-sm font-medium flex items-center gap-1 ${getPassFailColor(test.results.pesticides)}`}>
                        {test.results.pesticides === 'Pass' ? <CheckCircle className="w-4 h-4" /> : 
                         test.results.pesticides === 'Fail' ? <XCircle className="w-4 h-4" /> : null}
                        {test.results.pesticides}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Heavy Metals</span>
                      <span className={`text-sm font-medium flex items-center gap-1 ${getPassFailColor(test.results.heavyMetals)}`}>
                        {test.results.heavyMetals === 'Pass' ? <CheckCircle className="w-4 h-4" /> : 
                         test.results.heavyMetals === 'Fail' ? <XCircle className="w-4 h-4" /> : null}
                        {test.results.heavyMetals}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Microbials</span>
                      <span className={`text-sm font-medium flex items-center gap-1 ${getPassFailColor(test.results.microbials)}`}>
                        {test.results.microbials === 'Pass' ? <CheckCircle className="w-4 h-4" /> : 
                         test.results.microbials === 'Fail' ? <XCircle className="w-4 h-4" /> : null}
                        {test.results.microbials}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Residual Solvents</span>
                      <span className={`text-sm font-medium flex items-center gap-1 ${getPassFailColor(test.results.residualSolvents)}`}>
                        {test.results.residualSolvents === 'Pass' ? <CheckCircle className="w-4 h-4" /> : 
                         test.results.residualSolvents === 'Fail' ? <XCircle className="w-4 h-4" /> : null}
                        {test.results.residualSolvents}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {test.notes && (
                <div className="mb-4">
                  <span className="text-xs text-gray-400">Notes</span>
                  <div className="text-sm mt-1 text-gray-300">{test.notes}</div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <div className="flex items-center gap-4">
                  {test.status === 'In Progress' && (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Testing in Progress</span>
                    </div>
                  )}
                  {test.status === 'Completed' && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">All Tests Passed</span>
                    </div>
                  )}
                  {test.status === 'Failed' && (
                    <div className="flex items-center gap-2 text-red-400">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">Failed Testing</span>
                    </div>
                  )}
                  {test.status === 'Remediation Required' && (
                    <div className="flex items-center gap-2 text-orange-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Requires Remediation</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  {test.coaUrl && (
                    <button className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      Download COA
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lab Performance */}
        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-pink-400" />
            Lab Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium mb-2">Cannabis Testing Lab Inc</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tests Completed:</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Turnaround:</span>
                  <span className="font-medium text-green-400">3.8 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pass Rate:</span>
                  <span className="font-medium text-green-400">94.2%</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium mb-2">Green Analytics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tests Completed:</span>
                  <span className="font-medium">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Turnaround:</span>
                  <span className="font-medium text-yellow-400">4.2 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pass Rate:</span>
                  <span className="font-medium text-green-400">96.1%</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium mb-2">Scientific Cannabis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tests Completed:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Turnaround:</span>
                  <span className="font-medium text-green-400">3.1 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pass Rate:</span>
                  <span className="font-medium text-green-400">100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}