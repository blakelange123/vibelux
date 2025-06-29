import * as THREE from 'three'

export interface MaterialProperties {
  name: string
  category: 'metal' | 'plastic' | 'concrete' | 'glass' | 'vegetation' | 'soil' | 'custom'
  baseColor: THREE.Color
  roughness: number
  metalness: number
  normalScale?: number
  emissive?: THREE.Color
  emissiveIntensity?: number
  opacity?: number
  reflectivity?: number
  clearcoat?: number
  clearcoatRoughness?: number
  transmission?: number
  ior?: number // Index of refraction
  thickness?: number
  attenuationColor?: THREE.Color
  attenuationDistance?: number
  specularIntensity?: number
  specularColor?: THREE.Color
  envMapIntensity?: number
  aoMapIntensity?: number
  lightMapIntensity?: number
}

export class MaterialLibrary {
  private static materials: Map<string, MaterialProperties> = new Map()
  private static textureLoader = new THREE.TextureLoader()
  private static cubeTextureLoader = new THREE.CubeTextureLoader()
  
  static {
    // Initialize standard materials
    this.initializeStandardMaterials()
  }
  
  private static initializeStandardMaterials(): void {
    // Greenhouse materials
    this.materials.set('greenhouse_glass', {
      name: 'Greenhouse Glass',
      category: 'glass',
      baseColor: new THREE.Color(0xffffff),
      roughness: 0.05,
      metalness: 0.0,
      transmission: 0.95,
      ior: 1.52,
      thickness: 0.005,
      specularIntensity: 0.5,
      envMapIntensity: 1.0
    })
    
    this.materials.set('greenhouse_frame_aluminum', {
      name: 'Aluminum Frame',
      category: 'metal',
      baseColor: new THREE.Color(0xc0c0c0),
      roughness: 0.3,
      metalness: 0.95,
      envMapIntensity: 1.5
    })
    
    this.materials.set('polycarbonate_panel', {
      name: 'Polycarbonate Panel',
      category: 'plastic',
      baseColor: new THREE.Color(0xffffff),
      roughness: 0.2,
      metalness: 0.0,
      transmission: 0.85,
      ior: 1.586,
      thickness: 0.01
    })
    
    // Growing surfaces
    this.materials.set('grow_bench_plastic', {
      name: 'Grow Bench Plastic',
      category: 'plastic',
      baseColor: new THREE.Color(0x333333),
      roughness: 0.7,
      metalness: 0.0
    })
    
    this.materials.set('hydroponic_channel', {
      name: 'Hydroponic Channel',
      category: 'plastic',
      baseColor: new THREE.Color(0xffffff),
      roughness: 0.4,
      metalness: 0.0
    })
    
    this.materials.set('grow_media_rockwool', {
      name: 'Rockwool',
      category: 'custom',
      baseColor: new THREE.Color(0x8b7355),
      roughness: 0.95,
      metalness: 0.0
    })
    
    this.materials.set('grow_media_coco', {
      name: 'Coco Coir',
      category: 'soil',
      baseColor: new THREE.Color(0x4a3626),
      roughness: 0.98,
      metalness: 0.0
    })
    
    // Plant materials
    this.materials.set('leaf_healthy', {
      name: 'Healthy Leaf',
      category: 'vegetation',
      baseColor: new THREE.Color(0x228b22),
      roughness: 0.6,
      metalness: 0.0,
      normalScale: 0.5
    })
    
    this.materials.set('leaf_young', {
      name: 'Young Leaf',
      category: 'vegetation',
      baseColor: new THREE.Color(0x90ee90),
      roughness: 0.4,
      metalness: 0.0,
      normalScale: 0.3
    })
    
    this.materials.set('stem', {
      name: 'Plant Stem',
      category: 'vegetation',
      baseColor: new THREE.Color(0x556b2f),
      roughness: 0.8,
      metalness: 0.0
    })
    
    // Facility materials
    this.materials.set('concrete_floor', {
      name: 'Concrete Floor',
      category: 'concrete',
      baseColor: new THREE.Color(0x808080),
      roughness: 0.9,
      metalness: 0.0,
      normalScale: 1.0
    })
    
    this.materials.set('metal_wall_panel', {
      name: 'Metal Wall Panel',
      category: 'metal',
      baseColor: new THREE.Color(0xe0e0e0),
      roughness: 0.5,
      metalness: 0.8
    })
    
    this.materials.set('insulation_panel', {
      name: 'Insulation Panel',
      category: 'plastic',
      baseColor: new THREE.Color(0xf0f0f0),
      roughness: 0.95,
      metalness: 0.0
    })
    
    // Light fixture materials
    this.materials.set('fixture_housing', {
      name: 'Fixture Housing',
      category: 'metal',
      baseColor: new THREE.Color(0xd3d3d3),
      roughness: 0.4,
      metalness: 0.9
    })
    
    this.materials.set('led_lens', {
      name: 'LED Lens',
      category: 'plastic',
      baseColor: new THREE.Color(0xffffff),
      roughness: 0.1,
      metalness: 0.0,
      transmission: 0.9,
      ior: 1.49
    })
    
    this.materials.set('led_emitter', {
      name: 'LED Emitter',
      category: 'custom',
      baseColor: new THREE.Color(0xffffff),
      roughness: 0.0,
      metalness: 0.0,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 2.0
    })
  }
  
  public static createMaterial(
    properties: MaterialProperties,
    textureUrls?: {
      map?: string
      normalMap?: string
      roughnessMap?: string
      metalnessMap?: string
      aoMap?: string
      emissiveMap?: string
      envMap?: string[]
    }
  ): Promise<THREE.Material> {
    return new Promise(async (resolve) => {
      const materialOptions: any = {
        color: properties.baseColor,
        roughness: properties.roughness,
        metalness: properties.metalness,
        transparent: properties.opacity !== undefined && properties.opacity < 1,
        opacity: properties.opacity || 1
      }
      
      // Handle special material types
      if (properties.transmission !== undefined) {
        // Use MeshPhysicalMaterial for transmission
        const material = new THREE.MeshPhysicalMaterial({
          ...materialOptions,
          transmission: properties.transmission,
          ior: properties.ior || 1.5,
          thickness: properties.thickness || 0.01,
          attenuationColor: properties.attenuationColor,
          attenuationDistance: properties.attenuationDistance,
          specularIntensity: properties.specularIntensity || 1,
          specularColor: properties.specularColor || new THREE.Color(0xffffff),
          clearcoat: properties.clearcoat || 0,
          clearcoatRoughness: properties.clearcoatRoughness || 0
        })
        
        // Load textures if provided
        if (textureUrls) {
          await this.loadTextures(material, textureUrls)
        }
        
        resolve(material)
      } else {
        // Use standard PBR material
        const material = new THREE.MeshStandardMaterial(materialOptions)
        
        if (properties.emissive) {
          material.emissive = properties.emissive
          material.emissiveIntensity = properties.emissiveIntensity || 1
        }
        
        if (properties.normalScale !== undefined) {
          material.normalScale = new THREE.Vector2(
            properties.normalScale,
            properties.normalScale
          )
        }
        
        if (properties.envMapIntensity !== undefined) {
          material.envMapIntensity = properties.envMapIntensity
        }
        
        if (properties.aoMapIntensity !== undefined) {
          material.aoMapIntensity = properties.aoMapIntensity
        }
        
        if (properties.lightMapIntensity !== undefined) {
          material.lightMapIntensity = properties.lightMapIntensity
        }
        
        // Load textures if provided
        if (textureUrls) {
          await this.loadTextures(material, textureUrls)
        }
        
        resolve(material)
      }
    })
  }
  
  private static async loadTextures(
    material: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial,
    textureUrls: any
  ): Promise<void> {
    const loadPromises = []
    
    if (textureUrls.map) {
      loadPromises.push(
        this.textureLoader.loadAsync(textureUrls.map).then(texture => {
          texture.colorSpace = THREE.SRGBColorSpace
          material.map = texture
        })
      )
    }
    
    if (textureUrls.normalMap) {
      loadPromises.push(
        this.textureLoader.loadAsync(textureUrls.normalMap).then(texture => {
          material.normalMap = texture
        })
      )
    }
    
    if (textureUrls.roughnessMap) {
      loadPromises.push(
        this.textureLoader.loadAsync(textureUrls.roughnessMap).then(texture => {
          material.roughnessMap = texture
        })
      )
    }
    
    if (textureUrls.metalnessMap) {
      loadPromises.push(
        this.textureLoader.loadAsync(textureUrls.metalnessMap).then(texture => {
          material.metalnessMap = texture
        })
      )
    }
    
    if (textureUrls.aoMap) {
      loadPromises.push(
        this.textureLoader.loadAsync(textureUrls.aoMap).then(texture => {
          material.aoMap = texture
        })
      )
    }
    
    if (textureUrls.emissiveMap) {
      loadPromises.push(
        this.textureLoader.loadAsync(textureUrls.emissiveMap).then(texture => {
          texture.colorSpace = THREE.SRGBColorSpace
          material.emissiveMap = texture
        })
      )
    }
    
    if (textureUrls.envMap && Array.isArray(textureUrls.envMap)) {
      loadPromises.push(
        this.cubeTextureLoader.loadAsync(textureUrls.envMap).then(texture => {
          texture.colorSpace = THREE.SRGBColorSpace
          material.envMap = texture
        })
      )
    }
    
    await Promise.all(loadPromises)
    material.needsUpdate = true
  }
  
  public static getMaterial(name: string): MaterialProperties | undefined {
    return this.materials.get(name)
  }
  
  public static getAllMaterials(): MaterialProperties[] {
    return Array.from(this.materials.values())
  }
  
  public static getMaterialsByCategory(category: MaterialProperties['category']): MaterialProperties[] {
    return Array.from(this.materials.values()).filter(m => m.category === category)
  }
  
  public static addCustomMaterial(name: string, properties: MaterialProperties): void {
    this.materials.set(name, properties)
  }
  
  // Generate procedural textures
  public static generateProceduralNormalMap(
    pattern: 'brick' | 'tile' | 'metal' | 'fabric',
    resolution: number = 512
  ): THREE.Texture {
    const canvas = document.createElement('canvas')
    canvas.width = resolution
    canvas.height = resolution
    const ctx = canvas.getContext('2d')!
    
    switch (pattern) {
      case 'brick':
        this.generateBrickNormal(ctx, resolution)
        break
      case 'tile':
        this.generateTileNormal(ctx, resolution)
        break
      case 'metal':
        this.generateMetalNormal(ctx, resolution)
        break
      case 'fabric':
        this.generateFabricNormal(ctx, resolution)
        break
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    return texture
  }
  
  private static generateBrickNormal(ctx: CanvasRenderingContext2D, size: number): void {
    const brickWidth = size / 8
    const brickHeight = size / 16
    const mortarWidth = size / 64
    
    // Base color
    ctx.fillStyle = 'rgb(128, 128, 255)'
    ctx.fillRect(0, 0, size, size)
    
    // Draw bricks
    for (let y = 0; y < size; y += brickHeight) {
      const offset = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2
      for (let x = -brickWidth; x < size + brickWidth; x += brickWidth) {
        // Brick body
        ctx.fillStyle = 'rgb(140, 140, 255)'
        ctx.fillRect(x + offset + mortarWidth, y + mortarWidth, 
                    brickWidth - mortarWidth * 2, brickHeight - mortarWidth * 2)
        
        // Subtle variations
        const variation = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 - 5
        ctx.fillStyle = `rgb(${140 + variation}, ${140 + variation}, 255)`
        ctx.fillRect(x + offset + mortarWidth * 2, y + mortarWidth * 2,
                    brickWidth - mortarWidth * 4, brickHeight - mortarWidth * 4)
      }
    }
  }
  
  private static generateTileNormal(ctx: CanvasRenderingContext2D, size: number): void {
    const tileSize = size / 4
    const groutWidth = size / 32
    
    ctx.fillStyle = 'rgb(120, 120, 255)'
    ctx.fillRect(0, 0, size, size)
    
    for (let y = 0; y < size; y += tileSize) {
      for (let x = 0; x < size; x += tileSize) {
        // Tile surface
        const gradient = ctx.createRadialGradient(
          x + tileSize / 2, y + tileSize / 2, 0,
          x + tileSize / 2, y + tileSize / 2, tileSize / 2
        )
        gradient.addColorStop(0, 'rgb(135, 135, 255)')
        gradient.addColorStop(1, 'rgb(125, 125, 255)')
        
        ctx.fillStyle = gradient
        ctx.fillRect(x + groutWidth, y + groutWidth,
                    tileSize - groutWidth * 2, tileSize - groutWidth * 2)
      }
    }
  }
  
  private static generateMetalNormal(ctx: CanvasRenderingContext2D, size: number): void {
    // Brushed metal effect
    ctx.fillStyle = 'rgb(128, 128, 255)'
    ctx.fillRect(0, 0, size, size)
    
    // Add horizontal streaks
    for (let y = 0; y < size; y++) {
      const variation = Math.sin(y * 0.1) * 5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3
      ctx.strokeStyle = `rgb(${128 + variation}, ${128 + variation}, 255)`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(size, y)
      ctx.stroke()
    }
  }
  
  private static generateFabricNormal(ctx: CanvasRenderingContext2D, size: number): void {
    // Woven fabric pattern
    const threadWidth = size / 64
    
    ctx.fillStyle = 'rgb(128, 128, 255)'
    ctx.fillRect(0, 0, size, size)
    
    // Vertical threads
    for (let x = 0; x < size; x += threadWidth * 2) {
      ctx.fillStyle = 'rgb(130, 130, 255)'
      ctx.fillRect(x, 0, threadWidth, size)
    }
    
    // Horizontal threads (interwoven)
    for (let y = 0; y < size; y += threadWidth * 2) {
      for (let x = 0; x < size; x += threadWidth * 2) {
        const isOver = ((x / threadWidth) + (y / threadWidth)) % 4 < 2
        ctx.fillStyle = isOver ? 'rgb(125, 125, 255)' : 'rgb(130, 130, 255)'
        ctx.fillRect(x, y, threadWidth * 2, threadWidth)
      }
    }
  }
}