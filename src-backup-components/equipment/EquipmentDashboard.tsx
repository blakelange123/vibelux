'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package,
  TrendingUp,
  Calendar,
  DollarSign,
  Activity,
  Plus,
  Filter,
  Search,
  Download,
  ChevronRight,
  BarChart3,
  Settings,
  Users,
  FileText,
  Timer,
  AlertCircle,
  Brain
} from 'lucide-react';
import { equipmentManager, Equipment, WorkOrder, SparePart, LifetimeAnalysis } from '@/lib/equipment-manager';
import { EquipmentDetailsModal } from './EquipmentDetailsModal';
import { AddEquipmentModal } from './AddEquipmentModal';
import { runtimeMonitor } from '@/lib/equipment-runtime-monitor';
import { aiMaintenanceService } from '@/lib/ai-maintenance-integration';
// import { TM21LifetimeCalculator } from './TM21LifetimeCalculator';

interface DashboardMetrics {
  totalEquipment: number;
  activeWorkOrders: number;
  overdueWorkOrders: number;
  lowStockParts: number;
  upcomingMaintenance: number;
  monthlyMaintenanceCost: number;
  equipmentApproachingEOL: number;
}

export function EquipmentDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEquipment: 0,
    activeWorkOrders: 0,
    overdueWorkOrders: 0,
    lowStockParts: 0,
    upcomingMaintenance: 0,
    monthlyMaintenanceCost: 0,
    equipmentApproachingEOL: 0
  });
  const [selectedView, setSelectedView] = useState<'overview' | 'equipment' | 'workorders' | 'inventory'>('overview');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [activeRuntimes, setActiveRuntimes] = useState<Set<string>>(new Set());
  const [aiAlerts, setAiAlerts] = useState<ReturnType<typeof aiMaintenanceService.getCriticalAlerts>>([]);

  useEffect(() => {
    loadDashboardData();
    checkActiveRuntimes();
    loadAIAlerts();
    // Refresh every minute for real-time usage tracking
    const interval = setInterval(() => {
      loadDashboardData();
      checkActiveRuntimes();
      loadAIAlerts();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const dashboardMetrics = await equipmentManager.getDashboardMetrics();
      
      // Count equipment approaching EOL
      const approachingEOL = equipmentManager.getEquipmentApproachingEOL(75).length;
      
      setMetrics({
        ...dashboardMetrics,
        equipmentApproachingEOL: approachingEOL
      });
      
      // Load sample data (in production, this would come from the database)
      loadSampleData();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Still load sample data even if metrics fail
      loadSampleData();
    }
  };

  const checkActiveRuntimes = () => {
    // Get active runtime sessions
    const activeSessions = runtimeMonitor.getActiveSessions();
    const activeIds = new Set(activeSessions.map(session => session.equipmentId));
    setActiveRuntimes(activeIds);
  };

  const loadAIAlerts = () => {
    // Get AI-generated critical alerts
    const alerts = aiMaintenanceService.getCriticalAlerts();
    setAiAlerts(alerts);
  };

  const loadSampleData = () => {
    // Only load sample data once
    if (dataLoaded) return;
    
    // Sample equipment
    const sampleEquipment: Equipment[] = [
      {
        id: 'eq-1',
        name: 'LED Panel A1',
        type: 'lighting',
        manufacturer: 'Fluence',
        model: 'SPYDR 2p',
        serialNumber: 'FL2P-2023-001',
        purchaseDate: new Date('2023-01-15'),
        warrantyExpiration: new Date('2026-01-15'),
        location: {
          facility: 'Main',
          room: 'Flower Room A',
          zone: 'Zone 1'
        },
        status: 'active',
        specifications: {
          power: 645,
          voltage: 480,
          efficiency: 2.7
        },
        usage: {
          totalHours: 4380,
          dailyHours: [12, 12, 12, 12, 12, 12, 12],
          lastUpdated: new Date(),
          currentSessionStart: new Date()
        },
        maintenance: {
          schedule: [
            {
              id: 'ms-1',
              type: 'cleaning',
              name: 'Lens Cleaning',
              description: 'Clean LED lenses and heat sinks',
              frequency: { type: 'months', value: 3 },
              estimatedDuration: 30,
              priority: 'medium',
              notifications: { daysBeforeDue: 7, recipients: ['maintenance-team'] }
            },
            {
              id: 'ms-2',
              type: 'inspection',
              name: 'Driver Inspection',
              description: 'Check LED drivers and connections',
              frequency: { type: 'months', value: 12 },
              estimatedDuration: 60,
              priority: 'high',
              notifications: { daysBeforeDue: 14, recipients: ['maintenance-team'] }
            }
          ],
          history: [],
          nextDue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        },
        cost: {
          purchase: 1299,
          installation: 150,
          annualMaintenance: 200
        }
      },
      {
        id: 'eq-2',
        name: 'HVAC Unit 1',
        type: 'hvac',
        manufacturer: 'Carrier',
        model: '50HC-20',
        serialNumber: 'CAR-2022-456',
        purchaseDate: new Date('2022-06-01'),
        warrantyExpiration: new Date('2027-06-01'),
        location: {
          facility: 'Main',
          room: 'Mechanical Room',
          zone: 'HVAC-1'
        },
        status: 'active',
        specifications: {
          power: 15000,
          voltage: 480,
          capacity: 20
        },
        usage: {
          totalHours: 8760,
          dailyHours: [18, 18, 18, 18, 18, 18, 18],
          lastUpdated: new Date()
        },
        maintenance: {
          schedule: [
            {
              id: 'ms-3',
              type: 'preventive',
              name: 'Filter Replacement',
              description: 'Replace air filters',
              frequency: { type: 'months', value: 1 },
              estimatedDuration: 45,
              priority: 'high',
              requiredParts: [{ id: 'part-1', name: 'MERV 13 Filter' } as any],
              notifications: { daysBeforeDue: 3, recipients: ['hvac-tech'] }
            }
          ],
          history: [],
          nextDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        },
        cost: {
          purchase: 25000,
          installation: 5000,
          annualMaintenance: 2400
        }
      },
      {
        id: 'eq-3',
        name: 'Irrigation Pump 1',
        type: 'pump',
        manufacturer: 'Grundfos',
        model: 'CR 10-10',
        serialNumber: 'GRF-2023-789',
        purchaseDate: new Date('2023-03-01'),
        location: {
          facility: 'Main',
          room: 'Irrigation Room',
          zone: 'Water-1'
        },
        status: 'maintenance',
        specifications: {
          power: 5500,
          voltage: 240,
          capacity: 100
        },
        usage: {
          totalHours: 2190,
          dailyHours: [8, 8, 8, 8, 8, 8, 8],
          lastUpdated: new Date()
        },
        maintenance: {
          schedule: [
            {
              id: 'ms-4',
              type: 'inspection',
              name: 'Seal Inspection',
              description: 'Check pump seals and bearings',
              frequency: { type: 'hours', value: 2000 },
              estimatedDuration: 120,
              priority: 'critical',
              notifications: { daysBeforeDue: 14, recipients: ['maintenance-team'] }
            }
          ],
          history: [],
          nextDue: new Date()
        },
        cost: {
          purchase: 3500,
          installation: 500
        }
      }
    ];

    // Sample work orders
    const sampleWorkOrders: WorkOrder[] = [
      {
        id: 'wo-1',
        title: 'Replace HVAC Filters - Unit 1',
        description: 'Monthly filter replacement for HVAC Unit 1',
        type: 'maintenance',
        priority: 'high',
        status: 'open',
        equipmentId: 'eq-2',
        location: 'Main - Mechanical Room',
        createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        estimatedDuration: 45,
        automatedTrigger: {
          type: 'calendar',
          condition: 'ms-3'
        },
        parts: [
          {
            partId: 'part-1',
            quantity: 4,
            status: 'needed'
          }
        ]
      },
      {
        id: 'wo-2',
        title: 'Emergency - Pump Seal Leak',
        description: 'Irrigation pump showing signs of seal failure',
        type: 'repair',
        priority: 'critical',
        status: 'in-progress',
        equipmentId: 'eq-3',
        location: 'Main - Irrigation Room',
        createdDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
        dueDate: new Date(),
        assignedTo: 'tech-john',
        assignedDate: new Date(Date.now() - 8 * 60 * 60 * 1000),
        startedDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        estimatedDuration: 180,
        checklist: [
          { id: 'c1', task: 'Isolate pump and drain system', completed: true },
          { id: 'c2', task: 'Remove pump housing', completed: true },
          { id: 'c3', task: 'Replace mechanical seal', completed: false },
          { id: 'c4', task: 'Test for leaks', completed: false },
          { id: 'c5', task: 'Return to service', completed: false }
        ]
      },
      {
        id: 'wo-3',
        title: 'LED Panel Cleaning - Flower Room A',
        description: 'Quarterly cleaning of all LED fixtures',
        type: 'maintenance',
        priority: 'medium',
        status: 'assigned',
        location: 'Main - Flower Room A',
        createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assignedTo: 'tech-mary',
        assignedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        estimatedDuration: 240
      }
    ];

    // Sample spare parts
    const sampleParts: SparePart[] = [
      {
        id: 'part-1',
        name: 'MERV 13 Air Filter 24x24x2',
        partNumber: 'FLT-MERV13-24',
        manufacturer: '3M',
        description: 'High efficiency air filter for HVAC units',
        category: 'Filters',
        currentStock: 8,
        minimumStock: 12,
        maximumStock: 48,
        location: 'Storage Room - Shelf A3',
        unitCost: 45,
        suppliers: [
          {
            id: 'sup-1',
            name: 'HVAC Supply Co',
            contact: {
              phone: '555-0100',
              email: 'orders@hvacsupply.com'
            },
            partNumber: '3M-MERV13-24x24',
            price: 42,
            leadTime: 3,
            preferred: true
          }
        ],
        compatibleEquipment: ['eq-2'],
        leadTime: 3
      },
      {
        id: 'part-2',
        name: 'Mechanical Seal Kit - CR Series',
        partNumber: 'SEAL-CR10-KIT',
        manufacturer: 'Grundfos',
        description: 'Complete seal replacement kit for CR 10 pumps',
        category: 'Pump Parts',
        currentStock: 1,
        minimumStock: 2,
        maximumStock: 4,
        location: 'Storage Room - Cabinet B1',
        unitCost: 285,
        suppliers: [
          {
            id: 'sup-2',
            name: 'Pump Parts Direct',
            contact: {
              phone: '555-0200',
              email: 'sales@pumpparts.com'
            },
            partNumber: 'GRF-SEAL-CR10',
            price: 275,
            leadTime: 7,
            preferred: true
          }
        ],
        compatibleEquipment: ['eq-3'],
        leadTime: 7
      },
      {
        id: 'part-3',
        name: 'LED Driver 600W',
        partNumber: 'DRV-600-480',
        manufacturer: 'Inventronics',
        description: 'Replacement LED driver for grow lights',
        category: 'Electrical',
        currentStock: 2,
        minimumStock: 1,
        maximumStock: 3,
        location: 'Storage Room - Shelf C2',
        unitCost: 185,
        suppliers: [
          {
            id: 'sup-3',
            name: 'Lighting Supply Inc',
            contact: {
              phone: '555-0300',
              email: 'orders@lightingsupply.com'
            },
            partNumber: 'INV-EUD-600S480DT',
            price: 180,
            leadTime: 14,
            preferred: true
          }
        ],
        compatibleEquipment: ['eq-1'],
        leadTime: 14
      }
    ];

    // Add sample data to equipment manager
    sampleEquipment.forEach(eq => equipmentManager.addEquipment(eq));
    sampleWorkOrders.forEach(wo => equipmentManager.addWorkOrder(wo));
    sampleParts.forEach(part => equipmentManager.addSparePart(part));
    
    setEquipment(sampleEquipment);
    setWorkOrders(sampleWorkOrders);
    setSpareParts(sampleParts);
    setDataLoaded(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'text-green-500';
      case 'maintenance':
      case 'in-progress':
      case 'assigned':
        return 'text-yellow-500';
      case 'repair':
      case 'open':
      case 'overdue':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatHours = (hours: number) => {
    if (hours < 24) return `${hours.toFixed(1)}h`;
    if (hours < 168) return `${(hours / 24).toFixed(1)}d`;
    return `${(hours / 168).toFixed(1)}w`;
  };

  const getLifetimeStatusColor = (status: LifetimeAnalysis['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-500 bg-green-500/10';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10';
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'expired': return 'text-red-600 bg-red-600/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const handleAddEquipment = async (newEquipment: Omit<Equipment, 'id' | 'usage' | 'maintenance'> & { initialHours?: number }) => {
    try {
      const { initialHours, ...equipmentData } = newEquipment;
      
      const equipmentWithDefaults = {
        ...equipmentData,
        usage: {
          totalHours: initialHours || 0,
          dailyHours: [],
          lastUpdated: new Date()
        },
        maintenance: {
          schedule: [],
          history: []
        }
      };
      
      const registeredEquipment = equipmentManager.registerEquipment(equipmentWithDefaults);
      setEquipment([...equipment, registeredEquipment]);
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        totalEquipment: prev.totalEquipment + 1
      }));
      
      setShowAddEquipmentModal(false);
    } catch (error) {
      console.error('Error adding equipment:', error);
      // In a real app, you'd show an error notification here
    }
  };

  const handleExportReport = () => {
    // Generate CSV data
    const csvHeaders = [
      'ID', 'Name', 'Type', 'Manufacturer', 'Model', 'Serial Number',
      'Status', 'Location', 'Purchase Date', 'Total Hours', 'Purchase Cost'
    ];
    
    const csvData = equipment.map(eq => [
      eq.id,
      eq.name,
      eq.type,
      eq.manufacturer,
      eq.model,
      eq.serialNumber,
      eq.status,
      `${eq.location.facility} - ${eq.location.room} - ${eq.location.zone}`,
      eq.purchaseDate.toISOString().split('T')[0],
      eq.usage.totalHours.toFixed(1),
      eq.cost.purchase.toString()
    ]);
    
    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `equipment-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Equipment Management</h1>
            <p className="text-gray-400">Track maintenance, usage, and inventory</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExportReport}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Report
            </button>
            <button 
              onClick={() => setShowAddEquipmentModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Equipment
            </button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-7 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Wrench className="w-5 h-5 text-gray-400" />
              <span className="text-2xl font-bold">{metrics.totalEquipment}</span>
            </div>
            <p className="text-sm text-gray-400">Total Equipment</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold">{metrics.activeWorkOrders}</span>
            </div>
            <p className="text-sm text-gray-400">Active Orders</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-2xl font-bold text-red-500">{metrics.overdueWorkOrders}</span>
            </div>
            <p className="text-sm text-gray-400">Overdue</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-orange-400" />
              <span className="text-2xl font-bold text-orange-500">{metrics.lowStockParts}</span>
            </div>
            <p className="text-sm text-gray-400">Low Stock</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-bold">{metrics.upcomingMaintenance}</span>
            </div>
            <p className="text-sm text-gray-400">Due This Week</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-xl font-bold">{formatCurrency(metrics.monthlyMaintenanceCost)}</span>
            </div>
            <p className="text-sm text-gray-400">Monthly Cost</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Timer className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-500">{metrics.equipmentApproachingEOL}</span>
            </div>
            <p className="text-sm text-gray-400">Near EOL</p>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedView === 'overview' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedView('equipment')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedView === 'equipment' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Equipment
          </button>
          <button
            onClick={() => setSelectedView('workorders')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedView === 'workorders' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Work Orders
          </button>
          <button
            onClick={() => setSelectedView('inventory')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedView === 'inventory' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Spare Parts
          </button>
        </div>

        {/* Main Content */}
        {selectedView === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Critical Equipment Status */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Critical Equipment Status
              </h2>
              <div className="space-y-3">
                {equipment.filter(eq => eq.status !== 'active').map(eq => (
                  <div key={eq.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">{eq.name}</p>
                      <p className="text-sm text-gray-400">{eq.location.room}</p>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(eq.status)}`}>
                      {eq.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Maintenance */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Upcoming Maintenance
              </h2>
              <div className="space-y-3">
                {equipment
                  .filter(eq => eq.maintenance.nextDue)
                  .sort((a, b) => (a.maintenance.nextDue?.getTime() || 0) - (b.maintenance.nextDue?.getTime() || 0))
                  .slice(0, 5)
                  .map(eq => (
                    <div key={eq.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium">{eq.name}</p>
                        <p className="text-sm text-gray-400">
                          {eq.maintenance.schedule[0]?.name}
                        </p>
                      </div>
                      <span className="text-sm text-gray-400">
                        {eq.maintenance.nextDue?.toLocaleDateString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Active Work Orders */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-400" />
                Active Work Orders
              </h2>
              <div className="space-y-3">
                {workOrders
                  .filter(wo => wo.status !== 'completed' && wo.status !== 'cancelled')
                  .map(wo => (
                    <div key={wo.id} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{wo.title}</p>
                          <p className="text-sm text-gray-400">{wo.location}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(wo.priority)}`}>
                          {wo.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className={getStatusColor(wo.status)}>
                          {wo.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className="text-gray-400">
                          Due: {wo.dueDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Equipment Lifetime Alerts */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Timer className="w-5 h-5 text-yellow-400" />
                Equipment Lifetime Alerts
              </h2>
              <div className="space-y-3">
                {equipment
                  .filter(eq => eq.specifications.expectedLifetime)
                  .map(eq => equipmentManager.getLifetimeAnalysis(eq.id))
                  .filter(analysis => analysis && (analysis.status === 'warning' || analysis.status === 'critical' || analysis.status === 'expired'))
                  .sort((a, b) => (a?.percentageUsed || 0) - (b?.percentageUsed || 0))
                  .reverse()
                  .slice(0, 5)
                  .map(analysis => {
                    if (!analysis) return null;
                    const eq = equipment.find(e => e.id === analysis.equipmentId);
                    if (!eq) return null;
                    
                    return (
                      <div key={eq.id} className="p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{eq.name}</p>
                            <p className="text-sm text-gray-400">{eq.location.room}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getLifetimeStatusColor(analysis.status)}`}>
                            {analysis.percentageUsed}% USED
                          </span>
                        </div>
                        <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`absolute left-0 top-0 h-full ${
                              analysis.status === 'warning' ? 'bg-yellow-500' :
                              analysis.status === 'critical' ? 'bg-red-500' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${Math.min(100, analysis.percentageUsed)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {analysis.remainingDays} days remaining • EOL: {analysis.estimatedEndOfLife.toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* AI Maintenance Alerts */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI Maintenance Alerts
              </h2>
              <div className="space-y-3">
                {aiAlerts.length === 0 ? (
                  <p className="text-sm text-gray-400">No critical alerts at this time</p>
                ) : (
                  aiAlerts.slice(0, 5).map(alert => (
                    <div key={alert.id} className="p-3 bg-gray-800 rounded-lg border-l-4 border-purple-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{alert.equipmentName}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              alert.severity === 'critical' 
                                ? 'bg-red-500/20 text-red-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {alert.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{alert.message}</p>
                          <p className="text-xs text-purple-400 mt-1 flex items-center gap-1">
                            <ChevronRight className="w-3 h-3" />
                            {alert.action}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {aiAlerts.length > 5 && (
                <p className="text-xs text-gray-400 mt-3 text-center">
                  +{aiAlerts.length - 5} more alerts
                </p>
              )}
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-red-400" />
                Low Stock Alerts
              </h2>
              <div className="space-y-3">
                {spareParts
                  .filter(part => part.currentStock <= part.minimumStock)
                  .map(part => (
                    <div key={part.id} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{part.name}</p>
                          <p className="text-sm text-gray-400">{part.partNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-500 font-medium">
                            {part.currentStock} / {part.minimumStock}
                          </p>
                          <p className="text-xs text-gray-400">Current / Min</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'equipment' && (
          <div>
            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="repair">Repair</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            {/* Equipment List */}
            <div className="grid gap-4">
              {equipment
                .filter(eq => 
                  (filterStatus === 'all' || eq.status === filterStatus) &&
                  (searchTerm === '' || 
                   eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   eq.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   eq.model.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map(eq => (
                  <div key={eq.id} className="bg-gray-900 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{eq.name}</h3>
                          {activeRuntimes.has(eq.id) && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                              <Activity className="w-3 h-3" />
                              Running
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          {eq.manufacturer} {eq.model} • S/N: {eq.serialNumber}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {eq.location.facility} - {eq.location.room} - {eq.location.zone}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${getStatusColor(eq.status)}`}>
                          {eq.status.toUpperCase()}
                        </span>
                        {eq.usage.currentSessionStart && (
                          <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse block" />
                            Running
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Total Usage</p>
                        <p className="font-medium">{formatHours(eq.usage.totalHours)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Power</p>
                        <p className="font-medium">{eq.specifications.power}W</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Next Maintenance</p>
                        <p className="font-medium">
                          {eq.maintenance.nextDue?.toLocaleDateString() || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Total Cost</p>
                        <p className="font-medium">{formatCurrency(eq.cost.purchase)}</p>
                      </div>
                    </div>

                    {/* Lifetime Status */}
                    {eq.specifications.expectedLifetime && (() => {
                      const analysis = equipmentManager.getLifetimeAnalysis(eq.id);
                      if (!analysis) return null;
                      
                      return (
                        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Lifetime Status</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getLifetimeStatusColor(analysis.status)}`}>
                              {analysis.status.toUpperCase()} - {analysis.percentageUsed}%
                            </span>
                          </div>
                          <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`absolute left-0 top-0 h-full transition-all ${
                                analysis.status === 'healthy' ? 'bg-green-500' :
                                analysis.status === 'warning' ? 'bg-yellow-500' :
                                analysis.status === 'critical' ? 'bg-red-500' :
                                'bg-red-600'
                              }`}
                              style={{ width: `${Math.min(100, analysis.percentageUsed)}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-gray-400">
                            <span>{analysis.totalHours.toFixed(0)}h used</span>
                            <span>{analysis.remainingHours}h remaining</span>
                          </div>
                          {analysis.status !== 'healthy' && (
                            <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Estimated EOL: {analysis.estimatedEndOfLife.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => {
                          setSelectedEquipment(eq);
                          setShowDetailsModal(true);
                        }}
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-all"
                      >
                        View Details
                      </button>
                      {activeRuntimes.has(eq.id) ? (
                        <button 
                          onClick={async () => {
                            try {
                              runtimeMonitor.stopRuntime(eq.id);
                              await equipmentManager.stopUsageTracking(eq.id);
                              checkActiveRuntimes();
                              loadDashboardData(); // Refresh data
                            } catch (error) {
                              console.error('Error stopping tracking:', error);
                            }
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-all"
                        >
                          Stop Tracking
                        </button>
                      ) : (
                        <button 
                          onClick={async () => {
                            try {
                              runtimeMonitor.startRuntime(eq.id);
                              await equipmentManager.startUsageTracking(eq.id);
                              checkActiveRuntimes();
                              loadDashboardData(); // Refresh data
                            } catch (error) {
                              console.error('Error starting tracking:', error);
                            }
                          }}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-all"
                        >
                          Start Tracking
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          alert(`Create work order for ${eq.name}`);
                        }}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-all"
                      >
                        Create Work Order
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {selectedView === 'workorders' && (
          <div>
            {/* Work Orders List */}
            <div className="grid gap-4">
              {workOrders.map(wo => (
                <div key={wo.id} className="bg-gray-900 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{wo.title}</h3>
                      <p className="text-sm text-gray-400">{wo.description}</p>
                      <p className="text-sm text-gray-400 mt-1">{wo.location}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-sm rounded ${getPriorityColor(wo.priority)}`}>
                        {wo.priority.toUpperCase()}
                      </span>
                      <span className={`text-sm font-medium ${getStatusColor(wo.status)}`}>
                        {wo.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {wo.checklist && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-2">Progress</p>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${(wo.checklist.filter(c => c.completed).length / wo.checklist.length) * 100}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {wo.checklist.filter(c => c.completed).length} of {wo.checklist.length} tasks completed
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Created</p>
                      <p className="font-medium">{wo.createdDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Due Date</p>
                      <p className={`font-medium ${wo.dueDate < new Date() ? 'text-red-500' : ''}`}>
                        {wo.dueDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Assigned To</p>
                      <p className="font-medium">{wo.assignedTo || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Duration</p>
                      <p className="font-medium">{wo.estimatedDuration} min</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-all">
                      View Details
                    </button>
                    {wo.status === 'open' && (
                      <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-all">
                        Assign Tech
                      </button>
                    )}
                    {wo.status === 'in-progress' && (
                      <button className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-all">
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedView === 'inventory' && (
          <div>
            {/* Spare Parts Inventory */}
            <div className="grid gap-4">
              {spareParts.map(part => (
                <div key={part.id} className="bg-gray-900 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{part.name}</h3>
                      <p className="text-sm text-gray-400">
                        P/N: {part.partNumber} • {part.manufacturer}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">{part.location}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        part.currentStock <= part.minimumStock ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {part.currentStock}
                      </p>
                      <p className="text-xs text-gray-400">in stock</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-400">Min Stock</p>
                      <p className="font-medium">{part.minimumStock}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Max Stock</p>
                      <p className="font-medium">{part.maximumStock}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Unit Cost</p>
                      <p className="font-medium">{formatCurrency(part.unitCost)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Lead Time</p>
                      <p className="font-medium">{part.leadTime} days</p>
                    </div>
                  </div>

                  {part.currentStock <= part.minimumStock && (
                    <div className="bg-red-900/20 border border-red-600 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Low stock alert - Reorder recommended
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-all">
                      View Details
                    </button>
                    <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-all">
                      Order More
                    </button>
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-all">
                      Adjust Stock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Equipment Details Modal */}
      {selectedEquipment && (
        <EquipmentDetailsModal
          equipment={selectedEquipment}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEquipment(null);
          }}
        />
      )}

      {/* Add Equipment Modal */}
      <AddEquipmentModal
        isOpen={showAddEquipmentModal}
        onClose={() => setShowAddEquipmentModal(false)}
        onSubmit={handleAddEquipment}
      />
    </div>
  );
}