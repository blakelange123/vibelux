// White Label Configuration
// This can be stored in database per organization/user in production

export interface WhiteLabelConfig {
  companyName: string
  companyLogo?: string
  primaryColor: { r: number; g: number; b: number }
  secondaryColor: { r: number; g: number; b: number }
  hideBranding: boolean
  customDomain?: string
  supportEmail?: string
  supportPhone?: string
  website?: string
}

// Default Vibelux branding
export const defaultWhiteLabel: WhiteLabelConfig = {
  companyName: 'Vibelux',
  primaryColor: { r: 79, g: 70, b: 229 }, // Purple
  secondaryColor: { r: 16, g: 185, b: 129 }, // Green
  hideBranding: false,
  supportEmail: 'support@vibelux.com',
  website: 'https://vibelux.com'
}

// Get white label config from localStorage or use default
export function getWhiteLabelConfig(): WhiteLabelConfig {
  if (typeof window === 'undefined') return defaultWhiteLabel
  
  const stored = localStorage.getItem('whitelabel-config')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return defaultWhiteLabel
    }
  }
  return defaultWhiteLabel
}

// Save white label config to localStorage
export function saveWhiteLabelConfig(config: WhiteLabelConfig) {
  if (typeof window === 'undefined') return
  localStorage.setItem('whitelabel-config', JSON.stringify(config))
}

// Check if white label is enabled
export function isWhiteLabelEnabled(): boolean {
  const config = getWhiteLabelConfig()
  return config.hideBranding || config.companyName !== 'Vibelux'
}