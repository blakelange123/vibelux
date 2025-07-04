"use client"

import { Zap, Grid as GridIcon } from 'lucide-react'
import { HeatMapCanvas } from '@/components/HeatMapCanvas'
import ShadowMapVisualization from '@/components/ShadowMapVisualization'
import { Simple3DView } from '@/components/Simple3DView'
import type { Fixture } from '@/types/lighting'

interface DesignCanvasProps {
  room: {
    width: number
    height: number
    mountingHeight: number
    targetPPFD: number
  }
  fixtures: Fixture[]
  ppfdGrid: any[]
  showPARMap: boolean
  showShadowMapper?: boolean
  shadowMap?: any[]
  obstructions?: any[]
  view3DMode?: boolean
  gridEnabled: boolean
  colorScale: 'viridis' | 'heat' | 'grayscale'
  selectedFixture: string | null
  designMode: 'place' | 'move' | 'rotate'
  canopyLayers?: any[]
  showMultiLayer?: boolean
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void
  onFixtureClick: (fixtureId: string) => void
}

export function DesignCanvas({
  room,
  fixtures,
  ppfdGrid,
  showPARMap,
  showShadowMapper = false,
  shadowMap = [],
  obstructions = [],
  view3DMode = false,
  gridEnabled,
  colorScale,
  selectedFixture,
  designMode,
  canopyLayers = [],
  showMultiLayer = false,
  onClick,
  onFixtureClick
}: DesignCanvasProps) {
  if (!room?.width || !room?.height) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-400">Please configure room dimensions</div>
      </div>
    );
  }
  
  const canvasSize = {
    width: room.width * 50,
    height: room.height * 50
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div 
        className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden cursor-crosshair"
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
          maxWidth: '90%',
          maxHeight: '90%'
        }}
        onClick={onClick}
      >
        {/* Heat Map */}
        {showPARMap && ppfdGrid.length > 0 && !showShadowMapper && !view3DMode && (
          <HeatMapCanvas
            grid={ppfdGrid}
            width={canvasSize.width}
            height={canvasSize.height}
            minPPFD={0}
            maxPPFD={room.targetPPFD * 1.5}
            colorScale={colorScale}
          />
        )}

        {/* Shadow Map Visualization */}
        {showShadowMapper && shadowMap.length > 0 && !view3DMode && (
          <div className="absolute inset-0">
            <ShadowMapVisualization
              width={canvasSize.width}
              height={canvasSize.height}
              shadowMap={shadowMap}
              obstructions={obstructions}
              showObstructions={true}
              highlightSevere={true}
              viewMode="top"
              roomDimensions={{ 
                width: room.width, 
                height: room.height,
                depth: room.mountingHeight 
              }}
            />
          </div>
        )}

        {/* 3D View */}
        {view3DMode && (
          <div className="absolute inset-0 bg-gray-900">
            <Simple3DView
              fixtures={fixtures.map(f => ({
                id: f.id,
                x: f.x,
                y: f.y,
                z: room.mountingHeight,
                enabled: f.enabled
              }))}
              roomDimensions={{
                width: room.width,
                height: room.height,
                depth: room.mountingHeight
              }}
            />
          </div>
        )}

        {/* Grid */}
        {gridEnabled && !view3DMode && (
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            {Array.from({ length: Math.ceil(room.width) }, (_, i) => (
              <div
                key={`v-${i}`}
                className="absolute top-0 bottom-0 w-px bg-gray-600"
                style={{ left: `${(i / room.width) * 100}%` }}
              />
            ))}
            {Array.from({ length: Math.ceil(room.height) }, (_, i) => (
              <div
                key={`h-${i}`}
                className="absolute left-0 right-0 h-px bg-gray-600"
                style={{ top: `${(i / room.height) * 100}%` }}
              />
            ))}
          </div>
        )}

        {/* Canopy Layers Visualization */}
        {showMultiLayer && canopyLayers.length > 0 && !view3DMode && (
          <div className="absolute inset-0 pointer-events-none">
            {canopyLayers
              .filter(layer => layer.visible)
              .map((layer) => (
                <div
                  key={layer.id}
                  className="absolute inset-x-4 opacity-20 border-2 border-dashed rounded"
                  style={{
                    borderColor: layer.color,
                    backgroundColor: `${layer.color}20`,
                    height: '20px',
                    bottom: `${(layer.height / room.mountingHeight) * 100}%`,
                  }}
                >
                  <div 
                    className="absolute -left-2 -top-6 text-xs font-medium px-2 py-1 rounded text-white"
                    style={{ backgroundColor: layer.color }}
                  >
                    {layer.name}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Fixtures */}
        {!view3DMode && fixtures.map((fixture) => (
          <div
            key={fixture.id}
            className={`absolute w-14 h-14 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
              selectedFixture === fixture.id ? 'scale-110 z-10' : ''
            }`}
            style={{
              left: `${fixture.x}%`,
              top: `${fixture.y}%`,
              transform: `translate(-50%, -50%) rotate(${fixture.rotation}deg)`
            }}
            onClick={(e) => {
              e.stopPropagation()
              onFixtureClick(fixture.id)
            }}
          >
            <div className={`relative w-full h-full rounded-lg ${
              fixture.enabled 
                ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/50' 
                : 'bg-gray-600'
            }`}>
              <Zap className="w-6 h-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/50 px-2 py-1 rounded whitespace-nowrap">
                {fixture.model.model}
              </div>
            </div>
            {selectedFixture === fixture.id && (
              <div className="absolute inset-0 border-2 border-purple-500 rounded-lg animate-pulse" />
            )}
          </div>
        ))}

        {/* Room dimensions overlay */}
        <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur px-3 py-1 rounded-lg border border-gray-700">
          <p className="text-white text-sm font-medium">
            {room.width} × {room.height} ft
          </p>
        </div>
      </div>
    </div>
  )
}