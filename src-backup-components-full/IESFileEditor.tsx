"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Upload, 
  Lightbulb,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit3,
  Save,
  RotateCcw
} from 'lucide-react';
import * as d3 from 'd3';
import { IESFileGenerator, IESFile, LuminaireGeometry, PhotometricDistribution } from '@/lib/ies-file-generator';

interface IESFileEditorProps {
  onFileGenerated?: (iesFile: IESFile, iesString: string) => void;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function IESFileEditor({ onFileGenerated }: IESFileEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const generator = new IESFileGenerator();
  
  // Form state for new IES file generation
  const [formData, setFormData] = useState({
    lumens: 5000,
    watts: 50,
    beamAngle: 60,
    fieldAngle: 90,
    manufacturer: 'VibeLux',
    description: 'LED Horticultural Fixture'
  });
  
  // Geometry configuration
  const [geometry, setGeometry] = useState<LuminaireGeometry>({
    width: 1.2,
    length: 0.3,
    height: 0.15,
    shape: 'rectangular',
    mountingType: 'pendant'
  });
  
  // Custom photometric distribution
  const [customDistribution, setCustomDistribution] = useState<PhotometricDistribution[]>([
    { angle: 0, intensity: 100 },
    { angle: 30, intensity: 85 },
    { angle: 60, intensity: 50 },
    { angle: 90, intensity: 10 },
    { angle: 120, intensity: 5 },
    { angle: 180, intensity: 0 }
  ]);
  
  // Current IES file state
  const [currentIESFile, setCurrentIESFile] = useState<IESFile | null>(null);
  const [iesString, setIesString] = useState<string>('');
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [], warnings: [] });
  const [activeTab, setActiveTab] = useState('generate');
  const [isEditing, setIsEditing] = useState(false);
  
  // Generate new IES file
  const generateIESFile = () => {
    try {
      const iesFile = generator.generateIESFile(
        formData.lumens,
        formData.watts,
        formData.beamAngle,
        formData.fieldAngle,
        geometry,
        customDistribution
      );
      
      // Update manufacturer and description if provided
      if (formData.manufacturer) {
        iesFile.header.manufacturer = formData.manufacturer;
        iesFile.keywords['MANUFAC'] = formData.manufacturer;
      }
      
      if (formData.description) {
        iesFile.header.description = formData.description;
        iesFile.keywords['LUMINAIRE'] = formData.description;
      }
      
      const iesString = generator.exportIESString(iesFile);
      
      setCurrentIESFile(iesFile);
      setIesString(iesString);
      validateFile(iesFile);
      
      onFileGenerated?.(iesFile, iesString);
      setActiveTab('preview');
      
    } catch (error) {
      console.error('Error generating IES file:', error);
    }
  };
  
  // Load IES file from upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const iesFile = generator.parseIESFile(content);
        
        setCurrentIESFile(iesFile);
        setIesString(content);
        validateFile(iesFile);
        setActiveTab('editor');
        
        // Update form data from loaded file
        setFormData({
          lumens: iesFile.header.lumens,
          watts: iesFile.header.inputWatts,
          beamAngle: 60, // Will be calculated from photometric data
          fieldAngle: 90,
          manufacturer: iesFile.header.manufacturer,
          description: iesFile.header.description
        });
        
      } catch (error) {
        console.error('Error parsing IES file:', error);
        setValidation({
          isValid: false,
          errors: ['Failed to parse IES file. Please check the format.'],
          warnings: []
        });
      }
    };
    
    reader.readAsText(file);
  };
  
  // Validate IES file
  const validateFile = (iesFile: IESFile) => {
    const result = generator.validateIESFile(iesFile);
    const warnings: string[] = [];
    
    // Add warnings for common issues
    const props = generator.calculatePhotometricProperties(iesFile);
    if (props.efficacy < 50) {
      warnings.push('Low efficacy detected. Consider checking the lumen and wattage values.');
    }
    
    if (props.maxIntensity === 0) {
      warnings.push('No photometric data detected. The fixture may not produce any light.');
    }
    
    setValidation({
      ...result,
      warnings
    });
  };
  
  // Update IES file property
  const updateIESProperty = (path: string, value: any) => {
    if (!currentIESFile) return;
    
    const updated = { ...currentIESFile };
    const keys = path.split('.');
    let current: any = updated;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    
    // Regenerate IES string
    const newIesString = generator.exportIESString(updated);
    
    setCurrentIESFile(updated);
    setIesString(newIesString);
    validateFile(updated);
    onFileGenerated?.(updated, newIesString);
  };
  
  // Add custom distribution point
  const addDistributionPoint = () => {
    setCustomDistribution([
      ...customDistribution,
      { angle: 0, intensity: 0 }
    ]);
  };
  
  // Remove distribution point
  const removeDistributionPoint = (index: number) => {
    setCustomDistribution(customDistribution.filter((_, i) => i !== index));
  };
  
  // Update distribution point
  const updateDistributionPoint = (index: number, field: 'angle' | 'intensity', value: number) => {
    const updated = [...customDistribution];
    updated[index][field] = value;
    updated.sort((a, b) => a.angle - b.angle); // Keep sorted by angle
    setCustomDistribution(updated);
  };
  
  // Download IES file
  const downloadIESFile = () => {
    if (!iesString || !currentIESFile) return;
    
    const blob = new Blob([iesString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentIESFile.header.catalogNumber || 'fixture'}.ies`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Render photometric chart
  const renderPhotometricChart = () => {
    if (!currentIESFile || !chartRef.current) return;
    
    const svg = d3.select(chartRef.current);
    const width = 500;
    const height = 400;
    const margin = { top: 20, right: 80, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Prepare data
    const data = currentIESFile.photometricData.verticalAngles.map((angle, i) => ({
      angle,
      intensity: currentIESFile!.photometricData.candelaValues[0][i]
    }));
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 180])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.intensity) || 1000])
      .range([innerHeight, 0]);
    
    // Line generator
    const line = d3.line<{ angle: number; intensity: number }>()
      .x(d => xScale(d.angle))
      .y(d => yScale(d.intensity))
      .curve(d3.curveMonotoneX);
    
    // Area generator
    const area = d3.area<{ angle: number; intensity: number }>()
      .x(d => xScale(d.angle))
      .y0(innerHeight)
      .y1(d => yScale(d.intensity))
      .curve(d3.curveMonotoneX);
    
    // Add area
    g.append("path")
      .datum(data)
      .attr("d", area)
      .attr("fill", "url(#photometric-gradient)")
      .attr("opacity", 0.3);
    
    // Add gradient
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "photometric-gradient")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "100%")
      .attr("y2", "0%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3B82F6")
      .attr("stop-opacity", 0.1);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3B82F6")
      .attr("stop-opacity", 0.8);
    
    // Add line
    g.append("path")
      .datum(data)
      .attr("d", line)
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 2)
      .attr("fill", "none");
    
    // Add dots
    g.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.angle))
      .attr("cy", d => yScale(d.intensity))
      .attr("r", 3)
      .attr("fill", "#1D4ED8");
    
    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickValues([0, 30, 60, 90, 120, 150, 180])
        .tickFormat(d => `${d}°`));
    
    g.append("g")
      .call(d3.axisLeft(yScale));
    
    // Add labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .text("Vertical Angle (degrees)");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .text("Luminous Intensity (cd)");
  };
  
  // Update chart when IES file changes
  useEffect(() => {
    renderPhotometricChart();
  }, [currentIESFile]);
  
  // Calculate photometric properties
  const photometricProps = currentIESFile ? generator.calculatePhotometricProperties(currentIESFile) : null;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            IES File Generator & Editor
          </span>
          <div className="flex items-center gap-2">
            {validation.isValid && currentIESFile && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Valid IES
              </Badge>
            )}
            {!validation.isValid && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Invalid
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Create and edit professional IES photometric data files for lighting simulation
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Fixture Parameters
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="lumens">Total Lumens</Label>
                    <Input
                      id="lumens"
                      type="number"
                      value={formData.lumens}
                      onChange={(e) => setFormData({...formData, lumens: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="watts">Input Watts</Label>
                    <Input
                      id="watts"
                      type="number"
                      value={formData.watts}
                      onChange={(e) => setFormData({...formData, watts: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="beamAngle">Beam Angle (°)</Label>
                    <Input
                      id="beamAngle"
                      type="number"
                      value={formData.beamAngle}
                      onChange={(e) => setFormData({...formData, beamAngle: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fieldAngle">Field Angle (°)</Label>
                    <Input
                      id="fieldAngle"
                      type="number"
                      value={formData.fieldAngle}
                      onChange={(e) => setFormData({...formData, fieldAngle: Number(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Luminaire Geometry
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="width">Width (m)</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.1"
                      value={geometry.width}
                      onChange={(e) => setGeometry({...geometry, width: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="length">Length (m)</Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.1"
                      value={geometry.length}
                      onChange={(e) => setGeometry({...geometry, length: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (m)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      value={geometry.height}
                      onChange={(e) => setGeometry({...geometry, height: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shape">Shape</Label>
                    <Select value={geometry.shape} onValueChange={(value) => setGeometry({...geometry, shape: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rectangular">Rectangular</SelectItem>
                        <SelectItem value="circular">Circular</SelectItem>
                        <SelectItem value="linear">Linear</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="mounting">Mounting Type</Label>
                    <Select value={geometry.mountingType} onValueChange={(value) => setGeometry({...geometry, mountingType: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendant">Pendant</SelectItem>
                        <SelectItem value="surface">Surface</SelectItem>
                        <SelectItem value="recessed">Recessed</SelectItem>
                        <SelectItem value="track">Track</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Calculated Efficacy</div>
                    <div className="text-xl font-semibold">
                      {formData.watts > 0 ? Math.round(formData.lumens / formData.watts) : 0} lm/W
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={generateIESFile} className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Generate IES File
              </Button>
              
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Load IES File
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".ies"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="editor" className="space-y-4">
            {currentIESFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">IES File Properties</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                    {isEditing ? 'Save' : 'Edit'}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Manufacturer</Label>
                    <Input
                      value={currentIESFile.header.manufacturer}
                      disabled={!isEditing}
                      onChange={(e) => updateIESProperty('header.manufacturer', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Catalog Number</Label>
                    <Input
                      value={currentIESFile.header.catalogNumber}
                      disabled={!isEditing}
                      onChange={(e) => updateIESProperty('header.catalogNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Total Lumens</Label>
                    <Input
                      type="number"
                      value={currentIESFile.header.lumens}
                      disabled={!isEditing}
                      onChange={(e) => updateIESProperty('header.lumens', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Input Watts</Label>
                    <Input
                      type="number"
                      value={currentIESFile.header.inputWatts}
                      disabled={!isEditing}
                      onChange={(e) => updateIESProperty('header.inputWatts', Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={currentIESFile.header.description}
                    disabled={!isEditing}
                    onChange={(e) => updateIESProperty('header.description', e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No IES file loaded. Generate a new file or upload an existing one to start editing.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            {currentIESFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Photometric Chart
                  </h3>
                  <Button variant="outline" onClick={downloadIESFile}>
                    <Download className="h-4 w-4 mr-2" />
                    Download IES
                  </Button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <svg ref={chartRef} width="500" height="400" className="w-full" />
                </div>
                
                {photometricProps && (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Efficacy</div>
                      <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {photometricProps.efficacy.toFixed(1)} lm/W
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Beam Angle</div>
                      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {photometricProps.beamAngle.toFixed(0)}°
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Field Angle</div>
                      <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                        {photometricProps.fieldAngle.toFixed(0)}°
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Peak Intensity</div>
                      <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                        {photometricProps.maxIntensity.toFixed(0)} cd
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Validation Results */}
                {!validation.isValid && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold">Validation Errors:</div>
                      <ul className="list-disc list-inside mt-1">
                        {validation.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {validation.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold">Warnings:</div>
                      <ul className="list-disc list-inside mt-1">
                        {validation.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  Generate or load an IES file to see the photometric preview.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="distribution" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Custom Photometric Distribution</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={addDistributionPoint}>
                  Add Point
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCustomDistribution([
                  { angle: 0, intensity: 100 },
                  { angle: 60, intensity: 50 },
                  { angle: 90, intensity: 10 },
                  { angle: 180, intensity: 0 }
                ])}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {customDistribution.map((point, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <div className="flex-1">
                    <Label className="text-xs">Angle (°)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="180"
                      value={point.angle}
                      onChange={(e) => updateDistributionPoint(index, 'angle', Number(e.target.value))}
                      className="h-8"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Intensity (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={point.intensity}
                      onChange={(e) => updateDistributionPoint(index, 'intensity', Number(e.target.value))}
                      className="h-8"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDistributionPoint(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Define the luminous intensity distribution by specifying angle-intensity pairs. 
                The values will be interpolated to create a smooth distribution curve.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}