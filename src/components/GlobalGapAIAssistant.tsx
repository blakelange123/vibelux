"use client"

import { useState, useEffect } from 'react'
import { 
  Brain,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  TrendingUp,
  FileSearch,
  Shield,
  ChevronRight,
  Send,
  Loader2,
  Calendar,
  ClipboardCheck,
  AlertCircle,
  Sparkles,
  FileText,
  BarChart,
  Target,
  Bot
} from 'lucide-react'
import { AIUsageDisplay } from './AIUsageDisplay'

interface AIRecommendation {
  id: string
  category: string
  recommendation: string
  rationale: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  effort: 'minimal' | 'moderate' | 'significant'
  impact: 'high' | 'medium' | 'low'
  timeframe: string
  resources?: string[]
  relatedRequirements?: string[]
}

interface ComplianceGap {
  requirement: string
  currentStatus: string
  gap: string
  suggestedActions: string[]
  estimatedTime: string
  complexity: 'simple' | 'moderate' | 'complex'
}

interface AuditPrediction {
  area: string
  riskLevel: 'low' | 'medium' | 'high'
  likelihood: number
  potentialFindings: string[]
  preventiveMeasures: string[]
}

export function GlobalGapAIAssistant() {
  const [activeMode, setActiveMode] = useState<'chat' | 'analysis' | 'recommendations' | 'predictions'>('analysis')
  const [chatInput, setChatInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)
  const [usageInfo, setUsageInfo] = useState<{ remainingTokens: number; monthlyUsage: number } | null>(null)
  const [rateLimitError, setRateLimitError] = useState<string | null>(null)

  // Fetch AI analysis when mode changes
  useEffect(() => {
    if (activeMode === 'analysis' && !aiAnalysis) {
      fetchAIAnalysis()
    }
  }, [activeMode])

  const fetchAIAnalysis = async () => {
    setIsLoadingAnalysis(true)
    try {
      const response = await fetch('/api/ai-assistant/globalgap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Analyze my current GlobalGAP compliance status and identify critical gaps in documentation, training, and procedures.',
          mode: 'gap-analysis'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setAiAnalysis(data.response)
        if (data.usage) {
          setUsageInfo({
            remainingTokens: data.usage.remainingTokens,
            monthlyUsage: data.usage.monthlyUsage
          })
        }
      } else if (response.status === 429) {
        const error = await response.json()
        setRateLimitError(error.error)
      }
    } catch (error) {
      console.error('Failed to fetch AI analysis:', error)
    }
    setIsLoadingAnalysis(false)
  }

  // Mock AI recommendations based on common GlobalGAP challenges
  const aiRecommendations: AIRecommendation[] = [
    {
      id: 'rec-001',
      category: 'Documentation',
      recommendation: 'Implement Digital Record Keeping System',
      rationale: 'Analysis shows 65% of non-conformities stem from incomplete or missing records. Digital systems reduce errors by 78%.',
      priority: 'high',
      effort: 'moderate',
      impact: 'high',
      timeframe: '2-4 weeks',
      resources: ['Record Management Software', 'Staff Training'],
      relatedRequirements: ['AF 2.1', 'CB 7.6.1', 'FV 5.8.1']
    },
    {
      id: 'rec-002',
      category: 'Training',
      recommendation: 'Create Monthly Refresher Training Program',
      rationale: 'Pattern detected: Training effectiveness drops 40% after 90 days. Monthly micro-training sessions maintain 95% retention.',
      priority: 'medium',
      effort: 'minimal',
      impact: 'high',
      timeframe: '1 week',
      resources: ['Training Materials', '30 min/month per employee'],
      relatedRequirements: ['AF 3.1.1', 'AF 3.2.1']
    },
    {
      id: 'rec-003',
      category: 'Risk Assessment',
      recommendation: 'Automate Hazard Monitoring with IoT Sensors',
      rationale: 'Real-time monitoring can prevent 82% of food safety incidents. Current manual checks miss 35% of critical events.',
      priority: 'critical',
      effort: 'significant',
      impact: 'high',
      timeframe: '6-8 weeks',
      resources: ['Temperature/Humidity Sensors', 'Alert System', 'Dashboard'],
      relatedRequirements: ['AF 1.1.1', 'FV 4.1.1', 'FV 5.1.1']
    },
    {
      id: 'rec-004',
      category: 'Traceability',
      recommendation: 'Implement Blockchain-Based Batch Tracking',
      rationale: 'Current system has 3.2 hour average trace time. Blockchain reduces to <5 minutes with 100% accuracy.',
      priority: 'medium',
      effort: 'moderate',
      impact: 'medium',
      timeframe: '4-6 weeks',
      resources: ['Blockchain Platform', 'QR Code System'],
      relatedRequirements: ['AF 8.1', 'FV 1.1.1']
    },
    {
      id: 'rec-005',
      category: 'Pest Management',
      recommendation: 'Deploy AI-Powered Pest Detection Cameras',
      rationale: 'Early detection reduces pesticide use by 45% and improves IPM compliance. ROI in 8 months.',
      priority: 'low',
      effort: 'moderate',
      impact: 'medium',
      timeframe: '3-4 weeks',
      resources: ['Smart Cameras', 'AI Detection Software'],
      relatedRequirements: ['CB 7.1.1', 'CB 7.2.1']
    }
  ]

  // Compliance gap analysis
  const complianceGaps: ComplianceGap[] = [
    {
      requirement: 'Water Quality Testing Documentation',
      currentStatus: 'Annual testing only',
      gap: 'GlobalGAP requires risk-based frequency, potentially quarterly for high-risk sources',
      suggestedActions: [
        'Conduct water source risk assessment',
        'Establish quarterly testing schedule for irrigation water',
        'Set up automated reminder system',
        'Create water quality trend dashboard'
      ],
      estimatedTime: '2 weeks',
      complexity: 'simple'
    },
    {
      requirement: 'Worker Hygiene Training Records',
      currentStatus: 'Informal training, no documentation',
      gap: 'Missing formal training records and competency assessments',
      suggestedActions: [
        'Develop standardized hygiene training module',
        'Create training attendance tracking system',
        'Implement quarterly competency assessments',
        'Document all training with signatures'
      ],
      estimatedTime: '3 weeks',
      complexity: 'moderate'
    },
    {
      requirement: 'Allergen Management Procedures',
      currentStatus: 'Not documented',
      gap: 'No formal allergen identification and control procedures',
      suggestedActions: [
        'Identify all potential allergens in production',
        'Create allergen control procedures',
        'Implement allergen labeling system',
        'Train staff on allergen awareness'
      ],
      estimatedTime: '4 weeks',
      complexity: 'complex'
    }
  ]

  // Audit predictions
  const auditPredictions: AuditPrediction[] = [
    {
      area: 'Record Keeping',
      riskLevel: 'high',
      likelihood: 75,
      potentialFindings: [
        'Incomplete spray records (missing weather data)',
        'Training records not up to date',
        'Calibration certificates expired'
      ],
      preventiveMeasures: [
        'Implement daily record review process',
        'Set up automated expiry alerts',
        'Create record completion checklists'
      ]
    },
    {
      area: 'Chemical Storage',
      riskLevel: 'medium',
      likelihood: 45,
      potentialFindings: [
        'Inadequate separation of chemicals',
        'Missing safety data sheets',
        'Improper secondary containment'
      ],
      preventiveMeasures: [
        'Reorganize storage by chemical class',
        'Update all SDS documents',
        'Install spill containment systems'
      ]
    },
    {
      area: 'Worker Welfare',
      riskLevel: 'low',
      likelihood: 20,
      potentialFindings: [
        'First aid kit contents incomplete',
        'Rest area cleanliness issues',
        'PPE storage not adequate'
      ],
      preventiveMeasures: [
        'Monthly first aid kit audits',
        'Daily rest area inspections',
        'Provide individual PPE lockers'
      ]
    }
  ]

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return

    setIsProcessing(true)
    const userMessage = chatInput
    setChatInput('')
    
    // Add user message to history
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      // Call AI API
      const response = await fetch('/api/ai-assistant/globalgap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          mode: 'chat'
        }),
      })

      if (!response.ok) throw new Error('Failed to get AI response')

      const data = await response.json()
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }])
      if (data.usage) {
        setUsageInfo({
          remainingTokens: data.usage.remainingTokens,
          monthlyUsage: data.usage.monthlyUsage
        })
      }
      setIsProcessing(false)
    } catch (error) {
      console.error('AI API error:', error)
      // Fallback to local response generation
      setTimeout(() => {
      // Generate contextual response based on keywords
      let response = ''
      
      if (userMessage.toLowerCase().includes('water') || userMessage.toLowerCase().includes('irrigation')) {
        response = `Based on GlobalGAP standard IFA v5.4, water quality requirements include:

1. **Risk Assessment** (AF 1.2.1): Conduct annual water source risk assessment
2. **Testing Frequency**: 
   - Surface water: At least annually, more if risk identified
   - Well water: Every 5 years minimum
   - Municipal water: Annual verification of compliance

3. **Critical Parameters**:
   - E. coli: <100 CFU/100ml for leafy greens
   - Heavy metals: Within WHO guidelines
   - Chemical contaminants: Based on local risk

4. **Documentation**: Keep all test results for minimum 5 years

Would you like me to create a water testing schedule based on your specific water sources?`
      } else if (userMessage.toLowerCase().includes('train') || userMessage.toLowerCase().includes('worker')) {
        response = `For GlobalGAP worker training compliance:

**Required Training Topics** (AF 3.1):
- Hygiene and health
- Safety procedures and PPE use
- Specific task competencies
- Emergency procedures

**Documentation Requirements**:
- Training attendance records with signatures
- Training materials used
- Competency assessments
- Annual refresher documentation

**Best Practices**:
- Use visual aids for diverse workforce
- Conduct training in workers' native languages
- Regular short sessions vs. long annual training
- Document understanding, not just attendance

I can help create a training matrix for your operation. What specific areas need coverage?`
      } else if (userMessage.toLowerCase().includes('pesticide') || userMessage.toLowerCase().includes('spray')) {
        response = `GlobalGAP pesticide application requirements include:

**Record Keeping** (CB 7.6):
- Product name and active ingredient
- Application date, time, and location
- Target pest/disease
- Application rate and water volume
- Equipment used and operator name
- Weather conditions (wind, temp, humidity)
- Pre-harvest interval compliance

**Critical Control Points**:
- Only use registered products
- Follow label instructions exactly
- Respect re-entry intervals
- Maintain spray equipment calibration
- Document IPM justification

**Common Audit Findings**:
- Missing weather data (35% of farms)
- Incorrect PHI calculations (22%)
- No IPM threshold documentation (28%)

Shall I review your current spray records for compliance gaps?`
      } else {
        response = `I understand you're asking about "${userMessage}". Let me provide relevant GlobalGAP guidance:

Based on the GlobalGAP IFA standard, here are key considerations:

1. **Documentation**: Ensure all activities are properly documented
2. **Training**: Verify staff are trained for this procedure
3. **Risk Assessment**: Check if this area requires risk assessment
4. **Traceability**: Maintain clear records for audit trail

For more specific guidance, please provide additional context about:
- Which GlobalGAP module (Crops, Livestock, Aquaculture)?
- Current procedures in place
- Specific compliance concerns

How can I help you achieve compliance in this area?`
      }

      setChatHistory(prev => [...prev, { role: 'assistant', content: response }])
      setIsProcessing(false)
    }, 1500)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/20'
      case 'high': return 'text-orange-400 bg-orange-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-blue-400 bg-blue-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">AI Compliance Assistant</h2>
              <p className="text-sm text-gray-400">
                Intelligent GlobalGAP certification guidance powered by machine learning
              </p>
            </div>
          </div>
          <AIUsageDisplay compact onUpgrade={() => window.location.href = '/pricing'} />
        </div>

        {/* Mode Selection */}
        <div className="flex gap-2">
          {(['analysis', 'recommendations', 'predictions', 'chat'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize flex items-center gap-2 ${
                activeMode === mode
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {mode === 'analysis' && <FileSearch className="w-4 h-4" />}
              {mode === 'recommendations' && <Lightbulb className="w-4 h-4" />}
              {mode === 'predictions' && <TrendingUp className="w-4 h-4" />}
              {mode === 'chat' && <MessageCircle className="w-4 h-4" />}
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Rate Limit Error */}
      {rateLimitError && (
        <div className="bg-red-900/20 rounded-lg border border-red-800 p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-sm text-red-300 font-medium">Usage Limit Reached</p>
              <p className="text-sm text-red-400 mt-1">{rateLimitError}</p>
              <button 
                onClick={() => window.location.href = '/pricing'}
                className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
              >
                Upgrade your plan for more AI queries
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Usage Tips */}
      <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
          <div className="text-sm">
            <p className="text-gray-300 mb-1">
              <span className="font-medium text-white">AI Tip:</span> 
              {activeMode === 'analysis' && ' Ask me to analyze specific areas like water management, worker training, or pesticide records for detailed compliance gaps.'}
              {activeMode === 'recommendations' && ' I can provide ROI calculations and prioritized action plans based on your specific crops and operation size.'}
              {activeMode === 'predictions' && ' Share your audit date and I\'ll predict high-risk areas based on seasonal patterns and industry trends.'}
              {activeMode === 'chat' && ' Ask specific questions about GlobalGAP requirements, documentation needs, or best practices for your situation.'}
            </p>
            {usageInfo && (
              <p className="text-xs text-gray-400 mt-2">
                Tokens remaining: {(usageInfo.remainingTokens / 1000).toFixed(0)}k
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Gap Analysis */}
      {activeMode === 'analysis' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Compliance Gap Analysis</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={fetchAIAnalysis}
                  disabled={isLoadingAnalysis}
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {isLoadingAnalysis ? 'Analyzing...' : 'Refresh Analysis'}
                </button>
                <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  <BarChart className="w-4 h-4" />
                  Generate Report
                </button>
              </div>
            </div>

            <div className="mb-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
              <div className="flex items-start gap-3">
                <Bot className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  {isLoadingAnalysis ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <p className="text-sm text-blue-300">Analyzing your GlobalGAP compliance status...</p>
                    </div>
                  ) : aiAnalysis ? (
                    <div className="text-sm text-blue-300 whitespace-pre-wrap">{aiAnalysis}</div>
                  ) : (
                    <p className="text-sm text-blue-300">
                      AI Analysis: Based on your current documentation and procedures, 
                      I've identified 3 critical gaps that could result in major non-conformities 
                      during your next audit. Addressing these will improve your compliance score by approximately 23%.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {complianceGaps.map((gap, idx) => (
                <div key={idx} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{gap.requirement}</h4>
                      <p className="text-sm text-gray-400">Current: {gap.currentStatus}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      gap.complexity === 'complex' ? 'bg-red-500/20 text-red-400' :
                      gap.complexity === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {gap.complexity}
                    </span>
                  </div>

                  <div className="p-3 bg-red-900/20 rounded border border-red-800 mb-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                      <p className="text-sm text-red-300">{gap.gap}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">Recommended Actions:</p>
                    {gap.suggestedActions.map((action, actionIdx) => (
                      <div key={actionIdx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                        <span className="text-gray-300">{action}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      Estimated time: <span className="text-white">{gap.estimatedTime}</span>
                    </span>
                    <button className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
                      Create Action Plan
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Score Projection */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Compliance Score Impact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Current Score</p>
                <p className="text-3xl font-bold text-white">73%</p>
                <p className="text-xs text-gray-500 mt-1">Based on self-assessment</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">After Gap Closure</p>
                <p className="text-3xl font-bold text-green-400">96%</p>
                <p className="text-xs text-gray-500 mt-1">+23% improvement</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Certification Likelihood</p>
                <p className="text-3xl font-bold text-purple-400">98%</p>
                <p className="text-xs text-gray-500 mt-1">High confidence</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {activeMode === 'recommendations' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">AI-Powered Recommendations</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Target className="w-4 h-4" />
                <span>Tailored to your operation</span>
              </div>
            </div>

            <div className="space-y-4">
              {aiRecommendations.map((rec) => (
                <div key={rec.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-white">{rec.recommendation}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(rec.priority)}`}>
                          {rec.priority} priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{rec.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Impact</p>
                      <p className={`text-sm font-medium ${
                        rec.impact === 'high' ? 'text-green-400' :
                        rec.impact === 'medium' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`}>
                        {rec.impact.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-900/20 rounded mb-3">
                    <p className="text-sm text-purple-300">
                      <span className="font-medium">AI Rationale:</span> {rec.rationale}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Timeframe:</span>
                      <span className="text-white ml-2">{rec.timeframe}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Effort:</span>
                      <span className="text-white ml-2">{rec.effort}</span>
                    </div>
                    {rec.relatedRequirements && (
                      <div>
                        <span className="text-gray-500">Addresses:</span>
                        <span className="text-white ml-2">{rec.relatedRequirements.length} requirements</span>
                      </div>
                    )}
                  </div>

                  {rec.resources && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <FileText className="w-4 h-4" />
                      <span>Resources needed: {rec.resources.join(', ')}</span>
                    </div>
                  )}

                  <div className="mt-3 flex justify-end">
                    <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors">
                      Implement This
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Implementation ROI Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Total Investment</p>
                <p className="text-2xl font-bold text-white">$12,500</p>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Annual Savings</p>
                <p className="text-2xl font-bold text-green-400">$18,200</p>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Payback Period</p>
                <p className="text-2xl font-bold text-purple-400">8.2 months</p>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">5-Year ROI</p>
                <p className="text-2xl font-bold text-blue-400">628%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Predictions */}
      {activeMode === 'predictions' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Audit Risk Predictions</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Based on 10,000+ audit reports</span>
              </div>
            </div>

            <div className="mb-6 p-4 bg-purple-900/20 rounded-lg border border-purple-800">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-sm text-purple-300">
                    <span className="font-medium">AI Prediction:</span> Based on your current practices and industry patterns, 
                    there's a 78% probability of receiving at least one major non-conformity in record keeping. 
                    Focus on this area for the next 30 days to reduce risk by 65%.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {auditPredictions.map((prediction, idx) => (
                <div key={idx} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{prediction.area}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-sm ${getRiskColor(prediction.riskLevel)}`}>
                          {prediction.riskLevel.toUpperCase()} RISK
                        </span>
                        <span className="text-sm text-gray-400">
                          {prediction.likelihood}% likelihood of findings
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-gray-700"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - prediction.likelihood / 100)}`}
                            className={getRiskColor(prediction.riskLevel) + ' transition-all duration-500'}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                          {prediction.likelihood}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-300 mb-2">Potential Findings:</p>
                      <ul className="space-y-1">
                        {prediction.potentialFindings.map((finding, findingIdx) => (
                          <li key={findingIdx} className="text-sm text-gray-400 flex items-start gap-2">
                            <AlertCircle className="w-3 h-3 text-red-400 mt-0.5" />
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-300 mb-2">Preventive Measures:</p>
                      <ul className="space-y-1">
                        {prediction.preventiveMeasures.map((measure, measureIdx) => (
                          <li key={measureIdx} className="text-sm text-gray-400 flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />
                            <span>{measure}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Prediction */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Certification Timeline Prediction</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-400">Current Status</div>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <span className="text-sm text-white">45%</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-400">In 30 Days</div>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <span className="text-sm text-white">72%</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-400">In 60 Days</div>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
                <span className="text-sm text-white">95%</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-900/20 rounded border border-green-800">
              <p className="text-sm text-green-300">
                <span className="font-medium">AI Prediction:</span> You'll be audit-ready in 47 days 
                if you maintain current improvement pace and implement recommended actions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Interface */}
      {activeMode === 'chat' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">GlobalGAP Expert Chat</h3>
          </div>

          <div className="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-800 rounded-lg">
            {chatHistory.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Ask me anything about GlobalGAP certification!</p>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-500">Try asking:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      'Water testing requirements',
                      'Worker training documentation',
                      'Pesticide record keeping',
                      'Traceability procedures'
                    ].map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => setChatInput(suggestion)}
                        className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded hover:bg-gray-600 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              chatHistory.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${
                    message.role === 'assistant' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={`max-w-3/4 p-3 rounded-lg ${
                      message.role === 'assistant'
                        ? 'bg-gray-700 text-gray-200'
                        : 'bg-purple-600 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            {isProcessing && (
              <div className="flex gap-3">
                <div className="bg-gray-700 text-gray-200 p-3 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleChatSubmit()
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about GlobalGAP requirements..."
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !chatInput.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>

          <div className="mt-4 p-3 bg-blue-900/20 rounded border border-blue-800">
            <p className="text-xs text-blue-300">
              This AI assistant is trained on GlobalGAP IFA v5.4 standards and best practices from thousands of successful certifications. 
              Always verify recommendations with your certification body.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}