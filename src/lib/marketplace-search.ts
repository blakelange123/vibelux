import { ProduceListing, Order, BuyerProfile, GrowerProfile } from './marketplace-types';

export interface SearchFilters {
  query?: string;
  categories?: string[];
  certifications?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  location?: {
    city?: string;
    state?: string;
    radius?: number;
  };
  availability?: {
    startDate?: Date;
    endDate?: Date;
    recurring?: boolean;
  };
  quality?: {
    grades?: string[];
    shelfLife?: number;
  };
  sustainability?: {
    localOnly?: boolean;
    organicOnly?: boolean;
    renewableEnergyOnly?: boolean;
  };
  delivery?: {
    deliveryRequired?: boolean;
    pickupRequired?: boolean;
    maxDeliveryFee?: number;
  };
  sortBy?: 'price' | 'distance' | 'rating' | 'date' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResults {
  listings: ProduceListing[];
  total: number;
  page: number;
  pageSize: number;
  facets: {
    categories: { value: string; count: number }[];
    certifications: { value: string; count: number }[];
    priceRanges: { min: number; max: number; count: number }[];
    cities: { value: string; count: number }[];
  };
}

export class MarketplaceSearch {
  /**
   * Search produce listings with advanced filters
   */
  static searchListings(
    listings: ProduceListing[], 
    filters: SearchFilters
  ): SearchResults {
    let filtered = [...listings];

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.product.variety.toLowerCase().includes(query) ||
        listing.product.type.toLowerCase().includes(query) ||
        listing.growerName.toLowerCase().includes(query) ||
        listing.growerLocation.city.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.categories?.length) {
      filtered = filtered.filter(listing => 
        filters.categories!.includes(listing.product.type)
      );
    }

    // Certification filter
    if (filters.certifications?.length) {
      filtered = filtered.filter(listing => 
        filters.certifications!.some(cert => 
          listing.product.certifications.includes(cert)
        )
      );
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(listing => 
        listing.pricing.price >= filters.priceRange!.min &&
        listing.pricing.price <= filters.priceRange!.max
      );
    }

    // Location filter
    if (filters.location) {
      if (filters.location.city) {
        filtered = filtered.filter(listing => 
          listing.growerLocation.city.toLowerCase() === 
          filters.location!.city!.toLowerCase()
        );
      }
      if (filters.location.state) {
        filtered = filtered.filter(listing => 
          listing.growerLocation.state === filters.location!.state
        );
      }
    }

    // Availability filter
    if (filters.availability) {
      if (filters.availability.startDate) {
        filtered = filtered.filter(listing => 
          listing.availability.availableFrom >= filters.availability!.startDate!
        );
      }
      if (filters.availability.endDate) {
        filtered = filtered.filter(listing => 
          listing.availability.availableUntil <= filters.availability!.endDate!
        );
      }
      if (filters.availability.recurring !== undefined) {
        filtered = filtered.filter(listing => 
          listing.availability.recurring === filters.availability!.recurring
        );
      }
    }

    // Quality filter
    if (filters.quality) {
      if (filters.quality.grades?.length) {
        filtered = filtered.filter(listing => 
          filters.quality!.grades!.includes(listing.quality.grade)
        );
      }
      if (filters.quality.shelfLife) {
        filtered = filtered.filter(listing => 
          listing.quality.shelfLife >= filters.quality!.shelfLife!
        );
      }
    }

    // Sustainability filter
    if (filters.sustainability) {
      if (filters.sustainability.localOnly) {
        filtered = filtered.filter(listing => listing.sustainability.locallyGrown);
      }
      if (filters.sustainability.organicOnly) {
        filtered = filtered.filter(listing => 
          listing.product.certifications.some(cert => 
            cert.toLowerCase().includes('organic')
          )
        );
      }
      if (filters.sustainability.renewableEnergyOnly) {
        filtered = filtered.filter(listing => listing.sustainability.renewableEnergy);
      }
    }

    // Delivery filter
    if (filters.delivery) {
      if (filters.delivery.deliveryRequired) {
        filtered = filtered.filter(listing => listing.logistics.deliveryAvailable);
      }
      if (filters.delivery.pickupRequired) {
        filtered = filtered.filter(listing => listing.logistics.pickupAvailable);
      }
      if (filters.delivery.maxDeliveryFee !== undefined) {
        filtered = filtered.filter(listing => 
          (listing.logistics.deliveryFee || 0) <= filters.delivery!.maxDeliveryFee!
        );
      }
    }

    // Sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let compareValue = 0;
        
        switch (filters.sortBy) {
          case 'price':
            compareValue = a.pricing.price - b.pricing.price;
            break;
          case 'date':
            compareValue = a.availability.availableFrom.getTime() - 
                          b.availability.availableFrom.getTime();
            break;
          case 'rating':
            // Would need rating data
            compareValue = 0;
            break;
          case 'distance':
            // Would need user location
            compareValue = 0;
            break;
          case 'popularity':
            // Would need view/order count
            compareValue = 0;
            break;
        }
        
        return filters.sortOrder === 'desc' ? -compareValue : compareValue;
      });
    }

    // Calculate facets
    const facets = this.calculateFacets(filtered);

    return {
      listings: filtered,
      total: filtered.length,
      page: 1,
      pageSize: 20,
      facets
    };
  }

  /**
   * Calculate facets for search refinement
   */
  private static calculateFacets(listings: ProduceListing[]) {
    // Category counts
    const categoryMap = new Map<string, number>();
    listings.forEach(listing => {
      const count = categoryMap.get(listing.product.type) || 0;
      categoryMap.set(listing.product.type, count + 1);
    });

    // Certification counts
    const certMap = new Map<string, number>();
    listings.forEach(listing => {
      listing.product.certifications.forEach(cert => {
        const count = certMap.get(cert) || 0;
        certMap.set(cert, count + 1);
      });
    });

    // City counts
    const cityMap = new Map<string, number>();
    listings.forEach(listing => {
      const city = `${listing.growerLocation.city}, ${listing.growerLocation.state}`;
      const count = cityMap.get(city) || 0;
      cityMap.set(city, count + 1);
    });

    // Price ranges
    const prices = listings.map(l => l.pricing.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRanges = [
      { min: 0, max: 5, count: listings.filter(l => l.pricing.price <= 5).length },
      { min: 5, max: 10, count: listings.filter(l => l.pricing.price > 5 && l.pricing.price <= 10).length },
      { min: 10, max: 20, count: listings.filter(l => l.pricing.price > 10 && l.pricing.price <= 20).length },
      { min: 20, max: maxPrice, count: listings.filter(l => l.pricing.price > 20).length }
    ];

    return {
      categories: Array.from(categoryMap.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
      certifications: Array.from(certMap.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
      priceRanges: priceRanges.filter(r => r.count > 0),
      cities: Array.from(cityMap.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    };
  }

  /**
   * Get search suggestions based on partial query
   */
  static getSuggestions(query: string, listings: ProduceListing[]): string[] {
    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();

    listings.forEach(listing => {
      // Product names
      if (listing.product.variety.toLowerCase().includes(lowerQuery)) {
        suggestions.add(listing.product.variety);
      }
      
      // Product types
      if (listing.product.type.toLowerCase().includes(lowerQuery)) {
        suggestions.add(listing.product.type);
      }
      
      // Grower names
      if (listing.growerName.toLowerCase().includes(lowerQuery)) {
        suggestions.add(listing.growerName);
      }
      
      // Cities
      if (listing.growerLocation.city.toLowerCase().includes(lowerQuery)) {
        suggestions.add(listing.growerLocation.city);
      }
    });

    return Array.from(suggestions).slice(0, 10);
  }

  /**
   * Get related/similar listings
   */
  static getRelatedListings(
    listing: ProduceListing, 
    allListings: ProduceListing[], 
    limit: number = 4
  ): ProduceListing[] {
    return allListings
      .filter(l => l.id !== listing.id)
      .map(l => ({
        listing: l,
        score: this.calculateSimilarityScore(listing, l)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.listing);
  }

  /**
   * Calculate similarity score between two listings
   */
  private static calculateSimilarityScore(a: ProduceListing, b: ProduceListing): number {
    let score = 0;

    // Same product type
    if (a.product.type === b.product.type) score += 10;

    // Same city
    if (a.growerLocation.city === b.growerLocation.city) score += 5;

    // Similar price (within 20%)
    const priceDiff = Math.abs(a.pricing.price - b.pricing.price) / a.pricing.price;
    if (priceDiff <= 0.2) score += 3;

    // Shared certifications
    const sharedCerts = a.product.certifications.filter(cert => 
      b.product.certifications.includes(cert)
    );
    score += sharedCerts.length * 2;

    // Same growing method
    if (a.product.growingMethod === b.product.growingMethod) score += 2;

    return score;
  }
}