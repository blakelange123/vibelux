'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Search,
  Filter,
  Plus,
  Calendar,
  Scale,
  Thermometer,
  Timer,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react';

interface Harvest {
  id: string;
  harvestBatchId: string;
  strain: string;
  harvestDate: string;
  room: string;
  plantCount: number;
  wetWeight: number;
  dryWeight?: number;
  moistureContent?: number;
  dryingLocation: string;
  dryingStartDate: string;
  dryingEndDate?: string;
  trimmedWeight?: number;
  status: 'Drying' | 'Curing' | 'Processing' | 'Complete';
  qualityGrade?: string;
  notes: string;
}

export default function HarvestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRoom, setFilterRoom] = useState<string>('all');

  // Mock data
  const harvests: Harvest[] = [
    {
      id: 'H-2024-0089',
      harvestBatchId: 'HB-2024-0032',
      strain: 'Blue Dream',
      harvestDate: '2024-03-10',
      room: 'Flower Room 3',
      plantCount: 24,
      wetWeight: 45.2,
      dryWeight: 8.9,
      moistureContent: 80.3,
      dryingLocation: 'Dry Room A - Rack 3',
      dryingStartDate: '2024-03-10',
      dryingEndDate: '2024-03-17',
      trimmedWeight: 7.8,
      status: 'Complete',
      qualityGrade: 'A',
      notes: 'Excellent trichome development, minimal pest damage'
    },
    {
      id: 'H-2024-0090',
      harvestBatchId: 'HB-2024-0033',
      strain: 'OG Kush',
      harvestDate: '2024-03-12',
      room: 'Flower Room 1',
      plantCount: 30,
      wetWeight: 52.8,
      dryWeight: 10.1,
      moistureContent: 80.9,
      dryingLocation: 'Dry Room B - Rack 1',
      dryingStartDate: '2024-03-12',
      status: 'Curing',
      notes: 'Dense buds, good resin production'
    },
    {
      id: 'H-2024-0091',
      harvestBatchId: 'HB-2024-0034',
      strain: 'Girl Scout Cookies',
      harvestDate: '2024-03-14',
      room: 'Flower Room 2',
      plantCount: 18,
      wetWeight: 38.6,
      dryingLocation: 'Dry Room A - Rack 5',
      dryingStartDate: '2024-03-14',
      status: 'Drying',
      notes: 'Harvested at optimal trichome cloudiness'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Drying': return 'text-blue-400 bg-blue-900/30';
      case 'Curing': return 'text-yellow-400 bg-yellow-900/30';
      case 'Processing': return 'text-purple-400 bg-purple-900/30';
      case 'Complete': return 'text-green-400 bg-green-900/30';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const getGradeColor = (grade?: string) => {
    if (!grade) return 'text-gray-400';
    switch (grade) {
      case 'A+': return 'text-green-400';
      case 'A': return 'text-green-300';
      case 'B': return 'text-yellow-400';
      case 'C': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const filteredHarvests = harvests.filter(harvest => {
    const matchesSearch = harvest.harvestBatchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         harvest.strain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         harvest.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || harvest.status === filterStatus;
    const matchesRoom = filterRoom === 'all' || harvest.room.includes(filterRoom);
    
    return matchesSearch && matchesStatus && matchesRoom;
  });

  const stats = {
    total: harvests.length,
    drying: harvests.filter(h => h.status === 'Drying').length,
    curing: harvests.filter(h => h.status === 'Curing').length,
    complete: harvests.filter(h => h.status === 'Complete').length,
    totalWetWeight: harvests.reduce((sum, h) => sum + h.wetWeight, 0),
    totalDryWeight: harvests.reduce((sum, h) => sum + (h.dryWeight || 0), 0),
    avgYield: harvests.filter(h => h.dryWeight).length > 0 
      ? harvests.reduce((sum, h) => sum + (h.dryWeight || 0), 0) / harvests.filter(h => h.dryWeight).length 
      : 0
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
                <Package className="w-8 h-8 text-orange-400" />
                Harvest Management
              </h1>
              <p className="text-gray-400">
                Track harvest weights, drying progress, and quality grades
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Record Weight
              </button>
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                New Harvest
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Harvests</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{stats.drying}</div>
            <div className="text-sm text-gray-400">Drying</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">{stats.curing}</div>
            <div className="text-sm text-gray-400">Curing</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{stats.complete}</div>
            <div className="text-sm text-gray-400">Complete</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold">{stats.totalWetWeight.toFixed(1)}</div>
            <div className="text-sm text-gray-400">Total Wet (lbs)</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{stats.avgYield.toFixed(1)}</div>
            <div className="text-sm text-gray-400">Avg Dry (lbs)</div>
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
                  placeholder="Search by batch ID, strain, or room..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Drying">Drying</option>
              <option value="Curing">Curing</option>
              <option value="Processing">Processing</option>
              <option value="Complete">Complete</option>
            </select>
            
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
            >
              <option value="all">All Rooms</option>
              <option value="Flower Room 1">Flower Room 1</option>
              <option value="Flower Room 2">Flower Room 2</option>
              <option value="Flower Room 3">Flower Room 3</option>
            </select>

            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              More Filters
            </button>
          </div>
        </div>

        {/* Harvest List */}
        <div className="space-y-4">
          {filteredHarvests.map((harvest) => (
            <div key={harvest.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-xl">{harvest.strain}</h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(harvest.status)}`}>
                      {harvest.status}
                    </span>
                    {harvest.qualityGrade && (
                      <span className={`text-sm font-bold ${getGradeColor(harvest.qualityGrade)}`}>
                        Grade {harvest.qualityGrade}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>ID: {harvest.harvestBatchId}</span>
                    <span>•</span>
                    <span>{harvest.room}</span>
                    <span>•</span>
                    <span>{harvest.plantCount} plants</span>
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
                    Harvest Date
                  </span>
                  <div className="text-sm font-medium mt-1">{harvest.harvestDate}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Scale className="w-3 h-3" />
                    Wet Weight
                  </span>
                  <div className="text-sm font-medium mt-1">{harvest.wetWeight} lbs</div>
                </div>
                {harvest.dryWeight && (
                  <div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Scale className="w-3 h-3" />
                      Dry Weight
                    </span>
                    <div className="text-sm font-medium mt-1 text-green-400">{harvest.dryWeight} lbs</div>
                  </div>
                )}
                {harvest.moistureContent && (
                  <div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      Moisture Loss
                    </span>
                    <div className="text-sm font-medium mt-1">{harvest.moistureContent.toFixed(1)}%</div>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    Drying Time
                  </span>
                  <div className="text-sm font-medium mt-1">
                    {harvest.dryingEndDate 
                      ? `${Math.ceil((new Date(harvest.dryingEndDate).getTime() - new Date(harvest.dryingStartDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                      : 'In progress'
                    }
                  </div>
                </div>
                {harvest.trimmedWeight && (
                  <div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Trimmed
                    </span>
                    <div className="text-sm font-medium mt-1 text-green-400">{harvest.trimmedWeight} lbs</div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <span className="text-xs text-gray-400">Drying Location</span>
                <div className="text-sm font-medium mt-1">{harvest.dryingLocation}</div>
              </div>

              {harvest.notes && (
                <div className="mb-4">
                  <span className="text-xs text-gray-400">Notes</span>
                  <div className="text-sm mt-1 text-gray-300">{harvest.notes}</div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <div className="flex items-center gap-4">
                  {harvest.status === 'Drying' && (
                    <div className="flex items-center gap-2 text-blue-400">
                      <Timer className="w-4 h-4" />
                      <span className="text-sm">Day {Math.ceil((Date.now() - new Date(harvest.dryingStartDate).getTime()) / (1000 * 60 * 60 * 24))}</span>
                    </div>
                  )}
                  {harvest.status === 'Complete' && harvest.dryWeight && (
                    <div className="flex items-center gap-2 text-green-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">{((harvest.dryWeight / harvest.wetWeight) * 100).toFixed(1)}% yield</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button className="bg-orange-600 hover:bg-orange-700 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1">
                    <Edit className="w-4 h-4" />
                    Update
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Drying Progress */}
        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-400" />
            Drying Room Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium mb-2">Dry Room A</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Rack 3 - Blue Dream</span>
                  <span className="text-green-400">Day 7 (Complete)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Rack 5 - GSC</span>
                  <span className="text-blue-400">Day 1 (Drying)</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium mb-2">Dry Room B</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Rack 1 - OG Kush</span>
                  <span className="text-yellow-400">Day 3 (Curing)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Rack 2</span>
                  <span className="text-gray-500">Available</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium mb-2">Environmental</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Temperature</span>
                  <span className="text-green-400">68°F</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Humidity</span>
                  <span className="text-green-400">58% RH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Air Flow</span>
                  <span className="text-green-400">Normal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}