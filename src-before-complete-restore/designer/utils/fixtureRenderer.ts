import type { Fixture } from '../context/types'

export interface FixtureStyle {
  name: string
  category: 'led_panel' | 'led_strip' | 'high_bay' | 'pendant' | 'track' | 'flood'
  draw: (ctx: CanvasRenderingContext2D, fixture: Fixture, width: number, height: number, isSelected: boolean) => void
}

export const FIXTURE_STYLES: { [key: string]: FixtureStyle } = {
  // Professional LED Panel
  led_panel: {
    name: 'LED Panel',
    category: 'led_panel',
    draw: (ctx, fixture, width, height, isSelected) => {
      // Main housing (aluminum frame)
      ctx.fillStyle = '#c0c0c0'
      ctx.fillRect(-width / 2, -height / 2, width, height)
      
      // LED panel inset
      const inset = Math.min(width, height) * 0.1
      ctx.fillStyle = fixture.enabled ? '#ffffff' : '#444444'
      ctx.fillRect(-width / 2 + inset, -height / 2 + inset, width - 2 * inset, height - 2 * inset)
      
      // LED grid pattern
      if (fixture.enabled) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        const gridSize = Math.min(width, height) * 0.05
        const cols = Math.floor((width - 2 * inset) / gridSize)
        const rows = Math.floor((height - 2 * inset) / gridSize)
        
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const x = -width / 2 + inset + (i + 0.5) * gridSize
            const y = -height / 2 + inset + (j + 0.5) * gridSize
            ctx.beginPath()
            ctx.arc(x, y, gridSize * 0.2, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
      
      // Corner mounting holes
      ctx.fillStyle = '#666666'
      const holeSize = Math.min(width, height) * 0.02
      const cornerInset = holeSize * 2
      
      // Four corners
      ctx.beginPath()
      ctx.arc(-width / 2 + cornerInset, -height / 2 + cornerInset, holeSize, 0, Math.PI * 2)
      ctx.arc(width / 2 - cornerInset, -height / 2 + cornerInset, holeSize, 0, Math.PI * 2)
      ctx.arc(-width / 2 + cornerInset, height / 2 - cornerInset, holeSize, 0, Math.PI * 2)
      ctx.arc(width / 2 - cornerInset, height / 2 - cornerInset, holeSize, 0, Math.PI * 2)
      ctx.fill()
      
      // Brand/model label
      if (width > 30 && height > 20) {
        ctx.fillStyle = '#333333'
        ctx.font = `${Math.min(width, height) * 0.08}px Arial`
        ctx.textAlign = 'center'
        ctx.fillText(fixture.model?.name || 'LED', 0, height / 2 - inset / 2)
      }
      
      // Selection border
      if (isSelected) {
        ctx.strokeStyle = '#8b5cf6'
        ctx.lineWidth = 3
        ctx.strokeRect(-width / 2, -height / 2, width, height)
      }
    }
  },

  // LED Strip Light
  led_strip: {
    name: 'LED Strip',
    category: 'led_strip',
    draw: (ctx, fixture, width, height, isSelected) => {
      // Main strip housing
      ctx.fillStyle = '#2a2a2a'
      ctx.fillRect(-width / 2, -height / 2, width, height)
      
      // LED strip diffuser
      const diffuserHeight = height * 0.6
      ctx.fillStyle = fixture.enabled ? '#f0f8ff' : '#555555'
      ctx.fillRect(-width / 2, -diffuserHeight / 2, width, diffuserHeight)
      
      // Individual LED segments
      if (fixture.enabled && width > 20) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        const segmentWidth = width * 0.08
        const segments = Math.floor(width / (segmentWidth * 1.5))
        
        for (let i = 0; i < segments; i++) {
          const x = -width / 2 + (i + 0.5) * (width / segments)
          ctx.fillRect(x - segmentWidth / 2, -diffuserHeight / 4, segmentWidth, diffuserHeight / 2)
        }
      }
      
      // End caps
      ctx.fillStyle = '#666666'
      ctx.fillRect(-width / 2, -height / 2, height / 4, height)
      ctx.fillRect(width / 2 - height / 4, -height / 2, height / 4, height)
      
      // Mounting brackets
      ctx.fillStyle = '#888888'
      const bracketSize = height * 0.3
      ctx.fillRect(-width / 4, -height / 2 - bracketSize / 2, bracketSize, bracketSize)
      ctx.fillRect(width / 4 - bracketSize, -height / 2 - bracketSize / 2, bracketSize, bracketSize)
      
      if (isSelected) {
        ctx.strokeStyle = '#8b5cf6'
        ctx.lineWidth = 3
        ctx.strokeRect(-width / 2, -height / 2, width, height)
      }
    }
  },

  // High Bay LED
  high_bay: {
    name: 'High Bay',
    category: 'high_bay',
    draw: (ctx, fixture, width, height, isSelected) => {
      const radius = Math.max(5, Math.min(width, height) / 2) // Ensure minimum radius of 5
      
      // Main housing (circular)
      ctx.fillStyle = '#404040'
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.fill()
      
      // Heat sink fins
      ctx.strokeStyle = '#606060'
      ctx.lineWidth = 2
      const finCount = 8
      for (let i = 0; i < finCount; i++) {
        const angle = (i / finCount) * Math.PI * 2
        const x1 = Math.cos(angle) * radius * 0.7
        const y1 = Math.sin(angle) * radius * 0.7
        const x2 = Math.cos(angle) * radius * 0.9
        const y2 = Math.sin(angle) * radius * 0.9
        
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
      
      // LED array (center)
      ctx.fillStyle = fixture.enabled ? '#ffffff' : '#333333'
      ctx.beginPath()
      ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2)
      ctx.fill()
      
      // LED pattern
      if (fixture.enabled) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        const ledRings = 3
        for (let ring = 1; ring <= ledRings; ring++) {
          const ringRadius = (radius * 0.5 * ring) / ledRings
          const ledCount = ring * 6
          for (let led = 0; led < ledCount; led++) {
            const angle = (led / ledCount) * Math.PI * 2
            const x = Math.cos(angle) * ringRadius
            const y = Math.sin(angle) * ringRadius
            ctx.beginPath()
            ctx.arc(x, y, radius * 0.03, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
      
      // Reflector edge
      ctx.strokeStyle = '#888888'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(0, 0, radius * 0.95, 0, Math.PI * 2)
      ctx.stroke()
      
      // Hanging chain/cable
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, -radius)
      ctx.lineTo(0, -radius * 1.5)
      ctx.stroke()
      
      if (isSelected) {
        ctx.strokeStyle = '#8b5cf6'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(0, 0, radius + 2, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
  },

  // Pendant Light
  pendant: {
    name: 'Pendant',
    category: 'pendant',
    draw: (ctx, fixture, width, height, isSelected) => {
      const radius = Math.min(width, height) / 2
      
      // Suspension cable
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, -radius * 2)
      ctx.lineTo(0, -radius)
      ctx.stroke()
      
      // Main shade (dome)
      ctx.fillStyle = '#e5e5e5'
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.fill()
      
      // Inner reflector
      ctx.fillStyle = fixture.enabled ? '#fffacd' : '#cccccc'
      ctx.beginPath()
      ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2)
      ctx.fill()
      
      // LED ring
      if (fixture.enabled) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2)
        ctx.stroke()
      }
      
      // Rim detail
      ctx.strokeStyle = '#999999'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.stroke()
      
      if (isSelected) {
        ctx.strokeStyle = '#8b5cf6'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(0, 0, radius + 2, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
  },

  // Track Light
  track: {
    name: 'Track Light',
    category: 'track',
    draw: (ctx, fixture, width, height, isSelected) => {
      // Track rail
      ctx.fillStyle = '#404040'
      ctx.fillRect(-width / 2, -height / 6, width, height / 3)
      
      // Track segments
      ctx.fillStyle = '#606060'
      const segments = Math.floor(width / 10)
      for (let i = 0; i < segments; i++) {
        const x = -width / 2 + (i + 0.5) * (width / segments)
        ctx.fillRect(x - 1, -height / 6, 2, height / 3)
      }
      
      // Light heads
      const headCount = Math.max(1, Math.floor(width / 15))
      const headWidth = width / (headCount * 2)
      const headHeight = height * 0.4
      
      for (let i = 0; i < headCount; i++) {
        const x = -width / 2 + (i + 0.5) * (width / headCount)
        
        // Head housing
        ctx.fillStyle = '#2a2a2a'
        ctx.fillRect(x - headWidth / 2, -headHeight / 2, headWidth, headHeight)
        
        // Lens
        ctx.fillStyle = fixture.enabled ? '#ffffff' : '#666666'
        ctx.beginPath()
        ctx.arc(x, 0, headWidth * 0.3, 0, Math.PI * 2)
        ctx.fill()
        
        // Adjustment knob
        ctx.fillStyle = '#888888'
        ctx.fillRect(x - headWidth * 0.1, headHeight / 2 - 2, headWidth * 0.2, 4)
      }
      
      if (isSelected) {
        ctx.strokeStyle = '#8b5cf6'
        ctx.lineWidth = 3
        ctx.strokeRect(-width / 2, -height / 2, width, height)
      }
    }
  },

  // Flood Light
  flood: {
    name: 'Flood Light',
    category: 'flood',
    draw: (ctx, fixture, width, height, isSelected) => {
      // Main housing
      ctx.fillStyle = '#2a2a2a'
      ctx.fillRect(-width / 2, -height / 2, width, height)
      
      // Heat sink
      ctx.fillStyle = '#404040'
      const finCount = Math.floor(width / 5)
      for (let i = 0; i < finCount; i++) {
        const x = -width / 2 + (i + 0.5) * (width / finCount)
        ctx.fillRect(x - 1, -height / 2, 2, height)
      }
      
      // LED array
      ctx.fillStyle = fixture.enabled ? '#ffffff' : '#555555'
      const ledInset = Math.min(width, height) * 0.15
      ctx.fillRect(-width / 2 + ledInset, -height / 2 + ledInset, width - 2 * ledInset, height - 2 * ledInset)
      
      // Individual LEDs
      if (fixture.enabled) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        const ledSize = Math.min(width, height) * 0.06
        const cols = Math.floor((width - 2 * ledInset) / ledSize)
        const rows = Math.floor((height - 2 * ledInset) / ledSize)
        
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const x = -width / 2 + ledInset + (i + 0.5) * ledSize
            const y = -height / 2 + ledInset + (j + 0.5) * ledSize
            ctx.beginPath()
            ctx.arc(x, y, ledSize * 0.3, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
      
      // Protective glass
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)'
      ctx.lineWidth = 2
      ctx.strokeRect(-width / 2 + ledInset, -height / 2 + ledInset, width - 2 * ledInset, height - 2 * ledInset)
      
      if (isSelected) {
        ctx.strokeStyle = '#8b5cf6'
        ctx.lineWidth = 3
        ctx.strokeRect(-width / 2, -height / 2, width, height)
      }
    }
  }
}

// Function to determine fixture style based on model/type
export function getFixtureStyle(fixture: Fixture): FixtureStyle {
  // First check if fixture has a specific style set
  if (fixture.style && FIXTURE_STYLES[fixture.style]) {
    return FIXTURE_STYLES[fixture.style]
  }
  
  // Try to match by model name or characteristics
  const modelName = fixture.model?.name?.toLowerCase() || ''
  
  if (modelName.includes('strip') || modelName.includes('bar')) {
    return FIXTURE_STYLES.led_strip
  }
  if (modelName.includes('high bay') || modelName.includes('ufo') || fixture.model?.wattage > 200) {
    return FIXTURE_STYLES.high_bay
  }
  if (modelName.includes('pendant') || modelName.includes('hanging')) {
    return FIXTURE_STYLES.pendant
  }
  if (modelName.includes('track')) {
    return FIXTURE_STYLES.track
  }
  if (modelName.includes('flood') || modelName.includes('spot')) {
    return FIXTURE_STYLES.flood
  }
  
  // Default to LED panel for most fixtures
  return FIXTURE_STYLES.led_panel
}

// Enhanced light cone rendering
export function drawLightCone(
  ctx: CanvasRenderingContext2D,
  fixture: Fixture,
  width: number,
  height: number,
  scale: number
) {
  if (!fixture.enabled) return
  
  const beamAngle = fixture.model?.beamAngle || 120
  const distance = (fixture.model?.wattage || 100) * 0.1 // Rough distance based on wattage
  
  // Create gradient for realistic light falloff
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, distance * scale)
  gradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)')
  gradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.1)')
  gradient.addColorStop(1, 'rgba(255, 255, 200, 0)')
  
  ctx.fillStyle = gradient
  ctx.beginPath()
  
  // Draw cone based on beam angle
  const halfAngle = (beamAngle * Math.PI) / 360
  const coneRadius = Math.tan(halfAngle) * distance * scale
  
  ctx.moveTo(0, 0)
  ctx.arc(0, 0, coneRadius, -halfAngle, halfAngle)
  ctx.closePath()
  ctx.fill()
}