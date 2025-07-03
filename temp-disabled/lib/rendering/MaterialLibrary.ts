import * as THREE from 'three'

export interface MaterialPreset {
  name: string
  category: 'plant' | 'structure' | 'equipment' | 'ground' | 'glass'
  material: THREE.Material
  thumbnail?: string
}

export class MaterialLibrary {
  private textureLoader = new THREE.TextureLoader()
  private materials: Map<string, MaterialPreset> = new Map()
  
  constructor() {
    this.initializeDefaultMaterials()
  }
  
  private initializeDefaultMaterials() {
    // Plant Materials
    this.addMaterial({
      name: 'Lettuce Leaf',
      category: 'plant',
      material: new THREE.MeshPhysicalMaterial({
        color: 0x4a7c59,
        roughness: 0.4,
        metalness: 0.0,
        transmission: 0.3,
        thickness: 0.5,
        clearcoat: 0.1,
        clearcoatRoughness: 0.4,
        sheen: 0.3,
        sheenRoughness: 0.3,
        sheenColor: new THREE.Color(0x73a580),
        side: THREE.DoubleSide
      })
    })
    
    this.addMaterial({
      name: 'Tomato Leaf',
      category: 'plant',
      material: new THREE.MeshPhysicalMaterial({
        color: 0x2d5016,
        roughness: 0.5,
        metalness: 0.0,
        transmission: 0.25,
        thickness: 0.4,
        clearcoat: 0.05,
        clearcoatRoughness: 0.6,
        side: THREE.DoubleSide
      })
    })
    
    this.addMaterial({
      name: 'Cannabis Leaf',
      category: 'plant',
      material: new THREE.MeshPhysicalMaterial({
        color: 0x3a5f3a,
        roughness: 0.3,
        metalness: 0.0,
        transmission: 0.35,
        thickness: 0.3,
        clearcoat: 0.15,
        clearcoatRoughness: 0.3,
        sheen: 0.4,
        sheenRoughness: 0.2,
        sheenColor: new THREE.Color(0x5a8f5a),
        side: THREE.DoubleSide
      })
    })
    
    // Structure Materials
    this.addMaterial({
      name: 'Galvanized Steel',
      category: 'structure',
      material: new THREE.MeshStandardMaterial({
        color: 0xb0b0b0,
        roughness: 0.4,
        metalness: 0.9,
        envMapIntensity: 0.8
      })
    })
    
    this.addMaterial({
      name: 'Aluminum Frame',
      category: 'structure',
      material: new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        roughness: 0.3,
        metalness: 0.95,
        envMapIntensity: 1.0
      })
    })
    
    this.addMaterial({
      name: 'White Powder Coat',
      category: 'structure',
      material: new THREE.MeshStandardMaterial({
        color: 0xf5f5f5,
        roughness: 0.2,
        metalness: 0.1
      })
    })
    
    // Glass Materials
    this.addMaterial({
      name: 'Greenhouse Glass',
      category: 'glass',
      material: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.0,
        metalness: 0.0,
        transmission: 0.95,
        thickness: 0.1,
        envMapIntensity: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        ior: 1.52,
        side: THREE.DoubleSide
      })
    })
    
    this.addMaterial({
      name: 'Diffused Glass',
      category: 'glass',
      material: new THREE.MeshPhysicalMaterial({
        color: 0xfafafa,
        roughness: 0.7,
        metalness: 0.0,
        transmission: 0.85,
        thickness: 0.1,
        side: THREE.DoubleSide
      })
    })
    
    this.addMaterial({
      name: 'Polycarbonate',
      category: 'glass',
      material: new THREE.MeshPhysicalMaterial({
        color: 0xf8f8ff,
        roughness: 0.1,
        metalness: 0.0,
        transmission: 0.88,
        thickness: 0.3,
        ior: 1.58,
        side: THREE.DoubleSide
      })
    })
    
    // Ground Materials
    this.addMaterial({
      name: 'Concrete Floor',
      category: 'ground',
      material: new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.8,
        metalness: 0.0,
        normalScale: new THREE.Vector2(0.5, 0.5)
      })
    })
    
    this.addMaterial({
      name: 'Epoxy Floor',
      category: 'ground',
      material: new THREE.MeshStandardMaterial({
        color: 0x667788,
        roughness: 0.1,
        metalness: 0.0,
        envMapIntensity: 0.3
      })
    })
    
    this.addMaterial({
      name: 'Gravel',
      category: 'ground',
      material: new THREE.MeshStandardMaterial({
        color: 0x665544,
        roughness: 1.0,
        metalness: 0.0
      })
    })
    
    // Equipment Materials
    this.addMaterial({
      name: 'LED Housing',
      category: 'equipment',
      material: new THREE.MeshStandardMaterial({
        color: 0x404040,
        roughness: 0.3,
        metalness: 0.8,
        emissive: 0x111111,
        emissiveIntensity: 0.1
      })
    })
    
    this.addMaterial({
      name: 'White Plastic',
      category: 'equipment',
      material: new THREE.MeshStandardMaterial({
        color: 0xf0f0f0,
        roughness: 0.4,
        metalness: 0.0
      })
    })
    
    this.addMaterial({
      name: 'Black Plastic',
      category: 'equipment',
      material: new THREE.MeshStandardMaterial({
        color: 0x202020,
        roughness: 0.5,
        metalness: 0.0
      })
    })
  }
  
  // Load textured materials
  async loadTexturedMaterial(options: {
    name: string
    category: MaterialPreset['category']
    diffuse?: string
    normal?: string
    roughness?: string
    metalness?: string
    ao?: string
    displacement?: string
    opacity?: string
  }): Promise<MaterialPreset> {
    const textures: any = {}
    
    if (options.diffuse) {
      textures.map = await this.loadTexture(options.diffuse)
    }
    if (options.normal) {
      textures.normalMap = await this.loadTexture(options.normal)
    }
    if (options.roughness) {
      textures.roughnessMap = await this.loadTexture(options.roughness)
    }
    if (options.metalness) {
      textures.metalnessMap = await this.loadTexture(options.metalness)
    }
    if (options.ao) {
      textures.aoMap = await this.loadTexture(options.ao)
    }
    if (options.displacement) {
      textures.displacementMap = await this.loadTexture(options.displacement)
      textures.displacementScale = 0.1
    }
    if (options.opacity) {
      textures.alphaMap = await this.loadTexture(options.opacity)
      textures.transparent = true
    }
    
    const material = new THREE.MeshStandardMaterial({
      ...textures,
      side: THREE.DoubleSide
    })
    
    const preset: MaterialPreset = {
      name: options.name,
      category: options.category,
      material
    }
    
    this.addMaterial(preset)
    return preset
  }
  
  // Procedural texture generation for organic materials
  generateProceduralPlantTexture(options: {
    baseColor: THREE.Color
    veinColor: THREE.Color
    cellSize: number
    veinThickness: number
    randomness: number
  }): THREE.CanvasTexture {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    
    // Generate cellular pattern
    const imageData = ctx.createImageData(size, size)
    const data = imageData.data
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4
        
        // Voronoi cell pattern for organic look
        const cellX = Math.floor(x / options.cellSize)
        const cellY = Math.floor(y / options.cellSize)
        const localX = x % options.cellSize
        const localY = y % options.cellSize
        
        // Add randomness
        const noise = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * options.randomness
        
        // Distance to cell center
        const dist = Math.sqrt(
          Math.pow(localX - options.cellSize / 2, 2) + 
          Math.pow(localY - options.cellSize / 2, 2)
        ) / options.cellSize
        
        // Vein pattern
        const veinPattern = Math.sin(x * 0.05) * Math.cos(y * 0.05) + noise
        const isVein = Math.abs(veinPattern) < options.veinThickness
        
        // Mix colors
        const color = isVein ? options.veinColor : options.baseColor
        const factor = 1 - dist * 0.3
        
        data[i] = color.r * 255 * factor
        data[i + 1] = color.g * 255 * factor
        data[i + 2] = color.b * 255 * factor
        data[i + 3] = 255
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    
    return texture
  }
  
  private async loadTexture(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.RepeatWrapping
          texture.colorSpace = THREE.SRGBColorSpace
          resolve(texture)
        },
        undefined,
        reject
      )
    })
  }
  
  private addMaterial(preset: MaterialPreset) {
    this.materials.set(preset.name, preset)
  }
  
  getMaterial(name: string): THREE.Material | undefined {
    return this.materials.get(name)?.material
  }
  
  getMaterialsByCategory(category: MaterialPreset['category']): MaterialPreset[] {
    return Array.from(this.materials.values()).filter(m => m.category === category)
  }
  
  getAllMaterials(): MaterialPreset[] {
    return Array.from(this.materials.values())
  }
}