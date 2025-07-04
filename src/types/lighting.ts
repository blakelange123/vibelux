import type { FixtureModel } from '@/components/FixtureLibrary'

export interface Room {
  width: number
  height: number
  shape: 'rectangle' | 'square' | 'circle' | 'polygon'
  mountingHeight: number
  targetPPFD: number
  targetDLI: number
  photoperiod: number
}

export interface Fixture {
  id: string
  x: number
  y: number
  rotation: number
  model: FixtureModel
  enabled: boolean
  assignedLayer?: string
}

export interface CanopyLayer {
  id: string
  name: string
  height: number
  visible: boolean
  enabled: boolean
  targetPPFD: number
  cropType: string
  canopyDensity: number
  transmittance: number
  color: string
}