// 3D Export functionality for STL and OBJ formats

interface Vector3 {
  x: number
  y: number
  z: number
}

interface Triangle {
  v1: Vector3
  v2: Vector3
  v3: Vector3
  normal?: Vector3
}

interface Mesh {
  name: string
  vertices: Vector3[]
  faces: number[][] // indices into vertices array
  material?: string
}

export class ThreeDExporter {
  // Export to STL format (binary)
  static exportSTL(meshes: Mesh[], filename: string = 'lighting-design.stl'): void {
    const triangles: Triangle[] = []

    // Convert meshes to triangles
    meshes.forEach(mesh => {
      mesh.faces.forEach(face => {
        if (face.length >= 3) {
          // Convert face to triangles (fan triangulation for polygons)
          for (let i = 1; i < face.length - 1; i++) {
            const v1 = mesh.vertices[face[0]]
            const v2 = mesh.vertices[face[i]]
            const v3 = mesh.vertices[face[i + 1]]
            
            // Calculate normal
            const edge1 = { 
              x: v2.x - v1.x, 
              y: v2.y - v1.y, 
              z: v2.z - v1.z 
            }
            const edge2 = { 
              x: v3.x - v1.x, 
              y: v3.y - v1.y, 
              z: v3.z - v1.z 
            }
            
            const normal = this.crossProduct(edge1, edge2)
            const normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z)
            
            if (normalLength > 0) {
              normal.x /= normalLength
              normal.y /= normalLength
              normal.z /= normalLength
            }

            triangles.push({ v1, v2, v3, normal })
          }
        }
      })
    })

    // Create binary STL
    const triangleCount = triangles.length
    const bufferSize = 84 + (triangleCount * 50) // Header + triangles
    const buffer = new ArrayBuffer(bufferSize)
    const view = new DataView(buffer)

    // Header (80 bytes) - can contain any data
    const header = 'Vibelux Lighting Design Export'.padEnd(80, ' ')
    for (let i = 0; i < 80; i++) {
      view.setUint8(i, header.charCodeAt(i))
    }

    // Number of triangles (4 bytes)
    view.setUint32(80, triangleCount, true)

    // Triangle data
    let offset = 84
    triangles.forEach(triangle => {
      // Normal vector (12 bytes)
      view.setFloat32(offset, triangle.normal?.x || 0, true)
      view.setFloat32(offset + 4, triangle.normal?.y || 0, true)
      view.setFloat32(offset + 8, triangle.normal?.z || 0, true)
      
      // Vertex 1 (12 bytes)
      view.setFloat32(offset + 12, triangle.v1.x, true)
      view.setFloat32(offset + 16, triangle.v1.y, true)
      view.setFloat32(offset + 20, triangle.v1.z, true)
      
      // Vertex 2 (12 bytes)
      view.setFloat32(offset + 24, triangle.v2.x, true)
      view.setFloat32(offset + 28, triangle.v2.y, true)
      view.setFloat32(offset + 32, triangle.v2.z, true)
      
      // Vertex 3 (12 bytes)
      view.setFloat32(offset + 36, triangle.v3.x, true)
      view.setFloat32(offset + 40, triangle.v3.y, true)
      view.setFloat32(offset + 44, triangle.v3.z, true)
      
      // Attribute byte count (2 bytes) - unused
      view.setUint16(offset + 48, 0, true)
      
      offset += 50
    })

    // Download file
    const blob = new Blob([buffer], { type: 'application/octet-stream' })
    this.downloadFile(blob, filename)
  }

  // Export to OBJ format (text-based)
  static exportOBJ(meshes: Mesh[], filename: string = 'lighting-design.obj'): void {
    let objContent = '# Vibelux Lighting Design Export\n'
    objContent += '# Exported on ' + new Date().toISOString() + '\n\n'

    let vertexOffset = 0

    meshes.forEach((mesh, meshIndex) => {
      objContent += `# Object: ${mesh.name}\n`
      objContent += `o ${mesh.name}\n`

      // Write vertices
      mesh.vertices.forEach(vertex => {
        objContent += `v ${vertex.x} ${vertex.y} ${vertex.z}\n`
      })

      // Write faces (OBJ uses 1-based indexing)
      mesh.faces.forEach(face => {
        objContent += 'f'
        face.forEach(vertexIndex => {
          objContent += ` ${vertexIndex + 1 + vertexOffset}`
        })
        objContent += '\n'
      })

      vertexOffset += mesh.vertices.length
      objContent += '\n'
    })

    // Also export material file
    const mtlContent = this.generateMTL(meshes)
    
    // Download files
    const objBlob = new Blob([objContent], { type: 'text/plain' })
    const mtlBlob = new Blob([mtlContent], { type: 'text/plain' })
    
    this.downloadFile(objBlob, filename)
    this.downloadFile(mtlBlob, filename.replace('.obj', '.mtl'))
  }

  // Generate MTL (Material) file for OBJ
  private static generateMTL(meshes: Mesh[]): string {
    let mtlContent = '# Vibelux Material Library\n\n'
    
    const materials = new Set<string>()
    meshes.forEach(mesh => {
      if (mesh.material) materials.add(mesh.material)
    })

    materials.forEach(material => {
      mtlContent += `newmtl ${material}\n`
      
      // Set material properties based on type
      if (material.includes('fixture')) {
        mtlContent += 'Ka 1.000 1.000 1.000\n' // Ambient
        mtlContent += 'Kd 1.000 0.843 0.000\n' // Diffuse (yellow)
        mtlContent += 'Ks 1.000 1.000 1.000\n' // Specular
        mtlContent += 'Ns 200.000\n' // Shininess
        mtlContent += 'illum 2\n' // Illumination model
      } else if (material.includes('wall')) {
        mtlContent += 'Ka 0.200 0.200 0.200\n'
        mtlContent += 'Kd 0.500 0.500 0.500\n'
        mtlContent += 'Ks 0.000 0.000 0.000\n'
        mtlContent += 'Ns 0.000\n'
        mtlContent += 'illum 1\n'
      } else {
        mtlContent += 'Ka 0.200 0.200 0.200\n'
        mtlContent += 'Kd 0.800 0.800 0.800\n'
        mtlContent += 'Ks 0.000 0.000 0.000\n'
        mtlContent += 'Ns 0.000\n'
        mtlContent += 'illum 1\n'
      }
      mtlContent += '\n'
    })

    return mtlContent
  }

  // Create mesh for a box (fixture, obstruction, etc.)
  static createBoxMesh(
    name: string,
    position: Vector3,
    dimensions: { width: number; height: number; depth: number },
    material?: string
  ): Mesh {
    const halfWidth = dimensions.width / 2
    const halfHeight = dimensions.height / 2
    const halfDepth = dimensions.depth / 2

    const vertices: Vector3[] = [
      // Front face
      { x: position.x - halfWidth, y: position.y - halfHeight, z: position.z + halfDepth },
      { x: position.x + halfWidth, y: position.y - halfHeight, z: position.z + halfDepth },
      { x: position.x + halfWidth, y: position.y + halfHeight, z: position.z + halfDepth },
      { x: position.x - halfWidth, y: position.y + halfHeight, z: position.z + halfDepth },
      // Back face
      { x: position.x - halfWidth, y: position.y - halfHeight, z: position.z - halfDepth },
      { x: position.x + halfWidth, y: position.y - halfHeight, z: position.z - halfDepth },
      { x: position.x + halfWidth, y: position.y + halfHeight, z: position.z - halfDepth },
      { x: position.x - halfWidth, y: position.y + halfHeight, z: position.z - halfDepth }
    ]

    const faces = [
      [0, 1, 2, 3], // Front
      [5, 4, 7, 6], // Back
      [4, 0, 3, 7], // Left
      [1, 5, 6, 2], // Right
      [3, 2, 6, 7], // Top
      [4, 5, 1, 0]  // Bottom
    ]

    return { name, vertices, faces, material }
  }

  // Create mesh for room boundaries
  static createRoomMesh(
    dimensions: { width: number; height: number; depth: number }
  ): Mesh[] {
    const meshes: Mesh[] = []

    // Floor
    meshes.push({
      name: 'floor',
      vertices: [
        { x: 0, y: 0, z: 0 },
        { x: dimensions.width, y: 0, z: 0 },
        { x: dimensions.width, y: dimensions.height, z: 0 },
        { x: 0, y: dimensions.height, z: 0 }
      ],
      faces: [[0, 1, 2, 3]],
      material: 'floor'
    })

    // Walls (wireframe representation)
    const wallHeight = dimensions.depth
    const wallPositions = [
      { name: 'wall_north', vertices: [
        { x: 0, y: dimensions.height, z: 0 },
        { x: dimensions.width, y: dimensions.height, z: 0 },
        { x: dimensions.width, y: dimensions.height, z: wallHeight },
        { x: 0, y: dimensions.height, z: wallHeight }
      ]},
      { name: 'wall_south', vertices: [
        { x: 0, y: 0, z: 0 },
        { x: dimensions.width, y: 0, z: 0 },
        { x: dimensions.width, y: 0, z: wallHeight },
        { x: 0, y: 0, z: wallHeight }
      ]},
      { name: 'wall_east', vertices: [
        { x: dimensions.width, y: 0, z: 0 },
        { x: dimensions.width, y: dimensions.height, z: 0 },
        { x: dimensions.width, y: dimensions.height, z: wallHeight },
        { x: dimensions.width, y: 0, z: wallHeight }
      ]},
      { name: 'wall_west', vertices: [
        { x: 0, y: 0, z: 0 },
        { x: 0, y: dimensions.height, z: 0 },
        { x: 0, y: dimensions.height, z: wallHeight },
        { x: 0, y: 0, z: wallHeight }
      ]}
    ]

    wallPositions.forEach(wall => {
      meshes.push({
        name: wall.name,
        vertices: wall.vertices,
        faces: [[0, 1, 2, 3]],
        material: 'wall'
      })
    })

    return meshes
  }

  // Utility functions
  private static crossProduct(a: Vector3, b: Vector3): Vector3 {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    }
  }

  private static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}

// Export lighting design to 3D formats
export function exportLightingDesign3D(
  format: 'stl' | 'obj',
  roomDimensions: { width: number; height: number; depth: number },
  fixtures: Array<{
    id: string
    position: { x: number; y: number; z: number }
    dimensions?: { width: number; height: number; depth: number }
  }>,
  obstructions?: Array<{
    id: string
    name: string
    position: { x: number; y: number; z: number }
    dimensions: { width: number; height: number; depth: number }
  }>
): void {
  const meshes: Mesh[] = []

  // Add room
  const roomMeshes = ThreeDExporter.createRoomMesh(roomDimensions)
  meshes.push(...roomMeshes)

  // Add fixtures
  fixtures.forEach((fixture, index) => {
    const dimensions = fixture.dimensions || { width: 2, height: 0.5, depth: 4 }
    const mesh = ThreeDExporter.createBoxMesh(
      `fixture_${index + 1}`,
      fixture.position,
      dimensions,
      'fixture'
    )
    meshes.push(mesh)
  })

  // Add obstructions
  if (obstructions) {
    obstructions.forEach((obstruction, index) => {
      const mesh = ThreeDExporter.createBoxMesh(
        obstruction.name || `obstruction_${index + 1}`,
        obstruction.position,
        obstruction.dimensions,
        'obstruction'
      )
      meshes.push(mesh)
    })
  }

  // Export based on format
  const timestamp = new Date().toISOString().split('T')[0]
  if (format === 'stl') {
    ThreeDExporter.exportSTL(meshes, `lighting-design-${timestamp}.stl`)
  } else {
    ThreeDExporter.exportOBJ(meshes, `lighting-design-${timestamp}.obj`)
  }
}