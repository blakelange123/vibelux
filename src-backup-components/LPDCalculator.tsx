"use client"

import { useState, useEffect } from 'react'
import { 
  Building,
  Calculator,
  FileCheck,
  AlertTriangle,
  Check,
  Info,
  Download,
  Upload,
  Zap,
  TrendingDown,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Edit,
  Copy,
  X
} from 'lucide-react'

interface SpaceType {
  id: string
  name: string
  category: string
  ashrae90_1_2019: number
  ashrae90_1_2016: number
  iecc2021: number
  iecc2018: number
  title24_2022: number
  title24_2019: number
  description?: string
}

interface FixtureType {
  id: string
  name: string
  watts: number
  lumens: number
  efficacy: number
  quantity: number
}

interface Space {
  id: string
  name: string
  area: number
  spaceTypeId: string
  fixtures: FixtureType[]
  totalWatts: number
  lpd: number
  allowableLpd: number
  compliant: boolean
}

interface ComplianceStandard {
  id: string
  name: string
  year: number
  active: boolean
}

// Space type database with LPD limits (W/sf)
const spaceTypeDatabase: SpaceType[] = [
  // Office
  { id: 'office-open', name: 'Office - Open Plan', category: 'Office', ashrae90_1_2019: 0.61, ashrae90_1_2016: 0.79, iecc2021: 0.61, iecc2018: 0.79, title24_2022: 0.65, title24_2019: 0.75 },
  { id: 'office-private', name: 'Office - Private', category: 'Office', ashrae90_1_2019: 0.74, ashrae90_1_2016: 0.93, iecc2021: 0.74, iecc2018: 0.93, title24_2022: 0.75, title24_2019: 0.85 },
  { id: 'conference', name: 'Conference Room', category: 'Office', ashrae90_1_2019: 0.97, ashrae90_1_2016: 1.23, iecc2021: 0.97, iecc2018: 1.23, title24_2022: 1.0, title24_2019: 1.2 },
  
  // Retail
  { id: 'retail-sales', name: 'Retail Sales Area', category: 'Retail', ashrae90_1_2019: 1.05, ashrae90_1_2016: 1.26, iecc2021: 1.05, iecc2018: 1.26, title24_2022: 1.1, title24_2019: 1.3 },
  { id: 'retail-fitting', name: 'Fitting Room', category: 'Retail', ashrae90_1_2019: 1.39, ashrae90_1_2016: 1.71, iecc2021: 1.39, iecc2018: 1.71, title24_2022: 1.4, title24_2019: 1.7 },
  
  // Healthcare
  { id: 'hospital-patient', name: 'Hospital Patient Room', category: 'Healthcare', ashrae90_1_2019: 0.62, ashrae90_1_2016: 0.71, iecc2021: 0.62, iecc2018: 0.71, title24_2022: 0.65, title24_2019: 0.75 },
  { id: 'hospital-operating', name: 'Operating Room', category: 'Healthcare', ashrae90_1_2019: 1.89, ashrae90_1_2016: 2.26, iecc2021: 1.89, iecc2018: 2.26, title24_2022: 1.9, title24_2019: 2.2 },
  
  // Education
  { id: 'classroom', name: 'Classroom', category: 'Education', ashrae90_1_2019: 0.71, ashrae90_1_2016: 0.87, iecc2021: 0.71, iecc2018: 0.87, title24_2022: 0.75, title24_2019: 0.85 },
  { id: 'lecture-hall', name: 'Lecture Hall', category: 'Education', ashrae90_1_2019: 1.09, ashrae90_1_2016: 1.24, iecc2021: 1.09, iecc2018: 1.24, title24_2022: 1.1, title24_2019: 1.2 },
  
  // Industrial/Agricultural
  { id: 'warehouse', name: 'Warehouse', category: 'Industrial', ashrae90_1_2019: 0.33, ashrae90_1_2016: 0.51, iecc2021: 0.33, iecc2018: 0.51, title24_2022: 0.35, title24_2019: 0.5 },
  { id: 'manufacturing', name: 'Manufacturing', category: 'Industrial', ashrae90_1_2019: 0.82, ashrae90_1_2016: 1.17, iecc2021: 0.82, iecc2018: 1.17, title24_2022: 0.85, title24_2019: 1.2 },
  { id: 'greenhouse', name: 'Greenhouse', category: 'Agricultural', ashrae90_1_2019: 1.1, ashrae90_1_2016: 1.4, iecc2021: 1.1, iecc2018: 1.4, title24_2022: 1.2, title24_2019: 1.5 },
  { id: 'grow-room', name: 'Indoor Grow Room', category: 'Agricultural', ashrae90_1_2019: 1.5, ashrae90_1_2016: 1.8, iecc2021: 1.5, iecc2018: 1.8, title24_2022: 1.6, title24_2019: 1.9 },
  
  // Other
  { id: 'corridor', name: 'Corridor', category: 'Circulation', ashrae90_1_2019: 0.41, ashrae90_1_2016: 0.66, iecc2021: 0.41, iecc2018: 0.66, title24_2022: 0.45, title24_2019: 0.6 },
  { id: 'lobby', name: 'Lobby', category: 'Circulation', ashrae90_1_2019: 0.59, ashrae90_1_2016: 0.90, iecc2021: 0.59, iecc2018: 0.90, title24_2022: 0.6, title24_2019: 0.85 },
  { id: 'restroom', name: 'Restroom', category: 'Service', ashrae90_1_2019: 0.63, ashrae90_1_2016: 0.82, iecc2021: 0.63, iecc2018: 0.82, title24_2022: 0.65, title24_2019: 0.8 },
  { id: 'storage', name: 'Storage', category: 'Service', ashrae90_1_2019: 0.24, ashrae90_1_2016: 0.38, iecc2021: 0.24, iecc2018: 0.38, title24_2022: 0.25, title24_2019: 0.35 }
]

const complianceStandards: ComplianceStandard[] = [
  { id: 'ashrae90_1_2019', name: 'ASHRAE 90.1-2019', year: 2019, active: true },
  { id: 'ashrae90_1_2016', name: 'ASHRAE 90.1-2016', year: 2016, active: false },
  { id: 'iecc2021', name: 'IECC 2021', year: 2021, active: false },
  { id: 'iecc2018', name: 'IECC 2018', year: 2018, active: false },
  { id: 'title24_2022', name: 'California Title 24-2022', year: 2022, active: false },
  { id: 'title24_2019', name: 'California Title 24-2019', year: 2019, active: false }
]

export function LPDCalculator() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [selectedStandard, setSelectedStandard] = useState<ComplianceStandard>(complianceStandards[0])
  const [showAddSpace, setShowAddSpace] = useState(false)
  const [editingSpace, setEditingSpace] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('New Project')
  const [showExceptions, setShowExceptions] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate total project metrics
  const totalArea = spaces.reduce((sum, space) => sum + space.area, 0)
  const totalWatts = spaces.reduce((sum, space) => sum + space.totalWatts, 0)
  const overallLPD = totalArea > 0 ? totalWatts / totalArea : 0
  const allowableTotalWatts = spaces.reduce((sum, space) => sum + (space.allowableLpd * space.area), 0)
  const overallAllowableLPD = totalArea > 0 ? allowableTotalWatts / totalArea : 0
  const overallCompliant = overallLPD <= overallAllowableLPD
  const savingsPercent = overallAllowableLPD > 0 ? ((overallAllowableLPD - overallLPD) / overallAllowableLPD * 100) : 0

  const addSpace = (newSpace: Partial<Space>) => {
    const spaceType = spaceTypeDatabase.find(st => st.id === newSpace.spaceTypeId)
    if (!spaceType) return

    const allowableLpd = spaceType[selectedStandard.id as keyof SpaceType] as number
    const space: Space = {
      id: `space-${Date.now()}`,
      name: newSpace.name || 'New Space',
      area: newSpace.area || 1000,
      spaceTypeId: newSpace.spaceTypeId || '',
      fixtures: newSpace.fixtures || [],
      totalWatts: 0,
      lpd: 0,
      allowableLpd,
      compliant: true
    }

    setSpaces([...spaces, space])
    setShowAddSpace(false)
  }

  const updateSpace = (spaceId: string, updates: Partial<Space>) => {
    setSpaces(spaces.map(space => {
      if (space.id === spaceId) {
        const updated = { ...space, ...updates }
        
        // Recalculate watts and LPD
        updated.totalWatts = updated.fixtures.reduce((sum, f) => sum + (f.watts * f.quantity), 0)
        updated.lpd = updated.area > 0 ? updated.totalWatts / updated.area : 0
        
        // Update allowable LPD if space type changed
        if (updates.spaceTypeId) {
          const spaceType = spaceTypeDatabase.find(st => st.id === updates.spaceTypeId)
          if (spaceType) {
            updated.allowableLpd = spaceType[selectedStandard.id as keyof SpaceType] as number
          }
        }
        
        updated.compliant = updated.lpd <= updated.allowableLpd
        return updated
      }
      return space
    }))
  }

  const addFixture = (spaceId: string, fixture: FixtureType) => {
    const space = spaces.find(s => s.id === spaceId)
    if (!space) return

    const newFixtures = [...space.fixtures, { ...fixture, id: `fixture-${Date.now()}` }]
    updateSpace(spaceId, { fixtures: newFixtures })
  }

  const exportReport = () => {
    const report = `LPD Compliance Report
${'-'.repeat(50)}
Project: ${projectName}
Date: ${new Date().toLocaleDateString()}
Standard: ${selectedStandard.name}

Overall Project Summary:
- Total Area: ${totalArea.toLocaleString()} sq ft
- Total Lighting Power: ${totalWatts.toLocaleString()} W
- Overall LPD: ${overallLPD.toFixed(2)} W/sq ft
- Allowable LPD: ${overallAllowableLPD.toFixed(2)} W/sq ft
- Compliance Status: ${overallCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
- Energy Savings: ${savingsPercent.toFixed(1)}%

Space-by-Space Analysis:
${'-'.repeat(50)}
${spaces.map(space => {
  const spaceType = spaceTypeDatabase.find(st => st.id === space.spaceTypeId)
  return `
${space.name} (${spaceType?.name})
- Area: ${space.area.toLocaleString()} sq ft
- Lighting Power: ${space.totalWatts.toLocaleString()} W
- Actual LPD: ${space.lpd.toFixed(2)} W/sq ft
- Allowable LPD: ${space.allowableLpd.toFixed(2)} W/sq ft
- Status: ${space.compliant ? 'Compliant' : 'Non-Compliant'}
- Fixtures: ${space.fixtures.length} types, ${space.fixtures.reduce((sum, f) => sum + f.quantity, 0)} total
`}).join('')}

Fixture Schedule:
${'-'.repeat(50)}
${spaces.map(space => 
  space.fixtures.map(fixture => 
    `${space.name}: ${fixture.name} - ${fixture.quantity} @ ${fixture.watts}W = ${fixture.watts * fixture.quantity}W`
  ).join('\n')
).join('\n')}
`

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lpd-compliance-report-${projectName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building className="w-6 h-6 text-purple-400" />
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="text-xl font-semibold bg-transparent text-white border-b border-transparent hover:border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Project Name"
              />
            </div>
            <p className="text-sm text-gray-400">
              Lighting Power Density (LPD) Calculator with Code Compliance Checking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddSpace(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Space
            </button>
            <button
              onClick={exportReport}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Code Standard Selection */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400">Compliance Standard:</span>
          {complianceStandards.map(standard => (
            <button
              key={standard.id}
              onClick={() => {
                setSelectedStandard(standard)
                // Recalculate all spaces with new standard
                setSpaces(spaces.map(space => {
                  const spaceType = spaceTypeDatabase.find(st => st.id === space.spaceTypeId)
                  if (spaceType) {
                    const allowableLpd = spaceType[standard.id as keyof SpaceType] as number
                    return {
                      ...space,
                      allowableLpd,
                      compliant: space.lpd <= allowableLpd
                    }
                  }
                  return space
                }))
              }}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedStandard.id === standard.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {standard.name}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Project Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building className="w-5 h-5 text-blue-400" />
            <h4 className="font-medium text-white">Total Area</h4>
          </div>
          <p className="text-2xl font-bold text-white">{totalArea.toLocaleString()}</p>
          <p className="text-sm text-gray-400">sq ft</p>
        </div>
        
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h4 className="font-medium text-white">Total Power</h4>
          </div>
          <p className="text-2xl font-bold text-white">{totalWatts.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Watts</p>
        </div>
        
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-purple-400" />
            <h4 className="font-medium text-white">Overall LPD</h4>
          </div>
          <p className="text-2xl font-bold text-white">{overallLPD.toFixed(2)}</p>
          <p className="text-sm text-gray-400">W/sq ft</p>
        </div>
        
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileCheck className="w-5 h-5 text-gray-400" />
            <h4 className="font-medium text-white">Allowable</h4>
          </div>
          <p className="text-2xl font-bold text-white">{overallAllowableLPD.toFixed(2)}</p>
          <p className="text-sm text-gray-400">W/sq ft</p>
        </div>
        
        <div className={`rounded-xl border p-4 ${
          overallCompliant 
            ? 'bg-green-900/20 border-green-800' 
            : 'bg-red-900/20 border-red-800'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {overallCompliant ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
            <h4 className={`font-medium ${overallCompliant ? 'text-green-400' : 'text-red-400'}`}>
              Compliance
            </h4>
          </div>
          <p className={`text-2xl font-bold ${overallCompliant ? 'text-green-400' : 'text-red-400'}`}>
            {overallCompliant ? 'PASS' : 'FAIL'}
          </p>
          <p className="text-sm text-gray-400">
            {savingsPercent > 0 ? `${savingsPercent.toFixed(1)}% below` : `${Math.abs(savingsPercent).toFixed(1)}% above`}
          </p>
        </div>
      </div>

      {/* Space List */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Space-by-Space Analysis</h3>
        </div>
        
        {spaces.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No spaces added yet</p>
            <button
              onClick={() => setShowAddSpace(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Add First Space
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {spaces.map(space => {
              const spaceType = spaceTypeDatabase.find(st => st.id === space.spaceTypeId)
              return (
                <div
                  key={space.id}
                  className="p-4 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white text-lg">{space.name}</h4>
                      <p className="text-sm text-gray-400">{spaceType?.name} • {space.area.toLocaleString()} sq ft</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        space.compliant
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {space.compliant ? 'Compliant' : 'Non-Compliant'}
                      </span>
                      <button
                        onClick={() => setEditingSpace(space.id)}
                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => setSpaces(spaces.filter(s => s.id !== space.id))}
                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-400">Lighting Power</p>
                      <p className="text-lg font-semibold text-white">{space.totalWatts.toLocaleString()} W</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Actual LPD</p>
                      <p className="text-lg font-semibold text-white">{space.lpd.toFixed(2)} W/sf</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Allowable LPD</p>
                      <p className="text-lg font-semibold text-white">{space.allowableLpd.toFixed(2)} W/sf</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Margin</p>
                      <p className={`text-lg font-semibold ${
                        space.lpd <= space.allowableLpd ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {((space.allowableLpd - space.lpd) / space.allowableLpd * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {space.fixtures.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-sm text-gray-400 mb-2">Fixtures:</p>
                      <div className="space-y-1">
                        {space.fixtures.map(fixture => (
                          <div key={fixture.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">
                              {fixture.name} ({fixture.efficacy} lm/W)
                            </span>
                            <span className="text-gray-400">
                              {fixture.quantity} × {fixture.watts}W = {fixture.watts * fixture.quantity}W
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {editingSpace === space.id && (
                    <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                      <h5 className="font-medium text-white mb-3">Add Fixture</h5>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const formData = new FormData(e.currentTarget)
                          addFixture(space.id, {
                            id: '',
                            name: formData.get('name') as string,
                            watts: Number(formData.get('watts')),
                            lumens: Number(formData.get('lumens')),
                            efficacy: Number(formData.get('lumens')) / Number(formData.get('watts')),
                            quantity: Number(formData.get('quantity'))
                          })
                          e.currentTarget.reset()
                        }}
                        className="grid grid-cols-4 gap-3"
                      >
                        <input
                          name="name"
                          placeholder="Fixture name"
                          required
                          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        />
                        <input
                          name="watts"
                          type="number"
                          placeholder="Watts"
                          required
                          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        />
                        <input
                          name="lumens"
                          type="number"
                          placeholder="Lumens"
                          required
                          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        />
                        <input
                          name="quantity"
                          type="number"
                          placeholder="Quantity"
                          required
                          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        />
                        <button
                          type="submit"
                          className="col-span-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        >
                          Add Fixture
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Space Modal */}
      {showAddSpace && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" 
          style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
          onClick={() => setShowAddSpace(false)}
        >
          <div 
            className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full shadow-2xl border border-gray-700" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Add New Space</h3>
              <button
                type="button"
                onClick={() => setShowAddSpace(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                addSpace({
                  name: formData.get('name') as string,
                  area: Number(formData.get('area')),
                  spaceTypeId: formData.get('spaceType') as string,
                  fixtures: []
                })
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-gray-400 mb-1">Space Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="e.g., Main Office"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Area (sq ft)</label>
                <input
                  name="area"
                  type="number"
                  required
                  min="1"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Space Type</label>
                <select
                  name="spaceType"
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="">Select space type...</option>
                  {Object.entries(
                    spaceTypeDatabase.reduce((acc, st) => {
                      if (!acc[st.category]) acc[st.category] = []
                      acc[st.category].push(st)
                      return acc
                    }, {} as Record<string, SpaceType[]>)
                  ).map(([category, types]) => (
                    <optgroup key={category} label={category}>
                      {types.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name} ({type[selectedStandard.id as keyof SpaceType]} W/sf)
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Add Space
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSpace(false)}
                  className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Code References */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Code Reference Information</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-white mb-3">{selectedStandard.name} Key Points</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Includes mandatory control requirements for automatic shutoff</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Additional allowances available for decorative, display, and task lighting</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Space-by-space method shown here; building area method also available</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                <span>Exterior lighting has separate requirements not included in this calculator</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-3">Common Exceptions & Allowances</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                <span>Display lighting: Additional 0.4-1.7 W/sf depending on application</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                <span>Decorative lighting: Additional 0.1 W/sf allowed</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                <span>Plant growth lighting may have specific exemptions</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                <span>Always consult local amendments and authority having jurisdiction</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}