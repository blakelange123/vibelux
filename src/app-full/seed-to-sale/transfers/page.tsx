'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Truck,
  Search,
  Filter,
  Plus,
  Calendar,
  MapPin,
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  Eye,
  Edit,
  MoreVertical,
  Navigation,
  Shield,
  Car
} from 'lucide-react';

interface TransferPackage {
  packageId: string;
  tagId: string;
  productType: string;
  strain: string;
  weight: number;
  unitPrice: number;
}

interface Transfer {
  id: string;
  manifestNumber: string;
  type: 'Wholesale' | 'Lab Sample' | 'Waste' | 'Return' | 'Internal';
  status: 'Pending' | 'In Transit' | 'Delivered' | 'Rejected' | 'Void';
  originLicense: string;
  destinationLicense: string;
  destinationFacility: string;
  destinationAddress: string;
  driver: string;
  driverLicense: string;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlate: string;
  packages: TransferPackage[];
  departureDate: string;
  estimatedArrival: string;
  actualArrival?: string;
  route: string;
  distance: number;
  notes: string;
  createdAt: string;
}

export default function TransfersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Mock data
  const transfers: Transfer[] = [
    {
      id: 'XFER-001',
      manifestNumber: 'MAN-20240315-0023',
      type: 'Wholesale',
      status: 'Delivered',
      originLicense: 'C11-0000123-LIC',
      destinationLicense: 'C10-0000456-LIC',
      destinationFacility: 'Green Leaf Dispensary',
      destinationAddress: '123 Main St, Los Angeles, CA 90210',
      driver: 'John Smith',
      driverLicense: 'D123456789',
      vehicleMake: 'Ford',
      vehicleModel: 'Transit',
      vehiclePlate: 'ABC-123',
      packages: [
        {
          packageId: 'PKG-2024-0456',
          tagId: '1A4FF0100000000000000456',
          productType: 'Flower',
          strain: 'Blue Dream',
          weight: 3.5,
          unitPrice: 35.00
        },
        {
          packageId: 'PKG-2024-0457',
          tagId: '1A4FF0100000000000000457',
          productType: 'Pre-Roll',
          strain: 'OG Kush',
          weight: 1.0,
          unitPrice: 15.00
        }
      ],
      departureDate: '2024-03-15T09:00:00',
      estimatedArrival: '2024-03-15T11:30:00',
      actualArrival: '2024-03-15T11:45:00',
      route: 'Route 101 South',
      distance: 45.2,
      notes: 'Standard delivery - no issues',
      createdAt: '2024-03-14T16:30:00'
    },
    {
      id: 'XFER-002',
      manifestNumber: 'MAN-20240316-0024',
      type: 'Lab Sample',
      status: 'In Transit',
      originLicense: 'C11-0000123-LIC',
      destinationLicense: 'C8-0000789-LIC',
      destinationFacility: 'Cannabis Testing Lab Inc',
      destinationAddress: '456 Science Blvd, Irvine, CA 92618',
      driver: 'Maria Garcia',
      driverLicense: 'D987654321',
      vehicleMake: 'Toyota',
      vehicleModel: 'Prius',
      vehiclePlate: 'XYZ-789',
      packages: [
        {
          packageId: 'PKG-2024-0459',
          tagId: '1A4FF0100000000000000459',
          productType: 'Flower',
          strain: 'Girl Scout Cookies',
          weight: 0.05,
          unitPrice: 0.00
        }
      ],
      departureDate: '2024-03-16T14:00:00',
      estimatedArrival: '2024-03-16T16:30:00',
      route: 'I-5 South to I-405 North',
      distance: 62.8,
      notes: 'Lab sample for COA testing',
      createdAt: '2024-03-16T13:45:00'
    },
    {
      id: 'XFER-003',
      manifestNumber: 'MAN-20240317-0025',
      type: 'Wholesale',
      status: 'Pending',
      originLicense: 'C11-0000123-LIC',
      destinationLicense: 'C10-0000999-LIC',
      destinationFacility: 'Dispensary Plus',
      destinationAddress: '789 Cannabis Ave, San Diego, CA 92101',
      driver: 'Robert Johnson',
      driverLicense: 'D456789123',
      vehicleMake: 'Chevrolet',
      vehicleModel: 'Express',
      vehiclePlate: 'DEF-456',
      packages: [
        {
          packageId: 'PKG-2024-0460',
          tagId: '1A4FF0100000000000000460',
          productType: 'Flower',
          strain: 'Blue Dream',
          weight: 28.0,
          unitPrice: 280.00
        },
        {
          packageId: 'PKG-2024-0461',
          tagId: '1A4FF0100000000000000461',
          productType: 'Trim',
          strain: 'OG Kush',
          weight: 14.0,
          unitPrice: 28.00
        }
      ],
      departureDate: '2024-03-17T10:00:00',
      estimatedArrival: '2024-03-17T13:00:00',
      route: 'I-5 South',
      distance: 120.5,
      notes: 'Large wholesale order - handle with care',
      createdAt: '2024-03-16T17:00:00'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-400 bg-yellow-900/30';
      case 'In Transit': return 'text-blue-400 bg-blue-900/30';
      case 'Delivered': return 'text-green-400 bg-green-900/30';
      case 'Rejected': return 'text-red-400 bg-red-900/30';
      case 'Void': return 'text-gray-400 bg-gray-900/30';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Wholesale': return 'text-green-400';
      case 'Lab Sample': return 'text-purple-400';
      case 'Waste': return 'text-red-400';
      case 'Return': return 'text-orange-400';
      case 'Internal': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.manifestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.destinationFacility.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transfer.status === filterStatus;
    const matchesType = filterType === 'all' || transfer.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: transfers.length,
    pending: transfers.filter(t => t.status === 'Pending').length,
    inTransit: transfers.filter(t => t.status === 'In Transit').length,
    delivered: transfers.filter(t => t.status === 'Delivered').length,
    totalPackages: transfers.reduce((sum, t) => sum + t.packages.length, 0),
    totalValue: transfers.reduce((sum, t) => sum + t.packages.reduce((pSum, p) => pSum + p.unitPrice, 0), 0)
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
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
                <Truck className="w-8 h-8 text-blue-400" />
                Transfer Management
              </h1>
              <p className="text-gray-400">
                Create and track manifests for product transportation
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Print Manifest
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                New Transfer
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Transfers</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{stats.inTransit}</div>
            <div className="text-sm text-gray-400">In Transit</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{stats.delivered}</div>
            <div className="text-sm text-gray-400">Delivered</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold">{stats.totalPackages}</div>
            <div className="text-sm text-gray-400">Total Packages</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">${stats.totalValue.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Total Value</div>
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
                  placeholder="Search by manifest, facility, or driver..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Rejected">Rejected</option>
              <option value="Void">Void</option>
            </select>
            
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Lab Sample">Lab Sample</option>
              <option value="Waste">Waste</option>
              <option value="Return">Return</option>
              <option value="Internal">Internal</option>
            </select>

            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              More Filters
            </button>
          </div>
        </div>

        {/* Transfer List */}
        <div className="space-y-4">
          {filteredTransfers.map((transfer) => (
            <div key={transfer.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-xl">{transfer.manifestNumber}</h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(transfer.status)}`}>
                      {transfer.status}
                    </span>
                    <span className={`text-sm font-medium ${getTypeColor(transfer.type)}`}>
                      {transfer.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>To: {transfer.destinationFacility}</span>
                    <span>•</span>
                    <span>Driver: {transfer.driver}</span>
                    <span>•</span>
                    <span>{transfer.packages.length} packages</span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Departure
                  </span>
                  <div className="text-sm font-medium mt-1">{formatDate(transfer.departureDate)}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Estimated Arrival
                  </span>
                  <div className="text-sm font-medium mt-1">{formatDate(transfer.estimatedArrival)}</div>
                </div>
                {transfer.actualArrival && (
                  <div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Actual Arrival
                    </span>
                    <div className="text-sm font-medium mt-1 text-green-400">{formatDate(transfer.actualArrival)}</div>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    Distance
                  </span>
                  <div className="text-sm font-medium mt-1">{transfer.distance} miles</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Destination
                  </span>
                  <div className="text-sm font-medium mt-1">{transfer.destinationAddress}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Car className="w-3 h-3" />
                    Vehicle
                  </span>
                  <div className="text-sm font-medium mt-1">
                    {transfer.vehicleMake} {transfer.vehicleModel} - {transfer.vehiclePlate}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Driver Information
                </span>
                <div className="text-sm font-medium mt-1">
                  {transfer.driver} (License: {transfer.driverLicense})
                </div>
              </div>

              {/* Package Details */}
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Package Details ({transfer.packages.length} items)
                </h4>
                <div className="space-y-2">
                  {transfer.packages.map((pkg, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400">{pkg.tagId}</span>
                        <span className="text-white">{pkg.strain}</span>
                        <span className="text-gray-400">{pkg.productType}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400">{pkg.weight}g</span>
                        <span className="text-green-400">${pkg.unitPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-sm font-medium">
                  <span>Total Weight:</span>
                  <span>{transfer.packages.reduce((sum, p) => sum + p.weight, 0)}g</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Total Value:</span>
                  <span className="text-green-400">${transfer.packages.reduce((sum, p) => sum + p.unitPrice, 0).toFixed(2)}</span>
                </div>
              </div>

              {transfer.notes && (
                <div className="mb-4">
                  <span className="text-xs text-gray-400">Notes</span>
                  <div className="text-sm mt-1 text-gray-300">{transfer.notes}</div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <div className="flex items-center gap-4">
                  {transfer.status === 'In Transit' && (
                    <div className="flex items-center gap-2 text-blue-400">
                      <Truck className="w-4 h-4" />
                      <span className="text-sm">En Route</span>
                    </div>
                  )}
                  {transfer.status === 'Delivered' && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Successfully Delivered</span>
                    </div>
                  )}
                  {transfer.status === 'Pending' && (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Awaiting Departure</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">License: {transfer.destinationLicense}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Track
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Manifest
                  </button>
                  {transfer.status === 'Pending' && (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Route Summary */}
        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-400" />
            Active Routes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transfers.filter(t => t.status === 'In Transit').map(transfer => (
              <div key={transfer.id} className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{transfer.manifestNumber}</h4>
                  <span className="text-blue-400 text-sm">In Transit</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">To:</span>
                    <span className="text-gray-300">{transfer.destinationFacility}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Driver:</span>
                    <span className="text-gray-300">{transfer.driver}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ETA:</span>
                    <span className="text-gray-300">{formatDate(transfer.estimatedArrival)}</span>
                  </div>
                </div>
              </div>
            ))}
            {transfers.filter(t => t.status === 'In Transit').length === 0 && (
              <div className="bg-gray-900 rounded-lg p-4 text-center text-gray-500">
                No active routes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}