"use client"

import { useState } from 'react'
import { 
  Layers,
  Grid3x3,
  Calculator,
  TrendingUp,
  DollarSign,
  Zap,
  Sun,
  Move,
  BarChart3,
  Info,
  Settings,
  Download,
  Upload,
  Package,
  Ruler,
  Wind,
  Droplets
} from 'lucide-react'
import { VerticalFarmLayout3D } from './VerticalFarmLayout3D'
import { VerticalFarmingEconomicsChart } from './VerticalFarmingEconomicsChart'

interface RackConfiguration {
  id: string
  name: string
  tiers: number
  width: number
  length: number
  tierHeight: number
  lightingPerTier: number
  plantsPerTier: number
}

interface SpaceMetrics {
  totalVolume: number
  usableVolume: number
  volumeEfficiency: number
  totalPlantCapacity: number
  plantsPerSqFt: number
  accessibleArea: number
}

interface EnergyMetrics {
  totalLightingPower: number
  hvacLoad: number
  totalPowerDraw: number
  powerPerPlant: number
  annualEnergyCost: number
  energyPerKg: number
}

interface ROIMetrics {
  setupCost: number
  annualOperatingCost: number
  annualRevenue: number
  paybackPeriod: number
  fiveYearNPV: number
  irrPercent: number
}

export function VerticalFarmingOptimizer() {
  const [roomDimensions, setRoomDimensions] = useState({
    width: 40, // feet
    length: 60, // feet
    height: 20 // feet
  })
  
  const [showAdvancedCalculator, setShowAdvancedCalculator] = useState(false)
  const [showRackConfig, setShowRackConfig] = useState(false)

  const [rackConfig, setRackConfig] = useState<RackConfiguration>({
    id: 'standard-5tier',
    name: 'Standard 5-Tier',
    tiers: 5,
    width: 4,
    length: 8,
    tierHeight: 3,
    lightingPerTier: 320, // watts
    plantsPerTier: 64
  })

  const [economicInputs, setEconomicInputs] = useState({
    electricityRate: 0.12, // $/kWh
    cropCyclesPerYear: 6,
    yieldPerPlant: 0.15, // kg
    pricePerKg: 25, // $
    laborCostPerHour: 20,
    waterCostPerGallon: 0.004
  })

  // Export design report function
  const exportDesignReport = () => {
    try {
      const layout = calculateLayout()
      const spaceMetrics = calculateSpaceMetrics(layout.totalRacks)
      const energyMetrics = calculateEnergyMetrics(layout.totalRacks)
      const roiMetrics = calculateROI(layout.totalRacks, energyMetrics)
    
    const reportContent = `Vertical Farming Design Report
${'='.repeat(50)}

Facility Dimensions:
- Width: ${roomDimensions.width} ft
- Length: ${roomDimensions.length} ft
- Height: ${roomDimensions.height} ft
- Total Area: ${roomDimensions.width * roomDimensions.length} sq ft

Rack Configuration: ${rackConfig.name}
- Tiers: ${rackConfig.tiers}
- Dimensions: ${rackConfig.width}' W x ${rackConfig.length}' L
- Tier Height: ${rackConfig.tierHeight}'
- Plants per Tier: ${rackConfig.plantsPerTier}
- Lighting per Tier: ${rackConfig.lightingPerTier}W

Layout Metrics:
- Total Racks: ${layout.totalRacks}
- Racks per Row: ${layout.racksPerRow}
- Number of Rows: ${layout.rowCount}
- Total Plant Capacity: ${spaceMetrics.totalPlantCapacity}
- Plants per Sq Ft: ${spaceMetrics.plantsPerSqFt.toFixed(2)}
- Volume Efficiency: ${spaceMetrics.volumeEfficiency.toFixed(1)}%

Energy Analysis:
- Total Lighting Power: ${(energyMetrics.totalLightingPower / 1000).toFixed(1)} kW
- HVAC Load: ${(energyMetrics.hvacLoad / 1000).toFixed(1)} kW
- Total Power Draw: ${(energyMetrics.totalPowerDraw / 1000).toFixed(1)} kW
- Power per Plant: ${energyMetrics.powerPerPlant.toFixed(1)}W
- Annual Energy Cost: $${energyMetrics.annualEnergyCost.toLocaleString()}

ROI Analysis:
- Setup Cost: $${roiMetrics.setupCost.toLocaleString()}
- Annual Operating Cost: $${roiMetrics.annualOperatingCost.toLocaleString()}
- Annual Revenue: $${roiMetrics.annualRevenue.toLocaleString()}
- Payback Period: ${roiMetrics.paybackPeriod.toFixed(1)} years
- 5-Year NPV: $${roiMetrics.fiveYearNPV.toLocaleString()}
- IRR: ${roiMetrics.irrPercent.toFixed(1)}%

Generated on: ${new Date().toLocaleString()}
`
    
    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vertical-farm-design-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting design report:', error)
      alert('Failed to export design report. Please check the console for details.')
    }
  }
  
  // Calculate layout
  const calculateLayout = () => {
    const aisleWidth = 4 // feet minimum for equipment
    const perimeterClearance = 2 // feet
    
    const usableWidth = roomDimensions.width - (2 * perimeterClearance)
    const usableLength = roomDimensions.length - (2 * perimeterClearance)
    
    // Calculate rack arrangement
    const racksPerRow = Math.floor(usableWidth / (rackConfig.width + aisleWidth))
    const rowCount = Math.floor(usableLength / rackConfig.length)
    const totalRacks = racksPerRow * rowCount
    
    return {
      racksPerRow,
      rowCount,
      totalRacks,
      aisleConfiguration: 'Single central aisle'
    }
  }
  
  const calculateSpaceMetrics = (totalRacks: number): SpaceMetrics => {
    const totalVolume = roomDimensions.width * roomDimensions.length * roomDimensions.height
    const usableVolume = totalRacks * rackConfig.width * rackConfig.length * (rackConfig.tiers * rackConfig.tierHeight)
    const totalPlantCapacity = totalRacks * rackConfig.tiers * rackConfig.plantsPerTier
    const accessibleArea = roomDimensions.width * roomDimensions.length - (totalRacks * rackConfig.width * rackConfig.length)
    
    return {
      totalVolume,
      usableVolume,
      volumeEfficiency: (usableVolume / totalVolume) * 100,
      totalPlantCapacity,
      plantsPerSqFt: totalPlantCapacity / (roomDimensions.width * roomDimensions.length),
      accessibleArea
    }
  }
  
  const calculateEnergyMetrics = (totalRacks: number): EnergyMetrics => {
    const totalLightingPower = totalRacks * rackConfig.tiers * rackConfig.lightingPerTier
    const hvacLoad = (roomDimensions.width * roomDimensions.length * roomDimensions.height) * 15 // 15W per cubic foot estimate
    const totalPowerDraw = totalLightingPower + hvacLoad
    const totalPlantCapacity = totalRacks * rackConfig.tiers * rackConfig.plantsPerTier
    const powerPerPlant = totalPowerDraw / totalPlantCapacity
    const annualEnergyCost = (totalPowerDraw / 1000) * 18 * 365 * economicInputs.electricityRate // 18h photoperiod
    const energyPerKg = ((totalPowerDraw / 1000) * 18 * 60) / (totalPlantCapacity * economicInputs.yieldPerPlant) // kWh/kg for 60-day cycle
    
    return {
      totalLightingPower,
      hvacLoad,
      totalPowerDraw,
      powerPerPlant,
      annualEnergyCost,
      energyPerKg
    }
  }
  
  const calculateROI = (totalRacks: number, energyMetrics: EnergyMetrics): ROIMetrics => {
    const setupCost = totalRacks * 15000 + 50000 // rack cost + infrastructure
    const annualOperatingCost = energyMetrics.annualEnergyCost + (2080 * economicInputs.laborCostPerHour * 2) // 2 FTEs
    const totalPlantCapacity = totalRacks * rackConfig.tiers * rackConfig.plantsPerTier
    const annualRevenue = totalPlantCapacity * economicInputs.yieldPerPlant * economicInputs.cropCyclesPerYear * economicInputs.pricePerKg
    const annualProfit = annualRevenue - annualOperatingCost
    const paybackPeriod = setupCost / annualProfit
    
    // Simple NPV calculation
    let npv = -setupCost
    for (let year = 1; year <= 5; year++) {
      npv += annualProfit / Math.pow(1.1, year) // 10% discount rate
    }
    
    return {
      setupCost,
      annualOperatingCost,
      annualRevenue,
      paybackPeriod,
      fiveYearNPV: npv,
      irrPercent: (annualProfit / setupCost) * 100
    }
  }

  const layout = calculateLayout()

  // Calculate space metrics
  const spaceMetrics: SpaceMetrics = {
    totalVolume: roomDimensions.width * roomDimensions.length * roomDimensions.height,
    usableVolume: layout.totalRacks * rackConfig.width * rackConfig.length * (rackConfig.tiers * rackConfig.tierHeight),
    volumeEfficiency: 0,
    totalPlantCapacity: layout.totalRacks * rackConfig.tiers * rackConfig.plantsPerTier,
    plantsPerSqFt: 0,
    accessibleArea: roomDimensions.width * roomDimensions.length - (layout.totalRacks * rackConfig.width * rackConfig.length)
  }
  
  spaceMetrics.volumeEfficiency = (spaceMetrics.usableVolume / spaceMetrics.totalVolume) * 100
  spaceMetrics.plantsPerSqFt = spaceMetrics.totalPlantCapacity / (roomDimensions.width * roomDimensions.length)

  // Calculate energy metrics
  const energyMetrics: EnergyMetrics = {
    totalLightingPower: layout.totalRacks * rackConfig.tiers * rackConfig.lightingPerTier / 1000, // kW
    hvacLoad: (roomDimensions.width * roomDimensions.length * roomDimensions.height) * 0.015, // rough estimate
    totalPowerDraw: 0,
    powerPerPlant: 0,
    annualEnergyCost: 0,
    energyPerKg: 0
  }
  
  energyMetrics.totalPowerDraw = energyMetrics.totalLightingPower + energyMetrics.hvacLoad
  energyMetrics.powerPerPlant = (energyMetrics.totalPowerDraw * 1000) / spaceMetrics.totalPlantCapacity
  energyMetrics.annualEnergyCost = energyMetrics.totalPowerDraw * 18 * 365 * economicInputs.electricityRate // 18h photoperiod
  energyMetrics.energyPerKg = (energyMetrics.totalPowerDraw * 18 * 60) / (spaceMetrics.totalPlantCapacity * economicInputs.yieldPerPlant) // kWh/kg for 60-day cycle

  // Calculate ROI metrics
  const roiMetrics: ROIMetrics = {
    setupCost: layout.totalRacks * 15000 + 50000, // rack cost + infrastructure
    annualOperatingCost: energyMetrics.annualEnergyCost + (2080 * economicInputs.laborCostPerHour * 2), // 2 FTEs
    annualRevenue: spaceMetrics.totalPlantCapacity * economicInputs.yieldPerPlant * economicInputs.cropCyclesPerYear * economicInputs.pricePerKg,
    paybackPeriod: 0,
    fiveYearNPV: 0,
    irrPercent: 0
  }
  
  const annualProfit = roiMetrics.annualRevenue - roiMetrics.annualOperatingCost
  roiMetrics.paybackPeriod = roiMetrics.setupCost / annualProfit
  
  // Simple NPV calculation
  let npv = -roiMetrics.setupCost
  for (let year = 1; year <= 5; year++) {
    npv += annualProfit / Math.pow(1.1, year) // 10% discount rate
  }
  roiMetrics.fiveYearNPV = npv
  roiMetrics.irrPercent = (annualProfit / roiMetrics.setupCost) * 100

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Vertical Farm Configuration</h2>
        
        {/* Room Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Room Width (ft)</label>
            <input
              type="number"
              value={roomDimensions.width}
              onChange={(e) => setRoomDimensions({...roomDimensions, width: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Room Length (ft)</label>
            <input
              type="number"
              value={roomDimensions.length}
              onChange={(e) => setRoomDimensions({...roomDimensions, length: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ceiling Height (ft)</label>
            <input
              type="number"
              value={roomDimensions.height}
              onChange={(e) => setRoomDimensions({...roomDimensions, height: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
        </div>

        {/* Rack Configuration */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tiers per Rack</label>
            <input
              type="number"
              value={rackConfig.tiers}
              onChange={(e) => setRackConfig({...rackConfig, tiers: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Rack Width (ft)</label>
            <input
              type="number"
              value={rackConfig.width}
              onChange={(e) => setRackConfig({...rackConfig, width: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Rack Length (ft)</label>
            <input
              type="number"
              value={rackConfig.length}
              onChange={(e) => setRackConfig({...rackConfig, length: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Plants per Tier</label>
            <input
              type="number"
              value={rackConfig.plantsPerTier}
              onChange={(e) => setRackConfig({...rackConfig, plantsPerTier: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      {/* Layout Visualization */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Optimized Layout</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Layout Diagram */}
          <div className="bg-gray-800 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
            <VerticalFarmLayout3D
              roomDimensions={roomDimensions}
              rackConfig={{
                width: rackConfig.width,
                length: rackConfig.length,
                height: rackConfig.tierHeight * rackConfig.tiers,
                tiers: rackConfig.tiers
              }}
              layout={{
                racksPerRow: layout.racksPerRow,
                rowCount: layout.rowCount,
                totalRacks: layout.totalRacks,
                aisleWidth: 3
              }}
            />
            <div className="p-4 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Racks per Row</p>
                  <p className="text-lg font-bold text-white">{layout.racksPerRow}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Number of Rows</p>
                  <p className="text-lg font-bold text-white">{layout.rowCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Racks</p>
                  <p className="text-lg font-bold text-white">{layout.totalRacks}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Aisle Config</p>
                  <p className="text-sm font-medium text-white">{layout.aisleConfiguration}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Space Metrics */}
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-5 h-5 text-blue-400" />
                <h4 className="font-medium text-white">Space Utilization</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Volume</span>
                  <span className="text-white">{spaceMetrics.totalVolume.toLocaleString()} ft³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Growing Volume</span>
                  <span className="text-white">{spaceMetrics.usableVolume.toLocaleString()} ft³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Volume Efficiency</span>
                  <span className="text-green-400">{spaceMetrics.volumeEfficiency.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Plant Capacity</span>
                  <span className="text-white">{spaceMetrics.totalPlantCapacity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Plants per ft²</span>
                  <span className="text-white">{spaceMetrics.plantsPerSqFt.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Energy Analysis */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Energy Analysis</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Lighting Power</span>
              <span className="text-sm font-medium text-white">{energyMetrics.totalLightingPower.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">HVAC Load</span>
              <span className="text-sm font-medium text-white">{energyMetrics.hvacLoad.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Total Power</span>
              <span className="text-sm font-medium text-white">{energyMetrics.totalPowerDraw.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">W per Plant</span>
              <span className="text-sm font-medium text-white">{energyMetrics.powerPerPlant.toFixed(0)} W</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Annual Cost</span>
              <span className="text-sm font-medium text-yellow-400">${energyMetrics.annualEnergyCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">kWh per kg</span>
              <span className="text-sm font-medium text-white">{energyMetrics.energyPerKg.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Environmental Control */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wind className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Environmental</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Airflow Pattern</span>
              <span className="text-sm font-medium text-white">Vertical Laminar</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Air Changes/Hr</span>
              <span className="text-sm font-medium text-white">40-60</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">CO₂ Enrichment</span>
              <span className="text-sm font-medium text-white">1200 ppm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Dehumidification</span>
              <span className="text-sm font-medium text-white">480 pints/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Temperature ΔT</span>
              <span className="text-sm font-medium text-white">±1°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Humidity ΔRH</span>
              <span className="text-sm font-medium text-white">±5%</span>
            </div>
          </div>
        </div>

        {/* Financial Analysis */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">ROI Analysis</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Setup Cost</span>
              <span className="text-sm font-medium text-white">${roiMetrics.setupCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Annual OpEx</span>
              <span className="text-sm font-medium text-white">${roiMetrics.annualOperatingCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Annual Revenue</span>
              <span className="text-sm font-medium text-green-400">${roiMetrics.annualRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Payback Period</span>
              <span className="text-sm font-medium text-white">{roiMetrics.paybackPeriod.toFixed(1)} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">5-Year NPV</span>
              <span className="text-sm font-medium text-green-400">${roiMetrics.fiveYearNPV.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">IRR</span>
              <span className="text-sm font-medium text-white">{roiMetrics.irrPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Optimization Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Increase Tier Count</h4>
              <p className="text-sm text-gray-400">
                Adding one more tier would increase capacity by 20% with only 8% more energy use
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Sun className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">LED Efficiency Upgrade</h4>
              <p className="text-sm text-gray-400">
                3.0 μmol/J fixtures would reduce energy costs by $42,000 annually
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Move className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Automated Transport</h4>
              <p className="text-sm text-gray-400">
                Mobile racking system would improve labor efficiency by 35%
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Droplets className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Water Recirculation</h4>
              <p className="text-sm text-gray-400">
                Closed-loop system would reduce water usage by 95% and nutrients by 85%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Economics Visualization */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Financial Analysis & Projections</h3>
        <VerticalFarmingEconomicsChart
          roiMetrics={roiMetrics}
          energyMetrics={energyMetrics}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button 
          onClick={() => {
            exportDesignReport()
          }}
          className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export Design Report
        </button>
        <button 
          onClick={() => {
            setShowAdvancedCalculator(true)
          }}
          className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Calculator className="w-5 h-5" />
          Advanced Calculator
        </button>
        <button 
          onClick={() => {
            setShowRackConfig(true)
          }}
          className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Settings className="w-5 h-5" />
          Configure Racks
        </button>
      </div>
      
      {/* Advanced Calculator Modal */}
      {showAdvancedCalculator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Advanced Vertical Farming Calculator</h2>
              <button 
                onClick={() => setShowAdvancedCalculator(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Environmental Controls</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Temperature (°F)</label>
                    <input type="number" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" defaultValue="72" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Humidity (%)</label>
                    <input type="number" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" defaultValue="65" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">CO2 (ppm)</label>
                    <input type="number" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" defaultValue="1200" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Air Changes/Hour</label>
                    <input type="number" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" defaultValue="20" />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Crop Parameters</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Crop Type</label>
                    <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                      <option>Leafy Greens</option>
                      <option>Herbs</option>
                      <option>Strawberries</option>
                      <option>Tomatoes</option>
                      <option>Cannabis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Growth Cycle (days)</label>
                    <input type="number" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" defaultValue="35" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Target PPFD (μmol/m²/s)</label>
                    <input type="number" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" defaultValue="250" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Photoperiod (hours)</label>
                    <input type="number" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" defaultValue="16" />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Advanced Economics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Construction Cost/sq ft</label>
                    <input type="number" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" defaultValue="150" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Automation Level (%)</label>
                    <input type="number" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" defaultValue="60" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Financing Rate (%)</label>
                    <input type="number" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" defaultValue="6.5" step="0.1" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Tax Rate (%)</label>
                    <input type="number" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" defaultValue="25" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setShowAdvancedCalculator(false)}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Calculate & Apply
              </button>
              <button 
                onClick={() => setShowAdvancedCalculator(false)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Rack Configuration Modal */}
      {showRackConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Configure Rack System</h2>
              <button 
                onClick={() => setShowRackConfig(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Rack Dimensions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Number of Tiers</label>
                    <input 
                      type="number" 
                      value={rackConfig.tiers}
                      onChange={(e) => setRackConfig({...rackConfig, tiers: parseInt(e.target.value) || 1})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Tier Height (ft)</label>
                    <input 
                      type="number" 
                      value={rackConfig.tierHeight}
                      onChange={(e) => setRackConfig({...rackConfig, tierHeight: parseFloat(e.target.value) || 1})}
                      step="0.5"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Rack Width (ft)</label>
                    <input 
                      type="number" 
                      value={rackConfig.width}
                      onChange={(e) => setRackConfig({...rackConfig, width: parseFloat(e.target.value) || 1})}
                      step="0.5"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Rack Length (ft)</label>
                    <input 
                      type="number" 
                      value={rackConfig.length}
                      onChange={(e) => setRackConfig({...rackConfig, length: parseFloat(e.target.value) || 1})}
                      step="0.5"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" 
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Growing Parameters</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Plants per Tier</label>
                    <input 
                      type="number" 
                      value={rackConfig.plantsPerTier}
                      onChange={(e) => setRackConfig({...rackConfig, plantsPerTier: parseInt(e.target.value) || 1})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Lighting per Tier (W)</label>
                    <input 
                      type="number" 
                      value={rackConfig.lightingPerTier}
                      onChange={(e) => setRackConfig({...rackConfig, lightingPerTier: parseInt(e.target.value) || 100})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" 
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Preset Configurations</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setRackConfig({
                      id: 'high-density',
                      name: 'High Density',
                      tiers: 8,
                      width: 4,
                      length: 8,
                      tierHeight: 2,
                      lightingPerTier: 320,
                      plantsPerTier: 96
                    })}
                    className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                  >
                    <h4 className="font-semibold text-white">High Density</h4>
                    <p className="text-sm text-gray-400 mt-1">8 tiers, 96 plants/tier</p>
                  </button>
                  <button 
                    onClick={() => setRackConfig({
                      id: 'standard',
                      name: 'Standard',
                      tiers: 5,
                      width: 4,
                      length: 8,
                      tierHeight: 3,
                      lightingPerTier: 320,
                      plantsPerTier: 64
                    })}
                    className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                  >
                    <h4 className="font-semibold text-white">Standard</h4>
                    <p className="text-sm text-gray-400 mt-1">5 tiers, 64 plants/tier</p>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setShowRackConfig(false)}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Apply Configuration
              </button>
              <button 
                onClick={() => setShowRackConfig(false)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}