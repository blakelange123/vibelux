'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FlaskConical,
  Search,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  QrCode,
  TrendingUp,
  Calendar,
  Award
} from 'lucide-react';

interface LabResult {
  id: string;
  batchId: string;
  strain: string;
  labName: string;
  sampleId: string;
  testDate: string;
  receiveDate: string;
  status: 'Passed' | 'Failed' | 'Pending' | 'Retesting';
  cannabinoids: {
    thc: number;
    cbd: number;
    total: number;
  };
  contaminants: {
    pesticides: 'Pass' | 'Fail';
    heavyMetals: 'Pass' | 'Fail';
    microbials: 'Pass' | 'Fail';
    mycotoxins: 'Pass' | 'Fail';
  };
  coaAvailable: boolean;
}

export default function LabResultsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('30days');

  // Mock data
  const labResults: LabResult[] = [
    {
      id: 'LAB-2024-0456',
      batchId: 'B240315',
      strain: 'Blue Dream',
      labName: 'ProVerde Laboratories',
      sampleId: 'PV-24-0789',
      testDate: '2024-03-15',
      receiveDate: '2024-03-17',
      status: 'Passed',
      cannabinoids: { thc: 18.5, cbd: 0.3, total: 21.2 },
      contaminants: {
        pesticides: 'Pass',
        heavyMetals: 'Pass',
        microbials: 'Pass',
        mycotoxins: 'Pass'
      },
      coaAvailable: true
    },
    {
      id: 'LAB-2024-0455',
      batchId: 'B240314',
      strain: 'OG Kush',
      labName: 'MCR Labs',
      sampleId: 'MCR-24-1234',
      testDate: '2024-03-14',
      receiveDate: '2024-03-16',
      status: 'Failed',
      cannabinoids: { thc: 22.1, cbd: 0.1, total: 25.8 },
      contaminants: {
        pesticides: 'Pass',
        heavyMetals: 'Pass',
        microbials: 'Fail',
        mycotoxins: 'Pass'
      },
      coaAvailable: false
    },
    {
      id: 'LAB-2024-0454',
      batchId: 'B240313',
      strain: 'Girl Scout Cookies',
      labName: 'ProVerde Laboratories',
      sampleId: 'PV-24-0788',
      testDate: '2024-03-13',
      receiveDate: '2024-03-15',
      status: 'Retesting',
      cannabinoids: { thc: 20.3, cbd: 0.5, total: 23.7 },
      contaminants: {
        pesticides: 'Pass',
        heavyMetals: 'Pass',
        microbials: 'Pass',
        mycotoxins: 'Fail'
      },
      coaAvailable: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Passed': return 'text-green-400 bg-green-900/30';
      case 'Failed': return 'text-red-400 bg-red-900/30';
      case 'Pending': return 'text-yellow-400 bg-yellow-900/30';
      case 'Retesting': return 'text-orange-400 bg-orange-900/30';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const getTestIcon = (result: string) => {
    if (result === 'Pass') {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  const filteredResults = labResults.filter(result => {
    const matchesSearch = result.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.strain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.sampleId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/quality" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Quality Management
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <FlaskConical className="w-8 h-8 text-purple-400" />
                Lab Results & COAs
              </h1>
              <p className="text-gray-400">
                Manage test results and certificates of analysis
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Import Results
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                New Test
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold">456</div>
            <div className="text-sm text-gray-400">Total Tests</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">94%</div>
            <div className="text-sm text-gray-400">Pass Rate</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">8</div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-red-400">3</div>
            <div className="text-sm text-gray-400">Failed</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold">2.1</div>
            <div className="text-sm text-gray-400">Avg Days</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold">$125</div>
            <div className="text-sm text-gray-400">Avg Cost</div>
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
                  placeholder="Search batch, strain, or sample ID..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
              <option value="Pending">Pending</option>
              <option value="Retesting">Retesting</option>
            </select>
            
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>

            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Sample Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Cannabinoids
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Contaminants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{result.batchId} - {result.strain}</div>
                        <div className="text-xs text-gray-400">
                          {result.labName} | Sample: {result.sampleId}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Tested: {result.testDate} | Received: {result.receiveDate}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-gray-400">THC:</span>
                          <span className="text-white ml-1">{result.cannabinoids.thc}%</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-400">CBD:</span>
                          <span className="text-white ml-1">{result.cannabinoids.cbd}%</span>
                        </div>
                        <div className="text-sm font-medium">
                          <span className="text-gray-400">Total:</span>
                          <span className="text-green-400 ml-1">{result.cannabinoids.total}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1">
                          {getTestIcon(result.contaminants.pesticides)}
                          <span className="text-xs">Pesticides</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getTestIcon(result.contaminants.heavyMetals)}
                          <span className="text-xs">Metals</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getTestIcon(result.contaminants.microbials)}
                          <span className="text-xs">Microbials</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getTestIcon(result.contaminants.mycotoxins)}
                          <span className="text-xs">Mycotoxins</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm px-2 py-1 rounded ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                        {result.coaAvailable && (
                          <Award className="w-4 h-4 text-green-400" title="COA Available" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-400 hover:text-blue-300">
                          <FileText className="w-4 h-4" title="View Details" />
                        </button>
                        {result.coaAvailable && (
                          <button className="text-green-400 hover:text-green-300">
                            <Download className="w-4 h-4" title="Download COA" />
                          </button>
                        )}
                        <button className="text-purple-400 hover:text-purple-300">
                          <QrCode className="w-4 h-4" title="Generate QR Code" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Testing Trends */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Testing Performance
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Pesticides Pass Rate</span>
                  <span className="text-green-400">98.5%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.5%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Heavy Metals Pass Rate</span>
                  <span className="text-green-400">99.2%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.2%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Microbials Pass Rate</span>
                  <span className="text-yellow-400">92.1%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '92.1%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Mycotoxins Pass Rate</span>
                  <span className="text-green-400">97.8%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '97.8%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-purple-400" />
              Lab Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                <div>
                  <div className="font-medium">ProVerde Laboratories</div>
                  <div className="text-sm text-gray-400">278 tests | 1.8 days avg</div>
                </div>
                <div className="text-green-400">96.8%</div>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                <div>
                  <div className="font-medium">MCR Labs</div>
                  <div className="text-sm text-gray-400">156 tests | 2.3 days avg</div>
                </div>
                <div className="text-green-400">94.2%</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">CDX Analytics</div>
                  <div className="text-sm text-gray-400">22 tests | 2.5 days avg</div>
                </div>
                <div className="text-yellow-400">91.5%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}