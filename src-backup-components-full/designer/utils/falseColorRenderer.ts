export interface ColorScale {
  name: string;
  colors: { value: number; color: string }[];
}

export const PPFD_COLOR_SCALES: Record<string, ColorScale> = {
  viridis: {
    name: 'Viridis',
    colors: [
      { value: 0, color: '#440154' },
      { value: 200, color: '#414487' },
      { value: 400, color: '#2a788e' },
      { value: 600, color: '#22a884' },
      { value: 800, color: '#7ad151' },
      { value: 1000, color: '#fde725' }
    ]
  },
  plasma: {
    name: 'Plasma',
    colors: [
      { value: 0, color: '#0d0887' },
      { value: 200, color: '#5a01a5' },
      { value: 400, color: '#9c179e' },
      { value: 600, color: '#cd4071' },
      { value: 800, color: '#ed7953' },
      { value: 1000, color: '#f0f921' }
    ]
  },
  thermal: {
    name: 'Thermal',
    colors: [
      { value: 0, color: '#000080' },
      { value: 200, color: '#0000ff' },
      { value: 400, color: '#00ffff' },
      { value: 600, color: '#00ff00' },
      { value: 800, color: '#ffff00' },
      { value: 1000, color: '#ff0000' }
    ]
  },
  grayscale: {
    name: 'Grayscale',
    colors: [
      { value: 0, color: '#000000' },
      { value: 1000, color: '#ffffff' }
    ]
  }
};

export function interpolateColor(value: number, scale: ColorScale): string {
  const { colors } = scale;
  
  // Find the two colors to interpolate between
  let lowerIndex = 0;
  let upperIndex = colors.length - 1;
  
  for (let i = 0; i < colors.length - 1; i++) {
    if (value >= colors[i].value && value <= colors[i + 1].value) {
      lowerIndex = i;
      upperIndex = i + 1;
      break;
    }
  }
  
  const lower = colors[lowerIndex];
  const upper = colors[upperIndex];
  
  // Calculate interpolation factor
  const range = upper.value - lower.value;
  const factor = range > 0 ? (value - lower.value) / range : 0;
  
  // Parse colors
  const lowerRGB = hexToRGB(lower.color);
  const upperRGB = hexToRGB(upper.color);
  
  // Interpolate
  const r = Math.round(lowerRGB.r + (upperRGB.r - lowerRGB.r) * factor);
  const g = Math.round(lowerRGB.g + (upperRGB.g - lowerRGB.g) * factor);
  const b = Math.round(lowerRGB.b + (upperRGB.b - lowerRGB.b) * factor);
  
  return `rgb(${r}, ${g}, ${b})`;
}

export function drawFalseColorLegend(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  scale: ColorScale,
  min: number = 0,
  max: number = 1000
) {
  // Ensure we have valid min/max values
  if (min === max) {
    // If min and max are the same, use the scale's range
    const scaleValues = scale.colors.map(c => c.value);
    min = Math.min(...scaleValues);
    max = Math.max(...scaleValues);
  }
  // Draw gradient
  const gradient = ctx.createLinearGradient(x, y, x, y + height);
  
  // Add color stops
  const range = max - min;
  
  // Handle edge case where all values are the same
  if (range === 0) {
    gradient.addColorStop(0, scale.colors[0].color);
    gradient.addColorStop(1, scale.colors[0].color);
  } else {
    scale.colors.forEach(({ value, color }) => {
      const normalizedValue = (value - min) / range;
      // Clamp the normalized value to ensure it's within [0, 1]
      const clampedValue = Math.max(0, Math.min(1, normalizedValue));
      gradient.addColorStop(1 - clampedValue, color);
    });
  }
  
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);
  
  // Draw border
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);
  
  // Draw labels
  ctx.fillStyle = '#fff';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  
  // Draw value labels
  const labelCount = 5;
  for (let i = 0; i <= labelCount; i++) {
    const value = min + (max - min) * (i / labelCount);
    const yPos = y + height - (height * i / labelCount);
    
    ctx.fillText(value.toFixed(0), x - 5, yPos + 4);
    
    // Draw tick
    ctx.beginPath();
    ctx.moveTo(x - 3, yPos);
    ctx.lineTo(x, yPos);
    ctx.stroke();
  }
  
  // Draw title
  ctx.save();
  ctx.translate(x + width + 30, y + height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('PPFD (μmol/m²/s)', 0, 0);
  ctx.restore();
}

export function renderPPFDGrid(
  ctx: CanvasRenderingContext2D,
  grid: number[][],
  x: number,
  y: number,
  width: number,
  height: number,
  scale: ColorScale,
  opacity: number = 0.7
) {
  if (!grid || grid.length === 0) return;
  
  const cellWidth = width / grid[0].length;
  const cellHeight = height / grid.length;
  
  ctx.save();
  ctx.globalAlpha = opacity;
  
  grid.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      const color = interpolateColor(value, scale);
      ctx.fillStyle = color;
      ctx.fillRect(
        x + colIndex * cellWidth,
        y + rowIndex * cellHeight,
        cellWidth,
        cellHeight
      );
    });
  });
  
  ctx.restore();
}

function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}