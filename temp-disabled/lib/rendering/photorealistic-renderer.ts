import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

// Advanced lighting calculation shaders
const advancedLightingVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vTangent;
  varying vec3 vBitangent;
  
  attribute vec3 tangent;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vUv = uv;
    
    vec3 objectTangent = normalize(normalMatrix * tangent);
    vTangent = objectTangent;
    vBitangent = normalize(cross(vNormal, objectTangent));
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const advancedLightingFragmentShader = `
  uniform vec3 lightColor;
  uniform float lightIntensity;
  uniform vec3 lightPosition;
  uniform float lightPPF;
  uniform float lightBeamAngle;
  uniform sampler2D normalMap;
  uniform sampler2D roughnessMap;
  uniform sampler2D metallicMap;
  uniform vec3 baseColor;
  uniform float roughness;
  uniform float metallic;
  uniform vec3 ambientLight;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vTangent;
  varying vec3 vBitangent;
  
  // Physically based rendering functions
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
  
  // Photometric light calculation
  float calculatePPFD(vec3 lightDir, float distance, float beamAngle) {
    float cosAngle = dot(normalize(lightDir), vec3(0.0, -1.0, 0.0));
    float halfBeam = beamAngle * 0.5 * PI / 180.0;
    float angleAttenuation = smoothstep(cos(halfBeam * 1.2), cos(halfBeam), cosAngle);
    
    // Inverse square law with PPF
    float ppfd = lightPPF * angleAttenuation / (distance * distance);
    return ppfd;
  }
  
  void main() {
    // Normal mapping
    vec3 normal = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
    mat3 TBN = mat3(vTangent, vBitangent, vNormal);
    vec3 N = normalize(TBN * normal);
    
    // Material properties
    vec3 albedo = baseColor;
    float metalness = metallic * texture2D(metallicMap, vUv).r;
    float roughnessValue = roughness * texture2D(roughnessMap, vUv).r;
    
    // Lighting calculation
    vec3 L = normalize(lightPosition - vPosition);
    vec3 V = normalize(-vPosition);
    vec3 H = normalize(V + L);
    float distance = length(lightPosition - vPosition);
    
    // PPFD contribution
    float ppfd = calculatePPFD(L, distance, lightBeamAngle);
    
    // PBR calculations
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metalness);
    
    vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
    float NDF = distributionGGX(N, H, roughnessValue);
    float G = geometrySmith(N, V, L, roughnessValue);
    
    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
    vec3 specular = numerator / denominator;
    
    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= 1.0 - metalness;
    
    float NdotL = max(dot(N, L), 0.0);
    vec3 Lo = (kD * albedo / PI + specular) * lightColor * lightIntensity * NdotL;
    
    // Add photometric influence
    Lo *= (1.0 + ppfd * 0.001);
    
    // Ambient lighting
    vec3 ambient = ambientLight * albedo;
    
    vec3 color = ambient + Lo;
    
    // Tone mapping
    color = color / (color + vec3(1.0));
    color = pow(color, vec3(1.0/2.2));
    
    gl_FragColor = vec4(color, 1.0);
  }
`

export interface RenderingConfig {
  quality: 'low' | 'medium' | 'high' | 'ultra'
  enablePathTracing?: boolean
  enableSSAO?: boolean
  enableBloom?: boolean
  enableTAA?: boolean
  shadowMapSize?: number
  samplesPerFrame?: number
}

export class PhotorealisticRenderer {
  private renderer: THREE.WebGLRenderer
  private composer?: EffectComposer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private config: RenderingConfig
  
  constructor(canvas: HTMLCanvasElement, config: RenderingConfig = { quality: 'high' }) {
    this.config = config
    
    // Initialize renderer with advanced settings
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: config.quality !== 'low',
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    })
    
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(canvas.width, canvas.height)
    
    // Enable advanced features
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = config.quality === 'ultra' 
      ? THREE.PCFSoftShadowMap 
      : THREE.PCFShadowMap
    
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    
    // Scene setup
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2(0x111111, 0.002)
    
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      45,
      canvas.width / canvas.height,
      0.1,
      1000
    )
    
    this.setupPostProcessing()
  }
  
  private setupPostProcessing(): void {
    if (this.config.quality === 'low') return
    
    this.composer = new EffectComposer(this.renderer)
    
    // Main render pass
    if (this.config.enableTAA) {
      const taaRenderPass = new TAARenderPass(this.scene, this.camera)
      taaRenderPass.sampleLevel = this.config.quality === 'ultra' ? 4 : 2
      this.composer.addPass(taaRenderPass)
    } else {
      const renderPass = new RenderPass(this.scene, this.camera)
      this.composer.addPass(renderPass)
    }
    
    // SSAO for ambient occlusion
    if (this.config.enableSSAO) {
      const ssaoPass = new SSAOPass(
        this.scene, 
        this.camera, 
        this.renderer.domElement.width, 
        this.renderer.domElement.height
      )
      ssaoPass.kernelRadius = 0.2
      ssaoPass.minDistance = 0.001
      ssaoPass.maxDistance = 0.1
      this.composer.addPass(ssaoPass)
    }
    
    // Bloom for light glow
    if (this.config.enableBloom) {
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(
          this.renderer.domElement.width,
          this.renderer.domElement.height
        ),
        0.5, // strength
        0.4, // radius
        0.85 // threshold
      )
      this.composer.addPass(bloomPass)
    }
    
    // SMAA for antialiasing
    if (this.config.quality === 'high' || this.config.quality === 'ultra') {
      const smaaPass = new SMAAPass()
      this.composer.addPass(smaaPass)
    } else if (this.config.quality === 'medium') {
      // FXAA for medium quality
      const fxaaPass = new ShaderPass(FXAAShader)
      fxaaPass.uniforms['resolution'].value.set(
        1 / this.renderer.domElement.width,
        1 / this.renderer.domElement.height
      )
      this.composer.addPass(fxaaPass)
    }
  }
  
  public createAdvancedMaterial(params: {
    baseColor: THREE.Color
    roughness?: number
    metalness?: number
    normalMap?: THREE.Texture
    roughnessMap?: THREE.Texture
    metallicMap?: THREE.Texture
  }): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      vertexShader: advancedLightingVertexShader,
      fragmentShader: advancedLightingFragmentShader,
      uniforms: {
        baseColor: { value: params.baseColor },
        roughness: { value: params.roughness || 0.5 },
        metallic: { value: params.metalness || 0.0 },
        normalMap: { value: params.normalMap || new THREE.Texture() },
        roughnessMap: { value: params.roughnessMap || new THREE.Texture() },
        metallicMap: { value: params.metallicMap || new THREE.Texture() },
        ambientLight: { value: new THREE.Color(0x404040) },
        lightColor: { value: new THREE.Color(0xffffff) },
        lightIntensity: { value: 1.0 },
        lightPosition: { value: new THREE.Vector3(0, 10, 0) },
        lightPPF: { value: 1000 },
        lightBeamAngle: { value: 120 }
      }
    })
  }
  
  public createPhotometricLight(params: {
    position: THREE.Vector3
    ppf: number
    spectrum: string
    beamAngle: number
    wattage: number
  }): THREE.Group {
    const lightGroup = new THREE.Group()
    
    // Main light source
    const light = new THREE.SpotLight(0xffffff, params.wattage)
    light.position.copy(params.position)
    light.angle = params.beamAngle * Math.PI / 180
    light.penumbra = 0.2
    light.decay = 2
    light.distance = 50
    light.castShadow = true
    
    // Shadow configuration
    light.shadow.mapSize.width = this.config.shadowMapSize || 2048
    light.shadow.mapSize.height = this.config.shadowMapSize || 2048
    light.shadow.camera.near = 0.5
    light.shadow.camera.far = 50
    light.shadow.bias = -0.0005
    
    lightGroup.add(light)
    
    // Volumetric light cone (optional)
    if (this.config.quality === 'high' || this.config.quality === 'ultra') {
      const coneGeometry = new THREE.ConeGeometry(
        Math.tan(params.beamAngle * Math.PI / 360) * 10,
        10,
        32,
        1,
        true
      )
      const volumetricMaterial = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        vertexShader: `
          varying vec3 vPosition;
          void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vPosition;
          uniform float intensity;
          void main() {
            float falloff = 1.0 - (length(vPosition.xz) / 10.0);
            float alpha = falloff * intensity * 0.05;
            gl_FragColor = vec4(1.0, 0.95, 0.8, alpha);
          }
        `,
        uniforms: {
          intensity: { value: params.ppf / 1000 }
        },
        blending: THREE.AdditiveBlending
      })
      
      const cone = new THREE.Mesh(coneGeometry, volumetricMaterial)
      cone.position.copy(params.position)
      cone.rotation.x = Math.PI
      lightGroup.add(cone)
    }
    
    return lightGroup
  }
  
  public render(): void {
    if (this.composer) {
      this.composer.render()
    } else {
      this.renderer.render(this.scene, this.camera)
    }
  }
  
  public dispose(): void {
    this.renderer.dispose()
    this.composer?.passes.forEach(pass => {
      if ('dispose' in pass) {
        (pass as any).dispose()
      }
    })
  }
}