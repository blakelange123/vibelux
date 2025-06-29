import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Check, X, Zap, Activity, FileText, 
  Settings, Download, Eye, EyeOff, MapPin, Info,
  Calendar, Battery, Shield, DoorOpen, Route
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  EmergencyLightingCalculator,
  type EmergencyFixture,
  type EgressPath,
  type ExitDoor,
  type Obstacle,
  type EmergencyAnalysisResult
} from '@/lib/emergency-lighting';
import { exportToPDF } from '@/lib/export-utils';

interface EmergencyLightingPanelProps {
  roomDimensions: { width: number; length: number; height: number };
  emergencyFixtures: EmergencyFixture[];
  egressPaths: EgressPath[];
  exitDoors: ExitDoor[];
  obstacles: Obstacle[];
  onAddEmergencyFixture: (fixture: EmergencyFixture) => void;
  onUpdateEmergencyFixture: (id: string, updates: Partial<EmergencyFixture>) => void;
  onDeleteEmergencyFixture: (id: string) => void;
  onAddEgressPath: (path: EgressPath) => void;
  onUpdateEgressPath: (id: string, updates: Partial<EgressPath>) => void;
  onDeleteEgressPath: (id: string) => void;
  onAddExitDoor: (door: ExitDoor) => void;
  onUpdateExitDoor: (id: string, updates: Partial<ExitDoor>) => void;
  onDeleteExitDoor: (id: string) => void;
  showOverlay: boolean;
  onToggleOverlay: (show: boolean) => void;
  overlayType: 'illuminance' | 'visibility' | 'coverage';
  onChangeOverlayType: (type: 'illuminance' | 'visibility' | 'coverage') => void;
}

export function EmergencyLightingPanel({
  roomDimensions,
  emergencyFixtures,
  egressPaths,
  exitDoors,
  obstacles,
  onAddEmergencyFixture,
  onUpdateEmergencyFixture,
  onDeleteEmergencyFixture,
  onAddEgressPath,
  onUpdateEgressPath,
  onDeleteEgressPath,
  onAddExitDoor,
  onUpdateExitDoor,
  onDeleteExitDoor,
  showOverlay,
  onToggleOverlay,
  overlayType,
  onChangeOverlayType
}: EmergencyLightingPanelProps) {
  const [selectedCode, setSelectedCode] = useState<'NFPA101' | 'IBC' | 'OSHA'>('NFPA101');
  const [analysisResult, setAnalysisResult] = useState<EmergencyAnalysisResult | null>(null);
  const [selectedTool, setSelectedTool] = useState<'fixture' | 'path' | 'exit' | null>(null);
  const [showAutoPlacement, setShowAutoPlacement] = useState(false);

  // Run analysis whenever relevant data changes
  useEffect(() => {
    if (emergencyFixtures.length > 0 || egressPaths.length > 0) {
      const result = EmergencyLightingCalculator.analyzeEmergencyLighting(
        emergencyFixtures,
        egressPaths,
        roomDimensions,
        selectedCode,
        obstacles,
        exitDoors
      );
      setAnalysisResult(result);
    } else {
      setAnalysisResult(null);
    }
  }, [emergencyFixtures, egressPaths, roomDimensions, selectedCode, obstacles, exitDoors]);

  const handleAutoPlaceFixtures = () => {
    const optimized = EmergencyLightingCalculator.optimizeEmergencyLayout(
      roomDimensions,
      egressPaths,
      exitDoors,
      obstacles,
      selectedCode
    );
    
    // Add the optimized fixtures
    optimized.fixtures.forEach(fixture => {
      onAddEmergencyFixture(fixture);
    });
    
    setShowAutoPlacement(false);
  };

  const handleExportReport = async () => {
    if (!analysisResult) return;
    
    const report = EmergencyLightingCalculator.generateComplianceReport(
      analysisResult,
      selectedCode,
      {
        name: 'Emergency Lighting Analysis',
        address: 'Project Address',
        date: new Date(),
        inspector: 'System Generated'
      }
    );
    
    // Generate PDF report
    await exportToPDF({
      projectName: 'Emergency Lighting Report',
      fixtures: [],
      roomDimensions,
      emergencyFixtures,
      analysisResult: report,
      metrics: {
        totalFixtures: emergencyFixtures.length,
        totalPower: emergencyFixtures.reduce((sum, f) => sum + (f.wattage || 0), 0),
        totalPPF: 0,
        avgPPFD: 0
      }
    });
  };

  const handleGenerateMaintenanceSchedule = () => {
    const schedule = EmergencyLightingCalculator.generateMaintenanceSchedule(emergencyFixtures);
    
    // Export as calendar file or display in UI
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Emergency Lighting Compliance
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value as any)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="NFPA101">NFPA 101</option>
            <option value="IBC">IBC</option>
            <option value="OSHA">OSHA</option>
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAutoPlacement(true)}
            className="gap-1"
          >
            <Zap className="w-4 h-4" />
            Auto-Place
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportReport}
            disabled={!analysisResult}
            className="gap-1"
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Compliance Status */}
      {analysisResult && (
        <Card className={`border-2 ${analysisResult.compliant ? 'border-green-500' : 'border-red-500'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {analysisResult.compliant ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-green-500">Compliant</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-red-500" />
                    <span className="text-red-500">Non-Compliant</span>
                  </>
                )}
              </span>
              <Badge variant={analysisResult.compliant ? 'default' : 'destructive'}>
                {analysisResult.violations.length} Violations
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {analysisResult.exitSignCoverage.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500">Exit Sign Coverage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {analysisResult.photometricAnalysis?.minIlluminance.toFixed(1)} lux
                </div>
                <div className="text-xs text-gray-500">Min Illuminance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {analysisResult.batteryLoadAnalysis.runtime} min
                </div>
                <div className="text-xs text-gray-500">Battery Runtime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {analysisResult.maintenanceStatus.overdueTests.length}
                </div>
                <div className="text-xs text-gray-500">Overdue Tests</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="placement" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="placement">Placement</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="battery">Battery</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        {/* Placement Tab */}
        <TabsContent value="placement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Placement Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={selectedTool === 'fixture' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTool('fixture')}
                  className="gap-1"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Emergency Light
                </Button>
                <Button
                  variant={selectedTool === 'exit' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTool('exit')}
                  className="gap-1"
                >
                  <DoorOpen className="w-4 h-4" />
                  Exit Door
                </Button>
                <Button
                  variant={selectedTool === 'path' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTool('path')}
                  className="gap-1"
                >
                  <Route className="w-4 h-4" />
                  Egress Path
                </Button>
              </div>

              {/* Fixture List */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Emergency Fixtures ({emergencyFixtures.length})</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {emergencyFixtures.map(fixture => (
                    <div key={fixture.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        {fixture.customName || fixture.id} - {fixture.type}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteEmergencyFixture(fixture.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Path List */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Egress Paths ({egressPaths.length})</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {egressPaths.map(path => (
                    <div key={path.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        {path.name} - {path.points.length} points
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteEgressPath(path.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual Overlays */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Visual Overlays</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Show Overlay</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleOverlay(!showOverlay)}
                >
                  {showOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {showOverlay && (
                <select
                  value={overlayType}
                  onChange={(e) => onChangeOverlayType(e.target.value as any)}
                  className="w-full px-3 py-1 border rounded-md text-sm"
                >
                  <option value="illuminance">Illuminance Levels</option>
                  <option value="visibility">Exit Sign Visibility</option>
                  <option value="coverage">Coverage Gaps</option>
                </select>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {analysisResult?.photometricAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Photometric Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Min Illuminance</div>
                    <div className="text-lg font-semibold">
                      {analysisResult.photometricAnalysis.minIlluminance.toFixed(1)} lux
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Max Illuminance</div>
                    <div className="text-lg font-semibold">
                      {analysisResult.photometricAnalysis.maxIlluminance.toFixed(1)} lux
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Average</div>
                    <div className="text-lg font-semibold">
                      {analysisResult.photometricAnalysis.avgIlluminance.toFixed(1)} lux
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Uniformity</div>
                    <div className="text-lg font-semibold">
                      {analysisResult.photometricAnalysis.uniformity.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Path Illuminance */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Path Illuminance</h4>
                  {Array.from(analysisResult.illuminanceLevels.entries()).map(([pathId, illuminance]) => {
                    const path = egressPaths.find(p => p.id === pathId);
                    return (
                      <div key={pathId} className="flex items-center justify-between">
                        <span className="text-sm">{path?.name || pathId}</span>
                        <span className={`text-sm font-medium ${illuminance >= 10.76 ? 'text-green-600' : 'text-red-600'}`}>
                          {illuminance.toFixed(1)} lux
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-red-600">
                Violations ({analysisResult?.violations.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analysisResult?.violations.map((violation, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <span className="text-sm">{violation}</span>
                </div>
              ))}
              {(!analysisResult || analysisResult.violations.length === 0) && (
                <div className="text-sm text-gray-500 text-center py-4">
                  No violations found
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-blue-600">
                Recommendations ({analysisResult?.recommendations.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analysisResult?.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Battery Tab */}
        <TabsContent value="battery" className="space-y-4">
          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Battery className="w-4 h-4" />
                  Battery Backup Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Emergency Load</span>
                    <span className="font-medium">{analysisResult.batteryLoadAnalysis.totalLoad.toFixed(0)}W</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Minimum Runtime</span>
                    <span className={`font-medium ${analysisResult.batteryLoadAnalysis.adequate ? 'text-green-600' : 'text-red-600'}`}>
                      {analysisResult.batteryLoadAnalysis.runtime} minutes
                    </span>
                  </div>
                  <Progress 
                    value={(analysisResult.batteryLoadAnalysis.runtime / 90) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Fixture Battery Status */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Fixture Battery Status</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {analysisResult.batteryLoadAnalysis.fixtures.map(fixture => (
                      <div key={fixture.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{fixture.id}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{fixture.load.toFixed(1)}W</span>
                          <Badge variant={fixture.runtime >= 90 ? 'default' : 'destructive'}>
                            {fixture.runtime} min
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Maintenance Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysisResult && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Overdue Tests</div>
                      <div className="text-2xl font-bold text-red-600">
                        {analysisResult.maintenanceStatus.overdueTests.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Upcoming Tests</div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {analysisResult.maintenanceStatus.upcomingTests.length}
                      </div>
                    </div>
                  </div>

                  {analysisResult.maintenanceStatus.lastTestDate && (
                    <div>
                      <div className="text-sm text-gray-500">Last Test Date</div>
                      <div className="text-sm font-medium">
                        {analysisResult.maintenanceStatus.lastTestDate.toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateMaintenanceSchedule}
                    className="w-full gap-1"
                  >
                    <Calendar className="w-4 h-4" />
                    Generate Schedule
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Auto-Placement Dialog */}
      {showAutoPlacement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Auto-Place Emergency Fixtures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                This will automatically place emergency fixtures based on {selectedCode} requirements.
                Existing fixtures will be preserved.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAutoPlacement(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAutoPlaceFixtures}
                  className="flex-1"
                >
                  Auto-Place
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}