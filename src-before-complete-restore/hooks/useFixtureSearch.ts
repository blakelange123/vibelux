/**
 * React Hook for Advanced Fixture Search
 * Provides intelligent fixture search and recommendation capabilities
 */

import { useState, useEffect, useCallback } from 'react'
import { SearchFilters, FixtureRecommendation } from '@/lib/fixture-search-engine'

export interface SearchState {
  results: FixtureRecommendation[]
  isLoading: boolean
  error: string | null
  meta: {
    total: number
    filters: SearchFilters
    stats?: any
  } | null
}

export interface CropRecommendationState {
  recommendations: FixtureRecommendation[]
  insights: any
  facilityRecommendations: any
  isLoading: boolean
  error: string | null
  crop: string | null
}

export function useFixtureSearch() {
  const [searchState, setSearchState] = useState<SearchState>({
    results: [],
    isLoading: false,
    error: null,
    meta: null
  })

  const [recentSearches, setRecentSearches] = useState<SearchFilters[]>([])

  const search = useCallback(async (filters: SearchFilters) => {
    setSearchState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Build query parameters
      const params = new URLSearchParams()
      
      // Basic filters
      if (filters.wattageRange) {
        params.set('wattageMin', filters.wattageRange[0].toString())
        params.set('wattageMax', filters.wattageRange[1].toString())
      }
      
      if (filters.efficacyRange) {
        params.set('efficacyMin', filters.efficacyRange[0].toString())
        params.set('efficacyMax', filters.efficacyRange[1].toString())
      }
      
      if (filters.priceRange) {
        params.set('priceMin', filters.priceRange[0].toString())
        params.set('priceMax', filters.priceRange[1].toString())
      }
      
      if (filters.coverageArea) {
        params.set('coverageArea', filters.coverageArea.toString())
      }
      
      if (filters.mountingHeight) {
        params.set('mountingHeight', filters.mountingHeight.toString())
      }
      
      // Spectrum filters
      if (filters.spectrumType) {
        params.set('spectrumType', filters.spectrumType)
      }
      
      // Application filters
      if (filters.cropType) {
        params.set('cropType', filters.cropType)
      }
      
      if (filters.growthStage) {
        params.set('growthStage', filters.growthStage)
      }
      
      if (filters.indoorType) {
        params.set('indoorType', filters.indoorType)
      }
      
      // Performance filters
      if (filters.dimmable !== undefined) {
        params.set('dimmable', filters.dimmable.toString())
      }
      
      if (filters.lifespan) {
        params.set('lifespan', filters.lifespan.toString())
      }
      
      if (filters.certification) {
        params.set('certification', filters.certification)
      }
      
      // Brand preferences
      if (filters.manufacturer) {
        params.set('manufacturers', filters.manufacturer.join(','))
      }
      
      if (filters.excludeManufacturers) {
        params.set('excludeManufacturers', filters.excludeManufacturers.join(','))
      }
      
      // Sustainability
      if (filters.energyStarRated !== undefined) {
        params.set('energyStarRated', filters.energyStarRated.toString())
      }
      
      // Advanced
      if (filters.ppfdTarget) {
        params.set('ppfdTarget', filters.ppfdTarget.toString())
      }
      
      if (filters.dliTarget) {
        params.set('dliTarget', filters.dliTarget.toString())
      }
      
      if (filters.sortBy) {
        params.set('sortBy', filters.sortBy)
      }
      
      if (filters.limit) {
        params.set('limit', filters.limit.toString())
      }

      const response = await fetch(`/api/fixtures/search?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      
      setSearchState({
        results: data.recommendations,
        isLoading: false,
        error: null,
        meta: data.meta
      })

      // Add to recent searches
      setRecentSearches(prev => {
        const filtered = prev.filter(s => JSON.stringify(s) !== JSON.stringify(filters))
        return [filters, ...filtered].slice(0, 5)
      })

    } catch (error) {
      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Search failed'
      }))
    }
  }, [])

  const clearResults = useCallback(() => {
    setSearchState({
      results: [],
      isLoading: false,
      error: null,
      meta: null
    })
  }, [])

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
  }, [])

  return {
    ...searchState,
    search,
    clearResults,
    recentSearches,
    clearRecentSearches
  }
}

export function useCropRecommendations() {
  const [state, setState] = useState<CropRecommendationState>({
    recommendations: [],
    insights: null,
    facilityRecommendations: null,
    isLoading: false,
    error: null,
    crop: null
  })

  const getRecommendations = useCallback(async (params: {
    cropName: string
    growthStage?: string
    facilityType?: string
    coverageArea?: number
    budget?: number
    mountingHeight?: number
    priority?: string
  }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, crop: params.cropName }))

    try {
      const queryParams = new URLSearchParams()
      queryParams.set('crop', params.cropName)
      
      if (params.growthStage) queryParams.set('growthStage', params.growthStage)
      if (params.facilityType) queryParams.set('facilityType', params.facilityType)
      if (params.coverageArea) queryParams.set('coverageArea', params.coverageArea.toString())
      if (params.budget) queryParams.set('budget', params.budget.toString())
      if (params.mountingHeight) queryParams.set('mountingHeight', params.mountingHeight.toString())
      if (params.priority) queryParams.set('priority', params.priority)

      const response = await fetch(`/api/fixtures/recommendations?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to get recommendations')
      }

      const data = await response.json()
      
      setState({
        recommendations: data.recommendations,
        insights: data.insights,
        facilityRecommendations: data.facilityRecommendations,
        isLoading: false,
        error: null,
        crop: params.cropName
      })

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get recommendations'
      }))
    }
  }, [])

  const getDetailedRecommendations = useCallback(async (params: {
    cropName: string
    growthStage?: string
    facilityType?: string
    coverageArea?: number
    budget?: number
    mountingHeight?: number
    electricityRate?: number
    priority?: string
  }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, crop: params.cropName }))

    try {
      const response = await fetch('/api/fixtures/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })
      
      if (!response.ok) {
        throw new Error('Failed to get detailed recommendations')
      }

      const data = await response.json()
      
      setState({
        recommendations: data.recommendations,
        insights: data.insights,
        facilityRecommendations: data.facilityRecommendations,
        isLoading: false,
        error: null,
        crop: params.cropName
      })

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get recommendations'
      }))
    }
  }, [])

  const clearRecommendations = useCallback(() => {
    setState({
      recommendations: [],
      insights: null,
      facilityRecommendations: null,
      isLoading: false,
      error: null,
      crop: null
    })
  }, [])

  return {
    ...state,
    getRecommendations,
    getDetailedRecommendations,
    clearRecommendations
  }
}

export function useFixtureComparison() {
  const [comparison, setComparison] = useState<{
    fixtures: any[]
    analysis: any
  }>({
    fixtures: [],
    analysis: null
  })

  const addToComparison = useCallback((fixture: any) => {
    setComparison(prev => {
      if (prev.fixtures.find(f => f.id === fixture.id)) {
        return prev // Already in comparison
      }
      
      const newFixtures = [...prev.fixtures, fixture].slice(0, 4) // Max 4 fixtures
      
      return {
        fixtures: newFixtures,
        analysis: generateComparisonAnalysis(newFixtures)
      }
    })
  }, [])

  const removeFromComparison = useCallback((fixtureId: string) => {
    setComparison(prev => {
      const newFixtures = prev.fixtures.filter(f => f.id !== fixtureId)
      
      return {
        fixtures: newFixtures,
        analysis: newFixtures.length > 1 ? generateComparisonAnalysis(newFixtures) : null
      }
    })
  }, [])

  const clearComparison = useCallback(() => {
    setComparison({
      fixtures: [],
      analysis: null
    })
  }, [])

  return {
    ...comparison,
    addToComparison,
    removeFromComparison,
    clearComparison
  }
}

function generateComparisonAnalysis(fixtures: any[]) {
  if (fixtures.length < 2) return null

  const analysis = {
    efficiency: {
      best: fixtures.reduce((best, f) => f.specifications.efficacy > best.specifications.efficacy ? f : best),
      worst: fixtures.reduce((worst, f) => f.specifications.efficacy < worst.specifications.efficacy ? f : worst),
      average: fixtures.reduce((sum, f) => sum + f.specifications.efficacy, 0) / fixtures.length
    },
    cost: {
      cheapest: fixtures.reduce((cheap, f) => f.pricing.msrp < cheap.pricing.msrp ? f : cheap),
      mostExpensive: fixtures.reduce((exp, f) => f.pricing.msrp > exp.pricing.msrp ? f : exp),
      average: fixtures.reduce((sum, f) => sum + f.pricing.msrp, 0) / fixtures.length
    },
    performance: {
      highest: fixtures.reduce((high, f) => f.specifications.ppfd > high.specifications.ppfd ? f : high),
      lowest: fixtures.reduce((low, f) => f.specifications.ppfd < low.specifications.ppfd ? f : low),
      average: fixtures.reduce((sum, f) => sum + f.specifications.ppfd, 0) / fixtures.length
    },
    value: {
      best: fixtures.reduce((best, f) => {
        const bestRatio = best.specifications.ppfd / best.pricing.msrp
        const fRatio = f.specifications.ppfd / f.pricing.msrp
        return fRatio > bestRatio ? f : best
      })
    }
  }

  return analysis
}