/**
 * BIM/IFC Import and Export Handler
 * Supports IFC2x3 and IFC4 standards with comprehensive entity support
 */

import type { 
  Fixture, Plant, RoomObject, Window
} from '../components/designer/context/types';

interface Bench extends RoomObject {
  type: 'bench';
}

interface Greenhouse extends RoomObject {
  type: 'greenhouse';
}

// IFC Entity Types
export interface IfcEntity {
  type: string;
  id: string;
  guid: string;
  properties: Record<string, any>;
  relationships: IfcRelationship[];
}

export interface IfcRelationship {
  type: string;
  relatedEntity: string;
  relatingEntity: string;
}

export interface IfcPropertySet {
  name: string;
  properties: Record<string, any>;
}

export interface IfcProject extends IfcEntity {
  type: 'IfcProject';
  name: string;
  description: string;
  units: IfcUnitAssignment;
}

export interface IfcBuilding extends IfcEntity {
  type: 'IfcBuilding';
  name: string;
  elevation: number;
  address?: string;
}

export interface IfcBuildingStorey extends IfcEntity {
  type: 'IfcBuildingStorey';
  name: string;
  elevation: number;
}

export interface IfcSpace extends IfcEntity {
  type: 'IfcSpace';
  name: string;
  longName?: string;
  interiorOrExterior: 'INTERNAL' | 'EXTERNAL';
  elevationWithFloor: number;
}

export interface IfcUnitAssignment {
  lengthUnit: 'METRE' | 'FOOT';
  areaUnit: 'SQUARE_METRE' | 'SQUARE_FOOT';
  volumeUnit: 'CUBIC_METRE' | 'CUBIC_FOOT';
  angleUnit: 'RADIAN' | 'DEGREE';
}

// Material Properties
export interface IfcMaterial {
  name: string;
  category?: string;
  properties: {
    reflectance?: number;
    transmittance?: number;
    emissivity?: number;
    roughness?: number;
  };
}

// Photometric Properties
export interface IfcLightSource {
  type: 'IfcLightSourceGoniometric' | 'IfcLightSourceDirectional' | 'IfcLightSourcePositional';
  name: string;
  color: { r: number; g: number; b: number };
  intensity: number;
  photometricData?: {
    ppf?: number;
    efficacy?: number;
    beamAngle?: number;
    spectrum?: string;
  };
}

// Classification Systems
export interface Classification {
  system: 'OmniClass' | 'UniClass' | 'MasterFormat';
  code: string;
  name: string;
}

export class BIMIfcHandler {
  private projectGuid: string;
  private buildingGuid: string;
  private storeyGuid: string;
  private spaceGuid: string;

  constructor() {
    this.projectGuid = this.generateGuid();
    this.buildingGuid = this.generateGuid();
    this.storeyGuid = this.generateGuid();
    this.spaceGuid = this.generateGuid();
  }

  /**
   * Generate IFC-compliant GUID
   */
  private generateGuid(): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';
    let guid = '';
    for (let i = 0; i < 22; i++) {
      guid += chars[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * chars.length)];
    }
    return guid;
  }

  /**
   * Export to IFC format
   */
  exportToIFC(
    objects: RoomObject[],
    roomDimensions: { width: number; length: number; height: number },
    version: 'IFC2X3' | 'IFC4' = 'IFC4',
    projectInfo?: {
      name?: string;
      description?: string;
      author?: string;
      organization?: string;
    }
  ): string {
    const timestamp = new Date().toISOString();
    const fileSchema = version === 'IFC4' ? 'IFC4' : 'IFC2X3';
    
    let ifc = '';
    
    // IFC Header
    ifc += 'ISO-10303-21;\n';
    ifc += 'HEADER;\n';
    ifc += `FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');\n`;
    ifc += `FILE_NAME('${projectInfo?.name || 'VibeluxExport'}.ifc','${timestamp}',`;
    ifc += `('${projectInfo?.author || 'Vibelux User'}'),('${projectInfo?.organization || 'Vibelux'}'),`;
    ifc += `'IFC Engine','Vibelux BIM Handler','');\n`;
    ifc += `FILE_SCHEMA(('${fileSchema}'));\n`;
    ifc += 'ENDSEC;\n\n';
    
    // IFC Data Section
    ifc += 'DATA;\n';
    
    // Context and Units
    let entityId = 1;
    const contextId = entityId++;
    ifc += `#${contextId}=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.0E-5,`;
    ifc += `#${entityId++},#${entityId});\n`;
    const directionId = entityId++;
    ifc += `#${directionId}=IFCDIRECTION((0.,0.,1.));\n`;
    
    // Units
    const lengthUnitId = entityId++;
    const areaUnitId = entityId++;
    const volumeUnitId = entityId++;
    const angleUnitId = entityId++;
    const unitAssignmentId = entityId++;
    
    ifc += `#${lengthUnitId}=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);\n`;
    ifc += `#${areaUnitId}=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);\n`;
    ifc += `#${volumeUnitId}=IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.);\n`;
    ifc += `#${angleUnitId}=IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.);\n`;
    ifc += `#${unitAssignmentId}=IFCUNITASSIGNMENT((#${lengthUnitId},#${areaUnitId},#${volumeUnitId},#${angleUnitId}));\n`;
    
    // Project
    const projectId = entityId++;
    ifc += `#${projectId}=IFCPROJECT('${this.projectGuid}',$,'${projectInfo?.name || 'Vibelux Project'}',`;
    ifc += `'${projectInfo?.description || 'Lighting Design Project'}',$,$,$,(#${contextId}),#${unitAssignmentId});\n`;
    
    // Site
    const siteId = entityId++;
    ifc += `#${siteId}=IFCSITE('${this.generateGuid()}',$,'Site',$,$,$,$,$,.ELEMENT.,$,$,$,$,$);\n`;
    
    // Building
    const buildingId = entityId++;
    ifc += `#${buildingId}=IFCBUILDING('${this.buildingGuid}',$,'Building',$,$,$,$,$,.ELEMENT.,$,$,$);\n`;
    
    // Building Storey
    const storeyId = entityId++;
    ifc += `#${storeyId}=IFCBUILDINGSTOREY('${this.storeyGuid}',$,'Ground Floor',$,$,$,$,$,.ELEMENT.,0.);\n`;
    
    // Space
    const spaceId = entityId++;
    ifc += `#${spaceId}=IFCSPACE('${this.spaceGuid}',$,'Growing Space','Cultivation Area',$,$,$,$,`;
    ifc += `.ELEMENT.,.INTERNAL.,$);\n`;
    
    // Relationships
    const relAggregates1 = entityId++;
    const relAggregates2 = entityId++;
    const relAggregates3 = entityId++;
    const relAggregates4 = entityId++;
    
    ifc += `#${relAggregates1}=IFCRELAGGREGATES('${this.generateGuid()}',$,$,$,#${projectId},(#${siteId}));\n`;
    ifc += `#${relAggregates2}=IFCRELAGGREGATES('${this.generateGuid()}',$,$,$,#${siteId},(#${buildingId}));\n`;
    ifc += `#${relAggregates3}=IFCRELAGGREGATES('${this.generateGuid()}',$,$,$,#${buildingId},(#${storeyId}));\n`;
    ifc += `#${relAggregates4}=IFCRELAGGREGATES('${this.generateGuid()}',$,$,$,#${storeyId},(#${spaceId}));\n`;
    
    // Export objects
    const objectIds: number[] = [];
    
    objects.forEach((obj) => {
      const objId = entityId++;
      objectIds.push(objId);
      
      if (obj.type === 'fixture') {
        const fixture = obj as unknown as Fixture;
        ifc += this.exportFixtureToIFC(fixture, objId, entityId, version);
        entityId += 10; // Reserve space for related entities
        
        // Add photometric property set
        const propSetId = entityId++;
        ifc += this.exportPhotometricPropertySet(fixture, propSetId, objId, entityId);
        entityId += 5;
      } else if (obj.type === 'plant') {
        const plant = obj as unknown as Plant;
        ifc += this.exportPlantToIFC(plant, objId, entityId, version);
        entityId += 5;
      } else if (obj.type === 'bench') {
        const bench = obj as unknown as Bench;
        ifc += this.exportBenchToIFC(bench, objId, entityId, version);
        entityId += 5;
      } else if (obj.type === 'greenhouse') {
        const greenhouse = obj as unknown as Greenhouse;
        ifc += this.exportGreenhouseToIFC(greenhouse, objId, entityId, version);
        entityId += 15;
      } else if (obj.type === 'window') {
        const window = obj as unknown as Window;
        ifc += this.exportWindowToIFC(window, objId, entityId, version);
        entityId += 5;
      }
    });
    
    // Relate objects to space
    if (objectIds.length > 0) {
      const relContainedId = entityId++;
      ifc += `#${relContainedId}=IFCRELCONTAINEDINSPATIALSTRUCTURE('${this.generateGuid()}',$,$,$,`;
      ifc += `(${objectIds.map(id => `#${id}`).join(',')}),#${spaceId});\n`;
    }
    
    ifc += 'ENDSEC;\n';
    ifc += 'END-ISO-10303-21;\n';
    
    return ifc;
  }

  /**
   * Export fixture to IFC
   */
  private exportFixtureToIFC(
    fixture: Fixture,
    fixtureId: number,
    entityId: number,
    version: 'IFC2X3' | 'IFC4'
  ): string {
    let ifc = '';
    
    // Create light fixture
    const entityType = version === 'IFC4' ? 'IFCLIGHTFIXTURE' : 'IFCFLOWSEGMENT';
    ifc += `#${fixtureId}=${entityType}('${fixture.id || this.generateGuid()}',$,`;
    ifc += `'${fixture.customName || fixture.model.name}','${fixture.model.manufacturer || 'Generic'} lighting fixture',`;
    ifc += `$,#${entityId++},#${entityId++},$,.LIGHTFIXTURE.);\n`;
    
    // Local placement
    const placementId = entityId - 2;
    const location3dId = entityId++;
    const axisId = entityId++;
    const refDirId = entityId++;
    
    ifc += `#${location3dId}=IFCCARTESIANPOINT((${fixture.x * 1000},${fixture.y * 1000},${fixture.z * 1000}));\n`;
    ifc += `#${axisId}=IFCDIRECTION((0.,0.,1.));\n`;
    ifc += `#${refDirId}=IFCDIRECTION((${Math.cos(fixture.rotation)},${Math.sin(fixture.rotation)},0.));\n`;
    ifc += `#${placementId}=IFCLOCALPLACEMENT($,#${entityId++});\n`;
    ifc += `#${entityId - 1}=IFCAXIS2PLACEMENT3D(#${location3dId},#${axisId},#${refDirId});\n`;
    
    // Representation
    const repId = entityId - 6;
    const shapeRepId = entityId++;
    const boxId = entityId++;
    
    ifc += `#${boxId}=IFCBOUNDINGBOX(#${entityId++},${fixture.width * 1000},${fixture.length * 1000},${fixture.height * 1000});\n`;
    ifc += `#${entityId - 1}=IFCCARTESIANPOINT((0.,0.,0.));\n`;
    ifc += `#${shapeRepId}=IFCSHAPEREPRESENTATION($,'Box','BoundingBox',(#${boxId}));\n`;
    ifc += `#${repId}=IFCPRODUCTDEFINITIONSHAPE($,$,(#${shapeRepId}));\n`;
    
    return ifc;
  }

  /**
   * Export photometric property set
   */
  private exportPhotometricPropertySet(
    fixture: Fixture,
    propSetId: number,
    fixtureId: number,
    entityId: number
  ): string {
    let ifc = '';
    
    // Property values
    const ppfPropId = entityId++;
    const wattPropId = entityId++;
    const efficacyPropId = entityId++;
    const beamAnglePropId = entityId++;
    const spectrumPropId = entityId++;
    
    ifc += `#${ppfPropId}=IFCPROPERTYSINGLEVALUE('PPF',$,IFCREAL(${fixture.model.ppf}),$);\n`;
    ifc += `#${wattPropId}=IFCPROPERTYSINGLEVALUE('Wattage',$,IFCPOWERMEASURE(${fixture.model.wattage}),$);\n`;
    
    if (fixture.model.efficacy) {
      ifc += `#${efficacyPropId}=IFCPROPERTYSINGLEVALUE('Efficacy',$,IFCREAL(${fixture.model.efficacy}),$);\n`;
    }
    
    ifc += `#${beamAnglePropId}=IFCPROPERTYSINGLEVALUE('BeamAngle',$,IFCPLANEANGLEMEASURE(${fixture.model.beamAngle * Math.PI / 180}),$);\n`;
    
    if (fixture.model.spectrum) {
      ifc += `#${spectrumPropId}=IFCPROPERTYSINGLEVALUE('Spectrum',$,IFCTEXT('${fixture.model.spectrum}'),$);\n`;
    }
    
    // Property set
    const properties = [ppfPropId, wattPropId];
    if (fixture.model.efficacy) properties.push(efficacyPropId);
    properties.push(beamAnglePropId);
    if (fixture.model.spectrum) properties.push(spectrumPropId);
    
    ifc += `#${propSetId}=IFCPROPERTYSET('${this.generateGuid()}',$,'Pset_LightFixtureTypePhotometric',`;
    ifc += `$,(${properties.map(id => `#${id}`).join(',')}));\n`;
    
    // Relationship
    const relDefId = entityId++;
    ifc += `#${relDefId}=IFCRELDEFINESBYPROPERTIES('${this.generateGuid()}',$,$,$,(#${fixtureId}),#${propSetId});\n`;
    
    return ifc;
  }

  /**
   * Export plant to IFC
   */
  private exportPlantToIFC(
    plant: Plant,
    plantId: number,
    entityId: number,
    version: 'IFC2X3' | 'IFC4'
  ): string {
    let ifc = '';
    
    // Use IfcBuildingElementProxy for plants
    ifc += `#${plantId}=IFCBUILDINGELEMENTPROXY('${plant.id || this.generateGuid()}',$,`;
    ifc += `'${plant.variety}','Plant - ${plant.growthStage}',`;
    ifc += `$,#${entityId++},#${entityId++},$,.NOTDEFINED.);\n`;
    
    // Local placement
    const placementId = entityId - 2;
    const location3dId = entityId++;
    
    ifc += `#${location3dId}=IFCCARTESIANPOINT((${plant.x * 1000},${plant.y * 1000},${plant.z * 1000}));\n`;
    ifc += `#${placementId}=IFCLOCALPLACEMENT($,#${entityId++});\n`;
    ifc += `#${entityId - 1}=IFCAXIS2PLACEMENT3D(#${location3dId},$,$);\n`;
    
    // Simple box representation
    const repId = entityId - 6;
    const shapeRepId = entityId++;
    const boxId = entityId++;
    
    ifc += `#${boxId}=IFCBOUNDINGBOX(#${entityId++},${plant.width * 1000},${plant.length * 1000},${plant.height * 1000});\n`;
    ifc += `#${entityId - 1}=IFCCARTESIANPOINT((0.,0.,0.));\n`;
    ifc += `#${shapeRepId}=IFCSHAPEREPRESENTATION($,'Box','BoundingBox',(#${boxId}));\n`;
    ifc += `#${repId}=IFCPRODUCTDEFINITIONSHAPE($,$,(#${shapeRepId}));\n`;
    
    // Plant properties
    const propSetId = entityId++;
    const targetPpfdPropId = entityId++;
    const stagePropId = entityId++;
    
    ifc += `#${targetPpfdPropId}=IFCPROPERTYSINGLEVALUE('TargetDLI',$,IFCREAL(${plant.targetDLI}),$);\n`;
    ifc += `#${stagePropId}=IFCPROPERTYSINGLEVALUE('GrowthStage',$,IFCTEXT('${plant.growthStage}'),$);\n`;
    ifc += `#${propSetId}=IFCPROPERTYSET('${this.generateGuid()}',$,'Pset_PlantProperties',`;
    ifc += `$,(#${targetPpfdPropId},#${stagePropId}));\n`;
    
    // Relationship
    const relDefId = entityId++;
    ifc += `#${relDefId}=IFCRELDEFINESBYPROPERTIES('${this.generateGuid()}',$,$,$,(#${plantId}),#${propSetId});\n`;
    
    return ifc;
  }

  /**
   * Export bench to IFC
   */
  private exportBenchToIFC(
    bench: Bench,
    benchId: number,
    entityId: number,
    version: 'IFC2X3' | 'IFC4'
  ): string {
    let ifc = '';
    
    // Use IfcFurnishingElement for benches
    ifc += `#${benchId}=IFCFURNISHINGELEMENT('${bench.id || this.generateGuid()}',$,`;
    ifc += `'Growing Bench','Cultivation bench',`;
    ifc += `$,#${entityId++},#${entityId++},$);\n`;
    
    // Local placement
    const placementId = entityId - 2;
    const location3dId = entityId++;
    
    ifc += `#${location3dId}=IFCCARTESIANPOINT((${bench.x * 1000},${bench.y * 1000},${bench.z * 1000}));\n`;
    ifc += `#${placementId}=IFCLOCALPLACEMENT($,#${entityId++});\n`;
    ifc += `#${entityId - 1}=IFCAXIS2PLACEMENT3D(#${location3dId},$,$);\n`;
    
    // Representation
    const repId = entityId - 6;
    const shapeRepId = entityId++;
    const boxId = entityId++;
    
    ifc += `#${boxId}=IFCBOUNDINGBOX(#${entityId++},${bench.width * 1000},${bench.length * 1000},${bench.height * 1000});\n`;
    ifc += `#${entityId - 1}=IFCCARTESIANPOINT((0.,0.,0.));\n`;
    ifc += `#${shapeRepId}=IFCSHAPEREPRESENTATION($,'Box','BoundingBox',(#${boxId}));\n`;
    ifc += `#${repId}=IFCPRODUCTDEFINITIONSHAPE($,$,(#${shapeRepId}));\n`;
    
    // Bench properties
    // Note: Current Bench interface doesn't have specific properties like tiers
    // Add custom properties here if needed in the future
    
    return ifc;
  }

  /**
   * Export greenhouse to IFC
   */
  private exportGreenhouseToIFC(
    greenhouse: Greenhouse,
    greenhouseId: number,
    entityId: number,
    version: 'IFC2X3' | 'IFC4'
  ): string {
    let ifc = '';
    
    // Use IfcBuilding for greenhouse structure
    ifc += `#${greenhouseId}=IFCBUILDING('${greenhouse.id || this.generateGuid()}',$,`;
    ifc += `'${greenhouse.type}','Greenhouse structure',`;
    ifc += `$,#${entityId++},#${entityId++},$,.ELEMENT.,$,$,$);\n`;
    
    // Local placement
    const placementId = entityId - 2;
    const location3dId = entityId++;
    
    ifc += `#${location3dId}=IFCCARTESIANPOINT((${greenhouse.x * 1000},${greenhouse.y * 1000},${greenhouse.z * 1000}));\n`;
    ifc += `#${placementId}=IFCLOCALPLACEMENT($,#${entityId++});\n`;
    ifc += `#${entityId - 1}=IFCAXIS2PLACEMENT3D(#${location3dId},$,$);\n`;
    
    // Representation - simplified box for now
    const repId = entityId - 6;
    const shapeRepId = entityId++;
    const boxId = entityId++;
    
    ifc += `#${boxId}=IFCBOUNDINGBOX(#${entityId++},${greenhouse.width * 1000},${greenhouse.length * 1000},${greenhouse.height * 1000});\n`;
    ifc += `#${entityId - 1}=IFCCARTESIANPOINT((0.,0.,0.));\n`;
    ifc += `#${shapeRepId}=IFCSHAPEREPRESENTATION($,'Box','BoundingBox',(#${boxId}));\n`;
    ifc += `#${repId}=IFCPRODUCTDEFINITIONSHAPE($,$,(#${shapeRepId}));\n`;
    
    // Greenhouse properties
    const propSetId = entityId++;
    const transmittancePropId = entityId++;
    const dliPropId = entityId++;
    const ventRatePropId = entityId++;
    
    // Simplified greenhouse properties - actual properties would depend on the Greenhouse interface
    ifc += `#${transmittancePropId}=IFCPROPERTYSINGLEVALUE('RoofTransmittance',$,IFCREAL(0.85),$);\n`;
    ifc += `#${dliPropId}=IFCPROPERTYSINGLEVALUE('EstimatedDLI',$,IFCREAL(15.0),$);\n`;
    ifc += `#${ventRatePropId}=IFCPROPERTYSINGLEVALUE('VentilationRate',$,IFCREAL(10.0),$);\n`;
    
    ifc += `#${propSetId}=IFCPROPERTYSET('${this.generateGuid()}',$,'Pset_GreenhouseProperties',`;
    ifc += `$,(#${transmittancePropId},#${dliPropId},#${ventRatePropId}));\n`;
    
    const relDefId = entityId++;
    ifc += `#${relDefId}=IFCRELDEFINESBYPROPERTIES('${this.generateGuid()}',$,$,$,(#${greenhouseId}),#${propSetId});\n`;
    
    return ifc;
  }

  /**
   * Export window to IFC
   */
  private exportWindowToIFC(
    window: Window,
    windowId: number,
    entityId: number,
    version: 'IFC2X3' | 'IFC4'
  ): string {
    let ifc = '';
    
    ifc += `#${windowId}=IFCWINDOW('${window.id || this.generateGuid()}',$,`;
    ifc += `'Window','Natural light opening',`;
    ifc += `$,#${entityId++},#${entityId++},$,$,$);\n`;
    
    // Local placement
    const placementId = entityId - 2;
    const location3dId = entityId++;
    
    ifc += `#${location3dId}=IFCCARTESIANPOINT((${window.x * 1000},${window.y * 1000},1000));\n`;
    ifc += `#${placementId}=IFCLOCALPLACEMENT($,#${entityId++});\n`;
    ifc += `#${entityId - 1}=IFCAXIS2PLACEMENT3D(#${location3dId},$,$);\n`;
    
    // Representation
    const repId = entityId - 6;
    const shapeRepId = entityId++;
    const rectId = entityId++;
    
    ifc += `#${rectId}=IFCRECTANGLEPROFILEDEF(.AREA.,$,#${entityId++},${window.width * 1000},${window.height * 1000});\n`;
    ifc += `#${entityId - 1}=IFCAXIS2PLACEMENT2D(#${entityId++},$);\n`;
    ifc += `#${entityId - 1}=IFCCARTESIANPOINT((0.,0.));\n`;
    
    // Window properties
    const propSetId = entityId++;
    const transmittancePropId = entityId++;
    const orientationPropId = entityId++;
    
    ifc += `#${transmittancePropId}=IFCPROPERTYSINGLEVALUE('Transmittance',$,IFCREAL(0.9),$);\n`;
    ifc += `#${orientationPropId}=IFCPROPERTYSINGLEVALUE('Orientation',$,IFCTEXT('${window.wall}'),$);\n`;
    
    ifc += `#${propSetId}=IFCPROPERTYSET('${this.generateGuid()}',$,'Pset_WindowCommon',`;
    ifc += `$,(#${transmittancePropId},#${orientationPropId}));\n`;
    
    const relDefId = entityId++;
    ifc += `#${relDefId}=IFCRELDEFINESBYPROPERTIES('${this.generateGuid()}',$,$,$,(#${windowId}),#${propSetId});\n`;
    
    return ifc;
  }

  /**
   * Parse IFC file and import objects
   */
  async parseIFC(ifcContent: string): Promise<{
    objects: RoomObject[];
    projectInfo: {
      name: string;
      description: string;
      building?: string;
      storey?: string;
      space?: string;
    };
    units: IfcUnitAssignment;
  }> {
    const lines = ifcContent.split('\n');
    const entities = new Map<string, any>();
    const objects: RoomObject[] = [];
    let projectInfo = {
      name: 'Imported Project',
      description: '',
      building: undefined as string | undefined,
      storey: undefined as string | undefined,
      space: undefined as string | undefined
    };
    let units: IfcUnitAssignment = {
      lengthUnit: 'METRE',
      areaUnit: 'SQUARE_METRE',
      volumeUnit: 'CUBIC_METRE',
      angleUnit: 'RADIAN'
    };

    // Parse entities
    for (const line of lines) {
      const match = line.match(/^#(\d+)=(\w+)\((.*)\);?$/);
      if (match) {
        const [, id, type, params] = match;
        entities.set(id, { type, params: this.parseParams(params) });
      }
    }

    // Find project info
    for (const [id, entity] of entities) {
      if (entity.type === 'IFCPROJECT') {
        const params = entity.params;
        projectInfo.name = params[2]?.replace(/'/g, '') || 'Imported Project';
        projectInfo.description = params[3]?.replace(/'/g, '') || '';
      } else if (entity.type === 'IFCBUILDING') {
        projectInfo.building = entity.params[2]?.replace(/'/g, '');
      } else if (entity.type === 'IFCBUILDINGSTOREY') {
        projectInfo.storey = entity.params[2]?.replace(/'/g, '');
      } else if (entity.type === 'IFCSPACE') {
        projectInfo.space = entity.params[2]?.replace(/'/g, '');
      }
    }

    // Import fixtures
    for (const [id, entity] of entities) {
      if (entity.type === 'IFCLIGHTFIXTURE' || 
          (entity.type === 'IFCFLOWSEGMENT' && entity.params[8] === '.LIGHTFIXTURE.')) {
        const fixture = await this.parseFixture(id, entity, entities);
        if (fixture) objects.push(fixture);
      } else if (entity.type === 'IFCBUILDINGELEMENTPROXY') {
        // Could be a plant
        const plant = this.parsePlant(id, entity, entities);
        if (plant) objects.push(plant);
      } else if (entity.type === 'IFCFURNISHINGELEMENT') {
        // Could be a bench
        const bench = this.parseBench(id, entity, entities);
        if (bench) objects.push(bench);
      } else if (entity.type === 'IFCWINDOW') {
        const window = this.parseWindow(id, entity, entities);
        if (window) {
          // Convert Window to RoomObject
          const windowObj: RoomObject = {
            id: window.id,
            type: 'window',
            x: window.x,
            y: window.y,
            z: 0,
            rotation: 0,
            width: window.width,
            length: 0.1,
            height: window.height,
            enabled: true
          };
          objects.push(windowObj);
        }
      }
    }

    return { objects, projectInfo, units };
  }

  /**
   * Parse IFC parameters
   */
  private parseParams(params: string): any[] {
    const result: any[] = [];
    let current = '';
    let depth = 0;
    let inString = false;
    
    for (let i = 0; i < params.length; i++) {
      const char = params[i];
      
      if (char === "'" && params[i - 1] !== '\\') {
        inString = !inString;
      }
      
      if (!inString) {
        if (char === '(') depth++;
        if (char === ')') depth--;
        if (char === ',' && depth === 0) {
          result.push(this.parseValue(current.trim()));
          current = '';
          continue;
        }
      }
      
      current += char;
    }
    
    if (current) {
      result.push(this.parseValue(current.trim()));
    }
    
    return result;
  }

  /**
   * Parse individual IFC value
   */
  private parseValue(value: string): any {
    if (value === '$') return null;
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    }
    if (value.startsWith('#')) return value;
    if (value.startsWith('(') && value.endsWith(')')) {
      return this.parseParams(value.slice(1, -1));
    }
    if (value.includes('.')) {
      const num = parseFloat(value);
      return isNaN(num) ? value : num;
    }
    const num = parseInt(value);
    return isNaN(num) ? value : num;
  }

  /**
   * Parse fixture from IFC
   */
  private async parseFixture(id: string, entity: any, entities: Map<string, any>): Promise<Fixture | null> {
    try {
      const params = entity.params;
      const guid = params[0]?.replace(/'/g, '') || this.generateGuid();
      const name = params[2]?.replace(/'/g, '') || 'Imported Fixture';
      const description = params[3]?.replace(/'/g, '') || '';
      
      // Get placement
      const placementRef = params[5];
      const placement = this.getPlacement(placementRef, entities);
      
      // Get properties
      const properties = this.getProperties(id, entities);
      
      // Create fixture object
      const fixture: Fixture = {
        id: `fixture-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
        type: 'fixture',
        x: placement.x / 1000, // Convert from mm to m
        y: placement.y / 1000,
        z: placement.z / 1000,
        rotation: placement.rotation,
        width: 0.6, // Default dimensions
        length: 1.2,
        height: 0.1,
        enabled: true,
        model: {
          name: name,
          wattage: properties.Wattage || 100,
          ppf: properties.PPF || 200,
          beamAngle: properties.BeamAngle ? properties.BeamAngle * 180 / Math.PI : 120,
          efficacy: properties.Efficacy,
          spectrum: properties.Spectrum,
          manufacturer: description.split(' ')[0] || 'Generic'
        }
      };
      
      return fixture;
    } catch (error) {
      console.error('Error parsing fixture:', error);
      return null;
    }
  }

  /**
   * Parse plant from IFC
   */
  private parsePlant(id: string, entity: any, entities: Map<string, any>): Plant | null {
    try {
      const params = entity.params;
      const name = params[2]?.replace(/'/g, '') || 'Plant';
      const description = params[3]?.replace(/'/g, '') || '';
      
      // Check if this is actually a plant
      if (!description.includes('Plant')) return null;
      
      const placement = this.getPlacement(params[5], entities);
      const properties = this.getProperties(id, entities);
      
      const plant: Plant = {
        id: `plant-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
        type: 'plant',
        x: placement.x / 1000,
        y: placement.y / 1000,
        z: placement.z / 1000,
        rotation: 0,
        width: 1,
        length: 1,
        height: 0.5,
        enabled: true,
        variety: name,
        growthStage: properties.GrowthStage || 'vegetative',
        targetDLI: properties.TargetDLI || 15
      };
      
      return plant;
    } catch (error) {
      console.error('Error parsing plant:', error);
      return null;
    }
  }

  /**
   * Parse bench from IFC
   */
  private parseBench(id: string, entity: any, entities: Map<string, any>): Bench | null {
    try {
      const params = entity.params;
      const name = params[2]?.replace(/'/g, '') || 'Bench';
      
      const placement = this.getPlacement(params[5], entities);
      const properties = this.getProperties(id, entities);
      
      const bench: Bench = {
        id: `bench-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
        type: 'bench',
        x: placement.x / 1000,
        y: placement.y / 1000,
        z: placement.z / 1000,
        rotation: 0,
        width: 1.2,
        length: 2.4,
        height: 0.9,
        enabled: true
      };
      
      return bench;
    } catch (error) {
      console.error('Error parsing bench:', error);
      return null;
    }
  }

  /**
   * Parse window from IFC
   */
  private parseWindow(id: string, entity: any, entities: Map<string, any>): Window | null {
    try {
      const params = entity.params;
      const placement = this.getPlacement(params[5], entities);
      const properties = this.getProperties(id, entities);
      
      const window: Window = {
        id: `window-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
        wall: (properties.Orientation || 'north') as 'north' | 'south' | 'east' | 'west',
        x: placement.x / 1000,
        y: placement.y / 1000,
        width: 2,
        height: 1.5
      };
      
      return window;
    } catch (error) {
      console.error('Error parsing window:', error);
      return null;
    }
  }

  /**
   * Get placement from IFC entities
   */
  private getPlacement(ref: string, entities: Map<string, any>): {
    x: number;
    y: number;
    z: number;
    rotation: number;
  } {
    if (!ref || !ref.startsWith('#')) {
      return { x: 0, y: 0, z: 0, rotation: 0 };
    }
    
    const placementEntity = entities.get(ref.substring(1));
    if (!placementEntity) {
      return { x: 0, y: 0, z: 0, rotation: 0 };
    }
    
    const axisPlacementRef = placementEntity.params[1];
    if (!axisPlacementRef || !axisPlacementRef.startsWith('#')) {
      return { x: 0, y: 0, z: 0, rotation: 0 };
    }
    
    const axisPlacement = entities.get(axisPlacementRef.substring(1));
    if (!axisPlacement) {
      return { x: 0, y: 0, z: 0, rotation: 0 };
    }
    
    const locationRef = axisPlacement.params[0];
    if (!locationRef || !locationRef.startsWith('#')) {
      return { x: 0, y: 0, z: 0, rotation: 0 };
    }
    
    const location = entities.get(locationRef.substring(1));
    if (!location || location.type !== 'IFCCARTESIANPOINT') {
      return { x: 0, y: 0, z: 0, rotation: 0 };
    }
    
    const coords = location.params[0];
    if (!Array.isArray(coords) || coords.length < 3) {
      return { x: 0, y: 0, z: 0, rotation: 0 };
    }
    
    // Calculate rotation from reference direction if available
    let rotation = 0;
    const refDirRef = axisPlacement.params[2];
    if (refDirRef && refDirRef.startsWith('#')) {
      const refDir = entities.get(refDirRef.substring(1));
      if (refDir && refDir.type === 'IFCDIRECTION') {
        const dir = refDir.params[0];
        if (Array.isArray(dir) && dir.length >= 2) {
          rotation = Math.atan2(dir[1], dir[0]);
        }
      }
    }
    
    return {
      x: coords[0] || 0,
      y: coords[1] || 0,
      z: coords[2] || 0,
      rotation
    };
  }

  /**
   * Get properties from IFC entities
   */
  private getProperties(objectId: string, entities: Map<string, any>): Record<string, any> {
    const properties: Record<string, any> = {};
    
    // Find property relationships
    for (const [id, entity] of entities) {
      if (entity.type === 'IFCRELDEFINESBYPROPERTIES') {
        const relatedObjects = entity.params[4];
        if (Array.isArray(relatedObjects) && 
            relatedObjects.some(ref => ref === `#${objectId}`)) {
          const propSetRef = entity.params[5];
          if (propSetRef && propSetRef.startsWith('#')) {
            const propSet = entities.get(propSetRef.substring(1));
            if (propSet && propSet.type === 'IFCPROPERTYSET') {
              const props = propSet.params[4];
              if (Array.isArray(props)) {
                for (const propRef of props) {
                  if (propRef && propRef.startsWith('#')) {
                    const prop = entities.get(propRef.substring(1));
                    if (prop && prop.type === 'IFCPROPERTYSINGLEVALUE') {
                      const name = prop.params[0]?.replace(/'/g, '');
                      const value = prop.params[2];
                      if (name) {
                        properties[name] = this.parsePropertyValue(value);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    return properties;
  }

  /**
   * Parse property value
   */
  private parsePropertyValue(value: any): any {
    if (typeof value === 'string') {
      if (value.includes('(') && value.includes(')')) {
        const match = value.match(/\(([^)]+)\)/);
        if (match) {
          const num = parseFloat(match[1]);
          return isNaN(num) ? match[1] : num;
        }
      }
    }
    return value;
  }

  /**
   * Get BIM properties for an object
   */
  getBIMProperties(object: RoomObject): {
    guid: string;
    classification?: Classification;
    customProperties: Record<string, any>;
  } {
    return {
      guid: object.id || this.generateGuid(),
      classification: this.getClassification(object),
      customProperties: this.getCustomProperties(object)
    };
  }

  /**
   * Get classification for object type
   */
  private getClassification(object: RoomObject): Classification | undefined {
    const classifications: Record<string, Classification> = {
      fixture: {
        system: 'OmniClass',
        code: '23-35 37 11',
        name: 'Horticultural Lighting'
      },
      greenhouse: {
        system: 'OmniClass',
        code: '23-19 11 00',
        name: 'Greenhouses'
      },
      plant: {
        system: 'OmniClass',
        code: '23-27 00 00',
        name: 'Plants and Planters'
      }
    };
    
    return classifications[object.type];
  }

  /**
   * Get custom properties for object
   */
  private getCustomProperties(object: RoomObject): Record<string, any> {
    const props: Record<string, any> = {
      CreatedBy: 'Vibelux',
      CreatedDate: new Date().toISOString()
    };
    
    if (object.type === 'fixture') {
      const fixture = object as Fixture;
      if (fixture.model.isDLC) {
        props.DLCListed = true;
        props.DLCCategory = fixture.model.spectrum || 'Standard';
      }
      if (fixture.dimmingLevel !== undefined) {
        props.DimmingLevel = fixture.dimmingLevel;
      }
      if (fixture.group) {
        props.ControlGroup = fixture.group;
      }
    }
    
    return props;
  }
}

// Export singleton instance
export const bimIfcHandler = new BIMIfcHandler();