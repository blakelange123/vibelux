'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Eye, Download, RotateCcw, Layers } from 'lucide-react';

interface IESData {
  header: {
    manufacturer: string;
    lumcat: string;
    luminaire: string;
    lamp: string;
    ballast: string;
    issueDate: string;
  };
  photometry: {
    totalLumens: number;
    verticalAngles: number[];
    horizontalAngles: number[];
    candelaValues: number[][];
  };
}

interface FixtureData {
  id: string;
  brand: string;
  model: string;
  ppf: number;
  wattage: number;
  efficacy: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  spectrum: {
    blue: number;
    green: number;
    red: number;
    farRed: number;
  };
}

export function IESLightDistributionComparison() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [iesData, setIesData] = useState<IESData | null>(null);
  const [fixtureData] = useState<FixtureData>({
    id: 'H-KTJ1X2',
    brand: 'Philips',
    model: 'GPL TLL 550 DRB_LB 200-400V 2.3 D',
    ppf: 550,
    wattage: 142,
    efficacy: 3.87,
    dimensions: {
      length: 49.2,
      width: 2.2,
      height: 3.2
    },
    spectrum: {
      blue: 5.5, // 30/540 * 100
      green: 0.2, // 1/540 * 100
      red: 94.3, // 509/540 * 100
      farRed: 0.4 // 2/540 * 100
    }
  });
  const [viewMode, setViewMode] = useState<'polar' | 'cartesian' | 'both'>('both');
  const [showOurRender, setShowOurRender] = useState(true);
  const [showIESRender, setShowIESRender] = useState(true);

  // Parse IES file data
  useEffect(() => {
    const parseIESFile = async () => {
      try {
        const response = await fetch('/GPL%20toplighting%20DRB%20MB%20NAM%202015.ies');
        const text = await response.text();
        
        const lines = text.split('\n');
        const header: any = {};
        
        // Parse header information
        lines.forEach(line => {
          if (line.startsWith('[MANUFAC]')) header.manufacturer = line.split(']')[1]?.trim() || 'Philips';
          if (line.startsWith('[LUMCAT]')) header.lumcat = line.split(']')[1]?.trim() || '';
          if (line.startsWith('[LUMINAIRE]')) header.luminaire = line.split(']')[1]?.trim() || '';
          if (line.startsWith('[LAMP]')) header.lamp = line.split(']')[1]?.trim() || '';
          if (line.startsWith('[BALLAST]')) header.ballast = line.split(']')[1]?.trim() || '';
          if (line.startsWith('[ISSUEDATE]')) header.issueDate = line.split(']')[1]?.trim() || '';
        });

        // Find photometric data line
        const photoLine = lines.find(line => line.trim().match(/^\d+\s+[\d.]+\s+\d+\s+\d+\s+\d+/));
        if (!photoLine) throw new Error('No photometric data found');

        const photoData = photoLine.trim().split(/\s+/).map(Number);
        const totalLumens = photoData[1];
        const numVerticalAngles = photoData[3];
        const numHorizontalAngles = photoData[4];

        // Parse angles and candela values
        const dataStartIndex = lines.findIndex(line => line.trim().match(/^\d+\s+[\d.]+\s+\d+\s+\d+\s+\d+/)) + 3;
        
        // Extract vertical angles
        const verticalAngles: number[] = [];
        let lineIndex = dataStartIndex;
        while (verticalAngles.length < numVerticalAngles && lineIndex < lines.length) {
          const values = lines[lineIndex].trim().split(/\s+/).map(Number);
          verticalAngles.push(...values);
          lineIndex++;
        }

        // Extract horizontal angles
        const horizontalAngles: number[] = [];
        while (horizontalAngles.length < numHorizontalAngles && lineIndex < lines.length) {
          const values = lines[lineIndex].trim().split(/\s+/).map(Number);
          horizontalAngles.push(...values);
          lineIndex++;
        }

        // Extract candela values
        const candelaValues: number[][] = [];
        for (let v = 0; v < numVerticalAngles; v++) {
          const rowData: number[] = [];
          while (rowData.length < numHorizontalAngles && lineIndex < lines.length) {
            const values = lines[lineIndex].trim().split(/\s+/).map(Number);
            rowData.push(...values);
            if (rowData.length >= numHorizontalAngles) break;
            lineIndex++;
          }
          candelaValues.push(rowData.slice(0, numHorizontalAngles));
          if (rowData.length > numHorizontalAngles) {
            // Move to next line if we have extra data
            lineIndex++;
          }
        }

        setIesData({
          header,
          photometry: {
            totalLumens,
            verticalAngles: verticalAngles.slice(0, numVerticalAngles),
            horizontalAngles: horizontalAngles.slice(0, numHorizontalAngles),
            candelaValues
          }
        });
      } catch (error) {
        console.error('Error parsing IES file:', error);
      }
    };

    parseIESFile();
  }, []);

  // Draw comparison visualization
  useEffect(() => {
    if (!canvasRef.current || !iesData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 50;

    if (viewMode === 'polar' || viewMode === 'both') {
      drawPolarDistribution(ctx, centerX, centerY, maxRadius);
    }

    if (viewMode === 'cartesian' || viewMode === 'both') {
      drawCartesianDistribution(ctx);
    }

    // Draw legend
    drawLegend(ctx);

  }, [iesData, viewMode, showOurRender, showIESRender]);

  const drawPolarDistribution = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, maxRadius: number) => {
    if (!iesData) return;

    // Draw grid circles
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const radius = (maxRadius / 4) * i;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Label angles
      ctx.fillStyle = '#666';
      ctx.font = '12px monospace';
      ctx.fillText(`${i * 22.5}°`, centerX + radius + 5, centerY);
    }

    // Draw angle lines
    for (let angle = 0; angle < 360; angle += 30) {
      const rad = (angle * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(rad) * maxRadius, centerY + Math.sin(rad) * maxRadius);
      ctx.stroke();
      
      // Label angles
      const labelX = centerX + Math.cos(rad) * (maxRadius + 20);
      const labelY = centerY + Math.sin(rad) * (maxRadius + 20);
      ctx.fillText(`${angle}°`, labelX, labelY);
    }

    // Draw IES distribution
    if (showIESRender) {
      drawIESPolarCurve(ctx, centerX, centerY, maxRadius, '#00ff00', 0.8);
    }

    // Draw our current rendering approximation
    if (showOurRender) {
      drawOurRenderingPolarCurve(ctx, centerX, centerY, maxRadius, '#ff6600', 0.6);
    }
  };

  const drawIESPolarCurve = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, maxRadius: number, color: string, opacity: number) => {
    if (!iesData) return;

    const { verticalAngles, horizontalAngles, candelaValues } = iesData.photometry;
    
    // Find maximum candela value for normalization
    const maxCandela = Math.max(...candelaValues.flat());
    
    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity;
    ctx.lineWidth = 2;

    // Draw curves for different vertical planes
    for (let hIndex = 0; hIndex < horizontalAngles.length; hIndex += 12) { // Sample every 12th horizontal angle
      ctx.beginPath();
      let firstPoint = true;
      
      for (let vIndex = 0; vIndex < verticalAngles.length; vIndex++) {
        const vAngle = verticalAngles[vIndex];
        const hAngle = horizontalAngles[hIndex];
        const candela = candelaValues[vIndex]?.[hIndex] || 0;
        
        // Convert to polar coordinates
        const normalizedIntensity = candela / maxCandela;
        const radius = normalizedIntensity * maxRadius;
        
        // Convert vertical angle to polar radius (0° = straight down, 90° = horizontal)
        const polarAngle = (hAngle * Math.PI) / 180;
        const x = centerX + Math.cos(polarAngle) * radius * Math.cos((vAngle * Math.PI) / 180);
        const y = centerY + Math.sin(polarAngle) * radius * Math.cos((vAngle * Math.PI) / 180);
        
        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  };

  const drawOurRenderingPolarCurve = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, maxRadius: number, color: string, opacity: number) => {
    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity;
    ctx.lineWidth = 2;

    // Simulate our current triangular/trapezoidal light cone
    // Our current implementation creates a cone that spreads from center to 1.2x width at 1.5x height
    const angles = [];
    const intensities = [];

    for (let angle = 0; angle <= 180; angle += 5) {
      const rad = (angle * Math.PI) / 180;
      
      // Simulate our cone pattern - strong center, falling off towards edges
      let intensity;
      if (angle <= 30) {
        // Strong center cone
        intensity = 1.0 - (angle / 30) * 0.3; // 100% to 70%
      } else if (angle <= 60) {
        // Medium falloff
        intensity = 0.7 - ((angle - 30) / 30) * 0.4; // 70% to 30%
      } else if (angle <= 90) {
        // Sharp falloff
        intensity = 0.3 - ((angle - 60) / 30) * 0.25; // 30% to 5%
      } else {
        // Very low intensity at extreme angles
        intensity = 0.05 * Math.exp(-(angle - 90) / 20);
      }

      angles.push(angle);
      intensities.push(intensity);
    }

    // Draw the curve
    ctx.beginPath();
    for (let i = 0; i < angles.length; i++) {
      const angle = angles[i];
      const intensity = intensities[i];
      const radius = intensity * maxRadius;
      
      const x = centerX + radius * Math.cos((angle * Math.PI) / 180);
      const y = centerY + radius * Math.sin((angle * Math.PI) / 180);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    ctx.globalAlpha = 1;
  };

  const drawCartesianDistribution = (ctx: CanvasRenderingContext2D) => {
    // Draw cartesian view in bottom half if in 'both' mode
    const startY = viewMode === 'both' ? ctx.canvas.height / 2 + 50 : 50;
    const height = viewMode === 'both' ? ctx.canvas.height / 2 - 100 : ctx.canvas.height - 100;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(50, startY, ctx.canvas.width - 100, height);
    
    // Draw grid
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    
    // Vertical lines (angle markers)
    for (let i = 0; i <= 180; i += 30) {
      const x = 50 + (i / 180) * (ctx.canvas.width - 100);
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + height);
      ctx.stroke();
      
      // Label
      ctx.fillStyle = '#aaa';
      ctx.font = '10px monospace';
      ctx.fillText(`${i}°`, x - 10, startY + height + 15);
    }
    
    // Horizontal lines (intensity markers)
    for (let i = 0; i <= 4; i++) {
      const y = startY + (i / 4) * height;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(ctx.canvas.width - 50, y);
      ctx.stroke();
      
      // Label
      ctx.fillStyle = '#aaa';
      ctx.fillText(`${100 - i * 25}%`, 10, y + 3);
    }
  };

  const drawLegend = (ctx: CanvasRenderingContext2D) => {
    const legendY = 20;
    
    if (showIESRender) {
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(20, legendY, 15, 10);
      ctx.fillStyle = '#aaa';
      ctx.font = '12px Arial';
      ctx.fillText('IES File Distribution', 40, legendY + 8);
    }
    
    if (showOurRender) {
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(20, legendY + 20, 15, 10);
      ctx.fillStyle = '#aaa';
      ctx.fillText('Our Current Rendering', 40, legendY + 28);
    }
  };

  const exportComparison = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `GPL_TLL_550_light_distribution_comparison_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-lg">
            Light Distribution Comparison
          </h3>
          <p className="text-gray-400 text-sm">
            GPL TLL 550 drB LB - IES File vs Our Rendering
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'polar' ? 'cartesian' : viewMode === 'cartesian' ? 'both' : 'polar')}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Change View Mode"
          >
            <Layers className="w-4 h-4 text-gray-300" />
          </button>
          
          <button
            onClick={exportComparison}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Export Comparison"
          >
            <Download className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={showIESRender}
            onChange={(e) => setShowIESRender(e.target.checked)}
            className="rounded border-gray-600"
          />
          <span className="w-3 h-3 bg-green-500 rounded"></span>
          IES File Distribution
        </label>
        
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={showOurRender}
            onChange={(e) => setShowOurRender(e.target.checked)}
            className="rounded border-gray-600"
          />
          <span className="w-3 h-3 bg-orange-500 rounded"></span>
          Our Current Rendering
        </label>
        
        <div className="text-sm text-gray-400">
          View: <span className="text-gray-200 capitalize">{viewMode}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-auto bg-gray-950 rounded-lg border border-gray-700"
          style={{ maxHeight: '600px' }}
        />
      </div>

      {/* Fixture Data Summary */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">IES File Data</h4>
          {iesData ? (
            <div className="text-sm text-gray-300 space-y-1">
              <div>Manufacturer: {iesData.header.manufacturer}</div>
              <div>Luminaire: {iesData.header.luminaire}</div>
              <div>Lamp: {iesData.header.lamp}</div>
              <div>Total Lumens: {iesData.photometry.totalLumens}</div>
              <div>Vertical Angles: {iesData.photometry.verticalAngles.length} points</div>
              <div>Horizontal Angles: {iesData.photometry.horizontalAngles.length} points</div>
              <div>Issue Date: {iesData.header.issueDate}</div>
            </div>
          ) : (
            <div className="text-gray-500">Loading IES data...</div>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">DLC Database Data</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <div>Brand: {fixtureData.brand}</div>
            <div>Model: {fixtureData.model}</div>
            <div>PPF: {fixtureData.ppf} μmol/s</div>
            <div>Wattage: {fixtureData.wattage}W</div>
            <div>Efficacy: {fixtureData.efficacy} μmol/J</div>
            <div>Dimensions: {fixtureData.dimensions.length}" × {fixtureData.dimensions.width}" × {fixtureData.dimensions.height}"</div>
            <div>Red Spectrum: {fixtureData.spectrum.red.toFixed(1)}%</div>
            <div>Blue Spectrum: {fixtureData.spectrum.blue.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Analysis */}
      <div className="mt-4 bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
        <h4 className="text-yellow-400 font-medium mb-2">Analysis</h4>
        <div className="text-sm text-gray-300 space-y-2">
          <p>
            <strong>Key Differences:</strong> The IES file shows actual measured photometric distribution, 
            while our current rendering uses a simplified geometric cone approximation.
          </p>
          <p>
            <strong>IES Distribution:</strong> Shows precise candela values at specific angles, typically 
            with more complex patterns including side light spill and beam cutoff characteristics.
          </p>
          <p>
            <strong>Our Rendering:</strong> Uses a mathematical approximation that creates a more uniform 
            cone pattern, which may not accurately represent the actual light distribution.
          </p>
          <p>
            <strong>Recommendation:</strong> Consider implementing IES file parsing for more accurate 
            photometric visualization, especially for professional lighting calculations.
          </p>
        </div>
      </div>
    </div>
  );
}