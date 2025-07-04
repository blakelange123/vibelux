import { RoomObject, Fixture } from '@/components/designer/context/types';

export interface DrawingConfig {
  scale: number; // e.g., 50 for 1:50
  units: 'imperial' | 'metric';
  lineWeights: {
    border: number;
    wall: number;
    fixture: number;
    dimension: number;
    hidden: number;
    centerline: number;
  };
  layers: {
    walls: boolean;
    fixtures: boolean;
    electrical: boolean;
    dimensions: boolean;
    hvac: boolean;
    text: boolean;
  };
}

export const standardLineWeights = {
  border: 0.7,    // 0.7mm - Border and title block
  wall: 0.5,      // 0.5mm - Walls and major elements
  fixture: 0.35,  // 0.35mm - Equipment and fixtures
  dimension: 0.25, // 0.25mm - Dimension lines
  hidden: 0.25,   // 0.25mm - Hidden lines (dashed)
  centerline: 0.25 // 0.25mm - Center lines (dash-dot)
};

export class DrawingGenerator {
  private ctx: CanvasRenderingContext2D;
  private config: DrawingConfig;
  public scale: number;
  private dpi: number = 300;

  constructor(ctx: CanvasRenderingContext2D, config: DrawingConfig) {
    this.ctx = ctx;
    this.config = config;
    this.scale = this.dpi / config.scale; // pixels per foot
  }

  // Convert real-world coordinates to drawing coordinates
  private toDrawing(value: number): number {
    return value * this.scale;
  }

  // Set line weight in pixels
  private setLineWeight(weight: keyof typeof standardLineWeights) {
    this.ctx.lineWidth = (this.config.lineWeights[weight] / 25.4) * this.dpi; // mm to pixels
  }

  // Draw dimension line with arrows and text
  public drawDimension(
    x1: number, y1: number, 
    x2: number, y2: number,
    offset: number = 2, // feet
    text?: string
  ) {
    const dx1 = this.toDrawing(x1);
    const dy1 = this.toDrawing(y1);
    const dx2 = this.toDrawing(x2);
    const dy2 = this.toDrawing(y2);
    const dOffset = this.toDrawing(offset);

    this.setLineWeight('dimension');
    this.ctx.strokeStyle = 'black';
    this.ctx.fillStyle = 'black';

    // Calculate perpendicular direction
    const angle = Math.atan2(dy2 - dy1, dx2 - dx1);
    const perpAngle = angle + Math.PI / 2;
    const offsetX = Math.cos(perpAngle) * dOffset;
    const offsetY = Math.sin(perpAngle) * dOffset;

    // Extension lines
    this.ctx.beginPath();
    this.ctx.moveTo(dx1, dy1);
    this.ctx.lineTo(dx1 + offsetX, dy1 + offsetY);
    this.ctx.moveTo(dx2, dy2);
    this.ctx.lineTo(dx2 + offsetX, dy2 + offsetY);
    this.ctx.stroke();

    // Dimension line
    const dimX1 = dx1 + offsetX;
    const dimY1 = dy1 + offsetY;
    const dimX2 = dx2 + offsetX;
    const dimY2 = dy2 + offsetY;

    this.ctx.beginPath();
    this.ctx.moveTo(dimX1, dimY1);
    this.ctx.lineTo(dimX2, dimY2);
    this.ctx.stroke();

    // Arrows
    this.drawArrow(dimX1, dimY1, angle + Math.PI);
    this.drawArrow(dimX2, dimY2, angle);

    // Dimension text
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const dimText = text || this.formatDimension(distance);
    
    const midX = (dimX1 + dimX2) / 2;
    const midY = (dimY1 + dimY2) / 2;

    this.ctx.save();
    this.ctx.translate(midX, midY);
    this.ctx.rotate(angle);
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';
    this.ctx.font = `${this.toDrawing(0.125)}px Arial`; // 1/8" text height
    this.ctx.fillText(dimText, 0, -this.toDrawing(0.1));
    this.ctx.restore();
  }

  private drawArrow(x: number, y: number, angle: number) {
    const arrowLength = this.toDrawing(0.2); // 0.2 feet
    const arrowAngle = Math.PI / 6; // 30 degrees

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(
      x + Math.cos(angle + arrowAngle) * arrowLength,
      y + Math.sin(angle + arrowAngle) * arrowLength
    );
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(
      x + Math.cos(angle - arrowAngle) * arrowLength,
      y + Math.sin(angle - arrowAngle) * arrowLength
    );
    this.ctx.stroke();
  }

  private formatDimension(feet: number): string {
    if (this.config.units === 'metric') {
      const meters = feet * 0.3048;
      return `${meters.toFixed(2)}m`;
    } else {
      const wholeFeet = Math.floor(feet);
      const inches = Math.round((feet - wholeFeet) * 12);
      if (inches === 0) {
        return `${wholeFeet}'`;
      } else if (inches === 12) {
        return `${wholeFeet + 1}'`;
      } else {
        return `${wholeFeet}'-${inches}"`;
      }
    }
  }

  // Draw electrical circuit lines
  public drawCircuit(points: { x: number, y: number }[], circuitId: string) {
    this.setLineWeight('hidden');
    this.ctx.strokeStyle = 'blue';
    this.ctx.setLineDash([this.toDrawing(0.5), this.toDrawing(0.25)]); // 6" dash, 3" gap

    this.ctx.beginPath();
    points.forEach((point, i) => {
      const x = this.toDrawing(point.x);
      const y = this.toDrawing(point.y);
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Circuit label
    if (points.length > 1) {
      const midPoint = Math.floor(points.length / 2);
      const x = this.toDrawing(points[midPoint].x);
      const y = this.toDrawing(points[midPoint].y);
      
      this.ctx.fillStyle = 'blue';
      this.ctx.font = `${this.toDrawing(0.1)}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(circuitId, x, y - this.toDrawing(0.2));
    }
  }

  // Draw fixture with proper CAD symbols
  public drawFixtureSymbol(fixture: Fixture, x: number, y: number) {
    const dx = this.toDrawing(x);
    const dy = this.toDrawing(y);
    const width = this.toDrawing(fixture.width);
    const length = this.toDrawing(fixture.length);

    this.ctx.save();
    this.ctx.translate(dx, dy);
    this.ctx.rotate(fixture.rotation * Math.PI / 180);

    this.setLineWeight('fixture');
    this.ctx.strokeStyle = 'black';
    this.ctx.fillStyle = 'white';

    // Fixture rectangle
    this.ctx.fillRect(-width / 2, -length / 2, width, length);
    this.ctx.strokeRect(-width / 2, -length / 2, width, length);

    // Cross lines for LED fixture symbol
    this.ctx.beginPath();
    this.ctx.moveTo(-width / 2, -length / 2);
    this.ctx.lineTo(width / 2, length / 2);
    this.ctx.moveTo(width / 2, -length / 2);
    this.ctx.lineTo(-width / 2, length / 2);
    this.ctx.stroke();

    this.ctx.restore();

    // Fixture tag
    this.ctx.fillStyle = 'black';
    this.ctx.font = `${this.toDrawing(0.125)}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`F${fixture.id}`, dx, dy + length / 2 + this.toDrawing(0.5));
  }

  // Draw standard north arrow
  public drawNorthArrow(x: number, y: number, size: number = 2) {
    const dx = this.toDrawing(x);
    const dy = this.toDrawing(y);
    const dSize = this.toDrawing(size);

    this.setLineWeight('fixture');
    this.ctx.strokeStyle = 'black';
    this.ctx.fillStyle = 'black';

    // Circle
    this.ctx.beginPath();
    this.ctx.arc(dx, dy, dSize / 2, 0, Math.PI * 2);
    this.ctx.stroke();

    // Arrow
    this.ctx.beginPath();
    this.ctx.moveTo(dx, dy - dSize / 2);
    this.ctx.lineTo(dx - dSize / 4, dy + dSize / 4);
    this.ctx.lineTo(dx, dy);
    this.ctx.lineTo(dx + dSize / 4, dy + dSize / 4);
    this.ctx.closePath();
    this.ctx.fill();

    // N label
    this.ctx.font = `bold ${this.toDrawing(0.25)}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('N', dx, dy - dSize / 2 - this.toDrawing(0.5));
  }

  // Draw scale bar
  public drawScaleBar(x: number, y: number) {
    const dx = this.toDrawing(x);
    const dy = this.toDrawing(y);
    
    this.setLineWeight('fixture');
    this.ctx.strokeStyle = 'black';
    this.ctx.fillStyle = 'black';

    // Scale segments (0, 5, 10 feet)
    const segments = [0, 5, 10];
    
    segments.forEach((feet, i) => {
      const segX = dx + this.toDrawing(feet);
      
      // Tick mark
      this.ctx.beginPath();
      this.ctx.moveTo(segX, dy);
      this.ctx.lineTo(segX, dy - this.toDrawing(0.25));
      this.ctx.stroke();

      // Label
      this.ctx.font = `${this.toDrawing(0.125)}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(feet.toString(), segX, dy + this.toDrawing(0.3));
    });

    // Horizontal line
    this.ctx.beginPath();
    this.ctx.moveTo(dx, dy);
    this.ctx.lineTo(dx + this.toDrawing(10), dy);
    this.ctx.stroke();

    // Scale text
    this.ctx.font = `${this.toDrawing(0.15)}px Arial`;
    this.ctx.fillText(`Scale: 1:${this.config.scale}`, dx + this.toDrawing(5), dy + this.toDrawing(0.7));
  }

  // Draw grid reference
  public drawGridReference(width: number, height: number, spacing: number = 10) {
    this.setLineWeight('dimension');
    this.ctx.strokeStyle = '#cccccc';
    this.ctx.fillStyle = 'black';
    this.ctx.font = `${this.toDrawing(0.15)}px Arial`;

    const cols = Math.ceil(width / spacing);
    const rows = Math.ceil(height / spacing);

    // Column references (A, B, C...)
    for (let col = 0; col <= cols; col++) {
      const x = this.toDrawing(col * spacing);
      const letter = String.fromCharCode(65 + col); // A, B, C...
      
      this.ctx.textAlign = 'center';
      this.ctx.fillText(letter, x, this.toDrawing(-1));
      this.ctx.fillText(letter, x, this.toDrawing(height + 1));
    }

    // Row references (1, 2, 3...)
    for (let row = 0; row <= rows; row++) {
      const y = this.toDrawing(row * spacing);
      const number = (row + 1).toString();
      
      this.ctx.textAlign = 'right';
      this.ctx.fillText(number, this.toDrawing(-1), y);
      this.ctx.textAlign = 'left';
      this.ctx.fillText(number, this.toDrawing(width + 1), y);
    }
  }
}