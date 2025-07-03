// Equipment Maintenance and Diagnostics using AI Photo Analysis
import { RealtimeTracker, LocationUpdate } from './realtime-tracker';

export interface EquipmentPhoto {
  id: string;
  userId: string;
  facilityId: string;
  location: LocationUpdate['location'];
  photoUrl: string;
  equipmentType: 'hvac' | 'lighting' | 'irrigation' | 'electrical' | 'structural' | 'security' | 'other';
  equipmentId?: string; // If linked to specific equipment asset
  roomZone: string;
  issueType: 'maintenance' | 'safety' | 'efficiency' | 'compliance' | 'quality' | 'inventory';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  status: 'reported' | 'analyzing' | 'assigned' | 'in_progress' | 'completed' | 'verified';
  description: string;
  timestamp: Date;
  aiAnalysis?: EquipmentAIAnalysis;
}

export interface EquipmentAIAnalysis {
  issueDetected: boolean;
  safetyHazard: boolean;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  confidence: number;
  detectedIssues: EquipmentIssue[];
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  recommendedActions: string[];
  skillsRequired: string[];
  partsNeeded: string[];
  estimatedTime: string; // "30 minutes", "2 hours", "1 day"
  downtime: 'none' | 'minimal' | 'moderate' | 'significant' | 'facility_shutdown';
}

export interface EquipmentIssue {
  category: 'mechanical' | 'electrical' | 'structural' | 'environmental' | 'safety' | 'efficiency';
  name: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  immediateAction: boolean;
  replacementNeeded: boolean;
  warrantyCovered: boolean;
}

export interface MaintenanceAlert {
  id: string;
  type: 'equipment_failure' | 'safety_hazard' | 'efficiency_loss' | 'compliance_violation' | 'quality_issue';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  title: string;
  message: string;
  equipmentType: string;
  location: LocationUpdate['location'];
  roomZone: string;
  photoId: string;
  assignedTo?: string[];
  estimatedCost?: number;
  downtime?: string;
  dueDate?: Date;
  workOrderId?: string;
  resolved: boolean;
  timestamp: Date;
}

export class VisualMaintenanceSystem {
  private tracker: RealtimeTracker;
  private onMaintenanceAlert?: (alert: MaintenanceAlert) => void;
  private onWorkOrderCreated?: (workOrder: any) => void;

  constructor(
    private userId: string,
    private facilityId: string,
    tracker: RealtimeTracker
  ) {
    this.tracker = tracker;
  }

  /**
   * Report equipment issue with photo
   */
  async reportEquipmentIssue(
    equipmentType: EquipmentPhoto['equipmentType'],
    issueType: EquipmentPhoto['issueType'],
    roomZone: string,
    description: string,
    equipmentId?: string
  ): Promise<EquipmentPhoto> {
    const currentLocation = await this.getCurrentLocation();
    const photoBlob = await this.capturePhoto();

    const equipmentPhoto: EquipmentPhoto = {
      id: this.generateId(),
      userId: this.userId,
      facilityId: this.facilityId,
      location: currentLocation,
      photoUrl: '', // Will be set after upload
      equipmentType,
      equipmentId,
      roomZone,
      issueType,
      priority: 'medium',
      status: 'reported',
      description,
      timestamp: new Date()
    };

    // Upload photo
    equipmentPhoto.photoUrl = await this.uploadPhoto(photoBlob, equipmentPhoto.id);

    // Analyze with AI
    await this.analyzeEquipmentPhoto(equipmentPhoto);

    return equipmentPhoto;
  }

  /**
   * Analyze equipment photo with AI
   */
  private async analyzeEquipmentPhoto(photo: EquipmentPhoto): Promise<void> {
    try {
      photo.status = 'analyzing';

      const response = await fetch('/api/maintenance/analyze-equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId: photo.id,
          photoUrl: photo.photoUrl,
          equipmentType: photo.equipmentType,
          issueType: photo.issueType,
          description: photo.description,
          roomZone: photo.roomZone,
          location: photo.location
        })
      });

      if (!response.ok) throw new Error('Equipment analysis failed');

      const analysis: EquipmentAIAnalysis = await response.json();
      photo.aiAnalysis = analysis;

      // Update priority based on AI analysis
      if (analysis.urgencyLevel === 'emergency') {
        photo.priority = 'emergency';
        await this.generateEmergencyAlert(photo);
      } else if (analysis.urgencyLevel === 'critical') {
        photo.priority = 'critical';
        await this.generateCriticalAlert(photo);
      } else if (analysis.safetyHazard) {
        photo.priority = 'high';
        await this.generateSafetyAlert(photo);
      }

      // Auto-create work order if needed
      if (analysis.immediateAction || photo.priority === 'critical' || photo.priority === 'emergency') {
        await this.createWorkOrder(photo);
      }

      photo.status = 'assigned';
      await this.saveEquipmentPhoto(photo);

    } catch (error) {
      console.error('Failed to analyze equipment photo:', error);
      photo.status = 'reported';
    }
  }

  /**
   * Generate emergency alert for immediate action
   */
  private async generateEmergencyAlert(photo: EquipmentPhoto): Promise<void> {
    if (!photo.aiAnalysis) return;

    const alert: MaintenanceAlert = {
      id: this.generateId(),
      type: photo.aiAnalysis.safetyHazard ? 'safety_hazard' : 'equipment_failure',
      severity: 'emergency',
      title: `🚨 EMERGENCY: ${photo.equipmentType.toUpperCase()} Issue`,
      message: `Emergency ${photo.equipmentType} issue in ${photo.roomZone}. ${photo.aiAnalysis.downtime === 'facility_shutdown' ? 'FACILITY SHUTDOWN RISK' : 'Immediate action required'}.`,
      equipmentType: photo.equipmentType,
      location: photo.location,
      roomZone: photo.roomZone,
      photoId: photo.id,
      estimatedCost: photo.aiAnalysis.estimatedCost.max,
      downtime: photo.aiAnalysis.estimatedTime,
      resolved: false,
      timestamp: new Date()
    };

    // Send emergency alert through tracking system
    await this.tracker.sendAlert({
      id: alert.id,
      type: 'custom',
      severity: 'critical',
      title: alert.title,
      message: alert.message,
      location: photo.location,
      timestamp: new Date(),
      metadata: {
        alertType: 'maintenance_emergency',
        equipmentType: photo.equipmentType,
        photoId: photo.id,
        estimatedCost: photo.aiAnalysis.estimatedCost.max,
        downtime: photo.aiAnalysis.downtime
      }
    });

    await this.saveMaintenanceAlert(alert);
    this.onMaintenanceAlert?.(alert);
  }

  /**
   * Create work order from equipment issue
   */
  private async createWorkOrder(photo: EquipmentPhoto): Promise<void> {
    if (!photo.aiAnalysis) return;

    const workOrder = {
      id: this.generateId(),
      facilityId: this.facilityId,
      title: `${photo.equipmentType} ${photo.issueType} - ${photo.roomZone}`,
      description: photo.description,
      type: photo.issueType,
      priority: photo.priority,
      status: 'open',
      equipmentType: photo.equipmentType,
      equipmentId: photo.equipmentId,
      location: photo.location,
      roomZone: photo.roomZone,
      photoId: photo.id,
      reportedBy: photo.userId,
      estimatedCost: photo.aiAnalysis.estimatedCost.max,
      estimatedTime: photo.aiAnalysis.estimatedTime,
      skillsRequired: photo.aiAnalysis.skillsRequired,
      partsNeeded: photo.aiAnalysis.partsNeeded,
      recommendedActions: photo.aiAnalysis.recommendedActions,
      dueDate: this.calculateDueDate(photo.aiAnalysis.urgencyLevel),
      createdAt: new Date()
    };

    await this.saveWorkOrder(workOrder);
    this.onWorkOrderCreated?.(workOrder);
  }

  /**
   * Quick photo reporting for common issues
   */
  async quickReport(issueType: string, roomZone: string): Promise<EquipmentPhoto> {
    const quickIssues = {
      'light_out': {
        equipmentType: 'lighting' as const,
        issueType: 'maintenance' as const,
        description: 'Light fixture not working'
      },
      'leak': {
        equipmentType: 'irrigation' as const,
        issueType: 'maintenance' as const,
        description: 'Water leak detected'
      },
      'hvac_issue': {
        equipmentType: 'hvac' as const,
        issueType: 'maintenance' as const,
        description: 'HVAC system issue'
      },
      'safety_hazard': {
        equipmentType: 'other' as const,
        issueType: 'safety' as const,
        description: 'Safety hazard identified'
      },
      'electrical_issue': {
        equipmentType: 'electrical' as const,
        issueType: 'safety' as const,
        description: 'Electrical problem'
      }
    };

    const issue = quickIssues[issueType];
    if (!issue) throw new Error('Unknown issue type');

    return this.reportEquipmentIssue(
      issue.equipmentType,
      issue.issueType,
      roomZone,
      issue.description
    );
  }

  // Helper methods
  private async getCurrentLocation(): Promise<LocationUpdate['location']> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }),
        reject,
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  private async capturePhoto(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) resolve(file);
        else reject(new Error('No photo captured'));
      };

      input.click();
    });
  }

  private async uploadPhoto(blob: Blob, photoId: string): Promise<string> {
    const formData = new FormData();
    formData.append('photo', blob, `maintenance-${photoId}.jpg`);
    formData.append('facilityId', this.facilityId);
    formData.append('photoId', photoId);

    const response = await fetch('/api/maintenance/upload-photo', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Photo upload failed');

    const result = await response.json();
    return result.photoUrl;
  }

  private calculateDueDate(urgencyLevel: string): Date {
    const now = new Date();
    switch (urgencyLevel) {
      case 'emergency': return new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour
      case 'critical': return new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours
      case 'high': return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
      case 'medium': return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      default: return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
    }
  }

  private async saveEquipmentPhoto(photo: EquipmentPhoto): Promise<void> {
    await fetch('/api/maintenance/equipment-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photo)
    });
  }

  private async saveMaintenanceAlert(alert: MaintenanceAlert): Promise<void> {
    await fetch('/api/maintenance/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
  }

  private async saveWorkOrder(workOrder: any): Promise<void> {
    await fetch('/api/maintenance/work-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workOrder)
    });
  }

  private generateId(): string {
    return `${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
  }

  // Event handlers
  onAlert(callback: (alert: MaintenanceAlert) => void): void {
    this.onMaintenanceAlert = callback;
  }

  onWorkOrder(callback: (workOrder: any) => void): void {
    this.onWorkOrderCreated = callback;
  }
}

// Common equipment issues and categories
export const FACILITY_EQUIPMENT_ISSUES = {
  hvac: [
    'Not cooling/heating', 'Strange noises', 'Air flow issues', 'Condensation problems',
    'Filter needs replacement', 'Thermostat issues', 'Duct leaks', 'Fan not working'
  ],
  lighting: [
    'Bulb burned out', 'Flickering lights', 'Fixture damage', 'Ballast failure',
    'Timer issues', 'Uneven lighting', 'Heat issues', 'Spectrum problems'
  ],
  irrigation: [
    'Water leaks', 'Clogged lines', 'Pump failure', 'Timer malfunction',
    'Pressure issues', 'Nutrient system problems', 'pH imbalance', 'Overflow'
  ],
  electrical: [
    'Circuit breaker tripped', 'Outlet not working', 'Wiring damage', 'Overheating',
    'Power fluctuations', 'Ground fault', 'Extension cord damage', 'Panel issues'
  ],
  structural: [
    'Roof leaks', 'Wall damage', 'Floor issues', 'Door problems',
    'Window damage', 'Insulation issues', 'Foundation cracks', 'Ventilation gaps'
  ],
  security: [
    'Camera malfunction', 'Access control issues', 'Alarm problems', 'Lock damage',
    'Fence damage', 'Motion sensor issues', 'Intercom problems', 'Emergency exits'
  ]
};