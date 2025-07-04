/**
 * GPU-Accelerated Ray Tracer
 * Uses WebGL compute shaders for real-time photometric calculations
 */

export interface GPURayTracerConfig {
  maxBounces: number
  samplesPerPixel: number
  resolution: { width: number; height: number }
  enableSpectral: boolean
  wavelengths?: number[] // For spectral rendering
}

export interface GPUScene {
  fixtures: GPUFixture[]
  surfaces: GPUSurface[]
  room: {
    width: number
    length: number
    height: number
  }
  workingPlane: number // Height of calculation plane
}

export interface GPUFixture {
  position: [number, number, number]
  direction: [number, number, number]
  intensity: number // lumens
  beamAngle: number
  fieldAngle: number
  iesData?: Float32Array // IES photometric data
  spectrum?: Float32Array // Spectral power distribution
}

export interface GPUSurface {
  vertices: Float32Array // Triangle vertices
  normals: Float32Array
  reflectance: number
  specularity: number
  type: 'diffuse' | 'specular' | 'mixed'
}

export class GPURayTracer {
  private gl: WebGL2RenderingContext
  private computeProgram: WebGLProgram | null = null
  private renderProgram: WebGLProgram | null = null
  private framebuffer: WebGLFramebuffer | null = null
  protected config: GPURayTracerConfig
  
  // Buffers
  private sceneBuffer: WebGLBuffer | null = null
  private fixtureBuffer: WebGLBuffer | null = null
  private outputTexture: WebGLTexture | null = null
  
  constructor(canvas: HTMLCanvasElement, config: GPURayTracerConfig) {
    const gl = canvas.getContext('webgl2', {
      preserveDrawingBuffer: true,
      antialias: false
    })
    
    if (!gl) {
      throw new Error('WebGL2 not supported')
    }
    
    this.gl = gl
    this.config = config
    
    // Check for required extensions
    const requiredExtensions = ['EXT_color_buffer_float']
    for (const ext of requiredExtensions) {
      if (!gl.getExtension(ext)) {
        throw new Error(`Required WebGL extension ${ext} not supported`)
      }
    }
    
    this.initialize()
  }
  
  private initialize() {
    this.createShaders()
    this.createBuffers()
    this.createTextures()
  }
  
  private createShaders() {
    // Compute shader for ray tracing
    const computeVertexShader = `#version 300 es
      precision highp float;
      
      in vec2 a_position;
      out vec2 v_texCoord;
      
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `
    
    const computeFragmentShader = `#version 300 es
      precision highp float;
      
      uniform vec3 u_roomDimensions;
      uniform float u_workingPlane;
      uniform int u_numFixtures;
      uniform int u_maxBounces;
      uniform int u_samplesPerPixel;
      uniform float u_time;
      
      // Fixture data (packed)
      uniform sampler2D u_fixtureData;
      
      // Surface data
      uniform sampler2D u_surfaceData;
      
      in vec2 v_texCoord;
      out vec4 fragColor;
      
      // Random number generation
      float random(vec2 st, float seed) {
        return fract(sin(dot(st.xy + seed, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      
      vec3 randomInHemisphere(vec3 normal, vec2 seed) {
        float r1 = random(seed, 0.0);
        float r2 = random(seed, 1.0);
        
        float theta = 2.0 * 3.14159265 * r1;
        float phi = acos(1.0 - 2.0 * r2);
        
        vec3 direction = vec3(
          sin(phi) * cos(theta),
          sin(phi) * sin(theta),
          cos(phi)
        );
        
        // Transform to normal's coordinate system
        vec3 up = abs(normal.y) < 0.999 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
        vec3 tangent = normalize(cross(up, normal));
        vec3 bitangent = cross(normal, tangent);
        
        return tangent * direction.x + bitangent * direction.y + normal * direction.z;
      }
      
      // Get fixture data from texture
      vec4 getFixtureData(int index, int component) {
        float u = (float(index) + 0.5) / float(u_numFixtures);
        float v = (float(component) + 0.5) / 4.0;
        return texture(u_fixtureData, vec2(u, v));
      }
      
      // Ray-sphere intersection for fixtures
      float raySphereIntersect(vec3 rayOrigin, vec3 rayDir, vec3 sphereCenter, float radius) {
        vec3 oc = rayOrigin - sphereCenter;
        float b = dot(oc, rayDir);
        float c = dot(oc, oc) - radius * radius;
        float discriminant = b * b - c;
        
        if (discriminant < 0.0) return -1.0;
        
        float t = -b - sqrt(discriminant);
        return t > 0.0 ? t : -1.0;
      }
      
      // Calculate illuminance from fixture
      float calculateIlluminance(vec3 point, int fixtureIndex) {
        vec4 posData = getFixtureData(fixtureIndex, 0);
        vec4 dirData = getFixtureData(fixtureIndex, 1);
        vec4 paramData = getFixtureData(fixtureIndex, 2);
        
        vec3 fixturePos = posData.xyz;
        vec3 fixtureDir = normalize(dirData.xyz);
        float intensity = paramData.x;
        float beamAngle = paramData.y;
        float fieldAngle = paramData.z;
        
        // Calculate direction from fixture to point
        vec3 toPoint = point - fixturePos;
        float distance = length(toPoint);
        vec3 lightDir = toPoint / distance;
        
        // Angular attenuation based on beam pattern
        float angle = acos(dot(lightDir, fixtureDir));
        float attenuation = 1.0;
        
        if (angle < beamAngle * 0.5) {
          attenuation = 1.0;
        } else if (angle < fieldAngle * 0.5) {
          float t = (angle - beamAngle * 0.5) / (fieldAngle * 0.5 - beamAngle * 0.5);
          attenuation = 1.0 - t * t; // Quadratic falloff
        } else {
          attenuation = 0.0;
        }
        
        // Inverse square law
        float distanceAttenuation = 1.0 / (distance * distance);
        
        // Convert lumens to lux
        return intensity * attenuation * distanceAttenuation / (4.0 * 3.14159265);
      }
      
      // Main ray tracing function
      float traceRay(vec3 origin, vec3 direction, float seed) {
        float totalIlluminance = 0.0;
        vec3 currentOrigin = origin;
        vec3 currentDirection = direction;
        float throughput = 1.0;
        
        for (int bounce = 0; bounce < u_maxBounces; bounce++) {
          // Direct lighting from all fixtures
          for (int i = 0; i < u_numFixtures; i++) {
            totalIlluminance += throughput * calculateIlluminance(currentOrigin, i);
          }
          
          // Russian roulette termination
          if (bounce > 2) {
            float p = max(throughput, 0.01);
            if (random(v_texCoord, seed + float(bounce)) > p) break;
            throughput /= p;
          }
          
          // Find intersection with room surfaces
          float tMin = 1e10;
          vec3 hitNormal = vec3(0.0);
          float hitReflectance = 0.0;
          
          // Check floor
          if (currentDirection.z < 0.0) {
            float t = -currentOrigin.z / currentDirection.z;
            if (t > 0.0 && t < tMin) {
              vec3 hitPoint = currentOrigin + t * currentDirection;
              if (hitPoint.x >= 0.0 && hitPoint.x <= u_roomDimensions.x &&
                  hitPoint.y >= 0.0 && hitPoint.y <= u_roomDimensions.y) {
                tMin = t;
                hitNormal = vec3(0.0, 0.0, 1.0);
                hitReflectance = 0.2; // Floor reflectance
              }
            }
          }
          
          // Check ceiling
          if (currentDirection.z > 0.0) {
            float t = (u_roomDimensions.z - currentOrigin.z) / currentDirection.z;
            if (t > 0.0 && t < tMin) {
              vec3 hitPoint = currentOrigin + t * currentDirection;
              if (hitPoint.x >= 0.0 && hitPoint.x <= u_roomDimensions.x &&
                  hitPoint.y >= 0.0 && hitPoint.y <= u_roomDimensions.y) {
                tMin = t;
                hitNormal = vec3(0.0, 0.0, -1.0);
                hitReflectance = 0.8; // Ceiling reflectance
              }
            }
          }
          
          // Check walls (simplified)
          // ... (similar checks for 4 walls)
          
          if (tMin >= 1e10) break; // No intersection
          
          // Update ray for next bounce
          currentOrigin = currentOrigin + tMin * currentDirection + hitNormal * 0.001;
          currentDirection = randomInHemisphere(hitNormal, v_texCoord + float(bounce));
          throughput *= hitReflectance;
        }
        
        return totalIlluminance;
      }
      
      void main() {
        vec2 coord = v_texCoord * u_roomDimensions.xy;
        vec3 point = vec3(coord.x, coord.y, u_workingPlane);
        
        float illuminance = 0.0;
        
        // Multiple samples for anti-aliasing
        for (int s = 0; s < u_samplesPerPixel; s++) {
          float seed = u_time + float(s);
          vec2 offset = vec2(
            random(v_texCoord, seed) - 0.5,
            random(v_texCoord, seed + 1.0) - 0.5
          ) * 0.01; // Small random offset
          
          vec3 samplePoint = point + vec3(offset, 0.0);
          illuminance += traceRay(samplePoint, vec3(0.0, 0.0, 1.0), seed);
        }
        
        illuminance /= float(u_samplesPerPixel);
        
        // Convert to PPFD (approximate conversion)
        float ppfd = illuminance * 0.0185; // Rough conversion factor
        
        // Encode PPFD value
        fragColor = vec4(ppfd, ppfd, ppfd, 1.0);
      }
    `
    
    // Create and compile shaders
    this.computeProgram = this.createProgram(computeVertexShader, computeFragmentShader)
    
    // Simple rendering shader for display
    const renderVertexShader = `#version 300 es
      in vec2 a_position;
      out vec2 v_texCoord;
      
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `
    
    const renderFragmentShader = `#version 300 es
      precision highp float;
      
      uniform sampler2D u_ppfdTexture;
      uniform float u_minPPFD;
      uniform float u_maxPPFD;
      uniform bool u_showFalseColor;
      
      in vec2 v_texCoord;
      out vec4 fragColor;
      
      vec3 falseColor(float value) {
        // Jet colormap
        float r = clamp(1.5 - abs(4.0 * value - 3.0), 0.0, 1.0);
        float g = clamp(1.5 - abs(4.0 * value - 2.0), 0.0, 1.0);
        float b = clamp(1.5 - abs(4.0 * value - 1.0), 0.0, 1.0);
        return vec3(r, g, b);
      }
      
      void main() {
        float ppfd = texture(u_ppfdTexture, v_texCoord).r;
        float normalized = (ppfd - u_minPPFD) / (u_maxPPFD - u_minPPFD);
        normalized = clamp(normalized, 0.0, 1.0);
        
        if (u_showFalseColor) {
          fragColor = vec4(falseColor(normalized), 1.0);
        } else {
          fragColor = vec4(vec3(normalized), 1.0);
        }
      }
    `
    
    this.renderProgram = this.createProgram(renderVertexShader, renderFragmentShader)
  }
  
  private createProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
    const gl = this.gl
    
    const vertexShader = this.compileShader(vertexSource, gl.VERTEX_SHADER)
    const fragmentShader = this.compileShader(fragmentSource, gl.FRAGMENT_SHADER)
    
    const program = gl.createProgram()
    if (!program) throw new Error('Failed to create program')
    
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program)
      throw new Error(`Program link error: ${info}`)
    }
    
    return program
  }
  
  private compileShader(source: string, type: number): WebGLShader {
    const gl = this.gl
    const shader = gl.createShader(type)
    if (!shader) throw new Error('Failed to create shader')
    
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader)
      throw new Error(`Shader compile error: ${info}`)
    }
    
    return shader
  }
  
  private createBuffers() {
    const gl = this.gl
    
    // Create quad vertices for full-screen rendering
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ])
    
    const vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  }
  
  private createTextures() {
    const gl = this.gl
    const { width, height } = this.config.resolution
    
    // Create output texture for PPFD values
    this.outputTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this.outputTexture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32F,
      width,
      height,
      0,
      gl.RGBA,
      gl.FLOAT,
      null
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    
    // Create framebuffer for off-screen rendering
    this.framebuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.outputTexture,
      0
    )
  }
  
  /**
   * Upload scene data to GPU
   */
  uploadScene(scene: GPUScene) {
    const gl = this.gl
    
    // Pack fixture data into texture
    const fixtureData = new Float32Array(scene.fixtures.length * 16) // 4 vec4s per fixture
    
    scene.fixtures.forEach((fixture, i) => {
      const offset = i * 16
      
      // Position and padding
      fixtureData[offset + 0] = fixture.position[0]
      fixtureData[offset + 1] = fixture.position[1]
      fixtureData[offset + 2] = fixture.position[2]
      fixtureData[offset + 3] = 0
      
      // Direction and padding
      fixtureData[offset + 4] = fixture.direction[0]
      fixtureData[offset + 5] = fixture.direction[1]
      fixtureData[offset + 6] = fixture.direction[2]
      fixtureData[offset + 7] = 0
      
      // Parameters
      fixtureData[offset + 8] = fixture.intensity
      fixtureData[offset + 9] = fixture.beamAngle * Math.PI / 180
      fixtureData[offset + 10] = fixture.fieldAngle * Math.PI / 180
      fixtureData[offset + 11] = 0
      
      // Additional data (reserved)
      fixtureData[offset + 12] = 0
      fixtureData[offset + 13] = 0
      fixtureData[offset + 14] = 0
      fixtureData[offset + 15] = 0
    })
    
    // Create fixture data texture
    const fixtureTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, fixtureTexture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32F,
      scene.fixtures.length,
      4,
      0,
      gl.RGBA,
      gl.FLOAT,
      fixtureData
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    
    this.fixtureBuffer = fixtureTexture
  }
  
  /**
   * Render the scene
   */
  render(showFalseColor: boolean = true): Float32Array {
    const gl = this.gl
    const { width, height } = this.config.resolution
    
    // Bind framebuffer for compute pass
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
    gl.viewport(0, 0, width, height)
    
    // Use compute program
    gl.useProgram(this.computeProgram)
    
    // Set uniforms
    // ... (set all uniforms)
    
    // Render compute pass
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    
    // Read back results
    const pixels = new Float32Array(width * height * 4)
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.FLOAT, pixels)
    
    // Render to screen if needed
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    
    gl.useProgram(this.renderProgram)
    // ... (set render uniforms and draw)
    
    return pixels
  }
  
  /**
   * Get PPFD at specific point
   */
  getPPFDAtPoint(x: number, y: number): number {
    const { width, height } = this.config.resolution
    const pixels = this.render(false)
    
    const pixelX = Math.floor(x * width)
    const pixelY = Math.floor(y * height)
    const index = (pixelY * width + pixelX) * 4
    
    return pixels[index]
  }
  
  /**
   * Calculate statistics
   */
  calculateStatistics(): {
    min: number
    max: number
    average: number
    uniformity: number
  } {
    const pixels = this.render(false)
    const values: number[] = []
    
    for (let i = 0; i < pixels.length; i += 4) {
      values.push(pixels[i])
    }
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    const average = values.reduce((a, b) => a + b) / values.length
    const uniformity = min / average
    
    return { min, max, average, uniformity }
  }
  
  /**
   * Cleanup
   */
  dispose() {
    const gl = this.gl
    
    if (this.computeProgram) gl.deleteProgram(this.computeProgram)
    if (this.renderProgram) gl.deleteProgram(this.renderProgram)
    if (this.outputTexture) gl.deleteTexture(this.outputTexture)
    if (this.framebuffer) gl.deleteFramebuffer(this.framebuffer)
    if (this.fixtureBuffer) gl.deleteTexture(this.fixtureBuffer)
  }
}

/**
 * Spectral GPU Ray Tracer
 * Extended version that handles spectral rendering
 */
export class SpectralGPURayTracer extends GPURayTracer {
  private wavelengths: number[]
  
  constructor(canvas: HTMLCanvasElement, config: GPURayTracerConfig) {
    super(canvas, config)
    this.wavelengths = config.wavelengths || [450, 550, 650] // RGB approximation
  }
  
  /**
   * Render spectral irradiance map
   */
  renderSpectral(): Map<number, Float32Array> {
    const results = new Map<number, Float32Array>()
    
    for (const wavelength of this.wavelengths) {
      // Modify shader uniforms for specific wavelength
      // ... (wavelength-specific rendering)
      const pixels = this.render(false)
      results.set(wavelength, pixels)
    }
    
    return results
  }
  
  /**
   * Calculate PAR from spectral data
   */
  calculatePAR(spectralData: Map<number, Float32Array>): Float32Array {
    const { width, height } = this.config.resolution
    const parData = new Float32Array(width * height)
    
    // PAR wavelength range: 400-700nm
    const parWavelengths = Array.from(spectralData.keys()).filter(
      w => w >= 400 && w <= 700
    )
    
    for (let i = 0; i < parData.length; i++) {
      let totalPAR = 0
      
      for (const wavelength of parWavelengths) {
        const data = spectralData.get(wavelength)!
        const irradiance = data[i * 4] // First channel
        
        // Convert irradiance to photon flux
        const photonEnergy = 1.98644e-25 / (wavelength * 1e-9) // J per photon
        const photonFlux = irradiance / photonEnergy
        
        totalPAR += photonFlux
      }
      
      parData[i] = totalPAR * 1e-6 // Convert to µmol
    }
    
    return parData
  }
}