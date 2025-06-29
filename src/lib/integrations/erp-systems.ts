// ERP and Seed-to-Sale System Integration
// Supports compliance tracking systems like Metrc, BioTrack, and custom ERP solutions

export interface Plant {
  id: string;
  tag: string; // RFID or barcode tag
  strain: string;
  location: {
    facility: string;
    room: string;
    zone: string;
    position?: { x: number; y: number; z: number };
  };
  stage: 'clone' | 'vegetative' | 'flowering' | 'harvesting' | 'drying' | 'curing';
  plantedDate: Date;
  harvestDate?: Date;
  batchId: string;
  motherId?: string;
  weight?: number;
  destroyed?: boolean;
  destroyedDate?: Date;
  destroyedReason?: string;
}

export interface Batch {
  id: string;
  name: string;
  type: 'clone' | 'plant' | 'harvest' | 'package';
  strain: string;
  plantCount: number;
  location: string;
  createdDate: Date;
  harvestDate?: Date;
  totalWeight?: number;
  status: 'active' | 'inactive' | 'finished';
  labResults?: LabResult[];
}

export interface Package {
  id: string;
  tag: string;
  type: 'flower' | 'trim' | 'shake' | 'waste';
  strain: string;
  weight: number;
  unitOfMeasure: 'grams' | 'pounds' | 'ounces';
  batchId: string;
  location: string;
  packagedDate: Date;
  status: 'active' | 'inactive' | 'sold' | 'destroyed';
  labResults?: LabResult[];
  price?: number;
}

export interface Transfer {
  id: string;
  manifestNumber: string;
  fromFacility: string;
  toFacility: string;
  driverName: string;
  vehicleInfo: string;
  packages: string[]; // Package IDs
  departureDate: Date;
  arrivalDate?: Date;
  status: 'scheduled' | 'in-transit' | 'received' | 'rejected';
  route?: string;
}

export interface LabResult {
  id: string;
  batchId: string;
  labName: string;
  testDate: Date;
  status: 'pass' | 'fail';
  thc: number;
  cbd: number;
  terpenes?: Record<string, number>;
  pesticides?: Record<string, number>;
  microbials?: Record<string, number>;
  heavyMetals?: Record<string, number>;
  moisture?: number;
  foreignMatter?: boolean;
}

export interface ComplianceEvent {
  id: string;
  type: 'plant' | 'harvest' | 'package' | 'transfer' | 'destruction' | 'adjustment';
  entityId: string; // Plant, Batch, or Package ID
  timestamp: Date;
  user: string;
  facility: string;
  details: Record<string, any>;
  reported: boolean;
  reportedAt?: Date;
}

// Base ERP Integration class
export abstract class ERPIntegration {
  protected apiKey: string;
  protected licenseNumber: string;
  protected facilityId: string;
  protected baseUrl: string;

  constructor(config: {
    apiKey: string;
    licenseNumber: string;
    facilityId: string;
    baseUrl: string;
  }) {
    this.apiKey = config.apiKey;
    this.licenseNumber = config.licenseNumber;
    this.facilityId = config.facilityId;
    this.baseUrl = config.baseUrl;
  }

  // Plant tracking
  abstract createPlants(plants: Omit<Plant, 'id'>[]): Promise<Plant[]>;
  abstract movePlants(plantIds: string[], newLocation: string): Promise<boolean>;
  abstract changePlantStage(plantIds: string[], newStage: Plant['stage']): Promise<boolean>;
  abstract destroyPlants(plantIds: string[], reason: string): Promise<boolean>;
  abstract harvestPlants(plantIds: string[], weight: number, unitOfMeasure: string): Promise<Batch>;

  // Batch management
  abstract createBatch(batch: Omit<Batch, 'id'>): Promise<Batch>;
  abstract getBatch(batchId: string): Promise<Batch>;
  abstract finishBatch(batchId: string): Promise<boolean>;

  // Package management
  abstract createPackages(packages: Omit<Package, 'id'>[]): Promise<Package[]>;
  abstract adjustPackage(packageId: string, newWeight: number, reason: string): Promise<boolean>;
  abstract finishPackage(packageId: string): Promise<boolean>;

  // Transfer management
  abstract createTransfer(transfer: Omit<Transfer, 'id'>): Promise<Transfer>;
  abstract updateTransferStatus(transferId: string, status: Transfer['status']): Promise<boolean>;
  abstract getTransferManifest(transferId: string): Promise<any>;

  // Lab results
  abstract submitLabResults(labResult: Omit<LabResult, 'id'>): Promise<LabResult>;
  abstract getLabResults(batchId: string): Promise<LabResult[]>;

  // Compliance reporting
  abstract reportComplianceEvent(event: ComplianceEvent): Promise<boolean>;
  abstract getComplianceHistory(startDate: Date, endDate: Date): Promise<ComplianceEvent[]>;

  // Inventory
  abstract getInventory(location?: string): Promise<{
    plants: Plant[];
    batches: Batch[];
    packages: Package[];
  }>;
}

// Metrc Integration
export class MetrcIntegration extends ERPIntegration {
  async createPlants(plants: Omit<Plant, 'id'>[]): Promise<Plant[]> {
    const response = await fetch(`${this.baseUrl}/plants/v1/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(plants.map(plant => ({
        PlantBatch: plant.batchId,
        PlantCount: 1,
        LocationName: plant.location.room,
        PatientLicenseNumber: null,
        ActualDate: plant.plantedDate.toISOString().split('T')[0],
        StrainName: plant.strain
      })))
    });

    const createdPlants = await response.json();
    return createdPlants.map((p: any, index: number) => ({
      ...plants[index],
      id: p.Id.toString(),
      tag: p.Label
    }));
  }

  async movePlants(plantIds: string[], newLocation: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/plants/v1/moveplants`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Id: plantIds,
        Location: newLocation,
        ActualDate: new Date().toISOString().split('T')[0]
      })
    });

    return response.ok;
  }

  async changePlantStage(plantIds: string[], newStage: Plant['stage']): Promise<boolean> {
    const metrcStage = this.mapToMetrcStage(newStage);
    
    const response = await fetch(`${this.baseUrl}/plants/v1/changegrowthphases`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Id: plantIds,
        NewTag: null, // Metrc will assign
        GrowthPhase: metrcStage,
        ActualDate: new Date().toISOString().split('T')[0]
      })
    });

    return response.ok;
  }

  async destroyPlants(plantIds: string[], reason: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/plants/v1/destroyplants`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Id: plantIds,
        ReasonNote: reason,
        ActualDate: new Date().toISOString().split('T')[0]
      })
    });

    return response.ok;
  }

  async harvestPlants(plantIds: string[], weight: number, unitOfMeasure: string): Promise<Batch> {
    const response = await fetch(`${this.baseUrl}/plants/v1/harvestplants`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        DryingLocation: 'Drying Room',
        PatientLicenseNumber: null,
        ActualDate: new Date().toISOString().split('T')[0],
        Plant: plantIds[0],
        Weight: weight,
        UnitOfWeight: unitOfMeasure,
        IsOnHold: false
      })
    });

    const harvest = await response.json();
    return {
      id: harvest.Id.toString(),
      name: `Harvest-${harvest.Id}`,
      type: 'harvest',
      strain: harvest.StrainName,
      plantCount: plantIds.length,
      location: harvest.DryingLocation,
      createdDate: new Date(),
      totalWeight: weight,
      status: 'active'
    };
  }

  async createBatch(batch: Omit<Batch, 'id'>): Promise<Batch> {
    const response = await fetch(`${this.baseUrl}/plantbatches/v1/createplantings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Name: batch.name,
        Type: batch.type,
        Count: batch.plantCount,
        Strain: batch.strain,
        Location: batch.location,
        PatientLicenseNumber: null,
        ActualDate: batch.createdDate.toISOString().split('T')[0]
      })
    });

    const created = await response.json();
    return {
      ...batch,
      id: created.Id.toString()
    };
  }

  async getBatch(batchId: string): Promise<Batch> {
    const response = await fetch(`${this.baseUrl}/plantbatches/v1/${batchId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    const data = await response.json();
    return {
      id: data.Id.toString(),
      name: data.Name,
      type: data.Type.toLowerCase() as Batch['type'],
      strain: data.StrainName,
      plantCount: data.Count,
      location: data.LocationName,
      createdDate: new Date(data.PlantedDate),
      status: data.IsArchived ? 'inactive' : 'active'
    };
  }

  async finishBatch(batchId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/plantbatches/v1/finish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Id: batchId,
        ActualDate: new Date().toISOString().split('T')[0]
      })
    });

    return response.ok;
  }

  async createPackages(packages: Omit<Package, 'id'>[]): Promise<Package[]> {
    const response = await fetch(`${this.baseUrl}/packages/v1/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(packages.map(pkg => ({
        Tag: pkg.tag,
        Location: pkg.location,
        Item: pkg.strain,
        UnitOfWeight: pkg.unitOfMeasure,
        PatientLicenseNumber: null,
        IsProductionBatch: false,
        ProductionBatchNumber: null,
        IsTradeSample: false,
        IsDonation: false,
        ProductRequiresRemediation: false,
        ActualDate: pkg.packagedDate.toISOString().split('T')[0],
        Ingredients: [{
          Package: pkg.batchId,
          Quantity: pkg.weight,
          UnitOfMeasure: pkg.unitOfMeasure
        }]
      })))
    });

    const created = await response.json();
    return created.map((p: any, index: number) => ({
      ...packages[index],
      id: p.Id.toString()
    }));
  }

  async adjustPackage(packageId: string, newWeight: number, reason: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/packages/v1/adjust`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        PackageLabel: packageId,
        Quantity: newWeight,
        UnitOfMeasure: 'Grams',
        AdjustmentReason: reason,
        AdjustmentDate: new Date().toISOString().split('T')[0]
      })
    });

    return response.ok;
  }

  async finishPackage(packageId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/packages/v1/finish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Label: packageId,
        ActualDate: new Date().toISOString().split('T')[0]
      })
    });

    return response.ok;
  }

  async createTransfer(transfer: Omit<Transfer, 'id'>): Promise<Transfer> {
    const response = await fetch(`${this.baseUrl}/transfers/v1/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ShipperLicenseNumber: this.licenseNumber,
        ShipperName: transfer.fromFacility,
        ShipperMainPhoneNumber: '555-0100',
        ShipperAddress1: '123 Main St',
        RecipientLicenseNumber: transfer.toFacility,
        TransporterName: transfer.driverName,
        DriverName: transfer.driverName,
        VehicleMake: transfer.vehicleInfo.split(' ')[0],
        VehicleModel: transfer.vehicleInfo.split(' ')[1],
        VehicleLicensePlateNumber: transfer.vehicleInfo.split(' ')[2],
        ActualDepartureDateTime: transfer.departureDate.toISOString(),
        Packages: transfer.packages.map(pkgId => ({ PackageLabel: pkgId }))
      })
    });

    const created = await response.json();
    return {
      ...transfer,
      id: created.Id.toString(),
      manifestNumber: created.ManifestNumber
    };
  }

  async updateTransferStatus(transferId: string, status: Transfer['status']): Promise<boolean> {
    let endpoint = '';
    switch (status) {
      case 'in-transit':
        endpoint = '/transfers/v1/depart';
        break;
      case 'received':
        endpoint = '/transfers/v1/receive';
        break;
      case 'rejected':
        endpoint = '/transfers/v1/reject';
        break;
      default:
        return false;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Id: transferId
      })
    });

    return response.ok;
  }

  async getTransferManifest(transferId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/transfers/v1/${transferId}/manifest`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    return response.json();
  }

  async submitLabResults(labResult: Omit<LabResult, 'id'>): Promise<LabResult> {
    const response = await fetch(`${this.baseUrl}/labtests/v1/record`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Label: labResult.batchId,
        ResultDate: labResult.testDate.toISOString().split('T')[0],
        LabTestResultExpirationDateTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        LabFacilityName: labResult.labName,
        TestPassed: labResult.status === 'pass',
        TestTypeName: 'Compliance',
        TestResults: [
          { LabTestTypeName: 'THC', Quantity: labResult.thc, Passed: true },
          { LabTestTypeName: 'CBD', Quantity: labResult.cbd, Passed: true }
        ]
      })
    });

    const created = await response.json();
    return {
      ...labResult,
      id: created.Id.toString()
    };
  }

  async getLabResults(batchId: string): Promise<LabResult[]> {
    const response = await fetch(`${this.baseUrl}/labtests/v1/results?packageLabel=${batchId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    const results = await response.json();
    return results.map((result: any) => ({
      id: result.TestResultId.toString(),
      batchId: result.PackageLabel,
      labName: result.LabFacilityName,
      testDate: new Date(result.TestDate),
      status: result.OverallPassed ? 'pass' : 'fail',
      thc: result.Results.find((r: any) => r.LabTestTypeName === 'THC')?.Quantity || 0,
      cbd: result.Results.find((r: any) => r.LabTestTypeName === 'CBD')?.Quantity || 0
    }));
  }

  async reportComplianceEvent(event: ComplianceEvent): Promise<boolean> {
    // Metrc automatically tracks compliance events
    // This would be used for additional reporting if needed
    return true;
  }

  async getComplianceHistory(startDate: Date, endDate: Date): Promise<ComplianceEvent[]> {
    // Fetch activity logs from Metrc
    const response = await fetch(
      `${this.baseUrl}/sales/v1/receipts?lastModifiedStart=${startDate.toISOString()}&lastModifiedEnd=${endDate.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    const activities = await response.json();
    return activities.map((activity: any) => ({
      id: activity.Id.toString(),
      type: 'package',
      entityId: activity.PackageLabel,
      timestamp: new Date(activity.LastModified),
      user: activity.RecordedByUserName,
      facility: this.facilityId,
      details: activity,
      reported: true,
      reportedAt: new Date(activity.LastModified)
    }));
  }

  async getInventory(location?: string): Promise<{
    plants: Plant[];
    batches: Batch[];
    packages: Package[];
  }> {
    // Fetch active inventory
    const [plantsRes, batchesRes, packagesRes] = await Promise.all([
      fetch(`${this.baseUrl}/plants/v1/vegetative`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }),
      fetch(`${this.baseUrl}/plantbatches/v1/active`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }),
      fetch(`${this.baseUrl}/packages/v1/active`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      })
    ]);

    const [plants, batches, packages] = await Promise.all([
      plantsRes.json(),
      batchesRes.json(),
      packagesRes.json()
    ]);

    return {
      plants: plants.map((p: any) => ({
        id: p.Id.toString(),
        tag: p.Label,
        strain: p.StrainName,
        location: {
          facility: this.facilityId,
          room: p.LocationName,
          zone: p.LocationTypeName
        },
        stage: 'vegetative',
        plantedDate: new Date(p.PlantedDate),
        batchId: p.PlantBatchName
      })),
      batches: batches.map((b: any) => ({
        id: b.Id.toString(),
        name: b.Name,
        type: b.Type.toLowerCase(),
        strain: b.StrainName,
        plantCount: b.Count,
        location: b.LocationName,
        createdDate: new Date(b.PlantedDate),
        status: 'active'
      })),
      packages: packages.map((p: any) => ({
        id: p.Id.toString(),
        tag: p.Label,
        type: 'flower',
        strain: p.Item.StrainName,
        weight: p.Quantity,
        unitOfMeasure: p.UnitOfMeasureName.toLowerCase(),
        batchId: p.SourcePackageLabels?.[0] || '',
        location: p.LocationName,
        packagedDate: new Date(p.PackagedDate),
        status: 'active'
      }))
    };
  }

  private mapToMetrcStage(stage: Plant['stage']): string {
    const stageMap: Record<Plant['stage'], string> = {
      'clone': 'Clone',
      'vegetative': 'Vegetative',
      'flowering': 'Flowering',
      'harvesting': 'Harvesting',
      'drying': 'Drying',
      'curing': 'Curing'
    };
    return stageMap[stage] || 'Vegetative';
  }
}

// BioTrack Integration
export class BioTrackIntegration extends ERPIntegration {
  private sessionToken?: string;

  private async authenticate(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.licenseNumber,
        password: this.apiKey
      })
    });

    const data = await response.json();
    this.sessionToken = data.sessiontoken;
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    if (!this.sessionToken) {
      await this.authenticate();
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-BioTrack-Session': this.sessionToken!
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (response.status === 401) {
      // Re-authenticate and retry
      await this.authenticate();
      return this.makeRequest(endpoint, method, body);
    }

    return response.json();
  }

  async createPlants(plants: Omit<Plant, 'id'>[]): Promise<Plant[]> {
    const data = await this.makeRequest('/api/plant/create', 'POST', {
      plants: plants.map(plant => ({
        strain: plant.strain,
        location: plant.location.room,
        batch_id: plant.batchId,
        mother_id: plant.motherId,
        planted_date: plant.plantedDate.toISOString()
      }))
    });

    return data.plants.map((p: any, index: number) => ({
      ...plants[index],
      id: p.id,
      tag: p.barcode
    }));
  }

  async movePlants(plantIds: string[], newLocation: string): Promise<boolean> {
    const data = await this.makeRequest('/api/plant/move', 'POST', {
      plant_ids: plantIds,
      location_id: newLocation
    });

    return data.success;
  }

  async changePlantStage(plantIds: string[], newStage: Plant['stage']): Promise<boolean> {
    const data = await this.makeRequest('/api/plant/change_stage', 'POST', {
      plant_ids: plantIds,
      stage: newStage
    });

    return data.success;
  }

  async destroyPlants(plantIds: string[], reason: string): Promise<boolean> {
    const data = await this.makeRequest('/api/plant/destroy', 'POST', {
      plant_ids: plantIds,
      reason,
      destroyed_date: new Date().toISOString()
    });

    return data.success;
  }

  async harvestPlants(plantIds: string[], weight: number, unitOfMeasure: string): Promise<Batch> {
    const data = await this.makeRequest('/api/plant/harvest', 'POST', {
      plant_ids: plantIds,
      total_weight: weight,
      unit_of_measure: unitOfMeasure,
      harvest_date: new Date().toISOString()
    });

    return {
      id: data.harvest.id,
      name: data.harvest.name,
      type: 'harvest',
      strain: data.harvest.strain,
      plantCount: plantIds.length,
      location: data.harvest.location,
      createdDate: new Date(data.harvest.created_date),
      totalWeight: weight,
      status: 'active'
    };
  }

  async createBatch(batch: Omit<Batch, 'id'>): Promise<Batch> {
    const data = await this.makeRequest('/api/batch/create', 'POST', {
      name: batch.name,
      type: batch.type,
      strain: batch.strain,
      plant_count: batch.plantCount,
      location: batch.location,
      created_date: batch.createdDate.toISOString()
    });

    return {
      ...batch,
      id: data.batch.id
    };
  }

  async getBatch(batchId: string): Promise<Batch> {
    const data = await this.makeRequest(`/api/batch/${batchId}`);
    
    return {
      id: data.batch.id,
      name: data.batch.name,
      type: data.batch.type,
      strain: data.batch.strain,
      plantCount: data.batch.plant_count,
      location: data.batch.location,
      createdDate: new Date(data.batch.created_date),
      status: data.batch.status
    };
  }

  async finishBatch(batchId: string): Promise<boolean> {
    const data = await this.makeRequest('/api/batch/finish', 'POST', {
      batch_id: batchId
    });

    return data.success;
  }

  async createPackages(packages: Omit<Package, 'id'>[]): Promise<Package[]> {
    const data = await this.makeRequest('/api/package/create', 'POST', {
      packages: packages.map(pkg => ({
        type: pkg.type,
        strain: pkg.strain,
        weight: pkg.weight,
        unit: pkg.unitOfMeasure,
        batch_id: pkg.batchId,
        location: pkg.location,
        packaged_date: pkg.packagedDate.toISOString()
      }))
    });

    return data.packages.map((p: any, index: number) => ({
      ...packages[index],
      id: p.id,
      tag: p.barcode
    }));
  }

  async adjustPackage(packageId: string, newWeight: number, reason: string): Promise<boolean> {
    const data = await this.makeRequest('/api/package/adjust', 'POST', {
      package_id: packageId,
      new_weight: newWeight,
      reason,
      adjustment_date: new Date().toISOString()
    });

    return data.success;
  }

  async finishPackage(packageId: string): Promise<boolean> {
    const data = await this.makeRequest('/api/package/finish', 'POST', {
      package_id: packageId
    });

    return data.success;
  }

  async createTransfer(transfer: Omit<Transfer, 'id'>): Promise<Transfer> {
    const data = await this.makeRequest('/api/transfer/create', 'POST', {
      from_facility: transfer.fromFacility,
      to_facility: transfer.toFacility,
      driver_name: transfer.driverName,
      vehicle_info: transfer.vehicleInfo,
      packages: transfer.packages,
      departure_date: transfer.departureDate.toISOString()
    });

    return {
      ...transfer,
      id: data.transfer.id,
      manifestNumber: data.transfer.manifest_number
    };
  }

  async updateTransferStatus(transferId: string, status: Transfer['status']): Promise<boolean> {
    const data = await this.makeRequest('/api/transfer/update_status', 'POST', {
      transfer_id: transferId,
      status,
      update_date: new Date().toISOString()
    });

    return data.success;
  }

  async getTransferManifest(transferId: string): Promise<any> {
    return this.makeRequest(`/api/transfer/${transferId}/manifest`);
  }

  async submitLabResults(labResult: Omit<LabResult, 'id'>): Promise<LabResult> {
    const data = await this.makeRequest('/api/lab/submit_results', 'POST', {
      batch_id: labResult.batchId,
      lab_name: labResult.labName,
      test_date: labResult.testDate.toISOString(),
      results: {
        thc: labResult.thc,
        cbd: labResult.cbd,
        terpenes: labResult.terpenes,
        pesticides: labResult.pesticides,
        microbials: labResult.microbials,
        heavy_metals: labResult.heavyMetals,
        moisture: labResult.moisture
      },
      status: labResult.status
    });

    return {
      ...labResult,
      id: data.lab_result.id
    };
  }

  async getLabResults(batchId: string): Promise<LabResult[]> {
    const data = await this.makeRequest(`/api/lab/results/${batchId}`);
    
    return data.results.map((result: any) => ({
      id: result.id,
      batchId: result.batch_id,
      labName: result.lab_name,
      testDate: new Date(result.test_date),
      status: result.status,
      thc: result.thc,
      cbd: result.cbd,
      terpenes: result.terpenes,
      pesticides: result.pesticides,
      microbials: result.microbials,
      heavyMetals: result.heavy_metals,
      moisture: result.moisture,
      foreignMatter: result.foreign_matter
    }));
  }

  async reportComplianceEvent(event: ComplianceEvent): Promise<boolean> {
    const data = await this.makeRequest('/api/compliance/report', 'POST', event);
    return data.success;
  }

  async getComplianceHistory(startDate: Date, endDate: Date): Promise<ComplianceEvent[]> {
    const data = await this.makeRequest(
      `/api/compliance/history?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
    );
    
    return data.events.map((event: any) => ({
      id: event.id,
      type: event.type,
      entityId: event.entity_id,
      timestamp: new Date(event.timestamp),
      user: event.user,
      facility: event.facility,
      details: event.details,
      reported: event.reported,
      reportedAt: event.reported_at ? new Date(event.reported_at) : undefined
    }));
  }

  async getInventory(location?: string): Promise<{
    plants: Plant[];
    batches: Batch[];
    packages: Package[];
  }> {
    const endpoint = location 
      ? `/api/inventory?location=${location}`
      : '/api/inventory';
    
    const data = await this.makeRequest(endpoint);
    
    return {
      plants: data.plants.map((p: any) => ({
        id: p.id,
        tag: p.barcode,
        strain: p.strain,
        location: {
          facility: this.facilityId,
          room: p.location,
          zone: p.zone
        },
        stage: p.stage,
        plantedDate: new Date(p.planted_date),
        batchId: p.batch_id
      })),
      batches: data.batches.map((b: any) => ({
        id: b.id,
        name: b.name,
        type: b.type,
        strain: b.strain,
        plantCount: b.plant_count,
        location: b.location,
        createdDate: new Date(b.created_date),
        status: b.status
      })),
      packages: data.packages.map((p: any) => ({
        id: p.id,
        tag: p.barcode,
        type: p.type,
        strain: p.strain,
        weight: p.weight,
        unitOfMeasure: p.unit,
        batchId: p.batch_id,
        location: p.location,
        packagedDate: new Date(p.packaged_date),
        status: p.status
      }))
    };
  }
}

// ERP Integration Manager
export class ERPIntegrationManager {
  private integration?: ERPIntegration;
  private syncInterval?: NodeJS.Timeout;
  private lastSync?: Date;

  async connect(type: 'metrc' | 'biotrack' | 'custom', config: {
    apiKey: string;
    licenseNumber: string;
    facilityId: string;
    baseUrl: string;
  }): Promise<boolean> {
    try {
      switch (type) {
        case 'metrc':
          this.integration = new MetrcIntegration(config);
          break;
        case 'biotrack':
          this.integration = new BioTrackIntegration(config);
          break;
        default:
          return false;
      }

      // Test connection
      await this.integration.getInventory();
      
      // Start sync
      this.startSync();
      
      return true;
    } catch (error) {
      console.error('ERP connection failed:', error);
      return false;
    }
  }

  disconnect(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.integration = undefined;
  }

  private startSync(): void {
    // Sync every 15 minutes
    this.syncInterval = setInterval(() => {
      this.syncWithVibelux();
    }, 15 * 60 * 1000);
  }

  private async syncWithVibelux(): Promise<void> {
    if (!this.integration) return;

    try {
      // Get current inventory
      const inventory = await this.integration.getInventory();
      
      // Update Vibelux database
      await this.updateVibeluxInventory(inventory);
      
      // Check for compliance events
      const startDate = this.lastSync || new Date(Date.now() - 24 * 60 * 60 * 1000);
      const events = await this.integration.getComplianceHistory(startDate, new Date());
      
      // Process events
      await this.processComplianceEvents(events);
      
      this.lastSync = new Date();
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  private async updateVibeluxInventory(inventory: any): Promise<void> {
    // Update local database with ERP inventory
    // This would integrate with Vibelux's plant monitoring system
  }

  private async processComplianceEvents(events: ComplianceEvent[]): Promise<void> {
    // Process and store compliance events
    // Generate alerts for critical events
  }

  // Delegated methods
  async createPlantBatch(
    strain: string,
    count: number,
    location: string,
    source: 'seed' | 'clone'
  ): Promise<Batch | null> {
    if (!this.integration) return null;

    const batch = await this.integration.createBatch({
      name: `${strain}-${new Date().toISOString().split('T')[0]}`,
      type: source === 'seed' ? 'plant' : 'clone',
      strain,
      plantCount: count,
      location,
      createdDate: new Date(),
      status: 'active'
    });

    // Create individual plants
    const plants = Array(count).fill(null).map(() => ({
      tag: '', // Will be assigned by system
      strain,
      location: { facility: '', room: location, zone: '' },
      stage: source as Plant['stage'],
      plantedDate: new Date(),
      batchId: batch.id
    }));

    await this.integration.createPlants(plants);
    
    return batch;
  }

  async recordHarvest(
    plantIds: string[],
    wetWeight: number,
    dryLocation: string
  ): Promise<Batch | null> {
    if (!this.integration) return null;

    return this.integration.harvestPlants(plantIds, wetWeight, 'grams');
  }

  async createPackagesFromHarvest(
    harvestBatchId: string,
    packages: Array<{
      type: Package['type'];
      weight: number;
    }>
  ): Promise<Package[] | null> {
    if (!this.integration) return null;

    // Get harvest batch details
    const batch = await this.integration.getBatch(harvestBatchId);
    
    const packageData = packages.map(pkg => ({
      tag: '', // Will be assigned
      type: pkg.type,
      strain: batch.strain,
      weight: pkg.weight,
      unitOfMeasure: 'grams' as const,
      batchId: harvestBatchId,
      location: batch.location,
      packagedDate: new Date(),
      status: 'active' as const
    }));

    return this.integration.createPackages(packageData);
  }

  getIntegration(): ERPIntegration | undefined {
    return this.integration;
  }
}

// Export singleton instance
export const erpManager = new ERPIntegrationManager();