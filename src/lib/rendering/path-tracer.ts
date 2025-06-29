import * as THREE from 'three'

// WebGL2 compute shader for progressive path tracing
const pathTracingComputeShader = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

// Uniforms
uniform mat4 cameraWorldMatrix;
uniform mat4 cameraProjectionMatrixInverse;
uniform vec2 resolution;
uniform float time;
uniform int frameCount;
uniform int bounces;
uniform sampler2D previousFrame;
uniform sampler2D blueNoise;

// Scene data textures
uniform sampler2D sceneData;
uniform sampler2D materialData;
uniform sampler2D lightData;

// Output
out vec4 fragColor;

// Constants
const float PI = 3.14159265359;
const float EPSILON = 0.0001;
const int MAX_BOUNCES = 8;

// Random number generation
uint hash(uint x) {
  x += (x << 10u);
  x ^= (x >> 6u);
  x += (x << 3u);
  x ^= (x >> 11u);
  x += (x << 15u);
  return x;
}

float random(inout uint seed) {
  seed = hash(seed);
  return float(seed) / 4294967295.0;
}

vec3 randomDirection(inout uint seed) {
  float theta = random(seed) * 2.0 * PI;
  float phi = acos(2.0 * random(seed) - 1.0);
  return vec3(sin(phi) * cos(theta), sin(phi) * sin(theta), cos(phi));
}

// Ray structure
struct Ray {
  vec3 origin;
  vec3 direction;
};

// Hit information
struct HitInfo {
  bool hit;
  float distance;
  vec3 position;
  vec3 normal;
  vec2 uv;
  int materialId;
  int objectId;
};

// Material structure
struct Material {
  vec3 albedo;
  float roughness;
  float metalness;
  vec3 emission;
  float transmission;
  float ior;
};

// Light structure
struct Light {
  vec3 position;
  vec3 color;
  float intensity;
  float radius;
  int type; // 0: point, 1: spot, 2: area
};

// BRDF functions
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

float distributionGGX(vec3 N, vec3 H, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float NdotH = max(dot(N, H), 0.0);
  float NdotH2 = NdotH * NdotH;
  
  float num = a2;
  float denom = (NdotH2 * (a2 - 1.0) + 1.0);
  denom = PI * denom * denom;
  
  return num / denom;
}

float geometrySchlickGGX(float NdotV, float roughness) {
  float r = (roughness + 1.0);
  float k = (r * r) / 8.0;
  
  float num = NdotV;
  float denom = NdotV * (1.0 - k) + k;
  
  return num / denom;
}

float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
  float NdotV = max(dot(N, V), 0.0);
  float NdotL = max(dot(N, L), 0.0);
  float ggx2 = geometrySchlickGGX(NdotV, roughness);
  float ggx1 = geometrySchlickGGX(NdotL, roughness);
  
  return ggx1 * ggx2;
}

// Importance sampling
vec3 importanceSampleGGX(vec2 Xi, vec3 N, float roughness) {
  float a = roughness * roughness;
  
  float phi = 2.0 * PI * Xi.x;
  float cosTheta = sqrt((1.0 - Xi.y) / (1.0 + (a*a - 1.0) * Xi.y));
  float sinTheta = sqrt(1.0 - cosTheta*cosTheta);
  
  vec3 H;
  H.x = cos(phi) * sinTheta;
  H.y = sin(phi) * sinTheta;
  H.z = cosTheta;
  
  vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
  vec3 tangent = normalize(cross(up, N));
  vec3 bitangent = cross(N, tangent);
  
  vec3 sampleVec = tangent * H.x + bitangent * H.y + N * H.z;
  return normalize(sampleVec);
}

// Scene intersection (simplified - would be replaced with BVH traversal)
HitInfo intersectScene(Ray ray) {
  HitInfo hit;
  hit.hit = false;
  hit.distance = 1e10;
  
  // TODO: Implement BVH traversal for actual scene geometry
  // This is a placeholder for the actual intersection logic
  
  return hit;
}

// Path tracing kernel
vec3 pathTrace(Ray ray, inout uint seed) {
  vec3 color = vec3(0.0);
  vec3 throughput = vec3(1.0);
  
  for (int bounce = 0; bounce < MAX_BOUNCES; bounce++) {
    HitInfo hit = intersectScene(ray);
    
    if (!hit.hit) {
      // Environment lighting
      color += throughput * vec3(0.1, 0.15, 0.3); // Sky color
      break;
    }
    
    // Load material properties
    Material mat;
    // TODO: Load from material texture based on hit.materialId
    mat.albedo = vec3(0.8);
    mat.roughness = 0.5;
    mat.metalness = 0.0;
    mat.emission = vec3(0.0);
    mat.transmission = 0.0;
    mat.ior = 1.5;
    
    // Add emission
    color += throughput * mat.emission;
    
    // Russian roulette
    if (bounce > 3) {
      float p = max(throughput.x, max(throughput.y, throughput.z));
      if (random(seed) > p) {
        break;
      }
      throughput /= p;
    }
    
    // Sample BRDF
    vec3 V = -ray.direction;
    vec3 N = hit.normal;
    
    if (mat.transmission > 0.0 && random(seed) < mat.transmission) {
      // Handle transmission
      float eta = dot(V, N) > 0.0 ? (1.0 / mat.ior) : mat.ior;
      vec3 refracted = refract(-V, N, eta);
      
      if (length(refracted) > 0.0) {
        ray.origin = hit.position + refracted * EPSILON;
        ray.direction = refracted;
      } else {
        // Total internal reflection
        ray.origin = hit.position + reflect(-V, N) * EPSILON;
        ray.direction = reflect(-V, N);
      }
    } else {
      // Sample microfacet BRDF
      vec2 Xi = vec2(random(seed), random(seed));
      vec3 H = importanceSampleGGX(Xi, N, mat.roughness);
      vec3 L = normalize(reflect(-V, H));
      
      float NdotL = max(dot(N, L), 0.0);
      if (NdotL > 0.0) {
        // Evaluate BRDF
        vec3 F0 = mix(vec3(0.04), mat.albedo, mat.metalness);
        vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
        
        float NDF = distributionGGX(N, H, mat.roughness);
        float G = geometrySmith(N, V, L, mat.roughness);
        
        vec3 numerator = NDF * G * F;
        float denominator = 4.0 * max(dot(N, V), 0.0) * NdotL + 0.0001;
        vec3 specular = numerator / denominator;
        
        vec3 kS = F;
        vec3 kD = vec3(1.0) - kS;
        kD *= 1.0 - mat.metalness;
        
        throughput *= (kD * mat.albedo / PI + specular) * NdotL;
        
        ray.origin = hit.position + L * EPSILON;
        ray.direction = L;
      } else {
        break;
      }
    }
  }
  
  return color;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  
  // Initialize random seed
  uint seed = uint(gl_FragCoord.x + gl_FragCoord.y * resolution.x) + uint(frameCount) * 719393u;
  
  // Jittered sampling
  vec2 jitter = vec2(random(seed), random(seed)) - 0.5;
  vec2 ndc = ((gl_FragCoord.xy + jitter) / resolution) * 2.0 - 1.0;
  
  // Generate camera ray
  vec4 clipSpace = vec4(ndc, -1.0, 1.0);
  vec4 viewSpace = cameraProjectionMatrixInverse * clipSpace;
  viewSpace = vec4(viewSpace.xy, -1.0, 0.0);
  vec3 worldDir = normalize((cameraWorldMatrix * viewSpace).xyz);
  vec3 worldOrigin = cameraWorldMatrix[3].xyz;
  
  Ray ray;
  ray.origin = worldOrigin;
  ray.direction = worldDir;
  
  // Trace path
  vec3 color = pathTrace(ray, seed);
  
  // Accumulate with previous frames
  vec3 previousColor = texture(previousFrame, uv).rgb;
  float weight = 1.0 / float(frameCount + 1);
  color = mix(previousColor, color, weight);
  
  // Tone mapping
  color = color / (color + vec3(1.0));
  color = pow(color, vec3(1.0/2.2));
  
  fragColor = vec4(color, 1.0);
}
`;

export interface PathTracerConfig {
  resolution: { width: number; height: number }
  maxBounces: number
  samplesPerPixel: number
  enableDenoising: boolean
}

export class PathTracer {
  private gl: WebGL2RenderingContext
  private program!: WebGLProgram
  private frameCount: number = 0
  private previousFrameTexture!: WebGLTexture
  private currentFrameTexture!: WebGLTexture
  private framebuffer!: WebGLFramebuffer
  private config: PathTracerConfig
  
  constructor(canvas: HTMLCanvasElement, config: PathTracerConfig) {
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      depth: false,
      stencil: false,
      alpha: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true
    })
    
    if (!gl) {
      throw new Error('WebGL2 not supported')
    }
    
    this.gl = gl
    this.config = config
    
    // Initialize shaders and resources
    this.initializeShaders()
    this.initializeTextures()
    this.initializeFramebuffer()
  }
  
  private initializeShaders(): void {
    const vertexShader = `#version 300 es
      in vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `
    
    const vs = this.compileShader(vertexShader, this.gl.VERTEX_SHADER)
    const fs = this.compileShader(pathTracingComputeShader, this.gl.FRAGMENT_SHADER)
    
    this.program = this.gl.createProgram()!
    this.gl.attachShader(this.program, vs)
    this.gl.attachShader(this.program, fs)
    this.gl.linkProgram(this.program)
    
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      throw new Error('Failed to link shader program')
    }
    
    // Create fullscreen quad
    const vertices = new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1, 1,   1, -1,   1, 1
    ])
    
    const vbo = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW)
    
    const positionLoc = this.gl.getAttribLocation(this.program, 'position')
    this.gl.enableVertexAttribArray(positionLoc)
    this.gl.vertexAttribPointer(positionLoc, 2, this.gl.FLOAT, false, 0, 0)
  }
  
  private compileShader(source: string, type: number): WebGLShader {
    const shader = this.gl.createShader(type)!
    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader)
      throw new Error(`Shader compilation failed: ${info}`)
    }
    
    return shader
  }
  
  private initializeTextures(): void {
    const { width, height } = this.config.resolution
    
    // Previous frame texture
    this.previousFrameTexture = this.gl.createTexture()!
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.previousFrameTexture)
    this.gl.texImage2D(
      this.gl.TEXTURE_2D, 0, this.gl.RGBA32F,
      width, height, 0, this.gl.RGBA, this.gl.FLOAT, null
    )
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
    
    // Current frame texture
    this.currentFrameTexture = this.gl.createTexture()!
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.currentFrameTexture)
    this.gl.texImage2D(
      this.gl.TEXTURE_2D, 0, this.gl.RGBA32F,
      width, height, 0, this.gl.RGBA, this.gl.FLOAT, null
    )
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
  }
  
  private initializeFramebuffer(): void {
    this.framebuffer = this.gl.createFramebuffer()!
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer)
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D, this.currentFrameTexture, 0
    )
  }
  
  public render(scene: {
    camera: THREE.Camera
    objects: THREE.Object3D[]
    lights: THREE.Light[]
  }): void {
    this.gl.useProgram(this.program)
    
    // Update uniforms
    const cameraWorldMatrix = scene.camera.matrixWorld.toArray()
    const cameraProjectionMatrixInverse = scene.camera.projectionMatrixInverse.toArray()
    
    this.gl.uniformMatrix4fv(
      this.gl.getUniformLocation(this.program, 'cameraWorldMatrix'),
      false, cameraWorldMatrix
    )
    this.gl.uniformMatrix4fv(
      this.gl.getUniformLocation(this.program, 'cameraProjectionMatrixInverse'),
      false, cameraProjectionMatrixInverse
    )
    this.gl.uniform2f(
      this.gl.getUniformLocation(this.program, 'resolution'),
      this.config.resolution.width, this.config.resolution.height
    )
    this.gl.uniform1f(
      this.gl.getUniformLocation(this.program, 'time'),
      performance.now() / 1000
    )
    this.gl.uniform1i(
      this.gl.getUniformLocation(this.program, 'frameCount'),
      this.frameCount
    )
    this.gl.uniform1i(
      this.gl.getUniformLocation(this.program, 'bounces'),
      this.config.maxBounces
    )
    
    // Bind textures
    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.previousFrameTexture)
    this.gl.uniform1i(this.gl.getUniformLocation(this.program, 'previousFrame'), 0)
    
    // Render to current frame
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer)
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D, this.currentFrameTexture, 0
    )
    this.gl.viewport(0, 0, this.config.resolution.width, this.config.resolution.height)
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6)
    
    // Copy to screen
    this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, this.framebuffer)
    this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, null)
    this.gl.blitFramebuffer(
      0, 0, this.config.resolution.width, this.config.resolution.height,
      0, 0, this.config.resolution.width, this.config.resolution.height,
      this.gl.COLOR_BUFFER_BIT, this.gl.LINEAR
    )
    
    // Swap textures
    const temp = this.previousFrameTexture
    this.previousFrameTexture = this.currentFrameTexture
    this.currentFrameTexture = temp
    
    this.frameCount++
  }
  
  public reset(): void {
    this.frameCount = 0
    
    // Clear textures
    const { width, height } = this.config.resolution
    const clearData = new Float32Array(width * height * 4)
    
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.previousFrameTexture)
    this.gl.texImage2D(
      this.gl.TEXTURE_2D, 0, this.gl.RGBA32F,
      width, height, 0, this.gl.RGBA, this.gl.FLOAT, clearData
    )
    
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.currentFrameTexture)
    this.gl.texImage2D(
      this.gl.TEXTURE_2D, 0, this.gl.RGBA32F,
      width, height, 0, this.gl.RGBA, this.gl.FLOAT, clearData
    )
  }
  
  public dispose(): void {
    this.gl.deleteProgram(this.program)
    this.gl.deleteTexture(this.previousFrameTexture)
    this.gl.deleteTexture(this.currentFrameTexture)
    this.gl.deleteFramebuffer(this.framebuffer)
  }
}