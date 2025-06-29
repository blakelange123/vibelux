"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Sun, 
  Clock, 
  Calendar,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  Download,
  Settings,
  Eye,
  Zap,
  TrendingUp,
  Mountain,
  Building,
  Trees
} from 'lucide-react';
import * as d3 from 'd3';
import { 
  SolarShadowAnalyzer, 
  Location, 
  ShadowGeometry, 
  ShadowResult,
  SolarPath,
  SolarPosition
} from '@/lib/shadow-analysis';

interface ShadowAnalysisPanelProps {
  location?: Location;
  onShadowAnalysisComplete?: (results: ShadowResult[]) => void;
}

export function ShadowAnalysisPanel({ location: propLocation, onShadowAnalysisComplete }: ShadowAnalysisPanelProps) {
  const solarPathRef = useRef<SVGSVGElement>(null);
  const shadowTimelineRef = useRef<SVGSVGElement>(null);
  const shadow3DRef = useRef<HTMLCanvasElement>(null);
  
  // Default location (San Francisco)
  const [location, setLocation] = useState<Location>(
    propLocation || {
      latitude: 37.7749,
      longitude: -122.4194,
      timezone: -8,
      elevation: 50
    }
  );
  
  const [analyzer] = useState(() => new SolarShadowAnalyzer(location));
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1); // 1x speed
  const [solarPath, setSolarPath] = useState<SolarPath | null>(null);
  const [shadowResults, setShadowResults] = useState<ShadowResult[]>([]);
  const [currentShadowResult, setCurrentShadowResult] = useState<ShadowResult | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<'current' | 'winter' | 'spring' | 'summer' | 'fall'>('current');
  
  // Shadow-casting objects
  const [geometries, setGeometries] = useState<ShadowGeometry[]>([
    {
      id: 'building-1',
      type: 'building',
      name: 'Main Building',
      height: 10,
      vertices: [
        { x: -15, y: -10, z: 0 },
        { x: -5, y: -10, z: 0 },
        { x: -5, y: 5, z: 0 },
        { x: -15, y: 5, z: 0 }
      ]
    },
    {
      id: 'tree-1',
      type: 'tree',
      name: 'Oak Tree',
      height: 8,
      vertices: [
        { x: 10, y: 10, z: 0 },
        { x: 15, y: 10, z: 0 },
        { x: 15, y: 15, z: 0 },
        { x: 10, y: 15, z: 0 }
      ]
    }
  ]);
  
  const [newGeometry, setNewGeometry] = useState<Partial<ShadowGeometry>>({
    name: '',
    type: 'building',
    height: 5,
    vertices: []
  });

  // Animation control
  const animationRef = useRef<number>();
  const [timeSlider, setTimeSlider] = useState(12); // 12:00 PM

  // Initialize analyzer with geometries
  useEffect(() => {
    geometries.forEach(geom => analyzer.addGeometry(geom));
    analyzer.setGroundPlane(0, { minX: -30, maxX: 30, minY: -30, maxY: 30 });
  }, [geometries, analyzer]);

  // Generate solar path when date changes
  useEffect(() => {
    const path = analyzer.generateSolarPath(currentDate, 15);
    setSolarPath(path);
    renderSolarPath();
  }, [currentDate, analyzer]);

  // Calculate shadows for current time
  useEffect(() => {
    const result = analyzer.calculateShadows(currentTime);
    setCurrentShadowResult(result);
    render3DShadows();
  }, [currentTime, geometries, analyzer]);

  // Generate solar path visualization
  const renderSolarPath = () => {
    if (!solarPathRef.current || !solarPath) return;

    const svg = d3.select(solarPathRef.current);
    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 360])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 90])
      .range([innerHeight, 0]);

    // Solar path line
    const line = d3.line<any>()
      .x(d => xScale(d.azimuth))
      .y(d => yScale(d.elevation))
      .curve(d3.curveMonotoneX);

    const daylightPositions = solarPath.positions.filter(p => p.isDaylight);

    if (daylightPositions.length > 0) {
      // Add gradient for path
      const defs = svg.append("defs");
      const gradient = defs.append("linearGradient")
        .attr("id", "solar-gradient")
        .attr("x1", "0%")
        .attr("x2", "100%");

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#FEF3C7");

      gradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", "#FCD34D");

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#F59E0B");

      // Solar path area
      const area = d3.area<any>()
        .x(d => xScale(d.azimuth))
        .y0(innerHeight)
        .y1(d => yScale(d.elevation))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(daylightPositions)
        .attr("d", area)
        .attr("fill", "url(#solar-gradient)")
        .attr("opacity", 0.3);

      // Solar path line
      g.append("path")
        .datum(daylightPositions)
        .attr("d", line)
        .attr("stroke", "#F59E0B")
        .attr("stroke-width", 3)
        .attr("fill", "none");

      // Current sun position
      if (currentShadowResult) {
        const currentPos = currentShadowResult.solarPosition;
        if (currentPos.elevation > 0) {
          g.append("circle")
            .attr("cx", xScale(currentPos.azimuth))
            .attr("cy", yScale(currentPos.elevation))
            .attr("r", 8)
            .attr("fill", "#FBBF24")
            .attr("stroke", "#F59E0B")
            .attr("stroke-width", 2);
        }
      }

      // Key points
      const keyPoints = [
        { ...solarPath.sunrise, label: "Sunrise", color: "#FEF3C7" },
        { ...analyzer.calculateSolarPosition(solarPath.solarNoon), label: "Solar Noon", color: "#FBBF24" },
        { ...solarPath.sunset, label: "Sunset", color: "#F59E0B" }
      ].filter(p => p.elevation > 0);

      keyPoints.forEach(point => {
        g.append("circle")
          .attr("cx", xScale(point.azimuth))
          .attr("cy", yScale(point.elevation))
          .attr("r", 4)
          .attr("fill", point.color)
          .attr("stroke", "#92400E")
          .attr("stroke-width", 1);

        g.append("text")
          .attr("x", xScale(point.azimuth))
          .attr("y", yScale(point.elevation) - 10)
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("fill", "#92400E")
          .text(point.label);
      });
    }

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickValues([0, 90, 180, 270, 360])
        .tickFormat(d => ['N', 'E', 'S', 'W', 'N'][d / 90]));

    g.append("g")
      .call(d3.axisLeft(yScale));

    // Labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 35)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Azimuth");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -25)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Elevation (°)");
  };

  // Render shadow timeline
  const renderShadowTimeline = () => {
    if (!shadowTimelineRef.current || shadowResults.length === 0) return;

    const svg = d3.select(shadowTimelineRef.current);
    const width = 600;
    const height = 200;
    const margin = { top: 20, right: 40, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(shadowResults, d => d.time) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(shadowResults, d => d.shadingPercentage) || 100])
      .range([innerHeight, 0]);

    // Area chart
    const area = d3.area<ShadowResult>()
      .x(d => xScale(d.time))
      .y0(innerHeight)
      .y1(d => yScale(d.shadingPercentage))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(shadowResults)
      .attr("d", area)
      .attr("fill", "#6366F1")
      .attr("opacity", 0.3);

    // Line chart
    const line = d3.line<ShadowResult>()
      .x(d => xScale(d.time))
      .y(d => yScale(d.shadingPercentage))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(shadowResults)
      .attr("d", line)
      .attr("stroke", "#4F46E5")
      .attr("stroke-width", 2)
      .attr("fill", "none");

    // Current time indicator
    if (currentShadowResult) {
      g.append("line")
        .attr("x1", xScale(currentShadowResult.time))
        .attr("x2", xScale(currentShadowResult.time))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#EF4444")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3");
    }

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat("%H:%M")));

    g.append("g")
      .call(d3.axisLeft(yScale));

    // Labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 35)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Time");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Shading (%)");
  };

  // Render 3D shadows
  const render3DShadows = () => {
    if (!shadow3DRef.current || !currentShadowResult) return;

    const canvas = shadow3DRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 500;
    canvas.height = 400;

    // Clear canvas
    ctx.fillStyle = '#E5E7EB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Simple 2D top-down view
    const scale = 8;
    const offsetX = canvas.width / 2;
    const offsetY = canvas.height / 2;

    // Draw ground grid
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1;
    for (let x = -30; x <= 30; x += 5) {
      ctx.beginPath();
      ctx.moveTo(offsetX + x * scale, offsetY - 30 * scale);
      ctx.lineTo(offsetX + x * scale, offsetY + 30 * scale);
      ctx.stroke();
    }
    for (let y = -30; y <= 30; y += 5) {
      ctx.beginPath();
      ctx.moveTo(offsetX - 30 * scale, offsetY + y * scale);
      ctx.lineTo(offsetX + 30 * scale, offsetY + y * scale);
      ctx.stroke();
    }

    // Draw shadows
    currentShadowResult.shadows.forEach(shadow => {
      if (shadow.shadowVertices.length >= 3) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        const firstVertex = shadow.shadowVertices[0];
        ctx.moveTo(offsetX + firstVertex.x * scale, offsetY - firstVertex.y * scale);
        
        for (let i = 1; i < shadow.shadowVertices.length; i++) {
          const vertex = shadow.shadowVertices[i];
          ctx.lineTo(offsetX + vertex.x * scale, offsetY - vertex.y * scale);
        }
        ctx.closePath();
        ctx.fill();
      }
    });

    // Draw geometries
    geometries.forEach(geometry => {
      const color = geometry.type === 'building' ? '#3B82F6' : 
                   geometry.type === 'tree' ? '#10B981' : '#6B7280';
      
      ctx.fillStyle = color;
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 2;
      
      if (geometry.vertices.length >= 3) {
        ctx.beginPath();
        const firstVertex = geometry.vertices[0];
        ctx.moveTo(offsetX + firstVertex.x * scale, offsetY - firstVertex.y * scale);
        
        for (let i = 1; i < geometry.vertices.length; i++) {
          const vertex = geometry.vertices[i];
          ctx.lineTo(offsetX + vertex.x * scale, offsetY - vertex.y * scale);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });

    // Draw sun position indicator
    if (currentShadowResult.solarPosition.elevation > 0) {
      const sunX = offsetX + 25 * Math.sin(currentShadowResult.solarPosition.azimuth * Math.PI / 180);
      const sunY = offsetY - 25 * Math.cos(currentShadowResult.solarPosition.azimuth * Math.PI / 180);
      
      ctx.fillStyle = '#FBBF24';
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }

    // Legend
    ctx.fillStyle = '#1F2937';
    ctx.font = '12px sans-serif';
    ctx.fillText('Top-down view', 10, 20);
    ctx.fillText(`Time: ${currentShadowResult.time.toLocaleTimeString()}`, 10, 35);
    ctx.fillText(`Shading: ${currentShadowResult.shadingPercentage.toFixed(1)}%`, 10, 50);
    ctx.fillText(`Sun Elevation: ${currentShadowResult.solarPosition.elevation.toFixed(1)}°`, 10, 65);
  };

  // Start/stop animation
  const toggleAnimation = () => {
    if (isAnimating) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsAnimating(false);
    } else {
      setIsAnimating(true);
      animate();
    }
  };

  // Animation loop
  const animate = () => {
    setTimeSlider(prev => {
      const newTime = (prev + 0.1 * animationSpeed) % 24;
      const newDateTime = new Date(currentDate);
      newDateTime.setHours(Math.floor(newTime), (newTime % 1) * 60, 0, 0);
      setCurrentTime(newDateTime);
      return newTime;
    });

    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  // Update time from slider
  const handleTimeSliderChange = (value: number[]) => {
    const hour = value[0];
    setTimeSlider(hour);
    const newDateTime = new Date(currentDate);
    newDateTime.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
    setCurrentTime(newDateTime);
  };

  // Analyze shadows over time
  const analyzeShadows = () => {
    const startTime = new Date(currentDate);
    startTime.setHours(6, 0, 0, 0);
    const endTime = new Date(currentDate);
    endTime.setHours(18, 0, 0, 0);
    
    const results = analyzer.analyzeShadowsOverTime(startTime, endTime, 30);
    setShadowResults(results);
    renderShadowTimeline();
    
    onShadowAnalysisComplete?.(results);
  };

  // Add new geometry
  const addGeometry = () => {
    if (!newGeometry.name || !newGeometry.type || !newGeometry.height) return;
    
    const geometry: ShadowGeometry = {
      id: `geometry-${Date.now()}`,
      name: newGeometry.name,
      type: newGeometry.type as ShadowGeometry['type'],
      height: newGeometry.height,
      vertices: [
        { x: -2, y: -2, z: 0 },
        { x: 2, y: -2, z: 0 },
        { x: 2, y: 2, z: 0 },
        { x: -2, y: 2, z: 0 }
      ]
    };
    
    setGeometries([...geometries, geometry]);
    analyzer.addGeometry(geometry);
    
    setNewGeometry({ name: '', type: 'building', height: 5, vertices: [] });
  };

  // Remove geometry
  const removeGeometry = (id: string) => {
    setGeometries(geometries.filter(g => g.id !== id));
    analyzer.removeGeometry(id);
  };

  useEffect(() => {
    renderSolarPath();
  }, [solarPath, currentShadowResult]);

  useEffect(() => {
    renderShadowTimeline();
  }, [shadowResults, currentShadowResult]);

  useEffect(() => {
    render3DShadows();
  }, [currentShadowResult, geometries]);

  const shadowSummary = shadowResults.length > 0 ? analyzer.getShadowSummary(shadowResults) : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Solar Shadow Analysis
          </span>
          <div className="flex items-center gap-2">
            {currentShadowResult && (
              <Badge variant={currentShadowResult.shadingPercentage > 50 ? "destructive" : "default"}>
                {currentShadowResult.shadingPercentage.toFixed(1)}% Shaded
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Real-time solar path calculation and shadow simulation with dynamic sun positioning
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="solar">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="solar">Solar Path</TabsTrigger>
            <TabsTrigger value="shadows">Shadow Analysis</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="solar" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location & Time
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Latitude</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={location.latitude}
                      onChange={(e) => setLocation({...location, latitude: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={location.longitude}
                      onChange={(e) => setLocation({...location, longitude: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={currentDate.toISOString().split('T')[0]}
                      onChange={(e) => setCurrentDate(new Date(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Timezone</Label>
                    <Input
                      type="number"
                      value={location.timezone}
                      onChange={(e) => setLocation({...location, timezone: Number(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Time of Day: {Math.floor(timeSlider)}:{Math.round((timeSlider % 1) * 60).toString().padStart(2, '0')}</Label>
                  <Slider
                    value={[timeSlider]}
                    onValueChange={handleTimeSliderChange}
                    min={0}
                    max={24}
                    step={0.25}
                    className="w-full"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={toggleAnimation} variant={isAnimating ? "destructive" : "default"}>
                    {isAnimating ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {isAnimating ? 'Pause' : 'Animate'}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Speed:</Label>
                    <Select value={animationSpeed.toString()} onValueChange={(value) => setAnimationSpeed(Number(value))}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">0.5x</SelectItem>
                        <SelectItem value="1">1x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                        <SelectItem value="5">5x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Solar Path Diagram</h3>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <svg ref={solarPathRef} width="400" height="300" className="w-full" />
                </div>
                
                {solarPath && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Sunrise</div>
                      <div className="text-sm font-medium">{solarPath.sunrise.toLocaleTimeString()}</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 dark:bg-orange-950 rounded">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Solar Noon</div>
                      <div className="text-sm font-medium">{solarPath.solarNoon.toLocaleTimeString()}</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 dark:bg-red-950 rounded">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Sunset</div>
                      <div className="text-sm font-medium">{solarPath.sunset.toLocaleTimeString()}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="shadows" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Shadow Objects</h3>
                  <Button onClick={analyzeShadows} size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {geometries.map(geometry => (
                    <div key={geometry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        {geometry.type === 'building' && <Building className="h-4 w-4 text-blue-500" />}
                        {geometry.type === 'tree' && <Trees className="h-4 w-4 text-green-500" />}
                        {geometry.type === 'structure' && <Mountain className="h-4 w-4 text-gray-500" />}
                        <div>
                          <div className="font-medium">{geometry.name}</div>
                          <div className="text-xs text-gray-500">{geometry.height}m height</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeGeometry(geometry.id)}>
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-medium">Add New Object</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Name"
                      value={newGeometry.name || ''}
                      onChange={(e) => setNewGeometry({...newGeometry, name: e.target.value})}
                    />
                    <Select value={newGeometry.type} onValueChange={(value) => setNewGeometry({...newGeometry, type: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="building">Building</SelectItem>
                        <SelectItem value="tree">Tree</SelectItem>
                        <SelectItem value="structure">Structure</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="number"
                    placeholder="Height (m)"
                    value={newGeometry.height || ''}
                    onChange={(e) => setNewGeometry({...newGeometry, height: Number(e.target.value)})}
                  />
                  <Button onClick={addGeometry} size="sm" className="w-full">
                    Add Object
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Shadow Visualization</h3>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <canvas ref={shadow3DRef} className="w-full border rounded" />
                </div>
                
                {currentShadowResult && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Sun Elevation</div>
                      <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {currentShadowResult.solarPosition.elevation.toFixed(1)}°
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Sun Azimuth</div>
                      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {currentShadowResult.solarPosition.azimuth.toFixed(1)}°
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Shaded Area</div>
                      <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                        {currentShadowResult.shadedArea.toFixed(1)} m²
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Shading %</div>
                      <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                        {currentShadowResult.shadingPercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Shadow Timeline Analysis
                </h3>
                <Button onClick={analyzeShadows} disabled={shadowResults.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
              
              {shadowResults.length > 0 ? (
                <>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <svg ref={shadowTimelineRef} width="600" height="200" className="w-full" />
                  </div>
                  
                  {shadowSummary && (
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Peak Shading</div>
                        <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                          {shadowSummary.maxShadingPercentage.toFixed(1)}%
                        </div>
                        {shadowSummary.peakShadowTime && (
                          <div className="text-xs text-gray-500">
                            at {shadowSummary.peakShadowTime.toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Min Shading</div>
                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {shadowSummary.minShadingPercentage.toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Average</div>
                        <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          {shadowSummary.averageShadingPercentage.toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Shadow-Free</div>
                        <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                          {shadowSummary.shadowFreeHours.toFixed(1)}h
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Run shadow analysis to see timeline data and summary statistics.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Analysis Settings
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label>Ground Plane Elevation (m)</Label>
                    <Input type="number" defaultValue="0" />
                  </div>
                  
                  <div>
                    <Label>Analysis Area Size (m)</Label>
                    <Input type="number" defaultValue="60" />
                  </div>
                  
                  <div>
                    <Label>Time Step (minutes)</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Seasonal Analysis
                </h3>
                
                <div className="space-y-3">
                  <Select value={selectedSeason} onValueChange={setSelectedSeason as any}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Date</SelectItem>
                      <SelectItem value="winter">Winter Solstice</SelectItem>
                      <SelectItem value="spring">Spring Equinox</SelectItem>
                      <SelectItem value="summer">Summer Solstice</SelectItem>
                      <SelectItem value="fall">Fall Equinox</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Run Seasonal Analysis
                  </Button>
                </div>
                
                <Alert>
                  <Sun className="h-4 w-4" />
                  <AlertDescription>
                    Seasonal analysis compares shadows across solstices and equinoxes to understand year-round shading patterns.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}