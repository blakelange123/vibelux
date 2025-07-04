"use client"

import { useState } from 'react'
import { 
  Shield,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  ClipboardCheck,
  Calendar,
  Target,
  Book,
  Download,
  Upload,
  ChevronRight,
  Info,
  Award,
  TrendingUp,
  Clock,
  Users,
  Leaf,
  Package,
  Droplets,
  Bug,
  FileText,
  AlertCircle,
  BarChart3
} from 'lucide-react'
import { GlobalGapAIAssistant } from './GlobalGapAIAssistant'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface CertificationRequirement {
  id: string
  category: string
  requirement: string
  description: string
  status: 'compliant' | 'non-compliant' | 'pending' | 'not-applicable'
  priority: 'critical' | 'major' | 'minor' | 'recommendation'
  evidence?: string[]
  dueDate?: string
  notes?: string
}

interface AuditTask {
  id: string
  task: string
  assignedTo?: string
  dueDate: string
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  category: string
  documents: string[]
}

interface ComplianceScore {
  category: string
  score: number
  maxScore: number
  percentage: number
  trend: 'improving' | 'stable' | 'declining'
}

interface DocumentTemplate {
  id: string
  name: string
  category: string
  description: string
  lastUpdated: string
  format: 'pdf' | 'excel' | 'word'
}

export function GlobalGapCertification() {
  const [activeView, setActiveView] = useState<'overview' | 'requirements' | 'documents' | 'audit' | 'training' | 'ai-assistant'>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showOnlyNonCompliant, setShowOnlyNonCompliant] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  // Certification requirements based on GlobalG.A.P. standards
  const requirements: CertificationRequirement[] = [
    // Food Safety
    {
      id: 'fs-001',
      category: 'Food Safety',
      requirement: 'Risk Assessment Documentation',
      description: 'Documented risk assessment for physical, chemical, and biological hazards',
      status: 'compliant',
      priority: 'critical',
      evidence: ['Risk_Assessment_2024.pdf', 'HACCP_Plan.pdf'],
      notes: 'Updated quarterly, last review 01/15/2024'
    },
    {
      id: 'fs-002',
      category: 'Food Safety',
      requirement: 'Hygiene Procedures',
      description: 'Written hygiene procedures and training records for all staff',
      status: 'pending',
      priority: 'critical',
      dueDate: '2024-02-15',
      notes: 'Training scheduled for new employees'
    },
    {
      id: 'fs-003',
      category: 'Food Safety',
      requirement: 'Water Quality Testing',
      description: 'Annual water quality analysis for irrigation and processing',
      status: 'compliant',
      priority: 'critical',
      evidence: ['Water_Test_Results_2024.pdf']
    },
    // Traceability
    {
      id: 'tr-001',
      category: 'Traceability',
      requirement: 'Product Identification System',
      description: 'Unique batch/lot identification from seed to sale',
      status: 'compliant',
      priority: 'critical',
      evidence: ['Blockchain_Traceability_System.pdf'],
      notes: 'Integrated with blockchain system'
    },
    {
      id: 'tr-002',
      category: 'Traceability',
      requirement: 'Record Keeping',
      description: 'Maintain records for minimum 2 years',
      status: 'compliant',
      priority: 'major',
      evidence: ['Record_Retention_Policy.pdf']
    },
    // Environment
    {
      id: 'env-001',
      category: 'Environment',
      requirement: 'Waste Management Plan',
      description: 'Documented plan for waste reduction, recycling, and disposal',
      status: 'non-compliant',
      priority: 'major',
      dueDate: '2024-03-01',
      notes: 'Draft plan under review'
    },
    {
      id: 'env-002',
      category: 'Environment',
      requirement: 'Energy Efficiency Measures',
      description: 'Implementation of energy-saving technologies and monitoring',
      status: 'compliant',
      priority: 'minor',
      evidence: ['LED_Efficiency_Report.pdf', 'Energy_Monitoring_Dashboard.pdf']
    },
    // Workers Health & Safety
    {
      id: 'whs-001',
      category: 'Worker Safety',
      requirement: 'Safety Training Records',
      description: 'Documented safety training for all workers including PPE usage',
      status: 'pending',
      priority: 'critical',
      dueDate: '2024-02-20'
    },
    {
      id: 'whs-002',
      category: 'Worker Safety',
      requirement: 'First Aid Provisions',
      description: 'Adequate first aid equipment and trained personnel',
      status: 'compliant',
      priority: 'major',
      evidence: ['First_Aid_Certificate.pdf', 'Equipment_Checklist.pdf']
    },
    // Plant Protection
    {
      id: 'pp-001',
      category: 'Plant Protection',
      requirement: 'IPM Documentation',
      description: 'Integrated Pest Management plan with intervention thresholds',
      status: 'compliant',
      priority: 'critical',
      evidence: ['IPM_Plan_2024.pdf', 'Pest_Monitoring_Records.xlsx'],
      notes: 'Automated IPM system in place'
    },
    {
      id: 'pp-002',
      category: 'Plant Protection',
      requirement: 'Pesticide Application Records',
      description: 'Complete records of all applications including REI and PHI',
      status: 'compliant',
      priority: 'critical',
      evidence: ['Spray_Records_2024.xlsx']
    }
  ]

  // Audit tasks
  const auditTasks: AuditTask[] = [
    {
      id: 'task-001',
      task: 'Update waste management plan',
      assignedTo: 'John Smith',
      dueDate: '2024-03-01',
      status: 'in-progress',
      category: 'Environment',
      documents: []
    },
    {
      id: 'task-002',
      task: 'Complete safety training for new employees',
      assignedTo: 'Sarah Johnson',
      dueDate: '2024-02-20',
      status: 'pending',
      category: 'Worker Safety',
      documents: ['Training_Schedule.pdf']
    },
    {
      id: 'task-003',
      task: 'Schedule annual water quality testing',
      dueDate: '2024-12-01',
      status: 'pending',
      category: 'Food Safety',
      documents: []
    },
    {
      id: 'task-004',
      task: 'Review and update risk assessment',
      assignedTo: 'Mike Chen',
      dueDate: '2024-04-15',
      status: 'pending',
      category: 'Food Safety',
      documents: ['Risk_Assessment_Template.docx']
    }
  ]

  // Compliance scores by category
  const complianceScores: ComplianceScore[] = [
    { category: 'Food Safety', score: 45, maxScore: 50, percentage: 90, trend: 'stable' },
    { category: 'Traceability', score: 20, maxScore: 20, percentage: 100, trend: 'stable' },
    { category: 'Environment', score: 22, maxScore: 30, percentage: 73, trend: 'improving' },
    { category: 'Worker Safety', score: 35, maxScore: 40, percentage: 87.5, trend: 'improving' },
    { category: 'Plant Protection', score: 28, maxScore: 30, percentage: 93, trend: 'stable' }
  ]

  // Document templates
  const documentTemplates: DocumentTemplate[] = [
    {
      id: 'doc-001',
      name: 'Risk Assessment Template',
      category: 'Food Safety',
      description: 'Comprehensive template for food safety risk assessment',
      lastUpdated: '2024-01-10',
      format: 'excel'
    },
    {
      id: 'doc-002',
      name: 'Training Record Form',
      category: 'Worker Safety',
      description: 'Employee training documentation template',
      lastUpdated: '2024-01-05',
      format: 'word'
    },
    {
      id: 'doc-003',
      name: 'Spray Record Template',
      category: 'Plant Protection',
      description: 'Pesticide application record keeping',
      lastUpdated: '2023-12-20',
      format: 'excel'
    },
    {
      id: 'doc-004',
      name: 'Internal Audit Checklist',
      category: 'Quality System',
      description: 'Complete GlobalG.A.P. internal audit checklist',
      lastUpdated: '2024-01-15',
      format: 'pdf'
    }
  ]

  const calculateOverallCompliance = () => {
    const totalScore = complianceScores.reduce((sum, cat) => sum + cat.score, 0)
    const totalMaxScore = complianceScores.reduce((sum, cat) => sum + cat.maxScore, 0)
    return Math.round((totalScore / totalMaxScore) * 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-400 bg-green-500/20'
      case 'non-compliant': return 'text-red-400 bg-red-500/20'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      case 'not-applicable': return 'text-gray-400 bg-gray-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400'
      case 'major': return 'text-orange-400'
      case 'minor': return 'text-yellow-400'
      case 'recommendation': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true)
    
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      const margin = 20
      const contentWidth = pageWidth - 2 * margin
      let yPosition = margin
      
      // Title
      doc.setFontSize(20)
      doc.setTextColor(88, 28, 135) // Purple color
      doc.text('GlobalGAP Compliance Report', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15
      
      // Date
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20
      
      // Overall Compliance Score
      if (complianceScores && complianceScores.length > 0) {
        const totalScore = complianceScores.reduce((sum, cat) => sum + cat.score, 0)
        const totalMaxScore = complianceScores.reduce((sum, cat) => sum + cat.maxScore, 0)
        const overallPercentage = Math.round((totalScore / totalMaxScore) * 100)
        
        doc.setFontSize(16)
        doc.setTextColor(0, 0, 0)
        doc.text('Overall Compliance Score', margin, yPosition)
        yPosition += 10
        
        // Draw progress bar
        doc.setDrawColor(200, 200, 200)
        doc.rect(margin, yPosition, contentWidth, 10)
        doc.setFillColor(88, 28, 135)
        doc.rect(margin, yPosition, (contentWidth * overallPercentage) / 100, 10, 'F')
        
        doc.setFontSize(12)
        doc.text(`${overallPercentage}%`, pageWidth / 2, yPosition + 7, { align: 'center' })
        yPosition += 20
      }
      
      // Compliance by Category
      doc.setFontSize(14)
      doc.text('Compliance by Category', margin, yPosition)
      yPosition += 10
      
      const categoryData = complianceScores.map(cat => [
        cat.category,
        `${cat.score}/${cat.maxScore}`,
        `${cat.percentage}%`,
        cat.trend === 'improving' ? '↑' : cat.trend === 'declining' ? '↓' : '→'
      ])
      
      doc.autoTable({
        startY: yPosition,
        head: [['Category', 'Score', 'Compliance', 'Trend']],
        body: categoryData,
        theme: 'striped',
        headStyles: { fillColor: [88, 28, 135] },
        margin: { left: margin, right: margin }
      })
      
      yPosition = (doc as any).lastAutoTable.finalY + 20
      
      // Requirements Summary
      if (yPosition > 200) {
        doc.addPage()
        yPosition = margin
      }
      
      doc.setFontSize(14)
      doc.text('Requirements Summary', margin, yPosition)
      yPosition += 10
      
      const statusCounts = {
        compliant: requirements.filter(r => r.status === 'compliant').length,
        'non-compliant': requirements.filter(r => r.status === 'non-compliant').length,
        pending: requirements.filter(r => r.status === 'pending').length,
        'not-applicable': requirements.filter(r => r.status === 'not-applicable').length
      }
      
      const summaryData = Object.entries(statusCounts).map(([status, count]) => [
        status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
        count.toString()
      ])
      
      doc.autoTable({
        startY: yPosition,
        head: [['Status', 'Count']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [88, 28, 135] },
        margin: { left: margin, right: margin }
      })
      
      yPosition = (doc as any).lastAutoTable.finalY + 20
      
      // Critical Non-Compliant Items
      const criticalNonCompliant = requirements.filter(
        r => r.status === 'non-compliant' && r.priority === 'critical'
      )
      
      if (criticalNonCompliant.length > 0) {
        if (yPosition > 200) {
          doc.addPage()
          yPosition = margin
        }
        
        doc.setFontSize(14)
        doc.setTextColor(220, 38, 38) // Red color
        doc.text('Critical Non-Compliant Items', margin, yPosition)
        doc.setTextColor(0, 0, 0)
        yPosition += 10
        
        const criticalData = criticalNonCompliant.map(item => [
          item.requirement,
          item.category,
          item.dueDate || 'ASAP'
        ])
        
        doc.autoTable({
          startY: yPosition,
          head: [['Requirement', 'Category', 'Due Date']],
          body: criticalData,
          theme: 'striped',
          headStyles: { fillColor: [220, 38, 38] },
          margin: { left: margin, right: margin }
        })
      }
      
      // Save the PDF
      doc.save(`GlobalGAP_Compliance_Report_${new Date().toISOString().split('T')[0]}.pdf`)
      
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">GlobalG.A.P. Certification Assistant</h2>
            <p className="text-sm text-gray-400 mt-1">
              Achieve and maintain international food safety certification
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import Checklist
            </button>
            <button 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              {isGeneratingReport ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2">
          {(['overview', 'requirements', 'documents', 'audit', 'training', 'ai-assistant'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeView === view
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {view === 'ai-assistant' ? 'AI Assistant' : view}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Dashboard */}
      {activeView === 'overview' && (
        <>
          {/* Compliance Score Card */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Certification Status</h3>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-400">Valid until: Dec 31, 2024</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - calculateOverallCompliance() / 100)}`}
                      className="text-green-400 transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute text-3xl font-bold text-white">
                    {calculateOverallCompliance()}%
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-2">Overall Compliance</p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Critical Points</p>
                  <p className="text-2xl font-bold text-white">
                    {requirements.filter(r => r.priority === 'critical' && r.status === 'compliant').length}/
                    {requirements.filter(r => r.priority === 'critical').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Major Points</p>
                  <p className="text-2xl font-bold text-white">
                    {requirements.filter(r => r.priority === 'major' && r.status === 'compliant').length}/
                    {requirements.filter(r => r.priority === 'major').length}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Pending Actions</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {auditTasks.filter(t => t.status === 'pending').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Days to Audit</p>
                  <p className="text-2xl font-bold text-white">127</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Documents</p>
                  <p className="text-2xl font-bold text-white">
                    {requirements.filter(r => r.evidence && r.evidence.length > 0).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Last Update</p>
                  <p className="text-lg font-medium text-white">Jan 15</p>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-3">
              {complianceScores.map((score) => (
                <div key={score.category} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-gray-400">{score.category}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            score.percentage >= 90 ? 'bg-green-400' :
                            score.percentage >= 70 ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`}
                          style={{ width: `${score.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-white w-12 text-right">{score.percentage}%</span>
                      <TrendingUp className={`w-4 h-4 ${
                        score.trend === 'improving' ? 'text-green-400' :
                        score.trend === 'declining' ? 'text-red-400 rotate-180' :
                        'text-gray-400'
                      }`} />
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{score.score}/{score.maxScore}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors text-left">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <h4 className="font-medium text-white">Self-Assessment</h4>
              </div>
              <p className="text-sm text-gray-400">Run internal audit checklist</p>
            </button>
            <button className="p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors text-left">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h4 className="font-medium text-white">Schedule Audit</h4>
              </div>
              <p className="text-sm text-gray-400">Book certification body visit</p>
            </button>
            <button className="p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors text-left">
              <div className="flex items-center gap-3 mb-2">
                <Book className="w-5 h-5 text-green-400" />
                <h4 className="font-medium text-white">Training Portal</h4>
              </div>
              <p className="text-sm text-gray-400">Access certification courses</p>
            </button>
          </div>
        </>
      )}

      {/* Requirements View */}
      {activeView === 'requirements' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Compliance Requirements</h3>
            <div className="flex items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="all">All Categories</option>
                <option value="Food Safety">Food Safety</option>
                <option value="Traceability">Traceability</option>
                <option value="Environment">Environment</option>
                <option value="Worker Safety">Worker Safety</option>
                <option value="Plant Protection">Plant Protection</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={showOnlyNonCompliant}
                  onChange={(e) => setShowOnlyNonCompliant(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-purple-600"
                />
                Show only non-compliant
              </label>
            </div>
          </div>

          <div className="space-y-4">
            {requirements
              .filter(req => selectedCategory === 'all' || req.category === selectedCategory)
              .filter(req => !showOnlyNonCompliant || req.status !== 'compliant')
              .map((req) => (
                <div key={req.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-white">{req.requirement}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(req.status)}`}>
                          {req.status.replace('-', ' ')}
                        </span>
                        <span className={`text-xs ${getPriorityColor(req.priority)}`}>
                          {req.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{req.description}</p>
                    </div>
                    <button className="p-2 hover:bg-gray-700 rounded transition-colors">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {req.dueDate && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-yellow-400">
                      <Clock className="w-4 h-4" />
                      <span>Due: {new Date(req.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {req.evidence && req.evidence.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-green-400" />
                      <div className="flex gap-2">
                        {req.evidence.map((doc, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {req.notes && (
                    <p className="mt-2 text-sm text-gray-500 italic">{req.notes}</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Documents View */}
      {activeView === 'documents' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Document Library</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentTemplates.map((doc) => (
              <div key={doc.id} className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      doc.format === 'pdf' ? 'bg-red-500/20' :
                      doc.format === 'excel' ? 'bg-green-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      <FileText className={`w-5 h-5 ${
                        doc.format === 'pdf' ? 'text-red-400' :
                        doc.format === 'excel' ? 'text-green-400' :
                        'text-blue-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{doc.name}</h4>
                      <p className="text-sm text-gray-400">{doc.category}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      // Create a sample CSV content based on template type
                      let csvContent = ''
                      let filename = ''
                      
                      switch(doc.name) {
                        case 'Risk Assessment Template':
                          csvContent = `Risk Assessment - Food Safety Template
Date,Hazard Type,Hazard Description,Risk Level,Control Measure,Responsible Person,Review Date
${new Date().toLocaleDateString()},Biological,Cross-contamination in packing area,High,Implement sanitization protocol,Quality Manager,${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}
,Chemical,Pesticide residue on produce,Medium,Follow spray intervals and test samples,Farm Manager,
,Physical,Foreign objects in harvest bins,Low,Visual inspection and cleaning,Harvest Supervisor,
,Biological,Water quality contamination,High,Monthly water testing protocol,Safety Officer,
,Chemical,Cleaning chemical residues,Medium,Proper rinsing procedures,Facility Manager,`
                          filename = 'globalg-a-p-risk-assessment-template.csv'
                          break
                        case 'Training Record Form':
                          csvContent = `Employee Training Documentation - Worker Safety
Employee Name,Employee ID,Training Type,Date Completed,Trainer Name,Score/Result,Certification Expiry,Notes
John Smith,EMP001,Pesticide Application Safety,${new Date().toLocaleDateString()},Sarah Johnson,Pass,${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString()},Annual requirement
Jane Doe,EMP002,First Aid & Emergency Response,${new Date().toLocaleDateString()},Mike Williams,95%,${new Date(Date.now() + 730*24*60*60*1000).toLocaleDateString()},2-year certification
,,,,,,,
,,,,,,,
Template Fields:,,,,,,,
- Employee Name: Full name of trainee,,,,,,,
- Training Type: Specific training module,,,,,,,
- Score/Result: Pass/Fail or percentage,,,,,,,`
                          filename = 'globalg-a-p-training-record-form.csv'
                          break
                        case 'Spray Record Template':
                          csvContent = `Pesticide Application Record - Plant Protection
Date,Time,Field/Block,Crop,Pest/Disease,Product Name,Active Ingredient,Rate Applied,Water Volume,Equipment Used,Operator Name,License #,Weather Conditions,Wind Speed,Temperature,Re-entry Period,Pre-harvest Interval
${new Date().toLocaleDateString()},09:00,Block A-1,Tomatoes,Aphids,Example Insecticide,Imidacloprid,2.5 oz/acre,50 gal/acre,Backpack Sprayer,John Smith,PST-12345,Partly Cloudy,5 mph,72°F,24 hours,7 days
${new Date().toLocaleDateString()},14:00,Block B-2,Lettuce,Powdery Mildew,Example Fungicide,Sulfur,3 lbs/acre,75 gal/acre,Boom Sprayer,Jane Doe,PST-67890,Clear,3 mph,68°F,4 hours,0 days
,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,
Notes:,,,,,,,,,,,,,,,
- Always follow label instructions,,,,,,,,,,,,,,,
- Record within 24 hours of application,,,,,,,,,,,,,,,
- Keep records for minimum 5 years,,,,,,,,,,,,,,,`
                          filename = 'globalg-a-p-spray-record-template.csv'
                          break
                        case 'Internal Audit Checklist':
                          csvContent = `GlobalG.A.P. Internal Audit Checklist
Section,Control Point,Requirement,Compliant (Y/N),Evidence/Comments,Corrective Action,Due Date,Responsible Person
Site Management,AF 1.1.1,Risk assessment completed and documented,Y,Risk assessment dated ${new Date().toLocaleDateString()},None required,,Quality Manager
Site Management,AF 1.1.2,Management plan implemented,Y,Plan version 2.1 in use,None required,,Farm Manager
Record Keeping,AF 2.1,All records maintained for 2 years minimum,N,Some 2022 records missing,Retrieve missing records,${new Date(Date.now() + 14*24*60*60*1000).toLocaleDateString()},Admin Officer
Worker Safety,AF 3.1.1,Safety training conducted annually,Y,Training completed ${new Date().toLocaleDateString()},None required,,HR Manager
Worker Safety,AF 3.2.1,First aid equipment available,Y,Kits checked monthly,None required,,Safety Officer
Plant Protection,CB 7.1.1,IPM plan documented,Y,IPM plan v1.3 active,None required,,Crop Manager
Plant Protection,CB 7.6.1,Spray records complete,N,Missing weather data on some records,Update record template,${new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString()},Spray Operator
Harvest,FV 5.1.1,Hygiene procedures documented,Y,SOP-HAR-001 in place,None required,,Harvest Manager
,,,,,,,
Audit Summary:,,,,,,,
Total Control Points Checked:,8,,,,,,
Compliant:,6,,,,,,
Non-Compliant:,2,,,,,,
Compliance Rate:,75%,,,,,,`
                          filename = 'globalg-a-p-internal-audit-checklist.csv'
                          break
                      }
                      
                      // Create blob and download
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                      const link = document.createElement('a')
                      const url = URL.createObjectURL(blob)
                      link.setAttribute('href', url)
                      link.setAttribute('download', filename)
                      link.style.visibility = 'hidden'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    className="p-2 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Download className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">{doc.description}</p>
                <p className="text-xs text-gray-600 mt-2">Updated: {new Date(doc.lastUpdated).toLocaleDateString()}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-white mb-1">Document Management</h4>
                <p className="text-sm text-gray-300">
                  All documents are version controlled and automatically backed up. 
                  Updates to templates trigger notifications to relevant team members.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit View */}
      {activeView === 'audit' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Audit Tasks & Preparation</h3>
            
            <div className="space-y-3">
              {auditTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    task.status === 'completed' ? 'bg-green-500/20' :
                    task.status === 'in-progress' ? 'bg-blue-500/20' :
                    task.status === 'overdue' ? 'bg-red-500/20' :
                    'bg-gray-700'
                  }`}>
                    <ClipboardCheck className={`w-5 h-5 ${
                      task.status === 'completed' ? 'text-green-400' :
                      task.status === 'in-progress' ? 'text-blue-400' :
                      task.status === 'overdue' ? 'text-red-400' :
                      'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{task.task}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span>{task.category}</span>
                      {task.assignedTo && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {task.assignedTo}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.documents.length > 0 && (
                      <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                        {task.documents.length} docs
                      </span>
                    )}
                    <button className="p-2 hover:bg-gray-700 rounded transition-colors">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Pre-Audit Checklist</h3>
            
            <div className="space-y-4">
              {[
                {
                  category: 'Documentation Review',
                  items: [
                    { task: 'Update all SOPs to current versions', completed: true },
                    { task: 'Compile 2 years of spray records', completed: true },
                    { task: 'Gather water test results', completed: false },
                    { task: 'Organize training certificates', completed: true }
                  ]
                },
                {
                  category: 'Physical Inspection',
                  items: [
                    { task: 'Clean and organize chemical storage', completed: true },
                    { task: 'Update safety signage', completed: false },
                    { task: 'Calibrate spray equipment', completed: false },
                    { task: 'Service first aid stations', completed: true }
                  ]
                },
                {
                  category: 'Staff Preparation',
                  items: [
                    { task: 'Brief all employees on audit process', completed: false },
                    { task: 'Assign audit day responsibilities', completed: false },
                    { task: 'Review emergency procedures', completed: true },
                    { task: 'Practice traceability exercise', completed: false }
                  ]
                }
              ].map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="font-medium text-gray-300 mb-2">{section.category}</h4>
                  {section.items.map((item, itemIdx) => (
                    <label key={itemIdx} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                        onChange={() => {}}
                      />
                      <span className={`text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
                        {item.task}
                      </span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Audit Readiness Score</h4>
                  <p className="text-sm text-gray-400 mt-1">Based on completed checklist items</p>
                </div>
                <div className="text-3xl font-bold text-blue-400">72%</div>
              </div>
            </div>
          </div>

          {/* Common Non-Conformities */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Common Non-Conformities to Avoid</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  issue: 'Incomplete spray records',
                  frequency: '35%',
                  prevention: 'Use digital recording system with mandatory fields',
                  severity: 'critical'
                },
                {
                  issue: 'Expired training certificates',
                  frequency: '28%',
                  prevention: 'Set 60-day advance renewal reminders',
                  severity: 'major'
                },
                {
                  issue: 'Missing traceability data',
                  frequency: '22%',
                  prevention: 'Implement batch coding at harvest',
                  severity: 'critical'
                },
                {
                  issue: 'Inadequate risk assessments',
                  frequency: '18%',
                  prevention: 'Review and update quarterly with team',
                  severity: 'major'
                },
                {
                  issue: 'Poor hygiene documentation',
                  frequency: '15%',
                  prevention: 'Daily checklists with supervisor sign-off',
                  severity: 'major'
                },
                {
                  issue: 'Calibration records missing',
                  frequency: '12%',
                  prevention: 'Schedule monthly equipment checks',
                  severity: 'minor'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white">{item.issue}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      item.severity === 'major' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Occurs in {item.frequency} of audits</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <p className="text-sm text-gray-300">{item.prevention}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Training View */}
      {activeView === 'training' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Employee Training & Certification Status</h3>
            
            {/* Training Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Employee</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Food Safety</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Pesticide Application</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Equipment Operation</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">First Aid</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Hygiene Procedures</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'John Smith', trainings: { foodSafety: 'valid', pesticide: 'expired', equipment: 'valid', firstAid: 'valid', hygiene: 'pending' } },
                    { name: 'Sarah Johnson', trainings: { foodSafety: 'valid', pesticide: 'valid', equipment: 'valid', firstAid: 'expired', hygiene: 'valid' } },
                    { name: 'Mike Chen', trainings: { foodSafety: 'valid', pesticide: 'n/a', equipment: 'valid', firstAid: 'valid', hygiene: 'valid' } },
                    { name: 'Emily Davis', trainings: { foodSafety: 'pending', pesticide: 'n/a', equipment: 'pending', firstAid: 'valid', hygiene: 'pending' } },
                  ].map((employee, idx) => (
                    <tr key={idx} className="border-b border-gray-800">
                      <td className="py-3 px-4 text-sm text-white">{employee.name}</td>
                      {Object.entries(employee.trainings).map(([key, status]) => (
                        <td key={key} className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center justify-center w-20 px-2 py-1 text-xs font-medium rounded-full ${
                            status === 'valid' ? 'bg-green-500/20 text-green-400' :
                            status === 'expired' ? 'bg-red-500/20 text-red-400' :
                            status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-700 text-gray-400'
                          }`}>
                            {status === 'valid' ? '✓ Valid' :
                             status === 'expired' ? '⚠ Expired' :
                             status === 'pending' ? '⏳ Due' :
                             'N/A'}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Training SOPs */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Standard Operating Procedures (SOPs)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: 'Hand Washing Procedure',
                  category: 'Hygiene',
                  version: 'v2.1',
                  lastReview: '2024-01-15',
                  steps: [
                    'Wet hands with warm water',
                    'Apply soap and lather for 20 seconds',
                    'Clean under nails with brush',
                    'Rinse thoroughly',
                    'Dry with single-use paper towel',
                    'Use paper towel to turn off tap'
                  ]
                },
                {
                  title: 'Harvest Sanitation Protocol',
                  category: 'Food Safety',
                  version: 'v1.8',
                  lastReview: '2024-01-20',
                  steps: [
                    'Sanitize all harvest containers',
                    'Ensure hands are washed',
                    'Use clean, sanitized tools only',
                    'Avoid contact with ground',
                    'Transport in covered containers',
                    'Document batch numbers'
                  ]
                },
                {
                  title: 'Pesticide Application Safety',
                  category: 'Plant Protection',
                  version: 'v3.0',
                  lastReview: '2024-01-10',
                  steps: [
                    'Check weather conditions',
                    'Wear full PPE equipment',
                    'Calculate correct dosage',
                    'Test spray equipment',
                    'Apply per label instructions',
                    'Record all applications'
                  ]
                },
                {
                  title: 'Visitor Entry Protocol',
                  category: 'Biosecurity',
                  version: 'v1.5',
                  lastReview: '2024-01-05',
                  steps: [
                    'Sign visitor log book',
                    'Review biosecurity rules',
                    'Provide protective clothing',
                    'Escort at all times',
                    'Restrict access to sensitive areas',
                    'Clean footwear on exit'
                  ]
                }
              ].map((sop, idx) => (
                <div key={idx} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{sop.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{sop.category}</span>
                        <span>•</span>
                        <span>{sop.version}</span>
                        <span>•</span>
                        <span>Reviewed: {sop.lastReview}</span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-700 rounded transition-colors">
                      <FileText className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {sop.steps.map((step, stepIdx) => (
                      <div key={stepIdx} className="flex items-start gap-2 text-sm">
                        <span className="text-gray-500 mt-0.5">{stepIdx + 1}.</span>
                        <span className="text-gray-300">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Training Schedule */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Training Sessions</h3>
            
            <div className="space-y-3">
              {[
                { date: '2024-02-20', time: '09:00', topic: 'Annual Food Safety Refresher', trainer: 'External Auditor', attendees: ['All Staff'], location: 'Training Room A' },
                { date: '2024-02-25', time: '14:00', topic: 'New Employee Orientation', trainer: 'Sarah Johnson', attendees: ['Emily Davis'], location: 'Main Office' },
                { date: '2024-03-01', time: '10:00', topic: 'Pesticide License Renewal', trainer: 'State Inspector', attendees: ['John Smith', 'Mark Wilson'], location: 'Field Office' },
                { date: '2024-03-15', time: '13:00', topic: 'Emergency Response Drill', trainer: 'Safety Officer', attendees: ['All Staff'], location: 'Entire Facility' }
              ].map((session, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">
                        {new Date(session.date).toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                      <p className="text-xl font-bold text-white">
                        {new Date(session.date).getDate()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{session.topic}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.time}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {session.attendees.join(', ')}
                        </span>
                        <span>•</span>
                        <span>{session.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">by {session.trainer}</span>
                    <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors">
                      Register
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant View */}
      {activeView === 'ai-assistant' && <GlobalGapAIAssistant />}
    </div>
  )
}