"use client"

import { useRef, useEffect, useState, useMemo } from 'react'
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move3D,
  Eye,
  Settings,
  Download,
  Layers,
  Maximize2,
  Grid3X3,
  Sun
} from 'lucide-react'

interface PPFDDataPoint {
  x: number
  y: number
  z: number
  ppfd: number
  uniformity: number
}

interface Fixture3D {
  id: string
  x: number
  y: number
  z: number // height
  ppf: number
  beamAngle: number
  enabled: boolean
  color: string
}

interface ThreeDPPFDViewerProps {
  ppfdData: PPFDDataPoint[]
  fixtures: Fixture3D[]
  roomDimensions: { width: number; height: number; depth: number }
  layers?: Array<{ height: number; visible: boolean; color: string }>
  onFixtureSelect?: (fixtureId: string) => void
  className?: string
}

interface ViewMode {
  id: string
  name: string
  description: string
}

const VIEW_MODES: ViewMode[] = [
  { id: 'heatmap', name: 'PPFD Heatmap', description: 'Color-coded light intensity' },
  { id: 'uniformity', name: 'Uniformity', description: 'Light distribution uniformity' },
  { id: 'isosurface', name: 'Isosurfaces', description: 'Equal PPFD contours' },
  { id: 'volume', name: 'Volume Render', description: '3D light volume visualization' }
]

export default function ThreeDPPFDViewer({
  ppfdData,
  fixtures,
  roomDimensions,
  layers = [],
  onFixtureSelect,
  className = ''
}: ThreeDPPFDViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const controlsRef = useRef<any>(null)
  
  const [viewMode, setViewMode] = useState('heatmap')
  const [showGrid, setShowGrid] = useState(true)
  const [showFixtures, setShowFixtures] = useState(true)
  const [showLayers, setShowLayers] = useState(true)
  const [intensity, setIntensity] = useState(1.0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null)

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current || isLoaded) return

    const initThreeJS = async () => {
      // Dynamic import Three.js to avoid SSR issues
      const THREE = await import('three')
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

      const width = mountRef.current!.clientWidth
      const height = mountRef.current!.clientHeight

      // Scene
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x0f0f23)
      sceneRef.current = scene

      // Camera
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
      camera.position.set(
        roomDimensions.width * 1.5,
        roomDimensions.depth * 1.5,
        roomDimensions.height * 1.5
      )
      cameraRef.current = camera

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(width, height)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      rendererRef.current = renderer
      mountRef.current!.appendChild(renderer.domElement)

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controlsRef.current = controls

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(50, 50, 50)
      directionalLight.castShadow = true
      scene.add(directionalLight)

      setIsLoaded(true)
    }

    initThreeJS()

    return () => {
      if (rendererRef.current && mountRef.current?.contains(rendererRef.current.domElement)) {
        mountRef.current.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
    }
  }, [roomDimensions])

  // Create room geometry
  useEffect(() => {
    if (!isLoaded || !sceneRef.current) return

    const createRoom = async () => {
      const THREE = await import('three')
      const scene = sceneRef.current

      // Remove existing room
      const existingRoom = scene.getObjectByName('room')
      if (existingRoom) scene.remove(existingRoom)

      const roomGroup = new THREE.Group()
      roomGroup.name = 'room'

      // Floor
      const floorGeometry = new THREE.PlaneGeometry(roomDimensions.width, roomDimensions.height)
      const floorMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x1a1a2e,
        transparent: true,
        opacity: 0.7
      })
      const floor = new THREE.Mesh(floorGeometry, floorMaterial)
      floor.rotation.x = -Math.PI / 2
      floor.receiveShadow = true
      roomGroup.add(floor)

      // Walls (wireframe)
      const wallMaterial = new THREE.LineBasicMaterial({ color: 0x444444 })
      
      // Create wall edges
      const edges = [
        // Floor edges
        [[0, 0, 0], [roomDimensions.width, 0, 0]],
        [[roomDimensions.width, 0, 0], [roomDimensions.width, 0, roomDimensions.height]],
        [[roomDimensions.width, 0, roomDimensions.height], [0, 0, roomDimensions.height]],
        [[0, 0, roomDimensions.height], [0, 0, 0]],
        // Ceiling edges
        [[0, roomDimensions.depth, 0], [roomDimensions.width, roomDimensions.depth, 0]],
        [[roomDimensions.width, roomDimensions.depth, 0], [roomDimensions.width, roomDimensions.depth, roomDimensions.height]],
        [[roomDimensions.width, roomDimensions.depth, roomDimensions.height], [0, roomDimensions.depth, roomDimensions.height]],
        [[0, roomDimensions.depth, roomDimensions.height], [0, roomDimensions.depth, 0]],
        // Vertical edges
        [[0, 0, 0], [0, roomDimensions.depth, 0]],
        [[roomDimensions.width, 0, 0], [roomDimensions.width, roomDimensions.depth, 0]],
        [[roomDimensions.width, 0, roomDimensions.height], [roomDimensions.width, roomDimensions.depth, roomDimensions.height]],
        [[0, 0, roomDimensions.height], [0, roomDimensions.depth, roomDimensions.height]]
      ]

      edges.forEach(([start, end]) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...start),
          new THREE.Vector3(...end)
        ])
        const line = new THREE.Line(geometry, wallMaterial)
        roomGroup.add(line)
      })

      // Grid
      if (showGrid) {
        const gridHelper = new THREE.GridHelper(
          Math.max(roomDimensions.width, roomDimensions.height),
          10,
          0x444444,
          0x222222
        )
        gridHelper.position.y = 0.01
        roomGroup.add(gridHelper)
      }

      scene.add(roomGroup)
    }

    createRoom()
  }, [isLoaded, roomDimensions, showGrid])

  // Create PPFD heatmap
  useEffect(() => {
    if (!isLoaded || !sceneRef.current || ppfdData.length === 0) return

    const createHeatmap = async () => {
      const THREE = await import('three')
      const scene = sceneRef.current

      // Remove existing heatmap
      const existingHeatmap = scene.getObjectByName('heatmap')
      if (existingHeatmap) scene.remove(existingHeatmap)

      if (viewMode !== 'heatmap') return

      const heatmapGroup = new THREE.Group()
      heatmapGroup.name = 'heatmap'

      // Find PPFD range for color mapping
      const ppfdValues = ppfdData.map(d => d.ppfd)
      const minPPFD = Math.min(...ppfdValues)
      const maxPPFD = Math.max(...ppfdValues)

      // Create color gradient (blue -> green -> yellow -> red)
      const getColor = (ppfd: number) => {
        const normalized = (ppfd - minPPFD) / (maxPPFD - minPPFD)
        if (normalized < 0.25) {
          // Blue to cyan
          const factor = normalized / 0.25
          return new THREE.Color(0, 0, 1 - factor * 0.5).lerp(new THREE.Color(0, 1, 1), factor)
        } else if (normalized < 0.5) {
          // Cyan to green
          const factor = (normalized - 0.25) / 0.25
          return new THREE.Color(0, 1, 1).lerp(new THREE.Color(0, 1, 0), factor)
        } else if (normalized < 0.75) {
          // Green to yellow
          const factor = (normalized - 0.5) / 0.25
          return new THREE.Color(0, 1, 0).lerp(new THREE.Color(1, 1, 0), factor)
        } else {
          // Yellow to red
          const factor = (normalized - 0.75) / 0.25
          return new THREE.Color(1, 1, 0).lerp(new THREE.Color(1, 0, 0), factor)
        }
      }

      // Create point cloud
      ppfdData.forEach(point => {
        const geometry = new THREE.SphereGeometry(0.1, 8, 6)
        const material = new THREE.MeshBasicMaterial({ 
          color: getColor(point.ppfd),
          transparent: true,
          opacity: 0.8 * intensity
        })
        const sphere = new THREE.Mesh(geometry, material)
        sphere.position.set(point.x, point.z, point.y) // Note: z is height
        heatmapGroup.add(sphere)
      })

      scene.add(heatmapGroup)
    }

    createHeatmap()
  }, [isLoaded, ppfdData, viewMode, intensity])

  // Create fixtures
  useEffect(() => {
    if (!isLoaded || !sceneRef.current || !showFixtures) return

    const createFixtures = async () => {
      const THREE = await import('three')
      const scene = sceneRef.current

      // Remove existing fixtures
      const existingFixtures = scene.getObjectByName('fixtures')
      if (existingFixtures) scene.remove(existingFixtures)

      const fixturesGroup = new THREE.Group()
      fixturesGroup.name = 'fixtures'

      fixtures.forEach(fixture => {
        // Fixture body
        const geometry = new THREE.BoxGeometry(0.6, 0.1, 0.4)
        const material = new THREE.MeshLambertMaterial({ 
          color: fixture.enabled ? fixture.color : 0x666666,
          transparent: true,
          opacity: fixture.enabled ? 1.0 : 0.5
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(fixture.x, fixture.z, fixture.y)
        mesh.userData = { fixtureId: fixture.id }
        mesh.castShadow = true

        // Selection indicator
        if (selectedFixture === fixture.id) {
          const outlineGeometry = new THREE.BoxGeometry(0.7, 0.15, 0.5)
          const outlineMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            wireframe: true
          })
          const outline = new THREE.Mesh(outlineGeometry, outlineMaterial)
          outline.position.copy(mesh.position)
          fixturesGroup.add(outline)
        }

        // Light cone (if enabled)
        if (fixture.enabled) {
          const coneGeometry = new THREE.ConeGeometry(
            Math.tan((fixture.beamAngle * Math.PI) / 360) * fixture.z,
            fixture.z,
            8,
            1,
            true
          )
          const coneMaterial = new THREE.MeshBasicMaterial({ 
            color: fixture.color,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
          })
          const cone = new THREE.Mesh(coneGeometry, coneMaterial)
          cone.position.set(fixture.x, fixture.z / 2, fixture.y)
          cone.rotation.x = Math.PI
          fixturesGroup.add(cone)
        }

        fixturesGroup.add(mesh)
      })

      scene.add(fixturesGroup)
    }

    createFixtures()
  }, [isLoaded, fixtures, showFixtures, selectedFixture])

  // Create layers
  useEffect(() => {
    if (!isLoaded || !sceneRef.current || !showLayers) return

    const createLayers = async () => {
      const THREE = await import('three')
      const scene = sceneRef.current

      // Remove existing layers
      const existingLayers = scene.getObjectByName('layers')
      if (existingLayers) scene.remove(existingLayers)

      const layersGroup = new THREE.Group()
      layersGroup.name = 'layers'

      layers.forEach(layer => {
        if (!layer.visible) return

        const geometry = new THREE.PlaneGeometry(roomDimensions.width, roomDimensions.height)
        const material = new THREE.MeshBasicMaterial({ 
          color: layer.color,
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide
        })
        const plane = new THREE.Mesh(geometry, material)
        plane.position.set(
          roomDimensions.width / 2,
          layer.height,
          roomDimensions.height / 2
        )
        plane.rotation.x = -Math.PI / 2
        layersGroup.add(plane)
      })

      scene.add(layersGroup)
    }

    createLayers()
  }, [isLoaded, layers, showLayers, roomDimensions])

  // Handle clicks
  useEffect(() => {
    if (!isLoaded || !rendererRef.current) return

    const handleClick = async (event: MouseEvent) => {
      const THREE = await import('three')
      
      const rect = rendererRef.current.domElement.getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      )

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, cameraRef.current)

      const fixturesGroup = sceneRef.current.getObjectByName('fixtures')
      if (fixturesGroup) {
        const intersects = raycaster.intersectObjects(fixturesGroup.children, true)
        if (intersects.length > 0) {
          const fixtureId = intersects[0].object.userData.fixtureId
          if (fixtureId) {
            setSelectedFixture(fixtureId)
            onFixtureSelect?.(fixtureId)
          }
        }
      }
    }

    rendererRef.current.domElement.addEventListener('click', handleClick)
    return () => {
      if (rendererRef.current?.domElement) {
        rendererRef.current.domElement.removeEventListener('click', handleClick)
      }
    }
  }, [isLoaded, onFixtureSelect])

  // Animation loop
  useEffect(() => {
    if (!isLoaded) return

    let animationId: number

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      
      if (controlsRef.current) {
        controlsRef.current.update()
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }

    animate()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isLoaded])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return

      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight

      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(
        roomDimensions.width * 1.5,
        roomDimensions.depth * 1.5,
        roomDimensions.height * 1.5
      )
      controlsRef.current.target.set(
        roomDimensions.width / 2,
        0,
        roomDimensions.height / 2
      )
      controlsRef.current.update()
    }
  }

  const exportImage = () => {
    if (rendererRef.current) {
      const link = document.createElement('a')
      link.download = '3d-ppfd-visualization.png'
      link.href = rendererRef.current.domElement.toDataURL()
      link.click()
    }
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <Move3D className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">3D PPFD Visualization</h3>
              <p className="text-sm text-gray-400">Interactive 3D light distribution analysis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={resetCamera}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-all"
              title="Reset Camera"
            >
              <RotateCcw className="w-4 h-4 text-gray-300" />
            </button>
            <button
              onClick={exportImage}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-all"
              title="Export Image"
            >
              <Download className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {VIEW_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`p-2 rounded-lg border transition-all text-center ${
                viewMode === mode.id
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="text-xs font-medium">{mode.name}</div>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Grid</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showFixtures}
              onChange={(e) => setShowFixtures(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Fixtures</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showLayers}
              onChange={(e) => setShowLayers(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Layers</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Intensity:</span>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="relative h-96 md:h-[500px]">
        <div ref={mountRef} className="w-full h-full" />
        
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm text-gray-400">Loading 3D Visualization...</p>
            </div>
          </div>
        )}

        {/* Controls hint */}
        <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur rounded-lg p-3 text-xs text-gray-300">
          <div>Left click + drag: Rotate</div>
          <div>Right click + drag: Pan</div>
          <div>Scroll: Zoom</div>
          <div>Click fixtures to select</div>
        </div>
      </div>
    </div>
  )
}