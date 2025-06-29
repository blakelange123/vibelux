"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Calculator,
  BarChart3,
  TrendingUp,
  DollarSign,
  Zap,
  Leaf,
  Building,
  Calendar,
  PieChart,
  Award,
  CheckCircle,
  AlertTriangle,
  Eye,
  Settings
} from 'lucide-react';
import {
  ProfessionalReportGenerator,
  ProfessionalReport,
  ProjectMetrics,
  EnergyAnalytics,
  ROICalculation
} from '@/lib/reporting/professional-report-generator';

interface ProfessionalReportBuilderProps {
  projectData?: any;
  onReportGenerated?: (report: ProfessionalReport) => void;
}

export function ProfessionalReportBuilder({ projectData, onReportGenerated }: ProfessionalReportBuilderProps) {
  const [reportGenerator] = useState(() => new ProfessionalReportGenerator());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentReport, setCurrentReport] = useState<ProfessionalReport | null>(null);
  
  // Report configuration
  const [reportType, setReportType] = useState<'Design' | 'Performance' | 'ROI' | 'Compliance' | 'Comprehensive'>('Comprehensive');
  const [facilityType, setFacilityType] = useState<'greenhouse' | 'vertical_farm' | 'cannabis' | 'research' | 'commercial'>('greenhouse');
  
  // Project configuration
  const [projectConfig, setProjectConfig] = useState({
    projectName: 'Advanced LED Retrofit Project',
    area: 10000, // sq ft
    totalPower: 15, // kW
    hoursPerDay: 16,
    electricityCost: 0.12, // $/kWh
    initialInvestment: 75000,
    baselineImprovement: 40 // percentage
  });

  const generateReport = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      console.log('Generating professional report...');
      setGenerationProgress(20);

      // Prepare project metrics
      const projectMetrics: ProjectMetrics = {
        projectId: `VLX-${Date.now()}`,
        projectName: projectConfig.projectName,
        facilityType,
        area: projectConfig.area,
        installationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        currentDate: new Date()
      };

      setGenerationProgress(40);

      // Prepare energy data
      const energyData = {
        totalPower: projectConfig.totalPower,
        hoursPerDay: projectConfig.hoursPerDay,
        electricityCost: projectConfig.electricityCost,
        peakDemandCharge: 15.00,
        touPremium: 1.3
      };

      setGenerationProgress(60);

      // Prepare cost data
      const costData = {
        initialInvestment: projectConfig.initialInvestment,
        laborSavings: 5000,
        yieldImprovement: Math.round(projectConfig.area * 2.5), // $2.5 per sq ft
        maintenanceReduction: 3000
      };

      setGenerationProgress(80);

      // Prepare performance data
      const performanceData = {
        averagePPFD: 350,
        uniformityRatio: 0.87,
        spectralQualityIndex: 0.94,
        dailyLightIntegral: projectConfig.hoursPerDay * 350 * 3.6 / 1000, // Convert to mol/m²/day
        fixtureEfficiency: 2.9,
        degradationRate: 2.5,
        powerDensity: (projectConfig.totalPower * 1000) / projectConfig.area
      };

      // Generate the report
      const report = reportGenerator.generateComprehensiveReport(
        projectMetrics,
        energyData,
        costData,
        performanceData
      );

      setCurrentReport(report);
      onReportGenerated?.(report);
      setGenerationProgress(100);

    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel') => {
    if (!currentReport) return;
    
    try {
      let blob: Blob;
      let filename: string;
      
      if (format === 'pdf') {
        blob = await reportGenerator.exportToPDF(currentReport);
        filename = `${currentReport.projectMetrics.projectName.replace(/\s+/g, '_')}_Report.pdf`;
      } else {
        blob = await reportGenerator.exportToExcel(currentReport);
        filename = `${currentReport.projectMetrics.projectName.replace(/\s+/g, '_')}_Report.xlsx`;
      }
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Professional Report Builder
          </CardTitle>
          <CardDescription>
            Generate comprehensive reports with energy analytics, ROI calculations, and compliance documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Report Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Comprehensive">Comprehensive Analysis</SelectItem>
                      <SelectItem value="ROI">ROI & Financial</SelectItem>
                      <SelectItem value="Performance">Performance Only</SelectItem>
                      <SelectItem value="Compliance">Compliance Report</SelectItem>
                      <SelectItem value="Design">Design Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="facility-type">Facility Type</Label>
                  <Select value={facilityType} onValueChange={(value: any) => setFacilityType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greenhouse">Greenhouse</SelectItem>
                      <SelectItem value="vertical_farm">Vertical Farm</SelectItem>
                      <SelectItem value="cannabis">Cannabis Facility</SelectItem>
                      <SelectItem value="research">Research Facility</SelectItem>
                      <SelectItem value="commercial">Commercial Growing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={projectConfig.projectName}
                    onChange={(e) => setProjectConfig({
                      ...projectConfig,
                      projectName: e.target.value
                    })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="area">Area (sq ft)</Label>
                    <Input
                      id="area"
                      type="number"
                      value={projectConfig.area}
                      onChange={(e) => setProjectConfig({
                        ...projectConfig,
                        area: Number(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="power">Power (kW)</Label>
                    <Input
                      id="power"
                      type="number"
                      step="0.1"
                      value={projectConfig.totalPower}
                      onChange={(e) => setProjectConfig({
                        ...projectConfig,
                        totalPower: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="hours">Hours/Day</Label>
                    <Input
                      id="hours"
                      type="number"
                      value={projectConfig.hoursPerDay}
                      onChange={(e) => setProjectConfig({
                        ...projectConfig,
                        hoursPerDay: Number(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost">$/kWh</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={projectConfig.electricityCost}
                      onChange={(e) => setProjectConfig({
                        ...projectConfig,
                        electricityCost: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="investment">Initial Investment ($)</Label>
                  <Input
                    id="investment"
                    type="number"
                    value={projectConfig.initialInvestment}
                    onChange={(e) => setProjectConfig({
                      ...projectConfig,
                      initialInvestment: Number(e.target.value)
                    })}
                  />
                </div>

                <Button 
                  onClick={generateReport} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <Progress value={generationProgress} />
                    <p className="text-sm text-muted-foreground">
                      Progress: {generationProgress}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Metrics Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Quick Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentReport ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>ROI</Label>
                        <div className="text-2xl font-bold text-green-600">
                          {currentReport.roiCalculation.returnOnInvestment.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <Label>Payback Period</Label>
                        <div className="text-2xl font-bold text-blue-600">
                          {currentReport.roiCalculation.paybackPeriod.toFixed(1)} years
                        </div>
                      </div>
                      <div>
                        <Label>Annual Savings</Label>
                        <div className="text-2xl font-bold text-purple-600">
                          ${Object.values(currentReport.roiCalculation.operationalSavings)
                            .reduce((sum, val) => sum + val, 0)
                            .toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <Label>Energy Rating</Label>
                        <div className="text-2xl font-bold text-orange-600">
                          {currentReport.energyAnalytics.energyEfficiencyRating}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Key Achievements</span>
                      </div>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        {currentReport.executiveSummary.keyFindings.map((finding, index) => (
                          <li key={index}>• {finding}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => exportReport('pdf')} 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                      <Button 
                        onClick={() => exportReport('excel')} 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Excel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Generate a report to see metrics
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Environmental Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  Environmental Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentReport ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Carbon Reduction</Label>
                      <div className="text-xl font-bold text-green-600">
                        {(currentReport.environmentalImpact.carbonReduction / 1000).toFixed(1)} tons CO₂/year
                      </div>
                    </div>
                    <div>
                      <Label>Equivalent Impact</Label>
                      <div className="text-sm space-y-1">
                        <div>🌳 {currentReport.environmentalImpact.equivalentTrees} trees planted</div>
                        <div>🚗 {currentReport.environmentalImpact.equivalentMiles.toLocaleString()} miles not driven</div>
                        <div>💧 {currentReport.environmentalImpact.waterSavings.toLocaleString()} gallons saved</div>
                      </div>
                    </div>
                    <div>
                      <Label>Sustainability Score</Label>
                      <div className="flex items-center gap-2">
                        <Progress value={currentReport.environmentalImpact.sustainabilityScore} className="flex-1" />
                        <span className="text-sm font-medium">{currentReport.environmentalImpact.sustainabilityScore}/100</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="w-full justify-center">
                      <Award className="h-3 w-3 mr-1" />
                      LEED Qualified
                    </Badge>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Generate a report to see environmental impact
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Report Preview */}
          {currentReport && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Report Preview
                </CardTitle>
                <CardDescription>
                  {currentReport.metadata.reportType} Report - Generated {currentReport.metadata.generatedDate.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="summary">Executive Summary</TabsTrigger>
                    <TabsTrigger value="financial">Financial Analysis</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Project Overview</h3>
                        <p className="text-sm text-muted-foreground">
                          {currentReport.executiveSummary.projectOverview}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Key Findings</h3>
                        <ul className="text-sm space-y-1">
                          {currentReport.executiveSummary.keyFindings.map((finding, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Recommendations</h3>
                        <ul className="text-sm space-y-1">
                          {currentReport.executiveSummary.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="financial" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Investment Analysis
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Initial Investment:</span>
                            <span className="font-medium">${currentReport.roiCalculation.initialInvestment.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payback Period:</span>
                            <span className="font-medium">{currentReport.roiCalculation.paybackPeriod.toFixed(1)} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span>NPV (20 years):</span>
                            <span className="font-medium">${currentReport.roiCalculation.netPresentValue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>IRR:</span>
                            <span className="font-medium">{currentReport.roiCalculation.internalRateOfReturn.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Annual Savings Breakdown</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Energy Savings:</span>
                            <span className="font-medium">${currentReport.roiCalculation.operationalSavings.energySavings.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Labor Savings:</span>
                            <span className="font-medium">${currentReport.roiCalculation.operationalSavings.laborSavings.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Yield Improvement:</span>
                            <span className="font-medium">${currentReport.roiCalculation.operationalSavings.yieldImprovement.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Maintenance Reduction:</span>
                            <span className="font-medium">${currentReport.roiCalculation.operationalSavings.maintenanceReduction.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="performance" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Lighting Performance</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Average PPFD:</span>
                            <span className="font-medium">{currentReport.lightingPerformance.averagePPFD} μmol/m²/s</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Uniformity Ratio:</span>
                            <span className="font-medium">{(currentReport.lightingPerformance.uniformityRatio * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>DLI:</span>
                            <span className="font-medium">{currentReport.lightingPerformance.dailyLightIntegral.toFixed(1)} mol/m²/day</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fixture Efficiency:</span>
                            <span className="font-medium">{currentReport.lightingPerformance.fixtureEfficiency} μmol/J</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Energy Performance</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Power Consumption:</span>
                            <span className="font-medium">{currentReport.energyAnalytics.totalPowerConsumption} kW</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Annual Usage:</span>
                            <span className="font-medium">{currentReport.energyAnalytics.annualEnergyUsage.toLocaleString()} kWh</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Efficiency Rating:</span>
                            <span className="font-medium">{currentReport.energyAnalytics.energyEfficiencyRating}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Carbon Footprint:</span>
                            <span className="font-medium">{(currentReport.energyAnalytics.carbonFootprint / 1000).toFixed(1)} tons CO₂</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="compliance" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-semibold">Code Compliance Status</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold mb-2">Energy Code</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Standard:</span>
                              <span className="font-medium">{currentReport.lightingPerformance.complianceStatus.energyCode}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Compliance Level:</span>
                              <Badge variant="secondary">{currentReport.lightingPerformance.complianceStatus.complianceLevel}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Power Density:</span>
                              <span className="font-medium">{currentReport.lightingPerformance.complianceStatus.powerDensity} W/sq ft</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Below Code:</span>
                              <span className="font-medium text-green-600">{currentReport.lightingPerformance.complianceStatus.savings}%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Certifications</h3>
                          <div className="space-y-2">
                            <Badge variant="secondary" className="w-full justify-center">
                              <Award className="h-3 w-3 mr-1" />
                              DLC Premium Qualified
                            </Badge>
                            <Badge variant="secondary" className="w-full justify-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Title 24 Compliant
                            </Badge>
                            <Badge variant="secondary" className="w-full justify-center">
                              <Leaf className="h-3 w-3 mr-1" />
                              LEED Qualified
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}