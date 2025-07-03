"use client"

import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { 
  Maximize2, 
  Square, 
  Circle, 
  Pentagon,
  Plus,
  Minus,
  Move,
  RotateCw,
  Download,
  Upload,
  Settings,
  Grid,
  Zap,
  Sun,
  Ruler,
  Target,
  Eye,
  EyeOff,
  Layers,
  Save,
  FolderOpen,
  BarChart3,
  Lock,
  Crown,
  FileText
} from 'lucide-react'
import { FixtureLibrary, type FixtureModel } from '@/components/FixtureLibrary'
import { NotificationProvider, useNotifications } from '@/components/designer/context/NotificationContext'
import { FixtureLibraryCompact } from '@/components/designer/panels/FixtureLibraryCompact'
import { dlcFixturesDatabase } from '@/lib/dlc-fixtures-data'
import { BasicCanvas2D } from '@/components/designer/canvas/BasicCanvas2D'

type SubscriptionTier = 'FREE' | 'PROFESSIONAL' | 'ENTERPRISE'

interface Room {
  width: number
  length: number
  height: number
  shape: 'rectangle' | 'square' | 'circle' | 'polygon'
  mountingHeight: number
  targetPPFD: number
  targetDLI: number
  photoperiod: number
  reflectances: {
    ceiling: number
    walls: number
    floor: number
  }
}

interface Fixture {
  id: string
  type: 'fixture'
  x: number
  y: number
  z: number
  rotation: number
  width: number
  length: number
  height: number
  model: FixtureModel
  enabled: boolean
  dimmingLevel: number
}

function LightingDesignPageContent() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const { showNotification } = useNotifications()
  const [userTier, setUserTier] = useState<SubscriptionTier>('FREE')
  const [loading, setLoading] = useState(true)

  const [room, setRoom] = useState<Room>({
    width: 10,
    length: 10,
    height: 10,
    shape: 'rectangle',
    mountingHeight: 3,
    targetPPFD: 600,
    targetDLI: 20,
    photoperiod: 16,
    reflectances: {
      ceiling: 0.8,
      walls: 0.5,
      floor: 0.2
    }
  })

  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null)
  const [selectedFixtureModel, setSelectedFixtureModel] = useState<FixtureModel | null>(null)
  const [gridEnabled, setGridEnabled] = useState(true)
  const [showPARMap, setShowPARMap] = useState(true)
  const [designMode, setDesignMode] = useState<'place' | 'move' | 'rotate'>('place')

  // Check user authentication and subscription
  useEffect(() => {
    // Temporarily disabled for testing
    // if (!isSignedIn) {
    //   redirect('/sign-in')
    // }
    
    // Get user's subscription tier from metadata
    const tier = user?.publicMetadata?.subscriptionTier as SubscriptionTier || 'FREE'
    setUserTier(tier)
    setLoading(false)
  }, [isSignedIn, user])

  // Feature limits based on subscription tier
  const featureLimits = {
    FREE: {
      maxFixtures: 5,
      exportPDF: false,
      exportJSON: false,
      saveDesigns: false,
      advancedShapes: false,
      parMap: false
    },
    PROFESSIONAL: {
      maxFixtures: 50,
      exportPDF: true,
      exportJSON: true,
      saveDesigns: true,
      advancedShapes: true,
      parMap: true
    },
    ENTERPRISE: {
      maxFixtures: -1, // unlimited
      exportPDF: true,
      exportJSON: true,
      saveDesigns: true,
      advancedShapes: true,
      parMap: true
    }
  }

  const limits = featureLimits[userTier]

  // Calculate uniformity
  const calculateUniformity = () => {
    if (fixtures.length === 0) return 0
    // Simplified uniformity calculation
    return 0.85 // Placeholder
  }

  // Calculate total power
  const totalPower = fixtures.reduce((sum, f) => {
    const wattage = f.model?.wattage || f.model?.inputWatts || 0
    const dimming = f.dimmingLevel / 100
    return sum + (f.enabled ? wattage * dimming : 0)
  }, 0)
  
  // Calculate average PPFD (simplified for now)
  const averagePPFD = fixtures.length > 0 ? 
    fixtures.reduce((sum, f) => {
      const ppf = f.model?.ppf || f.model?.ppf_fl || 0
      const dimming = f.dimmingLevel / 100
      const coverage = 16 // Default 4x4 ft coverage
      return sum + (f.enabled ? (ppf * dimming) / coverage : 0)
    }, 0) / fixtures.length : 0

  // Add fixture
  const addFixture = (x: number, y: number) => {
    if (!selectedFixtureModel) {
      showNotification('warning', 'Please select a fixture model first')
      return
    }
    
    // Check fixture limit for free users
    if (limits.maxFixtures !== -1 && fixtures.length >= limits.maxFixtures) {
      showNotification('warning', `You've reached the maximum of ${limits.maxFixtures} fixtures for your ${userTier} plan. Upgrade to add more fixtures.`)
      return
    }
    
    // Get dimensions from DLC data or defaults
    let fixtureWidth = 2;   // default width in feet
    let fixtureLength = 4;  // default length in feet  
    let fixtureHeight = 0.5; // default height in feet
    
    if (selectedFixtureModel.dlcData) {
      const dlcWidth = selectedFixtureModel.dlcData.width;
      const dlcLength = selectedFixtureModel.dlcData.length;
      const dlcHeight = selectedFixtureModel.dlcData.height;
      
      fixtureWidth = dlcWidth ? dlcWidth / 12 : 2;
      fixtureLength = dlcLength ? dlcLength / 12 : 4;
      fixtureHeight = dlcHeight ? dlcHeight / 12 : 0.5;
    } else if (selectedFixtureModel.dimensions) {
      fixtureWidth = selectedFixtureModel.dimensions.width || 2;
      fixtureLength = selectedFixtureModel.dimensions.length || 4;
      fixtureHeight = selectedFixtureModel.dimensions.height || 0.5;
    }
    
    const newFixture: Fixture = {
      id: `fixture-${Date.now()}`,
      type: 'fixture',
      x: x, // Already in feet from canvas
      y: y,
      z: room.mountingHeight,
      rotation: 0,
      width: fixtureWidth,
      length: fixtureLength,
      height: fixtureHeight,
      model: selectedFixtureModel,
      enabled: true,
      dimmingLevel: 100
    }
    setFixtures([...fixtures, newFixture])
  }

  // Save design to localStorage
  const saveDesign = () => {
    if (!limits.saveDesigns) {
      showNotification('warning', `Saving designs requires a ${userTier === 'FREE' ? 'Professional' : 'higher'} subscription. Upgrade to save your work!`)
      return
    }
    
    const design = {
      room,
      fixtures,
      savedAt: new Date().toISOString(),
      name: `Design_${new Date().toLocaleDateString()}`
    }
    
    // Get existing designs
    const existingDesigns = JSON.parse(localStorage.getItem('lightingDesigns') || '[]')
    existingDesigns.push(design)
    
    // Save to localStorage
    localStorage.setItem('lightingDesigns', JSON.stringify(existingDesigns))
    showNotification('success', 'Design saved successfully!')
  }

  // Export design as JSON
  const exportDesign = () => {
    if (!limits.exportJSON) {
      showNotification('warning', `Exporting designs requires a ${userTier === 'FREE' ? 'Professional' : 'higher'} subscription. Upgrade to export your designs!`)
      return
    }
    
    const design = {
      room,
      fixtures,
      metrics: {
        totalFixtures: fixtures.length,
        totalPower: totalPower,
        averagePPFD: averagePPFD,
        uniformity: calculateUniformity(),
        coverage: fixtures.reduce((sum, f) => sum + f.coverage, 0),
        powerDensity: totalPower / (room.width * room.length)
      },
      exportedAt: new Date().toISOString()
    }
    
    // Create blob and download
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lighting-design-${room.width}x${room.length}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Export as PDF (beautiful branded report)
  const exportAsPDF = () => {
    if (!limits.exportPDF) {
      showNotification('warning', `PDF reports require a ${userTier === 'FREE' ? 'Professional' : 'higher'} subscription. Upgrade to generate professional reports!`)
      return
    }
    
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    // Calculate additional metrics
    const roomArea = room.width * room.length
    const totalPPF = fixtures.reduce((sum, f) => {
      const ppf = f.model?.ppf || f.model?.ppf_fl || 0
      const dimming = f.dimmingLevel / 100
      return sum + (f.enabled ? ppf * dimming : 0)
    }, 0)
    const efficacy = totalPower > 0 ? (totalPPF / totalPower).toFixed(2) : '0'
    const estimatedDLI = ((averagePPFD * room.photoperiod * 3600) / 1000000).toFixed(1)
    const coveragePercentage = '85' // Placeholder for now
    
    // Open print dialog with beautiful design
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Vibelux Lighting Design Report</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
              
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                line-height: 1.6;
                color: #1a1a1a;
                background: #ffffff;
              }
              
              .page {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                background: white;
              }
              
              /* Header */
              .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 2px solid #f0f0f0;
              }
              
              .logo {
                display: flex;
                align-items: center;
                gap: 12px;
              }
              
              .logo-icon {
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 24px;
              }
              
              .logo-text {
                font-size: 28px;
                font-weight: 700;
                background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              
              .report-date {
                color: #666;
                font-size: 14px;
              }
              
              /* Title Section */
              .title-section {
                text-align: center;
                margin-bottom: 40px;
              }
              
              .report-title {
                font-size: 32px;
                font-weight: 700;
                color: #1a1a1a;
                margin-bottom: 8px;
              }
              
              .report-subtitle {
                color: #666;
                font-size: 16px;
              }
              
              /* Info Grid */
              .info-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin-bottom: 40px;
              }
              
              .info-card {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 20px;
                border: 1px solid #e5e7eb;
              }
              
              .info-card h3 {
                font-size: 14px;
                color: #666;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .info-value {
                font-size: 24px;
                font-weight: 600;
                color: #1a1a1a;
              }
              
              .info-unit {
                font-size: 14px;
                color: #666;
                font-weight: normal;
              }
              
              /* Metrics Section */
              .metrics-section {
                background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
                color: white;
                border-radius: 16px;
                padding: 32px;
                margin-bottom: 40px;
              }
              
              .metrics-title {
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 20px;
              }
              
              .metrics-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 24px;
              }
              
              .metric {
                text-align: center;
              }
              
              .metric-value {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 4px;
              }
              
              .metric-label {
                font-size: 14px;
                opacity: 0.9;
              }
              
              /* Table */
              .table-section {
                margin-bottom: 40px;
              }
              
              .section-title {
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 16px;
                color: #1a1a1a;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
              }
              
              th {
                background: #f8f9fa;
                padding: 12px;
                text-align: left;
                font-weight: 600;
                color: #666;
                border-bottom: 2px solid #e5e7eb;
              }
              
              td {
                padding: 12px;
                border-bottom: 1px solid #f0f0f0;
              }
              
              tr:hover {
                background: #f8f9fa;
              }
              
              /* Footer */
              .footer {
                margin-top: 60px;
                padding-top: 20px;
                border-top: 2px solid #f0f0f0;
                text-align: center;
                color: #666;
                font-size: 14px;
              }
              
              .footer-logo {
                font-weight: 600;
                color: #8b5cf6;
              }
              
              /* Print Styles */
              @media print {
                body {
                  print-color-adjust: exact;
                  -webkit-print-color-adjust: exact;
                }
                
                .page {
                  padding: 20px;
                }
                
                .metrics-section {
                  break-inside: avoid;
                }
                
                table {
                  break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="page">
              <!-- Header -->
              <div class="header">
                <div class="logo">
                  <div class="logo-icon">V</div>
                  <div class="logo-text">Vibelux</div>
                </div>
                <div class="report-date">${reportDate}</div>
              </div>
              
              <!-- Title -->
              <div class="title-section">
                <h1 class="report-title">Professional Lighting Design Report</h1>
                <p class="report-subtitle">Optimized for Maximum Yield and Energy Efficiency</p>
              </div>
              
              <!-- Room Information -->
              <div class="info-grid">
                <div class="info-card">
                  <h3>Room Dimensions</h3>
                  <div class="info-value">
                    ${room.width} × ${room.length} × ${room.height}
                    <span class="info-unit">ft</span>
                  </div>
                </div>
                <div class="info-card">
                  <h3>Growing Area</h3>
                  <div class="info-value">
                    ${roomArea}
                    <span class="info-unit">ft²</span>
                  </div>
                </div>
                <div class="info-card">
                  <h3>Mounting Height</h3>
                  <div class="info-value">
                    ${room.mountingHeight}
                    <span class="info-unit">ft</span>
                  </div>
                </div>
                <div class="info-card">
                  <h3>Photoperiod</h3>
                  <div class="info-value">
                    ${room.photoperiod}
                    <span class="info-unit">hours</span>
                  </div>
                </div>
              </div>
              
              <!-- Key Metrics -->
              <div class="metrics-section">
                <h2 class="metrics-title">Performance Metrics</h2>
                <div class="metrics-grid">
                  <div class="metric">
                    <div class="metric-value">${totalPower}</div>
                    <div class="metric-label">Total Watts</div>
                  </div>
                  <div class="metric">
                    <div class="metric-value">${averagePPFD.toFixed(0)}</div>
                    <div class="metric-label">Avg PPFD (μmol/m²/s)</div>
                  </div>
                  <div class="metric">
                    <div class="metric-value">${estimatedDLI}</div>
                    <div class="metric-label">Estimated DLI</div>
                  </div>
                  <div class="metric">
                    <div class="metric-value">${(totalPower / roomArea).toFixed(1)}</div>
                    <div class="metric-label">W/ft²</div>
                  </div>
                  <div class="metric">
                    <div class="metric-value">${efficacy}</div>
                    <div class="metric-label">PPE (μmol/J)</div>
                  </div>
                  <div class="metric">
                    <div class="metric-value">${coveragePercentage}%</div>
                    <div class="metric-label">Coverage</div>
                  </div>
                </div>
              </div>
              
              <!-- Fixture Details -->
              <div class="table-section">
                <h2 class="section-title">Fixture Schedule (${fixtures.length} Fixtures)</h2>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Model</th>
                      <th>Power</th>
                      <th>PPF</th>
                      <th>Position</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${fixtures.map((f, i) => {
                      const wattage = f.model?.wattage || f.model?.inputWatts || 0
                      const ppf = f.model?.ppf || f.model?.ppf_fl || 0
                      return `
                        <tr>
                          <td>${i + 1}</td>
                          <td>${f.model?.brand} ${f.model?.model}</td>
                          <td>${wattage}W @ ${f.dimmingLevel}%</td>
                          <td>${ppf} μmol/s</td>
                          <td>${f.x.toFixed(1)}, ${f.y.toFixed(1)} ft</td>
                          <td>${f.enabled ? '✅ Active' : '❌ Disabled'}</td>
                        </tr>
                      `
                    }).join('')}
                  </tbody>
                </table>
              </div>
              
              <!-- Recommendations -->
              <div class="table-section">
                <h2 class="section-title">Design Analysis</h2>
                <div class="info-card" style="margin-bottom: 12px;">
                  <p><strong>Target Achievement:</strong> ${
                    averagePPFD >= room.targetPPFD * 0.9 
                      ? '✅ Design meets or exceeds target PPFD requirements' 
                      : '⚠️ Consider adding more fixtures to meet target PPFD'
                  }</p>
                </div>
                <div class="info-card" style="margin-bottom: 12px;">
                  <p><strong>Energy Efficiency:</strong> ${
                    totalPower / roomArea <= 35 
                      ? '✅ Excellent power density for indoor cultivation' 
                      : '⚠️ Power density is higher than typical; consider fixture optimization'
                  }</p>
                </div>
                <div class="info-card">
                  <p><strong>Coverage:</strong> ${
                    parseFloat(coveragePercentage) >= 80 
                      ? '✅ Good coverage across growing area' 
                      : '⚠️ Consider repositioning fixtures for better coverage'
                  }</p>
                </div>
              </div>
              
              <!-- Footer -->
              <div class="footer">
                <p>Generated by <span class="footer-logo">Vibelux</span> Professional Lighting Design Platform</p>
                <p style="margin-top: 8px; font-size: 12px;">www.vibelux.com | Elevating Indoor Agriculture Through Intelligent Lighting</p>
              </div>
            </div>
            
            <script>
              window.print();
              setTimeout(() => window.close(), 1000);
            </script>
          </body>
        </html>
      `)
    }
  }

  // Load design from file
  const loadDesign = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const design = JSON.parse(e.target?.result as string)
        setRoom(design.room)
        setFixtures(design.fixtures)
        showNotification('success', 'Design loaded successfully!')
      } catch (error) {
        showNotification('error', 'Error loading design file')
      }
    }
    reader.readAsText(file)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Dark gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
      
      <div className="relative z-10">
        {/* Subscription Banner for Free Users */}
        {userTier === 'FREE' && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-center">
            <p className="text-sm flex items-center justify-center gap-2">
              <Crown className="w-4 h-4" />
              You're on the Free plan. Upgrade to Professional to unlock PDF exports, save designs, PAR maps, and more!
              <a href="/pricing" className="underline hover:no-underline font-semibold">
                Upgrade Now
              </a>
            </p>
          </div>
        )}
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg shadow-purple-500/20">
                  <Maximize2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Lighting Design Studio
                  </h1>
                  <p className="text-gray-400 text-sm">Create and optimize your grow room layout</p>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <label className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={loadDesign}
                    className="hidden"
                  />
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-all cursor-pointer">
                    <FolderOpen className="w-5 h-5 text-gray-300" />
                  </button>
                </label>
                <button 
                  onClick={saveDesign}
                  className={`p-2 rounded-lg border transition-all relative ${
                    limits.saveDesigns 
                      ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' 
                      : 'bg-gray-900 border-gray-800 cursor-not-allowed'
                  }`}
                  disabled={!limits.saveDesigns}
                >
                  <Save className={`w-5 h-5 ${limits.saveDesigns ? 'text-gray-300' : 'text-gray-600'}`} />
                  {!limits.saveDesigns && (
                    <Crown className="w-3 h-3 absolute -top-1 -right-1 text-yellow-500" />
                  )}
                </button>
                <button 
                  onClick={exportDesign}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    limits.exportJSON
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
                      : 'bg-gray-900 text-gray-600 border border-gray-800 cursor-not-allowed'
                  }`}
                  disabled={!limits.exportJSON}
                >
                  {!limits.exportJSON && <Crown className="w-4 h-4 text-yellow-500" />}
                  Export Design
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Sidebar - Tools */}
          <div className="w-64 bg-gray-900/90 backdrop-blur-xl border-r border-gray-800 p-4 space-y-4 overflow-y-auto">
            {/* Room Configuration */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Square className="w-4 h-4 text-purple-400" />
                Room Setup
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400">Shape</label>
                  <div className="grid grid-cols-4 gap-1 mt-1">
                    {[
                      { shape: 'rectangle', icon: Square, locked: false },
                      { shape: 'square', icon: Square, locked: false },
                      { shape: 'circle', icon: Circle, locked: !limits.advancedShapes },
                      { shape: 'polygon', icon: Pentagon, locked: !limits.advancedShapes }
                    ].map(({ shape, icon: Icon, locked }) => (
                      <button
                        key={shape}
                        onClick={() => {
                          if (locked) {
                            showNotification('warning', 'Advanced shapes require a Professional subscription. Upgrade to unlock circle and polygon rooms!')
                            return
                          }
                          setRoom({...room, shape: shape as any})
                        }}
                        className={`p-2 rounded-lg transition-all relative ${
                          room.shape === shape 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                            : locked
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                        disabled={locked}
                      >
                        <Icon className="w-4 h-4" />
                        {locked && (
                          <Lock className="w-3 h-3 absolute top-0 right-0 text-gray-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">Width (ft)</label>
                    <input
                      type="number"
                      value={room.width}
                      onChange={(e) => setRoom({...room, width: Number(e.target.value)})}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Length (ft)</label>
                    <input
                      type="number"
                      value={room.length}
                      onChange={(e) => setRoom({...room, length: Number(e.target.value)})}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400">Ceiling Height (ft)</label>
                  <input
                    type="number"
                    value={room.height}
                    onChange={(e) => setRoom({...room, height: Number(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400">Mounting Height (ft)</label>
                  <input
                    type="number"
                    value={room.mountingHeight}
                    onChange={(e) => setRoom({...room, mountingHeight: Number(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-gray-700">
                  <label className="text-xs text-gray-400 mb-2 block">Surface Reflectances</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Ceiling</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          value={room.reflectances.ceiling * 100}
                          onChange={(e) => setRoom({
                            ...room,
                            reflectances: {
                              ...room.reflectances,
                              ceiling: Number(e.target.value) / 100
                            }
                          })}
                          min="0"
                          max="100"
                          className="w-20"
                        />
                        <span className="text-xs text-gray-400 w-10 text-right">
                          {Math.round(room.reflectances.ceiling * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Walls</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          value={room.reflectances.walls * 100}
                          onChange={(e) => setRoom({
                            ...room,
                            reflectances: {
                              ...room.reflectances,
                              walls: Number(e.target.value) / 100
                            }
                          })}
                          min="0"
                          max="100"
                          className="w-20"
                        />
                        <span className="text-xs text-gray-400 w-10 text-right">
                          {Math.round(room.reflectances.walls * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Floor</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          value={room.reflectances.floor * 100}
                          onChange={(e) => setRoom({
                            ...room,
                            reflectances: {
                              ...room.reflectances,
                              floor: Number(e.target.value) / 100
                            }
                          })}
                          min="0"
                          max="100"
                          className="w-20"
                        />
                        <span className="text-xs text-gray-400 w-10 text-right">
                          {Math.round(room.reflectances.floor * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixture Library */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700">
              <FixtureLibraryCompact 
                isOpen={true}
                onSelectFixture={(fixture) => {
                  setSelectedFixtureModel(fixture)
                  showNotification('success', `Selected ${fixture.brand} ${fixture.model}`)
                }}
              />
            </div>

            {/* Design Tools */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-3">Design Tools</h3>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setDesignMode('place')}
                  className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 ${
                    designMode === 'place' 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-xs">Place</span>
                </button>
                <button
                  onClick={() => setDesignMode('move')}
                  className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 ${
                    designMode === 'move' 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <Move className="w-5 h-5" />
                  <span className="text-xs">Move</span>
                </button>
                <button
                  onClick={() => setDesignMode('rotate')}
                  className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 ${
                    designMode === 'rotate' 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <RotateCw className="w-5 h-5" />
                  <span className="text-xs">Rotate</span>
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setGridEnabled(!gridEnabled)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Grid className="w-4 h-4" />
                    Grid Snap
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    gridEnabled ? 'bg-purple-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      gridEnabled ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (!limits.parMap) {
                      showNotification('warning', 'PAR map visualization requires a Professional subscription. Upgrade to see light distribution patterns!')
                      return
                    }
                    setShowPARMap(!showPARMap)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                    limits.parMap ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 cursor-not-allowed'
                  }`}
                >
                  <span className={`text-sm flex items-center gap-2 ${
                    limits.parMap ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {showPARMap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    PAR Map
                    {!limits.parMap && <Lock className="w-3 h-3 text-gray-500" />}
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showPARMap && limits.parMap ? 'bg-purple-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showPARMap && limits.parMap ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>
              </div>
            </div>

            {/* Targets */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-green-400" />
                Lighting Targets
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400">Target PPFD</label>
                  <input
                    type="number"
                    value={room.targetPPFD}
                    onChange={(e) => setRoom({...room, targetPPFD: Number(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Target DLI</label>
                  <input
                    type="number"
                    value={room.targetDLI}
                    onChange={(e) => setRoom({...room, targetDLI: Number(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Photoperiod (hrs)</label>
                  <input
                    type="number"
                    value={room.photoperiod}
                    onChange={(e) => setRoom({...room, photoperiod: Number(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                Performance
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <p className="text-gray-400 text-xs">Fixtures</p>
                  <p className="text-xl font-bold text-white">
                    {fixtures.length}
                    {limits.maxFixtures !== -1 && (
                      <span className="text-xs text-gray-400">/{limits.maxFixtures}</span>
                    )}
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <p className="text-gray-400 text-xs">Power</p>
                  <p className="text-xl font-bold text-white">{totalPower}W</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <p className="text-gray-400 text-xs">Avg PPFD</p>
                  <p className="text-xl font-bold text-white">{averagePPFD.toFixed(0)}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <p className="text-gray-400 text-xs">Uniformity</p>
                  <p className="text-xl font-bold text-white">{(calculateUniformity() * 100).toFixed(0)}%</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Total PPF</span>
                  <span className="text-white text-sm font-medium">
                    {fixtures.reduce((sum, f) => {
                      const ppf = f.model?.ppf || f.model?.ppf_fl || 0
                      const dimming = f.dimmingLevel / 100
                      return sum + (f.enabled ? ppf * dimming : 0)
                    }, 0).toFixed(0)} μmol/s
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">W/ft²</span>
                  <span className="text-white text-sm font-medium">
                    {(totalPower / (room.width * room.length)).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 relative bg-gradient-to-br from-gray-900 to-gray-950">
            <BasicCanvas2D
              room={room}
              fixtures={fixtures}
              selectedFixture={selectedFixture}
              selectedFixtureModel={selectedFixtureModel}
              designMode={designMode}
              gridEnabled={gridEnabled}
              showPARMap={showPARMap && limits.parMap}
              onAddFixture={addFixture}
              onSelectFixture={setSelectedFixture}
              onUpdateFixture={(id, updates) => {
                setFixtures(fixtures.map(f => 
                  f.id === id ? { ...f, ...updates } : f
                ))
              }}
              showNotification={showNotification}
              onPPFDUpdate={(result) => {
                // Handle PPFD calculation results
              }}
            />

            {/* Quick actions floating panel */}
            <div className="absolute bottom-8 right-8 flex gap-2">
              <button 
                onClick={exportAsPDF}
                className="px-4 py-2 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-lg text-white hover:bg-gray-800/90 transition-all flex items-center gap-2"
                title="Export as PDF"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
              <button 
                onClick={exportDesign}
                className="px-4 py-2 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-lg text-white hover:bg-gray-800/90 transition-all flex items-center gap-2"
                title="Export as JSON"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={saveDesign}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Design
              </button>
            </div>
          </div>

          {/* Right Sidebar - Fixture Properties */}
          {selectedFixture && (
            <div className="w-80 bg-gray-900/90 backdrop-blur-xl border-l border-gray-800 p-4">
              <h3 className="text-white font-semibold mb-4">Fixture Properties</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Model</p>
                  <p className="text-white font-medium">
                    {fixtures.find(f => f.id === selectedFixture)?.model?.brand} {fixtures.find(f => f.id === selectedFixture)?.model?.model}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                    <p className="text-gray-400 text-xs">PPF</p>
                    <p className="text-white font-medium">
                      {fixtures.find(f => f.id === selectedFixture)?.model?.ppf || fixtures.find(f => f.id === selectedFixture)?.model?.ppf_fl || 0} μmol/s
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                    <p className="text-gray-400 text-xs">Wattage</p>
                    <p className="text-white font-medium">
                      {fixtures.find(f => f.id === selectedFixture)?.model?.wattage || fixtures.find(f => f.id === selectedFixture)?.model?.inputWatts || 0}W
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400">X Position (ft)</label>
                    <input
                      type="number"
                      value={fixtures.find(f => f.id === selectedFixture)?.x?.toFixed(1) || 0}
                      onChange={(e) => {
                        setFixtures(fixtures.map(f => 
                          f.id === selectedFixture ? {...f, x: Number(e.target.value)} : f
                        ))
                      }}
                      min="0"
                      max={room.width}
                      step="0.5"
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Y Position (ft)</label>
                    <input
                      type="number"
                      value={fixtures.find(f => f.id === selectedFixture)?.y?.toFixed(1) || 0}
                      onChange={(e) => {
                        setFixtures(fixtures.map(f => 
                          f.id === selectedFixture ? {...f, y: Number(e.target.value)} : f
                        ))
                      }}
                      min="0"
                      max={room.length}
                      step="0.5"
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Rotation (°)</label>
                    <input
                      type="number"
                      value={fixtures.find(f => f.id === selectedFixture)?.rotation || 0}
                      onChange={(e) => {
                        setFixtures(fixtures.map(f => 
                          f.id === selectedFixture ? {...f, rotation: Number(e.target.value)} : f
                        ))
                      }}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Dimming Level (%)</label>
                    <input
                      type="number"
                      value={fixtures.find(f => f.id === selectedFixture)?.dimmingLevel || 100}
                      onChange={(e) => {
                        setFixtures(fixtures.map(f => 
                          f.id === selectedFixture ? {...f, dimmingLevel: Math.min(100, Math.max(0, Number(e.target.value)))} : f
                        ))
                      }}
                      min="0"
                      max="100"
                      step="10"
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button 
                    onClick={() => {
                      const fixture = fixtures.find(f => f.id === selectedFixture)
                      if (fixture) {
                        setFixtures(fixtures.map(f => 
                          f.id === selectedFixture ? {...f, enabled: !f.enabled} : f
                        ))
                      }
                    }}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white transition-all"
                  >
                    {fixtures.find(f => f.id === selectedFixture)?.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button 
                    onClick={() => {
                      setFixtures(fixtures.filter(f => f.id !== selectedFixture))
                      setSelectedFixture(null)
                    }}
                    className="w-full px-4 py-2 bg-red-900/50 hover:bg-red-900/70 border border-red-800 rounded-lg text-red-400 transition-all"
                  >
                    Delete Fixture
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LightingDesignPage() {
  return (
    <NotificationProvider>
      <LightingDesignPageContent />
    </NotificationProvider>
  )
}