/**
 * Electrical circuit schedule and blueprint export utilities
 * Generates professional electrical documentation for installations
 */

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { exportToCSV } from './export-utils'

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface CircuitData {
  id: string
  type: string // e.g., "20A_208V", "30A_480V"
  voltage: number
  amperage: number
  phase: string // "1P" or "3P"
  loadWatts: number
  loadPercent: number
  fixtures: Array<{
    id: string
    model: string
    wattage: number
    position: { x: number; y: number }
  }>
}

export interface ElectricalDesignData {
  projectName: string
  totalLoad: number
  voltage: number
  phase: string
  circuits: CircuitData[]
  panelSchedule: {
    panelName: string
    mainBreaker: number
    busRating: number
    spaces: number
  }
  roomDimensions: {
    width: number
    length: number
    height: number
  }
}

/**
 * Generate circuit schedule CSV export
 */
export function exportCircuitScheduleCSV(data: ElectricalDesignData, filename: string): void {
  const csvData = data.circuits.map(circuit => ({
    'Circuit': circuit.id,
    'Type': circuit.type,
    'Load (W)': circuit.loadWatts,
    'Load (%)': `${circuit.loadPercent.toFixed(1)}%`,
    'Fixtures': circuit.fixtures.length
  }))
  
  exportToCSV(csvData, filename)
}

/**
 * Generate detailed circuit schedule with wire sizing
 */
export function exportDetailedCircuitSchedule(data: ElectricalDesignData, filename: string): void {
  const detailedData = data.circuits.map(circuit => {
    const current = circuit.loadWatts / circuit.voltage
    const wireSize = calculateWireSize(current, circuit.voltage, 100) // 100ft run
    
    return {
      'Circuit ID': circuit.id,
      'Voltage': `${circuit.voltage}V`,
      'Phase': circuit.phase,
      'Breaker Size': `${circuit.amperage}A`,
      'Connected Load': `${circuit.loadWatts}W`,
      'Load %': `${circuit.loadPercent.toFixed(1)}%`,
      'Current': `${current.toFixed(1)}A`,
      'Wire Size': wireSize,
      'Fixtures': circuit.fixtures.length,
      'Fixture Models': circuit.fixtures.map(f => f.model).join(', ')
    }
  })
  
  exportToCSV(detailedData, `${filename}_detailed`)
}

/**
 * Generate electrical blueprint PDF
 */
export function exportElectricalBlueprint(data: ElectricalDesignData): void {
  return;
  /*
  const pdf = new jsPDF('l', 'mm', 'a3') // Landscape A3 for blueprints
  const pageWidth = 420
  const pageHeight = 297
  const margin = 20
  
  // Title block
  pdf.setFillColor(255, 255, 255)
  pdf.rect(pageWidth - 100, pageHeight - 60, 90, 50, 'F')
  pdf.setDrawColor(0, 0, 0)
  pdf.rect(pageWidth - 100, pageHeight - 60, 90, 50)
  
  pdf.setFontSize(12)
  pdf.text('ELECTRICAL BLUEPRINT', pageWidth - 95, pageHeight - 50)
  pdf.setFontSize(10)
  pdf.text(data.projectName, pageWidth - 95, pageHeight - 40)
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 95, pageHeight - 30)
  pdf.text('Scale: 1:50', pageWidth - 95, pageHeight - 20)
  
  // Main title
  pdf.setFontSize(16)
  pdf.text('ELECTRICAL CIRCUIT LAYOUT', margin, 20)
  
  // Room outline
  const scale = Math.min(
    (pageWidth - 2 * margin - 120) / data.roomDimensions.width,
    (pageHeight - 2 * margin - 40) / data.roomDimensions.length
  ) * 0.8
  
  const roomWidth = data.roomDimensions.width * scale
  const roomLength = data.roomDimensions.length * scale
  const offsetX = margin
  const offsetY = 40
  
  // Draw room
  pdf.setLineWidth(1)
  pdf.setDrawColor(0, 0, 0)
  pdf.rect(offsetX, offsetY, roomWidth, roomLength)
  
  // Draw grid
  pdf.setLineWidth(0.1)
  pdf.setDrawColor(200, 200, 200)
  for (let i = 1; i < data.roomDimensions.width; i++) {
    const x = offsetX + i * scale
    pdf.line(x, offsetY, x, offsetY + roomLength)
  }
  for (let i = 1; i < data.roomDimensions.length; i++) {
    const y = offsetY + i * scale
    pdf.line(offsetX, y, offsetX + roomWidth, y)
  }
  
  // Group fixtures by circuit
  const circuitColors = [
    { r: 255, g: 0, b: 0 },     // Red
    { r: 0, g: 0, b: 255 },     // Blue
    { r: 0, g: 255, b: 0 },     // Green
    { r: 255, g: 165, b: 0 },   // Orange
    { r: 128, g: 0, b: 128 },   // Purple
    { r: 255, g: 192, b: 203 }  // Pink
  ]
  
  // Draw fixtures and circuit connections
  data.circuits.forEach((circuit, circuitIndex) => {
    const color = circuitColors[circuitIndex % circuitColors.length]
    pdf.setDrawColor(color.r, color.g, color.b)
    pdf.setLineWidth(0.5)
    
    // Draw circuit lines
    let lastX = offsetX + 10
    let lastY = offsetY + 10 + circuitIndex * 20
    
    circuit.fixtures.forEach((fixture, fixtureIndex) => {
      const x = offsetX + (fixture.position.x / 100) * roomWidth
      const y = offsetY + (fixture.position.y / 100) * roomLength
      
      // Draw fixture
      pdf.setFillColor(color.r, color.g, color.b)
      pdf.circle(x, y, 3, 'F')
      
      // Draw circuit connection
      if (fixtureIndex === 0) {
        // Connect to panel
        pdf.line(lastX, lastY, x, y)
      } else {
        // Connect to previous fixture
        pdf.line(lastX, lastY, x, y)
      }
      
      lastX = x
      lastY = y
      
      // Add fixture label
      pdf.setFontSize(8)
      pdf.text(`${circuit.id}-${fixtureIndex + 1}`, x + 5, y)
    })
  })
  
  // Add circuit legend
  pdf.setFontSize(10)
  pdf.text('CIRCUIT LEGEND', offsetX + roomWidth + 20, offsetY)
  
  data.circuits.forEach((circuit, index) => {
    const color = circuitColors[index % circuitColors.length]
    const legendY = offsetY + 15 + index * 15
    
    // Color box
    pdf.setFillColor(color.r, color.g, color.b)
    pdf.rect(offsetX + roomWidth + 20, legendY - 5, 10, 5, 'F')
    
    // Circuit info
    pdf.setTextColor(0, 0, 0)
    pdf.text(
      `${circuit.id}: ${circuit.type} - ${circuit.loadWatts}W (${circuit.fixtures.length} fixtures)`,
      offsetX + roomWidth + 35,
      legendY
    )
  })
  
  // Add panel schedule
  const panelY = offsetY + roomLength + 30
  pdf.setFontSize(12)
  pdf.text('PANEL SCHEDULE', offsetX, panelY)
  
  const panelData: any[] = (data.circuits || []).map((circuit: any) => [
    circuit.id,
    circuit.type,
    `${circuit.loadWatts}W`,
    `${circuit.loadPercent.toFixed(1)}%`,
    `${Array.isArray(circuit.fixtures) ? circuit.fixtures.length : circuit.fixtures || 0}`
  ])
  
  (pdf as any).autoTable({
    head: [['Circuit', 'Type', 'Load', 'Load %', 'Fixtures']],
    body: panelData,
    startY: panelY + 10,
    startX: offsetX,
    theme: 'grid',
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 30 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 }
    }
  })
  
  // Add electrical notes
  const notesY = (pdf as any).lastAutoTable.finalY + 20
  pdf.setFontSize(10)
  pdf.text('ELECTRICAL NOTES:', offsetX, notesY)
  pdf.setFontSize(9)
  const notes = [
    `1. Total connected load: ${data.totalLoad.toLocaleString()}W`,
    `2. Service voltage: ${data.voltage}V ${data.phase}`,
    `3. Main panel: ${data.panelSchedule.panelName} - ${data.panelSchedule.mainBreaker}A MCB`,
    `4. All wiring to be installed in accordance with NEC and local codes`,
    `5. Provide disconnect switch at each circuit origin`,
    `6. Ground all fixtures per manufacturer specifications`
  ]
  
  notes.forEach((note, index) => {
    pdf.text(note, offsetX, notesY + 10 + index * 6)
  })
  
  // Save
  pdf.save(`electrical_blueprint_${data.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
  */
}

/**
 * Generate single-line diagram
 */
export function exportSingleLineDiagram(data: ElectricalDesignData): void {
  const pdf = new jsPDF('p', 'mm', 'a4')
  
  pdf.setFontSize(16)
  pdf.text('SINGLE LINE DIAGRAM', 20, 20)
  pdf.setFontSize(12)
  pdf.text(data.projectName, 20, 30)
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40)
  
  // Draw utility connection
  const startX = 105
  let currentY = 60
  
  // Utility
  pdf.rect(startX - 20, currentY, 40, 20)
  pdf.text('UTILITY', startX - 10, currentY + 12)
  currentY += 30
  
  // Main breaker
  pdf.line(startX, currentY - 10, startX, currentY)
  pdf.circle(startX, currentY + 5, 5)
  pdf.text(`${data.panelSchedule.mainBreaker}A`, startX + 10, currentY + 7)
  currentY += 20
  
  // Panel
  pdf.rect(startX - 30, currentY, 60, 40)
  pdf.text(data.panelSchedule.panelName, startX - 20, currentY + 10)
  pdf.text(`${data.voltage}V ${data.phase}`, startX - 20, currentY + 20)
  pdf.text(`${data.panelSchedule.busRating}A Bus`, startX - 20, currentY + 30)
  currentY += 50
  
  // Branch circuits
  const circuitsPerRow = 4
  data.circuits.forEach((circuit, index) => {
    const col = index % circuitsPerRow
    const row = Math.floor(index / circuitsPerRow)
    const x = 40 + col * 40
    const y = currentY + row * 40
    
    // Circuit line
    pdf.line(startX, currentY - 10, x + 20, y)
    
    // Circuit breaker
    pdf.circle(x + 20, y + 5, 3)
    pdf.text(`${circuit.amperage}A`, x + 25, y + 7)
    
    // Load
    pdf.rect(x, y + 15, 40, 15)
    pdf.setFontSize(9)
    pdf.text(circuit.id, x + 2, y + 22)
    pdf.text(`${circuit.loadWatts}W`, x + 2, y + 27)
    pdf.setFontSize(12)
  })
  
  pdf.save(`single_line_${data.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
}

/**
 * Calculate wire size based on current and distance
 */
function calculateWireSize(current: number, voltage: number, distance: number): string {
  // Simplified wire sizing based on NEC
  // Assumes 3% voltage drop, copper wire, 75°C rating
  const voltageDrop = voltage * 0.03
  const resistance = voltageDrop / (2 * current)
  const cmil = (2 * distance * current * 12.9) / voltageDrop // 12.9 ohm/cmil-ft for copper
  
  // Standard wire sizes
  if (cmil <= 2110) return '14 AWG'
  if (cmil <= 3350) return '12 AWG'
  if (cmil <= 5320) return '10 AWG'
  if (cmil <= 8450) return '8 AWG'
  if (cmil <= 13400) return '6 AWG'
  if (cmil <= 21200) return '4 AWG'
  if (cmil <= 33600) return '2 AWG'
  if (cmil <= 42400) return '1 AWG'
  if (cmil <= 53500) return '1/0 AWG'
  if (cmil <= 67400) return '2/0 AWG'
  if (cmil <= 85000) return '3/0 AWG'
  if (cmil <= 107200) return '4/0 AWG'
  return '250 MCM'
}

/**
 * Generate load calculations sheet
 */
export function exportLoadCalculations(data: ElectricalDesignData): void {
  const calculations = {
    'Project Name': data.projectName,
    'Date': new Date().toLocaleDateString(),
    'Total Connected Load': `${data.totalLoad.toLocaleString()}W`,
    'Demand Factor': '100%', // Continuous loads
    'Calculated Load': `${data.totalLoad.toLocaleString()}W`,
    'Service Voltage': `${data.voltage}V ${data.phase}`,
    'Total Current': `${(data.totalLoad / data.voltage).toFixed(1)}A`,
    'Main Breaker Size': `${data.panelSchedule.mainBreaker}A`,
    'Panel Bus Rating': `${data.panelSchedule.busRating}A`,
    'Number of Circuits': data.circuits.length,
    'Spare Circuits': data.panelSchedule.spaces - data.circuits.length,
    'Load per Circuit (avg)': `${Math.round(data.totalLoad / data.circuits.length)}W`,
    'Power Factor': '0.95',
    'Total kVA': `${(data.totalLoad / 0.95 / 1000).toFixed(1)} kVA`
  }
  
  const csvData = Object.entries(calculations).map(([key, value]) => ({
    'Parameter': key,
    'Value': value
  }))
  
  exportToCSV(csvData, `load_calculations_${data.projectName.replace(/\s+/g, '_')}`)
}