'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  QrCode,
  Search,
  Filter,
  Plus,
  Package2,
  Scale,
  Calendar,
  MapPin,
  Truck,
  FlaskConical,
  DollarSign,
  Eye,
  Edit,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Split
} from 'lucide-react';

interface Package {
  id: string;
  tagId: string;
  productType: 'Flower' | 'Trim' | 'Shake' | 'Pre-Roll' | 'Concentrate';
  strain: string;
  harvestBatchId: string;
  weight: number;
  unitOfMeasure: string;
  packagedDate: string;
  labResultId?: string;
  labStatus?: 'Pending' | 'Passed' | 'Failed' | 'Remediation';
  status: 'Active' | 'Sold' | 'In Transit' | 'Destroyed' | 'Testing';
  location: string;
  price?: number;
  soldDate?: string;
  soldTo?: string;
  thc?: number;
  cbd?: number;
  terpenes?: number;
  notes: string;
}

export default function PackagesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');

  // Mock data
  const packages: Package[] = [
    {
      id: 'PKG-2024-0456',
      tagId: '1A4FF0100000000000000456',
      productType: 'Flower',
      strain: 'Blue Dream',
      harvestBatchId: 'HB-2024-0032',
      weight: 3.5,
      unitOfMeasure: 'g',
      packagedDate: '2024-03-18',
      labResultId: 'LAB-2024-0123',
      labStatus: 'Passed',
      status: 'Active',
      location: 'Vault A - Shelf 3',
      price: 35.00,
      thc: 22.4,
      cbd: 0.8,
      terpenes: 2.1,
      notes: 'Premium top shelf flower'
    },
    {
      id: 'PKG-2024-0457',
      tagId: '1A4FF0100000000000000457',
      productType: 'Pre-Roll',
      strain: 'OG Kush',
      harvestBatchId: 'HB-2024-0033',
      weight: 1.0,
      unitOfMeasure: 'g',
      packagedDate: '2024-03-19',
      labStatus: 'Pending',
      status: 'Testing',
      location: 'Processing Room',
      thc: 20.1,
      cbd: 0.5,
      notes: 'Single pre-roll, King size'
    },
    {
      id: 'PKG-2024-0458',
      tagId: '1A4FF0100000000000000458',
      productType: 'Trim',
      strain: 'Girl Scout Cookies',
      harvestBatchId: 'HB-2024-0034',
      weight: 14.0,
      unitOfMeasure: 'g',
      packagedDate: '2024-03-20',
      labStatus: 'Passed',
      status: 'Sold',
      location: 'Vault B - Shelf 1',
      price: 28.00,
      soldDate: '2024-03-21',
      soldTo: 'Green Leaf Dispensary',
      thc: 15.2,
      cbd: 1.2,
      notes: 'High quality trim for processing'
    },
    {
      id: 'PKG-2024-0459',
      tagId: '1A4FF0100000000000000459',
      productType: 'Flower',
      strain: 'Blue Dream',
      harvestBatchId: 'HB-2024-0032',
      weight: 28.0,
      unitOfMeasure: 'g',
      packagedDate: '2024-03-18',
      labStatus: 'Passed',
      status: 'In Transit',
      location: 'In Transit to Dispensary Plus',
      price: 280.00,
      soldDate: '2024-03-22',
      soldTo: 'Dispensary Plus',
      thc: 22.4,
      cbd: 0.8,
      notes: 'Bulk package - premium quality'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400 bg-green-900/30';
      case 'Sold': return 'text-blue-400 bg-blue-900/30';
      case 'In Transit': return 'text-yellow-400 bg-yellow-900/30';
      case 'Testing': return 'text-purple-400 bg-purple-900/30';
      case 'Destroyed': return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const getLabStatusColor = (status?: string) => {
    switch (status) {
      case 'Passed': return 'text-green-400';
      case 'Failed': return 'text-red-400';
      case 'Pending': return 'text-yellow-400';
      case 'Remediation': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getProductTypeColor = (type: string) => {
    switch (type) {
      case 'Flower': return 'text-green-400';
      case 'Pre-Roll': return 'text-blue-400';
      case 'Trim': return 'text-orange-400';
      case 'Shake': return 'text-yellow-400';
      case 'Concentrate': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.strain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.harvestBatchId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || pkg.status === filterStatus;
    const matchesType = filterType === 'all' || pkg.productType === filterType;
    const matchesLocation = filterLocation === 'all' || pkg.location.includes(filterLocation);
    
    return matchesSearch && matchesStatus && matchesType && matchesLocation;
  });

  const stats = {
    total: packages.length,
    active: packages.filter(p => p.status === 'Active').length,
    sold: packages.filter(p => p.status === 'Sold').length,
    inTransit: packages.filter(p => p.status === 'In Transit').length,
    totalWeight: packages.filter(p => p.status === 'Active').reduce((sum, p) => sum + p.weight, 0),
    totalValue: packages.filter(p => p.status === 'Active' && p.price).reduce((sum, p) => sum + (p.price || 0), 0),
    avgThc: packages.filter(p => p.thc).reduce((sum, p) => sum + (p.thc || 0), 0) / packages.filter(p => p.thc).length
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
                <QrCode className="w-8 h-8 text-purple-400" />
                Package Inventory
              </h1>
              <p className="text-gray-400">
                Manage product packages and inventory tracking
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Split className="w-5 h-5" />
                Split Package
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Package
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Packages</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{stats.active}</div>
            <div className="text-sm text-gray-400">Active</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{stats.sold}</div>
            <div className="text-sm text-gray-400">Sold</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">{stats.inTransit}</div>
            <div className="text-sm text-gray-400">In Transit</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold">{stats.totalWeight.toFixed(1)}g</div>
            <div className="text-sm text-gray-400">Inventory Weight</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{stats.avgThc.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Avg THC</div>
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
                  placeholder="Search by tag ID, strain, or batch..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Sold">Sold</option>
              <option value="In Transit">In Transit</option>
              <option value="Testing">Testing</option>
              <option value="Destroyed">Destroyed</option>
            </select>
            
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Flower">Flower</option>
              <option value="Pre-Roll">Pre-Roll</option>
              <option value="Trim">Trim</option>
              <option value="Shake">Shake</option>
              <option value="Concentrate">Concentrate</option>
            </select>

            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option value="all">All Locations</option>
              <option value="Vault A">Vault A</option>
              <option value="Vault B">Vault B</option>
              <option value="Processing">Processing Room</option>
              <option value="In Transit">In Transit</option>
            </select>

            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Scan Package
            </button>
          </div>
        </div>

        {/* Package List */}
        <div className="space-y-4">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-xl">{pkg.strain}</h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(pkg.status)}`}>
                      {pkg.status}
                    </span>
                    <span className={`text-sm font-medium ${getProductTypeColor(pkg.productType)}`}>
                      {pkg.productType}
                    </span>
                    {pkg.labStatus && (
                      <div className="flex items-center gap-1">
                        <FlaskConical className={`w-4 h-4 ${getLabStatusColor(pkg.labStatus)}`} />
                        <span className={`text-xs ${getLabStatusColor(pkg.labStatus)}`}>
                          {pkg.labStatus}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>Tag: {pkg.tagId}</span>
                    <span>•</span>
                    <span>Batch: {pkg.harvestBatchId}</span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                <div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Scale className="w-3 h-3" />
                    Weight
                  </span>
                  <div className="text-sm font-medium mt-1">{pkg.weight}{pkg.unitOfMeasure}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Packaged
                  </span>
                  <div className="text-sm font-medium mt-1">{pkg.packagedDate}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Location
                  </span>
                  <div className="text-sm font-medium mt-1">{pkg.location}</div>
                </div>
                {pkg.price && (
                  <div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Price
                    </span>
                    <div className="text-sm font-medium mt-1 text-green-400">${pkg.price.toFixed(2)}</div>
                  </div>
                )}
                {pkg.thc && (
                  <div>
                    <span className="text-xs text-gray-400">THC</span>
                    <div className="text-sm font-medium mt-1 text-green-400">{pkg.thc}%</div>
                  </div>
                )}
                {pkg.cbd && (
                  <div>
                    <span className="text-xs text-gray-400">CBD</span>
                    <div className="text-sm font-medium mt-1 text-blue-400">{pkg.cbd}%</div>
                  </div>
                )}
              </div>

              {pkg.soldTo && (
                <div className="mb-4">
                  <span className="text-xs text-gray-400">Sold To</span>
                  <div className="text-sm font-medium mt-1 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-400" />
                    {pkg.soldTo} {pkg.soldDate && `on ${pkg.soldDate}`}
                  </div>
                </div>
              )}

              {pkg.notes && (
                <div className="mb-4">
                  <span className="text-xs text-gray-400">Notes</span>
                  <div className="text-sm mt-1 text-gray-300">{pkg.notes}</div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <div className="flex items-center gap-4">
                  {pkg.labStatus === 'Passed' && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Lab Approved</span>
                    </div>
                  )}
                  {pkg.labStatus === 'Pending' && (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Testing in Progress</span>
                    </div>
                  )}
                  {pkg.labStatus === 'Failed' && (
                    <div className="flex items-center gap-2 text-red-400">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">Failed Testing</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  {pkg.status === 'Active' && (
                    <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1">
                      <Edit className="w-4 h-4" />
                      Update
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Inventory Summary */}
        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package2 className="w-5 h-5 text-purple-400" />
            Inventory Summary by Product Type
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['Flower', 'Pre-Roll', 'Trim', 'Shake', 'Concentrate'].map(type => {
              const typePackages = packages.filter(p => p.productType === type && p.status === 'Active');
              const typeWeight = typePackages.reduce((sum, p) => sum + p.weight, 0);
              const typeValue = typePackages.reduce((sum, p) => sum + (p.price || 0), 0);
              
              return (
                <div key={type} className="bg-gray-900 rounded-lg p-4">
                  <h4 className={`font-medium mb-2 ${getProductTypeColor(type)}`}>{type}</h4>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="text-gray-400">Count: </span>
                      <span className="font-medium">{typePackages.length}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Weight: </span>
                      <span className="font-medium">{typeWeight.toFixed(1)}g</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Value: </span>
                      <span className="font-medium text-green-400">${typeValue.toFixed(2)}</span>
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