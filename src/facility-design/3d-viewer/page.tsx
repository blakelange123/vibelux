'use client';

import { useState } from 'react';
import AutodeskViewer from '@/components/AutodeskViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Download,
  Share2,
  MessageSquare,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Building,
  Layers,
  Box,
  Lightbulb
} from 'lucide-react';
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from '@/components/ui/animated-card';

interface ModelVersion {
  id: string;
  name: string;
  version: string;
  uploadedBy: string;
  uploadedAt: Date;
  status: 'current' | 'outdated' | 'review';
  changes: string[];
  fileSize: string;
}

const mockVersions: ModelVersion[] = [
  {
    id: 'v3',
    name: 'Facility_Layout_v3.rvt',
    version: '3.0',
    uploadedBy: 'John Smith',
    uploadedAt: new Date('2024-06-20'),
    status: 'current',
    changes: [
      'Updated HVAC routing',
      'Added emergency exits',
      'Revised fixture placements'
    ],
    fileSize: '127 MB'
  },
  {
    id: 'v2',
    name: 'Facility_Layout_v2.rvt',
    version: '2.0',
    uploadedBy: 'Sarah Chen',
    uploadedAt: new Date('2024-06-10'),
    status: 'outdated',
    changes: [
      'Initial lighting layout',
      'Structural modifications'
    ],
    fileSize: '112 MB'
  }
];

export default function FacilityDesign3DViewerPage() {
  const [selectedVersion, setSelectedVersion] = useState(mockVersions[0]);
  const [activeTab, setActiveTab] = useState('viewer');

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">3D Facility Design Viewer</h1>
          <p className="text-muted-foreground">
            Review and collaborate on facility designs using Autodesk Viewer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Comments (5)
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Version Info Bar */}
      <AnimatedCard className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Current Version</p>
                <p className="font-semibold">{selectedVersion.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uploaded By</p>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{selectedVersion.uploadedBy}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upload Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">
                    {selectedVersion.uploadedAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  className={
                    selectedVersion.status === 'current'
                      ? 'bg-green-500'
                      : selectedVersion.status === 'review'
                      ? 'bg-yellow-500'
                      : 'bg-gray-500'
                  }
                >
                  {selectedVersion.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 3D Viewer */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="viewer">3D View</TabsTrigger>
              <TabsTrigger value="sheets">Sheets</TabsTrigger>
              <TabsTrigger value="clash">Clash Detection</TabsTrigger>
              <TabsTrigger value="markup">Markups</TabsTrigger>
            </TabsList>

            <TabsContent value="viewer">
              <AutodeskViewer
                urn="demo-urn-12345"
                showToolbar={true}
                enableMeasurements={true}
                enableSectioning={true}
                onModelLoad={(viewer) => {
                }}
                onSelectionChange={(selection) => {
                }}
              />
            </TabsContent>

            <TabsContent value="sheets">
              <Card>
                <CardHeader>
                  <CardTitle>Drawing Sheets</CardTitle>
                  <CardDescription>2D drawings extracted from the model</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">A-101 Floor Plan</p>
                          <p className="text-sm text-muted-foreground">Level 1 - Growing Area</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">E-201 Electrical Plan</p>
                          <p className="text-sm text-muted-foreground">Power Distribution</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">M-301 HVAC Layout</p>
                          <p className="text-sm text-muted-foreground">Climate Control Systems</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clash">
              <Card>
                <CardHeader>
                  <CardTitle>Clash Detection Results</CardTitle>
                  <CardDescription>Conflicts found between building systems</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      3 clashes detected in the current model
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-red-600">HVAC vs Structural</p>
                          <p className="text-sm text-muted-foreground">
                            Duct intersects with beam at grid C-4
                          </p>
                        </div>
                        <Badge variant="destructive">Critical</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">View in Model</Button>
                        <Button size="sm" variant="outline">Assign</Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-yellow-600">Electrical vs Plumbing</p>
                          <p className="text-sm text-muted-foreground">
                            Conduit too close to water line at grid F-7
                          </p>
                        </div>
                        <Badge className="bg-yellow-500">Warning</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">View in Model</Button>
                        <Button size="sm" variant="outline">Assign</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="markup">
              <Card>
                <CardHeader>
                  <CardTitle>Markups & Annotations</CardTitle>
                  <CardDescription>Review comments and redlines on the model</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                          JD
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">Jane Doe</p>
                            <span className="text-xs text-muted-foreground">2 hours ago</span>
                          </div>
                          <p className="text-sm">
                            Need to verify clearance around grow light fixtures in Zone A
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="ghost">Reply</Button>
                            <Button size="sm" variant="ghost">View</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                          MS
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">Mike Smith</p>
                            <span className="text-xs text-muted-foreground">1 day ago</span>
                          </div>
                          <p className="text-sm">
                            Updated electrical panel location per field conditions
                          </p>
                          <Badge className="bg-green-500 mt-1">Resolved</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Model Info */}
          <Card>
            <CardHeader>
              <CardTitle>Model Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Facility Type</p>
                  <p className="font-medium">Vertical Farm - 3 Tiers</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Area</p>
                  <p className="font-medium">45,000 sq ft</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Disciplines</p>
                  <p className="font-medium">Arch, Struct, MEP</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Light Fixtures</p>
                  <p className="font-medium">1,247 units</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version History */}
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockVersions.map((version) => (
                  <div
                    key={version.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedVersion.id === version.id
                        ? 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'
                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-sm">{version.version}</p>
                      <Badge
                        variant={version.status === 'current' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {version.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {version.uploadedAt.toLocaleDateString()} • {version.fileSize}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {version.uploadedBy}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export to IFC
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="w-4 h-4 mr-2" />
                Share View Link
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Review Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}