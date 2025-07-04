// Equipment and Asset Management System
// Tracks usage hours, maintenance schedules, and generates automated work orders

export interface Equipment {
  id: string;
  name: string;
  type: 'lighting' | 'hvac' | 'irrigation' | 'sensor' | 'pump' | 'fan' | 'dehumidifier' | 'controller' | 'other';
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  warrantyExpiration?: Date;
  location: {
    facility: string;
    room: string;
    zone: string;
    position?: { x: number; y: number; z: number };
  };
  status: 'active' | 'maintenance' | 'repair' | 'retired';
  specifications: {
    power?: number; // Watts
    voltage?: number;
    amperage?: number;
    capacity?: number;
    efficiency?: number;
    expectedLifetime?: number; // Hours
  };
  usage: {
    totalHours: number;
    currentSessionStart?: Date;
    dailyHours: number[];
    lastUpdated: Date;
  };
  maintenance: {
    schedule: MaintenanceSchedule[];
    history: MaintenanceRecord[];
    nextDue?: Date;
  };
  cost: {
    purchase: number;
    installation?: number;
    annualMaintenance?: number;
    energyCost?: number;
  };
  metadata?: Record<string, any>;
}

export interface MaintenanceSchedule {
  id: string;
  type: 'preventive' | 'calibration' | 'cleaning' | 'inspection' | 'replacement';
  name: string;
  description: string;
  frequency: {
    type: 'hours' | 'days' | 'months' | 'cycles';
    value: number;
  };
  estimatedDuration: number; // minutes
  requiredParts?: SparePart[];
  requiredSkills?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  notifications: {
    daysBeforeDue: number;
    recipients: string[]; // user IDs or roles
  };
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  scheduleId?: string;
  type: 'scheduled' | 'unscheduled' | 'emergency';
  performedDate: Date;
  performedBy: string;
  duration: number; // minutes
  description: string;
  partsUsed?: Array<{
    partId: string;
    quantity: number;
    cost: number;
  }>;
  laborCost?: number;
  notes?: string;
  images?: string[];
  nextDue?: Date;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  type: 'maintenance' | 'repair' | 'inspection' | 'installation' | 'calibration';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  equipmentId?: string;
  location: string;
  createdDate: Date;
  dueDate: Date;
  assignedTo?: string;
  assignedDate?: Date;
  startedDate?: Date;
  completedDate?: Date;
  estimatedDuration: number;
  actualDuration?: number;
  checklist?: ChecklistItem[];
  parts?: Array<{
    partId: string;
    quantity: number;
    status: 'needed' | 'ordered' | 'received' | 'used';
  }>;
  attachments?: string[];
  comments?: Comment[];
  automatedTrigger?: {
    type: 'usage-hours' | 'calendar' | 'sensor-alert' | 'manual';
    condition: string;
  };
}

export interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  completedBy?: string;
  completedDate?: Date;
  notes?: string;
}

export interface Comment {
  id: string;
  userId: string;
  timestamp: Date;
  text: string;
  attachments?: string[];
}

export interface SparePart {
  id: string;
  name: string;
  partNumber: string;
  manufacturer: string;
  description: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  location: string;
  unitCost: number;
  suppliers: Supplier[];
  compatibleEquipment: string[]; // equipment IDs
  leadTime: number; // days
  lastOrdered?: Date;
  lastReceived?: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contact: {
    phone: string;
    email: string;
    website?: string;
    salesRep?: string;
  };
  partNumber: string;
  price: number;
  minimumOrder?: number;
  leadTime: number;
  preferred: boolean;
}

export interface LifetimeAnalysis {
  equipmentId: string;
  totalHours: number;
  expectedLifetime: number;
  percentageUsed: number;
  remainingHours: number;
  remainingDays: number;
  status: 'healthy' | 'warning' | 'critical' | 'expired';
  estimatedEndOfLife: Date;
  monthlyUsageAverage: number;
}

export class EquipmentManager {
  private equipment: Map<string, Equipment> = new Map();
  private workOrders: Map<string, WorkOrder> = new Map();
  private spareParts: Map<string, SparePart> = new Map();
  private usageTracking: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    // Initialize with empty maps - data will be loaded from dashboard
  }

  // Add method to populate equipment for dashboard
  addEquipment(eq: Equipment): void {
    this.equipment.set(eq.id, eq);
  }

  addWorkOrder(wo: WorkOrder): void {
    this.workOrders.set(wo.id, wo);
  }

  addSparePart(part: SparePart): void {
    this.spareParts.set(part.id, part);
  }

  // Equipment lifecycle management
  async registerEquipment(equipment: Omit<Equipment, 'id' | 'usage'>): Promise<Equipment> {
    const newEquipment: Equipment = {
      ...equipment,
      id: `eq-${Date.now()}`,
      usage: {
        totalHours: 0,
        dailyHours: [],
        lastUpdated: new Date()
      }
    };

    this.equipment.set(newEquipment.id, newEquipment);
    
    // Set up maintenance schedules
    this.scheduleMaintenance(newEquipment);
    
    return newEquipment;
  }

  async retireEquipment(equipmentId: string, reason: string): Promise<void> {
    const equipment = this.equipment.get(equipmentId);
    if (!equipment) return;

    equipment.status = 'retired';
    
    // Stop usage tracking
    this.stopUsageTracking(equipmentId);
    
    // Cancel pending work orders
    const pendingOrders = Array.from(this.workOrders.values())
      .filter(wo => wo.equipmentId === equipmentId && wo.status !== 'completed');
    
    pendingOrders.forEach(wo => {
      wo.status = 'cancelled';
      wo.comments = wo.comments || [];
      wo.comments.push({
        id: `comment-${Date.now()}`,
        userId: 'system',
        timestamp: new Date(),
        text: `Work order cancelled due to equipment retirement: ${reason}`
      });
    });
  }

  // Usage tracking
  async startUsageTracking(equipmentId: string): Promise<void> {
    const equipment = this.equipment.get(equipmentId);
    if (!equipment) return;

    // Mark session start
    equipment.usage.currentSessionStart = new Date();
    
    // Update usage every minute
    const interval = setInterval(() => {
      this.updateUsageHours(equipmentId);
    }, 60000); // 1 minute

    this.usageTracking.set(equipmentId, interval);
  }

  async stopUsageTracking(equipmentId: string): Promise<void> {
    const interval = this.usageTracking.get(equipmentId);
    if (interval) {
      clearInterval(interval);
      this.usageTracking.delete(equipmentId);
    }

    // Final usage update
    this.updateUsageHours(equipmentId);
    
    const equipment = this.equipment.get(equipmentId);
    if (equipment) {
      equipment.usage.currentSessionStart = undefined;
    }
  }

  private updateUsageHours(equipmentId: string): void {
    const equipment = this.equipment.get(equipmentId);
    if (!equipment || !equipment.usage.currentSessionStart) return;

    const sessionHours = (Date.now() - equipment.usage.currentSessionStart.getTime()) / (1000 * 60 * 60);
    equipment.usage.totalHours += sessionHours / 60; // Add minutes as fraction
    equipment.usage.currentSessionStart = new Date(); // Reset for next interval
    equipment.usage.lastUpdated = new Date();

    // Update daily hours
    const today = new Date().toDateString();
    const todayIndex = equipment.usage.dailyHours.findIndex(d => 
      new Date(d).toDateString() === today
    );
    
    if (todayIndex >= 0) {
      equipment.usage.dailyHours[todayIndex] += sessionHours / 60;
    } else {
      equipment.usage.dailyHours.push(sessionHours / 60);
    }

    // Check maintenance triggers
    this.checkMaintenanceTriggers(equipment);
  }

  // Maintenance scheduling
  private scheduleMaintenance(equipment: Equipment): void {
    equipment.maintenance.schedule.forEach(schedule => {
      const nextDue = this.calculateNextDue(equipment, schedule);
      
      if (nextDue && (!equipment.maintenance.nextDue || nextDue < equipment.maintenance.nextDue)) {
        equipment.maintenance.nextDue = nextDue;
      }
    });
  }

  private calculateNextDue(equipment: Equipment, schedule: MaintenanceSchedule): Date | null {
    const lastMaintenance = equipment.maintenance.history
      .filter(h => h.scheduleId === schedule.id)
      .sort((a, b) => b.performedDate.getTime() - a.performedDate.getTime())[0];

    const baseDate = lastMaintenance?.performedDate || equipment.purchaseDate;

    switch (schedule.frequency.type) {
      case 'hours':
        const hoursElapsed = equipment.usage.totalHours - 
          (lastMaintenance ? this.getUsageHoursAtDate(equipment, lastMaintenance.performedDate) : 0);
        const hoursRemaining = schedule.frequency.value - hoursElapsed;
        
        if (hoursRemaining <= 0) return new Date(); // Due now
        
        // Estimate based on average daily usage
        const avgDailyHours = equipment.usage.dailyHours.reduce((a, b) => a + b, 0) / 
                             Math.max(equipment.usage.dailyHours.length, 1);
        const daysRemaining = avgDailyHours > 0 ? hoursRemaining / avgDailyHours : 30;
        
        return new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);

      case 'days':
        return new Date(baseDate.getTime() + schedule.frequency.value * 24 * 60 * 60 * 1000);

      case 'months':
        const nextDate = new Date(baseDate);
        nextDate.setMonth(nextDate.getMonth() + schedule.frequency.value);
        return nextDate;

      default:
        return null;
    }
  }

  private getUsageHoursAtDate(equipment: Equipment, date: Date): number {
    // Calculate usage hours at a specific date from history
    // This would need more detailed tracking in production
    return equipment.usage.totalHours;
  }

  private checkMaintenanceTriggers(equipment: Equipment): void {
    equipment.maintenance.schedule.forEach(schedule => {
      const nextDue = this.calculateNextDue(equipment, schedule);
      
      if (nextDue && nextDue <= new Date()) {
        // Create automated work order
        this.createAutomatedWorkOrder(equipment, schedule);
      } else if (nextDue) {
        // Check if notification should be sent
        const daysUntilDue = (nextDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        
        if (daysUntilDue <= schedule.notifications.daysBeforeDue) {
          this.sendMaintenanceNotification(equipment, schedule, daysUntilDue);
        }
      }
    });
  }

  // Work order management
  async createWorkOrder(data: Omit<WorkOrder, 'id' | 'createdDate' | 'status'>): Promise<WorkOrder> {
    const workOrder: WorkOrder = {
      ...data,
      id: `wo-${Date.now()}`,
      createdDate: new Date(),
      status: 'open'
    };

    this.workOrders.set(workOrder.id, workOrder);
    
    // Check spare parts availability
    if (workOrder.parts) {
      this.checkPartsAvailability(workOrder);
    }

    // Auto-assign based on skills and availability
    if (!workOrder.assignedTo) {
      this.autoAssignWorkOrder(workOrder);
    }

    return workOrder;
  }

  private createAutomatedWorkOrder(equipment: Equipment, schedule: MaintenanceSchedule): void {
    // Check if work order already exists
    const existingOrder = Array.from(this.workOrders.values()).find(wo =>
      wo.equipmentId === equipment.id &&
      wo.automatedTrigger?.condition === schedule.id &&
      wo.status !== 'completed' &&
      wo.status !== 'cancelled'
    );

    if (existingOrder) return;

    const workOrder: WorkOrder = {
      id: `wo-${Date.now()}`,
      title: `${schedule.name} - ${equipment.name}`,
      description: schedule.description,
      type: 'maintenance',
      priority: schedule.priority,
      status: 'open',
      equipmentId: equipment.id,
      location: `${equipment.location.facility} - ${equipment.location.room}`,
      createdDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      estimatedDuration: schedule.estimatedDuration,
      automatedTrigger: {
        type: schedule.frequency.type === 'hours' ? 'usage-hours' : 'calendar',
        condition: schedule.id
      },
      checklist: this.generateMaintenanceChecklist(schedule),
      parts: schedule.requiredParts?.map(part => ({
        partId: part.id,
        quantity: 1,
        status: 'needed' as const
      }))
    };

    this.workOrders.set(workOrder.id, workOrder);
    this.sendWorkOrderNotification(workOrder);
  }

  private generateMaintenanceChecklist(schedule: MaintenanceSchedule): ChecklistItem[] {
    // Generate standard checklist based on maintenance type
    const checklists: Record<string, string[]> = {
      cleaning: [
        'Power off equipment',
        'Remove debris and dust',
        'Clean filters/screens',
        'Wipe down surfaces',
        'Check for corrosion',
        'Power on and test'
      ],
      calibration: [
        'Gather calibration tools',
        'Record current readings',
        'Perform calibration procedure',
        'Verify new readings',
        'Update calibration certificate',
        'Log in maintenance system'
      ],
      inspection: [
        'Visual inspection for damage',
        'Check electrical connections',
        'Test safety features',
        'Verify operating parameters',
        'Document findings',
        'Schedule repairs if needed'
      ],
      preventive: [
        'Check and tighten connections',
        'Lubricate moving parts',
        'Replace filters',
        'Test operation',
        'Record measurements',
        'Update maintenance log'
      ],
      replacement: [
        'Verify replacement part',
        'Power off and lockout',
        'Remove old component',
        'Install new component',
        'Test functionality',
        'Dispose of old part properly'
      ]
    };

    const tasks = checklists[schedule.type] || ['Perform maintenance as specified'];
    
    return tasks.map((task, index) => ({
      id: `check-${index}`,
      task,
      completed: false
    }));
  }

  async assignWorkOrder(workOrderId: string, userId: string): Promise<void> {
    const workOrder = this.workOrders.get(workOrderId);
    if (!workOrder) return;

    workOrder.assignedTo = userId;
    workOrder.assignedDate = new Date();
    workOrder.status = 'assigned';
    
    this.sendAssignmentNotification(workOrder, userId);
  }

  async updateWorkOrderStatus(
    workOrderId: string, 
    status: WorkOrder['status'],
    notes?: string
  ): Promise<void> {
    const workOrder = this.workOrders.get(workOrderId);
    if (!workOrder) return;

    const previousStatus = workOrder.status;
    workOrder.status = status;

    // Update timestamps
    if (status === 'in-progress' && !workOrder.startedDate) {
      workOrder.startedDate = new Date();
    } else if (status === 'completed') {
      workOrder.completedDate = new Date();
      
      if (workOrder.startedDate) {
        workOrder.actualDuration = 
          (workOrder.completedDate.getTime() - workOrder.startedDate.getTime()) / (1000 * 60);
      }

      // Update equipment maintenance history
      if (workOrder.equipmentId) {
        this.recordMaintenanceCompletion(workOrder);
      }
    }

    // Add comment if notes provided
    if (notes) {
      workOrder.comments = workOrder.comments || [];
      workOrder.comments.push({
        id: `comment-${Date.now()}`,
        userId: 'system',
        timestamp: new Date(),
        text: `Status changed from ${previousStatus} to ${status}: ${notes}`
      });
    }
  }

  private recordMaintenanceCompletion(workOrder: WorkOrder): void {
    const equipment = this.equipment.get(workOrder.equipmentId!);
    if (!equipment) return;

    const maintenanceRecord: MaintenanceRecord = {
      id: `maint-${Date.now()}`,
      equipmentId: workOrder.equipmentId!,
      scheduleId: workOrder.automatedTrigger?.condition,
      type: workOrder.automatedTrigger ? 'scheduled' : 'unscheduled',
      performedDate: workOrder.completedDate!,
      performedBy: workOrder.assignedTo!,
      duration: workOrder.actualDuration || workOrder.estimatedDuration,
      description: workOrder.description,
      partsUsed: workOrder.parts?.filter(p => p.status === 'used').map(p => ({
        partId: p.partId,
        quantity: p.quantity,
        cost: this.getPartCost(p.partId) * p.quantity
      })),
      notes: workOrder.comments?.map(c => c.text).join('\n')
    };

    equipment.maintenance.history.push(maintenanceRecord);
    
    // Reschedule next maintenance
    this.scheduleMaintenance(equipment);
  }

  // Spare parts management
  async addSparePart(part: Omit<SparePart, 'id'>): Promise<SparePart> {
    const sparePart: SparePart = {
      ...part,
      id: `part-${Date.now()}`
    };

    this.spareParts.set(sparePart.id, sparePart);
    return sparePart;
  }

  async updateStock(partId: string, quantity: number, type: 'add' | 'remove'): Promise<void> {
    const part = this.spareParts.get(partId);
    if (!part) return;

    if (type === 'add') {
      part.currentStock += quantity;
      part.lastReceived = new Date();
    } else {
      part.currentStock = Math.max(0, part.currentStock - quantity);
    }

    // Check minimum stock levels
    if (part.currentStock <= part.minimumStock) {
      this.createReorderNotification(part);
    }
  }

  private checkPartsAvailability(workOrder: WorkOrder): void {
    if (!workOrder.parts) return;

    workOrder.parts.forEach(requiredPart => {
      const part = this.spareParts.get(requiredPart.partId);
      
      if (part && part.currentStock >= requiredPart.quantity) {
        requiredPart.status = 'received';
      } else if (part) {
        requiredPart.status = 'ordered';
        this.createPurchaseOrder(part, requiredPart.quantity - part.currentStock);
      }
    });
  }

  private getPartCost(partId: string): number {
    const part = this.spareParts.get(partId);
    return part?.unitCost || 0;
  }

  // Analytics and reporting
  async getEquipmentMetrics(equipmentId: string): Promise<{
    uptime: number;
    mtbf: number; // Mean Time Between Failures
    mttr: number; // Mean Time To Repair
    totalCost: number;
    efficiency: number;
  }> {
    const equipment = this.equipment.get(equipmentId);
    if (!equipment) throw new Error('Equipment not found');

    // Calculate uptime
    const totalPossibleHours = 
      (Date.now() - equipment.purchaseDate.getTime()) / (1000 * 60 * 60);
    const uptime = (equipment.usage.totalHours / totalPossibleHours) * 100;

    // Calculate MTBF
    const failures = equipment.maintenance.history.filter(h => h.type === 'unscheduled');
    const mtbf = failures.length > 0 
      ? equipment.usage.totalHours / failures.length 
      : equipment.usage.totalHours;

    // Calculate MTTR
    const repairTimes = failures.map(f => f.duration);
    const mttr = repairTimes.length > 0
      ? repairTimes.reduce((a, b) => a + b, 0) / repairTimes.length
      : 0;

    // Calculate total cost
    const maintenanceCost = equipment.maintenance.history.reduce((total, record) => {
      const partsCost = record.partsUsed?.reduce((sum, part) => sum + part.cost, 0) || 0;
      const laborCost = record.laborCost || (record.duration * 50 / 60); // $50/hour default
      return total + partsCost + laborCost;
    }, 0);

    const energyCost = equipment.specifications.power 
      ? (equipment.usage.totalHours * equipment.specifications.power / 1000) * 0.12 // $0.12/kWh
      : 0;

    const totalCost = (equipment.cost.purchase || 0) + 
                     (equipment.cost.installation || 0) + 
                     maintenanceCost + 
                     energyCost;

    // Calculate efficiency (simplified)
    const efficiency = equipment.specifications.efficiency || 
                      (uptime * (1 - (failures.length / 100))); // Penalty for failures

    return {
      uptime,
      mtbf,
      mttr,
      totalCost,
      efficiency
    };
  }

  async getDashboardMetrics(): Promise<{
    totalEquipment: number;
    activeWorkOrders: number;
    overdueWorkOrders: number;
    lowStockParts: number;
    upcomingMaintenance: number;
    monthlyMaintenanceCost: number;
  }> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const activeWorkOrders = Array.from(this.workOrders.values())
      .filter(wo => wo.status !== 'completed' && wo.status !== 'cancelled');

    const overdueWorkOrders = activeWorkOrders
      .filter(wo => wo.dueDate < now);

    const lowStockParts = Array.from(this.spareParts.values())
      .filter(part => part.currentStock <= part.minimumStock);

    const upcomingMaintenance = Array.from(this.equipment.values())
      .filter(eq => eq.maintenance.nextDue && eq.maintenance.nextDue <= sevenDaysFromNow)
      .length;

    const monthlyMaintenanceCost = Array.from(this.equipment.values())
      .reduce((total, eq) => {
        const recentMaintenance = eq.maintenance.history
          .filter(h => h.performedDate >= thirtyDaysAgo);
        
        const cost = recentMaintenance.reduce((sum, record) => {
          const partsCost = record.partsUsed?.reduce((s, p) => s + p.cost, 0) || 0;
          const laborCost = record.laborCost || (record.duration * 50 / 60);
          return sum + partsCost + laborCost;
        }, 0);
        
        return total + cost;
      }, 0);

    return {
      totalEquipment: this.equipment.size,
      activeWorkOrders: activeWorkOrders.length,
      overdueWorkOrders: overdueWorkOrders.length,
      lowStockParts: lowStockParts.length,
      upcomingMaintenance,
      monthlyMaintenanceCost
    };
  }

  // Lifetime analysis methods
  getLifetimeAnalysis(equipmentId: string): LifetimeAnalysis | null {
    const equipment = this.equipment.get(equipmentId);
    if (!equipment || !equipment.specifications.expectedLifetime) return null;

    const totalHours = equipment.usage.totalHours;
    const expectedLifetime = equipment.specifications.expectedLifetime;
    const percentageUsed = (totalHours / expectedLifetime) * 100;
    const remainingHours = Math.max(0, expectedLifetime - totalHours);

    // Calculate average daily usage from the last 30 days
    const recentDailyHours = equipment.usage.dailyHours.slice(-30);
    const averageDailyUsage = recentDailyHours.length > 0
      ? recentDailyHours.reduce((sum, hours) => sum + hours, 0) / recentDailyHours.length
      : 8; // Default to 8 hours/day if no data

    const remainingDays = averageDailyUsage > 0 ? remainingHours / averageDailyUsage : 0;
    const monthlyUsageAverage = averageDailyUsage * 30;

    // Calculate estimated end of life date
    const estimatedEndOfLife = new Date();
    estimatedEndOfLife.setDate(estimatedEndOfLife.getDate() + remainingDays);

    // Determine status based on percentage used
    let status: LifetimeAnalysis['status'];
    if (percentageUsed >= 100) {
      status = 'expired';
    } else if (percentageUsed >= 90) {
      status = 'critical';
    } else if (percentageUsed >= 75) {
      status = 'warning';
    } else {
      status = 'healthy';
    }

    return {
      equipmentId,
      totalHours,
      expectedLifetime,
      percentageUsed: Math.round(percentageUsed * 10) / 10,
      remainingHours: Math.round(remainingHours),
      remainingDays: Math.round(remainingDays),
      status,
      estimatedEndOfLife,
      monthlyUsageAverage: Math.round(monthlyUsageAverage)
    };
  }

  // Get all equipment approaching end of life
  getEquipmentApproachingEOL(thresholdPercentage: number = 75): Equipment[] {
    return Array.from(this.equipment.values()).filter(eq => {
      if (!eq.specifications.expectedLifetime) return false;
      const percentageUsed = (eq.usage.totalHours / eq.specifications.expectedLifetime) * 100;
      return percentageUsed >= thresholdPercentage;
    });
  }

  // Create predictive maintenance schedule based on lifetime
  createPredictiveMaintenanceSchedule(equipmentId: string): MaintenanceSchedule[] {
    const analysis = this.getLifetimeAnalysis(equipmentId);
    if (!analysis) return [];

    const schedules: MaintenanceSchedule[] = [];

    // Add inspection schedule if approaching end of life
    if (analysis.status === 'warning' || analysis.status === 'critical') {
      schedules.push({
        id: `pred-inspect-${Date.now()}`,
        type: 'inspection',
        name: 'End-of-Life Inspection',
        description: 'Comprehensive inspection due to equipment approaching rated lifetime',
        frequency: { type: 'days', value: 30 },
        estimatedDuration: 120,
        priority: analysis.status === 'critical' ? 'critical' : 'high',
        notifications: {
          daysBeforeDue: 7,
          recipients: ['maintenance-manager', 'facility-manager']
        }
      });
    }

    // Add replacement planning if critical
    if (analysis.status === 'critical') {
      schedules.push({
        id: `pred-replace-${Date.now()}`,
        type: 'replacement',
        name: 'Equipment Replacement Planning',
        description: 'Plan for equipment replacement - unit at 90% of rated lifetime',
        frequency: { type: 'days', value: 60 },
        estimatedDuration: 240,
        priority: 'critical',
        notifications: {
          daysBeforeDue: 30,
          recipients: ['facility-manager', 'procurement']
        }
      });
    }

    return schedules;
  }

  // Notification methods (would integrate with notification service)
  private sendMaintenanceNotification(
    equipment: Equipment, 
    schedule: MaintenanceSchedule, 
    daysUntilDue: number
  ): void {
  }

  private sendWorkOrderNotification(workOrder: WorkOrder): void {
  }

  private sendAssignmentNotification(workOrder: WorkOrder, userId: string): void {
  }

  private createReorderNotification(part: SparePart): void {
  }

  private createPurchaseOrder(part: SparePart, quantity: number): void {
  }

  private autoAssignWorkOrder(workOrder: WorkOrder): void {
    // In production, this would check technician skills, availability, and location
  }
}

// Export singleton instance
export const equipmentManager = new EquipmentManager();