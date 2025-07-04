'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  Info, 
  Zap, 
  Sun, 
  LineChart,
  BarChart3,
  Download,
  Maximize2
} from 'lucide-react';

interface SpectrumData {
  blue: number;
  green: number;
  red: number;
  farRed: number;
}

interface SpectrumPoint {
  wavelength: number;
  intensity: number;
}

interface FixtureWithSpectrum {
  id: string;
  brand: string;
  model: string;
  wattage: number;
  ppf: number;
  spectrumData?: SpectrumData;
  spectrum?: string;
  spectrumCurve?: SpectrumPoint[];
}

interface SpectrumAnalysisPanelProps {
  fixtures: FixtureWithSpectrum[];
  targetCrop?: string;
}

// Generate realistic spectrum curve data
function generateSpectrumCurve(spectrumData: SpectrumData): SpectrumPoint[] {
  const points: SpectrumPoint[] = [];
  
  // Generate smooth curve using gaussian distributions
  for (let wavelength = 380; wavelength <= 780; wavelength += 5) {
    let intensity = 0;
    
    // Blue peak around 450nm
    intensity += spectrumData.blue * Math.exp(-Math.pow(wavelength - 450, 2) / (2 * Math.pow(30, 2)));
    
    // Green contribution around 550nm
    intensity += spectrumData.green * Math.exp(-Math.pow(wavelength - 550, 2) / (2 * Math.pow(40, 2)));
    
    // Red peak around 660nm
    intensity += spectrumData.red * Math.exp(-Math.pow(wavelength - 660, 2) / (2 * Math.pow(25, 2)));
    
    // Far red peak around 730nm
    intensity += spectrumData.farRed * Math.exp(-Math.pow(wavelength - 730, 2) / (2 * Math.pow(30, 2)));
    
    points.push({ wavelength, intensity: intensity * 100 });
  }
  
  return points;
}

// Interactive D3 Spectrum Chart Component
function InteractiveSpectrumChart({ 
  fixtures, 
  width = 600, 
  height = 400 
}: { 
  fixtures: FixtureWithSpectrum[];
  width?: number;
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const margin = { top: 20, right: 100, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([380, 780])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);
    
    // Color scale for wavelength
    const colorScale = (wavelength: number) => {
      if (wavelength < 450) return "#4F46E5"; // Blue
      if (wavelength < 500) return "#06B6D4"; // Cyan
      if (wavelength < 570) return "#10B981"; // Green
      if (wavelength < 590) return "#F59E0B"; // Yellow
      if (wavelength < 620) return "#F97316"; // Orange
      if (wavelength < 700) return "#EF4444"; // Red
      return "#7C3AED"; // Far red
    };
    
    // Add gradient definition
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "spectrum-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%");
    
    const wavelengths = d3.range(380, 781, 20);
    wavelengths.forEach((w, i) => {
      gradient.append("stop")
        .attr("offset", `${((w - 380) / 400) * 100}%`)
        .attr("stop-color", colorScale(w));
    });
    
    // Add axes
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickValues([400, 450, 500, 550, 600, 650, 700, 750])
        .tickFormat(d => `${d}nm`));
    
    xAxis.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", "currentColor")
      .style("text-anchor", "middle")
      .text("Wavelength (nm)");
    
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale));
    
    yAxis.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .attr("fill", "currentColor")
      .style("text-anchor", "middle")
      .text("Relative Intensity (%)");
    
    // Add spectrum regions
    const regions = [
      { name: "UV", start: 380, end: 400, color: "#8B5CF6" },
      { name: "Blue", start: 400, end: 500, color: "#3B82F6" },
      { name: "Green", start: 500, end: 600, color: "#10B981" },
      { name: "Red", start: 600, end: 700, color: "#EF4444" },
      { name: "Far Red", start: 700, end: 780, color: "#7C3AED" }
    ];
    
    regions.forEach(region => {
      g.append("rect")
        .attr("x", xScale(region.start))
        .attr("y", 0)
        .attr("width", xScale(region.end) - xScale(region.start))
        .attr("height", innerHeight)
        .attr("fill", region.color)
        .attr("opacity", 0.05);
      
      g.append("text")
        .attr("x", xScale((region.start + region.end) / 2))
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", region.color)
        .text(region.name);
    });
    
    // Line generator
    const line = d3.line<SpectrumPoint>()
      .x(d => xScale(d.wavelength))
      .y(d => yScale(d.intensity))
      .curve(d3.curveMonotoneX);
    
    // Area generator for filled spectrum
    const area = d3.area<SpectrumPoint>()
      .x(d => xScale(d.wavelength))
      .y0(innerHeight)
      .y1(d => yScale(d.intensity))
      .curve(d3.curveMonotoneX);
    
    // Add spectrum curves for each fixture
    fixtures.forEach((fixture, index) => {
      if (!fixture.spectrumData) return;
      
      const data = generateSpectrumCurve(fixture.spectrumData);
      const fixtureG = g.append("g")
        .attr("class", `fixture-${fixture.id}`);
      
      // Add filled area
      fixtureG.append("path")
        .datum(data)
        .attr("class", "spectrum-area")
        .attr("d", area)
        .attr("fill", "url(#spectrum-gradient)")
        .attr("opacity", selectedFixture === null || selectedFixture === fixture.id ? 0.2 : 0.05)
        .transition()
        .duration(500)
        .attr("opacity", selectedFixture === null || selectedFixture === fixture.id ? 0.2 : 0.05);
      
      // Add line
      const path = fixtureG.append("path")
        .datum(data)
        .attr("class", "spectrum-line")
        .attr("d", line)
        .attr("stroke", selectedFixture === null || selectedFixture === fixture.id ? 
          d3.schemeCategory10[index % 10] : "#E5E7EB")
        .attr("stroke-width", selectedFixture === null || selectedFixture === fixture.id ? 2.5 : 1)
        .attr("fill", "none")
        .attr("opacity", selectedFixture === null || selectedFixture === fixture.id ? 1 : 0.3)
        .style("cursor", "pointer")
        .on("mouseover", function(event) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("stroke-width", 4);
          
          // Show tooltip
          const tooltip = d3.select(tooltipRef.current);
          tooltip
            .style("opacity", 1)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 10}px`)
            .html(`
              <div class="font-semibold">${fixture.brand} ${fixture.model}</div>
              <div class="text-sm text-gray-600">${fixture.wattage}W • ${fixture.ppf} PPF</div>
            `);
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("stroke-width", selectedFixture === null || selectedFixture === fixture.id ? 2.5 : 1);
          
          // Hide tooltip
          d3.select(tooltipRef.current).style("opacity", 0);
        })
        .on("click", () => {
          setSelectedFixture(selectedFixture === fixture.id ? null : fixture.id);
        });
      
      // Animate the line drawing
      const totalLength = (path.node() as any).getTotalLength();
      path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
    });
    
    // Add legend
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth - 80}, 20)`);
    
    fixtures.forEach((fixture, index) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${index * 20})`)
        .style("cursor", "pointer")
        .on("click", () => {
          setSelectedFixture(selectedFixture === fixture.id ? null : fixture.id);
        });
      
      legendItem.append("rect")
        .attr("width", 15)
        .attr("height", 3)
        .attr("fill", d3.schemeCategory10[index % 10])
        .attr("opacity", selectedFixture === null || selectedFixture === fixture.id ? 1 : 0.3);
      
      legendItem.append("text")
        .attr("x", 20)
        .attr("y", 3)
        .attr("font-size", "12px")
        .attr("fill", "currentColor")
        .attr("opacity", selectedFixture === null || selectedFixture === fixture.id ? 1 : 0.5)
        .text(fixture.model);
    });
    
    // Add interactive wavelength indicator
    const focus = g.append("g")
      .style("display", "none");
    
    focus.append("line")
      .attr("class", "focus-line")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#6B7280")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");
    
    focus.append("circle")
      .attr("r", 4)
      .attr("fill", "none")
      .attr("stroke", "#6B7280")
      .attr("stroke-width", 2);
    
    // Add overlay for mouse tracking
    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mouseover", () => focus.style("display", null))
      .on("mouseout", () => focus.style("display", "none"))
      .on("mousemove", function(event) {
        const [mouseX] = d3.pointer(event);
        const wavelength = xScale.invert(mouseX);
        
        focus.select("line")
          .attr("x1", mouseX)
          .attr("x2", mouseX);
        
        // Find closest data point
        const bisect = d3.bisector((d: SpectrumPoint) => d.wavelength).left;
        fixtures.forEach(fixture => {
          if (!fixture.spectrumData || (selectedFixture && selectedFixture !== fixture.id)) return;
          
          const data = generateSpectrumCurve(fixture.spectrumData);
          const index = bisect(data, wavelength);
          if (index > 0 && index < data.length) {
            const d0 = data[index - 1];
            const d1 = data[index];
            const d = wavelength - d0.wavelength > d1.wavelength - wavelength ? d1 : d0;
            
            focus.select("circle")
              .attr("cx", xScale(d.wavelength))
              .attr("cy", yScale(d.intensity));
          }
        });
      });
    
  }, [fixtures, selectedFixture, width, height]);
  
  return (
    <div className="relative">
      <svg ref={svgRef} className="w-full" />
      <div 
        ref={tooltipRef}
        className="absolute bg-white dark:bg-gray-800 p-2 rounded shadow-lg pointer-events-none opacity-0 transition-opacity"
        style={{ zIndex: 1000 }}
      />
    </div>
  );
}

// Bar chart with D3 animations
function AnimatedBarChart({ 
  data, 
  width = 400, 
  height = 300 
}: { 
  data: { wavelength: string; current: number; ideal: number }[];
  width?: number;
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const margin = { top: 20, right: 80, bottom: 60, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x0Scale = d3.scaleBand()
      .domain(data.map(d => d.wavelength))
      .rangeRound([0, innerWidth])
      .paddingInner(0.1);
    
    const x1Scale = d3.scaleBand()
      .domain(["current", "ideal"])
      .rangeRound([0, x0Scale.bandwidth()])
      .padding(0.05);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.current, d.ideal)) || 100])
      .range([innerHeight, 0]);
    
    const colorScale = d3.scaleOrdinal()
      .domain(["current", "ideal"])
      .range(["#3B82F6", "#10B981"]);
    
    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x0Scale));
    
    g.append("g")
      .call(d3.axisLeft(yScale));
    
    // Add bars with animation
    const barGroups = g.selectAll(".bar-group")
      .data(data)
      .enter().append("g")
      .attr("class", "bar-group")
      .attr("transform", d => `translate(${x0Scale(d.wavelength)},0)`);
    
    // Current bars
    barGroups.append("rect")
      .attr("x", x1Scale("current")!)
      .attr("y", innerHeight)
      .attr("width", x1Scale.bandwidth())
      .attr("height", 0)
      .attr("fill", colorScale("current"))
      .transition()
      .duration(800)
      .delay((_, i) => i * 100)
      .attr("y", d => yScale(d.current))
      .attr("height", d => innerHeight - yScale(d.current));
    
    // Ideal bars
    barGroups.append("rect")
      .attr("x", x1Scale("ideal")!)
      .attr("y", innerHeight)
      .attr("width", x1Scale.bandwidth())
      .attr("height", 0)
      .attr("fill", colorScale("ideal"))
      .attr("opacity", 0.5)
      .transition()
      .duration(800)
      .delay((_, i) => i * 100 + 200)
      .attr("y", d => yScale(d.ideal))
      .attr("height", d => innerHeight - yScale(d.ideal));
    
    // Add value labels
    barGroups.append("text")
      .attr("x", x1Scale("current")! + x1Scale.bandwidth() / 2)
      .attr("y", d => yScale(d.current) - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", colorScale("current"))
      .text(d => `${d.current.toFixed(1)}%`)
      .attr("opacity", 0)
      .transition()
      .duration(300)
      .delay((_, i) => i * 100 + 800)
      .attr("opacity", 1);
    
    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 10}, ${margin.top})`);
    
    ["current", "ideal"].forEach((key, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      
      legendItem.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colorScale(key))
        .attr("opacity", key === "ideal" ? 0.5 : 1);
      
      legendItem.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .attr("font-size", "12px")
        .attr("fill", "currentColor")
        .text(key.charAt(0).toUpperCase() + key.slice(1));
    });
    
  }, [data, width, height]);
  
  return <svg ref={svgRef} className="w-full" />;
}

export function SpectrumAnalysisPanel({ fixtures, targetCrop = 'General' }: SpectrumAnalysisPanelProps) {
  const [viewMode, setViewMode] = useState<'spectrum' | 'bars'>('spectrum');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Calculate combined spectrum
  const combinedSpectrum = fixtures.reduce(
    (acc, fixture) => {
      if (fixture.spectrumData) {
        acc.blue += fixture.spectrumData.blue * (fixture.ppf / 100);
        acc.green += fixture.spectrumData.green * (fixture.ppf / 100);
        acc.red += fixture.spectrumData.red * (fixture.ppf / 100);
        acc.farRed += fixture.spectrumData.farRed * (fixture.ppf / 100);
      }
      return acc;
    },
    { blue: 0, green: 0, red: 0, farRed: 0 }
  );

  const totalPPF = fixtures.reduce((sum, f) => sum + f.ppf, 0);
  const totalSpectrum = combinedSpectrum.blue + combinedSpectrum.green + combinedSpectrum.red + combinedSpectrum.farRed;

  // Calculate percentages
  const spectrumPercentages = {
    blue: totalSpectrum > 0 ? (combinedSpectrum.blue / totalSpectrum) * 100 : 0,
    green: totalSpectrum > 0 ? (combinedSpectrum.green / totalSpectrum) * 100 : 0,
    red: totalSpectrum > 0 ? (combinedSpectrum.red / totalSpectrum) * 100 : 0,
    farRed: totalSpectrum > 0 ? (combinedSpectrum.farRed / totalSpectrum) * 100 : 0
  };

  // Ideal spectrum targets by crop
  const idealSpectrums: { [key: string]: SpectrumData } = {
    'Cannabis': { blue: 20, green: 10, red: 65, farRed: 5 },
    'Lettuce': { blue: 25, green: 15, red: 55, farRed: 5 },
    'Tomatoes': { blue: 15, green: 10, red: 70, farRed: 5 },
    'General': { blue: 20, green: 15, red: 60, farRed: 5 }
  };

  const idealSpectrum = idealSpectrums[targetCrop] || idealSpectrums['General'];

  // Calculate spectrum quality score
  const calculateSpectrumScore = () => {
    const blueDiff = Math.abs(spectrumPercentages.blue - idealSpectrum.blue);
    const greenDiff = Math.abs(spectrumPercentages.green - idealSpectrum.green);
    const redDiff = Math.abs(spectrumPercentages.red - idealSpectrum.red);
    const farRedDiff = Math.abs(spectrumPercentages.farRed - idealSpectrum.farRed);
    
    const totalDiff = blueDiff + greenDiff + redDiff + farRedDiff;
    const score = Math.max(0, 100 - totalDiff * 2);
    
    return score;
  };

  const spectrumScore = calculateSpectrumScore();

  // Prepare bar chart data
  const barChartData = [
    {
      wavelength: 'Blue',
      current: spectrumPercentages.blue,
      ideal: idealSpectrum.blue,
    },
    {
      wavelength: 'Green',
      current: spectrumPercentages.green,
      ideal: idealSpectrum.green,
    },
    {
      wavelength: 'Red',
      current: spectrumPercentages.red,
      ideal: idealSpectrum.red,
    },
    {
      wavelength: 'Far Red',
      current: spectrumPercentages.farRed,
      ideal: idealSpectrum.farRed,
    },
  ];

  const getRecommendations = () => {
    const recommendations = [];
    
    if (spectrumPercentages.blue < idealSpectrum.blue - 5) {
      recommendations.push({
        type: 'warning',
        message: 'Low blue light may lead to stretching and poor morphology'
      });
    } else if (spectrumPercentages.blue > idealSpectrum.blue + 10) {
      recommendations.push({
        type: 'info',
        message: 'High blue light may reduce yield efficiency'
      });
    }
    
    if (spectrumPercentages.red < idealSpectrum.red - 10) {
      recommendations.push({
        type: 'warning',
        message: 'Insufficient red light for optimal photosynthesis'
      });
    }
    
    if (spectrumPercentages.green < 5) {
      recommendations.push({
        type: 'info',
        message: 'Consider adding green light for better canopy penetration'
      });
    }
    
    return recommendations;
  };

  const recommendations = getRecommendations();

  // Export spectrum data
  const exportData = () => {
    const data = {
      fixtures: fixtures.map(f => ({
        brand: f.brand,
        model: f.model,
        wattage: f.wattage,
        ppf: f.ppf,
        spectrum: f.spectrumData
      })),
      combined: spectrumPercentages,
      score: spectrumScore,
      targetCrop,
      idealSpectrum
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spectrum-analysis-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={isFullscreen ? 'fixed inset-4 z-50' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Spectrum Analysis - Interactive D3.js
          </span>
          <div className="flex items-center gap-2">
            <Badge variant={spectrumScore >= 85 ? "default" : spectrumScore >= 70 ? "secondary" : "destructive"}>
              Score: {spectrumScore.toFixed(0)}%
            </Badge>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('spectrum')}
                className={viewMode === 'spectrum' ? 'bg-gray-100 dark:bg-gray-800' : ''}
              >
                <LineChart className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('bars')}
                className={viewMode === 'bars' ? 'bg-gray-100 dark:bg-gray-800' : ''}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={exportData}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardTitle>
        <CardDescription>
          Combined spectrum analysis for {fixtures.length} fixture{fixtures.length !== 1 ? 's' : ''} targeting {targetCrop}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg transition-all hover:scale-105">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {spectrumPercentages.blue.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Blue (400-500nm)</div>
            <Progress value={spectrumPercentages.blue} className="mt-2 h-1" />
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg transition-all hover:scale-105">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {spectrumPercentages.green.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Green (500-600nm)</div>
            <Progress value={spectrumPercentages.green} className="mt-2 h-1" />
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg transition-all hover:scale-105">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {spectrumPercentages.red.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Red (600-700nm)</div>
            <Progress value={spectrumPercentages.red} className="mt-2 h-1" />
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg transition-all hover:scale-105">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {spectrumPercentages.farRed.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Far Red (700-800nm)</div>
            <Progress value={spectrumPercentages.farRed} className="mt-2 h-1" />
          </div>
        </div>

        <div className={`bg-gray-50 dark:bg-gray-900 rounded-lg p-4 ${isFullscreen ? 'h-[60vh]' : 'h-96'}`}>
          {viewMode === 'spectrum' ? (
            <InteractiveSpectrumChart 
              fixtures={fixtures} 
              width={isFullscreen ? window.innerWidth - 100 : undefined}
              height={isFullscreen ? window.innerHeight - 300 : undefined}
            />
          ) : (
            <AnimatedBarChart 
              data={barChartData}
              width={isFullscreen ? window.innerWidth - 100 : undefined}
              height={isFullscreen ? window.innerHeight - 300 : undefined}
            />
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Photosynthetic Metrics
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400">R:B Ratio</div>
              <div className="text-lg font-semibold">
                {spectrumPercentages.blue > 0 ? (spectrumPercentages.red / spectrumPercentages.blue).toFixed(2) : '—'}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400">R:FR Ratio</div>
              <div className="text-lg font-semibold">
                {spectrumPercentages.farRed > 0 ? (spectrumPercentages.red / spectrumPercentages.farRed).toFixed(2) : '—'}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400">Total PPF</div>
              <div className="text-lg font-semibold">{totalPPF} µmol/s</div>
            </div>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <Alert key={index} variant={rec.type === 'warning' ? 'destructive' : 'default'}>
                {rec.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                <AlertDescription>{rec.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}