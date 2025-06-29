'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Bot, 
  Send, 
  Camera, 
  Mic, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap, 
  Droplets, 
  Leaf, 
  Thermometer, 
  Bug, 
  HelpCircle,
  MessageSquare,
  Search,
  BookOpen,
  Star,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Share2,
  Download,
  Lightbulb,
  TrendingUp,
  Users,
  Phone,
  Mail
} from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  attachments?: Attachment[]
  suggestions?: string[]
  confidence?: number
  sources?: TroubleshootingSource[]
}

interface Attachment {
  id: string
  type: 'image' | 'file'
  name: string
  url: string
  size?: number
}

interface TroubleshootingSource {
  title: string
  type: 'sop' | 'knowledge_base' | 'community' | 'expert'
  url?: string
  relevance: number
}

interface DiagnosticStep {
  id: string
  title: string
  description: string
  type: 'check' | 'measure' | 'adjust' | 'replace'
  completed: boolean
  result?: string
}

export default function TroubleshootPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [diagnosticSteps, setDiagnosticSteps] = useState<DiagnosticStep[]>([])
  const [showDiagnostic, setShowDiagnostic] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const problemCategories = [
    { id: 'lighting', name: 'Lighting Issues', icon: Zap, color: 'text-yellow-600' },
    { id: 'plant_health', name: 'Plant Health', icon: Leaf, color: 'text-green-600' },
    { id: 'irrigation', name: 'Irrigation Problems', icon: Droplets, color: 'text-blue-600' },
    { id: 'environment', name: 'Environment Control', icon: Thermometer, color: 'text-red-600' },
    { id: 'pests', name: 'Pest & Disease', icon: Bug, color: 'text-orange-600' },
    { id: 'general', name: 'General Questions', icon: HelpCircle, color: 'text-purple-600' }
  ]

  useEffect(() => {
    // Welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'bot',
      content: "🔧 Hi! I'm your **VibeLux Troubleshooting Assistant** powered by Claude AI. I specialize in diagnosing and solving growing problems.\n\n**I'm different from the design assistant** - I focus on:\n• Fixing problems with existing systems\n• Plant health diagnostics  \n• Equipment troubleshooting\n• Step-by-step problem resolution\n\n**What issue are you experiencing today?**",
      timestamp: new Date(),
      suggestions: [
        "My plants are yellowing",
        "LED lights not working properly", 
        "pH levels are unstable",
        "Poor plant growth",
        "Equipment malfunction"
      ]
    }
    setMessages([welcomeMessage])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (message?: string) => {
    const content = message || inputMessage.trim()
    if (!content) return

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      // Call Claude API through our troubleshooting endpoint
      const response = await fetch('/api/troubleshoot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          context: {
            category: selectedCategory,
            previousMessages: messages.slice(-5).map(m => m.content), // Last 5 messages for context
            userProfile: {
              experience: 'intermediate', // Could be from user settings
              systemType: 'hydroponic',
              facilitySize: 'medium'
            }
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response from AI assistant')
      }

      const data = await response.json()
      
      const botResponse: ChatMessage = {
        id: `bot_${Date.now()}`,
        type: 'bot',
        content: data.response,
        timestamp: new Date(),
        confidence: data.confidence,
        suggestions: data.suggestions,
        sources: data.relatedResources?.map((resource: any) => ({
          title: resource.title,
          type: resource.type,
          relevance: resource.relevance
        }))
      }

      setMessages(prev => [...prev, botResponse])

      // If diagnostic steps are provided, show the diagnostic panel
      if (data.diagnosticSteps) {
        setDiagnosticSteps(data.diagnosticSteps.map((step: any) => ({
          ...step,
          completed: false
        })))
        setShowDiagnostic(true)
      }

    } catch (error) {
      console.error('Error calling troubleshooting API:', error)
      
      // Fallback to local response if API fails
      const fallbackResponse: ChatMessage = {
        id: `bot_${Date.now()}`,
        type: 'bot',
        content: "I'm having trouble connecting to my AI systems right now. Please try again in a moment, or contact our support team for immediate assistance.",
        timestamp: new Date(),
        confidence: 0.1,
        suggestions: [
          "Try again",
          "Contact support",
          "Use community forum"
        ]
      }
      
      setMessages(prev => [...prev, fallbackResponse])
    } finally {
      setIsTyping(false)
    }
  }


  const startGuidedDiagnosis = () => {
    const steps: DiagnosticStep[] = [
      {
        id: 'visual_inspection',
        title: 'Visual Plant Inspection',
        description: 'Look closely at your plants. Check leaves, stems, and overall appearance for any abnormalities.',
        type: 'check',
        completed: false
      },
      {
        id: 'environment_check',
        title: 'Environmental Parameters',
        description: 'Measure and record temperature, humidity, and light levels in your growing area.',
        type: 'measure',
        completed: false
      },
      {
        id: 'equipment_status',
        title: 'Equipment Status Check',
        description: 'Verify all equipment (lights, fans, pumps, controllers) is functioning normally.',
        type: 'check',
        completed: false
      },
      {
        id: 'growing_medium',
        title: 'Growing Medium Condition',
        description: 'Check soil moisture, drainage, or hydroponic solution levels and cleanliness.',
        type: 'check',
        completed: false
      },
      {
        id: 'nutrient_water',
        title: 'Nutrient & Water Quality',
        description: 'Test pH, EC/PPM, and water quality. Check nutrient mixing and delivery systems.',
        type: 'measure',
        completed: false
      }
    ]
    
    setDiagnosticSteps(steps)
    setShowDiagnostic(true)
  }

  const markStepCompleted = (stepId: string, result: string) => {
    setDiagnosticSteps(steps => 
      steps.map(step => 
        step.id === stepId 
          ? { ...step, completed: true, result } 
          : step
      )
    )
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    const category = problemCategories.find(c => c.id === categoryId)
    if (category) {
      handleSendMessage(`I need help with ${category.name.toLowerCase()}`)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === "Start Diagnosis") {
      startGuidedDiagnosis()
      return
    }
    handleSendMessage(suggestion)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bot className="w-8 h-8 text-blue-600" />
            Troubleshooting Assistant
          </h1>
          <p className="text-muted-foreground">
            AI-powered diagnosis and solutions for your growing challenges
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Chat with Assistant
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-1" />
                      Photo
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        
                        {message.confidence && (
                          <div className="text-xs opacity-75 mt-2">
                            Confidence: {(message.confidence * 100).toFixed(0)}%
                          </div>
                        )}
                        
                        {message.suggestions && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="text-xs"
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        {message.sources && (
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <div className="text-xs font-medium mb-1">Related Resources:</div>
                            {message.sources.map((source, index) => (
                              <div key={index} className="text-xs opacity-75 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {source.title}
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{(source.relevance * 100).toFixed(0)}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">Assistant is thinking...</span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input */}
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Describe your problem or ask a question..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={() => handleSendMessage()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Problem Categories</CardTitle>
                <CardDescription>Select your issue type for targeted help</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {problemCategories.map((category) => {
                    const Icon = category.icon
                    return (
                      <Button
                        key={category.id}
                        variant="outline"
                        className="justify-start h-auto p-3"
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <Icon className={`w-4 h-4 mr-2 ${category.color}`} />
                        <span className="text-sm">{category.name}</span>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Guided Diagnosis */}
            {showDiagnostic && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Guided Diagnosis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {diagnosticSteps.map((step, index) => (
                      <div key={step.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {index + 1}. {step.title}
                          </span>
                          {step.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {step.description}
                        </p>
                        {!step.completed && (
                          <Button
                            size="sm"
                            onClick={() => {
                              const result = prompt(`Complete step: ${step.title}\n\nEnter your findings:`)
                              if (result) markStepCompleted(step.id, result)
                            }}
                          >
                            Complete
                          </Button>
                        )}
                        {step.result && (
                          <div className="text-xs bg-green-50 p-2 rounded mt-2">
                            <strong>Result:</strong> {step.result}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Expert Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Expert Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Community Forum
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    Schedule Call
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Problems Solved:</span>
                    <span className="font-medium">147</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response Time:</span>
                    <span className="font-medium">2.3s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-medium text-green-600">94%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}