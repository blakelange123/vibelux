// QR Code, Barcode, and RFID Tracking System
// Supports plant-level tracking, compliance, and chain of custody

import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export interface TrackingTag {
  id: string;
  type: 'qr' | 'barcode' | 'rfid';
  format: string;
  entityType: 'plant' | 'batch' | 'mother' | 'clone' | 'harvest' | 'package';
  entityId: string;
  metadata: {
    strain?: string;
    plantedDate?: Date;
    stage?: 'propagation' | 'vegetative' | 'flowering' | 'drying' | 'curing' | 'packaged';
    location?: string;
    grower?: string;
    complianceId?: string; // Metrc/BioTrack ID
  };
  created: Date;
  lastScanned?: Date;
  scanHistory: ScanEvent[];
}

export interface ScanEvent {
  id: string;
  timestamp: Date;
  userId: string;
  location: { lat?: number; lng?: number; facility?: string; room?: string };
  action: string;
  notes?: string;
  images?: string[];
  signature?: string;
}

export interface Plant {
  id: string;
  tagId: string;
  strain: string;
  source: 'seed' | 'clone';
  motherId?: string;
  plantedDate: Date;
  stage: 'propagation' | 'vegetative' | 'flowering' | 'harvesting' | 'harvested';
  location: {
    facility: string;
    room: string;
    zone?: string;
    position?: { x: number; y: number; z: number };
  };
  health: 'healthy' | 'stressed' | 'diseased' | 'pest' | 'dead';
  metrics: {
    height?: number;
    canopyWidth?: number;
    internodeSpacing?: number;
    leafColor?: string;
    trichomeDevelopment?: number; // 0-100%
  };
  treatments: Treatment[];
  movements: Movement[];
  compliance: ComplianceData;
}

export interface Treatment {
  id: string;
  date: Date;
  type: 'water' | 'nutrient' | 'pesticide' | 'fungicide' | 'foliar' | 'prune' | 'transplant';
  product?: string;
  amount?: number;
  unit?: string;
  applicator: string;
  notes?: string;
}

export interface Movement {
  id: string;
  timestamp: Date;
  fromLocation: string;
  toLocation: string;
  reason: string;
  authorizedBy: string;
}

export interface ComplianceData {
  metrcId?: string;
  biotrackId?: string;
  stateId?: string;
  licenseNumber: string;
  complianceStatus: 'compliant' | 'warning' | 'violation';
  lastAudit?: Date;
  certifications?: string[];
}

export interface Batch {
  id: string;
  tagId: string;
  name: string;
  strain: string;
  plantCount: number;
  plantIds: string[];
  startDate: Date;
  expectedHarvestDate: Date;
  actualHarvestDate?: Date;
  totalYield?: number;
  averageYieldPerPlant?: number;
  testResults?: TestResult[];
}

export interface TestResult {
  id: string;
  testDate: Date;
  lab: string;
  testType: 'potency' | 'pesticide' | 'microbial' | 'heavy_metals' | 'mycotoxin';
  status: 'pass' | 'fail' | 'pending';
  results: { [key: string]: number | string };
  certificateUrl?: string;
}

export class QRRFIDManager {
  private tags: Map<string, TrackingTag> = new Map();
  private plants: Map<string, Plant> = new Map();
  private batches: Map<string, Batch> = new Map();
  
  // Compliance API endpoints
  private readonly METRC_API = process.env.METRC_API_URL || '';
  private readonly BIOTRACK_API = process.env.BIOTRACK_API_URL || '';

  constructor() {}

  // Generate QR Code
  public async generateQRCode(
    entityType: TrackingTag['entityType'],
    entityId: string,
    metadata: any = {}
  ): Promise<{ tagId: string; qrCodeDataUrl: string; qrCodeBuffer: Buffer }> {
    const tagId = `VBX-${entityType.toUpperCase()}-${uuidv4().substring(0, 8)}`;
    
    const tag: TrackingTag = {
      id: tagId,
      type: 'qr',
      format: 'QR_CODE',
      entityType,
      entityId,
      metadata,
      created: new Date(),
      scanHistory: []
    };
    
    this.tags.set(tagId, tag);
    
    // Generate QR code with tag data
    const qrData = {
      id: tagId,
      type: entityType,
      v: 1 // version for future compatibility
    };
    
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });
    
    const qrCodeBuffer = await QRCode.toBuffer(JSON.stringify(qrData));
    
    return { tagId, qrCodeDataUrl, qrCodeBuffer };
  }

  // Generate Barcode (Code 128)
  public generateBarcode(
    entityType: TrackingTag['entityType'],
    entityId: string
  ): { tagId: string; barcodeData: string } {
    const tagId = `VBX${Date.now()}${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substring(2, 5)}`.toUpperCase();
    
    const tag: TrackingTag = {
      id: tagId,
      type: 'barcode',
      format: 'CODE_128',
      entityType,
      entityId,
      metadata: {},
      created: new Date(),
      scanHistory: []
    };
    
    this.tags.set(tagId, tag);
    
    return { tagId, barcodeData: tagId };
  }

  // Register RFID Tag
  public registerRFIDTag(
    rfidCode: string,
    entityType: TrackingTag['entityType'],
    entityId: string
  ): TrackingTag {
    const tag: TrackingTag = {
      id: rfidCode,
      type: 'rfid',
      format: 'EPC_GEN2',
      entityType,
      entityId,
      metadata: {},
      created: new Date(),
      scanHistory: []
    };
    
    this.tags.set(rfidCode, tag);
    return tag;
  }

  // Scan tag and record event
  public async scanTag(
    tagId: string,
    userId: string,
    action: string,
    location: ScanEvent['location'],
    notes?: string,
    images?: string[]
  ): Promise<{ tag: TrackingTag; entity: Plant | Batch | null }> {
    const tag = this.tags.get(tagId);
    if (!tag) {
      throw new Error(`Tag ${tagId} not found`);
    }
    
    const scanEvent: ScanEvent = {
      id: uuidv4(),
      timestamp: new Date(),
      userId,
      location,
      action,
      notes,
      images
    };
    
    tag.lastScanned = new Date();
    tag.scanHistory.push(scanEvent);
    
    // Get associated entity
    let entity: Plant | Batch | null = null;
    if (tag.entityType === 'plant' || tag.entityType === 'mother' || tag.entityType === 'clone') {
      entity = this.plants.get(tag.entityId) || null;
    } else if (tag.entityType === 'batch') {
      entity = this.batches.get(tag.entityId) || null;
    }
    
    // Emit scan event for real-time tracking
    this.emitScanEvent(tag, scanEvent, entity);
    
    // Update compliance systems
    await this.updateComplianceSystems(tag, scanEvent, entity);
    
    return { tag, entity };
  }

  // Create new plant with tracking
  public async createPlant(
    strain: string,
    source: 'seed' | 'clone',
    location: Plant['location'],
    motherId?: string
  ): Promise<Plant> {
    const plantId = uuidv4();
    
    // Generate QR code for plant
    const { tagId } = await this.generateQRCode('plant', plantId, {
      strain,
      plantedDate: new Date(),
      stage: 'propagation'
    });
    
    const plant: Plant = {
      id: plantId,
      tagId,
      strain,
      source,
      motherId,
      plantedDate: new Date(),
      stage: 'propagation',
      location,
      health: 'healthy',
      metrics: {},
      treatments: [],
      movements: [],
      compliance: {
        licenseNumber: process.env.CULTIVATION_LICENSE || '',
        complianceStatus: 'compliant'
      }
    };
    
    this.plants.set(plantId, plant);
    
    // Register with compliance system
    await this.registerWithMetrc(plant);
    
    return plant;
  }

  // Move plant
  public async movePlant(
    plantId: string,
    newLocation: { facility: string; room: string; zone?: string; position?: { x: number; y: number; z: number } }
  ): Promise<void> {
    const plant = this.plants.get(plantId);
    if (!plant) {
      throw new Error(`Plant ${plantId} not found`);
    }

    const oldLocation = plant.location;
    plant.location = newLocation;
    
    // Add scan event for move
    const tag = this.tags.get(plant.tagId);
    if (tag) {
      tag.scanHistory.push({
        id: uuidv4(),
        timestamp: new Date(),
        userId: 'system',
        location: newLocation,
        action: `Moved from ${oldLocation.facility}/${oldLocation.room} to ${newLocation.facility}/${newLocation.room}`,
        notes: 'Plant location updated'
      });
    }
  }

  // Generate QR Code
  public async generateQRCode(
    entityType: TrackingTag['entityType'],
    entityId: string,
    metadata: any = {}
  ): Promise<{ tagId: string; qrCodeDataUrl: string; qrCodeBuffer: Buffer }> {
    const tagId = `VBX-${entityType.toUpperCase()}-${uuidv4().substring(0, 8)}`;
    
    const tag: TrackingTag = {
      id: tagId,
      type: 'qr',
      format: 'QR_CODE',
      entityType,
      entityId,
      metadata,
      created: new Date(),
      scanHistory: []
    };
    
    this.tags.set(tagId, tag);
    
    // Generate QR code with tag data
    const qrData = {
      id: tagId,
      type: entityType,
      v: 1 // version for future compatibility
    };
    
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });
    
    const qrCodeBuffer = await QRCode.toBuffer(JSON.stringify(qrData));
    
    return { tagId, qrCodeDataUrl, qrCodeBuffer };
  }

  // Generate Barcode (Code 128)
  public generateBarcode(
    entityType: TrackingTag['entityType'],
    entityId: string
  ): { tagId: string; barcodeData: string } {
    const tagId = `VBX${Date.now()}${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substring(2, 5)}`.toUpperCase();
    
    const tag: TrackingTag = {
      id: tagId,
      type: 'barcode',
      format: 'CODE_128',
      entityType,
      entityId,
      metadata: {},
      created: new Date(),
      scanHistory: []
    };
    
    this.tags.set(tagId, tag);
    
    return { tagId, barcodeData: tagId };
  }

  // Register RFID Tag
  public registerRFIDTag(
    rfidCode: string,
    entityType: TrackingTag['entityType'],
    entityId: string
  ): TrackingTag {
    const tag: TrackingTag = {
      id: rfidCode,
      type: 'rfid',
      format: 'EPC_GEN2',
      entityType,
      entityId,
      metadata: {},
      created: new Date(),
      scanHistory: []
    };
    
    this.tags.set(rfidCode, tag);
    return tag;
  }

  // Scan tag and record event
  public async scanTag(
    tagId: string,
    userId: string,
    action: string,
    location: ScanEvent['location'],
    notes?: string,
    images?: string[]
  ): Promise<{ tag: TrackingTag; entity: Plant | Batch | null }> {
    const tag = this.tags.get(tagId);
    if (!tag) {
      throw new Error(`Tag ${tagId} not found`);
    }
    
    const scanEvent: ScanEvent = {
      id: uuidv4(),
      timestamp: new Date(),
      userId,
      location,
      action,
      notes,
      images
    };
    
    tag.lastScanned = new Date();
    tag.scanHistory.push(scanEvent);
    
    // Get associated entity
    let entity: Plant | Batch | null = null;
    if (tag.entityType === 'plant' || tag.entityType === 'mother' || tag.entityType === 'clone') {
      entity = this.plants.get(tag.entityId) || null;
    } else if (tag.entityType === 'batch') {
      entity = this.batches.get(tag.entityId) || null;
    }
    
    // Emit scan event for real-time tracking
    this.emitScanEvent(tag, scanEvent, entity);
    
    // Update compliance systems
    await this.updateComplianceSystems(tag, scanEvent, entity);
    
    return { tag, entity };
  }

  // Create new plant with tracking
  public async createPlant(
    strain: string,
    source: 'seed' | 'clone',
    location: Plant['location'],
    motherId?: string
  ): Promise<Plant> {
    const plantId = uuidv4();
    
    // Generate QR code for plant
    const { tagId } = await this.generateQRCode('plant', plantId, {
      strain,
      plantedDate: new Date(),
      stage: 'propagation'
    });
    
    const plant: Plant = {
      id: plantId,
      tagId,
      strain,
      source,
      motherId,
      plantedDate: new Date(),
      stage: 'propagation',
      location,
      health: 'healthy',
      metrics: {},
      treatments: [],
      movements: [],
      compliance: {
        licenseNumber: process.env.CULTIVATION_LICENSE || '',
        complianceStatus: 'compliant'
      }
    };
    
    this.plants.set(plantId, plant);
    
    // Register with compliance system
    await this.registerWithMetrc(plant);
    
    return plant;
  }

  // Move plant
  public movePlant(
    plantId: string,
    toLocation: string,
    reason: string,
    authorizedBy: string
  ): Plant {
    const plant = this.plants.get(plantId);
    if (!plant) throw new Error('Plant not found');
    
    const movement: Movement = {
      id: uuidv4(),
      timestamp: new Date(),
      fromLocation: `${plant.location.facility}/${plant.location.room}`,
      toLocation,
      reason,
      authorizedBy
    };
    
    plant.movements.push(movement);
    
    // Update location
    const [facility, room] = toLocation.split('/');
    plant.location.facility = facility;
    plant.location.room = room;
    
    // Update compliance
    this.updateMetrcMovement(plant, movement);
    
    return plant;
  }

  // Record treatment
  public recordTreatment(
    plantId: string,
    treatment: Omit<Treatment, 'id' | 'date'>
  ): Plant {
    const plant = this.plants.get(plantId);
    if (!plant) throw new Error('Plant not found');
    
    const fullTreatment: Treatment = {
      ...treatment,
      id: uuidv4(),
      date: new Date()
    };
    
    plant.treatments.push(fullTreatment);
    
    // Update compliance if pesticide/fungicide
    if (treatment.type === 'pesticide' || treatment.type === 'fungicide') {
      this.reportPesticideUse(plant, fullTreatment);
    }
    
    return plant;
  }

  // Create batch
  public async createBatch(
    name: string,
    strain: string,
    plantIds: string[]
  ): Promise<Batch> {
    const batchId = uuidv4();
    
    // Generate QR code for batch
    const { tagId } = await this.generateQRCode('batch', batchId, {
      strain,
      plantCount: plantIds.length
    });
    
    // Calculate expected harvest based on strain
    const expectedDays = this.getExpectedGrowDays(strain);
    const expectedHarvestDate = new Date();
    expectedHarvestDate.setDate(expectedHarvestDate.getDate() + expectedDays);
    
    const batch: Batch = {
      id: batchId,
      tagId,
      name,
      strain,
      plantCount: plantIds.length,
      plantIds,
      startDate: new Date(),
      expectedHarvestDate
    };
    
    this.batches.set(batchId, batch);
    
    // Update plants to reference batch
    plantIds.forEach(plantId => {
      const plant = this.plants.get(plantId);
      if (plant) {
        plant.metadata = { ...plant.metadata, batchId };
      }
    });
    
    return batch;
  }

  // Generate chain of custody report
  public generateChainOfCustody(entityId: string): ChainOfCustodyReport {
    const tag = Array.from(this.tags.values()).find(t => t.entityId === entityId);
    if (!tag) throw new Error('No tracking tag found for entity');
    
    const entity = tag.entityType === 'batch' 
      ? this.batches.get(entityId)
      : this.plants.get(entityId);
      
    if (!entity) throw new Error('Entity not found');
    
    return {
      reportId: uuidv4(),
      generatedDate: new Date(),
      entityType: tag.entityType,
      entityId,
      tagId: tag.id,
      timeline: tag.scanHistory.map(scan => ({
        timestamp: scan.timestamp,
        action: scan.action,
        location: scan.location,
        userId: scan.userId,
        notes: scan.notes
      })),
      currentLocation: 'location' in entity ? entity.location : null,
      complianceStatus: 'compliance' in entity ? entity.compliance : null,
      signatures: tag.scanHistory
        .filter(s => s.signature)
        .map(s => ({ userId: s.userId, timestamp: s.timestamp, signature: s.signature! }))
    };
  }

  // Compliance integrations
  private async registerWithMetrc(plant: Plant): Promise<void> {
    if (!this.METRC_API) return;
    
    try {
      // Metrc API call would go here
      // const response = await fetch(`${this.METRC_API}/plants`, {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${process.env.METRC_API_KEY}` },
      //   body: JSON.stringify({...})
      // });
    } catch (error) {
      console.error('Failed to register with Metrc:', error);
    }
  }

  private async updateMetrcMovement(plant: Plant, movement: Movement): Promise<void> {
    // Metrc movement update
  }

  private async reportPesticideUse(plant: Plant, treatment: Treatment): Promise<void> {
    // Report pesticide use to compliance system
  }

  private emitScanEvent(tag: TrackingTag, event: ScanEvent, entity: any): void {
    // Emit to WebSocket or event system for real-time updates
  }

  private async updateComplianceSystems(
    tag: TrackingTag, 
    event: ScanEvent, 
    entity: any
  ): Promise<void> {
    // Update all integrated compliance systems
  }

  private getExpectedGrowDays(strain: string): number {
    // Strain-specific grow times (would come from database)
    const strainData: { [key: string]: number } = {
      'Blue Dream': 70,
      'OG Kush': 63,
      'Sour Diesel': 77,
      'default': 70
    };
    
    return strainData[strain] || strainData['default'];
  }
}

interface ChainOfCustodyReport {
  reportId: string;
  generatedDate: Date;
  entityType: string;
  entityId: string;
  tagId: string;
  timeline: any[];
  currentLocation: any;
  complianceStatus: any;
  signatures: any[];
}