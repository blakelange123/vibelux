// Local Storage Keys
export const STORAGE_KEYS = {
  AR_SETTINGS: 'vibelux_ar_settings',
  IOT_DEVICES: 'vibelux_iot_devices',
  CARBON_SETTINGS: 'vibelux_carbon_settings',
  LEASING_DATA: 'vibelux_leasing_data',
  FORUM_SETTINGS: 'vibelux_forum_settings',
  LIGHT_RECIPES: 'vibelux_light_recipes',
  SPECTRUM_PROFILES: 'vibelux_spectrum_profiles',
  MAINTENANCE_TASKS: 'vibelux_maintenance_tasks',
  ML_MODELS: 'vibelux_ml_models',
  INTEGRATION_CONFIG: 'vibelux_integration_config'
} as const

// Type Definitions
export interface ARSettings {
  gridEnabled: boolean
  shadowsEnabled: boolean
  measurementUnit: 'metric' | 'imperial'
  snapToGrid: boolean
  gridSize: number
  autoRotate: boolean
  showDimensions: boolean
}

export interface IoTSettings {
  autoRefresh: boolean
  refreshInterval: number
  alertsEnabled: boolean
  units: 'metric' | 'imperial'
}

export interface CarbonSettings {
  walletAddress: string
  autoOffset: boolean
  targetReduction: number
  trackingEnabled: boolean
}

export interface LeasingSettings {
  defaultCreditScore: string
  taxRate: number
  currency: string
  includeWarranty: boolean
}

export interface ForumSettings {
  notificationsEnabled: boolean
  emailDigest: boolean
  displayName: string
  defaultSort: 'latest' | 'popular' | 'unanswered'
}

// Default Settings
export const defaultARSettings: ARSettings = {
  gridEnabled: true,
  shadowsEnabled: true,
  measurementUnit: 'metric',
  snapToGrid: true,
  gridSize: 0.5,
  autoRotate: false,
  showDimensions: true
}

export const defaultIoTSettings: IoTSettings = {
  autoRefresh: true,
  refreshInterval: 30,
  alertsEnabled: true,
  units: 'metric'
}

export const defaultCarbonSettings: CarbonSettings = {
  walletAddress: '',
  autoOffset: false,
  targetReduction: 20,
  trackingEnabled: true
}

export const defaultLeasingSettings: LeasingSettings = {
  defaultCreditScore: 'good',
  taxRate: 25,
  currency: 'USD',
  includeWarranty: true
}

export const defaultForumSettings: ForumSettings = {
  notificationsEnabled: true,
  emailDigest: false,
  displayName: '',
  defaultSort: 'latest'
}

// Utility Functions
export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data))
    }
  } catch (error) {
    console.error(`Error saving to localStorage:`, error)
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key)
      if (item) {
        return JSON.parse(item) as T
      }
    }
  } catch (error) {
    console.error(`Error loading from localStorage:`, error)
  }
  return defaultValue
}

export function removeFromLocalStorage(key: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  } catch (error) {
    console.error(`Error removing from localStorage:`, error)
  }
}

export function clearAllLocalStorage(): void {
  try {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    }
  } catch (error) {
    console.error(`Error clearing localStorage:`, error)
  }
}

// Hook for using localStorage with React
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return loadFromLocalStorage(key, defaultValue)
  })

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      saveToLocalStorage(key, value)
    } catch (error) {
      console.error(`Error setting localStorage value:`, error)
    }
  }

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Error parsing storage event:`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}