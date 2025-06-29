export type SubscriptionTier = 'FREE' | 'PROFESSIONAL' | 'ENTERPRISE'

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN'

export interface User {
  name?: string
}

export interface Fixture {
  dlcListingId?: string
  weight?: number // kg
  beamAngle?: number // degrees
  distribution?: string
  powerFactor?: number
  thd?: number
  dataSheet?: string
  iesFile?: string
}

export interface SpectrumData {
  blue?: number // 400-500nm percentage
  green?: number // 500-600nm percentage
  red?: number // 600-700nm percentage
  farRed?: number // 700-800nm percentage
}

export interface Dimensions {
}

export interface Project {
  description?: string
  location?: Location
  roomDimensions?: RoomDimensions
  fixtureLayout?: FixtureLayout
  weatherData?: WeatherData
}

export interface Location {
}

export interface RoomDimensions {
}

export interface FixtureLayout {
  aisleWidth?: number
  benchHeight?: number
}

export interface PlacedFixture {
}

export interface WeatherData {
  temperature: number
  humidity: number
  conditions: string
  forecast: Array<{
    date: string
    temperature: number
    conditions: string
  }>
}

// Feature gating based on subscription tier
export const FEATURE_LIMITS = {
  FREE: {
    maxProjects: 1,
    maxSqFt: 1000,
    features: ['basic_design', 'ppfd_calculation']
  },
  PRO: {
    maxProjects: 10,
    maxSqFt: 10000,
    features: ['basic_design', 'ppfd_calculation', 'roi_analysis', 'equipment_library']
  },
  ENTERPRISE: {
    maxProjects: -1,
    maxSqFt: -1,
    features: ['all']
  }
} as const