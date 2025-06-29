"use client"

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Sparkles, Loader2, Minimize2, Maximize2, Wand2, ArrowRight } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

interface Message {
  id: string
  text: string
  sender: 'user' | 'assistant' | 'system'
  timestamp: Date
  designData?: any // Store design data if generated
}

interface DesignParameters {
  roomWidth: number
  roomLength: number
  roomHeight: number
  targetPPFD: number
  cropType: string
  mountingHeight: number
  isRack: boolean
  tiers?: number
  requestDLC?: boolean
  fixtureType?: string
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Vibelux AI Assistant. I can help you design and optimize your grow space.",
      sender: 'assistant',
      timestamp: new Date()
    },
    {
      id: '2',
      text: "I can help with:\n• **Design rooms** - \"Create a 10x20 room with 600 PPFD\"\n• **Add equipment** - \"Add another fixture\" or \"Add a 16 inch fan\"\n• **Adjust settings** - \"Increase PPFD to 800\" or \"Change to flowering spectrum\"\n• **Environmental** - \"Add a dehumidifier\" or \"Add 2 ton AC\"\n• **Calculations** - \"Calculate DLI\" or \"What's the heat load?\"\n• **Optimization** - \"Optimize for energy efficiency\"\n\nTry something like: \"Design a 4x8 rack with 300 PPFD\" or \"Add another 600W fixture\"",
      sender: 'assistant',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [pendingDesign, setPendingDesign] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Set mounted state
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Listen for open events from other components
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true)
    }
    
    window.addEventListener('openAIAssistant', handleOpenEvent)
    return () => window.removeEventListener('openAIAssistant', handleOpenEvent)
  }, [])

  // Extract design parameters from user input
  const extractDesignParameters = (text: string): DesignParameters | null => {
    const lowerText = text.toLowerCase()
    
    // Enhanced dimension parsing - handle various formats
    // Matches: "2' x 20'", "2 x 20", "2'x20'", "2 by 20", "2x20", "2 feet by 20 feet", etc.
    const dimensionPatterns = [
      /(\d+\.?\d*)\s*['']?\s*[x×]\s*(\d+\.?\d*)\s*['']?/,  // 2' x 20' or 2x20
      /(\d+\.?\d*)\s*(?:feet|ft|')\s*(?:by|x|×)\s*(\d+\.?\d*)\s*(?:feet|ft|')?/,  // 2 feet by 20 feet
      /(\d+\.?\d*)\s+by\s+(\d+\.?\d*)/,  // 2 by 20
      /(\d+\.?\d*)\s*(?:foot|ft|')\s*(?:by|x|×)\s*(\d+\.?\d*)/  // 2 foot by 20
    ]
    
    let dimensionMatch = null
    for (const pattern of dimensionPatterns) {
      dimensionMatch = lowerText.match(pattern)
      if (dimensionMatch) break
    }
    
    if (!dimensionMatch) return null
    
    const width = parseFloat(dimensionMatch[1])
    const length = parseFloat(dimensionMatch[2])
    
    // Look for height (default 10')
    const heightMatch = lowerText.match(/(\d+\.?\d*)\s*(?:feet|ft|')?\s*(?:tall|high|height|ceiling)/)
    const height = heightMatch ? parseFloat(heightMatch[1]) : 10
    
    // Enhanced PPFD/intensity parsing
    // Match patterns with PPFD value before or after the keyword
    const ppfdPatterns = [
      /(\d+)\s*(?:ppfd|μmol|umol|micromol|intensity)/,  // 100 ppfd
      /(?:ppfd|intensity)\s*(?:of|:)?\s*(\d+)/,  // ppfd of 100
      /(\d+)\s*(?:μmol\/m²\/s|umol\/m2\/s)/,  // 100 μmol/m²/s
      /target\s*(?:ppfd|intensity)?\s*(?:of|:)?\s*(\d+)/  // target ppfd of 100
    ]
    
    let ppfdMatch = null
    let targetPPFD = 200  // default
    for (const pattern of ppfdPatterns) {
      ppfdMatch = lowerText.match(pattern)
      if (ppfdMatch) {
        targetPPFD = parseInt(ppfdMatch[1])
        break
      }
    }
    
    // Look for mounting height (handle inches and feet)
    const mountingPatterns = [
      /(\d+)\s*(?:inch|inches|")\s*(?:above|from|mounting|mount)/,  // inches
      /(\d+\.?\d*)\s*(?:feet|ft|')\s*(?:above|from|mounting|mount)/  // feet
    ]
    
    let mountingHeight = 2  // default 2 feet
    for (const pattern of mountingPatterns) {
      const match = lowerText.match(pattern)
      if (match) {
        if (pattern.toString().includes('inch')) {
          mountingHeight = parseFloat(match[1]) / 12  // Convert inches to feet
        } else {
          mountingHeight = parseFloat(match[1])
        }
        break
      }
    }
    
    // Detect if it's a rack (exclude 'tier' to avoid confusion with tier count)
    const isRack = lowerText.includes('rack') || lowerText.includes('shelf') || 
                   lowerText.includes('vertical') || lowerText.includes('multi-tier') || 
                   lowerText.includes('multitier') || lowerText.includes('multilevel')
    
    // Enhanced tier detection
    let tiers = 1
    
    // Match various tier patterns
    const tierPatterns = [
      /(\d+)\s*(?:tier|level|layer|shelf|shelves)(?:\s*(?:tall|high|rack))?/,  // 4 tier rack
      /(\d+)\s*(?:tall|high)\s*(?:tier|level|layer|shelf|shelves|rack)?/,  // 4 tall rack
      /(?:tier|level|layer)(?:s)?\s*[:=]?\s*(\d+)/,  // tiers: 4
      /(\d+)-tier/,  // 4-tier
      /(\d+)\s*(?:story|stories)/  // 4 story
    ]
    
    for (const pattern of tierPatterns) {
      const match = lowerText.match(pattern)
      if (match) {
        tiers = parseInt(match[1])
        break
      }
    }
    
    // If multi-tier mentioned but no specific number, default to 3
    if (tiers === 1 && (lowerText.includes('multi') || lowerText.includes('multiple'))) {
      tiers = 3
    }
    
    // Detect crop type
    let cropType = 'leafy greens' // default
    if (lowerText.includes('cannabis') || lowerText.includes('hemp') || lowerText.includes('marijuana')) cropType = 'cannabis'
    else if (lowerText.includes('tomato')) cropType = 'tomatoes'
    else if (lowerText.includes('herb') || lowerText.includes('basil') || lowerText.includes('cilantro')) cropType = 'herbs'
    else if (lowerText.includes('lettuce')) cropType = 'lettuce'
    else if (lowerText.includes('strawberr')) cropType = 'strawberries'
    else if (lowerText.includes('microgreen')) cropType = 'microgreens'
    else if (lowerText.includes('pepper')) cropType = 'peppers'
    else if (lowerText.includes('cucumber')) cropType = 'cucumbers'
    
    // Check for DLC fixture request
    const requestDLC = lowerText.includes('dlc') || lowerText.includes('certified') || 
                       lowerText.includes('dlc fixture') || lowerText.includes('dlc certified')
    
    // Extract specific fixture type if mentioned
    let fixtureType = undefined
    if (lowerText.includes('bar light') || lowerText.includes('bar fixture')) fixtureType = 'bar'
    else if (lowerText.includes('panel')) fixtureType = 'panel'
    else if (lowerText.includes('toplighting')) fixtureType = 'toplighting'
    
    return {
      roomWidth: width,
      roomLength: length,
      roomHeight: height,
      targetPPFD,
      cropType,
      mountingHeight,
      isRack,
      tiers,
      requestDLC,
      fixtureType
    }
  }

  const generateDesign = async (parameters: DesignParameters) => {
    try {
      const response = await fetch('/api/ai-assistant/generate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parameters)
      })

      if (response.ok) {
        const design = await response.json()
        return design
      }
      return null
    } catch (error) {
      console.error('Error generating design:', error)
      return null
    }
  }

  const applyDesignToCanvas = () => {
    if (!pendingDesign) return

    // Store design in sessionStorage for the designer to pick up
    sessionStorage.setItem('aiGeneratedDesign', JSON.stringify(pendingDesign))
    
    // Navigate to designer if not already there
    if (!pathname.includes('/design/advanced')) {
      router.push('/design/advanced')
    } else {
      // Dispatch event for designer to pick up
      window.dispatchEvent(new CustomEvent('applyAIDesign', { detail: pendingDesign }))
    }

    // Clear pending design
    setPendingDesign(null)
    
    // Add confirmation message
    const confirmMessage: Message = {
      id: Date.now().toString(),
      text: "✅ Design applied to canvas! You can now see your lighting layout and make any adjustments.",
      sender: 'system',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, confirmMessage])
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')
    setIsLoading(true)

    try {
      // First, try to parse the command to see if it's a specific action
      const commandResponse = await fetch('/api/ai-assistant/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command: userInput,
          context: {
            currentDesign: sessionStorage.getItem('currentDesign'),
            roomArea: sessionStorage.getItem('roomArea'),
            totalLightWattage: sessionStorage.getItem('totalWattage')
          }
        })
      })

      if (commandResponse.ok) {
        const commandData = await commandResponse.json()
        
        // Handle specific actions
        if (commandData.action === 'add_equipment') {
          // Apply equipment addition to canvas
          window.dispatchEvent(new CustomEvent('addEquipment', { 
            detail: commandData.equipment 
          }))
          
          const actionMessage: Message = {
            id: Date.now().toString(),
            text: commandData.message,
            sender: 'assistant',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, actionMessage])
          setIsLoading(false)
          return
        } else if (commandData.action === 'generate_design') {
          // This is a standard design request, continue with normal flow
          const designParams = commandData.parameters
        }
      }

      // If not a specific command, continue with regular AI chat
      const designParams = extractDesignParameters(userInput)
      
      // Debug logging for development
      if (designParams) {
        // Design parameters would be logged here
      }
      
      const isDesignRequest = designParams || 
        userInput.toLowerCase().includes('design') || 
        userInput.toLowerCase().includes('plan') ||
        userInput.toLowerCase().includes('layout')

      // Continue with the rest of the existing logic...
      // Build conversation history for context
      const conversationHistory = messages
        .filter(m => m.sender !== 'system')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      
      // Add the new user message
      conversationHistory.push({
        role: 'user',
        content: userInput
      })

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: conversationHistory
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.content,
          sender: 'assistant',
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])

        // If this looks like a design request and we have parameters, generate the design
        if (isDesignRequest && designParams) {
          const design = await generateDesign(designParams)
          if (design) {
            setPendingDesign(design)
            
            // Add design summary message
            const designMessage: Message = {
              id: (Date.now() + 2).toString(),
              text: `📐 **Design Generated:**\n\n` +
                    `• Room: ${design.room.width}' × ${design.room.length}' × ${design.room.height}'\n` +
                    `• Fixtures: ${design.summary.fixtureCount}× ${design.summary.fixtureModel}\n` +
                    `• Layout: ${design.summary.layout}\n` +
                    (design.summary.tiers > 1 ? `• Rack Tiers: ${design.summary.tiers} levels\n` : '') +
                    `• Expected PPFD: ${design.summary.expectedPPFD} μmol/m²/s\n` +
                    `• Expected DLI: ${design.summary.expectedDLI} mol/m²/day\n` +
                    `• Total Power: ${design.summary.totalPower}W\n` +
                    `• Monthly Cost: ${design.summary.monthlyCost}\n\n` +
                    `Would you like me to apply this design to the canvas?`,
              sender: 'assistant',
              timestamp: new Date(),
              designData: design
            }
            
            setTimeout(() => {
              setMessages(prev => [...prev, designMessage])
            }, 1000)
          }
        }
        
        // Show usage info if available
        if (data.usage && data.usage.monthlyLimit > 0) {
          const usageMessage: Message = {
            id: (Date.now() + 3).toString(),
            text: `💡 AI Credits: ${data.usage.remaining}/${data.usage.monthlyLimit} remaining this month`,
            sender: 'system',
            timestamp: new Date()
          }
          setTimeout(() => {
            setMessages(prev => [...prev, usageMessage])
          }, 1500)
        }
      } else if (response.status === 429) {
        const errorData = await response.json()
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: errorData.message || 'You have reached your monthly AI query limit. Please upgrade your plan for more queries.',
          sender: 'assistant',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
        
        // Add upgrade prompt
        const upgradeMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: '🚀 Upgrade to Professional or Business plan for more AI queries and advanced features.',
          sender: 'system',
          timestamp: new Date()
        }
        setTimeout(() => {
          setMessages(prev => [...prev, upgradeMessage])
        }, 500)
      } else {
        // Use enhanced fallback response
        const fallbackResponse = getEnhancedFallbackResponse(userInput.toLowerCase())
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: fallbackResponse,
          sender: 'assistant',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])

        // If it's a design request, still try to generate design
        if (isDesignRequest && designParams) {
          const design = await generateDesign(designParams)
          if (design) {
            setPendingDesign(design)
            
            const designMessage: Message = {
              id: (Date.now() + 2).toString(),
              text: `📐 I've generated a lighting design for your ${design.room.width}' × ${design.room.length}' space. Click below to apply it to the canvas.`,
              sender: 'assistant',
              timestamp: new Date(),
              designData: design
            }
            
            setTimeout(() => {
              setMessages(prev => [...prev, designMessage])
            }, 500)
          }
        }
      }
    } catch (error) {
      console.error('Error calling AI Assistant API:', error)
      // Use fallback response on error
      const fallbackResponse = getEnhancedFallbackResponse(userInput.toLowerCase())
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        sender: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    }
    
    setIsLoading(false)
  }

  const getEnhancedFallbackResponse = (query: string): string => {
    // Check for room/rack design requests
    if ((query.includes('4') && query.includes('8')) || query.includes('4x8') || query.includes('rack')) {
      return "For a 4' x 8' rack setup:\n\n**Lighting Design:**\n• Total area: 32 sq ft (2.97 m²)\n• For 200 μmol/m²/s: Need 594 μmol/s total PPF\n• Recommended: 2x 320W LED bar lights\n• Mounting height: 12-18\" above canopy\n• Fixture spacing: 2' on center\n• Expected uniformity: >0.8\n\n**Power & Efficiency:**\n• Total power: 640W\n• System efficacy: 2.8 μmol/J\n• DLI at 16h: 11.5 mol/m²/day\n• Monthly energy: ~307 kWh\n\nThis is ideal for leafy greens, herbs, and microgreens. For flowering crops, increase to 600-800 μmol/m²/s."
    }
    
    // UV spectrum questions
    if (query.includes('uv') && (query.includes('b') || query.includes('c'))) {
      return "**UV Spectrum Breakdown:**\n\n• **UV-C (100-280nm)**: Germicidal wavelength, harmful to plants and humans. Not used in horticultural lighting.\n\n• **UV-B (280-315nm)**: \n  - Increases secondary metabolites\n  - Enhances flavor and medicinal compounds\n  - Use sparingly (0.1-0.5% of total spectrum)\n  - Can cause DNA damage if overused\n\n• **UV-A (315-400nm)**:\n  - Safe for continuous exposure\n  - Increases anthocyanins and flavonoids\n  - Improves pest resistance\n  - Typical usage: 2-5% of total spectrum\n\nFor most crops, UV-A is sufficient. UV-B should only be used by experienced growers with proper safety equipment."
    }
    
    // Specific crop requests
    if (query.includes('lettuce')) {
      return "**Lettuce Growing Guide:**\n\n📊 **Light Requirements:**\n• PPFD: 150-250 μmol/m²/s (200 optimal)\n• DLI: 12-17 mol/m²/day\n• Photoperiod: 16-18 hours\n\n💡 **Spectrum:**\n• Blue (450nm): 20-25%\n• Red (660nm): 60-65%\n• Far-red (730nm): 5-10%\n• Green (520nm): 10-15%\n\n🌡️ **Environment:**\n• Temperature: 65-70°F (18-21°C)\n• Humidity: 50-70%\n• VPD: 0.65-0.85 kPa\n\n⚡ **Energy Tip:** Reduce intensity to 150 μmol/m²/s in final week to save 25% energy without yield loss."
    }
    
    if (query.includes('cannabis') || query.includes('hemp')) {
      return "**Cannabis Lighting Guide:**\n\n🌱 **Vegetative Stage:**\n• PPFD: 400-600 μmol/m²/s\n• Photoperiod: 18-24 hours\n• Spectrum: Higher blue (20-30%)\n• DLI: 25-40 mol/m²/day\n\n🌸 **Flowering Stage:**\n• PPFD: 600-900 μmol/m²/s\n• Photoperiod: 12 hours\n• Spectrum: Higher red (70-80%)\n• DLI: 25-40 mol/m²/day\n\n💨 **With CO₂ Enrichment:**\n• Can increase to 1200-1500 μmol/m²/s\n• Maintain 1200-1500 ppm CO₂\n• Temperature: 82-86°F\n\n⚠️ **Photobleaching Prevention:** Keep tops 18-24\" from high-intensity fixtures."
    }
    
    if (query.includes('tomato') || query.includes('tomatoes')) {
      return "**Tomato Production Lighting:**\n\n🌱 **Growth Stages:**\n• Seedling: 200-300 μmol/m²/s for 16h\n• Vegetative: 400-600 μmol/m²/s for 18h\n• Flowering: 600-800 μmol/m²/s for 16h\n• Fruiting: 700-900 μmol/m²/s for 14-16h\n\n📊 **DLI Targets:**\n• Minimum: 20 mol/m²/day\n• Optimal: 25-30 mol/m²/day\n• Maximum: 35 mol/m²/day\n\n💡 **Spectrum Tips:**\n• Add far-red (10-15%) during flowering\n• Increase blue (20%) for stronger stems\n• Maintain high R:FR ratio (4:1) for compact growth\n\n🍅 **Yield Optimization:** Inter-canopy lighting can increase yield by 20-30%."
    }
    
    // PPFD/DLI calculations
    if (query.includes('ppfd') || query.includes('dli') || query.includes('calculate')) {
      return "**Lighting Calculations Guide:**\n\n📐 **PPFD Calculation:**\nPPFD = Total PPF ÷ Growing Area\nExample: 1000 μmol/s ÷ 4 m² = 250 μmol/m²/s\n\n📊 **DLI Calculation:**\nDLI = PPFD × Hours × 0.0036\nExample: 400 × 16 × 0.0036 = 23 mol/m²/day\n\n💡 **Quick Reference:**\n• Low light crops: 100-200 PPFD (6-12 DLI)\n• Medium light: 200-400 PPFD (12-20 DLI)\n• High light: 400-600 PPFD (20-30 DLI)\n• Very high: 600-1000 PPFD (30-50 DLI)\n\n🔧 **Design Tool:** Use our Advanced Designer to visualize PPFD distribution and optimize fixture placement."
    }
    
    // Spectrum questions
    if (query.includes('spectrum') || query.includes('nm') || query.includes('wavelength')) {
      return "**Light Spectrum Guide:**\n\n🟣 **UV (280-400nm)**\n• Stress response, flavor compounds\n• Use: 0-5% of total spectrum\n\n🔵 **Blue (400-500nm)**\n• Chlorophyll synthesis, compact growth\n• Vegetative: 20-30%, Flowering: 10-20%\n\n🟢 **Green (500-600nm)**\n• Canopy penetration, photosynthesis\n• Use: 10-15% for better yields\n\n🔴 **Red (600-700nm)**\n• Primary photosynthesis driver\n• Vegetative: 50-60%, Flowering: 60-70%\n\n🟤 **Far-Red (700-800nm)**\n• Shade avoidance, flowering trigger\n• Use: 5-15% depending on crop\n\n💡 **Pro Tip:** Adjust R:FR ratio to control plant morphology. Higher ratio = compact, Lower = stretchy"
    }
    
    // Energy/efficiency questions
    if (query.includes('energy') || query.includes('efficiency') || query.includes('save')) {
      return "**Energy Optimization Strategies:**\n\n💡 **Fixture Efficiency:**\n• Target: >2.7 μmol/J system efficacy\n• Top-tier LEDs: 3.0-3.5 μmol/J\n• Replace HPS (1.7 μmol/J) with LED for 40% savings\n\n⚡ **Smart Controls:**\n• Dimming: Reduce 20% in last week\n• Sunrise/sunset: Save 5-10% daily\n• Photoperiod optimization by crop stage\n\n🌡️ **Environmental Integration:**\n• Reduce HVAC load by 30-50% vs HPS\n• Use LED heat for root zone warming\n• Time-of-use scheduling for lower rates\n\n💰 **ROI Calculation:**\n• Energy savings: $0.10-0.15/kWh\n• Yield increase: 20-30% vs HPS\n• Typical payback: 18-24 months\n\nUse our ROI Calculator for detailed analysis!"
    }
    
    // Default response
    return "I can help you design a custom lighting plan! To provide the best recommendations, please tell me:\n\n• Room dimensions (length × width × height)\n• Crop type and growth stage\n• Target PPFD or current lighting\n• Budget considerations\n• Environmental controls (HVAC, CO₂)\n\nYou can also explore our tools:\n• **Advanced Designer** - Visual light planning\n• **PPFD Calculator** - Calculate light requirements\n• **DLI Calculator** - Daily light integral planning\n• **ROI Calculator** - Cost/benefit analysis\n• **Fixture Library** - Browse 1200+ DLC fixtures\n\nWhat would you like help with today?"
  }

  const quickActions = [
    { label: 'Design 4x8 Rack', query: 'Design a lighting plan for a 4x8 rack with 200 PPFD' },
    { label: 'Cannabis Flowering', query: 'What PPFD do I need for cannabis flowering?' },
    { label: 'Calculate DLI', query: 'How do I calculate DLI for my grow room?' },
    { label: 'Save Energy', query: 'How can I reduce energy costs in my grow?' }
  ]

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(true)
        }}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-110 z-50"
        aria-label="Open AI Assistant"
      >
        <div className="relative">
          <MessageSquare className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        </div>
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-6 right-6 transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        } ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[600px] max-h-[80vh]'
        } z-50`}
      >
        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Lighting Expert</h3>
                <p className="text-purple-100 text-xs">AI-Powered Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4 text-white" /> : <Minimize2 className="w-4 h-4 text-white" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 
                      message.sender === 'system' ? 'justify-center' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-purple-600 text-white'
                          : message.sender === 'system'
                          ? 'bg-gray-800/50 text-gray-400 border border-gray-700 text-center text-xs px-3 py-1'
                          : 'bg-gray-800 text-gray-100 border border-gray-700'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      
                      {/* Apply Design Button */}
                      {message.designData && pendingDesign && (
                        <button
                          onClick={applyDesignToCanvas}
                          className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 group"
                        >
                          <Wand2 className="w-4 h-4" />
                          Apply Design to Canvas
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}
                      
                      {message.sender !== 'system' && isMounted && (
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 rounded-2xl px-4 py-2 border border-gray-700">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                        <span className="text-sm text-gray-400">Analyzing your request...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="px-4 pb-2 flex-shrink-0">
                <div className="flex gap-2 overflow-x-auto py-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => setInput(action.query)}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 whitespace-nowrap transition-colors border border-gray-700"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-800 flex-shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage()
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your grow space..."
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl transition-colors"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}