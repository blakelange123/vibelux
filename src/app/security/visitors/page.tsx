'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  UserCheck,
  Search,
  Plus,
  Calendar,
  Clock,
  Building,
  User,
  Car,
  Camera,
  FileText,
  Badge,
  LogOut,
  MapPin
} from 'lucide-react';

interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  purpose: string;
  hostName: string;
  hostDepartment: string;
  badgeNumber: string;
  checkInTime: string;
  checkOutTime?: string;
  allowedZones: string[];
  escortRequired: boolean;
  vehicleInfo?: {
    make: string;
    model: string;
    licensePlate: string;
  };
  status: 'Pre-registered' | 'On-site' | 'Checked-out';
}

export default function VisitorManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  // Mock data
  const visitors: Visitor[] = [
    {
      id: 'VIS-001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      company: 'ABC Laboratories',
      purpose: 'Lab sample pickup',
      hostName: 'John Smith',
      hostDepartment: 'Quality Control',
      badgeNumber: 'V-12345',
      checkInTime: '09:15 AM',
      allowedZones: ['Reception', 'Lab', 'Conference Room A'],
      escortRequired: false,
      vehicleInfo: {
        make: 'Toyota',
        model: 'Camry',
        licensePlate: 'ABC123'
      },
      status: 'On-site'
    },
    {
      id: 'VIS-002',
      firstName: 'Michael',
      lastName: 'Chen',
      company: 'State Cannabis Control',
      purpose: 'Compliance inspection',
      hostName: 'Lisa Anderson',
      hostDepartment: 'Compliance',
      badgeNumber: 'V-12346',
      checkInTime: '10:30 AM',
      checkOutTime: '12:45 PM',
      allowedZones: ['All Areas'],
      escortRequired: true,
      status: 'Checked-out'
    },
    {
      id: 'VIS-003',
      firstName: 'Emily',
      lastName: 'Davis',
      company: 'HVAC Solutions Inc',
      purpose: 'Equipment maintenance',
      hostName: 'Mike Wilson',
      hostDepartment: 'Facilities',
      badgeNumber: 'V-12347',
      checkInTime: '11:00 AM',
      allowedZones: ['Mechanical Room', 'Flower Rooms'],
      escortRequired: true,
      vehicleInfo: {
        make: 'Ford',
        model: 'F-150',
        licensePlate: 'XYZ789'
      },
      status: 'On-site'
    }
  ];

  const upcomingVisitors = [
    {
      name: 'Robert Brown',
      company: 'Nutrient Suppliers LLC',
      purpose: 'Product demonstration',
      scheduledTime: '2:00 PM',
      host: 'Tom Martinez'
    },
    {
      name: 'Jennifer White',
      company: 'Insurance Partners',
      purpose: 'Annual inspection',
      scheduledTime: '3:30 PM',
      host: 'Sarah Lee'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'On-site':
        return 'bg-green-900/30 text-green-400';
      case 'Checked-out':
        return 'bg-gray-700 text-gray-400';
      case 'Pre-registered':
        return 'bg-blue-900/30 text-blue-400';
      default:
        return 'bg-gray-700 text-gray-400';
    }
  };

  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = 
      visitor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.hostName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || visitor.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/security" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Security
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-green-400" />
                Visitor Management
              </h1>
              <p className="text-gray-400">
                Check in visitors, manage badges, and track access
              </p>
            </div>
            
            <button 
              onClick={() => setShowCheckInModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Check In Visitor
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-gray-400">Visitors Today</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">3</div>
            <div className="text-sm text-gray-400">Currently On-site</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">2</div>
            <div className="text-sm text-gray-400">Pre-registered</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold">2.5h</div>
            <div className="text-sm text-gray-400">Avg. Visit Duration</div>
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
                  placeholder="Search visitors by name, company, or host..."
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
              <option value="On-site">On-site</option>
              <option value="Checked-out">Checked-out</option>
              <option value="Pre-registered">Pre-registered</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visitor List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold mb-4">Today's Visitors</h3>
            
            {filteredVisitors.map((visitor) => (
              <div key={visitor.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">
                        {visitor.firstName} {visitor.lastName}
                      </h4>
                      <p className="text-sm text-gray-400">{visitor.company}</p>
                      <p className="text-xs text-gray-500 mt-1">Badge: {visitor.badgeNumber}</p>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(visitor.status)}`}>
                    {visitor.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-400">Purpose:</span>
                    <p className="text-gray-300">{visitor.purpose}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Host:</span>
                    <p className="text-gray-300">{visitor.hostName}</p>
                    <p className="text-xs text-gray-500">{visitor.hostDepartment}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Check-in:</span>
                    <p className="text-gray-300">{visitor.checkInTime}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Check-out:</span>
                    <p className="text-gray-300">{visitor.checkOutTime || '-'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {visitor.escortRequired && (
                    <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded">
                      Escort Required
                    </span>
                  )}
                  {visitor.vehicleInfo && (
                    <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      {visitor.vehicleInfo.licensePlate}
                    </span>
                  )}
                  {visitor.allowedZones.map(zone => (
                    <span key={zone} className="text-xs bg-gray-700 px-2 py-1 rounded flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {zone}
                    </span>
                  ))}
                </div>

                {visitor.status === 'On-site' && (
                  <div className="flex gap-2">
                    <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1.5 rounded flex items-center justify-center gap-1">
                      <Badge className="w-4 h-4" />
                      View Badge
                    </button>
                    <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1.5 rounded flex items-center justify-center gap-1">
                      <Camera className="w-4 h-4" />
                      View Photo
                    </button>
                    <button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded flex items-center justify-center gap-1">
                      <LogOut className="w-4 h-4" />
                      Check Out
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Visitors */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Upcoming Visitors
              </h3>
              <div className="space-y-3">
                {upcomingVisitors.map((visitor, index) => (
                  <div key={index} className="pb-3 border-b border-gray-700 last:border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{visitor.name}</p>
                        <p className="text-sm text-gray-400">{visitor.company}</p>
                        <p className="text-xs text-gray-500 mt-1">{visitor.purpose}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-400">{visitor.scheduledTime}</p>
                        <p className="text-xs text-gray-500">Host: {visitor.host}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg">
                Pre-register Visitor
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                Visit Patterns
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Peak Hours</span>
                  <span className="text-gray-300">10 AM - 12 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Duration</span>
                  <span className="text-gray-300">2.5 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Most Common</span>
                  <span className="text-gray-300">Deliveries (35%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Repeat Visitors</span>
                  <span className="text-gray-300">28%</span>
                </div>
              </div>
            </div>

            {/* Visitor Policy */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Visitor Policy
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• All visitors must sign in at reception</li>
                <li>• Photo ID required for badge issuance</li>
                <li>• Visitors must be escorted in restricted areas</li>
                <li>• No photography without permission</li>
                <li>• Badges must be visible at all times</li>
                <li>• Return badge upon departure</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}