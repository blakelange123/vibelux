'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Loader2, Download, FileText, FileSpreadsheet, Bot, Wand2, Settings, Eye, Send, RefreshCw } from 'lucide-react'
import { PDFReportGenerator } from '@/lib/pdf-report-generator'
import { WordReportGenerator } from '@/lib/word-report-generator'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'

interface ReportSection {
  id: string
  title: string
  enabled: boolean
  content?: string
  order: number
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  sections: ReportSection[]
  style: 'professional' | 'technical' | 'executive' | 'detailed'
}

const defaultTemplates: ReportTemplate[] = [
  {
    id: 'executive',
    name: 'Executive Summary',
    description: 'High-level overview for stakeholders',
    style: 'executive',
    sections: [
      { id: 'cover', title: 'Cover Page', enabled: true, order: 1 },
      { id: 'executive', title: 'Executive Summary', enabled: true, order: 2 },
      { id: 'roi', title: 'ROI Analysis', enabled: true, order: 3 },
      { id: 'recommendations', title: 'Key Recommendations', enabled: true, order: 4 },
    ],
  },
  {
    id: 'technical',
    name: 'Technical Report',
    description: 'Detailed technical analysis',
    style: 'technical',
    sections: [
      { id: 'cover', title: 'Cover Page', enabled: true, order: 1 },
      { id: 'toc', title: 'Table of Contents', enabled: true, order: 2 },
      { id: 'project', title: 'Project Overview', enabled: true, order: 3 },
      { id: 'room', title: 'Room Specifications', enabled: true, order: 4 },
      { id: 'fixtures', title: 'Fixture Analysis', enabled: true, order: 5 },
      { id: 'ppfd', title: 'PPFD Analysis', enabled: true, order: 6 },
      { id: 'electrical', title: 'Electrical Analysis', enabled: true, order: 7 },
      { id: 'environmental', title: 'Environmental Settings', enabled: true, order: 8 },
      { id: 'appendix', title: 'Technical Appendix', enabled: true, order: 9 },
    ],
  },
  {
    id: 'compliance',
    name: 'Compliance Report',
    description: 'For regulatory and certification purposes',
    style: 'professional',
    sections: [
      { id: 'cover', title: 'Cover Page', enabled: true, order: 1 },
      { id: 'compliance', title: 'Compliance Summary', enabled: true, order: 2 },
      { id: 'standards', title: 'Standards Met', enabled: true, order: 3 },
      { id: 'calculations', title: 'Calculations & Methodology', enabled: true, order: 4 },
      { id: 'certification', title: 'Certification Data', enabled: true, order: 5 },
    ],
  },
]

export default function AIReportBuilder({ projectData }: { projectData?: any }) {
  const { userId } = useAuth()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(defaultTemplates[0])
  const [customSections, setCustomSections] = useState<ReportSection[]>(defaultTemplates[0].sections)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'word' | 'both'>('both')
  const [aiPrompt, setAiPrompt] = useState('')
  const [reportStyle, setReportStyle] = useState({
    primaryColor: '#8B5CF6',
    companyName: 'Vibelux',
    companyLogo: '',
    includeCharts: true,
    includeImages: true,
    watermark: false,
  })

  // AI prompt examples
  const promptExamples = [
    "Create a report focusing on energy efficiency and cost savings",
    "Generate a compliance report for DLC certification",
    "Build a report emphasizing yield improvements and ROI",
    "Make a technical report with detailed PPFD analysis",
    "Create an executive summary for investors",
  ]

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a description of what you want in the report')
      return
    }

    setAiLoading(true)
    try {
      const response = await fetch('/api/ai/report-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          projectData,
          currentTemplate: selectedTemplate,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate report structure')

      const { template, sections, style } = await response.json()
      
      // Update the template and sections based on AI response
      if (template) {
        const matchedTemplate = defaultTemplates.find(t => t.id === template) || defaultTemplates[0]
        setSelectedTemplate(matchedTemplate)
      }
      
      if (sections) {
        setCustomSections(sections)
      }
      
      if (style) {
        setReportStyle(prev => ({ ...prev, ...style }))
      }

      toast.success('Report structure generated successfully!')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report structure')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSectionToggle = (sectionId: string) => {
    setCustomSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, enabled: !section.enabled }
          : section
      )
    )
  }

  const handleSectionReorder = (sectionId: string, direction: 'up' | 'down') => {
    setCustomSections(prev => {
      const index = prev.findIndex(s => s.id === sectionId)
      if (index === -1) return prev
      
      const newSections = [...prev]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      
      if (targetIndex >= 0 && targetIndex < newSections.length) {
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]]
        // Update order values
        newSections.forEach((section, idx) => {
          section.order = idx + 1
        })
      }
      
      return newSections
    })
  }

  const generateReport = async () => {
    setLoading(true)
    try {
      // Prepare report data with selected sections
      const reportData = {
        ...projectData,
        selectedSections: customSections.filter(s => s.enabled),
        style: reportStyle,
        generatedDate: new Date(),
      }

      if (exportFormat === 'pdf' || exportFormat === 'both') {
        const pdfGenerator = new PDFReportGenerator({
          companyName: reportStyle.companyName,
          companyLogo: reportStyle.companyLogo,
          primaryColor: hexToRgb(reportStyle.primaryColor),
        })
        pdfGenerator.generateReport(reportData)
      }

      if (exportFormat === 'word' || exportFormat === 'both') {
        const wordGenerator = new WordReportGenerator({
          companyName: reportStyle.companyName,
          companyLogo: reportStyle.companyLogo,
          primaryColor: reportStyle.primaryColor,
          includeTableOfContents: customSections.some(s => s.id === 'toc' && s.enabled),
        })
        await wordGenerator.generateReport(reportData)
      }

      toast.success(`Report${exportFormat === 'both' ? 's' : ''} generated successfully!`)
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 139, g: 92, b: 246 }
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-purple-600" />
          <div>
            <CardTitle className="text-2xl">AI Report Builder</CardTitle>
            <CardDescription>
              Use AI to create professional reports or customize manually
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ai" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="customize" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Customize
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="ai-prompt">Describe what you want in your report</Label>
                <Textarea
                  id="ai-prompt"
                  placeholder="E.g., Create a detailed technical report focusing on PPFD analysis and energy efficiency for a cannabis cultivation facility..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="min-h-[100px] mt-2"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Quick examples:</p>
                <div className="flex flex-wrap gap-2">
                  {promptExamples.map((example, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => setAiPrompt(example)}
                      className="text-xs"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleAIGenerate}
                disabled={aiLoading || !aiPrompt.trim()}
                className="w-full"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Report Structure...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Generate Report Structure
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="customize" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="template">Base Template</Label>
                <Select
                  value={selectedTemplate.id}
                  onValueChange={(value) => {
                    const template = defaultTemplates.find(t => t.id === value)!
                    setSelectedTemplate(template)
                    setCustomSections(template.sections)
                  }}
                >
                  <SelectTrigger id="template" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {template.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Report Sections</Label>
                <div className="space-y-2 mt-2 border rounded-lg p-4">
                  {customSections
                    .sort((a, b) => a.order - b.order)
                    .map((section, index) => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={section.enabled}
                            onCheckedChange={() => handleSectionToggle(section.id)}
                          />
                          <span className={section.enabled ? '' : 'text-muted-foreground'}>
                            {section.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSectionReorder(section.id, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSectionReorder(section.id, 'down')}
                            disabled={index === customSections.length - 1}
                          >
                            ↓
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={reportStyle.companyName}
                    onChange={(e) => setReportStyle(prev => ({ ...prev, companyName: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={reportStyle.primaryColor}
                      onChange={(e) => setReportStyle(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-20 h-10"
                    />
                    <Input
                      value={reportStyle.primaryColor}
                      onChange={(e) => setReportStyle(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-charts">Include Charts & Visualizations</Label>
                <Switch
                  id="include-charts"
                  checked={reportStyle.includeCharts}
                  onCheckedChange={(checked) => setReportStyle(prev => ({ ...prev, includeCharts: checked }))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="border rounded-lg p-6 bg-muted/20">
              <h3 className="text-lg font-semibold mb-4">Report Preview</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{reportStyle.companyName} - {projectData?.projectName || 'Project Report'}</span>
                </div>
                <div className="pl-7 space-y-2">
                  {customSections
                    .filter(s => s.enabled)
                    .sort((a, b) => a.order - b.order)
                    .map((section, idx) => (
                      <div key={section.id} className="text-sm text-muted-foreground">
                        {idx + 1}. {section.title}
                      </div>
                    ))}
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Report will be generated in {exportFormat === 'both' ? 'PDF and Word formats' : `${exportFormat.toUpperCase()} format`}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="export-format">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger id="export-format" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Only
                  </div>
                </SelectItem>
                <SelectItem value="word">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Word Only (.docx)
                  </div>
                </SelectItem>
                <SelectItem value="both">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Both PDF & Word
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generateReport}
            disabled={loading || !projectData}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}