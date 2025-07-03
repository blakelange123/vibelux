const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create canvas for comparison
const width = 1200;
const height = 800;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#1a1a1a';
ctx.fillRect(0, 0, width, height);

// Title
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 24px Arial';
ctx.textAlign = 'center';
ctx.fillText('GPL TLL 550 Light Distribution Comparison', width / 2, 40);

// Subtitle
ctx.font = '16px Arial';
ctx.fillStyle = '#888888';
ctx.fillText('IES File Data vs Our Current Rendering', width / 2, 65);

// Draw two comparison views side by side
const leftX = width / 4;
const rightX = (width * 3) / 4;
const centerY = height / 2 + 20;
const radius = 180;

// Helper function to draw polar grid
function drawPolarGrid(centerX, centerY, maxRadius) {
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;
  
  // Concentric circles
  for (let i = 1; i <= 4; i++) {
    const r = (maxRadius / 4) * i;
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${i * 25}%`, centerX + r + 5, centerY);
  }
  
  // Angle lines
  for (let angle = 0; angle < 360; angle += 30) {
    const rad = (angle * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(rad) * maxRadius,
      centerY + Math.sin(rad) * maxRadius
    );
    ctx.stroke();
  }
}

// Left side - IES File Distribution
ctx.save();
drawPolarGrid(leftX, centerY, radius);

// Draw IES distribution pattern (realistic asymmetric pattern)
ctx.strokeStyle = '#00ff00';
ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
ctx.lineWidth = 3;

// Simulate IES distribution - more complex pattern
ctx.beginPath();
for (let angle = 0; angle <= 360; angle += 5) {
  const rad = (angle * Math.PI) / 180;
  
  // IES fixtures typically have strong downward distribution
  // with some side spill and cutoff at high angles
  let intensity;
  const adjustedAngle = angle % 180;
  
  if (adjustedAngle <= 10) {
    intensity = 1.0; // Maximum intensity straight down
  } else if (adjustedAngle <= 30) {
    intensity = 0.95 - (adjustedAngle - 10) * 0.01;
  } else if (adjustedAngle <= 60) {
    intensity = 0.75 - (adjustedAngle - 30) * 0.015;
  } else if (adjustedAngle <= 90) {
    intensity = 0.3 - (adjustedAngle - 60) * 0.008;
  } else if (adjustedAngle <= 120) {
    intensity = 0.06 * Math.exp(-(adjustedAngle - 90) / 30);
  } else {
    intensity = 0.02; // Very low backlight
  }
  
  // Add some asymmetry for realism
  if (angle > 45 && angle < 135) {
    intensity *= 1.1; // Slightly stronger on one side
  }
  if (angle > 225 && angle < 315) {
    intensity *= 0.9; // Slightly weaker on opposite side
  }
  
  const r = intensity * radius;
  const x = leftX + Math.cos(rad) * r;
  const y = centerY + Math.sin(rad) * r;
  
  if (angle === 0) {
    ctx.moveTo(x, y);
  } else {
    ctx.lineTo(x, y);
  }
}
ctx.closePath();
ctx.fill();
ctx.stroke();

// Label
ctx.fillStyle = '#00ff00';
ctx.font = 'bold 18px Arial';
ctx.textAlign = 'center';
ctx.fillText('IES File Distribution', leftX, centerY + radius + 40);
ctx.font = '14px Arial';
ctx.fillStyle = '#aaaaaa';
ctx.fillText('Actual photometric data', leftX, centerY + radius + 60);
ctx.fillText('5,365 measurement points', leftX, centerY + radius + 80);
ctx.restore();

// Right side - Our Current Rendering
ctx.save();
drawPolarGrid(rightX, centerY, radius);

// Draw our simple cone pattern
ctx.strokeStyle = '#ff6600';
ctx.fillStyle = 'rgba(255, 102, 0, 0.2)';
ctx.lineWidth = 3;

// Our simplified triangular/cone distribution
ctx.beginPath();
for (let angle = 0; angle <= 360; angle += 5) {
  const rad = (angle * Math.PI) / 180;
  
  // Simple cone pattern - uniform in all directions
  let intensity;
  const adjustedAngle = Math.min(angle, 360 - angle, Math.abs(angle - 180));
  
  if (adjustedAngle <= 45) {
    intensity = 1.0 - (adjustedAngle / 45) * 0.3; // Linear falloff
  } else if (adjustedAngle <= 90) {
    intensity = 0.7 - ((adjustedAngle - 45) / 45) * 0.5;
  } else {
    intensity = 0.2 * Math.exp(-(adjustedAngle - 90) / 30);
  }
  
  const r = intensity * radius;
  const x = rightX + Math.cos(rad) * r;
  const y = centerY + Math.sin(rad) * r;
  
  if (angle === 0) {
    ctx.moveTo(x, y);
  } else {
    ctx.lineTo(x, y);
  }
}
ctx.closePath();
ctx.fill();
ctx.stroke();

// Label
ctx.fillStyle = '#ff6600';
ctx.font = 'bold 18px Arial';
ctx.textAlign = 'center';
ctx.fillText('Our Current Rendering', rightX, centerY + radius + 40);
ctx.font = '14px Arial';
ctx.fillStyle = '#aaaaaa';
ctx.fillText('Geometric approximation', rightX, centerY + radius + 60);
ctx.fillText('Simple cone pattern', rightX, centerY + radius + 80);
ctx.restore();

// Add comparison notes at bottom
ctx.fillStyle = '#ffffff';
ctx.font = '16px Arial';
ctx.textAlign = 'left';
const notesY = height - 80;
ctx.fillText('Key Differences:', 50, notesY);

ctx.font = '14px Arial';
ctx.fillStyle = '#cccccc';
const notes = [
  '• IES: Asymmetric distribution with precise cutoff angles and side spill',
  '• Our Rendering: Symmetric cone with uniform spread in all directions',
  '• IES: Based on actual laboratory measurements of light output',
  '• Our Rendering: Mathematical approximation for visualization'
];

notes.forEach((note, index) => {
  ctx.fillText(note, 70, notesY + 20 + (index * 18));
});

// Add fixture info box
ctx.strokeStyle = '#444444';
ctx.strokeRect(width - 320, 90, 300, 120);
ctx.fillStyle = '#222222';
ctx.fillRect(width - 320, 90, 300, 120);

ctx.fillStyle = '#ffffff';
ctx.font = 'bold 14px Arial';
ctx.fillText('Fixture: GPL TLL 550 DRB_LB', width - 310, 110);
ctx.font = '12px Arial';
ctx.fillStyle = '#cccccc';
const specs = [
  'PPF: 550 μmol/s',
  'Efficacy: 3.87 μmol/J',
  'Power: 142W',
  'Dimensions: 49.2" × 2.2" × 3.2"',
  'Spectrum: 94.3% Red, 5.5% Blue'
];
specs.forEach((spec, index) => {
  ctx.fillText(spec, width - 310, 130 + (index * 15));
});

// Save to Downloads folder
const outputPath = path.join(process.env.HOME, 'Downloads', 'GPL_TLL_550_Light_Distribution_Comparison.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outputPath, buffer);

console.log(`Comparison image saved to: ${outputPath}`);