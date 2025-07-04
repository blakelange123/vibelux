'use client'

import React, { useState } from 'react'
import AIReportBuilder from '@/components/AIReportBuilder'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Sparkles, Download, BookOpen, CheckCircle } from 'lucide-react'

// Sample project data for demonstration
const sampleProjectData = {
  projectName: 'Cannabis Cultivation Facility - Phase 1',
  clientName: 'Green Valley Farms',
  location: 'Denver, Colorado',
  preparedBy: 'John Smith, Lighting Designer',
  roomDimensions: {
    width: 40,
    length: 80,
    height: 14,
  },
  fixtures: [
    {
      brand: 'Fluence',
      model: 'SPYDR 2i',
      wattage: 632,
      ppf: 1702,
      efficacy: 2.7,
      position: { x: 10, y: 10 },
      enabled: true,
    },
    // Add more fixtures as needed
  ],
  ppfdAnalysis: {
    min: 650,
    max: 950,
    avg: 800,
    uniformity: 0.81,
    dli: 43.2,
  },
  electricalAnalysis: {
    totalPower: 25280,
    circuitsRequired: 12,
    estimatedCost: 2840.50,
    voltage: 480,
    phaseType: '3-Phase',
  },
  roi: {
    initialCost: 125000,
    annualSavings: 42000,
    paybackPeriod: 2.98,
    energyCostPerKWh: 0.12,
  },
  environmentalSettings: {
    temperature: 75,
    humidity: 60,
    co2: 1200,
    photoperiod: 12,
  },
}

export default function EnhancedReportsPage() {
  const [activeTab, setActiveTab] = useState('builder')

  const features = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: 'Microsoft Word Export',
      description: 'Generate editable .docx files that can be customized before converting to PDF',
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'AI-Powered Builder',
      description: 'Describe what you want and let AI create the perfect report structure',
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: 'Smart Templates',
      description: 'Choose from executive, technical, or compliance report templates',
    },
    {
      icon: <Download className="h-5 w-5" />,
      title: 'Multiple Formats',
      description: 'Export to PDF, Word, or both formats simultaneously',
    },
  ]

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
          Enhanced Report Generation
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create professional reports with AI assistance, export to Word for editing, and generate beautiful PDFs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, idx) => (
          <Card key={idx} className="border-purple-200 dark:border-purple-900">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-600">
                  {feature.icon}
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="improvements">What's New</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <AIReportBuilder projectData={sampleProjectData} />
        </TabsContent>

        <TabsContent value="improvements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Generation Improvements</CardTitle>
              <CardDescription>
                Based on your feedback, we've completely redesigned our report generation system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">✨ New Features</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Microsoft Word Export</p>
                      <p className="text-sm text-muted-foreground">
                        Generate .docx files that can be edited before finalizing as PDFs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">AI Report Builder</p>
                      <p className="text-sm text-muted-foreground">
                        Simply describe what you want and AI will structure your report
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Enhanced Chart Quality</p>
                      <p className="text-sm text-muted-foreground">
                        Vector graphics for sharper charts in PDF exports
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Customizable Sections</p>
                      <p className="text-sm text-muted-foreground">
                        Enable/disable sections and reorder them to match your needs
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">🎨 Better Layouts</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">Professional Headers</p>
                    <p className="text-sm text-muted-foreground">
                      Company branding with custom colors and logos
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">Table of Contents</p>
                    <p className="text-sm text-muted-foreground">
                      Auto-generated with page numbers
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">Data Tables</p>
                    <p className="text-sm text-muted-foreground">
                      Clean, professional table formatting
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">Image Support</p>
                    <p className="text-sm text-muted-foreground">
                      Embed charts, heatmaps, and diagrams
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Example Report Prompts</CardTitle>
              <CardDescription>
                Try these prompts with the AI Report Builder to see how it works
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-1">Energy Efficiency Focus</p>
                  <p className="text-sm text-muted-foreground">
                    "Create a report focusing on energy efficiency and cost savings. Include detailed electrical analysis, 
                    ROI projections, and recommendations for reducing power consumption while maintaining optimal PPFD levels."
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-1">Compliance Documentation</p>
                  <p className="text-sm text-muted-foreground">
                    "Generate a compliance report for DLC certification. Include all required photometric data, 
                    electrical specifications, and safety calculations. Focus on meeting regulatory standards."
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-1">Executive Summary</p>
                  <p className="text-sm text-muted-foreground">
                    "Create an executive summary for investors highlighting the key metrics, ROI analysis, 
                    and competitive advantages of our lighting design. Keep it concise with focus on business impact."
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-1">Technical Deep Dive</p>
                  <p className="text-sm text-muted-foreground">
                    "Build a comprehensive technical report with detailed PPFD analysis, spectrum distribution, 
                    thermal management considerations, and integration with environmental controls. Include all calculations."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}