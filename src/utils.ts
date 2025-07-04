import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Unit conversion utilities (Feature 4)
export const unitConversion = {
  // Length
  metersToFeet: (m: number) => m * 3.28084,
  feetToMeters: (ft: number) => ft / 3.28084,
  
  // Area
  squareMetersToSquareFeet: (m2: number) => m2 * 10.7639,
  squareFeetToSquareMeters: (ft2: number) => ft2 / 10.7639,
  
  // Power
  wattsToHorsepower: (w: number) => w * 0.00134102,
  horsepowerToWatts: (hp: number) => hp / 0.00134102,
  
  // Temperature
  celsiusToFahrenheit: (c: number) => (c * 9/5) + 32,
  fahrenheitToCelsius: (f: number) => (f - 32) * 5/9,
}

// Format currency
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Format percentage
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

// Format PPFD value
export function formatPPFD(value: number): string {
  return `${value.toFixed(0)} μmol/m²/s`
}

// Format DLI value
export function formatDLI(value: number): string {
  return `${value.toFixed(1)} mol/m²/day`
}

// Calculate DLI from PPFD
export function calculateDLI(ppfd: number, photoperiod: number): number {
  return ppfd * photoperiod * 0.0036
}

// Calculate PPFD from DLI
export function calculatePPFD(dli: number, photoperiod: number): number {
  return dli / (photoperiod * 0.0036)
}