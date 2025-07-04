import { Room, RoomObject, Fixture, Wall } from '../context/types';

export interface BIMImportResult {
  room: Partial<Room>;
  walls: Wall[];
  fixtures: Fixture[];
  objects: RoomObject[];
  metadata: {
    projectName?: string;
    author?: string;
    created?: string;
    modified?: string;
    units?: string;
  };
}

export interface IFCSpace {
  name: string;
  width: number;
  length: number;
  height: number;
  area: number;
  volume: number;
}

export interface IFCWall {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  height: number;
  thickness: number;
}

export interface IFCLightingDevice {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  type: string;
  power?: number;
  lumens?: number;
}

export class BIMImporter {
  private fileContent: string = '';
  private spaces: IFCSpace[] = [];
  private walls: IFCWall[] = [];
  private lightingDevices: IFCLightingDevice[] = [];

  async importFromFile(file: File): Promise<BIMImportResult> {
    const content = await file.text();
    this.fileContent = content;

    // Detect file format
    if (file.name.toLowerCase().endsWith('.ifc')) {
      return this.parseIFC();
    } else if (file.name.toLowerCase().endsWith('.xml')) {
      return this.parseGBXML();
    } else if (file.name.toLowerCase().endsWith('.json')) {
      return this.parseJSON();
    } else {
      throw new Error('Unsupported file format. Please use IFC, gbXML, or JSON files.');
    }
  }

  private parseIFC(): BIMImportResult {
    // Simple IFC parser - in production, use a proper IFC library
    const lines = this.fileContent.split('\n');
    
    // Extract project metadata
    const metadata: any = {};
    const projectLine = lines.find(l => l.includes('IFCPROJECT'));
    if (projectLine) {
      const match = projectLine.match(/'([^']+)'/g);
      if (match && match.length > 0) {
        metadata.projectName = match[0].replace(/'/g, '');
      }
    }

    // Extract spaces
    const spaceLines = lines.filter(l => l.includes('IFCSPACE'));
    spaceLines.forEach(line => {
      // Parse space dimensions (simplified)
      const space: IFCSpace = {
        name: 'Imported Space',
        width: 10, // Default values
        length: 10,
        height: 3,
        area: 100,
        volume: 300
      };
      
      // Try to extract actual dimensions from representation
      const dimMatch = line.match(/\d+\.?\d*/g);
      if (dimMatch && dimMatch.length >= 3) {
        space.width = parseFloat(dimMatch[0]);
        space.length = parseFloat(dimMatch[1]);
        space.height = parseFloat(dimMatch[2]);
        space.area = space.width * space.length;
        space.volume = space.area * space.height;
      }
      
      this.spaces.push(space);
    });

    // Extract walls
    const wallLines = lines.filter(l => l.includes('IFCWALL'));
    wallLines.forEach((line, index) => {
      // Simplified wall parsing
      const wall: IFCWall = {
        id: `wall-${index}`,
        startX: 0,
        startY: 0,
        endX: 10,
        endY: 0,
        height: 3,
        thickness: 0.2
      };
      this.walls.push(wall);
    });

    // Extract lighting devices
    const lightLines = lines.filter(l => 
      l.includes('IFCLIGHTFIXTURE') || 
      l.includes('IFCFLOWFITTING') && l.includes('LIGHT')
    );
    
    lightLines.forEach((line, index) => {
      const device: IFCLightingDevice = {
        id: `light-${index}`,
        name: 'Imported Light',
        x: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
        y: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
        z: 2.5,
        type: 'LED'
      };
      this.lightingDevices.push(device);
    });

    return this.convertToDesignerFormat(metadata);
  }

  private parseGBXML(): BIMImportResult {
    // Parse gbXML format
    const parser = new DOMParser();
    const xml = parser.parseFromString(this.fileContent, 'text/xml');
    
    const metadata: any = {};
    
    // Extract building info
    const building = xml.querySelector('Building');
    if (building) {
      metadata.projectName = building.getAttribute('id') || 'Imported Building';
    }

    // Extract spaces
    const spaces = xml.querySelectorAll('Space');
    spaces.forEach(space => {
      const area = space.querySelector('Area');
      const volume = space.querySelector('Volume');
      
      const spaceObj: IFCSpace = {
        name: space.getAttribute('id') || 'Space',
        width: 10,
        length: 10,
        height: 3,
        area: area ? parseFloat(area.textContent || '100') : 100,
        volume: volume ? parseFloat(volume.textContent || '300') : 300
      };
      
      // Calculate dimensions from area and volume
      if (spaceObj.area > 0 && spaceObj.volume > 0) {
        spaceObj.height = spaceObj.volume / spaceObj.area;
        // Assume square room for simplicity
        spaceObj.width = Math.sqrt(spaceObj.area);
        spaceObj.length = spaceObj.width;
      }
      
      this.spaces.push(spaceObj);
    });

    // Extract surfaces (walls)
    const surfaces = xml.querySelectorAll('Surface[surfaceType="ExteriorWall"], Surface[surfaceType="InteriorWall"]');
    surfaces.forEach((surface, index) => {
      const vertices = surface.querySelectorAll('CartesianPoint');
      if (vertices.length >= 2) {
        const start = vertices[0].querySelectorAll('Coordinate');
        const end = vertices[1].querySelectorAll('Coordinate');
        
        const wall: IFCWall = {
          id: surface.getAttribute('id') || `wall-${index}`,
          startX: start[0] ? parseFloat(start[0].textContent || '0') : 0,
          startY: start[1] ? parseFloat(start[1].textContent || '0') : 0,
          endX: end[0] ? parseFloat(end[0].textContent || '0') : 10,
          endY: end[1] ? parseFloat(end[1].textContent || '0') : 0,
          height: 3,
          thickness: 0.2
        };
        this.walls.push(wall);
      }
    });

    return this.convertToDesignerFormat(metadata);
  }

  private parseJSON(): BIMImportResult {
    // Parse custom JSON format
    try {
      const data = JSON.parse(this.fileContent);
      
      const metadata = data.metadata || {};
      
      if (data.spaces) {
        this.spaces = data.spaces.map((s: any) => ({
          name: s.name || 'Space',
          width: s.width || 10,
          length: s.length || 10,
          height: s.height || 3,
          area: s.area || (s.width * s.length),
          volume: s.volume || (s.width * s.length * s.height)
        }));
      }

      if (data.walls) {
        this.walls = data.walls.map((w: any, index: number) => ({
          id: w.id || `wall-${index}`,
          startX: w.startX || 0,
          startY: w.startY || 0,
          endX: w.endX || 10,
          endY: w.endY || 0,
          height: w.height || 3,
          thickness: w.thickness || 0.2
        }));
      }

      if (data.lighting) {
        this.lightingDevices = data.lighting.map((l: any, index: number) => ({
          id: l.id || `light-${index}`,
          name: l.name || 'Light',
          x: l.x || 0,
          y: l.y || 0,
          z: l.z || 2.5,
          type: l.type || 'LED',
          power: l.power,
          lumens: l.lumens
        }));
      }

      return this.convertToDesignerFormat(metadata);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  private convertToDesignerFormat(metadata: any): BIMImportResult {
    // Use the first space as the main room
    const mainSpace = this.spaces[0] || {
      width: 10,
      length: 10,
      height: 3,
      area: 100,
      volume: 300
    };

    // Convert walls to designer format
    const designerWalls: Wall[] = this.walls.map(wall => ({
      id: wall.id,
      type: 'wall' as const,
      x: (wall.startX + wall.endX) / 2,
      y: (wall.startY + wall.endY) / 2,
      z: wall.height / 2,
      width: Math.sqrt(
        Math.pow(wall.endX - wall.startX, 2) + 
        Math.pow(wall.endY - wall.startY, 2)
      ),
      length: wall.thickness,
      height: wall.height,
      rotation: Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX),
      enabled: true,
      wallType: 'exterior' as const,
      material: 'concrete',
      thickness: wall.thickness
    }));

    // Convert lighting devices to fixtures
    const fixtures: Fixture[] = this.lightingDevices.map(device => ({
      id: device.id,
      type: 'fixture' as const,
      x: device.x,
      y: device.y,
      z: device.z,
      rotation: 0,
      width: 2,
      length: 4,
      height: 0.5,
      enabled: true,
      model: {
        name: device.name,
        wattage: device.power || 100,
        ppf: device.lumens ? device.lumens / 5 : 300, // Rough conversion
        beamAngle: 120,
        manufacturer: 'Imported',
        efficacy: 2.5,
        spectrum: 'Unknown'
      }
    }));

    // Create room object
    const room: Partial<Room> = {
      width: mainSpace.width,
      length: mainSpace.length,
      height: mainSpace.height,
      ceilingHeight: mainSpace.height,
      workingHeight: mainSpace.height - 2
    };

    return {
      room,
      walls: designerWalls,
      fixtures,
      objects: [...designerWalls, ...fixtures],
      metadata: {
        ...metadata,
        units: 'meters'
      }
    };
  }

  // Export current design to IFC format
  static exportToIFC(room: Room, objects: RoomObject[]): string {
    const timestamp = new Date().toISOString();
    const fixtures = objects.filter(obj => obj.type === 'fixture');
    const walls = objects.filter(obj => obj.type === 'wall');

    let ifc = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');
FILE_NAME('VibeLux_Export.ifc','${timestamp}',('VibeLux'),('VibeLux Designer'),'IFC2X3','VibeLux','');
FILE_SCHEMA(('IFC2X3'));
ENDSEC;
DATA;
#1=IFCPROJECT('0xScRe4drECQ4DMSqUjd6Q',#2,'VibeLux Project',$,$,$,$,(#3),#4);
#2=IFCOWNERHISTORY(#5,#6,$,.ADDED.,$,$,$,0);
#3=IFCGEOMETRICREPRESENTATIONCONTEXT('Model','Model',3,$,$);
#4=IFCUNITASSIGNMENT((#7,#8,#9));
#5=IFCORGANIZATION($,'VibeLux',$,$,$);
#6=IFCAPPLICATION(#5,'1.0','VibeLux Designer','VibeLux');
#7=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);
#8=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);
#9=IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.);
`;

    // Add building and space
    ifc += `#10=IFCBUILDING('1xScRe4drECQ4DMSqUjd6Q',#2,'Building',$,$,$,$,$,$,$,$,$);
#11=IFCSPACE('2xScRe4drECQ4DMSqUjd6Q',#2,'Space',$,$,$,$,$,.ELEMENT.,.INTERNAL.,$);
`;

    // Add fixtures
    fixtures.forEach((fixture, index) => {
      const id = 100 + index;
      const fixtureData = fixture as Fixture;
      ifc += `#${id}=IFCLIGHTFIXTURE('${fixtureData.id}',#2,'${fixtureData.model?.name || 'Light'}',$,$,$,$,$);
`;
    });

    // Add walls
    walls.forEach((wall, index) => {
      const id = 200 + index;
      ifc += `#${id}=IFCWALL('${wall.id}',#2,'Wall',$,$,$,$,$);
`;
    });

    ifc += `ENDSEC;
END-ISO-10303-21;`;

    return ifc;
  }

  // Export to gbXML format
  static exportToGBXML(room: Room, objects: RoomObject[]): string {
    const fixtures = objects.filter(obj => obj.type === 'fixture');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<gbXML xmlns="http://www.gbxml.org/schema" version="0.37">
  <Campus id="campus-1">
    <Building id="building-1" buildingType="Office">
      <Space id="space-1">
        <Name>Design Space</Name>
        <Area unit="SquareFeet">${(room.width * room.length).toFixed(2)}</Area>
        <Volume unit="CubicFeet">${(room.width * room.length * room.height).toFixed(2)}</Volume>
        <LightSchedule>12</LightSchedule>
        ${fixtures.map(fixture => `
        <LightingSystem id="${fixture.id}">
          <Name>${(fixture as Fixture).model?.name || 'Light'}</Name>
          <InstalledPower unit="Watts">${(fixture as Fixture).model?.wattage || 0}</InstalledPower>
        </LightingSystem>`).join('')}
      </Space>
    </Building>
  </Campus>
</gbXML>`;
  }
}

export const bimImporter = new BIMImporter();