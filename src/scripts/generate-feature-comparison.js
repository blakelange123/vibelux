const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create canvas for feature comparison
const width = 1400;
const height = 1000;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#0a0a0a';
ctx.fillRect(0, 0, width, height);

// Title
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 32px Arial';
ctx.textAlign = 'center';
ctx.fillText('VibeLux vs Industry Comparison', width / 2, 50);

// Subtitle
ctx.font = '18px Arial';
ctx.fillStyle = '#888888';
ctx.fillText('Comprehensive Feature Analysis', width / 2, 80);

// Feature categories and comparisons
const categories = [
  {
    name: 'Lighting Design',
    features: [
      { name: 'IES File Support', vibelux: true, typical: false, premium: 'partial' },
      { name: 'Real-time PPFD', vibelux: true, typical: true, premium: true },
      { name: 'GPU Ray Tracing', vibelux: true, typical: false, premium: false },
      { name: '3D Visualization', vibelux: true, typical: false, premium: true },
      { name: 'Multi-Zone Control', vibelux: true, typical: false, premium: true }
    ]
  },
  {
    name: 'System Integration',
    features: [
      { name: 'HVAC Design', vibelux: true, typical: false, premium: false },
      { name: 'Electrical Planning', vibelux: true, typical: false, premium: 'partial' },
      { name: 'Sensor Integration', vibelux: true, typical: 'partial', premium: true },
      { name: 'Environmental Controls', vibelux: true, typical: false, premium: true },
      { name: 'Building Automation', vibelux: true, typical: false, premium: 'partial' }
    ]
  },
  {
    name: 'Business Tools',
    features: [
      { name: 'ROI Calculator', vibelux: true, typical: 'partial', premium: true },
      { name: 'Energy Optimization', vibelux: true, typical: false, premium: true },
      { name: 'Compliance Checking', vibelux: true, typical: false, premium: 'partial' },
      { name: 'Professional Reports', vibelux: true, typical: 'partial', premium: true },
      { name: 'Collaboration Tools', vibelux: true, typical: false, premium: 'partial' }
    ]
  },
  {
    name: 'Technical Capabilities',
    features: [
      { name: 'Vendor Agnostic', vibelux: true, typical: false, premium: false },
      { name: 'REST API', vibelux: true, typical: false, premium: 'partial' },
      { name: 'Mobile Support', vibelux: true, typical: false, premium: 'partial' },
      { name: 'Offline Mode', vibelux: true, typical: false, premium: false },
      { name: 'Export Formats', vibelux: true, typical: 'partial', premium: true }
    ]
  }
];

// Column headers
const colX = [400, 600, 800, 1000];
const headerY = 120;

ctx.font = 'bold 18px Arial';
ctx.fillStyle = '#ffffff';
ctx.textAlign = 'center';

ctx.fillText('Feature', 250, headerY);
ctx.fillStyle = '#10b981';
ctx.fillText('VibeLux', colX[0], headerY);
ctx.fillStyle = '#ef4444';
ctx.fillText('Typical Tools', colX[1], headerY);
ctx.fillStyle = '#f59e0b';
ctx.fillText('Premium Solutions', colX[2], headerY);

// Draw comparison table
let currentY = headerY + 40;

categories.forEach(category => {
  // Category header
  ctx.fillStyle = '#333333';
  ctx.fillRect(50, currentY, width - 100, 30);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(category.name, 70, currentY + 20);
  
  currentY += 40;
  
  // Features
  category.features.forEach(feature => {
    // Feature name
    ctx.fillStyle = '#cccccc';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(feature.name, 70, currentY + 20);
    
    // VibeLux column
    ctx.textAlign = 'center';
    if (feature.vibelux === true) {
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('✓', colX[0], currentY + 20);
    }
    
    // Typical tools column
    if (feature.typical === true) {
      ctx.fillStyle = '#10b981';
      ctx.fillText('✓', colX[1], currentY + 20);
    } else if (feature.typical === 'partial') {
      ctx.fillStyle = '#f59e0b';
      ctx.font = '14px Arial';
      ctx.fillText('~', colX[1], currentY + 20);
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('✗', colX[1], currentY + 20);
    }
    
    // Premium solutions column
    if (feature.premium === true) {
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('✓', colX[2], currentY + 20);
    } else if (feature.premium === 'partial') {
      ctx.fillStyle = '#f59e0b';
      ctx.font = '14px Arial';
      ctx.fillText('~', colX[2], currentY + 20);
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('✗', colX[2], currentY + 20);
    }
    
    currentY += 30;
  });
  
  currentY += 20;
});

// Key differentiators section
const keyY = currentY + 20;
ctx.fillStyle = '#1a1a1a';
ctx.fillRect(50, keyY, width - 100, 180);
ctx.strokeStyle = '#444444';
ctx.lineWidth = 2;
ctx.strokeRect(50, keyY, width - 100, 180);

ctx.fillStyle = '#ffffff';
ctx.font = 'bold 20px Arial';
ctx.textAlign = 'center';
ctx.fillText('VibeLux Unique Advantages', width/2, keyY + 35);

// Advantage boxes
const advantages = [
  { text: 'Complete CEA Platform', desc: 'Lighting + HVAC + Electrical + Controls', color: '#10b981' },
  { text: 'Open Ecosystem', desc: 'Works with any manufacturer', color: '#3b82f6' },
  { text: 'Professional Grade', desc: 'Engineering-level calculations', color: '#8b5cf6' },
  { text: 'Future Proof', desc: 'API-first architecture', color: '#ec4899' }
];

const boxWidth = 280;
const boxHeight = 60;
advantages.forEach((adv, index) => {
  const x = 100 + (index % 2) * 600;
  const y = keyY + 70 + Math.floor(index / 2) * 80;
  
  // Box
  ctx.fillStyle = adv.color + '20';
  ctx.fillRect(x, y, boxWidth, boxHeight);
  
  ctx.strokeStyle = adv.color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, boxWidth, boxHeight);
  
  // Text
  ctx.fillStyle = adv.color;
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(adv.text, x + 15, y + 25);
  
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '12px Arial';
  ctx.fillText(adv.desc, x + 15, y + 45);
});

// Legend
ctx.font = '12px Arial';
ctx.fillStyle = '#666666';
ctx.textAlign = 'left';
ctx.fillText('✓ Full support   ~ Partial support   ✗ Not available', 50, height - 30);

// Save to Downloads folder
const outputPath = path.join(process.env.HOME, 'Downloads', 'VibeLux_Feature_Comparison.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outputPath, buffer);

console.log(`Feature comparison saved to: ${outputPath}`);