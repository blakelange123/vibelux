import type { FixtureModel } from '@/components/FixtureLibrary'
import type { ParsedIESFile } from '@/lib/ies-parser'
import type { IESPhotometry } from '@/lib/ies-generator'
import { dlcFixturesParser } from '@/lib/dlc-fixtures-parser'
import { parseIESFile, validateIESFile } from '@/lib/ies-parser'
import { generateIESFile, generateIESPhotometry } from '@/lib/ies-generator'

export interface CustomFixture extends FixtureModel {
  tags: string[]
  dateCreated: string
  dateModified: string
  version: number
  manufacturer: string
  modelNumber: string
  photometricData?: {
    distribution: 'lambertian' | 'gaussian' | 'batwing' | 'custom'
    beamAngle: number
    fieldAngle: number
    intensityCurve?: number[] // Custom intensity distribution
  }
  electricalSpecs?: {
    inputVoltage: string
    inputCurrent: number
    powerFactor: number
    thd: number // Total Harmonic Distortion
    inrushCurrent?: number
  }
  physicalSpecs?: {
    dimensions: {
      length: number
      width: number
      height: number
      unit: 'mm' | 'in'
    }
    weight: {
      value: number
      unit: 'kg' | 'lb'
    }
    housingMaterial?: string
    ipRating?: string
    operatingTemp?: {
      min: number
      max: number
      unit: 'C' | 'F'
    }
  }
  mountingOptions?: string[]
  certifications?: string[]
  notes?: string
  isFavorite?: boolean
  isCustom: boolean
  importSource?: 'manual' | 'ies' | 'ldt' | 'eulumdat' | 'csv' | 'json'
}

export interface FixtureLibraryState {
  fixtures: CustomFixture[]
  categories: string[]
  manufacturers: string[]
  tags: string[]
  favorites: string[]
  recentlyUsed: string[]
  version: number
}

export interface FixtureFilter {
  searchTerm?: string
  categories?: string[]
  manufacturers?: string[]
  tags?: string[]
  minWattage?: number
  maxWattage?: number
  minPPF?: number
  maxPPF?: number
  minEfficacy?: number
  isDLC?: boolean
  isCustom?: boolean
  isFavorite?: boolean
}

export interface FixtureComparison {
  fixtureIds: string[]
  metrics: {
    ppf: boolean
    efficacy: boolean
    spectrum: boolean
    cost: boolean
    coverage: boolean
    electricalSpecs: boolean
    physicalSpecs: boolean
  }
}

export interface ImportResult {
  success: boolean
  fixtures: CustomFixture[]
  errors: string[]
  warnings: string[]
}

export class FixtureLibraryManager {
  private state: FixtureLibraryState
  private storageKey = 'vibelux-fixture-library'

  constructor() {
    this.state = this.loadState()
  }

  // State Management
  private loadState(): FixtureLibraryState {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error('Error loading fixture library state:', e)
        }
      }
    }

    return {
      fixtures: [],
      categories: ['LED Panel', 'LED Bar', 'HPS', 'CMH', 'Fluorescent', 'Custom'],
      manufacturers: [],
      tags: [],
      favorites: [],
      recentlyUsed: [],
      version: 1
    }
  }

  private saveState(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state))
    }
  }

  // CRUD Operations
  createFixture(fixture: Partial<CustomFixture>): CustomFixture {
    const newFixture: CustomFixture = {
      id: `custom-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      brand: fixture.brand || 'Custom',
      model: fixture.model || 'New Fixture',
      category: fixture.category || 'Custom',
      wattage: fixture.wattage || 100,
      ppf: fixture.ppf || 200,
      efficacy: fixture.efficacy || 2.0,
      spectrum: fixture.spectrum || 'Full Spectrum',
      spectrumData: fixture.spectrumData || {
        blue: 20,
        green: 10,
        red: 65,
        farRed: 5
      },
      coverage: fixture.coverage || 16,
      tags: fixture.tags || [],
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      version: 1,
      manufacturer: fixture.manufacturer || fixture.brand || 'Custom',
      modelNumber: fixture.modelNumber || fixture.model || 'Custom-001',
      isCustom: true,
      ...fixture
    }

    this.state.fixtures.push(newFixture)
    this.updateMetadata()
    this.saveState()

    return newFixture
  }

  updateFixture(id: string, updates: Partial<CustomFixture>): CustomFixture | null {
    const index = this.state.fixtures.findIndex(f => f.id === id)
    if (index === -1) return null

    const fixture = this.state.fixtures[index]
    const updatedFixture: CustomFixture = {
      ...fixture,
      ...updates,
      dateModified: new Date().toISOString(),
      version: fixture.version + 1
    }

    this.state.fixtures[index] = updatedFixture
    this.updateMetadata()
    this.saveState()

    return updatedFixture
  }

  deleteFixture(id: string): boolean {
    const index = this.state.fixtures.findIndex(f => f.id === id)
    if (index === -1) return false

    this.state.fixtures.splice(index, 1)
    this.state.favorites = this.state.favorites.filter(fid => fid !== id)
    this.state.recentlyUsed = this.state.recentlyUsed.filter(fid => fid !== id)
    
    this.updateMetadata()
    this.saveState()

    return true
  }

  getFixture(id: string): CustomFixture | null {
    return this.state.fixtures.find(f => f.id === id) || null
  }

  getAllFixtures(): CustomFixture[] {
    return [...this.state.fixtures]
  }

  // Search and Filter
  searchFixtures(filter: FixtureFilter): CustomFixture[] {
    let results = [...this.state.fixtures]

    // Text search
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase()
      results = results.filter(f => 
        f.brand.toLowerCase().includes(term) ||
        f.model.toLowerCase().includes(term) ||
        f.manufacturer?.toLowerCase().includes(term) ||
        f.modelNumber?.toLowerCase().includes(term) ||
        f.tags?.some(tag => tag.toLowerCase().includes(term))
      )
    }

    // Category filter
    if (filter.categories?.length) {
      results = results.filter(f => filter.categories!.includes(f.category))
    }

    // Manufacturer filter
    if (filter.manufacturers?.length) {
      results = results.filter(f => 
        filter.manufacturers!.includes(f.manufacturer || f.brand)
      )
    }

    // Tag filter
    if (filter.tags?.length) {
      results = results.filter(f => 
        f.tags?.some(tag => filter.tags!.includes(tag))
      )
    }

    // Numerical filters
    if (filter.minWattage !== undefined) {
      results = results.filter(f => f.wattage >= filter.minWattage!)
    }
    if (filter.maxWattage !== undefined) {
      results = results.filter(f => f.wattage <= filter.maxWattage!)
    }
    if (filter.minPPF !== undefined) {
      results = results.filter(f => f.ppf >= filter.minPPF!)
    }
    if (filter.maxPPF !== undefined) {
      results = results.filter(f => f.ppf <= filter.maxPPF!)
    }
    if (filter.minEfficacy !== undefined) {
      results = results.filter(f => f.efficacy >= filter.minEfficacy!)
    }

    // Boolean filters
    if (filter.isDLC !== undefined) {
      results = results.filter(f => !!f.dlcData === filter.isDLC)
    }
    if (filter.isCustom !== undefined) {
      results = results.filter(f => f.isCustom === filter.isCustom)
    }
    if (filter.isFavorite !== undefined) {
      results = results.filter(f => this.state.favorites.includes(f.id) === filter.isFavorite)
    }

    return results
  }

  // Favorites Management
  toggleFavorite(fixtureId: string): boolean {
    const index = this.state.favorites.indexOf(fixtureId)
    if (index === -1) {
      this.state.favorites.push(fixtureId)
    } else {
      this.state.favorites.splice(index, 1)
    }
    this.saveState()
    return index === -1
  }

  getFavorites(): CustomFixture[] {
    return this.state.fixtures.filter(f => this.state.favorites.includes(f.id))
  }

  // Recently Used Management
  markAsUsed(fixtureId: string): void {
    this.state.recentlyUsed = this.state.recentlyUsed.filter(id => id !== fixtureId)
    this.state.recentlyUsed.unshift(fixtureId)
    if (this.state.recentlyUsed.length > 20) {
      this.state.recentlyUsed = this.state.recentlyUsed.slice(0, 20)
    }
    this.saveState()
  }

  getRecentlyUsed(limit: number = 10): CustomFixture[] {
    return this.state.recentlyUsed
      .slice(0, limit)
      .map(id => this.getFixture(id))
      .filter(f => f !== null) as CustomFixture[]
  }

  // Import/Export
  async importFromJSON(jsonData: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      fixtures: [],
      errors: [],
      warnings: []
    }

    try {
      const data = JSON.parse(jsonData)
      
      if (Array.isArray(data)) {
        // Import array of fixtures
        for (const fixtureData of data) {
          try {
            const fixture = this.validateAndCreateFixture(fixtureData)
            result.fixtures.push(fixture)
          } catch (e) {
            result.warnings.push(`Failed to import fixture: ${e instanceof Error ? e.message : 'Unknown error'}`)
          }
        }
      } else if (data.fixtures && Array.isArray(data.fixtures)) {
        // Import fixture library format
        for (const fixtureData of data.fixtures) {
          try {
            const fixture = this.validateAndCreateFixture(fixtureData)
            result.fixtures.push(fixture)
          } catch (e) {
            result.warnings.push(`Failed to import fixture: ${e instanceof Error ? e.message : 'Unknown error'}`)
          }
        }
      } else {
        // Single fixture
        const fixture = this.validateAndCreateFixture(data)
        result.fixtures.push(fixture)
      }

      // Add imported fixtures to library
      for (const fixture of result.fixtures) {
        this.createFixture({
          ...fixture,
          importSource: 'json'
        })
      }

      result.success = result.fixtures.length > 0
    } catch (e) {
      result.errors.push(`JSON parse error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }

    return result
  }

  async importFromCSV(csvData: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      fixtures: [],
      errors: [],
      warnings: []
    }

    try {
      const lines = csvData.split('\n').filter(line => line.trim())
      if (lines.length < 2) {
        result.errors.push('CSV file must have headers and at least one data row')
        return result
      }

      const headers = this.parseCSVLine(lines[0])
      const requiredHeaders = ['brand', 'model', 'wattage', 'ppf']
      
      for (const required of requiredHeaders) {
        if (!headers.includes(required.toLowerCase())) {
          result.errors.push(`Missing required column: ${required}`)
        }
      }

      if (result.errors.length > 0) return result

      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i])
          const fixtureData: any = {}

          headers.forEach((header, index) => {
            if (values[index]) {
              fixtureData[header] = values[index]
            }
          })

          // Convert numeric fields
          if (fixtureData.wattage) fixtureData.wattage = parseFloat(fixtureData.wattage)
          if (fixtureData.ppf) fixtureData.ppf = parseFloat(fixtureData.ppf)
          if (fixtureData.efficacy) fixtureData.efficacy = parseFloat(fixtureData.efficacy)
          if (fixtureData.coverage) fixtureData.coverage = parseFloat(fixtureData.coverage)

          // Parse spectrum data if present
          if (fixtureData.blue && fixtureData.green && fixtureData.red) {
            fixtureData.spectrumData = {
              blue: parseFloat(fixtureData.blue),
              green: parseFloat(fixtureData.green),
              red: parseFloat(fixtureData.red),
              farRed: parseFloat(fixtureData.farred || fixtureData.far_red || '5')
            }
          }

          const fixture = this.validateAndCreateFixture(fixtureData)
          result.fixtures.push(fixture)
          
          this.createFixture({
            ...fixture,
            importSource: 'csv'
          })
        } catch (e) {
          result.warnings.push(`Row ${i + 1}: ${e instanceof Error ? e.message : 'Invalid data'}`)
        }
      }

      result.success = result.fixtures.length > 0
    } catch (e) {
      result.errors.push(`CSV parse error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }

    return result
  }

  async importFromIES(file: File): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      fixtures: [],
      errors: [],
      warnings: []
    }

    try {
      const content = await file.text()
      const validation = validateIESFile(content)
      
      if (!validation.valid) {
        result.errors = validation.errors
        return result
      }

      const parsedIES = parseIESFile(content)
      
      // Create fixture from IES data
      const fixture: Partial<CustomFixture> = {
        brand: parsedIES.header.manufacturer || 'Unknown',
        model: parsedIES.header.luminaire || parsedIES.header.filename,
        modelNumber: parsedIES.header.luminaire || 'IES Import',
        manufacturer: parsedIES.header.manufacturer || 'Unknown',
        category: 'IES Import',
        wattage: 100, // Default, user should update
        ppf: Math.round(parsedIES.photometry.totalLumens * 4.54), // Rough conversion
        efficacy: 2.5, // Default, user should update
        spectrum: 'Custom IES',
        spectrumData: {
          blue: 20,
          green: 10,
          red: 65,
          farRed: 5
        },
        coverage: 16,
        customIES: {
          parsedData: parsedIES,
          photometry: parsedIES.photometry
        },
        photometricData: {
          distribution: 'custom',
          beamAngle: parsedIES.photometry.beamAngle,
          fieldAngle: parsedIES.photometry.fieldAngle
        },
        tags: ['IES Import', parsedIES.header.manufacturer || 'Unknown'],
        importSource: 'ies'
      }

      const created = this.createFixture(fixture)
      result.fixtures.push(created)
      result.success = true
      
      result.warnings.push('Please update wattage, PPF, and efficacy values for accurate calculations')
    } catch (e) {
      result.errors.push(`IES import error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }

    return result
  }

  exportToJSON(fixtureIds?: string[]): string {
    const fixtures = fixtureIds 
      ? this.state.fixtures.filter(f => fixtureIds.includes(f.id))
      : this.state.fixtures

    const exportData = {
      version: this.state.version,
      exportDate: new Date().toISOString(),
      fixtures: fixtures.map(f => ({
        ...f,
        // Exclude some internal fields
        dateCreated: undefined,
        dateModified: undefined,
        version: undefined
      }))
    }

    return JSON.stringify(exportData, null, 2)
  }

  exportToCSV(fixtureIds?: string[]): string {
    const fixtures = fixtureIds 
      ? this.state.fixtures.filter(f => fixtureIds.includes(f.id))
      : this.state.fixtures

    // CSV headers
    const headers = [
      'brand', 'model', 'category', 'wattage', 'ppf', 'efficacy',
      'spectrum', 'blue', 'green', 'red', 'farRed', 'coverage',
      'manufacturer', 'modelNumber', 'tags'
    ]

    let csv = headers.join(',') + '\n'

    for (const fixture of fixtures) {
      const row = [
        this.escapeCSV(fixture.brand),
        this.escapeCSV(fixture.model),
        this.escapeCSV(fixture.category),
        fixture.wattage,
        fixture.ppf,
        fixture.efficacy,
        this.escapeCSV(fixture.spectrum),
        fixture.spectrumData.blue,
        fixture.spectrumData.green,
        fixture.spectrumData.red,
        fixture.spectrumData.farRed,
        fixture.coverage,
        this.escapeCSV(fixture.manufacturer || ''),
        this.escapeCSV(fixture.modelNumber || ''),
        this.escapeCSV(fixture.tags?.join(';') || '')
      ]

      csv += row.join(',') + '\n'
    }

    return csv
  }

  // Validation
  validateFixture(fixture: Partial<CustomFixture>): string[] {
    const errors: string[] = []

    if (!fixture.brand || fixture.brand.trim() === '') {
      errors.push('Brand is required')
    }
    if (!fixture.model || fixture.model.trim() === '') {
      errors.push('Model is required')
    }
    if (!fixture.wattage || fixture.wattage <= 0) {
      errors.push('Wattage must be greater than 0')
    }
    if (!fixture.ppf || fixture.ppf <= 0) {
      errors.push('PPF must be greater than 0')
    }
    if (!fixture.efficacy || fixture.efficacy <= 0) {
      errors.push('Efficacy must be greater than 0')
    }

    // Validate calculated efficacy
    if (fixture.wattage && fixture.ppf) {
      const calculatedEfficacy = fixture.ppf / fixture.wattage
      if (Math.abs(calculatedEfficacy - (fixture.efficacy || 0)) > 0.1) {
        errors.push(`Efficacy (${fixture.efficacy}) doesn't match PPF/Wattage (${calculatedEfficacy.toFixed(2)})`)
      }
    }

    // Validate spectrum data
    if (fixture.spectrumData) {
      const total = fixture.spectrumData.blue + fixture.spectrumData.green + 
                   fixture.spectrumData.red + fixture.spectrumData.farRed
      if (Math.abs(total - 100) > 1) {
        errors.push(`Spectrum percentages must sum to 100% (currently ${total}%)`)
      }
    }

    return errors
  }

  // Comparison
  compareFixtures(fixtureIds: string[]): any {
    const fixtures = fixtureIds
      .map(id => this.getFixture(id))
      .filter(f => f !== null) as CustomFixture[]

    if (fixtures.length < 2) {
      return { error: 'At least 2 fixtures required for comparison' }
    }

    const comparison = {
      fixtures: fixtures.map(f => ({
        id: f.id,
        name: `${f.brand} ${f.model}`,
        wattage: f.wattage,
        ppf: f.ppf,
        efficacy: f.efficacy,
        spectrum: f.spectrum,
        spectrumData: f.spectrumData,
        coverage: f.coverage,
        price: f.price,
        costPerPPF: f.price ? (f.price / f.ppf).toFixed(2) : 'N/A',
        ppfPerSqFt: (f.ppf / f.coverage).toFixed(1),
        isDLC: !!f.dlcData,
        isCustom: f.isCustom
      })),
      analysis: {
        mostEfficient: null as any,
        bestValue: null as any,
        highestPPF: null as any,
        lowestWattage: null as any
      }
    }

    // Analysis
    comparison.analysis.mostEfficient = comparison.fixtures.reduce((prev, curr) => 
      curr.efficacy > prev.efficacy ? curr : prev
    )
    
    comparison.analysis.highestPPF = comparison.fixtures.reduce((prev, curr) => 
      curr.ppf > prev.ppf ? curr : prev
    )
    
    comparison.analysis.lowestWattage = comparison.fixtures.reduce((prev, curr) => 
      curr.wattage < prev.wattage ? curr : prev
    )

    const fixturesWithPrice = comparison.fixtures.filter(f => f.price)
    if (fixturesWithPrice.length > 0) {
      comparison.analysis.bestValue = fixturesWithPrice.reduce((prev, curr) => 
        parseFloat(curr.costPerPPF) < parseFloat(prev.costPerPPF) ? curr : prev
      )
    }

    return comparison
  }

  // IES Generation
  generateIES(fixtureId: string): string | null {
    const fixture = this.getFixture(fixtureId)
    if (!fixture) return null

    // If fixture has custom IES data, regenerate from that
    if (fixture.customIES) {
      return generateIESFile({
        manufacturer: fixture.manufacturer || fixture.brand,
        modelNumber: fixture.modelNumber || fixture.model,
        productName: fixture.model,
        reportedPPF: fixture.ppf,
        reportedWattage: fixture.wattage,
        reportedPPE: fixture.efficacy,
        length: fixture.physicalSpecs?.dimensions.length || 1,
        width: fixture.physicalSpecs?.dimensions.width || 1,
        height: fixture.physicalSpecs?.dimensions.height || 0.1
      } as any, fixture.customIES.photometry)
    }

    // Generate synthetic IES from fixture data
    const photometry = generateIESPhotometry({
      manufacturer: fixture.manufacturer || fixture.brand,
      modelNumber: fixture.modelNumber || fixture.model,
      productName: fixture.model,
      reportedPPF: fixture.ppf,
      reportedWattage: fixture.wattage,
      reportedPPE: fixture.efficacy,
      length: fixture.physicalSpecs?.dimensions.length || 1,
      width: fixture.physicalSpecs?.dimensions.width || 1,
      height: fixture.physicalSpecs?.dimensions.height || 0.1
    } as any)

    return generateIESFile({
      manufacturer: fixture.manufacturer || fixture.brand,
      modelNumber: fixture.modelNumber || fixture.model,
      productName: fixture.model,
      reportedPPF: fixture.ppf,
      reportedWattage: fixture.wattage,
      reportedPPE: fixture.efficacy,
      length: fixture.physicalSpecs?.dimensions.length || 1,
      width: fixture.physicalSpecs?.dimensions.width || 1,
      height: fixture.physicalSpecs?.dimensions.height || 0.1
    } as any, photometry)
  }

  // Utility Methods
  private updateMetadata(): void {
    // Update manufacturers list
    const manufacturers = new Set<string>()
    this.state.fixtures.forEach(f => {
      if (f.manufacturer) manufacturers.add(f.manufacturer)
      if (f.brand) manufacturers.add(f.brand)
    })
    this.state.manufacturers = Array.from(manufacturers).sort()

    // Update tags list
    const tags = new Set<string>()
    this.state.fixtures.forEach(f => {
      f.tags?.forEach(tag => tags.add(tag))
    })
    this.state.tags = Array.from(tags).sort()

    // Update version
    this.state.version++
  }

  private validateAndCreateFixture(data: any): CustomFixture {
    const errors = this.validateFixture(data)
    if (errors.length > 0) {
      throw new Error(errors.join(', '))
    }

    return {
      id: data.id || `import-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      brand: data.brand,
      model: data.model,
      category: data.category || 'Custom',
      wattage: data.wattage,
      ppf: data.ppf,
      efficacy: data.efficacy || (data.ppf / data.wattage),
      spectrum: data.spectrum || 'Full Spectrum',
      spectrumData: data.spectrumData || {
        blue: 20,
        green: 10,
        red: 65,
        farRed: 5
      },
      coverage: data.coverage || 16,
      price: data.price,
      voltage: data.voltage,
      dimmable: data.dimmable,
      warranty: data.warranty,
      cct: data.cct,
      customIES: data.customIES,
      dlcData: data.dlcData,
      tags: data.tags || [],
      dateCreated: data.dateCreated || new Date().toISOString(),
      dateModified: data.dateModified || new Date().toISOString(),
      version: data.version || 1,
      manufacturer: data.manufacturer || data.brand,
      modelNumber: data.modelNumber || data.model,
      photometricData: data.photometricData,
      electricalSpecs: data.electricalSpecs,
      physicalSpecs: data.physicalSpecs,
      mountingOptions: data.mountingOptions,
      certifications: data.certifications,
      notes: data.notes,
      isFavorite: data.isFavorite || false,
      isCustom: data.isCustom !== false,
      importSource: data.importSource
    }
  }

  private parseCSVLine(line: string): string[] {
    const result = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    if (current) {
      result.push(current.trim())
    }
    
    return result.map(v => v.toLowerCase())
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  // Categories and Tags Management
  addCategory(category: string): void {
    if (!this.state.categories.includes(category)) {
      this.state.categories.push(category)
      this.saveState()
    }
  }

  removeCategory(category: string): boolean {
    const index = this.state.categories.indexOf(category)
    if (index === -1) return false

    // Check if any fixtures use this category
    const fixturesUsingCategory = this.state.fixtures.filter(f => f.category === category)
    if (fixturesUsingCategory.length > 0) {
      throw new Error(`Cannot remove category "${category}" - used by ${fixturesUsingCategory.length} fixtures`)
    }

    this.state.categories.splice(index, 1)
    this.saveState()
    return true
  }

  addTag(tag: string): void {
    if (!this.state.tags.includes(tag)) {
      this.state.tags.push(tag)
      this.saveState()
    }
  }

  removeTag(tag: string): boolean {
    const index = this.state.tags.indexOf(tag)
    if (index === -1) return false

    // Remove tag from all fixtures
    this.state.fixtures.forEach(f => {
      if (f.tags) {
        const tagIndex = f.tags.indexOf(tag)
        if (tagIndex !== -1) {
          f.tags.splice(tagIndex, 1)
        }
      }
    })

    this.state.tags.splice(index, 1)
    this.saveState()
    return true
  }

  // Getters
  getCategories(): string[] {
    return [...this.state.categories]
  }

  getManufacturers(): string[] {
    return [...this.state.manufacturers]
  }

  getTags(): string[] {
    return [...this.state.tags]
  }
}

// Singleton instance
export const fixtureLibraryManager = new FixtureLibraryManager()