import { bimIfcHandler } from '../bim-ifc-handler'
import type { RoomObject } from '../../components/designer/context/types'

// DWG/DXF parsing library integration
interface DwgEntity {
  type: 'LINE' | 'POLYLINE' | 'CIRCLE' | 'ARC' | 'TEXT' | 'INSERT' | 'DIMENSION'
  layer: string
  color: number
  lineType: string
  lineWeight: number
  vertices?: Array<{ x: number; y: number; z?: number }>
  center?: { x: number; y: number; z?: number }
  radius?: number
  startAngle?: number
  endAngle?: number
  text?: string
  blockName?: string
  position?: { x: number; y: number; z?: number }
  rotation?: number
  scale?: { x: number; y: number; z?: number }
}

interface DwgLayer {
  name: string
  color: number
  lineType: string
  visible: boolean
  frozen: boolean
  locked: boolean
}

interface DwgBlock {
  name: string
  entities: DwgEntity[]
  basePoint: { x: number; y: number; z?: number }
}

export interface CadFile {
  format: 'dwg' | 'dxf' | 'rvt' | 'skp' | 'ifc' | 'gbxml'
  version: string
  units: 'mm' | 'cm' | 'm' | 'in' | 'ft'
  layers: DwgLayer[]
  entities: DwgEntity[]
  blocks: DwgBlock[]
  metadata: {
    author?: string
    created?: Date
    modified?: Date
    description?: string
  }
}

export class EnhancedCadHandler {
  private static cloudConversionEndpoint = process.env.NEXT_PUBLIC_CAD_CONVERSION_API || ''
  
  /**
   * Parse DWG file using cloud conversion service
   */
  static async parseDWG(file: File): Promise<CadFile> {
    if (!this.cloudConversionEndpoint) {
      throw new Error('Cloud conversion service not configured')
    }
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('format', 'dwg')
    formData.append('outputFormat', 'json')
    
    try {
      const response = await fetch(`${this.cloudConversionEndpoint}/convert`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Conversion failed: ${response.statusText}`)
      }
      
      const data = await response.json()
      return this.processDwgData(data)
    } catch (error) {
      console.error('DWG parsing error:', error)
      throw error
    }
  }
  
  /**
   * Parse DXF file (native parsing)
   */
  static async parseDXF(file: File): Promise<CadFile> {
    const text = await file.text()
    const lines = text.split(/\r?\n/)
    
    const cadFile: CadFile = {
      format: 'dxf',
      version: 'AutoCAD 2018',
      units: 'm',
      layers: [],
      entities: [],
      blocks: [],
      metadata: {}
    }
    
    let section = ''
    let i = 0
    
    while (i < lines.length) {
      const code = parseInt(lines[i])
      const value = lines[i + 1]
      
      if (code === 0 && value === 'SECTION') {
        i += 2
        section = lines[i + 1]
        i += 2
        continue
      }
      
      if (code === 0 && value === 'ENDSEC') {
        section = ''
        i += 2
        continue
      }
      
      // Parse based on section
      switch (section) {
        case 'HEADER':
          i = this.parseDxfHeader(lines, i, cadFile)
          break
        case 'TABLES':
          i = this.parseDxfTables(lines, i, cadFile)
          break
        case 'BLOCKS':
          i = this.parseDxfBlocks(lines, i, cadFile)
          break
        case 'ENTITIES':
          i = this.parseDxfEntities(lines, i, cadFile)
          break
        default:
          i += 2
      }
    }
    
    return cadFile
  }
  
  /**
   * Parse Revit file using cloud service
   */
  static async parseRevit(file: File): Promise<CadFile> {
    if (!this.cloudConversionEndpoint) {
      throw new Error('Cloud conversion service not configured')
    }
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('format', 'rvt')
    formData.append('outputFormat', 'ifc')
    formData.append('includeProperties', 'true')
    
    try {
      const response = await fetch(`${this.cloudConversionEndpoint}/convert`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Conversion failed: ${response.statusText}`)
      }
      
      const ifcContent = await response.text()
      const ifcData = await bimIfcHandler.parseIFC(ifcContent)
      
      // Convert IFC data to CAD format
      return this.convertIfcToCad(ifcData, 'rvt')
    } catch (error) {
      console.error('Revit parsing error:', error)
      throw error
    }
  }
  
  /**
   * Parse SketchUp file
   */
  static async parseSketchUp(file: File): Promise<CadFile> {
    if (!this.cloudConversionEndpoint) {
      throw new Error('Cloud conversion service not configured')
    }
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('format', 'skp')
    formData.append('outputFormat', 'collada')
    
    try {
      const response = await fetch(`${this.cloudConversionEndpoint}/convert`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Conversion failed: ${response.statusText}`)
      }
      
      const colladaContent = await response.text()
      return this.parseCollada(colladaContent)
    } catch (error) {
      console.error('SketchUp parsing error:', error)
      throw error
    }
  }
  
  /**
   * Export to DWG format
   */
  static async exportDWG(
    objects: RoomObject[],
    layers: string[],
    version: string = '2018'
  ): Promise<Blob> {
    const dwgData = this.generateDwgData(objects, layers, version)
    
    if (this.cloudConversionEndpoint) {
      // Use cloud service for actual DWG generation
      const response = await fetch(`${this.cloudConversionEndpoint}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'dwg',
          version,
          data: dwgData
        })
      })
      
      if (!response.ok) {
        throw new Error(`DWG generation failed: ${response.statusText}`)
      }
      
      return response.blob()
    } else {
      // Fallback to DXF
      const dxfContent = this.generateDXF(objects, layers, version)
      return new Blob([dxfContent], { type: 'application/dxf' })
    }
  }
  
  /**
   * Generate DXF content
   */
  static generateDXF(
    objects: RoomObject[],
    layers: string[],
    version: string = 'R2018'
  ): string {
    let dxf = ''
    
    // DXF Header
    dxf += '0\nSECTION\n2\nHEADER\n'
    dxf += '9\n$ACADVER\n1\nAC1032\n' // AutoCAD 2018
    dxf += '9\n$INSUNITS\n70\n4\n' // Millimeters
    dxf += '9\n$EXTMIN\n10\n0.0\n20\n0.0\n30\n0.0\n'
    dxf += '9\n$EXTMAX\n10\n1000.0\n20\n1000.0\n30\n1000.0\n'
    dxf += '0\nENDSEC\n'
    
    // Tables section
    dxf += '0\nSECTION\n2\nTABLES\n'
    
    // Layer table
    dxf += '0\nTABLE\n2\nLAYER\n'
    dxf += '0\nLAYER\n5\n10\n2\n0\n70\n0\n62\n7\n6\nCONTINUOUS\n' // Default layer
    
    // Add custom layers
    const defaultLayers = ['E-LITE', 'E-LITE-CALC', 'E-LITE-FIXT', 'E-LITE-CTRL']
    defaultLayers.forEach((layer, index) => {
      dxf += `0\nLAYER\n5\n${20 + index}\n2\n${layer}\n70\n0\n62\n${index + 1}\n6\nCONTINUOUS\n`
    })
    
    dxf += '0\nENDTAB\n'
    dxf += '0\nENDSEC\n'
    
    // Entities section
    dxf += '0\nSECTION\n2\nENTITIES\n'
    
    // Export fixtures
    objects.forEach((obj, index) => {
      if (obj.type === 'fixture') {
        // Draw fixture as rectangle
        const x = obj.x * 1000 // Convert to mm
        const y = obj.y * 1000
        const w = obj.width * 1000
        const h = obj.length * 1000
        
        // Create polyline for fixture outline
        dxf += `0\nLWPOLYLINE\n5\n${100 + index}\n8\nE-LITE-FIXT\n62\n3\n`
        dxf += '90\n4\n70\n1\n' // 4 vertices, closed
        dxf += `10\n${x - w/2}\n20\n${y - h/2}\n`
        dxf += `10\n${x + w/2}\n20\n${y - h/2}\n`
        dxf += `10\n${x + w/2}\n20\n${y + h/2}\n`
        dxf += `10\n${x - w/2}\n20\n${y + h/2}\n`
        
        // Add fixture ID text
        dxf += `0\nTEXT\n5\n${200 + index}\n8\nE-LITE-FIXT\n62\n3\n`
        dxf += `10\n${x}\n20\n${y}\n30\n0.0\n40\n50.0\n1\nF${index + 1}\n`
      }
    })
    
    dxf += '0\nENDSEC\n'
    dxf += '0\nEOF\n'
    
    return dxf
  }
  
  /**
   * Parse DXF header section
   */
  private static parseDxfHeader(
    lines: string[],
    startIndex: number,
    cadFile: CadFile
  ): number {
    let i = startIndex
    
    while (i < lines.length) {
      const code = parseInt(lines[i])
      const value = lines[i + 1]
      
      if (code === 0) break
      
      // Parse relevant header variables
      if (code === 9) {
        switch (value) {
          case '$INSUNITS':
            i += 2
            const units = parseInt(lines[i + 1])
            cadFile.units = this.convertDxfUnits(units)
            break
          case '$ACADVER':
            i += 2
            cadFile.version = lines[i + 1]
            break
        }
      }
      
      i += 2
    }
    
    return i
  }
  
  /**
   * Parse DXF tables section
   */
  private static parseDxfTables(
    lines: string[],
    startIndex: number,
    cadFile: CadFile
  ): number {
    let i = startIndex
    let currentTable = ''
    
    while (i < lines.length) {
      const code = parseInt(lines[i])
      const value = lines[i + 1]
      
      if (code === 0 && value === 'ENDSEC') break
      
      if (code === 0 && value === 'TABLE') {
        i += 2
        currentTable = lines[i + 1]
        i += 2
        continue
      }
      
      if (currentTable === 'LAYER' && code === 0 && value === 'LAYER') {
        const layer: DwgLayer = {
          name: '',
          color: 7,
          lineType: 'CONTINUOUS',
          visible: true,
          frozen: false,
          locked: false
        }
        
        i += 2
        while (i < lines.length && parseInt(lines[i]) !== 0) {
          const layerCode = parseInt(lines[i])
          const layerValue = lines[i + 1]
          
          switch (layerCode) {
            case 2: layer.name = layerValue; break
            case 62: layer.color = parseInt(layerValue); break
            case 6: layer.lineType = layerValue; break
            case 70:
              const flags = parseInt(layerValue)
              layer.frozen = (flags & 1) !== 0
              layer.locked = (flags & 4) !== 0
              break
          }
          
          i += 2
        }
        
        cadFile.layers.push(layer)
        continue
      }
      
      i += 2
    }
    
    return i
  }
  
  /**
   * Parse DXF blocks section
   */
  private static parseDxfBlocks(
    lines: string[],
    startIndex: number,
    cadFile: CadFile
  ): number {
    let i = startIndex
    let currentBlock: DwgBlock | null = null
    
    while (i < lines.length) {
      const code = parseInt(lines[i])
      const value = lines[i + 1]
      
      if (code === 0 && value === 'ENDSEC') break
      
      if (code === 0 && value === 'BLOCK') {
        currentBlock = {
          name: '',
          entities: [],
          basePoint: { x: 0, y: 0, z: 0 }
        }
        
        i += 2
        while (i < lines.length && parseInt(lines[i]) !== 0) {
          const blockCode = parseInt(lines[i])
          const blockValue = lines[i + 1]
          
          switch (blockCode) {
            case 2: currentBlock.name = blockValue; break
            case 10: currentBlock.basePoint.x = parseFloat(blockValue); break
            case 20: currentBlock.basePoint.y = parseFloat(blockValue); break
            case 30: currentBlock.basePoint.z = parseFloat(blockValue); break
          }
          
          i += 2
        }
        continue
      }
      
      if (code === 0 && value === 'ENDBLK' && currentBlock) {
        cadFile.blocks.push(currentBlock)
        currentBlock = null
        i += 2
        continue
      }
      
      // Parse entities within block
      if (currentBlock && code === 0) {
        const entity = this.parseDxfEntity(lines, i)
        if (entity) {
          currentBlock.entities.push(entity.entity)
          i = entity.nextIndex
          continue
        }
      }
      
      i += 2
    }
    
    return i
  }
  
  /**
   * Parse DXF entities section
   */
  private static parseDxfEntities(
    lines: string[],
    startIndex: number,
    cadFile: CadFile
  ): number {
    let i = startIndex
    
    while (i < lines.length) {
      const code = parseInt(lines[i])
      const value = lines[i + 1]
      
      if (code === 0 && value === 'ENDSEC') break
      
      if (code === 0) {
        const result = this.parseDxfEntity(lines, i)
        if (result) {
          cadFile.entities.push(result.entity)
          i = result.nextIndex
          continue
        }
      }
      
      i += 2
    }
    
    return i
  }
  
  /**
   * Parse individual DXF entity
   */
  private static parseDxfEntity(
    lines: string[],
    startIndex: number
  ): { entity: DwgEntity; nextIndex: number } | null {
    const entityType = lines[startIndex + 1]
    const entity: DwgEntity = {
      type: entityType as any,
      layer: '0',
      color: 256, // ByLayer
      lineType: 'ByLayer',
      lineWeight: -1
    }
    
    let i = startIndex + 2
    
    switch (entityType) {
      case 'LINE':
        entity.vertices = [
          { x: 0, y: 0, z: 0 },
          { x: 0, y: 0, z: 0 }
        ]
        
        while (i < lines.length && parseInt(lines[i]) !== 0) {
          const code = parseInt(lines[i])
          const value = lines[i + 1]
          
          switch (code) {
            case 8: entity.layer = value; break
            case 62: entity.color = parseInt(value); break
            case 10: entity.vertices![0].x = parseFloat(value); break
            case 20: entity.vertices![0].y = parseFloat(value); break
            case 30: entity.vertices![0].z = parseFloat(value); break
            case 11: entity.vertices![1].x = parseFloat(value); break
            case 21: entity.vertices![1].y = parseFloat(value); break
            case 31: entity.vertices![1].z = parseFloat(value); break
          }
          
          i += 2
        }
        break
        
      case 'CIRCLE':
        entity.center = { x: 0, y: 0, z: 0 }
        entity.radius = 0
        
        while (i < lines.length && parseInt(lines[i]) !== 0) {
          const code = parseInt(lines[i])
          const value = lines[i + 1]
          
          switch (code) {
            case 8: entity.layer = value; break
            case 62: entity.color = parseInt(value); break
            case 10: entity.center!.x = parseFloat(value); break
            case 20: entity.center!.y = parseFloat(value); break
            case 30: entity.center!.z = parseFloat(value); break
            case 40: entity.radius = parseFloat(value); break
          }
          
          i += 2
        }
        break
        
      case 'LWPOLYLINE':
        entity.vertices = []
        let vertexCount = 0
        const currentVertex = { x: 0, y: 0 }
        
        while (i < lines.length && parseInt(lines[i]) !== 0) {
          const code = parseInt(lines[i])
          const value = lines[i + 1]
          
          switch (code) {
            case 8: entity.layer = value; break
            case 62: entity.color = parseInt(value); break
            case 90: vertexCount = parseInt(value); break
            case 10:
              currentVertex.x = parseFloat(value)
              break
            case 20:
              currentVertex.y = parseFloat(value)
              entity.vertices!.push({ ...currentVertex })
              break
          }
          
          i += 2
        }
        break
        
      default:
        // Skip unsupported entity types
        while (i < lines.length && parseInt(lines[i]) !== 0) {
          i += 2
        }
    }
    
    return { entity, nextIndex: i }
  }
  
  /**
   * Convert DXF units to standard units
   */
  private static convertDxfUnits(units: number): CadFile['units'] {
    switch (units) {
      case 1: return 'in'
      case 2: return 'ft'
      case 4: return 'mm'
      case 5: return 'cm'
      case 6: return 'm'
      default: return 'm'
    }
  }
  
  /**
   * Process DWG data from cloud service
   */
  private static processDwgData(data: any): CadFile {
    return {
      format: 'dwg',
      version: data.version || 'AutoCAD 2018',
      units: data.units || 'm',
      layers: data.layers || [],
      entities: data.entities || [],
      blocks: data.blocks || [],
      metadata: data.metadata || {}
    }
  }
  
  /**
   * Parse Collada format (from SketchUp)
   */
  private static async parseCollada(content: string): Promise<CadFile> {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/xml')
    
    const cadFile: CadFile = {
      format: 'skp',
      version: 'SketchUp 2023',
      units: 'm',
      layers: [],
      entities: [],
      blocks: [],
      metadata: {}
    }
    
    // Parse unit
    const unitNode = doc.querySelector('unit')
    if (unitNode) {
      const meter = parseFloat(unitNode.getAttribute('meter') || '1')
      if (meter === 0.0254) cadFile.units = 'in'
      else if (meter === 0.3048) cadFile.units = 'ft'
      else if (meter === 0.001) cadFile.units = 'mm'
      else if (meter === 0.01) cadFile.units = 'cm'
    }
    
    // Parse geometries
    const geometries = doc.querySelectorAll('geometry')
    geometries.forEach(geometry => {
      const meshes = geometry.querySelectorAll('mesh')
      meshes.forEach(mesh => {
        // Extract vertices and convert to entities
        const positions = mesh.querySelector('float_array[id*="positions"]')
        if (positions) {
          const values = positions.textContent!.trim().split(/\s+/).map(parseFloat)
          for (let i = 0; i < values.length; i += 3) {
            // Create simplified point entities
            cadFile.entities.push({
              type: 'CIRCLE',
              layer: 'Imported',
              color: 7,
              lineType: 'CONTINUOUS',
              lineWeight: -1,
              center: {
                x: values[i],
                y: values[i + 1],
                z: values[i + 2]
              },
              radius: 0.01
            })
          }
        }
      })
    })
    
    return cadFile
  }
  
  /**
   * Convert IFC data to CAD format
   */
  private static convertIfcToCad(
    ifcData: any,
    sourceFormat: CadFile['format']
  ): CadFile {
    const cadFile: CadFile = {
      format: sourceFormat,
      version: 'Imported from IFC',
      units: ifcData.units.lengthUnit === 'METRE' ? 'm' : 'ft',
      layers: [],
      entities: [],
      blocks: [],
      metadata: {
        description: ifcData.projectInfo.description,
        created: new Date()
      }
    }
    
    // Create layers for different object types
    const layerMap = new Map<string, DwgLayer>()
    
    ifcData.objects.forEach((obj: RoomObject) => {
      const layerName = `${obj.type.toUpperCase()}`
      
      if (!layerMap.has(layerName)) {
        layerMap.set(layerName, {
          name: layerName,
          color: this.getColorForType(obj.type),
          lineType: 'CONTINUOUS',
          visible: true,
          frozen: false,
          locked: false
        })
      }
      
      // Convert object to entity
      const entity: DwgEntity = {
        type: 'INSERT',
        layer: layerName,
        color: 256, // ByLayer
        lineType: 'ByLayer',
        lineWeight: -1,
        blockName: `${obj.type}_block`,
        position: { x: obj.x, y: obj.y, z: obj.z },
        rotation: obj.rotation,
        scale: { x: 1, y: 1, z: 1 }
      }
      
      cadFile.entities.push(entity)
    })
    
    cadFile.layers = Array.from(layerMap.values())
    
    return cadFile
  }
  
  /**
   * Get color index for object type
   */
  private static getColorForType(type: string): number {
    const colorMap: Record<string, number> = {
      fixture: 3, // Green
      plant: 2, // Yellow
      bench: 8, // Gray
      window: 5, // Blue
      greenhouse: 6 // Magenta
    }
    
    return colorMap[type] || 7 // White default
  }
  
  /**
   * Generate DWG data structure
   */
  private static generateDwgData(
    objects: RoomObject[],
    layers: string[],
    version: string
  ): any {
    return {
      version,
      units: 'mm',
      layers: layers.map((name, index) => ({
        name,
        color: index + 1,
        lineType: 'CONTINUOUS',
        visible: true,
        frozen: false,
        locked: false
      })),
      entities: objects.map(obj => ({
        type: 'INSERT',
        layer: this.getLayerForObject(obj),
        blockName: `${obj.type}_${obj.id}`,
        position: {
          x: obj.x * 1000,
          y: obj.y * 1000,
          z: (obj.z || 0) * 1000
        },
        rotation: obj.rotation || 0,
        scale: { x: 1, y: 1, z: 1 },
        attributes: this.getObjectAttributes(obj)
      })),
      blocks: this.generateBlockDefinitions(objects)
    }
  }
  
  /**
   * Get appropriate layer for object type
   */
  private static getLayerForObject(obj: RoomObject): string {
    const layerMap: Record<string, string> = {
      fixture: 'E-LITE-FIXT',
      plant: 'A-PLNT',
      bench: 'A-FURN',
      window: 'A-GLAZ',
      greenhouse: 'A-BLDG'
    }
    
    return layerMap[obj.type] || 'A-MISC'
  }
  
  /**
   * Get object attributes for block reference
   */
  private static getObjectAttributes(obj: RoomObject): Record<string, any> {
    const attributes: Record<string, any> = {
      ID: obj.id,
      TYPE: obj.type
    }
    
    if (obj.type === 'fixture') {
      const fixture = obj as any
      attributes.MODEL = fixture.model?.name || 'Unknown'
      attributes.WATTAGE = fixture.model?.wattage || 0
      attributes.PPF = fixture.model?.ppf || 0
    }
    
    return attributes
  }
  
  /**
   * Generate block definitions for objects
   */
  private static generateBlockDefinitions(objects: RoomObject[]): DwgBlock[] {
    const blocks: DwgBlock[] = []
    const blockMap = new Map<string, boolean>()
    
    objects.forEach(obj => {
      const blockName = obj.type
      
      if (!blockMap.has(blockName)) {
        blockMap.set(blockName, true)
        
        // Create simple block definition
        const block: DwgBlock = {
          name: blockName,
          basePoint: { x: 0, y: 0, z: 0 },
          entities: []
        }
        
        // Add geometry based on object type
        switch (obj.type) {
          case 'fixture':
            // Rectangle for fixture
            block.entities.push({
              type: 'POLYLINE',
              layer: '0',
              color: 256,
              lineType: 'ByLayer',
              lineWeight: -1,
              vertices: [
                { x: -obj.width * 500, y: -obj.length * 500 },
                { x: obj.width * 500, y: -obj.length * 500 },
                { x: obj.width * 500, y: obj.length * 500 },
                { x: -obj.width * 500, y: obj.length * 500 },
                { x: -obj.width * 500, y: -obj.length * 500 }
              ]
            })
            break
            
          case 'plant':
            // Circle for plant
            block.entities.push({
              type: 'CIRCLE',
              layer: '0',
              color: 256,
              lineType: 'ByLayer',
              lineWeight: -1,
              center: { x: 0, y: 0 },
              radius: obj.width * 500
            })
            break
            
          default:
            // Default rectangle
            block.entities.push({
              type: 'POLYLINE',
              layer: '0',
              color: 256,
              lineType: 'ByLayer',
              lineWeight: -1,
              vertices: [
                { x: -obj.width * 500, y: -obj.length * 500 },
                { x: obj.width * 500, y: -obj.length * 500 },
                { x: obj.width * 500, y: obj.length * 500 },
                { x: -obj.width * 500, y: obj.length * 500 },
                { x: -obj.width * 500, y: -obj.length * 500 }
              ]
            })
        }
        
        blocks.push(block)
      }
    })
    
    return blocks
  }
}