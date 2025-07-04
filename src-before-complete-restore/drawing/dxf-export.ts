import { RoomObject, Fixture } from '@/components/designer/context/types';

// DXF file generator for AutoCAD compatibility
export class DXFExporter {
  private entities: string[] = [];
  private layers: Map<string, { color: number; lineType: string }> = new Map();

  constructor() {
    // Define standard layers
    this.addLayer('0', 7, 'CONTINUOUS'); // Default
    this.addLayer('WALLS', 7, 'CONTINUOUS');
    this.addLayer('FIXTURES', 2, 'CONTINUOUS');
    this.addLayer('ELECTRICAL', 5, 'DASHED');
    this.addLayer('DIMENSIONS', 3, 'CONTINUOUS');
    this.addLayer('TEXT', 7, 'CONTINUOUS');
    this.addLayer('GRID', 8, 'CONTINUOUS');
    this.addLayer('EQUIPMENT', 4, 'CONTINUOUS');
  }

  private addLayer(name: string, color: number, lineType: string) {
    this.layers.set(name, { color, lineType });
  }

  // Add a line entity
  public addLine(x1: number, y1: number, x2: number, y2: number, layer: string = '0') {
    this.entities.push(`0
LINE
8
${layer}
10
${x1.toFixed(6)}
20
${y1.toFixed(6)}
30
0.0
11
${x2.toFixed(6)}
21
${y2.toFixed(6)}
31
0.0`);
  }

  // Add a rectangle
  public addRectangle(x: number, y: number, width: number, height: number, rotation: number = 0, layer: string = '0') {
    const corners = [
      { x: -width / 2, y: -height / 2 },
      { x: width / 2, y: -height / 2 },
      { x: width / 2, y: height / 2 },
      { x: -width / 2, y: height / 2 }
    ];

    // Apply rotation
    const rad = rotation * Math.PI / 180;
    const rotatedCorners = corners.map(corner => ({
      x: corner.x * Math.cos(rad) - corner.y * Math.sin(rad) + x,
      y: corner.x * Math.sin(rad) + corner.y * Math.cos(rad) + y
    }));

    // Draw lines
    for (let i = 0; i < 4; i++) {
      const next = (i + 1) % 4;
      this.addLine(
        rotatedCorners[i].x,
        rotatedCorners[i].y,
        rotatedCorners[next].x,
        rotatedCorners[next].y,
        layer
      );
    }
  }

  // Add a circle
  public addCircle(x: number, y: number, radius: number, layer: string = '0') {
    this.entities.push(`0
CIRCLE
8
${layer}
10
${x.toFixed(6)}
20
${y.toFixed(6)}
30
0.0
40
${radius.toFixed(6)}`);
  }

  // Add text
  public addText(x: number, y: number, height: number, text: string, layer: string = 'TEXT') {
    this.entities.push(`0
TEXT
8
${layer}
10
${x.toFixed(6)}
20
${y.toFixed(6)}
30
0.0
40
${height.toFixed(6)}
1
${text}
72
1
73
2`);
  }

  // Add dimension
  public addAlignedDimension(x1: number, y1: number, x2: number, y2: number, offset: number = 2) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const perpAngle = angle + Math.PI / 2;
    const offsetX = Math.cos(perpAngle) * offset;
    const offsetY = Math.sin(perpAngle) * offset;

    this.entities.push(`0
DIMENSION
8
DIMENSIONS
10
${(x1 + offsetX).toFixed(6)}
20
${(y1 + offsetY).toFixed(6)}
30
0.0
11
${((x1 + x2) / 2 + offsetX).toFixed(6)}
21
${((y1 + y2) / 2 + offsetY).toFixed(6)}
31
0.0
13
${x1.toFixed(6)}
23
${y1.toFixed(6)}
33
0.0
14
${x2.toFixed(6)}
24
${y2.toFixed(6)}
34
0.0
70
33
1
 
42
${Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2).toFixed(6)}`);
  }

  // Add a polyline (for complex shapes)
  public addPolyline(points: { x: number; y: number }[], closed: boolean = false, layer: string = '0') {
    if (points.length < 2) return;

    let polyline = `0
LWPOLYLINE
8
${layer}
90
${points.length}
70
${closed ? 1 : 0}`;

    points.forEach(point => {
      polyline += `
10
${point.x.toFixed(6)}
20
${point.y.toFixed(6)}`;
    });

    this.entities.push(polyline);
  }

  // Add block definition (for repeated elements like fixtures)
  public addBlockDefinition(name: string, entities: string[]) {
    // Block definitions would go in BLOCKS section
    // This is simplified for this example
  }

  // Insert block reference
  public addBlockInsert(name: string, x: number, y: number, rotation: number = 0, scale: number = 1) {
    this.entities.push(`0
INSERT
8
0
2
${name}
10
${x.toFixed(6)}
20
${y.toFixed(6)}
30
0.0
41
${scale.toFixed(6)}
42
${scale.toFixed(6)}
43
${scale.toFixed(6)}
50
${rotation.toFixed(6)}`);
  }

  // Export room and fixtures
  public exportDesign(room: any, objects: RoomObject[]) {
    // Room outline
    this.addRectangle(room.width / 2, room.length / 2, room.width, room.length, 0, 'WALLS');

    // Grid lines every 5 feet
    for (let x = 0; x <= room.width; x += 5) {
      this.addLine(x, 0, x, room.length, 'GRID');
    }
    for (let y = 0; y <= room.length; y += 5) {
      this.addLine(0, y, room.width, y, 'GRID');
    }

    // Add fixtures
    objects.forEach((obj, index) => {
      if (obj.type === 'fixture') {
        const fixture = obj as Fixture;
        
        // Fixture outline
        this.addRectangle(fixture.x, fixture.y, fixture.width, fixture.length, fixture.rotation, 'FIXTURES');
        
        // Fixture ID
        this.addText(fixture.x, fixture.y + fixture.length / 2 + 1, 0.5, `F${index + 1}`, 'TEXT');
        
        // Add electrical connection point
        this.addCircle(fixture.x, fixture.y, 0.25, 'ELECTRICAL');
      } else if (obj.type === 'equipment') {
        this.addRectangle(obj.x, obj.y, obj.width, obj.length, obj.rotation, 'EQUIPMENT');
      } else if (obj.type === 'unistrut' && (obj as any).subType === 'run') {
        const unistrut = obj as any;
        if (unistrut.unistrut?.runData) {
          const run = unistrut.unistrut.runData;
          this.addLine(run.startX, run.startY, run.endX, run.endY, 'FIXTURES');
        }
      }
    });

    // Add dimensions
    this.addAlignedDimension(0, 0, room.width, 0, -2);
    this.addAlignedDimension(0, 0, 0, room.length, -2);

    // Add north arrow
    this.addNorthArrow(room.width - 5, room.length - 5);

    // Add title block elements
    this.addTitleBlock(room.width, room.length);
  }

  private addNorthArrow(x: number, y: number) {
    // Circle
    this.addCircle(x, y, 1, '0');
    
    // Arrow (simplified as lines)
    this.addLine(x, y - 1, x - 0.5, y + 0.5, '0');
    this.addLine(x, y - 1, x + 0.5, y + 0.5, '0');
    this.addLine(x - 0.5, y + 0.5, x, y, '0');
    this.addLine(x + 0.5, y + 0.5, x, y, '0');
    
    // N text
    this.addText(x, y - 2, 0.5, 'N', 'TEXT');
  }

  private addTitleBlock(width: number, height: number) {
    const blockX = width - 20;
    const blockY = -10;
    const blockWidth = 18;
    const blockHeight = 8;

    // Title block border
    this.addRectangle(blockX + blockWidth / 2, blockY + blockHeight / 2, blockWidth, blockHeight, 0, '0');
    
    // Dividing lines
    this.addLine(blockX, blockY + 2, blockX + blockWidth, blockY + 2, '0');
    this.addLine(blockX + 12, blockY, blockX + 12, blockY + blockHeight, '0');
  }

  // Generate the complete DXF file
  public generate(): string {
    let dxf = this.generateHeader();
    dxf += this.generateTables();
    dxf += this.generateBlocks();
    dxf += this.generateEntities();
    dxf += this.generateFooter();
    
    return dxf;
  }

  private generateHeader(): string {
    return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1024
9
$MEASUREMENT
70
0
9
$INSUNITS
70
1
0
ENDSEC
`;
  }

  private generateTables(): string {
    let tables = `0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
${this.layers.size}
`;

    this.layers.forEach((props, name) => {
      tables += `0
LAYER
2
${name}
70
0
62
${props.color}
6
${props.lineType}
`;
    });

    tables += `0
ENDTAB
0
ENDSEC
`;

    return tables;
  }

  private generateBlocks(): string {
    return `0
SECTION
2
BLOCKS
0
ENDSEC
`;
  }

  private generateEntities(): string {
    return `0
SECTION
2
ENTITIES
${this.entities.join('\n')}
0
ENDSEC
`;
  }

  private generateFooter(): string {
    return `0
EOF`;
  }
}