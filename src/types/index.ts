export type SubscriptionTier = 'FREE' | 'PROFESSIONAL' | 'ENTERPRISE'

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN'

export interface User {
  id: string
  clerkId: string
  email: string
  name?: string
  role: UserRole
  subscriptionTier: SubscriptionTier
  createdAt: Date
  updatedAt: Date
}

export interface Fixture {
  id: string
  dlcListingId?: string
  manufacturer: string
  model: string
  ppf: number // �mol/s
  wattage: number // W
  efficacy: number // �mol/J
  spectrum: SpectrumData
  dimensions: Dimensions
  weight?: number // kg
  beamAngle?: number // degrees
  distribution?: string
  voltage: string
  powerFactor?: number
  thd?: number
  dlcQualified: boolean
  dlcPremium: boolean
  dataSheet?: string
  iesFile?: string
  images: string[]
  createdAt: Date
  updatedAt: Date
}

export interface SpectrumData {
  wavelengths: number[]
  intensities: number[]
  blue?: number // 400-500nm percentage
  green?: number // 500-600nm percentage
  red?: number // 600-700nm percentage
  farRed?: number // 700-800nm percentage
}

export interface Dimensions {
  length: number // mm
  width: number // mm
  height: number // mm
}

export interface Project {
  id: string
  name: string
  description?: string
  userId: string
  location?: Location
  roomDimensions?: RoomDimensions
  fixtureLayout?: FixtureLayout
  weatherData?: WeatherData
  createdAt: Date
  updatedAt: Date
}

export interface Location {
  lat: number
  lng: number
  address: string
}

export interface RoomDimensions {
  length: number // meters
  width: number // meters
  height: number // meters
}

export interface FixtureLayout {
  fixtures: PlacedFixture[]
  mountingHeight: number
  aisleWidth?: number
  benchHeight?: number
}

export interface PlacedFixture {
  fixtureId: string
  position: { x: number; y: number; z: number }
  rotation: number
  quantity: number
}

export interface WeatherData {
  current: {
    temperature: number
    humidity: number
    cloudCover: number
    solarRadiation: number
  }
  forecast: {
    date: Date
    dli: number
    cloudCover: number
  }[]
}

// Feature gating based on subscription tier
export const FEATURE_LIMITS = {
  FREE: {
    projects: 1,
    fixtures: 50,
    comparisons: 2,
    reports: 5,
    apiCalls: 100,
    aiQueries: 0,
  },
  PROFESSIONAL: {
    projects: 10,
    fixtures: 2400,
    comparisons: 10,
    reports: 'unlimited',
    apiCalls: 10000,
    aiQueries: 1000,
  },
  ENTERPRISE: {
    projects: 'unlimited',
    fixtures: 'unlimited',
    comparisons: 'unlimited',
    reports: 'unlimited',
    apiCalls: 'unlimited',
    aiQueries: 'unlimited',
  },
} as const