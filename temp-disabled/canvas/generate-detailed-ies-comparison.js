const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create canvas for detailed comparison
const width = 1400;
const height = 900;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#0a0a0a';
ctx.fillRect(0, 0, width, height);

// Header
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 28px Arial';
ctx.textAlign = 'center';
ctx.fillText('VibeLux IES Light Distribution System', width / 2, 50);

// Subtitle
ctx.font = '18px Arial';
ctx.fillStyle = '#a0a0a0';
ctx.fillText('Professional Photometric Analysis with IES File Support', width / 2, 80);

// Draw main comparison panels
const panelY = 120;
const panelHeight = 400;
const panelWidth = 600;
const leftPanelX = 50;
const rightPanelX = width - panelWidth - 50;

// Left Panel - With IES
ctx.fillStyle = '#1a1a1a';
ctx.fillRect(leftPanelX, panelY, panelWidth, panelHeight);
ctx.strokeStyle = '#10b981';
ctx.lineWidth = 2;
ctx.strokeRect(leftPanelX, panelY, panelWidth, panelHeight);

// Right Panel - Without IES
ctx.fillStyle = '#1a1a1a';
ctx.fillRect(rightPanelX, panelY, panelWidth, panelHeight);
ctx.strokeStyle = '#f59e0b';
ctx.lineWidth = 2;
ctx.strokeRect(rightPanelX, panelY, panelWidth, panelHeight);

// Panel Labels
ctx.font = 'bold 20px Arial';
ctx.fillStyle = '#10b981';
ctx.textAlign = 'center';
ctx.fillText('With IES File', leftPanelX + panelWidth/2, panelY - 10);

ctx.fillStyle = '#f59e0b';
ctx.fillText('Without IES (Estimated)', rightPanelX + panelWidth/2, panelY - 10);

// Draw fixture representations
const fixtureY = panelY + 80;
const fixtureWidth = 120;
const fixtureHeight = 30;

// Left fixture with IES
ctx.fillStyle = '#6366f1';
ctx.fillRect(leftPanelX + panelWidth/2 - fixtureWidth/2, fixtureY, fixtureWidth, fixtureHeight);
ctx.strokeStyle = '#818cf8';
ctx.lineWidth = 2;
ctx.strokeRect(leftPanelX + panelWidth/2 - fixtureWidth/2, fixtureY, fixtureWidth, fixtureHeight);

// IES badge
ctx.fillStyle = '#10b981';
ctx.font = 'bold 12px Arial';
ctx.fillText('IES', leftPanelX + panelWidth/2 + fixtureWidth/2 - 20, fixtureY + 15);

// Right fixture without IES
ctx.fillStyle = '#6366f1';
ctx.fillRect(rightPanelX + panelWidth/2 - fixtureWidth/2, fixtureY, fixtureWidth, fixtureHeight);
ctx.strokeStyle = '#818cf8';
ctx.lineWidth = 2;
ctx.strokeRect(rightPanelX + panelWidth/2 - fixtureWidth/2, fixtureY, fixtureWidth, fixtureHeight);

// Draw light distributions
const lightY = fixtureY + fixtureHeight;

// IES-based distribution (left)
const gradient1 = ctx.createRadialGradient(
  leftPanelX + panelWidth/2, lightY, 0,
  leftPanelX + panelWidth/2, lightY, 200
);
gradient1.addColorStop(0, 'rgba(255, 255, 100, 0.4)');
gradient1.addColorStop(0.3, 'rgba(255, 255, 100, 0.25)');
gradient1.addColorStop(0.6, 'rgba(255, 255, 100, 0.1)');
gradient1.addColorStop(1, 'rgba(255, 255, 100, 0)');

ctx.fillStyle = gradient1;
ctx.beginPath();
// Main beam (narrower, based on actual beam angle)
ctx.moveTo(leftPanelX + panelWidth/2, lightY);
ctx.lineTo(leftPanelX + panelWidth/2 - 150, lightY + 250);
ctx.lineTo(leftPanelX + panelWidth/2 + 150, lightY + 250);
ctx.closePath();
ctx.fill();

// Field spread (wider, dimmer)
ctx.fillStyle = 'rgba(255, 255, 100, 0.05)';
ctx.beginPath();
ctx.moveTo(leftPanelX + panelWidth/2, lightY);
ctx.lineTo(leftPanelX + panelWidth/2 - 220, lightY + 280);
ctx.lineTo(leftPanelX + panelWidth/2 + 220, lightY + 280);
ctx.closePath();
ctx.fill();

// Draw polar grid overlay
ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
ctx.lineWidth = 1;
const centerX = leftPanelX + panelWidth/2;
const centerY = lightY + 150;
for (let r = 50; r <= 150; r += 50) {
  ctx.beginPath();
  ctx.arc(centerX, centerY, r, Math.PI, 0, true);
  ctx.stroke();
}

// Estimated distribution (right)
ctx.fillStyle = 'rgba(255, 255, 100, 0.2)';
ctx.beginPath();
ctx.moveTo(rightPanelX + panelWidth/2, lightY);
ctx.lineTo(rightPanelX + panelWidth/2 - 180, lightY + 250);
ctx.lineTo(rightPanelX + panelWidth/2 + 180, lightY + 250);
ctx.closePath();
ctx.fill();

// Secondary spread
ctx.fillStyle = 'rgba(255, 255, 100, 0.1)';
ctx.beginPath();
ctx.moveTo(rightPanelX + panelWidth/2, lightY);
ctx.lineTo(rightPanelX + panelWidth/2 - 250, lightY + 300);
ctx.lineTo(rightPanelX + panelWidth/2 + 250, lightY + 300);
ctx.closePath();
ctx.fill();

// Data comparison boxes
const dataY = panelY + panelHeight + 40;
const dataHeight = 200;

// Left data box
ctx.fillStyle = '#111111';
ctx.fillRect(leftPanelX, dataY, panelWidth, dataHeight);
ctx.strokeStyle = '#333333';
ctx.strokeRect(leftPanelX, dataY, panelWidth, dataHeight);

// Right data box
ctx.fillRect(rightPanelX, dataY, panelWidth, dataHeight);
ctx.strokeRect(rightPanelX, dataY, panelWidth, dataHeight);

// Data content
ctx.font = 'bold 16px Arial';
ctx.textAlign = 'left';

// IES Data
ctx.fillStyle = '#10b981';
ctx.fillText('IES File Data:', leftPanelX + 20, dataY + 30);
ctx.font = '14px Arial';
ctx.fillStyle = '#ffffff';
const iesData = [
  '• File: GPL_toplighting_DRB_MB_NAM_2015.ies',
  '• Manufacturer: Philips',
  '• Total Lumens: 550',
  '• Beam Angle: 120° (calculated)',
  '• Field Angle: 150° (calculated)',
  '• Measurement Points: 5,365',
  '• Photometric Type: Type C',
  '• Accuracy: Laboratory measured'
];

iesData.forEach((line, i) => {
  ctx.fillText(line, leftPanelX + 20, dataY + 55 + i * 20);
});

// Estimated Data
ctx.font = 'bold 16px Arial';
ctx.fillStyle = '#f59e0b';
ctx.fillText('Estimated Distribution:', rightPanelX + 20, dataY + 30);
ctx.font = '14px Arial';
ctx.fillStyle = '#ffffff';
const estimatedData = [
  '• Method: Geometric approximation',
  '• Pattern: Lambertian + cone',
  '• Beam Angle: 120° (assumed)',
  '• Distribution: Symmetric',
  '• Calculation: Inverse square law',
  '• Accuracy: ±20-30% typical',
  '• Suitable for: Basic planning',
  '• Limitations: No asymmetry'
];

estimatedData.forEach((line, i) => {
  ctx.fillText(line, rightPanelX + 20, dataY + 55 + i * 20);
});

// Bottom comparison summary
const summaryY = height - 100;
ctx.fillStyle = '#1a1a1a';
ctx.fillRect(50, summaryY - 20, width - 100, 80);
ctx.strokeStyle = '#444444';
ctx.strokeRect(50, summaryY - 20, width - 100, 80);

ctx.font = 'bold 16px Arial';
ctx.fillStyle = '#ffffff';
ctx.textAlign = 'center';
ctx.fillText('Key Benefits of IES Integration:', width/2, summaryY);

ctx.font = '14px Arial';
ctx.fillStyle = '#cccccc';
const benefits = [
  'Professional Accuracy: Use actual manufacturer photometric data',
  'Precise PPFD Calculations: Account for real-world beam patterns',
  'DLC Compliance: Meet rebate requirements with verified data',
  'Flexible System: Works with or without IES files'
];

ctx.fillText(benefits.join('  •  '), width/2, summaryY + 25);

// Add feature callouts
ctx.font = '12px Arial';
ctx.fillStyle = '#10b981';
ctx.textAlign = 'center';
ctx.fillText('✓ Drag & Drop Upload', leftPanelX + panelWidth/2, panelY + panelHeight - 20);
ctx.fillText('✓ Real-time Preview', leftPanelX + panelWidth/2, panelY + panelHeight - 5);

ctx.fillStyle = '#f59e0b';
ctx.fillText('✓ Always Available', rightPanelX + panelWidth/2, panelY + panelHeight - 20);
ctx.fillText('✓ Quick Estimates', rightPanelX + panelWidth/2, panelY + panelHeight - 5);

// Save to Downloads folder
const outputPath = path.join(process.env.HOME, 'Downloads', 'VibeLux_IES_Comparison_System.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outputPath, buffer);

console.log(`IES comparison image saved to: ${outputPath}`);