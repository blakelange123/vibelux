/**
 * PlantNet API Integration for Vibelux
 * Provides plant identification services to enhance lighting design workflow
 */

export interface PlantNetSpecies {
  scientificNameWithoutAuthor: string
  scientificNameAuthorship: string
  genus: {
    scientificNameWithoutAuthor: string
    scientificNameAuthorship: string
  }
  family: {
    scientificNameWithoutAuthor: string
    scientificNameAuthorship: string
  }
  commonNames: string[]
  score: number
}

export interface PlantNetResult {
  score: number
  species: PlantNetSpecies
  gbif?: {
    id: string
  }
}

export interface PlantNetResponse {
  query: {
    project: string
    images: string[]
    organs: string[]
    includeRelatedImages: boolean
  }
  language: string
  preferedReferential: string
  remainingIdentificationRequests: number
  results: PlantNetResult[]
  version: string
}

export interface PlantNetError {
  statusCode: number
  error: string
  message: string
}

export class PlantNetAPI {
  private apiKey: string
  private baseUrl = 'https://my-api.plantnet.org/v2'
  private project = 'all' // Can be specific like 'useful-plants', 'weurope', etc.

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Identify a plant from one or more images
   * @param images Array of image files (1-5 images)
   * @param organs Optional array of organ types for each image ('leaf', 'flower', 'fruit', 'bark', 'habit', 'other')
   * @param includeRelatedImages Whether to include similar images from PlantNet database
   * @returns Promise with identification results
   */
  async identify(
    images: File[],
    organs?: string[],
    includeRelatedImages = false
  ): Promise<PlantNetResponse> {
    if (images.length === 0 || images.length > 5) {
      throw new Error('Please provide between 1 and 5 images')
    }

    const formData = new FormData()
    
    // Add images to form data
    images.forEach((image) => {
      formData.append('images', image)
    })
    
    // Add organs if provided
    if (organs && organs.length > 0) {
      organs.forEach((organ) => {
        formData.append('organs', organ)
      })
    }

    // Build query parameters
    const params = new URLSearchParams({
      'api-key': this.apiKey,
      'include-related-images': includeRelatedImages.toString()
    })

    try {
      const response = await fetch(
        `${this.baseUrl}/identify/${this.project}?${params}`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (!response.ok) {
        const error = await response.json() as PlantNetError
        throw new Error(`PlantNet API error: ${error.message || response.statusText}`)
      }

      const data = await response.json() as PlantNetResponse
      return data
    } catch (error) {
      console.error('PlantNet API request failed:', error)
      throw error
    }
  }

  /**
   * Get remaining API requests for the current API key
   * @returns Number of remaining requests
   */
  async getRemainingRequests(): Promise<number> {
    try {
      // Make a lightweight request to check remaining quota
      const response = await fetch(
        `${this.baseUrl}/identify/${this.project}?api-key=${this.apiKey}`,
        {
          method: 'GET'
        }
      )
      
      const data = await response.json()
      return data.remainingIdentificationRequests || 0
    } catch (error) {
      console.error('Failed to get remaining requests:', error)
      return 0
    }
  }

  /**
   * Helper method to filter results by minimum confidence score
   * @param results PlantNet results
   * @param minScore Minimum confidence score (0-1)
   * @returns Filtered results
   */
  filterByConfidence(results: PlantNetResult[], minScore = 0.1): PlantNetResult[] {
    return results.filter(result => result.score >= minScore)
  }

  /**
   * Get the most likely species from results
   * @param results PlantNet results
   * @returns Most likely species or null
   */
  getMostLikelySpecies(results: PlantNetResult[]): PlantNetResult | null {
    if (!results || results.length === 0) return null
    return results[0] // Results are already sorted by score
  }

  /**
   * Convert PlantNet results to Vibelux-compatible format
   * @param results PlantNet results
   * @returns Formatted plant data for Vibelux
   */
  formatForVibelux(results: PlantNetResult[]): VibeluxPlantData[] {
    return results.map(result => ({
      scientificName: result.species.scientificNameWithoutAuthor,
      commonNames: result.species.commonNames,
      genus: result.species.genus.scientificNameWithoutAuthor,
      family: result.species.family.scientificNameWithoutAuthor,
      confidence: result.score,
      gbifId: result.gbif?.id,
      // These would be populated from a secondary database
      lightingRequirements: null,
      growthParameters: null
    }))
  }
}

// Vibelux-specific plant data format
export interface VibeluxPlantData {
  scientificName: string
  commonNames: string[]
  genus: string
  family: string
  confidence: number
  gbifId?: string
  lightingRequirements: LightingRequirements | null
  growthParameters: GrowthParameters | null
}

export interface LightingRequirements {
  minPPFD: number
  maxPPFD: number
  optimalPPFD: number
  photoperiod: number
  dli: number
  spectrum: {
    blue: number
    green: number
    red: number
    farRed: number
    uv: number
  }
}

export interface GrowthParameters {
  temperature: {
    min: number
    max: number
    optimal: number
  }
  humidity: {
    min: number
    max: number
    optimal: number
  }
  co2: number
  growthStages: string[]
}

// Export singleton instance
export const plantNetAPI = new PlantNetAPI(process.env.NEXT_PUBLIC_PLANTNET_API_KEY || '2b10ddkkbnIpCcf54SwotCuKe')