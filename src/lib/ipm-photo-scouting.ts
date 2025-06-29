// IPM Photo Scouting with AI Pest Detection
import { RealtimeTracker, LocationUpdate } from './realtime-tracker';

export interface IPMPhoto {
  id: string;
  userId: string;
  facilityId: string;
  location: LocationUpdate['location'];
  photoUrl: string;
  photoBlob?: Blob;
  timestamp: Date;
  plantStage: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
  roomZone: string;
  notes?: string;
  aiAnalysis?: IPMAIAnalysis;
  manualTags?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'analyzing' | 'reviewed' | 'action_taken';
}

export interface IPMAIAnalysis {
  pestDetected: boolean;
  diseaseDetected: boolean;
  deficiencyDetected: boolean;
  confidence: number; // 0-1
  detectedIssues: IPMIssue[];
  recommendations: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  analysisTimestamp: Date;
}

export interface IPMIssue {
  type: 'pest' | 'disease' | 'deficiency' | 'environmental';
  name: string;
  confidence: number;
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  location: 'leaves' | 'stems' | 'buds' | 'roots' | 'soil';
  description: string;
  treatmentOptions: string[];
  spreadRisk: 'low' | 'medium' | 'high' | 'critical';
}

export interface IPMAlert {
  id: string;
  type: 'pest_outbreak' | 'disease_spread' | 'immediate_action' | 'quarantine_needed';
  severity: 'warning' | 'critical' | 'emergency';
  title: string;
  message: string;
  affectedPhotos: string[];
  recommendedActions: string[];
  assignedTo?: string[];
  location: LocationUpdate['location'];
  roomZone: string;
  timestamp: Date;
  resolved: boolean;
}

export class IPMPhotoScout {
  private tracker: RealtimeTracker;
  private onPhotoAnalyzed?: (photo: IPMPhoto) => void;
  private onAlertGenerated?: (alert: IPMAlert) => void;

  constructor(
    private userId: string,
    private facilityId: string,
    tracker: RealtimeTracker
  ) {
    this.tracker = tracker;
  }

  /**
   * Capture photo for IPM scouting
   */
  async captureIPMPhoto(
    plantStage: IPMPhoto['plantStage'],
    roomZone: string,
    notes?: string
  ): Promise<IPMPhoto> {
    // Get current location from tracker
    const currentLocation = await this.getCurrentLocation();
    
    // Capture photo using device camera
    const photoBlob = await this.capturePhoto();
    
    // Create IPM photo record
    const ipmPhoto: IPMPhoto = {
      id: this.generateId(),
      userId: this.userId,
      facilityId: this.facilityId,
      location: currentLocation,
      photoUrl: '', // Will be set after upload
      photoBlob,
      timestamp: new Date(),
      plantStage,
      roomZone,
      notes,
      priority: 'medium',
      status: 'pending'
    };

    // Upload photo and get URL
    ipmPhoto.photoUrl = await this.uploadPhoto(photoBlob, ipmPhoto.id);

    // Send for AI analysis
    await this.analyzePhoto(ipmPhoto);

    return ipmPhoto;
  }

  /**
   * Analyze photo using AI pest/disease detection
   */
  private async analyzePhoto(photo: IPMPhoto): Promise<void> {
    try {
      photo.status = 'analyzing';
      
      // Send to AI analysis API
      const response = await fetch('/api/ipm/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId: photo.id,
          photoUrl: photo.photoUrl,
          facilityId: this.facilityId,
          plantStage: photo.plantStage,
          roomZone: photo.roomZone,
          location: photo.location
        })
      });

      if (!response.ok) throw new Error('AI analysis failed');

      const analysis: IPMAIAnalysis = await response.json();
      photo.aiAnalysis = analysis;
      photo.status = 'reviewed';

      // Determine priority based on AI analysis
      if (analysis.urgencyLevel === 'critical') {
        photo.priority = 'critical';
        await this.generateCriticalAlert(photo);
      } else if (analysis.urgencyLevel === 'high') {
        photo.priority = 'high';
        await this.generateHighPriorityAlert(photo);
      }

      // Save updated photo record
      await this.saveIPMPhoto(photo);

      // Notify callback
      this.onPhotoAnalyzed?.(photo);

    } catch (error) {
      console.error('Failed to analyze photo:', error);
      photo.status = 'pending';
      // Retry analysis later or flag for manual review
    }
  }

  /**
   * Generate critical alert for immediate action
   */
  private async generateCriticalAlert(photo: IPMPhoto): Promise<void> {
    if (!photo.aiAnalysis) return;

    const criticalIssues = photo.aiAnalysis.detectedIssues.filter(
      issue => issue.severity === 'critical' || issue.spreadRisk === 'critical'
    );

    if (criticalIssues.length === 0) return;

    const alert: IPMAlert = {
      id: this.generateId(),
      type: criticalIssues.some(i => i.spreadRisk === 'critical') ? 'quarantine_needed' : 'immediate_action',
      severity: 'emergency',
      title: `🚨 CRITICAL: ${criticalIssues[0].name} Detected`,
      message: `Critical ${criticalIssues[0].type} detected in ${photo.roomZone}. Immediate action required to prevent spread.`,
      affectedPhotos: [photo.id],
      recommendedActions: [
        ...criticalIssues.flatMap(issue => issue.treatmentOptions),
        'Isolate affected area immediately',
        'Notify facility manager',
        'Document all actions taken'
      ],
      location: photo.location,
      roomZone: photo.roomZone,
      timestamp: new Date(),
      resolved: false
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
        alertType: 'ipm_critical',
        photoId: photo.id,
        roomZone: photo.roomZone,
        detectedIssues: criticalIssues
      }
    });

    // Save alert record
    await this.saveIPMAlert(alert);

    // Notify callback
    this.onAlertGenerated?.(alert);
  }

  /**
   * Generate high priority alert for supervisor attention
   */
  private async generateHighPriorityAlert(photo: IPMPhoto): Promise<void> {
    if (!photo.aiAnalysis) return;

    const highPriorityIssues = photo.aiAnalysis.detectedIssues.filter(
      issue => issue.severity === 'severe' || issue.spreadRisk === 'high'
    );

    if (highPriorityIssues.length === 0) return;

    const alert: IPMAlert = {
      id: this.generateId(),
      type: 'pest_outbreak',
      severity: 'critical',
      title: `⚠️ HIGH PRIORITY: ${highPriorityIssues[0].name} Detected`,
      message: `${highPriorityIssues[0].type} detected in ${photo.roomZone}. Supervisor attention needed.`,
      affectedPhotos: [photo.id],
      recommendedActions: highPriorityIssues.flatMap(issue => issue.treatmentOptions),
      location: photo.location,
      roomZone: photo.roomZone,
      timestamp: new Date(),
      resolved: false
    };

    // Send high priority message to supervisors
    await this.tracker.sendMessage({
      to: 'broadcast', // Could be targeted to supervisors only
      type: 'alert',
      content: alert.message,
      priority: 'high',
      location: photo.location,
      metadata: {
        alertType: 'ipm_high_priority',
        photoId: photo.id,
        roomZone: photo.roomZone
      }
    });

    await this.saveIPMAlert(alert);
    this.onAlertGenerated?.(alert);
  }

  /**
   * Get nearby IPM photos for context
   */
  async getNearbyIPMPhotos(
    location: LocationUpdate['location'],
    radiusMeters: number = 50,
    maxAge: number = 7 * 24 * 60 * 60 * 1000 // 7 days
  ): Promise<IPMPhoto[]> {
    try {
      const response = await fetch(`/api/ipm/photos/nearby?` + new URLSearchParams({
        facilityId: this.facilityId,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        radius: radiusMeters.toString(),
        maxAge: maxAge.toString()
      }));

      if (!response.ok) throw new Error('Failed to fetch nearby photos');

      return await response.json();
    } catch (error) {
      console.error('Failed to get nearby photos:', error);
      return [];
    }
  }

  /**
   * Get IPM analytics for facility
   */
  async getIPMAnalytics(dateRange?: { start: Date; end: Date }) {
    try {
      const params: any = { facilityId: this.facilityId };
      if (dateRange) {
        params.startDate = dateRange.start.toISOString();
        params.endDate = dateRange.end.toISOString();
      }

      const response = await fetch(`/api/ipm/analytics?` + new URLSearchParams(params));
      if (!response.ok) throw new Error('Failed to fetch analytics');

      return await response.json();
    } catch (error) {
      console.error('Failed to get IPM analytics:', error);
      return null;
    }
  }

  // Private helper methods
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
      // Create file input for photo capture
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use rear camera
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          resolve(file);
        } else {
          reject(new Error('No photo captured'));
        }
      };

      input.click();
    });
  }

  private async uploadPhoto(blob: Blob, photoId: string): Promise<string> {
    const formData = new FormData();
    formData.append('photo', blob, `ipm-${photoId}.jpg`);
    formData.append('facilityId', this.facilityId);
    formData.append('photoId', photoId);

    const response = await fetch('/api/ipm/upload-photo', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Photo upload failed');

    const result = await response.json();
    return result.photoUrl;
  }

  private async saveIPMPhoto(photo: IPMPhoto): Promise<void> {
    await fetch('/api/ipm/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photo)
    });
  }

  private async saveIPMAlert(alert: IPMAlert): Promise<void> {
    await fetch('/api/ipm/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
  }

  private generateId(): string {
    return `${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
  }

  // Event handlers
  onPhotoAnalysis(callback: (photo: IPMPhoto) => void): void {
    this.onPhotoAnalyzed = callback;
  }

  onAlert(callback: (alert: IPMAlert) => void): void {
    this.onAlertGenerated = callback;
  }
}

// Common pests and diseases for cannabis (can be extended)
export const CANNABIS_PESTS_DISEASES = {
  pests: [
    'Spider Mites', 'Aphids', 'Thrips', 'Whiteflies', 'Fungus Gnats',
    'Caterpillars', 'Leaf Miners', 'Scale Insects', 'Mealybugs'
  ],
  diseases: [
    'Powdery Mildew', 'Botrytis (Bud Rot)', 'Fusarium Wilt', 'Root Rot',
    'Downy Mildew', 'Septoria Leaf Spot', 'Anthracnose', 'Verticillium Wilt'
  ],
  deficiencies: [
    'Nitrogen Deficiency', 'Phosphorus Deficiency', 'Potassium Deficiency',
    'Calcium Deficiency', 'Magnesium Deficiency', 'Iron Deficiency'
  ]
};