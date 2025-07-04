/**
 * Environment Variable Validation and Security
 * Ensures all required environment variables are present and properly configured
 */

import { z } from 'zod'

// Define the schema for environment variables
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  
  // Clerk Authentication (required)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'Clerk publishable key is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'Clerk secret key is required'),
  
  // Mobile API
  MOBILE_API_KEY: z.string().optional(),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  
  // External APIs (optional in development)
  OPENWEATHER_API_KEY: z.string().optional(),
  NREL_API_KEY: z.string().optional(),
  GOOGLE_VISION_API_KEY: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  
  // AI APIs (optional)
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_ORG_ID: z.string().optional(),
  CLAUDE_API_KEY: z.string().optional(),
  
  // InfluxDB (optional in development)
  INFLUXDB_URL: z.string().optional(),
  INFLUXDB_ORG: z.string().optional(),
  INFLUXDB_BUCKET: z.string().optional(),
  INFLUXDB_TOKEN: z.string().optional(),
  INFLUXDB_ADMIN_USER: z.string().optional(),
  INFLUXDB_ADMIN_PASSWORD: z.string().optional(),
  
  // Stripe (optional in development)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  
  // Autodesk Forge (optional)
  FORGE_CLIENT_ID: z.string().optional(),
  FORGE_CLIENT_SECRET: z.string().optional(),
  FORGE_CALLBACK_URL: z.string().optional(),
  FORGE_SCOPE: z.string().optional(),
  
  // CloudConvert (optional)
  CLOUDCONVERT_API_KEY: z.string().optional(),
  
  // Feature flags
  NEXT_PUBLIC_USE_OPENAI: z.string().optional(),
  NEXT_PUBLIC_USE_CLAUDE: z.string().optional(),
})

// Production-specific requirements
const productionSchema = envSchema.extend({
  OPENWEATHER_API_KEY: z.string().min(1, 'OpenWeather API key required in production'),
  NREL_API_KEY: z.string().min(1, 'NREL API key required in production'),
  INFLUXDB_URL: z.string().min(1, 'InfluxDB URL required in production'),
  INFLUXDB_ORG: z.string().min(1, 'InfluxDB organization required in production'),
  INFLUXDB_BUCKET: z.string().min(1, 'InfluxDB bucket required in production'),
  INFLUXDB_TOKEN: z.string().min(1, 'InfluxDB token required in production'),
  STRIPE_SECRET_KEY: z.string().min(1, 'Stripe secret key required in production'),
})

type EnvVars = z.infer<typeof envSchema>

class EnvironmentValidator {
  private static instance: EnvironmentValidator
  private validatedEnv: EnvVars | null = null
  
  private constructor() {}
  
  static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator()
    }
    return EnvironmentValidator.instance
  }
  
  /**
   * Validate environment variables and cache the result
   */
  validate(): EnvVars {
    if (this.validatedEnv) {
      return this.validatedEnv
    }
    
    const env = process.env
    const isProduction = env.NODE_ENV === 'production'
    
    try {
      // Use production schema in production, regular schema otherwise
      const schema = isProduction ? productionSchema : envSchema
      this.validatedEnv = schema.parse(env)
      
      // Additional security checks
      this.performSecurityChecks(this.validatedEnv)
      
      return this.validatedEnv
    } catch (error) {
      console.error('❌ Environment validation failed:', error)
      
      if (isProduction) {
        // In production, fail hard
        throw new Error('Environment validation failed in production')
      } else {
        // In development, log warnings but continue
        console.warn('⚠️ Development mode: continuing with invalid environment')
        return env as EnvVars
      }
    }
  }
  
  /**
   * Perform additional security checks
   */
  private performSecurityChecks(env: EnvVars): void {
    const warnings: string[] = []
    
    // Check for exposed secrets in client-side environment variables
    Object.keys(env).forEach(key => {
      if (key.startsWith('NEXT_PUBLIC_')) {
        const value = env[key as keyof EnvVars] as string
        if (value && this.looksLikeSecret(value)) {
          warnings.push(`🚨 SECURITY WARNING: ${key} appears to contain a secret key but is exposed to client-side`)
        }
      }
    })
    
    // Check for weak or default passwords
    if (env.INFLUXDB_ADMIN_PASSWORD && this.isWeakPassword(env.INFLUXDB_ADMIN_PASSWORD)) {
      warnings.push(`🚨 SECURITY WARNING: InfluxDB admin password is weak`)
    }
    
    // Check for development/test keys in production
    if (env.NODE_ENV === 'production') {
      [env.OPENAI_API_KEY, env.CLAUDE_API_KEY, env.STRIPE_SECRET_KEY].forEach((key, index) => {
        const names = ['OpenAI', 'Claude', 'Stripe']
        if (key && this.looksLikeTestKey(key)) {
          warnings.push(`🚨 SECURITY WARNING: ${names[index]} appears to be using test/development credentials in production`)
        }
      })
    }
    
    // Log all warnings
    warnings.forEach(warning => console.warn(warning))
    
    if (warnings.length > 0 && env.NODE_ENV === 'production') {
      throw new Error('Security validation failed in production')
    }
  }
  
  /**
   * Check if a value looks like a secret key
   */
  private looksLikeSecret(value: string): boolean {
    return /^(sk-|pk_|sk_|rk_)/.test(value) || 
           value.length > 30 && /^[A-Za-z0-9+/=_-]+$/.test(value)
  }
  
  /**
   * Check if a password is weak
   */
  private isWeakPassword(password: string): boolean {
    const weakPatterns = [
      /^password/i,
      /^123456/,
      /^admin/i,
      /^test/i,
      /^demo/i,
      /^default/i
    ]
    
    return password.length < 12 || weakPatterns.some(pattern => pattern.test(password))
  }
  
  /**
   * Check if a key looks like test/development credentials
   */
  private looksLikeTestKey(key: string): boolean {
    return /_(test|dev|development|staging)_/i.test(key) ||
           /^sk_test_/i.test(key) ||
           /^pk_test_/i.test(key)
  }
  
  /**
   * Get a specific environment variable with validation
   */
  get<K extends keyof EnvVars>(key: K): EnvVars[K] {
    const env = this.validate()
    return env[key]
  }
  
  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature: string): boolean {
    const env = this.validate()
    const flagKey = `NEXT_PUBLIC_USE_${feature.toUpperCase()}` as keyof EnvVars
    return env[flagKey] === 'true'
  }
  
  /**
   * Check if we're in production
   */
  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production'
  }
  
  /**
   * Check if we're in development
   */
  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development'
  }
}

// Export singleton instance
export const env = EnvironmentValidator.getInstance()

// Export the validation function for use in API routes
export function validateEnvironment() {
  return env.validate()
}

// Export types
export type { EnvVars }