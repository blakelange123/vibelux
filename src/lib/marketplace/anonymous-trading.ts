/**
 * Anonymous Trading System
 * Enables anonymous negotiations and identity protection until deal completion
 */

export interface AnonymousProfile {
  id: string;
  anonymousId: string;
  displayName: string; // e.g., "Buyer #A847" or "Grower #F392"
  verificationLevel: 'basic' | 'verified' | 'premium';
  badges: string[];
  rating: number;
  completedDeals: number;
  memberSince: Date;
}

export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  status: 'pending' | 'countered' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  
  // Offer details
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  
  // Terms
  deliveryDate: Date;
  deliveryMethod: 'pickup' | 'delivery';
  paymentTerms: 'immediate' | 'net15' | 'net30' | 'custom';
  
  // Negotiation history
  history: OfferEvent[];
  
  // Anonymous until accepted
  buyerRevealed: boolean;
  sellerRevealed: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface OfferEvent {
  id: string;
  type: 'created' | 'countered' | 'accepted' | 'rejected' | 'message' | 'expired';
  actorId: string;
  timestamp: Date;
  
  // For counter offers
  previousPrice?: number;
  newPrice?: number;
  previousQuantity?: number;
  newQuantity?: number;
  
  // Optional message
  message?: string;
}

export interface NegotiationSession {
  id: string;
  offerId: string;
  participants: {
    buyerId: string;
    sellerId: string;
  };
  messages: NegotiationMessage[];
  status: 'active' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
}

export interface NegotiationMessage {
  id: string;
  senderId: string;
  type: 'text' | 'offer' | 'counter' | 'accept' | 'reject';
  content: string;
  offerDetails?: Partial<Offer>;
  timestamp: Date;
  read: boolean;
}

export class AnonymousTrading {
  /**
   * Generate anonymous profile for user
   */
  static generateAnonymousProfile(
    userId: string,
    userType: 'buyer' | 'grower',
    verificationData?: any
  ): AnonymousProfile {
    const anonymousId = this.generateAnonymousId();
    const displayName = `${userType === 'buyer' ? 'Buyer' : 'Grower'} #${anonymousId}`;
    
    return {
      id: userId,
      anonymousId,
      displayName,
      verificationLevel: this.calculateVerificationLevel(verificationData),
      badges: this.generateBadges(verificationData),
      rating: 0, // Will be calculated from completed deals
      completedDeals: 0,
      memberSince: new Date()
    };
  }

  /**
   * Create initial offer
   */
  static createOffer(
    buyerId: string,
    listing: any,
    offerDetails: {
      quantity: number;
      pricePerUnit: number;
      deliveryDate: Date;
      deliveryMethod: 'pickup' | 'delivery';
      paymentTerms: string;
      message?: string;
    }
  ): Offer {
    const offerId = `offer_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
    
    const offer: Offer = {
      id: offerId,
      listingId: listing.id,
      buyerId,
      sellerId: listing.growerId,
      status: 'pending',
      
      quantity: offerDetails.quantity,
      unit: listing.pricing.unit,
      pricePerUnit: offerDetails.pricePerUnit,
      totalAmount: offerDetails.quantity * offerDetails.pricePerUnit,
      
      deliveryDate: offerDetails.deliveryDate,
      deliveryMethod: offerDetails.deliveryMethod,
      paymentTerms: offerDetails.paymentTerms,
      
      history: [{
        id: `event_${Date.now()}`,
        type: 'created',
        actorId: buyerId,
        timestamp: new Date(),
        message: offerDetails.message
      }],
      
      buyerRevealed: false,
      sellerRevealed: false,
      
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    };
    
    return offer;
  }

  /**
   * Counter an offer
   */
  static counterOffer(
    offer: Offer,
    actorId: string,
    counterDetails: {
      pricePerUnit?: number;
      quantity?: number;
      deliveryDate?: Date;
      message?: string;
    }
  ): Offer {
    const isSellerCountering = actorId === offer.sellerId;
    
    const counterEvent: OfferEvent = {
      id: `event_${Date.now()}`,
      type: 'countered',
      actorId,
      timestamp: new Date(),
      previousPrice: offer.pricePerUnit,
      newPrice: counterDetails.pricePerUnit || offer.pricePerUnit,
      previousQuantity: offer.quantity,
      newQuantity: counterDetails.quantity || offer.quantity,
      message: counterDetails.message
    };
    
    return {
      ...offer,
      status: 'countered',
      pricePerUnit: counterDetails.pricePerUnit || offer.pricePerUnit,
      quantity: counterDetails.quantity || offer.quantity,
      deliveryDate: counterDetails.deliveryDate || offer.deliveryDate,
      totalAmount: (counterDetails.quantity || offer.quantity) * (counterDetails.pricePerUnit || offer.pricePerUnit),
      history: [...offer.history, counterEvent],
      updatedAt: new Date()
    };
  }

  /**
   * Accept offer and reveal identities
   */
  static acceptOffer(offer: Offer, actorId: string): Offer {
    const acceptEvent: OfferEvent = {
      id: `event_${Date.now()}`,
      type: 'accepted',
      actorId,
      timestamp: new Date()
    };
    
    return {
      ...offer,
      status: 'accepted',
      buyerRevealed: true,
      sellerRevealed: true,
      history: [...offer.history, acceptEvent],
      updatedAt: new Date()
    };
  }

  /**
   * Check if user can see real identity
   */
  static canSeeRealIdentity(offer: Offer, userId: string): boolean {
    // Can see own identity always
    if (userId === offer.buyerId || userId === offer.sellerId) {
      return true;
    }
    
    // Can see others only if offer is accepted and both parties revealed
    return offer.status === 'accepted' && offer.buyerRevealed && offer.sellerRevealed;
  }

  /**
   * Get display name for user in context of offer
   */
  static getDisplayName(
    offer: Offer,
    targetUserId: string,
    viewerUserId: string,
    anonymousProfiles: Map<string, AnonymousProfile>
  ): string {
    // If viewer can see real identity
    if (this.canSeeRealIdentity(offer, viewerUserId) && targetUserId !== viewerUserId) {
      // Return real name (would be fetched from user profile)
      return 'Real Name'; // Placeholder
    }
    
    // Return anonymous name
    const profile = anonymousProfiles.get(targetUserId);
    return profile?.displayName || 'Anonymous User';
  }

  /**
   * Generate anonymous ID
   */
  private static generateAnonymousId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * chars.length));
    }
    return result;
  }

  /**
   * Calculate verification level based on provided documents
   */
  private static calculateVerificationLevel(verificationData?: any): 'basic' | 'verified' | 'premium' {
    if (!verificationData) return 'basic';
    
    const hasBusinessLicense = verificationData.businessLicense;
    const hasPACA = verificationData.pacaLicense;
    const hasDRC = verificationData.drcMembership;
    const hasCreditCheck = verificationData.creditScore > 600;
    
    if (hasPACA && hasDRC && hasCreditCheck) return 'premium';
    if (hasBusinessLicense && (hasPACA || hasDRC)) return 'verified';
    return 'basic';
  }

  /**
   * Generate verification badges
   */
  private static generateBadges(verificationData?: any): string[] {
    const badges: string[] = [];
    
    if (!verificationData) return badges;
    
    if (verificationData.pacaLicense) badges.push('PACA Licensed');
    if (verificationData.drcMembership) badges.push('DRC Member');
    if (verificationData.creditScore > 700) badges.push('Excellent Credit');
    if (verificationData.yearsInBusiness > 5) badges.push('Established Business');
    if (verificationData.organicCertified) badges.push('Certified Organic');
    if (verificationData.gapCertified) badges.push('GAP Certified');
    
    return badges;
  }

  /**
   * Check if offer has expired
   */
  static isOfferExpired(offer: Offer): boolean {
    return new Date() > offer.expiresAt;
  }

  /**
   * Calculate time remaining on offer
   */
  static getTimeRemaining(offer: Offer): string {
    const now = new Date();
    const expires = offer.expiresAt;
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    }
    
    return `${hours}h ${minutes}m remaining`;
  }
}

/**
 * Anonymous Review System
 */
export interface AnonymousReview {
  id: string;
  transactionId: string;
  reviewerId: string;
  reviewedId: string;
  
  // Ratings
  overallRating: number; // 1-5
  communicationRating: number;
  productQualityRating: number;
  deliveryRating: number;
  
  // Feedback
  positives: string[];
  improvements: string[];
  wouldDealAgain: boolean;
  
  // Anonymous until both parties review
  anonymous: boolean;
  timestamp: Date;
}

export class AnonymousReviewSystem {
  /**
   * Create anonymous review
   */
  static createReview(
    transactionId: string,
    reviewerId: string,
    reviewedId: string,
    ratings: {
      overall: number;
      communication: number;
      productQuality: number;
      delivery: number;
    },
    feedback: {
      positives: string[];
      improvements: string[];
      wouldDealAgain: boolean;
    }
  ): AnonymousReview {
    return {
      id: `review_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      transactionId,
      reviewerId,
      reviewedId,
      
      overallRating: ratings.overall,
      communicationRating: ratings.communication,
      productQualityRating: ratings.productQuality,
      deliveryRating: ratings.delivery,
      
      positives: feedback.positives,
      improvements: feedback.improvements,
      wouldDealAgain: feedback.wouldDealAgain,
      
      anonymous: true,
      timestamp: new Date()
    };
  }

  /**
   * Calculate aggregate ratings while maintaining anonymity
   */
  static calculateAggregateRatings(reviews: AnonymousReview[]): {
    overall: number;
    communication: number;
    productQuality: number;
    delivery: number;
    totalReviews: number;
    wouldDealAgainPercentage: number;
  } {
    if (reviews.length === 0) {
      return {
        overall: 0,
        communication: 0,
        productQuality: 0,
        delivery: 0,
        totalReviews: 0,
        wouldDealAgainPercentage: 0
      };
    }
    
    const sum = reviews.reduce((acc, review) => ({
      overall: acc.overall + review.overallRating,
      communication: acc.communication + review.communicationRating,
      productQuality: acc.productQuality + review.productQualityRating,
      delivery: acc.delivery + review.deliveryRating,
      wouldDealAgain: acc.wouldDealAgain + (review.wouldDealAgain ? 1 : 0)
    }), {
      overall: 0,
      communication: 0,
      productQuality: 0,
      delivery: 0,
      wouldDealAgain: 0
    });
    
    const count = reviews.length;
    
    return {
      overall: Math.round((sum.overall / count) * 10) / 10,
      communication: Math.round((sum.communication / count) * 10) / 10,
      productQuality: Math.round((sum.productQuality / count) * 10) / 10,
      delivery: Math.round((sum.delivery / count) * 10) / 10,
      totalReviews: count,
      wouldDealAgainPercentage: Math.round((sum.wouldDealAgain / count) * 100)
    };
  }
}