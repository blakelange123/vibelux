'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  FileText,
  Download
} from 'lucide-react';

interface CAPA {
  id: string;
  type: 'Corrective' | 'Preventive';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Implemented' | 'Verified' | 'Closed';
  description: string;
  rootCause: string;
  issueDate: string;
  targetDate: string;
  responsiblePerson: string;
  relatedBatches: string[];
  effectiveness: number;
}

export default function CAPAManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Mock data
  const capas: CAPA[] = [
    {
      id: 'CAPA-2024-0089',
      type: 'Corrective',
      priority: 'Critical',
      status: 'In Progress',
      description: 'Multiple batches failed microbial testing for yeast/mold',
      rootCause: 'HVAC system contamination in flowering room 3',
      issueDate: '2024-03-10',
      targetDate: '2024-03-25',
      responsiblePerson: 'John Smith',
      relatedBatches: ['B240308', 'B240309', 'B240310'],
      effectiveness: 0
    },
    {
      id: 'CAPA-2024-0088',
      type: 'Preventive',
      priority: 'High',
      status: 'Implemented',
      description: 'Update SOPs for equipment cleaning validation',
      rootCause: 'Gap identified during internal audit',
      issueDate: '2024-03-05',
      targetDate: '2024-03-20',
      responsiblePerson: 'Sarah Johnson',
      relatedBatches: [],
      effectiveness: 85
    },
    {
      id: 'CAPA-2024-0087',
      type: 'Corrective',
      priority: 'Medium',
      status: 'Verified',
      description: 'Employee training records incomplete',
      rootCause: 'Training tracking system not properly utilized',
      issueDate: '2024-02-28',
      targetDate: '2024-03-15',
      responsiblePerson: 'Mike Davis',
      relatedBatches: [],
      effectiveness: 92
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-red-400 bg-red-900/30';
      case 'In Progress': return 'text-yellow-400 bg-yellow-900/30';
      case 'Implemented': return 'text-blue-400 bg-blue-900/30';
      case 'Verified': return 'text-purple-400 bg-purple-900/30';
      case 'Closed': return 'text-green-400 bg-green-900/30';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-400';
      case 'High': return 'text-orange-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const filteredCAPAs = capas.filter(capa => {
    const matchesSearch = capa.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         capa.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || capa.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || capa.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
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
                <AlertTriangle className="w-8 h-8 text-orange-400" />
                CAPA Management
              </h1>
              <p className="text-gray-400">
                Track corrective and preventive actions to improve quality
              </p>
            </div>
            
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New CAPA
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold">15</div>
            <div className="text-sm text-gray-400">Total CAPAs</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-red-400">3</div>
            <div className="text-sm text-gray-400">Critical</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">5</div>
            <div className="text-sm text-gray-400">In Progress</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-orange-400">2</div>
            <div className="text-sm text-gray-400">Overdue</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">18.5</div>
            <div className="text-sm text-gray-400">Avg Days to Close</div>
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
                  placeholder="Search CAPA ID or description..."
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
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Implemented">Implemented</option>
              <option value="Verified">Verified</option>
              <option value="Closed">Closed</option>
            </select>
            
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>

        {/* CAPA List */}
        <div className="space-y-4">
          {filteredCAPAs.map((capa) => (
            <div key={capa.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{capa.id}</h3>
                    <span className={`text-sm px-2 py-1 rounded ${capa.type === 'Corrective' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}>
                      {capa.type}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${getStatusColor(capa.status)}`}>
                      {capa.status}
                    </span>
                  </div>
                  <p className="text-gray-300">{capa.description}</p>
                </div>
                
                <div className={`text-2xl font-bold ${getPriorityColor(capa.priority)}`}>
                  {capa.priority}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Root Cause</h4>
                  <p className="text-sm text-gray-300">{capa.rootCause}</p>
                </div>
                
                {capa.relatedBatches.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-1">Related Batches</h4>
                    <div className="flex flex-wrap gap-2">
                      {capa.relatedBatches.map(batch => (
                        <span key={batch} className="text-xs bg-gray-700 px-2 py-1 rounded">
                          {batch}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-6 text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Issued: {capa.issueDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Target: {capa.targetDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{capa.responsiblePerson}</span>
                  </div>
                </div>

                {capa.effectiveness > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Effectiveness:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${capa.effectiveness}%` }}
                        />
                      </div>
                      <span className="text-green-400">{capa.effectiveness}%</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-700">
                <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  View Details
                </button>
                <button className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Update Progress
                </button>
                <button className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Verify Effectiveness
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trend Analysis */}
        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            CAPA Trends
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Top Root Causes</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Training Issues</span>
                  <span className="text-gray-400">28%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Equipment Failure</span>
                  <span className="text-gray-400">22%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Process Deviation</span>
                  <span className="text-gray-400">18%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Closure Rate</h4>
              <div className="text-3xl font-bold text-green-400">87%</div>
              <div className="text-sm text-gray-500">Within target time</div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Recurrence Rate</h4>
              <div className="text-3xl font-bold text-yellow-400">12%</div>
              <div className="text-sm text-gray-500">Similar issues within 6 months</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}