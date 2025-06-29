export interface ColorScale {
  name: string;
  description: string;
  type: 'illuminance' | 'ppfd' | 'uniformity' | 'dli';
  unit: string;
  ranges: {
    min: number;
    max: number;
    color: { r: number; g: number; b: number };
    label: string;
  }[];
}

export const STANDARD_COLOR_SCALES: Record<string, ColorScale> = {
  illuminance_commercial: {
    name: 'Commercial Illuminance',
    description: 'Standard illuminance levels for commercial spaces',
    type: 'illuminance',
    unit: 'lux',
    ranges: [
      { min: 0, max: 50, color: { r: 0, g: 0, b: 139 }, label: 'Very Dark' },
      { min: 50, max: 100, color: { r: 0, g: 0, b: 255 }, label: 'Dark' },
      { min: 100, max: 200, color: { r: 0, g: 128, b: 255 }, label: 'Dim' },
      { min: 200, max: 300, color: { r: 0, g: 255, b: 255 }, label: 'Low' },
      { min: 300, max: 500, color: { r: 0, g: 255, b: 0 }, label: 'Standard' },
      { min: 500, max: 750, color: { r: 255, g: 255, b: 0 }, label: 'Bright' },
      { min: 750, max: 1000, color: { r: 255, g: 128, b: 0 }, label: 'Very Bright' },
      { min: 1000, max: 2000, color: { r: 255, g: 0, b: 0 }, label: 'Intense' },
      { min: 2000, max: Infinity, color: { r: 255, g: 255, b: 255 }, label: 'Extreme' }
    ]
  },
  ppfd_horticulture: {
    name: 'Horticulture PPFD',
    description: 'PPFD levels for plant growth',
    type: 'ppfd',
    unit: 'μmol/m²/s',
    ranges: [
      { min: 0, max: 50, color: { r: 0, g: 0, b: 139 }, label: 'Insufficient' },
      { min: 50, max: 100, color: { r: 0, g: 0, b: 255 }, label: 'Low Light' },
      { min: 100, max: 200, color: { r: 0, g: 128, b: 255 }, label: 'Seedling' },
      { min: 200, max: 400, color: { r: 0, g: 255, b: 255 }, label: 'Vegetative Low' },
      { min: 400, max: 600, color: { r: 0, g: 255, b: 0 }, label: 'Vegetative' },
      { min: 600, max: 800, color: { r: 128, g: 255, b: 0 }, label: 'Vegetative High' },
      { min: 800, max: 1000, color: { r: 255, g: 255, b: 0 }, label: 'Flowering' },
      { min: 1000, max: 1200, color: { r: 255, g: 128, b: 0 }, label: 'High Light' },
      { min: 1200, max: 1500, color: { r: 255, g: 0, b: 0 }, label: 'Very High' },
      { min: 1500, max: Infinity, color: { r: 255, g: 255, b: 255 }, label: 'Extreme' }
    ]
  },
  uniformity_ratio: {
    name: 'Uniformity Ratio',
    description: 'Min/Avg uniformity ratio',
    type: 'uniformity',
    unit: 'ratio',
    ranges: [
      { min: 0, max: 0.1, color: { r: 255, g: 0, b: 0 }, label: 'Poor' },
      { min: 0.1, max: 0.3, color: { r: 255, g: 128, b: 0 }, label: 'Fair' },
      { min: 0.3, max: 0.5, color: { r: 255, g: 255, b: 0 }, label: 'Good' },
      { min: 0.5, max: 0.7, color: { r: 128, g: 255, b: 0 }, label: 'Very Good' },
      { min: 0.7, max: 0.9, color: { r: 0, g: 255, b: 0 }, label: 'Excellent' },
      { min: 0.9, max: 1, color: { r: 0, g: 128, b: 255 }, label: 'Perfect' }
    ]
  },
  dli_cannabis: {
    name: 'Cannabis DLI',
    description: 'Daily Light Integral for cannabis cultivation',
    type: 'dli',
    unit: 'mol/m²/day',
    ranges: [
      { min: 0, max: 10, color: { r: 0, g: 0, b: 139 }, label: 'Too Low' },
      { min: 10, max: 20, color: { r: 0, g: 0, b: 255 }, label: 'Seedling' },
      { min: 20, max: 30, color: { r: 0, g: 255, b: 255 }, label: 'Early Veg' },
      { min: 30, max: 40, color: { r: 0, g: 255, b: 0 }, label: 'Vegetative' },
      { min: 40, max: 50, color: { r: 255, g: 255, b: 0 }, label: 'Flowering' },
      { min: 50, max: 60, color: { r: 255, g: 128, b: 0 }, label: 'High Light' },
      { min: 60, max: Infinity, color: { r: 255, g: 0, b: 0 }, label: 'Excessive' }
    ]
  }
};

export class FalseColorRenderer {
  private colorScale: ColorScale;
  
  constructor(colorScale: ColorScale) {
    this.colorScale = colorScale;
  }
  
  getColorForValue(value: number): { r: number; g: number; b: number; a: number } {
    // Find the appropriate range
    for (const range of this.colorScale.ranges) {
      if (value >= range.min && value < range.max) {
        return { ...range.color, a: 1 };
      }
    }
    
    // Default to last color if value exceeds all ranges
    const lastRange = this.colorScale.ranges[this.colorScale.ranges.length - 1];
    return { ...lastRange.color, a: 1 };
  }
  
  getInterpolatedColor(value: number): { r: number; g: number; b: number; a: number } {
    // Smooth interpolation between color ranges
    let lowerRange = this.colorScale.ranges[0];
    let upperRange = this.colorScale.ranges[0];
    
    for (let i = 0; i < this.colorScale.ranges.length - 1; i++) {
      const current = this.colorScale.ranges[i];
      const next = this.colorScale.ranges[i + 1];
      
      if (value >= current.min && value < next.max) {
        lowerRange = current;
        upperRange = next;
        break;
      }
    }
    
    if (lowerRange === upperRange) {
      return { ...lowerRange.color, a: 1 };
    }
    
    // Interpolate between colors
    const t = (value - lowerRange.max) / (upperRange.min - lowerRange.max);
    const clampedT = Math.max(0, Math.min(1, t));
    
    return {
      r: Math.round(lowerRange.color.r + (upperRange.color.r - lowerRange.color.r) * clampedT),
      g: Math.round(lowerRange.color.g + (upperRange.color.g - lowerRange.color.g) * clampedT),
      b: Math.round(lowerRange.color.b + (upperRange.color.b - lowerRange.color.b) * clampedT),
      a: 1
    };
  }
  
  renderToCanvas(
    canvas: HTMLCanvasElement,
    values: { x: number; y: number; value: number }[],
    bounds: { minX: number; maxX: number; minY: number; maxY: number },
    pixelsPerMeter: number = 20
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Create image data
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    // Render each value point
    values.forEach(point => {
      const color = this.getInterpolatedColor(point.value);
      const pixelX = Math.floor((point.x - bounds.minX) * pixelsPerMeter);
      const pixelY = Math.floor((point.y - bounds.minY) * pixelsPerMeter);
      
      // Fill a small area around the point
      const radius = Math.ceil(pixelsPerMeter / 4);
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const x = pixelX + dx;
          const y = pixelY + dy;
          
          if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
            const index = (y * canvas.width + x) * 4;
            data[index] = color.r;
            data[index + 1] = color.g;
            data[index + 2] = color.b;
            data[index + 3] = color.a * 255;
          }
        }
      }
    });
    
    // Apply gaussian blur for smooth visualization
    this.applyGaussianBlur(imageData);
    
    ctx.putImageData(imageData, 0, 0);
  }
  
  renderLegend(canvas: HTMLCanvasElement, vertical: boolean = true) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const margin = 10;
    const labelWidth = 100;
    
    if (vertical) {
      const barWidth = 30;
      const barHeight = canvas.height - 2 * margin;
      const barX = margin;
      const barY = margin;
      
      // Draw gradient bar
      const gradient = ctx.createLinearGradient(0, barY + barHeight, 0, barY);
      
      // Add color stops
      this.colorScale.ranges.forEach((range, i) => {
        const position = i / (this.colorScale.ranges.length - 1);
        const color = range.color;
        gradient.addColorStop(position, `rgb(${color.r}, ${color.g}, ${color.b})`);
      });
      
      ctx.fillStyle = gradient;
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Draw labels
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.font = '12px sans-serif';
      
      this.colorScale.ranges.forEach((range, i) => {
        const y = barY + barHeight - (i / (this.colorScale.ranges.length - 1)) * barHeight;
        
        // Tick mark
        ctx.beginPath();
        ctx.moveTo(barX + barWidth, y);
        ctx.lineTo(barX + barWidth + 5, y);
        ctx.stroke();
        
        // Label
        const label = `${range.min}${range.max === Infinity ? '+' : `-${range.max}`} ${this.colorScale.unit}`;
        ctx.strokeText(label, barX + barWidth + 10, y + 4);
        ctx.fillText(label, barX + barWidth + 10, y + 4);
      });
      
      // Title
      ctx.font = '14px sans-serif';
      ctx.strokeText(this.colorScale.name, barX, barY - 5);
      ctx.fillText(this.colorScale.name, barX, barY - 5);
    }
  }
  
  private applyGaussianBlur(imageData: ImageData) {
    // Simple box blur approximation of gaussian
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    
    const radius = 2;
    const kernelSize = radius * 2 + 1;
    const kernelSum = kernelSize * kernelSize;
    
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const index = ((y + ky) * width + (x + kx)) * 4;
            r += data[index];
            g += data[index + 1];
            b += data[index + 2];
            a += data[index + 3];
          }
        }
        
        const index = (y * width + x) * 4;
        output[index] = r / kernelSum;
        output[index + 1] = g / kernelSum;
        output[index + 2] = b / kernelSum;
        output[index + 3] = a / kernelSum;
      }
    }
    
    // Copy back
    for (let i = 0; i < data.length; i++) {
      data[i] = output[i];
    }
  }
}