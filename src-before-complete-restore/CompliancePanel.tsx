"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  FileCheck,
  Download,
  AlertCircle,
  TrendingUp,
  Zap,
  Eye,
  Settings,
  MapPin,
  Building
} from 'lucide-react';
import { 
  ComplianceChecker, 
  ComplianceResult, 
  LightingDesign,
  ComplianceStandard,
  ComplianceViolation
} from '@/lib/compliance-checker';
import { IlluminanceResult, Vector3D } from '@/lib/monte-carlo-raytracing';

interface CompliancePanelProps {
  lightingDesign?: LightingDesign;
  onComplianceCheck?: (results: ComplianceResult[]) => void;
}

export function CompliancePanel({ lightingDesign, onComplianceCheck }: CompliancePanelProps) {
  const [checker] = useState(() => new ComplianceChecker());
  const [complianceResults, setComplianceResults] = useState<ComplianceResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [selectedStandards, setSelectedStandards] = useState<string[]>(['ashrae-90.1-2019']);
  const [jurisdiction, setJurisdiction] = useState('United States');
  const [spaceType, setSpaceType] = useState('office');
  
  // Sample lighting design for demo
  const [sampleDesign] = useState<LightingDesign>({
    fixtures: [
      {
        id: 'fixture-1',
        position: { x: 3, y: 3, z: 3 },
        wattage: 45,
        lumens: 4500,
        controlZone: 'zone-1',
        controlType: ['occupancy', 'dimming']
      },
      {
        id: 'fixture-2', 
        position: { x: 6, y: 3, z: 3 },
        wattage: 45,
        lumens: 4500,
        controlZone: 'zone-1',
        controlType: ['occupancy', 'dimming']
      },
      {
        id: 'fixture-3',
        position: { x: 9, y: 3, z: 3 },
        wattage: 45,
        lumens: 4500,
        controlZone: 'zone-2',
        controlType: ['occupancy', 'dimming']
      },
      {
        id: 'fixture-4',
        position: { x: 3, y: 6, z: 3 },
        wattage: 45,
        lumens: 4500,
        controlZone: 'zone-2',
        controlType: ['occupancy', 'dimming']
      }
    ],
    spaceGeometry: {
      area: 92.9, // 1000 sq ft
      volume: 278.7, // 10 ft ceiling
      spaceType: 'office'
    },
    simulationResults: [
      // Sample results - in real use would come from raytracing
      { position: { x: 1, y: 1, z: 0.76 }, illuminance: 520, spectralIlluminance: { wavelengths: [400, 500, 600, 700], values: [0.2, 0.3, 0.3, 0.2] }, colorTemperature: 4000, colorRenderingIndex: 80, uniformityRatio: 0.75, glareIndex: 18 },
      { position: { x: 3, y: 1, z: 0.76 }, illuminance: 480, spectralIlluminance: { wavelengths: [400, 500, 600, 700], values: [0.2, 0.3, 0.3, 0.2] }, colorTemperature: 4000, colorRenderingIndex: 80, uniformityRatio: 0.75, glareIndex: 18 },
      { position: { x: 5, y: 1, z: 0.76 }, illuminance: 510, spectralIlluminance: { wavelengths: [400, 500, 600, 700], values: [0.2, 0.3, 0.3, 0.2] }, colorTemperature: 4000, colorRenderingIndex: 80, uniformityRatio: 0.75, glareIndex: 18 },
      { position: { x: 1, y: 3, z: 0.76 }, illuminance: 495, spectralIlluminance: { wavelengths: [400, 500, 600, 700], values: [0.2, 0.3, 0.3, 0.2] }, colorTemperature: 4000, colorRenderingIndex: 80, uniformityRatio: 0.75, glareIndex: 18 },
      { position: { x: 3, y: 3, z: 0.76 }, illuminance: 530, spectralIlluminance: { wavelengths: [400, 500, 600, 700], values: [0.2, 0.3, 0.3, 0.2] }, colorTemperature: 4000, colorRenderingIndex: 80, uniformityRatio: 0.75, glareIndex: 18 },
      { position: { x: 5, y: 3, z: 0.76 }, illuminance: 505, spectralIlluminance: { wavelengths: [400, 500, 600, 700], values: [0.2, 0.3, 0.3, 0.2] }, colorTemperature: 4000, colorRenderingIndex: 80, uniformityRatio: 0.75, glareIndex: 18 }
    ],
    controlSystems: {
      occupancySensors: true,
      daylightSensors: false,
      dimming: true,
      scheduling: true,
      zoning: ['zone-1', 'zone-2']
    }
  });

  // Available standards
  const availableStandards = [
    { id: 'ashrae-90.1-2019', name: 'ASHRAE 90.1-2019', jurisdiction: 'United States' },
    { id: 'iecc-2021', name: 'IECC 2021', jurisdiction: 'United States' },
    { id: 'title24-2022', name: 'California Title 24-2022', jurisdiction: 'California, USA' },
    { id: 'ies-rp-1-21', name: 'IES RP-1-21', jurisdiction: 'North America' }
  ];

  // Space type options
  const spaceTypes = [
    'office', 'classroom', 'conference', 'corridor', 'retail', 
    'warehouse', 'gymnasium', 'kitchen', 'parking'
  ];

  // Run compliance check
  const runComplianceCheck = async () => {
    setIsChecking(true);
    
    try {
      const design = lightingDesign || { ...sampleDesign, spaceGeometry: { ...sampleDesign.spaceGeometry, spaceType } };
      const results = checker.checkCompliance(design, selectedStandards);
      
      setComplianceResults(results);
      onComplianceCheck?.(results);
      
    } catch (error) {
      console.error('Compliance check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Get severity icon and color
  const getSeverityDisplay = (severity: ComplianceViolation['severity']) => {
    switch (severity) {
      case 'Critical':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950' };
      case 'Major':
        return { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950' };
      case 'Minor':
        return { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' };
      case 'Warning':
        return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-950' };
      default:
        return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50' };
    }
  };

  // Calculate overall compliance score
  const calculateComplianceScore = (): number => {
    if (complianceResults.length === 0) return 0;
    
    const compliantStandards = complianceResults.filter(r => r.compliant).length;
    return (compliantStandards / complianceResults.length) * 100;
  };

  // Generate compliance report
  const generateReport = () => {
    if (complianceResults.length === 0) return;
    
    const report = checker.generateComplianceReport(complianceResults);
    const improvements = checker.suggestImprovements(complianceResults);
    
    const reportData = {
      timestamp: new Date().toISOString(),
      spaceType,
      jurisdiction,
      standards: selectedStandards,
      results: complianceResults,
      summary: report.summary,
      recommendations: report.recommendations,
      priorityActions: report.priorityActions,
      improvements
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Auto-run compliance check when design changes
  useEffect(() => {
    if (lightingDesign || selectedStandards.length > 0) {
      runComplianceCheck();
    }
  }, [lightingDesign, selectedStandards, spaceType]);

  const complianceScore = calculateComplianceScore();
  const report = complianceResults.length > 0 ? checker.generateComplianceReport(complianceResults) : null;
  const improvements = complianceResults.length > 0 ? checker.suggestImprovements(complianceResults) : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Code Compliance Checker
          </span>
          <div className="flex items-center gap-2">
            {complianceResults.length > 0 && (
              <Badge variant={complianceScore === 100 ? "default" : complianceScore >= 50 ? "secondary" : "destructive"}>
                {complianceScore === 100 ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                {complianceScore.toFixed(0)}% Compliant
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Automated verification against ASHRAE, IECC, Title 24, and IES standards
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="setup">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Project Information
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Space Type</label>
                    <Select value={spaceType} onValueChange={setSpaceType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {spaceTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Jurisdiction</label>
                    <Select value={jurisdiction} onValueChange={setJurisdiction}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="California">California, USA</SelectItem>
                        <SelectItem value="North America">North America</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Standards Selection
                </h3>
                
                <div className="space-y-3">
                  {availableStandards
                    .filter(std => std.jurisdiction.toLowerCase().includes(jurisdiction.toLowerCase()))
                    .map(standard => (
                    <div key={standard.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={standard.id}
                        checked={selectedStandards.includes(standard.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStandards([...selectedStandards, standard.id]);
                          } else {
                            setSelectedStandards(selectedStandards.filter(id => id !== standard.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={standard.id} className="text-sm font-medium">
                        {standard.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={runComplianceCheck} 
                disabled={isChecking || selectedStandards.length === 0}
                className="flex items-center gap-2"
              >
                {isChecking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Checking...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Run Compliance Check
                  </>
                )}
              </Button>
              
              <Button variant="outline" onClick={generateReport} disabled={complianceResults.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            {complianceResults.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4">
                  {complianceResults.map((result, index) => (
                    <Card key={index} className={result.compliant ? 'border-green-200' : 'border-red-200'}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-base">
                          <span className="flex items-center gap-2">
                            {result.compliant ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            {result.standard.name} {result.standard.version}
                          </span>
                          <Badge variant={result.compliant ? "default" : "destructive"}>
                            {result.compliant ? 'Compliant' : `${result.violations.length} Issues`}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div className="text-xs text-gray-600 dark:text-gray-400">LPD Compliance</div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {result.metrics.actualLPD.toFixed(2)} W/sf
                              </span>
                              <span className="text-xs text-gray-500">
                                / {result.metrics.allowedLPD.toFixed(2)} max
                              </span>
                            </div>
                            <Progress 
                              value={Math.min(100, (result.metrics.actualLPD / result.metrics.allowedLPD) * 100)}
                              className={`h-2 ${result.metrics.actualLPD <= result.metrics.allowedLPD ? 'bg-green-100' : 'bg-red-100'}`}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-xs text-gray-600 dark:text-gray-400">Illuminance</div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {Math.round(result.metrics.averageIlluminance)} lux
                              </span>
                              <span className="text-xs text-gray-500">avg</span>
                            </div>
                            <div className="text-xs">
                              Range: {Math.round(result.metrics.minIlluminance)} - {Math.round(result.metrics.maxIlluminance)} lux
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-xs text-gray-600 dark:text-gray-400">Uniformity</div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {result.metrics.uniformityRatio.toFixed(2)}
                              </span>
                              <span className="text-xs text-gray-500">ratio</span>
                            </div>
                            <Progress 
                              value={result.metrics.uniformityRatio * 100}
                              className="h-2"
                            />
                          </div>
                        </div>
                        
                        {result.recommendations.length > 0 && (
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                              Recommendations:
                            </div>
                            <ul className="text-sm text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
                              {result.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Run a compliance check to see detailed results for each standard.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="violations" className="space-y-4">
            {complianceResults.length > 0 ? (
              <>
                {complianceResults.flatMap(result => result.violations).length > 0 ? (
                  <div className="space-y-4">
                    {complianceResults.map((result, resultIndex) => 
                      result.violations.map((violation, violationIndex) => {
                        const { icon: Icon, color, bg } = getSeverityDisplay(violation.severity);
                        
                        return (
                          <Alert key={`${resultIndex}-${violationIndex}`} className={bg}>
                            <Icon className={`h-4 w-4 ${color}`} />
                            <AlertTitle className="flex items-center justify-between">
                              <span>{violation.description}</span>
                              <Badge variant={violation.severity === 'Critical' ? 'destructive' : 'secondary'}>
                                {violation.severity}
                              </Badge>
                            </AlertTitle>
                            <AlertDescription className="space-y-3">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <div className="font-medium">Requirement:</div>
                                  <div>{violation.requirement}</div>
                                </div>
                                <div>
                                  <div className="font-medium">Actual:</div>
                                  <div>{violation.actualValue.toFixed(2)} {violation.unit}</div>
                                </div>
                                <div>
                                  <div className="font-medium">Required:</div>
                                  <div>{violation.requiredValue.toFixed(2)} {violation.unit}</div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="font-medium text-sm mb-2">Remediation Actions:</div>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  {violation.remediation.map((action, i) => (
                                    <li key={i}>{action}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Standard: {result.standard.name} {result.standard.version}
                              </div>
                            </AlertDescription>
                          </Alert>
                        );
                      })
                    )}
                  </div>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>No Violations Found</AlertTitle>
                    <AlertDescription>
                      Your lighting design meets all applicable code requirements. Ready for permit submission!
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Run a compliance check to identify any code violations.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="report" className="space-y-6">
            {report ? (
              <>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Standards Checked</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {report.summary.totalStandards}
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Compliant</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {report.summary.compliantStandards}
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Issues</div>
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {report.summary.totalViolations}
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Critical Issues</div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {report.summary.criticalViolations}
                    </div>
                  </div>
                </div>
                
                {report.priorityActions.length > 0 && (
                  <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertTitle>Priority Actions Required</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {report.priorityActions.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {improvements && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Quick Fixes
                      </h3>
                      {improvements.quickFixes.length > 0 ? (
                        <ul className="space-y-2">
                          {improvements.quickFixes.map((fix, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{fix}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">No quick fixes needed</p>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Major Changes
                      </h3>
                      {improvements.majorChanges.length > 0 ? (
                        <>
                          <ul className="space-y-2">
                            {improvements.majorChanges.map((change, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{change}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="text-sm font-medium">Estimated Cost Impact:</div>
                            <Badge variant={improvements.costImpact === 'High' ? 'destructive' : improvements.costImpact === 'Medium' ? 'secondary' : 'default'}>
                              {improvements.costImpact}
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">No major changes needed</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    General Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {report.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Eye className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <Alert>
                <FileCheck className="h-4 w-4" />
                <AlertDescription>
                  Complete a compliance check to generate a detailed report.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}