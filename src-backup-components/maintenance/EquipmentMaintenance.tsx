'use client';

import React, { useState } from 'react';
import {
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  TrendingUp,
  Activity,
  FileText,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Settings,
  Shield,
  DollarSign,
  BarChart3,
  Tool,
  AlertCircle,
  ChevronDown,
  Download,
  Upload
} from 'lucide-react';
import { 
  Equipment, 
  MaintenanceSchedule, 
  WorkOrder,
  EquipmentStatus,
  MaintenanceType,
  WorkOrderStatus,
  Priority,
  CriticalityLevel
} from '@/lib/maintenance/maintenance-types';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function EquipmentMaintenance() {
  const [activeTab, setActiveTab] = useState<'overview' | 'equipment' | 'schedule' | 'workorders' | 'analytics'>('overview');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showCreateWorkOrder, setShowCreateWorkOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sample equipment data
  const equipment: Equipment[] = [
    {
      id: 'eq-001',
      assetTag: 'HVAC-001',
      name: 'Main Air Handler Unit',
      category: 'HVAC',
      type: 'Air Handler',
      manufacturer: 'Carrier',
      model: 'AHU-2000',
      serialNumber: 'CAR-2023-4567',
      status: EquipmentStatus.Operational,
      location: {
        building: 'Main Facility',
        room: 'Mechanical Room',
        area: 'North Wing'
      },
      purchaseInfo: {
        vendor: 'HVAC Solutions Inc.',
        purchaseDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        purchasePrice: 45000,
        installationDate: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000)
      },
      specifications: [
        { parameter: 'Capacity', value: '20', unit: 'tons' },
        { parameter: 'Airflow', value: '8000', unit: 'CFM' },
        { parameter: 'Power', value: '460V/3Ph/60Hz', unit: '' }
      ],
      criticality: CriticalityLevel.Critical,
      documents: [],
      warranty: {
        provider: 'Carrier',
        startDate: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 380 * 24 * 60 * 60 * 1000),
        type: 'Comprehensive',
        terms: 'Parts and labor covered',
        contactInfo: {
          name: 'Carrier Support',
          phone: '1-800-CARRIER',
          email: 'support@carrier.com'
        }
      },
      lifecycle: {
        expectedLifespan: 20,
        currentAge: 1,
        replacementCost: 55000,
        depreciationRate: 0.05,
        endOfLife: new Date(Date.now() + 19 * 365 * 24 * 60 * 60 * 1000)
      },
      performance: {
        availability: 98.5,
        reliability: 4320, // MTBF hours
        performance: 95,
        oee: 88.5,
        failureRate: 0.02,
        maintenanceCostRatio: 0.03
      }
    },
    {
      id: 'eq-002',
      assetTag: 'LIGHT-FL-A-01',
      name: 'LED Grow Light System - Flower A',
      category: 'Lighting',
      type: 'LED Fixture',
      manufacturer: 'Fluence',
      model: 'SPYDR 2p',
      serialNumber: 'FL-2023-8901',
      status: EquipmentStatus.Operational,
      location: {
        building: 'Main Facility',
        room: 'Flower Room A',
        area: 'Section 1'
      },
      purchaseInfo: {
        vendor: 'Grow Light Solutions',
        purchaseDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        purchasePrice: 12000,
        installationDate: new Date(Date.now() - 170 * 24 * 60 * 60 * 1000)
      },
      specifications: [
        { parameter: 'PPF', value: '1700', unit: 'μmol/s' },
        { parameter: 'Efficacy', value: '2.7', unit: 'μmol/J' },
        { parameter: 'Power', value: '630', unit: 'W' }
      ],
      criticality: CriticalityLevel.Essential,
      documents: [],
      warranty: {
        provider: 'Fluence',
        startDate: new Date(Date.now() - 170 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 1460 * 24 * 60 * 60 * 1000),
        type: 'Parts',
        terms: '5-year parts warranty',
        contactInfo: {
          name: 'Fluence Support',
          phone: '1-512-212-4544',
          email: 'support@fluence.science'
        }
      },
      lifecycle: {
        expectedLifespan: 10,
        currentAge: 0.5,
        replacementCost: 13500,
        depreciationRate: 0.1,
        endOfLife: new Date(Date.now() + 9.5 * 365 * 24 * 60 * 60 * 1000)
      },
      performance: {
        availability: 99.8,
        reliability: 8760,
        performance: 98,
        oee: 96.8,
        failureRate: 0.001,
        maintenanceCostRatio: 0.01
      }
    }
  ];

  // Sample maintenance schedules
  const schedules: MaintenanceSchedule[] = [
    {
      id: 'sch-001',
      equipmentId: 'eq-001',
      type: MaintenanceType.Preventive,
      frequency: {
        type: 'Calendar',
        interval: 3,
        unit: 'months'
      },
      lastPerformed: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      nextDue: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      estimatedDuration: 4,
      requiredParts: [
        { partId: 'part-001', quantity: 2, optional: false }
      ],
      requiredSkills: ['HVAC Technician', 'Electrical'],
      procedures: [
        { stepNumber: 1, description: 'Lock out equipment', estimatedTime: 10, safetyNote: 'Verify zero energy state' },
        { stepNumber: 2, description: 'Replace air filters', estimatedTime: 30 },
        { stepNumber: 3, description: 'Clean coils', estimatedTime: 60 },
        { stepNumber: 4, description: 'Check belt tension', estimatedTime: 20 },
        { stepNumber: 5, description: 'Test operation', estimatedTime: 30 }
      ],
      safetyRequirements: [
        { type: 'Lockout', description: 'Apply lockout/tagout', mandatory: true },
        { type: 'PPE', description: 'Safety glasses, gloves', mandatory: true }
      ],
      priority: Priority.High,
      alerts: []
    },
    {
      id: 'sch-002',
      equipmentId: 'eq-002',
      type: MaintenanceType.Inspection,
      frequency: {
        type: 'Calendar',
        interval: 6,
        unit: 'months'
      },
      lastPerformed: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      nextDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      estimatedDuration: 1,
      requiredParts: [],
      requiredSkills: ['Electrician'],
      procedures: [
        { stepNumber: 1, description: 'Visual inspection', estimatedTime: 15 },
        { stepNumber: 2, description: 'PAR measurement', estimatedTime: 30 },
        { stepNumber: 3, description: 'Check connections', estimatedTime: 15 }
      ],
      safetyRequirements: [
        { type: 'PPE', description: 'Safety glasses', mandatory: true }
      ],
      priority: Priority.Medium,
      alerts: []
    }
  ];

  // Sample work orders
  const workOrders: WorkOrder[] = [
    {
      id: 'wo-001',
      workOrderNumber: 'WO-2024-0145',
      type: 'Scheduled',
      status: WorkOrderStatus.Scheduled,
      priority: Priority.High,
      equipmentId: 'eq-001',
      scheduleId: 'sch-001',
      requestedBy: 'System',
      requestedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      description: 'Quarterly preventive maintenance for main air handler',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      estimatedHours: 4,
      tasks: [
        { id: 't-1', description: 'Replace air filters', completed: false },
        { id: 't-2', description: 'Clean evaporator coils', completed: false },
        { id: 't-3', description: 'Check refrigerant levels', completed: false },
        { id: 't-4', description: 'Test controls', completed: false }
      ],
      partsUsed: [],
      laborCost: 320,
      partsCost: 150,
      totalCost: 470,
      attachments: []
    },
    {
      id: 'wo-002',
      workOrderNumber: 'WO-2024-0146',
      type: 'Emergency',
      status: WorkOrderStatus.InProgress,
      priority: Priority.Emergency,
      equipmentId: 'eq-001',
      requestedBy: 'John Smith',
      requestedDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      description: 'Air handler not starting - no airflow to Flower Room A',
      assignedTo: 'Mike Johnson',
      assignedDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
      startedDate: new Date(Date.now() - 30 * 60 * 1000),
      estimatedHours: 2,
      actualHours: 0.5,
      tasks: [
        { id: 't-1', description: 'Diagnose issue', completed: true, completedBy: 'Mike Johnson', completedAt: new Date() },
        { id: 't-2', description: 'Replace control board', completed: false }
      ],
      partsUsed: [],
      laborCost: 160,
      partsCost: 450,
      totalCost: 610,
      notes: 'Control board showing error codes',
      attachments: [],
      failureAnalysis: {
        failureMode: 'Control board failure',
        rootCause: 'Power surge',
        impactAssessment: {
          safety: 'None',
          production: 'High',
          quality: 'Medium',
          compliance: 'None',
          financial: 2500
        },
        correctiveActions: ['Replace control board', 'Test operation'],
        preventiveActions: ['Install surge protector', 'Add monitoring']
      }
    }
  ];

  const getStatusColor = (status: EquipmentStatus | WorkOrderStatus) => {
    switch (status) {
      case EquipmentStatus.Operational:
      case WorkOrderStatus.Completed:
        return 'text-green-400 bg-green-900/20';
      case EquipmentStatus.Degraded:
      case WorkOrderStatus.InProgress:
        return 'text-yellow-400 bg-yellow-900/20';
      case EquipmentStatus.Failed:
      case WorkOrderStatus.OnHold:
        return 'text-red-400 bg-red-900/20';
      case EquipmentStatus.UnderMaintenance:
      case WorkOrderStatus.Scheduled:
        return 'text-blue-400 bg-blue-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.Emergency: return 'text-red-400';
      case Priority.High: return 'text-orange-400';
      case Priority.Medium: return 'text-yellow-400';
      case Priority.Low: return 'text-green-400';
      case Priority.Routine: return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getCriticalityColor = (criticality: CriticalityLevel) => {
    switch (criticality) {
      case CriticalityLevel.Critical: return 'text-red-400';
      case CriticalityLevel.Essential: return 'text-orange-400';
      case CriticalityLevel.Important: return 'text-yellow-400';
      case CriticalityLevel.Standard: return 'text-blue-400';
      case CriticalityLevel.NonCritical: return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  // Calculate metrics
  const totalEquipment = equipment.length;
  const operationalEquipment = equipment.filter(e => e.status === EquipmentStatus.Operational).length;
  const scheduledMaintenance = schedules.filter(s => s.nextDue < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length;
  const overdueMaintenace = schedules.filter(s => s.nextDue < new Date()).length;
  const openWorkOrders = workOrders.filter(wo => wo.status !== WorkOrderStatus.Completed && wo.status !== WorkOrderStatus.Closed).length;
  const emergencyWorkOrders = workOrders.filter(wo => wo.priority === Priority.Emergency).length;

  // Sample data for charts
  const maintenanceCostData = [
    { month: 'Jan', preventive: 2400, corrective: 1200, emergency: 500 },
    { month: 'Feb', preventive: 2200, corrective: 800, emergency: 0 },
    { month: 'Mar', preventive: 2600, corrective: 1500, emergency: 1200 },
    { month: 'Apr', preventive: 2300, corrective: 600, emergency: 0 }
  ];

  const equipmentStatusData = [
    { name: 'Operational', value: 85, color: '#10B981' },
    { name: 'Degraded', value: 10, color: '#F59E0B' },
    { name: 'Failed', value: 3, color: '#EF4444' },
    { name: 'Maintenance', value: 2, color: '#3B82F6' }
  ];

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.assetTag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Equipment Maintenance</h2>
          <p className="text-gray-400">Preventive maintenance and asset management</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4 mr-2 inline" />
            Export Report
          </button>
          <button 
            onClick={() => setShowCreateWorkOrder(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4 mr-2 inline" />
            Create Work Order
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['overview', 'equipment', 'schedule', 'workorders', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab === 'workorders' ? 'Work Orders' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Tool className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalEquipment}</p>
              <p className="text-xs text-gray-400">Equipment</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-xs text-green-400">{Math.round(operationalEquipment/totalEquipment*100)}%</span>
              </div>
              <p className="text-2xl font-bold text-white">{operationalEquipment}</p>
              <p className="text-xs text-gray-400">Operational</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-gray-500">Next 30d</span>
              </div>
              <p className="text-2xl font-bold text-white">{scheduledMaintenance}</p>
              <p className="text-xs text-gray-400">Scheduled</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-xs text-yellow-400">Attention</span>
              </div>
              <p className="text-2xl font-bold text-white">{overdueMaintenace}</p>
              <p className="text-xs text-gray-400">Overdue</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-gray-500">Active</span>
              </div>
              <p className="text-2xl font-bold text-white">{openWorkOrders}</p>
              <p className="text-xs text-gray-400">Work Orders</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-xs text-red-400">Critical</span>
              </div>
              <p className="text-2xl font-bold text-white">{emergencyWorkOrders}</p>
              <p className="text-xs text-gray-400">Emergency</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Maintenance Costs</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={maintenanceCostData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Bar dataKey="preventive" stackId="a" fill="#10B981" name="Preventive" />
                    <Bar dataKey="corrective" stackId="a" fill="#F59E0B" name="Corrective" />
                    <Bar dataKey="emergency" stackId="a" fill="#EF4444" name="Emergency" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Equipment Status</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={equipmentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {equipmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {equipmentStatusData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-300">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Maintenance */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Maintenance</h3>
            <div className="space-y-3">
              {schedules
                .filter(s => s.nextDue > new Date())
                .sort((a, b) => a.nextDue.getTime() - b.nextDue.getTime())
                .slice(0, 5)
                .map((schedule) => {
                  const eq = equipment.find(e => e.id === schedule.equipmentId);
                  const daysUntilDue = Math.ceil((schedule.nextDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${daysUntilDue <= 7 ? 'bg-yellow-900/20 text-yellow-400' : 'bg-gray-700 text-gray-400'}`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{eq?.name}</p>
                          <p className="text-sm text-gray-400">{schedule.type} - {eq?.assetTag}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white">{schedule.nextDue.toLocaleDateString()}</p>
                        <p className="text-sm text-gray-400">In {daysUntilDue} days</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}

      {activeTab === 'equipment' && (
        <>
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search equipment..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Status</option>
              {Object.values(EquipmentStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Filter className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Equipment List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredEquipment.map((eq) => (
              <div key={eq.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{eq.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(eq.status)}`}>
                        {eq.status}
                      </span>
                      <span className={`text-sm font-medium ${getCriticalityColor(eq.criticality)}`}>
                        {eq.criticality}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Asset Tag</p>
                        <p className="text-white font-medium">{eq.assetTag}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Type</p>
                        <p className="text-white">{eq.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Location</p>
                        <p className="text-white">{eq.location.room}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Availability</p>
                        <p className="text-white">{eq.performance.availability}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">MTBF</p>
                        <p className="text-white">{eq.performance.reliability} hrs</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          Value: ${eq.purchaseInfo.purchasePrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          Warranty: {eq.warranty.endDate > new Date() ? 'Active' : 'Expired'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          Age: {eq.lifecycle.currentAge} years
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                      <FileText className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'schedule' && (
        <>
          {/* Maintenance Calendar */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Maintenance Schedule</h3>
            <div className="space-y-3">
              {schedules.map((schedule) => {
                const eq = equipment.find(e => e.id === schedule.equipmentId);
                const isOverdue = schedule.nextDue < new Date();
                const daysUntilDue = Math.ceil((schedule.nextDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={schedule.id} className={`p-4 rounded-lg border ${
                    isOverdue ? 'bg-red-900/10 border-red-600/30' : 'bg-gray-800 border-gray-700'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-white">{eq?.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            schedule.type === MaintenanceType.Preventive ? 'bg-blue-900/20 text-blue-400' :
                            schedule.type === MaintenanceType.Inspection ? 'bg-green-900/20 text-green-400' :
                            'bg-gray-900/20 text-gray-400'
                          }`}>
                            {schedule.type}
                          </span>
                          <span className={`text-sm ${getPriorityColor(schedule.priority)}`}>
                            {schedule.priority}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Frequency</p>
                            <p className="text-white">
                              Every {schedule.frequency.interval} {schedule.frequency.unit}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Last Performed</p>
                            <p className="text-white">
                              {schedule.lastPerformed?.toLocaleDateString() || 'Never'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Next Due</p>
                            <p className={isOverdue ? 'text-red-400' : 'text-white'}>
                              {schedule.nextDue.toLocaleDateString()}
                              {isOverdue ? ' (Overdue)' : ` (${daysUntilDue} days)`}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Duration</p>
                            <p className="text-white">{schedule.estimatedDuration} hours</p>
                          </div>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                        Schedule
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {activeTab === 'workorders' && (
        <>
          {/* Work Orders List */}
          <div className="space-y-4">
            {workOrders.map((wo) => {
              const eq = equipment.find(e => e.id === wo.equipmentId);
              const completedTasks = wo.tasks.filter(t => t.completed).length;
              const progress = (completedTasks / wo.tasks.length) * 100;

              return (
                <div key={wo.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{wo.workOrderNumber}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(wo.status)}`}>
                          {wo.status}
                        </span>
                        <span className={`text-sm font-medium ${getPriorityColor(wo.priority)}`}>
                          {wo.priority}
                        </span>
                      </div>
                      <p className="text-gray-400">{wo.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">${wo.totalCost}</p>
                      <p className="text-sm text-gray-400">Estimated Cost</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-400">Equipment</p>
                      <p className="text-white">{eq?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Assigned To</p>
                      <p className="text-white">{wo.assignedTo || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Scheduled</p>
                      <p className="text-white">
                        {wo.scheduledDate?.toLocaleDateString() || 'Not scheduled'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Duration</p>
                      <p className="text-white">
                        {wo.actualHours || wo.estimatedHours} hours
                      </p>
                    </div>
                  </div>

                  {/* Task Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Task Progress</span>
                      <span className="text-sm text-gray-400">{completedTasks}/{wo.tasks.length}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {wo.failureAnalysis && (
                    <div className="p-3 bg-red-900/20 rounded-lg border border-red-600/30">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="font-medium text-red-400">Failure Analysis</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        Root Cause: {wo.failureAnalysis.rootCause}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Impact: {wo.failureAnalysis.impactAssessment.production} production impact
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-3">
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                      View Details
                    </button>
                    {wo.status === WorkOrderStatus.InProgress && (
                      <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
                        Update Progress
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <>
          {/* Maintenance Analytics */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Key Performance Indicators</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400">MTBF (Mean Time Between Failures)</p>
                    <p className="text-2xl font-bold text-white">4,320 hrs</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400">MTTR (Mean Time To Repair)</p>
                    <p className="text-2xl font-bold text-white">2.5 hrs</p>
                  </div>
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400">PM Compliance</p>
                    <p className="text-2xl font-bold text-white">94%</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400">Equipment Availability</p>
                    <p className="text-2xl font-bold text-white">98.5%</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Cost Analysis</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Preventive vs Reactive</span>
                    <span className="text-sm text-gray-400">70/30</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-400">Monthly Average</p>
                    <p className="text-xl font-bold text-white">$12,450</p>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-400">YTD Total</p>
                    <p className="text-xl font-bold text-white">$49,800</p>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-400">Cost/Asset</p>
                    <p className="text-xl font-bold text-white">$415</p>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-400">Emergency %</p>
                    <p className="text-xl font-bold text-red-400">8%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Trends */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Maintenance Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={maintenanceCostData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Line type="monotone" dataKey="preventive" stroke="#10B981" strokeWidth={2} name="Preventive" />
                  <Line type="monotone" dataKey="corrective" stroke="#F59E0B" strokeWidth={2} name="Corrective" />
                  <Line type="monotone" dataKey="emergency" stroke="#EF4444" strokeWidth={2} name="Emergency" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}