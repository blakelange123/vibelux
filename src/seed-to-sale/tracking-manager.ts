import {
  Plant,
  PlantBatch,
  Harvest,
  Package,
  Transfer,
  ComplianceReport,
  WasteLog,
  StateSystemConfig,
  PlantStage,
  BatchStatus,
  HarvestStatus,
  PackageStatus,
  TransferStatus,
  ReportType,
  UnitOfMeasure
} from './tracking-types';

export class SeedToSaleManager {
  private plants: Map<string, Plant> = new Map();
  private batches: Map<string, PlantBatch> = new Map();
  private harvests: Map<string, Harvest> = new Map();
  private packages: Map<string, Package> = new Map();
  private transfers: Map<string, Transfer> = new Map();
  private wasteLogs: Map<string, WasteLog> = new Map();
  private stateConfig: StateSystemConfig | null = null;
  
  // Plant Management
  createPlantBatch(batch: Omit<PlantBatch, 'id' | 'createdAt' | 'updatedAt'>): PlantBatch {
    const newBatch: PlantBatch = {
      ...batch,
      id: `BATCH-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.batches.set(newBatch.id, newBatch);
    
    // Create individual plants with tags
    for (let i = 0; i < batch.count; i++) {
      const plant: Plant = {
        id: `PLANT-${Date.now()}-${i}`,
        tagId: batch.trackingTags[i] || `TAG-${Date.now()}-${i}`,
        strain: batch.strain,
        plantBatchId: newBatch.id,
        stage: PlantStage.Clone,
        location: batch.room,
        room: batch.room,
        plantedDate: batch.plantedDate,
        height: 0,
        health: 'Healthy',
        notes: '',
        waterings: [],
        feedings: [],
        pestApplications: [],
        movements: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.plants.set(plant.id, plant);
    }
    
    // Sync with state system
    if (this.stateConfig?.syncEnabled) {
      this.syncBatchToState(newBatch);
    }
    
    return newBatch;
  }

  movePlants(plantIds: string[], toLocation: string, reason: string, movedBy: string): void {
    plantIds.forEach(plantId => {
      const plant = this.plants.get(plantId);
      if (!plant) return;
      
      const movement = {
        date: new Date(),
        fromLocation: plant.location,
        toLocation,
        reason,
        movedBy
      };
      
      plant.movements.push(movement);
      plant.location = toLocation;
      plant.room = toLocation.split('-')[0]; // Assuming format "Room-Section"
      plant.updatedAt = new Date();
      
      // Update state tracking
      if (this.stateConfig?.syncEnabled) {
        this.syncPlantMovement(plant, movement);
      }
    });
  }

  updatePlantStage(plantIds: string[], newStage: PlantStage): void {
    const stageDate = new Date();
    
    plantIds.forEach(plantId => {
      const plant = this.plants.get(plantId);
      if (!plant) return;
      
      plant.stage = newStage;
      
      switch (newStage) {
        case PlantStage.Vegetative:
          plant.vegetativeDate = stageDate;
          break;
        case PlantStage.Flowering:
          plant.floweringDate = stageDate;
          break;
      }
      
      plant.updatedAt = new Date();
    });
    
    // Sync stage changes
    if (this.stateConfig?.syncEnabled) {
      this.syncPlantStageChange(plantIds, newStage);
    }
  }

  // Harvest Management
  createHarvest(harvest: Omit<Harvest, 'id' | 'createdAt' | 'updatedAt'>): Harvest {
    const newHarvest: Harvest = {
      ...harvest,
      id: `HARVEST-${Date.now()}`,
      harvestBatchId: `HB-${Date.now()}`,
      status: HarvestStatus.Drying,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.harvests.set(newHarvest.id, newHarvest);
    
    // Update plant status
    harvest.plantIds.forEach(plantId => {
      const plant = this.plants.get(plantId);
      if (plant) {
        plant.stage = PlantStage.Harvested;
        plant.harvestDate = harvest.harvestDate;
        plant.updatedAt = new Date();
      }
    });
    
    // State system sync
    if (this.stateConfig?.syncEnabled) {
      this.syncHarvestToState(newHarvest);
    }
    
    return newHarvest;
  }

  finishDrying(harvestId: string, dryWeight: number): void {
    const harvest = this.harvests.get(harvestId);
    if (!harvest) throw new Error('Harvest not found');
    
    harvest.dryingEndDate = new Date();
    harvest.dryWeight = dryWeight;
    harvest.status = HarvestStatus.Curing;
    harvest.updatedAt = new Date();
    
    // Calculate moisture loss
    const moistureLoss = ((harvest.wetWeight - dryWeight) / harvest.wetWeight) * 100;
    
    // Update state system
    if (this.stateConfig?.syncEnabled) {
      this.syncDryingComplete(harvest);
    }
  }

  // Package Management
  createPackages(
    harvestId: string,
    packageSpecs: Array<{
      weight: number;
      productType: string;
      tagId: string;
    }>
  ): Package[] {
    const harvest = this.harvests.get(harvestId);
    if (!harvest) throw new Error('Harvest not found');
    
    const packages: Package[] = [];
    let totalPackagedWeight = 0;
    
    packageSpecs.forEach(spec => {
      const pkg: Package = {
        id: `PKG-${Date.now()}-${packages.length}`,
        tagId: spec.tagId,
        productType: spec.productType as any,
        strain: harvest.strain,
        harvestBatchId: harvest.harvestBatchId,
        weight: spec.weight,
        unitOfMeasure: UnitOfMeasure.Grams,
        packagedDate: new Date(),
        status: PackageStatus.Active,
        location: 'Vault',
        childPackages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.packages.set(pkg.id, pkg);
      packages.push(pkg);
      totalPackagedWeight += spec.weight;
    });
    
    // Update harvest with packaged weight
    harvest.packagedWeight = totalPackagedWeight;
    harvest.status = HarvestStatus.Complete;
    harvest.updatedAt = new Date();
    
    // Sync packages
    if (this.stateConfig?.syncEnabled) {
      this.syncPackagesToState(packages);
    }
    
    return packages;
  }

  sellPackage(packageId: string, soldTo: string, price: number): void {
    const pkg = this.packages.get(packageId);
    if (!pkg) throw new Error('Package not found');
    
    pkg.status = PackageStatus.Sold;
    pkg.soldDate = new Date();
    pkg.soldTo = soldTo;
    pkg.price = price;
    pkg.updatedAt = new Date();
    
    // Create sales report entry
    this.createSalesReportEntry(pkg);
    
    // Sync sale
    if (this.stateConfig?.syncEnabled) {
      this.syncPackageSale(pkg);
    }
  }

  // Transfer Management
  createTransfer(transfer: Omit<Transfer, 'id' | 'createdAt' | 'updatedAt'>): Transfer {
    const newTransfer: Transfer = {
      ...transfer,
      id: `XFER-${Date.now()}`,
      manifestNumber: this.generateManifestNumber(),
      status: TransferStatus.Pending,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.transfers.set(newTransfer.id, newTransfer);
    
    // Update package status
    transfer.packages.forEach(pkg => {
      const packageItem = this.packages.get(pkg.packageId);
      if (packageItem) {
        packageItem.status = PackageStatus.InTransit;
        packageItem.manifestId = newTransfer.manifestNumber;
        packageItem.updatedAt = new Date();
      }
    });
    
    // Generate manifest and sync
    if (this.stateConfig?.syncEnabled) {
      this.syncTransferToState(newTransfer);
    }
    
    return newTransfer;
  }

  completeTransfer(transferId: string): void {
    const transfer = this.transfers.get(transferId);
    if (!transfer) throw new Error('Transfer not found');
    
    transfer.status = TransferStatus.Delivered;
    transfer.actualArrival = new Date();
    transfer.updatedAt = new Date();
    
    // Update package status and location
    transfer.packages.forEach(pkg => {
      const packageItem = this.packages.get(pkg.packageId);
      if (packageItem) {
        packageItem.status = PackageStatus.Active;
        packageItem.location = transfer.destinationFacility;
        packageItem.updatedAt = new Date();
      }
    });
    
    // Sync completion
    if (this.stateConfig?.syncEnabled) {
      this.syncTransferComplete(transfer);
    }
  }

  // Waste Management
  recordWaste(waste: Omit<WasteLog, 'id' | 'createdAt'>): WasteLog {
    const newWaste: WasteLog = {
      ...waste,
      id: `WASTE-${Date.now()}`,
      createdAt: new Date()
    };
    
    this.wasteLogs.set(newWaste.id, newWaste);
    
    // Update plant/package status
    waste.plantIds.forEach(plantId => {
      const plant = this.plants.get(plantId);
      if (plant) {
        plant.stage = PlantStage.Destroyed;
        plant.destroyDate = waste.date;
        plant.updatedAt = new Date();
      }
    });
    
    waste.packageIds.forEach(packageId => {
      const pkg = this.packages.get(packageId);
      if (pkg) {
        pkg.status = PackageStatus.Destroyed;
        pkg.updatedAt = new Date();
      }
    });
    
    // Report to state
    if (this.stateConfig?.syncEnabled) {
      this.syncWasteToState(newWaste);
    }
    
    return newWaste;
  }

  // Compliance & Reporting
  generateComplianceReport(type: ReportType, startDate: Date, endDate: Date): ComplianceReport {
    const reportData = this.collectReportData(type, startDate, endDate);
    
    const report: ComplianceReport = {
      id: `RPT-${Date.now()}`,
      type,
      period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      submittedDate: new Date(),
      status: 'Draft',
      data: reportData,
      errors: [],
      warnings: [],
      createdAt: new Date()
    };
    
    // Validate report data
    const validation = this.validateReportData(type, reportData);
    report.errors = validation.errors;
    report.warnings = validation.warnings;
    
    // Submit if no critical errors
    if (validation.errors.filter(e => e.severity === 'Critical').length === 0) {
      if (this.stateConfig?.syncEnabled) {
        this.submitReportToState(report);
      }
    }
    
    return report;
  }

  // Inventory Tracking
  getCurrentInventory() {
    const inventory = {
      plants: {
        clone: 0,
        vegetative: 0,
        flowering: 0,
        total: 0
      },
      packages: {
        flower: { count: 0, weight: 0 },
        trim: { count: 0, weight: 0 },
        concentrate: { count: 0, weight: 0 },
        edible: { count: 0, weight: 0 },
        total: { count: 0, weight: 0 }
      },
      harvests: {
        drying: 0,
        curing: 0,
        processing: 0
      }
    };
    
    // Count plants by stage
    this.plants.forEach(plant => {
      if (plant.stage === PlantStage.Harvested || plant.stage === PlantStage.Destroyed) return;
      
      inventory.plants.total++;
      switch (plant.stage) {
        case PlantStage.Clone:
          inventory.plants.clone++;
          break;
        case PlantStage.Vegetative:
          inventory.plants.vegetative++;
          break;
        case PlantStage.Flowering:
          inventory.plants.flowering++;
          break;
      }
    });
    
    // Count packages by type
    this.packages.forEach(pkg => {
      if (pkg.status !== PackageStatus.Active) return;
      
      const type = pkg.productType.toLowerCase();
      if (type in inventory.packages) {
        inventory.packages[type as keyof typeof inventory.packages].count++;
        inventory.packages[type as keyof typeof inventory.packages].weight += pkg.weight;
      }
      inventory.packages.total.count++;
      inventory.packages.total.weight += pkg.weight;
    });
    
    // Count active harvests
    this.harvests.forEach(harvest => {
      switch (harvest.status) {
        case HarvestStatus.Drying:
          inventory.harvests.drying++;
          break;
        case HarvestStatus.Curing:
          inventory.harvests.curing++;
          break;
        case HarvestStatus.Processing:
          inventory.harvests.processing++;
          break;
      }
    });
    
    return inventory;
  }

  // State System Integration
  configureStateSystem(config: StateSystemConfig): void {
    this.stateConfig = config;
    
    // Test connection
    this.testStateConnection();
    
    // Initial sync if enabled
    if (config.syncEnabled) {
      this.performFullSync();
    }
  }

  private testStateConnection(): boolean {
    // Implementation would test actual API connection
    return true;
  }

  private performFullSync(): void {
    // Sync all active plants, packages, etc.
  }

  // Helper methods
  private generateManifestNumber(): string {
    const date = new Date();
    const random = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10000).toString().padStart(4, '0');
    return `MAN-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${random}`;
  }

  private collectReportData(type: ReportType, startDate: Date, endDate: Date): any {
    // Collect relevant data based on report type
    const data: any = {};
    
    switch (type) {
      case ReportType.Inventory:
        data.snapshot = this.getCurrentInventory();
        break;
      case ReportType.Sales:
        data.sales = Array.from(this.packages.values())
          .filter(pkg => pkg.soldDate && pkg.soldDate >= startDate && pkg.soldDate <= endDate)
          .map(pkg => ({
            packageId: pkg.tagId,
            strain: pkg.strain,
            weight: pkg.weight,
            price: pkg.price,
            soldTo: pkg.soldTo,
            soldDate: pkg.soldDate
          }));
        break;
      case ReportType.Waste:
        data.waste = Array.from(this.wasteLogs.values())
          .filter(w => w.date >= startDate && w.date <= endDate);
        break;
    }
    
    return data;
  }

  private validateReportData(type: ReportType, data: any): { errors: any[], warnings: any[] } {
    const errors: any[] = [];
    const warnings: any[] = [];
    
    // Validation logic based on report type and state requirements
    
    return { errors, warnings };
  }

  // State system sync methods (implementations would vary by system)
  private syncBatchToState(batch: PlantBatch): void {
  }

  private syncPlantMovement(plant: Plant, movement: any): void {
  }

  private syncPlantStageChange(plantIds: string[], stage: PlantStage): void {
  }

  private syncHarvestToState(harvest: Harvest): void {
  }

  private syncDryingComplete(harvest: Harvest): void {
  }

  private syncPackagesToState(packages: Package[]): void {
  }

  private syncPackageSale(pkg: Package): void {
  }

  private syncTransferToState(transfer: Transfer): void {
  }

  private syncTransferComplete(transfer: Transfer): void {
  }

  private syncWasteToState(waste: WasteLog): void {
  }

  private submitReportToState(report: ComplianceReport): void {
  }

  private createSalesReportEntry(pkg: Package): void {
    // Create internal sales tracking
  }
}