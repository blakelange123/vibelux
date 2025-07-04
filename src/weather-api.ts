// Enhanced Weather API integration for horticultural lighting optimization
// Based on the Python EnhancedWeatherAPI class

export interface WeatherData {
  temperature: number
  humidity: number
  pressure: number
  cloudCover: number
  visibility: number
  windSpeed: number
  weatherMain: string
  weatherDescription: string
  lightTransmission: number
  vpd: number
  photosynthesisFactor: number
  dliReductionFactor: number
  location: {
    lat: number
    lon: number
    city: string
    country: string
  }
  sunrise: number
  sunset: number
  timestamp: number
}

export interface ForecastData {
  forecast: Array<{
    datetime: number
    temperature: number
    humidity: number
    cloudCover: number
    weatherMain: string
    dliReductionFactor: number
    lightTransmission: number
    photosynthesisFactor: number
  }>
  location: any
  dataSource: string
}

export interface SpectrumRecommendation {
  recommendedSpectrum: {
    bluePercent: number
    greenPercent: number
    redPercent: number
    farRedPercent: number
  }
  recommendationText: string
  temperature: number
  vpd: number
  photosynthesisFactor: number
  weatherCondition: string
  dataSource: string
}

export class EnhancedWeatherAPI {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '') {
    this.apiKey = apiKey
    this.baseUrl = 'https://api.openweathermap.org/data/2.5'
  }

  async getCurrentWeather(city?: string, lat?: number, lon?: number): Promise<WeatherData | { error: string }> {
    try {
      // Check if API key is configured - if not, return demo data
      if (!this.apiKey) {
        return this.getDemoWeatherData(city || 'Demo Location')
      }

      let url: string
      
      if (lat && lon) {
        url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      } else if (city) {
        url = `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`
      } else {
        return { error: 'Must provide either city name or coordinates' }
      }

      const response = await fetch(url)
      
      if (response.status === 200) {
        const data = await response.json()
        return this.processCurrentWeather(data)
      } else if (response.status === 401) {
        return { error: 'Invalid OpenWeather API key' }
      } else if (response.status === 404) {
        return { error: 'Location not found' }
      } else {
        return { error: `OpenWeather API returned status ${response.status}` }
      }
    } catch (error) {
      return { error: `Failed to fetch weather data: ${error}` }
    }
  }

  async getForecast(city?: string, lat?: number, lon?: number, days: number = 5): Promise<ForecastData | { error: string }> {
    try {
      let url: string
      
      if (lat && lon) {
        url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      } else if (city) {
        url = `${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric`
      } else {
        return { error: 'Must provide either city name or coordinates' }
      }

      const response = await fetch(url)
      
      if (response.status === 200) {
        const data = await response.json()
        return this.processForecastData(data, days)
      } else {
        return { error: `Forecast API returned status ${response.status}` }
      }
    } catch (error) {
      return { error: `Failed to fetch forecast data: ${error}` }
    }
  }

  private processCurrentWeather(data: any): WeatherData {
    const cloudCover = data.clouds.all
    const visibility = data.visibility || 10000
    const temperature = data.main.temp
    const humidity = data.main.humidity

    return {
      // Basic meteorological data
      temperature,
      humidity,
      pressure: data.main.pressure,
      cloudCover,
      visibility: visibility / 1000,
      windSpeed: data.wind.speed,
      weatherMain: data.weather[0].main,
      weatherDescription: data.weather[0].description,
      
      // Horticultural calculations
      lightTransmission: this.calculateLightTransmission(cloudCover, visibility),
      vpd: this.calculateVPD(temperature, humidity),
      photosynthesisFactor: this.calculatePhotosynthesisFactor(temperature),
      dliReductionFactor: this.calculateDLIReduction(cloudCover),
      
      // Location and time
      location: {
        lat: data.coord.lat,
        lon: data.coord.lon,
        city: data.name,
        country: data.sys.country
      },
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      timestamp: data.dt
    }
  }

  private processForecastData(data: any, days: number): ForecastData {
    const forecastList = data.list.slice(0, days * 8).map((item: any) => ({
      datetime: item.dt,
      temperature: item.main.temp,
      humidity: item.main.humidity,
      cloudCover: item.clouds.all,
      weatherMain: item.weather[0].main,
      dliReductionFactor: this.calculateDLIReduction(item.clouds.all),
      lightTransmission: this.calculateLightTransmission(item.clouds.all, 10000),
      photosynthesisFactor: this.calculatePhotosynthesisFactor(item.main.temp)
    }))

    return {
      forecast: forecastList,
      location: data.city,
      dataSource: 'OpenWeather Forecast'
    }
  }

  private calculateLightTransmission(cloudCover: number, visibility: number): number {
    // Cloud factor: 0-100% cloud cover affects light transmission
    const cloudFactor = 1 - (cloudCover / 100) * 0.8 // Max 80% reduction from clouds
    
    // Visibility factor: reduced visibility affects light transmission
    const visibilityKm = visibility / 1000
    const visibilityFactor = Math.min(1.0, visibilityKm / 10) // Normalize to 10km as clear
    
    return cloudFactor * visibilityFactor
  }

  private calculateVPD(temperature: number, humidity: number): number {
    // Saturated vapor pressure (kPa)
    const svp = 0.6108 * Math.exp(17.27 * temperature / (temperature + 237.3))
    
    // Actual vapor pressure
    const avp = svp * humidity / 100
    
    // VPD = SVP - AVP
    return svp - avp
  }

  private calculatePhotosynthesisFactor(temperature: number): number {
    // Optimal temperature range for most crops: 20-25°C
    if (temperature >= 20 && temperature <= 25) {
      return 1.0
    } else if (temperature >= 15 && temperature < 20) {
      return 0.8 + 0.2 * (temperature - 15) / 5
    } else if (temperature > 25 && temperature <= 30) {
      return 1.0 - 0.3 * (temperature - 25) / 5
    } else if (temperature >= 10 && temperature < 15) {
      return 0.5 + 0.3 * (temperature - 10) / 5
    } else if (temperature > 30 && temperature <= 35) {
      return 0.7 - 0.3 * (temperature - 30) / 5
    } else {
      return 0.4 // Severely suboptimal temperatures
    }
  }

  private calculateDLIReduction(cloudCover: number): number {
    // Cloud cover affects solar radiation exponentially
    return 1 - (cloudCover / 100) * 0.85 // Up to 85% reduction on fully cloudy days
  }

  getTemperatureSpectrumRecommendations(currentWeather: WeatherData | { error: string }): SpectrumRecommendation | { error: string } {
    if ('error' in currentWeather) {
      return { error: 'Weather data unavailable' }
    }

    const temperature = currentWeather.temperature
    const humidity = currentWeather.humidity
    const vpd = currentWeather.vpd
    const photosynthesisFactor = currentWeather.photosynthesisFactor
    
    // Base spectrum recommendations
    const baseSpectrum = {
      bluePercent: 20,
      greenPercent: 15,
      redPercent: 60,
      farRedPercent: 5
    }
    
    let recommendation = ''
    
    // Temperature-based adjustments
    if (temperature < 15) { // Cold stress conditions
      // Increase blue light to stimulate metabolism
      baseSpectrum.bluePercent = Math.min(30, baseSpectrum.bluePercent + 10)
      baseSpectrum.redPercent = Math.max(50, baseSpectrum.redPercent - 5)
      recommendation = 'Cold stress detected - increased blue light to stimulate plant metabolism'
      
    } else if (temperature > 30) { // Heat stress conditions  
      // Reduce total intensity, increase green for better penetration
      baseSpectrum.greenPercent = Math.min(25, baseSpectrum.greenPercent + 10)
      baseSpectrum.redPercent = Math.max(50, baseSpectrum.redPercent - 10)
      recommendation = 'Heat stress detected - increased green light for better canopy penetration, consider reducing total PPFD'
      
    } else if (temperature > 25 && temperature <= 30) { // Warm but not stress
      // Slightly increase far-red for heat dissipation
      baseSpectrum.farRedPercent = Math.min(8, baseSpectrum.farRedPercent + 3)
      baseSpectrum.redPercent = Math.max(55, baseSpectrum.redPercent - 3)
      recommendation = 'Warm conditions - increased far-red to help with heat dissipation'
      
    } else { // Optimal temperature range (15-25°C)
      recommendation = 'Optimal temperature range - maintaining balanced spectrum'
    }
    
    // VPD-based adjustments (high VPD = water stress)
    if (vpd > 1.5) { // High VPD - water stress
      // Reduce red light intensity to lower transpiration demand
      baseSpectrum.redPercent = Math.max(50, baseSpectrum.redPercent - 5)
      baseSpectrum.bluePercent = Math.min(25, baseSpectrum.bluePercent + 5)
      recommendation += ' | High VPD detected - reduced red light to decrease transpiration stress'
      
    } else if (vpd < 0.5) { // Low VPD - may need stimulation
      // Increase red for photosynthesis stimulation
      baseSpectrum.redPercent = Math.min(70, baseSpectrum.redPercent + 5)
      recommendation += ' | Low VPD - increased red light for photosynthesis stimulation'
    }
    
    // Weather condition adjustments
    const weatherMain = currentWeather.weatherMain
    if (['Rain', 'Snow', 'Thunderstorm'].includes(weatherMain)) {
      // Increase intensity compensation for low natural light
      baseSpectrum.redPercent = Math.min(70, baseSpectrum.redPercent + 5)
      recommendation += ' | Overcast conditions - increased red light to compensate for reduced natural light'
    }
    
    // Normalize percentages to sum to 100%
    const total = Object.values(baseSpectrum).reduce((sum, val) => sum + val, 0)
    if (total !== 100) {
      Object.keys(baseSpectrum).forEach(key => {
        baseSpectrum[key as keyof typeof baseSpectrum] = Math.round((baseSpectrum[key as keyof typeof baseSpectrum] / total) * 100 * 10) / 10
      })
    }
    
    return {
      recommendedSpectrum: baseSpectrum,
      recommendationText: recommendation,
      temperature,
      vpd,
      photosynthesisFactor,
      weatherCondition: weatherMain,
      dataSource: 'Weather-Adaptive Spectrum AI'
    }
  }

  private getDemoWeatherData(city: string): WeatherData {
    // Return realistic demo data for testing
    const temperature = 22 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 8 - 4 // 18-26°C
    const humidity = 60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 - 10 // 50-70%
    const cloudCover = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100
    
    return {
      temperature,
      humidity,
      pressure: 1013 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 - 10,
      cloudCover,
      visibility: 10,
      windSpeed: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
      weatherMain: cloudCover > 70 ? 'Clouds' : cloudCover > 30 ? 'Partly Cloudy' : 'Clear',
      weatherDescription: cloudCover > 70 ? 'overcast clouds' : cloudCover > 30 ? 'scattered clouds' : 'clear sky',
      lightTransmission: this.calculateLightTransmission(cloudCover, 10000),
      vpd: this.calculateVPD(temperature, humidity),
      photosynthesisFactor: this.calculatePhotosynthesisFactor(temperature),
      dliReductionFactor: this.calculateDLIReduction(cloudCover),
      location: {
        lat: 39.7392,
        lon: -104.9903,
        city: city,
        country: 'US'
      },
      sunrise: Date.now() - 6 * 60 * 60 * 1000,
      sunset: Date.now() + 6 * 60 * 60 * 1000,
      timestamp: Date.now() / 1000
    }
  }
}