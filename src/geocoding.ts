// Geocoding utilities for converting addresses to coordinates

export interface GeocodingResult {
  lat: number;
  lng: number;
  formatted_address: string;
  place_id?: string;
  confidence?: number;
}

export class GeocodingService {
  private cache: Map<string, GeocodingResult> = new Map();
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  }

  // Geocode an address using multiple providers
  async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    // Check cache first
    if (this.cache.has(address)) {
      return this.cache.get(address)!;
    }

    try {
      // Try Google Maps Geocoding API first
      if (this.apiKey) {
        const result = await this.geocodeWithGoogle(address);
        if (result) {
          this.cache.set(address, result);
          return result;
        }
      }

      // Fallback to Nominatim (OpenStreetMap)
      const nominatimResult = await this.geocodeWithNominatim(address);
      if (nominatimResult) {
        this.cache.set(address, nominatimResult);
        return nominatimResult;
      }

      // If all else fails, try to extract state/city and use approximate coordinates
      return this.getFallbackCoordinates(address);
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  private async geocodeWithGoogle(address: string): Promise<GeocodingResult | null> {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formatted_address: result.formatted_address,
          place_id: result.place_id,
          confidence: 1.0
        };
      }
    } catch (error) {
      console.error('Google Geocoding error:', error);
    }
    return null;
  }

  private async geocodeWithNominatim(address: string): Promise<GeocodingResult | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Vibelux App'
        }
      });
      const data = await response.json();

      if (data.length > 0) {
        const result = data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          formatted_address: result.display_name,
          confidence: 0.8
        };
      }
    } catch (error) {
      console.error('Nominatim Geocoding error:', error);
    }
    return null;
  }

  private getFallbackCoordinates(address: string): GeocodingResult | null {
    // Extended list of major cities and their coordinates
    const fallbackCoordinates: { [key: string]: { lat: number; lng: number } } = {
      // Original cities
      'Denver, CO': { lat: 39.7392, lng: -104.9903 },
      'Portland, OR': { lat: 45.5152, lng: -122.6784 },
      'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
      'Austin, TX': { lat: 30.2672, lng: -97.7431 },
      'Sacramento, CA': { lat: 38.5816, lng: -121.4944 },
      'Phoenix, AZ': { lat: 33.4484, lng: -112.0740 },
      'Seattle, WA': { lat: 47.6062, lng: -122.3321 },
      'Boston, MA': { lat: 42.3601, lng: -71.0589 },
      
      // Additional major cities
      'New York, NY': { lat: 40.7128, lng: -74.0060 },
      'Los Angeles, CA': { lat: 34.0522, lng: -118.2437 },
      'San Francisco, CA': { lat: 37.7749, lng: -122.4194 },
      'Las Vegas, NV': { lat: 36.1699, lng: -115.1398 },
      'Miami, FL': { lat: 25.7617, lng: -80.1918 },
      'Atlanta, GA': { lat: 33.7490, lng: -84.3880 },
      'Detroit, MI': { lat: 42.3314, lng: -83.0458 },
      'Minneapolis, MN': { lat: 44.9778, lng: -93.2650 },
      'St. Louis, MO': { lat: 38.6270, lng: -90.1994 },
      'Kansas City, MO': { lat: 39.0997, lng: -94.5786 },
      'Nashville, TN': { lat: 36.1627, lng: -86.7816 },
      'Columbus, OH': { lat: 39.9612, lng: -82.9988 },
      'Indianapolis, IN': { lat: 39.7684, lng: -86.1581 },
      'Charlotte, NC': { lat: 35.2271, lng: -80.8431 },
      'San Diego, CA': { lat: 32.7157, lng: -117.1611 },
      'Dallas, TX': { lat: 32.7767, lng: -96.7970 },
      'Houston, TX': { lat: 29.7604, lng: -95.3698 },
      'Philadelphia, PA': { lat: 39.9526, lng: -75.1652 },
      'Washington, DC': { lat: 38.9072, lng: -77.0369 },
      'Baltimore, MD': { lat: 39.2904, lng: -76.6122 },
      'Richmond, VA': { lat: 37.5407, lng: -77.4360 },
      'Raleigh, NC': { lat: 35.7796, lng: -78.6382 },
      'Tampa, FL': { lat: 27.9506, lng: -82.4572 },
      'Orlando, FL': { lat: 28.5383, lng: -81.3792 },
      'Pittsburgh, PA': { lat: 40.4406, lng: -79.9959 },
      'Cincinnati, OH': { lat: 39.1031, lng: -84.5120 },
      'Cleveland, OH': { lat: 41.4993, lng: -81.6944 },
      'Milwaukee, WI': { lat: 43.0389, lng: -87.9065 },
      'Salt Lake City, UT': { lat: 40.7608, lng: -111.8910 },
      'Albuquerque, NM': { lat: 35.0844, lng: -106.6504 },
      'Tucson, AZ': { lat: 32.2226, lng: -110.9747 },
      'Oklahoma City, OK': { lat: 35.4676, lng: -97.5164 },
      'San Antonio, TX': { lat: 29.4241, lng: -98.4936 },
      'New Orleans, LA': { lat: 29.9511, lng: -90.0715 },
      'Memphis, TN': { lat: 35.1495, lng: -90.0490 },
      'Louisville, KY': { lat: 38.2527, lng: -85.7585 },
      'Birmingham, AL': { lat: 33.5186, lng: -86.8104 },
      'Buffalo, NY': { lat: 42.8864, lng: -78.8784 },
      'Rochester, NY': { lat: 43.1566, lng: -77.6088 },
      'Hartford, CT': { lat: 41.7658, lng: -72.6734 },
      'Providence, RI': { lat: 41.8240, lng: -71.4128 }
    };

    // Try exact match first
    if (fallbackCoordinates[address]) {
      return {
        ...fallbackCoordinates[address],
        formatted_address: address,
        confidence: 0.6
      };
    }

    // Try to find partial matches
    const addressLower = address.toLowerCase();
    for (const [city, coords] of Object.entries(fallbackCoordinates)) {
      if (addressLower.includes(city.toLowerCase()) || city.toLowerCase().includes(addressLower)) {
        return {
          ...coords,
          formatted_address: city,
          confidence: 0.5
        };
      }
    }

    return null;
  }

  // Batch geocode multiple addresses
  async geocodeBatch(addresses: string[]): Promise<Map<string, GeocodingResult | null>> {
    const results = new Map<string, GeocodingResult | null>();

    // Process in parallel with rate limiting
    const batchSize = 5;
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(address => this.geocodeAddress(address))
      );

      batch.forEach((address, index) => {
        results.set(address, batchResults[index]);
      });

      // Rate limiting delay
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  // Calculate distance between two coordinates (in miles)
  calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(coord2.lat - coord1.lat);
    const dLon = this.toRad(coord2.lng - coord1.lng);
    const lat1 = this.toRad(coord1.lat);
    const lat2 = this.toRad(coord2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Find sites within radius of a coordinate
  findSitesWithinRadius(
    center: { lat: number; lng: number }, 
    sites: Array<{ coordinates: { lat: number; lng: number } }>, 
    radiusMiles: number
  ): typeof sites {
    return sites.filter(site => {
      const distance = this.calculateDistance(center, site.coordinates);
      return distance <= radiusMiles;
    });
  }

  // Get region boundaries for a set of coordinates
  getRegionBounds(coordinates: Array<{ lat: number; lng: number }>): {
    north: number;
    south: number;
    east: number;
    west: number;
    center: { lat: number; lng: number };
  } {
    if (coordinates.length === 0) {
      return {
        north: 49,
        south: 25,
        east: -66,
        west: -125,
        center: { lat: 39.8283, lng: -98.5795 }
      };
    }

    const lats = coordinates.map(c => c.lat);
    const lngs = coordinates.map(c => c.lng);

    const bounds = {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
      center: {
        lat: (Math.max(...lats) + Math.min(...lats)) / 2,
        lng: (Math.max(...lngs) + Math.min(...lngs)) / 2
      }
    };

    return bounds;
  }

  // Clear geocoding cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const geocodingService = new GeocodingService();