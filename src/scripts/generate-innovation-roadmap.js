const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create canvas for innovation roadmap
const width = 1600;
const height = 1200;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#0f0f0f';
ctx.fillRect(0, 0, width, height);

// Title
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 32px Arial';
ctx.textAlign = 'center';
ctx.fillText('VibeLux Innovation Roadmap', width / 2, 50);

// Subtitle
ctx.font = '18px Arial';
ctx.fillStyle = '#888888';
ctx.fillText('CEA-Inspired Features for Next-Generation Lighting Design', width / 2, 80);

// Define phases
const phases = [
  {
    name: 'Phase 1: Foundation',
    status: 'Complete',
    color: '#10b981',
    features: [
      'IES File Support',
      'PPFD Calculations', 
      'DLC Database',
      'Canvas Rendering',
      'Basic Planning Tools'
    ]
  },
  {
    name: 'Phase 2: Optimization',
    status: 'In Progress',
    color: '#3b82f6',
    features: [
      'Energy Cost Optimization',
      'Multi-Zone Control',
      'Crop Profiles Library',
      'Uniformity Analysis',
      'Time-based Scheduling'
    ]
  },
  {
    name: 'Phase 3: Intelligence',
    status: 'Planned',
    color: '#8b5cf6',
    features: [
      'AI Fixture Placement',
      'Digital Twin Simulation',
      'Predictive Maintenance',
      'Growth Recipe AI',
      'Performance Analytics'
    ]
  },
  {
    name: 'Phase 4: Ecosystem',
    status: 'Future',
    color: '#ec4899',
    features: [
      'Sensor Integration API',
      'Collaborative Design',
      'Recipe Marketplace',
      'Carbon Calculator',
      'Mobile Apps'
    ]
  }
];

// Draw timeline
const timelineY = 120;
const timelineHeight = 100;
const phaseWidth = 350;
const phaseSpacing = 30;

phases.forEach((phase, index) => {
  const x = 100 + index * (phaseWidth + phaseSpacing);
  const y = timelineY;
  
  // Phase box
  ctx.fillStyle = phase.color + '20';
  ctx.fillRect(x, y, phaseWidth, timelineHeight);
  
  ctx.strokeStyle = phase.color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, phaseWidth, timelineHeight);
  
  // Phase name
  ctx.fillStyle = phase.color;
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(phase.name, x + phaseWidth/2, y + 30);
  
  // Status
  ctx.font = '14px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(phase.status, x + phaseWidth/2, y + 50);
  
  // Progress bar
  const progress = phase.status === 'Complete' ? 100 : 
                  phase.status === 'In Progress' ? 40 : 0;
  const barY = y + 70;
  ctx.fillStyle = '#333333';
  ctx.fillRect(x + 20, barY, phaseWidth - 40, 10);
  ctx.fillStyle = phase.color;
  ctx.fillRect(x + 20, barY, (phaseWidth - 40) * progress / 100, 10);
});

// Draw feature cards
const cardStartY = 260;
const cardHeight = 180;
const cardSpacing = 20;

phases.forEach((phase, phaseIndex) => {
  const x = 100 + phaseIndex * (phaseWidth + phaseSpacing);
  
  phase.features.forEach((feature, featureIndex) => {
    const y = cardStartY + featureIndex * 40;
    
    // Feature card
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y, phaseWidth, 35);
    
    ctx.strokeStyle = phase.color + '40';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, phaseWidth, 35);
    
    // Feature icon
    const iconX = x + 10;
    const iconY = y + 17;
    ctx.fillStyle = phase.color;
    ctx.beginPath();
    ctx.arc(iconX + 5, iconY, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Feature text
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(feature, x + 25, y + 22);
  });
});

// Innovation highlights section
const highlightY = 550;
ctx.fillStyle = '#1a1a1a';
ctx.fillRect(100, highlightY, width - 200, 250);
ctx.strokeStyle = '#444444';
ctx.lineWidth = 2;
ctx.strokeRect(100, highlightY, width - 200, 250);

ctx.fillStyle = '#ffffff';
ctx.font = 'bold 24px Arial';
ctx.textAlign = 'center';
ctx.fillText('Key Innovations from Patent Analysis', width/2, highlightY + 40);

// Innovation items
const innovations = [
  { icon: '🌱', title: 'Dynamic Growth Recipes', desc: 'Time-based lighting adjustments for each growth stage' },
  { icon: '⚡', title: 'Energy Optimization', desc: 'Smart scheduling based on utility rates and DLI targets' },
  { icon: '🤖', title: 'AI-Driven Design', desc: 'Machine learning for optimal fixture placement and uniformity' },
  { icon: '📊', title: 'Digital Twin Simulation', desc: 'Virtual testing environment for lighting strategies' },
  { icon: '🔗', title: 'Open Sensor API', desc: 'Connect any quantum sensor for real-time validation' },
  { icon: '🌍', title: 'Sustainability Metrics', desc: 'Carbon footprint and efficiency tracking' }
];

const innovationCols = 3;
const innovationRows = 2;
const colWidth = (width - 300) / innovationCols;

innovations.forEach((innovation, index) => {
  const col = index % innovationCols;
  const row = Math.floor(index / innovationCols);
  const x = 150 + col * colWidth;
  const y = highlightY + 80 + row * 80;
  
  // Icon
  ctx.font = '24px Arial';
  ctx.fillText(innovation.icon, x, y);
  
  // Title
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText(innovation.title, x + 35, y - 5);
  
  // Description
  ctx.font = '12px Arial';
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText(innovation.desc, x + 35, y + 15);
});

// Technical differentiators
const techY = 850;
ctx.fillStyle = '#0a0a0a';
ctx.fillRect(100, techY, width - 200, 280);

ctx.fillStyle = '#666666';
ctx.font = 'bold 20px Arial';
ctx.textAlign = 'center';
ctx.fillText('Technical Differentiators', width/2, techY + 30);

// Differentiator boxes
const diffBoxes = [
  {
    title: 'Vendor Agnostic',
    desc: 'Works with any manufacturer',
    color: '#10b981'
  },
  {
    title: 'Open Architecture', 
    desc: 'Extensible plugin system',
    color: '#3b82f6'
  },
  {
    title: 'Community Driven',
    desc: 'Shared knowledge base',
    color: '#8b5cf6'
  },
  {
    title: 'Scientific Foundation',
    desc: 'Research-backed algorithms',
    color: '#ec4899'
  }
];

const boxWidth = 300;
const boxHeight = 80;
diffBoxes.forEach((box, index) => {
  const x = 200 + (index % 2) * 600;
  const y = techY + 70 + Math.floor(index / 2) * 100;
  
  // Box
  ctx.fillStyle = box.color + '10';
  ctx.fillRect(x, y, boxWidth, boxHeight);
  
  ctx.strokeStyle = box.color + '60';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, boxWidth, boxHeight);
  
  // Content
  ctx.fillStyle = box.color;
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(box.title, x + boxWidth/2, y + 30);
  
  ctx.fillStyle = '#cccccc';
  ctx.font = '14px Arial';
  ctx.fillText(box.desc, x + boxWidth/2, y + 55);
});

// Footer
ctx.fillStyle = '#444444';
ctx.font = '12px Arial';
ctx.textAlign = 'center';
ctx.fillText('VibeLux - Professional Lighting Design for Controlled Environment Agriculture', width/2, height - 20);

// Save to Downloads folder
const outputPath = path.join(process.env.HOME, 'Downloads', 'VibeLux_Innovation_Roadmap.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outputPath, buffer);

console.log(`Innovation roadmap saved to: ${outputPath}`);