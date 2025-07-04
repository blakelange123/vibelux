'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Calendar,
  Scale,
  MapPin,
  User,
  FileText,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  Recycle,
  Flame,
  Shovel,
  Truck,
  Shield
} from 'lucide-react';

interface WasteRecord {
  id: string;
  date: string;
  type: 'Plant' | 'Product' | 'Byproduct';
  reason: 'Disease' | 'Pest Contamination' | 'Failed Testing' | 'Damage' | 'Expiration' | 'Other';
  weight: number;
  unitOfMeasure: string;
  method: 'Compost' | 'Burn' | 'Bury' | 'Waste Management' | 'Rendered Unusable';
  plantIds: string[];
  packageIds: string[];
  strains: string[];
  witnessName: string;
  witnessSignature?: string;
  notes: string;
  reportedToState: boolean;
  stateReportId?: string;
  photos?: string[];
  createdBy: string;
  approvedBy?: string;
  status: 'Pending' | 'Approved' | 'Destroyed' | 'Reported';
}

export default function WastePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterReason, setFilterReason] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data
  const wasteRecords: WasteRecord[] = [
    {
      id: 'WASTE-2024-0001',
      date: '2024-03-20',
      type: 'Plant',
      reason: 'Disease',
      weight: 12.5,
      unitOfMeasure: 'lbs',
      method: 'Rendered Unusable',
      plantIds: ['PLANT-001', 'PLANT-002', 'PLANT-003'],
      packageIds: [],
      strains: ['Blue Dream', 'OG Kush'],
      witnessName: 'Sarah Johnson',
      witnessSignature: '/signatures/sarah-johnson-20240320.jpg',
      notes: 'Plants showing signs of powdery mildew. Destroyed per IPM protocol.',
      reportedToState: true,
      stateReportId: 'CA-WASTE-20240320-001',
      photos: ['/waste-photos/waste-2024-0001-1.jpg', '/waste-photos/waste-2024-0001-2.jpg'],
      createdBy: 'Mike Thompson',
      approvedBy: 'Dr. Lisa Chen',
      status: 'Reported'
    },
    {
      id: 'WASTE-2024-0002',
      date: '2024-03-18',
      type: 'Product',
      reason: 'Failed Testing',
      weight: 3.2,
      unitOfMeasure: 'lbs',
      method: 'Rendered Unusable',
      plantIds: [],
      packageIds: ['PKG-2024-0461'],
      strains: ['Girl Scout Cookies'],
      witnessName: 'Robert Davis',
      notes: 'Concentrate failed pesticide screening. Remediation not viable.',
      reportedToState: true,
      stateReportId: 'CA-WASTE-20240318-002',
      createdBy: 'Alex Rivera',
      approvedBy: 'Dr. Lisa Chen',
      status: 'Reported'
    },
    {
      id: 'WASTE-2024-0003',
      date: '2024-03-22',
      type: 'Byproduct',
      reason: 'Other',
      weight: 8.7,
      unitOfMeasure: 'lbs',
      method: 'Compost',
      plantIds: [],
      packageIds: [],
      strains: ['Various'],
      witnessName: 'Maria Garcia',
      notes: 'Trim waste from processing operations. Composted on-site.',
      reportedToState: false,
      createdBy: 'James Wilson',
      status: 'Destroyed'
    },
    {
      id: 'WASTE-2024-0004',
      date: '2024-03-21',
      type: 'Plant',
      reason: 'Damage',
      weight: 2.1,
      unitOfMeasure: 'lbs',
      method: 'Rendered Unusable',
      plantIds: ['PLANT-004'],
      packageIds: [],
      strains: ['Purple Haze'],
      witnessName: 'Jennifer Lee',
      notes: 'Plant damaged during facility maintenance. Stem broken beyond repair.',
      reportedToState: true,
      createdBy: 'Tom Anderson',
      status: 'Pending'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Plant': return 'text-green-400';
      case 'Product': return 'text-purple-400';
      case 'Byproduct': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'Disease': return 'text-red-400';
      case 'Pest Contamination': return 'text-red-400';
      case 'Failed Testing': return 'text-red-400';
      case 'Damage': return 'text-orange-400';
      case 'Expiration': return 'text-yellow-400';
      case 'Other': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Compost': return Recycle;
      case 'Burn': return Flame;
      case 'Bury': return Shovel;
      case 'Waste Management': return Truck;
      case 'Rendered Unusable': return Trash2;
      default: return Trash2;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-400 bg-yellow-900/30';
      case 'Approved': return 'text-blue-400 bg-blue-900/30';
      case 'Destroyed': return 'text-orange-400 bg-orange-900/30';
      case 'Reported': return 'text-green-400 bg-green-900/30';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const filteredRecords = wasteRecords.filter(record => {
    const matchesSearch = record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.strains.some(strain => strain.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         record.witnessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.type === filterType;
    const matchesReason = filterReason === 'all' || record.reason === filterReason;
    const matchesMethod = filterMethod === 'all' || record.method === filterMethod;
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    
    return matchesSearch && matchesType && matchesReason && matchesMethod && matchesStatus;
  });

  const stats = {
    total: wasteRecords.length,
    ytdWeight: wasteRecords.reduce((sum, r) => sum + r.weight, 0),
    thisMonth: wasteRecords.filter(r => new Date(r.date).getMonth() === new Date().getMonth()).length,
    reportedToState: wasteRecords.filter(r => r.reportedToState).length,
    complianceRate: (wasteRecords.filter(r => r.reportedToState).length / wasteRecords.length) * 100,
    pending: wasteRecords.filter(r => r.status === 'Pending').length
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
                <AlertTriangle className="w-8 h-8 text-red-400" />
                Waste Tracking
              </h1>
              <p className="text-gray-400">
                Record and track all plant and product waste disposal
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Waste Report
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Record Waste
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Records</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold">{stats.ytdWeight.toFixed(1)}</div>
            <div className="text-sm text-gray-400">YTD Weight (lbs)</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">{stats.thisMonth}</div>
            <div className="text-sm text-gray-400">This Month</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{stats.reportedToState}</div>
            <div className="text-sm text-gray-400">Reported</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{stats.complianceRate.toFixed(0)}%</div>
            <div className="text-sm text-gray-400">Compliance Rate</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ID, strain, witness, or notes..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Plant">Plant</option>
              <option value="Product">Product</option>
              <option value="Byproduct">Byproduct</option>
            </select>
            
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
            >
              <option value="all">All Reasons</option>
              <option value="Disease">Disease</option>
              <option value="Pest Contamination">Pest Contamination</option>
              <option value="Failed Testing">Failed Testing</option>
              <option value="Damage">Damage</option>
              <option value="Expiration">Expiration</option>
              <option value="Other">Other</option>
            </select>

            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="Compost">Compost</option>
              <option value="Burn">Burn</option>
              <option value="Bury">Bury</option>
              <option value="Waste Management">Waste Management</option>
              <option value="Rendered Unusable">Rendered Unusable</option>
            </select>

            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Destroyed">Destroyed</option>
              <option value="Reported">Reported</option>
            </select>
          </div>
        </div>

        {/* Waste Records List */}
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const MethodIcon = getMethodIcon(record.method);
            
            return (
              <div key={record.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-xl">{record.id}</h3>
                      <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                      <span className={`text-sm font-medium ${getTypeColor(record.type)}`}>
                        {record.type}
                      </span>
                      <span className={`text-sm ${getReasonColor(record.reason)}`}>
                        {record.reason}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Date: {formatDate(record.date)}</span>
                      <span>•</span>
                      <span>Weight: {record.weight} {record.unitOfMeasure}</span>
                      <span>•</span>
                      <span>Strains: {record.strains.join(', ')}</span>
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
                      Date
                    </span>
                    <div className="text-sm font-medium mt-1">{formatDate(record.date)}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Scale className="w-3 h-3" />
                      Weight
                    </span>
                    <div className="text-sm font-medium mt-1">{record.weight} {record.unitOfMeasure}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MethodIcon className="w-3 h-3" />
                      Method
                    </span>
                    <div className="text-sm font-medium mt-1">{record.method}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Witness
                    </span>
                    <div className="text-sm font-medium mt-1">{record.witnessName}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Created By
                    </span>
                    <div className="text-sm font-medium mt-1">{record.createdBy}</div>
                  </div>
                  {record.approvedBy && (
                    <div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Approved By
                      </span>
                      <div className="text-sm font-medium mt-1 text-green-400">{record.approvedBy}</div>
                    </div>
                  )}
                </div>

                {/* Plant/Package IDs */}
                {(record.plantIds.length > 0 || record.packageIds.length > 0) && (
                  <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <h4 className="font-medium mb-3">Affected Items</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {record.plantIds.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-400">Plant IDs</span>
                          <div className="text-sm mt-1 space-y-1">
                            {record.plantIds.map(id => (
                              <div key={id} className="text-gray-300">{id}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {record.packageIds.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-400">Package IDs</span>
                          <div className="text-sm mt-1 space-y-1">
                            {record.packageIds.map(id => (
                              <div key={id} className="text-gray-300">{id}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {record.notes && (
                  <div className="mb-4">
                    <span className="text-xs text-gray-400">Notes</span>
                    <div className="text-sm mt-1 text-gray-300">{record.notes}</div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-4">
                    {record.reportedToState ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm">Reported to State</span>
                        {record.stateReportId && (
                          <span className="text-xs text-gray-400">({record.stateReportId})</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">State Report Pending</span>
                      </div>
                    )}
                    {record.witnessSignature && (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Witness Signed</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {record.photos && record.photos.length > 0 && (
                      <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Photos ({record.photos.length})
                      </button>
                    )}
                    {!record.reportedToState && record.status === 'Destroyed' && (
                      <button className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        Report to State
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disposal Method Summary */}
        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Recycle className="w-5 h-5 text-red-400" />
            Disposal Method Summary (YTD)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['Compost', 'Burn', 'Bury', 'Waste Management', 'Rendered Unusable'].map(method => {
              const methodRecords = wasteRecords.filter(r => r.method === method);
              const methodWeight = methodRecords.reduce((sum, r) => sum + r.weight, 0);
              const MethodIcon = getMethodIcon(method);
              
              return (
                <div key={method} className="bg-gray-900 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MethodIcon className="w-4 h-4" />
                    {method}
                  </h4>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="text-gray-400">Records: </span>
                      <span className="font-medium">{methodRecords.length}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Weight: </span>
                      <span className="font-medium">{methodWeight.toFixed(1)} lbs</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Reported: </span>
                      <span className="font-medium text-green-400">
                        {methodRecords.filter(r => r.reportedToState).length}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}